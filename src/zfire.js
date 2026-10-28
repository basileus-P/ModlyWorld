// ================= The Star Goddess – commandment 1: the FIREBALL =================
// Find the MIXING MACHINE (deep in the star cave), a MATCH (it can be anywhere!), buy a JAR in the phone shop "Kaka",
// and get 5 STAR HAIRS – talk to little stars and offer them money: some agree, some don't.
// Mix everything into an elixir, drink it and choose the key that throws your fireball. The key is always shown in the controls.
const Q25 = { stage: 'none', mixer: false, match: false, jar: false, hairs: 0, spot: -1, elixir: false, key: null, asked: [] };   // none | hunt | done
try { const s = JSON.parse(localStorage.getItem('modly-quest25') || 'null'); if (s) Object.assign(Q25, s); } catch (_) { }
function saveQ25() { try { localStorage.setItem('modly-quest25', JSON.stringify(Q25)); } catch (_) { } }
const FB = { mixer: null, match: null, spots: [], hud: null, picking: false, lastScene: null, balls: [] };
const MIXER_POS = new V3(UGC.x - 6, UGC.y, UGC.z + 12);
const FREE_KEYS = ['KeyC', 'KeyJ', 'KeyK', 'KeyL', 'KeyO', 'KeyU', 'KeyZ', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9'];
const keyLabel = c => c ? c.replace('Key', '').replace('Digit', '') : '';
// ---------- the jar in the phone shop "Kaka" ----------
{ const _k = mpKaka; mpKaka = b => { _k(b);
    const row = document.createElement('div'); row.className = 'mpRow'; row.style.cursor = 'default';
    row.innerHTML = `<div class="mpIco" style="background:#5a8ab0;width:52px;height:52px">🫙</div><div style="flex:1"><div style="font-weight:800">Stiklainis</div><div class="mpSmall" style="padding:0">Tvirtas stiklainis eliksyrams. 50 €</div></div>${Q25.jar ? '<b style="color:#3cc86a">Turi ✅</b>' : '<button class="mpBtn go" id="kkJar">50 €</button>'}`;
    const msg = b.querySelector('#kkMsg'); b.insertBefore(row, msg ? msg.previousElementSibling : null);
    if ($('kkJar')) $('kkJar').onclick = () => { if (money < 50) { $('kkMsg').textContent = 'Neužtenka pinigų stiklainiui…'; return; } addMoney(-50); Q25.jar = true; saveQ25(); sfx.chime(); mpShow('kaka', true); };
  }; }
// ---------- the mixing machine (in the cave) and the match (anywhere) ----------
{ const _b = buildStar; buildStar = () => { const first = !ST.built; _b(); if (first) buildFireQuest(); }; }
function buildFireQuest() {
  const g = new THREE.Group(); g.position.copy(MIXER_POS); stScene.add(g); FB.mixer = g;
  const brass = mat(0xc8902a, { metalness: 0.8, roughness: 0.3 }), glass = mat(0xbfe8ff, { transparent: true, opacity: 0.45, roughness: 0.05 });
  g.add(S(G.cyl, mat(0x3a2a1a), 1.6, 0.4, 1.6, 0, 0.2, 0)); g.add(S(G.cyl, brass, 1.1, 1.8, 1.1, 0, 1.3, 0)); g.add(S(G.sph, brass, 1.1, 0.6, 1.1, 0, 2.2, 0));
  g.add(new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 16, 1, true), brass).translateY(3.1).rotateX(Math.PI));
  for (const [x, z, c] of [[1.7, 0.4, 0xff5a2a], [-1.6, 0.6, 0x5affd8], [0.4, -1.7, 0xffd23a]]) { g.add(S(G.sph, glass, 0.55, 0.65, 0.55, x, 1.4, z)); const liq = S(G.sph, bmat(c, { transparent: true, opacity: 0.85 }), 0.42, 0.35, 0.42, x, 1.2, z); g.add(liq); g.add(S(G.cyl, brass, 0.08, 1.2, 0.08, x * 0.6, 2.1, z * 0.6).rotateZ(x * 0.4)); }
  g.add(S(G.box, mat(0x2a2a2a), 0.5, 0.35, 0.1, 0, 1.4, 1.12)); for (let i = 0; i < 3; i++) g.add(S(G.sph, bmat([0x5aff5a, 0xffd23a, 0xff3a3a][i]), 0.06, 0.06, 0.04, -0.15 + i * 0.15, 1.42, 1.17));
  const s = makeSign('Maišymo aparatas'); s.position.set(2.6, 0, 1.4); g.add(s);
  ST.ugBoxes.push({ x: MIXER_POS.x, z: MIXER_POS.z, hx: 1.3, hz: 1.3, h: MIXER_POS.y + 2.6 });
  // where the match may be hiding
  const roof = ST.boxes.find(b => b.h > 14 && Math.hypot(b.x, b.z) > 30) || ST.boxes[0];
  const tip = k => { const [x, z] = armDir(k); return new V3(x * 128, 0, z * 128); };
  // the match is always in one of three places: the star forest, a tip of the star, or next to a skyscraper
  { const d = new V3(-roof.x, 0, -roof.z).normalize(); FB.spots = [new V3(FOREST_C.x + 12, 0, FOREST_C.z - 9)]; void d; }
  if (Q25.spot < 0 || Q25.spotV !== 3 || Q25.spot >= FB.spots.length) { Q25.spot = Math.floor(Math.random() * FB.spots.length); Q25.spotV = 3; saveQ25(); }
  const m = new THREE.Group(); m.add(S(G.cyl, mat(0xe8d0a0), 0.035, 0.6, 0.035, 0, 0.3, 0)); m.add(S(G.sph, mat(0xc82a2a), 0.06, 0.09, 0.06, 0, 0.62, 0));
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xff8a3a, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(1.4); gl.position.y = 0.5; m.add(gl);
  m.rotation.z = 1.3; m.position.copy(FB.spots[Q25.spot]).add(new V3(0, 0.08, 0)); stScene.add(m); FB.match = m;
  linearize(g); refreshFireQuest();
}
function refreshFireQuest() { if (FB.match) FB.match.visible = Q25.stage === 'hunt' && !Q25.match; }
const nearMixer = () => FB.mixer && isUnder() && player.pos.distanceTo(MIXER_POS) < 3.6;
const nearMatch = () => FB.match && FB.match.visible && Math.hypot(player.pos.x - FB.match.position.x, player.pos.z - FB.match.position.z) < 2.2 && Math.abs(player.pos.y - FB.match.position.y) < 2.5;
const fireHave = () => Q25.mixer && Q25.match && Q25.jar && Q25.hairs >= 5;
// ---------- talking ----------
{ const _a = starAction; starAction = () => {
    if (card) return _a();
    if (Q25.stage === 'hunt') {
      if (nearMatch()) { Q25.match = true; saveQ25(); refreshFireQuest(); tone(1320, 0.12, { type: 'triangle', vol: 0.05 }); toast('Radai DEGTUKĄ! 🔥', fireLeft(), '#ff8a3a'); return; }
      if (nearMixer()) { mixerUse(); return; }
      { const k = nearStarKid(); if (k && Q25.hairs < 5) { askHair(k); return; } }
    }
    if (nearStarGoddess() && Q24.met && Q25.stage !== 'done') {
      if (Q25.stage === 'none') { startTalk('Žvaigždžių Dievė', ['Tu pasiruošęs? Gerai. Štai mano PIRMASIS įsakymas: UGNIES KAMUOLYS.', 'Giliai mano urve slepiasi senas MAIŠYMO APARATAS. Surask jį.', 'Tau reikės DEGTUKO. Jis visada būna ŽVAIGŽDŽIŲ MIŠKE. Ieškok tarp šviečiančių medžių!', 'Reikės ir STIKLAINIO – nusipirk jį telefonu, parduotuvėje „Kaka“.', 'Ir svarbiausia – 5 ŽVAIGŽDŽIŲ PLAUKAI. Kalbinkis su mano žvaigždutėmis ir siūlyk joms pinigų. Kai kurios sutiks… o kai kurios – ne.', 'Sumaišyk viską aparate, išgerk eliksyrą – ir ugnis bus tavo. ✨'], '#ffe8a0', () => { Q25.stage = 'hunt'; saveQ25(); refreshFireQuest(); toast('1 įsakymas: Ugnies kamuolys', fireLeft(), '#ff8a3a'); }); return; }
      startTalk('Žvaigždžių Dievė', [`Ugnies kamuolys dar laukia. ${fireLeft()}`], '#ffe8a0'); return;
    }
    return _a();
  }; }
function fireLeft() { const n = []; if (!Q25.mixer) n.push('surask maišymo aparatą (urve)'); if (!Q25.match) n.push('surask degtuką (Žvaigždžių miške)'); if (!Q25.jar) n.push('nusipirk stiklainį (P → Kaka)'); if (Q25.hairs < 5) n.push(`žvaigždžių plaukai ${Q25.hairs}/5`); return n.length ? 'Dar reikia: ' + n.join(' · ') : 'Viską turi! Eik prie maišymo aparato urve.'; }
function askHair(k) {
  const id = ST.kids.indexOf(k);
  if (Q25.asked.includes(id)) { k.hop = 1; startTalk('Žvaigždutė', [k.gave ? 'Aš tau jau daviau savo plaukelį! Saugok jį. ✨' : pick(['Ne ne ne! Sakiau – savo plaukelių neparduodu!', 'Hmpf. Paklausk kitos žvaigždutės.', 'Mano plaukeliai – mano šviesa. Ne!'])], '#ffe14d'); return; }
  const price = pick([20, 30, 40]);
  askChoice('Žvaigždutė', `„${k.line}“ — Pasiūlyti ${price} € už vieną žvaigždės plaukelį?`, '#ffe14d', yes => {
    if (!yes) return;
    if (money < price) { startTalk('Žvaigždutė', [`Tu neturi ${price} €… Grįžk, kai turėsi!`], '#ffe14d'); return; }
    Q25.asked.push(id); const ok = Math.random() < 0.45; k.hop = 1;
    if (ok) { addMoney(-price); Q25.hairs++; k.gave = true; saveQ25(); tone(1568, 0.2, { type: 'sine', vol: 0.05 }); startTalk('Žvaigždutė', [pick(['Gerai! Še, mano plaukelis – jis šviečia kaip spindulys! ✨', 'Sutinku! Tik nesakyk mamai. Še!', 'Oho, tiek pinigų! Imk plaukelį!']) + ` (Plaukų: ${Q25.hairs}/5)`], '#ffe14d'); }
    else { saveQ25(); tone(300, 0.2, { to: 200, type: 'triangle', vol: 0.05 }); startTalk('Žvaigždutė', [pick(['Ne! Nė už jokius pinigus!', 'Ne-a. Mano plaukeliai – ne pardavimui.', 'Hmm… ne. Man jie per gražūs.'])], '#ffe14d'); }
  });
}
function mixerUse() {
  if (!Q25.mixer) { Q25.mixer = true; saveQ25(); startTalk('Maišymo aparatas', ['Radai seną MAIŠYMO APARATĄ! Burbuliuoja ir dūsta…', fireLeft()], '#ff8a3a'); return; }
  if (!fireHave()) { startTalk('Maišymo aparatas', [fireLeft()], '#ff8a3a'); return; }
  // mix!
  hideCard(); for (const k in keys) keys[k] = false; let t = 0; const bubbles = [];
  toast('Maišai eliksyrą…', 'Degtukas, stiklainis ir 5 žvaigždžių plaukai', '#ff8a3a');
  cinema = dt => {
    t += dt; FB.mixer.rotation.y = Math.sin(t * 20) * 0.04 * Math.min(1, t);
    if (Math.random() < dt * 25) { const b = S(G.sph, bmat(pick([0xff5a2a, 0xffd23a, 0xff8a3a])), 0.2, 0.2, 0.2); b.position.copy(MIXER_POS).add(new V3(rr(-0.4, 0.4), 3.2, rr(-0.4, 0.4))); stScene.add(b); bubbles.push({ b, v: new V3(rr(-1, 1), rr(2, 5), rr(-1, 1)) }); }
    for (const q of bubbles) { q.b.position.addScaledVector(q.v, dt); q.b.scale.multiplyScalar(1 - dt * 0.8); }
    if (Math.random() < dt * 5) tone(rr(200, 600), 0.06, { type: 'sine', vol: 0.03 });
    camera.position.lerp(_ct.copy(MIXER_POS).add(new V3(5, 4, 6)), Math.min(1, dt * 2)); camera.lookAt(MIXER_POS.clone().add(new V3(0, 2, 0)));
    if (t > 3.5) { cinema = null; bubbles.forEach(q => stScene.remove(q.b)); Q25.elixir = true; saveQ25(); redFlash('rgba(255,140,40,.7)', 400);
      askChoice('Ugnies eliksyras', 'Eliksyras paruoštas! Jis karštas ir burbuliuoja oranžine ugnimi. Išgerti?', '#ff8a3a', yes => { if (yes) drinkElixir(); else toast('Eliksyras laukia', 'Paspausk E prie aparato, kai būsi pasiruošęs gerti', '#ff8a3a'); }); }
  };
}
{ const _m = mixerUse; mixerUse = () => { if (Q25.elixir && Q25.stage === 'hunt') { askChoice('Ugnies eliksyras', 'Išgerti ugnies eliksyrą?', '#ff8a3a', yes => { if (yes) drinkElixir(); }); return; } _m(); }; }
function drinkElixir() {
  tone(180, 0.8, { to: 90, type: 'sawtooth', vol: 0.08, lp: 900 }); redFlash('rgba(255,90,20,.8)', 600); shake = Math.max(shake, 0.8);
  FB.picking = true; card = { kind: 'keypick' };
  showCard('🔥 Ugnis tavyje!', 'Tavo UGNIES KAMUOLYS visada bus klavišas 1. Paspausk bet kurį klavišą, kad tęstum.', 'Paspausk klavišą', '#ff8a3a');
}
addEventListener('keydown', e => {
  if (FB.picking) {
    if (e.code === 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); return; }
    FB.picking = false; Q25.key = 'Digit1'; Q25.stage = 'done'; saveQ25(); hideCard(); fireKeyRow(); e.stopImmediatePropagation(); e.preventDefault();
    Q24.done = Math.max(Q24.done, 1); saveQ24(); if (ST.board) { ST.board.material.map = boardTex(); ST.board.material.needsUpdate = true; }
    bigBanner('1 ĮSAKYMAS ĮVYKDYTAS!', 'Ugnies kamuolys – klavišas 1');
    setTimeout(() => toast('Išbandyk!', `Spausk 1 – ir iš tavo rankų išskris ugnies kamuolys. Veikia visur!`, '#ff8a3a'), 2500);
    return;
  }
  if (Q25.key && e.code === Q25.key && !e.repeat && started && !card && !mPhoneOpen && !cinema && mode !== 'attract' && mode !== 'dig') throwFireball();
}, true);
// ---------- the fireball power ----------
{ const _r = renderer.render.bind(renderer); renderer.render = (s, c) => { if (c === camera) FB.lastScene = s; _r(s, c); }; }
function throwFireball() {
  const sc = FB.lastScene; if (!sc) return;
  const up = player.up.clone(), dir = player.fwd.clone().addScaledVector(up, Math.sin(player.pitch) * -0.3).normalize();
  const b = new THREE.Group(); b.add(S(G.sph, bmat(0xffe14d), 0.35, 0.35, 0.35)); b.add(S(G.sph, bmat(0xff6a1a, { transparent: true, opacity: 0.6 }), 0.6, 0.6, 0.6));
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xff7a1a, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(2.6); b.add(gl);
  b.position.copy(player.pos).addScaledVector(up, 1.3).addScaledVector(player.fwd, 0.8); sc.add(b);
  FB.balls.push({ b, sc, v: dir.multiplyScalar(28), t: 0 }); hands.R.hold = true; setTimeout(() => { hands.R.hold = false; }, 200);
  noiseHit(0.35, { ft: 'bandpass', f: 700, vol: 0.12 }); tone(220, 0.3, { to: 110, type: 'sawtooth', vol: 0.05, lp: 1200 });
}
fx.push(function fireballFx(dt) {
  for (let i = FB.balls.length - 1; i >= 0; i--) {
    const f = FB.balls[i]; f.t += dt; f.b.position.addScaledVector(f.v, dt); f.b.rotation.y += dt * 8; f.b.children[1].scale.setScalar(0.6 + Math.sin(f.t * 30) * 0.08);
    if (Math.random() < dt * 40) { const s = S(G.sph, bmat(pick([0xff8a1a, 0xffd23a, 0xff3a1a]), { transparent: true, opacity: 0.8 }), 0.18, 0.18, 0.18); s.position.copy(f.b.position); f.sc.add(s); let life = 0.4; fx.push(d => { life -= d; s.scale.multiplyScalar(1 - d * 2); s.position.y += d * 1.5; if (life <= 0) { f.sc.remove(s); return false; } return true; }); }
    if (f.t > 1.6) { FB.balls.splice(i, 1); f.sc.remove(f.b); fireBoom(f.sc, f.b.position); }
  }
  return true;
});
function fireBoom(sc, p) {
  noiseHit(0.5, { f: 500, fto: 80, vol: 0.12 });
  for (let i = 0; i < 14; i++) { const s = S(G.sph, bmat(pick([0xff8a1a, 0xffd23a, 0xff3a1a]), { transparent: true, opacity: 0.85 }), 0.3, 0.3, 0.3); s.position.copy(p); sc.add(s); const v = randDir().multiplyScalar(rr(3, 7)); let life = 0.6; fx.push(d => { life -= d; s.position.addScaledVector(v, d); s.scale.multiplyScalar(1 + d); s.material.opacity = Math.max(0, life); if (life <= 0) { sc.remove(s); return false; } return true; }); }
}
function fireKeyRow() {
  const k = $('keys'); if (!k || !Q25.key) return; let r = $('fireRow'); if (!r) { r = document.createElement('span'); r.id = 'fireRow'; const lab = document.createElement('span'); lab.id = 'fireLab'; const hEl = [...k.children].find(c => c.innerHTML.includes('<kbd>H</kbd>')); k.insertBefore(lab, hEl || null); k.insertBefore(r, lab); }
  r.innerHTML = `<kbd>${keyLabel(Q25.key)}</kbd>`; $('fireLab').textContent = '🔥 ugnies kamuolys';
}
setTimeout(fireKeyRow, 0);
// ---------- a small checklist while hunting ----------
{ const _u = updateStar; updateStar = (dt, t) => { _u(dt, t);
    if (!FB.hud) { const d = document.createElement('div'); d.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);background:rgba(40,16,8,.82);color:#ffe8d0;border:1px solid rgba(255,138,58,.45);border-radius:14px;padding:7px 16px;font:600 14px system-ui,sans-serif;z-index:5;pointer-events:none;text-align:center'; document.body.appendChild(d); FB.hud = d; }
    const show = Q25.stage === 'hunt' && !card; FB.hud.hidden = !show;
    if (show) { const c = b => b ? '✅' : '⬜'; FB.hud.innerHTML = `🔥 1 įsakymas: Ugnies kamuolys<br>${c(Q25.mixer)} aparatas · ${c(Q25.match)} degtukas · ${c(Q25.jar)} stiklainis · ${c(Q25.hairs >= 5)} plaukai ${Q25.hairs}/5`; }
    if (!card && Q25.stage === 'hunt') { if (nearMatch()) setPrompt('<kbd>E</kbd> paimti degtuką'); else if (nearMixer()) setPrompt(Q25.elixir ? '<kbd>E</kbd> išgerti eliksyrą' : fireHave() ? '<kbd>E</kbd> maišyti eliksyrą' : '<kbd>E</kbd> apžiūrėti maišymo aparatą'); else if (nearStarKid() && Q25.hairs < 5) setPrompt('<kbd>E</kbd> pasiūlyti pinigų už žvaigždės plaukelį'); }
  }; }
{ const _m = d => { if (FB.hud && mode !== 'star') FB.hud.hidden = true; return true; }; fx.push(_m); }
function fireTest(n) {
  if (mode !== 'star') { hideCard(); enterStar(); } Q24.met = true; saveQ24(); Q25.stage = 'hunt'; refreshFireQuest();
  if (n >= 1) { Q25.mixer = Q25.match = Q25.jar = true; Q25.hairs = 5; } saveQ25(); refreshFireQuest();
  toast('Bandymų pasaulis: ugnies kamuolys', n >= 1 ? 'Viską turi – eik prie aparato urve' : fireLeft(), '#ff8a3a');
}

// the powers always use the keys 1 (fire), 2 (teleport) and 3 (lightning)
if (Q25.key && Q25.key !== 'Digit1') { Q25.key = 'Digit1'; saveQ25(); }
