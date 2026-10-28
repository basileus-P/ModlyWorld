// ================= the Sea God's world (opens after reading the gods' chat on the Creator's phone) =================
// drive through the Sea Gate near the city → you are UNDER WATER. You swim (Space – up) between two
// "biomes" on the sea floor: an ordinary fish city and a ruined city where the poor fish live. The giant Sea God
// stands on the sea floor. A bubble ring takes you home.
const seaOpen = () => Q14.stage === 'done' && phoneRead;

// ---------- the Sea Gate on a road near the city ----------
const SGATE = {};
function buildSeaGate() {
  const clear = d => solids.every(s => s.dir.angleTo(d) * R > (s.r || Math.hypot(s.hx || 0, s.hz || 0)) + 9) && (!RAMP.d || RAMP.d.angleTo(d) * R > 30);
  let best = null, bd = 1e9;
  for (const path of roadPaths) for (let i = 0; i < path.s.length; i += 3) { const smp = path.s[i]; if (smp.bridge) continue; const dist = smp.d.angleTo(UP) * R; if (dist < 55) continue; const sc = Math.abs(dist - 72); if (sc < bd && clear(smp.d)) { bd = sc; best = smp; } }
  if (!best) return;
  const d = best.d, fwd = best.tan.clone();
  const g = new THREE.Group(); g.position.copy(d).multiplyScalar(R + best.h); orient(g, d, fwd); world.add(g); SGATE.g = g; SGATE.d = d; SGATE.fwd = fwd;
  const ring = mesh(new THREE.TorusGeometry(3.4, 0.45, 12, 40), mat(0x2a8ac8, { metalness: 0.4, roughness: 0.3, emissive: 0x0a3050 }), 0, 3.6, 0); g.add(ring);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; g.add(S(G.cone, mat(0x8fe0ff, { emissive: 0x2a8ac8 }), 0.25, 0.7, 0.25, Math.cos(a) * 3.9, 3.6 + Math.sin(a) * 3.9, 0).rotateZ(a - Math.PI / 2)); }
  const discMat = new THREE.MeshBasicMaterial({ color: 0x4ac8ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide }); const disc = mesh(new THREE.CircleGeometry(3.1, 40), discMat, 0, 3.6, 0); g.add(disc); SGATE.disc = disc;
  for (let i = 0; i < 3; i++) { const sw = mesh(new THREE.RingGeometry(0.6 + i * 0.9, 0.85 + i * 0.9, 32, 1, 0, Math.PI * 1.3), new THREE.MeshBasicMaterial({ color: 0xd8f6ff, transparent: true, opacity: 0.6, side: THREE.DoubleSide }), 0, 3.6, 0.02); g.add(sw); (SGATE.swirls = SGATE.swirls || []).push(sw); }
  for (const x of [-3.6, 3.6]) g.add(S(G.cyl, mat(0x1a5a8a), 0.4, 0.6, 0.4, x, 0.3, 0));
  const sign = makeSign('JŪROS VARTAI'); sign.position.set(4.6, 0, 1.5); g.add(sign);
  linearize(g); g.userData.noCollapse = true; SGATE.center = g.position.clone().addScaledVector(d, 1.5);
  SGATE.inspect = addInspect(g.position.clone().addScaledVector(d, 1), 'Jūros vartai', 'Mėlyni vartai, už kurių ošia jūra. Jūrų Dievas kviečia pas save. Įvažiuok į juos mašina!', 0);
  animators.push((dt, t) => { if (!g.visible) return; SGATE.swirls.forEach((s, i) => s.rotation.z = t * (1.2 + i * 0.4) * (i % 2 ? -1 : 1)); discMat.opacity = 0.45 + 0.15 * Math.sin(t * 3); });
  refreshSeaGate();
}
function refreshSeaGate() { if (!SGATE.g) return; SGATE.g.visible = seaOpen(); SGATE.inspect.r = seaOpen() ? 6 : 0; }
let seaWarn = 0, seaAsked = false;
const inSeaForever = () => { try { return localStorage.getItem('modly-insea') === '1'; } catch (_) { return false; } };
function updateSeaGate(dt) {
  if (!SGATE.g || !SGATE.g.visible || cinema || transitioning) return;
  seaWarn = Math.max(0, seaWarn - dt);
  const p = player.inCar ? (ride === auto ? auto.pos : car.pos) : player.pos;
  const dd = p.distanceTo(SGATE.center);
  if (dd > 7) seaAsked = false;
  if (dd < 3.6) {
    if (player.inCar) { if (!seaAsked && !card) { seaAsked = true; askChoice('Jūros vartai', 'Jei įvažiuosi pas Jūrų Dievą, atgal grįžti NEBEGALĖSI – liksi gyventi po vandeniu visam laikui! Važiuoti?', '#4ac8ff', yes => { if (yes) goToSea(); }); } }
    else if (seaWarn <= 0) { seaWarn = 3; toast('Pas Jūrų Dievą reikia nuvažiuoti!', 'Įvažiuok į vartus mašina (F – iškviesti)', '#4ac8ff'); }
  }
}
function goToSea() {
  if (transitioning) return; transitioning = true; cancelPlace(true); stopClimb(); dropAll(); hideCard(); stopSiren();
  if (ride === auto) exitAuto(); else onCar();
  noiseHit(1.2, { ft: 'bandpass', f: 500, fto: 1600, vol: 0.2 }); [392, 330, 262, 196].forEach((f, i) => tone(f, 0.5, { type: 'sine', vol: 0.05, when: i * 0.12 }));
  toast('Pliūkšt!', 'Važiuoji per Jūros vartus…', '#4ac8ff');
  fadeTo(() => { transitioning = false; enterSea(); });
}

// ---------- the underwater world ----------
const seaScene = new THREE.Scene(); seaScene.background = new THREE.Color(0x0a4a7a); seaScene.fog = new THREE.Fog(0x0e5a8a, 18, 140);
seaScene.add(new THREE.AmbientLight(0x9ad8ff, 0.5)); seaScene.add(new THREE.HemisphereLight(0x8fe0ff, 0x1a3a4a, 0.7));
{ const l = new THREE.DirectionalLight(0xd8f4ff, 0.9); l.position.set(30, 100, 20); seaScene.add(l); }
const SEA = { built: false, isl: [], boxes: [], fish: [], bubbles: [], god: null };
const SEA_TOP = 34;   // the water surface far above
function seaArea(name, x, z, r, col) {
  const g = new THREE.Group(); g.position.set(x, 0, z); seaScene.add(g);
  g.add(S(G.cyl, mat(col, { roughness: 0.9 }), r, 0.3, r, 0, 0.05, 0));
  const a = { name, x, z, r, g }; SEA.isl.push(a); return a;
}
function seaHouse(ar, lx, lz, w, d, h, col, roof, ruined) {
  const g = new THREE.Group(); g.position.set(lx, 0, lz); ar.g.add(g);
  if (!ruined) {
    g.add(S(G.box, mat(col), w, h, d, 0, h / 2, 0)); g.add(S(G.dome, mat(roof), w * 0.62, h * 0.45, d * 0.62, 0, h, 0));
    for (let k = 0; k < Math.floor(h / 2); k++) for (const sx of [-0.25, 0.25]) g.add(S(G.cyl, bmat(0xfff2b0), w * 0.1, 0.06, w * 0.1, sx * w, 1.4 + k * 2, d / 2 + 0.03).rotateX(Math.PI / 2));
    g.add(S(G.cyl, mat(0x2a5a7a), 0.55, 0.06, 0.55, 0, 0.9, d / 2 + 0.03).rotateX(Math.PI / 2));
    for (let k = 0; k < 3; k++) g.add(S(G.sph, mat(pick([0xff8aa0, 0xffd23a, 0xff6a3d])), 0.25, 0.25, 0.25, rr(-w / 2, w / 2), h + rr(0, 0.6), rr(-d / 2, d / 2)));
  } else {
    const wall = mat(0x6a7a7a), dark = mat(0x4a5656), weed = mat(0x2a7a4a);
    g.add(S(G.box, wall, w, h * 0.55, 0.3, 0, h * 0.27, -d / 2)); g.add(S(G.box, wall, 0.3, h * 0.8, d, -w / 2, h * 0.4, 0));
    const broken = S(G.box, dark, w * 0.6, h * 0.35, 0.3, w * 0.2, h * 0.17, d / 2); broken.rotation.z = 0.15; g.add(broken);
    for (let k = 0; k < 5; k++) g.add(S(G.dodec, dark, rr(0.3, 0.7), rr(0.2, 0.5), rr(0.3, 0.7), rr(-w / 2, w / 2), 0.15, rr(-d / 2, d / 2)));
    for (let k = 0; k < 4; k++) g.add(S(G.cyl6, weed, 0.08, rr(1.5, 3), 0.08, rr(-w / 2, w / 2), 1, rr(-d / 2, d / 2)));
    const blanket = S(G.box, mat(pick([0x6a5a4a, 0x5a6a7a, 0x7a6a8a])), w * 0.7, 0.05, d * 0.6, 0, h * 0.45, -0.2); blanket.rotation.x = 0.2; g.add(blanket);
  }
  g.rotation.y = rr(-0.15, 0.15);
  SEA.boxes.push({ x: ar.x + lx, z: ar.z + lz, hx: w / 2 + 0.2, hz: d / 2 + 0.2, h: ruined ? h * 0.8 : h + h * 0.4 });
}
function makeFishPerson(col, poor) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const c = mat(col, { roughness: 0.45 }), fin = mat(poor ? 0x8a8a8a : pick([0xffd23a, 0xff8aa0, 0x8fe0ff, 0xffffff]), { roughness: 0.5 });
  body.add(S(G.sph, c, 0.55, 0.6, 0.85, 0, 0, 0));
  const tail = new THREE.Group(); tail.position.set(0, 0, -0.8); body.add(tail); const tf = S(G.cone, fin, 0.45, 0.6, 0.12, 0, 0, -0.3); tf.rotation.x = -Math.PI / 2; tail.add(tf);
  body.add(S(G.cone, fin, 0.25, 0.5, 0.06, 0, 0.6, -0.1).rotateX(-0.3));
  const fins = []; for (const sx of [-1, 1]) { const f = S(G.sph, fin, 0.08, 0.2, 0.3, sx * 0.55, -0.1, 0.1); body.add(f); fins.push(f); }
  for (const sx of [-0.3, 0.3]) { body.add(S(G.sph, bmat(0xffffff), 0.17, 0.2, 0.1, sx, 0.15, 0.72)); body.add(S(G.sph, bmat(0x111111), 0.08, 0.1, 0.05, sx, 0.15, 0.8)); }
  body.add(S(G.sph, mat(0xd85a6a), 0.12, 0.06, 0.05, 0, -0.15, 0.82));
  if (poor) { for (let k = 0; k < 3; k++) body.add(S(G.box, mat(pick([0xa86a4a, 0x5a7a9a, 0x9a8a4a])), 0.2, 0.2, 0.05, rr(-0.3, 0.3), rr(-0.2, 0.3), rr(-0.3, 0.5)).rotateY(Math.PI / 2)); }
  else if (Math.random() < 0.4) { body.add(S(G.cyl, mat(pick([0x1a1a2a, 0xe8262e, 0x3a7bff])), 0.3, 0.3, 0.3, 0, 0.75, 0.1)); }
  g.userData = { body, tail, fins }; return g;
}
function seaFish(ar, lx, lz, poor, lines) {
  const m = makeFishPerson(poor ? pick([0x8a8478, 0x7a8a8a, 0x9a8a7a]) : pick([0xff8a3a, 0x3ac8ff, 0xffd23a, 0xff6a9a, 0x8aff6a, 0xb08aff]), poor);
  const y = poor && Math.random() < 0.5 ? 0.6 : rr(1.2, 3);
  m.position.set(ar.x + lx, y, ar.z + lz); seaScene.add(m);
  const p = { m, isl: ar, fwd: new V3(rr(-1, 1), 0, rr(-1, 1)).normalize(), t: rr(1, 4), poor, lines, rest: y < 0.7, y0: y, ph: rr(0, 6) };
  SEA.fish.push(p); return p;
}
function buildSea() {
  if (SEA.built) return; SEA.built = true;
  // the sea floor, light rays, the surface far above
  seaScene.add(mesh(new THREE.PlaneGeometry(900, 900), mat(0x9a9878, { roughness: 1 }), 0, 0, 0).rotateX(-Math.PI / 2));
  for (let i = 0; i < 60; i++) { const a = rr(0, 6.3), r = rr(20, 300); seaScene.add(S(G.dodec, mat(0x7a7a6a), rr(1, 4), rr(0.5, 2), rr(1, 4), Math.cos(a) * r, 0.2, Math.sin(a) * r)); }
  const surf = mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshBasicMaterial({ color: 0x6ad8ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide, fog: false }), 0, SEA_TOP + 6, 0); surf.rotation.x = Math.PI / 2; seaScene.add(surf);
  SEA.rays = []; for (let i = 0; i < 14; i++) { const r = mesh(new THREE.PlaneGeometry(rr(3, 7), 60), new THREE.MeshBasicMaterial({ color: 0xbff0ff, transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), rr(-80, 80), 22, rr(-140, 60)); r.rotation.set(0, rr(0, 3), 0.25); seaScene.add(r); SEA.rays.push(r); }
  // seaweed and coral everywhere
  const weedM = [mat(0x2a8a4a), mat(0x3aa85a), mat(0x1a6a3a)], coralM = [mat(0xff6a8a), mat(0xffa04a), mat(0xb06aff), mat(0xff4a6a)];
  SEA.weeds = [];
  for (let i = 0; i < 160; i++) {
    const a = rr(0, 6.3), r = rr(8, 200), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.random() < 0.6) { const w = new THREE.Group(); w.position.set(x, 0, z); for (let k = 0; k < 4; k++) w.add(S(G.cyl6, pick(weedM), 0.1, rr(2, 6), 0.1, rr(-0.4, 0.4), 0, rr(-0.4, 0.4))); w.children.forEach(c => c.position.y = c.scale.y / 2); seaScene.add(w); SEA.weeds.push(w); }
    else { const c = new THREE.Group(); c.position.set(x, 0, z); const m = pick(coralM); for (let k = 0; k < 5; k++) { const b = S(G.cyl6, m, 0.15, rr(0.8, 1.8), 0.15, rr(-0.5, 0.5), 0.5, rr(-0.5, 0.5)); b.rotation.set(rr(-0.5, 0.5), 0, rr(-0.5, 0.5)); c.add(b); } c.add(S(G.ico1, m, 0.6, 0.5, 0.6, 0, 0.3, 0)); seaScene.add(c); }
  }
  // 1) the ordinary fish city
  const city = seaArea('Žuvų Miestas', 0, -90, 42, 0xe8e0c8);
  city.g.add(S(G.cyl, mat(0xd8d0c0), 14, 0.12, 14, 0, 0.18, 0));
  { const shell = S(G.dome, mat(0xffd8e8, { roughness: 0.3 }), 3, 2.2, 3, 0, 0.2, 0); city.g.add(shell); city.g.add(S(G.sph, mat(0xffffff, { roughness: 0.1, metalness: 0.3, emissive: 0x8a8aa0 }), 1, 1, 1, 0, 2.6, 0)); SEA.boxes.push({ x: 0, z: -90, hx: 3, hz: 3, h: 3.2 }); }
  const cols = [0xff9a8a, 0xffd88a, 0x8ad8ff, 0xb8ff9a, 0xd8a8ff, 0xffffff], roofs = [0xff8ab8, 0xffd23a, 0x6ad8ff];
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.2, r = i % 2 ? 22 : 31; seaHouse(city, Math.cos(a) * r, Math.sin(a) * r, rr(5, 7), rr(5, 7), rr(4, 8), pick(cols), pick(roofs)); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const j = new THREE.Group(); j.position.set(Math.cos(a) * 16, 4, Math.sin(a) * 16); city.g.add(j); j.add(S(G.dome, mat(0xbfe8ff, { transparent: true, opacity: 0.6, emissive: 0x6ad8ff }), 0.6, 0.5, 0.6)); for (let k = 0; k < 4; k++) j.add(S(G.cyl6, mat(0xbfe8ff, { transparent: true, opacity: 0.5 }), 0.03, 1.2, 0.03, rr(-0.3, 0.3), -0.6, rr(-0.3, 0.3))); (SEA.jellies = SEA.jellies || []).push(j); }
  const cityLines = ['Blub! Sveikas atvykęs į Žuvų Miestą! Čia viskas gerai… beveik.', 'Mes turime namus iš koralų ir kriauklių fontaną. O ten, už tamsaus vandens, – senasis miestas. Jį sugriovė didžiulė banga.', 'Jūrų Dievas mus saugo. Bet senojo miesto žuvims jis nespėjo padėti. Blub.', 'Ar matei mūsų perlą? Jis šviečia net naktį!', 'Tu toks keistas! Neturi pelekų! Bet kvėpuoji po vandeniu – šaunu!', 'Mano tėtis plaukia greičiau už ryklį. Na, beveik.'];
  for (let i = 0; i < 12; i++) { const a = rr(0, 6.3), r = rr(6, 26); seaFish(city, Math.cos(a) * r, Math.sin(a) * r, false, cityLines); }
  // 2) the ruined city where the poor fish live
  const ruin = seaArea('Sugriuvęs Miestas', 95, 35, 38, 0x9a9a88);
  buildFamilies(ruin);
  { const j = new THREE.Group(); j.position.set(0, 1.4, 0); ruin.g.add(j); j.add(S(G.dome, mat(0xffe9a0, { transparent: true, opacity: 0.7, emissive: 0xffc04a }), 0.9, 0.7, 0.9)); for (let k = 0; k < 6; k++) j.add(S(G.cyl6, mat(0xffe9a0, { transparent: true, opacity: 0.5 }), 0.03, 1.4, 0.03, rr(-0.5, 0.5), -0.7, rr(-0.5, 0.5))); const l = new THREE.PointLight(0xffc04a, 1.2, 12); l.position.y = 0.3; j.add(l); SEA.lamp = j; }
  for (let i = 0; i < 4; i++) { const a = rr(0, 6.3), r = rr(4, 11); ruin.g.add(S(G.dodec, mat(pick([0x6a5a4a, 0x5a6a7a])), 1.6, 0.6, 1.2, Math.cos(a) * r, 0.3, Math.sin(a) * r)); }
  const poorLines = ['Blub… Mūsų namus sugriovė didžiulė banga. Dabar gyvename čia, tarp griuvėsių.', 'Neturime nei kriauklių, nei maisto. Bet turime vienas kitą.', 'Kartą čia buvo gražiausias žuvų miestas jūroje. Gal kada nors vėl bus.', 'Gal turi bent kelis planktono trupinėlius? …Ne? Nieko tokio. Ačiū, kad pakalbinai.', 'Mažieji žuviukai žaidžia su akmenukais. Žaislų neturime.', 'Jūrų Dievas sako, kad atkeliaus pagalba. Gal tai tu?', 'Mano pelekas suplyšęs nuo to laiko, kai atėjo banga. Bet aš vis tiek plaukiu.'];
  for (let i = 0; i < 4; i++) { const a = rr(0, 6.3), r = rr(2, 8); seaFish(ruin, Math.cos(a) * r, Math.sin(a) * r, true, poorLines); }
  // little wild fish swimming in schools
  SEA.school = []; for (let i = 0; i < 40; i++) { const f = new THREE.Group(), c = mat(pick([0xffd23a, 0x6ad8ff, 0xff8a3a, 0xffffff])); f.add(S(G.sph, c, 0.12, 0.15, 0.3)); f.add(S(G.cone, c, 0.12, 0.15, 0.04, 0, 0, -0.32).rotateX(-Math.PI / 2)); seaScene.add(f); SEA.school.push({ f, a: rr(0, 6.3), r: rr(10, 40), h: rr(3, 12), sp: rr(0.2, 0.5), cx: rr(-40, 40), cz: rr(-60, 20) }); }
  // the giant Sea God standing on the sea floor
  { const g = new THREE.Group(); g.position.set(-45, 0, -20); seaScene.add(g); SEA.god = g;
    const skin = mat(0x5ab8c8, { roughness: 0.5 }), hair = mat(0xe8f4ff, { roughness: 0.8 }), gold = mat(0xffd23a, { metalness: 0.8, roughness: 0.25 }), tail = mat(0x2a8a7a, { roughness: 0.4 });
    g.add(S(G.cyl, tail, 3, 6, 3.5, 0, 3, 0)); g.add(S(G.cone, tail, 4, 3, 1, 0, 0.6, -3).rotateX(-1.2));
    g.add(S(G.sph, skin, 4, 5, 3, 0, 9, 0)); g.add(S(G.sph, skin, 2.4, 2.4, 2.3, 0, 15.5, 0.3));
    for (const x of [-0.8, 0.8]) { g.add(S(G.sph, bmat(0xffffff), 0.45, 0.45, 0.2, x, 15.9, 2.4)); g.add(S(G.sph, bmat(0x1a3a6a), 0.22, 0.22, 0.1, x, 15.9, 2.55)); }
    g.add(S(G.ico1, hair, 2.2, 2.6, 1.2, 0, 13.4, 1.6)); g.add(S(G.ico1, hair, 2.8, 1.6, 2.6, 0, 17.1, -0.3));
    g.add(S(G.cyl, gold, 1.8, 0.6, 1.8, 0, 18.1, 0)); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; g.add(S(G.cone, gold, 0.25, 1, 0.25, Math.cos(a) * 1.7, 18.8, Math.sin(a) * 1.7)); }
    for (const sx of [-1, 1]) { const arm = S(G.cyl, skin, 0.9, 6, 0.9, sx * 4.6, 11, 0.6); arm.rotation.z = sx * 0.5; g.add(arm); }
    const tri = new THREE.Group(); tri.position.set(6.8, 0, 1.2); g.add(tri); tri.add(S(G.cyl, gold, 0.25, 22, 0.25, 0, 11, 0)); for (const x of [-1, 0, 1]) tri.add(S(G.cone, gold, 0.3, 1.6, 0.3, x * 0.9, 22.6, 0)); tri.add(S(G.box, gold, 2.2, 0.3, 0.3, 0, 21.8, 0));
    SEA.boxes.push({ x: -45, z: -20, hx: 4.5, hz: 4, h: 22 });
    // the Sea God's big phone – he holds it once all the families are helped
    { const ph = new THREE.Group(); ph.position.set(-2.6, 10.6, 3.4); ph.rotation.set(-0.25, 0.35, 0.1); g.add(ph); SEA.phone = ph;
      ph.add(S(G.box, mat(0x1a1a24, { metalness: 0.5, roughness: 0.3 }), 2.4, 4.2, 0.3, 0, 0, 0));
      const c = document.createElement('canvas'); c.width = 192; c.height = 336; const x = c.getContext('2d');
      x.fillStyle = '#17142a'; x.fillRect(0, 0, 192, 336); x.fillStyle = '#ffd23a'; x.font = 'bold 20px sans-serif'; x.fillText('Dievų grupė', 14, 30);
      const bub = (y, w, col, right) => { x.fillStyle = col; x.beginPath(); x.roundRect ? x.roundRect(right ? 178 - w : 14, y, w, 34, 12) : x.rect(right ? 178 - w : 14, y, w, 34); x.fill(); };
      bub(50, 130, '#8fd8ff'); bub(94, 110, '#e8e8f2', true); bub(138, 140, '#8fd8ff'); bub(182, 120, '#ffb86a'); bub(226, 150, '#ffb86a'); bub(270, 160, '#ffd23a');
      const scr = mesh(new THREE.PlaneGeometry(2.1, 3.8), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }), 0, 0, 0.16); ph.add(scr);
      ph.add(S(G.sph, skin, 0.9, 0.9, 0.9, 0.9, -1.6, -0.4)); ph.add(S(G.sph, skin, 0.4, 0.9, 0.4, -1.2, 0.2, 0.2));
      ph.visible = Q16.stage === 'done'; }
  }
  // bubbles
  for (let i = 0; i < 60; i++) { const b = mesh(G.sph, new THREE.MeshBasicMaterial({ color: 0xdff8ff, transparent: true, opacity: 0.45 })); b.scale.setScalar(rr(0.05, 0.18)); b.position.set(rr(-60, 60), rr(0, 30), rr(-120, 50)); seaScene.add(b); SEA.bubbles.push(b); }
  linearize(seaScene);
}
function enterSea() {
  buildSea(); mode = 'sea'; try { localStorage.setItem('modly-insea', '1'); localStorage.removeItem('modly-pos'); } catch (_) { } seaScene.add(player.mesh); musicSet(2); setScope(false);
  player.pos.set(-8, 0, 22); player.fwd.set(-0.6, 0, -0.8).normalize(); player.vel.set(0, 0, 0); player.vr = 0; player.pitch = 0.25; player.up.set(0, 1, 0); player.grounded = true;
  camera.position.set(player.pos.x + 4, 4, player.pos.z + 6); camera.up.set(0, 1, 0);
  $('bName').textContent = 'Jūrų pasaulis'; $('bEn').textContent = 'Po vandeniu'; $('bAtm').textContent = 'Viskas po vandeniu. Žuvų Miestas ir Sugriuvęs Miestas, kuriame gyvena vargšės žuvys.'; document.documentElement.style.setProperty('--biome', '#4ac8ff');
  if (!SEA.welcomed) { SEA.welcomed = true; setTimeout(() => toast('Tu po vandeniu – visam laikui!', 'Kelio atgal nebėra. Space – plaukti aukštyn, pelė – mosuoti rankomis. Nueik pas Jūrų Dievą!', '#4ac8ff'), 600); }
}
function leaveSea() {
  if (transitioning) return; transitioning = true; hideCard();
  fadeTo(() => {
    transitioning = false; mode = 'planet'; world.add(player.mesh); player.mesh.visible = true;
    const side = new V3().crossVectors(SGATE.d, SGATE.fwd).normalize(), d = moveAlong(SGATE.d, side, 6);
    player.pos.copy(d).multiplyScalar(R + groundH(d) + 0.4); player.up.copy(d); player.fwd.copy(SGATE.fwd).projectOnPlane(d).normalize(); player.vel.set(0, 0, 0); player.vr = 0; curBiome = -1;
    camera.position.copy(player.pos).addScaledVector(d, 4).addScaledVector(player.fwd, -6);
    toast('Grįžai namo', 'Jūros vartai liks atviri – grįžti gali bet kada', '#4ac8ff');
  });
}
function seaHand(side) {
  hands[side].hold = true; sfx.whoosh(0.06);
  const hp = player.pos.clone().add(new V3(0, 1.4, 0)).addScaledVector(player.fwd, 1.2);
  for (let i = 0; i < 5; i++) { const bb = mesh(G.sph, new THREE.MeshBasicMaterial({ color: 0xdff8ff, transparent: true, opacity: 0.6 })); bb.scale.setScalar(rr(0.05, 0.12)); bb.position.copy(hp).add(new V3(rr(-0.3, 0.3), rr(-0.2, 0.2), rr(-0.3, 0.3))); seaScene.add(bb); let tt = 0; const vy = rr(1.5, 3); fx.push(d2 => { tt += d2; bb.position.y += d2 * vy; if (tt > 1.2) { seaScene.remove(bb); return false; } return true; }); }
  const f = nearFish(); if (f && Math.random() < 0.5) bubbleIn(seaScene, f.m.position, pick(['Blub!', 'Labas!', 'Hi hi!', 'Blub blub!']), 1);
}
function nearFish() { let best = null, bd = 3; for (const p of SEA.fish) { const d = p.m.position.distanceTo(player.pos.clone().add(new V3(0, 1, 0))); if (d < bd) { bd = d; best = p; } } return best; }
const nearSeaGod = () => Math.hypot(player.pos.x - SEA.god.position.x, player.pos.z - SEA.god.position.z) < 12;
function seaAction() {
  if (card) { if (card.kind === 'talk') advanceTalk(); else hideCard(); return; }
  if (oceanAction()) return;
  const p = nearFish(); if (p) { startTalk(p.poor ? 'Vargšė žuvis' : 'Žuvis miestietė', [pick(p.lines)], p.poor ? '#c8b8a0' : '#4ac8ff'); bubbleIn(seaScene, p.m.position, 'Blub!', 1.2); return; }
  if (nearSeaGod() && Q16.stage === 'done' && !inSun()) { giveFishSkin(); openGodPhone(); return; }
  if (nearSeaGod()) { talkSeaGod(); return; }
}
function talkSeaGod() {
  if (Q16.stage === 'help') { const n = helpedN(); startTalk('Jūrų Dievas', [`Padėjai ${n} šeimoms iš 18. ${n < 9 ? 'Dar daug darbo, bet tu gali!' : 'Jau daugiau nei pusė! Blub!'}`, 'Maisto duoda turgus Žuvų Mieste, kriauklės švyti rožiškai dugne, perlai – geldelėse ant aukštų uolų, o pasiklydę mažyliai švyti geltonai.'], '#4ac8ff'); return; }
  if (Q16.stage === 'done') { startTalk('Jūrų Dievas', ['Mano vandenynas vėl laimingas. Tu – tikras vandenyno gelbėtojas! Pas mane visada laukiamas.', 'O, Saulės Dievė vis klausia apie tave. Pasižiūrėk mano telefoną!'], '#4ac8ff', () => { giveFishSkin(); setTimeout(() => { if (mode === 'sea' && !card) openGodPhone(); }, 900); }); return; }
  startTalk('Jūrų Dievas', [
    'Ooo! Mažasis žaliasis! Tas pats, kuris nugalėjo demoną? Sveikas atvykęs į mano povandeninį pasaulį!',
    'Čia viskas po vandeniu, o gyvena ne žmonės, o žuvys. Yra du miestai: Žuvų Miestas, kur viskas gerai, ir Sugriuvęs Miestas.',
    'Kartą atėjo didžiulė banga ir sugriovė senąjį miestą. Ten dabar gyvena 18 vargšų žuvų šeimų – be namų, be maisto, be šviesos.',
    'Prašau, padėk joms! Kiekviena šeima pasakys, ko jai reikia: maisto, kriauklių namui, perlo šviesai arba surasti pasiklydusį mažylį.'
  ], '#4ac8ff', () => { if (Q16.stage === 'none') { Q16.stage = 'help'; saveQ16(); refreshOcean(); sfx.chime(); toast('Jūrų Dievo prašymas: padėk 18 šeimų!', 'Sugriuvusiame Mieste – šeimos su geltonu „!“. Paklausk, ko joms reikia (E)', '#4ac8ff'); } });
}
function updateSea(dt, t) {
  // swimming: walk on the sea floor, hold Space to swim up, let go to sink slowly
  const f = player.down ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = player.down ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 9 : 5.5; _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, Math.min(1, (player.grounded ? 8 : 3) * dt));
  if (keys.Space) { player.vr = Math.min(5, player.vr + 14 * dt); player.grounded = false; if (Math.random() < dt * 6) { const bb = mesh(G.sph, new THREE.MeshBasicMaterial({ color: 0xdff8ff, transparent: true, opacity: 0.6 })); bb.scale.setScalar(0.08); bb.position.copy(player.pos).add(new V3(0, 1.9, 0)); seaScene.add(bb); let tt = 0; fx.push(d2 => { tt += d2; bb.position.y += d2 * 2; if (tt > 1.5) { seaScene.remove(bb); return false; } return true; }); } }
  else player.vr = Math.max(-2.2, player.vr - 6 * dt);
  player.pos.addScaledVector(player.vel, dt); player.pos.y += player.vr * dt;
  let ground = 0; const rad = 0.4;
  for (const b of SEA.boxes) { const dx = player.pos.x - b.x, dz = player.pos.z - b.z, ex = b.hx + rad - Math.abs(dx), ez = b.hz + rad - Math.abs(dz); if (ex <= 0 || ez <= 0) continue; if (player.pos.y >= b.h - 0.5) { if (b.h > ground) ground = b.h; } else if (ex < ez) player.pos.x += dx < 0 ? -ex : ex; else player.pos.z += dz < 0 ? -ez : ez; }
  if (player.pos.y <= ground) { player.pos.y = ground; if (player.vr < 0) player.vr = 0; player.grounded = true; } else player.grounded = false;
  if (player.pos.y > SEA_TOP) { player.pos.y = SEA_TOP; player.vr = Math.min(0, player.vr); }
  player.pos.x = clamp(player.pos.x, -300, 300); player.pos.z = clamp(player.pos.z, -300, 300);
  player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd);
  if (player.grounded) animateMan(dt, f !== 0 || s !== 0, sp);
  else {
    const p = player.mesh.userData.parts, sw = Math.sin(t * 5) * 0.6, k = Math.min(1, dt * 12);
    hands.L.reach = lerp(hands.L.reach, hands.L.hold ? 1 : 0, k); hands.R.reach = lerp(hands.R.reach, hands.R.hold ? 1 : 0, k);
    const rl = hands.L.reach, rR = hands.R.reach;
    p.armL.rotation.set(lerp(-1.2 + sw * 0.5, -1.5, rl), 0, lerp(0.6, -0.12, rl)); p.armR.rotation.set(lerp(-1.2 - sw * 0.5, -1.5, rR), 0, lerp(-0.6, 0.12, rR));
    p.legL.rotation.x = sw * 0.6; p.legR.rotation.x = -sw * 0.6;
  }
  const dist = 6.2, pitch = player.pitch;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1)); if (_ct.y < 0.5) _ct.y = 0.5;
  camera.position.lerp(_ct, Math.min(1, dt * 8)); camera.up.set(0, 1, 0); camera.lookAt(player.pos.clone().add(new V3(0, 1.4, 0)));
  // life under water
  for (const w of SEA.weeds) w.rotation.z = Math.sin(t * 1.2 + w.position.x) * 0.12;
  for (const b of SEA.bubbles) { b.position.y += dt * 1.2; if (b.position.y > SEA_TOP) b.position.y = 0; }
  for (const r of SEA.rays) r.material.opacity = 0.05 + 0.03 * Math.sin(t * 0.8 + r.position.x);
  if (SEA.jellies) SEA.jellies.forEach((j, i) => j.position.y = 4 + Math.sin(t * 1.3 + i) * 0.5);
  if (SEA.lamp) SEA.lamp.position.y = 1.4 + Math.sin(t * 1.1) * 0.3;
  for (const sc of SEA.school) { sc.a += sc.sp * dt; sc.f.position.set(sc.cx + Math.cos(sc.a) * sc.r, sc.h + Math.sin(t + sc.a * 3) * 0.5, sc.cz + Math.sin(sc.a) * sc.r); sc.f.rotation.y = -sc.a; }
  for (const p of SEA.fish) {
    const ud = p.m.userData; ud.tail.rotation.y = Math.sin(t * (p.rest ? 3 : 8) + p.ph) * 0.5; ud.fins.forEach((fn, i) => fn.rotation.z = Math.sin(t * 6 + i) * 0.4);
    if (p.rest) { p.m.position.y = p.y0 + Math.sin(t + p.ph) * 0.05; continue; }
    p.t -= dt; if (p.t < 0) { p.t = rr(2, 5); p.fwd.applyAxisAngle(UP, rr(-2, 2)); }
    const pos = p.m.position; pos.addScaledVector(p.fwd, dt * 1.6); pos.y = p.y0 + Math.sin(t * 0.8 + p.ph) * 0.4;
    const dx = pos.x - p.isl.x, dz = pos.z - p.isl.z; if (Math.hypot(dx, dz) > p.isl.r - 3) p.fwd.set(-dx, 0, -dz).normalize();
    for (const bx of SEA.boxes) if (pos.y < bx.h && Math.abs(pos.x - bx.x) < bx.hx && Math.abs(pos.z - bx.z) < bx.hz) { p.fwd.negate(); pos.addScaledVector(p.fwd, 0.3); }
    p.m.rotation.y = Math.atan2(p.fwd.x, p.fwd.z);
  }
  if (SEA.phone) { SEA.phone.visible = Q16.stage === 'done'; SEA.phone.position.y = 10.6 + Math.sin(t * 1.3) * 0.15; }
  SEA.god.rotation.y = Math.atan2(player.pos.x - SEA.god.position.x, player.pos.z - SEA.god.position.z) * 0.4; SEA.god.position.y = Math.sin(t * 0.8) * 0.2;
  updateOcean(dt, t);
  let txt = '';
  const fam = nearFamily();
  if (!card && nearStall() && Q16.stage === 'help') txt = '<kbd>E</kbd> paimti maisto vargšėms šeimoms';
  else if (!card && fam) txt = Q16.helped.includes(fam.i) ? `<kbd>E</kbd> kalbėtis: šeima ${fam.name}` : Q16.stage === 'help' ? `<kbd>E</kbd> šeima ${fam.name} – reikia ${famNeed(fam)}` : '<kbd>E</kbd> kalbėtis su vargšų šeima';
  else if (!card) { const p = nearFish(); if (p) txt = `<kbd>E</kbd> kalbėtis: ${p.poor ? 'vargšė žuvis' : 'žuvis miestietė'}`; else if (nearSeaGod() && Q16.stage === 'done' && !inSun()) txt = '<kbd>E</kbd> pažiūrėti į Jūrų Dievo telefoną'; else if (nearSeaGod()) txt = '<kbd>E</kbd> kalbėtis su Jūrų Dievu'; else txt = '<kbd>Space</kbd> – plaukti aukštyn · pelės mygtukai – mosuoti rankomis'; }
  setPrompt(txt);
  updateQuestHud();
}
