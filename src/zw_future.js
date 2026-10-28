// ================= Command #10: "Auksinis kamuolys" =================
// the time machine goes the other way – into the FUTURE. The very first golden basketball was stolen and hidden in the
// Thieves' Bank: laser corridor, guard robots, four code notes for the vault, and the ball is not even in the vault –
// a golden robot statue points to a secret wall. Take it and RUN before the doors shut, then bring it to the museum.
const Q12 = { stage: 'none', notes: [], code: '', vault: false, secret: false, box: 0 };   // none | go | bank | carry | done
try { const s = JSON.parse(localStorage.getItem('modly-quest12') || 'null'); if (s) Object.assign(Q12, s); } catch (_) { }
function saveQ12() { try { localStorage.setItem('modly-quest12', JSON.stringify(Q12)); } catch (_) { } }
const q12Active = () => Q12.stage !== 'none' && Q12.stage !== 'done';
const Q12_GIVE = [
  'Mažasis, gavau žinią… iš ATEITIES! Ten kažkas pavogė pirmąjį pasaulio auksinį krepšinio kamuolį.',
  'Vagys jį paslėpė savo banke. Labai gerai paslėpė – lazeriai, sargybiniai robotai, seifas su slaptu kodu… Ir sako, kad net seife jo nėra.',
  'Šį kartą laiko mašina keliaus į priekį. Prieik prie jos, spausk E ir rinkis ATEITĮ. Surask kamuolį ir parnešk jį į muziejų.'
];
function Q12_LINES() {
  if (Q12.stage === 'go' || Q12.stage === 'bank') return ['Auksinis kamuolys – Vagių banke ateityje. Laiko mašina – mano salėje. Rinkis ateitį.'];
  if (Q12.stage === 'carry') return ['Tu jį radai! Pirmasis auksinis kamuolys! Greičiau nešk jį į muziejų.'];
  if (Q12.stage === 'done') { const fin = ['Auksinis kamuolys saugus muziejuje. Ateities vagys dabar labai liūdni. Cha!']; return Q13.stage === 'none' ? fin.concat(Q13_GIVE) : (Q13_LINES() || fin); }
  return null;
}
function q12TalkEnd() {
  if (Q12.stage !== 'none' || Q11.stage !== 'done') return false;
  Q12.stage = 'go'; Q12.code = String(1000 + Math.floor(Math.random() * 9000)); saveQ12();
  [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.35, { type: 'square', vol: 0.03, lp: 2500, when: i * 0.1 }));
  toast('Įsakymas #10: Auksinis kamuolys', 'Laiko mašina Kūrėjo Salėje – rinkis ATEITĮ', '#6ff7ff');
  return true;
}

// ---------- the time machine in the sanctum: past or future ----------
const canPast = () => q11Active() || Q11.stage === 'done', canFuture = () => q12Active() || Q12.stage === 'done';
const tmSanctumNear = () => sancTM && (canPast() || canFuture()) && Math.hypot(player.pos.x - sancTM.position.x, player.pos.z - sancTM.position.z) < 3.6;
function useSanctumTM() {
  if (canPast() && canFuture()) {
    // where to go: the future is the open command, so it is the "yes"
    askChoice('Laiko mašina', 'Kur keliausi? TAIP – į ATEITĮ (Vagių bankas). NE – į praeitį pas urvinius.', '#6ff7ff', yes => { if (yes) enterFuture(); else enterStone(); });
    return;
  }
  if (canFuture()) enterFuture(); else enterStone();
}
function backToSanctum(msg) {
  mode = 'sanctum'; sanc.add(player.mesh); musicSet(7); chicksEnterSanctum(); q5EnterSanctum(); q7EnterSanctum(); refreshSanctumFriends();
  player.pos.set(-10.5, 0, -7.5); player.up.set(0, 1, 0); player.fwd.set(0.6, 0, 0.8).normalize(); player.vel.set(0, 0, 0); player.vr = 0;
  camera.position.set(-14, 4, -13); camera.up.set(0, 1, 0); setBiomeHud(7); refreshHeld(); attachGoldBall(Q12.stage === 'carry');
  toast('Grįžai į savo laikus', msg, '#ffe98a');
}

// ---------- the future city and the Thieves' Bank ----------
const fuScene = new THREE.Scene(); fuScene.background = new THREE.Color(0x140a30); fuScene.fog = new THREE.Fog(0x1a0f3a, 30, 110);
const fuAmb = new THREE.AmbientLight(0xb0c0ff, 0.35); fuScene.add(fuAmb); fuScene.add(new THREE.HemisphereLight(0xc0a0ff, 0x203040, 0.6));
{ const l = new THREE.DirectionalLight(0xe0e8ff, 0.8); l.position.set(20, 40, 30); fuScene.add(l); }
const FU = { built: false, boxes: [], crates: [], lasers: [], guards: [], robots: [], cars: [], notes: [], x0: -30, x1: 30, z0: -46, z1: 46, H: 6.5, alarm: 0, alarmT: 0, flash: 0 };
const FU_NOTES = [[-16.5, 2.5, 'šiukšliadėžėje'], [2.3, -17, 'lazerių koridoriuje'], [17.5, -37, 'ant sargybinių stalo'], [-17.5, -37, 'už dėžių']];
function fuBox(x0, x1, z0, z1, h, m, vis = true, yh) {
  const b = { x: (x0 + x1) / 2, z: (z0 + z1) / 2, hx: (x1 - x0) / 2, hz: (z1 - z0) / 2 }; if (h) b.h = h; FU.boxes.push(b);
  if (vis && m) { const H = yh || h || 6; const o = S(G.box, m, x1 - x0, H, z1 - z0, b.x, H / 2, b.z); fuScene.add(o); b.mesh = o; }
  return b;
}
function makeRobot(col, guard) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const metal = mat(col, { metalness: 0.6, roughness: 0.35 }), dark = mat(0x30343e, { metalness: 0.5, roughness: 0.4 });
  body.add(S(G.cyl, dark, 0.35, 0.3, 0.35, 0, 0.18, 0));
  body.add(S(G.box, metal, 0.75, 0.9, 0.5, 0, 0.85, 0)); body.add(S(G.box, bmat(guard ? 0xff3a3a : 0x6ff7ff), 0.4, 0.15, 0.04, 0, 0.95, 0.26));
  body.add(S(G.box, metal, 0.55, 0.45, 0.45, 0, 1.55, 0)); body.add(S(G.box, bmat(guard ? 0xff2a2a : 0x6ff7ff), 0.45, 0.12, 0.04, 0, 1.6, 0.23));
  body.add(S(G.cyl6, dark, 0.02, 0.35, 0.02, 0, 1.95, 0)); body.add(S(G.sph, bmat(guard ? 0xff3a3a : 0xffe14d), 0.06, 0.06, 0.06, 0, 2.15, 0));
  for (const x of [-0.48, 0.48]) body.add(S(G.cyl, metal, 0.08, 0.7, 0.08, x, 0.9, 0));
  if (guard) {
    const cone = mesh(new THREE.ConeGeometry(2.2, 8, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff28a, transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }), 0, 1.0, 4.4);
    cone.rotation.x = -Math.PI / 2; body.add(cone); g.userData.cone = cone;
    body.add(S(G.cyl, mat(0x30343e), 0.08, 0.3, 0.08, 0.3, 1.0, 0.35).rotateX(Math.PI / 2));
  }
  g.userData.body = body; return g;
}
function makeGoldBall(r = 0.32) {
  const g = new THREE.Group(), gold = mat(0xffc81a, { metalness: 0.9, roughness: 0.2, emissive: 0x4a3000 }), seam = mat(0x3a2a00);
  g.add(S(G.sph, gold, r, r, r));
  const t1 = mesh(new THREE.TorusGeometry(r * 1.005, r * 0.04, 6, 32), seam); g.add(t1);
  const t2 = mesh(new THREE.TorusGeometry(r * 1.005, r * 0.04, 6, 32), seam); t2.rotation.y = Math.PI / 2; g.add(t2);
  const t3 = mesh(new THREE.TorusGeometry(r * 1.005, r * 0.04, 6, 32), seam); t3.rotation.x = Math.PI / 2; g.add(t3);
  return g;
}
function buildFuture() {
  if (FU.built) return; FU.built = true;
  // floors: dark street outside, shiny marble inside the bank
  fuScene.add(mesh(new THREE.PlaneGeometry(60, 41), mat(0x2a2a3a, { roughness: 0.6 }), 0, 0, 25.5).rotateX(-Math.PI / 2));
  for (let z = 8; z < 46; z += 6) fuScene.add(mesh(new THREE.PlaneGeometry(0.3, 2.5), bmat(0x6ff7ff), 0, 0.02, z).rotateX(-Math.PI / 2));
  fuScene.add(mesh(new THREE.PlaneGeometry(40, 51), mat(0xb8b4cc, { roughness: 0.3, metalness: 0.1 }), 0, 0.01, -20.5).rotateX(-Math.PI / 2));
  fuScene.add(mesh(new THREE.PlaneGeometry(40, 51), mat(0x3a3450), 0, 6, -20.5).rotateX(Math.PI / 2));
  // stars
  { const sv = []; for (let i = 0; i < 500; i++) { const v = randDir().multiplyScalar(rr(150, 250)); sv.push(v.x, Math.abs(v.y) + 10, v.z); } const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3)); fuScene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, fog: false }))); }
  // future skyscrapers along the street
  const neon = [0xff4fd8, 0x6ff7ff, 0xffe14d, 0x7a5cff, 0x3cf27a];
  for (const side of [-1, 1]) for (let z = 8; z < 44; z += 9) {
    const h = rr(14, 30), x0 = side < 0 ? -30 : 23, b = fuBox(x0, x0 + 7, z, z + 7, 0, mat(pick([0x30304a, 0x3a2a5a, 0x223a4a]), { metalness: 0.4, roughness: 0.4 }), true, h);
    const c = pick(neon); for (let y = 2; y < h - 1; y += 2.2) fuScene.add(S(G.box, bmat(c), 0.1, 0.3, 6, side < 0 ? -23 + 0.06 : 23 - 0.06, y, z + 3.5));
    fuScene.add(S(G.box, bmat(pick(neon)), 0.15, h, 0.15, side < 0 ? -23 : 23, h / 2, z));
  }
  // the bank: outer walls (the facade is tall, with a sign)
  const wall = mat(0x4a4a6a, { metalness: 0.3, roughness: 0.5 }), inner = mat(0x9890b8, { roughness: 0.6 }), gold = mat(0xffd23a, { metalness: 0.8, roughness: 0.25 });
  fuBox(-30, -2, 4.5, 5.5, 0, wall, true, 12); fuBox(2, 30, 4.5, 5.5, 0, wall, true, 12); fuScene.add(S(G.box, wall, 4, 6, 1, 0, 9, 5));
  fuBox(-30, -20, -46, 4.5, 0, wall, true, 12); fuBox(20, 30, -46, 4.5, 0, wall, true, 12);
  fuScene.add(mesh(new THREE.PlaneGeometry(14, 2.4), new THREE.MeshBasicMaterial({ map: labelTex('VAGIŲ BANKAS', '#1a1030', '#ffd23a', 768, 128) }), 0, 9.5, 5.55));
  fuScene.add(mesh(new THREE.PlaneGeometry(10, 1.1), new THREE.MeshBasicMaterial({ map: labelTex('(visai ne vagių. sąžiningas!)', '#1a1030', '#ff4fd8', 768, 96) }), 0, 7.6, 5.55));
  for (const x of [-2.2, 2.2]) fuScene.add(S(G.box, bmat(0xffd23a), 0.25, 6, 0.25, x, 3, 5.6));
  // news hologram on the street
  { const hol = mesh(new THREE.PlaneGeometry(7, 2.6), new THREE.MeshBasicMaterial({ map: labelTex('DINGO AUKSINIS KAMUOLYS!', '#0a2a3a', '#6ff7ff', 768, 160), transparent: true, opacity: 0.85, side: THREE.DoubleSide }), 10, 4.5, 20); hol.rotation.y = -0.4; fuScene.add(hol); FU.holo = hol; fuScene.add(S(G.cyl, mat(0x30343e), 0.3, 2.6, 0.3, 10, 1.3, 20)); }
  // lobby (z -10..4.5): counter with a robot clerk, plants, a trash bin
  fuBox(4, 14, -4, -2.8, 1.1, mat(0x7a5cff, { metalness: 0.3 }));
  { const r = makeRobot(0x9aa8c8, false); r.position.set(9, 0, -5); fuScene.add(r); FU.clerk = r; }
  for (const [x, z] of [[-18, -8], [18, -8], [-18, 3], [18, 3]]) { fuScene.add(S(G.cyl, mat(0xffffff), 0.5, 0.8, 0.5, x, 0.4, z)); fuScene.add(S(G.ico1, mat(0x3cb043), 0.8, 1.2, 0.8, x, 1.6, z)); FU.boxes.push({ x, z, hx: 0.5, hz: 0.5, h: 0.8 }); }
  fuScene.add(S(G.cyl, mat(0x60646e, { metalness: 0.6 }), 0.4, 0.9, 0.4, -16.5, 0.45, 2.5));
  for (let i = 0; i < 3; i++) { const p = mesh(new THREE.PlaneGeometry(2.4, 1.6), new THREE.MeshBasicMaterial({ map: labelTex(['$ € ₿', 'AUKSAS', '100 % SAUGU'][i], '#2a1a40', '#ffd23a', 384, 256) }), -12 + i * 12, 3.6, -9.45); fuScene.add(p); }
  // wall between lobby and the laser corridor, solid blocks either side of the corridor
  fuBox(-20, -3, -10, -9.5, 0, inner);
  // behind the robot clerk part of the wall is fake: it looks solid, but you can walk right through it
  fuScene.add(S(G.box, inner, 17, 6, 0.5, 11.5, 3, -9.75)); fuBox(3, 7.6, -10, -9.5, 0, null, false); fuBox(10.4, 20, -10, -9.5, 0, null, false);
  fuBox(-20, -3, -24, -10, 0, inner); fuBox(3, 6, -24, -10, 0, inner); fuBox(12, 20, -24, -10, 0, inner); fuBox(6, 12, -24, -16, 0, inner);
  // the secret room with the golden costume
  { const gold = mat(0xffc81a, { metalness: 0.85, roughness: 0.25, emissive: 0x3a2800 });
    fuScene.add(S(G.cyl, mat(0x2a1a40), 0.9, 0.6, 0.9, 9, 0.3, -13.5)); FU.boxes.push({ x: 9, z: -13.5, hx: 0.8, hz: 0.8, h: 0.6 });
    const man = makeMan(); man.traverse(o => { if (o.isMesh && !o.material.isMeshBasicMaterial) o.material = gold; }); man.position.set(9, 0.6, -13.5); fuScene.add(man); FU.goldMan = man;
    const l = new THREE.PointLight(0xffd23a, 1.8, 9); l.position.set(9, 4.5, -13); fuScene.add(l);
    fuScene.add(mesh(new THREE.PlaneGeometry(3, 0.6), new THREE.MeshBasicMaterial({ map: labelTex('SLAPTAS KAMBARYS', '#2a1a40', '#ffd23a', 512, 96) }), 9, 4.2, -15.95));
    for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffe14d, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(0.25); s.position.set(9 + rr(-2.5, 2.5), rr(0.5, 5), -13 + rr(-2.5, 2.5)); fuScene.add(s); } }
  fuScene.add(mesh(new THREE.PlaneGeometry(6, 0.8), new THREE.MeshBasicMaterial({ map: labelTex('⚠ LAZERIAI ⚠', '#ffd23a', '#1a1a1a', 512, 96) }), 0, 5.2, -9.4));
  // the lasers: sweeping beams and blinking curtains
  for (const [z, kind, sp, ph] of [[-12.5, 'sweep', 1.6, 0], [-15.5, 'blink', 2.6, 0], [-18.5, 'sweep', 2.3, 1.5], [-21.5, 'blink', 2.2, 1.1]]) {
    const g = new THREE.Group(); g.position.z = z; fuScene.add(g);
    const red = new THREE.MeshBasicMaterial({ color: 0xff2020, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
    if (kind === 'sweep') { const b = S(G.cyl6, red, 0.06, 6, 0.06, 0, 3, 0); g.add(b); g.add(S(G.cyl6, new THREE.MeshBasicMaterial({ color: 0xff4040, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }), 0.25, 6, 0.25, 0, 3, 0)); FU.lasers.push({ z, kind, sp, ph, beam: g.children, x: 0 }); }
    else { const beams = []; for (let y = 0.3; y < 6; y += 0.45) { const b = S(G.cyl6, red, 0.03, 6, 0.03, 0, y, 0); b.rotation.z = Math.PI / 2; g.add(b); beams.push(b); } FU.lasers.push({ z, kind, sp, ph, beam: beams, on: false }); }
    for (const x of [-2.95, 2.95]) fuScene.add(S(G.box, mat(0x30343e, { metalness: 0.6 }), 0.1, 6, 0.3, x, 3, z));
  }
  // the guard hall (z -38..-24): crates to hide behind and two guard robots
  const crate = mat(0x8a6a3a);
  for (const [x, z] of [[-11, -28.5], [-4.5, -32.5], [5, -28.5], [11.5, -32.5], [-16, -36], [16, -31]]) { const b = fuBox(x - 1.1, x + 1.1, z - 1.1, z + 1.1, 1.9, crate); FU.crates.push(b); fuScene.add(S(G.box, mat(0x6a4a22), 2.25, 0.15, 2.25, x, 1.0, z)); }
  fuScene.add(S(G.box, mat(0x5a5a7a), 2.4, 1, 1.2, 17.5, 0.5, -37)); FU.boxes.push({ x: 17.5, z: -37, hx: 1.2, hz: 0.6, h: 1 });
  for (const [a, b] of [[[-15, -26.5], [15, -26.5]], [[15, -34.8], [-15, -34.8]]]) { const m = makeRobot(0x30343e, true); fuScene.add(m); FU.guards.push({ m, a: new V3(a[0], 0, a[1]), b: new V3(b[0], 0, b[1]), t: rr(0, 1), dir: 1, pos: new V3(a[0], 0, a[1]), fwd: new V3(1, 0, 0), wait: 0 }); }
  // vault wall with the big round door and a keypad
  fuBox(-20, -2.6, -39, -38, 0, mat(0x6a6a7a, { metalness: 0.5 })); fuBox(2.6, 20, -39, -38, 0, mat(0x6a6a7a, { metalness: 0.5 }));
  FU.doorBox = fuBox(-2.6, 2.6, -39, -38, 0, null, false);
  { const d = new THREE.Group(); d.position.set(0, 2.6, -38.2); fuScene.add(d); const disk = S(G.cyl, mat(0xb8bec8, { metalness: 0.85, roughness: 0.25 }), 2.6, 0.5, 2.6); disk.rotation.x = Math.PI / 2; d.add(disk);
    for (let i = 0; i < 3; i++) { const sp = S(G.box, mat(0x60646e, { metalness: 0.8 }), 3.6, 0.2, 0.2, 0, 0, 0.3); sp.rotation.z = i * Math.PI / 3; d.add(sp); } d.add(S(G.cyl, gold, 0.4, 0.3, 0.4, 0, 0, 0.4).rotateX(Math.PI / 2)); FU.door = d; }
  { const k = new THREE.Group(); k.position.set(3.6, 1.5, -37.9); k.add(S(G.box, mat(0x30343e), 0.6, 0.8, 0.1)); k.add(S(G.box, bmat(0x3cf27a), 0.45, 0.15, 0.02, 0, 0.25, 0.06)); for (let i = 0; i < 9; i++) k.add(S(G.box, mat(0xd8d8e8), 0.1, 0.08, 0.03, -0.14 + (i % 3) * 0.14, 0.05 - Math.floor(i / 3) * 0.12, 0.06)); fuScene.add(k); FU.pad = k; }
  // the vault (z -46..-39, x -10..10) with gold, deposit boxes and a golden robot
  fuBox(-20, -10, -46, -39, 0, inner); fuBox(14, 20, -46, -39, 0, inner); fuBox(10, 14, -46, -45, 0, inner); fuBox(10, 14, -41, -39, 0, inner);
  FU.secretBox = fuBox(10, 10.6, -45, -41, 0, null, false);
  fuScene.add(S(G.box, inner, 26, 6, 1, 2, 3, -46.5)); fuScene.add(S(G.box, mat(0x2a2a3a), 2, 6, 6, 15, 3, -43));
  { const sw = S(G.box, mat(0xb8b0c8), 0.6, 6, 4, 10.3, 3, -43); fuScene.add(sw); FU.secretWall = sw; fuScene.add(S(G.cyl, bmat(0xff3a3a), 0.06, 0.04, 0.06, 9.98, 1.4, -43).rotateZ(Math.PI / 2)); }
  for (const [x, z] of [[6.5, -40.2], [-5, -44.6], [-8, -40.5]]) { for (let i = 0; i < 6; i++) fuScene.add(S(G.box, gold, 0.9, 0.3, 0.45, x + (i % 3 - 1) * 0.95, 0.15 + Math.floor(i / 3) * 0.3, z)); FU.boxes.push({ x, z, hx: 1.45, hz: 0.3, h: 0.6 }); }
  for (let i = 0; i < 9; i++) fuScene.add(S(G.box, mat(0x9aa0b0, { metalness: 0.7, roughness: 0.3 }), 0.9, 0.7, 0.1, -1 + (i % 3) * 1, 0.9 + Math.floor(i / 3) * 0.8, -45.92));
  { const r = makeRobot(0xffd23a, false); r.traverse(o => { if (o.material && !o.material.isMeshBasicMaterial) o.material = gold; }); r.position.set(-7, 0.5, -42.5); r.rotation.y = Math.PI / 2; r.scale.setScalar(1.3); fuScene.add(r);
    const arm = S(G.cyl, gold, 0.08, 1.2, 0.08, -0.15, 1.3, 0.75); arm.rotation.x = Math.PI / 2; r.userData.body.add(arm); fuScene.add(S(G.cyl, mat(0x60646e), 0.7, 0.5, 0.7, -7, 0.25, -42.5)); FU.boxes.push({ x: -7, z: -42.5, hx: 0.7, hz: 0.7, h: 0.5 }); FU.statue = r; }
  // the secret room and the golden ball
  fuScene.add(S(G.cyl, mat(0xffffff, { metalness: 0.2 }), 0.5, 1.1, 0.5, 12, 0.55, -43)); FU.boxes.push({ x: 12, z: -43, hx: 0.5, hz: 0.5, h: 1.1 });
  FU.ball = makeGoldBall(); FU.ball.position.set(12, 1.45, -43); fuScene.add(FU.ball);
  { const sp = new THREE.PointLight(0xffd23a, 1.6, 6); sp.position.set(12, 4, -43); fuScene.add(sp); fuScene.add(mesh(new THREE.ConeGeometry(1.2, 4.5, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), 12, 3.6, -43)); }
  // code notes
  FU_NOTES.forEach(([x, z], i) => { const g = new THREE.Group(); g.position.set(x, i === 0 ? 0.95 : i === 2 ? 1.05 : 0.05, z); g.add(S(G.box, mat(0xfff4c0), 0.35, 0.02, 0.45, 0, 0.02, 0)); addGlow(g, 0x6ff7ff); fuScene.add(g); FU.notes.push({ i, g, pos: new V3(x, 0, z) }); });
  // the time machine you arrived in
  { const m = makeTimeMachine(); m.position.set(-8, 0, 40); m.rotation.y = Math.PI / 2; fuScene.add(m); FU.tm = m; FU.boxes.push({ x: -8, z: 40, hx: 1.3, hz: 1.5 });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex('NAMO', '#d8262e', '#ffffff', 256, 96), transparent: true, depthWrite: false })); s.scale.set(2.2, 0.8, 1); s.position.y = 6.2; m.add(s); }
  // street robots and flying cars
  for (let i = 0; i < 5; i++) { const r = makeRobot(pick([0x9aa8c8, 0xff8fd0, 0x8fe0ff, 0xc8f08a]), false); r.position.set(rr(-16, 16), 0, rr(10, 34)); fuScene.add(r); FU.robots.push({ m: r, fwd: new V3(rr(-1, 1), 0, rr(-1, 1)).normalize(), t: rr(1, 4), talk: rr(3, 9) }); }
  for (let i = 0; i < 6; i++) { const c = new THREE.Group(); const col = pick(neon); c.add(S(G.sph, mat(0xd8dce8, { metalness: 0.7, roughness: 0.2 }), 1.4, 0.45, 0.7)); c.add(S(G.sph, mat(0x6ff7ff, { transparent: true, opacity: 0.7 }), 0.6, 0.35, 0.5, 0.2, 0.3, 0)); c.add(S(G.box, bmat(col), 2.4, 0.05, 0.9, 0, -0.35, 0)); c.position.set(rr(-40, 40), rr(9, 15), rr(8, 44)); fuScene.add(c); FU.cars.push({ m: c, sp: rr(8, 16) * (i % 2 ? 1 : -1) }); }
  fuScene.environment = scene.environment; linearize(fuScene);
  refreshFuture();
}
function refreshFuture() {
  if (!FU.built) return;
  for (const n of FU.notes) n.g.visible = !Q12.notes.includes(n.i) && Q12.stage === 'bank';
  const open = Q12.vault; FU.door.position.x = open ? -4.6 : 0; const di = FU.boxes.indexOf(FU.doorBox); if (open && di >= 0) FU.boxes.splice(di, 1); if (!open && di < 0) FU.boxes.push(FU.doorBox);
  FU.secretWall.position.z = Q12.secret ? -47.5 : -43; const si = FU.boxes.indexOf(FU.secretBox); if (Q12.secret && si >= 0) FU.boxes.splice(si, 1); if (!Q12.secret && si < 0) FU.boxes.push(FU.secretBox);
  FU.ball.visible = Q12.stage === 'bank' && !FU.alarm;
}
let goldBallHeld = null;
function attachGoldBall(on) {
  const hand = player.mesh.userData.parts.handL;
  if (on && !goldBallHeld) { goldBallHeld = makeGoldBall(0.22); goldBallHeld.position.set(0, -0.2, 0.15); hand.add(goldBallHeld); linearize(goldBallHeld); }
  if (!on && goldBallHeld) { hand.remove(goldBallHeld); goldBallHeld = null; }
}

// ---------- travelling ----------
function enterFuture() {
  if (transitioning) return; transitioning = true; hideCard(); dropAll();
  [262, 330, 392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.4, { type: 'square', vol: 0.03, lp: 2400, when: i * 0.09 }));
  toast('Laiko mašina ūžia…', 'Skrendi į ATEITĮ!', '#6ff7ff');
  fadeTo(() => {
    transitioning = false; buildFuture(); mode = 'future'; fuScene.add(player.mesh); musicSet(6); setScope(false);
    if (Q12.stage === 'go') { Q12.stage = 'bank'; saveQ12(); }
    FU.alarm = 0; refreshFuture(); attachGoldBall(Q12.stage === 'carry'); refreshHeld();
    player.pos.set(-4, 0, 38); player.vel.set(0, 0, 0); player.vr = 0; player.fwd.set(0.3, 0, -1).normalize(); player.up.set(0, 1, 0); player.pitch = 0.25;
    camera.position.set(-5, 3, 44); camera.up.set(0, 1, 0);
    $('bName').textContent = 'Ateitis'; $('bEn').textContent = 'Po 1000 metų'; $('bAtm').textContent = 'Skraidančios mašinos, neoninės šviesos ir robotai. O gatvės gale – įtartinas bankas.'; document.documentElement.style.setProperty('--biome', '#6ff7ff');
    toast('Ateitis!', Q12.stage === 'bank' ? 'Gatvės gale – VAGIŲ BANKAS. Kamuolys kažkur jame…' : 'Ateities miestas', '#6ff7ff');
  });
}
function leaveFuture() {
  if (transitioning) return; transitioning = true; hideCard(); closePad();
  [1319, 1047, 784, 659, 523, 392, 330, 262].forEach((f, i) => tone(f, 0.4, { type: 'square', vol: 0.03, lp: 2400, when: i * 0.09 }));
  fadeTo(() => { transitioning = false; backToSanctum(Q12.stage === 'carry' ? 'Nunešk auksinį kamuolį į muziejų!' : 'Kūrėjo Salė'); });
}

// ---------- inside the bank ----------
function fuCaught(text, x, z) {
  FU.flash = 1; shake = Math.max(shake, 0.4); sfx.alarm();
  player.pos.set(x, 0, z); player.vel.set(0, 0, 0); player.vr = 0; player.fwd.set(0, 0, -1);
  toast(text, FU.alarm ? 'Bėk vėl – laikas eina!' : 'Pabandyk dar kartą – atsargiau!', '#ff5a5a');
}
function updateLasers(t) {
  const p = player.pos;
  for (const L of FU.lasers) {
    let hit = false;
    if (L.kind === 'sweep') { L.x = Math.sin(t * L.sp + L.ph) * 2.7; L.beam.forEach(b => b.position.x = L.x); hit = Math.abs(p.z - L.z) < 0.45 && Math.abs(p.x - L.x) < 0.45; }
    else { L.on = ((t + L.ph) % L.sp) < L.sp * 0.5; L.beam.forEach(b => b.visible = L.on); hit = L.on && Math.abs(p.z - L.z) < 0.4 && Math.abs(p.x) < 3; }
    if (hit) { if (FU.alarm) fuCaught('Lazeris!', 0, -23.3); else fuCaught('Lazeris tave pastebėjo!', 0, -8); return; }
  }
}
function guardSees(g) {
  const d = player.pos.clone().sub(g.pos); d.y = 0; const dist = d.length(), range = FU.alarm ? 10 : 8;
  if (dist > range || dist < 0.01) return false;
  if (d.normalize().dot(g.fwd) < Math.cos(0.5)) return dist < 1.2;
  for (let k = 1; k < 12; k++) { const q = g.pos.clone().lerp(player.pos, k / 12); for (const c of FU.crates) if (Math.abs(q.x - c.x) < c.hx && Math.abs(q.z - c.z) < c.hz) return false; }
  return true;
}
function updateGuards(dt, t) {
  for (const g of FU.guards) {
    if (g.wait > 0) { g.wait -= dt; g.fwd.applyAxisAngle(UP, dt * 2.6 * g.dir); }
    else {
      const sp = FU.alarm ? 4.2 : 2.6, to = (g.dir > 0 ? g.b : g.a).clone().sub(g.pos); to.y = 0; const d = to.length();
      if (d < 0.2) { g.dir *= -1; g.wait = 1.2; } else { g.fwd.lerp(to.normalize(), Math.min(1, dt * 6)).normalize(); g.pos.addScaledVector(to, Math.min(d, sp * dt)); }
    }
    g.m.position.copy(g.pos); g.m.rotation.y = Math.atan2(g.fwd.x, g.fwd.z); g.m.userData.body.position.y = Math.abs(Math.sin(t * 6 + g.a.x)) * 0.04;
    if (g.m.userData.cone) g.m.userData.cone.material.color.setHex(FU.alarm ? 0xff4040 : 0xfff28a);
    if (player.pos.z < -24 && player.pos.z > -38.5 && guardSees(g)) { if (FU.alarm) fuCaught('Sargybinis robotas tave pagavo!', 0, -41.5); else fuCaught('Sargybinis robotas tave pamatė!', 0, -23.3); bubbleIn(fuScene, g.pos, pick(['STOK!', 'VAGIS!', 'BIP BIP! ALIARMAS!']), 2.6); if (FU.alarm) loseBall(); return; }
  }
}
function updateFuture(dt, t) {
  walkFlat(dt, { boxes: FU.boxes, x0: FU.x0, x1: FU.x1, z0: FU.z0, z1: FU.z1, H: FU.H, camDist: 5 });
  // city life
  for (const c of FU.cars) { c.m.position.x += c.sp * dt; if (c.m.position.x > 45) c.m.position.x = -45; if (c.m.position.x < -45) c.m.position.x = 45; c.m.rotation.y = c.sp > 0 ? 0 : Math.PI; }
  for (const r of FU.robots) { r.t -= dt; r.talk -= dt; if (r.t < 0) { r.t = rr(2, 5); r.fwd.applyAxisAngle(UP, rr(-2, 2)); } const p = r.m.position; p.addScaledVector(r.fwd, dt * 1.5); if (p.x < -18 || p.x > 18 || p.z < 9 || p.z > 36) { r.fwd.set(-p.x, 0, 22 - p.z).normalize(); } r.m.rotation.y = Math.atan2(r.fwd.x, r.fwd.z); r.m.userData.body.position.y = Math.abs(Math.sin(t * 5 + p.x)) * 0.05; if (r.talk < 0) { r.talk = rr(6, 12); if (p.distanceTo(player.pos) < 16) bubbleIn(fuScene, p, pick(['Bip bup!', 'Labas, žmogau!', 'Ar matei kamuolį?', 'Tas bankas – keistas…', 'Zzzt!']), 2.5); } }
  if (FU.goldMan) FU.goldMan.rotation.y = t * 0.8;
  if (!FU.secretSeen && player.pos.z < -10.3 && player.pos.z > -16 && player.pos.x > 6 && player.pos.x < 12) { FU.secretSeen = true; sfx.magic(); toast('Praėjai kiaurai sieną!', 'Slaptas kambarys… o jame kažkas auksinio!', '#ffd23a'); }
  if (FU.holo) FU.holo.material.opacity = 0.7 + 0.2 * Math.sin(t * 6);
  for (const n of FU.notes) if (n.g.visible) n.g.userData.glow.material.opacity = 0.55 + 0.35 * Math.sin(t * 4 + n.i);
  FU.ball.rotation.y = t * 1.2; FU.ball.position.y = 1.45 + Math.sin(t * 2) * 0.06;
  if (FU.clerk) FU.clerk.rotation.y = Math.sin(t * 0.6) * 0.4;
  updateLasers(t); updateGuards(dt, t);
  // picking up code notes by walking over them
  if (Q12.stage === 'bank') for (const n of FU.notes) if (n.g.visible && Math.hypot(player.pos.x - n.pos.x, player.pos.z - n.pos.z) < 1.4) {
    Q12.notes.push(n.i); saveQ12(); refreshFuture(); [880, 1175, 1568].forEach((f, k) => tone(f, 0.12, { type: 'triangle', vol: 0.05, when: k * 0.06 }));
    toast(`Raštelis! ${n.i + 1}-as kodo skaitmuo: ${Q12.code[n.i]}`, `Kodas: ${codeShown()} · rasta ${Q12.notes.length} / 4`, '#6ff7ff');
  }
  // alarm: run out before the doors shut
  if (FU.alarm) {
    FU.alarm -= dt; FU.alarmT -= dt; if (FU.alarmT < 0) { FU.alarmT = 0.8; sfx.alarm(); }
    fuAmb.color.setHex(Math.sin(t * 10) > 0 ? 0xff4040 : 0x602020);
    if (player.pos.z > 6) { FU.alarm = 0; fuAmb.color.setHex(0xb0c0ff); Q12.stage = 'carry'; saveQ12(); [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.4, { type: 'triangle', vol: 0.07, when: i * 0.1 })); toast('PABĖGAI SU KAMUOLIU!', 'Grįžk į laiko mašiną ir keliauk namo', '#ffd23a'); }
    else if (FU.alarm <= 0) { FU.alarm = 0; fuAmb.color.setHex(0xb0c0ff); loseBall(); player.pos.set(0, 0, -41.5); player.vel.set(0, 0, 0); toast('Durys užsitrenkė!', 'Kamuolys grąžintas į slėptuvę. Bandyk dar kartą – greičiau!', '#ff5a5a'); }
  }
  if (FU.flash > 0) { FU.flash -= dt; }
  // prompts
  let txt = '';
  if (!card && !padOpen) {
    const p = player.pos, near = (x, z, r) => Math.hypot(p.x - x, p.z - z) < r;
    if (near(FU.tm.position.x, FU.tm.position.z, 4.3)) txt = '<kbd>E</kbd> keliauti namo – į savo laikus';
    else if (near(9, -2, 2.2)) txt = '<kbd>E</kbd> kalbėtis su robotu kasininku';
    else if (near(9, -13.5, 2.4)) txt = skinOwned.includes('gold') ? (skinNow === 'gold' ? 'Auksinis kostiumas jau tavo ir apsirengtas' : '<kbd>E</kbd> apsirengti auksinį kostiumą') : '<kbd>E</kbd> paimti slaptą AUKSINĮ KOSTIUMĄ';
    else if (near(3.6, -37.3, 1.8) && !Q12.vault) txt = '<kbd>E</kbd> įvesti seifo kodą';
    else if (near(-7, -42.5, 2.4)) txt = '<kbd>E</kbd> apžiūrėti auksinį robotą';
    else if (near(0, -45.2, 2.2)) txt = '<kbd>E</kbd> atidaryti seifo dėžutę';
    else if (near(9.4, -43, 1.6) && !Q12.secret) txt = '<kbd>E</kbd> paspausti mažą raudoną mygtuką sienoje';
    else if (near(12, -43, 1.8) && FU.ball.visible) txt = '<kbd>E</kbd> paimti AUKSINĮ KAMUOLĮ';
  }
  setPrompt(txt);
  updateQuestHud();
}
const codeShown = () => [0, 1, 2, 3].map(i => Q12.notes.includes(i) ? Q12.code[i] : '_').join(' ');
const BOXES_TXT = ['Tuščia. Tik dulkės.', 'Senas roboto batas. Fui.', 'Šokoladinė moneta! Skani.', 'Raštelis: „Auksiniai robotai niekada nemeluoja.“', 'Guminė antytė. Cyp!', 'Raštelis: „Kamuolio čia nėra, cha cha!“', 'Ateities pinigai. Tavo laikais jie neveikia.', 'Tuščia.', 'Raštelis: „Slaptas mygtukas raudonas.“'];
function futureAction() {
  if (card) { if (card.kind === 'talk') advanceTalk(); else hideCard(); return; }
  const p = player.pos, near = (x, z, r) => Math.hypot(p.x - x, p.z - z) < r;
  if (near(FU.tm.position.x, FU.tm.position.z, 4.3)) { if (FU.alarm) { toast('Pirma pabėk iš banko!', '', '#ff5a5a'); return; } leaveFuture(); return; }
  if (near(9, -13.5, 2.4)) { takeGoldSkin(); return; }
  if (near(9, -2, 2.2)) { startTalk('Robotas kasininkas', [pick(['Sveiki atvykę į Vagių… ai, tai yra, į LABAI SĄŽININGĄ banką! Bip.', 'Auksinis kamuolys? Niekada negirdėjau. Bip. Visai ne pas mus. Bip bip.', 'Seifo kodas? Jį žino tik vagys… ai, tai yra – darbuotojai. Jie palieka raštelius visur. Bip.'])], '#6ff7ff'); return; }
  if (near(3.6, -37.3, 1.8) && !Q12.vault) { openPad(); return; }
  if (near(-7, -42.5, 2.4)) { showCard('Auksinis robotas', 'Didelė auksinė roboto statula. Jo ištiesta ranka rodo į dešinę seifo sieną. Keista – ta siena truputį kitokios spalvos…', 'E – uždaryti', '#ffd23a'); card = { kind: 'info' }; sfx.blip(); return; }
  if (near(0, -45.2, 2.2)) { const k = Q12.box % BOXES_TXT.length; Q12.box++; saveQ12(); showCard(`Seifo dėžutė Nr. ${k + 1}`, BOXES_TXT[k], 'E – uždaryti (spausk vėl prie sienos – kita dėžutė)', '#c8d0e0'); card = { kind: 'info' }; tone(500, 0.08, { type: 'square', vol: 0.04, lp: 1500 }); return; }
  if (near(9.4, -43, 1.6) && !Q12.secret) { Q12.secret = true; saveQ12(); refreshFuture(); noiseHit(0.6, { ft: 'bandpass', f: 300, fto: 120, vol: 0.2 }); sfx.magic(); toast('Slapta siena atsidarė!', 'Už jos – mažas kambarys ir kažkas auksinio…', '#ffd23a'); return; }
  if (near(12, -43, 1.8) && FU.ball.visible) { takeBall(); return; }
}
function takeBall() {
  FU.ball.visible = false; attachGoldBall(true); FU.alarm = 50; FU.alarmT = 0; sfx.alarm(); shake = Math.max(shake, 0.3);
  toast('ALIARMAS! Paėmei auksinį kamuolį!', 'Bėk iš banko per 50 sekundžių, kol durys neužsitrenkė!', '#ff5a5a');
}
function loseBall() { attachGoldBall(false); FU.alarm = 0; fuAmb.color.setHex(0xb0c0ff); refreshFuture(); }

// ---------- the vault keypad ----------
let padOpen = false, padVal = '';
function openPad() {
  let el = $('vaultPad');
  if (!el) {
    el = document.createElement('div'); el.id = 'vaultPad';
    el.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:6;background:rgba(20,16,40,.97);border:2px solid #6ff7ff;border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:10px;align-items:center;font-family:inherit;color:#fff;width:min(290px,calc(100vw - 32px));box-sizing:border-box';
    el.innerHTML = '<div style="font-size:18px;color:#6ff7ff">SEIFO KODAS</div><div id="vpDisp" style="font:32px monospace;letter-spacing:10px;background:#0a1a10;color:#3cf27a;padding:6px 14px;border-radius:8px;min-width:150px;text-align:center">____</div><div id="vpMsg" style="font-size:13px;min-height:18px;color:#c8d0e0"></div><div id="vpKeys" style="display:grid;grid-template-columns:repeat(3,64px);gap:8px"></div>';
    document.body.appendChild(el);
    const keysEl = el.querySelector('#vpKeys');
    for (const k of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK']) { const b = document.createElement('button'); b.textContent = k; b.style.cssText = 'height:52px;font-size:22px;border-radius:10px;border:none;cursor:pointer;background:' + (k === 'OK' ? '#3cf27a' : k === '⌫' ? '#ff8a6a' : '#d8dce8') + ';color:#1a1030;font-family:inherit'; b.addEventListener('click', e => { e.stopPropagation(); padPress(k); }); keysEl.appendChild(b); }
    const x = document.createElement('button'); x.textContent = 'Uždaryti (Esc)'; x.style.cssText = 'background:none;border:1px solid #888;color:#ccc;border-radius:8px;padding:4px 12px;cursor:pointer;font-family:inherit'; x.addEventListener('click', e => { e.stopPropagation(); closePad(); }); el.appendChild(x);
  }
  padOpen = true; padVal = ''; el.hidden = false; $('paused').hidden = true; for (const k in keys) keys[k] = false;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  $('vpDisp').textContent = '____'; $('vpMsg').textContent = `Rasti skaitmenys: ${codeShown()}`;
}
function closePad() { if (!padOpen) return; padOpen = false; const el = $('vaultPad'); if (el) el.hidden = true; if (!lockFailed) requestLock(); }
function padKey(e) {
  e.preventDefault();
  if (e.code === 'Escape') { closePad(); return; }
  const m = /^(Digit|Numpad)([0-9])$/.exec(e.code); if (m) { padPress(m[2]); return; }
  if (e.code === 'Backspace') padPress('⌫'); if (e.code === 'Enter' || e.code === 'NumpadEnter') padPress('OK');
}
function padPress(k) {
  if (k === '⌫') padVal = padVal.slice(0, -1);
  else if (k === 'OK') {
    if (padVal === Q12.code) {
      $('vpMsg').textContent = 'KODAS TEISINGAS!'; [523, 784, 1047].forEach((f, i) => tone(f, 0.25, { type: 'square', vol: 0.04, lp: 2500, when: i * 0.08 }));
      setTimeout(() => { closePad(); Q12.vault = true; saveQ12(); refreshFuture(); noiseHit(0.8, { ft: 'bandpass', f: 200, fto: 90, vol: 0.2 }); toast('Seifas atsidarė!', 'Kamuolys turėtų būti viduje… ar ne?', '#ffd23a'); }, 700);
      return;
    }
    tone(180, 0.35, { type: 'square', vol: 0.05, lp: 1000 }); $('vpMsg').textContent = padVal.length < 4 ? 'Reikia 4 skaitmenų' : 'NETEISINGAS KODAS. Rask visus raštelius!'; padVal = '';
  } else if (padVal.length < 4) { padVal += k; tone(900 + +k * 40, 0.05, { type: 'square', vol: 0.03, lp: 3000 }); }
  $('vpDisp').textContent = (padVal + '____').slice(0, 4);
}

// ---------- the ball goes to the museum ----------
function deliverGoldBall() {
  attachGoldBall(false); Q12.stage = 'done'; saveQ12(); addMoney(1200); refreshMuseumExtras();
  [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.6, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
  poof(museum.g.position.clone().addScaledVector(museum.d, 2), 0xffd23a);
  toast('Įsakymas #10 įvykdytas!', 'Pirmasis auksinis krepšinio kamuolys – muziejuje. Apdovanojimas: 1200 €', '#ffe98a');
}

// ---------- HUD ----------
function updateQ12Hud(el) {
  if (!q12Active()) { el.hidden = true; return; }
  el.hidden = false;
  let step = '', target = null, arrow = '', dist = '';
  const p = player.inCar ? ride.pos : player.pos, inF = mode === 'future';
  if (!inF) { if (Q12.stage === 'carry') { step = 'Nunešk auksinį kamuolį į muziejų'; target = mode === 'planet' && museum && museum.g.position; } else step = 'Kūrėjo Salėje prie laiko mašinos spausk E ir rinkis ATEITĮ'; }
  else if (FU.alarm) step = `<b>ALIARMAS! Bėk iš banko: ${Math.ceil(FU.alarm)} s</b>`, target = new V3(0, 0, 7);
  else if (Q12.stage === 'carry') { step = 'Grįžk į laiko mašiną ir keliauk namo'; target = FU.tm.position; }
  else if (p.z > 5) { step = 'Įeik į Vagių banką gatvės gale'; target = new V3(0, 0, 4); }
  else if (Q12.notes.length < 4) { step = `Rask 4 kodo raštelius · kodas: <b>${codeShown()}</b>`; let best = null, bd = 1e9; for (const n of FU.notes) if (n.g.visible) { const d = n.pos.distanceTo(p); if (d < bd) { bd = d; best = n; } } target = best && best.pos; }
  else if (!Q12.vault) { step = `Įvesk kodą <b>${Q12.code}</b> prie seifo durų`; target = new V3(3.6, 0, -37.3); }
  else if (!Q12.secret) step = 'Seife kamuolio nėra… Gal kas nors čia rodo kelią?';
  else { step = 'Paimk auksinį kamuolį slaptame kambaryje'; target = FU.ball.position; }
  if (target) { arrow = arrowTo(target); dist = ` · ${Math.round(target.distanceTo(p))} m`; if (mode === 'planet' && q2Dot) { q2Dot.visible = true; q2Dot.position.copy(target).normalize().multiplyScalar(R + 7); } }
  el.innerHTML = `${arrow}<div><div class="qt">Įsakymas #10: Auksinis kamuolys</div><div class="qs">${step}${dist}</div></div>`;
}

// ---------- the secret golden costume ----------
SKINS.push({ id: 'gold', name: 'Auksinis', desc: 'Visas auksinis ir blizgantis. Rastas slaptame Vagių banko kambaryje ateityje – už sienos, kiaurai kurią galima praeiti.', price: -1, body: '#ffc81a', hat: '#ffc81a', secret: true, hint: 'Sako, jis paslėptas ateityje, už sienos, kurios niekas nemato kiaurai…' });
{ const _eq = equipSkin; equipSkin = (id, quiet) => { _eq(id, quiet); if (skinNow === 'gold') tintPlayer(0xffc81a, 0xd8a010, { metalness: 0.85, roughness: 0.25, emissive: 0x3a2800 }); }; }
function takeGoldSkin() {
  const first = !skinOwned.includes('gold');
  unlockSkin('gold'); equipSkin('gold', true); poof(player.pos.clone().add(new V3(0, 1, 0)), 0xffd23a);
  [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.4, { type: 'triangle', vol: 0.07, when: i * 0.08 }));
  toast(first ? 'Radai slaptą AUKSINĮ KOSTIUMĄ!' : 'Persirengei: Auksinis', first ? 'Jis tavo visam laikui – rasi jį ir kostiumų kioske' : 'Blizgi kaip auksinis kamuolys', '#ffd23a');
}
