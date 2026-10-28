// ================= After the Wind mission: write "aš padėjau visiems dievams, tik ne Žvaigždžių Dievei" → the STAR GODDESS takes you =================
// You live on a GIANT STAR: a big city, a star forest and a star cave. The people are little stars.
// The goddess is a skeleton with long hair, and many little stars fly around her. She has FIVE very hard commandments.
const Q24 = { called: false, met: false, done: 0 };
try { const s = JSON.parse(localStorage.getItem('modly-quest24') || 'null'); if (s) Object.assign(Q24, s); } catch (_) { }
function saveQ24() { try { localStorage.setItem('modly-quest24', JSON.stringify(Q24)); } catch (_) { } }
const inStar = () => { try { return localStorage.getItem('modly-instar') === '1'; } catch (_) { return false; } };
GOD_COL['Žvaigždžių Dievė'] = '#ffe8a0';
function starSaid(txt) { const t = txt.toLowerCase(); return (/(pad[eė]j|i[sš]gelb|pagelb)/.test(t) && (/visiem|vis[iu] diev|[zž]vaig[zž]d/.test(t))) || (/(helped|saved)/.test(t) && /(all|every|star)/.test(t)); }
const starCallOk = txt => starSaid(txt) && typeof Q23 !== 'undefined' && Q23.stage === 'done' && !inStar();
{ const _g = godAnswer; godAnswer = txt => {
    if (starSaid(txt) && typeof Q23 !== 'undefined') {
      if (Q23.stage !== 'done') return [['Vėjo Dievas', 'Fiu? Dar ne visiems! Mano pasaulis vis dar sukasi per greitai…']];
      return [['Žvaigždžių Dievė', 'Taip… Tu padėjai VISIEMS. Visiems, tik ne man. ✨'], ['Žvaigždžių Dievė', 'Aš tavęs laukiau labai seniai. Mano žvaigždutės jau skrenda tavęs pasiimti!'], ['Vėjo Dievas', 'Fiuuu! Tik saugokis – jos įsakymai patys sunkiausi!']];
    }
    if (/[zž]vaig[zž]d|star/.test(txt.toLowerCase())) return [['Žvaigždžių Dievė', '…Mane šaukia? Papasakok grupei, kam tu padėjai. Ir kam – ne.']];
    return _g(txt);
  }; }

// ---------- the pickup: a swarm of little stars ----------
let starPicking = false;
{ const _u = updateWind; updateWind = (dt, t) => { _u(dt, t); if (Q24.called && !inStar() && !starPicking && !mPhoneOpen && !card && !cinema && !transitioning) starPickup(); }; }
function starShapeGeo(ro = 0.5, ri = 0.22, depth = 0.2) {
  const sh = new THREE.Shape(); for (let i = 0; i <= 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? ri : ro; const x = Math.cos(a) * r, y = Math.sin(a) * r; if (i) sh.lineTo(x, y); else sh.moveTo(x, y); }
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: depth * 0.3, bevelSize: ro * 0.06, bevelSegments: 1 }); g.translate(0, 0, -depth / 2); return g;
}
const STAR_GEO = starShapeGeo();
function starPickup() {
  starPicking = true; hideCard(); for (const k in keys) keys[k] = false;
  const pp = player.pos.clone(), swarm = []; let t = 0;
  for (let i = 0; i < 60; i++) { const m = new THREE.Mesh(STAR_GEO, bmat(pick([0xffe14d, 0xffffff, 0xffd0f0, 0xbfe8ff]))); m.scale.setScalar(rr(0.4, 0.9)); m.userData = { a: rr(0, 6.28), r: rr(8, 20), y: rr(10, 30), s: rr(1.5, 3) }; wiScene.add(m); swarm.push(m); }
  toast('✨ Atskrenda žvaigždutės!', 'Žvaigždžių Dievė tavęs laukia', '#ffe8a0');
  [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.4, { type: 'sine', vol: 0.04, when: i * 0.25 }));
  cinema = dt => {
    t += dt;
    for (const m of swarm) { const u = m.userData; u.a += dt * u.s; u.r = Math.max(1.2, u.r - dt * 5); u.y = Math.max(0.5, u.y - dt * 8) + (t > 3 ? (t - 3) * (t - 3) * 2 : 0); m.position.set(pp.x + Math.cos(u.a) * u.r, pp.y + u.y, pp.z + Math.sin(u.a) * u.r); m.rotation.y += dt * 5; }
    if (t > 3) { const k = t - 3; player.pos.set(pp.x, pp.y + k * k * 2, pp.z); player.mesh.position.copy(player.pos); player.mesh.rotation.y += dt * 6; }
    camera.position.lerp(_ct.set(pp.x + 12, pp.y + 5 + Math.max(0, t - 3) * 4, pp.z + 12), Math.min(1, dt * 2)); camera.up.set(0, 1, 0); camera.lookAt(player.pos);
    if (t > 6 && !transitioning) { transitioning = true; redFlash('rgba(255,240,180,.9)', 500); fadeTo(() => { transitioning = false; cinema = null; starPicking = false; swarm.forEach(m => wiScene.remove(m)); enterStar(); }); }
  };
}

// ---------- the giant star ----------
const stScene = new THREE.Scene(); stScene.background = new THREE.Color(0x07041a); stScene.fog = new THREE.Fog(0x1a1030, 90, 320);
stScene.add(new THREE.AmbientLight(0xfff0d0, 0.5)); stScene.add(new THREE.HemisphereLight(0xfff4c0, 0x6a4a20, 0.7));
{ const l = new THREE.DirectionalLight(0xfff0d8, 0.8); l.position.set(-40, 90, 30); stScene.add(l); }
const ST = { built: false, boxes: [], kids: [], goddess: null, orbit: [], hair: [], cave: null };
const ST_RO = 150, ST_RI = 62, ST_POLY = [];
for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? ST_RI : ST_RO; ST_POLY.push([Math.cos(a) * r, Math.sin(a) * r]); }   // point 0 faces -z (behind the goddess)
const armDir = k => { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; return [Math.cos(a), Math.sin(a)]; };   // [x, z] of arm k
function onStar(x, z) { let c = false; for (let i = 0, j = 9; i < 10; j = i++) { const [xi, zi] = ST_POLY[i], [xj, zj] = ST_POLY[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; }
const FOREST_C = (() => { const [x, z] = armDir(1); return new V3(x * 95, 0, z * 95); })();
const CAVE_C = (() => { const [x, z] = armDir(4); return new V3(x * 95, 0, z * 95); })(), CAVE_R = 16;
const UGC = new V3(CAVE_C.x, -220, CAVE_C.z), UGC_R = 30, UGC_H = 14, UGC_EXIT = new V3(CAVE_C.x - 18, -220, CAVE_C.z);
const isUnder = () => player.pos.y < -120;
function winTex(seed) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#1a1440'; x.fillRect(0, 0, 64, 128);
  for (let r = 0; r < 12; r++) for (let k = 0; k < 4; k++) { x.fillStyle = dHash(r + seed * 7, k + seed) < 0.55 ? pick(['#ffe88a', '#fff6d0', '#bfe8ff', '#ffc8f0']) : '#2a2458'; x.fillRect(4 + k * 15, 4 + r * 10, 10, 6); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function makeStarKid() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const col = pick([0xffe14d, 0xfff4c0, 0xffd0f0, 0xbfe8ff, 0xffb84a]);
  const st = new THREE.Mesh(STAR_GEO, mat(col, { emissive: col, emissiveIntensity: 0.45, roughness: 0.4 })); st.scale.setScalar(1.3); st.position.y = 0.95; body.add(st);
  for (const x of [-0.12, 0.12]) { body.add(S(G.sph, bmat(0xffffff), 0.075, 0.09, 0.04, x, 1.05, 0.2)); body.add(S(G.sph, bmat(0x1a1a40), 0.04, 0.05, 0.03, x, 1.05, 0.23)); }
  body.add(mesh(new THREE.TorusGeometry(0.08, 0.02, 5, 10, Math.PI), bmat(0x8a4a00), 0, 0.9, 0.21).rotateZ(Math.PI));
  for (const x of [-0.12, 0.12]) { body.add(S(G.sph, bmat(0xff9ab0, { transparent: true, opacity: 0.6 }), 0.05, 0.03, 0.02, x * 1.6, 0.93, 0.2)); }
  const legs = []; for (const x of [-0.13, 0.13]) { const l = new THREE.Group(); l.position.set(x, 0.55, 0); g.add(l); l.add(S(G.cyl, mat(col), 0.04, 0.4, 0.04, 0, -0.2, 0)); l.add(S(G.sph, mat(0xffffff), 0.08, 0.05, 0.11, 0, -0.42, 0.03)); legs.push(l); }
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: col, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(2.2); gl.position.y = 0.95; g.add(gl);
  g.userData = { body, legs, glow: gl }; return g;
}
const STARKID_LINES = {
  city: ['Sveikas Žvaigždžių mieste! Čia viskas šviečia – net naktį, nes naktis čia niekada nebūna tamsi!', 'Aš gyvenu tame aukštame name su žvaigždute ant stogo. Kiekvieną vakarą ji šypsosi.', 'Mūsų Dievė atrodo kaip skeletas… bet ji labai gera! Jos plaukai švyti kaip Paukščių Takas.', 'Ar žinai, kad mes, žvaigždutės, gimstame kaip kibirkštėlės? Paskui užaugam ir šviečiam!', 'Dievė turi PENKIS įsakymus. Visi sako, kad jie neįmanomai sunkūs… Brr!', 'Dzin-dzin! Mūsų mieste niekas nevaikšto lėtai – visi šokinėja!'],
  forest: ['Žvaigždžių miške medžiai auga iš šviesos. Lapai – kaip kristalai!', 'Šie vaisiai – mažos žvaigždutės. Jei pakratysi medį, jos pabyra! …Nekratyk, prašau.', 'Miške labai tylu. Girdi? Medžiai skamba kaip varpeliai.', 'Aš čia pasiklydau prieš šimtą metų. Bet man patinka!'],
  cave: ['Žvaigždžių urve gyvena patys seniausi kristalai. Jie prisimena visas istorijas.', 'Ššš… Urve reikia kalbėti tyliai, kitaip kristalai pabunda.', 'Kažkas giliai urve… Dievė sako, kad ten prasideda vienas iš jos įsakymų. Bet aš bijau eiti.', 'Čia tamsiau nei visur kitur. Todėl mes šviečiam dar stipriau!']
};
function buildStar() {
  if (ST.built) return; ST.built = true;
  // space all around
  { const sv = [], cv = []; for (let i = 0; i < 1600; i++) { const v = randDir().multiplyScalar(rr(380, 520)); sv.push(v.x, v.y, v.z); const c = new THREE.Color(pick([0xffffff, 0xffe8a0, 0xbfd8ff, 0xffc8e8])); cv.push(c.r, c.g, c.b); } const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3)); sg.setAttribute('color', new THREE.Float32BufferAttribute(cv, 3)); stScene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 2, vertexColors: true, fog: false }))); }
  for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: pick([0x8a3aff, 0x3a6aff, 0xff3ab0, 0x3affd8]), transparent: true, opacity: 0.22, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); s.position.copy(randDir().multiplyScalar(400)); s.scale.setScalar(rr(150, 300)); stScene.add(s); }
  // the giant star: a thick 5-pointed slab of glowing gold
  { const sh = new THREE.Shape(); ST_POLY.forEach(([x, z], i) => i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)); const geo = new THREE.ExtrudeGeometry(sh, { depth: 30, bevelEnabled: true, bevelThickness: 6, bevelSize: 6, bevelSegments: 3 }); geo.rotateX(-Math.PI / 2); geo.translate(0, -36, 0);
    const m = new THREE.Mesh(geo, mat(0xffc83a, { emissive: 0x8a5a00, emissiveIntensity: 0.6, roughness: 0.55 })); stScene.add(m);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffb020, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })); glow.position.set(0, -60, 0); glow.scale.setScalar(520); stScene.add(glow); }
  // little glowing sparkles on the ground
  { const pv = []; for (let i = 0; i < 1200; i++) { const x = rr(-140, 140), z = rr(-140, 140); if (onStar(x, z)) pv.push(x, 0.05, z); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pv, 3)); stScene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.35, color: 0xfff6d0 }))); }
  // ---- the big city in the middle ----
  const wins = [0, 1, 2, 3, 4].map(winTex);
  for (let gx = -54; gx <= 54; gx += 13) for (let gz = -54; gz <= 54; gz += 13) {
    const x = gx + rr(-1.5, 1.5), z = gz + rr(-1.5, 1.5), d = Math.hypot(x, z);
    if (d < 22 || Math.abs(gx) < 6 || Math.abs(gz) < 6 || d > 62 || !onStar(x, z) || rnd() < 0.15) continue;
    const w = rr(6, 9), dp = rr(6, 9), h = rr(10, 34) * (1 - d / 120), tex = pick(wins).clone(); tex.needsUpdate = true; tex.repeat.set(Math.round(w / 3), Math.round(h / 6));
    const col = pick([0x3a2a7a, 0x2a3a8a, 0x5a2a6a, 0x2a2a5a]);
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, dp), new THREE.MeshStandardMaterial({ color: col, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.9, roughness: 0.6 })); b.position.set(x, h / 2, z); stScene.add(b);
    stScene.add(S(G.box, mat(0xffd84a, { emissive: 0x6a4a00 }), w + 0.3, 0.4, dp + 0.3, x, h + 0.2, z));
    const top = new THREE.Mesh(STAR_GEO, mat(0xffe14d, { emissive: 0xffc800, emissiveIntensity: 0.8 })); top.scale.setScalar(rr(2, 3.5)); top.position.set(x, h + 2.2, z); stScene.add(top); ST.orbit.push({ m: top, spin: rr(0.5, 1.5) });
    ST.boxes.push({ x, z, hx: w / 2, hz: dp / 2, h: h + 0.4 });
  }
  // street lamps with stars along the two main streets
  for (let i = -60; i <= 60; i += 10) for (const [x, z] of [[4.5, i], [-4.5, i], [i, 4.5], [i, -4.5]]) { if (Math.hypot(x, z) < 20 || !onStar(x, z)) continue; stScene.add(S(G.cyl, mat(0x4a4a6a), 0.08, 3, 0.08, x, 1.5, z)); const s = new THREE.Mesh(STAR_GEO, bmat(0xfff0a0)); s.position.set(x, 3.2, z); stScene.add(s); ST.orbit.push({ m: s, spin: 1 }); }
  for (const [w, d, x, z] of [[7, 130, 0, 0], [130, 7, 0, 0]]) stScene.add(S(G.box, mat(0x6a4a2a, { emissive: 0x2a1a00 }), w, 0.06, d, x, 0.03, z));
  // ---- the star forest ----
  for (let i = 0; i < 70; i++) {
    const a = rr(0, 6.28), r = Math.sqrt(rnd()) * 34, x = FOREST_C.x + Math.cos(a) * r, z = FOREST_C.z + Math.sin(a) * r; if (!onStar(x, z)) continue;
    const h = rr(5, 11), lc = pick([0x5affd8, 0xff8ae0, 0x9a8aff, 0x8affa0]);
    stScene.add(S(G.cyl6, mat(0xd8c8f0, { emissive: 0x4a3a6a }), 0.3, h, 0.3, x, h / 2, z));
    for (let k = 0; k < 3; k++) { const c = S(G.cone, mat(lc, { transparent: true, opacity: 0.8, emissive: lc, emissiveIntensity: 0.5 }), 2.4 - k * 0.6, 2.4, 2.4 - k * 0.6, x, h - 1 + k * 1.3, z); stScene.add(c); }
    for (let k = 0; k < 3; k++) { const f = new THREE.Mesh(STAR_GEO, bmat(0xffe88a)); f.scale.setScalar(0.5); f.position.set(x + rr(-1.6, 1.6), h - 1.6 + rr(-0.5, 0.8), z + rr(-1.6, 1.6)); stScene.add(f); ST.orbit.push({ m: f, spin: rr(1, 2) }); }
    ST.boxes.push({ x, z, hx: 0.4, hz: 0.4, h: h - 1 });
  }
  { const s = makeSign('Žvaigždžių miškas'); s.position.set(FOREST_C.x * 0.62, 0, FOREST_C.z * 0.62); s.scale.setScalar(2); stScene.add(s); }
  // ---- the star cave: only an entrance up here – the cave itself is deep UNDER the ground ----
  { const g = new THREE.Group(); g.position.copy(CAVE_C); stScene.add(g);
    g.add(mesh(new THREE.CircleGeometry(3.6, 28), new THREE.MeshBasicMaterial({ color: 0x05030a }), 0, 0.04, 0).rotateX(-Math.PI / 2));
    for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, s2 = rr(1.2, 2.2); g.add(S(G.dodec, mat(0x5a4a6a, { roughness: 1 }), s2, s2 * 0.7, s2, Math.cos(a) * 4.6, 0.3, Math.sin(a) * 4.6)); }
    for (let i = 0; i < 5; i++) g.add(S(G.box, mat(0x6a5a7a, { roughness: 1 }), 2.2, 0.2, 0.9, 0, -0.3 - i * 0.45, -2.2 + i * 0.9));   // steps going down
    const sign = makeSign('Žvaigždžių urvas'); sign.position.set(-6, 0, 0); sign.scale.setScalar(2); sign.rotation.y = Math.atan2(-CAVE_C.x, -CAVE_C.z) * 0 + 0.3; g.add(sign);
  }
  buildUnderCave();
  // ---- the Star Goddess: a skeleton with long glowing hair, little stars orbiting her ----
  { const g = new THREE.Group(); g.position.set(0, 0, 0); stScene.add(g); ST.goddess = g;
    // her throne: a floating crescent of light
    g.add(S(G.cyl, mat(0xfff0c0, { emissive: 0xc8a040 }), 7, 1.2, 7, 0, 0.6, 0)); for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(STAR_GEO, mat(0xffe14d, { emissive: 0xffc800 })); const a = i / 5 * Math.PI * 2; s.scale.setScalar(2); s.position.set(Math.cos(a) * 6.2, 1.6, Math.sin(a) * 6.2); g.add(s); ST.orbit.push({ m: s, spin: 0.8 }); }
    ST.boxes.push({ x: 0, z: 0, hx: 4.6, hz: 4.6, h: 1.2 });
    const body = new THREE.Group(); body.position.y = 1.3; body.scale.setScalar(2.8); g.add(body); ST.gBody = body;
    const bone = mat(0xf4eedc, { roughness: 0.6, emissive: 0x2a2418 });
    const head = new THREE.Group(); head.position.set(0, 2.15, 0); body.add(head); ST.gHead = head;
    head.add(S(G.sph, bone, 0.42, 0.46, 0.42)); head.add(S(G.box, bone, 0.32, 0.14, 0.26, 0, -0.32, 0.08));
    for (const x of [-0.15, 0.15]) { head.add(S(G.sph, bmat(0x1a1428), 0.12, 0.13, 0.06, x, 0.03, 0.37)); head.add(S(G.sph, bmat(0x9af0ff), 0.045, 0.045, 0.03, x, 0.03, 0.42)); }
    head.add(S(G.cone, bmat(0x1a1428), 0.05, 0.08, 0.03, 0, -0.1, 0.41).rotateX(Math.PI));
    for (let i = 0; i < 6; i++) head.add(S(G.box, mat(0xffffff), 0.035, 0.05, 0.02, -0.1 + i * 0.04, -0.24, 0.38));
    // a crown of tiny stars
    for (let i = 0; i < 7; i++) { const a = -0.9 + i * 0.3, s = new THREE.Mesh(STAR_GEO, bmat(0xffe14d)); s.scale.setScalar(0.22); s.position.set(Math.sin(a) * 0.36, 0.42 + Math.cos(a) * 0.05, Math.cos(a) * 0.2); head.add(s); }
    // long, glowing, starry hair
    const hairM = mat(0xcfe0ff, { emissive: 0x5a6aaa, emissiveIntensity: 0.8, roughness: 0.4 });
    for (let i = 0; i < 26; i++) { const a = -1.9 + (i / 25) * 3.8, st = new THREE.Group(); st.position.set(Math.sin(a) * 0.38, 0.24, -Math.cos(a) * 0.38); head.add(st);
      const L = rr(1.4, 2.1); st.add(S(G.cyl, hairM, 0.05, L, 0.05, 0, -L / 2, 0)); st.add(S(G.sph, hairM, 0.07, 0.12, 0.07, 0, -L, 0)); if (i % 4 === 0) { const sp = new THREE.Mesh(STAR_GEO, bmat(0xffffff)); sp.scale.setScalar(0.12); sp.position.y = -L * rr(0.3, 0.9); st.add(sp); }
      st.rotation.x = 0.12 + Math.cos(a) * 0.12; st.rotation.z = -Math.sin(a) * 0.12; ST.hair.push({ g: st, ph: i * 0.4, base: st.rotation.x }); }
    // spine, ribs, pelvis
    for (let i = 0; i < 9; i++) body.add(S(G.cyl, bone, 0.055, 0.07, 0.055, 0, 1.78 - i * 0.085, -0.04));
    for (let i = 0; i < 4; i++) { const r = 0.24 - i * 0.025, rib = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 6, 18, Math.PI * 1.6), bone); rib.rotation.x = Math.PI / 2; rib.rotation.z = Math.PI / 2 + Math.PI * 0.2; rib.position.set(0, 1.66 - i * 0.1, 0.02); body.add(rib); }
    body.add(S(G.sph, bone, 0.26, 0.12, 0.16, 0, 1.0, 0)); body.add(S(G.box, bone, 0.6, 0.05, 0.05, 0, 1.75, 0));
    // arms: one waving with a star wand, one on the hip
    ST.gArmR = new THREE.Group(); ST.gArmR.position.set(0.3, 1.74, 0); body.add(ST.gArmR);
    limb(ST.gArmR, bone, new V3(0, 0, 0), new V3(0.25, 0.35, 0.1), 0.035); limb(ST.gArmR, bone, new V3(0.25, 0.35, 0.1), new V3(0.3, 0.75, 0.15), 0.03); ST.gArmR.add(S(G.sph, bone, 0.06, 0.06, 0.06, 0.25, 0.35, 0.1));
    ST.gArmR.add(S(G.sph, bone, 0.07, 0.08, 0.05, 0.3, 0.8, 0.15)); limb(ST.gArmR, mat(0xffe14d), new V3(0.3, 0.75, 0.18), new V3(0.34, 1.25, 0.2), 0.02); { const w = new THREE.Mesh(STAR_GEO, bmat(0xffe14d)); w.scale.setScalar(0.4); w.position.set(0.35, 1.32, 0.2); ST.gArmR.add(w); ST.wand = w; }
    const armL = new THREE.Group(); armL.position.set(-0.3, 1.74, 0); body.add(armL);
    limb(armL, bone, new V3(0, 0, 0), new V3(-0.2, -0.35, 0), 0.035); limb(armL, bone, new V3(-0.2, -0.35, 0), new V3(-0.05, -0.65, 0.12), 0.03); armL.add(S(G.sph, bone, 0.06, 0.06, 0.06, -0.2, -0.35, 0)); armL.add(S(G.sph, bone, 0.07, 0.08, 0.05, -0.05, -0.68, 0.12));
    // legs (she floats a little above her throne)
    for (const x of [-0.14, 0.14]) { limb(body, bone, new V3(x, 0.98, 0), new V3(x * 1.2, 0.52, 0.05), 0.04); limb(body, bone, new V3(x * 1.2, 0.52, 0.05), new V3(x * 1.2, 0.1, 0), 0.035); body.add(S(G.sph, bone, 0.06, 0.06, 0.06, x * 1.2, 0.52, 0.05)); body.add(S(G.box, bone, 0.1, 0.05, 0.22, x * 1.2, 0.06, 0.06)); }
    // the little stars flying around her
    ST.swarm = []; for (let i = 0; i < 46; i++) { const m = new THREE.Mesh(STAR_GEO, bmat(pick([0xffe14d, 0xffffff, 0xffd0f0, 0xbfe8ff]))); m.scale.setScalar(rr(0.5, 1.1)); g.add(m); ST.swarm.push({ m, a: rr(0, 6.28), r: rr(5, 9), y: rr(3, 10), s: rr(0.4, 1.1) * (rnd() < 0.5 ? 1 : -1), tilt: rr(-0.5, 0.5) }); }
    const sign = mesh(new THREE.PlaneGeometry(9, 1.5), new THREE.MeshBasicMaterial({ map: labelTex('ŽVAIGŽDŽIŲ DIEVĖ', '#2a1a5a', '#ffe14d', 640, 110), side: THREE.DoubleSide }), 0, 1.6, 8.5); g.add(sign);
    // the board of her five commandments
    ST.board = mesh(new THREE.PlaneGeometry(6, 7), new THREE.MeshBasicMaterial({ map: boardTex(), side: THREE.DoubleSide }), -12, 4.2, 4); ST.board.rotation.y = 0.5; g.add(ST.board); g.add(S(G.box, mat(0x6a4a2a), 0.3, 1, 0.3, -12, 0.5, 4)); ST.boxes.push({ x: -12, z: 4, hx: 2.6, hz: 0.6, h: 7.7 });
  }
  buildStarKids();
  linearize(stScene);
}
function boardTex() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 600; const x = c.getContext('2d');
  x.fillStyle = '#1a1040'; x.fillRect(0, 0, 512, 600); x.strokeStyle = '#ffe14d'; x.lineWidth = 10; x.strokeRect(8, 8, 496, 584);
  x.fillStyle = '#ffe14d'; x.font = 'bold 44px sans-serif'; x.textAlign = 'center'; x.fillText('★ 5 ĮSAKYMAI ★', 256, 70); x.font = '24px sans-serif'; x.fillStyle = '#c8b8ff'; x.fillText('Žvaigždžių Dievės – patys sunkiausi', 256, 108);
  x.textAlign = 'left'; x.font = 'bold 34px sans-serif'; for (let i = 0; i < 5; i++) { const done = Q24.done > i; x.fillStyle = done ? '#7dff6b' : '#ffffff'; x.fillText(`${i + 1}.  ${done ? 'Įvykdyta ✔' : '? ? ? ? ?'}`, 60, 180 + i * 80); }
  return new THREE.CanvasTexture(c);
}
function buildStarKids() {
  const zones = [['city', 0, 0, 58, 22], ['forest', FOREST_C.x, FOREST_C.z, 30, 12]];
  for (const [zone, cx, cz, R, n] of zones) for (let i = 0; i < n; i++) {
    const m = makeStarKid(); stScene.add(m); const k = { m, zone, cx, cz, R, tgt: new V3(), t: rr(0, 2), hop: 0, ph: rr(0, 6.28), line: pick(STARKID_LINES[zone]) };
    starKidSpot(k, m.position); k.tgt.copy(m.position); ST.kids.push(k);
  }
}
function starKidSpot(k, out) { for (let i = 0; i < 30; i++) { const a = rr(0, 6.28), r = Math.sqrt(rnd()) * k.R; out.set(k.cx + Math.cos(a) * r, 0, k.cz + Math.sin(a) * r); if (onStar(out.x, out.z) && !starHit(out.x, out.z, 0.8) && (k.zone !== 'city' || Math.hypot(out.x, out.z) > 9)) return out; } return out; }
function starHit(x, z, rad) { for (const b of ST.boxes) if (Math.abs(x - b.x) < b.hx + rad && Math.abs(z - b.z) < b.hz + rad) return true; return false; }
function nearStarKid() { let best = null, bd = 2.6; for (const k of ST.kids) { const d = Math.hypot(k.m.position.x - player.pos.x, k.m.position.z - player.pos.z); if (d < bd && Math.abs(player.pos.y - k.m.position.y) < 3) { bd = d; best = k; } } return best; }
function updateStarKids(dt, t) {
  for (const k of ST.kids) {
    const near = Math.hypot(k.m.position.x - player.pos.x, k.m.position.z - player.pos.z) < 3;
    k.t -= dt; k.hop = Math.max(0, k.hop - dt * 1.5);
    if (k.t < 0 && !near) { k.t = rr(1, 4); starKidSpot(k, k.tgt); }
    const d = k.tgt.clone().sub(k.m.position); d.y = 0; let moving = false;
    if (!near && d.length() > 0.2) { k.m.position.addScaledVector(d.normalize(), Math.min(d.length(), dt * 2.6)); k.m.rotation.y = Math.atan2(d.x, d.z); moving = true; }
    else if (near) k.m.rotation.y = Math.atan2(player.pos.x - k.m.position.x, player.pos.z - k.m.position.z);
    const hopY = moving ? Math.abs(Math.sin(t * 9 + k.ph)) * 0.35 : Math.abs(Math.sin(t * 3 + k.ph)) * 0.08;
    k.m.position.y = hopY + Math.sin(k.hop * Math.PI) * 1.3; k.m.userData.body.rotation.z = Math.sin(t * 4 + k.ph) * 0.12;
    const u = k.m.userData; u.legs[0].rotation.x = moving ? Math.sin(t * 18 + k.ph) * 0.6 : 0; u.legs[1].rotation.x = -u.legs[0].rotation.x;
    u.glow.material.opacity = 0.3 + 0.2 * Math.abs(Math.sin(t * 2 + k.ph));
  }
}
function enterStar() {
  buildStar(); mode = 'star'; stScene.add(player.mesh); player.mesh.visible = true; musicSet(3); setScope(false);
  try { localStorage.setItem('modly-instar', '1'); localStorage.removeItem('modly-pos'); } catch (_) { }
  starSpawn(); camera.position.set(0, 7, 40); camera.up.set(0, 1, 0);
  $('bName').textContent = 'Žvaigždė'; $('bEn').textContent = 'Žvaigždžių Dievės namai'; $('bAtm').textContent = 'Milžiniška žvaigždė: didelis miestas, Žvaigždžių miškas ir urvas. Čia gyvena mažos žvaigždutės.'; document.documentElement.style.setProperty('--biome', '#ffe8a0');
  setTimeout(() => toast('Tu ant MILŽINIŠKOS ŽVAIGŽDĖS!', 'Žvaigždžių Dievė laukia miesto viduryje (E)', '#ffe8a0'), 600);
}
const nearCaveHole = () => !isUnder() && Math.hypot(player.pos.x - CAVE_C.x, player.pos.z - CAVE_C.z) < 5 && player.pos.y < 3;
const nearCaveExit = () => isUnder() && Math.hypot(player.pos.x - UGC_EXIT.x, player.pos.z - UGC_EXIT.z) < 3.5;
function caveGo(down) {
  if (transitioning) return; transitioning = true; noiseHit(0.5, { ft: 'lowpass', f: 400, vol: 0.12 });
  fadeTo(() => { transitioning = false;
    if (down) { player.pos.set(UGC_EXIT.x + 2.5, UGC.y, UGC_EXIT.z); player.fwd.set(1, 0, 0); $('bName').textContent = 'Žvaigždžių urvas'; $('bAtm').textContent = 'Giliai po žvaigžde. Tamsu, tylu – nė vienos žvaigždutės. Tik kristalai ir akmenys.'; toast('Žvaigždžių urvas', 'Giliai po žeme. Čia nėra nė vienos žvaigždutės…', '#9a8aff'); }
    else { const d = new V3(-CAVE_C.x, 0, -CAVE_C.z).normalize(); player.pos.set(CAVE_C.x + d.x * 6.5, 0, CAVE_C.z + d.z * 6.5); player.fwd.copy(d); $('bName').textContent = 'Žvaigždė'; $('bAtm').textContent = 'Milžiniška žvaigždė: didelis miestas, Žvaigždžių miškas ir urvas. Čia gyvena mažos žvaigždutės.'; }
    player.vel.set(0, 0, 0); player.vr = 0; player.grounded = true; camera.position.copy(player.pos).addScaledVector(player.fwd, -5).add(new V3(0, 3, 0)); });
}
// the cave deep under the star: dark stone, glowing crystals, an underground lake – and not a single star
function buildUnderCave() {
  ST.ugBoxes = []; const g = new THREE.Group(); g.position.copy(UGC); stScene.add(g);
  const rock = mat(0x2a2232, { roughness: 1, side: THREE.BackSide }), rock2 = mat(0x3a3042, { roughness: 1 });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(UGC_R, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), rock); shell.scale.y = UGC_H / UGC_R; g.add(shell);
  { const pos = shell.geometry.attributes.position; for (let i = 0; i < pos.count; i++) { const k = 1 + (dHash(i, 3) - 0.5) * 0.12; pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k, pos.getZ(i) * k); } shell.geometry.computeVertexNormals(); }
  g.add(mesh(new THREE.CircleGeometry(UGC_R + 1, 48), mat(0x241c2a, { roughness: 1 }), 0, 0, 0).rotateX(-Math.PI / 2));
  // rocks and stalagmites on the floor, stalactites from the ceiling
  for (let i = 0; i < 26; i++) { const a = rr(0, 6.28), r = rr(6, UGC_R - 4), x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x - (UGC_EXIT.x - UGC.x), z) < 6) continue; const h = rr(1.5, 5); g.add(S(G.cone, rock2, rr(0.6, 1.2), h, rr(0.6, 1.2), x, h / 2, z)); ST.ugBoxes.push({ x: UGC.x + x, z: UGC.z + z, hx: 0.6, hz: 0.6, h: UGC.y + h }); }
  for (let i = 0; i < 40; i++) { const a = rr(0, 6.28), r = rr(2, UGC_R - 3), x = Math.cos(a) * r, z = Math.sin(a) * r, top = UGC_H * Math.sqrt(Math.max(0, 1 - (r / UGC_R) ** 2)), h = rr(1, 3.5); const st = S(G.cone, rock2, rr(0.3, 0.7), h, rr(0.3, 0.7), x, top - h / 2, z); st.rotation.x = Math.PI; g.add(st); }
  for (let i = 0; i < 16; i++) { const a = rr(0, 6.28), r = rr(5, UGC_R - 4), s2 = rr(1, 2.4); g.add(S(G.dodec, rock2, s2, s2 * 0.6, s2, Math.cos(a) * r, s2 * 0.3, Math.sin(a) * r)); }
  // glowing crystals (plain crystals – no stars down here)
  for (let i = 0; i < 22; i++) { const a = rr(0, 6.28), r = rr(UGC_R - 9, UGC_R - 4), c = pick([0x5affff, 0x9a6aff, 0x3affa0]); for (let k = 0; k < 3; k++) { const cr = S(G.cone, mat(c, { emissive: c, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 }), rr(0.25, 0.5), rr(1.2, 3), rr(0.25, 0.5), Math.cos(a) * r + rr(-0.6, 0.6), 0.8, Math.sin(a) * r + rr(-0.6, 0.6)); cr.rotation.set(rr(-0.5, 0.5), 0, rr(-0.5, 0.5)); g.add(cr); } }
  // an underground lake
  g.add(S(G.cyl, mat(0x1a3a6a, { emissive: 0x0a1a3a, transparent: true, opacity: 0.85, roughness: 0.1, metalness: 0.3 }), 7, 0.1, 5, 8, 0.06, 6));
  // glowing mushrooms
  for (let i = 0; i < 14; i++) { const a = rr(0, 6.28), r = rr(4, UGC_R - 6), x = Math.cos(a) * r, z = Math.sin(a) * r, s2 = rr(0.3, 0.7); g.add(S(G.cyl, mat(0xd8d0c0), 0.08 * s2 * 3, s2 * 1.4, 0.08 * s2 * 3, x, s2 * 0.7, z)); g.add(S(G.dome, mat(0x5affd8, { emissive: 0x2aa088 }), s2, s2 * 0.6, s2, x, s2 * 1.4, z)); }
  for (const [x, z, c] of [[0, 0, 0x9a8aff], [12, 8, 0x5affff], [-10, -10, 0x3affa0]]) { const pl = new THREE.PointLight(c, 1.2, 28); pl.position.set(x, 7, z); g.add(pl); }
  // the way out: a beam of light from a hole above and a rope ladder
  const ex = UGC_EXIT.x - UGC.x; g.add(S(G.cyl, bmat(0xfff0c0, { transparent: true, opacity: 0.18, depthWrite: false }), 2.4, UGC_H, 2.4, ex, UGC_H / 2, 0));
  for (const zz of [-0.5, 0.5]) g.add(S(G.cyl, mat(0x8a6a3a), 0.05, UGC_H, 0.05, ex, UGC_H / 2, zz)); for (let k = 0; k < 18; k++) g.add(S(G.box, mat(0x8a6a3a), 0.08, 0.08, 1.1, ex, 0.5 + k * 0.75, 0));
}
function starSpawn() { player.pos.set(0, 0, 30); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.pitch = 0.25; player.up.set(0, 1, 0); player.grounded = true; }
const nearStarGoddess = () => Math.hypot(player.pos.x, player.pos.z) < 11;
function starHand(side) { hands[side].hold = true; const k = nearStarKid(); if (k) { k.hop = 1; bubbleIn(stScene, k.m.position.clone().add(new V3(0, 0.6, 0)), pick(['Dzin!', 'Cha!', '✨', 'Dar!']), 2.4); tone(rr(1200, 1800), 0.08, { type: 'sine', vol: 0.04 }); } }
function starAction() {
  if (card) { if (card.kind === 'talk') advanceTalk(); else hideCard(); return; }
  { const k = nearStarKid(); if (k) { k.hop = 1; startTalk('Žvaigždutė', [k.line], '#ffe14d'); return; } }
  if (nearCaveHole()) { caveGo(true); return; }
  if (nearCaveExit()) { caveGo(false); return; }
  if (nearStarGoddess()) {
    if (Q24.met) { startTalk('Žvaigždžių Dievė', [pick(['Mano penki įsakymai laukia. Jie sunkūs… bet tu – ypatingas.', 'Nebijok mano kaulų, mažasis. Aš esu tokia pat sena kaip pačios žvaigždės.', 'Ar jau buvai mano urve? Ir miške? Viskas čia šviečia mano šviesa.', 'Mano žvaigždutės skraido aplink mane, nes joms šilta prie manęs.'])], '#ffe8a0'); return; }
    startTalk('Žvaigždžių Dievė', ['Pagaliau… Sveikas ant mano MILŽINIŠKOS ŽVAIGŽDĖS, žaliasis.', 'Taip, aš – skeletas. Esu tokia sena, kaip pačios žvaigždės. Bet mano plaukai vis dar švyti – kaip Paukščių Takas.', 'Tu padėjai visiems dievams: Kūrėjui, Jūrų Dievui, Saulės Dievei, Laiko Dievui, Griaustinio Dievui ir Vėjo Dievui. Visiems, tik ne man.', 'Čia, ant mano žvaigždės, yra didelis miestas, Žvaigždžių miškas ir Žvaigždžių urvas. O gyvena čia mažos žvaigždutės – mano vaikai.', 'Aš turiu PENKIS įsakymus. Jie patys sunkiausi visuose pasauliuose. Ne visi didvyriai juos įvykdo…', 'Bet pirma – apsižvalgyk. Kai būsi pasiruošęs, ateik pas mane. ✨'], '#ffe8a0', () => { Q24.met = true; saveQ24(); });
    return;
  }
  if (Math.hypot(player.pos.x + 12, player.pos.z - 4) < 5) { startTalk('5 įsakymų lenta', [`Įvykdyta: ${Q24.done} iš 5. Žvaigždžių Dievės įsakymai – patys sunkiausi.`], '#ffe14d'); return; }
}
function updateStar(dt, t) {
  const f = player.down ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = player.down ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 11 : 6.5; _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, Math.min(1, (player.grounded ? 10 : 3) * dt));
  if (keys.Space && player.grounded && Q8.back !== 'jetpack') { player.vr = 9; player.grounded = false; sfx.jump(); }
  if (!player.down) flatJetpack(dt);
  player.vr -= 20 * dt; player.vr = Math.max(player.vr, -40); player.pos.addScaledVector(player.vel, dt); player.pos.y += player.vr * dt;
  if (!isFinite(player.pos.x) || !isFinite(player.pos.y) || !isFinite(player.pos.z)) { player.vel.set(0, 0, 0); player.vr = 0; starSpawn(); }
  const under = isUnder(); let ground = under ? UGC.y : onStar(player.pos.x, player.pos.z) ? 0 : -1e9; const rad = 0.4;
  for (const b of under ? ST.ugBoxes : ST.boxes) { const dx = player.pos.x - b.x, dz = player.pos.z - b.z, ex = b.hx + rad - Math.abs(dx), ez = b.hz + rad - Math.abs(dz); if (ex <= 0 || ez <= 0) continue; if (player.pos.y >= b.h - 0.6) { if (b.h > ground) ground = b.h; } else if (!b.top) { if (ex < ez) player.pos.x += dx < 0 ? -ex : ex; else player.pos.z += dz < 0 ? -ez : ez; } }
  // under the ground: the cave walls and the low rocky ceiling
  if (under) { const dx = player.pos.x - UGC.x, dz = player.pos.z - UGC.z, d = Math.hypot(dx, dz); if (d > UGC_R - 3) { const k = (UGC_R - 3) / d; player.pos.x = UGC.x + dx * k; player.pos.z = UGC.z + dz * k; }
    const roof = UGC.y + UGC_H * Math.sqrt(Math.max(0, 1 - (Math.min(d, UGC_R - 3) / UGC_R) ** 2)) - 2.2; if (player.pos.y > roof) { player.pos.y = roof; player.vr = Math.min(0, player.vr); } }
  if (player.pos.y <= ground) { player.pos.y = ground; if (player.vr < 0) player.vr = 0; player.grounded = true; } else player.grounded = false;
  if (!under && player.pos.y < -50) { starSpawn(); toast('Oi! Nukritai nuo žvaigždės!', 'Žvaigždutės tave pagavo ir parnešė atgal', '#ffe8a0'); }
  if (player.pos.y > 160) { player.pos.y = 160; player.vr = Math.min(0, player.vr); }
  player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd);
  animateMan(dt, f !== 0 || s !== 0, sp);
  const dist = 6.4, pitch = player.pitch;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
  if (under) { const dx = _ct.x - UGC.x, dz = _ct.z - UGC.z, d = Math.hypot(dx, dz); if (d > UGC_R - 3) { const k = (UGC_R - 3) / d; _ct.x = UGC.x + dx * k; _ct.z = UGC.z + dz * k; } const dd = Math.min(Math.hypot(_ct.x - UGC.x, _ct.z - UGC.z), UGC_R - 3); _ct.y = clamp(_ct.y, UGC.y + 0.6, UGC.y + UGC_H * Math.sqrt(Math.max(0, 1 - (dd / UGC_R) ** 2)) - 1.2); }
  if (!under && _ct.y < 0.5 && onStar(_ct.x, _ct.z)) _ct.y = 0.5;
  camera.position.lerp(_ct, Math.min(1, dt * 8)); camera.up.set(0, 1, 0); camera.lookAt(player.pos.clone().add(new V3(0, 1.4, 0))); applyShake(dt);
  // the goddess: hair sways, the wand waves, the stars fly around her
  for (const h of ST.hair) h.g.rotation.x = h.base + Math.sin(t * 1.2 + h.ph) * 0.08; 
  ST.gArmR.rotation.z = Math.sin(t * 1.3) * 0.25; ST.wand.rotation.z += dt * 2; ST.gBody.position.y = 1.4 + Math.sin(t * 0.8) * 0.15;
  ST.gHead.rotation.y = clamp(Math.atan2(player.pos.x, player.pos.z) * 0.5, -0.6, 0.6);
  for (const s of ST.swarm) { s.a += dt * s.s; s.m.position.set(Math.cos(s.a) * s.r, s.y + Math.sin(s.a * 2 + s.tilt * 5) * 1.2 + Math.cos(s.a) * s.tilt * 3, Math.sin(s.a) * s.r); s.m.rotation.y += dt * 3; s.m.rotation.z += dt * 2; }
  for (const o of ST.orbit) o.m.rotation.y += dt * o.spin;
  updateStarKids(dt, t);
  let txt = ''; if (!card) txt = nearCaveHole() ? '<kbd>E</kbd> lipti žemyn į Žvaigždžių urvą' : nearCaveExit() ? '<kbd>E</kbd> lipti aukštyn virvių kopėčiomis' : nearStarKid() ? '<kbd>E</kbd> kalbėtis su žvaigždute · pelė – pakutenti' : nearStarGoddess() ? '<kbd>E</kbd> kalbėtis su Žvaigždžių Dieve' : Math.hypot(player.pos.x + 12, player.pos.z - 4) < 5 ? '<kbd>E</kbd> skaityti 5 įsakymų lentą' : '';
  setPrompt(txt);
}
function starTest(n) {
  if (n === 2) { hideCard(); enterStar(); return; }
  if (mode !== 'wind') { hideCard(); enterWind(); } Q22.met = true; saveQ22(); Q23.stage = 'done'; saveQ23(); Q19.has = true; if (!Q19.num) Q19.num = '-123 4242'; saveQ19();
  toast('Bandymų pasaulis: Vėjas nurimo', 'P → Dievų grupė → parašyk „aš padėjau visiems dievams, tik ne Žvaigždžių Dievei“', '#ffe8a0');
}
