// ================= physics on the sphere =================
function groundH(d) { let h = TH(d); if (h < WATER_FLOOR) h = WATER_FLOOR; const dg = duneGround(d); if (dg > h) h = dg; const rg = roadGround(d); if (rg > h) h = rg; return h; }
const _sd = new V3(), _hz = new V3();
const COS_NEAR = Math.cos(40 / R);
function stepPlanet(e, dt, rad, useSolids = true) {
  e.pos.addScaledVector(e.vel, dt);
  let r = e.pos.length(); _sd.copy(e.pos).divideScalar(r);
  e.vr -= GRAV * dt; r += e.vr * dt;
  let g = R + groundH(_sd);
  if (useSolids) for (let i = 0; i < solids.length; i++) {
    const s = solids[i];
    if (s.dir.dot(_sd) < COS_NEAR) continue;
    _hz.copy(_sd).multiplyScalar(r).sub(s.p);
    _hz.addScaledVector(s.up, -_hz.dot(s.up));
    if (s.type === 'box') {
      const lx = _hz.dot(s.ax), lz = _hz.dot(s.az), alx = Math.abs(lx), alz = Math.abs(lz);
      if (r >= s.top - 0.45) { if (alx < s.hx + rad * 0.8 && alz < s.hz + rad * 0.8 && s.top > g) g = s.top; }
      else if (alx < s.hx + rad && alz < s.hz + rad) {
        const ex = s.hx + rad - alx, ez = s.hz + rad - alz;
        _sd.multiplyScalar(r);
        if (ex < ez) _sd.addScaledVector(s.ax, lx < 0 ? -ex : ex); else _sd.addScaledVector(s.az, lz < 0 ? -ez : ez);
        r = _sd.length(); _sd.divideScalar(r);
      }
      continue;
    }
    const dist = _hz.length();
    if (s.type === 'dome') {   // a solid rounded cap you can walk all over
      if (dist > s.R + rad) continue;
      const b = s.base, hS = dist < s.R ? b + s.H * Math.sqrt(1 - (dist / s.R) ** 2) : b;
      if (r >= hS - 0.7 && e.vr <= 0.5) {
        if (dist < s.R && hS > g) g = hS;
        // a little fence runs round the rim – only a gap where the shelf stairs arrive
        if (s.fence && dist > s.fence && dist < s.R + 0.5 && (!s.gap || _hz.dot(s.gap) < dist * s.gapCos)) { _sd.multiplyScalar(r).addScaledVector(_hz, -(dist - s.fence) / dist); r = _sd.length(); _sd.divideScalar(r); }
      }
      else if (r > b - 0.3 && r < hS) {
        const side = s.R + rad - dist, down = r - (b - 0.3);
        if (side < down || r > b + 0.6) { if (dist > 1e-4) { _sd.multiplyScalar(r).addScaledVector(_hz, side / dist); r = _sd.length(); _sd.divideScalar(r); } }
        else { r = b - 0.3; if (e.vr > 0) e.vr = 0; }
      }
      continue;
    }
    if (r >= s.top - (s.thin ? 0.7 : 0.45) && (!s.thin || e.vr <= 0.5)) { if (dist < s.r && s.top > g) g = s.top; }
    else if (!s.thin && dist < s.r + rad && r < s.top) {
      if (dist > 1e-4) { _sd.multiplyScalar(r).addScaledVector(_hz, (s.r + rad - dist) / dist); r = _sd.length(); _sd.divideScalar(r); }
    }
  }
  if (r <= g || (e.grounded && e.vr <= 0 && r - g < 0.4)) { r = g; if (e.vr < 0) e.vr = 0; e.grounded = true; } else e.grounded = false;
  e.pos.copy(_sd).multiplyScalar(r);
  e.vel.addScaledVector(_sd, -e.vel.dot(_sd));
  if (e.fwd) { e.fwd.addScaledVector(_sd, -e.fwd.dot(_sd)).normalize(); }
  e.up.copy(_sd); e.ground = g;
}

// ================= the little green man =================
function makeMan() {
  const g = new THREE.Group(), green = mat(0x6ff05a, { emissive: 0x1d5a14 }), dark = mat(0x3fb33a, { emissive: 0x123a0c }), black = bmat(0x101010);
  const body = new THREE.Group(); g.add(body);
  body.add(S(G.cyl, green, 0.2, 0.8, 0.2, 0, 1.15, 0));
  body.add(S(G.sph, green, 0.3, 0.32, 0.3, 0, 1.82, 0));
  body.add(S(G.sph, black, 0.06, 0.08, 0.04, 0.11, 1.86, 0.27));
  body.add(S(G.sph, black, 0.06, 0.08, 0.04, -0.11, 1.86, 0.27));
  body.add(S(G.cyl, dark, 0.03, 0.18, 0.03, 0, 2.18, 0));
  body.add(S(G.sph, mat(0xffe14d), 0.07, 0.07, 0.07, 0, 2.3, 0));
  const limb = (x, y, len, r) => { const p = new THREE.Group(); p.position.set(x, y, 0); p.add(S(G.cyl, green, r, len, r, 0, -len / 2, 0)); p.add(S(G.sph, dark, r * 1.5, r * 1.5, r * 1.5, 0, -len, 0)); body.add(p); return p; };
  const parts = { body, armL: limb(0.27, 1.5, 0.68, 0.055), armR: limb(-0.27, 1.5, 0.68, 0.055), legL: limb(0.09, 0.78, 0.74, 0.065), legR: limb(-0.09, 0.78, 0.74, 0.065) };
  parts.handL = parts.armL.children[1]; parts.handR = parts.armR.children[1];
  g.userData.parts = parts; return g;
}
const player = { pos: new V3(), fwd: new V3(0, 0, -1), vel: new V3(), vr: 0, up: new V3(0, 1, 0), grounded: false, walk: 0, punchL: 0, punchR: 0, pitch: 0.32, inCar: false, ground: R };
player.mesh = makeMan(); world.add(player.mesh);

// ================= car =================
const car = { exists: false, pos: new V3(), fwd: new V3(0, 0, 1), vel: new V3(), vr: 0, up: new V3(0, 1, 0), speed: 0, grounded: true, wheelSpin: 0 };
// the rideable pig (spawned with F, ridden with R, driven like a car)
function makePigMesh() {
  const g = new THREE.Group(), pink = mat(0xffa3c0, { emissive: 0x3a1420 }), dark = mat(0xe57a9c, { emissive: 0x2a0c16 }), black = bmat(0x151015);
  const body = new THREE.Group(); g.add(body);
  body.add(S(G.sph, pink, 0.85, 0.75, 1.35, 0, 1.15, 0));
  const head = new THREE.Group(); head.position.set(0, 1.45, 1.3); body.add(head);
  head.add(S(G.sph, pink, 0.6, 0.55, 0.55, 0, 0, 0));
  { const _o = S(G.cyl, dark, 0.28, 0.22, 0.22, 0, -0.08, 0.55); _o.rotation.x = Math.PI / 2; head.add(_o); }
  head.add(S(G.sph, black, 0.05, 0.08, 0.03, 0.09, -0.08, 0.67)); head.add(S(G.sph, black, 0.05, 0.08, 0.03, -0.09, -0.08, 0.67));
  head.add(S(G.sph, black, 0.08, 0.1, 0.05, 0.26, 0.18, 0.45)); head.add(S(G.sph, black, 0.08, 0.1, 0.05, -0.26, 0.18, 0.45));
  for (const x of [-0.38, 0.38]) { const ear = S(G.cone, dark, 0.2, 0.38, 0.08, x, 0.5, 0.05); ear.rotation.z = -x * 0.9; ear.rotation.x = 0.4; head.add(ear); }
  const tail = mesh(new THREE.TorusGeometry(0.16, 0.05, 6, 14, Math.PI * 1.6), dark, 0, 1.4, -1.38); tail.rotation.y = Math.PI / 2; body.add(tail);
  // saddle
  body.add(S(G.sph, mat(0x7a4a26), 0.62, 0.18, 0.7, 0, 1.82, -0.1));
  body.add(S(G.box, mat(0xf2c14e), 1.3, 0.06, 0.12, 0, 1.6, -0.1));
  const legs = [];
  for (const [x, z] of [[0.45, 0.75], [-0.45, 0.75], [0.45, -0.75], [-0.45, -0.75]]) {
    const p = new THREE.Group(); p.position.set(x, 0.75, z);
    p.add(S(G.cyl, pink, 0.17, 0.62, 0.17, 0, -0.31, 0)); p.add(S(G.cyl, mat(0x5a3a2a), 0.18, 0.14, 0.18, 0, -0.68, 0));
    body.add(p); legs.push(p);
  }
  g.userData = { legs, body, head, tail, eyes: [head.children[4], head.children[5]] };
  return g;
}
car.mesh = makePigMesh(); car.mesh.visible = false; world.add(car.mesh);

// ================= critters (people, slimes) =================
const critters = [];
function makePerson() {
  const g = new THREE.Group(), shirt = mat(pick([0xff6b6b, 0x4dabff, 0xffc43d, 0xb57bff, 0x3ddc97, 0xff8fd0])), skin = mat(pick([0xffd9b8, 0xe6b48a, 0xa8754f, 0x7a5236]));
  const body = new THREE.Group(); g.add(body);
  body.add(S(G.cyl, shirt, 0.36, 0.95, 0.42, 0, 1.0, 0));
  body.add(S(G.sph, skin, 0.3, 0.3, 0.3, 0, 1.75, 0));
  body.add(S(G.sph, bmat(0x111111), 0.05, 0.06, 0.03, 0.1, 1.8, 0.27)); body.add(S(G.sph, bmat(0x111111), 0.05, 0.06, 0.03, -0.1, 1.8, 0.27));
  body.add(S(G.sph, mat(pick([0x3a2a1a, 0x1a1a1a, 0xd9a441, 0xa0522d])), 0.31, 0.16, 0.31, 0, 1.93, -0.02));
  const lL = new THREE.Group(), lR = new THREE.Group(); lL.position.set(0.14, 0.55, 0); lR.position.set(-0.14, 0.55, 0);
  lL.add(S(G.cyl, mat(0x34405a), 0.08, 0.55, 0.08, 0, -0.27, 0)); lR.add(S(G.cyl, mat(0x34405a), 0.08, 0.55, 0.08, 0, -0.27, 0));
  body.add(lL, lR); g.userData.legs = [lL, lR]; g.userData.body = body; return g;
}
function makeSlime() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const c = pick([0x3cf27a, 0xff4fd8, 0x30c4ff, 0xffe14d]);
  body.add(S(G.box, mat(c, { transparent: true, opacity: 0.85 }), 1.1, 1.1, 1.1, 0, 0.55, 0));
  body.add(S(G.box, bmat(0x111111), 0.18, 0.25, 0.05, 0.22, 0.7, 0.56)); body.add(S(G.box, bmat(0x111111), 0.18, 0.25, 0.05, -0.22, 0.7, 0.56));
  g.userData.body = body; g.userData.legs = []; return g;
}
function spawnCritter(type, d) {
  const m = type === 'person' ? makePerson() : makeSlime(); world.add(m);
  const c = { type, mesh: m, pos: surf(d), fwd: tangentToward(d, randDir()), vel: new V3(), vr: 0, up: d.clone(), grounded: true, timer: rr(1, 4), knocked: 0, spin: new V3(), walk: rnd() * 6, home: type === 'person' ? 0 : 6, speed: type === 'person' ? rr(1.6, 2.6) : 3, ground: R };
  critters.push(c); return c;
}
function updateCritters(dt, t) {
  for (const c of critters) {
    if (c.pos.distanceToSquared(player.pos) > 140 * 140 && !c.knocked) continue;
    if (c.knocked > 0) {
      c.knocked -= dt;
      c.mesh.userData.body.rotation.x += c.spin.x * dt; c.mesh.userData.body.rotation.z += c.spin.z * dt;
      if (c.grounded) { c.vel.multiplyScalar(Math.max(0, 1 - 5 * dt)); c.spin.multiplyScalar(Math.max(0, 1 - 6 * dt)); }
      if (c.knocked <= 0) { c.mesh.userData.body.rotation.set(0, 0, 0); }
    } else {
      c.timer -= dt;
      const d = c.up; weights(d.x, d.y, d.z, W);
      if (c.road) { updatePedestrian(c, dt); c.walk += dt * c.speed * 3; const [a, b] = c.mesh.userData.legs; a.rotation.x = Math.sin(c.walk) * 0.6; b.rotation.x = -Math.sin(c.walk) * 0.6; }
      else if (W[c.home] < 0.6) tangentToward(d, BC[c.home], c.fwd);
      else if (c.timer < 0) { c.timer = rr(2, 5); c.fwd.applyAxisAngle(d, rr(-2, 2)); }
      if (c.road) { }
      else if (c.type === 'slime') {
        if (c.grounded) { c.vel.set(0, 0, 0); if (c.timer % 1.2 < dt * 1.5) { c.vr = 7; c.vel.copy(c.fwd).multiplyScalar(4); if (c.pos.distanceToSquared(player.pos) < 400) sfx.boing(c.pos); } }
      } else {
        c.vel.copy(c.fwd).multiplyScalar(c.speed); c.walk += dt * c.speed * 3;
        const [a, b] = c.mesh.userData.legs; a.rotation.x = Math.sin(c.walk) * 0.6; b.rotation.x = -Math.sin(c.walk) * 0.6;
      }
    }
    stepPlanet(c, dt, 0.4);
    c.mesh.position.copy(c.pos); orient(c.mesh, c.up, c.fwd);
    if (c.type === 'slime') { const sq = c.grounded ? 1 : 1.25; c.mesh.userData.body.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)); }
  }
}
function knockCritter(c, dir, power) {
  if (c.knocked <= 0) sfx.ouch(c);
  c.vel.copy(dir).multiplyScalar(power); c.vr = power * 0.7; c.knocked = 2.2; c.grounded = false;
  c.spin.set(rr(-12, 12), 0, rr(-12, 12));
}

// ================= loose objects =================
const bodies = [];
function spawnBody(m, pos, rad = 0.5, name = 'Daiktas') {
  world.add(m); const b = { mesh: m, name, pos: pos.clone(), vel: new V3(), vr: 0, up: pos.clone().normalize(), fwd: tangentToward(pos.clone().normalize(), randDir()), grounded: false, rad, rot: new THREE.Quaternion(), spin: new V3(), life: 0, ground: R, held: null };
  bodies.push(b);
  if (bodies.length > 90) { const i = bodies.findIndex(o => !o.held); if (i >= 0) { world.remove(bodies[i].mesh); bodies.splice(i, 1); } }
  return b;
}
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _e = new THREE.Euler();
function updateBodies(dt) {
  for (const b of bodies) {
    if (b.held) continue;
    if (b.grounded && b.vel.lengthSq() < 0.01 && b.vr === 0 && b.pos.distanceToSquared(player.pos) > 3600) continue;
    const wasAir = !b.grounded, vr0 = b.vr;
    stepPlanet(b, dt, b.rad);
    if (b.grounded) {
      if (wasAir && vr0 < -6) { b.vr = -vr0 * 0.35; b.grounded = false; sfx.thud(b.pos); }
      b.vel.multiplyScalar(Math.max(0, 1 - 4 * dt)); b.spin.multiplyScalar(Math.max(0, 1 - 5 * dt));
      if (b.spin.lengthSq() < 0.05) b.rot.slerp(_q2.identity(), Math.min(1, dt * 4));
    }
    _e.set(b.spin.x * dt, b.spin.y * dt, b.spin.z * dt); _q1.setFromEuler(_e); b.rot.premultiply(_q1);
    b.mesh.position.copy(b.pos); orient(b.mesh, b.up, b.fwd); b.mesh.quaternion.multiply(b.rot);
    // thrown things knock people over
    if (b.vel.lengthSq() > 60) for (const c of critters) if (c.knocked <= 0 && c.pos.distanceTo(b.pos) < 1.4) { knockCritter(c, b.vel.clone().normalize(), 10); b.vel.multiplyScalar(0.3); }
  }
}
const junk = [
  () => S(G.box, mat(0xb57a3c), 1, 1, 1, 0, 0.5, 0),
  () => { const g = new THREE.Group(); g.add(S(G.cyl, mat(0x3a7bff), 0.45, 1.1, 0.45, 0, 0.55, 0)); g.add(S(G.cyl, mat(0xffffff), 0.47, 0.15, 0.47, 0, 0.6, 0)); return g; },
  () => S(G.sph, mat(pick([0xff4d4d, 0xffd23a, 0x3ddc97])), 0.5, 0.5, 0.5, 0, 0.5, 0),
  () => { const g = new THREE.Group(); g.add(S(G.sph, mat(0xff9f1c), 0.35, 0.3, 0.7, 0, 0.35, 0)); { const _o = S(G.cone, mat(0xff9f1c), 0.3, 0.4, 0.1, 0, 0.35, -0.8); _o.rotation.x = -Math.PI / 2; g.add(_o); } return g; },
  () => { const g = new THREE.Group(); g.add(S(G.cyl, mat(0xffffff), 0.35, 0.5, 0.28, 0, 0.25, 0)); g.add(mesh(new THREE.TorusGeometry(0.17, 0.05, 6, 12), mat(0xffffff), 0.38, 0.28, 0)); return g; },
  () => { const g = new THREE.Group(); g.add(S(G.box, mat(0xffe14d), 0.8, 0.6, 0.5, 0, 0.3, 0)); g.add(S(G.box, mat(0x30343e), 0.6, 0.3, 0.06, 0, 0.35, 0.26)); return g; }
];
const JUNK_NAMES = ['Dėžė', 'Statinė', 'Kamuolys', 'Žuvis', 'Puodelis', 'Radijas'];
function spawnJunk(k, pos) { const g = new THREE.Group(); g.add(junk[k]()); return spawnBody(g, pos, 0.5, JUNK_NAMES[k]); }
// things to pick up in each biome
const BIOME_ITEMS = [
  null,
  [['Amfora', () => { const g = new THREE.Group(), m = mat(0xc0703a); g.add(S(G.sph, m, 0.38, 0.42, 0.38, 0, 0.42, 0)); g.add(S(G.cyl, m, 0.14, 0.35, 0.14, 0, 0.9, 0)); g.add(S(G.cyl, m, 0.2, 0.06, 0.2, 0, 1.07, 0)); return g; }],
   ['Senovinė moneta', () => S(G.cyl, mat(0xf2c14e, { emissive: 0x5a4010 }), 0.35, 0.08, 0.35, 0, 0.05, 0)]],
  [['Sniego gniūžtė', () => S(G.sph, mat(0xffffff), 0.35, 0.35, 0.35, 0, 0.35, 0)],
   ['Ledo kubas', () => S(G.box, mat(0xbfe8ff, { transparent: true, opacity: 0.85 }), 0.7, 0.7, 0.7, 0, 0.35, 0)]],
  [['Mažas grybas', () => { const g = new THREE.Group(); g.add(S(G.cyl, mat(0xf3e9dc), 0.12, 0.5, 0.12, 0, 0.25, 0)); g.add(S(G.dome, mat(pick([0xff4d6d, 0x4dd8ff, 0xb04dff])), 0.4, 0.25, 0.4, 0, 0.48, 0)); return g; }],
   ['Šviečianti spora', () => S(G.sph, bmat(0x9ffcff), 0.25, 0.25, 0.25, 0, 0.25, 0)]],
  [['Kaulas', () => { const g = new THREE.Group(), m = mat(0xf1e6cf); const c = S(G.cyl, m, 0.1, 1.1, 0.1, 0, 0.15, 0); c.rotation.z = Math.PI / 2; g.add(c); for (const x of [-0.55, 0.55]) { g.add(S(G.sph, m, 0.15, 0.15, 0.15, x, 0.15, 0.1)); g.add(S(G.sph, m, 0.15, 0.15, 0.15, x, 0.15, -0.1)); } return g; }],
   ['Raudonas akmuo', () => S(G.dodec, mat(0xb8401f), 0.4, 0.35, 0.4, 0, 0.35, 0)]],
  [['Kokosas', () => S(G.sph, mat(0x6b4423), 0.35, 0.33, 0.35, 0, 0.33, 0)],
   ['Bananų kekė', () => { const g = new THREE.Group(), m = mat(0xffd23a); for (let i = 0; i < 4; i++) { const b = S(G.cyl, m, 0.07, 0.55, 0.07, (i - 1.5) * 0.12, 0.3, 0); b.rotation.z = (i - 1.5) * 0.25; g.add(b); } return g; }]],
  [['Pikselių kubas', () => S(G.box, mat(pick([0xff4fd8, 0x30c4ff, 0xffe14d, 0x3cf27a])), 0.7, 0.7, 0.7, 0, 0.35, 0)],
   ['Pikselių širdelė', () => { const g = new THREE.Group(), m = mat(0xff3b6b); for (const [x, y] of [[-0.2, 0.6], [0.2, 0.6], [-0.3, 0.4], [0, 0.4], [0.3, 0.4], [-0.15, 0.2], [0.15, 0.2], [0, 0.05]]) g.add(S(G.box, m, 0.2, 0.2, 0.2, x, y, 0)); return g; }]]
];
function spawnBiomeItems() {
  for (let i = 1; i < NB; i++) for (let k = 0; k < 10; k++) {
    const d = dirIn(i, 0.75, d => groundH(d) > 0.2); if (!d) continue;
    const [name, make] = BIOME_ITEMS[i][k % 2]; const g = new THREE.Group(); g.add(make());
    const b = spawnBody(g, d.clone().multiplyScalar(R + groundH(d) + 0.3), 0.4, name); b.grounded = true;
  }
}

// ================= ambient particles =================
const AMB_N = 700;
const ambGeo = new THREE.BufferGeometry(), ambPos = new Float32Array(AMB_N * 3), ambCol = new Float32Array(AMB_N * 3), ambSeed = new Float32Array(AMB_N);
for (let i = 0; i < AMB_N; i++) { ambPos[i * 3] = rr(-30, 30); ambPos[i * 3 + 1] = rr(0, 18); ambPos[i * 3 + 2] = rr(-30, 30); ambSeed[i] = rnd(); }
ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3)); ambGeo.setAttribute('color', new THREE.BufferAttribute(ambCol, 3));
const ambMat = new THREE.PointsMaterial({ size: 0.28, map: dotTex, alphaTest: 0.01, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const amb = new THREE.Points(ambGeo, ambMat); amb.frustumCulled = false; scene.add(amb);
let ambMode = -1;
const _c3 = new THREE.Color();
function updateAmbient(dt, t, dom, strength) {
  amb.position.copy(player.pos); orient(amb, player.up, player.fwd);
  const modes = { 2: 'snow', 3: 'spore', 1: 'dust', 4: 'dust', 6: 'pix', 5: 'fly' };
  const mode = modes[dom] || 'none';
  if (mode !== ambMode) {
    ambMode = mode;
    for (let i = 0; i < AMB_N; i++) {
      if (mode === 'snow') _c3.setHex(0xffffff); else if (mode === 'spore') _c3.setHSL(ambSeed[i], 0.9, 0.65);
      else if (mode === 'dust') _c3.setHex(dom === 4 ? 0xff9a5a : 0xffe0a0); else if (mode === 'pix') _c3.setHex(PIX[i % PIX.length]); else _c3.setHex(0xfff59a);
      ambCol.set([_c3.r, _c3.g, _c3.b], i * 3);
    }
    ambGeo.attributes.color.needsUpdate = true;
    ambMat.size = mode === 'pix' ? 0.5 : mode === 'snow' ? 0.35 : 0.3; ambMat.map = mode === 'pix' ? null : dotTex;
    ambMat.blending = mode === 'snow' ? THREE.NormalBlending : THREE.AdditiveBlending; ambMat.needsUpdate = true;
  }
  ambMat.opacity = mode === 'none' ? 0 : clamp(strength * 1.2 - 0.2, 0, 0.95);
  if (ambMat.opacity === 0) return;
  for (let i = 0; i < AMB_N; i++) {
    const k = i * 3, s = ambSeed[i];
    if (mode === 'snow') { ambPos[k + 1] -= dt * (1.5 + s * 1.5); ambPos[k] += Math.sin(t + s * 10) * dt * 0.6; }
    else if (mode === 'spore') { ambPos[k + 1] += dt * (0.3 + s * 0.5); ambPos[k] += Math.sin(t * 0.7 + s * 20) * dt * 0.5; ambPos[k + 2] += Math.cos(t * 0.6 + s * 20) * dt * 0.5; }
    else if (mode === 'dust') { ambPos[k] += dt * (3 + s * 4); ambPos[k + 1] += Math.sin(t * 2 + s * 30) * dt * 0.4; }
    else if (mode === 'pix') { ambPos[k + 1] += dt * (s < 0.5 ? 1 : -1); }
    else { ambPos[k] += Math.sin(t * 3 + s * 50) * dt * 1.5; ambPos[k + 1] += Math.cos(t * 2.3 + s * 40) * dt; }
    if (ambPos[k + 1] < -1) ambPos[k + 1] = 18; if (ambPos[k + 1] > 18) ambPos[k + 1] = -1;
    if (ambPos[k] > 30) ambPos[k] = -30; if (ambPos[k] < -30) ambPos[k] = 30;
    if (ambPos[k + 2] > 30) ambPos[k + 2] = -30; if (ambPos[k + 2] < -30) ambPos[k + 2] = 30;
  }
  ambGeo.attributes.position.needsUpdate = true;
}

// ================= effects =================
const fx = [];
let shake = 0;
const flashEl = document.getElementById('flash');
const fireTex = glowTex('rgba(255,255,220,1)', 'rgba(255,90,20,0)');
function explode(p, size = 1) {
  sfx.boom(p, size);
  const up = p.clone().normalize();
  const ball = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireTex, color: 0xffb060, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  ball.position.copy(p).addScaledVector(up, 1); world.add(ball);
  const light = new THREE.PointLight(0xff9040, 4, 40 * size); light.position.copy(ball.position); world.add(light);
  const N = 90, g = new THREE.BufferGeometry(), a = new Float32Array(N * 3), vel = [];
  for (let i = 0; i < N; i++) { a.set([p.x, p.y, p.z], i * 3); const v = randDir().multiplyScalar(rr(4, 16) * size).addScaledVector(up, rr(4, 12) * size); vel.push(v); }
  g.setAttribute('position', new THREE.BufferAttribute(a, 3));
  const sparks = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffc070, size: 0.5 * size, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  sparks.frustumCulled = false; world.add(sparks);
  const smokes = [];
  for (let i = 0; i < 6; i++) { const s = S(G.ico1, mat(0x5a5560, { transparent: true, opacity: 0.7 }), 1, 1, 1); s.position.copy(p).add(randDir().multiplyScalar(2 * size)); world.add(s); smokes.push(s); s.material = s.material.clone(); }
  const scorch = S(G.cyl, bmat(0x1a1210, { transparent: true, opacity: 0.6 }), 3.5 * size, 0.05, 3.5 * size); scorch.material = scorch.material.clone();
  const d = up.clone(); scorch.position.copy(d).multiplyScalar(R + groundH(d) + 0.05); scorch.quaternion.setFromUnitVectors(UP, d); world.add(scorch);
  let t = 0;
  fx.push(dt => {
    t += dt;
    const k = t / 0.6; ball.scale.setScalar((2 + k * 10) * size); ball.material.opacity = Math.max(0, 1 - k);
    light.intensity = Math.max(0, 4 * (1 - t / 0.5));
    for (let i = 0; i < N; i++) { const v = vel[i]; const pp = new V3(a[i * 3], a[i * 3 + 1], a[i * 3 + 2]); v.addScaledVector(pp.clone().normalize(), -GRAV * dt); pp.addScaledVector(v, dt); a.set([pp.x, pp.y, pp.z], i * 3); }
    g.attributes.position.needsUpdate = true; sparks.material.opacity = Math.max(0, 1 - t / 1.4);
    for (const s of smokes) { s.position.addScaledVector(s.position.clone().normalize(), dt * 2); s.scale.multiplyScalar(1 + dt * 0.8); s.material.opacity = Math.max(0, 0.7 * (1 - t / 2.5)); }
    scorch.material.opacity = 0.6 * Math.max(0, 1 - t / 25);
    if (t > 25) { [ball, light, sparks, scorch, ...smokes].forEach(o => world.remove(o)); g.dispose(); return false; }
    if (t > 2.6 && smokes[0].parent) { [ball, light, sparks, ...smokes].forEach(o => world.remove(o)); }
    return true;
  });
  const dist = p.distanceTo(camera.position);
  shake = Math.max(shake, size * 1.4 * clamp(1 - dist / 70, 0, 1));
  if (dist < 40) { flashEl.style.transition = 'none'; flashEl.style.opacity = String(clamp(1 - dist / 40, 0, 0.9)); requestAnimationFrame(() => { flashEl.style.transition = 'opacity .7s'; flashEl.style.opacity = '0'; }); }
  blast(p, 9 * size, 13 * size);
}
function blast(p, radius, power) {
  const away = (pos, out) => tangentToward(pos.clone().normalize(), pos.clone().sub(p).add(pos.clone().normalize().multiplyScalar(0.001)), out);
  const ent = player.inCar ? ride : player;
  const dd = ent.pos.distanceTo(p);
  if (dd < radius && mode === 'planet') {
    const f = 1 - dd / radius, dir = tangentToward(ent.up, ent.pos.clone().sub(p));
    if (player.inCar) { ride.vr = 10 * f + 4; ride.speed *= 0.3; ride.vel.addScaledVector(dir, power * f); if (ride === car) pigSqueal(); }
    else { player.vel.addScaledVector(dir, power * f); player.vr = Math.max(player.vr, power * 0.8 * f + 3); player.grounded = false; }
  }
  if (car.exists && !(player.inCar && ride === car) && car.pos.distanceTo(p) < radius) { car.vr = 6; pigScare(p); }
  if (auto.exists && !(player.inCar && ride === auto) && auto.pos.distanceTo(p) < radius) { auto.vr = 7; auto.vel.addScaledVector(tangentToward(auto.up, auto.pos.clone().sub(p)), power * 0.4); }
  knockPetsNear(p, radius, power);
  for (const c of critters) { const dc = c.pos.distanceTo(p); if (dc < radius) knockCritter(c, tangentToward(c.up, c.pos.clone().sub(p)), power * (1 - dc / radius) + 3); }
  for (const b of bodies) { const db = b.pos.distanceTo(p); if (db < radius) { b.vel.addScaledVector(tangentToward(b.up, b.pos.clone().sub(p)), power * (1 - db / radius)); b.vr = 8; b.grounded = false; b.spin.set(rr(-8, 8), rr(-8, 8), rr(-8, 8)); } }
}
function poof(p, color = 0xffffff) {
  const parts = [];
  for (let i = 0; i < 10; i++) { const s = S(G.ico, mat(color, { transparent: true, opacity: 0.9 }), 0.5, 0.5, 0.5); s.material = s.material.clone(); s.position.copy(p).add(randDir().multiplyScalar(1.2)); s.userData.noCollapse = true; world.add(s); parts.push(s); }
  let t = 0;
  fx.push(dt => { t += dt; for (const s of parts) { s.scale.multiplyScalar(1 + dt * 2); s.material.opacity = Math.max(0, 0.9 - t * 1.5); s.position.addScaledVector(s.position.clone().normalize(), dt); } if (t > 0.7) { parts.forEach(s => world.remove(s)); return false; } return true; });
}

// ================= chaos events =================
let nextChaos = 30;
function chaosAround(minD, maxD) { return dirNear(player.up.clone(), maxD, minD); }
function chaosMeteor() {
  toast('Meteoras!', 'Kažkas krenta iš burbulo viršaus', '#ff8a3d'); sfx.alarm();
  for (let n = 0; n < 1 + Math.floor(rnd() * 3); n++) {
    const target = chaosAround(10, 36), tp = target.clone().multiplyScalar(R + groundH(target));
    const start = tp.clone().normalize().multiplyScalar(R + 110).add(randDir().multiplyScalar(60));
    const g = new THREE.Group(); g.add(S(G.dodec, mat(0x3a2a24), 1.6, 1.6, 1.6));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireTex, color: 0xff7a30, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); glow.scale.setScalar(9); g.add(glow);
    world.add(g); let t = -n * 0.7; const dur = 2.4;
    fx.push(dt => {
      t += dt; if (t < 0) { g.visible = false; return true; } if (!g.visible) sfx.whistle(dur); g.visible = true;
      const k = Math.min(1, t / dur); g.position.lerpVectors(start, tp, k * k); g.rotation.x += dt * 4; g.rotation.y += dt * 3;
      if (k >= 1) { world.remove(g); explode(tp, 1.2); return false; } return true;
    });
  }
}
const bigThings = [
  ['Milžiniška spurga', () => { const g = new THREE.Group(); g.add(mesh(new THREE.TorusGeometry(6, 2.8, 12, 28), mat(0xe8b06a))); g.add(mesh(new THREE.TorusGeometry(6, 2.9, 12, 28, Math.PI * 2), mat(0xff7ab8))).scale.set(1, 1, 0.6); g.children[1].position.z = 0.9; return g; }],
  ['Milžiniška kėdė', () => { const g = new THREE.Group(), w = mat(0xb5652f); g.add(S(G.box, w, 9, 1, 9, 0, 6, 0)); g.add(S(G.box, w, 9, 10, 1, 0, 11, -4)); for (const [x, z] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) g.add(S(G.box, w, 1, 6, 1, x, 3, z)); return g; }],
  ['Milžiniškas kamuolys', () => { const g = new THREE.Group(); g.add(S(G.sph, mat(0xffffff), 7, 7, 7)); g.add(S(new THREE.TorusGeometry(7.05, 0.6, 8, 32), mat(0xff3b3b), 1, 1, 1)); return g; }],
  ['Milžiniškas puodelis', () => { const g = new THREE.Group(); g.add(S(G.cyl, mat(0x5ec8ff), 6, 10, 5, 0, 0, 0)); g.add(mesh(new THREE.TorusGeometry(3.4, 1, 8, 20), mat(0x5ec8ff), 6.5, 0.5, 0)); return g; }],
  ['Milžiniška guminė antis', () => { const g = new THREE.Group(), y = mat(0xffd23a); g.add(S(G.sph, y, 7, 5, 9)); g.add(S(G.sph, y, 4, 4, 4, 0, 6, 5)); { const _o = S(G.cone, mat(0xff8a1c), 1.6, 3, 1.2, 0, 5.5, 9.5); _o.rotation.x = Math.PI / 2; g.add(_o); } g.add(S(G.sph, bmat(0x111111), 0.5, 0.6, 0.3, 1.6, 7, 8.4)); g.add(S(G.sph, bmat(0x111111), 0.5, 0.6, 0.3, -1.6, 7, 8.4)); return g; }]
];
function chaosBigThing() {
  const [name, make] = pick(bigThings);
  toast(name + '!', 'Skrenda per dangų… ir krenta', '#ffb347'); sfx.alarm(); setTimeout(() => sfx.whistle(4.5), 900);
  const target = chaosAround(22, 40), tp = target.clone().multiplyScalar(R + groundH(target) + 3);
  const side = tangentToward(target, randDir());
  const start = target.clone().multiplyScalar(R + 70).addScaledVector(side, 140);
  const g = make(); world.add(g); let t = 0; const dur = 5.5; const spin = randDir();
  fx.push(dt => {
    t += dt; const k = Math.min(1, t / dur);
    const p = start.clone().lerp(tp, k); p.addScaledVector(target, Math.sin(k * Math.PI) * 25);
    g.position.copy(p); g.rotateOnAxis(spin, dt * 2);
    if (k >= 1) {
      explode(tp, 1.8);
      const sol = { p: target.clone().multiplyScalar(R + groundH(target)), up: target.clone(), dir: target.clone(), r: 6.5, top: R + groundH(target) + 9, thin: false }; solids.push(sol);
      let s = 0; fx.push(dt2 => { s += dt2; if (s > 30) { g.position.addScaledVector(target, -dt2 * 3); sol.top -= dt2 * 3; } if (s > 34) { world.remove(g); const i = solids.indexOf(sol); if (i >= 0) solids.splice(i, 1); return false; } return true; });
      return false;
    }
    return true;
  });
}
function makeGiant() {
  const g = new THREE.Group(), st = mat(0x6d6a7a), st2 = mat(0x56536a), eye = bmat(0xff2a2a);
  const body = new THREE.Group(); g.add(body);
  body.add(S(G.box, st, 7, 9, 4, 0, 16, 0)); body.add(S(G.box, st2, 4, 4, 4, 0, 22.5, 0));
  body.add(S(G.box, eye, 0.9, 0.6, 0.2, 0.9, 23, 2.05)); body.add(S(G.box, eye, 0.9, 0.6, 0.2, -0.9, 23, 2.05));
  const leg = x => { const p = new THREE.Group(); p.position.set(x, 11.5, 0); p.add(S(G.box, st2, 2.6, 11.5, 2.6, 0, -5.75, 0)); body.add(p); return p; };
  const arm = x => { const p = new THREE.Group(); p.position.set(x, 19.5, 0); p.add(S(G.box, st, 2, 11, 2, 0, -5.5, 0)); body.add(p); return p; };
  g.userData = { legL: leg(1.8), legR: leg(-1.8), armL: arm(4.6), armR: arm(-4.6) };
  return g;
}
// whatever a giant bumps into falls apart… and half a second later grows back
const _gc = new V3(), _gbox = new THREE.Box3(), _gsz = new V3();
function giantSmash(g, d) {
  const moving = new Set([g, player.mesh, car.mesh, auto.mesh]);
  for (const t of traffic) moving.add(t.m); for (const p of pets) moving.add(p.mesh); for (const c of critters) moving.add(c.mesh); for (const b of bodies) moving.add(b.mesh);
  const base = d.clone().multiplyScalar(R + groundH(d));
  let n = 0;
  for (const o of world.children.slice()) {
    if (n >= 10) break;
    if (moving.has(o) || o.userData.noCollapse || o.isSprite || o.isLight || o.isPoints || o.isLine || o.userData.collapsing || !o.visible) continue;
    const L = o.position.length(); if (L < R * 0.5) continue;
    if (Math.abs(L - base.length()) > 14) continue;              // things high up in the sky are safe
    const dist = o.position.distanceTo(base); if (dist > 40) continue;
    if (o.userData.gRad == null) { _gbox.setFromObject(o); _gbox.getSize(_gsz); o.userData.gRad = Math.min(14, Math.max(_gsz.x, _gsz.z) * 0.5); }
    if (o.userData.gRad < 0.5 || dist > 4.5 + o.userData.gRad * 0.7) continue;
    collapseObject(o); n++;
  }
}
function collapseObject(o) {
  o.userData.collapsing = true;
  const s0 = o.scale.clone(), q0 = o.quaternion.clone(), tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(rr(-0.5, 0.5), 0, rr(-0.5, 0.5)));
  const near = o.position.distanceTo(player.pos) < 70;
  poof(o.position.clone(), 0xbfa58a); if (near) { noiseHit(0.35, { f: 400, vol: 0.12 }); tone(110, 0.3, { to: 50, type: 'sawtooth', vol: 0.05, lp: 500 }); }
  let t = 0;
  fx.push(dt => {
    t += dt;
    if (t < 0.3) { const k = t / 0.3; o.scale.set(s0.x * (1 + k * 0.25), s0.y * (1 - k * 0.92), s0.z * (1 + k * 0.25)); o.quaternion.copy(q0).multiply(new THREE.Quaternion().slerp(tilt, k)); }
    else if (t < 0.8) { o.scale.set(s0.x * 1.25, s0.y * 0.08, s0.z * 1.25); }   // a heap of rubble for half a second
    else if (t < 1.25) { const k = (t - 0.8) / 0.45, e = 1 + Math.sin(k * Math.PI) * 0.15; o.scale.set(s0.x * e, s0.y * (0.08 + 0.92 * k) * e, s0.z * e); o.quaternion.copy(q0).multiply(new THREE.Quaternion().slerp(tilt, 1 - k)); if (k > 0.05 && t - dt < 0.83 && near) tone(520, 0.25, { to: 880, type: 'triangle', vol: 0.04 }); }
    else { o.scale.copy(s0); o.quaternion.copy(q0); o.userData.collapsing = false; return false; }
    return true;
  });
}
function chaosGiant() {
  toast('Milžinų ataka!', 'Žemė dreba. Laikykis atokiau nuo jo kojų.', '#ff5a5a'); sfx.alarm();
  const g = makeGiant(); world.add(g);
  const travel = tangentToward(player.up, randDir()), sideT = new V3().crossVectors(player.up, travel);
  let d = moveAlong(moveAlong(player.up.clone(), travel, -70), sideT, rr(-12, 12));
  let fwd = tangentToward(d, player.up.clone()); let dist = 0, ph = 0, lastS = 0, sink = 0;
  fx.push(dt => {
    if (dist < 150) {
      d = moveAlong(d, fwd, 5 * dt); fwd.addScaledVector(d, -fwd.dot(d)).normalize(); dist += 5 * dt; ph += dt * 3.4;
      const s = Math.sin(ph); g.userData.legL.rotation.x = s * 0.45; g.userData.legR.rotation.x = -s * 0.45; g.userData.armL.rotation.x = -s * 0.4; g.userData.armR.rotation.x = s * 0.4;
      if (Math.sign(s) !== Math.sign(lastS)) {
        const foot = d.clone().multiplyScalar(R + groundH(d)).addScaledVector(fwd, s > 0 ? -2 : 2);
        const pd = foot.distanceTo(player.inCar ? ride.pos : player.pos);
        shake = Math.max(shake, clamp(1 - pd / 60, 0, 1) * 0.9);
        poof(foot, 0xbfa58a); blast(foot, 6, 14); sfx.stomp(foot);
      }
      lastS = s;
    } else { sink += dt; if (sink > 3) { world.remove(g); return false; } }
    g.position.copy(d).multiplyScalar(R + groundH(d) - sink * 9); orient(g, d, fwd);
    if (dist < 150 && Math.floor(dist / 1.5) !== Math.floor((dist - 5 * dt) / 1.5)) giantSmash(g, d);
    return true;
  });
}
function chaosRain() {
  toast('Daiktų lietus!', 'Iš dangaus krenta visokie daiktai', '#7bd3ff'); sfx.whoosh(0.2);
  for (let i = 0; i < 14; i++) {
    const d = chaosAround(2, 18);
    const b = spawnJunk(Math.floor(rnd() * junk.length), d.clone().multiplyScalar(R + groundH(d) + rr(25, 45))); b.spin.set(rr(-5, 5), rr(-5, 5), rr(-5, 5));
  }
}
function updateChaos(t) {
  if (t < nextChaos) return;
  nextChaos = t + rr(22, 38);
  const r = rnd();
  if (r < 0.3) chaosMeteor(); else if (r < 0.55) chaosBigThing(); else if (r < 0.78) chaosGiant(); else chaosRain();
}

// ================= nobody walks through anybody =================
const _sp = new V3();
function pushApart(a, ra, b, rb, wa, wb) {
  _sp.copy(b.pos).sub(a.pos);
  const up = a.up; const vert = _sp.dot(up);
  if (Math.abs(vert) > 1.6) return false;           // one is on top of the other / far above
  _sp.addScaledVector(up, -vert);
  const d = _sp.length(), min = ra + rb;
  if (d >= min) return false;
  if (d < 1e-4) _sp.copy(a.fwd || new V3(1, 0, 0)); else _sp.divideScalar(d);
  const over = min - d;
  a.pos.addScaledVector(_sp, -over * wa); b.pos.addScaledVector(_sp, over * wb);
  return true;
}
function separateAll() {
  const ents = [];
  if (!player.inCar) ents.push([player, 0.38, 0.35]);
  if (car.exists) ents.push([car, player.inCar && ride === car ? 1.2 : 1.0, player.inCar && ride === car ? 0.2 : 0.6]);
  if (auto.exists) ents.push([auto, auto.spec.wid / 2 + 0.3, player.inCar && ride === auto ? 0.05 : 0.15]);
  for (const c of critters) if (c.knocked <= 0 && c.pos.distanceToSquared(player.pos) < 3600) ents.push([c, 0.45, 0.5]);
  for (const pt of pets) if (pt.knocked <= 0) ents.push([pt, pt.rad, 0.45]);
  for (let i = 0; i < ents.length; i++) for (let j = i + 1; j < ents.length; j++) {
    const [a, ra, ma] = ents[i], [b, rb, mb] = ents[j];
    const s = ma + mb; pushApart(a, ra, b, rb, ma / s, mb / s);
  }
  // loose items get shoved instead of passed through
  const movers = player.inCar ? [] : [[player, 0.38]];
  if (car.exists && !(player.inCar && ride === car)) movers.push([car, 1.0]);
  if (auto.exists) movers.push([auto, auto.spec.wid / 2 + 0.3]);
  for (const [e, re] of movers) for (const b of bodies) {
    if (b.held) continue;
    if (pushApart(e, re, b, b.rad, 0.15, 0.85)) { b.vel.addScaledVector(_sp, 1.5); b.grounded = false; b.vr = Math.max(b.vr, 0.5); }
  }
  // the little cars around the plaza push people out of the road
  for (const cc of cityCars) {
    const cp = { pos: cc.position, up: cc.position.clone().normalize() };
    for (const [e] of ents) if (!(player.inCar && e === ride)) {
      _sp.copy(e.pos).sub(cp.pos); _sp.addScaledVector(cp.up, -_sp.dot(cp.up)); const d = _sp.length();
      if (d < 1.9 && d > 1e-4) { e.pos.addScaledVector(_sp, (1.9 - d) / d); if (e === player) { if (player.grounded) sfx.horn(cc.position); player.vr = Math.max(player.vr, 3); } }
    }
  }
}
