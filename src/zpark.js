// ================= PARKOUR WORLD (after you finish the game): a portal with a big "!" in the Start City =================
// Nine different sections climb higher and higher: stairs, sliding tiles, trampolines, crumbling tiles, thin bridges,
// lifts, ice, circling tiles and a mixed finale. Every section ends with a CHECKPOINT flag. At the top – a golden trophy.
const PKS = { cp: 0, done: false };
try { const s = JSON.parse(localStorage.getItem('modly-pk') || 'null'); if (s) Object.assign(PKS, s); } catch (_) { }
function savePk() { try { localStorage.setItem('modly-pk', JSON.stringify(PKS)); } catch (_) { } }
const pkScene = new THREE.Scene(); pkScene.background = new THREE.Color(0x8fd8ff); pkScene.fog = new THREE.Fog(0x8fd8ff, 80, 300);
pkScene.add(new THREE.AmbientLight(0xffffff, 0.55)); pkScene.add(new THREE.HemisphereLight(0xffffff, 0x6a8a5a, 0.7));
{ const sun = new THREE.DirectionalLight(0xffffff, 0.8); sun.position.set(40, 80, 30); pkScene.add(sun); }
const PK = { built: false, boxes: [], cps: [], flags: [], on: null, hud: null, exitA: null, exitB: null, trophy: null, prevY: 0, lastCp: -1 };
const PK_SECTIONS = [
  { lt: 'Laiptai', en: 'Stairs', col: 0xffb84a }, { lt: 'Slenkančios plytelės', en: 'Sliding tiles', col: 0x5ab0ff },
  { lt: 'Batutai', en: 'Trampolines', col: 0xff5ab0 }, { lt: 'Byrančios plytelės', en: 'Crumbling tiles', col: 0xc89a6a },
  { lt: 'Siauri tiltai', en: 'Thin bridges', col: 0x9a6aff }, { lt: 'Liftai', en: 'Lifts', col: 0x3ad8a0 },
  { lt: 'Ledas', en: 'Ice', col: 0xbff0ff }, { lt: 'Besisukančios plytelės', en: 'Circling tiles', col: 0xffe14d },
  { lt: 'Finalas', en: 'Finale', col: 0xff6a4a }
];
function pkBox(x, y, z, hx, hz, type, col, extra) {
  const thick = type === 'beam' ? 0.35 : 0.6;
  const m = S(G.box, type === 'ice' ? mat(0xd8f6ff, { roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.85 }) : mat(col, { roughness: 0.7 }), hx * 2, thick, hz * 2, x, y - thick / 2, z);
  pkScene.add(m);
  if (type === 'tramp') { const pad = S(G.cyl, mat(0xff2a8a, { emissive: 0x5a0a2a }), hx * 1.6, 0.25, hz * 1.6, x, y + 0.05, z); pkScene.add(pad); m.userData.pad = pad; }
  const b = Object.assign({ m, x, y, z, bx: x, by: y, bz: z, hx, hz, h: y, type, ph: 0, off: 0, crumbleT: -1, dx: 0, dy: 0, dz: 0 }, extra || {});
  PK.boxes.push(b); return b;
}
function buildPark() {
  if (PK.built) return; PK.built = true;
  // the grassy island below and the start
  pkScene.add(S(G.cyl, mat(0x6ac85a), 70, 1, 70, 0, -0.5, 0));
  for (let i = 0; i < 30; i++) { const a = rr(0, 6.28), d = rr(20, 64), h = rr(2, 5); const t = new THREE.Group(); t.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); t.add(S(G.cyl, mat(0x8a5a2b), 0.3, h, 0.3, 0, h / 2, 0)); t.add(S(G.sph, mat(pick([0x3ac84a, 0x5ae06a, 0x2a9a3a])), 1.8, 1.8, 1.8, 0, h + 1, 0)); pkScene.add(t); }
  for (let i = 0; i < 26; i++) { const c = S(G.sph, mat(0xffffff, { roughness: 1 }), rr(6, 12), rr(2, 4), rr(5, 9), rr(-160, 160), rr(20, 130), rr(-160, 160)); pkScene.add(c); }
  const start = pkBox(0, 0.01, 6, 5, 5, 'start', 0xe8e0d0); start.cp = 0;
  PK.cps.push({ x: 0, y: 0.01, z: 6, b: start });
  PK.exitA = makeWorldPortal(); PK.exitA.position.set(-3.2, 0, 9); pkScene.add(PK.exitA);
  { const s = makeSign(EN ? 'Parkour World' : 'Parkūro pasaulis'); s.position.set(3.4, 0, 9.5); s.scale.setScalar(1.8); pkScene.add(s); }
  // the course: each section turns left and climbs
  const dirs = [[0, -1], [-1, 0], [0, 1], [1, 0]];
  let cx = 0, cy = 0.01, cz = 1, di = 0;
  PK_SECTIONS.forEach((sec, si) => {
    const [fx, fz] = dirs[di % 4], sx = -fz, sz = fx, col = sec.col;
    const at = (f, s) => [cx + fx * f + sx * s, cz + fz * f + sz * s];
    let f = 2.2, y = cy;
    const add = (ff, yy, hx, hz, type, extra) => { const [x, z] = at(ff, 0); const along = Math.abs(fx) > 0; return pkBox(x, yy, z, along ? hx : hz, along ? hz : hx, type, col, extra); };
    if (si === 0) for (let i = 0; i < 8; i++) { f += 2.6; y += 0.95; add(f, y, 1.0, 1.0, 'step'); }
    if (si === 1) for (let i = 0; i < 6; i++) { f += 3.3; y += 0.55; add(f, y, 1.1, 1.1, 'slide', { amp: 2.6, sp: 1.1 + i * 0.12, ph: i * 1.3, ax: sx, az: sz }); }
    if (si === 2) for (let i = 0; i < 3; i++) { f += 3; add(f, y, 1.1, 1.1, 'tramp'); f += 3.2; y += 4.4; add(f, y, 1.3, 1.3, 'step'); }
    if (si === 3) for (let i = 0; i < 8; i++) { f += 2.8; y += 0.45; add(f, y, 0.95, 0.95, 'crumble'); }
    if (si === 4) for (let i = 0; i < 4; i++) { f += 1.8 + 3; y += 0.6; add(f, y, 3, 0.32, 'beam'); f += 3; }
    if (si === 5) for (let i = 0; i < 4; i++) { f += 3.3; y += 2.6; add(f, y, 1.2, 1.2, 'lift', { amp: 2.2, sp: 0.9, ph: i * 1.6 }); }
    if (si === 6) for (let i = 0; i < 7; i++) { f += 3.3; y += 0.6; add(f, y, 1.15, 1.15, 'ice'); }
    if (si === 7) for (let i = 0; i < 5; i++) { f += 4.2; y += 0.7; add(f, y, 1.1, 1.1, 'circle', { amp: 1.8, sp: 1.2, ph: i * 1.25 }); }
    if (si === 8) { const seq = ['slide', 'crumble', 'beam', 'lift', 'ice', 'circle', 'crumble', 'slide'];
      seq.forEach((tp, i) => { f += tp === 'beam' ? 4.4 : 3.4; y += tp === 'lift' ? 2.2 : 0.75; add(f, y, tp === 'beam' ? 2.4 : 1.05, tp === 'beam' ? 0.3 : 1.05, tp, { amp: tp === 'lift' ? 1.8 : 2.2, sp: 1.3, ph: i, ax: sx, az: sz }); if (tp === 'beam') f += 2.4; }); }
    // the checkpoint (or the golden finish at the very end)
    f += 3.6; y += 0.6; const last = si === PK_SECTIONS.length - 1;
    const [x, z] = at(f, 0); const cpb = pkBox(x, y, z, last ? 3.2 : 1.8, last ? 3.2 : 1.8, last ? 'finish' : 'cp', last ? 0xffd23a : 0x3ae85a);
    if (!last) { cpb.cp = si + 1; PK.cps.push({ x, y, z, b: cpb });
      const fg = new THREE.Group(); fg.position.set(x + 1.2, y, z + 1.2); fg.add(S(G.cyl, mat(0xdddddd), 0.06, 2.6, 0.06, 0, 1.3, 0)); const fl = S(G.box, mat(0xff4a4a, { emissive: 0x5a0a0a }), 1, 0.6, 0.05, 0.5, 2.25, 0); fg.add(fl); pkScene.add(fg); PK.flags.push(fl);
      const sg = makeSign(`${si + 2}. ${EN ? PK_SECTIONS[si + 1].en : PK_SECTIONS[si + 1].lt}`); sg.position.set(x - 1.2, y, z - 1.2); pkScene.add(sg); }
    else { cpb.cp = 'finish';
      const tr = new THREE.Group(); tr.position.set(x, y, z); tr.add(S(G.cyl, mat(0xffd23a, { metalness: 0.6, roughness: 0.3, emissive: 0x3a2a00 }), 0.5, 0.4, 0.5, 0, 0.2, 0)); tr.add(S(G.cyl, mat(0xffd23a, { metalness: 0.6, roughness: 0.3, emissive: 0x3a2a00 }), 0.15, 0.8, 0.15, 0, 0.8, 0)); tr.add(S(G.sph, mat(0xffd23a, { metalness: 0.6, roughness: 0.3, emissive: 0x5a3a00 }), 0.8, 0.7, 0.8, 0, 1.6, 0));
      const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffe14d, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(4); gl.position.y = 1.5; tr.add(gl); pkScene.add(tr); PK.trophy = tr;
      PK.exitB = makeWorldPortal(); PK.exitB.position.set(x + 2, y, z - 2); pkScene.add(PK.exitB); PK.finish = { x, y, z }; }
    cx = x; cy = y; cz = z; di++;
  });
  linearize(pkScene); PK.flags.forEach((fl, i) => pkFlag(fl, i + 1 <= PKS.cp));
}
function pkFlag(fl, on) { fl.material = mat(on ? 0x3ae85a : 0xff4a4a, { emissive: on ? 0x0a5a1a : 0x5a0a0a }); linearize(fl); }
function pkSpawn(atCp) {
  const c = PK.cps[Math.min(atCp, PK.cps.length - 1)] || PK.cps[0];
  player.pos.set(c.x, c.y + 0.05, c.z + (atCp === 0 ? 2 : 0)); player.vel.set(0, 0, 0); player.vr = 0; player.grounded = true; player.up.set(0, 1, 0); PK.on = c.b || null; PK.prevY = player.pos.y; PK.spawnT = 1.2;
  if (atCp === 0) player.fwd.set(0, 0, -1);
}
function enterPark() {
  buildPark(); mode = 'pk'; pkScene.add(player.mesh); player.mesh.visible = true; musicSet(3); setScope(false);
  try { localStorage.removeItem('modly-pos'); } catch (_) { }
  pkSpawn(PKS.cp); player.pitch = 0.3; camera.position.set(player.pos.x, player.pos.y + 6, player.pos.z + 10); camera.up.set(0, 1, 0);
  $('bName').textContent = EN ? 'Parkour World' : 'Parkūro pasaulis'; $('bEn').textContent = EN ? 'Climb to the golden cup!' : 'Lipk iki aukso taurės!';
  $('bAtm').textContent = EN ? 'Nine different sections, each one higher. Every section ends with a checkpoint flag.' : 'Devynios skirtingos dalys, kiekviena vis aukščiau. Kiekvienos gale – kontrolinio taško vėliava.';
  document.documentElement.style.setProperty('--biome', '#ffb84a');
  setTimeout(() => toast(EN ? 'PARKOUR WORLD! 🧗' : 'PARKŪRO PASAULIS! 🧗', EN ? 'Climb higher and higher. Green flags = checkpoints. E at the portal – home' : 'Lipk vis aukščiau. Žalios vėliavos – kontroliniai taškai. E prie portalo – namo', '#ffb84a'), 600);
}
function leavePark() { if (PK.hud) PK.hud.hidden = true; fadeTo(() => { cinema = null; portalToPlanet(); toast(EN ? 'Back in the Start City' : 'Grįžai į Pradžios Miestą', EN ? 'The parkour portal (!) waits for you here' : 'Parkūro portalas (!) tavęs čia laukia', '#ffb84a'); }); }
const nearPkExit = () => [PK.exitA, PK.exitB].some(e => e && Math.hypot(player.pos.x - e.position.x, player.pos.z - e.position.z) < 2.6 && Math.abs(player.pos.y - e.position.y) < 3);
function pkAction() {
  if (card) { if (card.kind === 'talk') advanceTalk(); else hideCard(); return; }
  if (nearPkExit()) { leavePark(); return; }
}
function updatePk(dt, t) {
  // move the moving platforms
  for (const b of PK.boxes) {
    const ox = b.x, oy = b.h, oz = b.z;
    if (b.type === 'slide') { const k = Math.sin(t * b.sp + b.ph) * b.amp; b.x = b.bx + b.ax * k; b.z = b.bz + b.az * k; }
    else if (b.type === 'lift') { b.h = b.by + Math.sin(t * b.sp + b.ph) * b.amp; }
    else if (b.type === 'circle') { b.x = b.bx + Math.cos(t * b.sp + b.ph) * b.amp; b.z = b.bz + Math.sin(t * b.sp + b.ph) * b.amp; }
    if (b.type === 'crumble') {
      if (b.crumbleT >= 0) { b.crumbleT += dt; b.m.position.x = b.x + Math.sin(t * 60) * 0.05; if (b.crumbleT > 0.7) { b.off = 2.6; b.crumbleT = -1; b.m.visible = false; tone(180, 0.2, { to: 90, type: 'square', vol: 0.03, lp: 900 }); } }
      if (b.off > 0) { b.off -= dt; if (b.off <= 0) { b.off = 0; b.m.visible = true; } }
    }
    b.dx = b.x - ox; b.dy = b.h - oy; b.dz = b.z - oz;
    if (b.type !== 'crumble' || b.crumbleT < 0) b.m.position.set(b.x, b.h - (b.type === 'beam' ? 0.175 : 0.3), b.z);
    if (b.m.userData.pad) b.m.userData.pad.position.set(b.x, b.h + 0.05, b.z);
  }
  // ride along with the platform you stand on
  if (PK.on && player.grounded) { player.pos.x += PK.on.dx; player.pos.z += PK.on.dz; player.pos.y += PK.on.dy; }
  const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 10 : 6.2; _mv.multiplyScalar(sp);
  const icy = player.grounded && PK.on && PK.on.type === 'ice';
  player.vel.lerp(_mv, Math.min(1, (icy ? 1.3 : player.grounded ? 10 : 4) * dt));
  if (keys.Space && player.grounded) { player.vr = 9; player.grounded = false; sfx.jump(); }
  player.vr -= 20 * dt; player.vr = Math.max(player.vr, -22);
  const py = player.pos.y; player.pos.addScaledVector(player.vel, dt); player.pos.y += player.vr * dt;
  let ground = 0, gb = null; const rad = 0.35;
  for (const b of PK.boxes) { if (b.off > 0) continue; const dx = player.pos.x - b.x, dz = player.pos.z - b.z; if (Math.abs(dx) > b.hx + rad || Math.abs(dz) > b.hz + rad) continue; if (py >= b.h - 0.35 && player.pos.y <= b.h + 0.02 && b.h > ground) { ground = b.h; gb = b; } else if (py >= b.h - 0.35 && b.h > ground && player.pos.y < b.h + 0.6 && player.vr <= 0) { /* above */ } }
  const wasG = player.grounded;
  if (player.pos.y <= ground) { player.pos.y = ground; if (player.vr < 0) player.vr = 0; player.grounded = true; PK.on = gb; if (!wasG && player.prevVr < -10) sfx.land && sfx.land(); } else { player.grounded = false; PK.on = null; }
  player.prevVr = player.vr;
  // special tiles
  if (PK.on) { const b = PK.on;
    if (b.type === 'tramp') { player.vr = 15.5; player.grounded = false; PK.on = null; tone(300, 0.25, { to: 900, type: 'sine', vol: 0.06 }); if (b.m.userData.pad) b.m.userData.pad.scale.y = 0.08; }
    else if (b.type === 'crumble' && b.crumbleT < 0 && !(b.off > 0)) b.crumbleT = 0;
    if (b.cp !== undefined) {
      if (b.cp === 'finish') { if (!PK.won) { PK.won = true; pkWin(); } }
      else if (b.cp > PKS.cp) { PKS.cp = b.cp; savePk(); pkFlag(PK.flags[b.cp - 1], true); [659, 880, 1175].forEach((fq, i) => tone(fq, 0.15, { type: 'triangle', vol: 0.05, when: i * 0.07 }));
        toast(EN ? `Checkpoint ${b.cp}/${PK.cps.length - 1}! 🚩` : `Kontrolinis taškas ${b.cp}/${PK.cps.length - 1}! 🚩`, EN ? `Next: ${PK_SECTIONS[b.cp].en}` : `Toliau: ${PK_SECTIONS[b.cp].lt}`, '#3ae85a'); }
    }
  }
  PK.boxes.forEach(b => { if (b.m.userData.pad && b.m.userData.pad.scale.y < 0.25) b.m.userData.pad.scale.y = Math.min(0.25, b.m.userData.pad.scale.y + dt * 0.6); });
  // fell down? back to your checkpoint
  const cp = PK.cps[PKS.cp] || PK.cps[0];
  PK.spawnT = Math.max(0, (PK.spawnT || 0) - dt);
  if (!(player.pos.y > -1e4 && player.pos.y < 1e4) || !isFinite(player.pos.x) || !isFinite(player.pos.z)) pkSpawn(PKS.cp);
  if (PK.spawnT <= 0 && (player.pos.y < cp.y - 9 || player.pos.y < -20 || (PKS.cp > 0 && player.grounded && !PK.on && player.pos.y < 0.2))) { pkSpawn(PKS.cp); redFlash('rgba(255,184,74,.4)', 300); toast(EN ? 'You fell…' : 'Nukritai…', PKS.cp > 0 ? (EN ? `Back to checkpoint ${PKS.cp}` : `Grįžai į kontrolinį tašką ${PKS.cp}`) : (EN ? 'Try again from the start' : 'Bandyk iš naujo nuo pradžios'), '#ffb84a'); }
  { const r = Math.hypot(player.pos.x, player.pos.z); if (r > 150) { player.pos.x *= 150 / r; player.pos.z *= 150 / r; } }
  player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd); animateMan(dt, f !== 0 || s !== 0, sp);
  const dist = 7, pitch = player.pitch;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
  camera.position.lerp(_ct, Math.min(1, dt * 8)); camera.up.set(0, 1, 0); camera.lookAt(player.pos.clone().add(new V3(0, 1.4, 0))); applyShake(dt);
  [PK.exitA, PK.exitB].forEach(e => { if (!e) return; const u = e.userData; u.sw.rotation.z -= dt * 3; u.ring.rotation.z += dt; });
  if (PK.trophy) PK.trophy.rotation.y += dt;
  // HUD
  if (!PK.hud) { const d = document.createElement('div'); d.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);background:rgba(60,30,0,.78);color:#fff0d8;border:1px solid rgba(255,184,74,.6);border-radius:14px;padding:6px 16px;font:700 14px system-ui,sans-serif;z-index:5;pointer-events:none;text-align:center'; document.body.appendChild(d); PK.hud = d; }
  PK.hud.hidden = !!card; const sec = PK_SECTIONS[Math.min(PKS.cp, PK_SECTIONS.length - 1)];
  PK.hud.innerHTML = `🧗 ${EN ? 'Parkour' : 'Parkūras'} · 🚩 <b>${PKS.cp}/${PK.cps.length - 1}</b> · ${EN ? sec.en : sec.lt} · ⬆ <b>${Math.max(0, Math.round(player.pos.y))} m</b>${PKS.done ? ' · 🏆' : ''}`;
  if (!card) setPrompt(nearPkExit() ? (EN ? '<kbd>E</kbd> go home through the portal' : '<kbd>E</kbd> grįžti namo per portalą') : '');
}
function pkWin() {
  bigBanner(EN ? 'PARKOUR DONE!' : 'PARKŪRAS ĮVEIKTAS!', EN ? 'You reached the golden cup at the very top!' : 'Pasiekei aukso taurę pačioje viršūnėje!');
  [523, 659, 784, 1047, 1319].forEach((fq, i) => tone(fq, 0.25, { type: 'triangle', vol: 0.06, when: i * 0.1 }));
  if (!PKS.done) { PKS.done = true; savePk(); addMoney(3000); setTimeout(() => toast('+3000 € 🏆', EN ? 'The portal next to the cup takes you home' : 'Portalas šalia taurės nuneš tave namo', '#ffd23a'), 2500); }
  else setTimeout(() => toast('🏆', EN ? 'You did it again! The portal next to the cup takes you home' : 'Vėl pavyko! Portalas šalia taurės nuneš namo', '#ffd23a'), 2500);
  PKS.cp = 0; savePk(); PK.flags.forEach(fl => pkFlag(fl, false));
  setTimeout(() => { PK.won = false; }, 8000);
}
// ---------- the portal with a big "!" in the Start City (only after you finished the game) ----------
const PK_SPOT = (() => { const a = 5.6; return cityDir(Math.cos(a) * 14, Math.sin(a) * 14); })();
let pkPortal = null;
function makePkPortal() {
  const g = makeWorldPortal(); g.userData.ring.material = bmat(0xffb84a);
  const ex = new THREE.Group(); ex.position.y = 4.6; g.add(ex); g.userData.ex = ex;
  const ym = mat(0xffd23a, { emissive: 0x6a4a00 }); ex.add(S(G.box, ym, 0.45, 1.3, 0.45, 0, 0.55, 0)); ex.add(S(G.sph, ym, 0.32, 0.32, 0.32, 0, -0.45, 0));
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffd23a, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(3.2); gl.position.y = 0.2; ex.add(gl);
  return g;
}
fx.push(dt => {
  const ready = typeof portalReady === 'function' && portalReady();
  if (ready && !pkPortal) { pkPortal = makePkPortal(); const d = PK_SPOT; pkPortal.position.copy(d).multiplyScalar(R + groundH(d)); orient(pkPortal, d, tangentToward(d, cityDir(0, 0))); scene.add(pkPortal); linearize(pkPortal); }
  if (!pkPortal) return true;
  pkPortal.visible = ready; const u = pkPortal.userData; u.sw.rotation.z -= dt * 3; u.ring.rotation.z += dt; u.ex.position.y = 4.6 + Math.sin(T * 3) * 0.25; u.ex.rotation.y += dt * 1.5;
  if (mode === 'planet' && ready && started && !card && !cinema && !transitioning) {
    const d = player.pos.distanceTo(pkPortal.position);
    if (d < 1.7) { transitioning = true; tone(300, 0.6, { to: 1500, type: 'sine', vol: 0.06 }); fadeTo(() => { transitioning = false; enterPark(); }); }
    else if (d < 5) setPrompt(EN ? '<kbd>E</kbd> / walk in – PARKOUR WORLD' : '<kbd>E</kbd> / įeik – PARKŪRO PASAULIS');
  }
  return true;
});
addEventListener('keydown', e => {
  if (e.code !== 'KeyE' || mode !== 'planet' || !pkPortal || !pkPortal.visible || card || cinema || transitioning) return;
  if (player.pos.distanceTo(pkPortal.position) < 5) { e.stopImmediatePropagation(); transitioning = true; fadeTo(() => { transitioning = false; enterPark(); }); }
}, true);
// no teleporting, world-portals or flying past the course
{ const _d = doTeleport; doTeleport = (...a) => { if (mode === 'pk') { toast(EN ? 'No teleporting here!' : 'Čia teleportuotis negalima!', EN ? 'Parkour is climbed on foot 🧗' : 'Parkūras lipamas kojomis 🧗', '#ffb84a'); return; } return _d(...a); }; }
{ const _s = spawnWorldPortal; spawnWorldPortal = (...a) => { if (mode === 'pk') { toast(EN ? 'Not here!' : 'Čia negalima!', EN ? 'Use the portal at the start or at the cup' : 'Naudok portalą prie starto arba prie taurės', '#ffb84a'); return; } return _s(...a); }; }
fx.push(() => { if (PK.hud && mode !== 'pk') PK.hud.hidden = true; return true; });
function pkTest(cp) { if (typeof Q29 !== 'undefined') { Q29.stage = 'done'; try { saveQ29(); } catch (_) { } } PKS.cp = cp || 0; savePk(); hideCard(); enterPark(); }
