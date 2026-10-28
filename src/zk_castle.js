// ================= The Cloud Castle – a big castle with THREE floors you can walk into =================
// 1st floor: the entrance hall with cloud guards and a long table.
// 2nd floor: bedrooms and the royal TOILET – three toilets, and next to each one its owner left a jet-pack
//            (the King's, the Queen's and the Prince's). Take one – it is yours. (The museum no longer gives one.)
// 3rd floor: the throne room with the Cloud King.
const ccScene = new THREE.Scene(); ccScene.background = new THREE.Color(0xcfe8ff);
ccScene.add(new THREE.AmbientLight(0xffffff, 0.28)); ccScene.add(new THREE.HemisphereLight(0xfff8f0, 0x8aa8d8, 0.45));
{ const l = new THREE.DirectionalLight(0xfff4e0, 0.35); l.position.set(10, 30, 15); ccScene.add(l); }
const CC = { built: false, boxes: [], jets: [], king: null, prince: null, X: 12, Z: 10, FH: 5, top: 15 };
let ccJetTaken = -1; try { const v = localStorage.getItem('modly-ccjet'); if (v != null) ccJetTaken = +v; } catch (_) { }
// stairs: ramp 1 (floor 1 → 2) along x 7..11, ramp 2 (floor 2 → 3) along x -11..-7, both run from z 6 to z -8
const inR1 = (x, z) => x > 7 && x < 11 && z > -8 && z < 6, inR2 = (x, z) => x > -11 && x < -7 && z > -8 && z < 6;
function ccGround(x, z, y) {
  let g = 0; const c = [0];
  if (!inR1(x, z)) c.push(5); if (!inR2(x, z)) c.push(10);
  if (x > 7 && x < 11 && z >= -8.2 && z <= 6) c.push(clamp(5 * (6 - z) / 14, 0, 5));
  if (x > -11 && x < -7 && z >= -8.2 && z <= 6) c.push(clamp(5 + 5 * (z + 8) / 14, 5, 10));
  for (const h of c) if (h <= y + 0.75 && h > g) g = h;
  return g;
}
function ccCeil(x, z, y) { for (const h of [5, 10, 15]) { if (h === 5 && inR1(x, z)) continue; if (h === 10 && inR2(x, z)) continue; if (h > y + 0.5) return h - 0.3; } return 15; }
function ccBox(x0, x1, z0, z1, y0, y1, m, vis = true) {
  if (vis) ccScene.add(S(G.box, m, Math.abs(x1 - x0), y1 - y0, Math.abs(z1 - z0), (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2));
  const b = { x: (x0 + x1) / 2, z: (z0 + z1) / 2, hx: Math.abs(x1 - x0) / 2, hz: Math.abs(z1 - z0) / 2, y0, y1 }; CC.boxes.push(b); return b;
}
function makeToilet() {
  const g = new THREE.Group(), w = mat(0xffffff, { roughness: 0.25 }), chrome = mat(0xc8ccd6, { metalness: 0.8, roughness: 0.2 });
  g.add(S(G.cyl, w, 0.28, 0.45, 0.32, 0, 0.22, 0.05)); g.add(S(G.cyl, w, 0.38, 0.12, 0.45, 0, 0.5, 0.12));
  g.add(mesh(new THREE.TorusGeometry(0.32, 0.06, 8, 20), mat(0xf4f0ff, { roughness: 0.4 }), 0, 0.58, 0.14).rotateX(Math.PI / 2));
  g.add(S(G.box, w, 0.7, 0.75, 0.25, 0, 0.9, -0.3)); g.add(S(G.box, chrome, 0.12, 0.05, 0.05, 0.2, 1.22, -0.3));
  const lid = S(G.box, mat(0xf4f0ff), 0.7, 0.05, 0.7, 0, 0.98, -0.12); lid.rotation.x = -1.2; g.add(lid);
  // a toilet paper roll on the wall
  g.add(S(G.cyl, w, 0.12, 0.2, 0.12, 0.55, 0.85, -0.3).rotateZ(Math.PI / 2));
  return g;
}
function makeCloudGuard() {
  const g = makeCloudKing(); g.scale.setScalar(1.05); const b = g.userData.body;
  b.children.filter(o => o.material && o.material.color && o.material.color.getHex && o.material.metalness > 0.5).forEach(o => o.visible = false);
  const sp = S(G.cyl, mat(0xc8ccd6, { metalness: 0.7 }), 0.04, 2.6, 0.04, 0.45, 1.2, 0.2); b.add(sp); const tip = S(G.cone, mat(0xffd23a, { metalness: 0.7 }), 0.1, 0.3, 0.1, 0.45, 2.6, 0.2); b.add(tip);
  b.add(S(G.dome, mat(0xc8ccd6, { metalness: 0.7, roughness: 0.3 }), 0.32, 0.25, 0.32, 0, 2.02, 0));
  return g;
}
function ccSign(text, x, y, z, ry = 0, w = 2.4) { const s = mesh(new THREE.PlaneGeometry(w, w * 0.22), new THREE.MeshBasicMaterial({ map: labelTex(text, '#8fc8ff', '#ffffff', 512, 112), side: THREE.DoubleSide }), x, y, z); s.rotation.y = ry; ccScene.add(s); return s; }
function buildCloudCastleIn() {
  if (CC.built) return; CC.built = true;
  const wall = mat(0xdce6f6, { roughness: 0.7 }), floorM = mat(0xb8c8e4, { roughness: 0.5 }), floorM2 = mat(0xc4d2ea, { roughness: 0.5 }), gold = mat(0xffd23a, { metalness: 0.7, roughness: 0.3 }), carpet = mat(0x5aa0e8, { roughness: 1 }), wood = mat(0xb08a60, { roughness: 0.8 }), tile = mat(0xbfe8f0, { roughness: 0.3 });
  const X = CC.X, Z = CC.Z;
  // floors (with holes for the stairs) and the roof
  ccScene.add(S(G.box, floorM, 2 * X, 0.3, 2 * Z, 0, -0.15, 0));
  const slab = (x0, x1, z0, z1, y, m) => ccScene.add(S(G.box, m, x1 - x0, 0.3, z1 - z0, (x0 + x1) / 2, y - 0.15, (z0 + z1) / 2));
  slab(-X, 7, -Z, Z, 5, floorM2); slab(7, 11, 6, Z, 5, floorM2); slab(7, 11, -Z, -8, 5, floorM2); slab(11, X, -Z, Z, 5, floorM2);
  slab(-7, X, -Z, Z, 10, floorM); slab(-11, -7, 6, Z, 10, floorM); slab(-11, -7, -Z, -8, 10, floorM); slab(-X, -11, -Z, Z, 10, floorM);
  slab(-X, X, -Z, Z, 15.3, wall);
  // outer walls (a door gap on the south side of floor 1)
  ccBox(-X - 0.4, X + 0.4, -Z - 0.4, -Z, 0, 15, wall); ccBox(-X - 0.4, -X, -Z, Z, 0, 15, wall); ccBox(X, X + 0.4, -Z, Z, 0, 15, wall);
  ccBox(-X - 0.4, -1.6, Z, Z + 0.4, 0, 15, wall); ccBox(1.6, X + 0.4, Z, Z + 0.4, 0, 15, wall); ccBox(-1.6, 1.6, Z, Z + 0.4, 3.4, 15, wall);
  // big round windows on every floor
  const win = new THREE.MeshBasicMaterial({ color: 0x9fd8ff });
  for (let f = 0; f < 3; f++) for (const x of [-8, -3, 3, 8]) { const w = mesh(new THREE.CircleGeometry(0.9, 20), win, x, f * 5 + 2.8, -Z + 0.02); ccScene.add(w); }
  for (let f = 0; f < 3; f++) for (const z of [-5, 3]) { for (const s of [-1, 1]) { const w = mesh(new THREE.CircleGeometry(0.9, 20), win, s * (X - 0.02), f * 5 + 2.8, z); w.rotation.y = -s * Math.PI / 2; ccScene.add(w); } }
  // stairs: two long ramps, the space under them is closed
  const ramp = (x, y, ang, m) => { const r = S(G.box, m, 4, 0.3, 14.9, x, y, -1); r.rotation.x = ang; ccScene.add(r); for (let i = 0; i < 14; i++) { const st = S(G.box, gold, 4, 0.04, 0.12, x, 0, 0); const z = 6 - i - 0.5, yy = ang > 0 ? 5 * (6 - z) / 14 : 5 + 5 * (z + 8) / 14; st.position.set(x, yy + 0.02, z); ccScene.add(st); } };
  ramp(9, 2.5, Math.atan2(5, 14), carpet); ramp(-9, 7.5, -Math.atan2(5, 14), carpet);
  ccScene.add(S(G.box, wall, 4, 4.4, 9.5, 9, 2.2, -3.25)); ccScene.add(S(G.box, wall, 4, 4.4, 9.5, -9, 7.2, 1.25));
  ccBox(7, 11, -8, 1.5, 0, 1.0, wall, false).noStand = true; ccBox(-11, -7, -3.5, 6, 5, 6.0, wall, false).noStand = true;
  for (const [x, y0, sgn] of [[7, 0, 1], [-7, 5, -1]]) for (let i = 0; i <= 14; i += 2) { const z = 6 - i, yy = sgn > 0 ? y0 + 5 * i / 14 : y0 + 5 * (14 - i) / 14; ccScene.add(S(G.cyl, gold, 0.05, 1, 0.05, x, yy + 0.5, z)); }
  // railings around the stair holes
  ccBox(6.85, 7.0, -8, 6, 5, 6, gold); ccBox(-7.0, -6.85, -8, 6, 10, 11, gold);
  ccSign('↑ 2 AUKŠTAS', 9, 1.9, 6.4, 0, 2.6); ccSign('↑ 3 AUKŠTAS', -9, 6.9, 6.4, 0, 2.6);
  // ---------- floor 1: entrance hall ----------
  ccScene.add(S(G.box, carpet, 2.6, 0.03, 18, 0, 0.02, 0.5));
  { const t = S(G.box, wood, 2, 0.12, 8, -4, 0.95, -2); ccScene.add(t); for (const [x, z] of [[-4.8, -5.6], [-3.2, -5.6], [-4.8, 1.6], [-3.2, 1.6]]) ccScene.add(S(G.cyl, wood, 0.08, 0.9, 0.08, x, 0.45, z)); CC.boxes.push({ x: -4, z: -2, hx: 1.1, hz: 4.1, y0: 0, y1: 1.1 });
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { ccScene.add(S(G.box, wood, 0.5, 0.08, 0.5, -4 + s * 1.5, 0.5, -5 + i * 2)); ccScene.add(S(G.box, wood, 0.08, 0.7, 0.5, -4 + s * 1.75, 0.85, -5 + i * 2)); }
    for (let i = 0; i < 5; i++) ccScene.add(S(G.sph, mat(pick([0xff6b6b, 0xffd23a, 0x7dff8a, 0xff9ee8])), 0.15, 0.15, 0.15, -4 + rr(-0.5, 0.5), 1.1, -5 + i * 1.6)); }
  for (const x of [-2.4, 2.4]) { const g2 = makeCloudGuard(); g2.position.set(x, 0, 7.5); g2.rotation.y = Math.PI; ccScene.add(g2); CC.boxes.push({ x, z: 7.5, hx: 0.4, hz: 0.4, y0: 0, y1: 2.5 }); }
  ccSign('DEBESŲ PILIS · 1 AUKŠTAS', 0, 4, -Z + 0.05, 0, 4);
  // ---------- floor 2: bedrooms + the royal toilet ----------
  for (const [x, z, c] of [[-5, -7, 0xffd23a], [-1.5, -7, 0xff9ee8], [2, -7, 0x8fc8ff]]) { ccScene.add(S(G.box, wood, 2.2, 0.5, 3, x, 5.25, z)); ccScene.add(S(G.box, mat(c, { roughness: 1 }), 2.1, 0.25, 2.4, x, 5.6, z + 0.25)); ccScene.add(S(G.box, mat(0xffffff, { roughness: 1 }), 1.4, 0.25, 0.6, x, 5.65, z - 1.05)); ccScene.add(S(G.box, wood, 2.2, 1.6, 0.15, x, 5.8, z - 1.55)); CC.boxes.push({ x, z, hx: 1.1, hz: 1.5, y0: 5, y1: 5.7 }); }
  ccSign('KARALIUS · KARALIENĖ · PRINCAS – miegamieji', -1.5, 8, -Z + 0.05, 0, 6);
  // toilet room: x -5..5, z 2..10, door gap in the north wall at x -1..1
  const tw = mat(0xe8f4ff, { roughness: 0.5 });
  ccBox(-5, -1, 1.9, 2.1, 5, 10, tw); ccBox(1, 5, 1.9, 2.1, 5, 10, tw); ccBox(-1, 1, 1.9, 2.1, 8.2, 10, tw); ccBox(-5.1, -4.9, 2, Z, 5, 10, tw); ccBox(4.9, 5.1, 2, Z, 5, 10, tw);
  ccScene.add(S(G.box, tile, 10, 0.03, 8, 0, 5.02, 6));
  for (let i = 0; i < 40; i++) ccScene.add(S(G.box, mat(i % 2 ? 0x9fd0e0 : 0xd8f4ff), 0.98, 0.031, 0.98, -4.5 + (i % 10), 5.025, 2.5 + Math.floor(i / 10) * 2));
  ccSign('TUALETAS', 0, 8.7, 1.85, 0, 2.2);
  // stalls
  for (const x of [-1.7, 1.7]) ccBox(x - 0.06, x + 0.06, 7.2, Z, 5, 7.4, mat(0xa8d8f0));
  const owners = [['KARALIUS', 0xffd23a, 'Karaliaus'], ['KARALIENĖ', 0xff9ee8, 'Karalienės'], ['PRINCAS', 0x6fc8ff, 'Princo']];
  owners.forEach(([name, col, gen], i) => {
    const x = -3.4 + i * 3.4;
    const t = makeToilet(); t.position.set(x, 5, 9.4); t.rotation.y = Math.PI; ccScene.add(t); CC.boxes.push({ x, z: 9.4, hx: 0.4, hz: 0.5, y0: 5, y1: 5.9 });
    ccSign(name, x, 8.1, Z - 0.05, Math.PI, 1.6);
    // the owner's jet-pack, leaning by the toilet
    const jp = buildBack('jetpack'); jp.position.set(x + 0.95, 5.55, 9.3); jp.rotation.y = Math.PI; jp.rotation.z = 0.15;
    jp.traverse(o => { if (o.isMesh && o.material && o.material.color && o.material.color.getHex() === 0xd8e8ff) o.material = mat(col, { roughness: 0.4, metalness: 0.3 }); });
    jp.userData.flames.forEach(f => f.visible = false); ccScene.add(jp);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: col, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); glow.scale.setScalar(1.2); glow.position.set(x + 0.95, 5.6, 9.3); ccScene.add(glow);
    CC.jets.push({ m: jp, glow, x: x + 0.95, z: 9.3, name: gen, i });
    if (ccJetTaken === i) { jp.visible = false; glow.visible = false; }
  });
  // a sink and a mirror by the door
  ccScene.add(S(G.box, mat(0xffffff, { roughness: 0.3 }), 1, 0.2, 0.6, 4.3, 5.9, 3.2)); ccScene.add(S(G.cyl, mat(0xffffff), 0.12, 0.85, 0.12, 4.3, 5.45, 3.2));
  { const mr = mesh(new THREE.PlaneGeometry(0.9, 1.1), mat(0xdff4ff, { metalness: 0.9, roughness: 0.05 }), 4.88, 6.9, 3.2); mr.rotation.y = -Math.PI / 2; ccScene.add(mr); }
  ccSign('2 AUKŠTAS', 9, 7.8, -Z + 0.05, 0, 2.4);
  // ---------- floor 3: the throne room ----------
  ccScene.add(S(G.box, carpet, 3, 0.03, 16, 2, 10.02, 0));
  for (const x of [-4, 8]) for (const z of [-6, 0, 6]) { ccScene.add(S(G.cyl, wall, 0.45, 5, 0.45, x, 12.5, z)); CC.boxes.push({ x, z, hx: 0.45, hz: 0.45, y0: 10, y1: 15 }); }
  { const th = new THREE.Group(); th.position.set(2, 10, -8.5); ccScene.add(th);
    th.add(S(G.box, gold, 2.4, 0.5, 2, 0, 0.25, 0)); th.add(S(G.box, mat(0x8fc8ff, { roughness: 1 }), 1.8, 0.4, 1.6, 0, 0.7, 0.1)); th.add(S(G.box, gold, 2.4, 3.2, 0.3, 0, 1.6, -0.9));
    for (const x of [-1.1, 1.1]) th.add(S(G.sph, gold, 0.25, 0.25, 0.25, x, 3.3, -0.9)); th.add(S(G.cone, gold, 0.3, 0.6, 0.3, 0, 3.5, -0.9));
    CC.boxes.push({ x: 2, z: -8.6, hx: 1.3, hz: 1.1, y0: 10, y1: 11.4 }); }
  const king = makeCloudKing(); king.position.set(2, 10, -6.3); ccScene.add(king); CC.king = king;
  const pr = makePrince(); pr.position.set(3.8, 10.2, -6); ccScene.add(pr); CC.prince = pr; pr.visible = Q8.stage === 'cloud' || Q8.stage === 'done';
  { const ch = new THREE.Group(); ch.position.set(2, 14.2, 0); ccScene.add(ch); ch.add(mesh(new THREE.TorusGeometry(1.2, 0.08, 8, 24), gold, 0, 0, 0).rotateX(Math.PI / 2)); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ch.add(S(G.sph, new THREE.MeshBasicMaterial({ color: 0xfff6c8 }), 0.14, 0.14, 0.14, Math.cos(a) * 1.2, 0.15, Math.sin(a) * 1.2)); } }
  ccSign('3 AUKŠTAS · SOSTO SALĖ', 2, 13.6, -Z + 0.05, 0, 4);
  for (const [x, y, z] of [[0, 3.5, 0], [0, 8.5, 0], [2, 13.5, -3], [0, 8.5, 6]]) { const l = new THREE.PointLight(0xfff0d8, 0.35, 14); l.position.set(x, y, z); ccScene.add(l); }
  linearize(ccScene);
}
let ccExitDoor = null;
function enterCloudCastle() {
  if (transitioning) return; transitioning = true; cancelPlace(true); stopClimb(); hideCard();
  sfx.magic && sfx.magic();
  fadeTo(() => {
    transitioning = false; buildCloudCastleIn(); mode = 'cloudcastle'; ccScene.add(player.mesh);
    if (CC.prince) CC.prince.visible = Q8.stage === 'cloud' || Q8.stage === 'done';
    player.pos.set(0, 0, 7.6); player.up.set(0, 1, 0); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.grounded = true; player.pitch = 0.2;
    camera.position.set(0, 3, 12); camera.up.set(0, 1, 0);
    $('bName').textContent = 'Debesų Pilis'; $('bEn').textContent = 'Trys aukštai'; $('bAtm').textContent = '1 aukštas – salė, 2 aukštas – miegamieji ir tualetas, 3 aukštas – Karaliaus sosto salė.'; document.documentElement.style.setProperty('--biome', '#8fc8ff');
    toast('Debesų Pilis', 'Laiptai į viršų – dešinėje. Karalius – trečiame aukšte', '#8fc8ff');
  });
}
function leaveCloudCastle() {
  if (transitioning) return; transitioning = true; hideCard();
  fadeTo(() => {
    transitioning = false; mode = 'planet'; world.add(player.mesh); curBiome = -1;
    const g = cloudKing.g, d = cloudKing.d; g.updateMatrixWorld(true);
    const p = g.localToWorld(new V3(0, 0.3, 3)), out = g.localToWorld(new V3(0, 0.3, 8));
    player.pos.copy(p); player.up.copy(p).normalize(); player.fwd.copy(out.sub(p)).projectOnPlane(player.up).normalize(); player.vel.set(0, 0, 0); player.vr = 0;
    camera.position.copy(player.pos).addScaledVector(player.up, 3).addScaledVector(player.fwd, -6);
  });
}
const ccFloor = () => player.pos.y < 4 ? 1 : player.pos.y < 9 ? 2 : 3;
const ccNearKing = () => ccFloor() === 3 && Math.hypot(player.pos.x - 2, player.pos.z + 6.3) < 4;
const ccNearExit = () => ccFloor() === 1 && Math.abs(player.pos.x) < 1.8 && player.pos.z > 8.4;
function ccNearJet() { if (ccFloor() !== 2) return null; let best = null, bd = 1.5; for (const j of CC.jets) { if (!j.m.visible) continue; const d = Math.hypot(player.pos.x - j.x, player.pos.z - j.z); if (d < bd) { bd = d; best = j; } } return best; }
function takeCastleJet(j) {
  if (Q8.owned.includes('jetpack')) { toast('Tu jau turi debesų kuprinę', 'Šitą palik – kitaip ' + (j.i === 0 ? 'Karalius' : j.i === 1 ? 'Karalienė' : 'Princas') + ' neturės kuo skraidyti', '#8fc8ff'); return; }
  j.m.visible = false; j.glow.visible = false; ccJetTaken = j.i; try { localStorage.setItem('modly-ccjet', String(j.i)); } catch (_) { }
  Q8.owned.push('jetpack'); saveQ8(); wearBack('jetpack');
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.4, { type: 'triangle', vol: 0.07, when: i * 0.09 }));
  toast(`Paėmei ${j.name} DEBESŲ KUPRINĘ!`, 'Ji tavo! Laikyk Space – kylsi aukštyn, Shift – greičiau', '#8fc8ff');
  setTimeout(() => bubbleIn(ccScene, new V3(j.x, 5.2, j.z - 1), pick(['Ei! Kas paėmė mano kuprinę?!', 'Hmm… kur mano kuprinė?', 'Gerai, tegul būna tavo!']), 2.4), 900);
}
function cloudCastleAction() {
  if (card) { if (card.kind === 'talk') advanceTalk(); else hideCard(); return; }
  const j = ccNearJet(); if (j) { takeCastleJet(j); return; }
  if (ccNearKing()) { talkCloudKing(); return; }
  if (ccNearExit()) { leaveCloudCastle(); return; }
}
function updateCloudCastle(dt, t) {
  const f = player.down ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = player.down ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 9 : 5; _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, player.grounded ? Math.min(1, 12 * dt) : Math.min(1, 2.5 * dt));
  if (!player.down && keys.Space && player.grounded && Q8.back !== 'jetpack') { player.vr = 7; player.grounded = false; sfx.jump(); }
  if (!player.down) flatJetpack(dt);
  player.pos.addScaledVector(player.vel, dt); player.vr -= GRAV * dt; player.pos.y += player.vr * dt;
  const rad = 0.35, py = player.pos.y;
  for (const b of CC.boxes) {
    if (py + 1.8 < b.y0 || py >= b.y1 - 0.45) continue;
    const dx = player.pos.x - b.x, dz = player.pos.z - b.z, ex = b.hx + rad - Math.abs(dx), ez = b.hz + rad - Math.abs(dz); if (ex <= 0 || ez <= 0) continue;
    if (ex < ez) player.pos.x += dx < 0 ? -ex : ex; else player.pos.z += dz < 0 ? -ez : ez;
  }
  let ground = ccGround(player.pos.x, player.pos.z, player.pos.y);
  for (const b of CC.boxes) if (!b.noStand && py >= b.y1 - 0.45 && b.y1 > ground && b.y1 - b.y0 < 2 && Math.abs(player.pos.x - b.x) < b.hx + 0.2 && Math.abs(player.pos.z - b.z) < b.hz + 0.2) ground = b.y1;
  player.pos.x = clamp(player.pos.x, -CC.X + rad, CC.X - rad); player.pos.z = clamp(player.pos.z, -CC.Z + rad, CC.Z + (Math.abs(player.pos.x) < 1.6 && player.pos.y < 3 ? 0.3 : -rad));
  const ceil = ccCeil(player.pos.x, player.pos.z, player.pos.y); if (player.pos.y + 1.9 > ceil) { player.pos.y = ceil - 1.9; if (player.vr > 0) player.vr = 0; }
  if (player.pos.y <= ground) { player.pos.y = ground; player.vr = 0; player.grounded = true; } else if (player.pos.y - ground > 0.3 || player.vr > 0) player.grounded = false; else { player.pos.y = ground; player.vr = 0; player.grounded = true; }
  player.mesh.rotation.set(0, 0, 0); player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd);
  if (player.down) downPose(dt, T); else animateMan(dt, f !== 0 || s !== 0, sp);
  // camera: stays inside the castle and below the ceiling of your floor
  const dist = 4.4, pitch = player.pitch, head = player.pos.clone().add(new V3(0, 1.4, 0));
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
  for (let k = 1; k <= 10; k++) { const q = head.clone().lerp(_ct, k / 10); let hit = false; for (const b of CC.boxes) if (q.y > b.y0 && q.y < b.y1 && b.y1 - b.y0 > 3 && Math.abs(q.x - b.x) < b.hx + 0.25 && Math.abs(q.z - b.z) < b.hz + 0.25) { hit = true; break; } if (hit) { _ct.copy(head).lerp(_ct, Math.max(0, (k - 1.5) / 10)); break; } }
  _ct.x = clamp(_ct.x, -CC.X + 0.3, CC.X - 0.3); _ct.z = clamp(_ct.z, -CC.Z + 0.3, CC.Z - 0.3); _ct.y = clamp(_ct.y, ground + 0.4, ccCeil(player.pos.x, player.pos.z, player.pos.y) - 0.3);
  camera.position.lerp(_ct, Math.min(1, dt * 10)); camera.up.set(0, 1, 0); camera.lookAt(head);
  // life in the castle
  if (CC.king) CC.king.userData.body.rotation.y = Math.atan2(player.pos.x - 2, player.pos.z + 6.3) * 0.4;
  if (CC.prince && CC.prince.visible) CC.prince.position.y = 10.3 + Math.abs(Math.sin(t * 3)) * 0.4;
  for (const j of CC.jets) if (j.glow.visible) j.glow.material.opacity = 0.35 + 0.2 * Math.sin(t * 3 + j.i);
  let txt = '';
  if (!card) {
    const j = ccNearJet();
    if (j) txt = `<kbd>E</kbd> paimti ${j.name} debesų kuprinę`;
    else if (ccNearKing()) txt = '<kbd>E</kbd> kalbėtis su Debesų Karaliumi';
    else if (ccNearExit()) txt = '<kbd>E</kbd> išeiti iš pilies';
    else txt = `${ccFloor()} aukštas`;
  }
  setPrompt(txt);
  updateQuestHud();
}
// the prince now lives inside the castle (on the 3rd floor, by his father)
showPrinceAtCastle = () => { if (CC.prince) CC.prince.visible = Q8.stage === 'cloud' || Q8.stage === 'done'; };
function castleTest() {
  if (mode !== 'planet' || player.inCar) { toast('Išeik į pasaulį pėsčiomis', 'Ir tada vėl įvesk „pilis“', '#8fc8ff'); return; }
  enterCloudCastle();
}
