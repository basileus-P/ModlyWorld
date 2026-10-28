// ================= Secret adventure: the Rainbow World =================
// talk to Father Unicorn 20 times at the Creator's → steal his horn → drop it into the icy pond on Ice Island
// → the water turns rainbow → jump in → a whole new world of candy, rainbows, clouds and hundreds of unicorns
const Q6 = { stage: 'none', talks: 0, tasks: { drown: false, exam: false, thieves: false }, skin: false };   // none | horn | thrown | world | done
try { const s = JSON.parse(localStorage.getItem('modly-quest6') || 'null'); if (s) Object.assign(Q6, s, { tasks: Object.assign(Q6.tasks, s.tasks || {}) }); } catch (_) { }
function saveQ6() { try { localStorage.setItem('modly-quest6', JSON.stringify(Q6)); } catch (_) { } }
const Q6_TASKS = () => (Q6.tasks.drown ? 1 : 0) + (Q6.tasks.exam ? 1 : 0) + (Q6.tasks.thieves ? 1 : 0);

// ---------- 1. talking Father Unicorn's ear off ----------
function dadUnicornTalk(f) {
  if (Q6.stage !== 'none') {
    card = { kind: 'info' }; showCard(f.name, Q6.stage === 'done' ? 'Ragas ataugo dar gražesnis! O tu – tikras vienaragių draugas. Bet daugiau nevok, gerai?' : 'Kur mano ragas?! …Na, nieko. Ataugs. Vienaragių ragai visada ataugą.', 'E – uždaryti', '#ff7ac8'); sfx.blip(); return true;
  }
  Q6.talks++; saveQ6();
  const n = Q6.talks;
  const lines = n < 5 ? f.lines : n < 10 ? ['Taip, taip… čia saugu… Ar aš jau sakiau, kad čia saugu?', 'Tu labai daug kalbi, mažasis. Bet man patinka.']
    : n < 15 ? ['Aaaaach… *žiovauja* …atleisk. Kai daug kalbu, mane apima miegas.', 'Mmm… apie ką mes čia… *žiovauja*']
      : n < 20 ? ['Zzz… o? Ką sakei? …Zzz…', '…mano ragas… svajonėse… Zzz…'] : null;
  if (lines) { card = { kind: 'info' }; showCard(f.name, lines[n % lines.length] + `  (${n} / 20)`, 'E – uždaryti', '#ff7ac8'); sfx.blip(); return true; }
  // the 20th time: he's fast asleep — and the horn just pops off
  if (f.m.userData.horn) f.m.userData.horn.visible = false;
  Q6.stage = 'horn'; saveQ6(); attachDadHorn(true); if (icePond) icePond.inspect.verb = 'įmesti ragą į vandenį';
  card = { kind: 'info' }; showCard(f.name, 'ZZZZZ… *knarkia taip garsiai, kad dreba Kūrėjo Salė* — ir jo ragas – kliukt! – atsiklijuoja ir nukrenta tau į rankas.', 'E – uždaryti', '#ff7ac8');
  [1047, 784, 523].forEach((fr, i) => tone(fr, 0.3, { type: 'triangle', vol: 0.06, when: i * 0.12 }));
  toast('Pavogei Tėčio Vaivorykščio ragą!', 'Ragas virpa ir traukia tave link Ledo Salos… ten yra ledinis ežerėlis', '#ff9ee8');
  return true;
}
let heldDadHorn = null;
function attachDadHorn(on) {
  const hand = player.mesh.userData.parts.handR;
  if (on && !heldDadHorn) { heldDadHorn = makeUniHorn(); heldDadHorn.scale.setScalar(0.5); heldDadHorn.position.set(0, -0.1, 0.12); hand.add(heldDadHorn); linearize(heldDadHorn); }
  if (!on && heldDadHorn) { hand.remove(heldDadHorn); heldDadHorn = null; }
}

// ---------- 2. the icy pond on Ice Island ----------
let pondSpot = null, icePond = null;
function reservePondSpot() {
  let best = null, bs = -1e9;
  for (const path of roadPaths) for (const x of path.s) { if (x.bridge) continue; weights(x.d.x, x.d.y, x.d.z, W); if (W[2] < 0.85) continue; const sc = -Math.abs(x.d.dot(BC[2]) - 0.95); if (sc > bs) { bs = sc; best = x; } }
  if (!best) return;
  let d = moveAlong(best.d, best.side, ROAD_HALF + 8); if (TH(d) < 0.2) d = moveAlong(best.d, best.side, -(ROAD_HALF + 8));
  pondSpot = { d, face: best.d.clone() };
  reserved.push({ d: d.clone(), r: 7 });
}
function buildIcePond() {
  if (!pondSpot) return;
  const { d, face } = pondSpot, fwd = tangentToward(d, face).normalize();
  const g = new THREE.Group(); g.position.copy(d).multiplyScalar(R + TH(d) - 0.05); orient(g, d, fwd); world.add(g);
  const ice = mat(0xd8f2ff, { roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.92 });
  g.add(S(G.cyl, mat(0xeaf8ff, { roughness: 0.3 }), 5.2, 0.3, 5.2, 0, 0.1, 0));
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, s = rr(0.6, 1.1); const b = S(G.box, ice, s, s * rr(0.6, 1.2), s, Math.cos(a) * 4.4, s * 0.35, Math.sin(a) * 4.4); b.rotation.y = rr(0, 3); g.add(b); }
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x1a5a8a, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.9 });
  const water = mesh(new THREE.CircleGeometry(3.6, 40), waterMat, 0, 0.28, 0); water.rotation.x = -Math.PI / 2; g.add(water);
  const rbMat = new THREE.MeshBasicMaterial({ map: swirlTex(RAINBOW), transparent: true, opacity: 0.95 });
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffb8f0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); glow.scale.setScalar(12); glow.position.y = 1.5; g.add(glow);
  g.add(mesh(new THREE.PlaneGeometry(3.2, 0.6), new THREE.MeshBasicMaterial({ map: labelTex('LEDINIS EŽERĖLIS', '#2a6a9a', '#ffffff', 512, 100), side: THREE.DoubleSide }), 0, 2.6, -5));
  g.add(S(G.cyl, mat(0x8a5a2b), 0.08, 2.3, 0.08, -1.3, 1.15, -5)); g.add(S(G.cyl, mat(0x8a5a2b), 0.08, 2.3, 0.08, 1.3, 1.15, -5));
  icePond = { g, d, fwd, water, waterMat, rbMat, glow, center: g.position.clone().addScaledVector(d, 0.3) };
  icePond.inspect = addInspect(icePond.center.clone().addScaledVector(d, 1), 'Ledinis ežerėlis', 'Vanduo toks šaltas, kad net žuvys čia dėvi šalikus. Keista – atrodo, lyg jis kažko lauktų.', 5.5, { onUse: usePond });
  if (Q6.stage === 'thrown' || Q6.stage === 'world' || Q6.stage === 'done') makePondRainbow(true);
  else if (Q6.stage === 'horn') icePond.inspect.verb = 'įmesti ragą į vandenį';
  animators.push((dt, t) => { if (water.material === rbMat) { water.rotation.z += dt * 0.8; glow.material.opacity = 0.45 + 0.15 * Math.sin(t * 3); } });
}
function makePondRainbow(quiet) {
  icePond.water.material = icePond.rbMat; icePond.inspect.verb = 'šokti į spalvotą vandenį'; icePond.inspect.text = '';
  if (!quiet) { poof(icePond.center.clone(), 0xff9ee8); [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.5, { type: 'sine', vol: 0.06, when: i * 0.09 })); }
}
function usePond() {
  if (Q6.stage === 'horn') {
    attachDadHorn(false); Q6.stage = 'thrown'; saveQ6();
    noiseHit(0.5, { f: 900, vol: 0.12 });
    setTimeout(() => { makePondRainbow(); toast('Vanduo tapo spalvotas!', 'Įšok į jį (užlipk ant vandens arba spausk E)', '#ff9ee8'); }, 500);
    return;
  }
  if (Q6.stage === 'thrown' || Q6.stage === 'world' || Q6.stage === 'done') { enterRainbow(); return; }
  card = { kind: 'info' }; showCard('Ledinis ežerėlis', icePond.inspect.text);
}
function updatePondPlanet() {
  if (!icePond || transitioning || player.inCar) return;
  if ((Q6.stage === 'thrown' || Q6.stage === 'world' || Q6.stage === 'done') && player.pos.distanceTo(icePond.center) < 3.2) enterRainbow();
}

// ---------- 3. the Rainbow World ----------
const rbScene = new THREE.Scene(); rbScene.background = new THREE.Color(0xd8ecff); rbScene.fog = new THREE.Fog(0xf0e6ff, 90, 280);
rbScene.add(new THREE.AmbientLight(0xffffff, 0.5)); rbScene.add(new THREE.HemisphereLight(0xffffff, 0xffc0e0, 0.55));
{ const l = new THREE.DirectionalLight(0xfff3e0, 0.9); l.position.set(40, 80, 30); rbScene.add(l); }
const RW = { built: false, boxes: [], circles: [], x0: -150, x1: 150, z0: -150, z1: 150, H: 60, crowd: null, flyers: [], spots: {} };
const RB_POOL = new V3(0, 0, 138), RB_QUEEN = new V3(0, 0, 112), RB_LAKE = new V3(-70, 0, 30), RB_LAKE_R = 16, RB_BUOY = new V3(-62, 0, 50), RB_SCHOOL = new V3(75, 0, 40), RB_CAGE = new V3(70, 0, -80);

// merge a whole little unicorn into one geometry with vertex colours, for an instanced herd
function mergeToGeometry(root) {
  root.updateMatrixWorld(true);
  const pos = [], nor = [], col = [];
  root.traverse(o => {
    if (!o.isMesh) return;
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.applyMatrix4(o.matrixWorld);
    const p = g.attributes.position, n = g.attributes.normal, c = o.material.color || new THREE.Color(1, 1, 1);
    for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(c.r, c.g, c.b); }
  });
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return out;
}
function rbFree(x, z, r) {
  if (Math.hypot(x - RB_LAKE.x, z - RB_LAKE.z) < RB_LAKE_R + 3 + r) return false;
  for (const s of Object.values(RW.spots)) if (Math.hypot(x - s.x, z - s.z) < s.r + r) return false;
  return true;
}
function buildRainbow() {
  if (RW.built) return; RW.built = true;
  const sc = rbScene, box = (x, z, hx, hz, h) => RW.boxes.push(h ? { x, z, hx, hz, h } : { x, z, hx, hz });
  RW.spots = { pool: { x: RB_POOL.x, z: RB_POOL.z, r: 8 }, queen: { x: 0, z: 98, r: 22 }, buoy: { x: RB_BUOY.x, z: RB_BUOY.z, r: 4 }, school: { x: RB_SCHOOL.x, z: RB_SCHOOL.z - 4, r: 16 }, cage: { x: RB_CAGE.x, z: RB_CAGE.z, r: 14 } };
  const sign = (x, z, text, ry = 0, bg = '#ff5fae') => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; sc.add(g);
    g.add(S(G.cyl, mat(0xffffff), 0.1, 2.8, 0.1, 0, 1.4, 0));
    g.add(mesh(new THREE.PlaneGeometry(3.6, 0.7), new THREE.MeshBasicMaterial({ map: labelTex(text, bg, '#fff7d6', 640, 120), side: THREE.DoubleSide }), 0, 2.8, 0.06));
  };
  // ground: candy on the left half, rainbow & cloud on the right half
  const geo = new THREE.PlaneGeometry(330, 330, 150, 150); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, col = [], c = new THREE.Color(), c2 = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), n = noise(x * 0.05, 0, z * 0.05);
    c.setHSL(n > 0.1 ? 0.45 : 0.93, 0.7, 0.76 + 0.04 * Math.sin(x * 0.3 + z * 0.2));
    const cloud = noise(x * 0.03 + 9, 1, z * 0.03) > 0.25;
    c2.setHSL(((z + 165) / 330 * 6) % 1, 0.6, 0.82); if (cloud) c2.setRGB(1, 1, 1);
    const k = clamp((x + 8) / 16, 0, 1); c.lerp(c2, k); col.push(c.r, c.g, c.b);
  }
  srgbArrayToLinear(col); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  sc.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 })));
  // giant sky rainbow + a fence of fluffy cloud all round
  RAINBOW.forEach((cc, i) => { const t = mesh(new THREE.TorusGeometry(220 - i * 7, 3.5, 6, 80, Math.PI), new THREE.MeshBasicMaterial({ color: cc, fog: false, transparent: true, opacity: 0.5 })); t.position.set(40, -10, -260); sc.add(t); });
  for (let k = 0; k < 70; k++) {
    const a = k / 70 * Math.PI * 2, r = rr(158, 175), g = new THREE.Group(); g.position.set(Math.cos(a) * r, rr(0, 6), Math.sin(a) * r); sc.add(g);
    const m = mat(pick([0xffffff, 0xffe8f6, 0xe8f2ff]), { roughness: 1 });
    for (let i = 0; i < 5; i++) { const s = rr(5, 10); g.add(S(G.sph, m, s, s * 0.7, s, rr(-7, 7), rr(-1, 4), rr(-4, 4))); }
  }
  for (let k = 0; k < 18; k++) {   // floating cloud islands
    const g = new THREE.Group(); g.position.set(rr(-140, 140), rr(22, 45), rr(-140, 140)); sc.add(g);
    for (let i = 0; i < 6; i++) { const s = rr(3, 6); g.add(S(G.sph, mat(0xffffff, { roughness: 1 }), s, s * 0.6, s, rr(-6, 6), rr(-1, 1), rr(-5, 5))); }
  }
  // ---- candy half (x < 0) ----
  const lolMats = [['#ff4f9a', '#ffffff'], ['#3cc6ff', '#fff38a'], ['#7a6bff', '#ffd1f0'], ['#5fe37a', '#ffffff'], ['#ff9f1c', '#fff2c8']].map(cc => new THREE.MeshStandardMaterial({ map: swirlTex(cc), roughness: 0.25 }));
  const caneT = stripeTex(['#ff3355', '#ffffff'], 6); caneT.repeat.set(1, 2); const caneM = new THREE.MeshStandardMaterial({ map: caneT, roughness: 0.35 });
  let n = 0;
  for (let tries = 0; tries < 900 && n < 85; tries++) {
    const x = rr(-145, -6), z = rr(-145, 145); if (!rbFree(x, z, 3)) continue; n++;
    const kind = rnd();
    if (kind < 0.55) {
      const h = rr(3, 7), r = rr(1, 2.2), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rr(0, 6.3); sc.add(g);
      g.add(S(G.cyl, mat(0xffffff), 0.1, h, 0.1, 0, h / 2, 0)); const d = S(G.cyl, pick(lolMats), r, 0.35, r, 0, h + r * 0.8, 0); d.rotation.x = Math.PI / 2; g.add(d); box(x, z, 0.3, 0.3);
    } else if (kind < 0.75) {
      const g = new THREE.Group(), h = rr(4, 8); g.position.set(x, 0, z); g.rotation.y = rr(0, 6.3); sc.add(g);
      g.add(S(G.cyl, caneM, 0.3, h, 0.3, 0, h / 2, 0)); const hook = mesh(new THREE.TorusGeometry(0.9, 0.3, 10, 18, Math.PI), caneM); hook.position.set(0.9, h, 0); g.add(hook); box(x, z, 0.4, 0.4);
    } else {
      const s = rr(1, 2.4); sc.add(S(G.dome, mat(pick([0xff4f6d, 0xffe14d, 0x5fe37a, 0x3cc6ff, 0xd46bff, 0xff9f1c]), { roughness: 0.15 }), s, s * 1.2, s, x, 0, z)); box(x, z, s * 0.7, s * 0.7);
    }
  }
  for (let k = 0; k < 6; k++) {   // giant cupcakes
    const x = rr(-140, -20), z = rr(-140, 140); if (!rbFree(x, z, 7)) continue;
    sc.add(S(G.cyl, mat(0xd99a55), 4, 3, 3.2, x, 1.5, z)); sc.add(S(G.dome, mat(pick([0xffb3dd, 0xb8f5d8, 0xfff2c8])), 4.6, 4, 4.6, x, 3, z)); sc.add(S(G.sph, mat(0xe8203c), 0.9, 0.9, 0.9, x, 7.2, z)); box(x, z, 3.6, 3.6);
  }
  // ---- rainbow & cloud half (x > 0) ----
  for (let k = 0; k < 9; k++) {   // rainbow arches you can walk under
    const x = rr(15, 140), z = rr(-140, 140); if (!rbFree(x, z, 8)) continue; const ry = rr(0, 3.1), R0 = rr(7, 11);
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; sc.add(g);
    RAINBOW.forEach((cc, i) => g.add(mesh(new THREE.TorusGeometry(R0 - i * 0.5, 0.26, 6, 40, Math.PI), mat(new THREE.Color(cc).getHex(), { roughness: 0.4 }))));
    for (const sx of [-1, 1]) { const cx = x + Math.cos(ry) * sx * (R0 - 1.5), cz = z - Math.sin(ry) * sx * (R0 - 1.5); for (let i = 0; i < 4; i++) { const s = rr(1.4, 2.4); sc.add(S(G.sph, mat(0xffffff, { roughness: 1 }), s, s * 0.7, s, cx + rr(-1, 1), s * 0.4, cz + rr(-1, 1))); } box(cx, cz, 1.6, 1.6); }
  }
  for (let k = 0, tries = 0; k < 45 && tries < 400; tries++) {   // soft cloud bushes
    const x = rr(8, 145), z = rr(-145, 145); if (!rbFree(x, z, 3)) continue; k++;
    const s = rr(1.2, 2.8); for (let i = 0; i < 4; i++) sc.add(S(G.sph, mat(pick([0xffffff, 0xfff0fa, 0xeef6ff]), { roughness: 1 }), s, s * 0.75, s, x + rr(-s, s), s * 0.45, z + rr(-s, s)));
    box(x, z, s, s);
  }
  // ---- the arrival pool (also the way home) ----
  const pool = mesh(new THREE.CircleGeometry(4, 40), new THREE.MeshBasicMaterial({ map: swirlTex(RAINBOW) }), RB_POOL.x, 0.06, RB_POOL.z); pool.rotation.x = -Math.PI / 2; sc.add(pool); RW.pool = pool;
  sc.add(mesh(new THREE.TorusGeometry(4.1, 0.35, 8, 40), mat(0xffffff, { roughness: 0.3 }), RB_POOL.x, 0.1, RB_POOL.z).rotateX(Math.PI / 2));
  sign(6, 136, 'BASEINAS NAMO', -0.4, '#5a8aff');
  // ---- the Queen and her castle ----
  const castle = new THREE.Group(); castle.position.set(0, 0, 86); sc.add(castle);
  castle.add(S(G.box, mat(0xfff0fa), 22, 9, 8, 0, 4.5, 0));
  for (const [tx, tz] of [[-11, 0], [11, 0], [-5, -3], [5, -3]]) { castle.add(S(G.cyl, mat(0xffd1ec), 2.4, 14, 2.4, tx, 7, tz)); castle.add(S(G.cone, mat(pick([0x8fd8ff, 0xc9a6ff, 0xffe14d])), 2.9, 5, 2.9, tx, 16.5, tz)); }
  castle.add(S(G.box, mat(0xd99aff), 4, 6, 0.4, 0, 3, 4.1));
  RAINBOW.forEach((cc, i) => castle.add(S(G.box, bmat(new THREE.Color(cc).getHex()), 22, 0.35, 0.3, 0, 8.6 - i * 0.35, 4.05)));
  box(0, 86, 12.5, 5);
  RW.queen = makeUnicorn({ col: 0xfff6ff, s: 1.7 }); RW.queen.position.copy(RB_QUEEN); sc.add(RW.queen);
  { const crown = new THREE.Group(); crown.position.set(0, 0.42, 0.02); RW.queen.userData.head.add(crown); crown.add(S(G.cyl, mat(0xffd23a, { metalness: 0.8, roughness: 0.25 }), 0.22, 0.12, 0.22, 0, 0, 0)); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; crown.add(S(G.cone, mat(0xffd23a, { metalness: 0.8, roughness: 0.25 }), 0.05, 0.14, 0.05, Math.cos(a) * 0.19, 0.12, Math.sin(a) * 0.19)); } }
  sign(-6, 118, 'VIENARAGIŲ KARALIENĖ', 0.3, '#b05aff');
  // ---- the lake with the drowning unicorn ----
  const lakeM = new THREE.MeshStandardMaterial({ map: swirlTex(['#7fd0ff', '#a8e4ff', '#ffc8ec', '#8fdcff']), roughness: 0.08, metalness: 0.2 });
  const lake = mesh(new THREE.CircleGeometry(RB_LAKE_R, 48), lakeM, RB_LAKE.x, 0.05, RB_LAKE.z); lake.rotation.x = -Math.PI / 2; sc.add(lake); RW.lake = lake;
  sc.add(mesh(new THREE.TorusGeometry(RB_LAKE_R + 0.2, 0.5, 6, 64), mat(0xfff2c8, { roughness: 0.9 }), RB_LAKE.x, 0.1, RB_LAKE.z).rotateX(Math.PI / 2));
  RW.circles.push({ x: RB_LAKE.x, z: RB_LAKE.z, r: RB_LAKE_R });
  RW.drown = makeUnicorn({ col: 0xc8f0ff, s: 0.9 }); sc.add(RW.drown);
  if (Q6.tasks.drown) RW.drown.position.set(RB_LAKE.x + 4, 0, RB_LAKE.z + RB_LAKE_R + 3); else RW.drown.position.set(RB_LAKE.x + 3, -1.2, RB_LAKE.z + 2);
  { const post = new THREE.Group(); post.position.copy(RB_BUOY); sc.add(post); post.add(S(G.cyl, mat(0xffffff), 0.12, 2.6, 0.12, 0, 1.3, 0)); post.add(S(G.box, mat(0xffffff), 1.3, 0.12, 0.12, 0.6, 2.4, 0));
    RW.buoyOnPost = makeBuoy(); RW.buoyOnPost.position.set(1.1, 1.7, 0); RW.buoyOnPost.rotation.x = Math.PI / 2; post.add(RW.buoyOnPost); box(RB_BUOY.x, RB_BUOY.z, 0.3, 0.3);
    if (Q6.tasks.drown) RW.buoyOnPost.visible = false; }
  sign(-50, 52, 'SIRUPO EŽERAS', 0.3, '#3cb4ff');
  // ---- the Cloud School ----
  const sch = new THREE.Group(); sch.position.copy(RB_SCHOOL).add(new V3(0, 0, -8)); sc.add(sch);
  sch.add(S(G.box, mat(0xfff6e0), 14, 7, 9, 0, 3.5, 0)); sch.add(S(G.cone, mat(0x8fd8ff), 10.5, 4, 7.5, 0, 9, 0).rotateY(Math.PI / 4));
  sch.add(S(G.box, mat(0x8a5a2b), 2.4, 3.6, 0.2, 0, 1.8, 4.55));
  for (const wx of [-4.5, 4.5]) sch.add(S(G.box, bmat(0xbfe8ff), 2.2, 1.8, 0.1, wx, 4, 4.55));
  sch.add(mesh(new THREE.PlaneGeometry(6, 1.1), new THREE.MeshBasicMaterial({ map: labelTex('DEBESŲ MOKYKLA', '#5a8aff', '#ffffff', 640, 120) }), 0, 6.3, 4.62));
  for (let i = 0; i < 8; i++) { const s = rr(2, 3); sch.add(S(G.sph, mat(0xffffff, { roughness: 1 }), s, s * 0.6, s, rr(-8, 8), 0.4, rr(-5, 5))); }
  box(RB_SCHOOL.x, RB_SCHOOL.z - 8, 7.4, 4.8);
  RW.student = makeUnicorn({ col: 0xffe0b0, s: 0.8 }); RW.student.position.copy(RB_SCHOOL); RW.student.rotation.y = 0.3; sc.add(RW.student);
  // ---- the thieves and their cage ----
  const cage = new THREE.Group(); cage.position.copy(RB_CAGE); sc.add(cage); RW.cage = cage;
  cage.add(S(G.box, mat(0x30343e, { metalness: 0.6 }), 4.4, 0.25, 4.4, 0, 0.12, 0)); cage.add(S(G.box, mat(0x30343e, { metalness: 0.6 }), 4.4, 0.25, 4.4, 0, 3.6, 0));
  const bars = new THREE.Group(); cage.add(bars); RW.bars = bars;
  for (let i = 0; i < 4; i++) for (let k = -4; k <= 4; k++) { const a = i * Math.PI / 2, b = S(G.cyl, mat(0x60646e, { metalness: 0.7 }), 0.06, 3.5, 0.06, 0, 1.85, 0); b.position.x = Math.cos(a) * 2.1 + -Math.sin(a) * k * 0.5; b.position.z = Math.sin(a) * 2.1 + Math.cos(a) * k * 0.5; bars.add(b); }
  box(RB_CAGE.x, RB_CAGE.z, 2.3, 2.3);
  RW.caged = makeUnicorn({ col: 0xffd6f6, s: 0.85 }); sc.add(RW.caged);
  RW.caged.position.copy(Q6.tasks.thieves ? RB_CAGE.clone().add(new V3(0, 0, 4.5)) : RB_CAGE);
  if (Q6.tasks.thieves) bars.visible = false;
  sc.add(S(G.sph, mat(0x3a3a2a, { roughness: 1 }), 1.1, 0.9, 1.1, RB_CAGE.x + 4, 0.6, RB_CAGE.z - 3));
  RW.thieves = [];
  if (!Q6.tasks.thieves) for (let i = 0; i < 3; i++) {
    const m = makePerson(); m.userData.body.children[0].material = mat(0x22242c); m.userData.body.add(S(G.box, bmat(0x111111), 0.62, 0.12, 0.1, 0, 1.8, 0.24)); m.userData.body.add(S(G.cyl, mat(0x22242c), 0.33, 0.25, 0.33, 0, 2.02, 0));
    sc.add(m); RW.thieves.push({ m, a: i / 3 * Math.PI * 2, state: 'guard', vel: new V3(), vy: 0, spin: rr(-10, 10), t: 0, sayT: rr(1, 4) });
  }
  sign(RB_CAGE.x - 8, RB_CAGE.z + 10, 'NEIK ČIA!', 0.5, '#30343e');
  // ---- hundreds of unicorns ----
  const proto = makeUnicorn({ col: 0xffffff, s: 1 }); linearize(proto);
  const geoU = mergeToGeometry(proto), N = 320;
  const im = new THREE.InstancedMesh(geoU, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 }), N);
  const tints = [0xffffff, 0xffe0f4, 0xe0f0ff, 0xfff4cc, 0xe8ffe8, 0xf0e0ff, 0xffe8d8];
  RW.herd = [];
  for (let i = 0; i < N; i++) {
    let x, z; for (let k = 0; k < 20; k++) { x = rr(-145, 145); z = rr(-145, 145); if (rbFree(x, z, 2)) break; }
    const fly = i < 24;
    RW.herd.push({ x, z, y: fly ? rr(14, 34) : 0, h: rr(0, 6.3), sp: fly ? rr(5, 9) : rr(0.8, 2.6), s: fly ? rr(0.8, 1.1) : rr(0.5, 1.15), ph: rr(0, 6.3), fly, turn: 0, t: rr(0, 5) });
    im.setColorAt(i, new THREE.Color(pick(tints)).convertSRGBToLinear());
  }
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); sc.add(im); RW.crowd = im;
  rbScene.environment = scene.environment; linearize(rbScene);
}
function makeBuoy() {
  const t = stripeTex(['#ff3b3b', '#ffffff'], 8, false); t.repeat.set(1, 1);
  return mesh(new THREE.TorusGeometry(0.55, 0.18, 10, 24), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 }));
}
const _rbM = new THREE.Matrix4(), _rbQ = new THREE.Quaternion(), _rbS = new V3(), _rbP = new V3(), _rbE = new THREE.Euler();
function updateHerd(dt, t) {
  const H = RW.herd, im = RW.crowd;
  for (let i = 0; i < H.length; i++) {
    const u = H[i];
    u.t -= dt; if (u.t < 0) { u.t = rr(2, 6); u.turn = rr(-0.8, 0.8); if (!u.fly && rnd() < 0.25) u.turn = 0, u.rest = rr(1, 3); }
    if (u.rest > 0) u.rest -= dt;
    else { u.h += u.turn * dt; u.x += Math.sin(u.h) * u.sp * dt; u.z += Math.cos(u.h) * u.sp * dt; }
    if (Math.abs(u.x) > 145 || Math.abs(u.z) > 145) { u.h = Math.atan2(-u.x, -u.z); u.x = clamp(u.x, -145, 145); u.z = clamp(u.z, -145, 145); }
    if (!u.fly) { const dx = u.x - RB_LAKE.x, dz = u.z - RB_LAKE.z, d = Math.hypot(dx, dz); if (d < RB_LAKE_R + 1.5) { u.x = RB_LAKE.x + dx / d * (RB_LAKE_R + 1.5); u.z = RB_LAKE.z + dz / d * (RB_LAKE_R + 1.5); u.h = Math.atan2(dx, dz); } }
    const moving = !(u.rest > 0);
    const y = u.fly ? u.y + Math.sin(t * 1.5 + u.ph) * 1.5 : (moving ? Math.abs(Math.sin(t * 9 + u.ph)) * 0.18 * u.s : 0);
    _rbE.set(u.fly ? Math.sin(t * 2 + u.ph) * 0.15 : 0, u.h, moving && !u.fly ? Math.sin(t * 9 + u.ph) * 0.05 : 0); _rbQ.setFromEuler(_rbE);
    _rbM.compose(_rbP.set(u.x, y, u.z), _rbQ, _rbS.set(u.s, u.s, u.s)); im.setMatrixAt(i, _rbM);
  }
  im.instanceMatrix.needsUpdate = true;
}

function enterRainbow() {
  if (transitioning || cinema) return;
  if (player.inCar) onCar();
  transitioning = true; cancelPlace(true); stopClimb(); dropAll(); hideCard();
  noiseHit(0.6, { f: 700, vol: 0.14 }); [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.35, { type: 'sine', vol: 0.06, when: 0.2 + i * 0.08 }));
  fadeTo(() => {
    transitioning = false; buildRainbow(); mode = 'rainbow'; rbScene.add(player.mesh);
    const first = Q6.stage === 'thrown'; if (first) { Q6.stage = 'world'; saveQ6(); }
    player.pos.set(0, 0, 131); player.up.set(0, 1, 0); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 4; player.grounded = false; player.pitch = 0.1;
    camera.position.set(0, 4, 137); camera.up.set(0, 1, 0);
    musicSet(6);
    $('bName').textContent = 'Vaivorykščių Pasaulis'; $('bEn').textContent = 'The Rainbow World'; $('bAtm').textContent = 'Pusė – saldainiai, pusė – vaivorykštės ir debesys. Čia gyvena šimtai vienaragių.'; document.documentElement.style.setProperty('--biome', '#b05aff');
    toast('Vaivorykščių Pasaulis', first ? 'Iššokai iš spalvoto vandens… Kur tu? Pasikalbėk su Vienaragių Karaliene' : 'Šimtai vienaragių vėl tave sveikina', '#b05aff');
  });
}
function leaveRainbow() {
  if (transitioning) return; transitioning = true; hideCard(); quizClose();
  noiseHit(0.5, { f: 700, vol: 0.12 });
  fadeTo(() => {
    transitioning = false; mode = 'planet'; world.add(player.mesh); if (heldBuoy) attachBuoy(false);
    const P = icePond, dd = P.g.position.clone().addScaledVector(P.fwd, 6).normalize();
    player.pos.copy(dd).multiplyScalar(R + groundH(dd) + 0.5); player.up.copy(dd); player.fwd.copy(P.fwd).projectOnPlane(dd).normalize(); player.vel.set(0, 0, 0); player.vr = 3; player.grounded = false;
    curBiome = -1; camera.position.copy(player.pos).addScaledVector(dd, 3).addScaledVector(player.fwd, -6);
    if (Q6.petGift) { Q6.petGift = false; saveQ6(); setTimeout(giveUnicornPet, 900); }
  });
}

// ---------- the Queen ----------
const QUEEN_FIRST = [
  'Ihahaa… Žaliasis žmogeliukas, iššokęs iš spalvoto vandens su Vaivorykščio ragu kvapu? Tu – iš Kūrėjo pasaulio!',
  'Sveikas atvykęs į Vaivorykščių Pasaulį. Jis toks pat didelis kaip tavasis: kairėje – saldainiai, dešinėje – vaivorykštės ir debesys. Čia gyvena šimtai vienaragių.',
  'Bet šiandien mano pavaldiniams bėda. Vienas skęsta Sirupo Ežere – kairėje. Kitam Debesų Mokykloje šiandien matematikos egzaminas, o jis nieko nemoka – dešinėje.',
  'O trečią – mažąją Žvaigždikę – pagrobė vagys ir laiko narve toli šiaurės rytuose. Padėk jiems visiems, ir aš tave apdovanosiu karališkai.'
];
function queenTalk() {
  if (Q6.stage === 'done') { startTalk('Vienaragių Karalienė', ['Mūsų karališkasis draugas! Tavo ragas tau tinka. Ateik dar – čia visada laukiami.'], '#b05aff'); return; }
  const left = 3 - Q6_TASKS();
  if (!Q6.metQueen) { Q6.metQueen = true; saveQ6(); startTalk('Vienaragių Karalienė', QUEEN_FIRST, '#b05aff', () => toast('Trys darbai Vaivorykščių Pasaulyje', 'Išgelbėk skęstantį · padaryk egzaminą · išvaduok iš vagių', '#b05aff')); return; }
  if (left > 0) {
    const todo = [!Q6.tasks.drown && 'skęstantis vienaragis Sirupo Ežere (kairėje)', !Q6.tasks.exam && 'matematikos egzaminas Debesų Mokykloje (dešinėje)', !Q6.tasks.thieves && 'Žvaigždikė vagių narve (toli šiaurės rytuose)'].filter(Boolean);
    startTalk('Vienaragių Karalienė', [`Dar ${left === 1 ? 'liko vienas darbas' : `liko ${left} darbai`}: ${todo.join('; ')}.`], '#b05aff'); return;
  }
  startTalk('Vienaragių Karalienė', ['Tu padarei viską! Skęstantis – išgelbėtas, egzaminas – išlaikytas, Žvaigždikė – laisva!',
    'Todėl skiriu tau karališką apdovanojimą: tikrą vienaragio ragą, vaivorykštinę uodegą ir vienaragių maikę. Nuo šiol tu – vienas iš mūsų.',
    'Ir dar… štai mažylis vienaragis. Jis nori keliauti su tavimi. Rūpinkis juo!'], '#b05aff', () => {
    Q6.stage = 'done'; Q6.skin = true; Q6.petGift = true; saveQ6(); applyUnicornSkin(); addMoney(500);
    [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.6, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
    toast('Gavai vienaragio kostiumą ir vienaragį augintinį!', 'Ragas, uodega ir maikė jau tau. Augintinis lauks, kai grįši namo. +500 €', '#ffe98a');
  });
}

// ---------- task 1: the drowning unicorn ----------
let heldBuoy = null, rescue = null;
function attachBuoy(on) {
  const hand = player.mesh.userData.parts.handR;
  if (on && !heldBuoy) { heldBuoy = makeBuoy(); heldBuoy.scale.setScalar(0.7); heldBuoy.position.set(0, -0.2, 0.1); hand.add(heldBuoy); linearize(heldBuoy); }
  if (!on && heldBuoy) { hand.remove(heldBuoy); heldBuoy = null; }
}
function throwBuoy() {
  attachBuoy(false);
  const b = makeBuoy(); linearize(b); rbScene.add(b); const from = player.pos.clone().add(new V3(0, 1.4, 0)), to = RW.drown.position.clone().setY(0.25);
  const shore = RB_LAKE.clone().add(player.pos.clone().sub(RB_LAKE).setY(0).normalize().multiplyScalar(RB_LAKE_R + 2.2));
  rescue = { b, from, to, shore, t: 0 };
  tone(300, 0.2, { to: 700, type: 'triangle', vol: 0.05 });
}
function updateRescue(dt, t) {
  const d = RW.drown;
  if (!Q6.tasks.drown && !rescue) {   // splashing and calling for help
    d.position.y = -1.2 + Math.sin(t * 4) * 0.25; d.rotation.y += dt * 0.6; animUnicorn(d, t * 2, true);
    RW.splashT = (RW.splashT || 0) - dt; if (RW.splashT < 0) { RW.splashT = rr(2, 4); if (player.pos.distanceTo(d.position) < 45) { bubbleIn(rbScene, d.position, pick(['Gelbėkit!', 'Nemoku plaukti!', 'Blub blub!']), 2.8); noiseHit(0.2, { ft: 'bandpass', f: 1200, vol: 0.05 }); } }
    return;
  }
  if (rescue) {
    rescue.t += dt;
    if (rescue.t < 0.8) { const k = rescue.t / 0.8; rescue.b.position.lerpVectors(rescue.from, rescue.to, k); rescue.b.position.y += Math.sin(k * Math.PI) * 4; rescue.b.rotation.x = Math.PI / 2; }
    else {
      const k = Math.min(1, (rescue.t - 0.8) / 3);
      d.position.lerpVectors(rescue.to.clone().setY(-1.2), rescue.shore, k); d.position.y = -1.2 * (1 - k); rescue.b.position.copy(d.position).setY(Math.max(0.25, d.position.y + 1.1));
      d.rotation.y = Math.atan2(rescue.shore.x - d.position.x, rescue.shore.z - d.position.z); animUnicorn(d, t * 2, true);
      if (k >= 1) {
        rbScene.remove(rescue.b); rescue = null; Q6.tasks.drown = true; saveQ6();
        [523, 659, 784].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.06, when: i * 0.1 }));
        startTalk('Lašiukas', ['Kchė kchė… Ačiū! Aš Lašiukas. Bėgiojau per sirupo ledukus ir – pliumpt!', 'Pasakysiu Karalienei, kad tu – tikras didvyris!'], '#3cb4ff', () => toast('Vienaragis išgelbėtas!', `Darbų atlikta: ${Q6_TASKS()} / 3`, '#3cb4ff'));
      }
    }
  } else animUnicorn(d, t, false);
}

// ---------- task 2: the maths exam ----------
let quizOpen = false, quiz = null;
function makeQuestions() {
  const qs = [], ri = (a, b) => Math.floor(rr(a, b + 1));
  { const a = ri(12, 48), b = ri(5, 40); qs.push([`${a} + ${b} = ?`, a + b]); }
  { const a = ri(30, 90), b = ri(5, 29); qs.push([`${a} − ${b} = ?`, a - b]); }
  { const a = ri(2, 9), b = ri(2, 9); qs.push([`${a} × ${b} = ?`, a * b]); }
  { const b = ri(2, 9), r = ri(2, 9); qs.push([`${b * r} : ${b} = ?`, r]); }
  { const a = ri(3, 12), b = ri(2, 9); qs.push([`Ganykloje ${a} vienaragiai. Atbėgo dar ${b}. Kiek dabar vienaragių?`, a + b]); }
  { const a = ri(3, 6); qs.push([`Kiekvienas vienaragis turi 4 kojas. Kiek kojų turi ${a} vienaragiai?`, a * 4]); }
  { const a = ri(20, 40), b = ri(3, 15); qs.push([`Debesėlis turėjo ${a} saldainius ir ${b} suvalgė. Kiek liko?`, a - b]); }
  return qs.sort(() => rnd() - 0.5).slice(0, 6);
}
function startExam() {
  quiz = { qs: makeQuestions(), i: 0, ok: 0 };
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  quizOpen = true; showQuestion();
}
function showQuestion() {
  const [q, ans] = quiz.qs[quiz.i];
  const opts = new Set([ans]); while (opts.size < 4) { const v = ans + Math.floor(rr(-6, 7)); if (v >= 0 && v !== ans) opts.add(v); }
  quiz.opts = [...opts].sort(() => rnd() - 0.5);
  card = { kind: 'quiz' }; showCard(`Matematikos egzaminas · ${quiz.i + 1} / ${quiz.qs.length}`, q, `Spausk atsakymą (arba klavišus 1–4) · teisingų: ${quiz.ok}`, '#5a8aff');
  const box = $('quizBtns'); box.hidden = false;
  box.innerHTML = quiz.opts.map((o, i) => `<button type="button" data-i="${i}"><small>${i + 1}</small> ${o}</button>`).join('');
  box.querySelectorAll('button').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); answerQuiz(+b.dataset.i); }));
  $('paused').hidden = true;
}
function answerQuiz(i) {
  if (!quizOpen || !quiz) return;
  const right = quiz.opts[i] === quiz.qs[quiz.i][1];
  if (right) { quiz.ok++; tone(880, 0.12, { type: 'triangle', vol: 0.06 }); tone(1320, 0.15, { type: 'triangle', vol: 0.05, when: 0.08 }); }
  else { tone(220, 0.25, { type: 'square', vol: 0.04, lp: 900 }); }
  quiz.i++;
  if (quiz.i < quiz.qs.length) { showQuestion(); return; }
  const ok = quiz.ok, n = quiz.qs.length; quizClose();
  if (ok >= n - 1) {
    Q6.tasks.exam = true; saveQ6();
    [523, 659, 784, 1047].forEach((f, k) => tone(f, 0.4, { type: 'triangle', vol: 0.06, when: k * 0.1 }));
    startTalk('Debesėlis', [`${ok} iš ${n}!!! Mokytoja sako – PENKETAS! Ihahaha!`, 'Ačiū tau, protingasis žaliasis! Dabar ir aš pradėsiu mokytis… rytoj.'], '#5a8aff', () => toast('Egzaminas išlaikytas!', `Darbų atlikta: ${Q6_TASKS()} / 3`, '#5a8aff'));
  } else startTalk('Debesėlis', [`Tik ${ok} iš ${n}… Reikia bent ${n - 1}. Mokytoja leido perlaikyti – pabandom dar kartą?`], '#5a8aff');
}
function quizClose() { quizOpen = false; const b = $('quizBtns'); if (b) { b.hidden = true; b.innerHTML = ''; } if (card && card.kind === 'quiz') hideCard(); if (!lockFailed && started) requestLock(); }

// ---------- task 3: the thieves ----------
function rbPunch() {
  let best = null, bd = 3.2;
  for (const th of RW.thieves) { if (th.state !== 'guard') continue; const dx = th.m.position.x - player.pos.x, dz = th.m.position.z - player.pos.z, d = Math.hypot(dx, dz); if (d < bd && (dx * player.fwd.x + dz * player.fwd.z) / Math.max(d, 1e-3) > 0.2) { bd = d; best = th; } }
  if (!best) { sfx.whoosh(0.1); return; }
  best.state = 'fly'; best.t = 0; best.vel.set(player.fwd.x * 14, 0, player.fwd.z * 14); best.vy = 11;
  noiseHit(0.2, { f: 300, vol: 0.15 }); grunt(300, 160, 0.25, 0.08);
  bubbleIn(rbScene, best.m.position, pick(['Ai!', 'Oi oi oi!', 'Bėgam!']), 2.6);
  const left = RW.thieves.filter(th => th.state === 'guard').length;
  if (left === 0) setTimeout(() => toast('Visi vagys pabėgo!', 'Atidaryk narvą (E) ir išlaisvink Žvaigždikę', '#ffd23a'), 600);
  else toast(`Vagis nuskrido! Liko ${left}`, 'Prieik prie kito ir trenk jam (pelės mygtukas)', '#ffd23a');
}
function updateThieves(dt, t) {
  for (let i = RW.thieves.length - 1; i >= 0; i--) {
    const th = RW.thieves[i], m = th.m; th.t += dt;
    if (th.state === 'guard') {
      th.a += dt * 0.35; m.position.set(RB_CAGE.x + Math.cos(th.a) * 5, 0, RB_CAGE.z + Math.sin(th.a) * 5); m.rotation.y = th.a + Math.PI;
      m.userData.legs[0].rotation.x = Math.sin(t * 6 + i) * 0.5; m.userData.legs[1].rotation.x = -Math.sin(t * 6 + i) * 0.5;
      th.sayT -= dt; if (th.sayT < 0) { th.sayT = rr(3, 6); if (player.pos.distanceTo(m.position) < 30) bubbleIn(rbScene, m.position, pick(['Cha cha!', 'Mūsų vienaragis!', 'Nesiartink!', 'Hmph!']), 2.6); }
    } else if (th.state === 'fly') {
      th.vy -= GRAV * dt; m.position.addScaledVector(th.vel, dt); m.position.y += th.vy * dt; m.userData.body.rotation.x += th.spin * dt;
      if (m.position.y <= 0 && th.vy < 0) { m.position.y = 0; th.state = 'run'; th.t = 0; m.userData.body.rotation.set(0, 0, 0); th.dir = Math.atan2(m.position.x - RB_CAGE.x, m.position.z - RB_CAGE.z); }
    } else if (th.state === 'run') {
      m.rotation.y = th.dir; m.position.x += Math.sin(th.dir) * 12 * dt; m.position.z += Math.cos(th.dir) * 12 * dt;
      m.userData.legs[0].rotation.x = Math.sin(t * 16) * 0.9; m.userData.legs[1].rotation.x = -Math.sin(t * 16) * 0.9;
      if (th.t > 4) { rbScene.remove(m); RW.thieves.splice(i, 1); }
    }
  }
  if (!Q6.tasks.thieves) { animUnicorn(RW.caged, t, false); RW.caged.rotation.y = Math.sin(t * 0.7) * 0.8; }
  else animUnicorn(RW.caged, t, false);
}
function openCage() {
  RW.bars.visible = false; Q6.tasks.thieves = true; saveQ6();
  noiseHit(0.4, { f: 1800, vol: 0.1 });
  let k = 0; fx.push(dt => { k += dt; RW.caged.position.lerpVectors(RB_CAGE, RB_CAGE.clone().add(new V3(0, 0, 4.5)), Math.min(1, k)); RW.caged.position.y = Math.sin(Math.min(1, k) * Math.PI) * 1.5; return k < 1; });
  startTalk('Žvaigždikė', ['Laisvė! Ihahaha! Tie vagys norėjo mane parduoti į cirką!', 'Tu toks mažas, o toks drąsus. Bėgu pasakyti Karalienei!'], '#ffd23a', () => toast('Žvaigždikė laisva!', `Darbų atlikta: ${Q6_TASKS()} / 3`, '#ffd23a'));
}

// ---------- E / prompts in the Rainbow World ----------
function rbNear() {
  const pp = player.pos, dist = v => Math.hypot(pp.x - v.x, pp.z - v.z);
  if (dist(RB_POOL) < 4.5) return { kind: 'pool', txt: 'grįžti per vaivorykštinį baseiną' };
  if (dist(RW.queen.position) < 5) return { kind: 'queen', txt: 'kalbėtis su Vienaragių Karaliene' };
  if (!Q6.tasks.drown && !heldBuoy && !rescue && dist(RB_BUOY) < 3.2) return { kind: 'buoy', txt: 'paimti gelbėjimo ratą' };
  if (!Q6.tasks.drown && heldBuoy && dist(RB_LAKE) < RB_LAKE_R + 3.5) return { kind: 'throw', txt: 'mesti gelbėjimo ratą skęstančiam vienaragiui' };
  if (Q6.tasks.drown && dist(RW.drown.position) < 3.5) return { kind: 'drowned', txt: 'kalbėtis: Lašiukas' };
  if (dist(RW.student.position) < 3.8) return { kind: 'student', txt: Q6.tasks.exam ? 'kalbėtis: Debesėlis' : 'kalbėtis: Debesėlis (egzaminas)' };
  if (!Q6.tasks.thieves && RW.thieves.length === 0 && dist(RB_CAGE) < 4.5) return { kind: 'cage', txt: 'atidaryti narvą' };
  if (!Q6.tasks.thieves && dist(RB_CAGE) < 4.5) return { kind: 'cageLocked', txt: '' };
  if (Q6.tasks.thieves && dist(RW.caged.position) < 3.5) return { kind: 'freed', txt: 'kalbėtis: Žvaigždikė' };
  return null;
}
function rainbowAction() {
  if (quizOpen) return;
  if (card) { if (!advanceTalk()) hideCard(); return; }
  const n = rbNear(); if (!n) return;
  if (n.kind === 'pool') leaveRainbow();
  else if (n.kind === 'queen') queenTalk();
  else if (n.kind === 'buoy') { RW.buoyOnPost.visible = false; attachBuoy(true); toast('Gelbėjimo ratas rankoje', 'Prieik prie ežero kranto ir spausk E', '#3cb4ff'); }
  else if (n.kind === 'throw') throwBuoy();
  else if (n.kind === 'drowned') startTalk('Lašiukas', ['Daugiau prie sirupo be suaugusių neisiu. Pažadu!'], '#3cb4ff');
  else if (n.kind === 'student') {
    if (Q6.tasks.exam) startTalk('Debesėlis', ['Penketas! Mama pakabino mano egzaminą ant debesies šaldytuvo.'], '#5a8aff');
    else startTalk('Debesėlis', ['Buuu… Šiandien matematikos egzaminas, o aš nieko nemoku! Visi skaičiai man atrodo kaip debesys.', 'Gal… gal tu galėtum jį padaryti už mane? Reikia bent 5 teisingų iš 6. Mokytoja nežiūri!'], '#5a8aff', startExam);
  }
  else if (n.kind === 'cage') openCage();
  else if (n.kind === 'freed') startTalk('Žvaigždikė', ['Kai užaugsiu, būsiu vagių gaudytoja. Kaip tu!'], '#ffd23a');
}
function updateRainbow(dt, t) {
  walkFlat(dt, { boxes: RW.boxes, circles: RW.circles, x0: RW.x0, x1: RW.x1, z0: RW.z0, z1: RW.z1, H: RW.H, camDist: 5.4 });
  updateHerd(dt, t); updateRescue(dt, t); updateThieves(dt, t);
  animUnicorn(RW.queen, t, false); RW.queen.rotation.y = lerp(RW.queen.rotation.y, Math.atan2(player.pos.x - RW.queen.position.x, player.pos.z - RW.queen.position.z), Math.min(1, dt));
  if (!Q6.tasks.exam) { animUnicorn(RW.student, t, false); if ((RW.cryT = (RW.cryT || 0) - dt) < 0) { RW.cryT = rr(4, 7); if (player.pos.distanceTo(RW.student.position) < 30) bubbleIn(rbScene, RW.student.position, pick(['Buuu…', 'Egzaminas!', '7 × 8 = debesis?']), 2.4); } }
  else { animUnicorn(RW.student, t * 1.5, false); RW.student.position.y = Math.abs(Math.sin(t * 4)) * 0.3; }
  RW.pool.rotation.z += dt * 0.8;
  let txt = '';
  const n = (card || quizOpen) ? null : rbNear();
  if (n && n.kind === 'cageLocked') txt = 'Narvą saugo vagys – trenk jiems (<kbd>LMB</kbd>), kai prieisi';
  else if (n && n.txt) txt = `<kbd>E</kbd> ${n.txt}`;
  else if (!card && !Q6.tasks.thieves && RW.thieves.some(th => th.state === 'guard' && th.m.position.distanceTo(player.pos) < 3.2)) txt = '<kbd>LMB</kbd> / <kbd>RMB</kbd> – trenkti vagiui';
  setPrompt(txt);
  updateQuestHud();
}

// ---------- the reward: costume + a unicorn of your own ----------
function applyUnicornSkin() { unlockSkin('unicorn'); equipSkin('unicorn', true); }
ANIMALS.push({ id: 'unicorn', secret: true, kind: 'Vienaragis', desc: 'Mažas vienaragis iš Vaivorykščių Pasaulio. Karalienės dovana.', speed: 6.5, rad: 0.5, say: ['Ihaha!', 'Ihi-hi!', 'Vaivorykštė!'], names: ['Vaivorykštukas'],
  make() { const u = makeUnicorn({ col: 0xffffff, s: 0.55 }); return u; } });
function giveUnicornPet() {
  const rec = { uid: petUid++, t: 'unicorn', n: 'Vaivorykštukas', active: false, pt: null }; petBook.push(rec);
  if (activeCount() < MAX_ACTIVE) equipPet(rec, false);
  savePets();
  toast('Vaivorykštukas keliauja su tavimi!', activeCount() <= MAX_ACTIVE && rec.active ? 'Tavo naujas vienaragis augintinis. I – visi gyvūnai' : 'Su tavimi jau 5 gyvūnai – jis laukia kolekcijoje (I)', '#ff9ee8');
}

// ---------- HUD ----------
function q6Active() { return Q6.stage === 'horn' || Q6.stage === 'thrown' || Q6.stage === 'world'; }
function updateQ6Hud(el) {
  el.hidden = false;
  let step = '', arrow = '', dist = '', target = null, flat = false;
  if (Q6.stage === 'horn') { step = 'Įmesk ragą į Ledinį Ežerėlį Ledo Saloje'; target = icePond && icePond.center; }
  else if (Q6.stage === 'thrown') { step = 'Įšok į spalvotą vandenį Ledo Saloje'; target = icePond && icePond.center; }
  else if (mode === 'rainbow') {
    flat = true;
    if (!Q6.metQueen) { step = 'Pasikalbėk su Vienaragių Karaliene'; target = RB_QUEEN; }
    else if (Q6_TASKS() === 3) { step = 'Grįžk pas Karalienę atsiimti apdovanojimo'; target = RB_QUEEN; }
    else if (!Q6.tasks.drown) { step = heldBuoy ? 'Mesk ratą skęstančiam (E prie kranto)' : 'Paimk gelbėjimo ratą prie Sirupo Ežero'; target = heldBuoy ? RB_LAKE : RB_BUOY; }
    else if (!Q6.tasks.exam) { step = 'Padaryk egzaminą už Debesėlį Debesų Mokykloje'; target = RB_SCHOOL; }
    else { step = RW.thieves.length ? `Išvaikyk vagis (liko ${RW.thieves.length}) ir išlaisvink Žvaigždikę` : 'Atidaryk narvą'; target = RB_CAGE; }
    step += ` · darbai ${Q6_TASKS()}/3`;
  } else { step = 'Grįžk į Vaivorykščių Pasaulį per spalvotą vandenį Ledo Saloje'; target = icePond && icePond.center; }
  if (target && (mode === 'planet' || flat)) {
    arrow = arrowTo(target);
    dist = flat ? ` · ${Math.round(Math.hypot(target.x - player.pos.x, target.z - player.pos.z))} m` : ` · ${Math.round(target.distanceTo(player.pos))} m`;
    if (!flat && q2Dot) { q2Dot.visible = true; q2Dot.position.copy(target).normalize().multiplyScalar(R + 7); }
  }
  el.innerHTML = `${arrow}<div><div class="qt">Paslaptis: Vaivorykščių Pasaulis</div><div class="qs">${step}${dist}</div></div>`;
}
