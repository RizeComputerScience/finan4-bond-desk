/* The Bond Desk: FINAN IV Unit 8 (bonds). Config for lib/coursedev/desk-engine.
   Names swept for reuse 2026-11-04 (case_reuse.py --course "FINAN IV"): Northpass, Northpass Resorts, Delphine, Tamura, Delphine Tamura, all clean.
   Market data (see ../sources/FACTS.md): Treasury par yields on 2026-01-30 (home.treasury.gov daily par yield curve) and Damodaran's
   January 2026 default spreads by rating, the same six ratings the reading shows.
   Version 3 (2026-11-12), rebuilt to the Unit 9 pattern (process/standards/interactive-assignments.md rules 25 to 39; u08/TEACHING-MAP.md;
   design/scope-2026-11-11.md):
   - The reading teaches; the desk has no walkthrough of its own (rule 32).
   - Every task states the problem first, then shows a worked example drawn as the SAME table the student fills, read-only, with a
     different bond and numbers (h.ladder, rule 29). A faded step gives every line but two; the next step leaves every line blank.
   - Cut from the desk: yield to maturity and RATE, the short-versus-long step, the walkthrough, two of the three light checks.
   The previous version is in v2-archive/. seedVersion 3 and version 3: progress and receipts from v2 do not carry over. */
(function (root) {
  'use strict';
  // Treasury par yield curve, January 30, 2026 (percent), and Damodaran's January 2026 spreads (percent).
  const TSY = { 5: 3.79, 7: 4.01, 10: 4.26, 20: 4.82, 30: 4.87 };
  const SPREAD = { AAA: 0.40, AA: 0.55, A: 0.78, BBB: 1.11, BB: 1.84, B: 3.21 };
  const SOURCES = 'Treasury yields: US Department of the Treasury, daily par yield curve rates, January 30, 2026. Default spreads: Aswath Damodaran (NYU Stern), “Ratings, Interest Coverage Ratios and Default Spread,” January 2026, large non-financial firms.';

  const QUIZ = [
    { title: 'Quick check: why the price fell',
      q: 'Rates rise, and new $1,000 bonds now pay $70 a year. Why will nobody pay $1,000 for an old bond that pays $50 a year?',
      options: ['For the same $1,000 they can buy a new bond that pays $70 a year', 'The company is now more likely to default', 'The old bond’s face value has fallen', 'The old bond’s coupon is about to be cut'],
      answer: 0,
      why: ['Right. Buyers pay less for the old bond, until its $50 coupons plus the $1,000 face value earn the same 7% that a new bond pays.',
        'Nothing here says the company is riskier. The price falls because a new bond pays more for the same money.',
        'The face value stays $1,000 and is still repaid at maturity. The price falls because a new bond pays $70 a year instead of $50.',
        'The coupon is fixed for the bond’s life. The price falls because a new bond pays $70 a year instead of $50.'] },
    { title: 'Exam-style question',
      q: 'A bond has a $1,000 face value, pays a 5% coupon once a year and matures in 6 years. Lenders now demand 7%. What is its price?',
      options: ['About $904.67', 'About $966.34', 'About $1,238.33', 'About $1,000.00'],
      answer: 0,
      why: ['Right. The annuity factor for 7% and 6 years is 4.7665, so the coupons are worth $50 × 4.7665 = $238.33 today. The face value is worth $1,000 ÷ 1.07⁶ = $666.34, so the price is $904.67. Exam questions look like this one.',
        '$966.34 adds up the six $50 coupons without discounting them. Multiply $50 by the annuity factor for 7% and 6 years, 4.7665, instead.',
        '$1,238.33 adds the full $1,000 face value without discounting it. The $1,000 arrives in 6 years, so divide it by 1.07⁶.',
        '$1,000 is the price only when the market rate equals the coupon rate. Lenders demand 7%, more than the 5% coupon, so the price is below $1,000.'] },
  ];

  const STEPS = [
    { id: 'p1', label: 'Price a bond', kind: 'task' },
    { id: 'p2', label: 'Your own bond', kind: 'task' },
    { id: 'r1', label: 'Rates go up', kind: 'task' },
    { id: 'q1', label: 'Quick check', kind: 'check', quiz: 0 },
    { id: 'r2', label: 'Rates move again', kind: 'task' },
    { id: 's1', label: 'What a loan costs', kind: 'task' },
    { id: 's2', label: 'The lodge loan', kind: 'task' },
    { id: 'q2', label: 'Exam-style question', kind: 'check', quiz: 1 },
    { id: 'note', label: 'Your note', kind: 'note' },
  ];

  // ---------- bond arithmetic (rates are whole or half percents, as numbers like 7) ----------
  const r4 = (x) => Math.round(x * 1e4) / 1e4, c2 = (x) => Math.round(x * 100) / 100;
  const AF = (y, n) => r4((1 - Math.pow(1 + y / 100, -n)) / (y / 100));
  const faceAt = (y, n) => c2(1000 / Math.pow(1 + y / 100, n));
  // A $1,000 bond paying c% once a year for n years, priced at y%: every line rounded the way the page shows it.
  function bond(c, y, n) { const C = 10 * c, af = AF(y, n), pvc = c2(C * af), pvf = faceAt(y, n); return { c, y, n, C, af, pvc, pvf, P: c2(pvc + pvf) }; }

  // Bonds no seed may reproduce: the reading's 5-year 5% bond (at any rate), the exam-style 6-year 5% bond at 7%,
  // the final's two bonds (4 years 6% at 8%, 3 years 5% at 4%) and every worked example below.
  const BANNED = ['5|*|5', '5|7|6', '6|8|4', '5|4|3', '4|5|3', '3|5|6', '6|7|7', '4|3|8'];
  const banned = (c, y, n) => BANNED.some((s) => { const [a, b, d] = s.split('|'); return +a === c && (b === '*' || +b === y) && +d === n; });

  function buildTasks(rng, h) {
    const T = [];
    // p1 (faded) and p2 (own): two older Northpass bonds, coupon and market rate whole percents, never equal.
    const older = (avoid) => { let c, y, n; do { c = h.pick(rng, [3, 4, 5, 6, 7]); y = c + h.pick(rng, [-2, -1, 1, 2]); n = h.between(rng, 4, 10, 1); }
      while (y < 3 || banned(c, y, n) || (avoid && avoid.c === c && avoid.y === y)); return bond(c, y, n); };
    const b1 = older(null); T.push(Object.assign({ id: 'p1' }, b1, { answer: b1.P }));
    const b2 = older(b1); T.push(Object.assign({ id: 'p2' }, b2, { answer: b2.P }));
    // r1 (faded): a bond sold at $1,000 when lenders demanded its coupon rate; rates then rise 1 or 2 points.
    { let k, n, d; do { k = h.pick(rng, [4, 5, 7]); n = h.between(rng, 5, 10, 1); d = h.pick(rng, [1, 2]); } while (banned(k, k + d, n));
      const b = bond(k, k + d, n); T.push(Object.assign({ id: 'r1', k, d, old: 1000 }, b, { answer: b.P, decision: 'fell' })); }
    // r2 (own): another bond sold at $1,000; rates fall (about 60%) or rise 1 or 2 points.
    { let k, n, d, y; do { k = h.pick(rng, [4, 5, 6, 7, 8]); n = h.between(rng, 5, 10, 1); d = h.pick(rng, [1, 2]); y = rng() < 0.6 ? k - d : k + d; } while (y < 2 || banned(k, y, n));
      const b = bond(k, y, n); T.push(Object.assign({ id: 'r2', k, d, old: 1000 }, b, { answer: b.P, decision: y < k ? 'rose' : 'fell' })); }
    // s1 (faded) and s2 (own): Treasury yield + spread for Northpass's rating, then the yearly interest on the loan.
    // Never the borrowing cost of a worked example (4.57%, 6.66%) or of the reading's Dick's loan (5.37%).
    const R = h.pick(rng, ['AA', 'A', 'BBB', 'BB', 'B']);
    const costOf = (n) => Math.round((TSY[n] + SPREAD[R]) * 100) / 1e4, KNOWN = [0.0537, 0.0457, 0.0666];
    const loan = (id, ns, xs) => { const ok = ns.filter((n) => !KNOWN.includes(costOf(n))), n = h.pick(rng, ok.length ? ok : ns), X = h.pick(rng, xs);
      const tsy = TSY[n] / 100, spr = SPREAD[R] / 100, cost = costOf(n);
      return { id, R, n, X, tsy, spr, cost, interest: Math.round(X * 1e6 * cost), answer: cost }; };
    T.push(loan('s1', [5, 7], [100, 150, 200, 250]));
    T.push(loan('s2', [10, 20, 30], [250, 300, 350, 400]));
    return T;
  }

  // ---------- display ----------
  const money = (x, dp) => root.DeskEngine.h.money(x, dp);
  const m = (x) => money(x, 2), m0 = (x) => money(x);
  const p2 = (x) => String(+(x * 100).toFixed(2)) + '%';
  const f4 = (x) => Number(x).toFixed(4);
  const g = (y) => (1 + y / 100).toFixed(2);
  const sup = (n) => `<sup>${n}</sup>`;
  const plain = (s) => String(s).replace(/<sup>−?(\d+)<\/sup>/g, (a, d) => '^' + (a.includes('−') ? '-' : '') + d).replace(/<[^>]+>/g, '');
  const SHOW = { money0: m0, money: m, factor: f4, pct: p2 };
  // A percent typed as 5.37%, 5.37 or 0.0537 all mean 5.37%, and a spread typed as 0.55 means 0.55%. No rate on this desk
  // is above 20%, so a bare number of 0.2 or more is read as a percentage and a smaller one as a decimal.
  const pctIn = (h, s) => { const v = h.parseMoney(s); if (!isFinite(v)) return v; return (!/%/.test(String(s)) && Math.abs(v) >= 0.2) ? v / 100 : v; };

  // Lines for each kind of task. `blanks` lists the line indexes the student fills; null means every line.
  // The worked example uses the same function on other numbers, so the two tables always match.
  const LINES = {
    bond: (b, blanks, ex) => { const known = (i) => ex || (blanks && !blanks.includes(i));
      return [
        { label: 'Coupon each year', calc: `${b.c}% × $1,000`, x: b.C, kind: 'money0', typed: `${b.c / 100}*1000` },
        { label: `Annuity factor, ${b.y}%, ${b.n} years`, calc: `(1 − ${g(b.y)}${sup('−' + b.n)}) ÷ ${b.y / 100}`, x: b.af, kind: 'factor', typed: `1-${g(b.y)}^-${b.n}</code>, then <code>ans/${b.y / 100}` },
        { label: 'Value today of the coupons', calc: known(0) && known(1) ? `${m0(b.C)} × ${f4(b.af)}` : 'Coupon × annuity factor', x: b.pvc, kind: 'money', typed: `${b.C}*${f4(b.af)}`,
          hint: 'Multiply the coupon by the annuity factor.' },
        { label: 'Value today of the face value', calc: `$1,000 ÷ ${g(b.y)}${sup(b.n)}`, x: b.pvf, kind: 'money', typed: `1000/${g(b.y)}^${b.n}` },
        { label: 'Price', calc: known(2) && known(3) ? `${m(b.pvc)} + ${m(b.pvf)}` : 'Coupons + face value, both today', x: b.P, kind: 'money', typed: `${b.pvc.toFixed(2)}+${b.pvf.toFixed(2)}`,
          hint: 'Add the value today of the coupons and the value today of the face value.' },
      ].map((l, i) => Object.assign(l, { input: !blanks || blanks.includes(i) })); },
    loan: (t, blanks, ex) => { const known = (i) => ex || (blanks && !blanks.includes(i));
      return [
        { label: `Treasury yield, ${t.n} years`, calc: known(0) ? 'Given' : 'From the Treasury table', x: t.tsy, kind: 'pct', hint: `Read the ${t.n}-year yield from the Treasury table.` },
        { label: `Default spread, ${t.R}`, calc: known(1) ? 'Given' : 'From the spread table', x: t.spr, kind: 'pct', hint: `Read the spread for ${t.R} from the spread table.` },
        { label: 'Borrowing cost', calc: known(0) && known(1) ? `${p2(t.tsy)} + ${p2(t.spr)}` : 'Treasury yield + default spread', x: t.cost, kind: 'pct', hint: 'Add the Treasury yield and the default spread.' },
        { label: 'Yearly interest', calc: `$${t.X} million × ${known(2) ? p2(t.cost) : 'the borrowing cost'}`, x: t.interest, kind: 'money0', typed: `${t.X * 1e6}*${t.cost.toFixed(4)}`,
          hint: `Multiply $${t.X} million by the borrowing cost as a decimal.` },
      ].map((l, i) => Object.assign(l, { input: !blanks || blanks.includes(i) })); },
  };
  const FADE = { p1: [3, 4], r1: [2, 4], s1: [2, 3] };
  function linesFor(t) {
    if (t.id[0] === 's') return LINES.loan(t, FADE[t.id] || null);
    return LINES.bond(t, FADE[t.id] || null);
  }
  // For the engine's ladder: a filled or given line shows its text; an input line keeps its input format.
  const toLadder = (lines, filled) => lines.map((l) => (filled || !l.input ? { label: l.label, calc: l.calc, value: SHOW[l.kind](l.x), fmt: 'text', input: l.input }
    : { label: l.label, calc: l.calc, value: l.x, fmt: l.kind === 'money0' ? 'money' : l.kind, input: true }));

  const exBond = (c, y, n) => bond(c, y, n);
  const exLoan = (R, n, X) => { const tsy = TSY[n] / 100, spr = SPREAD[R] / 100, cost = Math.round((tsy + spr) * 1e4) / 1e4; return { R, n, X, tsy, spr, cost, interest: Math.round(X * 1e6 * cost) }; };
  const EXAMPLES = () => ({
    p1: { cap: 'A ski shop chain’s bond: $1,000 face value, 4% coupon rate, 3 years left, and lenders demand 5%', lines: LINES.bond(exBond(4, 5, 3), FADE.p1, true) },
    p2: { cap: 'A hotel company’s bond: $1,000 face value, 3% coupon rate, 6 years left, and lenders demand 5%', lines: LINES.bond(exBond(3, 5, 6), null, true) },
    r1: { cap: 'A marina company sold a 6% bond for $1,000 when lenders demanded 6%. It has 7 years left, and lenders now demand 7%.', lines: LINES.bond(exBond(6, 7, 7), FADE.r1, true),
      after: 'The price fell from $1,000 to $946.11.' },
    r2: { cap: 'A golf club company sold a 4% bond for $1,000 when lenders demanded 4%. It has 8 years left, and lenders now demand 3%.', lines: LINES.bond(exBond(4, 3, 8), null, true),
      after: `The price rose from $1,000 to ${m(exBond(4, 3, 8).P)}.` },
    s1: { cap: 'A ski-lift maker rated A borrows $100 million for 5 years', lines: LINES.loan(exLoan('A', 5, 100), FADE.s1, true) },
    s2: { cap: 'A hotel company rated BB borrows $300 million for 20 years', lines: LINES.loan(exLoan('BB', 20, 300), null, true) },
  });

  // The two lookup tables run down the page, side by side, so they fit a phone screen.
  const vt = (cap, head, rows) => `<div class="tw" style="flex:0 1 13rem"><table class="cf" style="width:auto;min-width:11rem"><caption>${cap}</caption><thead><tr><th scope="col">${head[0]}</th><th scope="col">${head[1]}</th></tr></thead><tbody>${rows.map(([k, v]) => `<tr><td class="lbl">${k}</td><td>${v.toFixed(2)}%</td></tr>`).join('')}</tbody></table></div>`;
  const tables = () => `<div style="display:flex;flex-wrap:wrap;gap:0 2rem">${vt('Treasury yields, January 30, 2026', ['Years', 'Yield'], Object.entries(TSY))}${vt('Default spreads, January 2026', ['S&amp;P rating', 'Spread'], Object.entries(SPREAD))}</div>`;

  const PROBLEM = {
    p1: (t) => ({ title: 'Price a bond', place: 'Delphine starts with one of Northpass’s older bonds.',
      body: `<p>The bond has a <b>$1,000</b> face value and a <b>${t.c}%</b> coupon rate, with <b>${t.n} years</b> left. Lenders now demand <b>${t.y}%</b>. What is it worth today? The first three lines are done for you.</p>` }),
    p2: (t) => ({ title: 'Price your own bond', place: 'Northpass has a second older bond.',
      body: `<p>This bond has a <b>$1,000</b> face value and a <b>${t.c}%</b> coupon rate, with <b>${t.n} years</b> left. Lenders now demand <b>${t.y}%</b>. What is it worth today?</p>` }),
    r1: (t) => ({ title: 'Rates go up', place: 'Northpass sold a newer bond at its full face value.',
      body: `<p>Northpass sold a bond with a <b>${t.k}%</b> coupon rate for <b>$1,000</b>, when lenders demanded ${t.k}%. It has <b>${t.n} years</b> left, and lenders now demand <b>${t.y}%</b>. What is it worth now? Three lines are done for you.</p>`,
      choice: { legend: 'Compared with the $1,000 it sold for, the price has', options: [['fell', 'Fallen'], ['rose', 'Risen']] } }),
    r2: (t) => ({ title: 'Rates move again', place: 'Rates have moved on Northpass’s newest bond too.',
      body: `<p>Northpass sold a bond with a <b>${t.k}%</b> coupon rate for <b>$1,000</b>, when lenders demanded ${t.k}%. It has <b>${t.n} years</b> left, and lenders now demand <b>${t.y}%</b>. What is it worth now?</p>`,
      choice: { legend: 'Compared with the $1,000 it sold for, the price has', options: [['fell', 'Fallen'], ['rose', 'Risen']] } }),
    s1: (t) => ({ title: 'What a loan costs', place: 'Northpass needs new snowmaking machines.',
      body: `<p>Northpass is rated <b>${t.R}</b> and wants to borrow <b>$${t.X} million</b> for <b>${t.n} years</b>. What will lenders charge, and what is the interest each year? The Treasury yield and the spread are done for you.</p>` }),
    s2: (t) => ({ title: 'The lodge loan', place: 'The new lodge needs a longer loan.',
      body: `<p>Northpass, rated <b>${t.R}</b>, wants to borrow <b>$${t.X} million</b> for <b>${t.n} years</b>. Use the two tables to find what lenders will charge and the interest each year.</p>${tables()}` }),
  };

  function taskView(t, L, h) {
    const P = PROBLEM[t.id](t), E = EXAMPLES()[t.id];
    const example = h.ladder(toLadder(E.lines, true), { filled: true, caption: E.cap }) + (E.after ? `<p>${E.after}</p>` : '');
    const lines = linesFor(t);
    const table = h.ladder(toLadder(lines, false), { rows: L.rows, caption: 'Your turn' })
      + (t.id[0] === 's' ? '<p class="small">Type a percentage like 4.5%, and dollars like 12,500,000 or 12.5m.</p>' : '<p class="small">Type dollars and cents, like 981.41.</p>');
    const parts = [{ html: '', field: 'table' }];
    if (P.choice) parts.push({ html: '', field: 'choice' });
    return { title: P.title, place: P.place, body: P.body, example, table, parts, choice: P.choice,
      sources: t.id[0] === 's' ? SOURCES : '', helpLabels: ['Show me the first blank', 'Show me every line'] };
  }

  // Common slips, per line, phrased with the student's own numbers.
  function diagFor(t, l) {
    const D = [];
    if (t.id[0] !== 's') {
      const { c, y, n, C, af } = t;
      if (l.label === 'Coupon each year') D.push([10 * y, 'mkt', `That uses the market rate, ${y}%. The coupon uses the coupon rate: ${c}% × $1,000.`],
        [c, 'rate', `That is the coupon rate itself. Turn it into dollars: ${c}% × $1,000.`]);
      if (/^Annuity factor/.test(l.label)) { const top = 1 - Math.pow(1 + y / 100, -n);
        D.push([top, 'top', `That is 1 − ${g(y)}^−${n}. Divide it by ${y / 100} to get the factor.`], [top * y / 100, 'times', `That multiplies by ${y / 100}. Divide by it instead.`],
          [AF(c, n), 'coupon', `That uses the coupon rate, ${c}%. Discount at the market rate, ${y}%.`]); }
      if (l.label === 'Value today of the coupons') D.push([C * n, 'nodisc', `That adds up ${n} coupons with no discounting. Multiply ${m0(C)} by the annuity factor, ${f4(af)}.`],
        [C / af, 'div', `That divides. Multiply instead: ${m0(C)} × ${f4(af)}.`], [C * AF(c, n), 'coupon', `That uses the annuity factor at the coupon rate, ${c}%. Use the market rate, ${y}%.`]);
      if (l.label === 'Value today of the face value') D.push([1000, 'nodisc', `That is the face value itself. It arrives in ${n} years, so divide: $1,000 ÷ ${g(y)}^${n}.`],
        [1000 * Math.pow(1 + y / 100, n), 'fwd', `That grows $1,000 forward. Divide by ${g(y)}^${n} instead of multiplying.`],
        [faceAt(c, n), 'coupon', `That discounts at the coupon rate, ${c}%. Use the market rate, ${y}%.`], [faceAt(y, n - 1), 'n1', `That uses ${n - 1} years. The $1,000 arrives in ${n} years.`]);
      if (l.label === 'Price') { D.push([t.pvc + 1000, 'facefull', `That adds the full $1,000. Add the face value’s value today instead, $1,000 ÷ ${g(y)}^${n}.`],
        [C * n + 1000, 'nodisc', 'That adds every payment with no discounting. Add the two values today instead.'], [t.pvc, 'coupononly', 'That is the coupons alone. Add the value today of the face value.'],
        [t.pvf, 'faceonly', 'That is the face value alone. Add the value today of the coupons.']);
        if (t.old) D.push([t.old, 'old', `$1,000 was the price when lenders demanded ${t.k}%. Price the bond at ${y}% now.`]); }
    } else {
      const otherT = Object.keys(TSY).filter((k) => +k !== t.n), otherR = Object.keys(SPREAD).filter((r) => r !== t.R);
      if (/^Treasury/.test(l.label)) otherT.forEach((k) => D.push([TSY[k] / 100, 'tsyn', `That is the ${k}-year Treasury yield. The loan runs ${t.n} years.`]));
      if (/^Default spread/.test(l.label)) otherR.forEach((r) => D.push([SPREAD[r] / 100, 'sprr', `That is the spread for ${r}. Northpass is rated ${t.R}.`]));
      if (l.label === 'Borrowing cost') D.push([t.tsy, 'tsy', 'That is the Treasury yield alone. Add the default spread.'], [t.spr, 'spr', 'That is the spread alone. Add it to the Treasury yield.'],
        [t.tsy - t.spr, 'minus', `Add the spread, don’t subtract it: ${p2(t.tsy)} + ${p2(t.spr)}.`]);
      if (l.label === 'Yearly interest') D.push([t.X * 1e6 * t.spr, 'spr', `That charges only the spread. Multiply $${t.X} million by the whole borrowing cost.`],
        [t.X * 1e6 * t.tsy, 'tsy', `That charges only the Treasury yield. Multiply $${t.X} million by the whole borrowing cost.`],
        [t.X * 1e6 * t.cost * 100, 'pct', `Turn the borrowing cost into a decimal before you multiply: ${p2(t.cost)} = ${t.cost.toFixed(4)}.`],
        [t.X * t.cost, 'millions', 'Type the whole amount in dollars, like 12,500,000, or add m for millions, like 12.5m.']);
    }
    return D;
  }

  function judgeTask(t, e, h) {
    const lines = linesFor(t), rows = e.rows || [], rowRes = [], vals = [];
    lines.forEach((l, i) => {
      if (!l.input) return;
      const opts = l.kind === 'pct' ? { tol: 0.0006, scale: Math.abs(l.x), unreadable: 'Type a percentage, like 4.5%.', closeMsg: 'Close. Keep two decimal places in the percentage.', otherMsg: l.hint || `${plain(l.calc)}.` }
        : l.kind === 'factor' ? { tol: 0.0015, scale: 1, unreadable: 'Type the factor as a number, like 4.2124.', closeMsg: 'Close. Keep four decimal places.', otherMsg: l.hint || `${plain(l.calc)}.` }
          : { tol: l.kind === 'money0' && t.id[0] === 's' ? Math.max(1000, 0.002 * l.x) : Math.max(0.1, 0.0005 * Math.abs(l.x)), scale: Math.abs(l.x), unreadable: 'Type a dollar amount, like 981.41.', closeMsg: 'Close. Keep four decimal places in the annuity factor and round only at the end.', otherMsg: l.hint || `${plain(l.calc)}.` };
      const v = l.kind === 'pct' ? pctIn(h, rows[i]) : h.parseMoney(rows[i]); vals[i] = v;
      rowRes[i] = h.judgeNumber(v, l.x, diagFor(t, l), opts);
    });
    // A price that adds the student's own two values correctly is not the slip; the slip is in a line above it.
    if (t.id[0] !== 's' && rowRes[4] && !rowRes[4].ok) { const a = lines[2].input ? vals[2] : t.pvc, b = lines[3].input ? vals[3] : t.pvf;
      if (isFinite(a) && isFinite(b) && Math.abs(vals[4] - (a + b)) < 0.06 && ((rowRes[2] && !rowRes[2].ok) || (rowRes[3] && !rowRes[3].ok)))
        rowRes[4] = { ok: false, code: 'carried', msg: `${m(a)} + ${m(b)} adds up correctly, so fix the line marked ✗ above it and the price will follow.` }; }
    const bad = rowRes.findIndex((x) => x && !x.ok);
    if (bad >= 0) return { ok: false, rowRes, msg: `${lines[bad].label}: ${rowRes[bad].msg}` };
    if (t.decision && e.choice !== t.decision) {
      if (!e.choice) return { ok: false, rowRes, msg: 'Now answer the question under the table.' };
      return { ok: false, rowRes, msg: `Compare your price, ${m(t.P)}, with the $1,000 the bond sold for. Which is bigger?` };
    }
    return { ok: true, rowRes };
  }

  function helpText(t, lvl) {
    const lines = linesFor(t), blanks = lines.filter((l) => l.input);
    const say = (l) => `${l.label}: ${l.calc} = ${SHOW[l.kind](l.x)}${l.typed && l.input ? ` (in Desmos, <code>${l.typed}</code>)` : ''}`;
    return lvl === 1 ? say(blanks[0]) : lines.map(say).join('<br>');
  }
  function praise(t) {
    if (t.id === 'p1') return `Lenders who pay ${m(t.P)} for this bond earn exactly the ${t.y}% they demand today.`;
    if (t.id === 'p2') return `At ${t.y}%, the bond is worth ${m(t.P)}, ${t.P < 1000 ? 'below' : 'above'} its $1,000 face value because its ${t.c}% coupon is ${t.c < t.y ? 'less' : 'more'} than lenders demand.`;
    if (t.id === 'r1' || t.id === 'r2') return `Rates ${t.y > t.k ? 'rose' : 'fell'} from ${t.k}% to ${t.y}%, so the bond’s price ${t.y > t.k ? 'fell' : 'rose'} from $1,000 to ${m(t.P)}. Northpass still pays the same ${m0(t.C)} coupon each year.`;
    if (t.id === 's1') return `A ${t.n}-year loan costs Northpass about ${p2(t.cost)}, or ${m0(t.interest)} a year on $${t.X} million.`;
    if (t.id === 's2') return `The lodge loan costs about ${p2(t.cost)}, or ${m0(t.interest)} a year. That is the rate the lodge has to beat.`;
  }
  const fmtIn = (l, k) => (l.kind === 'pct' ? p2(l.x * k) : l.kind === 'factor' ? (l.x * k).toFixed(4) : String(Math.round(l.x * k * 100) / 100));
  function selfAnswer(t) {
    const rows = []; linesFor(t).forEach((l, i) => { if (l.input) rows[i] = fmtIn(l, 1); });
    return { rows, choice: t.decision || null };
  }
  function selfWrong(t) {
    const rows = []; linesFor(t).forEach((l, i) => { if (l.input) rows[i] = fmtIn(l, 1.3); });
    return { rows, choice: t.decision || null };
  }

  root.DESK = {
    app: 'finan4-u8-bond-desk', version: 3, seedVersion: 3, salt: 'rize-finan4-u8-bond:7e2a50', points: 20,
    storageKey: 'rize-finan4-u8-bonds-v3', filePrefix: 'BondDesk', TSY, SPREAD, BANNED, linesFor,
    verifyUrl: 'https://rizecomputerscience.github.io/finan4-bond-desk/verify.html',
    calcPlaceholder: '1000/1.07^8',
    story: { title: 'The Bond Desk', kicker: 'Corporate Finance, Unit 8', company: 'Northpass Resorts', team: 'Treasury Team',
      from: 'Delphine Tamura', fromTitle: 'treasurer, Northpass Resorts',
      dek: 'Northpass Resorts runs ski resorts and wants to borrow money to build a new lodge. Before its board votes, Delphine Tamura, the treasurer, needs two answers: what Northpass’s older bonds are worth now that rates have moved, and what a new loan would cost. You work out both with her.',
      whatBox: '',
      stepsLine: 'Nine short steps. Each shows a worked example in the same table you fill in, then you do the same calculation with your own numbers.' },
    steps: STEPS, quiz: QUIZ, walk: null, buildTasks, taskView, judgeTask, helpText, praise, selfAnswer, selfWrong,
    note: { title: 'A note for the board', label: 'Your note to Delphine', minWords: 30, receiptHeading: 'Note to the treasurer',
      prompt: 'Northpass’s board votes next month on the lodge loan. Write Delphine a short note that says what interest rate the plan should assume and why it should not use the coupon on Northpass’s older bonds. Then say what rising rates did to the price of those older bonds.' },
  };
})(typeof window !== 'undefined' ? window : globalThis);
