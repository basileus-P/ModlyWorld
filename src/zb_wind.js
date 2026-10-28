// ================= After saving the Thunder planet: write "aš išgelbėjau griaustinio planetą" → the WIND GOD takes you =================
// His world has no planet at all: it is a huge see-through ball with a storm inside. A GIANT man (the Wind God) floats in it,
// and everybody just flies. The houses stand on giant floating things: a spoon, a potato, a key, a rifle, a computer…
const Q22 = { called: false, met: false };
try { const s = JSON.parse(localStorage.getItem('modly-quest22') || 'null'); if (s) Object.assign(Q22, s); } catch (_) { }
function saveQ22() { try { localStorage.setItem('modly-quest22', JSON.stringify(Q22)); } catch (_) { } }
const inWind = () => { try { return localStorage.getItem('modly-inwind') === '1'; } catch (_) { return false; } };
GOD_COL['Vėjo Dievas'] = '#bfefff';
function windSaid(txt) { const t = txt.toLowerCase(); return (/i[sš]gelb/.test(t) && /griaust|perk[uū]n|audr/.test(t)) || (/sav(ed|e)|rescued/.test(t) && /thunder|storm/.test(t)); }
const windCallOk = txt => windSaid(txt) && typeof Q21 !== 'undefined' && Q21.stage === 'done' && !inWind();
{ const _g = godAnswer; godAnswer = txt => {
    if (windSaid(txt)) {
      if (Q21.stage !== 'done') return [['Griaustinio Dievas', `BUM? Dar ne! Susprogdinta tik ${Q21.blown.length} iš 100 kamščių. Kask toliau!`]];
      return [['Vėjo Dievas', 'Fiuuuuu! TIKRAI! Girdžiu lietų net iš savo pasaulio! Tu – tikras didvyris!'], ['Vėjo Dievas', 'Mano pasaulyje irgi reikia didvyrio… ATPUČIU TAVĘS PASIIMTI! 🌪'], ['Griaustinio Dievas', 'BUM BUM! Sudie, kasėjau! Lėk su vėju!']];
    }
    if (/v[eė]j|fiu/.test(txt.toLowerCase())) return [['Vėjo Dievas', 'Fiuuu… Kas mane šaukia? Papasakok grupei, ką padarei Griaustinio planetoje!']];
    return _g(txt);
  }; }

// ---------- the pickup: a whirlwind lifts you out of the storm world ----------
let windPicking = false;
{ const _u = updateThunder; updateThunder = (dt, t) => { _u(dt, t); if (Q22.called && !inWind() && !windPicking && !mPhoneOpen && !card && !cinema && !transitioning) windPickup(); }; }
// called from another world (not the storm world): the wind still finds you – fade straight to the Wind world
fx.push(() => {
  if (!Q22.called || inWind() || windPicking || mPhoneOpen || card || cinema || transitioning || !started || mode === 'attract' || mode === 'thunder' || mode === 'dig') return true;
  windPicking = true; Q22.called = false; saveQ22(); for (const k in keys) keys[k] = false;
  toast('Fiuuuu! Atpučia Vėjo Dievas!', 'Viesulas kelia tave aukštyn!', '#bfefff'); noiseHit(1.6, { f: 900, fto: 300, vol: 0.18 });
  setTimeout(() => { transitioning = true; fadeTo(() => { transitioning = false; cinema = null; windPicking = false; enterWind(); }); }, 1200);
  return true; });
function makeWhirl() {
  const g = new THREE.Group(); const rings = [];
  for (let i = 0; i < 14; i++) { const r = 0.8 + i * 0.45, m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.12 + i * 0.02, 6, 28), new THREE.MeshBasicMaterial({ color: 0xdff6ff, transparent: true, opacity: 0.55 - i * 0.025 })); m.rotation.x = Math.PI / 2; m.position.y = i * 1.1; g.add(m); rings.push(m); }
  for (let i = 0; i < 40; i++) { const p = S(G.sph, bmat(0xffffff, { transparent: true, opacity: 0.6 }), 0.25, 0.25, 0.25); p.userData = { a: rr(0, 6.28), y: rr(0, 15), s: rr(2, 5) }; g.add(p); rings.push(p); }
  g.userData.parts = rings; return g;
}
function spinWhirl(g, t) { for (const m of g.userData.parts) { if (m.userData.s) { const u = m.userData; u.a += 0.1 * u.s; const r = 0.8 + u.y * 0.45; m.position.set(Math.cos(u.a) * r, u.y, Math.sin(u.a) * r); } else { m.rotation.z = t * 6 + m.position.y; m.position.x = Math.sin(t * 3 + m.position.y * 0.4) * 0.4; } } }
function windPickup() {
  windPicking = true; Q22.called = false; saveQ22(); hideCard(); for (const k in keys) keys[k] = false;
  const w = makeWhirl(); thScene.add(w); const pp = player.pos.clone(); w.position.copy(pp); w.scale.setScalar(0.05);
  let t = 0; toast('Fiuuuu! Atpučia Vėjo Dievas!', 'Viesulas kelia tave aukštyn!', '#bfefff');
  const whoosh = () => noiseHit(1.6, { f: 900, fto: 300, vol: 0.18 }); whoosh(); setTimeout(whoosh, 800); setTimeout(whoosh, 1700);
  cinema = dt => {
    t += dt; spinWhirl(w, t); w.scale.setScalar(Math.min(1, 0.05 + t * 0.6));
    if (t > 1.5) { const k = t - 1.5; player.pos.set(pp.x + Math.cos(t * 7) * 1.2, pp.y + k * k * 3, pp.z + Math.sin(t * 7) * 1.2); player.mesh.position.copy(player.pos); player.mesh.rotation.y = t * 9; w.position.y = pp.y + k * k * 1.5; }
    camera.position.lerp(_ct.set(pp.x + 14, pp.y + 6 + Math.max(0, t - 1.5) * 5, pp.z + 14), Math.min(1, dt * 2)); camera.up.set(0, 1, 0); camera.lookAt(player.pos);
    if (t > 5 && !transitioning) { transitioning = true; fadeTo(() => { transitioning = false; cinema = null; windPicking = false; thScene.remove(w); enterWind(); }); }
  };
}

// ---------- the Wind God's world: a see-through ball with a storm inside ----------
const wiScene = new THREE.Scene(); wiScene.background = new THREE.Color(0x0c1226); wiScene.fog = new THREE.Fog(0x4a6a8a, 70, 230);
wiScene.add(new THREE.AmbientLight(0xcfe8ff, 0.55)); wiScene.add(new THREE.HemisphereLight(0xdff4ff, 0x4a5a7a, 0.75));
{ const sl = new THREE.DirectionalLight(0xffffff, 0.7); sl.position.set(30, 80, 40); wiScene.add(sl); }
const wiFlash = new THREE.PointLight(0xdfefff, 0, 260); wiFlash.position.set(0, 60, 0); wiScene.add(wiFlash);
const WI = { built: false, objs: [], boxes: [], pups: [], spin: [], spinK: 1, god: null, streaks: null, storm: null, flashT: 3, whirl: null };
const WSPH = 128, WIND_HAND = new V3(10, 6, -50);
function windPlat(g, ox, oz, hx, hz, dh = 0, top = true) { WI.boxes.push({ g, ox, oz, hx, hz, dh, top, x: 0, z: 0, h: 0 }); }
// the wind puppies' own houses: 0 a little windmill, 1 a big dog-house with a bone, 2 a round cottage with a pinwheel
function windHouseMesh(type) {
  const g = new THREE.Group(), pal = [0xffd8a8, 0xbfe8ff, 0xffc8e0, 0xd8ffc0, 0xfff0a0][Math.floor(rnd() * 5)];
  if (type === 0) {
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.3, 5, 16), mat(0xf4ecdc)).translateY(2.5));
    for (let i = 0; i < 3; i++) g.add(S(G.cyl, mat(0x8a6a4a), 2.32 - i * 0.18, 0.12, 2.32 - i * 0.18, 0, 1 + i * 1.5, 0));
    g.add(new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.2, 16), mat(0x3a6ac8)).translateY(6.1));
    g.add(S(G.box, mat(0x6a4426), 1, 1.8, 0.1, 0, 0.9, 2.16)); g.add(S(G.sph, mat(0xbfe0ff, { metalness: 0.3 }), 0.45, 0.45, 0.1, 0, 3.4, 1.98));
    const bl = new THREE.Group(); bl.position.set(0, 4.4, 2.2); g.add(bl); bl.add(S(G.sph, mat(0x8a6a4a), 0.3, 0.3, 0.3));
    for (let k = 0; k < 4; k++) { const a = new THREE.Group(); a.rotation.z = k * Math.PI / 2; bl.add(a); a.add(S(G.box, mat(0x8a6a4a), 0.12, 3.4, 0.08, 0, 1.8, 0)); a.add(S(G.box, mat(0xffffff, { side: THREE.DoubleSide }), 0.9, 2.8, 0.04, 0.5, 2, 0.05)); }
    WI.spin.push({ m: bl, ax: 'z', sp: 1.6 }); g.userData.h = 5;
  } else if (type === 1) {
    g.add(S(G.box, mat(pal), 5, 3, 4.4, 0, 1.5, 0));
    for (const sx of [-1, 1]) { const r = S(G.box, mat(0xc84a3a), 3.3, 0.25, 4.9, sx * 1.3, 3.75, 0); r.rotation.z = -sx * 0.62; g.add(r); }
    { const sh = new THREE.Shape(); sh.moveTo(-2.5, 0); sh.lineTo(2.5, 0); sh.lineTo(0, 1.75); sh.lineTo(-2.5, 0); const gg = new THREE.ShapeGeometry(sh); for (const z of [2.2, -2.2]) { const m = new THREE.Mesh(gg, mat(pal, { side: THREE.DoubleSide })); m.position.set(0, 3, z); g.add(m); } }
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.1, 16, 1, false, 0, Math.PI), mat(0x2a1a14)); arch.rotation.x = Math.PI / 2; arch.rotation.y = Math.PI / 2; arch.position.set(0, 1.5, 2.22); g.add(arch); g.add(S(G.box, mat(0x2a1a14), 1.7, 1.5, 0.1, 0, 0.75, 2.22));
    const bone = new THREE.Group(); bone.position.set(0, 3.9, 2.3); g.add(bone); bone.add(S(G.box, mat(0xfff6e0), 1.4, 0.3, 0.2)); for (const x of [-0.75, 0.75]) for (const y of [-0.17, 0.17]) bone.add(S(G.sph, mat(0xfff6e0), 0.22, 0.22, 0.18, x, y, 0));
    for (const x of [-1.7, 1.7]) g.add(S(G.sph, mat(0xbfe0ff, { metalness: 0.3 }), 0.45, 0.45, 0.1, x, 1.9, 2.2));
    g.add(S(G.cyl, mat(0x8a8a9a), 0.5, 0.2, 0.5, 1.6, 0.1, 3)); g.add(S(G.cyl, mat(0x4a8ae8), 0.4, 0.05, 0.4, 1.6, 0.21, 3));   // a water bowl
    g.userData.h = 3;
  } else {
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 3, 18), mat(pal)).translateY(1.5));
    g.add(new THREE.Mesh(new THREE.ConeGeometry(3, 2.8, 18), mat(0x7a4ac8)).translateY(4.4));
    g.add(S(G.box, mat(0x6a4426), 1, 1.8, 0.1, 0, 0.9, 2.38));
    for (const a of [0.9, -0.9, 2.6]) g.add(S(G.sph, mat(0xbfe0ff, { metalness: 0.3 }), 0.4, 0.4, 0.4, Math.sin(a) * 2.3, 1.9, Math.cos(a) * 2.3));
    g.add(S(G.cyl, mat(0xdddddd), 0.06, 1.6, 0.06, 0, 6.4, 0));
    const pw = new THREE.Group(); pw.position.set(0, 7.1, 0.12); g.add(pw); const cols = [0xff5a5a, 0xffd23a, 0x5ac8ff, 0x7aff6a];
    for (let k = 0; k < 4; k++) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 3), mat(cols[k], { side: THREE.DoubleSide })); t.scale.z = 0.1; t.rotation.z = k * Math.PI / 2; t.translateY(0.45); pw.add(t); }
    WI.spin.push({ m: pw, ax: 'z', sp: 5 }); g.userData.h = 3;
  }
  return g;
}
function windHouse(g, type, x, z, s = 0.8, ry = 0) { const h = windHouseMesh(type); h.scale.setScalar(s); h.position.set(x, 0, z); h.rotation.y = ry; g.add(h); const sw = Math.abs(Math.sin(ry)) > 0.5; const hw = type === 1 ? (sw ? 2.2 : 2.5) : 2.3; const hd = type === 1 ? (sw ? 2.5 : 2.2) : 2.3; windPlat(g, x, z, hw * s, hd * s, h.userData.h * s, false); (g.userData.houses = g.userData.houses || []).push({ x, z, r: 3 * s }); }
// ---------- the little puppies that walk on two legs ----------
const PUP_NAMES = ['Pūkis', 'Vėjelis', 'Ausytė', 'Margis', 'Bimbas', 'Kamuoliukas', 'Riestuodegis', 'Snukutis', 'Dulkė', 'Fiu-Fiu', 'Šuniukas Jonas', 'Pyragėlis', 'Kaulius', 'Šokliukas', 'Debesėlis', 'Lapė'];
const PUP_LINES = ['Au au! Labas! Aš vaikštau ant dviejų kojų – visi šuniukai čia taip vaikšto!', 'Vau! Tu toks žalias! Ar galiu tave apuostyti? …Kvepi audra!', 'Mano namas su kauliuku ant stogo – gražiausias!', 'Kai Vėjo Dievas pučia, mano ausys plazda kaip vėliavos! Au!', 'Mes čia visi skraidom. Bet aš dar mokausi… kartais nukrentu, ir vėjas mane pagauna. Vau!', 'Ar matei mano dėdę ant šaukšto? Jis sako, kad tai valtis!', 'Bulvėje labai jauku – ji šilta!', 'Au au au! Paglostyk mane! (paspausk pelės mygtuką)', 'Vėjo Dievas – mūsų geriausias draugas. Jis meta mums debesų kamuoliukus!', 'Mano uodega sukasi kaip vėjo malūnėlis! Žiūrėk!', 'Kas vakarą mes visi kaukiam į vėją: AUUUUUUU!', 'Kompiuteryje gyvena mano draugas. Jis žaidžia žaidimus ant klaviatūros – šokinėja per mygtukus!'];
function makeWindPup() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const fur = pick([0xd8a060, 0xf4f0e8, 0x8a5a3a, 0x2a2a2e, 0xe8c890, 0xb0b0b8]), fur2 = pick([0xffffff, 0xf4e0c0, 0x5a3a2a, 0xffe8d0]), M1 = mat(fur), M2 = mat(fur2);
  body.add(S(G.sph, M1, 0.42, 0.52, 0.36, 0, 0.95, 0)); body.add(S(G.sph, M2, 0.3, 0.38, 0.2, 0, 0.92, 0.2));
  const head = new THREE.Group(); head.position.set(0, 1.62, 0.05); body.add(head);
  head.add(S(G.sph, M1, 0.42, 0.38, 0.4)); head.add(S(G.sph, M2, 0.24, 0.18, 0.24, 0, -0.08, 0.32)); head.add(S(G.sph, mat(0x1a1a1a), 0.08, 0.06, 0.06, 0, -0.02, 0.55));
  head.add(S(G.box, mat(0xff7a9a), 0.1, 0.03, 0.14, 0, -0.2, 0.46));
  for (const x of [-0.16, 0.16]) { head.add(S(G.sph, bmat(0xffffff), 0.09, 0.1, 0.05, x, 0.1, 0.36)); head.add(S(G.sph, bmat(0x1a1a1a), 0.055, 0.065, 0.04, x, 0.1, 0.4)); }
  const ears = []; for (const x of [-1, 1]) { const e = new THREE.Group(); e.position.set(x * 0.34, 0.2, 0); head.add(e); e.add(S(G.sph, mat(fur === 0x2a2a2e ? 0x4a4a4e : 0x6a4a2a), 0.12, 0.3, 0.08, x * 0.04, -0.22, 0)); ears.push(e); }
  const legs = []; for (const x of [-0.18, 0.18]) { const l = new THREE.Group(); l.position.set(x, 0.55, 0); g.add(l); l.add(S(G.cyl, M1, 0.1, 0.45, 0.1, 0, -0.25, 0)); l.add(S(G.sph, M2, 0.14, 0.09, 0.2, 0, -0.5, 0.05)); legs.push(l); }
  const arms = []; for (const x of [-1, 1]) { const a = new THREE.Group(); a.position.set(x * 0.36, 1.2, 0); body.add(a); a.add(S(G.cyl, M1, 0.07, 0.38, 0.07, 0, -0.2, 0)); a.add(S(G.sph, M2, 0.1, 0.1, 0.1, 0, -0.42, 0)); arms.push(a); }
  const tail = new THREE.Group(); tail.position.set(0, 0.85, -0.32); body.add(tail); tail.add(S(G.sph, M1, 0.07, 0.07, 0.28, 0, 0.12, -0.2).rotateX(-0.7)); tail.add(S(G.sph, M2, 0.08, 0.08, 0.08, 0, 0.3, -0.38));
  if (rnd() < 0.5) { const sc = S(G.box, mat(pick([0xff5a5a, 0x5ac8ff, 0xffd23a, 0x8a5aff])), 0.62, 0.12, 0.42, 0, 1.38, 0.02); body.add(sc); g.userData.scarf = S(G.box, sc.material, 0.14, 0.4, 0.04, 0.15, 1.2, -0.22); body.add(g.userData.scarf); }
  g.userData = Object.assign(g.userData, { body, head, ears, legs, arms, tail }); return g;
}
function addWindPups(o, n) {
  const pl = WI.boxes.find(b => b.g === o.g && b.top); if (!pl) return;
  for (let i = 0; i < n; i++) { const m = makeWindPup(); o.g.add(m); const p = { m, o, pl, tgt: new V3(), t: rr(0, 2), hop: 0, ph: rr(0, 6.28), name: pick(PUP_NAMES), line: pick(PUP_LINES), walk: 0 }; pupSpot(p, p.m.position); p.tgt.copy(m.position); WI.pups.push(p); }
}
function pupSpot(p, out) { for (let k = 0; k < 20; k++) { out.set(p.pl.ox + rr(-1, 1) * (p.pl.hx - 0.8), 0, p.pl.oz + rr(-1, 1) * (p.pl.hz - 0.8)); if (!(p.o.g.userData.houses || []).some(h => Math.hypot(out.x - h.x, out.z - h.z) < h.r)) return out; } return out; }
const pupWorld = p => p.o.g.position.clone().add(p.m.position);
function nearPup() { let best = null, bd = 2.4; for (const p of WI.pups) { const w = pupWorld(p); const d = Math.hypot(w.x - player.pos.x, w.z - player.pos.z); if (d < bd && Math.abs(w.y - player.pos.y) < 2.5) { bd = d; best = p; } } return best; }
function updatePups(dt, t) {
  for (const p of WI.pups) {
    const w = pupWorld(p), dx = player.pos.x - w.x, dz = player.pos.z - w.z, near = Math.hypot(dx, dz) < 3 && Math.abs(player.pos.y - w.y) < 2.5;
    p.t -= dt; p.hop = Math.max(0, p.hop - dt * 1.6);
    if (p.t < 0 && !near) { p.t = rr(1, 4); pupSpot(p, p.tgt); }
    const d = p.tgt.clone().sub(p.m.position); d.y = 0; let moving = false;
    if (!near && d.length() > 0.15) { p.m.position.addScaledVector(d.normalize(), Math.min(d.length(), dt * 1.8)); p.m.rotation.y = Math.atan2(d.x, d.z); moving = true; }
    else if (near) p.m.rotation.y = Math.atan2(dx, dz);
    p.walk += dt * (moving ? 11 : 0); const u = p.m.userData, sw = moving ? Math.sin(p.walk) : 0;
    u.legs[0].rotation.x = sw * 0.6; u.legs[1].rotation.x = -sw * 0.6; u.arms[0].rotation.x = -sw * 0.5; u.arms[1].rotation.x = sw * 0.5;
    if (near && !moving) { u.arms[1].rotation.z = 2.4 + Math.sin(t * 8 + p.ph) * 0.4; } else u.arms[1].rotation.z = 0;
    u.tail.rotation.y = Math.sin(t * (near ? 18 : 8) + p.ph) * 0.7; u.ears.forEach((e, i) => e.rotation.z = (i ? -1 : 1) * (0.2 + Math.sin(t * 6 + p.ph + i) * 0.25));
    u.head.rotation.z = near ? Math.sin(t * 2 + p.ph) * 0.2 : 0; if (u.scarf) u.scarf.rotation.x = 0.6 + Math.sin(t * 9 + p.ph) * 0.3;
    p.m.position.y = (moving ? Math.abs(Math.sin(p.walk)) * 0.08 : 0) + Math.sin(p.hop * Math.PI) * 1.1;
  }
  for (const sp of WI.spin) sp.m.rotation[sp.ax] += dt * sp.sp;
}
function limb(g, m, a, b, r) { const d = b.clone().sub(a), L = d.length(), c = S(G.cyl, m, r, L, r); c.position.copy(a).addScaledVector(d, 0.5); c.quaternion.setFromUnitVectors(UP, d.normalize()); g.add(c); return c; }
function windObj(name, x, y, z, build) { const g = new THREE.Group(); g.position.set(x, y, z); wiScene.add(g); WI.objs.push({ g, base: y, ph: rr(0, 6.28), name }); build(g); return g; }
function buildWind() {
  if (WI.built) return; WI.built = true; let g0;
  // the glass ball
  wiScene.add(new THREE.Mesh(new THREE.SphereGeometry(WSPH, 48, 32), new THREE.MeshBasicMaterial({ color: 0x9ad8ff, transparent: true, opacity: 0.1, side: THREE.BackSide, depthWrite: false, fog: false })));
  wiScene.add(new THREE.Mesh(new THREE.SphereGeometry(WSPH + 0.5, 32, 20), new THREE.MeshBasicMaterial({ color: 0xcff0ff, wireframe: true, transparent: true, opacity: 0.025, fog: false })));
  { const sv = []; for (let i = 0; i < 900; i++) { const v = randDir().multiplyScalar(rr(220, 300)); sv.push(v.x, v.y, v.z); } const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3)); wiScene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.4, color: 0xcfd8ff, fog: false }))); }
  // the storm inside the ball: a big turning band of grey clouds along the glass
  { const st = new THREE.Group(); const cm = [mat(0x8a9ab0, { roughness: 1, transparent: true, opacity: 0.85 }), mat(0x6a7a92, { roughness: 1, transparent: true, opacity: 0.85 }), mat(0xa8b8cc, { roughness: 1, transparent: true, opacity: 0.8 })];
    for (let i = 0; i < 220; i++) { const a = rr(0, 6.28), el = rr(-0.7, 0.9), r = rr(100, 120), s = rr(6, 14); const p = S(G.sph, pick(cm), s, s * 0.6, s, Math.cos(a) * Math.cos(el) * r, Math.sin(el) * r, Math.sin(a) * Math.cos(el) * r); st.add(p); }
    wiScene.add(st); WI.storm = st; }
  // wind streaks swirling around the middle
  { const N = 700, pos = new Float32Array(N * 3), dat = []; for (let i = 0; i < N; i++) dat.push({ a: rr(0, 6.28), r: rr(10, 100), y: rr(-30, 60), s: rr(0.15, 0.4) }); const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); WI.streaks = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.5, color: 0xeaf8ff, transparent: true, opacity: 0.7 })); WI.streaks.userData.dat = dat; wiScene.add(WI.streaks); }
  // ---- the giant floating things with houses on them ----
  // 1. a giant BOOK (you start here)
  windObj('Knyga', 0, 0, 16, g => { g.add(S(G.box, mat(0xc8302a), 18, 0.5, 13, 0, -0.25, 0)); g.add(S(G.box, mat(0xf4ecd8), 17.4, 3, 12.4, 0.2, -2, 0)); g.add(S(G.box, mat(0xc8302a), 18, 0.5, 13, 0, -3.75, 0)); g.add(S(G.box, mat(0xa82020), 0.6, 4, 13, -9, -2, 0)); for (let i = 0; i < 8; i++) g.add(S(G.box, mat(0xd8d0bc), 0.05, 2.8, 12.3, 8.8, -2, 0).translateZ(0)); windPlat(g, 0, 0, 9, 6.5); windHouse(g, 1, -3, -1, 0.85); windHouse(g, 2, 4.5, 1.5, 0.7, -0.6); });
  // 2. a giant SPOON
  windObj('Šaukštas', 36, 5, -4, g => { const sil = mat(0xd8dde6, { metalness: 0.85, roughness: 0.25 }); g.add(S(G.sph, sil, 9, 1.6, 6.5, 0, -1.4, 0)); g.add(S(G.box, sil, 24, 0.7, 2.6, 20, -0.5, 0)); g.add(S(G.sph, sil, 2.6, 0.5, 2.2, 32, -0.5, 0)); windPlat(g, 0, 0, 7, 4.8); windPlat(g, 20, 0, 13, 1.3, -0.15); windHouse(g, 0, 0, 0, 0.8, Math.PI / 2); });
  // 3. a giant POTATO
  windObj('Bulvė', -34, 3, -6, g => { const pm = mat(0xb08a50, { roughness: 1 }); g.add(S(G.ico1, pm, 11, 6, 8.5, 0, -5, 0)); for (let i = 0; i < 9; i++) g.add(S(G.sph, mat(0x7a5a30, { roughness: 1 }), 0.6, 0.3, 0.6, rr(-8, 8), rr(-8, -2), rr(-6, 6))); g.add(S(G.sph, pm, 7.5, 1.2, 6, 0, -0.9, 0)); windPlat(g, 0, 0, 6.5, 5); windHouse(g, 0, -1, 0, 0.8, 0.3); });
  // 4. a giant KEY
  windObj('Raktas', -26, 11, -38, g => { const gold = mat(0xe8c040, { metalness: 0.8, roughness: 0.3 }); g.add(S(G.cyl, gold, 7, 1.2, 7, 0, -0.6, 0)); const ring = new THREE.Mesh(new THREE.TorusGeometry(3, 1, 8, 24), gold); ring.rotation.x = Math.PI / 2; ring.position.set(-9, -0.6, 0); g.add(ring); g.add(S(G.box, gold, 24, 1.2, 2.6, 18, -0.6, 0)); for (const [x, h] of [[24, 3], [27, 2], [29.5, 3.5]]) g.add(S(G.box, gold, 1.8, h, 1.2, x, -0.6 - h / 2, 0)); windPlat(g, 0, 0, 6, 6); windPlat(g, 18, 0, 12, 1.3); windHouse(g, 1, 0, 0, 0.85, 0.4); });
  // 5. a giant RIFLE
  windObj('Šautuvas', 28, 14, -36, g => { const wood = mat(0x8a5a2a, { roughness: 0.8 }), steel = mat(0x3a3e46, { metalness: 0.7, roughness: 0.35 }); g.add(S(G.box, wood, 16, 2.6, 6, 0, -1.3, 0)); g.add(S(G.box, wood, 6, 3.6, 5, -9, -2.2, 0)); g.add(S(G.box, steel, 9, 2.2, 3.2, 12, -1.6, 0)); const bar = S(G.cyl, steel, 0.9, 28, 0.9, 30, -1, 0); bar.rotation.z = Math.PI / 2; g.add(bar); g.add(S(G.box, steel, 0.6, 1.4, 0.6, 43, 0.1, 0)); g.add(S(G.box, steel, 1.6, 2.4, 0.6, 10, -3.6, 0)); windPlat(g, 0, 0, 8, 3); windPlat(g, 12, 0, 4.5, 1.6, -0.5); windPlat(g, 30, 0, 14, 0.9, -0.1); windHouse(g, 2, -1, 0, 0.62, Math.PI / 2); });
  // 6. a giant COMPUTER (a laptop)
  windObj('Kompiuteris', -42, 18, 26, g => { const al = mat(0x5a5e68, { metalness: 0.6, roughness: 0.4 }); g.add(S(G.box, al, 18, 1.2, 12, 0, -0.6, 0)); for (let r = 0; r < 4; r++) for (let c = 0; c < 10; c++) g.add(S(G.box, mat(0x1a1c22), 1.2, 0.15, 1.1, -7.2 + c * 1.6, 0.02, -4.6 + r * 1.5)); g.add(S(G.box, mat(0x2a2c34), 5, 0.1, 2.6, 0, 0.02, 3.6)); g.add(S(G.box, al, 18, 12, 0.6, 0, 6, -6.2));
    g.add(mesh(new THREE.PlaneGeometry(16.4, 10.4), new THREE.MeshBasicMaterial({ map: labelTex('Vėjo OS  ☁', '#2a6ad8', '#ffffff', 512, 320) }), 0, 6, -5.85)); windPlat(g, 0, 0, 9, 6); windPlat(g, 0, -6.2, 9, 0.4, 12, false); windHouse(g, 1, 3.5, 1, 0.75, Math.PI); });
  // 7. a giant PENCIL (a bridge, with a tiny hut)
  windObj('Pieštukas', 40, 8, 32, g => { const pen = S(G.cyl6, mat(0xffc81a), 2.2, 30, 2.2, 0, -2, 0); pen.rotation.z = Math.PI / 2; g.add(pen); const tip = S(G.cone, mat(0xe8c89a), 2.2, 5, 2.2, -17.5, -2, 0); tip.rotation.z = Math.PI / 2; g.add(tip); const lead = S(G.cone, mat(0x222222), 0.7, 1.6, 0.7, -20.6, -2, 0); lead.rotation.z = Math.PI / 2; g.add(lead); const er = S(G.cyl, mat(0xff8aa8), 2.2, 3, 2.2, 16.5, -2, 0); er.rotation.z = Math.PI / 2; g.add(er); const ring = S(G.cyl, mat(0xc8ccd6, { metalness: 0.7 }), 2.3, 1.4, 2.3, 14.4, -2, 0); ring.rotation.z = Math.PI / 2; g.add(ring); windPlat(g, 0, 0, 16, 1.6); windHouse(g, 0, 6, 0, 0.5, Math.PI / 2); });
  // 8. a giant TEACUP (upside down)
  windObj('Puodelis', -4, 24, -12, g => { const por = mat(0xf4f4fa, { roughness: 0.3 }); g.add(new THREE.Mesh(new THREE.CylinderGeometry(5, 7, 8, 28), por).translateY(-4)); g.add(S(G.cyl, mat(0x4a8ae8), 7.05, 1, 7.05, 0, -7, 0)); const h = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.7, 8, 20, Math.PI), por); h.position.set(6.3, -4, 0); h.rotation.z = -Math.PI / 2; g.add(h); windPlat(g, 0, 0, 3.8, 3.8); windHouse(g, 2, 0, 0, 0.62); });
  // 9. a giant SNEAKER
  windObj('Sportbatis', 14, 30, 44, g => { g.add(S(G.box, mat(0xf4f4f4), 17, 1.6, 7, 0, -7.2, 0)); g.add(S(G.box, mat(0xe83a3a), 14, 5.6, 6.4, -1, -3.6, 0)); g.add(S(G.sph, mat(0xe83a3a), 4, 3, 3.2, 6, -4.5, 0)); g.add(S(G.box, mat(0xffffff), 6, 0.3, 4, 2, -0.7, 0)); for (let i = 0; i < 4; i++) g.add(S(G.box, mat(0xffffff), 0.3, 0.4, 4.6, -0.5 + i * 1.4, -0.6, 0)); windPlat(g, -1, 0, 7, 3.2, -0.8); windHouse(g, 1, -3, 0, 0.62, Math.PI / 2); });
  for (const o of WI.objs) addWindPups(o, o.name === 'Knyga' ? 4 : o.name === 'Puodelis' || o.name === 'Pieštukas' ? 1 : 2);
  // ---- the Wind God: a giant man floating in his storm ----
  { const g = new THREE.Group(); g.position.set(0, 0, -80); wiScene.add(g); WI.god = g;
    const body = mat(0xcfefff, { transparent: true, opacity: 0.85, emissive: 0x2a5a7a, roughness: 0.6 }), cloud = mat(0xffffff, { transparent: true, opacity: 0.9, roughness: 1, emissive: 0x3a4a5a });
    const head = new THREE.Group(); head.position.set(0, 32, 0); g.add(head); WI.godHead = head;
    head.add(S(G.sph, body, 8, 9, 8));
    WI.cheeks = []; for (const x of [-5.4, 5.4]) { const c = S(G.sph, mat(0xb8e4ff, { emissive: 0x4a6a8a }), 3.6, 3.2, 3.2, x, -2.6, 5.4); head.add(c); WI.cheeks.push(c); }
    for (const x of [-3, 3]) { head.add(S(G.sph, bmat(0xffffff), 1.7, 1.9, 1, x, 1.6, 7.3)); head.add(S(G.sph, bmat(0x1a3a6a), 0.8, 0.9, 0.6, x, 1.4, 8.1)); head.add(S(G.box, mat(0xffffff), 3, 0.6, 0.8, x, 4, 7.4).rotateZ(x * -0.05)); }
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(1, 0.45, 8, 16), mat(0x5a8ab0)); mouth.position.set(0, -3.6, 7.8); head.add(mouth);
    head.add(S(G.sph, body, 1.3, 1.8, 1.3, 0, -0.6, 8.3));
    for (let i = 0; i < 26; i++) { const a = rr(-2.6, 2.6), s = rr(2.4, 4); head.add(S(G.sph, cloud, s, s * 0.8, s, Math.sin(a) * 8, rr(3, 9), Math.cos(a) * 7 - 1)); }   // cloud hair
    for (let i = 0; i < 18; i++) { const s = rr(2, 3.6); head.add(S(G.sph, cloud, s, s, s, rr(-5, 5), -7 - rr(0, 9) + Math.abs(rr(-3, 3)), rr(3, 6))); }   // cloud beard
    g.add(S(G.sph, body, 11, 13, 7.5, 0, 12, 0));
    WI.godArmR = new THREE.Group(); g.add(WI.godArmR);
    limb(WI.godArmR, body, new V3(11, 20, 0), new V3(14, 12, 16), 3); limb(WI.godArmR, body, new V3(14, 12, 16), WIND_HAND.clone().sub(g.position).add(new V3(0, -1.2, -2)), 2.6);
    const palm = S(G.sph, body, 6.5, 1.3, 5.5, WIND_HAND.x, WIND_HAND.y - 1.3 - g.position.y, WIND_HAND.z - g.position.z); g.add(palm);
    for (let i = 0; i < 4; i++) g.add(S(G.sph, body, 1.2, 1, 3, WIND_HAND.x - 4.2 + i * 2.8, WIND_HAND.y - 1 - g.position.y, WIND_HAND.z - g.position.z + 6.5));
    WI.godArmL = new THREE.Group(); WI.godArmL.position.set(-11, 20, 0); g.add(WI.godArmL);
    limb(WI.godArmL, body, new V3(0, 0, 0), new V3(-10, 12, 4), 3); limb(WI.godArmL, body, new V3(-10, 12, 4), new V3(-12, 24, 8), 2.6); WI.godArmL.add(S(G.sph, body, 3.4, 4, 2.4, -12, 27, 8));
    // instead of legs – a whirlwind
    WI.whirl = new THREE.Group(); g.add(WI.whirl);
    for (let i = 0; i < 12; i++) { const r = 9 - i * 0.65, m = new THREE.Mesh(new THREE.TorusGeometry(r, 1.4, 8, 30), cloud); m.rotation.x = Math.PI / 2; m.position.y = 2 - i * 3.2; WI.whirl.add(m); }
    const sign = mesh(new THREE.PlaneGeometry(9, 1.6), new THREE.MeshBasicMaterial({ map: labelTex('VĖJO DIEVAS', '#2a4a7a', '#ffffff', 640, 110), side: THREE.DoubleSide }), WIND_HAND.x - 9, 10 - g.position.y, WIND_HAND.z - g.position.z + 4);
    g.add(sign);
  }
  g0 = WI.god; g0.scale.setScalar(1.5); g0.position.set(WIND_HAND.x - 1.5 * 10, WIND_HAND.y - 1.5 * 6, WIND_HAND.z - 1.5 * 30); WI.godY = g0.position.y;
  WI.boxes.push({ g: null, ox: WIND_HAND.x, oz: WIND_HAND.z, hx: 6, hz: 5, dh: WIND_HAND.y, top: true, hand: true, x: 0, z: 0, h: 0 });
  linearize(wiScene);
}
function enterWind() {
  buildWind(); mode = 'wind'; wiScene.add(player.mesh); player.mesh.visible = true; musicSet(2); setScope(false);
  try { localStorage.setItem('modly-inwind', '1'); localStorage.removeItem('modly-pos'); } catch (_) { }
  windSpawn(); camera.position.set(0, 6, 30); camera.up.set(0, 1, 0);
  $('bName').textContent = 'Vėjo pasaulis'; $('bEn').textContent = 'Vėjo Dievo namai'; $('bAtm').textContent = 'Jokios planetos – tik permatomas rutulys su audra viduje. Visi skraido!'; document.documentElement.style.setProperty('--biome', '#bfefff');
  setTimeout(() => toast('Tu VĖJO PASAULYJE!', 'Laikyk Space ore – vėjas tave neš! Vėjo Dievas – milžinas (E prie jo delno)', '#bfefff'), 600);
}
function windSpawn() { player.pos.set(-3, WI.objs[0].g.position.y + 0.1, 22); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.pitch = 0.25; player.up.set(0, 1, 0); player.grounded = true; }
const nearWindGod = () => Math.hypot(player.pos.x - WIND_HAND.x, player.pos.z - WIND_HAND.z) < 9 && Math.abs(player.pos.y - WIND_HAND.y) < 6;
function windObjNear() { for (const o of WI.objs) { if (!o.g.visible || o.name === 'Sukimo stotis') continue; const p = o.g.position; if (Math.hypot(player.pos.x - p.x, player.pos.z - p.z) < 10 && Math.abs(player.pos.y - p.y) < 3) return o; } return null; }
function windHand(side) { hands[side].hold = true; { const q = nearPup(); if (q) { q.hop = 1; bubbleIn(wiScene, pupWorld(q).add(new V3(0, 1.6, 0)), pick(['Au au!', 'Vau!', 'Cha!', 'Dar!']), 2.6); tone(rr(700, 1000), 0.08, { to: 500, type: 'triangle', vol: 0.05 }); } } const p = player.pos.clone().add(new V3(0, 1.4, 0)).addScaledVector(player.fwd, 1.2); for (let i = 0; i < 6; i++) { const s = S(G.sph, bmat(0xffffff, { transparent: true, opacity: 0.7 }), 0.2, 0.2, 0.2); s.position.copy(p); wiScene.add(s); const v = player.fwd.clone().multiplyScalar(rr(4, 8)).add(randDir().multiplyScalar(1.5)); let life = 0.6; const step = () => { life -= 0.016; s.position.addScaledVector(v, 0.016); s.scale.multiplyScalar(1.03); if (life > 0) requestAnimationFrame(step); else wiScene.remove(s); }; step(); } noiseHit(0.4, { f: 1400, fto: 500, vol: 0.06 }); }
function windAction() {
  if (card) { if (card.kind === 'talk') advanceTalk(); else hideCard(); return; }
  if (nearWindGod()) {
    if (Q22.met) { startTalk('Vėjo Dievas', [pick(['Fiuuu! Patinka skraidyti? Mano pasaulyje niekas nevaikšto – visi skrenda!', 'Mano šaukštas, mano bulvė, mano raktas… viską kažkada nupūčiau iš kitų pasaulių. Fiu!', 'Kai aš pučiu skruostus – kyla audra. Kai juokiuosi – kyla viesulas! Cha-fiu-cha!'])], '#bfefff'); return; }
    startTalk('Vėjo Dievas', ['FIUUUUU! Sveikas mano VĖJO PASAULYJE, žaliasis didvyri!', 'Taip – aš milžinas. O tu stovi ant mano delno. Neišsigąsk – aš labai švelniai laikau.', 'Čia nėra jokios planetos. Tik didelis permatomas rutulys, o jame – mano audra. Mes visi tiesiog skraidome. Juk rutulys apvalus – tai irgi planeta!', 'Mano šuniukai – maži, vaikšto ant dviejų kojų – gyvena ant visko, ką vėjas atpūtė: ant šaukšto, bulvės, rakto, šautuvo, kompiuterio, pieštuko, puodelio ir net sportbačio!', 'Laikyk Space ore – ir mano vėjas tave neš. O jei nukrisi – pagausiu. Apsižvalgyk, fiu!'], '#bfefff', () => { Q22.met = true; saveQ22(); });
    return;
  }
  { const q = nearPup(); if (q) { q.hop = 1; startTalk(q.name, [q.line], '#ffd8a8'); tone(800, 0.08, { to: 500, type: 'triangle', vol: 0.05 }); return; } }
  { const o = windObjNear(); if (o) { startTalk(o.name, [pick([`Čia gyvena maži šuniukai, kurie vaikšto ant dviejų kojų. Jų namai – ant milžiniško daikto: ${o.name.toLowerCase()}!`, `${o.name}? Taip, vieną dieną Vėjo Dievas jį atpūtė iš kito pasaulio, ir dabar čia namai.`, 'Fiu! Kartais visas daiktas siūbuoja – bet namai laikosi tvirtai!'])], '#bfefff'); return; } }
}
function updateWind(dt, t) {
  // floating things bob in the wind
  for (const o of WI.objs) { o.g.position.y = o.base + Math.sin(t * 0.5 + o.ph) * 0.6; o.g.rotation.y = Math.sin(t * 0.15 + o.ph) * 0.0; }
  for (const b of WI.boxes) { if (b.g) { b.x = b.g.position.x + b.ox; b.z = b.g.position.z + b.oz; b.h = b.g.position.y + b.dh; } else { b.x = b.ox; b.z = b.oz; b.h = b.dh + WI.god.position.y - WI.godY; } }
  const f = player.down ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = player.down ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 11 : 6.5; _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, Math.min(1, (player.grounded ? 10 : 3) * dt));
  if (keys.Space && player.grounded && Q8.back !== 'jetpack') { player.vr = 9; player.grounded = false; sfx.jump(); }
  else if (keys.Space && !player.grounded && Q8.back !== 'jetpack') player.vr = Math.min(6, player.vr + 34 * dt);   // the wind carries you
  if (!player.down) flatJetpack(dt);
  player.vr -= 20 * dt; if (!player.grounded) player.vr = Math.max(player.vr, -14);
  player.pos.addScaledVector(player.vel, dt); player.pos.y += player.vr * dt;
  let ground = -1e9; const rad = 0.4;
  for (const b of WI.boxes) { if (b.g && !b.g.visible) continue; const dx = player.pos.x - b.x, dz = player.pos.z - b.z, ex = b.hx + rad - Math.abs(dx), ez = b.hz + rad - Math.abs(dz); if (ex <= 0 || ez <= 0) continue; if (player.pos.y >= b.h - 0.6) { if (b.h > ground) ground = b.h; } else if (!b.top && player.pos.y > b.h - 14) { if (ex < ez) player.pos.x += dx < 0 ? -ex : ex; else player.pos.z += dz < 0 ? -ez : ez; } }
  if (player.pos.y <= ground) { player.pos.y = ground; if (player.vr < 0) player.vr = 0; player.grounded = true; } else player.grounded = false;
  // the glass ball keeps you in
  { const r = player.pos.length(); if (r > WSPH - 8) player.pos.multiplyScalar((WSPH - 8) / r); }
  if (player.pos.y < -45) { windSpawn(); toast('Fiuu! Vėjas tave pagavo!', 'Ir atnešė atgal ant didžiosios knygos', '#bfefff'); noiseHit(1, { f: 900, fto: 300, vol: 0.15 }); }
  player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd);
  animateMan(dt, f !== 0 || s !== 0, sp);
  const dist = 6.4, pitch = player.pitch;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
  camera.position.lerp(_ct, Math.min(1, dt * 8)); camera.up.set(0, 1, 0); camera.lookAt(player.pos.clone().add(new V3(0, 1.4, 0))); applyShake(dt);
  // the storm and the wind
  WI.storm.rotation.y += dt * 0.04 * WI.spinK; updatePups(dt, t);
  { const p = WI.streaks.geometry.attributes.position, dat = WI.streaks.userData.dat; for (let i = 0; i < dat.length; i++) { const d = dat[i]; d.a += d.s * dt * (30 / d.r + 0.1) * WI.spinK; p.setXYZ(i, Math.cos(d.a) * d.r, d.y + Math.sin(d.a * 3) * 1.5, Math.sin(d.a) * d.r); } p.needsUpdate = true; }
  WI.flashT -= dt; wiFlash.intensity = Math.max(0, wiFlash.intensity - dt * 4);
  if (WI.flashT < 0) { WI.flashT = rr(3, 7); const a = randDir().multiplyScalar(110), b = a.clone().add(randDir().multiplyScalar(25)); zapLine(wiScene, a, b, 0xffffff, 0.3); wiFlash.position.copy(a).multiplyScalar(0.8); wiFlash.intensity = 2; setTimeout(() => noiseHit(1.2, { f: 200, fto: 50, vol: 0.1 }), 500); }
  // the giant breathes, blows, waves and spins on his whirlwind
  WI.god.position.y = WI.godY + Math.sin(t * 0.4) * 0.8; WI.whirl.rotation.y += dt * 2 * Math.min(4, WI.spinK); WI.whirl.children.forEach((m, i) => { m.position.x = Math.sin(t * 1.5 + i * 0.5) * (i * 0.25); });
  { const puff = 1 + Math.max(0, Math.sin(t * 0.8)) * 0.25; WI.cheeks.forEach(c => c.scale.set(3.6 * puff, 3.2 * puff, 3.2 * puff)); }
  WI.godArmL.rotation.z = Math.sin(t * 1.2) * 0.25; WI.godHead.rotation.y = Math.atan2(player.pos.x - WI.god.position.x, player.pos.z - WI.god.position.z) * 0.4; WI.godHead.rotation.x = -0.15;
  // standing on his hand moves you with him
  let txt = ''; if (!card) txt = nearWindGod() ? '<kbd>E</kbd> kalbėtis su Vėjo Dievu' : nearPup() ? '<kbd>E</kbd> kalbėtis su šuniuku · pelė – paglostyti' : windObjNear() ? '<kbd>E</kbd> apžiūrėti · <kbd>Space</kbd> ore – skristi su vėju' : player.grounded ? '<kbd>Space</kbd> – pašokti, laikyk ore – vėjas neš' : 'Laikyk <kbd>Space</kbd> – skrisk su vėju!';
  setPrompt(txt);
}
function windTest(n) {
  if (n === 2) { hideCard(); enterWind(); return; }
  digTest(); Q21.stage = 'done'; Q21.blown = Array.from({ length: 100 }, (_, i) => i + 1); saveQ21(); Q19.has = true; if (!Q19.num) Q19.num = '-123 4242'; saveQ19();
  toast('Bandymų pasaulis: Griaustinis išgelbėtas', 'P → Dievų grupė → parašyk „aš išgelbėjau griaustinio planetą“', '#bfefff');
}
