// ================= car shop: free cars, each with its own trick on Space =================
let ride = null;            // what the traveller is sitting on/in right now (the pig or the car)
let carShopOpen = false, garageOpen = false;
const garage = [];          // ids of cars you got from the shop
const auto = { exists: false, pos: new V3(), fwd: new V3(0, 0, 1), vel: new V3(), vr: 0, up: new V3(0, 1, 0), speed: 0, grounded: true, wheelSpin: 0, spec: null, mesh: null, siren: null, boost: 0, flash: 0 };
function wheel(g, x, z, r, w, list, col = 0x222228) {
  const m = mesh(new THREE.CylinderGeometry(r, r, w, 16), mat(col), x, r, z); m.rotation.z = Math.PI / 2; g.add(m);
  m.add(S(G.cyl, mat(0xc8ccd6), r * 0.45, 1.02, r * 0.45)); list.push(m); return m;
}
const glass = () => mat(0x9fc8e8, { transparent: true, opacity: 0.38, metalness: 0.3, roughness: 0.05 });
const paint = c => mat(c, { metalness: 0.45, roughness: 0.28 });
const CARS = [
  { id: 'hatch', name: 'Mažylis', desc: 'Mažas, patogus ir visada užsiveda.', top: 22, accel: 14, turn: 2.2, len: 3.6, wid: 1.8, cam: 9, seat: [-0.35, 0.55, 0.1], trick: 'horn', trickName: 'pyptelėti',
    make(w) { const g = new THREE.Group(), c = paint(0x3fbf8a); g.add(S(G.box, c, 1.8, 0.7, 3.4, 0, 0.75, 0)); g.add(S(G.box, glass(), 1.6, 0.6, 1.7, 0, 1.35, -0.2)); g.add(S(G.box, c, 1.62, 0.1, 1.72, 0, 1.68, -0.2));
      for (const [x, z] of [[-0.9, 1.1], [0.9, 1.1], [-0.9, -1.1], [0.9, -1.1]]) wheel(g, x, z, 0.42, 0.3, w);
      g.add(S(G.box, bmat(0xfff3a0), 0.35, 0.18, 0.05, -0.55, 0.85, 1.71)); g.add(S(G.box, bmat(0xfff3a0), 0.35, 0.18, 0.05, 0.55, 0.85, 1.71)); return g; } },
  { id: 'sport', name: 'Raudonas Žaibas', desc: 'Žemas, greitas ir labai raudonas.', top: 40, accel: 26, turn: 2.4, len: 4.2, wid: 1.9, cam: 10, seat: [-0.35, 0.35, -0.2], trick: 'horn', trickName: 'pyptelėti',
    make(w) { const g = new THREE.Group(), c = paint(0xe8262e); g.add(S(G.box, c, 1.9, 0.5, 4.2, 0, 0.55, 0)); g.add(S(G.box, glass(), 1.5, 0.45, 1.6, 0, 1.0, -0.3));
      const nose = S(G.box, c, 1.9, 0.25, 1.1, 0, 0.62, 1.75); nose.rotation.x = 0.15; g.add(nose);
      g.add(S(G.box, mat(0x111111), 1.9, 0.08, 0.4, 0, 1.15, -1.95)); for (const x of [-0.8, 0.8]) g.add(S(G.box, mat(0x111111), 0.08, 0.4, 0.1, x, 0.95, -1.9));
      for (const [x, z] of [[-0.95, 1.3], [0.95, 1.3], [-0.95, -1.3], [0.95, -1.3]]) wheel(g, x, z, 0.4, 0.35, w);
      for (const x of [-0.6, 0.6]) g.add(S(G.box, bmat(0xffffff), 0.4, 0.1, 0.05, x, 0.7, 2.11)); return g; } },
  { id: 'monster', name: 'Pabaisa', desc: 'Milžiniški ratai. Space – šuolis per viską.', top: 24, accel: 14, turn: 1.8, len: 4, wid: 3, cam: 12, seat: [-0.4, 1.9, 0], trick: 'jump', trickName: 'šuolis',
    make(w) { const g = new THREE.Group(), c = paint(0x7a3cff); g.add(S(G.box, mat(0x30343e), 1.6, 0.4, 3.2, 0, 1.4, 0)); g.add(S(G.box, c, 2.2, 0.8, 3.4, 0, 2.1, 0)); g.add(S(G.box, glass(), 1.8, 0.7, 1.6, 0, 2.85, -0.2)); g.add(S(G.box, c, 1.82, 0.1, 1.62, 0, 3.25, -0.2));
      for (const [x, z] of [[-1.3, 1.3], [1.3, 1.3], [-1.3, -1.3], [1.3, -1.3]]) wheel(g, x, z, 1.0, 0.8, w, 0x1a1a1a);
      for (const x of [-0.6, 0.6]) g.add(S(G.cyl, bmat(0xfff3a0), 0.15, 0.1, 0.15, x, 3.35, 0.4)); return g; } },
  { id: 'bus', name: 'Mokyklinis autobusas', desc: 'Ilgas, geltonas ir lėtas. Vietų – daug.', top: 15, accel: 7, turn: 1.2, len: 8, wid: 2.4, cam: 15, seat: [-0.7, 0.95, 3.2], trick: 'horn', trickName: 'pyptelėti',
    make(w) { const g = new THREE.Group(), c = paint(0xffc72c); g.add(S(G.box, c, 2.4, 2.2, 8, 0, 1.75, 0)); g.add(S(G.box, mat(0x111111), 2.42, 0.12, 8.02, 0, 1.3, 0));
      for (let i = 0; i < 6; i++) for (const x of [-1.21, 1.21]) g.add(S(G.box, glass(), 0.03, 0.7, 0.9, x, 2.2, -3 + i * 1.15));
      g.add(S(G.box, glass(), 2.1, 0.9, 0.05, 0, 2.2, 4.0)); g.add(mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshBasicMaterial({ map: labelTex('MOKYKLA', '#111', '#ffc72c', 256, 64), side: THREE.DoubleSide }), 0, 3.05, 4.02));
      for (const [x, z] of [[-1.15, 2.8], [1.15, 2.8], [-1.15, -2.8], [1.15, -2.8]]) wheel(g, x, z, 0.55, 0.4, w); return g; } },
  { id: 'police', name: 'Policija', desc: 'Space – sirena ir mirksintys švyturėliai.', top: 32, accel: 20, turn: 2.2, len: 4.2, wid: 1.9, cam: 10, seat: [-0.35, 0.55, 0], trick: 'siren', trickName: 'sirena',
    make(w) { const g = new THREE.Group(), wh = paint(0xffffff), bl = paint(0x1e2a6e); g.add(S(G.box, wh, 1.9, 0.7, 4.2, 0, 0.75, 0)); g.add(S(G.box, bl, 1.92, 0.25, 4.22, 0, 0.6, 0)); g.add(S(G.box, glass(), 1.6, 0.6, 2.0, 0, 1.4, -0.2)); g.add(S(G.box, wh, 1.62, 0.1, 2.02, 0, 1.74, -0.2));
      const r = S(G.box, new THREE.MeshBasicMaterial({ color: 0xff2020 }), 0.5, 0.18, 0.3, -0.3, 1.88, -0.2), b = S(G.box, new THREE.MeshBasicMaterial({ color: 0x2060ff }), 0.5, 0.18, 0.3, 0.3, 1.88, -0.2); g.add(r, b); g.userData.lights = [r, b];
      { const _o = mesh(new THREE.PlaneGeometry(1.4, 0.3), new THREE.MeshBasicMaterial({ map: labelTex('POLICIJA', '#1e2a6e', '#ffffff', 256, 56), side: THREE.DoubleSide }), 0.96, 0.8, 0); _o.rotation.y = Math.PI / 2; g.add(_o); }
      for (const [x, z] of [[-0.95, 1.3], [0.95, 1.3], [-0.95, -1.3], [0.95, -1.3]]) wheel(g, x, z, 0.42, 0.32, w); return g; } },
  { id: 'fire', name: 'Gaisrinė', desc: 'Raudona, su kopėčiomis ir labai garsi.', top: 22, accel: 11, turn: 1.5, len: 7, wid: 2.4, cam: 14, seat: [-0.6, 1.0, 2.6], trick: 'siren', trickName: 'sirena',
    make(w) { const g = new THREE.Group(), c = paint(0xd9241e); g.add(S(G.box, c, 2.4, 1.6, 7, 0, 1.5, 0)); g.add(S(G.box, c, 2.4, 1.0, 2, 0, 2.7, 2.5)); g.add(S(G.box, glass(), 2.2, 0.7, 0.05, 0, 2.7, 3.51));
      for (let i = 0; i < 8; i++) g.add(S(G.box, mat(0xc8ccd6), 1.2, 0.06, 0.06, 0, 2.45, -3 + i * 0.6)); for (const x of [-0.6, 0.6]) g.add(S(G.box, mat(0xc8ccd6), 0.06, 0.08, 5, x, 2.45, -0.6));
      const r = S(G.box, new THREE.MeshBasicMaterial({ color: 0xff2020 }), 0.4, 0.2, 0.3, -0.5, 3.3, 2.5), b = S(G.box, new THREE.MeshBasicMaterial({ color: 0xff9020 }), 0.4, 0.2, 0.3, 0.5, 3.3, 2.5); g.add(r, b); g.userData.lights = [r, b];
      for (const [x, z] of [[-1.15, 2.4], [1.15, 2.4], [-1.15, -2.4], [1.15, -2.4]]) wheel(g, x, z, 0.55, 0.4, w); return g; } },
  { id: 'icecream', name: 'Ledų furgonas', desc: 'Space – groja ledų melodija.', top: 18, accel: 10, turn: 1.7, len: 5, wid: 2.2, cam: 12, seat: [-0.5, 0.75, 1.4], trick: 'jingle', trickName: 'melodija',
    make(w) { const g = new THREE.Group(), c = paint(0xffd1e8); g.add(S(G.box, c, 2.2, 2.2, 5, 0, 1.55, 0)); g.add(S(G.box, mat(0x9fe3ff), 2.22, 0.4, 5.02, 0, 0.75, 0)); g.add(S(G.box, glass(), 2.0, 0.8, 0.05, 0, 2.0, 2.51));
      g.add(S(G.box, bmat(0x2a1a2a), 0.03, 1.0, 1.8, 1.11, 1.9, -0.6));
      const cone = new THREE.Group(); cone.position.set(0, 3.0, -0.5); cone.add(S(G.cone, mat(0xe0a050), 0.4, 1.0, 0.4, 0, 0, 0)); cone.children[0].rotation.x = Math.PI; cone.add(S(G.sph, mat(0xff8fc0), 0.45, 0.4, 0.45, 0, 0.6, 0)); cone.add(S(G.sph, mat(0xfff8e0), 0.4, 0.35, 0.4, 0, 1.0, 0)); g.add(cone);
      for (const [x, z] of [[-1.05, 1.7], [1.05, 1.7], [-1.05, -1.7], [1.05, -1.7]]) wheel(g, x, z, 0.45, 0.35, w); return g; } },
  { id: 'kart', name: 'Kartingas', desc: 'Mažytis ir labai vikrus. Sukasi vietoje.', top: 30, accel: 30, turn: 3.6, len: 2.2, wid: 1.4, cam: 7, seat: [0, 0.25, -0.2], trick: 'horn', trickName: 'pyptelėti', open: true,
    make(w) { const g = new THREE.Group(), c = paint(0x30c4ff); g.add(S(G.box, mat(0x30343e), 1.3, 0.12, 2.1, 0, 0.3, 0)); g.add(S(G.box, c, 1.0, 0.3, 0.6, 0, 0.45, 0.75)); g.add(S(G.box, c, 0.8, 0.5, 0.15, 0, 0.6, -0.55));
      { const _o = mesh(new THREE.TorusGeometry(0.18, 0.03, 6, 16), mat(0x111111), 0, 0.7, 0.25); _o.rotation.x = -0.6; g.add(_o); }
      for (const [x, z] of [[-0.65, 0.75], [0.65, 0.75], [-0.65, -0.75], [0.65, -0.75]]) wheel(g, x, z, 0.28, 0.25, w); return g; } },
  { id: 'limo', name: 'Limuzinas', desc: 'Labai ilgas, juodas ir labai solidus.', top: 26, accel: 12, turn: 1.3, len: 8, wid: 2, cam: 14, seat: [-0.4, 0.55, 2.2], trick: 'horn', trickName: 'pyptelėti',
    make(w) { const g = new THREE.Group(), c = paint(0x16161c); g.add(S(G.box, c, 2.0, 0.75, 8, 0, 0.8, 0)); g.add(S(G.box, glass(), 1.7, 0.55, 6.4, 0, 1.4, -0.4)); g.add(S(G.box, c, 1.72, 0.1, 6.42, 0, 1.72, -0.4));
      g.add(S(G.box, mat(0xc8ccd6), 2.02, 0.06, 8.02, 0, 0.95, 0)); for (const x of [-0.6, 0.6]) g.add(S(G.box, bmat(0xffffff), 0.4, 0.12, 0.05, x, 0.9, 4.01));
      for (const [x, z] of [[-1.0, 3], [1.0, 3], [-1.0, -3], [1.0, -3]]) wheel(g, x, z, 0.42, 0.3, w); return g; } },
  { id: 'rocket', name: 'Raketinis bolidas', desc: 'Space – raketos įjungimas. Laikykis!', top: 34, accel: 18, turn: 2.0, len: 4.4, wid: 1.8, cam: 11, seat: [0, 0.45, -0.3], trick: 'boost', trickName: 'raketa', open: true,
    make(w) { const g = new THREE.Group(), c = paint(0xc0c8d8); const body = S(G.cyl, c, 0.7, 4.0, 0.7, 0, 0.75, 0); body.rotation.x = Math.PI / 2; g.add(body);
      const nose = S(G.cone, mat(0xff4d4d), 0.7, 1.2, 0.7, 0, 0.75, 2.6); nose.rotation.x = Math.PI / 2; g.add(nose);
      for (const x of [-1, 1]) { const f = S(G.box, mat(0xff4d4d), 0.08, 0.8, 1.0, x * 0.75, 1.1, -1.6); f.rotation.z = x * 0.4; g.add(f); }
      const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireTex, color: 0xff8030, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); flame.position.set(0, 0.75, -2.6); flame.scale.setScalar(0.1); g.add(flame); g.userData.flame = flame;
      for (const [x, z] of [[-0.85, 1.2], [0.85, 1.2], [-0.85, -1.2], [0.85, -1.2]]) wheel(g, x, z, 0.38, 0.3, w); return g; } }
];

function spawnAuto(id, d, fwd) {
  const spec = CARS.find(c => c.id === id); if (!spec) return;
  if (auto.mesh) world.remove(auto.mesh);
  stopSiren();
  const wheels = []; auto.mesh = spec.make(wheels); auto.mesh.userData.wheels = wheels; world.add(auto.mesh);
  auto.spec = spec; auto.exists = true;
  auto.pos.copy(d).multiplyScalar(R + groundH(d) + 1); auto.up.copy(d);
  auto.fwd.copy(fwd).addScaledVector(d, -fwd.dot(d)).normalize();
  auto.vel.set(0, 0, 0); auto.vr = 0; auto.speed = 0; auto.boost = 0;
  try { localStorage.setItem('modly-car', id); } catch (_) { }
}
// ---------- specials ----------
function stopSiren() { if (auto.siren) { try { auto.siren.o.stop(); auto.siren.l.stop(); } catch (_) { } auto.siren = null; } }
function toggleSiren() {
  if (auto.siren) { stopSiren(); return; }
  const a = SND.ctx; if (!a) return;
  const o = a.createOscillator(), l = a.createOscillator(), lg = a.createGain(), g = a.createGain();
  o.type = 'square'; o.frequency.value = 760; l.frequency.value = auto.spec.id === 'fire' ? 0.8 : 1.6; lg.gain.value = 180;
  l.connect(lg); lg.connect(o.frequency); g.gain.value = 0.035; const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2200;
  o.connect(f); f.connect(g); g.connect(SND.sfx); o.start(); l.start(); auto.siren = { o, l, g };
}
function jingle() { [0, 4, 7, 12, 7, 4, 0, 2, 4, 2, 0].forEach((s, i) => tone(784 * Math.pow(2, s / 12), 0.2, { type: 'triangle', vol: 0.06, when: i * 0.17 })); }
function carTrick() {
  const s = auto.spec; if (!s) return;
  if (s.trick === 'jump') { if (auto.grounded) { auto.vr = 12; sfx.jump(); tone(120, 0.4, { to: 60, vol: 0.12 }); } }
  else if (s.trick === 'siren') toggleSiren();
  else if (s.trick === 'jingle') jingle();
  else if (s.trick === 'boost') { if (auto.boost <= 0) { auto.boost = 2.5; noiseHit(2.5, { f: 1800, fto: 400, vol: 0.25 }); tone(90, 2.5, { to: 50, type: 'sawtooth', vol: 0.06, lp: 400 }); } }
  else if (s.trick === 'hook') { if (!q7Hook() && !q13Hook()) sfx.horn(camera.position); }
  else sfx.horn(camera.position);
}
// ---------- driving ----------
function driveAuto(dt) {
  const s = auto.spec, thr = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), steer = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  const boostOn = auto.boost > 0;
  const top = s.top * (keys.ShiftLeft || keys.ShiftRight ? 1.3 : 1) * (boostOn ? 1.8 : 1);
  if (auto.grounded || boostOn) {
    auto.speed += (boostOn ? s.accel * 1.5 : thr * (thr * auto.speed < 0 ? s.accel * 2 : s.accel)) * dt;
    auto.speed *= Math.max(0, 1 - (thr === 0 && !boostOn ? 1.2 : 0.08) * dt);
    auto.speed = clamp(auto.speed, -s.top * 0.35, top);
  }
  const turnK = clamp(Math.abs(auto.speed) / 6, 0.15, 1) * Math.sign(auto.speed || 1);
  auto.fwd.applyAxisAngle(auto.up, -steer * s.turn * turnK * dt);
  _mv.copy(auto.fwd).multiplyScalar(auto.speed);
  auto.vel.lerp(_mv, auto.grounded ? Math.min(1, 6 * dt) : Math.min(1, 0.4 * dt));
  const sp0 = Math.abs(auto.speed);
  stepPlanet(auto, dt, s.wid / 2 + 0.2);
  // a hard crash into a wall stops the car
  const moved = auto.vel.length();
  if (sp0 > 10 && moved < sp0 * 0.25 && auto.grounded) { sfx.hit(); shake = Math.max(shake, 0.35); auto.speed *= -0.2; }
  player.pos.copy(auto.pos); player.up.copy(auto.up);
  const reach = s.len / 2 + 0.6, fast = Math.abs(auto.speed) > 4;
  if (fast) {
    for (const c of critters) if (c.knocked <= 0 && c.pos.distanceTo(auto.pos) < reach) knockCritter(c, auto.fwd.clone().addScaledVector(randDir(), 0.4).normalize(), Math.abs(auto.speed) * 0.8 + 4);
    for (const pt of pets) if (pt.knocked <= 0 && pt.pos.distanceTo(auto.pos) < reach) knockPet(pt, auto.fwd.clone().addScaledVector(randDir(), 0.4).normalize(), Math.abs(auto.speed) * 0.6 + 4);
    for (const b of bodies) if (!b.held && b.pos.distanceTo(auto.pos) < reach) { b.vel.copy(auto.fwd).multiplyScalar(Math.abs(auto.speed) * 1.1); b.vr = 7; b.grounded = false; b.spin.set(rr(-8, 8), rr(-8, 8), rr(-8, 8)); }
  }
}
let engineT = 0;
function updateAuto(dt, t) {
  if (!auto.exists) return;
  const riding = player.inCar && ride === auto;
  if (!riding) { auto.vel.multiplyScalar(Math.max(0, 1 - 3 * dt)); auto.speed *= Math.max(0, 1 - 3 * dt); stepPlanet(auto, dt, auto.spec.wid / 2 + 0.2); }
  auto.boost = Math.max(0, auto.boost - dt);
  auto.mesh.position.copy(auto.pos); orient(auto.mesh, auto.up, auto.fwd);
  auto.wheelSpin += auto.speed * dt / 0.45; auto.mesh.userData.wheels.forEach(w => w.rotation.x = auto.wheelSpin);
  const ud = auto.mesh.userData;
  if (ud.lights) { const on = !!auto.siren, ph = Math.floor(t * 6) % 2; ud.lights[0].material.color.setHex(on && ph ? 0xff2020 : 0x551010); ud.lights[1].material.color.setHex(on && !ph ? (auto.spec.id === 'fire' ? 0xff9020 : 0x2060ff) : 0x101a55); }
  if (ud.flame) ud.flame.scale.setScalar(auto.boost > 0 ? 2.2 + Math.random() * 0.8 : 0.01);
  if (auto.siren && SND.ctx) auto.siren.g.gain.setTargetAtTime(0.04 * distVol(auto.pos), SND.ctx.currentTime, 0.1);
  if (riding) {
    // the traveller sits behind the wheel, a bit smaller so he fits
    const p = player.mesh.userData.parts, s = auto.spec;
    player.mesh.scale.setScalar(s.open ? 0.75 : 0.6);
    player.mesh.position.copy(auto.pos).addScaledVector(auto.up, s.seat[1]).addScaledVector(auto.fwd, s.seat[2]).addScaledVector(new V3().crossVectors(auto.up, auto.fwd), -s.seat[0]);
    orient(player.mesh, auto.up, auto.fwd);
    p.legL.rotation.set(-1.4, 0, 0); p.legR.rotation.set(-1.4, 0, 0); p.armL.rotation.set(-1.1, 0, -0.2); p.armR.rotation.set(-1.1, 0, 0.2); p.body.position.y = 0; p.body.rotation.x = 0;
    engineT -= dt; if (engineT < 0 && SND.ctx) { engineT = 0.12; const f = 50 + Math.abs(auto.speed) * 4; tone(f, 0.14, { type: 'sawtooth', vol: 0.025, lp: 300 + f * 3 }); }
  }
}
function exitAuto() {
  player.inCar = false; ride = null; player.mesh.visible = true; player.mesh.scale.setScalar(1);
  const right = new V3().crossVectors(auto.fwd, auto.up);
  player.pos.copy(auto.pos).addScaledVector(right, -(auto.spec.wid / 2 + 1.2)).addScaledVector(auto.up, 0.5); player.fwd.copy(auto.fwd); player.vel.set(0, 0, 0); player.vr = 0;
  const p = player.mesh.userData.parts; p.legL.rotation.set(0, 0, 0); p.legR.rotation.set(0, 0, 0); p.body.rotation.x = 0;
  auto.speed *= 0.5;
}
function enterAuto() {
  cancelPlace(true); stopClimb(); dropAll(); hideCard();
  player.inCar = true; ride = auto;
  sfx.blip(); tone(60, 0.6, { to: 110, type: 'sawtooth', vol: 0.06, lp: 500 });
  toast(auto.spec.name, `Pelė – kryptis · W/S – greitis · Shift – greičiau · Space – ${auto.spec.trickName}`, '#ffd23a');
}

// ---------- the shop ----------
function buildCarKiosk() {
  const a = 2.92, d = cityDir(Math.cos(a) * 14, Math.sin(a) * 14);
  const g = new THREE.Group(); g.position.copy(surf(d)); orient(g, d, tangentToward(d, UP)); world.add(g);
  g.add(S(G.box, mat(0x30343e), 3.4, 2.6, 1.2, 0, 1.3, -0.8));
  for (const sx of [-1.6, 1.6]) g.add(S(G.box, mat(0x30343e), 0.2, 2.9, 2.3, sx, 1.45, -0.05));
  g.add(S(G.box, mat(0xe8262e), 3.5, 1.0, 0.5, 0, 0.5, 1.15));
  g.add(S(G.box, mat(0xffffff), 3.6, 0.1, 0.7, 0, 1.05, 1.15));
  for (let i = 0; i < 6; i++) { const st = S(G.box, mat(i % 2 ? 0xffffff : 0x111111), 0.62, 0.1, 1.8, -1.55 + i * 0.62, 3.0, 0.95); st.rotation.x = 0.35; g.add(st); }
  g.add(mesh(new THREE.PlaneGeometry(3.6, 0.8), new THREE.MeshBasicMaterial({ map: labelTex('MAŠINŲ PARDUOTUVĖ', '#e8262e', '#ffffff', 640, 128), side: THREE.DoubleSide }), 0, 3.75, 0.6));
  const toy = CARS[1].make([]); toy.scale.setScalar(0.22); toy.position.set(-0.9, 1.1, 1.15); toy.rotation.y = 0.6; g.add(toy);
  const toy2 = CARS[2].make([]); toy2.scale.setScalar(0.16); toy2.position.set(0.9, 1.1, 1.15); toy2.rotation.y = -0.5; g.add(toy2);
  const seller = makePerson(); seller.position.set(0, 0, 0.35); g.add(seller);
  seller.add(S(G.box, mat(0xe8262e), 0.62, 0.1, 0.62, 0, 2.0, 0.05)); seller.add(S(G.box, mat(0xe8262e), 0.55, 0.16, 0.5, 0, 2.08, -0.02));
  animators.push((dt, t) => { seller.userData.body.rotation.y = Math.sin(t * 1.1) * 0.4; toy.rotation.y = 0.6 + t * 0.6; });
  addBox(g, 1.8, 1.5, 2.8, 0, 0.1);
  addInspect(surf(d, 1).addScaledVector(tangentToward(d, UP), 1.5), 'Mašinų parduotuvė', '', 5.5, { verb: 'atidaryti mašinų parduotuvę', onUse: openCarShop });
}
function carSvg(id) {
  const W = (x, r = 7) => `<circle cx="${x}" cy="${48 - (r - 7)}" r="${r}" fill="#222"/><circle cx="${x}" cy="${48 - (r - 7)}" r="${r * 0.45}" fill="#c8ccd6"/>`;
  const A = {
    hatch: `<rect x="18" y="30" width="62" height="16" rx="5" fill="#3fbf8a"/><path d="M30 30 L36 18 L64 18 L70 30 Z" fill="#bfe8ff" stroke="#3fbf8a" stroke-width="3"/>${W(32)}${W(68)}`,
    sport: `<path d="M10 42 L16 32 L40 28 L50 20 L68 20 L80 30 L92 34 L92 42 Z" fill="#e8262e"/><path d="M44 28 L52 22 L66 22 L74 29 Z" fill="#bfe8ff"/><rect x="8" y="24" width="10" height="3" fill="#111"/>${W(28)}${W(76)}`,
    monster: `<rect x="22" y="14" width="56" height="16" rx="3" fill="#7a3cff"/><path d="M36 14 L40 4 L62 4 L66 14 Z" fill="#bfe8ff" stroke="#7a3cff" stroke-width="3"/>${W(30, 13)}${W(70, 13)}`,
    bus: `<rect x="6" y="14" width="88" height="30" rx="4" fill="#ffc72c"/><rect x="6" y="30" width="88" height="3" fill="#111"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${12 + i * 15}" y="18" width="11" height="9" fill="#bfe8ff"/>`).join('')}${W(22)}${W(78)}`,
    police: `<rect x="14" y="30" width="72" height="14" rx="4" fill="#fff" stroke="#ccc"/><rect x="14" y="37" width="72" height="4" fill="#1e2a6e"/><path d="M30 30 L36 19 L64 19 L70 30 Z" fill="#bfe8ff" stroke="#fff" stroke-width="3"/><rect x="44" y="13" width="6" height="5" fill="#ff2020"/><rect x="50" y="13" width="6" height="5" fill="#2060ff"/>${W(28)}${W(72)}`,
    fire: `<rect x="8" y="22" width="84" height="22" rx="3" fill="#d9241e"/><rect x="66" y="12" width="26" height="14" fill="#d9241e"/><rect x="70" y="15" width="18" height="8" fill="#bfe8ff"/><rect x="12" y="17" width="50" height="3" fill="#c8ccd6"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${14 + i * 8}" y="15" width="2" height="7" fill="#c8ccd6"/>`).join('')}${W(22)}${W(78)}`,
    icecream: `<rect x="14" y="16" width="72" height="28" rx="5" fill="#ffd1e8"/><rect x="14" y="36" width="72" height="5" fill="#9fe3ff"/><rect x="66" y="20" width="16" height="10" fill="#bfe8ff"/><path d="M42 4 L48 16 L36 16 Z" fill="#e0a050" transform="rotate(180 42 10)"/><circle cx="42" cy="3" r="6" fill="#ff8fc0"/>${W(28)}${W(72)}`,
    kart: `<rect x="22" y="36" width="56" height="6" fill="#30343e"/><rect x="56" y="30" width="20" height="8" fill="#30c4ff"/><rect x="30" y="26" width="6" height="12" fill="#30c4ff"/><circle cx="46" cy="22" r="6" fill="#7dff6b"/>${W(30, 6)}${W(72, 6)}`,
    limo: `<rect x="4" y="30" width="92" height="14" rx="4" fill="#16161c"/><path d="M14 30 L18 22 L80 22 L86 30 Z" fill="#bfe8ff" stroke="#16161c" stroke-width="3"/>${W(18)}${W(82)}`,
    tractor: `<rect x="30" y="22" width="40" height="16" fill="#2fae4a"/><rect x="28" y="6" width="24" height="18" fill="#bfe8ff" stroke="#2fae4a" stroke-width="3"/><rect x="60" y="10" width="4" height="12" fill="#30343e"/><circle cx="34" cy="42" r="13" fill="#222"/><circle cx="34" cy="42" r="6" fill="#ffd23a"/><circle cx="74" cy="46" r="8" fill="#222"/><circle cx="74" cy="46" r="4" fill="#ffd23a"/>`,
    rocket: `<rect x="14" y="28" width="64" height="14" rx="7" fill="#c0c8d8"/><path d="M78 28 L94 35 L78 42 Z" fill="#ff4d4d"/><path d="M18 28 L10 16 L24 28 Z" fill="#ff4d4d"/><circle cx="8" cy="35" r="6" fill="#ff8030"/>${W(28)}${W(68)}`
  };
  return `<svg viewBox="0 0 100 60" aria-hidden="true"><rect x="0" y="55" width="100" height="5" fill="#4d525e"/>${A[id] || ''}</svg>`;
}
function buildCarUI() {
  $('carGrid').innerHTML = CARS.map((c, i) => c.secret ? '' : `<button class="hcard" data-i="${i}"><div class="hpic">${carSvg(c.id)}</div><div class="hname">${c.name}</div><div class="hdesc">${c.desc}</div><div class="hfoot"><span class="hsize">iki ${Math.round(c.top * 3.6)} km/h</span><span class="hprice">${PRICE.car[c.id]} €</span></div>${i < 9 ? `<kbd class="hkey">${i + 1}</kbd>` : ''}</button>`).join('');
  $('carGrid').querySelectorAll('.hcard').forEach(b => b.addEventListener('click', () => pickCar(+b.dataset.i)));
  $('carClose').addEventListener('click', () => closeCarShop(true));
  $('garageClose').addEventListener('click', () => closeGarage(true));
}
function openCarShop() {
  markPrices('carGrid', 'car', k => CARS[k].id, id => garage.includes(id));
  if (carShopOpen) return;
  carShopOpen = true; cancelPlace(true); for (const k in keys) keys[k] = false; hands.L.hold = hands.R.hold = false;
  $('carShop').hidden = false; $('paused').hidden = true;
  $('carNow').textContent = auto.exists ? `Dabar tavo mašina: ${auto.spec.name}. Nauja ją pakeis.` : 'Dar neturi mašinos';
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  sfx.blip(); const f = document.querySelector('#carGrid .hcard'); if (f) f.focus();
}
function closeCarShop(relock) {
  if (!carShopOpen) return;
  carShopOpen = false; $('carShop').hidden = true;
  if (relock) requestLock();
}
function carKey(e) {
  if (e.code === 'Escape' || e.code === 'KeyE') { e.preventDefault(); closeCarShop(e.code === 'KeyE'); return; }
  const m = /^Digit([1-9])$/.exec(e.code); if (m) pickCar(+m[1] - 1); if (e.code === 'Digit0') pickCar(9);
}
function pickCar(i) {
  const c = CARS[i]; if (!c) return;
  const isNew = !garage.includes(c.id);
  if (isNew && !canPay(PRICE.car[c.id])) { tooPoor(PRICE.car[c.id]); return; }
  closeCarShop(true);
  if (isNew) { pay(PRICE.car[c.id]); garage.push(c.id); saveGarage(); }
  if (player.inCar && ride === auto) exitAuto();
  const fwdT = tangentToward(player.up, player.pos.clone().add(player.fwd));
  const d = moveAlong(player.up, fwdT, c.len / 2 + 3.5);
  const side = new V3().crossVectors(player.up, fwdT); // park it across your view so you see the whole car
  spawnAuto(c.id, d, side);
  poof(auto.pos.clone(), 0xffffff); sfx.poof(); setTimeout(() => sfx.chime(), 150);
  toast(`${c.name} – tavo!`, isNew ? `Nupirkta už ${PRICE.car[c.id]} €. R – sėsti. Bet kada iškviesk ją su F` : 'R – sėsti. Visas savo mašinas rasi paspaudęs F', '#ffd23a');
}
function loadCar() {
  let id = null; try { id = localStorage.getItem('modly-car'); } catch (_) { }
  if (!id || !CARS.find(c => c.id === id)) return;
  const d = cityDir(Math.cos(2.4) * 23, Math.sin(2.4) * 23), fwd = tangentToward(d, cityDir(Math.cos(2.5) * 23, Math.sin(2.5) * 23));
  spawnAuto(id, d, fwd);
}

// ---------- F: choose which of your vehicles to call ----------
function saveGarage() { try { localStorage.setItem('modly-garage', JSON.stringify(garage)); } catch (_) { } }
function loadGarage() {
  let list = []; try { list = JSON.parse(localStorage.getItem('modly-garage') || '[]'); } catch (_) { }
  let last = null; try { last = localStorage.getItem('modly-car'); } catch (_) { }
  if (last && !list.includes(last)) list.push(last);
  for (const id of list) if (CARS.find(c => c.id === id) && !garage.includes(id)) garage.push(id);
}
const pigSvg = '<svg viewBox="0 0 100 60" aria-hidden="true"><rect x="0" y="55" width="100" height="5" fill="#62c457"/><ellipse cx="46" cy="32" rx="26" ry="15" fill="#ffa3c0"/><circle cx="72" cy="26" r="12" fill="#ffa3c0"/><ellipse cx="82" cy="28" rx="5" ry="4" fill="#e57a9c"/><circle cx="74" cy="22" r="2" fill="#111"/><path d="M66 16 L68 8 L72 15 Z" fill="#e57a9c"/><ellipse cx="44" cy="19" rx="12" ry="4" fill="#7a4a26"/><rect x="28" y="44" width="5" height="11" fill="#ffa3c0"/><rect x="38" y="44" width="5" height="11" fill="#ffa3c0"/><rect x="54" y="44" width="5" height="11" fill="#ffa3c0"/><rect x="62" y="44" width="5" height="11" fill="#ffa3c0"/><path d="M20 30 q-8 -4 -4 -10" stroke="#e57a9c" stroke-width="3" fill="none"/></svg>';
function garageItems() { return [{ id: 'pig', name: 'Kiaulė', desc: 'Gyva, ėda žolę, joji pele.', svg: pigSvg, out: car.exists }].concat(garage.map(id => { const c = CARS.find(x => x.id === id); return { id, name: c.name, desc: c.desc, svg: carSvg(id), out: auto.exists && auto.spec.id === id }; })); }
function renderGarage() {
  const items = garageItems();
  $('garageGrid').innerHTML = items.map((it, k) => `<button class="hcard${it.out ? ' active' : ''}" data-id="${it.id}"><div class="hpic">${it.svg}</div><div class="hname">${it.name}</div><div class="hdesc">${it.desc}</div><div class="hfoot"><span class="pstate">${it.out ? 'Jau lauke – iškvies čia' : 'Iškviesti'}</span></div>${k < 9 ? `<kbd class="hkey">${k + 1}</kbd>` : ''}</button>`).join('');
  $('garageGrid').querySelectorAll('.hcard').forEach(b => b.addEventListener('click', () => callVehicle(b.dataset.id)));
  $('garageHint').textContent = garage.length ? `Tavo mašinų: ${garage.length} iš ${CARS.length}. Daugiau rasi mašinų parduotuvėje aikštėje.` : 'Kol kas turi tik kiaulę. Mašinas nusipirksi mašinų parduotuvėje Pradžios Miesto aikštėje.';
}
function openGarage() {
  if (garageOpen) return;
  garageOpen = true; cancelPlace(true); for (const k in keys) keys[k] = false; hands.L.hold = hands.R.hold = false;
  renderGarage(); $('garage').hidden = false; $('paused').hidden = true;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  sfx.blip(); const f = document.querySelector('#garageGrid .hcard'); if (f) f.focus();
}
function closeGarage(relock) {
  if (!garageOpen) return;
  garageOpen = false; $('garage').hidden = true;
  if (relock) requestLock();
}
function garageKey(e) {
  if (e.code === 'Escape' || e.code === 'KeyF') { e.preventDefault(); closeGarage(e.code === 'KeyF'); return; }
  const m = /^Digit([1-9])$/.exec(e.code); if (m) { const it = garageItems()[+m[1] - 1]; if (it) callVehicle(it.id); }
}
function callVehicle(id) {
  closeGarage(true);
  if (mode !== 'planet') return;
  // get out of whatever you are riding first
  if (player.inCar) onCar();
  if (id === 'pig') { spawnPigNow(); return; }
  const c = CARS.find(x => x.id === id); if (!c) return;
  const fwdT = tangentToward(player.up, player.pos.clone().add(player.fwd));
  const d = moveAlong(player.up, fwdT, c.len / 2 + 3.5);
  spawnAuto(id, d, new V3().crossVectors(player.up, fwdT));
  poof(auto.pos.clone(), 0xffffff); sfx.poof(); sfx.horn(camera.position);
  toast(`${c.name} atvažiavo!`, 'R – sėsti', '#ffd23a');
}
