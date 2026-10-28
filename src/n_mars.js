// ================= God's second command: "The Demon's Horn" =================
const Q2 = { stage: 'none', dinosDone: false };   // none | rocket | horn | done
const Q2_WAIT = 5 * 60 * 1000;                    // 5 minutes after the chicks
try { const s = JSON.parse(localStorage.getItem('modly-quest2') || 'null'); if (s && s.stage) { Q2.stage = s.stage; Q2.dinosDone = !!s.dinosDone; } } catch (_) { }
let q1DoneAt = 0;
try { q1DoneAt = +localStorage.getItem('modly-quest1-doneAt') || 0; } catch (_) { }
function saveQ2() { try { localStorage.setItem('modly-quest2', JSON.stringify({ stage: Q2.stage, dinosDone: Q2.dinosDone })); } catch (_) { } }
function markQ1Done() { q1DoneAt = Date.now(); try { localStorage.setItem('modly-quest1-doneAt', String(q1DoneAt)); } catch (_) { } }
function q2WaitLeft() { if (!q1DoneAt) markQ1Done(); return Math.max(0, Q2_WAIT - (Date.now() - q1DoneAt)); }

const Q2_LINES = [
  'Atėjo laikas antrajam įsakymui: DEMONO RAGAS.',
  'Paskutinėje mūšio su manimi akimirkoje demonas prarado vieną ragą. Jis nulūžo ir nukrito į Marsą – raudonąją planetą už burbulo.',
  'Ten ragą rado drakono mama ir nusinešė į savo pilį. Pilį saugo jos vaikai – išdykę dinozauriukai.',
  'Begalinėje Dykumoje stovi raketa. Ji nuskraidins tave į Marsą. Ten gausi lazerinį šautuvą – be jo dinozauriukų neįveiksi.',
  'Nugalėk dinozauriukus, bet jokiu būdu NEPAŽADINK drakono mamos. Vaikščiok ramiai, nebėgiok, nešokinėk ir nešaudyk jos kambaryje.',
  'Paimk ragą ir atnešk jį į muziejų Pradžios Mieste. Ten demonas jo nebeatgaus.'
];
const Q2_STATUS = () => Q2.stage === 'horn'
  ? ['Ragas pas tave. Neškite jį į muziejų Pradžios Mieste – greičiau, kol demonas nepajuto.']
  : ['Raketa laukia Begalinėje Dykumoje. Marse rasi pilį, dinozauriukus ir drakono mamą. Tyliai, mažasis.'];
const Q2_DONE = ['Demono ragas saugiai muziejuje. Jaučiu, kaip demonas silpsta.', 'Tu drąsus ir protingas – ir neprižadinai drakono mamos. Retas sugebėtų.', 'Pailsėk. Kitas įsakymas jau bręsta.'];

// ---------- rocket in the Endless Desert ----------
let rocketSpot = null, desertRocket = null;
function reserveRocketSpot() {
  let best = null, bs = -1e9;
  for (const path of roadPaths) for (const x of path.s) { if (x.bridge) continue; weights(x.d.x, x.d.y, x.d.z, W); if (W[1] < 0.85) continue; const sc = x.d.dot(BC[1]); if (sc > bs) { bs = sc; best = x; } }
  if (!best) return;
  let d = moveAlong(best.d, best.side, -(ROAD_HALF + 9)); if (TH(d) < 0.4) d = moveAlong(best.d, best.side, ROAD_HALF + 12);
  rocketSpot = { d, face: best.d.clone() };
  reserved.push({ d: d.clone(), r: 7 });
}
function makeRocket() {
  const g = new THREE.Group(), w = mat(0xf2f2f4, { metalness: 0.3, roughness: 0.35 }), r = mat(0xd9342b, { metalness: 0.2, roughness: 0.4 });
  g.add(S(G.cyl, w, 1.4, 9, 1.4, 0, 6, 0));
  g.add(S(G.cone, r, 1.4, 3.4, 1.4, 0, 12.2, 0));
  g.add(S(G.cyl, r, 1.42, 0.5, 1.42, 0, 9.5, 0));
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2, f = S(G.box, r, 0.15, 3, 1.6, Math.cos(a) * 1.6, 2.4, Math.sin(a) * 1.6); f.rotation.y = -a; g.add(f); }
  for (const y of [7.6, 5.6]) { const _o = S(G.cyl, mat(0x40536f, { metalness: 0.6, roughness: 0.1 }), 0.42, 0.1, 0.42, 0, y, 1.38); _o.rotation.x = Math.PI / 2; g.add(_o); }
  g.add(S(G.cyl, mat(0x30343e, { metalness: 0.6 }), 0.9, 1.2, 0.9, 0, 1.0, 0));
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireTex, color: 0xff8030, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); flame.position.y = -0.4; flame.scale.setScalar(0.01); g.add(flame);
  g.add(mesh(new THREE.PlaneGeometry(2.2, 0.5), new THREE.MeshBasicMaterial({ map: labelTex('MARSAS-1', '#f2f2f4', '#d9342b', 512, 112), side: THREE.DoubleSide }), 0, 4.2, 1.42));
  g.userData.flame = flame;
  return g;
}
function buildDesertRocket() {
  if (!rocketSpot) return;
  const { d, face } = rocketSpot, g = new THREE.Group(); g.position.copy(d).multiplyScalar(R + TH(d)); orient(g, d, tangentToward(d, face)); world.add(g);
  g.add(S(G.cyl, mat(0x8a8f9c, { metalness: 0.5, roughness: 0.5 }), 4, 0.4, 4, 0, 0.2, 0));
  for (const a of [0.6, 2.2, 3.8, 5.4]) g.add(S(G.box, mat(0x6a6f7c), 0.25, 4, 0.25, Math.cos(a) * 3.4, 2, Math.sin(a) * 3.4));
  const rk = makeRocket(); rk.position.y = 0.4; g.add(rk);
  g.add(mesh(new THREE.PlaneGeometry(3, 0.6), new THREE.MeshBasicMaterial({ map: labelTex('KOSMODROMAS', '#30343e', '#ffd23a', 512, 104), side: THREE.DoubleSide }), 0, 0.9, 4.05));
  addLocal(g, 0, 0, 2.2, 13);
  desertRocket = { g, rk, d };
  addInspect(g.position.clone().addScaledVector(tangentToward(d, face), 4.2).addScaledVector(d, 1), 'Raketa „Marsas-1“', '', 6, { verb: 'apžiūrėti raketą', onUse: useDesertRocket });
}
function useDesertRocket() {
  if (Q2.stage === 'rocket' || Q2.stage === 'horn') { if (Q2.stage === 'horn') { showCard('Raketa „Marsas-1“', 'Ragas jau pas tave! Neškite jį į muziejų Pradžios Mieste.'); card = { kind: 'info' }; return; } launchToMars(); return; }
  showCard('Raketa „Marsas-1“', Q2.stage === 'done' ? 'Raketa ilsisi. Marse viskas ramu – drakono mama vis dar miega.' : 'Raketa paruošta, bet niekas nežino, kur skristi. Gal Kūrėjas žino daugiau?'); card = { kind: 'info' };
}
let cinema = null;
function launchToMars() {
  if (transitioning || cinema) return;
  cancelPlace(true); stopClimb(); dropAll(); hideCard(); stopSiren();
  if (player.inCar) onCar();
  player.mesh.visible = false;
  const rk = desertRocket.rk, base = rk.position.clone(), d = desertRocket.d;
  const camAt = desertRocket.g.position.clone().addScaledVector(d, 6).addScaledVector(tangentToward(d, rocketSpot.face), 26);
  let t = 0;
  tone(50, 3, { to: 120, type: 'sawtooth', vol: 0.12, lp: 500, attack: 0.5 }); noiseHit(3, { f: 600, fto: 2400, vol: 0.3, attack: 0.6 });
  toast('3… 2… 1… Kilimas!', 'Skrendi į Marsą', '#ff8a3d');
  cinema = dt => {
    t += dt; const lift = t < 0.6 ? 0 : (t - 0.6) * (t - 0.6) * 9;
    rk.position.copy(base).y += lift; rk.position.x += (Math.random() - 0.5) * 0.08;
    rk.userData.flame.scale.setScalar(t < 0.3 ? t * 10 : 4 + Math.random() * 2);
    camera.position.lerp(camAt, Math.min(1, dt * 3)); camera.up.copy(d); camera.lookAt(rk.getWorldPosition(new V3()));
    shake = Math.max(shake, 0.25); applyShake(dt);
    if (t > 2.6 && !transitioning) {
      fadeTo(() => { cinema = null; rk.position.copy(base); rk.userData.flame.scale.setScalar(0.01); player.mesh.visible = true; enterMars(); });
    }
  };
}

// ---------- the museum in the city ----------
let museum = null;
function buildMuseum() {
  const d = cityDir(30, -10);
  const g = new THREE.Group(); place(g, d); orient(g, d, tangentToward(d, UP)); g.position.copy(d).multiplyScalar(R + TH(d));
  const st = mat(0xece6d8, { roughness: 0.6 }), st2 = mat(0xd8d0bc, { roughness: 0.6 });
  g.add(S(G.box, st, 13, 8, 9, 0, 3.5, -1));
  g.add(S(G.box, st2, 14, 0.8, 11, 0, 0.1, 0));
  g.add(S(G.box, st2, 14.4, 0.8, 11.4, 0, 7.9, 0));
  const ped = S(new THREE.CylinderGeometry(1, 1, 1, 3), st, 7.4, 14.4, 2.4, 0, 9.5, 0); ped.rotation.z = Math.PI / 2; ped.rotation.y = Math.PI / 2; ped.scale.set(2.4, 14.4, 7.4); g.add(ped);
  for (let i = 0; i < 6; i++) g.add(S(G.cyl, st, 0.42, 7.2, 0.42, -5 + i * 2, 4.0, 4.4));
  g.add(mesh(new THREE.PlaneGeometry(6, 1.1), new THREE.MeshBasicMaterial({ map: labelTex('MUZIEJUS', '#ece6d8', '#5a4a30', 640, 120) }), 0, 8.0, 5.72));
  g.add(S(G.box, mat(0x6b4426), 2.2, 3.4, 0.1, 0, 2.2, 3.52));
  // the glass case where the horn will stand
  const cs = new THREE.Group(); cs.position.set(4.2, 0.5, 7.4); g.add(cs);
  cs.add(S(G.box, mat(0x3a3a44, { metalness: 0.4 }), 1.2, 1.0, 1.2, 0, 0.5, 0));
  cs.add(S(G.box, mat(0xbfe8ff, { transparent: true, opacity: 0.25, metalness: 0.3, roughness: 0.05 }), 1.1, 1.4, 1.1, 0, 1.7, 0));
  const plaque = mesh(new THREE.PlaneGeometry(1.0, 0.25), new THREE.MeshBasicMaterial({ map: labelTex('DEMONO RAGAS', '#3a3a44', '#ffd23a', 512, 128) }), 0, 0.7, 0.61); cs.add(plaque);
  addBox(g, 6.6, 5.3, 8.2, 0, -0.6);
  addLocal(g, 4.2, 7.4, 0.8, 2.4);
  museum = { g, cs, horn: null, d };
  const door = g.position.clone().addScaledVector(tangentToward(d, UP), 6.2).addScaledVector(d, 1);
  addInspect(door, 'Muziejus', '', 4.5, { verb: 'įeiti į muziejų', onUse: useMuseum });
  if (Q2.stage === 'done') showHornInMuseum();
}
function showHornInMuseum() { if (!museum || museum.horn) return; const h = makeHorn(); h.scale.setScalar(1.3); h.position.set(0, 1.4, 0); museum.cs.add(h); museum.horn = h; linearize(h); animators.push((dt, t) => { h.rotation.y = t * 0.5; }); }
function useMuseum() {
  if (Q2.stage === 'horn') { deliverHorn(); return; }
  if (Q3.stage === 'fly') { deliverFly(); return; }
  if (Q4.stage === 'horn') { deliverUniHorn(); return; }
  if (Q8.stage === 'cloud') { deliverCloud(); return; }
  if (Q10.stage === 'mini') { deliverMiniTM(); return; }
  if (Q11.stage === 'crown') { deliverCrown(); return; }
  if (Q12.stage === 'carry') { deliverGoldBall(); return; }
  if (Q13.stage === 'museum') { deliverMuseumCat(); return; }
  if (Q14.stage === 'museum') { deliverStaff(); return; }
  if (S15.stage === 'star') { deliverStar(); return; }
  enterMuseum();
}
function deliverHorn() {
  attachHorn(false); Q2.stage = 'done'; saveQ2(); showHornInMuseum(); refreshMuseumHorn(); addMoney(300);
  [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.6, { type: 'triangle', vol: 0.07, when: i * 0.12 }));
  poof(museum.g.position.clone().addScaledVector(museum.d, 2), 0xffd23a);
  toast('Įsakymas #2 įvykdytas!', 'Demono ragas muziejuje. Apdovanojimas: 300 €', '#ffe98a');
  startQ3();
}

// ---------- the horn ----------
function makeHorn() {
  const g = new THREE.Group(), m = mat(0x4a1418, { roughness: 0.45, metalness: 0.2, emissive: 0x2a0000 });
  for (let i = 0; i < 8; i++) { const s = 0.24 * (1 - i / 9); const c = S(G.cyl, m, s, 0.22, s, Math.sin(i * 0.22) * 0.35, i * 0.2, 0); c.rotation.z = -i * 0.12; g.add(c); }
  { const _o = S(G.cone, m, 0.06, 0.25, 0.06, Math.sin(8 * 0.22) * 0.35 + 0.05, 1.68, 0); _o.rotation.z = -1; g.add(_o); }
  g.add(S(G.box, mat(0xffe08a, { emissive: 0xff8020, emissiveIntensity: 0.6 }), 0.5, 0.03, 0.02, 0, 0.02, 0.2));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xff3020, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5 })); glow.scale.setScalar(1.6); glow.position.y = 0.8; g.add(glow);
  return g;
}
let heldHorn = null;
function attachHorn(on) {
  const hand = player.mesh.userData.parts.handL;
  if (on && !heldHorn) { heldHorn = makeHorn(); heldHorn.scale.setScalar(0.45); heldHorn.position.set(0, -0.1, 0.12); hand.add(heldHorn); linearize(heldHorn); }
  if (!on && heldHorn) { hand.remove(heldHorn); heldHorn = null; }
}
let laserGun = null;
function attachGun(on) {
  const hand = player.mesh.userData.parts.handR;
  if (on && !laserGun) {
    laserGun = new THREE.Group(); laserGun.add(S(G.box, mat(0x30343e, { metalness: 0.6, roughness: 0.3 }), 0.12, 0.14, 0.5, 0, 0, 0.15)); { const _o = S(G.cyl, mat(0xc8ccd6, { metalness: 0.8 }), 0.04, 0.3, 0.04, 0, 0.02, 0.5); _o.rotation.x = Math.PI / 2; laserGun.add(_o); }
    laserGun.add(S(G.box, bmat(0xff3030), 0.06, 0.06, 0.06, 0, 0.09, 0.05)); laserGun.add(S(G.box, mat(0x30343e), 0.08, 0.2, 0.1, 0, -0.12, 0.02));
    hand.add(laserGun); linearize(laserGun);
  }
  if (laserGun) laserGun.visible = on;
}

// ================= Mars =================
const marsScene = new THREE.Scene();
marsScene.background = new THREE.Color(0xc77a4e);
marsScene.fog = new THREE.Fog(0xc9845a, 50, 190);
marsScene.add(new THREE.HemisphereLight(0xffe2c0, 0x6a2a1a, 0.7));
marsScene.add(new THREE.AmbientLight(0xffffff, 0.12));
const marsSun = new THREE.DirectionalLight(0xffe0c0, 1.4); marsSun.position.set(40, 70, 30); marsScene.add(marsSun);
const M2 = { built: false, boxes: [], dinos: [], hearts: 5, inv: 0, noise: 0, dragon: null, horn: null, gate: null, gateY: 0, rocket: null, shootCD: 0, wake: 0, beams: [] };
const CASTLE = { x0: -20, x1: 20, zFront: -15, zBack: -50, zInner: -38, gate: 3, door: 2.5 };
function mbox(x0, x1, z0, z1, h = 8) { M2.boxes.push({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, hx: Math.abs(x1 - x0) / 2, hz: Math.abs(z1 - z0) / 2, h }); }
function makeDino(col) {
  const g = new THREE.Group(), b = new THREE.Group(), c = mat(col, { roughness: 0.7 }), belly = mat(0xfff1c8); g.add(b);
  b.add(S(G.sph, c, 0.55, 0.5, 0.7, 0, 0.9, 0)); b.add(S(G.sph, belly, 0.4, 0.38, 0.4, 0, 0.82, 0.32));
  const head = new THREE.Group(); head.position.set(0, 1.45, 0.45); b.add(head);
  head.add(S(G.sph, c, 0.42, 0.38, 0.5)); head.add(S(G.box, mat(0xffffff), 0.5, 0.06, 0.06, 0, -0.14, 0.44));
  for (const x of [-0.18, 0.18]) { head.add(S(G.sph, mat(0xffffff), 0.11, 0.13, 0.08, x, 0.13, 0.36)); head.add(S(G.sph, bmat(0x111111), 0.06, 0.08, 0.05, x, 0.13, 0.43)); }
  for (let i = 0; i < 4; i++) { const _o = S(G.cone, mat(0xffd23a), 0.1, 0.22, 0.06, 0, 1.4 - i * 0.18, -0.2 - i * 0.18); _o.rotation.x = -0.6; b.add(_o); }
  const tail = S(G.cone, c, 0.3, 1.2, 0.3, 0, 0.75, -0.95); tail.rotation.x = -1.35; b.add(tail);
  for (const x of [-0.35, 0.35]) { const a = S(G.cyl, c, 0.05, 0.25, 0.05, x, 1.0, 0.45); a.rotation.x = 1.1; b.add(a); }
  const legs = [-0.25, 0.25].map(x => { const p = new THREE.Group(); p.position.set(x, 0.55, 0); p.add(S(G.cyl, c, 0.12, 0.5, 0.12, 0, -0.25, 0)); p.add(S(G.sph, c, 0.16, 0.08, 0.24, 0, -0.52, 0.08)); b.add(p); return p; });
  g.userData = { body: b, head, legs, tail };
  return g;
}
function makeDragon() {
  const g = new THREE.Group(), c = mat(0x6a3aa8, { roughness: 0.55 }), c2 = mat(0x9a6ad8, { roughness: 0.55 }), belly = mat(0xe8c890);
  const body = new THREE.Group(); g.add(body);
  body.add(S(G.sph, c, 3.2, 2.0, 4.4, 0, 1.9, 0)); body.add(S(G.sph, belly, 2.4, 1.4, 3.6, 0, 1.4, 0.4));
  for (let i = 0; i < 7; i++) body.add(S(G.cone, mat(0xffd23a), 0.35, 0.8, 0.35, 0, 3.8 - Math.abs(i - 3) * 0.12, -2.6 + i * 0.85));
  for (const x of [-1, 1]) { const wing = S(G.sph, c2, 0.25, 1.6, 3.4, x * 2.8, 3.0, -0.3); wing.rotation.z = x * 0.9; body.add(wing); }
  // tail curled around
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 1.3, r = 4.2; body.add(S(G.sph, c, 0.9 - i * 0.07, 0.7 - i * 0.05, 0.9 - i * 0.07, Math.sin(a) * r - 1, 0.6, -Math.cos(a) * r * 0.8 - 1.5)); }
  const neck = new THREE.Group(); neck.position.set(-2.2, 1.4, 3.4); body.add(neck);
  { const _o = S(G.cyl, c, 0.8, 2.4, 0.8, 0, 0.3, 0.6); _o.rotation.x = 1.2; neck.add(_o); }
  const head = new THREE.Group(); head.position.set(0, 0.6, 2.0); neck.add(head);
  head.add(S(G.sph, c, 1.2, 0.9, 1.6)); head.add(S(G.sph, c2, 0.8, 0.5, 0.9, 0, -0.25, 1.2));
  for (const x of [-0.25, 0.25]) head.add(S(G.sph, bmat(0x1a0a2a), 0.08, 0.06, 0.04, x, -0.15, 2.05));
  for (const x of [-1, 1]) { const _o = S(G.cone, mat(0xffd23a), 0.25, 1.0, 0.25, x * 0.6, 0.9, -0.6); _o.rotation.x = -0.7; head.add(_o); }
  const lids = [], eyes = [];
  for (const x of [-0.6, 0.6]) { const e = S(G.sph, mat(0xffe040, { emissive: 0xffa000, emissiveIntensity: 0.8 }), 0.22, 0.22, 0.12, x, 0.3, 1.1); e.visible = false; head.add(e); eyes.push(e); const l = S(G.box, bmat(0x2a1440), 0.35, 0.04, 0.05, x, 0.3, 1.18); head.add(l); lids.push(l); }
  g.userData = { body, neck, head, eyes, lids };
  return g;
}
function buildMars() {
  if (M2.built) return; M2.built = true;
  // ground with soft dunes and craters
  const geo = new THREE.PlaneGeometry(320, 320, 120, 120); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, col = [];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const inCastle = x > -26 && x < 26 && z > -56 && z < -9, onPad = Math.hypot(x, z - 55) < 10;
    const h = inCastle || onPad ? 0 : fbm(x * 0.03 + 50, 0, z * 0.03, 3) * 2.2 * smooth(0, 12, Math.min(Math.abs(Math.abs(x) - 26), 100));
    p.setY(i, Math.max(-0.4, h - 0.05)); const c = new THREE.Color().setHSL(0.04, 0.55, 0.36 + 0.06 * noise(x * 0.2, 0, z * 0.2)); col.push(c.r, c.g, c.b);
  }
  srgbArrayToLinear(col); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
  marsScene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })));
  for (let i = 0; i < 18; i++) { const x = rr(-140, 140), z = rr(-140, 140); if (Math.abs(x) < 34 && z > -64 && z < 70) continue; const c = S(new THREE.TorusGeometry(1, 0.25, 6, 24), mat(0x8a3a20), rr(3, 8), rr(3, 8), 1); c.rotation.x = Math.PI / 2; c.position.set(x, 0.1, z); marsScene.add(c); }
  for (let i = 0; i < 70; i++) { const x = rr(-140, 140), z = rr(-140, 140); if (Math.abs(x) < 30 && z > -60 && z < 66) continue; const s = rr(0.6, 3); marsScene.add(S(G.dodec, mat(0x7a2e1a, { roughness: 0.9 }), s, s * rr(0.5, 1), s, x, s * 0.3, z)); if (s > 1.5) mbox(x - s * 0.7, x + s * 0.7, z - s * 0.7, z + s * 0.7, s); }
  // two little moons
  for (const [x, y, z, s] of [[-80, 70, -150, 9], [120, 50, -120, 5]]) marsScene.add(S(G.sph, bmat(0xe8d8c8, { fog: false }), s, s, s, x, y, z));
  // rocket on its pad
  marsScene.add(S(G.cyl, mat(0x8a8f9c, { metalness: 0.5 }), 4, 0.4, 4, 0, 0.2, 55));
  const rk = makeRocket(); rk.position.set(0, 0.4, 55); marsScene.add(rk); M2.rocket = rk; mbox(-2.2, 2.2, 52.8, 57.2, 13);
  // the castle
  const stone = mat(0x8a5a48, { roughness: 0.85 }), stone2 = mat(0x6e463a, { roughness: 0.85 }), C = CASTLE, H = 8;
  const wall = (x0, x1, z0, z1) => { const w = Math.abs(x1 - x0), d = Math.abs(z1 - z0); marsScene.add(S(G.box, stone, w, H, d, (x0 + x1) / 2, H / 2, (z0 + z1) / 2)); mbox(x0, x1, z0, z1, H);
    const n = Math.floor(Math.max(w, d) / 1.6); for (let i = 0; i < n; i += 2) { const t = (i + 0.5) / n; marsScene.add(S(G.box, stone2, w > d ? 0.8 : d + 0.2, 0.9, w > d ? w + 0.2 : 0.8, w > d ? x0 + (x1 - x0) * t : (x0 + x1) / 2, H + 0.45, w > d ? (z0 + z1) / 2 : z0 + (z1 - z0) * t)); } };
  wall(C.x0, -C.gate, C.zFront - 0.75, C.zFront + 0.75); wall(C.gate, C.x1, C.zFront - 0.75, C.zFront + 0.75);
  marsScene.add(S(G.box, stone, C.gate * 2, 2.5, 1.5, 0, H - 1.25, C.zFront));
  wall(C.x0 - 0.75, C.x0 + 0.75, C.zBack, C.zFront); wall(C.x1 - 0.75, C.x1 + 0.75, C.zBack, C.zFront);
  wall(C.x0, C.x1, C.zBack - 0.75, C.zBack + 0.75);
  wall(C.x0, -C.door, C.zInner - 0.75, C.zInner + 0.75); wall(C.door, C.x1, C.zInner - 0.75, C.zInner + 0.75);
  marsScene.add(S(G.box, stone, C.door * 2, 3, 1.5, 0, H - 1.5, C.zInner));
  for (const [x, z] of [[C.x0, C.zFront], [C.x1, C.zFront], [C.x0, C.zBack], [C.x1, C.zBack]]) { marsScene.add(S(G.cyl, stone2, 3, 13, 3, x, 6.5, z)); marsScene.add(S(G.cone, mat(0x5a2a6a), 3.6, 4, 3.6, x, 15, z)); mbox(x - 2.6, x + 2.6, z - 2.6, z + 2.6, 13); }
  for (const x of [-6, 6]) { const f = mesh(new THREE.PlaneGeometry(2, 3), new THREE.MeshStandardMaterial({ color: 0x6a3aa8, side: THREE.DoubleSide }), x, 5, C.zFront + 0.8); marsScene.add(f); }
  marsScene.add(mesh(new THREE.PlaneGeometry(7, 1.2), new THREE.MeshBasicMaterial({ map: labelTex('DRAKONO PILIS', '#3a1a10', '#ffd23a', 640, 110) }), 0, H + 1.6, C.zFront + 0.8));
  // portcullis to the dragon room (opens when the little dinos are beaten)
  const gate = new THREE.Group(); for (let i = -2; i <= 2; i++) gate.add(S(G.box, mat(0x30343e, { metalness: 0.6 }), 0.15, 5, 0.15, i * 1.0, 2.5, 0)); for (let j = 0; j < 5; j++) gate.add(S(G.box, mat(0x30343e, { metalness: 0.6 }), 5, 0.12, 0.12, 0, 0.5 + j * 1.1, 0));
  gate.position.set(0, 0, C.zInner); marsScene.add(gate); M2.gate = gate; M2.gateBox = { x: 0, z: C.zInner, hx: C.door, hz: 0.6, h: 6 }; if (!Q2.dinosDone) M2.boxes.push(M2.gateBox); else gate.position.y = 5.2;
  // torches
  for (const [x, z] of [[-18, -20], [18, -20], [-18, -33], [18, -33], [-18, -42], [18, -42], [-18, -48], [18, -48]]) { marsScene.add(S(G.cyl, mat(0x4a3020), 0.1, 1, 0.1, x, 3, z)); const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireTex, color: 0xff9030, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); fl.position.set(x, 3.7, z); fl.scale.setScalar(1.2); marsScene.add(fl); const l = new THREE.PointLight(0xff9040, 0.6, 12); l.position.set(x, 3.8, z); marsScene.add(l); }
  // dragon room: the sleeping mother and the horn
  const dragon = makeDragon(); dragon.position.set(7, 0, -44.5); dragon.rotation.y = -0.4; marsScene.add(dragon); M2.dragon = dragon; mbox(2, 12.5, -49, -40, 4);
  marsScene.add(S(G.cyl, mat(0xb08a50, { roughness: 1 }), 6, 0.4, 5, 7, 0.2, -44.5));
  const ped = new THREE.Group(); ped.position.set(-9, 0, -45); marsScene.add(ped);
  ped.add(S(G.cyl, mat(0xc8b090), 0.6, 1.2, 0.6, 0, 0.6, 0)); ped.add(S(G.cyl, mat(0xffd23a, { metalness: 0.7, roughness: 0.3 }), 0.75, 0.1, 0.75, 0, 1.25, 0)); mbox(-9.6, -8.4, -45.6, -44.4, 1.2);
  if (Q2.stage === 'rocket') { const h = makeHorn(); h.position.set(0, 1.3, 0); ped.add(h); M2.horn = h; }
  M2.ped = ped;
  // gold coins the dragon sleeps on
  for (let i = 0; i < 40; i++) marsScene.add(S(G.cyl, mat(0xffd23a, { metalness: 0.8, roughness: 0.3 }), 0.18, 0.04, 0.18, 7 + rr(-4.5, 4.5), 0.05, -44.5 + rr(-3.5, 3.5)));
  // the little dinos in the courtyard
  if (!Q2.dinosDone) for (let i = 0; i < 7; i++) {
    const m = makeDino(pick([0x5ec85a, 0x4dabff, 0xff8a3d, 0xff6bb5, 0xb57bff, 0x3ddc97, 0xffc43d])); marsScene.add(m);
    const dn = { m, pos: new V3(rr(-15, 15), 0, rr(-34, -20)), fwd: new V3(rr(-1, 1), 0, rr(-1, 1)).normalize(), hp: 3, hit: 0, t: rr(1, 3), walk: rnd() * 6, dead: false, vel: new V3() };
    M2.dinos.push(dn);
  }
  linearize(marsScene);
  marsScene.environment = scene.environment;
}

// ---------- entering and leaving Mars ----------
function enterMars() {
  buildMars(); mode = 'mars'; marsScene.add(player.mesh);
  player.pos.set(0, 0, 49); player.up.set(0, 1, 0); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.pitch = 0.25;
  camera.position.set(0, 4, 57); camera.up.set(0, 1, 0);
  M2.hearts = 5; M2.noise = 0; attachGun(true); if (Q2.stage === 'horn') attachHorn(true);
  musicSet(4);
  $('bName').textContent = 'Marsas'; $('bEn').textContent = 'Raudonoji planeta'; $('bAtm').textContent = 'Toli už burbulo. Čia stovi drakono pilis.'; document.documentElement.style.setProperty('--biome', '#ff7a4a');
  setTimeout(() => toast('Gavai lazerinį šautuvą!', 'Pelės mygtukais šauk į dinozauriukus. Pilis – tiesiai prieš tave', '#ff5a5a'), 600);
  [262, 330, 392, 523].forEach((f, i) => tone(f, 0.4, { type: 'square', vol: 0.04, lp: 1800, when: 0.6 + i * 0.1 }));
}
function leaveMars() {
  if (transitioning) return; transitioning = true;
  tone(60, 2, { to: 140, type: 'sawtooth', vol: 0.1, lp: 500, attack: 0.4 }); noiseHit(2, { f: 600, fto: 2200, vol: 0.25, attack: 0.4 });
  fadeTo(() => {
    transitioning = false; mode = 'planet'; world.add(player.mesh); attachGun(false);
    $('marsChip').hidden = true;
    const d = desertRocket ? moveAlong(desertRocket.d, tangentToward(desertRocket.d, rocketSpot.face), 6) : BC[1];
    player.pos.copy(d).multiplyScalar(R + groundH(d) + 0.3); player.up.copy(d); player.fwd.copy(tangentToward(d, rocketSpot ? rocketSpot.face : UP)); player.vel.set(0, 0, 0); player.vr = 0; curBiome = -1;
    camera.position.copy(player.pos).addScaledVector(d, 4).addScaledVector(player.fwd, -6);
    if (Q2.stage === 'horn') toast('Grįžai su ragu!', 'Nunešk jį į muziejų Pradžios Mieste. Rodyklė parodys kelią', '#ffd23a');
  });
}

// ---------- laser ----------
function shootLaser() {
  if (M2.shootCD > 0) return; M2.shootCD = 0.22;
  const start = player.pos.clone().add(new V3(0, 1.3, 0)).addScaledVector(player.fwd, 0.6), dir = player.fwd.clone().setY(0).normalize();
  let len = 45, hitDino = null;
  for (let s = 0; s < 45; s += 0.5) { const q = start.clone().addScaledVector(dir, s); if (insideBox(q.x, q.z, 0) && q.y < 8) { len = s; break; } const dn = M2.dinos.find(x => !x.dead && Math.hypot(x.pos.x - q.x, x.pos.z - q.z) < 0.9); if (dn) { len = s; hitDino = dn; break; } }
  const end = start.clone().addScaledVector(dir, len);
  const beam = S(G.cyl, new THREE.MeshBasicMaterial({ color: 0xff2a2a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }), 0.06, len, 0.06);
  beam.position.copy(start).lerp(end, 0.5); beam.quaternion.setFromUnitVectors(UP, dir); marsScene.add(beam);
  let t = 0; fx.push(d2 => { t += d2; beam.material.opacity = Math.max(0, 0.9 - t * 7); if (t > 0.14) { marsScene.remove(beam); return false; } return true; });
  tone(1400, 0.15, { to: 300, type: 'sawtooth', vol: 0.05, lp: 3000 });
  if (player.pos.z < CASTLE.zInner) addNoise(55);
  if (hitDino) {
    hitDino.hp--; hitDino.hit = 0.25; hitDino.vel.copy(dir).multiplyScalar(7); tone(500, 0.12, { to: 900, type: 'square', vol: 0.04, lp: 2000 });
    if (hitDino.hp <= 0) defeatDino(hitDino);
  }
}
function insideBox(x, z, r) { for (const b of M2.boxes) if (Math.abs(x - b.x) < b.hx + r && Math.abs(z - b.z) < b.hz + r) return b; return null; }
function defeatDino(dn) {
  dn.dead = true; let t = 0; const m = dn.m;
  for (let i = 0; i < 3; i++) tone(800 - i * 150, 0.12, { type: 'square', vol: 0.04, lp: 2000, when: i * 0.1 });
  fx.push(d2 => { t += d2; m.rotation.z += d2 * 12; m.position.y += d2 * 4; m.scale.multiplyScalar(1 - d2 * 1.6); if (t > 0.6) { marsScene.remove(m); return false; } return true; });
  const left = M2.dinos.filter(x => !x.dead).length;
  if (left === 0) {
    Q2.dinosDone = true; saveQ2();
    const i = M2.boxes.indexOf(M2.gateBox); if (i >= 0) M2.boxes.splice(i, 1);
    let k = 0; fx.push(d2 => { k += d2; M2.gate.position.y = Math.min(5.2, k * 2.5); return k < 2.2; });
    noiseHit(2, { f: 500, vol: 0.12 });
    toast('Visi dinozauriukai nugalėti!', 'Grotelės į drakono kambarį pakilo. Dabar – tyliai…', '#7dff6b');
  } else toast('Dinozauriukas nugalėtas!', `Liko: ${left}`, '#7dff6b');
}

// ---------- the dragon's noise meter ----------
function addNoise(v) { if (M2.wake > 0) return; M2.noise = Math.min(100, M2.noise + v); if (M2.noise >= 100) wakeDragon(); }
function wakeDragon() {
  M2.wake = 4; const ud = M2.dragon.userData; ud.eyes.forEach(e => e.visible = true); ud.lids.forEach(l => l.visible = false);
  tone(70, 1.6, { to: 40, type: 'sawtooth', vol: 0.16, lp: 600, attack: 0.1 }); noiseHit(1.4, { f: 1200, fto: 200, vol: 0.3 }); shake = Math.max(shake, 1.2);
  toast('Drakono mama pabudo!', 'Ji išmetė tave lauk. Jos kambaryje elkis tyliau – nebėk, nešok, nešauk', '#ff5a5a');
  // a puff of fire and you fly out to the courtyard
  for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireTex, color: 0xff7a20, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); const p0 = new V3(4, 2.5, -40.5), v = player.pos.clone().sub(p0).normalize().multiplyScalar(rr(8, 14)).add(new V3(rr(-1, 1), rr(-0.5, 1), rr(-1, 1))); s.position.copy(p0); marsScene.add(s); let t = 0; fx.push(d2 => { t += d2; s.position.addScaledVector(v, d2); s.scale.setScalar(1 + t * 4); s.material.opacity = Math.max(0, 1 - t * 1.4); if (t > 0.8) { marsScene.remove(s); return false; } return true; }); }
  setTimeout(() => { if (mode !== 'mars') return; player.pos.set(rr(-3, 3), 0, -26); player.vel.set(0, 0, 8); player.vr = 6; hurt(1); M2.noise = 0; }, 450);
}
function hurt(n) {
  if (M2.inv > 0) return; M2.inv = 1.2; M2.hearts -= n; tone(220, 0.25, { to: 110, type: 'square', vol: 0.06, lp: 1200 });
  if (M2.hearts <= 0) {
    toast('Dinozauriukai tave įveikė', 'Pradedi iš naujo prie raketos. Nugalėti dinozauriukai liko nugalėti', '#ff6b6b');
    fadeTo(() => { player.pos.set(0, 0, 49); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); M2.hearts = 5; M2.noise = 0; });
  }
}

// ---------- E on Mars ----------
function marsAction() {
  if (card) { hideCard(); return; }
  if (Math.hypot(player.pos.x, player.pos.z - 55) < 5.5) { leaveMars(); return; }
  if (M2.horn && Math.hypot(player.pos.x - M2.ped.position.x, player.pos.z - M2.ped.position.z) < 2.6) {
    M2.ped.remove(M2.horn); M2.horn = null; Q2.stage = 'horn'; saveQ2(); attachHorn(true);
    [523, 659, 784].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.06, when: i * 0.1 }));
    toast('Paėmei demono ragą!', 'Tyliai išeik, grįžk į raketą ir nunešk ragą į muziejų Pradžios Mieste', '#ffd23a');
  }
}

// ---------- update ----------
const _mc = new V3();
function updateMars(dt, t) {
  M2.shootCD -= dt; M2.inv = Math.max(0, M2.inv - dt);
  // walking (low gravity!)
  const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP);
  _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sprint = keys.ShiftLeft || keys.ShiftRight, sp = sprint ? 11 : 6; _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, player.grounded ? Math.min(1, 10 * dt) : Math.min(1, 2 * dt));
  if (keys.Space && player.grounded) { player.vr = 8.5; player.grounded = false; sfx.jump(); if (player.pos.z < CASTLE.zInner) addNoise(35); }
  player.pos.addScaledVector(player.vel, dt); player.vr -= GRAV * 0.42 * dt; player.pos.y += player.vr * dt;
  let ground = 0; const rad = 0.4;
  for (const b of M2.boxes) { const dx = player.pos.x - b.x, dz = player.pos.z - b.z, ex = b.hx + rad - Math.abs(dx), ez = b.hz + rad - Math.abs(dz); if (ex <= 0 || ez <= 0) continue; if (player.pos.y >= b.h - 0.45) { if (b.h > ground) ground = b.h; } else if (ex < ez) player.pos.x += dx < 0 ? -ex : ex; else player.pos.z += dz < 0 ? -ez : ez; }
  player.pos.x = clamp(player.pos.x, -150, 150); player.pos.z = clamp(player.pos.z, -150, 150);
  if (player.pos.y <= ground) { player.pos.y = ground; player.vr = 0; player.grounded = true; } else player.grounded = false;
  player.mesh.rotation.set(0, 0, 0); player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd);
  animateMan(dt, f !== 0 || s !== 0, sp);
  const p = player.mesh.userData.parts; p.armR.rotation.set(-1.45, 0, 0.1); if (heldHorn) p.armL.rotation.set(-0.9, 0, -0.2);
  // noise in the dragon room
  const inRoom = player.pos.z < CASTLE.zInner - 0.8 && Math.abs(player.pos.x) < 20;
  if (inRoom && M2.wake <= 0) { const moving = f !== 0 || s !== 0; M2.noise += (moving ? (sprint ? 70 : 9) : -22) * dt; M2.noise = clamp(M2.noise, 0, 100); if (M2.noise >= 100) wakeDragon(); }
  else M2.noise = Math.max(0, M2.noise - 30 * dt);
  // dragon
  const ud = M2.dragon.userData;
  if (M2.wake > 0) { M2.wake -= dt; ud.neck.rotation.x = -0.5 * Math.min(1, M2.wake); if (M2.wake <= 0) { ud.eyes.forEach(e => e.visible = false); ud.lids.forEach(l => l.visible = true); ud.neck.rotation.x = 0; } }
  else { ud.body.scale.set(1, 1 + Math.sin(t * 1.2) * 0.03, 1); M2.zT = (M2.zT || 0) - dt; if (M2.zT < 0) { M2.zT = 1.4; const z = new THREE.Sprite(new THREE.SpriteMaterial({ map: zzzTex, transparent: true, depthWrite: false, color: 0xd8ccff })); const p0 = new V3(3.2, 3.5, -40.2); z.position.copy(p0); z.scale.setScalar(0.6); marsScene.add(z); let k = 0; fx.push(d2 => { k += d2; z.position.set(p0.x + Math.sin(k * 3) * 0.4, p0.y + k * 0.8, p0.z); z.scale.setScalar(0.6 + k * 0.4); z.material.opacity = Math.max(0, 1 - k / 2.4); if (k > 2.4) { marsScene.remove(z); return false; } return true; }); if (inRoom) tone(80, 1.0, { to: 65, type: 'sine', vol: 0.05, attack: 0.3 }); } }
  // dinos
  const inYard = player.pos.z > CASTLE.zInner && player.pos.z < CASTLE.zFront + 2 && Math.abs(player.pos.x) < 20;
  for (const dn of M2.dinos) {
    if (dn.dead) continue;
    const toP = _mc.set(player.pos.x - dn.pos.x, 0, player.pos.z - dn.pos.z), dist = toP.length();
    let spd = 0;
    if (inYard && dist < 16) { dn.fwd.lerp(toP.normalize(), Math.min(1, dt * 4)).normalize(); spd = 3.6; }
    else { dn.t -= dt; if (dn.t < 0) { dn.t = rr(1.5, 3.5); dn.fwd.set(rr(-1, 1), 0, rr(-1, 1)).normalize(); } spd = 1.4; }
    dn.pos.addScaledVector(dn.fwd, spd * dt).addScaledVector(dn.vel, dt); dn.vel.multiplyScalar(Math.max(0, 1 - 6 * dt));
    dn.pos.x = clamp(dn.pos.x, -18.5, 18.5); dn.pos.z = clamp(dn.pos.z, CASTLE.zInner + 1.5, CASTLE.zFront - 1.5);
    if (dist < 1.3 && M2.inv <= 0) { hurt(1); player.vel.copy(toP.normalize()).multiplyScalar(-9).setY(0); player.vel.negate(); player.vr = 4; dn.vel.copy(toP).multiplyScalar(-4); }
    dn.walk += dt * (spd * 3 + 1); const ud2 = dn.m.userData, sw = Math.sin(dn.walk);
    ud2.legs[0].rotation.x = sw * 0.6; ud2.legs[1].rotation.x = -sw * 0.6; ud2.head.rotation.x = Math.sin(dn.walk * 2) * 0.08; ud2.tail.rotation.y = sw * 0.3;
    dn.hit = Math.max(0, dn.hit - dt); ud2.body.position.y = dn.hit > 0 ? 0.3 : Math.abs(sw) * 0.08;
    dn.m.position.copy(dn.pos); dn.m.rotation.y = Math.atan2(dn.fwd.x, dn.fwd.z);
  }
  if (M2.horn) M2.horn.rotation.y = t;
  // camera (kept out of walls)
  const dist = 6.4, pitch = player.pitch, head = player.pos.clone().add(new V3(0, 1.5, 0));
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
  for (let k = 1; k <= 10; k++) { const q = head.clone().lerp(_ct, k / 10); const b = insideBox(q.x, q.z, 0.3); if (b && q.y < b.h + 0.3) { _ct.copy(head).lerp(_ct, Math.max(0, (k - 1.5) / 10)); break; } }
  if (_ct.y < 0.5) _ct.y = 0.5;
  camera.position.lerp(_ct, Math.min(1, dt * 10)); camera.up.set(0, 1, 0); camera.lookAt(head);
  applyShake(dt);
  // HUD
  const mc = $('marsChip'); mc.hidden = false;
  const left = M2.dinos.filter(x => !x.dead).length;
  mc.innerHTML = `<span class="hearts">${'♥'.repeat(Math.max(0, M2.hearts))}<span class="off">${'♥'.repeat(Math.max(0, 5 - M2.hearts))}</span></span>` +
    (left ? `<span>Dinozauriukų: <b>${left}</b></span>` : '') +
    (inRoom || M2.noise > 1 ? `<span class="noise">Triukšmas <span class="bar"><i style="width:${M2.noise}%"></i></span></span>` : '');
  let ptxt = '';
  if (Math.hypot(player.pos.x, player.pos.z - 55) < 5.5) ptxt = '<kbd>E</kbd> skristi namo';
  else if (M2.horn && Math.hypot(player.pos.x - M2.ped.position.x, player.pos.z - M2.ped.position.z) < 2.6) ptxt = '<kbd>E</kbd> paimti demono ragą';
  else if (inRoom) ptxt = 'Tyliai! Eik lėtai, nebėk ir nešok';
  else if (left && inYard) ptxt = '<kbd>LMB</kbd> šauti lazeriu';
  setPrompt(ptxt);
  updateQuestHud();
}
