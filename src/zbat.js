// ================= The Star Goddess – commandment 5 (the last): the GREAT BAT =================
// In the underground star cave lives a giant bat boss: 1000 HP. You have 100 HP.
// Fireball (1): 5/10/20/30/35 · Lightning (3): 20/30 · Sword hit (mouse, sword out): 10 · Golden wave (right mouse): 50.
// The bat hits you for 1–5. When it is beaten it turns into a skeleton – and the goddess is not a skeleton any more:
// "He turned me into a skeleton and took my body. But I am a human."
const Q29 = { stage: 'none' };   // none | fight | done
try { const s = JSON.parse(localStorage.getItem('modly-quest29') || 'null'); if (s) Object.assign(Q29, s); } catch (_) { }
function saveQ29() { try { localStorage.setItem('modly-quest29', JSON.stringify(Q29)); } catch (_) { } }
const BAT = { m: null, hp: 1000, max: 1000, php: 100, state: 'circle', t: 0, a: 0, hitCd: 0, shotT: 3, shots: [], hud: null, dead: false, waves: [], human: null };
const BAT_C = () => new V3(UGC.x, UGC.y, UGC.z);
function makeBat() {
  const g = new THREE.Group(), fur = mat(0x2a1a3a, { roughness: 0.9 }), skin = mat(0x4a2a5a, { roughness: 0.7, side: THREE.DoubleSide });
  g.add(S(G.sph, fur, 1.1, 1.3, 1.0, 0, 0, 0)); const head = new THREE.Group(); head.position.set(0, 1.2, 0.5); g.add(head);
  head.add(S(G.sph, fur, 0.75, 0.7, 0.7)); for (const x of [-0.4, 0.4]) { head.add(S(G.cone, fur, 0.25, 0.8, 0.15, x, 0.75, -0.05).rotateZ(-x * 0.5)); head.add(S(G.sph, bmat(0xff2a2a), 0.13, 0.1, 0.06, x * 0.6, 0.12, 0.62)); }
  for (const x of [-0.15, 0.15]) head.add(S(G.cone, mat(0xffffff), 0.05, 0.22, 0.05, x, -0.38, 0.55).rotateX(Math.PI));
  const wings = []; for (const sx of [-1, 1]) { const w = new THREE.Group(); w.position.set(sx * 0.8, 0.4, 0); g.add(w);
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(sx * 1.8, 1.0); sh.lineTo(sx * 3.6, 0.6); sh.lineTo(sx * 4.4, -0.4); sh.lineTo(sx * 3.4, -0.6); sh.lineTo(sx * 2.8, -1.4); sh.lineTo(sx * 1.8, -0.8); sh.lineTo(sx * 1.0, -1.6); sh.lineTo(0, -0.6);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), skin); m.rotation.x = Math.PI / 2; w.add(m); for (let k = 1; k <= 3; k++) { const b = S(G.cyl, fur, 0.06, 1.9, 0.06, sx * k * 1.1, 0, -0.1 + (k === 2 ? 0.2 : 0)); b.rotation.z = sx * Math.PI / 2.4; w.add(b); } wings.push({ w, sx }); }
  g.scale.setScalar(2.2); g.userData = { wings, head }; return g;
}
function makeBatSkeleton() {
  const g = new THREE.Group(), bone = mat(0xf4eedc, { roughness: 0.6 });
  g.add(S(G.sph, bone, 0.6, 0.55, 0.6, 0, 0.6, 0)); for (const x of [-0.25, 0.25]) g.add(S(G.sph, bmat(0x1a1428), 0.14, 0.15, 0.06, x, 0.65, 0.55));
  for (let i = 0; i < 8; i++) g.add(S(G.cyl, bone, 0.08, 0.2, 0.08, 0, -0.1 - i * 0.22, 0));
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) { const b = S(G.cyl, bone, 0.05, 2.4, 0.05, sx * (0.8 + k * 0.7), -0.2 - k * 0.15, 0); b.rotation.z = sx * (Math.PI / 2.2 - k * 0.2); g.add(b); }
  g.scale.setScalar(2.2); return g;
}
// ---------- the goddess as a human (after the bat is beaten) ----------
function buildHumanGoddess() {
  if (BAT.human || !ST.goddess) return;
  const g = new THREE.Group(); g.position.set(0, 1.3, 0); g.scale.setScalar(2.8); ST.goddess.add(g); BAT.human = g;
  const skin = mat(0xf2c8a8, { roughness: 0.6 }), dress = mat(0x2a2a8a, { roughness: 0.5, emissive: 0x0a0a3a }), gold = mat(0xffd23a, { metalness: 0.7, emissive: 0x4a3a00 });
  g.add(new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.5, 20), dress).translateY(0.85));
  for (let i = 0; i < 14; i++) { const s2 = new THREE.Mesh(STAR_GEO, bmat(0xffe88a)); s2.scale.setScalar(0.07); const a = rr(0, 6.28), y = rr(0.2, 1.4), r = 0.42 * (1 - (y - 0.1) / 1.5) + 0.02; s2.position.set(Math.cos(a) * r, y, Math.sin(a) * r); g.add(s2); }
  g.add(S(G.sph, dress, 0.22, 0.22, 0.16, 0, 1.62, 0)); g.add(S(G.cyl, skin, 0.06, 0.12, 0.06, 0, 1.82, 0));
  const head = new THREE.Group(); head.position.set(0, 2.08, 0); g.add(head); BAT.hHead = head;
  head.add(S(G.sph, skin, 0.25, 0.28, 0.25));
  for (const x of [-0.09, 0.09]) { head.add(S(G.sph, bmat(0xffffff), 0.05, 0.05, 0.03, x, 0.03, 0.22)); head.add(S(G.sph, bmat(0x2a5a9a), 0.03, 0.03, 0.02, x, 0.03, 0.245)); }
  head.add(mesh(new THREE.TorusGeometry(0.06, 0.012, 5, 10, Math.PI), bmat(0xc8506a), 0, -0.1, 0.23).rotateZ(Math.PI));
  for (const x of [-0.14, 0.14]) head.add(S(G.sph, bmat(0xff9ab0, { transparent: true, opacity: 0.5 }), 0.04, 0.025, 0.02, x, -0.04, 0.21));
  const hairM = mat(0xcfe0ff, { emissive: 0x5a6aaa, emissiveIntensity: 0.8, roughness: 0.4 });
  head.add(S(G.sph, hairM, 0.27, 0.22, 0.27, 0, 0.1, -0.03));
  for (let i = 0; i < 18; i++) { const a = -1.7 + (i / 17) * 3.4, st = new THREE.Group(); st.position.set(Math.sin(a) * 0.24, 0.12, -Math.cos(a) * 0.24); head.add(st); const L = rr(0.9, 1.3); st.add(S(G.cyl, hairM, 0.035, L, 0.035, 0, -L / 2, 0)); st.rotation.x = 0.1 + Math.cos(a) * 0.1; }
  for (let i = 0; i < 7; i++) { const a = -0.9 + i * 0.3, s2 = new THREE.Mesh(STAR_GEO, bmat(0xffe14d)); s2.scale.setScalar(0.14); s2.position.set(Math.sin(a) * 0.22, 0.3 + Math.cos(a) * 0.03, Math.cos(a) * 0.12); head.add(s2); }
  for (const sx of [-1, 1]) { const arm = new THREE.Group(); arm.position.set(sx * 0.22, 1.6, 0); g.add(arm); limb(arm, skin, new V3(0, 0, 0), new V3(sx * 0.15, -0.5, 0.1), 0.045); arm.add(S(G.sph, skin, 0.05, 0.05, 0.05, sx * 0.15, -0.52, 0.1)); if (sx > 0) { limb(arm, gold, new V3(0.15, -0.5, 0.12), new V3(0.18, 0.1, 0.2), 0.018); const w = new THREE.Mesh(STAR_GEO, bmat(0xffe14d)); w.scale.setScalar(0.25); w.position.set(0.19, 0.17, 0.2); arm.add(w); } }
  linearize(g);
}
function refreshGoddessForm() { if (!ST.gBody) return; const human = Q29.stage === 'done'; if (human) buildHumanGoddess(); ST.gBody.visible = !human; if (BAT.human) BAT.human.visible = human; }
{ const _b = buildStar; buildStar = () => { const first = !ST.built; _b(); if (first) refreshGoddessForm(); }; }
// ---------- damage numbers ----------
function batNum(pos, txt, col) {
  const c = document.createElement('canvas'); c.width = 200; c.height = 70; const x = c.getContext('2d'); x.font = "bold 50px 'Lilita One', sans-serif"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 7; x.strokeStyle = '#000'; x.strokeText(txt, 100, 36); x.fillStyle = col; x.fillText(txt, 100, 36);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false })); s.scale.set(2.6, 0.9, 1); stScene.add(s);
  let t = 0; fx.push(dt => { t += dt; s.position.copy(pos).add(new V3(0, 1 + t * 1.6, 0)); s.material.opacity = Math.max(0, 1 - t); if (t > 1) { stScene.remove(s); return false; } return true; });
}
const batOn = () => Q29.stage === 'fight' && mode === 'star' && isUnder() && !BAT.dead;
function batHit(n, from) {
  if (!batOn() || !BAT.m) return; BAT.hp = Math.max(0, BAT.hp - n); batNum(BAT.m.position.clone().add(new V3(0, 2, 0)), '-' + n, n >= 30 ? '#ffd23a' : '#ffffff');
  BAT.m.userData.flash = 0.15; tone(200 + n * 6, 0.1, { type: 'square', vol: 0.05, lp: 1500 }); void from;
  if (BAT.hp <= 0) batDie();
}
function playerHurt(n) {
  if (BAT.dead || cinema || transitioning) return; BAT.php = Math.max(0, BAT.php - n); batNum(player.pos.clone().add(new V3(0, 1.5, 0)), '-' + n, '#ff5a5a'); redFlash('rgba(255,40,40,.35)', 200); shake = Math.max(shake, 0.3);
  if (BAT.php <= 0) { transitioning = true; fadeTo(() => { transitioning = false; BAT.php = 100; BAT.hp = Math.min(BAT.max, BAT.hp + 250); BAT.state = 'circle'; player.pos.set(UGC_EXIT.x + 2.5, UGC.y, UGC_EXIT.z); player.vel.set(0, 0, 0); toast('Šikšnosparnis tave nugalėjo…', 'Tu vėl prie kopėčių su 100 gyvybių. Šikšnosparnis atsigavo 250 gyvybių. Bandyk dar!', '#b03ad8'); }); }
}
// ---------- weapons hit the bat ----------
{ const _h = starHand; starHand = side => {   // sword hit (mouse) when the sword is out
    if (batOn() && Q28.stage === 'done' && Q28.out && side === 'L') { hands[side].hold = true; GS.swing = 0.3; tone(700, 0.08, { to: 300, type: 'triangle', vol: 0.05 });
      if (BAT.m && BAT.m.position.distanceTo(player.pos.clone().add(new V3(0, 1, 0))) < 5) batHit(10, 'sword'); return; }
    return _h(side);
  }; }
{ const _b = doBolt; doBolt = () => { const before = boltReadyAt; _b(); if (boltReadyAt === before || !batOn() || !BAT.m) return;
    const p = player.pos.clone().addScaledVector(new V3(player.fwd.x, 0, player.fwd.z).normalize(), 10);
    if (Math.hypot(BAT.m.position.x - p.x, BAT.m.position.z - p.z) < 6) batHit(pick([20, 30]), 'bolt'); }; }
{ const _g = goldSlash; goldSlash = () => { const before = GS.slashReady; _g(); if (GS.slashReady === before || !batOn()) return;
    BAT.waves.push({ p: player.pos.clone().add(new V3(0, 1.1, 0)), f: new V3(player.fwd.x, 0, player.fwd.z).normalize(), t: 0, done: false }); }; }
// ---------- the Star Goddess gives the last commandment ----------
{ const _a = starAction; starAction = () => {
    if (card) return _a();
    if (nearStarGoddess() && Q28.stage === 'done' && Q29.stage !== 'done') {
      if (Q29.stage === 'none') { startTalk('Žvaigždžių Dievė', ['Paskutinis, PENKTASIS įsakymas: DIDYSIS ŠIKŠNOSPARNIS.', 'Giliai mano urve atsirado milžiniškas šikšnosparnis. Jis… jis man labai baisus. Jis turi 1000 gyvybių.', 'Tu turėsi 100 gyvybių. Naudok viską: ugnies kamuolį (1), žaibą (3) ir auksinį kardą (4 – išsitraukti, pelė – kirsti, dešinys pelės – banga).', 'Nugalėk jį… ir tada suprasi, kodėl aš tokia, kokia esu.'], '#ffe8a0', () => { Q29.stage = 'fight'; saveQ29(); BAT.hp = BAT.max; BAT.php = 100; toast('5 įsakymas: Didysis šikšnosparnis', 'Lipk žemyn į Žvaigždžių urvą', '#b03ad8'); }); return; }
      startTalk('Žvaigždžių Dievė', ['Didysis šikšnosparnis vis dar mano urve… Būk atsargus.'], '#ffe8a0'); return;
    }
    return _a();
  }; }
// ---------- the fight, every frame ----------
{ const _u = updateStar; updateStar = (dt, t) => { _u(dt, t);
    if (!BAT.hud) { const d = document.createElement('div'); d.style.cssText = 'position:fixed;top:96px;left:50%;transform:translateX(-50%);width:min(520px,80vw);background:rgba(20,8,30,.85);color:#f0d8ff;border:1px solid rgba(176,58,216,.6);border-radius:14px;padding:8px 14px;font:700 14px system-ui,sans-serif;z-index:5;pointer-events:none'; document.body.appendChild(d); BAT.hud = d; }
    const on = batOn(); BAT.hud.hidden = !on || !!card;
    if (Q29.stage !== 'fight') return;
    if (on && !BAT.m) { BAT.m = makeBat(); stScene.add(BAT.m); linearize(BAT.m); BAT.m.position.copy(BAT_C()).add(new V3(10, 8, 0)); toast('🦇 DIDYSIS ŠIKŠNOSPARNIS!', 'Jis turi 1000 gyvybių. Tu – 100. Kovok!', '#b03ad8'); noiseHit(1, { f: 3000, fto: 600, vol: 0.2 }); }
    if (!BAT.m) return; BAT.m.visible = on;
    if (!on) return;
    const m = BAT.m, c = BAT_C(), u = m.userData; BAT.t += dt; BAT.hitCd -= dt;
    u.wings.forEach(({ w, sx }) => { w.rotation.z = sx * Math.sin(t * 9) * 0.6; });
    if (u.flash > 0) { u.flash -= dt; m.scale.setScalar(2.2 * (1 + u.flash)); } else m.scale.setScalar(2.2);
    if (BAT.state === 'circle') { BAT.a += dt * 0.5; const tg = c.clone().add(new V3(Math.cos(BAT.a) * 12, 7 + Math.sin(t * 1.3) * 1.5, Math.sin(BAT.a) * 12)); m.position.lerp(tg, Math.min(1, dt * 2)); if (BAT.t > rr(4, 6)) { BAT.state = 'swoop'; BAT.t = 0; BAT.sw = player.pos.clone().add(new V3(0, 1.4, 0)); tone(1800, 0.4, { to: 400, type: 'sawtooth', vol: 0.05, lp: 3000 }); } }
    else if (BAT.state === 'swoop') { m.position.lerp(BAT.sw, Math.min(1, dt * 2.4)); if (BAT.t > 1.6) { BAT.state = 'low'; BAT.t = 0; } }
    else if (BAT.state === 'low') { const tg = player.pos.clone().add(new V3(Math.sin(t) * 3, 2, Math.cos(t) * 3)); m.position.lerp(tg, Math.min(1, dt * 1.5)); if (BAT.t > 3) { BAT.state = 'circle'; BAT.t = 0; } }
    m.lookAt(player.pos.x, m.position.y, player.pos.z);
    // touching you hurts (1–5)
    if (m.position.distanceTo(player.pos.clone().add(new V3(0, 1, 0))) < 3.4 && BAT.hitCd <= 0) { BAT.hitCd = 0.9; playerHurt(1 + Math.floor(Math.random() * 5)); }
    // sound waves
    BAT.shotT -= dt; if (BAT.shotT < 0) { BAT.shotT = rr(2, 3.5); const r = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.08, 6, 20), bmat(0xd88aff, { transparent: true, opacity: 0.8 })); r.position.copy(m.position); stScene.add(r); BAT.shots.push({ r, v: player.pos.clone().add(new V3(0, 1.2, 0)).sub(m.position).normalize().multiplyScalar(11), life: 4 }); tone(2400, 0.15, { to: 1200, type: 'sine', vol: 0.03 }); }
    for (let i = BAT.shots.length - 1; i >= 0; i--) { const s = BAT.shots[i]; s.life -= dt; s.r.position.addScaledVector(s.v, dt); s.r.lookAt(s.r.position.clone().add(s.v)); s.r.scale.multiplyScalar(1 + dt * 0.6);
      if (s.r.position.distanceTo(player.pos.clone().add(new V3(0, 1.1, 0))) < 1.6) { playerHurt(1 + Math.floor(Math.random() * 5)); s.life = 0; }
      if (s.life <= 0) { stScene.remove(s.r); BAT.shots.splice(i, 1); } }
    // fireballs
    for (const f of FB.balls) { if (f.sc !== stScene || f.t > 5) continue; const d = f.b.position.clone().sub(m.position); if (Math.hypot(d.x, d.z) < 3.6 && Math.abs(d.y) < 6) { f.t = 99; batHit(pick([5, 10, 20, 30, 35]), 'fire'); } }
    // golden waves
    for (const w of BAT.waves) { if (w.done) continue; w.t += dt; const p = w.p.clone().addScaledVector(w.f, w.t * 22); if (Math.hypot(p.x - m.position.x, p.z - m.position.z) < 4 && Math.abs(p.y - m.position.y) < 7) { w.done = true; batHit(50, 'wave'); } if (w.t > 0.7) w.done = true; }
    BAT.waves = BAT.waves.filter(w => !w.done);
    const hp = BAT.hp / BAT.max, pp = BAT.php / 100;
    BAT.hud.innerHTML = `<div style="display:flex;justify-content:space-between"><span>🦇 Didysis šikšnosparnis</span><span>${BAT.hp} / ${BAT.max}</span></div><div style="height:12px;background:#3a1a4a;border-radius:6px;overflow:hidden;margin:3px 0 7px"><div style="height:100%;width:${hp * 100}%;background:linear-gradient(90deg,#b03ad8,#ff5ad8)"></div></div><div style="display:flex;justify-content:space-between"><span>💚 Tu</span><span>${BAT.php} / 100</span></div><div style="height:10px;background:#1a3a1a;border-radius:6px;overflow:hidden;margin-top:3px"><div style="height:100%;width:${pp * 100}%;background:${pp < 0.3 ? '#ff5a5a' : '#5ae85a'}"></div></div><div style="opacity:.75;font-weight:500;font-size:12px;margin-top:5px">1 ugnis · 3 žaibas · 4 kardas (pelė – kirsti, dešinys – banga)</div>`;
  }; }
// ---------- the bat is beaten: it turns into a skeleton, the goddess becomes a human ----------
function batDie() {
  BAT.dead = true; const m = BAT.m, sk = makeBatSkeleton(); linearize(sk); sk.position.copy(m.position); sk.visible = false; stScene.add(sk); BAT.shots.forEach(s => stScene.remove(s.r)); BAT.shots = [];
  hideCard(); for (const k in keys) keys[k] = false; let t = 0; BAT.hud.hidden = true;
  cinema = dt => { t += dt;
    camera.position.lerp(_ct.copy(m.position).add(new V3(8, 3, 8)), Math.min(1, dt * 2)); camera.lookAt(m.position);
    if (t < 2) { m.rotation.y += dt * (2 + t * 6); m.position.y += Math.sin(t * 30) * 0.05; if (Math.random() < dt * 15) zapLine(stScene, m.position, m.position.clone().add(randDir().multiplyScalar(4)), 0xd88aff, 0.1); }
    else if (!sk.visible) { m.visible = false; sk.visible = true; redFlash('rgba(255,255,255,.9)', 500); noiseHit(1, { f: 600, fto: 80, vol: 0.25 }); }
    else { sk.position.y = Math.max(UGC.y + 1, sk.position.y - dt * 6); sk.rotation.y += dt * 0.5; }
    if (t > 4.2 && !transitioning) { transitioning = true; fadeTo(() => { transitioning = false; stScene.remove(m); Q29.stage = 'done'; saveQ29(); refreshGoddessForm(); goddessReveal(sk); }); }
  };
}
function goddessReveal(sk) {
  player.pos.set(0, 0, 9); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); $('bName').textContent = 'Žvaigždė'; let t = 0;
  cinema = dt => { t += dt; camera.position.lerp(_ct.set(4, 6, 16), Math.min(1, dt * 1.5)); camera.lookAt(0, 6, 0); if (BAT.human) BAT.human.rotation.y = Math.sin(t) * 0.1;
    if (t > 2.5) { cinema = null;
      startTalk('Tu', ['Žvaigždžių Dieve… tu nebe skeletas?! Kas čia buvo?!'], '#7dff6b', () =>
        startTalk('Žvaigždžių Dievė', ['Tas didysis šikšnosparnis… jis mane pavertė SKELETU ir pasiėmė mano kūną.', 'Bet aš esu ŽMOGUS. Visada buvau.', 'Tu jį nugalėjai, ir mano kūnas sugrįžo. Ačiū tau, mažasis žaliasis… Tu įvykdei VISUS penkis mano įsakymus.'], '#ffe8a0', () => {
          Q24.done = 5; saveQ24(); if (ST.board) { ST.board.material.map = boardTex(); ST.board.material.needsUpdate = true; } addMoney(10000);
          bigBanner('VISI 5 ĮSAKYMAI ĮVYKDYTI!', 'Žvaigždžių Dievė vėl žmogus · +10 000 €'); [262, 330, 392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.07, when: i * 0.12 })); })); }
  };
  void sk;
}
function batTest(n) {
  swordTest(2); Q28.stage = 'done'; Q28.key = 'Digit4'; Q28.out = true; saveQ28(); refreshGoldHeld(); swordKeyRow(); fireKeyRow(); teleKeyRow(); boltKeyRow();
  Q29.stage = n >= 2 ? 'done' : n >= 1 ? 'fight' : 'none'; saveQ29(); refreshGoddessForm(); BAT.hp = BAT.max; BAT.php = 100; BAT.dead = Q29.stage === 'done';
  if (n === 1) { player.pos.set(UGC_EXIT.x + 2.5, UGC.y, UGC_EXIT.z); player.fwd.set(1, 0, 0); } else player.pos.set(0, 0, 9);
  toast('Bandymų pasaulis: Didysis šikšnosparnis', ['Kalbėk su Dieve (E)', 'Kova urve!', 'Dievė jau žmogus'][Math.min(2, n | 0)], '#b03ad8');
}
// ---------- test world (one time): everything before is done – straight to the Great Bat fight ----------
{ let done = true;   // test-world jump switched off (batjump)
  fx.push(() => {
    if (done || !started || mode === 'attract' || card || cinema || transitioning) return true;
    done = true; try { localStorage.setItem('modly-batjump', '1'); } catch (_) { }
    if (Q29.stage === 'done' || Date.now() > Date.UTC(2026, 10, 30)) return true;
    setTimeout(() => { try { hideCard(); batTest(1); Q24.done = Math.max(Q24.done, 4); saveQ24(); if (ST.board) { ST.board.material.map = boardTex(); ST.board.material.needsUpdate = true; } } catch (e) { console.error(e); } }, 600); return true; }); }
