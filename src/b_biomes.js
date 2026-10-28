// ================= biome content =================
// lumpy, smooth blob used for leaves, bushes and moss: looks grown rather than cut
function organicBlob() {
  const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position, t = new V3();
  for (let i = 0; i < p.count; i++) { t.fromBufferAttribute(p, i); const k = 1 + 0.16 * noise(t.x * 2.3 + 5, t.y * 2.3, t.z * 2.3) + 0.07 * noise(t.x * 6, t.y * 6 + 3, t.z * 6); t.multiplyScalar(k); p.setXYZ(i, t.x, t.y, t.z); }
  g.computeVertexNormals(); smoothNormals(g); return g;
}
const cloudTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  for (let i = 0; i < 26; i++) { const px = 30 + Math.random() * 68, py = 38 + Math.random() * 50, r = 14 + Math.random() * 26;
    const gr = x.createRadialGradient(px, py - r * 0.3, 0, px, py, r); gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.6, 'rgba(244,246,250,0.25)'); gr.addColorStop(1, 'rgba(230,235,245,0)'); x.fillStyle = gr; x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill(); }
  const im = x.getImageData(0, 0, 128, 128); for (let i = 0; i < im.data.length; i += 4) { const a2 = im.data[i + 3]; const shade = 235 + (im.data[i + 1] > 0 ? 20 : 0); im.data[i] = im.data[i + 1] = shade; im.data[i + 2] = 255; im.data[i + 3] = a2; } x.putImageData(im, 0, 0);
  return new THREE.CanvasTexture(c);
})();
const animators = [];        // (dt, t) => void
const dunes = [];            // moving dunes (desert)
const gate = {};             // creator gate in city
const cityCars = [];
const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 10),
  cyl6: new THREE.CylinderGeometry(1, 1, 1, 6),
  cone: new THREE.ConeGeometry(1, 1, 8),
  ico: new THREE.IcosahedronGeometry(1, 0),
  ico1: organicBlob(),
  sph: new THREE.SphereGeometry(1, 14, 10),
  dome: new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
  dodec: new THREE.DodecahedronGeometry(1, 0)
};
function S(geo, m, sx, sy, sz, x = 0, y = 0, z = 0) { const o = mesh(geo, m, x, y, z); o.scale.set(sx, sy, sz); return o; }

// ---------- 1. Origin City ----------
function cityDir(u, v) { return new V3(u, R, v).normalize(); }
function buildCity() {
  // gate
  const g = new THREE.Group();
  const stone = mat(0xe9e2d0), gold = mat(0xf2c14e);
  g.add(S(G.cyl, stone, 5.2, 0.6, 5.2, 0, 0.3, 0));
  g.add(S(G.cyl, gold, 4.6, 0.25, 4.6, 0, 0.7, 0));
  const ring = mesh(new THREE.TorusGeometry(4, 0.55, 12, 48), stone, 0, 5.2, 0); g.add(ring);
  const ring2 = mesh(new THREE.TorusGeometry(4.6, 0.15, 8, 48), gold, 0, 5.2, 0); g.add(ring2);
  const discMat = new THREE.ShaderMaterial({
    transparent: true, side: THREE.DoubleSide, uniforms: { uT: { value: 0 }, uOpen: { value: 0 } },
    vertexShader: 'varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform float uT,uOpen; varying vec2 vU; void main(){ vec2 p=vU-.5; float r=length(p)*2.; float a=atan(p.y,p.x);
      float sw=sin(a*5.+r*12.-uT*3.)*.5+.5; vec3 closed=vec3(.18,.16,.3)+vec3(.15,.4,.5)*smoothstep(.85,1.,sw)*.4;
      vec3 open=mix(vec3(1.,.95,.7),vec3(.6,.4,1.),r)+vec3(.4)*sw; vec3 c=mix(closed,open,uOpen);
      gl_FragColor=vec4(c, mix(.75,.9,uOpen)*(1.-smoothstep(.95,1.,r))); }`
  });
  const disc = mesh(new THREE.CircleGeometry(3.6, 48), discMat, 0, 5.2, 0); g.add(disc);
  gate.lamps = [];
  for (let i = 1; i < NB; i++) {
    const a = Math.PI * (0.12 + 0.76 * (i - 1) / 5);
    const l = mesh(G.sph, bmat(0x555566), Math.cos(a) * 4, 5.2 + Math.sin(a) * 4, 0); l.scale.setScalar(0.42);
    l.userData.color = new THREE.Color(BIOMES[i].hud); g.add(l); gate.lamps.push(l);
  }
  gate.group = g; gate.disc = discMat;
  g.position.set(0, R + TH(UP), 0); world.add(g);
  gate.center = new V3(0, R + TH(UP) + 5.2, 0);
  animators.push((dt, t) => { discMat.uniforms.uT.value = t; ring2.rotation.z = t * 0.3; });
  solids.push({ p: new V3(0, R + TH(UP), 0), up: UP.clone(), dir: UP.clone(), r: 5.2, top: R + TH(UP) + 0.85, thin: false });
  gate.inspect = addInspect(gate.center.clone().setY(R + 2), 'Kūrėjo vartai', '', 7);

  // signposts toward each biome
  const wood = mat(0x7a5232);
  for (let i = 1; i < NB; i++) {
    const a = (i - 1) / 6 * Math.PI * 2 + 0.3;
    const d = cityDir(Math.cos(a) * 11.5, Math.sin(a) * 11.5);
    const post = new THREE.Group();
    post.add(S(G.cyl, wood, 0.12, 3, 0.12, 0, 1.5, 0));
    const tex = labelTex(BIOMES[i].name, '#2b2036', BIOMES[i].hud);
    const mats = [new THREE.MeshLambertMaterial({ map: tex }), new THREE.MeshLambertMaterial({ map: tex }), wood, wood, wood, wood];
    const board = mesh(new THREE.BoxGeometry(0.12, 0.62, 3.2), mats, 0, 2.6, 1.0); post.add(board);
    const tip = mesh(new THREE.ConeGeometry(0.36, 0.7, 4), mat(0x2b2036), 0, 2.6, 2.95); tip.rotation.x = Math.PI / 2; post.add(tip);
    post.position.copy(surf(d));
    const tg = tangentToward(d, i === 6 ? new V3(0, -1, 0) : BC[i]);
    orient(post, d, tg); world.add(post);
    addSolid(d, 0.3, 3);
  }
  // runes
  for (let k = 0; k < 7; k++) {
    const a = k / 7 * Math.PI * 2;
    const d = cityDir(Math.cos(a) * 7.5, Math.sin(a) * 7.5);
    const p = mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: runeTex(k * 77 + 3), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    p.rotation.x = -Math.PI / 2; const grp = new THREE.Group(); grp.add(p); place(grp, d, a, 0.06);
    animators.push((dt, t) => { p.material.opacity = 0.55 + 0.45 * Math.sin(t * 1.5 + k); });
  }
  addInspect(surf(cityDir(7.5, 0)), 'Seni ženklai', 'Aikštės grindinyje iškalti septyni švytintys simboliai. Kiekvienas rodo į skirtingą pasaulio pusę, o aštuntojo vietoje – tuščia dėmė. Kažkas jį ištrynė.', 6);

  // buildings on the street grid
  const pal = [0xff7b7b, 0xffc75a, 0x7bd3ff, 0x9b8cff, 0x7dffb0, 0xff9ee5, 0xffe08a, 0x8fe3d6];
  for (let i = -3; i <= 2; i++) for (let j = -3; j <= 2; j++) {
    const cu = 10 + 20 * i, cv = 10 + 20 * j, cr = Math.hypot(cu, cv);
    if (cr < 24 || cr > 56) continue;
    if (cu === -10 && cv === 30) continue;
    if (cu === 30 && cv === -10) continue;   // the museum stands here   // the restaurant "Skanus maistas" stands here
    for (const [ou, ov] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) {
      if (rnd() < 0.18) continue;
      const u = cu + ou, v = cv + ov, d = cityDir(u, v);
      const w = rr(4.8, 6.4), dp = rr(4.8, 6.4), h = rr(5, 18) * (1.15 - cr / 80);
      const b = new THREE.Group(); const col = pick(pal);
      b.add(S(G.box, mat(col), w, h, dp, 0, h / 2 - 0.5, 0));
      b.add(S(G.box, mat(0xffffff), w + 0.3, 0.5, dp + 0.3, 0, h - 0.3, 0));
      const winM = mat(0x40536f, { metalness: 0.6, roughness: 0.12 });
      for (let f = 1.6; f < h - 1.2; f += 2.2) {
        b.add(S(G.box, winM, w + 0.04, 0.7, dp * 0.7, 0, f, 0));
        b.add(S(G.box, winM, w * 0.7, 0.7, dp + 0.04, 0, f, 0));
      }
      if (rnd() < 0.3) { b.add(S(G.cone, mat(0xd8584a), Math.min(w, dp) * 0.65, 2.5, Math.min(w, dp) * 0.65, 0, h + 1.2, 0)); b.children[b.children.length - 1].rotation.y = Math.PI / 8; }
      place(b, d, 0, 0);
      addBox(b, w / 2 + 0.15, dp / 2 + 0.15, h - 0.05);
    }
  }
  // trees on the green hills around the city
  for (let k = 0; k < 60; k++) {
    const d = dirIn(0, 0.5, d => { const [u, v] = cityUV(d.x, d.y, d.z); return Math.hypot(u, v) > 58 && isLand(d); }); if (!d) continue;
    const t = new THREE.Group(), s = rr(0.8, 1.4);
    t.add(S(G.cyl, mat(0x7a5232), 0.25 * s, 2.4 * s, 0.25 * s, 0, 1.2 * s, 0));
    t.add(S(G.ico1, mat(pick([0x4fc24a, 0x3faf47, 0x6fd45a])), 1.5 * s, 1.6 * s, 1.5 * s, 0, 3.2 * s, 0));
    place(t, d, rr(0, 6)); addSolid(d, 0.4 * s, 4 * s);
  }
  // street lamps
  for (let k = 0; k < 10; k++) {
    const a = k / 10 * Math.PI * 2, d = cityDir(Math.cos(a) * 22.6, Math.sin(a) * 22.6);
    const l = new THREE.Group();
    l.add(S(G.cyl, mat(0x30343e), 0.1, 4, 0.1, 0, 2, 0));
    l.add(S(G.sph, bmat(0xfff2b0), 0.35, 0.35, 0.35, 0, 4.1, 0));
    place(l, d); addSolid(d, 0.2, 4);
  }
  // cars that circle the plaza ring road
  for (let k = 0; k < 3; k++) {
    const car = makeCarMesh(pick([0x3a7bff, 0xffd23a, 0xff5ab4]));
    car.scale.setScalar(0.85); world.add(car); cityCars.push(car);
    const ph = k / 3 * Math.PI * 2;
    animators.push((dt, t) => {
      const a = ph + t * 0.35, u = Math.cos(a) * 19, v = Math.sin(a) * 19, d = cityDir(u, v);
      car.position.copy(surf(d));
      const fd = cityDir(Math.cos(a + 0.05) * 19, Math.sin(a + 0.05) * 19);
      orient(car, d, tangentToward(d, fd));
    });
  }
}
function makeCarMesh(color) {
  const g = new THREE.Group();
  g.add(S(G.box, mat(color), 1.8, 0.6, 3.4, 0, 0.75, 0));
  g.add(S(G.box, mat(0xdff3ff), 1.5, 0.55, 1.7, 0, 1.3, -0.25));
  g.add(S(G.box, mat(color), 1.56, 0.12, 1.76, 0, 1.62, -0.25));
  const wheels = [];
  for (const [x, z] of [[-0.95, 1.1], [0.95, 1.1], [-0.95, -1.1], [0.95, -1.1]]) {
    const w = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.32, 14), mat(0x222228), x, 0.42, z); w.rotation.z = Math.PI / 2; g.add(w); wheels.push(w);
  }
  g.add(S(G.box, bmat(0xfff3a0), 0.35, 0.18, 0.05, -0.6, 0.85, 1.71));
  g.add(S(G.box, bmat(0xfff3a0), 0.35, 0.18, 0.05, 0.6, 0.85, 1.71));
  g.add(S(G.box, bmat(0xff3030), 0.35, 0.15, 0.05, -0.6, 0.85, -1.71));
  g.add(S(G.box, bmat(0xff3030), 0.35, 0.15, 0.05, 0.6, 0.85, -1.71));
  g.userData.wheels = wheels;
  return g;
}

// ---------- 2. Endless Desert ----------
function palm(s = 1) {
  const p = new THREE.Group(); const trunk = mat(0x9b7246);
  let y = 0, x = 0;
  for (let k = 0; k < 6; k++) { const seg = S(G.cyl6, trunk, 0.22 * s, 1.1 * s, 0.22 * s, x, y + 0.55 * s, 0); seg.rotation.z = -0.08 * k; p.add(seg); y += 1.05 * s; x += 0.09 * k * s; }
  for (let k = 0; k < 6; k++) {
    const leaf = S(G.cone, mat(0x3fae4a), 0.5 * s, 2.8 * s, 0.12 * s, x, y, 0);
    leaf.rotation.order = 'YXZ'; leaf.rotation.y = k / 6 * Math.PI * 2; leaf.rotation.x = 1.2; leaf.position.add(new V3(Math.sin(leaf.rotation.y), -0.2, Math.cos(leaf.rotation.y)).multiplyScalar(1.1 * s)); p.add(leaf);
  }
  return p;
}
function buildDesert() {
  const sand = mat(0xd9a866), sand2 = mat(0xc89354);
  // ruins
  for (let k = 0; k < 16; k++) {
    const d = dirIn(1, 0.75, d => farFromOthers(d, 10)); if (!d) continue; placedList.push(d);
    const g = new THREE.Group(); const n = 3 + Math.floor(rnd() * 4); const cols = [];
    for (let j = 0; j < n; j++) {
      const h = rr(1.5, 6), x = rr(-4, 4), z = rr(-4, 4);
      if (rnd() < 0.25) { const f = S(G.cyl, sand2, 0.6, 4, 0.6, x, 0.4, z); f.rotation.z = Math.PI / 2; const a = rnd() * 3; f.rotation.y = a; g.add(f); for (const t of [-1.4, 0, 1.4]) cols.push([x + Math.cos(a) * t, z - Math.sin(a) * t, 0.65, 1.0]); }
      else { g.add(S(G.cyl, sand, 0.6, h, 0.6, x, h / 2 - 0.3, z)); g.add(S(G.box, sand2, 1.6, 0.4, 1.6, x, h - 0.1, z)); cols.push([x, z, 0.75, h + 0.1]); }
    }
    place(g, d, rr(0, 6), -0.2); for (const [x, z, r, h] of cols) addLocal(g, x, z, r, h);
    if (k < 3) addInspect(surf(d, 1), 'Seni griuvėsiai', 'Smėlio nugairintos kolonos. Ant vienos išraižytas tas pats simbolis, kurį matei Pradžios Mieste. Kažkas čia buvo seniai prieš miestą.', 7);
  }
  // mysterious stone gates
  for (let k = 0; k < 3; k++) {
    const d = dirIn(1, 0.85, d => farFromOthers(d, 18) && !nearRoad(d, 6)); if (!d) continue; placedList.push(d);
    const g = new THREE.Group(); const st = mat(0x8a7a66);
    g.add(S(G.box, st, 1.6, 9, 1.6, -3.4, 4.3, 0)); g.add(S(G.box, st, 1.6, 9, 1.6, 3.4, 4.3, 0));
    g.add(S(G.box, st, 9.4, 1.6, 2, 0, 9.3, 0));
    const veil = mesh(new THREE.PlaneGeometry(5.2, 8.4), new THREE.MeshBasicMaterial({ color: 0x40e0ff, transparent: true, opacity: 0.25, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }), 0, 4.3, 0);
    g.add(veil); animators.push((dt, t) => { veil.material.opacity = 0.15 + 0.15 * Math.sin(t * 2 + k); });
    place(g, d, rr(0, 6), -0.5);
    const right = new V3(1, 0, 0).applyQuaternion(g.quaternion);
    for (const sx of [-3.4, 3.4]) { const pd = g.position.clone().addScaledVector(right, sx).normalize(); addSolid(pd, 1.1, 9); }
    addInspect(surf(d, 2), 'Akmeniniai vartai', 'Niekas nežino, kas pastatė šiuos vartus ir kur jie veda. Pro juos pučia vėjas, nors kitoje pusėje vėjo nėra. Kartais tarp kolonų sužiba mėlyna šviesa.', 7);
  }
  // oases
  for (let k = 0; k < 3; k++) {
    const d = dirIn(1, 0.8, d => farFromOthers(d, 14) && !nearRoad(d, 7)); if (!d) continue; placedList.push(d);
    const g = new THREE.Group();
    g.add(S(G.cyl, mat(0x4fc6e8, { transparent: true, opacity: 0.85 }), 4.5, 0.2, 4.5, 0, 0.25, 0));
    g.add(S(G.cyl, mat(0x7ccf5a), 5.6, 0.12, 5.6, 0, 0.12, 0));
    const pp = [];
    for (let j = 0; j < 3; j++) { const a = j * 2.1 + rnd(); const pm = palm(rr(0.9, 1.2)); pm.position.set(Math.cos(a) * 5, 0, Math.sin(a) * 5); pm.rotation.y = rnd() * 6; g.add(pm); pp.push([Math.cos(a) * 5, Math.sin(a) * 5]); }
    place(g, d, 0, -0.1); for (const [x, z] of pp) addLocal(g, x, z, 0.4, 6);
    addInspect(surf(d, 1), 'Oazė', 'Mažas vandens telkinys tarp palmių. Vanduo šaltas, nors aplink karšta. Panašu, kad jis ateina iš labai giliai.', 7);
  }
  // tunnels
  for (let k = 0; k < 3; k++) {
    const d = dirIn(1, 0.8, d => farFromOthers(d, 10)); if (!d) continue; placedList.push(d);
    const g = new THREE.Group();
    g.add(S(G.dome, sand2, 3, 2.4, 3, 0, -0.3, 0));
    g.add(S(new THREE.CircleGeometry(1, 20, 0, Math.PI), bmat(0x120c06), 1.6, 1.6, 1, 0, -0.2, 2.75));
    place(g, d, rr(0, 6)); addSolid(d, 2.8, 1.9);
    addInspect(surf(d, 1), 'Požeminis tunelis', 'Tamsus įėjimas po smėliu. Iš gilumos sklinda tylus ūžimas, lyg kažkas po žeme kvėpuotų.', 6);
  }
  // cacti
  for (let k = 0; k < 40; k++) {
    const d = dirIn(1, 0.7); if (!d) continue;
    const c = new THREE.Group(), cm = mat(0x4f9c45), h = rr(1.6, 3.2);
    c.add(S(G.cyl, cm, 0.3, h, 0.3, 0, h / 2, 0));
    if (rnd() < 0.7) { c.add(S(G.cyl, cm, 0.2, 1, 0.2, 0.45, h * 0.55, 0)); { const _o = S(G.cyl, cm, 0.2, 0.6, 0.2, 0.3, h * 0.45, 0); _o.rotation.z = Math.PI / 2; c.add(_o); } }
    place(c, d, rr(0, 6)); addSolid(d, 0.35, h);
  }
  // moving dunes
  const prof = []; for (let i = 0; i <= 16; i++) { const t = i / 16; prof.push(new THREE.Vector2(t, Math.pow(1 - t * t, 2))); }
  const duneGeo = new THREE.LatheGeometry(prof, 28);
  for (let k = 0; k < 7; k++) {
    const d = dirIn(1, 0.85); if (!d) continue;
    const du = { dir: d, mv: tangentToward(d, randDir()), speed: rr(0.6, 1.2), rad: rr(7, 11), A: rr(2.2, 3.6), base: 0 };
    du.mesh = new THREE.Mesh(duneGeo, mat(0xe9b86e)); world.add(du.mesh); dunes.push(du);
  }
}
function updateDunes(dt) {
  for (const du of dunes) {
    const nd = moveAlong(du.dir, du.mv, du.speed * dt);
    weights(nd.x, nd.y, nd.z, W);
    if (W[1] < 0.8) { du.mv.negate(); continue; }
    du.mv.addScaledVector(du.dir, -du.mv.dot(du.dir)); // keep tangent
    du.mv.applyAxisAngle(du.dir, (noise(du.dir.x * 9, du.dir.y * 9, performance.now() * 0.00005) * 0.4) * dt).normalize();
    du.dir.copy(nd);
    du.base = TH(nd) - 1.2;
    du.mesh.position.copy(nd).multiplyScalar(R + du.base);
    du.mesh.quaternion.setFromUnitVectors(UP, nd);
    du.mesh.scale.set(du.rad, du.A + 1.2, du.rad);
  }
}
function duneGround(d) {
  let best = -99;
  for (const du of dunes) {
    const ang = du.dir.dot(d); if (ang < 0.99) continue;
    const dist = Math.acos(Math.min(1, ang)) * R; if (dist > du.rad) continue;
    const t = dist / du.rad, h = du.base + (du.A + 1.2) * Math.pow(1 - t * t, 2);
    if (h > best) best = h;
  }
  return best;
}

// ---------- 3. Frozen Island ----------
const iceChunks = [], iceShadows = [];
function buildIce() {
  const ice = mat(0xdff4ff), iceB = mat(0xa6dcf5, { transparent: true, opacity: 0.85 });
  // icebergs in the ocean
  for (let k = 0; k < 14; k++) {
    const d = dirIn(2, 0.8, d => TH(d) < -1.5 && farFromOthers(d, 9)); if (!d) continue; placedList.push(d);
    const s = rr(2.5, 5.5), b = S(G.ico, ice, s, s * rr(1.2, 2), s); place(b, d, rr(0, 6), 0, world);
    b.position.copy(d).multiplyScalar(R - 0.5); addSolid(d, s * 0.8, s * 1.6, false, -TH(d) - 0.5);
  }
  // floating ice chunks (platforms that drift)
  for (let k = 0; k < 16; k++) {
    const d = dirIn(2, 0.75, d => TH(d) < -1); if (!d) continue;
    const r = rr(1.6, 3.2), m = S(G.cyl6, ice, r, 0.9, r); world.add(m);
    const s = { p: new V3(), up: d.clone(), dir: d.clone(), r: r * 0.9, top: R + 0.45, thin: false };
    solids.push(s); iceChunks.push({ dir: d, mv: tangentToward(d, randDir()), m, s, sp: rr(0.3, 0.8) });
  }
  // abandoned huts on the island
  for (let k = 0; k < 6; k++) {
    const d = dirIn(2, 0.85, d => TH(d) > 1.2 && farFromOthers(d, 8)); if (!d) continue; placedList.push(d);
    const h = new THREE.Group();
    h.add(S(G.box, mat(0x7a5a44), 3.2, 2.4, 3, 0, 1.2, 0));
    const roof = S(G.cone, mat(0xffffff), 2.8, 1.8, 2.8, 0, 3.3, 0); roof.rotation.y = Math.PI / 4; h.add(roof);
    h.add(S(G.box, bmat(0x1c1410), 0.9, 1.5, 0.05, 0, 0.75, 1.52));
    place(h, d, rr(0, 6)); addBox(h, 1.7, 1.6, 2.45);
    if (k < 2) addInspect(surf(d, 1), 'Apleistas namelis', 'Viduje stovi stalas su dviem puodeliais. Arbata seniai užšalusi. Atrodo, kad gyventojai išėjo labai skubėdami.', 6);
  }
  // ice caves
  for (let k = 0; k < 3; k++) {
    const d = dirIn(2, 0.85, d => TH(d) > 1.5 && farFromOthers(d, 12) && !nearRoad(d, 7)); if (!d) continue; placedList.push(d);
    const c = new THREE.Group();
    c.add(S(G.dome, iceB, 6, 5, 6, 0, -0.4, 0));
    c.add(S(new THREE.CircleGeometry(1, 24, 0, Math.PI), bmat(0x0d2a3c), 2.2, 2.6, 1, 0, -0.3, 5.7));
    place(c, d, rr(0, 6)); addSolid(d, 5.4, 4.4);
    addInspect(surf(d, 1), 'Ledo urvas', 'Milžiniškas ledo urvas. Sienos permatomos, o giliai jose sustingę burbulai, panašūs į mažus pasaulius. Gal tai kiti burbulai, kaip tavasis?', 8);
  }
  // frozen lakes
  for (let k = 0; k < 3; k++) {
    const d = dirIn(2, 0.88, d => TH(d) > 1 && farFromOthers(d, 8)); if (!d) continue; placedList.push(d);
    const l = S(G.cyl, new THREE.MeshPhongMaterial({ color: 0xbfe8ff, shininess: 120, specular: 0xffffff }), rr(4, 6), 0.3, rr(4, 6)); place(l, d, 0, 0.1);
  }
  // shadows under the ice
  for (let k = 0; k < 7; k++) {
    const d = dirIn(2, 0.75, d => TH(d) < -2); if (!d) continue;
    const sh = S(G.sph, bmat(0x0b1d2a, { transparent: true, opacity: 0.55 }), rr(2, 5), 0.3, rr(5, 9)); world.add(sh);
    const o = { dir: d, mv: tangentToward(d, randDir()), m: sh, sp: rr(0.8, 2) }; iceShadows.push(o);
    o.ins = addInspect(new V3(), 'Šešėlis po ledu', 'Po vandeniu lėtai plaukia kažkas didelio. Kai pasilenki arčiau, šešėlis sustoja, lyg klausytųsi. Tada nuplaukia toliau.', 6);
  }
  // snowmen-like markers / pines
  for (let k = 0; k < 25; k++) {
    const d = dirIn(2, 0.85, d => TH(d) > 1.2); if (!d) continue;
    const p = new THREE.Group(), s = rr(0.8, 1.4);
    p.add(S(G.cyl, mat(0x5a4030), 0.2 * s, 1.2 * s, 0.2 * s, 0, 0.6 * s, 0));
    p.add(S(G.cone, mat(0x2f6f5a), 1.2 * s, 2.6 * s, 1.2 * s, 0, 2.2 * s, 0));
    p.add(S(G.cone, mat(0xffffff), 0.75 * s, 1.2 * s, 0.75 * s, 0, 3.3 * s, 0));
    place(p, d, rr(0, 6)); addSolid(d, 0.4 * s, 3.5 * s);
  }
}
function updateIce(dt) {
  for (const c of iceChunks) {
    const nd = moveAlong(c.dir, c.mv, c.sp * dt);
    if (TH(nd) > -0.8) { c.mv.negate(); continue; }
    c.dir.copy(nd); c.mv.addScaledVector(nd, -c.mv.dot(nd)).normalize();
    c.m.position.copy(nd).multiplyScalar(R + 0.05); c.m.quaternion.setFromUnitVectors(UP, nd);
    c.s.p.copy(nd).multiplyScalar(R - 1); c.s.up.copy(nd); c.s.dir.copy(nd);
  }
  for (const s of iceShadows) {
    const nd = moveAlong(s.dir, s.mv, s.sp * dt);
    if (TH(nd) > -1.6) { s.mv.negate(); continue; }
    s.dir.copy(nd); s.mv.addScaledVector(nd, -s.mv.dot(nd)).normalize();
    s.m.position.copy(nd).multiplyScalar(R - 1.6); orient(s.m, nd, s.mv);
    s.ins.pos.copy(nd).multiplyScalar(R);
  }
}

// ---------- 4. Mushroom Kingdom ----------
function mushroom(stemH, capR, capCol, d, glow = true) {
  const g = new THREE.Group();
  const stemR = Math.max(0.35, capR * 0.18);
  g.add(S(G.cyl, mat(0xf3e9dc), stemR, stemH, stemR, 0, stemH / 2, 0));
  const cap = S(G.dome, mat(capCol), capR, capR * 0.45, capR, 0, stemH - 0.2, 0); g.add(cap);
  g.add(S(G.cyl, mat(0xe8d6c4), capR * 0.96, 0.15, capR * 0.96, 0, stemH - 0.2, 0));
  if (glow) {
    const sm = bmat(pick([0xfff7a8, 0x9ffcff, 0xffffff]));
    for (let k = 0; k < Math.round(capR * 1.6); k++) {
      const a = rnd() * Math.PI * 2, rr2 = rnd() * 0.75, y = Math.sqrt(1 - rr2 * rr2) * capR * 0.45;
      g.add(S(G.sph, sm, capR * 0.09, capR * 0.04, capR * 0.09, Math.cos(a) * rr2 * capR, stemH - 0.2 + y, Math.sin(a) * rr2 * capR));
    }
  }
  place(g, d, rnd() * 6, -0.2);
  const base = R + TH(d) - 0.2;
  solids.push({ p: d.clone().multiplyScalar(base), up: d.clone(), dir: d.clone(), r: stemR, top: base + stemH - 0.3, thin: false });
  if (stemH > 1.5) solids.push({ p: d.clone().multiplyScalar(base), up: d.clone(), dir: d.clone(), r: capR * 0.72, top: base + stemH - 0.2 + capR * 0.45 * 0.82, thin: true });
  return g;
}
function buildMushroom() {
  const caps = [0xff4d6d, 0xb04dff, 0x4dd8ff, 0xff9f1c, 0xff5fd2, 0x7dff8a];
  // giant central mushroom with a spiral of shelf fungi
  const c = BC[3];
  const top = 24;
  const big = mushroom(top, 12, 0xff3d7f, c);
  const glowS = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,180,255,1)', 'rgba(255,80,200,0)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  glowS.scale.setScalar(40); glowS.position.set(0, top + 4, 0); big.add(glowS);
  animators.push((dt, t) => { glowS.material.opacity = 0.35 + 0.25 * Math.sin(t * 1.2); });
  const base = R + TH(c) - 0.2; const t1 = tangentToward(c, randDir()), t2 = new V3().crossVectors(c, t1);
  const shelfM = mat(0xffb36b);
  let a = 0;
  for (let k = 0; k < 15; k++) {
    const h = 1.5 + k * 1.55, rad = 3.6 + Math.max(0, k - 8) * 1.667;   // the top shelves curl outwards to the cap's rim
    a += 0.85 * 3.6 / rad;
    const off = t1.clone().multiplyScalar(Math.cos(a) * rad).addScaledVector(t2, Math.sin(a) * rad);
    const pos = c.clone().multiplyScalar(base + h).add(off);
    const sh = S(G.cyl, shelfM, 1.9, 0.35, 1.9); sh.position.copy(pos); sh.quaternion.setFromUnitVectors(UP, c); world.add(sh);
    solids.push({ p: pos.clone().addScaledVector(c, -0.2), up: c.clone(), dir: c.clone(), r: 1.9, top: base + h + 0.17, thin: true });
  }
  addInspect(c.clone().multiplyScalar(base + 1), 'Didysis Grybas', 'Šio biomo širdis. Jo kepurė šviečia tuo ryškiau, kuo daugiau sporų aplink. Aplink kamieną spirale kyla lentyniniai grybai – galima užlipti iki pat viršaus.', 9);
  placedList.push(c);
  for (let k = 0; k < 55; k++) {
    const d = dirIn(3, 0.72, d => farFromOthers(d, 6)); if (!d) continue; placedList.push(d);
    const s = rnd(); mushroom(lerp(1.2, 13, s * s), lerp(1.2, 7, s), pick(caps), d);
  }
  // little mushroom clusters
  for (let k = 0; k < 70; k++) { const d = dirIn(3, 0.7); if (!d) continue; mushroom(rr(0.5, 1.2), rr(0.4, 0.9), pick(caps), d, false); }
}

// ---------- 5. Crimson Wastes ----------
const dustDevils = [], skeletons = [];
function buildCrimson() {
  const rock = mat(0x9c3a22), rock2 = mat(0x7a2a18), bone = mat(0xf1e6cf);
  for (let k = 0; k < 18; k++) {
    const d = dirIn(4, 0.75, d => farFromOthers(d, 10) && !nearRoad(d, 6)); if (!d) continue; placedList.push(d);
    const h = rr(6, 16), r = rr(2.5, 5);
    const g = new THREE.Group();
    g.add(S(G.cyl6, rock, r, h, r * 0.9, 0, h / 2 - 1, 0));
    g.add(S(G.cyl6, rock2, r * 1.1, 1, r, 0, h - 1, 0));
    place(g, d, rnd() * 6); addSolid(d, r * 0.95, h - 0.5);
  }
  // bone structures (rib cages)
  for (let k = 0; k < 4; k++) {
    const d = dirIn(4, 0.8, d => farFromOthers(d, 14) && !nearRoad(d, 11)); if (!d) continue; placedList.push(d);
    const g = new THREE.Group();
    { const _o = S(G.cyl, bone, 0.5, 18, 0.5, 0, 1, 0); _o.rotation.x = Math.PI / 2; g.add(_o); }
    for (let j = -3; j <= 3; j++) {
      const rib = mesh(new THREE.TorusGeometry(5 - Math.abs(j) * 0.5, 0.35, 6, 20, Math.PI), bone, 0, 0, j * 2.4); g.add(rib);
    }
    const skull = S(G.sph, bone, 2.6, 2.2, 3, 0, 1.6, 11); g.add(skull);
    g.add(S(G.sph, bmat(0x1a0805), 0.6, 0.6, 0.3, -1, 2.2, 13.5)); g.add(S(G.sph, bmat(0x1a0805), 0.6, 0.6, 0.3, 1, 2.2, 13.5));
    place(g, d, rnd() * 6, -0.3); skeletons.push(g);
    for (let j = -3; j <= 3; j++) { const rr2 = 5 - Math.abs(j) * 0.5; addLocal(g, rr2, j * 2.4, 0.5, rr2 * 0.7); addLocal(g, -rr2, j * 2.4, 0.5, rr2 * 0.7); }
    addBox(g, 0.55, 9, 1.5); addLocal(g, 0, 11, 2.6, 3.8);
    addInspect(surf(d, 1), 'Kaulų statinys', 'Milžiniški kaulai, išsikišę iš raudono smėlio. Bet jie per lygūs ir per tvarkingi – lyg kažkas juos ne užkasė, o pastatė.', 10);
  }
  // underground oases (glowing holes)
  for (let k = 0; k < 3; k++) {
    const d = dirIn(4, 0.8, d => farFromOthers(d, 12)); if (!d) continue; placedList.push(d);
    const g = new THREE.Group();
    g.add(S(G.cyl, bmat(0x0d1a0e), 3, 0.1, 3, 0, 0.05, 0));
    g.add(S(G.cyl, bmat(0x5dff9a, { transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }), 2.6, 0.12, 2.6, 0, 0.1, 0));
    for (let j = 0; j < 8; j++) { const a = j / 8 * Math.PI * 2; const pl = S(G.cone, bmat(0x6dffb0), 0.25, rr(1.2, 2.4), 0.25, Math.cos(a) * 3.4, 0.8, Math.sin(a) * 3.4); g.add(pl); }
    place(g, d, 0, 0.02);
    addInspect(surf(d, 1), 'Požeminė oazė', 'Pro plyšį matosi žalia šviesa. Po raudonu smėliu – didžiulis vandens ežeras, o aplink jį auga augalai, kurie šviečia patys.', 6);
  }
  // dust devils
  const dm = new THREE.MeshBasicMaterial({ color: 0xffb27a, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide });
  for (let k = 0; k < 5; k++) {
    const d = dirIn(4, 0.8); if (!d) continue;
    const g = new THREE.Group();
    for (let j = 0; j < 3; j++) { const c = S(new THREE.ConeGeometry(1, 1, 12, 1, true), dm, 2.4 - j * 0.5, 10 - j * 2, 2.4 - j * 0.5, 0, 5, 0); c.rotation.x = Math.PI; g.add(c); }
    world.add(g); dustDevils.push({ dir: d, mv: tangentToward(d, randDir()), g, sp: rr(2, 4) });
  }
}
function updateCrimson(dt, t) {
  for (const dd of dustDevils) {
    const nd = moveAlong(dd.dir, dd.mv, dd.sp * dt);
    weights(nd.x, nd.y, nd.z, W); if (W[4] < 0.7) { dd.mv.negate(); continue; }
    dd.mv.applyAxisAngle(nd, Math.sin(t * 0.7 + dd.sp) * dt * 0.8).addScaledVector(nd, -dd.mv.dot(nd)).normalize();
    dd.dir.copy(nd); dd.g.position.copy(surf(nd, -0.2)); dd.g.quaternion.setFromUnitVectors(UP, nd); dd.g.rotateY(t * 6);
  }
}

// ---------- 6. Wild Jungle ----------
const birds = [];
function buildJungle() {
  const bark = mat(0x5a3a22), leaves = [0x1f7a2e, 0x2a9a3a, 0x167030, 0x3cb043];
  for (let k = 0; k < 85; k++) {
    const d = dirIn(5, 0.68, d => isLand(d, 0.3) && farFromOthers(d, 4.5)); if (!d) continue; placedList.push(d);
    const g = new THREE.Group(), h = rr(8, 18), s = h / 12;
    g.add(S(G.cyl6, bark, 0.5 * s, h, 0.6 * s, 0, h / 2, 0));
    for (let j = 0; j < 4; j++) g.add(S(G.ico1, mat(pick(leaves)), rr(2.5, 4) * s, rr(1.6, 2.4) * s, rr(2.5, 4) * s, rr(-2, 2) * s, h + rr(-1, 1.5), rr(-2, 2) * s));
    for (let j = 0; j < 3; j++) { const vl = rr(3, 7); g.add(S(G.cyl6, mat(0x2f8a2a), 0.06, vl, 0.06, rr(-2.5, 2.5) * s, h - vl / 2, rr(-2.5, 2.5) * s)); }
    place(g, d, rnd() * 6, -0.3); addSolid(d, 0.6 * s, h);
  }
  const fl = [0xff4fa0, 0xffd23a, 0xff6a3d, 0xc77dff, 0xffffff];
  for (let k = 0; k < 120; k++) {
    const d = dirIn(5, 0.7, d => isLand(d, 0.3)); if (!d) continue;
    const f = new THREE.Group(); f.add(S(G.cyl6, mat(0x2f8a2a), 0.05, 0.8, 0.05, 0, 0.4, 0)); f.add(S(G.ico, mat(pick(fl)), 0.35, 0.2, 0.35, 0, 0.85, 0));
    if (rnd() < 0.4) f.add(S(G.ico1, mat(0x2a9a3a), 1.2, 0.7, 1.2, 0.6, 0.3, 0));
    place(f, d, rnd() * 6);
  }
  // temple
  {
    const d = dirIn(5, 0.92, d => isLand(d, 1) && farFromOthers(d, 18) && !nearRoad(d, 13)) || BC[5]; placedList.push(d);
    const g = new THREE.Group(), st = mat(0x8c9a84), st2 = mat(0x76866e), moss = mat(0x3d8c3a);
    for (let i = 0; i < 5; i++) { const w = 18 - i * 3.4; g.add(S(G.box, i % 2 ? st2 : st, w, 2.4, w, 0, 1.2 + i * 2.4 - 0.6, 0)); }
    g.add(S(G.box, st, 4, 3, 4, 0, 13, 0)); g.add(S(G.box, bmat(0x0a0f08), 1.6, 2.2, 0.1, 0, 12.6, 2.02));
    // stairs up the front: 0.4-high steps on each ledge
    const steps = [];
    for (let i = 0; i < 5; i++) {
      const w = 18 - i * 3.4, top = 1.8 + 2.4 * i, low = i === 0 ? 0.5 : 1.8 + 2.4 * (i - 1), n = Math.ceil((top - low) / 0.4), dep = 1.7 / n;
      for (let k = 0; k < n; k++) {
        const t = top - k * (top - low) / n, z = w / 2 + dep * (k + 0.5);
        g.add(S(G.box, k % 2 ? st : st2, 3, t - low + 0.6, dep, 0, low - 0.6 + (t - low + 0.6) / 2, z)); steps.push([z, dep, t]);
      }
    }
    for (let j = 0; j < 14; j++) g.add(S(G.ico1, moss, rr(0.8, 2), rr(0.5, 1), rr(0.8, 2), rr(-8, 8), rr(1, 10), rr(-8, 8)));
    // sit the temple on the lowest ground around it so the bottom step always meets the terrain
    let minH = TH(d); const t1 = tangentToward(d, randDir()), t2 = new V3().crossVectors(d, t1);
    for (let a = 0; a < 16; a++) for (const rad of [6, 9.5, 12.5]) { const q = moveAlong(d, t1.clone().multiplyScalar(Math.cos(a / 16 * Math.PI * 2)).addScaledVector(t2, Math.sin(a / 16 * Math.PI * 2)).normalize(), rad); minH = Math.min(minH, TH(q)); }
    minH = Math.max(minH, TH(d) - 3);
    place(g, d, rnd() * 6, minH - TH(d) - 0.5);
    for (let i = 0; i < 5; i++) { const w = 18 - i * 3.4; addBox(g, w / 2, w / 2, 1.8 + 2.4 * i); }
    addBox(g, 2, 2, 14.5, 0, 0);
    for (const [z, dep, t] of steps) addBox(g, 1.5, dep / 2, t, 0, z);
    addInspect(surf(d, 1), 'Senovinė šventykla', 'Akmeninė šventykla, kurią beveik prarijo džiunglės. Viršuje – tamsus įėjimas, o ant sienų tas pats aštuonių spindulių ženklas. Šventykla seniai laukia, kol kas nors užlips.', 13);
    addInspect(surf(d, 13), 'Šventyklos viršūnė', 'Tamsoje matosi piešinys: mažas žalias žmogeliukas stovi priešais didžiulę šviesą. Ar tai tu?', 5);
  }
  // waterfall
  {
    const d = dirIn(5, 0.85, d => isLand(d, 0.8) && farFromOthers(d, 14) && !nearRoad(d, 8)); if (d) {
      placedList.push(d);
      const g = new THREE.Group();
      g.add(S(G.box, mat(0x5f6b5a), 12, 14, 5, 0, 6, -2));
      const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d');
      for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.6})`; x.fillRect(Math.random() * 64, Math.random() * 256, 2 + Math.random() * 4, 20 + Math.random() * 50); }
      const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2, 1);
      const fall = mesh(new THREE.PlaneGeometry(6, 13), new THREE.MeshBasicMaterial({ color: 0x8fe0ff, map: tex, transparent: true, opacity: 0.9 }), 0, 6.5, 0.6); g.add(fall);
      g.add(S(G.cyl, mat(0x4fc6e8, { transparent: true, opacity: 0.85 }), 5, 0.3, 4, 0, 0.1, 3.5));
      animators.push((dt) => { tex.offset.y += dt * 1.6; });
      place(g, d, rnd() * 6, -0.3); addBox(g, 6, 2.5, 13, 0, -2);
      addInspect(surf(d, 1), 'Paslėptas krioklys', 'Vanduo krenta iš niekur – uolos viršuje nėra jokios upės. Už vandens sienos girdisi tylus dūzgimas.', 9);
    }
  }
  // birds
  for (let k = 0; k < 10; k++) {
    const g = new THREE.Group(), col = mat(pick([0xff4040, 0x3a7bff, 0xffd23a, 0x3cf2a0]), { side: THREE.DoubleSide });
    g.add(S(G.sph, col, 0.3, 0.25, 0.55));
    const w1 = mesh(new THREE.PlaneGeometry(1.1, 0.5), col, 0.6, 0, 0), w2 = mesh(new THREE.PlaneGeometry(1.1, 0.5), col, -0.6, 0, 0);
    w1.rotation.x = w2.rotation.x = -Math.PI / 2; const p1 = new THREE.Group(), p2 = new THREE.Group(); p1.add(w1); p2.add(w2); g.add(p1, p2);
    world.add(g); birds.push({ g, p1, p2, c: dirNear(BC[5], 25), ph: rnd() * 6, rad: rr(6, 16), h: rr(16, 26), sp: rr(0.4, 0.9) * (rnd() < 0.5 ? 1 : -1) });
  }
}
function updateBirds(dt, t) {
  for (const b of birds) {
    const t1 = tangentToward(b.c, UP.y > 0.9 && Math.abs(b.c.y) > 0.9 ? new V3(1, 0, 0) : UP), t2 = new V3().crossVectors(b.c, t1);
    const a = b.ph + t * b.sp;
    const pos = b.c.clone().multiplyScalar(R + b.h).addScaledVector(t1, Math.cos(a) * b.rad).addScaledVector(t2, Math.sin(a) * b.rad);
    const dir = t1.clone().multiplyScalar(-Math.sin(a) * b.sp).addScaledVector(t2, Math.cos(a) * b.sp).normalize();
    b.g.position.copy(pos); orient(b.g, pos.clone().normalize(), dir);
    const f = Math.sin(t * 12 + b.ph) * 0.6; b.p1.rotation.z = f; b.p2.rotation.z = -f;
  }
}

// ---------- 7. Pixel Realm ----------
const pixelBlink = [], pixelFloat = [], pixelSlide = [], pixelWater = [];
function buildPixel() {
  const cols = [0xff4fd8, 0x30c4ff, 0xffe14d, 0x7a5cff, 0x3cf27a, 0xff7a3d];
  // voxel trees
  for (let k = 0; k < 45; k++) {
    const d = dirIn(6, 0.75, d => farFromOthers(d, 5)); if (!d) continue; placedList.push(d);
    const g = new THREE.Group(), h = 2 + Math.floor(rnd() * 4);
    for (let i = 0; i < h; i++) g.add(S(G.box, mat(0x8a5a2b), 1, 1, 1, 0, i + 0.5, 0));
    const lc = mat(pick([0x2edb5a, 0x22c48a, 0xff4fd8, 0x30c4ff]));
    for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) for (let y = 0; y < 2; y++) if (!(y === 1 && Math.abs(x) + Math.abs(z) === 2)) g.add(S(G.box, lc, 1, 1, 1, x, h + y + 0.5, z));
    place(g, d, Math.floor(rnd() * 4) * Math.PI / 2, -0.1); addSolid(d, 0.6, h);
  }
  // blinking color cubes
  for (let k = 0; k < 30; k++) {
    const d = dirIn(6, 0.75); if (!d) continue;
    const s = pick([1, 1.5, 2]), m = new THREE.MeshLambertMaterial({ color: pick(cols) });
    const c = S(G.box, m, s, s, s, 0, s / 2, 0); const g = new THREE.Group(); g.add(c); place(g, d, 0, -0.05);
    addSolid(d, s * 0.6, s); pixelBlink.push({ m, next: rnd() * 2, cols, c, s });
  }
  // floating stones (platform staircase)
  for (let k = 0; k < 4; k++) {
    const d0 = dirIn(6, 0.85, d => farFromOthers(d, 15)); if (!d0) continue; placedList.push(d0);
    const t = tangentToward(d0, randDir());
    for (let j = 0; j < 7; j++) {
      const d = moveAlong(d0, t, j * 2.6);
      const h = 2 + j * 1.6, base = R + TH(d0) + h;
      const m = S(G.box, mat(pick([0x9a9aa8, 0x7a5cff, 0x30c4ff])), 2.4, 1, 2.4); world.add(m);
      const s = { p: new V3(), up: d.clone(), dir: d.clone(), r: 1.4, top: base + 0.5, thin: true };
      solids.push(s); pixelFloat.push({ d, base, m, s, ph: rnd() * 6 });
    }
    if (k === 0) addInspect(surf(d0, 1), 'Plūduriuojantys akmenys', 'Akmenys kabo ore ir šiek tiek siūbuoja. Fizika čia keista: gali užlipti jais kaip laiptais.', 6);
  }
  // water that flows upward
  for (let k = 0; k < 3; k++) {
    const d = dirIn(6, 0.85, d => farFromOthers(d, 10)); if (!d) continue; placedList.push(d);
    const g = new THREE.Group(); place(g, d);
    g.add(S(G.box, mat(0x2a6fd6), 3, 0.3, 3, 0, 0.15, 0));
    for (let i = 0; i < 12; i++) { const c = S(G.box, mat(0x4fb6ff, { transparent: true, opacity: 0.8 }), 0.9, 0.9, 0.9, rr(-0.8, 0.8), i, rr(-0.8, 0.8)); g.add(c); pixelWater.push(c); }
    addSolid(d, 1.1, 12);
    if (k === 0) addInspect(surf(d, 1), 'Vanduo, tekantis į viršų', 'Kvadratiniai vandens lašai kyla aukštyn ir dingsta ore. Kažkur viršuje turbūt yra kitas ežeras – apverstas.', 6);
  }
  // sliding road
  {
    const d0 = dirIn(6, 0.85, d => farFromOthers(d, 12)); if (d0) {
      placedList.push(d0); const t = tangentToward(d0, randDir()), side = new V3().crossVectors(d0, t);
      for (let j = 0; j < 10; j++) {
        const m = S(G.box, mat(j % 2 ? 0xffe14d : 0x2a2a3a), 2, 0.3, 2); world.add(m);
        pixelSlide.push({ d0, t, side, j, m });
      }
      addInspect(surf(d0, 1), 'Slenkantis kelias', 'Kelias niekada nebūna toje pačioje vietoje. Plytelės šokinėja iš vienos pusės į kitą, lyg nežinotų, kur turėtų vesti.', 8);
    }
  }
  // pixel gates
  for (let k = 0; k < 2; k++) {
    const d = dirIn(6, 0.85, d => farFromOthers(d, 14)); if (!d) continue; placedList.push(d);
    const g = new THREE.Group(), fm = mat(0x3a2a6a);
    for (let y = 0; y < 8; y++) { g.add(S(G.box, fm, 1, 1, 1, -3, y + 0.5, 0)); g.add(S(G.box, fm, 1, 1, 1, 3, y + 0.5, 0)); }
    for (let x = -3; x <= 3; x++) g.add(S(G.box, fm, 1, 1, 1, x, 8.5, 0));
    const c = document.createElement('canvas'); c.width = 10; c.height = 16; const cx = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
    g.add(mesh(new THREE.PlaneGeometry(5, 8), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }), 0, 4, 0));
    let acc = 0;
    animators.push((dt) => { acc += dt; if (acc < 0.12) return; acc = 0; for (let x = 0; x < 10; x++) for (let y = 0; y < 16; y++) { const v = Math.random(); cx.fillStyle = v < 0.5 ? '#000' : v < 0.7 ? '#ff00ff' : v < 0.85 ? '#1a1a1a' : '#00ffff'; cx.fillRect(x, y, 1, 1); } tex.needsUpdate = true; });
    place(g, d, rnd() * 6, -0.1);
    addSolid(g.position.clone().add(new V3(3, 0, 0).applyQuaternion(g.quaternion)).normalize(), 0.7, 9);
    addSolid(g.position.clone().add(new V3(-3, 0, 0).applyQuaternion(g.quaternion)).normalize(), 0.7, 9);
    addInspect(surf(d, 1), 'Pikselių vartai', 'Vartai į nebaigtą pasaulio vietą. Viduje mirga juodi ir rožiniai kvadratai – tekstūros dar neužkrautos. Tai vieta, kurios Kūrėjas dar nespėjo pabaigti.', 7);
  }
}
function updatePixel(dt, t) {
  for (const b of pixelBlink) { b.next -= dt; if (b.next < 0) { b.next = rr(0.6, 2.2); b.m.color.setHex(pick(b.cols)); const s = b.s * pick([0.7, 1, 1.3]); b.c.scale.setScalar(s); b.c.position.y = s / 2; } }
  for (const f of pixelFloat) {
    const top = f.base + Math.round(Math.sin(t * 0.8 + f.ph) * 2) * 0.25;
    f.m.position.copy(f.d).multiplyScalar(top); f.m.quaternion.setFromUnitVectors(UP, f.d);
    f.s.top = top + 0.5; f.s.p.copy(f.d).multiplyScalar(top - 1);
  }
  for (const c of pixelWater) { c.position.y += dt * 2.2; if (c.position.y > 12) c.position.y = 0; c.material.opacity = 0.85 * (1 - c.position.y / 13); }
  const step = Math.floor(t / 0.7);
  for (const s of pixelSlide) {
    const off = (((s.j * 3 + step) % 5) - 2) * 1.2;
    const d = moveAlong(s.d0, s.t, s.j * 2.1 - 9);
    const pos = d.clone().multiplyScalar(R + TH(d) + 0.2).addScaledVector(s.side, off);
    s.m.position.copy(pos); s.m.quaternion.setFromUnitVectors(UP, d);
  }
}

// ---------- clouds ----------
function buildClouds() {
  for (let i = 0; i < NB; i++) for (let k = 0; k < 6; k++) {
    const d = dirIn(i, 0.6); if (!d) continue;
    const col = i === 4 ? 0xffc39a : i === 3 ? 0xf3e0ff : i === 1 ? 0xfff6ea : 0xffffff;
    const g = new THREE.Group();
    for (let j = 0; j < 7; j++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, color: col, transparent: true, depthWrite: false, opacity: rr(0.75, 1), fog: false, toneMapped: false })); s.scale.set(rr(12, 20), rr(7, 11), 1); s.position.set(rr(-8, 8), rr(-1, 2), rr(-6, 6)); g.add(s); }
    g.position.copy(d).multiplyScalar(R + rr(26, 36)); g.quaternion.setFromUnitVectors(UP, d); world.add(g);
    const ax = randDir(), sp = rr(0.004, 0.01);
    animators.push((dt) => { g.position.applyAxisAngle(ax, sp * dt); g.quaternion.setFromUnitVectors(UP, g.position.clone().normalize()); });
  }
}
