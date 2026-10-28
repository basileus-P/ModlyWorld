// ================= After the Ghost King: the Sun Goddess phones the gods, and the TIME GOD takes you =================
// The Time God's world: past and future everywhere at once. Everyone who lives there is a CLOCK (tik-tak!),
// old, present-day and brand-new cars drive around, and the same little houses stand in every era.
// His trouble: nobody can travel to the PAST any more – the Great Past Clock has stopped.
function sunPhoneLines() {
  return [
    ['Saulės Dievė', 'Dievai! Mano Saulė vėl šviečia!', 'me'],
    ['Saulės Dievė', 'Šimtai vaiduoklių užpuolė mano mažuosius spindulius. Bet žaliasis žmogeliukas paėmė mano Saulės kardą, prasiveržė pro juos visus iki Vaiduoklių pilies…', 'me'],
    ['Saulės Dievė', '…ir NUGALĖJO VAIDUOKLIŲ KARALIŲ! Visi vaiduokliai išnyko kaip rūkas. Mano spinduliai vėl skraido ir šviečia!', 'me'],
    ['Jūrų Dievas', 'Blub blub! Žinojau, kad jis tau padės! Juk jis ir mano vandenyną išgelbėjo.', '#8fd8ff'],
    ['Kūrėjas', 'Mano didvyris vėl laimėjo! Demonas, vandenynas, o dabar – Saulė!', '#ffe98a'],
    ['Griaustinio Dievas', 'BUM! BUM! VALIO!', '#c8b0ff'],
    ['Laiko Dievas', 'Tik… tak… Saulės Dieve, ar galiu pasiskolinti tą didvyrį? Mano pasaulyje didelė bėda.', '#b0ff9a'],
    ['Laiko Dievas', 'Niekas nebegali keliauti į PRAEITĮ. Didysis Praeities Laikrodis sustojo… Tik tak, tik… tak.', '#b0ff9a'],
    ['Saulės Dievė', 'Žinoma! Žaliasi, uždaryk telefoną – Laiko Dievas tave pasiims. Ir ačiū tau už mano šviesą!', 'me'],
    ['Laiko Dievas', 'Laikas keliauti! TIK TAK!', '#b0ff9a'],
    ['Visi dievai', 'VALIO SAULĖS GELBĖTOJUI!', 'all']
  ];
}
// the Goddess opens her phone a moment after the Ghost King is beaten (and again if you talk to her later)
{ const _w = winGhostKing; winGhostKing = () => { _w(); setTimeout(() => { if (mode === 'sun' && !card && !phoneOpen) { toast('Saulės Dievė rašo kitiems dievams…', 'Žiūrėk – ji parodo tau savo telefoną!', '#ffb020'); setTimeout(() => { if (mode === 'sun' && !phoneOpen) { hideCard(); openGodPhone(); } }, 1400); } }, 4500); }; }
{ const _gt = ghostTalk; ghostTalk = () => {
    if (Q17.stage === 'done' && !inTime()) { startTalk('Saulės Dievė', ['Mano Saulė vėl šviečia – ačiū tau, mažasis didvyri!', 'Žiūrėk, ką aš parašiau visiems dievams…'], '#ffb020', () => setTimeout(() => openGodPhone(), 300)); return true; }
    return _gt();
  }; }

// ---------- the Time God's clock-ring pickup ----------
const inTime = () => { try { return localStorage.getItem('modly-intime') === '1'; } catch (_) { return false; } };
let timePicking = false;
function makeClockFace(r, col = '#fff8e8', rim = '#c89a3a') {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.fillStyle = rim; x.beginPath(); x.arc(128, 128, 126, 0, Math.PI * 2); x.fill(); x.fillStyle = col; x.beginPath(); x.arc(128, 128, 112, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#2a1a10'; x.font = 'bold 26px serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2 - Math.PI / 2; x.fillText(String(i), 128 + Math.cos(a) * 90, 128 + Math.sin(a) * 90); }
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; x.fillRect(128 + Math.cos(a) * 104 - 1, 128 + Math.sin(a) * 104 - 1, 2, 2); }
  const g = new THREE.Group();
  g.add(mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), side: THREE.DoubleSide })));
  const hm = new THREE.MeshBasicMaterial({ color: 0x1a1008 });
  const hour = new THREE.Group(), min = new THREE.Group(); g.add(hour, min); hour.position.z = min.position.z = 0.02 * r;
  hour.add(mesh(new THREE.PlaneGeometry(0.08 * r, 0.5 * r), hm, 0, 0.22 * r, 0)); min.add(mesh(new THREE.PlaneGeometry(0.05 * r, 0.75 * r), hm, 0, 0.34 * r, 0.001));
  g.add(mesh(new THREE.CircleGeometry(0.07 * r, 12), new THREE.MeshBasicMaterial({ color: 0xc89a3a }), 0, 0, 0.03 * r));
  g.userData.hour = hour; g.userData.min = min; return g;
}
function timePickup() {
  if (timePicking || inTime() || mode !== 'sun') return; timePicking = true; hideCard();
  for (const k in keys) keys[k] = false; hands.L.hold = hands.R.hold = false;
  const ring = new THREE.Group(); ring.position.set(player.pos.x, 0, player.pos.z); sunScene.add(ring);
  const face = makeClockFace(3.2); face.rotation.x = -Math.PI / 2; face.position.y = 0.05; ring.add(face);
  const tor = mesh(new THREE.TorusGeometry(3.4, 0.18, 8, 40), new THREE.MeshBasicMaterial({ color: 0xb0ff9a }), 0, 0, 0); tor.rotation.x = Math.PI / 2; ring.add(tor);
  toast('Laiko Dievas tave pasiima!', 'Tik… tak… Tik… tak… Laikas sukasi aplink tave!', '#b0ff9a');
  for (let i = 0; i < 8; i++) tone(i % 2 ? 1400 : 1000, 0.05, { type: 'square', vol: 0.04, lp: 3000, when: i * 0.4 });
  tone(130, 3.4, { to: 520, type: 'sine', vol: 0.07, attack: 0.6 });
  let t = 0;
  cinema = dt => {
    t += dt; face.userData.min.rotation.z -= dt * (2 + t * 10); face.userData.hour.rotation.z -= dt * (0.3 + t); ring.rotation.y += dt * (0.5 + t);
    tor.position.y = Math.min(4, t * 1.5); tor.scale.setScalar(1 - Math.min(0.6, t * 0.15));
    player.mesh.position.copy(player.pos); player.mesh.rotation.y += dt * (2 + t * 3);
    camera.position.lerp(_ct.set(player.pos.x + 7, 6, player.pos.z + 7), Math.min(1, dt * 2)); camera.up.set(0, 1, 0); camera.lookAt(player.pos.x, player.pos.y + 1, player.pos.z);
    if (t > 3.4 && !transitioning) { transitioning = true; fadeTo(() => { transitioning = false; cinema = null; timePicking = false; sunScene.remove(ring); enterTime(); }); }
  };
}

// ---------- the Time God's world ----------
const twScene = new THREE.Scene(); twScene.background = new THREE.Color(0x2a2050); twScene.fog = new THREE.Fog(0x3a3060, 60, 220);
twScene.add(new THREE.AmbientLight(0xffffff, 0.55)); twScene.add(new THREE.HemisphereLight(0xd8e0ff, 0x6a5a3a, 0.6));
{ const l = new THREE.DirectionalLight(0xfff0d8, 0.8); l.position.set(30, 80, 40); twScene.add(l); }
const TW = { built: false, boxes: [], clocks: [], cars: [], skyClocks: [], gears: [], god: null, past: null, houses: [], towers: [] };
const TW_LINES = ['Tik tak! Sveikas, keliautojau!', 'Aš ką tik grįžau iš ateities. Ten visi skraido!', 'Mano senelis – kukučkinis laikrodis. Ku-kū!', 'Tik… tak… Kodėl negaliu nueiti į vakar?', 'Čia praeitis ir ateitis gyvena kartu. Ir visi – laikrodžiai!', 'Tavo laikrodis kur? Neturi?! Kaip tu žinai, kiek valandų?', 'Didysis Praeities Laikrodis sustojo… Laiko Dievas labai liūdnas.', 'Atsargiai – ten važinėja ir senos, ir dabartinės, ir naujos mašinos!'];
function twGroundTex() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 1024; const x = c.getContext('2d');
  // left = the past (sepia sand and dry grass), middle = today (green), right = the future (dark with a neon grid)
  const g = x.createLinearGradient(0, 0, 1024, 0); g.addColorStop(0, '#b89a6a'); g.addColorStop(0.3, '#c8aa70'); g.addColorStop(0.42, '#6cbf5a'); g.addColorStop(0.58, '#6cbf5a'); g.addColorStop(0.7, '#2a2a48'); g.addColorStop(1, '#1a1a38');
  x.fillStyle = g; x.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 600; i++) { const px = Math.random() * 380, py = Math.random() * 1024; x.fillStyle = `rgba(${120 + Math.random() * 40},${90 + Math.random() * 30},50,.35)`; x.fillRect(px, py, 6, 3); }
  x.strokeStyle = 'rgba(90,255,255,.5)'; x.lineWidth = 2; for (let k = 720; k < 1024; k += 32) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k, 1024); x.stroke(); } for (let k = 0; k < 1024; k += 32) { x.beginPath(); x.moveTo(720, k); x.lineTo(1024, k); x.stroke(); }
  return new THREE.CanvasTexture(c);
}
function makeClockPerson(kind) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const caseM = mat(kind === 0 ? 0x8a5a2b : kind === 1 ? 0xc8ccd6 : 0xffc81a, { metalness: kind ? 0.6 : 0.1, roughness: 0.4 });
  body.add(S(G.cyl, caseM, 0.55, 0.3, 0.55, 0, 1.3, 0).rotateX(Math.PI / 2));
  const face = makeClockFace(0.46, kind === 2 ? '#fffbe8' : '#ffffff', kind === 0 ? '#6a3a1a' : '#a8acb6'); face.position.set(0, 1.3, 0.16); body.add(face);
  body.add(S(G.sph, caseM, 0.14, 0.14, 0.14, 0, 1.9, 0)); for (const sx of [-1, 1]) body.add(S(G.dome, mat(0xffd23a, { metalness: 0.7 }), 0.18, 0.14, 0.18, sx * 0.32, 1.8, 0).rotateZ(-sx * 0.5));
  for (const x of [-0.13, 0.13]) { body.add(S(G.sph, bmat(0xffffff), 0.07, 0.08, 0.03, x, 1.5, 0.19)); body.add(S(G.sph, bmat(0x111111), 0.035, 0.04, 0.02, x, 1.5, 0.22)); }
  const arms = []; for (const sx of [-1, 1]) { const a = new THREE.Group(); a.position.set(sx * 0.55, 1.3, 0); body.add(a); a.add(S(G.cyl, mat(0x2a2a30), 0.04, 0.5, 0.04, 0, -0.25, 0)); a.add(S(G.sph, bmat(0xffffff), 0.08, 0.08, 0.08, 0, -0.52, 0)); arms.push(a); }
  const legs = []; for (const sx of [-1, 1]) { const l = new THREE.Group(); l.position.set(sx * 0.18, 0.78, 0); body.add(l); l.add(S(G.cyl, mat(0x2a2a30), 0.05, 0.7, 0.05, 0, -0.35, 0)); l.add(S(G.box, mat(0x1a1a20), 0.14, 0.08, 0.24, 0, -0.72, 0.05)); legs.push(l); }
  g.userData = { body, face, arms, legs }; return g;
}
function makeEraCar(era, col) {
  const g = new THREE.Group();
  if (era === 0) {   // an old car: tall, black, round fenders, spoked wheels
    const m = mat(col, { roughness: 0.4, metalness: 0.3 });
    g.add(S(G.box, m, 1.6, 0.7, 3.2, 0, 0.9, 0)); g.add(S(G.box, m, 1.5, 0.9, 1.5, 0, 1.6, -0.4)); g.add(S(G.box, mat(0xc8e8ff, { metalness: 0.3 }), 1.3, 0.5, 0.05, 0, 1.65, 0.36));
    for (const [x, z] of [[-0.85, 1.1], [0.85, 1.1], [-0.85, -1.1], [0.85, -1.1]]) { g.add(S(G.cyl, mat(0x1a1a1a), 0.55, 0.2, 0.55, x, 0.55, z).rotateZ(Math.PI / 2)); g.add(S(G.cyl, mat(0xd8d8d8, { metalness: 0.8 }), 0.25, 0.22, 0.25, x, 0.55, z).rotateZ(Math.PI / 2)); g.add(S(G.dome, m, 0.6, 0.35, 0.7, x, 0.75, z)); }
    for (const x of [-0.5, 0.5]) g.add(S(G.sph, bmat(0xfff8c0), 0.16, 0.16, 0.1, x, 1.05, 1.62));
  } else if (era === 1) {   // a car like today's
    const m = mat(col, { roughness: 0.3, metalness: 0.4 });
    g.add(S(G.box, m, 1.8, 0.6, 3.6, 0, 0.65, 0)); g.add(S(G.box, mat(0x2a3a4a, { metalness: 0.6, roughness: 0.2 }), 1.6, 0.55, 1.9, 0, 1.2, -0.2));
    for (const [x, z] of [[-0.9, 1.2], [0.9, 1.2], [-0.9, -1.2], [0.9, -1.2]]) g.add(S(G.cyl, mat(0x1a1a1a), 0.38, 0.25, 0.38, x, 0.38, z).rotateZ(Math.PI / 2));
    for (const x of [-0.6, 0.6]) g.add(S(G.box, bmat(0xffffd0), 0.35, 0.15, 0.05, x, 0.75, 1.81));
  } else {   // a car from the future: a hovering silver pod with a glowing belly
    const m = mat(0xe8eef8, { metalness: 0.9, roughness: 0.15 });
    g.add(S(G.sph, m, 1, 0.55, 1.9, 0, 1.1, 0)); g.add(S(G.sph, new THREE.MeshStandardMaterial({ color: 0x6af0ff, transparent: true, opacity: 0.55, metalness: 0.3, roughness: 0.05 }), 0.7, 0.45, 0.9, 0, 1.45, 0.2));
    g.add(mesh(new THREE.TorusGeometry(0.95, 0.06, 6, 24), bmat(col), 0, 0.75, 0).rotateX(Math.PI / 2));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: col, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })); glow.scale.set(3, 1.2, 1); glow.position.y = 0.35; g.add(glow);
  }
  return g;
}
function makeEraHouse(era) {
  const g = new THREE.Group();
  const wall = era === 0 ? mat(0xa87a4a, { roughness: 1 }) : era === 1 ? mat(0xf4f0e8) : mat(0xd8e4f4, { metalness: 0.6, roughness: 0.2 });
  const roof = era === 0 ? mat(0xd8b860, { roughness: 1 }) : era === 1 ? mat(0xc8402a) : mat(0x3a4a6a, { metalness: 0.7, roughness: 0.2 });
  g.add(S(G.box, wall, 5, 3.4, 4.4, 0, 1.7, 0));
  const rf = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 5.4, 4, 1), roof); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 0.42, 0.9); rf.position.y = 4.15; g.add(rf);
  g.add(S(G.box, era === 2 ? bmat(0x5affff) : mat(0x6a4426), 1.1, 2, 0.08, 0, 1, 2.22));
  for (const x of [-1.6, 1.6]) g.add(S(G.box, era === 2 ? bmat(0x9a6aff) : mat(0xbfe0ff, { metalness: 0.3 }), 0.9, 0.8, 0.08, x, 2.1, 2.22));
  if (era === 0) for (let i = 0; i < 3; i++) g.add(S(G.box, mat(0x6a4426), 5.05, 0.08, 4.45, 0, 0.8 + i * 0.9, 0));
  if (era === 2) { g.add(S(G.box, bmat(0x5affff), 5.05, 0.06, 4.45, 0, 3.4, 0)); g.add(S(G.cyl, mat(0xc8ccd6, { metalness: 0.8 }), 0.05, 1.4, 0.05, 1.6, 5.2, 0)); g.add(S(G.sph, bmat(0xff5ad8), 0.15, 0.15, 0.15, 1.6, 5.95, 0)); }
  else g.add(S(G.box, era === 0 ? mat(0x8a8070) : mat(0xa84a3a), 0.6, 1.4, 0.6, 1.4, 4.6, -0.6));
  return g;
}
const ROAD_R = 46;   // a square loop road around the middle
function roadPoint(s) { // s in [0,4): position on the square loop
  s = ((s % 4) + 4) % 4; const k = Math.floor(s), f = s - k, R2 = ROAD_R;
  const P = [[-R2, -R2], [R2, -R2], [R2, R2], [-R2, R2]], a = P[k], b = P[(k + 1) % 4];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, Math.atan2(b[0] - a[0], b[1] - a[1])];
}
function buildTimeWorld() {
  if (TW.built) return; TW.built = true;
  const ground = mesh(new THREE.PlaneGeometry(260, 260), new THREE.MeshBasicMaterial({ map: twGroundTex() }), 0, 0, 0); ground.rotation.x = -Math.PI / 2; twScene.add(ground); TW.ground = ground;
  // the road (four straight pieces with a dashed middle line)
  const road = mat(0x3a3a42, { roughness: 0.9 });
  for (let k = 0; k < 4; k++) { const [x0, z0] = roadPoint(k), [x1, z1] = roadPoint(k + 1), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, len = Math.hypot(x1 - x0, z1 - z0) + 7; const r = S(G.box, road, Math.abs(x1 - x0) > 1 ? len : 7, 0.06, Math.abs(z1 - z0) > 1 ? len : 7, cx, 0.03, cz); twScene.add(r);
    for (let i = -10; i <= 10; i++) { const along = i / 10 * (len / 2 - 3); twScene.add(S(G.box, bmat(0xffffff), Math.abs(x1 - x0) > 1 ? 1.4 : 0.15, 0.02, Math.abs(z1 - z0) > 1 ? 1.4 : 0.15, Math.abs(x1 - x0) > 1 ? cx + along : cx, 0.07, Math.abs(z1 - z0) > 1 ? cz + along : cz)); } }
  // the same little houses everywhere – old ones in the past (left), today's in the middle, future ones on the right
  for (const [x, z] of [[-70, -66], [-40, -66], [-70, 66], [-40, 66], [-72, -20], [-72, 20], [-12, -66], [12, -66], [-12, 66], [12, 66], [40, -66], [70, -66], [40, 66], [70, 66], [72, -20], [72, 20]]) {
    const era = x < -25 ? 0 : x > 25 ? 2 : 1, h = makeEraHouse(era); h.position.set(x, 0, z);
    h.rotation.y = Math.abs(z) > 50 ? (z < 0 ? 0 : Math.PI) : (x < 0 ? Math.PI / 2 : -Math.PI / 2); twScene.add(h); TW.houses.push({ h, era });
    TW.boxes.push({ x, z, hx: 2.8, hz: 2.8, h: 6 });
  }
  // past things: a hut, a mammoth tusk arch, dinosaur bones / future things: glass towers, a flying platform
  for (const [x, z] of [[-95, 10], [-100, -25]]) { const c = S(G.cone, mat(0xc8aa70, { roughness: 1 }), 3, 4, 3, x, 2, z); twScene.add(c); TW.boxes.push({ x, z, hx: 2.5, hz: 2.5, h: 4 }); }
  for (const sx of [-1, 1]) { const tusk = mesh(new THREE.TorusGeometry(3, 0.35, 8, 20, Math.PI * 0.8), mat(0xf4ecd8), -80 + sx * 2.5, 0, 30); tusk.rotation.y = Math.PI / 2; twScene.add(tusk); }
  for (const [x, z, h] of [[95, -20, 30], [105, 15, 40], [88, 40, 24], [110, -45, 34]]) { const tw1 = S(G.box, new THREE.MeshStandardMaterial({ color: 0x8ad8ff, metalness: 0.8, roughness: 0.1, transparent: true, opacity: 0.85 }), 7, h, 7, x, h / 2, z), tw2 = S(G.box, bmat(0x5affff), 7.1, 0.2, 7.1, x, h, z); twScene.add(tw1, tw2); TW.towers.push(tw1, tw2); TW.boxes.push({ x, z, hx: 3.6, hz: 3.6, h: 99 }); }
  // the sky: floating clocks and turning gears
  for (const [x, y, z, r] of [[-60, 40, -90, 9], [40, 50, -100, 12], [100, 35, 20, 7], [-110, 45, 30, 8], [0, 60, 90, 10]]) { const c = makeClockFace(r); c.position.set(x, y, z); c.lookAt(0, 10, 0); twScene.add(c); TW.skyClocks.push({ c, sp: rr(0.3, 1.2) * (rnd() < 0.5 ? -1 : 1) }); }
  for (const [x, y, z, r] of [[-30, 30, -70, 6], [70, 25, -60, 8], [-80, 28, 70, 7]]) { const gg = new THREE.Group(); gg.position.set(x, y, z); gg.lookAt(0, 10, 0); twScene.add(gg); const m = mat(0xc89a3a, { metalness: 0.8, roughness: 0.3 }); gg.add(mesh(new THREE.TorusGeometry(r, r * 0.18, 8, 24), m)); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; gg.add(S(G.box, m, r * 0.3, r * 0.3, r * 0.2, Math.cos(a) * r * 1.15, Math.sin(a) * r * 1.15, 0).rotateZ(a)); } TW.gears.push({ g: gg, sp: rr(0.1, 0.4) * (rnd() < 0.5 ? -1 : 1) }); }
  // the Time God – an old giant with a long beard, a starry robe, an hourglass and a clock halo
  { const g = new THREE.Group(); g.position.set(0, 0, -24); twScene.add(g); TW.god = g;
    const robe = mat(0x2a3a8a, { roughness: 0.7 }), skin = mat(0xf0c8a0), beard = mat(0xf4f4f8, { roughness: 1 });
    g.add(S(G.cyl, robe, 4.5, 12, 4.5, 0, 6, 0)); for (let i = 0; i < 24; i++) { const a = rr(0, 6.28), y = rr(1, 11); g.add(S(G.sph, bmat(0xffe14d), 0.15, 0.15, 0.15, Math.cos(a) * (4.6 - y * 0.08), y, Math.sin(a) * (4.6 - y * 0.08))); }
    const head = new THREE.Group(); head.position.set(0, 15, 0); g.add(head); TW.head = head;
    head.add(S(G.sph, skin, 3, 3.2, 3)); head.add(S(G.sph, beard, 2.8, 4.5, 1.6, 0, -3.2, 1.6)); head.add(S(G.ico1, beard, 3.2, 1.4, 3.2, 0, 2.6, -0.3));
    for (const x of [-1.1, 1.1]) { head.add(S(G.sph, bmat(0xffffff), 0.55, 0.55, 0.3, x, 0.6, 2.7)); head.add(S(G.sph, bmat(0x2a4a1a), 0.28, 0.28, 0.2, x, 0.6, 2.95)); head.add(S(G.box, beard, 1.2, 0.3, 0.3, x, 1.4, 2.7)); head.add(mesh(new THREE.TorusGeometry(0.75, 0.08, 6, 20), mat(0xc89a3a, { metalness: 0.8 }), x, 0.6, 2.9)); }
    const halo = makeClockFace(6.5, '#f4f0ff', '#c89a3a'); halo.position.set(0, 15.5, -2.8); g.add(halo); TW.halo = halo;
    for (const sx of [-1, 1]) { const arm = S(G.cyl, robe, 1, 7, 1, sx * 5, 9, 0.6); arm.rotation.z = sx * 0.6; g.add(arm); }
    // the hourglass in his hand
    const hg = new THREE.Group(); hg.position.set(7.4, 6, 1.6); g.add(hg); TW.hourglass = hg; const wood = mat(0x6a4426);
    hg.add(S(G.cyl, wood, 1.4, 0.3, 1.4, 0, 2.2, 0)); hg.add(S(G.cyl, wood, 1.4, 0.3, 1.4, 0, -2.2, 0)); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) hg.add(S(G.cyl, wood, 0.1, 4.4, 0.1, x, 0, z));
    hg.add(S(G.cone, new THREE.MeshStandardMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.35, roughness: 0.05 }), 1.1, 2, 1.1, 0, 1, 0).rotateX(Math.PI)); hg.add(S(G.cone, new THREE.MeshStandardMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.35, roughness: 0.05 }), 1.1, 2, 1.1, 0, -1, 0));
    hg.add(S(G.cone, mat(0xe8c870), 0.7, 0.9, 0.7, 0, -1.55, 0)); g.add(S(G.sph, skin, 1, 1, 1, 6.8, 6.4, 1.2));
    const sign = mesh(new THREE.PlaneGeometry(8, 1.4), new THREE.MeshBasicMaterial({ map: labelTex('LAIKO DIEVAS', '#2a3a8a', '#ffe14d', 512, 96), side: THREE.DoubleSide }), 0, 1.2, 5); g.add(sign);
    TW.boxes.push({ x: 0, z: -24, hx: 5, hz: 5, h: 30 });
  }
  // the Great Past Clock beside him – stopped, cracked, its hands stuck
  { const g = new THREE.Group(); g.position.set(-18, 0, -26); twScene.add(g); TW.past = g;
    const st = mat(0x7a6a5a, { roughness: 0.9 });
    g.add(S(G.box, st, 5, 14, 3, 0, 7, 0)); g.add(S(G.cone, mat(0x5a4a3a), 3.8, 4, 3.8, 0, 16, 0).rotateY(Math.PI / 4));
    const f = makeClockFace(2.2, '#c8b8a0', '#5a4a3a'); f.position.set(0, 11, 1.52); g.add(f); f.userData.hour.rotation.z = 2.4; f.userData.min.rotation.z = -0.6; TW.pastFace = f;
    for (let i = 0; i < 4; i++) { const cr = S(G.box, bmat(0x1a1008), 0.06, rr(0.8, 1.6), 0.02, rr(-1, 1), 11 + rr(-1, 1), 1.56); cr.rotation.z = rr(-1, 1); g.add(cr); }
    g.add(mesh(new THREE.PlaneGeometry(4.6, 0.8), new THREE.MeshBasicMaterial({ map: labelTex('PRAEITIES LAIKRODIS', '#3a2a1a', '#ffb0a0', 512, 90) }), 0, 7.8, 1.52));
    const warn = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xff4a4a, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending })); warn.scale.setScalar(7); warn.position.set(0, 11, 2); g.add(warn); TW.warn = warn;
    TW.boxes.push({ x: -18, z: -26, hx: 2.7, hz: 1.7, h: 20 });
  }
  // the clock people
  for (let i = 0; i < 16; i++) { const m = makeClockPerson(i % 3); const x = rr(-38, 38), z = rr(-36, 38); m.position.set(x, 0, z); twScene.add(m); TW.clocks.push({ m, fwd: new V3(rr(-1, 1), 0, rr(-1, 1)).normalize(), t: rr(1, 4), ph: rr(0, 9), walk: 0, line: TW_LINES[i % TW_LINES.length], hop: 0 }); }
  // old, today's and new cars on the loop road
  [[0, 0x1a1a1a], [1, 0xd8303a], [2, 0x5affff], [0, 0x3a2a1a], [1, 0x3a6ad8], [2, 0xff5ad8]].forEach(([era, col], i) => { const c = makeEraCar(era, col); twScene.add(c); TW.cars.push({ m: c, era, s: i * 4 / 6, sp: era === 0 ? 0.03 : era === 1 ? 0.05 : 0.07, honk: 0 }); });
  linearize(twScene);
}
function enterTime() {
  buildTimeWorld(); mode = 'time'; twScene.add(player.mesh); player.mesh.visible = true; musicSet(6); setScope(false);
  try { localStorage.setItem('modly-intime', '1'); localStorage.removeItem('modly-pos'); } catch (_) { }
  if (typeof attachSunSword === 'function') attachSunSword(false);
  player.pos.set(0, 0, 18); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.pitch = 0.3; player.up.set(0, 1, 0); player.grounded = true;
  camera.position.set(0, 5, 26); camera.up.set(0, 1, 0);
  $('bName').textContent = 'Laiko pasaulis'; $('bEn').textContent = 'Laiko Dievo namai'; $('bAtm').textContent = 'Kairėje – praeitis, dešinėje – ateitis. Gyventojai – laikrodžiai, keliais rieda senos, dabartinės ir naujos mašinos.'; document.documentElement.style.setProperty('--biome', '#b0ff9a');
  if (!TW.welcomed) { TW.welcomed = true; setTimeout(() => toast('Tu LAIKO PASAULYJE!', 'Kairėje – praeitis, dešinėje – ateitis. Nueik pas Laiko Dievą (E)', '#b0ff9a'), 600); }
}
const nearTimeGod = () => Math.hypot(player.pos.x - TW.god.position.x, player.pos.z - TW.god.position.z) < 12;
function nearClock() { let best = null, bd = 2.8; for (const c of TW.clocks) { const d = Math.hypot(c.m.position.x - player.pos.x, c.m.position.z - player.pos.z); if (d < bd) { bd = d; best = c; } } return best; }
const nearPastClock = () => Math.hypot(player.pos.x - TW.past.position.x, player.pos.z - TW.past.position.z - 2) < 5;
function timeHand(side) { hands[side].hold = true; tone(1200, 0.05, { type: 'square', vol: 0.03, lp: 3000 }); tone(900, 0.05, { type: 'square', vol: 0.03, lp: 3000, when: 0.25 }); const c = nearClock(); if (c) { c.hop = 1; bubbleIn(twScene, c.m.position, pick(['Tik!', 'Tak!', 'Tik tak!', 'Dzin!']), 2.4); } }
function timeAction() {
  if (card) { if (card.kind === 'talk') advanceTalk(); else hideCard(); return; }
  const c = nearClock(); if (c) { c.hop = 1; startTalk('Laikrodis', [c.line], '#b0ff9a'); return; }
  if (nearPastClock()) { startTalk('Praeities Laikrodis', ['…', 'Jis tylus. Rodyklės įstrigusios, stiklas suskilęs. Jokio tik-tak.'], '#ffb0a0'); return; }
  if (nearTimeGod()) { talkTimeGod(); return; }
}
function talkTimeGod() {
  if (TW.met) { startTalk('Laiko Dievas', [pick(['Tik… tak… Be Praeities Laikrodžio niekas negali nukeliauti į praeitį. Net tavo laiko mašina.', 'Mano laikrodukai labai liūdi – jie nebegali aplankyti savo senelių praeityje.', 'Kai sugalvosiu, kaip pataisyti Praeities Laikrodį, – tau pirmam pasakysiu. Tik tak!'])], '#b0ff9a'); return; }
  startTalk('Laiko Dievas', [
    'Tik tak… Sveikas, mažasis žaliasis! Aš – Laiko Dievas. Ačiū, kad atvykai.',
    'Mano pasaulyje laikas sumaišytas: kairėje – praeitis, dešinėje – ateitis, o viduryje – šiandiena. Visi čia gyvena kartu.',
    'Visi mano gyventojai – laikrodžiai. O keliais važinėja ir senovinės, ir dabartinės, ir ateities mašinos. Saugokis jų!',
    'Bet pas mane didelė bėda… Žiūrėk – Didysis PRAEITIES LAIKRODIS sustojo. Jo rodyklės įstrigo, stiklas suskilo.',
    'Todėl niekas nebegali keliauti į PRAEITĮ. Nei mano laikrodukai, nei tu, nei net tavo laiko mašina. Tik… tak…'
  ], '#b0ff9a', () => { TW.met = true; try { localStorage.setItem('modly-timemet', '1'); } catch (_) { } });
}
try { TW.met = localStorage.getItem('modly-timemet') === '1'; } catch (_) { }
function updateTimeWorld(dt, t) {
  const f = player.down ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = player.down ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 10 : 6; _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, Math.min(1, (player.grounded ? 10 : 3) * dt));
  if (keys.Space && player.grounded && Q8.back !== 'jetpack') { player.vr = 8; player.grounded = false; sfx.jump(); }
  if (!player.down) flatJetpack(dt);
  player.vr -= 20 * dt; player.pos.addScaledVector(player.vel, dt); player.pos.y += player.vr * dt;
  let ground = 0; const rad = 0.4;
  for (const b of TW.boxes) { const dx = player.pos.x - b.x, dz = player.pos.z - b.z, ex = b.hx + rad - Math.abs(dx), ez = b.hz + rad - Math.abs(dz); if (ex <= 0 || ez <= 0) continue; if (player.pos.y >= b.h - 0.5) { if (b.h > ground) ground = b.h; } else if (ex < ez) player.pos.x += dx < 0 ? -ex : ex; else player.pos.z += dz < 0 ? -ez : ez; }
  if (player.pos.y > 40) { player.pos.y = 40; player.vr = Math.min(0, player.vr); }
  if (player.pos.y <= ground) { player.pos.y = ground; if (player.vr < 0) player.vr = 0; player.grounded = true; } else player.grounded = false;
  player.pos.x = clamp(player.pos.x, -125, 125); player.pos.z = clamp(player.pos.z, -125, 125);
  // cars bump you out of the way
  for (const c of TW.cars) { const dx = player.pos.x - c.m.position.x, dz = player.pos.z - c.m.position.z, d = Math.hypot(dx, dz); if (d < 2.2 && player.pos.y < 2.5) { player.vel.set(dx / (d || 1) * 9, 0, dz / (d || 1) * 9); player.vr = 4; player.grounded = false; if (c.honk <= 0) { c.honk = 2; tone(c.era === 0 ? 300 : c.era === 1 ? 440 : 880, 0.3, { type: c.era === 2 ? 'sine' : 'square', vol: 0.05, lp: 2000 }); bubbleIn(twScene, c.m.position, c.era === 0 ? 'Tūt-tūūt!' : c.era === 1 ? 'Pyyp!' : 'Vžžžium!', 2.4); } } }
  player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd);
  animateMan(dt, f !== 0 || s !== 0, sp);
  const dist = 6.2, pitch = player.pitch;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1)); if (_ct.y < 0.5) _ct.y = 0.5;
  camera.position.lerp(_ct, Math.min(1, dt * 8)); camera.up.set(0, 1, 0); camera.lookAt(player.pos.clone().add(new V3(0, 1.4, 0)));
  // the world ticks
  for (const sc of TW.skyClocks) { sc.c.userData.min.rotation.z -= dt * sc.sp; sc.c.userData.hour.rotation.z -= dt * sc.sp / 12; }
  for (const g of TW.gears) g.g.rotateZ(dt * g.sp);
  TW.halo.userData.min.rotation.z = -t * 0.6; TW.halo.userData.hour.rotation.z = -t * 0.05; TW.hourglass.rotation.z = Math.sin(t * 0.4) * 0.15;
  TW.god.rotation.y = Math.atan2(player.pos.x - TW.god.position.x, player.pos.z - TW.god.position.z) * 0.3; TW.head.rotation.z = Math.sin(t * 0.7) * 0.05;
  TW.pastFace.userData.min.rotation.z = -0.6 + Math.sin(t * 9) * 0.04 * (Math.sin(t * 0.7) > 0.6 ? 1 : 0);   // it only twitches – stuck
  TW.warn.material.opacity = 0.25 + 0.2 * Math.sin(t * 2);
  for (const c of TW.cars) { c.honk -= dt; c.s += c.sp * dt; const [x, z, ry] = roadPoint(c.s); c.m.position.set(x + (c.era - 1) * 0.8, c.era === 2 ? 0.4 + Math.sin(t * 3 + c.s) * 0.15 : 0, z); c.m.rotation.y = ry; }
  for (const c of TW.clocks) {
    const ud = c.m.userData; ud.face.userData.min.rotation.z = -t * 2 - c.ph; ud.face.userData.hour.rotation.z = -t * 0.2 - c.ph;
    c.hop = Math.max(0, c.hop - dt); c.t -= dt; if (c.t < 0) { c.t = rr(2, 5); c.fwd.applyAxisAngle(UP, rr(-2, 2)); }
    const near = Math.hypot(c.m.position.x - player.pos.x, c.m.position.z - player.pos.z) < 3;
    if (!near) { c.m.position.addScaledVector(c.fwd, dt * 1.6); c.walk += dt * 6; }
    if (Math.abs(c.m.position.x) > 40 || Math.abs(c.m.position.z) > 40) c.fwd.set(-c.m.position.x, 0, -c.m.position.z).normalize();
    for (const b of TW.boxes) if (Math.abs(c.m.position.x - b.x) < b.hx + 0.5 && Math.abs(c.m.position.z - b.z) < b.hz + 0.5) { c.fwd.negate(); c.m.position.addScaledVector(c.fwd, 0.4); }
    const sw = near ? 0 : Math.sin(c.walk) * 0.5; ud.legs[0].rotation.x = sw; ud.legs[1].rotation.x = -sw; ud.arms[0].rotation.x = -sw; ud.arms[1].rotation.x = sw;
    c.m.position.y = Math.sin(c.hop * Math.PI) * 0.8;
    c.m.rotation.y = near ? Math.atan2(player.pos.x - c.m.position.x, player.pos.z - c.m.position.z) : Math.atan2(c.fwd.x, c.fwd.z);
  }
  let txt = '';
  if (!card) { const c = nearClock(); if (c) txt = '<kbd>E</kbd> kalbėtis su laikrodžiu'; else if (nearPastClock()) txt = '<kbd>E</kbd> apžiūrėti Praeities Laikrodį'; else if (nearTimeGod()) txt = '<kbd>E</kbd> kalbėtis su Laiko Dievu'; else txt = TW.isPast ? '<kbd>Space</kbd> – pašokti · visas pasaulis dabar – praeitis!' : '<kbd>Space</kbd> – pašokti · kairėje – praeitis, dešinėje – ateitis'; }
  setPrompt(txt);
  updateQuestHud();
}
function timeTest() { if (mode === 'time') return; hideCard(); enterTime(); }
