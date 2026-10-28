// ================= SPEEDRUN (locked until you finish the game) =================
// A world of its own: ONE BIG CITY – no jobs, no shops, no portals, nothing else. A stopwatch runs.
// The Timer God gives 5 commandments – each one gives a part of a PLANE. Build it on the central plaza, fly up to the
// clouds and beat the STORM CLOUD BOSS: it shoots lightning, and when it gets tired it sinks down – then hit it
// (LMB, E or a fireball). 6 hits and it bursts! The clock stops and you become a GHOST next to the LEADERBOARD.
// Esc – leave the speedrun (at any time).
const SR = { on: false, phase: 'idle', t: 0, running: false, q: 0, cnt: 0, need: 1, objs: [], items: [], parts: [], hud: null, ringT: 0, ringI: 0, hp: 5, boss: null, final: 0, ghostMats: null, plane: null };
const SR_LB_KEY = 'modly-srlb';
const srUnlocked = () => { let f = false; try { f = localStorage.getItem('modly-srunlock') === '1'; } catch (_) { }
  if (!f && typeof portalReady === 'function' && portalReady()) { f = true; try { localStorage.setItem('modly-srunlock', '1'); } catch (_) { } } return f; };
const srL = (lt, en) => EN ? en : lt;
function srTime(t) { const m = Math.floor(t / 60), s = t % 60; return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`; }
function srBoard() { try { return JSON.parse(localStorage.getItem(SR_LB_KEY) || '[]'); } catch (_) { return []; } }
const SR_Q = [
  { lt: 'Surink 8 mėlynus kristalus', en: 'Collect 8 blue crystals', part: ['Lėktuvo korpusas', 'Plane body'] },
  { lt: 'Užgesink 5 gaisrus (E)', en: 'Put out 5 fires (E)', part: ['Sparnai', 'Wings'] },
  { lt: 'Surink 4 raktus ir atrakink skrynią aikštėje (E)', en: 'Find 4 keys and open the chest on the plaza (E)', part: ['Variklis', 'Engine'] },
  { lt: 'Susprogdink 10 balionų (prisiliesk)', en: 'Pop 10 balloons (touch them)', part: ['Propeleris', 'Propeller'] },
  { lt: 'Prabėk pro 6 žiedus iš eilės per 60 s', en: 'Run through 6 rings in order in 60 s', part: ['Uodega', 'Tail'] }
];
function srRand(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// ---------- the big city (flat): streets every 24 m, blocks of tall houses, an empty plaza in the middle ----------
const SR_B = 24, SR_N = 12, SR_W0 = -SR_B * SR_N / 2 + 12;   // street centres: SR_W0 + k*24  (k = 0..11)
const srStreet = k => SR_W0 + k * SR_B;
const SR_BOXES = [];
function buildSrCity(g) {
  const r = srRand(777), cols = [0xf2c8a0, 0xa0c8f2, 0xf2a0b0, 0xc8f2a0, 0xe0d0f8, 0xfff0b0, 0xb0e8e0, 0xf8d0e8, 0xd8d8e0];
  const half = SR_B * SR_N / 2;
  g.add(S(G.box, mat(0x6a6a72, { roughness: 1 }), half * 2 + 40, 0.1, half * 2 + 40, 0, -0.05, 0));   // asphalt
  for (let k = 0; k < SR_N; k++) { const s = srStreet(k); g.add(S(G.box, mat(0xffffff), 0.3, 0.02, half * 2, s, 0.02, 0)); g.add(S(G.box, mat(0xffffff), half * 2, 0.02, 0.3, 0, 0.02, s)); }
  for (let i = 0; i < SR_N - 1; i++) for (let j = 0; j < SR_N - 1; j++) {
    const cx = srStreet(i) + 12, cz = srStreet(j) + 12;
    if (Math.abs(cx) < 13 && Math.abs(cz) < 13) {   // the central plaza
      g.add(S(G.box, mat(0xe8dcc0), 16, 0.12, 16, cx, 0.06, cz)); continue; }
    g.add(S(G.box, mat(0xbfb8a8), 16.4, 0.25, 16.4, cx, 0.12, cz));   // sidewalk block
    const n = r() < 0.3 ? 1 : r() < 0.6 ? 2 : 4;
    const parts = n === 1 ? [[0, 0, 7, 7]] : n === 2 ? [[-4, 0, 3.4, 7], [4, 0, 3.4, 7]] : [[-4, -4, 3.4, 3.4], [4, -4, 3.4, 3.4], [-4, 4, 3.4, 3.4], [4, 4, 3.4, 3.4]];
    for (const [ox, oz, hx, hz] of parts) {
      const h = 6 + Math.floor(r() * (Math.hypot(cx, cz) < 60 ? 30 : 16)), x = cx + ox, z = cz + oz, col = cols[Math.floor(r() * cols.length)];
      g.add(S(G.box, mat(col, { roughness: 0.85 }), hx * 2, h, hz * 2, x, h / 2, z));
      g.add(S(G.box, mat(0x5a5a62), hx * 2 + 0.3, 0.4, hz * 2 + 0.3, x, h + 0.2, z));
      const win = mat(0x2a3a5a, { emissive: 0x0a1428 });
      for (let fy = 2.5; fy < h - 1; fy += 3.2) { g.add(S(G.box, win, hx * 2 + 0.06, 1.2, hz * 1.2, x, fy, z)); g.add(S(G.box, win, hx * 1.2, 1.2, hz * 2 + 0.06, x, fy, z)); }
      SR_BOXES.push({ x, z, hx, hz, h: h + 0.4 });
    }
  }
  // the edge of the city: a wall of tall towers
  SR_BOXES.push({ x: 0, z: -half - 6, hx: half + 10, hz: 3, h: 60 }, { x: 0, z: half + 6, hx: half + 10, hz: 3, h: 60 }, { x: -half - 6, z: 0, hx: 3, hz: half + 10, h: 60 }, { x: half + 6, z: 0, hx: 3, hz: half + 10, h: 60 });
  for (const b of SR_BOXES.slice(-4)) g.add(S(G.box, mat(0x8a8a9a), b.hx * 2, b.h, b.hz * 2, b.x, b.h / 2, b.z));
  { const s = makeSign(srL('Speedrun miestas', 'Speedrun City')); s.position.set(-5, 0, 6); s.scale.setScalar(1.8); g.add(s); }
}
// spots on the streets (never inside a house)
function srSpots(seed, n, maxD) {
  const r = srRand(seed), out = [];
  for (let k = 0; k < 4000 && out.length < n; k++) {
    const along = r() * (SR_B * (SR_N - 1)) + SR_W0, st = srStreet(Math.floor(r() * SR_N)), side = (r() - 0.5) * 5;
    const p = r() < 0.5 ? new V3(st + side, 0, along) : new V3(along, 0, st + side);
    if (Math.hypot(p.x, p.z) > maxD || Math.hypot(p.x, p.z) < 10) continue;
    if (out.every(o => o.distanceTo(p) > 12)) out.push(p);
  }
  return out;
}
function srAdd(obj, p) { obj.position.copy(p); srScene.add(obj); linearize(obj); SR.objs.push(obj); return obj; }
function srGlow(col, s) { const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: col, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); g.scale.setScalar(s); return g; }
function srBeacon(g, col) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 30, 8, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending })); b.position.y = 15; g.add(b); }
function srClear() { SR.objs.forEach(o => o.parent && o.parent.remove(o)); SR.objs = []; SR.items = []; SR.chest = null; }
function srSetupQuest() {
  srClear(); const q = SR.q; SR.cnt = 0;
  if (q === 0) srSpots(11, 8, 85).forEach(p => { const g = new THREE.Group(); g.add(S(G.dodec, mat(0x5ad8ff, { emissive: 0x1a5a8a, roughness: 0.2 }), 0.45, 0.8, 0.45, 0, 1.3, 0)); const gl = srGlow(0x6ae8ff, 2.2); gl.position.y = 1.3; g.add(gl); srBeacon(g, 0x6ae8ff); srAdd(g, p); SR.items.push({ g, kind: 'crystal' }); });
  if (q === 1) srSpots(22, 5, 80).forEach(p => { const g = new THREE.Group(); g.add(S(G.cyl, mat(0x3a2a1a), 1.4, 0.2, 1.4, 0, 0.1, 0)); const fl = []; for (let i = 0; i < 6; i++) { const f = S(G.cone, bmat(pick([0xff5a1a, 0xffa21a, 0xffd23a]), { transparent: true, opacity: 0.85 }), 0.4, rr(0.9, 1.6), 0.4, rr(-0.5, 0.5), 0.6, rr(-0.5, 0.5)); g.add(f); fl.push(f); } const gl = srGlow(0xff7a1a, 3.5); gl.position.y = 1; g.add(gl); srBeacon(g, 0xff7a1a); g.userData.fl = fl; srAdd(g, p); SR.items.push({ g, kind: 'fire' }); });
  if (q === 2) { srSpots(33, 4, 90).forEach(p => { const g = new THREE.Group(); const gm = mat(0xffd23a, { metalness: 0.6, roughness: 0.3, emissive: 0x3a2a00 }); g.add(S(G.cyl, gm, 0.08, 0.9, 0.08, 0, 1.3, 0)); g.add(S(G.sph, gm, 0.28, 0.28, 0.1, 0, 1.85, 0)); g.add(S(G.box, gm, 0.25, 0.08, 0.06, 0.12, 0.95, 0)); const gl = srGlow(0xffe14d, 2); gl.position.y = 1.4; g.add(gl); srBeacon(g, 0xffe14d); srAdd(g, p); SR.items.push({ g, kind: 'key' }); });
    const c = new THREE.Group(); c.add(S(G.box, mat(0x8a5a2b), 1.6, 1, 1.1, 0, 0.5, 0)); c.add(S(G.box, mat(0xa06a3a), 1.65, 0.35, 1.15, 0, 1.15, 0)); c.add(S(G.box, mat(0xffd23a), 0.3, 0.35, 0.1, 0, 0.75, 0.57)); srAdd(c, new V3(5, 0.12, -4)); SR.chest = { g: c, p: new V3(5, 0, -4) }; }
  if (q === 3) srSpots(44, 10, 75).forEach((p, i) => { const g = new THREE.Group(); const col = pick([0xff4a6a, 0x4ab0ff, 0xffd23a, 0x5ae06a, 0xc85aff]); const b = S(G.sph, mat(col, { roughness: 0.3 }), 0.55, 0.7, 0.55, 0, 2, 0); g.add(b); g.add(S(G.cyl, mat(0xffffff), 0.01, 1.2, 0.01, 0, 0.9, 0)); srBeacon(g, col); g.userData.b = b; g.userData.ph = i; srAdd(g, p); SR.items.push({ g, kind: 'balloon' }); });
  if (q === 4) { const ds = srSpots(55, 6, 60); ds.sort((a, b) => Math.atan2(a.z, a.x) - Math.atan2(b.z, b.x)); ds.forEach((p, i) => { const g = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.16, 8, 32), bmat(0x5aff8a)); ring.position.y = 1.8; g.add(ring); const num = mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshBasicMaterial({ map: labelTex(String(i + 1), '#1a5a2a', '#ffffff', 128, 128), side: THREE.DoubleSide }), 0, 3.8, 0); g.add(num); g.userData.ring = ring; srAdd(g, p); SR.items.push({ g, kind: 'ring', i }); }); SR.ringI = 0; SR.ringT = 0; srRingColors(); }
  SR.need = Math.max(1, SR.items.length);
}
function srRingColors() { SR.items.forEach(it => { if (it.kind !== 'ring') return; it.g.userData.ring.material = bmat(it.i === SR.ringI ? 0xffe14d : 0x5aff8a); it.g.visible = it.i >= SR.ringI; }); }
function srGotPart() {
  const p = SR_Q[SR.q].part; SR.parts.push(p); [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, { type: 'triangle', vol: 0.06, when: i * 0.08 }));
  bigBanner(srL(`${SR.q + 1} ĮSAKYMAS ĮVYKDYTAS!`, `COMMANDMENT ${SR.q + 1} DONE!`), srL(`Gavai lėktuvo dalį: ${p[0]}`, `You got a plane part: ${p[1]}`));
  SR.q++;
  if (SR.q < SR_Q.length) { srSetupQuest(); const qq = SR.q; setTimeout(() => { if (SR.on && SR_Q[qq]) toast(srL(`${qq + 1} įsakymas`, `Commandment ${qq + 1}`), srL(SR_Q[qq].lt, SR_Q[qq].en), '#ffd23a'); }, 1800); }
  else { srClear(); SR.phase = 'build'; const pad = new THREE.Group(); pad.add(S(G.cyl, mat(0xffd23a, { emissive: 0x3a2a00 }), 3, 0.08, 3, 0, 0.04, 0)); const gl = srGlow(0xffd23a, 6); gl.position.y = 1; pad.add(gl); srBeacon(pad, 0xffd23a); srAdd(pad, new V3(0, 0.12, 0)); SR.pad = { g: pad, p: new V3(0, 0, 0) };
    setTimeout(() => toast(srL('Visos 5 dalys! ✈', 'All 5 parts! ✈'), srL('Bėk į aikštę miesto viduryje ir spausk E ant auksinės aikštelės!', 'Run to the plaza in the middle of the city and press E on the golden pad!'), '#ffd23a'), 1800); }
}
// ---------- start / stop ----------
function startSpeedrun() {
  if (!srUnlocked()) { toast(srL('Speedrun užrakintas 🔒', 'Speedrun is locked 🔒'), srL('Įveik visą žaidimą (Didįjį šikšnosparnį), ir jis atsirakins!', 'Beat the whole game (the Great Bat) to unlock it!'), '#ff6a6a'); return; }
  const go = () => {
    buildSrSky(); closeWorldPortal && closeWorldPortal(); setScope(false);
    mode = 'sr'; srScene.add(player.mesh); player.mesh.visible = true; player.up.set(0, 1, 0);
    SR.on = true; SR.phase = 'quests'; SR.t = 0; SR.running = false; SR.q = 0; SR.parts = []; SR.hp = 5; SR.final = 0; SR.plane = null; srGhost(false);
    player.pos.set(0, 0.12, 8); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.pitch = 0.25; player.grounded = true;
    camera.position.set(0, 6, 16); camera.up.set(0, 1, 0);
    $('bName').textContent = srL('Speedrun miestas', 'Speedrun City'); $('bEn').textContent = '⏱'; $('bAtm').textContent = srL('Vienas didelis miestas. Jokių darbų, parduotuvių ar portalų – tik laikrodis!', 'One big city. No jobs, shops or portals – just the clock!'); document.documentElement.style.setProperty('--biome', '#ffd23a');
    srSetupQuest();
    startTalk(srL('Laikmačio Dievas', 'The Timer God'), [srL('TIK-TAK! Sveikas SPEEDRUNE! Kai užversi šį langą – pradės eiti laikrodis.', 'TICK-TOCK! Welcome to the SPEEDRUN! When you close this window, the clock starts.'),
      srL('Penki įsakymai – už kiekvieną gausi lėktuvo dalį. Daiktus rasi gatvėse – ieškok šviesos stulpų! Su visomis dalimis lėktuvą pasistatysi aikštėje.', 'Five commandments – each one gives you a plane part. Look for the light beams in the streets! With all parts you build the plane on the plaza.'),
      srL('Tada skrisk į debesis ir nugalėk DEBESŲ BOSĄ. Kai jis pavargsta ir nusileidžia – trenk jam! Esc – išeiti iš speedrun.', 'Then fly up to the clouds and beat the CLOUD BOSS. When it gets tired and sinks down – hit it! Esc – leave the speedrun.')], '#ffd23a',
      () => { SR.running = true; toast(srL('1 įsakymas', 'Commandment 1'), srL(SR_Q[0].lt, SR_Q[0].en), '#ffd23a'); tone(880, 0.2, { type: 'square', vol: 0.05 }); });
  };
  hideCard(); card = null; fadeTo(go);
}
function exitSpeedrun(msg) {
  if (!SR.on) return; SR.on = false; SR.running = false; SR.phase = 'idle'; srClear(); srGhost(false); if (SR.hud) SR.hud.hidden = true; if (SR.bossHud) SR.bossHud.hidden = true;
  if (PLN.fly) { cinema = null; PLN.fly = null; if (PLN.hud) PLN.hud.hidden = true; }
  if (SR.plane) { srScene.remove(SR.plane); SR.plane = null; } if (SR.boss) { srScene.remove(SR.boss.g); SR.boss.marks.forEach(m => srScene.remove(m.m)); SR.boss = null; } SR.pad = null; hideCard(); card = null;
  fadeTo(() => { cinema = null; portalToPlanet(); player.mesh.visible = true; toast(msg || srL('Išėjai iš speedrun', 'You left the speedrun'), srL('Vėl įprastas žaidimas. Speedrun – Esc meniu', 'Back to the normal game. Speedrun – in the Esc menu'), '#ffd23a'); if (!lockFailed && started) requestLock(); });
}
// Esc (pause) leaves the speedrun
{ const _o = openPause; openPause = (...a) => { if (SR.on) { exitSpeedrun(); return; } return _o(...a); }; }
addEventListener('keydown', e => { if (SR.on && e.code === 'Escape' && !mPhoneOpen) { e.stopImmediatePropagation(); exitSpeedrun(); } }, true);
// no phone, cars, pets, shops… in the speedrun city
addEventListener('keydown', e => { if (SR.on && mode === 'sr' && ['KeyP', 'KeyF', 'KeyR', 'KeyI', 'KeyX', 'KeyB', 'KeyT', 'Digit2', 'Digit5', 'Backquote'].includes(e.code)) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
function srBuildPlane() {
  SR.phase = 'plane'; const p = makePlane(); p.position.set(0, 0.12, 0); p.rotation.y = Math.PI; srScene.add(p); linearize(p); SR.plane = p; p.scale.setScalar(0.01); let t = 0; sfx.magic();
  if (SR.pad) { srScene.remove(SR.pad.g); }
  fx.push(dt => { t += dt; p.scale.setScalar(Math.min(1, 0.01 + t * 0.7)); if (p.userData.prop) p.userData.prop.rotation.z += dt * 10; return t < 1.6; });
  bigBanner(srL('LĖKTUVAS PASTATYTAS!', 'PLANE BUILT!'), srL('Prieik ir spausk E – skrisk į debesis!', 'Walk up and press E – fly to the clouds!'));
}
function srCityAction() {
  const d2 = p => Math.hypot(player.pos.x - p.x, player.pos.z - p.z);
  if (SR.phase === 'quests' && SR.q === 1) { const it = SR.items.find(i => i.g.visible && d2(i.g.position) < 3); if (it) { it.g.visible = false; SR.cnt++; noiseHit(0.6, { f: 2000, fto: 600, vol: 0.12 }); for (let k = 0; k < 10; k++) { const s = S(G.sph, bmat(0xbfe8ff, { transparent: true, opacity: 0.7 }), 0.2, 0.2, 0.2); s.position.copy(it.g.position).add(new V3(0, 1, 0)); srScene.add(s); const v = randDir().multiplyScalar(2).add(new V3(0, 2, 0)); let life = 0.7; fx.push(dt => { life -= dt; s.position.addScaledVector(v, dt); if (life <= 0) { srScene.remove(s); return false; } return true; }); }
      toast(srL(`Gaisras užgesintas! ${SR.cnt}/${SR.need}`, `Fire put out! ${SR.cnt}/${SR.need}`), '', '#5ab0ff'); if (SR.cnt >= SR.need) srGotPart(); return true; } }
  if (SR.phase === 'quests' && SR.q === 2 && SR.chest && d2(SR.chest.p) < 3) { if (SR.cnt < SR.need) { toast(srL('Skrynia užrakinta', 'The chest is locked'), srL(`Reikia ${SR.need} raktų – turi ${SR.cnt}`, `You need ${SR.need} keys – you have ${SR.cnt}`), '#ffd23a'); return true; } SR.cnt = SR.need; sfx.magic(); srGotPart(); return true; }
  if (SR.phase === 'build' && SR.pad && d2(SR.pad.p) < 4) { srBuildPlane(); return true; }
  if (SR.phase === 'plane' && SR.plane && d2(SR.plane.position) < 6) { srTakeOff(); return true; }
  return false;
}
// the city: walking with houses as walls (and roofs you can stand on)
function srCityWalk(dt, t) {
  const f = player.down ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = player.down ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 11 : 6.5; _mv.multiplyScalar(sp); player.vel.lerp(_mv, Math.min(1, (player.grounded ? 10 : 3) * dt));
  if (keys.Space && player.grounded) { player.vr = 9; player.grounded = false; sfx.jump(); }
  player.vr -= 20 * dt; player.vr = Math.max(player.vr, -30); player.pos.addScaledVector(player.vel, dt); player.pos.y += player.vr * dt;
  let ground = 0.12; const rad = 0.4;
  for (const b of SR_BOXES) { const dx = player.pos.x - b.x, dz = player.pos.z - b.z, ex = b.hx + rad - Math.abs(dx), ez = b.hz + rad - Math.abs(dz); if (ex <= 0 || ez <= 0) continue; if (player.pos.y >= b.h - 0.6) { if (b.h > ground) ground = b.h; } else { if (ex < ez) player.pos.x += dx < 0 ? -ex : ex; else player.pos.z += dz < 0 ? -ez : ez; } }
  if (player.pos.y <= ground) { player.pos.y = ground; if (player.vr < 0) player.vr = 0; player.grounded = true; } else player.grounded = false;
  if (!isFinite(player.pos.x) || !isFinite(player.pos.y) || !isFinite(player.pos.z)) { player.pos.set(0, 0.12, 8); player.vel.set(0, 0, 0); player.vr = 0; }
  player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd); animateMan(dt, f !== 0 || s !== 0, sp);
  if (!card) { const d2 = p => Math.hypot(player.pos.x - p.x, player.pos.z - p.z); let txt = '';
    if (SR.phase === 'quests' && SR.q === 1 && SR.items.some(i => i.g.visible && d2(i.g.position) < 3)) txt = srL('<kbd>E</kbd> gesinti gaisrą', '<kbd>E</kbd> put out the fire');
    else if (SR.phase === 'quests' && SR.q === 2 && SR.chest && d2(SR.chest.p) < 3) txt = srL('<kbd>E</kbd> atrakinti skrynią', '<kbd>E</kbd> open the chest');
    else if (SR.phase === 'build' && SR.pad && d2(SR.pad.p) < 4) txt = srL('<kbd>E</kbd> statyti lėktuvą', '<kbd>E</kbd> build the plane');
    else if (SR.phase === 'plane' && SR.plane && d2(SR.plane.position) < 6) txt = srL('<kbd>E</kbd> sėsti į lėktuvą', '<kbd>E</kbd> get in the plane');
    setPrompt(txt); }
}
fx.push(dt => {
  if (!SR.on) return true;
  if (SR.running && !card) SR.t += dt;
  if (!SR.hud) { const d = document.createElement('div'); d.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);background:rgba(20,16,4,.86);color:#fff4c8;border:2px solid #ffd23a;border-radius:14px;padding:6px 16px;font:800 16px system-ui,sans-serif;z-index:6;pointer-events:none;text-align:center;white-space:nowrap'; document.body.appendChild(d); SR.hud = d; }
  SR.hud.hidden = false;
  let goal = '';
  if (SR.phase === 'quests') { const q = SR_Q[SR.q]; goal = `${SR.q + 1}/5: ${srL(q.lt, q.en)} · <b>${SR.q === 4 ? SR.ringI + '/' + SR.need + (SR.ringI > 0 ? ` · ${Math.max(0, 60 - SR.ringT).toFixed(0)} s` : '') : Math.min(SR.cnt, SR.need) + '/' + SR.need}</b>`; }
  else if (SR.phase === 'build') goal = srL('Statyk lėktuvą auksinėje aikštelėje aikštėje (E)', 'Build the plane on the golden pad on the plaza (E)');
  else if (SR.phase === 'plane') goal = srL('Sėsk į lėktuvą (E)', 'Get in the plane (E)');
  else if (SR.phase === 'fly') goal = srL('Skrisk į debesis!', 'Fly to the clouds!');
  else if (SR.phase === 'boss') goal = srL('Nugalėk Debesų Bosą!', 'Beat the Cloud Boss!') + ' ' + '❤'.repeat(Math.max(0, SR.hp));
  else if (SR.phase === 'ghost') goal = srL('👻 Tu vaiduoklis – skraidyk (WASD, Space/Shift) · Esc – išeiti', '👻 You are a ghost – fly (WASD, Space/Shift) · Esc – leave');
  SR.hud.innerHTML = `⏱ <span style="font-variant-numeric:tabular-nums;color:${SR.phase === 'ghost' ? '#7dff6b' : '#fff'}">${srTime(SR.phase === 'ghost' ? SR.final : SR.t)}</span> · ${goal}`;
  if (mode !== 'sr' || SR.phase !== 'quests' || !SR.running) return true;
  for (const it of SR.items) { if (!it.g.visible) continue; const c = it.g.position, dh = Math.hypot(player.pos.x - c.x, player.pos.z - c.z), dy = Math.abs(player.pos.y - c.y);
    if (it.kind === 'crystal') { it.g.rotation.y += dt * 2; if (dh < 1.6 && dy < 2.5) { it.g.visible = false; SR.cnt++; tone(1175 + SR.cnt * 60, 0.12, { type: 'triangle', vol: 0.05 }); toast(srL(`Kristalas! ${SR.cnt}/${SR.need}`, `Crystal! ${SR.cnt}/${SR.need}`), '', '#5ad8ff'); if (SR.cnt >= SR.need) { srGotPart(); return true; } } }
    if (it.kind === 'fire') it.g.userData.fl.forEach((f, i) => { f.scale.y = 1 + Math.sin(T * 9 + i) * 0.3; });
    if (it.kind === 'key') { it.g.rotation.y += dt * 2.5; if (dh < 1.6 && dy < 2.5) { it.g.visible = false; SR.cnt++; tone(1568, 0.12, { type: 'triangle', vol: 0.05 }); toast(srL(`Raktas! ${SR.cnt}/${SR.need}`, `Key! ${SR.cnt}/${SR.need}`), SR.cnt >= SR.need ? srL('Dabar – prie skrynios aikštėje (E)', 'Now – to the chest on the plaza (E)') : '', '#ffd23a'); } }
    if (it.kind === 'balloon') { it.g.userData.b.position.y = 2 + Math.sin(T * 2 + it.g.userData.ph) * 0.25; if (dh < 1.5 && dy < 3) { it.g.visible = false; SR.cnt++; noiseHit(0.15, { f: 3000, fto: 800, vol: 0.2 }); toast(srL(`Pokšt! ${SR.cnt}/${SR.need}`, `Pop! ${SR.cnt}/${SR.need}`), '', '#ff4a6a'); if (SR.cnt >= SR.need) { srGotPart(); return true; } } }
    if (it.kind === 'ring') { it.g.userData.ring.rotation.y += dt; if (it.i === SR.ringI && dh < 2 && dy < 3) { SR.ringI++; if (SR.ringI === 1) SR.ringT = 0; tone(880 + SR.ringI * 80, 0.15, { type: 'triangle', vol: 0.06 }); srRingColors(); if (SR.ringI >= SR.need) { srGotPart(); return true; } } }
  }
  if (SR.q === 4 && SR.ringI > 0) { SR.ringT += dt; if (SR.ringT > 60) { SR.ringI = 0; SR.ringT = 0; srRingColors(); redFlash('rgba(255,90,90,.4)', 300); toast(srL('Per lėtai! ⏱', 'Too slow! ⏱'), srL('Pradėk nuo 1 žiedo iš naujo', 'Start again from ring 1'), '#ff6a6a'); } }
  return true;
});
const srScene = new THREE.Scene(); srScene.background = new THREE.Color(0x9ad8ff); srScene.fog = new THREE.Fog(0x9ad8ff, 120, 700);
srScene.add(new THREE.AmbientLight(0xffffff, 0.6)); srScene.add(new THREE.HemisphereLight(0xffffff, 0x8aa0c0, 0.7)); { const s = new THREE.DirectionalLight(0xffffff, 0.7); s.position.set(50, 120, 40); srScene.add(s); }
const SR_ARENA = new V3(0, 90, -300), SR_AR = 26, SR_HALL = new V3(0, 130, -400);
let srBuilt = false;
function buildSrSky() {
  if (srBuilt) return; srBuilt = true; const g = new THREE.Group(); srScene.add(g);
  buildSrCity(g);
  const cl = mat(0xffffff, { roughness: 1 });
  for (let i = 0; i < 70; i++) { const a = rr(0, 6.28), d = rr(60, 450); g.add(S(G.sph, cl, rr(8, 20), rr(3, 7), rr(8, 16), Math.cos(a) * d, rr(40, 160), Math.sin(a) * d - 150)); }
  // the cloud arena
  for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, r = rr(0, SR_AR - 4); g.add(S(G.sph, cl, rr(6, 10), rr(2, 3), rr(6, 10), SR_ARENA.x + Math.cos(a) * r, SR_ARENA.y - 1.5, SR_ARENA.z + Math.sin(a) * r)); }
  g.add(S(G.cyl, cl, SR_AR, 1.5, SR_AR, SR_ARENA.x, SR_ARENA.y - 0.75, SR_ARENA.z));
  // the leaderboard hall: a golden cloud with a big board
  g.add(S(G.cyl, mat(0xfff4c8, { roughness: 1 }), 16, 1.5, 16, SR_HALL.x, SR_HALL.y - 0.75, SR_HALL.z));
  const board = mesh(new THREE.PlaneGeometry(16, 12), new THREE.MeshBasicMaterial({ map: srBoardTex(), side: THREE.DoubleSide }), SR_HALL.x, SR_HALL.y + 7, SR_HALL.z - 10); g.add(board); SR.boardMesh = board;
  for (const x of [-8.4, 8.4]) g.add(S(G.cyl, mat(0x8a5a2b), 0.3, 13.5, 0.3, SR_HALL.x + x, SR_HALL.y + 6.75, SR_HALL.z - 10.3));
  linearize(g);
}
function srBoardTex(mine) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 768; const x = c.getContext('2d');
  x.fillStyle = '#1a1430'; x.fillRect(0, 0, 1024, 768); x.fillStyle = '#ffd23a'; x.font = "bold 64px 'Lilita One', sans-serif"; x.textAlign = 'center'; x.fillText(srL('🏆 SPEEDRUN REKORDAI', '🏆 SPEEDRUN RECORDS'), 512, 90);
  const lb = srBoard(); x.font = "bold 44px 'Nunito', sans-serif"; x.textAlign = 'left';
  if (!lb.length) { x.fillStyle = '#fff'; x.fillText(srL('Dar nėra rezultatų', 'No results yet'), 300, 300); }
  lb.slice(0, 10).forEach((r, i) => { const isMine = mine && Math.abs(r.t - mine) < 1e-6; x.fillStyle = isMine ? '#7dff6b' : i === 0 ? '#ffd23a' : '#ffffff'; x.fillText(`${i + 1}.`, 140, 170 + i * 58); x.fillText(srTime(r.t), 240, 170 + i * 58); x.fillStyle = isMine ? '#7dff6b' : '#a8a0c8'; x.fillText(r.d + (isMine ? srL('  ← TU', '  ← YOU') : ''), 520, 170 + i * 58); });
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}
function srTakeOff() {
  SR.phase = 'fly'; const pl = SR.plane; SR.plane = null; pl.position.y = 0.12;
  startFlight(srScene, pl, new V3(SR_ARENA.x, SR_ARENA.y + 6, SR_ARENA.z + 30), 0xffffff, () => { srScene.remove(pl); srArena(); }, false);
}
// ---------- the Cloud Boss ----------
function makeCloudBoss() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const cm = mat(0x6a6a7a, { roughness: 1 });
  for (const [x, y, z, s] of [[0, 0, 0, 3.2], [2.6, -0.3, 0.3, 2.4], [-2.6, -0.2, 0.2, 2.5], [1.2, 1.6, 0, 2.2], [-1.4, 1.5, 0.3, 2.1], [0, -1, 1.2, 2.4]]) body.add(S(G.sph, cm, s, s * 0.8, s, x, y, z));
  const eye = bmat(0xffffff), pu = bmat(0x1a1a1a);
  for (const x of [-1, 1]) { body.add(S(G.sph, eye, 0.6, 0.6, 0.3, x, 0.6, 2.9)); body.add(S(G.sph, pu, 0.28, 0.28, 0.2, x, 0.55, 3.15)); body.add(S(G.box, pu, 1, 0.18, 0.2, x * 1.05, 1.3, 2.9).rotateZ(x * -0.4)); }
  body.add(S(G.box, pu, 1.4, 0.22, 0.2, 0, -0.5, 3.1));
  const gl = srGlow(0xfff4a0, 10); gl.material.opacity = 0; g.add(gl); g.userData = { body, gl, cm };
  linearize(g); return g;
}
function srArena() {
  SR.phase = 'boss'; SR.hp = 5; player.pos.set(SR_ARENA.x, SR_ARENA.y, SR_ARENA.z + 18); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.grounded = true; player.pitch = 0.3;
  if (SR.boss) srScene.remove(SR.boss.g);
  const g = makeCloudBoss(); g.position.set(SR_ARENA.x, SR_ARENA.y + 10, SR_ARENA.z - 6); srScene.add(g);
  SR.boss = { g, hp: 6, st: 'float', t: 3, atk: 0, marks: [], a: 0, hits: 0 };
  setTimeout(() => startTalk(srL('Debesų Bosas', 'The Cloud Boss'), [srL('GRRRUMMM! Kas drįsta skristi į MANO debesis?!', 'GRRRUMMM! Who dares to fly into MY clouds?!'), srL('Mano žaibai tave nupūs! (Kai pavargsiu – nusileisiu pailsėti… bet tu to nesužinosi!)', 'My lightning will blow you away! (When I get tired I sink down to rest… but you will never know!)')], '#c8c8d8'), 400);
}
function srBossHit() {
  const b = SR.boss; if (!b || b.st !== 'rest' || b.hits >= 2) return false;
  b.hp--; b.hits++; shake = Math.max(shake, 0.6); noiseHit(0.4, { f: 600, fto: 120, vol: 0.25 }); fireBoom(srScene, b.g.position.clone()); b.g.userData.body.scale.setScalar(1 - (6 - b.hp) * 0.08);
  toast(srL(`Pataikei! Liko ${b.hp}/6`, `Hit! ${b.hp}/6 left`), b.hp > 0 && b.hits >= 2 ? srL('Jis supyko ir vėl kyla!', 'It got angry and rises again!') : '', '#fff4a0');
  if (b.hp <= 0) srBossDie(); else if (b.hits >= 2) { b.st = 'rise'; b.t = 1.2; }
  return true;
}
function srBossDie() {
  const b = SR.boss; b.st = 'dead'; SR.running = false; SR.final = SR.t;
  const lb = srBoard(); const d = new Date(); lb.push({ t: SR.final, d: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }); lb.sort((a, c) => a.t - c.t); try { localStorage.setItem(SR_LB_KEY, JSON.stringify(lb.slice(0, 10))); } catch (_) { }
  const place = lb.findIndex(r => r.t === SR.final) + 1;
  for (let i = 0; i < 30; i++) { const s = S(G.sph, bmat(pick([0xff4a4a, 0xffa21a, 0xffe14d, 0x5ae06a, 0x4ab0ff, 0xc85aff]), { transparent: true, opacity: 0.9 }), 0.6, 0.6, 0.6); s.position.copy(b.g.position); srScene.add(s); const v = randDir().multiplyScalar(rr(6, 14)); let life = 2; fx.push(dt => { life -= dt; s.position.addScaledVector(v, dt); v.y -= dt * 4; s.material.opacity = Math.max(0, life / 2); if (life <= 0) { srScene.remove(s); return false; } return true; }); }
  srScene.remove(b.g); [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.06, when: i * 0.1 }));
  bigBanner(srL('LAIKAS SUSTOJO!', 'TIME STOPPED!'), `⏱ ${srTime(SR.final)} · ${place > 0 && place <= 10 ? srL(`${place} vieta rekordų lentoje!`, `#${place} on the leaderboard!`) : ''}`);
  setTimeout(() => { if (!SR.on) return; fadeTo(() => { SR.phase = 'ghost'; if (SR.boardMesh) { SR.boardMesh.material.map = srBoardTex(SR.final); SR.boardMesh.material.needsUpdate = true; } player.pos.set(SR_HALL.x, SR_HALL.y + 2, SR_HALL.z + 6); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.pitch = 0.15; srGhost(true);
    toast(srL('Tu – VAIDUOKLIS 👻', 'You are a GHOST 👻'), srL('Skraidyk ir apžiūrėk pasaulį: WASD, Space – aukštyn, Shift – žemyn. Esc – išeiti iš speedrun', 'Fly and look around: WASD, Space – up, Shift – down. Esc – leave the speedrun'), '#7dff6b'); }); }, 4000);
}
function srGhost(on) {
  if (on && !SR.ghostMats) { SR.ghostMats = []; player.mesh.traverse(o => { if (o.material) { SR.ghostMats.push([o, o.material]); const m = o.material.clone(); m.transparent = true; m.opacity = 0.4; m.depthWrite = false; if (m.emissive) m.emissive.setHex(0x3a6a8a); o.material = m; } }); }
  if (!on && SR.ghostMats) { SR.ghostMats.forEach(([o, m]) => o.material = m); SR.ghostMats = null; }
}
function updateSr(dt, t) {
  if (SR.phase === 'quests' || SR.phase === 'build' || SR.phase === 'plane') srCityWalk(dt, t);
  else if (SR.phase === 'ghost') {
    const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0), v = (keys.Space ? 1 : 0) - (keys.ShiftLeft || keys.ShiftRight ? 1 : 0);
    _rt.crossVectors(player.fwd, UP); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize(); _mv.multiplyScalar(18); _mv.y = v * 12;
    player.vel.lerp(_mv, Math.min(1, dt * 4)); player.pos.addScaledVector(player.vel, dt); player.pos.y = Math.max(2, Math.min(300, player.pos.y));
    const r = Math.hypot(player.pos.x, player.pos.z + 150); if (r > 600) { player.pos.x *= 600 / r; }
    player.mesh.position.copy(player.pos).add(new V3(0, Math.sin(t * 2) * 0.15, 0)); orient(player.mesh, UP, player.fwd); animateMan(dt, false, 0);
  } else if (SR.phase === 'boss') {
    const b = SR.boss;
    const f = player.down ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = player.down ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
    _rt.crossVectors(player.fwd, UP); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
    const sp = keys.ShiftLeft || keys.ShiftRight ? 11 : 6.5; _mv.multiplyScalar(sp); player.vel.lerp(_mv, Math.min(1, (player.grounded ? 10 : 3) * dt));
    if (keys.Space && player.grounded) { player.vr = 9; player.grounded = false; sfx.jump(); }
    player.vr -= 20 * dt; player.vr = Math.max(player.vr, -30); player.pos.addScaledVector(player.vel, dt); player.pos.y += player.vr * dt;
    const onCloud = Math.hypot(player.pos.x - SR_ARENA.x, player.pos.z - SR_ARENA.z) < SR_AR;
    if (onCloud && player.pos.y <= SR_ARENA.y && player.pos.y > SR_ARENA.y - 2) { player.pos.y = SR_ARENA.y; if (player.vr < 0) player.vr = 0; player.grounded = true; } else player.grounded = false;
    if (player.pos.y < SR_ARENA.y - 25) { srHurt(srL('Nukritai nuo debesies!', 'You fell off the cloud!')); player.pos.set(SR_ARENA.x, SR_ARENA.y + 0.5, SR_ARENA.z + 18); player.vel.set(0, 0, 0); player.vr = 0; }
    player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd); animateMan(dt, f !== 0 || s !== 0, sp);
    if (b && b.st !== 'dead' && !card) {
      const u = b.g.userData; b.t -= dt;
      if (b.st === 'float') { b.a += dt * 0.5; b.g.position.lerp(_ct.set(SR_ARENA.x + Math.cos(b.a) * 12, SR_ARENA.y + 10 + Math.sin(t * 1.3) * 1.2, SR_ARENA.z + Math.sin(b.a) * 12), Math.min(1, dt * 1.5)); u.gl.material.opacity = 0;
        if (b.t <= 0) { b.atk++; b.t = 2.2; // telegraph 3 lightning spots
          for (let i = 0; i < 3; i++) { const p = i === 0 ? player.pos.clone() : player.pos.clone().add(new V3(rr(-5, 5), 0, rr(-5, 5))); p.y = SR_ARENA.y + 0.05; const m = new THREE.Mesh(new THREE.CircleGeometry(2.2, 24), new THREE.MeshBasicMaterial({ color: 0xff3a3a, transparent: true, opacity: 0.5, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.copy(p); srScene.add(m); b.marks.push({ m, p, t: 1.1 }); }
          tone(200, 0.4, { to: 600, type: 'sawtooth', vol: 0.03, lp: 1200 });
          if (b.atk % 3 === 0) { b.st = 'tired'; b.t = 2.4; } } }
      else if (b.st === 'tired') { b.g.position.y += Math.sin(t * 20) * 0.03; if (b.t <= 0) { b.st = 'sink'; b.t = 1.2; toast(srL('Debesis pavargo! 😴', 'The cloud is tired! 😴'), srL('Jis leidžiasi – bėk ir trenk jam (LMB arba E)!', 'It is sinking – run and hit it (LMB or E)!'), '#fff4a0'); } }
      else if (b.st === 'sink') { const tgt = _ct.set(b.g.position.x, SR_ARENA.y + 2.4, b.g.position.z); b.g.position.lerp(tgt, Math.min(1, dt * 3)); if (b.t <= 0) { b.st = 'rest'; b.t = 6; b.hits = 0; } }
      else if (b.st === 'rest') { u.gl.material.opacity = 0.35 + Math.sin(t * 6) * 0.15; u.body.rotation.z = Math.sin(t * 2) * 0.1; if (b.t <= 0) { b.st = 'rise'; b.t = 1.2; } }
      else if (b.st === 'rise') { u.gl.material.opacity = 0; b.g.position.y += dt * 7; if (b.t <= 0) { b.st = 'float'; b.t = 1.5; } }
      b.g.lookAt(player.pos.x, b.g.position.y, player.pos.z);
      for (let i = b.marks.length - 1; i >= 0; i--) { const mk = b.marks[i]; mk.t -= dt; mk.m.material.opacity = 0.3 + Math.sin(t * 25) * 0.2;
        if (mk.t <= 0) { zapLine(srScene, b.g.position.clone(), mk.p.clone(), 0xfff4a0, 0.3); noiseHit(0.3, { f: 1500, fto: 200, vol: 0.12 }); if (Math.hypot(player.pos.x - mk.p.x, player.pos.z - mk.p.z) < 2.2 && player.pos.y < mk.p.y + 3) srHurt(srL('Žaibas!', 'Lightning!')); srScene.remove(mk.m); b.marks.splice(i, 1); } }
      // fireballs hurt it while it rests
      for (const fb of FB.balls) { if (fb.sc !== srScene || fb.t > 5) continue; if (fb.b.position.distanceTo(b.g.position) < 4) { fb.t = 99; srBossHit(); } }
      if (!SR.bossHud) { const d = document.createElement('div'); d.style.cssText = 'position:fixed;top:56px;left:50%;transform:translateX(-50%);width:min(420px,70vw);height:14px;background:rgba(0,0,0,.5);border:2px solid #c8c8d8;border-radius:8px;z-index:6;pointer-events:none;overflow:hidden'; d.innerHTML = '<div style="height:100%;background:linear-gradient(90deg,#8a8aa0,#e8e8f8)"></div>'; document.body.appendChild(d); SR.bossHud = d; }
      SR.bossHud.hidden = false; SR.bossHud.firstChild.style.width = (b.hp / 6 * 100) + '%';
      if (!card) setPrompt(b.st === 'rest' && Math.hypot(player.pos.x - b.g.position.x, player.pos.z - b.g.position.z) < 5 ? srL('<kbd>LMB</kbd> / <kbd>E</kbd> – trenk debesiui!', '<kbd>LMB</kbd> / <kbd>E</kbd> – hit the cloud!') : '');
    } else if (SR.bossHud) SR.bossHud.hidden = true;
  }
  const dist = 7, pitch = player.pitch;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
  camera.position.lerp(_ct, Math.min(1, dt * 8)); camera.up.set(0, 1, 0); camera.lookAt(player.pos.clone().add(new V3(0, 1.4, 0))); applyShake(dt);
}
function srHurt(why) {
  if (SR.hurtT && T - SR.hurtT < 1) return; SR.hurtT = T; SR.hp--; redFlash('rgba(255,240,120,.6)', 300); shake = Math.max(shake, 0.8);
  if (SR.hp <= 0) { SR.hp = 5; if (SR.boss) { SR.boss.hp = Math.min(6, SR.boss.hp + 2); SR.boss.g.userData.body.scale.setScalar(1 - (6 - SR.boss.hp) * 0.08); } player.pos.set(SR_ARENA.x, SR_ARENA.y + 0.5, SR_ARENA.z + 18); toast(srL('Tave nupūtė! 💨', 'You got blown away! 💨'), srL('Širdys grįžo, bet debesis atsigavo (+2). Laikas eina toliau!', 'Your hearts are back, but the cloud healed (+2). The clock keeps running!'), '#ff6a6a'); }
  else toast(why, '❤'.repeat(SR.hp), '#ff6a6a');
}
function srAction() {
  if (card) { if (card.kind === 'talk') advanceTalk(); else hideCard(); return; }
  if (srCityAction()) return;
  if (SR.phase === 'boss' && SR.boss && SR.boss.st === 'rest' && Math.hypot(player.pos.x - SR.boss.g.position.x, player.pos.z - SR.boss.g.position.z) < 5) srBossHit();
}
function srHand(side) { hands[side].hold = true; if (SR.phase === 'boss' && SR.boss && SR.boss.st === 'rest' && Math.hypot(player.pos.x - SR.boss.g.position.x, player.pos.z - SR.boss.g.position.z) < 5) srBossHit(); }
// ---------- the Speedrun button (start screen + Esc menu) ----------
function srButtons() {
  const go = $('go'); if (go && !$('srGo')) { const b = document.createElement('button'); b.className = 'btn'; b.id = 'srGo'; b.type = 'button'; go.parentNode.appendChild(b); b.onclick = () => { if (!srUnlocked()) { srLockedMsg(b); return; } if (!started) { go.click(); setTimeout(startSpeedrun, 900); } else startSpeedrun(); }; }
  const sb = $('srGo'); if (sb) { sb.textContent = srUnlocked() ? '⏱ Speedrun' : '🔒 Speedrun'; sb.style.opacity = srUnlocked() ? '1' : '.6'; sb.disabled = go ? go.disabled : false; }
  const pl = $('pmLang'); if (pl && !$('pmSpeed')) { const row = document.createElement('div'); row.className = 'pauseBtns small'; row.innerHTML = `<button id="pmSpeed" type="button"></button>`; pl.parentNode.insertBefore(row, pl.nextSibling); $('pmSpeed').onclick = () => { if (!srUnlocked()) { srLockedMsg($('pmSpeed')); return; } closePause(true); startSpeedrun(); }; }
  const pb = $('pmSpeed'); if (pb) pb.textContent = srUnlocked() ? srL('⏱ Speedrun – pradėti', '⏱ Speedrun – start') : srL('🔒 Speedrun (užrakinta – įveik žaidimą)', '🔒 Speedrun (locked – beat the game)');
}
function srLockedMsg(b) { const old = b.textContent; b.textContent = srL('🔒 Įveik žaidimą, kad atrakintum!', '🔒 Beat the game to unlock!'); tone(220, 0.2, { type: 'square', vol: 0.04 }); setTimeout(() => { b.textContent = old; }, 1600); }
fx.push(() => { srButtons(); if (!SR.on) { if (SR.hud) SR.hud.hidden = true; if (SR.bossHud) SR.bossHud.hidden = true; } return true; });
function srTest(step) { if (typeof Q29 !== 'undefined') { Q29.stage = 'done'; saveQ29(); } startSpeedrun(); if (step) setTimeout(() => { hideCard(); card = null; SR.running = true; for (let i = 0; i < step; i++) { SR.parts.push(SR_Q[i].part); } SR.q = Math.min(step, 5); if (SR.q >= 5) { srClear(); SR.phase = 'build'; SR.q = 4; srGotPart(); } else srSetupQuest(); }, 1500); }
{ const _d = doTeleport; doTeleport = (...a) => { if (mode === 'sr') return; return _d(...a); }; }
{ const _s = spawnWorldPortal; spawnWorldPortal = (...a) => { if (SR.on) { toast(srL('Ne per speedrun!', 'Not during the speedrun!'), srL('Esc – išeiti iš speedrun', 'Esc – leave the speedrun'), '#ffd23a'); return; } return _s(...a); }; }
// during a speedrun the gods give no missions: no Creator's Hall, no gods' group
{ const _e = enterSanctum; enterSanctum = (...a) => { if (SR.on) { toast(srL('Per speedrun – ne! ⏱', 'Not during the speedrun! ⏱'), srL('Dievų misijų per speedrun imti negalima. Daryk Laikmačio Dievo įsakymus!', 'You can\'t take the gods\' missions during the speedrun. Do the Timer God\'s commandments!'), '#ffd23a'); return; } return _e(...a); }; }
{ const _g = godAnswer; godAnswer = txt => SR.on ? [[srL('Laikmačio Dievas', 'The Timer God'), srL('TIK-TAK! Per speedrun dievai misijų neduoda. Bėk daryti mano įsakymų!', 'TICK-TOCK! The gods give no missions during the speedrun. Run and do my commandments!')]] : _g(txt); }
