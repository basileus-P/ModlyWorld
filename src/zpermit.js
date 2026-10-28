// ================= Teleportation – step 4: the PERMIT TO TELEPORT =================
// The Permit Office in the city. Clerk "ponia Antspaudė" says the permit needs TWO green ticks:
//   ✓1 – pass her teleportation exam (at least 3 of 4 right),
//   ✓2 – the signature of the Director, who is sunbathing on the roof of the TALLEST skyscraper (fly up with Space!).
// Then she stamps the permit and it appears in the Teleportation corner.
Q26.exam = !!Q26.exam; Q26.sign = !!Q26.sign; Q26.permit = !!Q26.permit;
teleCount = () => (Q26.berry ? 1 : 0) + (Q26.plant ? 1 : 0) + (Q26.plum ? 1 : 0) + (Q26.permit ? 1 : 0);
const OFFICE = new V3(17, 0, 10);
const PM = { office: null, clerk: null, director: null, roof: null };
function permitTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#ffffff'; x.beginPath(); x.arc(128, 128, 124, 0, 7); x.fill(); x.strokeStyle = '#2ab83a'; x.lineWidth = 12; x.beginPath(); x.arc(128, 128, 112, 0, 7); x.stroke();
  const tick = (cx, cy) => { x.strokeStyle = '#2ab83a'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx - 26, cy - 4); x.lineTo(cx - 6, cy + 18); x.lineTo(cx + 30, cy - 26); x.stroke(); };
  if (Q26.exam || Q26.permit) tick(128, 68); if (Q26.sign || Q26.permit) tick(124, 192);
  x.fillStyle = '#9a2ab0'; x.font = 'bold 34px Georgia, serif'; x.textAlign = 'center'; x.fillText('teleportacija', 128, 140);
  const t = new THREE.CanvasTexture(c); return t;
}
function makePermit() { const g = new THREE.Group(), tex = permitTex(); const d = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.06, 40), mat(0xf4f4f4)); d.rotation.x = Math.PI / 2; d.position.y = 0.7; g.add(d); for (const s2 of [1, -1]) { const f = mesh(new THREE.CircleGeometry(0.6, 40), new THREE.MeshBasicMaterial({ map: tex }), 0, 0.7, 0.032 * s2); if (s2 < 0) f.rotation.y = Math.PI; g.add(f); } g.add(S(G.cyl, mat(0xc8a040), 0.04, 0.6, 0.04, 0, 0.3, 0)); return g; }
function makeStarOfficial(col, extras) {
  const m = makeStarKid(); m.scale.setScalar(1.6); const body = m.userData.body; body.children[0].material = mat(col, { emissive: col, emissiveIntensity: 0.4 });
  if (extras === 'glasses') { for (const x of [-0.12, 0.12]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 5, 14), bmat(0x1a1a1a)); r.position.set(x, 1.05, 0.25); body.add(r); } body.add(S(G.box, bmat(0x1a1a1a), 0.1, 0.012, 0.012, 0, 1.06, 0.25)); body.add(S(G.box, mat(0x2a4ac8), 0.08, 0.22, 0.03, 0, 0.78, 0.22)); }
  if (extras === 'sun') { for (const x of [-0.12, 0.12]) body.add(S(G.box, bmat(0x111111), 0.15, 0.08, 0.02, x, 1.06, 0.25)); body.add(S(G.box, bmat(0x111111), 0.1, 0.02, 0.02, 0, 1.08, 0.25)); }
  return m;
}
{ const _b = buildStar; buildStar = () => { const first = !ST.built; _b(); if (first) buildPermitOffice(); }; }
function buildPermitOffice() {
  const g = new THREE.Group(); g.position.copy(OFFICE); stScene.add(g); PM.office = g;
  const wall = mat(0xf0e8ff, { emissive: 0x2a2040 }), trim = mat(0x6a4ac8);
  g.add(S(G.box, wall, 0.4, 4, 9, 3, 2, 0)); g.add(S(G.box, wall, 6, 4, 0.4, 0, 2, -4.5)); g.add(S(G.box, wall, 6, 4, 0.4, 0, 2, 4.5)); g.add(S(G.box, trim, 6.6, 0.4, 9.6, 0, 4.2, 0));
  g.add(S(G.box, mat(0x3a2a6a), 6, 0.05, 9, 0, 0.03, 0));
  g.add(S(G.box, mat(0x8a5a2a), 1, 1.1, 4, 1.2, 0.55, 0)); g.add(S(G.box, mat(0xd8b070), 1.2, 0.08, 4.2, 1.2, 1.12, 0));   // the desk
  g.add(S(G.cyl, mat(0x2a2a2a), 0.25, 0.3, 0.25, 1.2, 1.3, 1.4)); g.add(S(G.box, mat(0xc82a2a), 0.4, 0.15, 0.3, 1.2, 1.25, -1.2));   // a stamp and an ink box
  for (let i = 0; i < 6; i++) g.add(S(G.box, mat(0xffffff), 0.6, 0.02, 0.45, 1.1 + rr(-0.2, 0.2), 1.17 + i * 0.03, 0.2));   // a pile of papers
  const sign = mesh(new THREE.PlaneGeometry(5, 0.9), new THREE.MeshBasicMaterial({ map: labelTex('LEIDIMŲ BIURAS', '#3a2a7a', '#ffffff', 512, 96), side: THREE.DoubleSide }), -3.05, 3.6, 0); sign.rotation.y = -Math.PI / 2; g.add(sign);
  const clerk = makeStarOfficial(0xffd0f0, 'glasses'); clerk.position.set(2.2, 0, 0); clerk.rotation.y = -Math.PI / 2; g.add(clerk); PM.clerk = clerk;
  for (const [x, z, hx, hz] of [[3, 0, 0.2, 4.5], [0, -4.5, 3, 0.2], [0, 4.5, 3, 0.2], [1.2, 0, 0.5, 2]]) ST.boxes.push({ x: OFFICE.x + x, z: OFFICE.z + z, hx, hz, h: x === 1.2 ? 1.15 : 4.4 });
  // the director sunbathes on the roof of the tallest skyscraper
  let top = null; for (const b of ST.boxes) { const d = Math.hypot(b.x, b.z); if (d > 22 && d < 64 && b.hx > 2 && (!top || b.h > top.h)) top = b; }
  PM.roof = top; const dg = new THREE.Group(); dg.position.set(top.x, top.h, top.z); stScene.add(dg); PM.dirGroup = dg;
  const dir = makeStarOfficial(0xffe14d, 'sun'); dir.position.set(0.6, 0, 0); dir.rotation.y = 0.4; dg.add(dir); PM.director = dir;
  dg.add(S(G.box, mat(0x5ac8ff), 0.9, 0.15, 2, -0.8, 0.35, 0)); dg.add(S(G.box, mat(0xffffff), 0.9, 0.1, 0.5, -0.8, 0.6, -0.8).rotateX(-0.6));   // a sun lounger
  dg.add(S(G.cyl, mat(0xdddddd), 0.04, 2.4, 0.04, -1.8, 1.2, 0.8)); dg.add(new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.6, 12), mat(0xff5a8a)).translateX(-1.8).translateY(2.5).translateZ(0.8));
  dg.add(S(G.cyl, mat(0xffffff, { transparent: true, opacity: 0.7 }), 0.12, 0.3, 0.12, 1.4, 0.15, 0.6)); dg.add(S(G.cyl, mat(0xff8a1a), 0.1, 0.2, 0.1, 1.4, 0.15, 0.6));   // a glass of juice
  // a glowing lift pad next to the tower: E takes you up to the roof (and back down from the roof)
  { const d = new V3(-top.x, 0, -top.z).normalize(); PM.liftB = new V3(top.x + d.x * (top.hx + 2.2), 0, top.z + d.z * (top.hz + 2.2));
    const lp = new THREE.Group(); lp.position.copy(PM.liftB); stScene.add(lp); lp.add(S(G.cyl, mat(0x5affd8, { emissive: 0x2aa088 }), 1.4, 0.2, 1.4, 0, 0.1, 0)); lp.add(S(G.cyl, bmat(0x5affd8, { transparent: true, opacity: 0.18, depthWrite: false }), 1.3, 6, 1.3, 0, 3, 0)); const sg = makeSign('Liftas į stogą'); sg.position.set(1.8, 0, 0); lp.add(sg); linearize(lp); }
  linearize(g); linearize(dg);
}
{ const _r = refreshTeleCorner; refreshTeleCorner = () => { _r(); if (Q26.permit && TP.slots) { const p = makePermit(); TP.slots[3].add(p); const a = 3 / TP_STEPS * Math.PI * 2; p.rotation.y = Math.atan2(Math.cos(a), Math.sin(a)); } }; }
const nearClerk = () => PM.office && !isUnder() && Math.hypot(player.pos.x - (OFFICE.x + 0.6), player.pos.z - OFFICE.z) < 3 && player.pos.y < 3;
const nearLift = () => PM.liftB && Math.hypot(player.pos.x - PM.liftB.x, player.pos.z - PM.liftB.z) < 2 && player.pos.y < 3;
const onRoofEdge = () => PM.roof && Math.abs(player.pos.y - PM.roof.h) < 1 && Math.hypot(player.pos.x - PM.roof.x, player.pos.z - PM.roof.z) < 7 && !nearDirector();
function liftGo(up) { if (transitioning) return; transitioning = true; tone(up ? 523 : 784, 0.3, { to: up ? 1047 : 392, type: 'sine', vol: 0.05 }); fadeTo(() => { transitioning = false; if (up) player.pos.set(PM.roof.x - 1.5, PM.roof.h + 0.05, PM.roof.z - 1.5); else player.pos.set(PM.liftB.x + 1.5, 0, PM.liftB.z); player.vel.set(0, 0, 0); player.vr = 0; player.grounded = true; }); }
const nearDirector = () => PM.roof && Math.hypot(player.pos.x - PM.roof.x, player.pos.z - PM.roof.z) < 4.5 && Math.abs(player.pos.y - PM.roof.h) < 3;
// ---------- the exam ----------
const TELE_QS = [
  ['Kokios spalvos Teleporto uoga?', 'Raudona', ['Mėlyna', 'Žalia', 'Juoda']],
  ['Kur auga Susipainiojusi slyva?', 'Ant Painiavų medžio miške', ['Urve po žeme', 'Ant Dievės sosto', 'Ant dangoraižio stogo']],
  ['Kiek kainuoja Teleporto augalas „Kaka“ parduotuvėje?', '3000 €', ['300 €', '30 €', '30 000 €']],
  ['Kiek žingsnių turi Teleportacijos įsakymas?', '8', ['5', '3', '12']],
  ['Kas gyvena ant Žvaigždžių Dievės žvaigždės?', 'Mažos žvaigždutės', ['Maži šuniukai', 'Laikrodžiai', 'Žaibukai']],
  ['Kokia raidė parašyta ant Teleporto uogos?', 'T', ['Ž', 'S', 'L']],
  ['Kuo sudeginai juodus mazgus ant Painiavų medžio?', 'Ugnies kamuoliu', ['Dinamitu', 'Vandeniu', 'Kardu']],
  ['Kur nukeliauja visi rasti teleportacijos daiktai?', 'Į Teleportacijos kampą', ['Į urvą', 'Į parduotuvę', 'Į Dievės rūmus']]
];
function startTeleExam() {
  const qs = TELE_QS.slice().sort(() => Math.random() - 0.5).slice(0, 4);
  quiz = { tele: true, qs, i: 0, ok: 0 }; try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { } quizOpen = true; showTeleQ();
}
function showTeleQ() {
  const [q, right, wrong] = quiz.qs[quiz.i]; quiz.opts = [right, ...wrong].sort(() => Math.random() - 0.5); quiz.right = right;
  card = { kind: 'quiz' }; showCard(`Teleportacijos egzaminas · ${quiz.i + 1} / ${quiz.qs.length}`, q, `Spausk atsakymą (arba 1–4) · teisingų: ${quiz.ok}`, '#9a6aff');
  const box = $('quizBtns'); box.hidden = false; box.innerHTML = quiz.opts.map((o, i) => `<button type="button" data-i="${i}"><small>${i + 1}</small> ${o}</button>`).join('');
  box.querySelectorAll('button').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); answerQuiz(+b.dataset.i); })); $('paused').hidden = true;
}
{ const _q = answerQuiz; answerQuiz = i => {
    if (!quiz || !quiz.tele) return _q(i);
    if (!quizOpen) return; const ok = quiz.opts[i] === quiz.right;
    if (ok) { quiz.ok++; tone(880, 0.12, { type: 'triangle', vol: 0.06 }); tone(1320, 0.15, { type: 'triangle', vol: 0.05, when: 0.08 }); } else tone(220, 0.25, { type: 'square', vol: 0.04, lp: 900 });
    quiz.i++; if (quiz.i < quiz.qs.length) { showTeleQ(); return; }
    const n = quiz.ok; quizClose(); quiz = null;
    if (n >= 3) { Q26.exam = true; saveQ26(); [523, 659, 784, 1047].forEach((f, k) => tone(f, 0.3, { type: 'triangle', vol: 0.06, when: k * 0.1 }));
      startTalk('Ponia Antspaudė', [`${n} iš 4! Išlaikei! Štai PIRMOJI žalia varnelė. ✔`, Q26.sign ? 'O direktoriaus parašą jau turi! Puiku – ateik, uždėsiu antspaudą.' : 'Dabar reikia ANTROSIOS varnelės – direktoriaus parašo. Bet direktorius… ilsisi. Ant AUKŠČIAUSIO dangoraižio stogo. Prie to dangoraižio yra švytintis LIFTAS – lipk juo (E)!'], '#ffd0f0'); }
    else startTalk('Ponia Antspaudė', [`Tik ${n} iš 4… Reikia bent 3. Pasimokyk ir ateik perlaikyti! Klausimai – apie teleportacijos daiktus ir mūsų žvaigždę.`], '#ffd0f0');
  }; }
// ---------- talking ----------
{ const _a = starAction; starAction = () => {
    if (card) return _a();
    if (nearLift()) { liftGo(true); return; }
    if (onRoofEdge()) { liftGo(false); return; }
    if (Q26.stage === 'steps' && !Q26.permit) {
      if (nearClerk()) {
        if (!Q26.exam) { startTalk('Ponia Antspaudė', ['Laba diena! Leidimų biuras, klausau. Ko pageidaujate?', 'LEIDIMO TELEPORTUOTIS? Hmm… Tai labai rimtas dokumentas. Ant jo turi būti DVI žalios varnelės.', 'Pirmoji varnelė – už išlaikytą TELEPORTACIJOS EGZAMINĄ. Keturi klausimai, reikia bent trijų teisingų.', 'Pradedam? Sėkmės!'], '#ffd0f0', () => startTeleExam()); return; }
        if (!Q26.sign) { startTalk('Ponia Antspaudė', ['Pirmoji varnelė yra. Dabar – direktoriaus parašas. Jis deginasi ant AUKŠČIAUSIO dangoraižio stogo. Prie jo apačios yra švytintis LIFTAS (E).'], '#ffd0f0'); return; }
        // both ticks – stamp it!
        startTalk('Ponia Antspaudė', ['Egzaminas – ✔. Direktoriaus parašas – ✔. Viskas tvarkoje!', 'BAKST! Štai antspaudas. Sveikinu – tu turi LEIDIMĄ TELEPORTUOTIS!'], '#ffd0f0', () => { Q26.permit = true; saveQ26(); refreshTeleCorner(); noiseHit(0.2, { ft: 'lowpass', f: 500, vol: 0.2 }); [659, 880, 1175, 1568].forEach((f, k) => tone(f, 0.2, { type: 'triangle', vol: 0.05, when: 0.2 + k * 0.08 }));
          toast('Leidimas teleportuotis gautas! ✔✔', `Jis atsirado Teleportacijos kampe. Žingsnis ${Q26.step} iš ${TP_STEPS}`, '#2ab83a'); });
        return;
      }
      if (nearDirector()) {
        if (!Q26.sign) { startTalk('Direktorius', ['Mmm… saulutė… Ką? Kas mane žadina? Aš ATOSTOGAUJU!', 'Leidimas teleportuotis? Ech… Gerai, gerai. Duok čia tą popierių.', 'Brūkšt! Štai, pasirašiau. Antroji varnelė – tavo. ✔ O dabar netrukdyk, man reikia įdegti iki penkių kampų.'], '#ffe14d', () => { Q26.sign = true; saveQ26(); tone(1200, 0.1, { type: 'triangle', vol: 0.05 }); toast('Direktoriaus parašas ✔', Q26.exam ? 'Grįžk į Leidimų biurą – ponia Antspaudė uždės antspaudą' : 'Dar reikia išlaikyti egzaminą Leidimų biure', '#2ab83a'); }); return; }
        startTalk('Direktorius', [pick(['Zzz… jau pasirašiau… zzz…', 'Ar tu vėl čia? Aš atostogauju!', 'Saulutė… sultys… ramybė…'])], '#ffe14d'); return;
      }
    }
    if (nearClerk()) { startTalk('Ponia Antspaudė', [Q26.permit ? 'Tavo leidimas galioja amžinai. Sėkmingų teleportacijų!' : 'Leidimų biuras. Leidimus teleportuotis išduodame tik tiems, kas vykdo Dievės įsakymą.'], '#ffd0f0'); return; }
    if (nearDirector()) { startTalk('Direktorius', ['Zzz… atostogos… zzz…'], '#ffe14d'); return; }
    return _a();
  }; }
{ const _u = updateStar; updateStar = (dt, t) => { _u(dt, t);
    if (!PM.clerk) return;
    PM.clerk.userData.body.rotation.z = Math.sin(t * 2) * 0.05; PM.director.userData.body.rotation.z = Math.sin(t * 0.7) * 0.08;
    if (!card && nearLift()) setPrompt('<kbd>E</kbd> liftu į stogą'); else if (!card && onRoofEdge()) setPrompt('<kbd>E</kbd> liftu žemyn'); else if (!card && Q26.stage === 'steps' && !Q26.permit) { if (nearClerk()) setPrompt(!Q26.exam ? '<kbd>E</kbd> kalbėtis su ponia Antspaude (egzaminas)' : Q26.sign ? '<kbd>E</kbd> gauti antspaudą' : '<kbd>E</kbd> kalbėtis su ponia Antspaude'); else if (nearDirector() && !Q26.sign) setPrompt('<kbd>E</kbd> pažadinti direktorių (parašas)'); }
  }; }
function permitTest() { plumTest(); Q26.knots = 5; Q26.plum = true; Q26.exam = Q26.sign = Q26.permit = false; saveQ26(); refreshPlum(); refreshTele(); player.pos.set(OFFICE.x - 6, 0, OFFICE.z); player.fwd.set(1, 0, 0); toast('Bandymų pasaulis: leidimas', 'Leidimų biuras – priešais tave', '#2ab83a'); }
