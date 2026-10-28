// ================= Teleportation – step 8: the PORTAL RACE, then the TELEPORTATION POWER =================
// With 7 things in the Teleportation corner, stand in its middle and press E. 8 purple portals appear one after another
// all over the star – reach each one before it fades (the time gets shorter!). Win → the TELEPORT CRYSTAL appears on the
// 8th pedestal, all 8 things fly into you, and you choose a key: it teleports you forward – everywhere, in every world.
Q26.crystal = !!Q26.crystal; Q26.key = Q26.key || null;
{ const _c = teleCount; teleCount = () => _c() + (Q26.crystal ? 1 : 0); }
const PR = { on: false, i: 0, t: 0, ring: null, spots: [], hud: null, picking: false };
const PORTAL_N = 8, PORTAL_T = [20, 20, 20, 20, 20, 20, 20, 20];
function makeCrystal() {
  const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), mat(0xb05aff, { emissive: 0x6a2aff, emissiveIntensity: 0.9, transparent: true, opacity: 0.9, metalness: 0.3 })); c.scale.y = 1.6; c.position.y = 0.9; g.add(c); g.userData.c = c;
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xb05aff, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(2.6); gl.position.y = 0.9; g.add(gl); return g;
}
function makePortalRing() {
  const g = new THREE.Group();
  const r = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.22, 10, 40), bmat(0xc85aff)); r.position.y = 2.6; g.add(r); g.userData.r = r;
  const inner = new THREE.Mesh(new THREE.CircleGeometry(2.0, 32), new THREE.MeshBasicMaterial({ color: 0x8a3aff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })); inner.position.y = 2.6; g.add(inner);
  g.add(S(G.cyl, bmat(0xd88aff, { transparent: true, opacity: 0.15, depthWrite: false }), 0.6, 60, 0.6, 0, 30, 0));   // a beam you can see from far away
  return g;
}
{ const _r = refreshTeleCorner; refreshTeleCorner = () => { _r(); if (Q26.crystal && TP.slots && Q26.stage !== 'done') TP.slots[7].add(makeCrystal()); }; }
const atCornerMid = () => TP.corner && !isUnder() && Math.hypot(player.pos.x - TP_CORNER.x, player.pos.z - TP_CORNER.z) < 3;
const sevenThere = () => Q26.berry && Q26.plant && Q26.plum && Q26.permit && Q26.card && Q26.tube && Q26.pod;
function portalPlace() {
  // each portal is 25–60 m from the previous one, somewhere on the star (not inside the danger zone)
  const prev = PR.i === 0 ? TP_CORNER : PR.spots[PR.i - 1]; const p = new V3();
  for (let k = 0; k < 60; k++) { raySpot(p); p.y = 0; const d = Math.hypot(p.x - prev.x, p.z - prev.z); if (d > 25 && d < 60) break; }
  PR.spots[PR.i] = p.clone(); PR.ring.position.copy(p); PR.ring.visible = true; PR.t = PORTAL_T[PR.i];
  tone(660 + PR.i * 80, 0.2, { type: 'sine', vol: 0.05 });
}
function startPortalRace() {
  if (!PR.ring) { PR.ring = makePortalRing(); stScene.add(PR.ring); }
  PR.on = true; PR.i = 0; PR.spots = []; portalPlace();
  toast('Portalų lenktynės prasidėjo! 🌀', 'Bėk (Shift) į violetinį portalą – sek šviesos stulpą!', '#c85aff');
}
function portalFail() { PR.on = false; PR.ring.visible = false; redFlash('rgba(176,90,255,.6)', 400); telePuff(stScene, player.pos); player.pos.set(TP_CORNER.x, 0, TP_CORNER.z + 1.5); player.vel.set(0, 0, 0); player.vr = 0; player.mesh.position.copy(player.pos); telePuff(stScene, player.pos); tone(300, 0.5, { to: 120, type: 'triangle', vol: 0.06 }); toast('Portalas užgeso! 💨', `Pasiekei ${PR.i} iš ${PORTAL_N}. Tave nuteleportavo atgal į Teleportacijos kampą – spausk E ir bandyk iš naujo`, '#c85aff'); }
function portalWin() {
  PR.on = false; PR.ring.visible = false; Q26.crystal = true; saveQ26(); refreshTeleCorner();
  bigBanner('VISI 8 PORTALAI!', 'Teleporto kristalas atsirado Teleportacijos kampe');
  setTimeout(() => toast('Žingsnis 8 iš 8!', 'Grįžk į Teleportacijos kampą ir stok į vidurį (E) – visi daiktai laukia tavęs', '#c85aff'), 2600);
}
// the final ritual: all 8 things fly into you
function teleRitual() {
  hideCard(); for (const k in keys) keys[k] = false; let t = 0; const items = TP.slots.map(s => s.children[0]).filter(Boolean), start = items.map(m => m.getWorldPosition(new V3()));
  items.forEach(m => { const w = m.getWorldPosition(new V3()); m.parent.remove(m); m.position.copy(w); stScene.add(m); });
  toast('Teleportacijos ritualas…', 'Visi 8 daiktai skrenda į tave', '#c85aff');
  cinema = dt => {
    t += dt; const c = player.pos.clone().add(new V3(0, 1.2, 0));
    items.forEach((m, i) => { const k = Math.min(1, Math.max(0, (t - 0.8 - i * 0.25) / 1.2)), a = t * 3 + i; const from = start[i].clone().add(new V3(0, Math.sin(k * Math.PI) * 4, 0)); m.position.lerpVectors(from, c, k * k); m.position.x += Math.cos(a) * (1 - k) * 0.5; m.rotation.y += dt * 4; m.scale.setScalar(Math.max(0.01, 1 - k * 0.9)); if (k >= 1) m.visible = false; });
    if (Math.random() < dt * 10) tone(rr(600, 1600), 0.08, { type: 'sine', vol: 0.03 });
    camera.position.lerp(_ct.copy(player.pos).add(new V3(7, 5, 7)), Math.min(1, dt * 2)); camera.lookAt(c);
    if (t > 4.6) { cinema = null; items.forEach(m => stScene.remove(m)); redFlash('rgba(200,120,255,.9)', 700); shake = Math.max(shake, 0.6); [523, 784, 1047, 1568].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.06, when: i * 0.1 }));
      PR.picking = true; card = { kind: 'keypick' };
      showCard('🌀 Teleportacija tavyje!', 'Tavo TELEPORTACIJA visada bus klavišas 2. Paspausk bet kurį klavišą, kad tęstum.', 'Paspausk klavišą', '#c85aff'); }
  };
}
addEventListener('keydown', e => {
  if (PR.picking) {
    e.stopImmediatePropagation(); e.preventDefault();
    if (e.code === 'Escape') return;
    PR.picking = false; Q26.key = 'Digit2'; Q26.stage = 'done'; saveQ26(); hideCard(); teleKeyRow(); refreshTeleCorner();
    Q24.done = Math.max(Q24.done, 2); saveQ24(); if (ST.board) { ST.board.material.map = boardTex(); ST.board.material.needsUpdate = true; }
    bigBanner('2 ĮSAKYMAS ĮVYKDYTAS!', 'Teleportacija – klavišas 2');
    setTimeout(() => toast('Išbandyk!', `Spausk 2 – ir akimirksniu atsidursi 12 m priekyje. Galima kas 3 sekundes. Veikia visur!`, '#c85aff'), 2500);
    return;
  }
  if (Q26.key && e.code === Q26.key && !e.repeat && started && !card && !mPhoneOpen && !cinema && mode !== 'attract' && mode !== 'dig') doTeleport();
}, true);
// ---------- the teleportation power ----------
function telePuff(sc, p) { for (let i = 0; i < 14; i++) { const s = S(G.sph, bmat(pick([0xb05aff, 0xd88aff, 0xffffff]), { transparent: true, opacity: 0.85 }), 0.16, 0.16, 0.16); s.position.copy(p).add(new V3(rr(-0.4, 0.4), rr(0.2, 2), rr(-0.4, 0.4))); sc.add(s); const v = randDir().multiplyScalar(rr(1, 3)); let life = 0.5; fx.push(d => { life -= d; s.position.addScaledVector(v, d); s.material.opacity = Math.max(0, life * 1.7); if (life <= 0) { sc.remove(s); return false; } return true; }); } }
let teleReadyAt = 0;
function doTeleport() {
  const now = performance.now();
  if (now < teleReadyAt) { const left = Math.ceil((teleReadyAt - now) / 1000); tone(220, 0.08, { type: 'square', vol: 0.03, lp: 900 }); toast('Teleportacija ilsisi…', `Vėl galėsi po ${left} s`, '#c85aff'); return; }
  teleReadyAt = now + 3000;
  const sc = FB.lastScene, from = player.pos.clone();
  if (mode === 'planet') { if (player.inCar) return; const d = player.pos.clone().normalize(); const nd = moveAlong(d, player.fwd, 12); player.pos.copy(nd).multiplyScalar(R + groundH(nd) + 0.3); player.up.copy(nd); player.fwd.copy(tangentToward(nd, player.fwd)); }
  else { player.pos.addScaledVector(new V3(player.fwd.x, 0, player.fwd.z).normalize(), 12); }
  player.vel.set(0, 0, 0); player.mesh.position.copy(player.pos);
  if (sc) { telePuff(sc, from); telePuff(sc, player.pos); }
  tone(1400, 0.15, { to: 300, type: 'sine', vol: 0.06 }); tone(300, 0.15, { to: 1400, type: 'sine', vol: 0.05, when: 0.12 });
}
function teleKeyRow() {
  const k = $('keys'); if (!k || !Q26.key) return; let r = $('teleRow'); if (!r) { r = document.createElement('span'); r.id = 'teleRow'; const lab = document.createElement('span'); lab.id = 'teleLab'; const hEl = [...k.children].find(c => c.innerHTML.includes('<kbd>H</kbd>')); k.insertBefore(lab, hEl || null); k.insertBefore(r, lab); }
  r.innerHTML = `<kbd>${keyLabel(Q26.key)}</kbd>`; $('teleLab').textContent = '🌀 teleportacija';
}
setTimeout(teleKeyRow, 0);
// ---------- talking & every frame ----------
{ const _a = starAction; starAction = () => {
    if (card) return _a();
    if (Q26.stage === 'steps' && atCornerMid() && !PR.on) {
      if (Q26.crystal) { teleRitual(); return; }
      if (!sevenThere()) { startTalk('Teleportacijos kampas', [`Čia dar trūksta daiktų: ${Q26.step} iš 7. Kai visi 7 bus ant pjedestalų – grįžk.`], '#c85aff'); return; }
      startTalk('Teleportacijos kampas', ['Septyni daiktai sužibo… Kampas dūzgia!', `8 ŽINGSNIS – PORTALŲ LENKTYNĖS. Ant žvaigždės atsiras ${PORTAL_N} portalai – vienas po kito. Kiekvieną turi pasiekti, kol neužgeso.`, 'Kiekvienam portalui turi po 20 sekundžių. Sek violetinį šviesos stulpą ir bėk (Shift)! Pasiruošęs?'], '#c85aff', () => startPortalRace()); return;
    }
    return _a();
  }; }
{ const _u = updateStar; updateStar = (dt, t) => { _u(dt, t);
    if (!PR.hud) { const d = document.createElement('div'); d.style.cssText = 'position:fixed;top:170px;left:50%;transform:translateX(-50%);background:rgba(36,8,48,.85);color:#f0d8ff;border:1px solid rgba(200,90,255,.5);border-radius:14px;padding:6px 18px;font:700 15px system-ui,sans-serif;z-index:5;pointer-events:none;text-align:center'; document.body.appendChild(d); PR.hud = d; }
    PR.hud.hidden = !PR.on || !!card; if (PR.on && TP.hud) TP.hud.hidden = true; PR.hud.style.top = "100px";
    if (PR.on && PR.ring) {
      PR.ring.userData.r.rotation.z += dt * 2; PR.ring.rotation.y = Math.atan2(player.pos.x - PR.ring.position.x, player.pos.z - PR.ring.position.z);
      if (!card && !cinema) PR.t -= dt;
      const dist = Math.hypot(player.pos.x - PR.ring.position.x, player.pos.z - PR.ring.position.z);
      PR.hud.innerHTML = `🌀 Portalas <b>${PR.i + 1}/${PORTAL_N}</b> · ⏱ <b style="color:${PR.t < 4 ? '#ff6a6a' : '#fff'}">${Math.max(0, PR.t).toFixed(1)} s</b> · ${Math.round(dist)} m`;
      PR.ring.scale.setScalar(0.7 + 0.3 * Math.min(1, PR.t / 4));
      if (dist < 2.4 && player.pos.y < 5) { telePuff(stScene, PR.ring.position); PR.i++; if (PR.i >= PORTAL_N) portalWin(); else portalPlace(); }
      else if (PR.t <= 0) portalFail();
    }
    if (TP.slots && TP.slots[7].children[0]) { const c = TP.slots[7].children[0].userData.c; if (c) c.rotation.y += dt * 1.5; }
    if (!card && Q26.stage === 'steps' && atCornerMid() && !PR.on && sevenThere()) setPrompt(Q26.crystal ? '<kbd>E</kbd> pradėti teleportacijos ritualą' : '<kbd>E</kbd> pradėti portalų lenktynes');
  }; }
fx.push(() => { if (PR.hud && mode !== 'star') PR.hud.hidden = true; return true; });
function portalTest(n) { podTest(0); Q26.pod = true; Q26.crystal = !!n; saveQ26(); refreshTele(); refreshPod(); player.pos.set(TP_CORNER.x, 0, TP_CORNER.z + 1); toast('Bandymų pasaulis: portalai', n ? 'Kristalas jau yra – spausk E ritualui' : 'Spausk E – portalų lenktynės', '#c85aff'); }

if (Q26.key && Q26.key !== 'Digit2') { Q26.key = 'Digit2'; saveQ26(); }
