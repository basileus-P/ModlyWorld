// ================= inside your house: sleep and furnish =================
const homeScene = new THREE.Scene();
homeScene.background = new THREE.Color(0x2a2236);
homeScene.add(new THREE.AmbientLight(0xffffff, 0.5));
const homeHemi = new THREE.HemisphereLight(0xfff4e0, 0x6a5a4a, 0.45); homeScene.add(homeHemi);
const homeLight = new THREE.PointLight(0xffe7c0, 0.9, 30); homeScene.add(homeLight);
let homeRoot = null, homeRec = null, homeRoom = null, homeAnims = [];
let furnOpen = false, furnPlacing = null, sleeping = null;
const WALL_COLS = [0xf6e7cf, 0xcfe8ff, 0xffd1dc, 0xd8f5c8, 0xe6dcff, 0xfff1a8];
const FLOOR_COLS = [0xb98b5a, 0x6b4426, 0xe9e4da, 0x3a5aa8, 0xff9fbf, 0x5cbf5a];
const FLOOR_NAMES = ['Šviesus medis', 'Tamsus medis', 'Plytelės', 'Mėlynas kilimas', 'Rožinis kilimas', 'Žolė'];

// every piece of furniture: footprint half sizes (hx, hz), height you can stand on (top), builder (front is +z)
const FURN = [
  { id: 'bed', name: 'Lova', desc: 'Čia galima miegoti.', hx: 0.65, hz: 1.12, top: 0.62, sleep: true, make() { const g = new THREE.Group(); g.add(S(G.box, mat(0x8a5a2b), 1.3, 0.35, 2.24, 0, 0.2, 0)); g.add(S(G.box, mat(0xffffff), 1.2, 0.2, 2.1, 0, 0.47, 0)); g.add(S(G.box, mat(0x5a7bd6), 1.24, 0.12, 1.3, 0, 0.56, 0.4)); g.add(S(G.box, mat(0xffffff), 0.9, 0.16, 0.4, 0, 0.62, -0.75)); g.add(S(G.box, mat(0x8a5a2b), 1.3, 1.0, 0.12, 0, 0.55, -1.08)); return g; } },
  { id: 'sofa', name: 'Sofa', desc: 'Minkšta ir patogi.', hx: 1.1, hz: 0.45, top: 0.5, make() { const g = new THREE.Group(), c = mat(0xd9584a); g.add(S(G.box, c, 2.2, 0.45, 0.9, 0, 0.23, 0)); g.add(S(G.box, c, 2.2, 0.65, 0.22, 0, 0.6, -0.34)); for (const x of [-1, 1]) g.add(S(G.box, c, 0.22, 0.6, 0.9, x * 1.0, 0.4, 0)); for (const x of [-0.5, 0.5]) g.add(S(G.box, mat(0xf2a07a), 0.9, 0.12, 0.6, x, 0.5, 0.08)); return g; } },
  { id: 'table', name: 'Stalas', desc: 'Pietums ir žaidimams.', hx: 0.7, hz: 0.45, top: 0.82, make() { const g = new THREE.Group(), w = mat(0xa0703c); g.add(S(G.box, w, 1.4, 0.08, 0.9, 0, 0.78, 0)); for (const [x, z] of [[-0.62, -0.38], [0.62, -0.38], [-0.62, 0.38], [0.62, 0.38]]) g.add(S(G.box, w, 0.08, 0.76, 0.08, x, 0.38, z)); g.add(S(G.cyl, mat(0xffffff), 0.12, 0.06, 0.12, 0.3, 0.85, 0)); return g; } },
  { id: 'chair', name: 'Kėdė', desc: 'Prisėsk.', hx: 0.26, hz: 0.26, top: 0.5, make() { const g = new THREE.Group(), w = mat(0xa0703c); g.add(S(G.box, w, 0.5, 0.06, 0.5, 0, 0.46, 0)); g.add(S(G.box, w, 0.5, 0.5, 0.06, 0, 0.72, -0.22)); for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) g.add(S(G.box, w, 0.05, 0.45, 0.05, x, 0.22, z)); return g; } },
  { id: 'wardrobe', name: 'Spinta', desc: 'Rūbams, kurių dar neturi.', hx: 0.6, hz: 0.3, top: 2.1, make() { const g = new THREE.Group(); g.add(S(G.box, mat(0x7a4a2a), 1.2, 2.1, 0.6, 0, 1.05, 0)); g.add(S(G.box, mat(0x5a3418), 0.02, 1.9, 0.02, 0, 1.05, 0.31)); for (const x of [-0.1, 0.1]) g.add(S(G.sph, mat(0xffd23a), 0.04, 0.04, 0.04, x, 1.1, 0.32)); return g; } },
  { id: 'shelf', name: 'Knygų lentyna', desc: 'Pilna istorijų apie burbulą.', hx: 0.7, hz: 0.2, top: 1.9, make() { const g = new THREE.Group(), w = mat(0x8a5a2b); g.add(S(G.box, w, 1.4, 1.9, 0.1, 0, 0.95, -0.15)); for (const x of [-0.65, 0.65]) g.add(S(G.box, w, 0.08, 1.9, 0.4, x, 0.95, 0)); for (let y = 0; y < 4; y++) { g.add(S(G.box, w, 1.3, 0.05, 0.4, 0, 0.05 + y * 0.6, 0)); let x = -0.55; while (x < 0.5) { const bw = 0.06 + Math.random() * 0.06, bh = 0.3 + Math.random() * 0.18; g.add(S(G.box, mat(pick([0xd9584a, 0x3a7bff, 0xffd23a, 0x3ddc97, 0xb57bff])), bw, bh, 0.3, x, 0.08 + y * 0.6 + bh / 2, 0)); x += bw + 0.01; } } return g; } },
  { id: 'lamp', name: 'Toršeras', desc: 'Šilta šviesa vakarams.', hx: 0.2, hz: 0.2, top: 1.6, light: true, make() { const g = new THREE.Group(); g.add(S(G.cyl, mat(0x30343e), 0.2, 0.05, 0.2, 0, 0.03, 0)); g.add(S(G.cyl, mat(0x30343e), 0.03, 1.4, 0.03, 0, 0.72, 0)); g.add(S(new THREE.ConeGeometry(1, 1, 16, 1, true), mat(0xfff0c8, { side: THREE.DoubleSide, emissive: 0x806030 }), 0.3, 0.35, 0.3, 0, 1.5, 0)); g.add(S(G.sph, bmat(0xfff2b0), 0.1, 0.1, 0.1, 0, 1.42, 0)); return g; } },
  { id: 'plant', name: 'Augalas vazone', desc: 'Žalia draugė, kuri nieko nesako.', hx: 0.28, hz: 0.28, top: 1.1, make() { const g = new THREE.Group(); g.add(S(G.cyl, mat(0xc0703a), 0.25, 0.4, 0.2, 0, 0.2, 0)); for (let i = 0; i < 4; i++) g.add(S(G.ico1, mat(0x3faf47), 0.35, 0.45, 0.35, Math.cos(i * 1.6) * 0.12, 0.7 + i * 0.1, Math.sin(i * 1.6) * 0.12)); return g; } },
  { id: 'rug', name: 'Kilimas', desc: 'Ant jo galima statyti kitus baldus.', hx: 1.2, hz: 0.8, top: 0, flat: true, make() { const g = new THREE.Group(); g.add(S(G.box, mat(0xb04dff), 2.4, 0.02, 1.6, 0, 0.012, 0)); g.add(S(G.box, mat(0xffd23a), 2.0, 0.025, 1.2, 0, 0.014, 0)); g.add(S(G.box, mat(0xb04dff), 1.6, 0.03, 0.8, 0, 0.016, 0)); return g; } },
  { id: 'tv', name: 'Televizorius', desc: 'Rodo tik vieną kanalą – spalvas.', hx: 0.6, hz: 0.22, top: 1.2, make() { const g = new THREE.Group(); g.add(S(G.box, mat(0x30343e), 1.2, 0.5, 0.42, 0, 0.25, 0)); g.add(S(G.box, mat(0x111111), 1.12, 0.68, 0.08, 0, 0.88, 0)); const scr = S(G.box, new THREE.MeshBasicMaterial({ color: 0x30c4ff }), 1.0, 0.56, 0.02, 0, 0.88, 0.05); g.add(scr); g.userData.anim = (dt, t) => scr.material.color.setHSL((t * 0.15) % 1, 0.8, 0.55 + 0.1 * Math.sin(t * 9)); return g; } },
  { id: 'fridge', name: 'Šaldytuvas', desc: 'Viduje – sniego gniūžtė iš Ledo Salos.', hx: 0.4, hz: 0.35, top: 1.9, make() { const g = new THREE.Group(); g.add(S(G.box, mat(0xf4f6fa), 0.8, 1.9, 0.7, 0, 0.95, 0)); g.add(S(G.box, mat(0xc8ccd6), 0.78, 0.02, 0.02, 0, 1.25, 0.36)); g.add(S(G.box, mat(0x8a8f9c), 0.04, 0.4, 0.05, 0.3, 1.55, 0.37)); g.add(S(G.box, mat(0x8a8f9c), 0.04, 0.5, 0.05, 0.3, 0.8, 0.37)); return g; } },
  { id: 'aquarium', name: 'Akvariumas', desc: 'Žuvytės plaukioja ratu ir neskuba.', hx: 0.6, hz: 0.25, top: 1.35, make() { const g = new THREE.Group(); g.add(S(G.box, mat(0x30343e), 1.2, 0.7, 0.5, 0, 0.35, 0)); g.add(S(G.box, new THREE.MeshPhongMaterial({ color: 0x6fd0ff, transparent: true, opacity: 0.45, shininess: 90 }), 1.2, 0.62, 0.5, 0, 1.02, 0)); const fish = []; for (let i = 0; i < 4; i++) { const f = S(G.sph, mat(pick([0xff9f1c, 0xff4d6d, 0xffd23a])), 0.07, 0.05, 0.1); g.add(f); fish.push(f); } g.userData.anim = (dt, t) => fish.forEach((f, i) => { const a = t * (0.6 + i * 0.2) + i * 1.7; f.position.set(Math.cos(a) * 0.45, 0.9 + i * 0.07, Math.sin(a) * 0.15); f.rotation.y = -a; }); return g; } },
  { id: 'fireplace', name: 'Židinys', desc: 'Traška ir šildo.', hx: 0.8, hz: 0.3, top: 1.25, light: true, fire: true, make() { const g = new THREE.Group(), br = mat(0xa4503a); g.add(S(G.box, br, 1.6, 1.2, 0.6, 0, 0.6, 0)); g.add(S(G.box, bmat(0x1a0d08), 0.9, 0.7, 0.05, 0, 0.45, 0.29)); g.add(S(G.box, mat(0x6b2f22), 1.8, 0.1, 0.7, 0, 1.25, 0)); const fl = []; for (let i = 0; i < 3; i++) { const f = S(G.cone, bmat(i === 1 ? 0xffd23a : 0xff7a1c), 0.14, 0.4, 0.14, -0.2 + i * 0.2, 0.3, 0.25); g.add(f); fl.push(f); } g.userData.anim = (dt, t) => fl.forEach((f, i) => { f.scale.y = 0.35 + 0.15 * Math.sin(t * 13 + i * 2); }); return g; } },
  { id: 'plush', name: 'Pliušinė kiaulė', desc: 'Minkšta kopija tavo kiaulės.', hx: 0.3, hz: 0.35, top: 0.6, make() { const g = new THREE.Group(), p = mat(0xffa3c0); g.add(S(G.sph, p, 0.3, 0.26, 0.38, 0, 0.3, 0)); g.add(S(G.sph, p, 0.22, 0.2, 0.2, 0, 0.45, 0.3)); { const _o = S(G.cyl, mat(0xe57a9c), 0.09, 0.06, 0.09, 0, 0.42, 0.5); _o.rotation.x = Math.PI / 2; g.add(_o); } for (const x of [-0.12, 0.12]) g.add(S(G.cone, mat(0xe57a9c), 0.07, 0.12, 0.04, x, 0.66, 0.28)); return g; } },
  { id: 'pixcube', name: 'Pikselių kubas', desc: 'Mirga kaip Pikselių Pasaulyje.', hx: 0.4, hz: 0.4, top: 0.8, make() { const g = new THREE.Group(), m = new THREE.MeshLambertMaterial({ color: 0xff4fd8 }); g.add(S(G.box, m, 0.8, 0.8, 0.8, 0, 0.4, 0)); let acc = 0; g.userData.anim = (dt) => { acc += dt; if (acc > 0.8) { acc = 0; m.color.setHex(pick([0xff4fd8, 0x30c4ff, 0xffe14d, 0x3cf27a, 0x7a5cff])); } }; return g; } },
  { id: 'easel', name: 'Paveikslas', desc: 'Tavo kelionės paveikslas ant molberto.', hx: 0.35, hz: 0.3, top: 1.7, make() { const g = new THREE.Group(), w = mat(0x8a5a2b); for (const x of [-0.25, 0.25]) { const l = S(G.box, w, 0.05, 1.6, 0.05, x, 0.8, 0.05); l.rotation.x = -0.1; g.add(l); } { const _o = S(G.box, w, 0.05, 1.5, 0.05, 0, 0.75, -0.25); _o.rotation.x = 0.25; g.add(_o); } const c = document.createElement('canvas'); c.width = 64; c.height = 48; const x = c.getContext('2d'); x.fillStyle = '#8fd8ff'; x.fillRect(0, 0, 64, 48); x.fillStyle = '#62c457'; x.beginPath(); x.arc(32, 70, 42, 0, Math.PI * 2); x.fill(); x.fillStyle = '#7dff6b'; x.fillRect(29, 12, 6, 14); x.beginPath(); x.arc(32, 10, 5, 0, Math.PI * 2); x.fill(); g.add(S(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }), 0.7, 0.52, 1, 0, 1.25, 0.1)); g.add(S(G.box, w, 0.75, 0.05, 0.12, 0, 0.96, 0.08)); return g; } }
];
function defaultFurniture(spec) {
  const r = roomSize(spec);
  return [
    { t: 'bed', x: -r.W / 2 + 0.85, z: -r.D / 2 + 1.3, r: 0 },
    { t: 'lamp', x: -r.W / 2 + 2.0, z: -r.D / 2 + 0.45, r: 0 },
    { t: 'rug', x: 0, z: 0.4, r: 0 },
    { t: 'table', x: r.W / 2 - 1.2, z: -r.D / 2 + 1.0, r: 0 },
    { t: 'chair', x: r.W / 2 - 1.2, z: -r.D / 2 + 1.85, r: 2 }
  ];
}
function roomSize(spec) { return { W: Math.max(8, Math.round(spec.w * 1.6)), D: Math.max(8, Math.round(spec.d * 1.5)), H: spec.id === 'tower' ? 5 : 3.4 }; }
const furnDef = id => FURN.find(f => f.id === id);
function footprint(f) { const d = furnDef(f.t), swap = (f.r | 0) % 2 === 1; return { hx: swap ? d.hz : d.hx, hz: swap ? d.hx : d.hz, top: d.top, flat: !!d.flat }; }

// ---------- room ----------
function buildRoom() {
  if (homeRoot) homeScene.remove(homeRoot);
  homeRoot = new THREE.Group(); homeScene.add(homeRoot); homeAnims = [];
  const spec = HOUSES.find(s => s.id === homeRec.id), rs = roomSize(spec); homeRoom = rs;
  const { W, D, H } = rs, wallM = mat(WALL_COLS[homeRec.wall | 0]), floorM = mat(FLOOR_COLS[homeRec.floor | 0]);
  homeRoot.add(S(G.box, floorM, W, 0.2, D, 0, -0.1, 0));
  for (let i = -Math.floor(W / 2); i < W / 2; i += 1) homeRoot.add(S(G.box, mat(0x000000, { transparent: true, opacity: 0.06 }), 0.02, 0.01, D, i, 0.005, 0));
  homeRoot.add(S(G.box, mat(0xfaf6ef), W, 0.2, D, 0, H + 0.1, 0));
  homeRoot.add(S(G.box, wallM, W, H, 0.2, 0, H / 2, -D / 2 - 0.1));
  homeRoot.add(S(G.box, wallM, W, H, 0.2, 0, H / 2, D / 2 + 0.1));
  for (const sx of [-1, 1]) homeRoot.add(S(G.box, wallM, 0.2, H, D, sx * (W / 2 + 0.1), H / 2, 0));
  // skirting boards
  const sk = mat(0xffffff);
  homeRoot.add(S(G.box, sk, W, 0.15, 0.04, 0, 0.075, -D / 2 + 0.02)); homeRoot.add(S(G.box, sk, W, 0.15, 0.04, 0, 0.075, D / 2 - 0.02));
  for (const sx of [-1, 1]) homeRoot.add(S(G.box, sk, 0.04, 0.15, D, sx * (W / 2 - 0.02), 0.075, 0));
  // windows that look out into the biome
  const sky = new THREE.Color(BIOMES[homeRec.biome >= 0 ? homeRec.biome : 0].sky || 0x8fd8ff);
  for (const sx of [-1, 1]) for (const z of [-D / 4, D / 4]) {
    homeRoot.add(S(G.box, mat(0xffffff), 0.06, 1.3, 1.5, sx * (W / 2 - 0.02), 1.7, z));
    homeRoot.add(S(G.box, bmat(sky.getHex()), 0.07, 1.1, 1.3, sx * (W / 2 - 0.03), 1.7, z));
    homeRoot.add(S(G.box, mat(0xffffff), 0.08, 0.05, 1.3, sx * (W / 2 - 0.04), 1.7, z));
  }
  // the door (E to go outside)
  homeRoot.add(S(G.box, mat(0x8a5a2b), 1.3, 2.3, 0.08, 0, 1.15, D / 2 - 0.04));
  homeRoot.add(S(G.sph, mat(0xffd23a), 0.07, 0.07, 0.07, 0.45, 1.1, D / 2 - 0.1));
  homeRoot.add(S(G.box, mat(0x6b4426), 1.6, 0.02, 0.8, 0, 0.011, D / 2 - 0.45));
  // ceiling lamp
  homeRoot.add(S(G.sph, bmat(0xfff2b0), 0.3, 0.18, 0.3, 0, H - 0.1, 0));
  homeLight.position.set(0, H - 0.4, 0); homeLight.distance = Math.max(W, D) * 2.2;
  // furniture
  for (const f of homeRec.furn) addFurnMesh(f);
  linearize(homeScene);
}
function addFurnMesh(f, ghost) {
  const d = furnDef(f.t); if (!d) return null;
  const g = d.make(); g.position.set(f.x, 0, f.z); g.rotation.y = (f.r | 0) * Math.PI / 2;
  if (ghost) g.traverse(o => { if (o.isMesh) o.material = ghostMat; });
  else {
    if (g.userData.anim) homeAnims.push(g.userData.anim);
    if (d.light) { const l = new THREE.PointLight(d.fire ? 0xff9a4a : 0xffe0a0, d.fire ? 0.9 : 0.7, 8); l.position.set(0, d.fire ? 0.6 : 1.4, d.fire ? 0.5 : 0); g.add(l); if (d.fire) homeAnims.push((dt, t) => { l.intensity = 0.7 + 0.25 * Math.sin(t * 17) * Math.sin(t * 7); }); }
    f.mesh = g;
  }
  homeRoot.add(g); return g;
}

// ---------- entering and leaving ----------
function enterHome(rec) {
  if (transitioning || player.inCar) return;
  transitioning = true; cancelPlace(true); stopClimb(); dropAll(); sfx.blip();
  const d = new V3().fromArray(rec.d); weights(d.x, d.y, d.z, W); let b = 0; for (let i = 1; i < NB; i++) if (W[i] > W[b]) b = i; rec.biome = b;
  // creak of the door
  tone(180, 0.5, { to: 120, type: 'sawtooth', vol: 0.03, lp: 700 });
  fadeTo(() => {
    transitioning = false; homeRec = rec; mode = 'home'; buildRoom(); homeScene.add(player.mesh);
    player.pos.set(0, 0, homeRoom.D / 2 - 1.2); player.up.set(0, 1, 0); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.grounded = true;
    camera.position.set(0, 2.4, homeRoom.D / 2 - 0.4); camera.up.set(0, 1, 0);
    musicSet(8);
    const spec = HOUSES.find(s => s.id === rec.id);
    toast(spec.name, 'Tavo namai. B – įrengti, prie lovos E – miegoti', '#ffe08a');
    $('bName').textContent = spec.name; $('bEn').textContent = 'Tavo namai'; $('bAtm').textContent = 'Jauku, tylu ir saugu. Chaosas čia neateina.'; document.documentElement.style.setProperty('--biome', '#ffe08a');
  });
}
function exitHome() {
  if (transitioning) return; transitioning = true; closeFurn(); cancelFurn(true);
  tone(150, 0.5, { to: 210, type: 'sawtooth', vol: 0.03, lp: 700 });
  fadeTo(() => {
    transitioning = false; mode = 'planet'; world.add(player.mesh);
    const rec = homeRec, d = new V3().fromArray(rec.d), fz = new V3().fromArray(rec.fz), spec = HOUSES.find(s => s.id === rec.id);
    const front = (spec.roof === 'igloo' ? spec.w / 2 + 1 : spec.d / 2 + (spec.columns ? 2.2 : 0.2)) + 1.6;
    const out = rec.g.position.clone().addScaledVector(fz, front).normalize();
    player.pos.copy(out).multiplyScalar(R + groundH(out) + 0.2); player.up.copy(out); player.fwd.copy(tangentToward(out, out.clone().add(fz)));
    player.vel.set(0, 0, 0); player.vr = 0; curBiome = -1;
    camera.position.copy(player.pos).addScaledVector(out, 3).addScaledVector(player.fwd, -6);
    homeRec = null;
  });
}

// ---------- sleeping ----------
function nearestBed() {
  let best = null, bd = 1.3;
  for (const f of homeRec.furn) { if (!furnDef(f.t).sleep) continue; const fp = footprint(f); const dx = Math.max(0, Math.abs(player.pos.x - f.x) - fp.hx), dz = Math.max(0, Math.abs(player.pos.z - f.z) - fp.hz); const dd = Math.hypot(dx, dz); if (dd < bd) { bd = dd; best = f; } }
  return best;
}
const zzzTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#ffffff'; x.font = "52px 'Lilita One', sans-serif"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('Z', 32, 34); return new THREE.CanvasTexture(c); })();
function goToSleep(bed) {
  if (sleeping) return;
  hideCard();
  sleeping = { bed, t: 0, zT: 0 };
  const r = (bed.r | 0) * Math.PI / 2, head = new V3(0, 0, -0.7).applyAxisAngle(UP, r);
  player.pos.set(bed.x + head.x * 0.2, 0.62, bed.z + head.z * 0.2);
  player.fwd.copy(new V3(0, 0, 1).applyAxisAngle(UP, r));
  // lullaby
  [0, 4, 7, 12, 7, 4, 0, -5].forEach((s, i) => tone(392 * Math.pow(2, s / 12), 1.2, { vol: 0.05, when: i * 0.55, type: 'sine' }));
  $('fade').style.background = '#0b0820'; $('fade').classList.add('on'); $('fade').style.opacity = '0.75';
  toast('Miegi… Zzz', 'Spausk E, kad pabustum', '#b9a8ff');
}
function wakeUp() {
  if (!sleeping) return;
  sleeping = null; $('fade').style.opacity = ''; $('fade').classList.remove('on'); setTimeout(() => { $('fade').style.background = ''; }, 700);
  player.mesh.rotation.set(0, 0, 0);
  nextChaos = T + 60;
  [523, 659, 784].forEach((f, i) => tone(f, 0.6, { type: 'triangle', vol: 0.06, when: i * 0.12 }));
  toast('Labas rytas!', 'Išsimiegojai. Chaosas minutę leis pailsėti', '#ffe08a');
}

// ---------- furniture menu ----------
function furnSvg(id) {
  const box = (x, y, w, h, c, rx = 2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${c}"/>`;
  const art = {
    bed: box(12, 34, 76, 16, '#8a5a2b') + box(12, 20, 8, 30, '#8a5a2b') + box(20, 28, 66, 10, '#fff') + box(40, 26, 46, 12, '#5a7bd6') + box(22, 22, 16, 8, '#fff'),
    sofa: box(14, 30, 72, 22, '#d9584a') + box(14, 18, 72, 16, '#d9584a') + box(8, 26, 12, 26, '#c2463a') + box(80, 26, 12, 26, '#c2463a'),
    table: box(14, 24, 72, 6, '#a0703c') + box(18, 30, 5, 24, '#a0703c') + box(77, 30, 5, 24, '#a0703c'),
    chair: box(36, 12, 6, 42, '#a0703c') + box(36, 32, 30, 5, '#a0703c') + box(61, 37, 5, 17, '#a0703c'),
    wardrobe: box(30, 6, 40, 48, '#7a4a2a') + box(49, 8, 2, 44, '#5a3418') + `<circle cx="46" cy="30" r="2" fill="#ffd23a"/><circle cx="54" cy="30" r="2" fill="#ffd23a"/>`,
    shelf: box(24, 6, 52, 48, '#8a5a2b') + box(28, 10, 8, 12, '#d9584a') + box(38, 10, 6, 12, '#3a7bff') + box(46, 10, 8, 12, '#ffd23a') + box(28, 28, 10, 12, '#3ddc97') + box(40, 28, 6, 12, '#b57bff') + box(30, 44, 14, 8, '#3a7bff'),
    lamp: `<path d="M38 14 L62 14 L68 28 L32 28 Z" fill="#fff0c8"/>` + box(48, 28, 4, 22, '#30343e') + box(40, 50, 20, 4, '#30343e') + `<circle cx="50" cy="30" r="10" fill="#ffe08a" opacity=".5"/>`,
    plant: box(38, 36, 24, 18, '#c0703a') + `<circle cx="50" cy="26" r="13" fill="#3faf47"/><circle cx="40" cy="20" r="8" fill="#4fc24a"/><circle cx="60" cy="18" r="8" fill="#2f9a3f"/>`,
    rug: `<ellipse cx="50" cy="40" rx="40" ry="12" fill="#b04dff"/><ellipse cx="50" cy="40" rx="30" ry="8" fill="#ffd23a"/><ellipse cx="50" cy="40" rx="18" ry="4" fill="#b04dff"/>`,
    tv: box(22, 10, 56, 32, '#111') + box(25, 13, 50, 26, '#30c4ff') + box(32, 42, 36, 12, '#30343e'),
    fridge: box(32, 4, 36, 50, '#f4f6fa') + box(32, 22, 36, 2, '#c8ccd6') + box(60, 10, 3, 8, '#8a8f9c') + box(60, 28, 3, 12, '#8a8f9c'),
    aquarium: box(18, 14, 64, 24, '#6fd0ff') + box(18, 38, 64, 16, '#30343e') + `<ellipse cx="38" cy="24" rx="5" ry="3" fill="#ff9f1c"/><ellipse cx="60" cy="30" rx="5" ry="3" fill="#ff4d6d"/>`,
    fireplace: box(18, 16, 64, 38, '#a4503a') + box(32, 30, 36, 24, '#1a0d08') + `<path d="M42 54 L48 36 L52 46 L56 34 L60 54 Z" fill="#ff7a1c"/>` + box(14, 12, 72, 6, '#6b2f22'),
    plush: `<ellipse cx="46" cy="38" rx="22" ry="14" fill="#ffa3c0"/><circle cx="68" cy="32" r="11" fill="#ffa3c0"/><ellipse cx="76" cy="34" rx="5" ry="4" fill="#e57a9c"/>`,
    pixcube: box(30, 14, 20, 20, '#ff4fd8', 0) + box(50, 14, 20, 20, '#30c4ff', 0) + box(30, 34, 20, 20, '#ffe14d', 0) + box(50, 34, 20, 20, '#3cf27a', 0),
    easel: `<path d="M36 54 L46 8 M64 54 L54 8" stroke="#8a5a2b" stroke-width="4"/>` + box(30, 12, 40, 28, '#8fd8ff', 0) + `<circle cx="50" cy="48" r="16" fill="#62c457"/>` + box(48, 18, 4, 8, '#7dff6b', 0)
  };
  return `<svg viewBox="0 0 100 60" aria-hidden="true">${box(0, 54, 100, 6, 'rgba(0,0,0,.15)', 0)}${art[id] || ''}</svg>`;
}
function buildFurnUI() {
  $('furnGrid').innerHTML = FURN.map((f, i) => `<button class="hcard" data-i="${i}"><div class="hpic">${furnSvg(f.id)}</div><div class="hname">${f.name}</div><div class="hdesc">${f.desc}</div><div class="hfoot"><span class="hsize">${(f.hx * 2).toFixed(1)} × ${(f.hz * 2).toFixed(1)} m</span><span class="hprice">0 €</span></div>${i < 9 ? `<kbd class="hkey">${i + 1}</kbd>` : ''}</button>`).join('');
  $('furnGrid').querySelectorAll('.hcard').forEach(b => b.addEventListener('click', () => pickFurn(+b.dataset.i)));
  $('wallSw').innerHTML = WALL_COLS.map((c, i) => `<button class="sw" data-i="${i}" style="background:#${new THREE.Color(c).getHexString()}" aria-label="Sienų spalva ${i + 1}"></button>`).join('');
  $('floorSw').innerHTML = FLOOR_COLS.map((c, i) => `<button class="sw" data-i="${i}" style="background:#${new THREE.Color(c).getHexString()}" aria-label="${FLOOR_NAMES[i]}" title="${FLOOR_NAMES[i]}"></button>`).join('');
  $('wallSw').querySelectorAll('.sw').forEach(b => b.addEventListener('click', () => { homeRec.wall = +b.dataset.i; saveHouses(); buildRoom(); markSw(); sfx.blip(); }));
  $('floorSw').querySelectorAll('.sw').forEach(b => b.addEventListener('click', () => { homeRec.floor = +b.dataset.i; saveHouses(); buildRoom(); markSw(); sfx.blip(); }));
  $('furnClose').addEventListener('click', () => closeFurn(true));
}
function markSw() {
  $('wallSw').querySelectorAll('.sw').forEach(b => b.classList.toggle('on', +b.dataset.i === (homeRec.wall | 0)));
  $('floorSw').querySelectorAll('.sw').forEach(b => b.classList.toggle('on', +b.dataset.i === (homeRec.floor | 0)));
}
function openFurn() {
  if (furnOpen || mode !== 'home') return;
  if (sleeping) wakeUp();
  furnOpen = true; cancelFurn(true); for (const k in keys) keys[k] = false;
  $('furn').hidden = false; $('paused').hidden = true; markSw();
  $('furnCount').textContent = `Baldų name: ${homeRec.furn.length}`;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  sfx.blip(); const f = document.querySelector('#furnGrid .hcard'); if (f) f.focus();
}
function closeFurn(relock) {
  if (!furnOpen) return;
  furnOpen = false; $('furn').hidden = true;
  if (relock) requestLock();
}
function furnKey(e) {
  if (e.code === 'Escape' || e.code === 'KeyB') { e.preventDefault(); closeFurn(e.code === 'KeyB'); return; }
  const m = /^Digit([1-9])$/.exec(e.code); if (m) pickFurn(+m[1] - 1);
}
function pickFurn(i) {
  const d = FURN[i]; if (!d) return;
  closeFurn(true);
  furnPlacing = { t: d.id, r: 0, x: 0, z: 0, valid: false, why: '', ghost: null };
  tone(660, 0.15, { type: 'triangle', vol: 0.06 }); tone(880, 0.2, { type: 'triangle', vol: 0.06, when: 0.08 });
}
function cancelFurn(silent) { if (!furnPlacing) return; if (furnPlacing.ghost) homeRoot.remove(furnPlacing.ghost); furnPlacing = null; }
function updateFurnPlacing() {
  const fp = furnPlacing; if (!fp) return;
  const snap = v => Math.round(v * 4) / 4;
  const x = snap(player.pos.x + player.fwd.x * 1.7), z = snap(player.pos.z + player.fwd.z * 1.7);
  const key = x + ',' + z + ',' + fp.r;
  if (fp.key === key) return; fp.key = key; fp.x = x; fp.z = z;
  if (fp.ghost) homeRoot.remove(fp.ghost);
  fp.ghost = addFurnMesh({ t: fp.t, x, z, r: fp.r }, true);
  const f = footprint({ t: fp.t, r: fp.r }), { W, D } = homeRoom;
  let why = '';
  if (Math.abs(x) + f.hx > W / 2 - 0.1 || Math.abs(z) + f.hz > D / 2 - 0.1) why = 'Netelpa – per arti sienos.';
  else if (!f.flat && z + f.hz > D / 2 - 1.3 && Math.abs(x) - f.hx < 1.0) why = 'Neužstatyk durų.';
  else if (!f.flat) for (const o of homeRec.furn) { const g = footprint(o); if (g.flat) continue; if (Math.abs(o.x - x) < g.hx + f.hx - 0.02 && Math.abs(o.z - z) < g.hz + f.hz - 0.02) { why = 'Čia jau stovi ' + furnDef(o.t).name.toLowerCase() + '.'; break; } }
  fp.valid = !why; fp.why = why; ghostMat.color.setHex(fp.valid ? 0x5dff7a : 0xff4d4d);
}
function confirmFurn() {
  const fp = furnPlacing; if (!fp) return;
  if (!fp.valid) { toast('Čia padėti negalima', fp.why, '#ff6b6b'); tone(220, 0.2, { type: 'square', vol: 0.05, lp: 1200 }); return; }
  const f = { t: fp.t, x: fp.x, z: fp.z, r: fp.r };
  cancelFurn(true); homeRec.furn.push(f); addFurnMesh(f); linearize(homeScene); saveHouses();
  sfx.thud(null); tone(523, 0.2, { type: 'triangle', vol: 0.06 });
  toast(furnDef(f.t).name + ' padėta', 'B – dar baldų, X prie baldo – pasiimti atgal', '#7dff6b');
}
function nearestFurn() {
  let best = null, bd = 0.9;
  for (const f of homeRec.furn) { const fp = footprint(f); const dx = Math.max(0, Math.abs(player.pos.x - f.x) - fp.hx), dz = Math.max(0, Math.abs(player.pos.z - f.z) - fp.hz); const dd = Math.hypot(dx, dz) - (fp.flat ? 0.6 : 0); if (dd < bd) { bd = dd; best = f; } }
  return best;
}
function removeFurn(f) {
  homeRoot.remove(f.mesh); homeRec.furn.splice(homeRec.furn.indexOf(f), 1); saveHouses();
  homeAnims = []; buildRoom(); sfx.grab(); toast(furnDef(f.t).name + ' paimta', 'Gali ją vėl pasidėti per B meniu', '#ffb347');
}

// ---------- the home loop ----------
function homeAction() { // E inside
  if (sleeping) { wakeUp(); return; }
  if (Math.abs(player.pos.x) < 1.3 && player.pos.z > homeRoom.D / 2 - 1.6) { exitHome(); return; }
  const bed = nearestBed(); if (bed) goToSleep(bed);
}
function updateHome(dt, t) {
  for (const a of homeAnims) a(dt, t);
  const p = player.mesh.userData.parts;
  if (sleeping) {
    sleeping.t += dt; sleeping.zT -= dt;
    const r = (sleeping.bed.r | 0) * Math.PI / 2;
    player.mesh.position.set(sleeping.bed.x, 0.78, sleeping.bed.z);
    player.mesh.rotation.set(0, 0, 0); player.mesh.rotation.y = r; player.mesh.rotateX(-Math.PI / 2); player.mesh.translateY(-1.15);
    p.legL.rotation.set(0, 0, 0); p.legR.rotation.set(0, 0, 0); p.armL.rotation.set(0, 0, 0.1); p.armR.rotation.set(0, 0, -0.1);
    p.body.position.y = Math.sin(t * 1.6) * 0.02;
    if (sleeping.zT <= 0) {
      sleeping.zT = 1.1;
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zzzTex, transparent: true, depthWrite: false, color: 0xd8ccff })); s.scale.setScalar(0.4);
      const start = new V3(sleeping.bed.x, 1.2, sleeping.bed.z); s.position.copy(start); homeRoot.add(s); let k = 0;
      fx.push(d2 => { k += d2; s.position.set(start.x + Math.sin(k * 3) * 0.3, start.y + k * 0.6, start.z); s.scale.setScalar(0.3 + k * 0.25); s.material.opacity = Math.max(0, 1 - k / 2.2); if (k > 2.2) { homeRoot && homeRoot.remove(s); return false; } return true; });
      tone(110, 0.9, { to: 90, type: 'sine', vol: 0.03, attack: 0.3 });
    }
    camera.position.lerp(new V3(sleeping.bed.x + 2.6, 2.6, sleeping.bed.z + 2.6), Math.min(1, dt * 2)); camera.up.set(0, 1, 0); camera.lookAt(sleeping.bed.x, 0.7, sleeping.bed.z);
    setPrompt('<kbd>E</kbd> pabusti');
    if (sleeping.t > 8) wakeUp();
    return;
  }
  // movement (same feel as outside)
  const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP);
  _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 7 : 4.5; _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, player.grounded ? Math.min(1, 12 * dt) : Math.min(1, 2.5 * dt));
  if (keys.Space && player.grounded) { player.vr = 7; player.grounded = false; sfx.jump(); }
  player.pos.addScaledVector(player.vel, dt);
  player.vr -= GRAV * dt; player.pos.y += player.vr * dt;
  // furniture: bump into it or stand on it
  let ground = 0; const rad = 0.3;
  for (const o of homeRec.furn) {
    const fp = footprint(o); if (fp.flat) continue;
    const dx = player.pos.x - o.x, dz = player.pos.z - o.z, ex = fp.hx + rad - Math.abs(dx), ez = fp.hz + rad - Math.abs(dz);
    if (ex <= 0 || ez <= 0) continue;
    if (player.pos.y >= fp.top - 0.45) { if (fp.top > ground) ground = fp.top; }
    else if (ex < ez) player.pos.x += dx < 0 ? -ex : ex; else player.pos.z += dz < 0 ? -ez : ez;
  }
  const { W, D, H } = homeRoom;
  player.pos.x = clamp(player.pos.x, -W / 2 + rad, W / 2 - rad); player.pos.z = clamp(player.pos.z, -D / 2 + rad, D / 2 - rad);
  if (player.pos.y > H - 1.9) { player.pos.y = H - 1.9; if (player.vr > 0) player.vr = 0; }
  const g0 = player.grounded;
  if (player.pos.y <= ground || (g0 && player.vr <= 0 && player.pos.y - ground < 0.3)) { player.pos.y = ground; player.vr = 0; player.grounded = true; } else player.grounded = false;
  player.mesh.rotation.set(0, 0, 0);
  player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd);
  animateMan(dt, f !== 0 || s !== 0, sp);
  // camera stays inside the room
  const dist = 4.2, pitch = player.pitch;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
  _ct.x = clamp(_ct.x, -W / 2 + 0.25, W / 2 - 0.25); _ct.z = clamp(_ct.z, -D / 2 + 0.25, D / 2 - 0.25); _ct.y = clamp(_ct.y, 0.4, H - 0.25);
  camera.position.lerp(_ct, Math.min(1, dt * 10)); camera.up.set(0, 1, 0);
  camera.lookAt(player.pos.x, player.pos.y + 1.3, player.pos.z);
  // prompts
  updateFurnPlacing();
  let ptxt = '';
  if (furnPlacing) ptxt = (furnPlacing.valid ? '' : '<span style="color:#ff8a8a">' + furnPlacing.why + '</span> · ') + '<kbd>LMB</kbd> padėti · <kbd>Q</kbd> / ratukas – sukti · <kbd>RMB</kbd> atšaukti';
  else if (Math.abs(player.pos.x) < 1.3 && player.pos.z > D / 2 - 1.6) ptxt = '<kbd>E</kbd> išeiti į lauką · <kbd>B</kbd> įrengti namą';
  else if (nearestBed()) ptxt = '<kbd>E</kbd> miegoti · <kbd>X</kbd> pasiimti lovą · <kbd>B</kbd> įrengti';
  else { const nf = nearestFurn(); ptxt = nf ? `<kbd>X</kbd> pasiimti: ${furnDef(nf.t).name} · <kbd>B</kbd> įrengti` : '<kbd>B</kbd> įrengti namą'; }
  setPrompt(ptxt);
}
