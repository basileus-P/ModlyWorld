// ================= Command #7: "The Cloud Prince" =================
// collect 50 feathers → buy wings in the costume kiosk → fly up to the cloud castle above the city → the Cloud King's son
// is stuck on a cloud by Mars → fly up, up, up into space → bring the prince home → the King gives you a little cloud →
// take it to the museum → you get a cloud jet-pack
const Q8 = { stage: 'none', got: [], back: null, owned: [] };   // none | feathers | wings | king | prince | home | cloud | done
try { const s = JSON.parse(localStorage.getItem('modly-quest8') || 'null'); if (s) { Object.assign(Q8, s); if (Q8.stage === 'home') Q8.stage = 'prince'; } } catch (_) { }
function saveQ8() { try { localStorage.setItem('modly-quest8', JSON.stringify({ stage: Q8.stage, got: Q8.got, back: Q8.back, owned: Q8.owned })); } catch (_) { } }
const FEATHERS_N = 50;
const q8Active = () => Q8.stage !== 'none' && Q8.stage !== 'done';
const Q8_GIVE = [
  'Pakelk galvą, mažasis. Matai tą didelį debesį virš miesto? Ten stovi Debesų Karaliaus pilis.',
  'Karalius liūdi – jo sūnus, Debesų Princas, dingo. Bet į debesis be sparnų nepateksi.',
  'Naujas įsakymas: DEBESŲ PRINCAS. Po visą pasaulį prie kelių išbarstytos 50 plunksnų. Surink jas – kostiumų kioske už jas gausi sparnus.'
];
function Q8_LINES() {
  if (Q8.stage === 'none') return Q8_GIVE;
  if (Q8.stage === 'feathers') return [`Plunksnų turi ${Q8.got.length} iš ${FEATHERS_N}. Jos šviečia prie kelių – rodyklė parodys artimiausią.`];
  if (Q8.stage === 'wings') return ['Visos plunksnos! Nueik į kostiumų kioską aikštėje ir iškeisk jas į sparnus.'];
  if (Q8.stage === 'king') return ['Su sparnais skrisk į debesį virš miesto: Space – pašokti, o ore spausk Space vėl ir vėl – mojuosi sparnais.'];
  if (Q8.stage === 'prince' || Q8.stage === 'home') return ['Princas – Marso debesyje. Skrisk aukštyn, vis aukštyn, pro patį dangų.'];
  if (Q8.stage === 'cloud') return ['Karaliaus dovana – stebuklingas debesėlis. Nunešk jį į muziejų.'];
  const fin8 = ['Debesų Karalius vėl laimingas, o tu skraidai su debesų kuprine. Danguje dabar – tavo keliai.'];
  return Q10.stage === 'none' ? fin8.concat(Q10_GIVE) : (Q10_LINES() || fin8);
}
function q8TalkEnd() {
  if (Q8.stage !== 'none' || Q7.stage !== 'done') return false;
  Q8.stage = 'feathers'; saveQ8(); showFeathers();
  [523, 659, 784, 1047, 784].forEach((f, i) => tone(f, 0.4, { type: 'sine', vol: 0.06, when: i * 0.12 }));
  toast('Įsakymas #7: Debesų Princas', 'Surink 50 plunksnų – jos šviečia prie kelių visame pasaulyje', '#bfe8ff');
  return true;
}

// ---------- feathers ----------
const feathers = [];
function makeFeather() {
  const g = new THREE.Group();
  const vane = S(G.sph, mat(0xffffff, { emissive: 0xbfe8ff, emissiveIntensity: 0.4, roughness: 0.6 }), 0.18, 0.55, 0.05, 0, 0.55, 0); g.add(vane);
  g.add(S(G.cyl, mat(0xd8c8a8), 0.015, 1.0, 0.015, 0, 0.45, 0.03));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xbfe8ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 })); glow.scale.setScalar(1.8); glow.position.y = 0.55; g.add(glow);
  return g;
}
function buildFeathers() {
  const samples = [];
  for (const path of roadPaths) for (let i = 2; i < path.s.length - 2; i += 2) if (!path.s[i].bridge) samples.push(path.s[i]);
  const step = samples.length / FEATHERS_N;
  for (let k = 0; k < FEATHERS_N; k++) {
    const x = samples[Math.floor(k * step + step * 0.37) % samples.length];
    const d = moveAlong(x.d, x.side, (k % 2 ? 1 : -1) * (ROAD_HALF + 1.6));
    const m = makeFeather(); world.add(m); linearize(m);
    const pos = d.clone().multiplyScalar(R + Math.max(groundH(d), TH(d)) + 0.6);
    m.position.copy(pos); orient(m, d, tangentToward(d, x.d)); m.visible = false;
    feathers.push({ m, pos, d, i: k });
  }
  if (Q8.stage === 'feathers') showFeathers();
}
function showFeathers() { for (const f of feathers) f.m.visible = Q8.stage === 'feathers' && !Q8.got.includes(f.i); }
function updateFeathers(dt, t) {
  if (Q8.stage !== 'feathers') return;
  const p = player.inCar ? ride.pos : player.pos;
  for (const f of feathers) {
    if (!f.m.visible) continue;
    f.m.position.copy(f.pos).addScaledVector(f.d, Math.sin(t * 2 + f.i) * 0.25); f.m.rotateY(dt * 2);
    if (f.pos.distanceTo(p) < (player.inCar ? 3.2 : 2.3)) {
      f.m.visible = false; Q8.got.push(f.i); saveQ8();
      tone(1320 + Q8.got.length * 8, 0.12, { type: 'sine', vol: 0.05 }); tone(1760, 0.1, { type: 'sine', vol: 0.04, when: 0.06 });
      if (Q8.got.length >= FEATHERS_N) {
        Q8.stage = 'wings'; saveQ8();
        [523, 659, 784, 1047].forEach((fr, i) => tone(fr, 0.4, { type: 'triangle', vol: 0.06, when: i * 0.1 }));
        toast('Visos 50 plunksnų!', 'Nueik į kostiumų kioską aikštėje ir nusipirk sparnus', '#bfe8ff');
      } else if (Q8.got.length % 10 === 0) toast(`Plunksnų: ${Q8.got.length} / ${FEATHERS_N}`, 'Rodyklė rodo artimiausią', '#bfe8ff');
    }
  }
}
function nearestFeather() { let b = null, bd = 1e9; const p = player.inCar ? ride.pos : player.pos; for (const f of feathers) if (f.m.visible) { const d = f.pos.distanceTo(p); if (d < bd) { bd = d; b = f; } } return b; }

// ---------- wings & cloud jet-pack (worn on the back, on top of any costume) ----------
const BACKS = [
  { id: 'wings', name: 'Sparnai', desc: 'Balti plunksnų sparnai. Ore spausk Space vėl ir vėl – skrisi. Laikyk Space – sklandysi.' },
  { id: 'jetpack', name: 'Debesų kuprinė', desc: 'Reaktyvinė kuprinė iš debesų. Laikyk Space – kyli aukštyn, Shift – greičiau.' }
];
function buildBack(id) {
  const g = new THREE.Group(); g.position.set(0, 1.35, -0.2);
  if (id === 'wings') {
    for (const sx of [-1, 1]) {
      const w = new THREE.Group(); w.position.set(sx * 0.12, 0, 0); g.add(w);
      for (let i = 0; i < 5; i++) { const f = S(G.sph, mat(0xffffff, { roughness: 0.6 }), 0.45 - i * 0.05, 0.1, 0.13, sx * (0.35 + i * 0.12), 0.15 - i * 0.12, -0.05 - i * 0.02); f.rotation.z = sx * (0.3 + i * 0.15); w.add(f); }
      g.userData[sx < 0 ? 'wl' : 'wr'] = w;
    }
  } else {
    g.add(S(G.box, mat(0xd8e8ff, { roughness: 0.4 }), 0.42, 0.5, 0.2, 0, 0, -0.05));
    for (const x of [-0.13, 0.13]) { g.add(S(G.cyl, mat(0xbfc8d8, { metalness: 0.6, roughness: 0.3 }), 0.08, 0.45, 0.08, x, -0.05, -0.18)); g.add(S(G.sph, mat(0xffffff, { roughness: 1 }), 0.14, 0.11, 0.14, x, 0.22, -0.18)); }
    const flames = []; for (const x of [-0.13, 0.13]) { const fl = S(G.cone, new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.8 }), 0.09, 0.4, 0.09, x, -0.45, -0.18); fl.rotation.x = Math.PI; g.add(fl); flames.push(fl); }
    g.userData.flames = flames;
  }
  return g;
}
function wearBack(id) {
  const body = player.mesh.userData.parts.body;
  if (body.userData.back) { body.remove(body.userData.back); body.userData.back = null; }
  Q8.back = id; saveQ8();
  if (!id) return;
  const g = buildBack(id); body.add(g); body.userData.back = g; linearize(g);
}
let spaceWas = false, flapT = 0;
function flyUpdate(dt) {   // called every frame while walking on the planet (not in a car)
  const back = Q8.back, g = player.mesh.userData.parts.body.userData.back;
  const sp = !!keys.Space, press = sp && !spaceWas; spaceWas = sp;
  // the jet-pack lifts you straight off the ground while Space is held
  if (back === 'jetpack' && sp && player.grounded) { player.grounded = false; player.vr = Math.max(player.vr, 5); }
  if (!back || player.grounded) { if (g && g.userData.flames) g.userData.flames.forEach(f => f.visible = false); if (g && g.userData.wl) { g.userData.wl.rotation.y = 0; g.userData.wr.rotation.y = 0; } return; }
  const fw = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), sd = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, player.up); _mv.copy(player.fwd).multiplyScalar(fw).addScaledVector(_rt, sd); if (_mv.lengthSq() > 1) _mv.normalize();
  if (back === 'wings' || back === 'dragonwings') {
    if (press) { player.vr = Math.max(player.vr, 0) + 6.5; if (player.vr > 11) player.vr = 11; flapT = 0.35; tone(220, 0.12, { to: 140, type: 'triangle', vol: 0.04 }); noiseHit(0.12, { ft: 'lowpass', f: 600, vol: 0.05 }); }
    if (sp && player.vr < 0) player.vr += GRAV * 0.7 * dt;   // glide
    player.vel.lerp(_mv.multiplyScalar(12), Math.min(1, 3 * dt));
    flapT -= dt; const a = flapT > 0 ? Math.sin(flapT / 0.35 * Math.PI) * 1.2 : (sp ? 0.15 : 0.4);
    if (g) { g.userData.wl.rotation.y = a; g.userData.wr.rotation.y = -a; }
  } else {
    const fast = keys.ShiftLeft || keys.ShiftRight;
    if (sp) { player.vr = Math.min(player.vr + (GRAV + (player.vr < 0 ? 45 : 16)) * dt, fast ? 16 : 11); if (Math.random() < dt * 4) poof(player.pos.clone().addScaledVector(player.up, 0.6), 0xffffff); }
    else if (player.vr < -4) player.vr += GRAV * 0.5 * dt;
    player.vel.lerp(_mv.multiplyScalar(fast ? 26 : 16), Math.min(1, 3 * dt));
    if (g) g.userData.flames.forEach(f => { f.visible = sp; f.scale.y = 0.8 + Math.random() * 0.6; });
    if (sp && Math.random() < dt * 8) noiseHit(0.1, { ft: 'bandpass', f: 1400, vol: 0.03 });
  }
}

// ---------- the cloud kingdom above the city ----------
let cloudKing = null;
function buildCloudKingdom() {
  const d = cityDir(30, -30), up = d.clone(), H = R + 48;
  const g = new THREE.Group(); g.position.copy(d).multiplyScalar(H); orient(g, d, tangentToward(d, UP)); world.add(g);
  const cm = mat(0xffffff, { roughness: 1 }), cm2 = mat(0xeef6ff, { roughness: 1 });
  for (let i = 0; i < 40; i++) { const a = rr(0, 6.3), r = Math.sqrt(rnd()) * 14, s = rr(2.5, 5); g.add(S(G.sph, i % 3 ? cm : cm2, s, s * 0.55, s, Math.cos(a) * r, -s * 0.25, Math.sin(a) * r)); }
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, s = rr(3, 5); g.add(S(G.sph, cm, s, s * 0.6, s, Math.cos(a) * 15, -1.2, Math.sin(a) * 15)); }
  // the castle – big, with three floors (you can walk inside: E at the golden door)
  const wall = mat(0xf4f8ff, { roughness: 0.5 }), roof = mat(0x8fc8ff, { roughness: 0.4 });
  g.add(S(G.box, wall, 16, 14, 11, 0, 7, -6));
  for (let f = 0; f < 3; f++) for (const x of [-5.5, -2.5, 2.5, 5.5]) g.add(S(G.box, mat(0x9fd8ff, { emissive: 0x2a6a9a }), 1.2, 1.6, 0.1, x, 2.4 + f * 4.4, -0.45));
  for (const y2 of [4.6, 9]) g.add(S(G.box, mat(0xdfe8ff), 16.2, 0.25, 0.3, 0, y2, -0.45));
  for (let i = 0; i < 8; i++) g.add(S(G.box, wall, 1.1, 1, 1.1, -7 + i * 2, 14.5, -0.9));
  for (const [x, z] of [[-8, -0.5], [8, -0.5], [-8, -11.5], [8, -11.5]]) { g.add(S(G.cyl, wall, 1.8, 18, 1.8, x, 9, z)); g.add(S(G.cone, roof, 2.3, 4, 2.3, x, 20, z)); g.add(S(G.cyl, mat(0xffd23a, { metalness: 0.6 }), 0.04, 1.6, 0.04, x, 22.6, z)); g.add(S(G.box, mat(0x8fc8ff), 0.8, 0.5, 0.03, x + 0.42, 23, z)); }
  g.add(S(G.box, mat(0xffd23a, { metalness: 0.6 }), 2.4, 3.4, 0.2, 0, 1.7, -0.4));
  g.add(S(G.sph, mat(0x8a6a10, { metalness: 0.6 }), 0.12, 0.12, 0.06, 0.8, 1.6, -0.28));
  g.add(mesh(new THREE.PlaneGeometry(6, 1.1), new THREE.MeshBasicMaterial({ map: labelTex('DEBESŲ PILIS', '#8fc8ff', '#ffffff', 640, 120), side: THREE.DoubleSide }), 0, 13.2, -0.35));
  addBox(g, 8, 5.5, 14, 0, -6);
  // the king lives inside now (3rd floor) – here only the door
  const king = makeCloudKing();
  solids.push({ p: d.clone().multiplyScalar(H - 0.5), up: up.clone(), dir: up.clone(), r: 15, top: H, thin: true });
  cloudKing = { g, d, H, king, kingPos: g.position.clone().add(new V3(0, 0, 1).applyQuaternion(g.quaternion)).addScaledVector(d, 1.5) };
  cloudKing.inspect = addInspect(cloudKing.kingPos, 'Debesų Pilis', '', 4, { verb: 'įeiti į Debesų Pilį', onUse: () => enterCloudCastle() });
  linearize(g);
  animators.push((dt, t) => { king.userData.body.rotation.y = Math.sin(t * 0.6) * 0.4; });
}
function talkCloudKing() {
  if (Q8.stage === 'king' || Q8.stage === 'feathers' || Q8.stage === 'wings' || Q8.stage === 'none') {
    if (Q8.stage === 'none' || Q8.stage === 'feathers' || Q8.stage === 'wings') { startTalk('Debesų Karalius', ['Kaip tu čia patekai be sparnų?! …Na, sveikas. Mano sūnus dingo. Pasikalbėk su Kūrėju.'], '#8fc8ff'); return; }
    startTalk('Debesų Karalius', ['Žaliasis keliautojas – su sparnais! Pagaliau!', 'Mano sūnus, Debesų Princas, žaisdamas nuplaukė per toli… Vėjas jį nunešė iki pat MARSO. Jis sėdi ant mažo debesėlio prie raudonosios planetos ir verkia.',
      'Skrisk aukštyn, vis aukštyn – pro patį dangų. Kai skrisi pakankamai aukštai, pasieksi Marso debesį. Parnešk man sūnų!'], '#8fc8ff', () => {
      Q8.stage = 'prince'; saveQ8(); toast('Skrisk į Marso debesį!', 'Kilk aukštyn, kol aukštis pasieks 90 m virš žemės', '#8fc8ff');
    });
    return;
  }
  if (Q8.stage === 'home') {
    princeFollow(false);
    startTalk('Debesų Karalius', ['SŪNAU! Mano mažasis debesėli! Tu grįžai!', 'Ačiū tau, drąsusis. Imk – tai stebuklingas debesėlis iš mano pilies. Jis niekada neištirpsta.',
      'Nunešk jį į savo pasaulio muziejų – tegul visi mato debesų stebuklą. O muziejus tau atsilygins – štai pamatysi.'], '#8fc8ff', () => {
      Q8.stage = 'cloud'; saveQ8(); attachMiniCloud(true); showPrinceAtCastle();
      toast('Gavai stebuklingą debesėlį!', 'Nunešk jį į muziejų Pradžios Mieste', '#8fc8ff');
    });
    return;
  }
  if (Q8.stage === 'prince') { startTalk('Debesų Karalius', ['Skrisk aukštyn, vis aukštyn! Mano sūnus prie Marso.'], '#8fc8ff'); return; }
  startTalk('Debesų Karalius', ['Mano sūnus vėl namie, o tu – visada laukiamas Debesų Pilyje.'], '#8fc8ff');
}

// ---------- the prince ----------
function makePrince() {
  const g = new THREE.Group(), cm = mat(0xffffff, { roughness: 1 });
  for (const [x, y, z, s] of [[0, 0.6, 0, 0.55], [-0.4, 0.5, 0, 0.4], [0.4, 0.5, 0, 0.4], [0, 0.95, 0, 0.4], [-0.2, 0.85, 0.2, 0.3], [0.2, 0.85, 0.2, 0.3]]) g.add(S(G.sph, cm, s, s * 0.9, s, x, y, z));
  for (const x of [-0.15, 0.15]) { g.add(S(G.sph, bmat(0x2a3a5a), 0.07, 0.09, 0.04, x, 0.75, 0.5)); }
  g.add(S(G.sph, mat(0xffb3c8), 0.08, 0.05, 0.03, -0.3, 0.62, 0.45)); g.add(S(G.sph, mat(0xffb3c8), 0.08, 0.05, 0.03, 0.3, 0.62, 0.45));
  const gold = mat(0xffd23a, { metalness: 0.8, roughness: 0.25 }); g.add(S(G.cyl, gold, 0.2, 0.1, 0.2, 0, 1.33, 0)); for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2; g.add(S(G.cone, gold, 0.05, 0.13, 0.05, Math.cos(a) * 0.17, 1.43, Math.sin(a) * 0.17)); }
  return g;
}
let princeM = null, princeOn = false;
function princeFollow(on) {
  princeOn = on;
  if (on && !princeM) { princeM = makePrince(); world.add(princeM); linearize(princeM); princeM.position.copy(player.pos); }
  if (!on && princeM) { world.remove(princeM); princeM = null; }
}
function updatePrince(dt, t) {
  if (!princeOn || !princeM) return;
  const ent = player.inCar ? ride : player;
  const target = ent.pos.clone().addScaledVector(ent.up, 2.4 + Math.sin(t * 2) * 0.3).addScaledVector(ent.fwd, -1.8);
  princeM.position.lerp(target, Math.min(1, dt * 4)); orient(princeM, ent.up, ent.fwd);
}
let castlePrince = null;
function showPrinceAtCastle() {
  if (castlePrince || !cloudKing || !(Q8.stage === 'cloud' || Q8.stage === 'done')) return;
  castlePrince = makePrince(); castlePrince.position.set(1.6, 0.2, 2.4); cloudKing.g.add(castlePrince); linearize(castlePrince);
  animators.push((dt, t) => { if (castlePrince) castlePrince.position.y = 0.3 + Math.abs(Math.sin(t * 3)) * 0.4; });
}
let heldMiniCloud = null;
function attachMiniCloud(on) {
  const hand = player.mesh.userData.parts.handL;
  if (on && !heldMiniCloud) { const g = new THREE.Group(); for (const [x, y, s] of [[0, 0, 0.22], [-0.15, -0.03, 0.15], [0.15, -0.03, 0.15], [0, 0.1, 0.15]]) g.add(S(G.sph, mat(0xffffff, { emissive: 0xbfe8ff, emissiveIntensity: 0.3, roughness: 1 }), s, s * 0.85, s, x, y, 0)); g.position.set(0, 0, 0.2); hand.add(g); linearize(g); heldMiniCloud = g; }
  if (!on && heldMiniCloud) { hand.remove(heldMiniCloud); heldMiniCloud = null; }
}
function deliverCloud() {
  attachMiniCloud(false); Q8.stage = 'done'; saveQ8(); addMoney(700); refreshMuseumExtras();
  [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.6, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
  poof(museum.g.position.clone().addScaledVector(museum.d, 2), 0xffffff);
  toast('Įsakymas #7 įvykdytas! Apdovanojimas: 700 €', 'Sako, Debesų Pilies 2 aukšte, tualete, kažkas paliko kuprines…', '#ffe98a');
}

// ---------- flying up to Mars ----------
function checkSpaceFlight() {
  if (Q8.stage !== 'prince' || transitioning || player.inCar) return;
  const alt = player.pos.length() - R - groundH(player.up);
  if (alt > 90) enterMarsCloud();
}
const mcScene = new THREE.Scene(); mcScene.background = new THREE.Color(0x1a0a14); mcScene.fog = new THREE.Fog(0x1a0a14, 60, 220);
mcScene.add(new THREE.AmbientLight(0xffe0d0, 0.6)); { const l = new THREE.DirectionalLight(0xffd0b0, 0.9); l.position.set(30, 40, 20); mcScene.add(l); }
const MC = { built: false, boxes: [], x0: -12, x1: 12, z0: -12, z1: 12, H: 30, prince: null };
function buildMarsCloud() {
  if (MC.built) return; MC.built = true;
  const mars = mesh(new THREE.SphereGeometry(80, 48, 32), new THREE.MeshStandardMaterial({ color: 0xc8502a, roughness: 0.95, fog: false }), 0, -110, -40); mcScene.add(mars);
  for (let i = 0; i < 20; i++) { const a = rr(0, 6.3), b = rr(0.2, 1.4); mcScene.add(S(G.sph, new THREE.MeshStandardMaterial({ color: 0x8a3018, roughness: 1, fog: false }), rr(4, 10), 1.5, rr(4, 10), Math.cos(a) * Math.cos(b) * 79, -110 + Math.sin(b) * 79, -40 + Math.sin(a) * Math.cos(b) * 79)); }
  const sv = []; for (let i = 0; i < 700; i++) { const v = randDir().multiplyScalar(rr(200, 300)); sv.push(v.x, Math.abs(v.y) * 0.8 + 20, v.z); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3)); mcScene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, fog: false })));
  const cm = mat(0xffe6f0, { roughness: 1 });
  for (let i = 0; i < 30; i++) { const a = rr(0, 6.3), r = Math.sqrt(rnd()) * 12, s = rr(2, 4); mcScene.add(S(G.sph, cm, s, s * 0.5, s, Math.cos(a) * r, -s * 0.3, Math.sin(a) * r)); }
  MC.prince = makePrince(); MC.prince.position.set(0, 0, -6); MC.prince.scale.setScalar(1.3); mcScene.add(MC.prince);
  const back = new THREE.Group(); back.position.set(9, 0, 0); back.rotation.y = -Math.PI / 2; mcScene.add(back);
  back.add(mesh(new THREE.TorusGeometry(1.6, 0.18, 8, 32), bmat(0xbfe8ff), 0, 1.8, 0));
  back.add(mesh(new THREE.CircleGeometry(1.45, 32), new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.4, side: THREE.DoubleSide }), 0, 1.8, 0));
  back.add(mesh(new THREE.PlaneGeometry(3, 0.55), new THREE.MeshBasicMaterial({ map: labelTex('ŽEMYN – NAMO', '#4a7aaa', '#ffffff', 512, 96), side: THREE.DoubleSide }), 0, 3.9, 0));
  mcScene.environment = scene.environment; linearize(mcScene);
}
function enterMarsCloud() {
  if (transitioning) return; transitioning = true; hideCard(); dropAll();
  [262, 392, 523, 784, 1047].forEach((f, i) => tone(f, 0.4, { type: 'sine', vol: 0.06, when: i * 0.1 }));
  fadeTo(() => {
    transitioning = false; buildMarsCloud(); mode = 'marscloud'; mcScene.add(player.mesh);
    player.pos.set(0, 4, 6); player.up.set(0, 1, 0); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.grounded = false; player.pitch = 0.2;
    camera.position.set(0, 5, 11); camera.up.set(0, 1, 0);
    MC.prince.visible = Q8.stage === 'prince';
    $('bName').textContent = 'Marso debesis'; $('bEn').textContent = 'Prie Raudonosios planetos'; $('bAtm').textContent = 'Tylu. Po kojomis – rožinis debesis, apačioje – Marsas.'; document.documentElement.style.setProperty('--biome', '#ff9e7a');
    toast('Tu nuskridai iki Marso!', MC.prince.visible ? 'Ant debesies kažkas verkia… Debesų Princas!' : 'Rožinis debesis prie Marso', '#ff9e7a');
  });
}
function leaveMarsCloud() {
  if (transitioning) return; transitioning = true; hideCard();
  fadeTo(() => {
    transitioning = false; mode = 'planet'; world.add(player.mesh);
    const d = cloudKing.d.clone(), fwd = tangentToward(d, UP).normalize();
    player.pos.copy(d).multiplyScalar(cloudKing.H + 1).addScaledVector(fwd, 7); player.up.copy(player.pos).normalize(); player.fwd.copy(fwd).negate().projectOnPlane(player.up).normalize(); player.vel.set(0, 0, 0); player.vr = 0; player.grounded = false;
    curBiome = -1; camera.position.copy(player.pos).addScaledVector(player.up, 3).addScaledVector(player.fwd, -6);
    if (princeOn) { if (princeM.parent) princeM.parent.remove(princeM); world.add(princeM); princeM.position.copy(player.pos); toast('Grįžai prie Debesų Pilies', 'Nuvesk princą pas Karalių', '#8fc8ff'); }
  });
}
function marsCloudAction() {
  if (card) { if (!advanceTalk()) hideCard(); return; }
  const pp = player.pos;
  if (Math.hypot(pp.x - 9, pp.z) < 3) { leaveMarsCloud(); return; }
  if (MC.prince.visible && Math.hypot(pp.x - MC.prince.position.x, pp.z - MC.prince.position.z) < 3.5) {
    startTalk('Debesų Princas', ['Buuu… vėjas mane atpūtė iki pat Marso, o aš nemoku skristi atgal…', 'Tave atsiuntė tėtis? Tikrai? Ura! Aš skrisiu paskui tave!'], '#bfe8ff', () => {
      MC.prince.visible = false; Q8.stage = 'home'; saveQ8(); princeFollow(true); princeM.position.copy(MC.prince.position);
      if (princeM.parent !== mcScene) { world.remove(princeM); mcScene.add(princeM); }
      toast('Princas skrenda paskui tave!', 'Įženk į šviečiantį ratą – grįši namo', '#bfe8ff');
    });
  }
}
function updateMarsCloud(dt, t) {
  walkFlat(dt, { boxes: MC.boxes, x0: MC.x0, x1: MC.x1, z0: MC.z0, z1: MC.z1, H: MC.H, camDist: 6 });
  if (MC.prince.visible) { MC.prince.position.y = Math.abs(Math.sin(t * 1.5)) * 0.15; MC.prince.rotation.y = Math.sin(t * 0.7) * 0.5; if ((MC.cryT = (MC.cryT || 0) - dt) < 0) { MC.cryT = 4; bubbleIn(mcScene, MC.prince.position, pick(['Buuu…', 'Tėti?', 'Noriu namo!']), 2.4); } }
  if (princeOn && princeM) princeM.position.lerp(player.pos.clone().add(new V3(0, 2.4 + Math.sin(t * 2) * 0.3, 0)).addScaledVector(player.fwd, -1.6), Math.min(1, dt * 4));
  let txt = '';
  if (!card) { if (Math.hypot(player.pos.x - 9, player.pos.z) < 3) txt = '<kbd>E</kbd> skristi žemyn – namo'; else if (MC.prince.visible && Math.hypot(player.pos.x - MC.prince.position.x, player.pos.z - MC.prince.position.z) < 3.5) txt = '<kbd>E</kbd> kalbėtis su Debesų Princu'; }
  setPrompt(txt);
  updateQuestHud();
}

// ---------- HUD ----------
function updateQ8Hud(el) {
  if (!q8Active()) { el.hidden = true; return; }
  el.hidden = false;
  let step = '', target = null, arrow = '', dist = '';
  if (Q8.stage === 'feathers') { step = `Plunksnos: <b>${Q8.got.length}/${FEATHERS_N}</b> – ieškok prie kelių`; const f = nearestFeather(); target = f && f.pos; }
  else if (Q8.stage === 'wings') { step = 'Nusipirk sparnus kostiumų kioske aikštėje'; const it = inspectables.find(i => i.name === 'Kostiumų kioskas'); target = it && it.pos; }
  else if (Q8.stage === 'king') { step = Q8.back ? 'Skrisk į Debesų Pilį virš miesto (Space ore – mojuoti)' : 'Užsidėk sparnus kostiumų kioske ir skrisk į debesį'; target = cloudKing && cloudKing.kingPos; }
  else if (Q8.stage === 'prince') { const alt = Math.max(0, Math.round(player.pos.length() - R - groundH(player.up))); step = mode === 'marscloud' ? 'Surask Debesų Princą' : `Skrisk aukštyn į Marso debesį · aukštis ${alt}/90 m`; }
  else if (Q8.stage === 'home') { step = mode === 'marscloud' ? 'Įženk į šviečiantį ratą – namo' : 'Nuvesk princą pas Debesų Karalių'; target = cloudKing && cloudKing.kingPos; }
  else if (Q8.stage === 'cloud') { step = 'Nunešk debesėlį į muziejų'; target = museum && museum.g.position; }
  if (target && mode === 'planet') { arrow = arrowTo(target); dist = ` · ${Math.round(target.distanceTo(player.inCar ? ride.pos : player.pos))} m`; if (q2Dot) { q2Dot.visible = true; q2Dot.position.copy(target).normalize().multiplyScalar(R + 7); } }
  el.innerHTML = `${arrow}<div><div class="qt">Įsakymas #7: Debesų Princas</div><div class="qs">${step}${dist}</div></div>`;
}

// ---------- wings / jet-pack cards in the costume kiosk ----------
function backSvg(id) {
  if (id === 'wings') return '<svg viewBox="0 0 100 60" aria-hidden="true"><rect x="0" y="56" width="100" height="4" fill="#d6c6ff"/><path d="M44 30 Q20 8 6 18 Q18 26 12 34 Q26 34 44 38 Z" fill="#fff" stroke="#dde"/><path d="M56 30 Q80 8 94 18 Q82 26 88 34 Q74 34 56 38 Z" fill="#fff" stroke="#dde"/><rect x="44" y="28" width="12" height="20" rx="5" fill="#6ff05a"/><circle cx="50" cy="18" r="10" fill="#6ff05a"/></svg>';
  return '<svg viewBox="0 0 100 60" aria-hidden="true"><rect x="0" y="56" width="100" height="4" fill="#d6c6ff"/><rect x="38" y="24" width="24" height="22" rx="4" fill="#d8e8ff"/><circle cx="42" cy="22" r="6" fill="#fff"/><circle cx="58" cy="22" r="6" fill="#fff"/><path d="M42 46 L38 58 L46 58 Z M58 46 L54 58 L62 58 Z" fill="#bfe8ff"/></svg>';
}
function backCardsHtml() {
  return BACKS.map((b, i) => {
    const own = Q8.owned.includes(b.id), on = Q8.back === b.id;
    const price = on ? 'Nusiimti' : own ? 'Užsidėti' : b.id === 'jetpack' ? 'Debesų Pilyje' : b.id === 'dragonwings' ? 'Paslaptis' : b.id === 'wings' ? `${Math.min(Q8.got.length, FEATHERS_N)}/${FEATHERS_N} plunksnų` : 'Karaliaus dovana';
    const poor = !own && (b.id !== 'wings' || Q8.got.length < FEATHERS_N);
    return `<button class="hcard${on ? ' active' : ''}${poor ? ' locked' : ''}" data-b="${i}"><div class="hpic">${backSvg(b.id)}</div><div class="hname">${b.name}</div><div class="hdesc">${b.desc}</div><div class="hfoot"><span class="hsize">${own ? 'Turi' : 'Ant nugaros'}</span><span class="hprice">${price}</span></div></button>`;
  }).join('');
}
function pickBack(i) {
  const b = BACKS[i]; if (!b) return;
  const own = Q8.owned.includes(b.id);
  if (!own) {
    if (b.id === 'wings' && Q8.got.length >= FEATHERS_N) {
      Q8.owned.push('wings'); saveQ8(); sfx.chime();
      if (Q8.stage === 'wings') { Q8.stage = 'king'; saveQ8(); }
      wearBack('wings'); toast('Gavai sparnus už 50 plunksnų!', 'Space – pašokti, ore spausk Space vėl ir vėl – skrisi. Skrisk į Debesų Pilį virš miesto', '#bfe8ff');
    } else if (b.id === 'wings') { toast('Reikia 50 plunksnų', `Turi ${Q8.got.length}. Jas rasi prie kelių – kai Kūrėjas duos įsakymą`, '#bfe8ff'); tone(220, 0.2, { type: 'square', vol: 0.05, lp: 1200 }); }
    else if (b.id === 'dragonwings') { toast('Šie sparnai – paslaptis', 'Sako, juos gali gauti tik iš labai piktos mamos Marse… jei ją labai dažnai pažadinsi', '#b07aff'); tone(220, 0.2, { type: 'square', vol: 0.05, lp: 1200 }); }
    else { toast('Šios kuprinės nenupirksi', 'Debesų Pilyje, 2 aukšte, tualete – kiekvienas pasidėjo savo kuprinę prie savo tualeto…', '#bfe8ff'); tone(220, 0.2, { type: 'square', vol: 0.05, lp: 1200 }); }
  } else wearBack(Q8.back === b.id ? null : b.id);
  renderSkinShop();
}

// jet-pack also works in the flat worlds (Creator's Hall, candy & rainbow worlds, caves, houses…)
function flatJetpack(dt) {
  if (Q8.back !== 'jetpack') return false;
  const g = player.mesh.userData.parts.body.userData.back, on = !!keys.Space;
  if (g && g.userData.flames) g.userData.flames.forEach(f => { f.visible = on; f.scale.y = 0.8 + Math.random() * 0.6; });
  if (!on) { if (!player.grounded && player.vr < -4) player.vr += GRAV * 0.5 * dt; return false; }
  player.grounded = false; player.vr = Math.min(player.vr + (GRAV + (player.vr < 0 ? 45 : 16)) * dt, (keys.ShiftLeft || keys.ShiftRight) ? 14 : 9);
  if (Math.random() < dt * 8) noiseHit(0.1, { ft: 'bandpass', f: 1400, vol: 0.03 });
  return true;
}

function makeCloudKing() {
  const king = makePerson(); king.scale.setScalar(1.25);
  king.userData.body.children[0].material = mat(0xdde8ff);
  king.userData.body.add(S(G.sph, mat(0xffffff, { roughness: 1 }), 0.32, 0.4, 0.2, 0, 1.55, 0.2));
  { const gold = mat(0xffd23a, { metalness: 0.8, roughness: 0.25 }); king.userData.body.add(S(G.cyl, gold, 0.3, 0.14, 0.3, 0, 2.08, 0)); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; king.userData.body.add(S(G.cone, gold, 0.07, 0.2, 0.07, Math.cos(a) * 0.26, 2.22, Math.sin(a) * 0.26)); } }
  { const cape = S(G.box, mat(0x8fc8ff), 0.75, 1.2, 0.05, 0, 0.9, -0.3); cape.rotation.x = 0.1; king.userData.body.add(cape); }
  return king;
}
// once the prince is home, he and his father also come to live in the Creator's Hall
function addSanctumClouds() {
  if (FR.clouds || !(Q8.stage === 'cloud' || Q8.stage === 'done')) return;
  FR.clouds = true;
  const base = new THREE.Group(); base.position.set(12, 0, -10); sanc.add(base);
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, s = rr(0.9, 1.4); base.add(S(G.sph, mat(0xffffff, { roughness: 1 }), s, s * 0.45, s, Math.cos(a) * 2, 0.1, Math.sin(a) * 2)); }
  linearize(base);
  const king = makeCloudKing(); king.position.set(12, 0, -10); king.rotation.y = -0.8;
  addFriend('Debesų Karalius', king, ['Kūrėjas pakvietė mus pagyventi čia. Debesų pilis – gerai, bet čia mano sūnus turi draugų!', 'Kai mano berniukas pasiklydo, maniau, kad daugiau niekada nebūsiu laimingas. Ačiū tau, žaliasis.'], { r: 3.5 });
  const pr = makePrince(); pr.position.set(14, 1.2, -8.5); pr.scale.setScalar(1.1);
  addFriend('Debesų Princas', pr, ['Žiūrėk, kaip aš moku skraidyti! …Na, tik truputį. Bet į Marsą daugiau nebeskrisiu!', 'Tu mano didvyris! Kai užaugsiu, būsiu toks pat drąsus debesis kaip tu.'], { r: 3.5 });
  sancAnim.push((dt, t) => { pr.position.set(12 + Math.cos(t * 0.8) * 2.4, 1.3 + Math.sin(t * 2.2) * 0.4, -10 + Math.sin(t * 0.8) * 2.4); pr.rotation.y = -t * 0.8; king.userData.body.rotation.y = Math.sin(t * 0.6) * 0.4; });
}
