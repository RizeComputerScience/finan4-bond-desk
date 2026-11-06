/* The Bond Desk: FINAN IV Unit 8 (bonds: price, rates up and price down, two maturities, yield to maturity, Treasury plus a spread). Config for lib/coursedev/desk-engine.
   Names swept for reuse 2026-11-04 (case_reuse.py --course "FINAN IV"): Northpass, Northpass Resorts, Delphine, Tamura, Delphine Tamura, all clean.
   Market data (see ../sources/FACTS.md): Treasury par yields on 2026-01-30 (home.treasury.gov daily par yield curve) and Damodaran's January 2026 default spreads by rating.
   Rework 2026-11-06 (Samuel's Unit 10 review, design/course-principles.md "2026-11-05"; standards rules 17 to 23):
   - Round seeds. Coupons and market rates in steps 3 and 4 are whole percents, so every coupon is whole dollars and 1 + rate is 1.05 or 1.07.
     Step 6's coupons are 4%, 5% or 6% and the rise is 1 or 2 points. Step 7's coupon is 2%, 2.5% or 3%. Step 7's yield and step 9's
     inputs stay the real Treasury yields and spreads. No seed reproduces the exam-style bond (4 years, 6% coupon, 8%).
   - A 2 to 4 line worked `example` on every task, using small bonds (2 and 10 years) and rates (4%, 5%, 6%) that no seed, the reading
     or the exam-style question uses.
   - `parts` on steps 4, 6 and 7, so each answer field sits under its own question.
   - Citations moved to `sources`; every formula names its cells; feedback quotes the student's own numbers; tolerance sentences removed.
   - Every step has a right answer, so none uses `autosave` (the note keeps the engine's own save button).
   seedVersion and version moved to 2, so saved progress and receipts from v1 do not carry over. */
(function (root) {
  'use strict';
  // Treasury par yield curve, January 30, 2026 (percent). Damodaran, "Ratings, Interest Coverage Ratios and Default Spread", January 2026 (percent).
  const TSY = { 2: 3.52, 5: 3.79, 7: 4.01, 10: 4.26, 20: 4.82, 30: 4.87 };
  const SPREAD = [['AA', 0.55], ['A+', 0.70], ['A', 0.78], ['A-', 0.89], ['BBB', 1.11], ['BB+', 1.38], ['BB', 1.84], ['B+', 2.75], ['B', 3.21]];
  const spr = (r) => SPREAD.find((x) => x[0] === r)[1];
  const rl = (r) => r.replace('-', '−');
  const SRC_TSY = 'Treasury yields: US Department of the Treasury, daily par yield curve rates, January 30, 2026.';
  const SRC_SPR = 'Default spreads: Aswath Damodaran (NYU Stern), “Ratings, Interest Coverage Ratios and Default Spread,” January 2026, large non-financial firms.';

  const QUIZ = [
    { title: 'Quick win: the coupon is fixed',
      q: 'Northpass sold a 10-year bond with a 6% coupon. A year later, lenders demand 8% on similar loans. What does Northpass now pay each year on each $1,000 of that bond?',
      options: ['$60, the same as before', '$80, because rates rose', '$70, halfway between the two', 'Nothing until the bond is repaid'],
      answer: 0,
      why: ['Right. The coupon is fixed when the bond is sold, so Northpass keeps paying 6% of $1,000, which is $60 a year. What changes is the bond’s price.',
        'The coupon is set when the bond is sold and stays the same for the bond’s life. A new bond would pay 8%, but this one still pays $60.',
        'The coupon does not move with market rates at all. It stays at 6% of $1,000, which is $60 a year.',
        'A bond pays its coupon every year until maturity, then repays the face value. This one pays $60 a year.'] },
    { title: 'Quick win: why the price fell',
      q: 'Rates rise, and new $1,000 bonds now pay $70 a year. Why will nobody pay $1,000 for an old bond that pays $50 a year?',
      options: ['For the same $1,000 they can buy a new bond that pays $70 a year', 'The company is now more likely to default', 'The old bond’s face value has fallen', 'The old bond’s coupon is about to be cut'],
      answer: 0,
      why: ['Right. A buyer will pay less for the old bond, until the $50 coupons plus the $1,000 face value earn the same 7% that a new bond pays.',
        'Nothing here says the company is riskier. The price falls because a new bond pays more for the same money.',
        'The face value stays $1,000 and is still repaid at maturity. The price falls because a new bond pays $70 a year instead of $50.',
        'The coupon is fixed for the bond’s life. The price falls because a new bond pays $70 a year instead of $50.'] },
    { title: 'Quick win: a downgrade',
      q: 'A rating agency lowers Northpass’s rating from BBB to BB. What happens next?',
      options: ['Lenders demand a bigger spread, so new loans cost more and the prices of Northpass’s existing bonds fall', 'The coupons on Northpass’s existing bonds go up', 'Nothing changes until Northpass’s bonds mature', 'Northpass’s existing bonds rise in price, because they now pay more'],
      answer: 0,
      why: ['Right. A lower rating means a bigger default spread. New borrowing costs more, and investors pay less for the old bonds, so their yields rise to match.',
        'The coupons on bonds already sold are fixed. What changes is the yield lenders demand, so the prices of the old bonds fall.',
        'Bonds trade every day. Investors react to a downgrade at once, so prices fall and yields rise right away.',
        'The old bonds pay the same fixed coupons as before. Lenders now want a higher yield, so they pay less for those bonds.'] },
    { title: 'Exam-style question',
      q: 'A 4-year bond has a $1,000 face value and pays a 6% coupon once a year. Lenders now demand 8%, and the annuity factor for 8% and 4 years is 3.3121. What is the bond’s price?',
      options: ['About $933.76', 'About $975.03', 'About $1,198.73', 'About $1,000.00'],
      answer: 0,
      why: ['Right. The coupons are worth $60 × 3.3121 = $198.73 today, and the face value is worth $1,000 ÷ 1.08⁴ = $735.03, so the price is $933.76. Questions on the exams look like this one.',
        '$975.03 adds up the four $60 coupons without discounting them. Multiply $60 by the annuity factor, 3.3121, instead.',
        '$1,198.73 adds the full $1,000 face value without discounting it. The $1,000 arrives in 4 years, so divide it by 1.08⁴.',
        '$1,000 is the price only when the market rate equals the coupon rate. Here lenders demand 8%, more than the 6% coupon, so the price is below $1,000.'] },
  ];

  const STEPS = [
    { id: 'walk', label: 'Worked example', kind: 'walk' },
    { id: 'q1', label: 'Check 1', kind: 'check', quiz: 0 },
    { id: 't1', label: 'Price a bond', kind: 'task' },
    { id: 't2', label: 'Rates go up', kind: 'task' },
    { id: 'q2', label: 'Check 2', kind: 'check', quiz: 1 },
    { id: 't3', label: 'Short and long', kind: 'task' },
    { id: 't4', label: 'Find the yield', kind: 'task' },
    { id: 'q3', label: 'Check 3', kind: 'check', quiz: 2 },
    { id: 't5', label: 'Treasury plus spread', kind: 'task' },
    { id: 'q4', label: 'Exam-style question', kind: 'check', quiz: 3 },
    { id: 'note', label: 'Your note', kind: 'note' },
  ];

  const r4 = (x) => Math.round(x * 1e4) / 1e4;
  const AF = (yPct, n) => r4((1 - Math.pow(1 + yPct / 100, -n)) / (yPct / 100));
  // A $1,000 bond paying cPct once a year for n years, priced at yPct. useAF: price the coupons with the 4-place annuity factor shown on the page.
  const price = (cPct, yPct, n, useAF) => 10 * cPct * (useAF ? AF(yPct, n) : (1 - Math.pow(1 + yPct / 100, -n)) / (yPct / 100)) + 1000 / Math.pow(1 + yPct / 100, n);
  const faceAt = (yPct, n) => 1000 / Math.pow(1 + yPct / 100, n);

  // The round seed sets (exposed as DESK.ROUND for the tests).
  const ROUND = { c1: [3, 4, 5, 6, 7], off1: [-3, -2, -1, 1, 2], d2: [1, 2], k: [4, 5, 6], d3: [1, 2], c4: [2, 2.5, 3], X: [150, 200, 250, 300, 350, 400] };

  function buildTasks(rng, h) {
    const T = [];
    const R = h.pick(rng, ['A', 'A-', 'BBB', 'BB+', 'BB']);
    // t1 and t2: price a bond, then raise the market rate. Whole percents; never the exam-style bond (4 years, 6% coupon, 8%).
    let n1, c1, y1, d2, y2;
    for (let tries = 0; tries < 200; tries++) {
      n1 = h.between(rng, 4, 10, 1); c1 = h.pick(rng, ROUND.c1); y1 = c1 + h.pick(rng, ROUND.off1);
      d2 = h.pick(rng, ROUND.d2); if (y1 + d2 === c1) d2 = d2 === 1 ? 2 : 1; y2 = y1 + d2;
      const exam = n1 === 4 && c1 === 6 && (y1 === 8 || y2 === 8);
      if (y1 >= 3 && y2 !== c1 && !exam) break; }
    const C1 = 10 * c1;
    const b1 = { n: n1, c: c1, y: y1, C: C1, af: AF(y1, n1), PVc: C1 * AF(y1, n1), PVf: faceAt(y1, n1) };
    b1.P = b1.PVc + b1.PVf;
    T.push(Object.assign({ id: 't1', R }, b1));
    const af2 = AF(y2, n1), P2 = C1 * af2 + faceAt(y2, n1);
    T.push(Object.assign({ id: 't2', R, y2, d2, af2, P2, answer: P2, decision: y2 > c1 ? 'discount' : 'premium' }, b1));
    // t3: a short and a long bond from the same issuer, both at par, then rates rise (never the reading's 5% pair at 6%)
    const k = h.pick(rng, ROUND.k); let nS = h.pick(rng, [2, 3, 5]), nL = h.pick(rng, [20, 25, 30]); let d3 = h.pick(rng, ROUND.d3);
    if (k === 5 && d3 === 1 && nS === 5 && nL === 30) d3 = 2;
    if (k === 4 && nS === 2) nS = 3;   // the 2-year 4% bond is the worked example in steps 3, 4 and 7
    const y3 = k + d3;
    const afS = AF(y3, nS), afL = AF(y3, nL); const pS = 10 * k * afS + faceAt(y3, nS), pL = 10 * k * afL + faceAt(y3, nL);
    T.push({ id: 't3', R, k, nS, nL, d3, y3, afS, afL, pS, pL, decision: 'long' });
    // t4: an older Northpass bond at its market price; its yield is the real Treasury yield for its length plus the rating's real spread
    const n4 = h.pick(rng, [5, 7]), c4 = h.pick(rng, ROUND.c4); const y4 = Math.round((TSY[n4] + spr(R)) * 100) / 100;
    const P4 = Math.round(price(c4, y4, n4, false) * 100) / 100;
    T.push({ id: 't4', R, n4, c4, y4, P4, cy: 10 * c4 / P4 * 100, answer: y4, decision: 'ytm' });
    // t5: estimate the cost of a new, longer loan from the Treasury yield and the spread
    const M = h.pick(rng, [10, 20, 30]), X = h.pick(rng, ROUND.X); const cost = Math.round((TSY[M] + spr(R)) * 100) / 100;
    T.push({ id: 't5', R, M, X, tsy: TSY[M], s: spr(R), cost, interest: X * 1e6 * cost / 100, n4, y4 });
    return T;
  }

  const m = (x, dp) => root.DeskEngine.h.money(x, dp);
  const m2 = (x) => m(x, 2);
  const mil = (x) => '$' + x + ' million';
  const sg1 = (x) => (x < 0 ? '−' : '+') + Math.abs(x).toFixed(1) + '%';
  const p2 = (x) => (Math.round(x * 100) / 100).toFixed(2) + '%';
  const pc = (x) => (Math.round(x * 100) / 100) + '%';
  const g1 = (yPct) => String(Math.round((1 + yPct / 100) * 1e4) / 1e4);   // 1 + rate, as typed in a calculator: 1.05, 1.025
  const cell = (L, y, label) => `<label class="sr-only" for="r${y}">${label}</label><input id="r${y}" class="rowin" data-row="${y}" inputmode="decimal" autocomplete="off" value="${(L.rows || [])[y] ? String(L.rows[y]).replace(/"/g, '') : ''}"><span class="mark" id="mk${y}"></span>`;
  const termTable = (rows, cap) => `<div class="tw"><table class="cf"><caption>${cap}</caption><tbody>${rows.map((x) => `<tr><td class="lbl">${x[0]}</td><td>${x[1]}</td></tr>`).join('')}</tbody></table></div>`;
  const bar = (w, id) => `<div style="background:var(--panel);border-radius:3px;height:.9rem"><div ${id ? `id="${id}" ` : ''}style="background:var(--brand);height:100%;border-radius:3px;width:${Math.max(0, Math.min(100, w)).toFixed(1)}%"></div></div>`;
  // Percent inputs: "4.9", "4.90%" both mean 4.9 percent.
  const pctIn = (s, h) => { if (s == null) return NaN; const str = String(s).trim(); if (!str) return NaN; const v = h.parseMoney(str); return /%/.test(str) ? v * 100 : v; };
  const judgePct = (h, s, exact, diag, opts) => {
    const v = pctIn(s, h); opts = opts || {};
    if (isFinite(v) && exact > 0.3 && Math.abs(v * 100 - exact) <= (opts.tol || 0.005) * 1.01) return { ok: false, code: 'decimal', msg: `Type the rate as a percent: ${exact.toFixed(2)} rather than ${(exact / 100).toFixed(4)}.` };
    return h.judgeNumber(v, exact, diag, Object.assign({ tol: 0.005, scale: 50, unreadable: 'Type a rate as a percent, like 4.26.', closeMsg: 'Close. Check that you copied the rate from the right line of the table.' }, opts));
  };

  function taskView(t, L, h) {
    if (t.id === 't1') return { title: 'Price a bond', place: 'Northpass is planning to sell a new bond to pay for a chairlift.',
      body: `<p>Delphine wants to know what investors would pay for each $1,000 bond if they demand <b>${pc(t.y)}</b> a year. Northpass pays the coupon once a year.</p>
        ${termTable([['Face value, repaid at maturity', '$1,000'], ['Coupon rate', pc(t.c)], ['Years to maturity', t.n], ['Market rate lenders demand', pc(t.y)], [`Annuity factor (${pc(t.y)}, ${t.n} years)`, t.af.toFixed(4)]], 'The bond')}`,
      example: `<p>A 2-year bond with a 4% coupon, when lenders demand 5%. Yearly coupon: 4% × $1,000 = $40.</p>
        <p>Value today of the coupons: $40 × 1.8594 (annuity factor, 5%, 2 years) = $74.38.</p>
        <p>Value today of the face value: $1,000 ÷ 1.05² = $907.03.</p>
        <p>Price: $74.38 + $907.03 = $981.41.</p>`,
      table: `<p>Now Northpass’s bond. Fill in the four lines.</p><div class="tw"><table class="cf"><caption>The bond’s price</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Amount</th></tr></thead><tbody>
        <tr><td class="lbl">Yearly coupon (coupon rate × $1,000)</td><td>${cell(L, 1, 'Yearly coupon')}</td></tr>
        <tr><td class="lbl">Value today of the coupons (yearly coupon × annuity factor)</td><td>${cell(L, 2, 'Value today of the coupons')}</td></tr>
        <tr><td class="lbl">Value today of the face value ($1,000 ÷ (1 + market rate)<sup>years</sup>)</td><td>${cell(L, 3, 'Value today of the face value')}</td></tr>
        <tr class="total hl"><td class="lbl"><b>Price</b> (value of the coupons + value of the face value)</td><td>${cell(L, 4, 'Price')}</td></tr></tbody></table></div>
        <p class="small">Give dollars and cents, like 981.41.</p>`,
      helpLabels: ['Show me the coupons', 'Show me every line'] };
    if (t.id === 't2') return { title: 'Rates go up', place: 'Before Northpass sells the bond, interest rates jump.',
      body: `<p>Lenders now demand <b>${pc(t.y2)}</b> instead of ${pc(t.y)}, up ${t.d2} percentage point${t.d2 === 1 ? '' : 's'}. The bond is the same: a <b>${pc(t.c)}</b> coupon (${m(t.C)} a year), <b>${t.n} years</b> to maturity and a <b>$1,000</b> face value. The annuity factor at the new rate is <b>${t.af2.toFixed(4)}</b>.</p>`,
      example: `<p>The 2-year, 4% bond again, now at 6%. Value today of the coupons: $40 × 1.8334 = $73.34.</p>
        <p>Value today of the face value: $1,000 ÷ 1.06² = $890.00.</p>
        <p>Price: $73.34 + $890.00 = $963.34. That is below $1,000, so it sells at a discount.</p>`,
      parts: [{ html: '', field: 'value' }, { html: '', field: 'choice' }],
      value: { label: `1. What is the bond’s new price at ${pc(t.y2)}?`, placeholder: '$0.00', help: 'Give dollars and cents, like 963.34.' },
      choice: { legend: '2. At the new rate, the bond sells', options: [['discount', 'Below $1,000, at a discount'], ['par', 'At $1,000, at par'], ['premium', 'Above $1,000, at a premium']] } };
    if (t.id === 't3') {
      const cap = (lab, i, n, af) => `<tr><td class="lbl" style="border-bottom:0"><b>${n}-year bond</b><span class="ex">annuity factor at ${pc(t.y3)}: ${af.toFixed(4)}</span></td><td style="border-bottom:0">$1,000.00</td><td style="border-bottom:0">${cell(L, i, `New price of the ${n}-year bond`)}</td></tr>
        <tr><td colspan="3" aria-hidden="true" style="padding-top:0">${bar(0, 'bar' + i)}<span class="small" id="lab${i}"></span></td></tr>`;
      return { title: 'A short bond and a long bond', place: 'Northpass has two bonds outstanding, one short and one long.',
        body: `<p>Both bonds pay a <b>${pc(t.k)}</b> coupon (${m(10 * t.k)} a year on $1,000), and both sell for $1,000 today because lenders demand ${pc(t.k)}. One matures in <b>${t.nS} years</b>, the other in <b>${t.nL} years</b>. Then rates rise to <b>${pc(t.y3)}</b>.</p>`,
        example: `<p>A 10-year bond with a 3% coupon sells for $1,000. Rates rise to 4%.</p>
          <p>New price: $30 × 8.1109 + $1,000 ÷ 1.04¹⁰ = $918.89.</p>
          <p>Share of its value lost: ($1,000 − $918.89) ÷ $1,000 = 8.1%.</p>`,
        parts: [{ html: `<p><b>1. Find each bond’s new price at ${pc(t.y3)}.</b> New price = yearly coupon × annuity factor + $1,000 ÷ ${g1(t.y3)}<sup>years</sup>.</p>`, field: 'table' }, { html: '', field: 'choice' }],
        table: `<div class="tw"><table class="cf"><caption>Two Northpass bonds, before and after rates rise to ${pc(t.y3)}</caption><thead><tr><th scope="col" style="text-align:left">Bond</th><th scope="col">Price at ${pc(t.k)}</th><th scope="col">Price at ${pc(t.y3)}</th></tr></thead><tbody>${cap('S', 1, t.nS, t.afS)}${cap('L', 2, t.nL, t.afL)}</tbody></table></div><p class="small">Each bar shows the new price as a share of $1,000. Give dollars and cents.</p>`,
        onRows: (rs, $) => { [1, 2].forEach((i) => { const v = h.parseMoney(rs[i]); const el = $('#bar' + i), lab = $('#lab' + i); const ok = isFinite(v) && v > 0 && v < 2000;
          if (el) el.style.width = (ok ? Math.min(100, v / 10) : 0).toFixed(1) + '%'; if (lab) lab.textContent = ok ? `${(v / 10).toFixed(1)}% of face value, a change of ${sg1(v / 10 - 100)}` : ''; }); },
        choice: { legend: '2. Which bond lost the larger share of its value?', options: [['short', `The ${t.nS}-year bond`], ['long', `The ${t.nL}-year bond`], ['same', 'Both lost the same share']] },
        helpLabels: ['Show me the short bond', 'Show me both bonds'] };
    }
    if (t.id === 't4') {
      const start = L.try != null ? L.try : t.c4;
      return { title: 'Find the yield', place: 'Northpass sold a bond a few years ago, when rates were low. It now trades below face value.',
        body: `<p>Delphine has a quote on the bond. Northpass is rated <b>${rl(t.R)}</b>.</p>
          ${termTable([['Face value', '$1,000'], ['Coupon rate', `${pc(t.c4)} (${m2(10 * t.c4)} a year)`], ['Years to maturity', t.n4], ['Price today', m2(t.P4)]], 'The older bond')}
          <p>The <b>yield to maturity</b> is the rate at which the value today of the coupons and the face value equals the price.</p>`,
        example: `<p>A 2-year bond with a 4% coupon sells for $981.41.</p>
          <p>Try 4%: the bond is worth $1,000.00, more than the price, so try a higher rate.</p>
          <p>Try 5%: $40 × 1.8594 + $1,000 ÷ 1.05² = $981.41, a match. The yield to maturity is 5%.</p>`,
        parts: [{ html: `<p>Move the slider to try rates, and watch the bond’s value change.</p>
          <div class="slider-wrap"><label for="trySlider">Try a rate</label><input type="range" id="trySlider" min="1" max="10" step="0.05" value="${start}"><p class="readout" id="tryOut" aria-live="polite"></p></div>
          <p class="small">In a spreadsheet, <code>=RATE(years, yearly coupon, -price, 1000)</code> gives the same answer.</p>`, field: 'value' }, { html: '', field: 'choice' }],
        wire: ($, L2) => { const s = $('#trySlider'), out = $('#tryOut'); if (!s || !out) return;
          const upd = () => { const r = Number(s.value); L2.try = r; const v = price(t.c4, r, t.n4, false); const diff = v - t.P4;
            out.textContent = `At ${r.toFixed(2)}%, the bond is worth ${m2(v)}. ` + (Math.abs(diff) <= 0.0025 * t.P4 ? 'That is about the price, so this rate is about the yield.' : diff > 0 ? `That is more than the ${m2(t.P4)} price, so try a higher rate.` : `That is less than the ${m2(t.P4)} price, so try a lower rate.`); };
          s.addEventListener('input', upd); upd(); },
        value: { label: '1. What is the bond’s yield to maturity, in percent?', placeholder: '0.00', help: 'Type a percent, like 4.25.' },
        choice: { legend: `2. If Northpass borrowed again for ${t.n4} years today, about what rate would lenders demand?`, options: [['coupon', `${pc(t.c4)}, the coupon on this bond`], ['ytm', 'The yield to maturity you found'], ['tsy', `${pc(TSY[t.n4])}, the ${t.n4}-year Treasury yield`]] },
        sources: `<p>${SRC_TSY}</p>`,
        helpLabels: ['Show me where to start', 'Show me the yield'] };
    }
    if (t.id === 't5') {
      const tsyRows = Object.keys(TSY).map((y) => [`${y} years`, p2(TSY[y])]);
      return { title: 'Treasury plus spread', place: `Northpass wants to borrow ${mil(t.X)} for ${t.M} years to build a new lodge.`,
        body: `<p>Northpass has no bond that matures in ${t.M} years, so Delphine estimates the rate in two parts: the Treasury yield for the same length, plus the default spread for Northpass’s <b>${rl(t.R)}</b> rating.</p>
          <div style="display:flex;flex-wrap:wrap;gap:0 2rem;align-items:flex-start"><div style="flex:1 1 15rem">${termTable(tsyRows, 'Treasury yields, January 30, 2026')}</div><div style="flex:1 1 15rem">${termTable(SPREAD.map((x) => [rl(x[0]), p2(x[1])]), 'Default spread by rating, January 2026')}</div></div>`,
        example: `<p>Suppose the Treasury yield for the loan’s length is 4.00% and the spread for the company’s rating is 1.50%.</p>
          <p>Borrowing cost: 4.00% + 1.50% = 5.50%.</p>
          <p>Yearly interest on $100 million: $100 million × 0.0550 = $5,500,000.</p>`,
        table: `<p>Now Northpass’s ${t.M}-year loan. Fill in the four lines.</p><div class="tw"><table class="cf"><caption>What a ${t.M}-year loan costs Northpass</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Amount</th></tr></thead><tbody>
          <tr><td class="lbl">Treasury yield for ${t.M} years (%)</td><td>${cell(L, 1, `Treasury yield for ${t.M} years, in percent`)}</td></tr>
          <tr><td class="lbl">Default spread for ${rl(t.R)} (%)</td><td>${cell(L, 2, `Default spread for ${rl(t.R)}, in percent`)}</td></tr>
          <tr class="hl"><td class="lbl"><b>Estimated borrowing cost</b>, % (Treasury yield + default spread)</td><td>${cell(L, 3, 'Estimated borrowing cost, in percent')}</td></tr>
          <tr class="total"><td class="lbl">Yearly interest in dollars (${mil(t.X)} × estimated borrowing cost)</td><td>${cell(L, 4, 'Yearly interest in dollars')}</td></tr></tbody></table></div>
          <p class="small">Type rates like 4.26 and dollars like 5,500,000 or 5.5m.</p>`,
        sources: `<p>${SRC_TSY}</p><p>${SRC_SPR}</p>`,
        helpLabels: ['Show me where to look', 'Show me every line'] };
    }
  }

  function judgeTask(t, e, h) {
    const rows = e.rows || [];
    if (t.id === 't1') {
      const rr = []; const nm = (x) => h.parseMoney(x);
      rr[1] = h.judgeNumber(nm(rows[1]), t.C, [[t.c, 'pct', `The coupon is a dollar amount: ${pc(t.c)} × $1,000.`], [t.y * 10, 'market', `That uses the market rate. The coupon uses the coupon rate: ${pc(t.c)} × $1,000.`]], { tol: 0.01, otherMsg: `${pc(t.c)} × $1,000.` });
      rr[2] = h.judgeNumber(nm(rows[2]), t.PVc, [[t.C * t.n, 'nodisc', `That adds up ${t.n} coupons, ${m(t.C)} × ${t.n}, without discounting them. Multiply the yearly coupon by the annuity factor, ${t.af.toFixed(4)}.`]],
        { tol: 1, otherMsg: `Yearly coupon × annuity factor: ${m(t.C)} × ${t.af.toFixed(4)}.` });
      rr[3] = h.judgeNumber(nm(rows[3]), t.PVf, [[1000, 'nodisc', `The $1,000 arrives in ${t.n} years, so discount it: $1,000 ÷ ${g1(t.y)}^${t.n}.`],
        [faceAt(t.c, t.n), 'couprate', `Discount at the market rate, ${pc(t.y)}, not the ${pc(t.c)} coupon rate: $1,000 ÷ ${g1(t.y)}^${t.n}.`], [1000 * Math.pow(1 + t.y / 100, t.n), 'grow', `That grows the $1,000. Divide by ${g1(t.y)}^${t.n} instead of multiplying.`]],
        { tol: 1, otherMsg: `$1,000 ÷ (1 + market rate)^years. In the calculator: 1000/${g1(t.y)}^${t.n}.` });
      const own = isFinite(nm(rows[2])) && isFinite(nm(rows[3])) ? ` Your two values: ${m2(nm(rows[2]))} + ${m2(nm(rows[3]))} = ${m2(nm(rows[2]) + nm(rows[3]))}.` : '';
      rr[4] = h.judgeNumber(nm(rows[4]), t.P, [[1000, 'par', `$1,000 is the price only when the market rate equals the coupon rate. Price = value of the coupons + value of the face value.${own}`],
        [t.PVc + 1000, 'facenodisc', `Add the value today of the face value, ${m2(t.PVf)}, not the full $1,000.`], [t.C * t.n + t.PVf, 'coupnodisc', 'Add the value today of the coupons, not the plain total of the coupons.'], [t.PVf, 'nocoup', 'Add the value today of the coupons too.'], [t.PVc, 'noface', 'Add the value today of the face value too.']],
        { tol: 1, otherMsg: `Price = value of the coupons + value of the face value.${own}` });
      const bad = [1, 2, 3, 4].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${['', 'Yearly coupon', 'Value today of the coupons', 'Value today of the face value', 'Price'][bad]}: ${rr[bad].msg}` };
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't2') {
      const v = h.parseMoney(e.value);
      const n = h.judgeNumber(v, t.P2, [[1000, 'par', 'The price is $1,000 only when the market rate equals the coupon rate.'], [t.P, 'old', `${m2(t.P)} is the price at the old rate, ${pc(t.y)}. Use the new rate, ${pc(t.y2)}, and the new annuity factor, ${t.af2.toFixed(4)}.`],
        [t.C * t.af2 + 1000, 'facenodisc', `Discount the $1,000 too: $1,000 ÷ ${g1(t.y2)}^${t.n}.`], [t.C * t.af2 + t.PVf, 'oldface', `Discount the face value at the new rate as well: $1,000 ÷ ${g1(t.y2)}^${t.n}, not ÷ ${g1(t.y)}^${t.n}.`],
        [t.PVc + faceAt(t.y2, t.n), 'oldaf', `Use the annuity factor at the new rate, ${t.af2.toFixed(4)}, for the coupons, not ${t.af.toFixed(4)}.`], [t.C * t.n + faceAt(t.y2, t.n), 'coupnodisc', `That adds up the ${t.n} coupons without discounting them. Multiply ${m(t.C)} by ${t.af2.toFixed(4)}.`], [t.P2 - t.P, 'change', 'That is how much the price changed. Give the new price itself.']],
        { tol: 1, otherMsg: `${m(t.C)} × ${t.af2.toFixed(4)} + $1,000 ÷ ${g1(t.y2)}^${t.n}.` });
      if (!n.ok) return n;
      if (e.choice !== t.decision) return { ok: false, code: 'decision', msg: !e.choice ? 'Answer question 2 as well: compare the new price with the face value.' : `Your price, ${m2(v)}, is ${v < 1000 ? 'below' : 'above'} $1,000. A price below $1,000 is a discount, and a price above it is a premium.` };
      return { ok: true };
    }
    if (t.id === 't3') {
      const rr = []; const nm = (x) => h.parseMoney(x);
      const one = (v, exact, other, n, af) => h.judgeNumber(v, exact, [[other, 'swap', 'That is the other bond’s price. Check which line is which.'], [10 * t.k * af + 1000, 'facenodisc', `Discount the $1,000 too: $1,000 ÷ ${g1(t.y3)}^${n}.`],
        [1000, 'par', `That is the price before rates rose. Price the bond at ${pc(t.y3)}.`], [10 * t.k * n + faceAt(t.y3, n), 'coupnodisc', `Multiply the ${m(10 * t.k)} coupon by the annuity factor, ${af.toFixed(4)}, instead of by ${n}.`],
        [10 * t.k * af + faceAt(t.k, n), 'oldface', `Discount the face value at the new rate too: $1,000 ÷ ${g1(t.y3)}^${n}, not ÷ ${g1(t.k)}^${n}.`]],
        { tol: 1, otherMsg: `${m(10 * t.k)} × ${af.toFixed(4)} + $1,000 ÷ ${g1(t.y3)}^${n}.` });
      rr[1] = one(nm(rows[1]), t.pS, t.pL, t.nS, t.afS); rr[2] = one(nm(rows[2]), t.pL, t.pS, t.nL, t.afL);
      const bad = [1, 2].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${bad === 1 ? `The ${t.nS}-year bond` : `The ${t.nL}-year bond`}: ${rr[bad].msg}` };
      if (e.choice !== t.decision) return { ok: false, rowRes: rr, msg: !e.choice ? 'Answer question 2 as well: which bond lost the larger share of its value?' : `Your ${t.nS}-year bond fell from $1,000 to ${m2(nm(rows[1]))}, and your ${t.nL}-year bond to ${m2(nm(rows[2]))}. Which one fell further below $1,000?` };
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't4') {
      const n = judgePct(h, e.value, t.y4, [[t.c4, 'coupon', `${pc(t.c4)} is the coupon rate, fixed when the bond was sold. Find the rate at which the bond is worth its ${m2(t.P4)} price.`],
        [t.cy, 'cy', `That divides the ${m2(10 * t.c4)} coupon by the ${m2(t.P4)} price. It leaves out the full $1,000 Northpass repays at maturity. Use the slider to find the rate at which the bond is worth ${m2(t.P4)}.`],
        [TSY[t.n4], 'tsy', `${p2(TSY[t.n4])} is the ${t.n4}-year Treasury yield. Lenders demand more from Northpass than from the government. Use the slider to find the rate at which the bond is worth ${m2(t.P4)}.`]],
        { tol: 0.05, closeMsg: 'Close. Move the slider in small steps until the bond’s value matches the price.', otherMsg: `Move the slider until the bond’s value matches ${m2(t.P4)}. A price below $1,000 means the yield is above the ${pc(t.c4)} coupon.` });
      if (!n.ok) return n;
      const mine = p2(pctIn(e.value, h));
      if (e.choice !== t.decision) return { ok: false, code: 'decision', msg: !e.choice ? 'Answer question 2 as well: the rate on a new loan.' : (e.choice === 'coupon' ? `The ${pc(t.c4)} coupon was set years ago, when rates were lower. Your yield, ${mine}, shows what lenders demand from Northpass now.` : `The ${p2(TSY[t.n4])} Treasury yield leaves out the extra lenders demand because Northpass might not repay. Your yield on Northpass’s own bond, ${mine}, includes it.`) };
      return { ok: true };
    }
    if (t.id === 't5') {
      const rr = [];
      const tenorDiag = Object.keys(TSY).filter((y) => Number(y) !== t.M).map((y) => [TSY[y], 'tenor', `${p2(TSY[y])} is the ${y}-year Treasury yield. Northpass wants to borrow for ${t.M} years.`]);
      rr[1] = judgePct(h, rows[1], t.tsy, tenorDiag, { otherMsg: `Find the ${t.M}-year line in the Treasury table.`, closeMsg: `Close. Copy the ${t.M}-year line of the Treasury table exactly.` });
      const ratDiag = SPREAD.filter((x) => x[0] !== t.R).map((x) => [x[1], 'rating', `${p2(x[1])} is the spread for ${rl(x[0])}. Northpass is rated ${rl(t.R)}.`]);
      rr[2] = judgePct(h, rows[2], t.s, ratDiag, { otherMsg: `Find the ${rl(t.R)} line in the spread table.`, closeMsg: `Close. Copy the ${rl(t.R)} line of the spread table exactly.` });
      rr[3] = judgePct(h, rows[3], t.cost, [[t.tsy, 'tsyonly', `Add the default spread to the Treasury yield: ${p2(t.tsy)} + ${p2(t.s)}.`], [t.s, 'sonly', `Add the Treasury yield to the spread: ${p2(t.tsy)} + ${p2(t.s)}.`], [t.tsy - t.s, 'minus', `Add the spread to the Treasury yield: ${p2(t.tsy)} + ${p2(t.s)}. Lenders want more from Northpass than from the government, not less.`]],
        { otherMsg: `Treasury yield + default spread: ${p2(t.tsy)} + ${p2(t.s)}.` });
      const iv = h.parseMoney(rows[4]);
      rr[4] = h.judgeNumber(iv, t.interest, [[t.X * 1e6 * t.cost, 'pct', `Turn the rate into a decimal first: ${p2(t.cost)} is ${(t.cost / 100).toFixed(4)}.`], [t.X * t.cost / 100, 'millions', `Give the amount in dollars, like ${Math.round(t.interest).toLocaleString('en-US')}, or add an m for millions.`],
        [t.X * 1e6 * t.tsy / 100, 'tsyonly', `Use the estimated borrowing cost, ${p2(t.cost)}, not the Treasury yield alone.`], [t.X * 1e6 * t.s / 100, 'sonly', `Use the estimated borrowing cost, ${p2(t.cost)}, not the spread alone.`]],
        { otherMsg: `${mil(t.X)} × ${(t.cost / 100).toFixed(4)}.` });
      const bad = [1, 2, 3, 4].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${['', 'Treasury yield', 'Default spread', 'Borrowing cost', 'Yearly interest'][bad]}: ${rr[bad].msg}` };
      return { ok: true, rowRes: rr };
    }
  }

  function helpText(t, lvl) {
    if (t.id === 't1') return lvl === 1 ? `Yearly coupon: ${pc(t.c)} × $1,000 = ${m2(t.C)}. Value today of the coupons: ${m2(t.C)} × ${t.af.toFixed(4)} = ${m2(t.PVc)}.`
      : `Coupon ${m2(t.C)}. Coupons ${m2(t.C)} × ${t.af.toFixed(4)} = ${m2(t.PVc)}. Face value $1,000 ÷ ${g1(t.y)}^${t.n} = ${m2(t.PVf)}. Price ${m2(t.PVc)} + ${m2(t.PVf)} = ${m2(t.P)}.`;
    if (t.id === 't2') return lvl === 1 ? `Coupons at the new rate: ${m(t.C)} × ${t.af2.toFixed(4)} = ${m2(t.C * t.af2)}. Face value: $1,000 ÷ ${g1(t.y2)}^${t.n} = ${m2(faceAt(t.y2, t.n))}.`
      : `${m2(t.C * t.af2)} + ${m2(faceAt(t.y2, t.n))} = ${m2(t.P2)}. That is ${t.P2 < 1000 ? 'below' : 'above'} $1,000, so the bond sells at a ${t.decision}.`;
    if (t.id === 't3') return lvl === 1 ? `${t.nS}-year bond: ${m(10 * t.k)} × ${t.afS.toFixed(4)} + $1,000 ÷ ${g1(t.y3)}^${t.nS} = ${m2(t.pS)}.`
      : `${t.nS}-year bond: ${m2(t.pS)}, a change of ${sg1(t.pS / 10 - 100)}.<br>${t.nL}-year bond: ${m(10 * t.k)} × ${t.afL.toFixed(4)} + $1,000 ÷ ${g1(t.y3)}^${t.nL} = ${m2(t.pL)}, a change of ${sg1(t.pL / 10 - 100)}. The long bond lost more.`;
    if (t.id === 't4') return lvl === 1 ? `Start at the coupon rate, ${pc(t.c4)}. There the bond is worth $1,000, more than its ${m2(t.P4)} price, so the yield is higher. Move the slider up until the value matches the price.`
      : `The yield is about ${p2(t.y4)}. At that rate the bond is worth ${m2(price(t.c4, t.y4, t.n4, false))}. In a spreadsheet, <code>=RATE(${t.n4}, ${10 * t.c4}, -${t.P4.toFixed(2)}, 1000)</code> gives the same. Lenders would demand about this yield on a new ${t.n4}-year loan.`;
    if (t.id === 't5') return lvl === 1 ? `Treasury yield for ${t.M} years: ${p2(t.tsy)}. Default spread for ${rl(t.R)}: ${p2(t.s)}.`
      : `Borrowing cost: ${p2(t.tsy)} + ${p2(t.s)} = ${p2(t.cost)}. Yearly interest: ${mil(t.X)} × ${(t.cost / 100).toFixed(4)} = ${m(t.interest)}.`;
  }
  function praise(t) {
    if (t.id === 't1') return `Investors would pay ${m2(t.P)} for each $1,000 bond, ${t.P < 1000 ? 'less than face value, because the coupon is below the market rate' : 'more than face value, because the coupon is above the market rate'}.`;
    if (t.id === 't2') return `A rise of ${t.d2} point${t.d2 === 1 ? '' : 's'} cut the price from ${m2(t.P)} to ${m2(t.P2)}. The coupons did not change, so buyers paid less until the bond earns ${pc(t.y2)}.`;
    if (t.id === 't3') return `The ${t.nS}-year bond fell ${(100 - t.pS / 10).toFixed(1)}%, but the ${t.nL}-year bond fell ${(100 - t.pL / 10).toFixed(1)}%. The long bond pays less than new bonds for many more years.`;
    if (t.id === 't4') return `Lenders demand about ${p2(t.y4)} from Northpass today, not the ${pc(t.c4)} coupon. That yield is Northpass’s cost of debt for ${t.n4} years.`;
    if (t.id === 't5') return `A ${t.M}-year loan would cost Northpass about ${p2(t.cost)}, or ${m(t.interest)} a year. Its ${t.n4}-year bond yields ${p2(t.y4)}, so the longer loan costs a little more, as the Treasury yields do.`;
  }
  function selfAnswer(t) {
    if (t.id === 't1') return { rows: [null, String(t.C), t.PVc.toFixed(2), t.PVf.toFixed(2), t.P.toFixed(2)] };
    if (t.id === 't2') return { value: t.P2.toFixed(2), choice: t.decision };
    if (t.id === 't3') return { rows: [null, t.pS.toFixed(2), t.pL.toFixed(2)], choice: t.decision };
    if (t.id === 't4') return { value: t.y4.toFixed(2), choice: t.decision };
    if (t.id === 't5') return { rows: [null, t.tsy.toFixed(2), t.s.toFixed(2), t.cost.toFixed(2), String(Math.round(t.interest))] };
  }
  function selfWrong(t) {
    if (t.id === 't1') return { rows: [null, String(t.C), (t.C * t.n).toFixed(2), t.PVf.toFixed(2), (t.C * t.n + t.PVf).toFixed(2)] };
    if (t.id === 't2') return { value: t.P.toFixed(2), choice: t.decision };
    if (t.id === 't3') return { rows: [null, t.pL.toFixed(2), t.pS.toFixed(2)], choice: t.decision };
    if (t.id === 't4') return { value: String(t.c4), choice: t.decision };
    if (t.id === 't5') { const other = Object.keys(TSY).find((y) => Number(y) !== t.M); return { rows: [null, TSY[other].toFixed(2), t.s.toFixed(2), (TSY[other] + t.s).toFixed(2), String(Math.round(t.X * 1e6 * (TSY[other] + t.s) / 100))] }; }
  }

  const WALK = {
    title: 'How Delphine prices a simple bond',
    intro: '<p>Delphine starts every new analyst on the same simple bond. It has a <b>$1,000</b> face value, a <b>6%</b> coupon paid once a year, and <b>3 years</b> to maturity.</p>',
    render(stage) {
      const T = (cap, head, rows, hl) => `<div class="tw"><table class="cf"><caption>${cap}</caption><thead><tr>${head.map((x, i) => `<th scope="col"${i === 0 ? ' style="text-align:left"' : ''}>${x}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr class="${hl === i ? 'hl' : ''}">${r.map((c, j) => `<td class="${j === 0 ? 'lbl' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      if (stage === 0) return T('What the bond pays', ['Year', 'Coupon', 'Face value', 'Total'], [['1', '$60', '', '$60'], ['2', '$60', '', '$60'], ['3', '$60', '$1,000', '$1,060']]);
      if (stage <= 2) {
        const rows = [['Value today of the coupons', '$60 × 2.6243 = $157.46'], ['Value today of the face value', '$1,000 ÷ 1.07³ = $816.30'], ['<b>Price</b>', '<b>$973.76</b>']];
        if (stage === 1) return T('The price when lenders demand 7%', ['Line', 'At 7%'], rows, 2);
        const r8 = ['$60 × 2.5771 = $154.63', '$1,000 ÷ 1.08³ = $793.83', '<b>$948.46</b>'];
        return T('The same bond when lenders demand 8%', ['Line', 'At 7%', 'At 8%'], rows.map((r, i) => r.concat([r8[i]])), 2);
      }
      if (stage === 3) return T('Finding the yield when the price is $973.76', ['Rate tried', 'Value of the bond', 'Compared with $973.76'], [['6%', '$1,000.00', 'Too high, try a higher rate'], ['8%', '$948.46', 'Too low, try a lower rate'], ['7%', '$973.76', 'A match']], 2);
      return T('What the bond tells Delphine', ['Rate', 'What it is'], [['6% coupon', 'Fixed when the bond was sold'], ['7% yield to maturity', 'What lenders demand today'], ['<b>Cost of debt</b>', '<b>7%, the yield</b>']], 2);
    },
    stages: [
      { t: 'List what the bond pays', p: 'The coupon is 6% of $1,000, so the bond pays $60 at the end of each year. At the end of year 3 it also repays the $1,000 face value.' },
      { t: 'Price it', p: 'Lenders demand 7%. Value the coupons with the annuity factor for 7% and 3 years, 2.6243, and discount the face value. The price is the sum, <b>$973.76</b>, below $1,000 because the 6% coupon is less than the 7% lenders want.' },
      { t: 'Raise the rate', p: 'Rates rise to 8%. The coupons and the face value are both worth less today, so the price falls to <b>$948.46</b>. When rates go up, bond prices go down.' },
      { t: 'Find the yield', p: 'Now turn it around: the bond trades at $973.76, and Delphine wants the rate lenders demand. Try rates until the bond’s value matches the price. At 7% it matches, so the <b>yield to maturity</b> is 7%. In a spreadsheet, <code>=RATE(3, 60, -973.76, 1000)</code> gives 7%.' },
      { t: 'Read the yield as a cost', p: 'The 6% coupon was set when the bond was sold. The 7% yield is what lenders demand today, so a new 3-year loan would cost about 7%. That yield is the company’s <b>cost of debt</b>.' },
    ],
  };

  root.DESK = {
    app: 'finan4-u8-bond-desk', version: 2, seedVersion: 2, salt: 'rize-finan4-u8-bond:4c91d7', points: 20,
    storageKey: 'rize-finan4-u8-bond-v1', filePrefix: 'BondDesk', ROUND,
    verifyUrl: 'https://rizecomputerscience.github.io/finan4-bond-desk/verify.html',
    calcPlaceholder: '60*2.6243+1000/1.07^3',
    calcHint: 'Type or tap. Use * to multiply, / to divide and ^ for a power, so 60*2.6243+1000/1.07^3 is the price of a 3-year bond with a 6% coupon when lenders demand 7%.',
    story: { title: 'The Bond Desk', kicker: 'Corporate Finance, Unit 8', company: 'Northpass Resorts', team: 'Treasury Team',
      from: 'Delphine Tamura', fromTitle: 'treasurer, Northpass Resorts',
      dek: 'You have joined the treasury team at Northpass Resorts, a company that runs ski resorts. Northpass pays for new lifts and lodges partly with borrowed money. Delphine Tamura, the treasurer, wants you to price its bonds and work out what it costs Northpass to borrow today.',
      whatBox: '<b>A bond is a loan that investors can buy and sell.</b> Its price is the value today of its coupons and its face value. When rates rise, bond prices fall, and the yield on a company’s bonds shows what it costs that company to borrow.',
      stepsLine: 'There are eleven steps: a worked example, five problems with three one-question checks between them, one exam-style question, and a short note to Delphine.' },
    steps: STEPS, quiz: QUIZ, walk: WALK, buildTasks, taskView, judgeTask, helpText, praise, selfAnswer, selfWrong,
    note: { title: 'A note for the board', label: 'Your note to Delphine', minWords: 30, receiptHeading: 'Note to the treasurer',
      prompt: 'Northpass’s board will vote next month on borrowing for the new lodge. Write Delphine a short note. Say what interest rate the plan should assume and why it should not use the coupon on Northpass’s older bonds. Then say what happens to the price of those older bonds when rates rise, and whether that changes the interest Northpass pays.' },
  };
})(typeof window !== 'undefined' ? window : globalThis);
