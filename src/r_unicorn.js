// ================= God's fourth command: "The Rainbow Unicorn Horn" =================
const Q4 = { stage: 'none', met: [], justStarted: false };   // none | ask | go | horn | done ; met = family members already found
try { const s = JSON.parse(localStorage.getItem('modly-quest4') || 'null'); if (s && s.stage) { Q4.stage = s.stage; Q4.met = s.met || []; } } catch (_) { }
function saveQ4() { try { localStorage.setItem('modly-quest4', JSON.stringify({ stage: Q4.stage, met: Q4.met })); } catch (_) { } }
function q4Ready(loud) {
  if (Q4.stage !== 'none' || Q3.stage !== 'done') return;
  Q4.stage = 'ask'; saveQ4();
  if (loud) setTimeout(() => toast('Kūrėjas tavęs laukia', 'Nueik pas jį – jis turi naują įsakymą', '#ffe98a'), 4200);
}
const Q4_ASK = [
  'Tu grįžai. Senasis Voras man papasakojo, kaip padėjai jo dukrai. Tavo širdis gera, mažasis.',
  'Turiu ketvirtąjį įsakymą: SPALVOTAS VIENARAGIO RAGAS. Jis nuves tave toli – net į kitą pasaulį.',
  'Ten bus keista, saldu ir truputį baisu. Ar tu pasiruošęs?'
];
const Q4_YES = [
  'Žinojau, kad taip pasakysi. Klausyk atidžiai.',
  'Pikselių Pasaulyje atsivėrė portalas. Už jo – Saldainių Pasaulis. Ten gyvena vienintelė vienaragių šeima visoje visatoje.',
  'Kai demonas praskrido pro jų pasaulį, Mamos Vienaragės ragas nulūžo. Visa šeima iš baimės išsilakstė į skirtingas puses, o mama be rago labai nusilpo.',
  'Surask juos. Kiekvienas pasakys, kur ieškoti kito. Paskutinis žinos, kur yra ragas.',
  'Spalvotą ragą atnešk į muziejų – ten demonas jo niekada nebepavogs. Eik!'
];
const Q4_NO = ['Nieko tokio. Pasiruošti – irgi drąsa. Kai būsi pasiruošęs, ateik ir pasakyk man.'];
function Q4_LINES() {
  if (Q4.stage === 'ask') return Q4_ASK;
  if (Q4.stage === 'go') return [Q4.met.length ? `Jau suradai ${Q4.met.length} iš 4 vienaragių. Klausyk, ką jie sako – kiekvienas žino, kur kitas.` : 'Portalas laukia Pikselių Pasaulyje. Už jo – Saldainių Pasaulis ir išsigandusi vienaragių šeima.'];
  if (Q4.stage === 'horn') return ['Spalvotas ragas pas tave! Jaučiu jo šviesą net iš čia. Nunešk jį į muziejų Pradžios Mieste.'];
  return Q5_LINES() || ['Vienaragių šeima vėl kartu, o spalvotas ragas saugus muziejuje. Demonas pyksta – vadinasi, mums sekasi.'];
}

// ---------- yes / no ----------
let choiceOpen = false, choiceCb = null;
function askChoice(title, text, color, cb) {
  card = { kind: 'choice' }; showCard(title, text, 'Spausk mygtuką arba klavišą: T – taip, N – ne', color);
  $('cardBtns').hidden = false; choiceOpen = true; choiceCb = cb;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  $('paused').hidden = true;
}
function answerChoice(yes) {
  if (!choiceOpen) return;
  choiceOpen = false; $('cardBtns').hidden = true; hideCard(); sfx.blip();
  const cb = choiceCb; choiceCb = null; if (cb) cb(yes);
  if (!lockFailed) requestLock();
}
document.getElementById('btnYes').addEventListener('click', e => { e.stopPropagation(); answerChoice(true); });
document.getElementById('btnNo').addEventListener('click', e => { e.stopPropagation(); answerChoice(false); });
function askQ4() {
  askChoice('Kūrėjas', 'Ar tu pasiruošęs ketvirtajam įsakymui „Spalvotas vienaragio ragas“?', '#ffe98a', yes => {
    const lines = yes ? Q4_YES : Q4_NO;
    if (yes) { Q4.stage = 'go'; Q4.justStarted = true; saveQ4(); } else Q4.declined = true;
    creatorLines = lines; card = { kind: 'creator', i: 0 }; showCard('Kūrėjas', lines[0], `E – toliau (1 / ${lines.length})`, '#ffe98a');
  });
}
function q4TalkEnd() {
  if (Q4.stage === 'ask') { if (Q4.declined) { Q4.declined = false; return true; } askQ4(); return true; }
  if (Q4.justStarted) {
    Q4.justStarted = false;
    [330, 415, 494, 659, 831].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.07, when: i * 0.13 }));
    toast('Įsakymas #4: Spalvotas vienaragio ragas', 'Surask portalą Pikselių Pasaulyje', '#ff9ee8'); return true;
  }
  return false;
}

// ---------- textures ----------
function stripeTex(cols, n = 8, diag = true) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  for (let i = -n; i < n * 2; i++) { x.fillStyle = cols[((i % cols.length) + cols.length) % cols.length]; x.beginPath(); const w = 128 / n; x.moveTo(i * w, 0); x.lineTo(i * w + w, 0); x.lineTo(i * w + w + (diag ? 128 : 0), 128); x.lineTo(i * w + (diag ? 128 : 0), 128); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const RAINBOW = ['#ff4f6d', '#ff9f1c', '#ffe14d', '#5fe37a', '#3cc6ff', '#7a6bff', '#d46bff'];
function swirlTex(cols) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.fillStyle = cols[0]; x.fillRect(0, 0, 256, 256);
  for (let k = 0; k < cols.length * 2; k++) {
    x.strokeStyle = cols[k % cols.length]; x.lineWidth = 14; x.beginPath();
    for (let a = 0; a < 14; a += 0.05) { const r = a * 9, ang = a + k * Math.PI * 2 / (cols.length * 2); const px = 128 + Math.cos(ang) * r, py = 128 + Math.sin(ang) * r; a ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.stroke();
  }
  return new THREE.CanvasTexture(c);
}
let _rbTex = null; const rainbowTex = () => _rbTex || (_rbTex = stripeTex(RAINBOW, 7));

// ---------- the rainbow horn ----------
function makeUniHorn() {
  const g = new THREE.Group();
  const t = rainbowTex().clone(); t.needsUpdate = true; t.repeat.set(2, 3);
  const h = mesh(new THREE.ConeGeometry(0.16, 1.1, 20, 6), new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.35, roughness: 0.3, metalness: 0.2 }));
  h.position.y = 0.55; g.add(h);
  g.add(S(G.cyl, mat(0xffd23a, { metalness: 0.7, roughness: 0.3 }), 0.17, 0.08, 0.17, 0, 0.02, 0));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffb8f0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.7 }));
  glow.scale.setScalar(1.4); glow.position.y = 0.6; g.add(glow);
  return g;
}
let heldUniHorn = null;
function attachUniHorn(on) {
  const hand = player.mesh.userData.parts.handL;
  if (on && !heldUniHorn) { heldUniHorn = makeUniHorn(); heldUniHorn.scale.setScalar(0.5); heldUniHorn.position.set(0, -0.1, 0.12); hand.add(heldUniHorn); linearize(heldUniHorn); }
  if (!on && heldUniHorn) { hand.remove(heldUniHorn); heldUniHorn = null; }
}
function deliverUniHorn() {
  attachUniHorn(false); Q4.stage = 'done'; saveQ4(); addMoney(400); refreshMuseumExtras();
  [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.6, { type: 'triangle', vol: 0.07, when: i * 0.11 }));
  poof(museum.g.position.clone().addScaledVector(museum.d, 2), 0xff9ee8);
  toast('Įsakymas #4 įvykdytas!', 'Spalvotas vienaragio ragas – muziejuje. Apdovanojimas: 400 €', '#ffe98a');
  startQ5();
}

// ---------- the portal ----------
function makePortal() {
  const g = new THREE.Group(), cols = [0xff4fd8, 0x30c4ff, 0xffe14d, 0x7a5cff, 0x3cf27a, 0xff7a3d];
  for (let k = 0; k < 26; k++) { const a = k / 26 * Math.PI * 2; g.add(S(G.box, mat(cols[k % cols.length], { emissive: cols[k % cols.length], emissiveIntensity: 0.25 }), 0.8, 0.8, 0.8, Math.cos(a) * 3.3, 3.8 + Math.sin(a) * 3.3, 0)); }
  for (const x of [-2.4, -0.8, 0.8, 2.4]) g.add(S(G.box, mat(0x6a5aa0), 1.6, 0.4, 1.8, x, 0.2, 0));
  const disc = mesh(new THREE.CircleGeometry(2.95, 48), new THREE.MeshBasicMaterial({ map: swirlTex(['#ff9ee8', '#ffffff', '#8fd8ff', '#fff38a', '#c9a6ff']), side: THREE.DoubleSide, transparent: true, opacity: 0.92 }));
  disc.position.y = 3.8; g.add(disc);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffa8f0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 }));
  glow.scale.setScalar(11); glow.position.y = 3.8; g.add(glow);
  g.userData = { disc, glow };
  return g;
}
let portalSpot = null, pixelPortal = null;
function reservePortalSpot() {
  let best = null, bs = -1e9;
  for (const path of roadPaths) for (const x of path.s) { if (x.bridge) continue; weights(x.d.x, x.d.y, x.d.z, W); if (W[6] < 0.85) continue; const sc = -Math.abs(x.d.dot(BC[6]) - 0.94); if (sc > bs) { bs = sc; best = x; } }
  if (!best) return;
  let d = moveAlong(best.d, best.side, -(ROAD_HALF + 8)); if (TH(d) < 0.3) d = moveAlong(best.d, best.side, ROAD_HALF + 8);
  portalSpot = { d, face: best.d.clone() };
  reserved.push({ d: d.clone(), r: 6 });
}
function buildPixelPortal() {
  if (!portalSpot) return;
  const { d, face } = portalSpot, fwd = tangentToward(d, face).normalize();
  const g = makePortal(); g.position.copy(d).multiplyScalar(R + TH(d) - 0.1); orient(g, d, fwd); world.add(g);
  g.add(mesh(new THREE.PlaneGeometry(3.4, 0.6), new THREE.MeshBasicMaterial({ map: labelTex('SALDAINIŲ PASAULIS', '#5a3cff', '#fff38a', 640, 112), side: THREE.DoubleSide }), 0, 8.1, 0));
  const posts = [addBox(g, 0.6, 0.6, 7.5, -3.3, 0), addBox(g, 0.6, 0.6, 7.5, 3.3, 0)];
  pixelPortal = { g, d, fwd, front: g.position.clone().addScaledVector(fwd, 2.4).addScaledVector(d, 1) };
  const insp = addInspect(pixelPortal.front, 'Portalas', '', 4.5, { verb: 'įeiti į portalą', onUse: usePixelPortal });
  // the portal only appears once the secret-spider mission is done
  let shown = null;
  const showPortal = () => { const on = Q3.stage === 'done'; if (on === shown) return; shown = on; g.visible = on; insp.r = on ? 4.5 : 0; for (const s of posts) { const i = solids.indexOf(s); if (on && i < 0) solids.push(s); if (!on && i >= 0) solids.splice(i, 1); } if (on && started) setTimeout(() => toast('Pikselių Pasaulyje atsirado portalas!', 'Kažkas spalvoto mirga prie kelio…', '#ff9ee8'), 6000); };
  showPortal(); animators.push(showPortal);
  linearize(g);
  animators.push((dt, t) => { const on = Q4.stage === 'go' || Q4.stage === 'horn' || Q4.stage === 'done'; g.userData.disc.rotation.z -= dt * (on ? 1.6 : 0.3); g.userData.disc.material.opacity = on ? 0.92 : 0.35; g.userData.glow.material.opacity = on ? 0.55 + 0.15 * Math.sin(t * 3) : 0.12; });
}
function usePixelPortal() {
  if (Q4.stage === 'none' || Q4.stage === 'ask') { card = { kind: 'info' }; showCard('Portalas', 'Portalas mirga, bet neatsiveria. Atrodo, jį atidaryti gali tik Kūrėjo įsakymas.'); return; }
  enterCandy();
}

// ================= the Candy World =================
const candyScene = new THREE.Scene(); candyScene.background = new THREE.Color(0xffd9f0); candyScene.fog = new THREE.Fog(0xffd9f0, 65, 180);
candyScene.add(new THREE.AmbientLight(0xffffff, 0.5)); candyScene.add(new THREE.HemisphereLight(0xfff6ff, 0xffa8d0, 0.55));
{ const l = new THREE.DirectionalLight(0xfff3e0, 0.9); l.position.set(30, 60, 25); candyScene.add(l); }
const CW = { built: false, boxes: [], x0: -54, x1: 54, z0: -54, z1: 54, H: 40, fam: [], horn: null, bubble: null, portal: null, river: null };
const CANDY_PORTAL = new V3(0, 0, 50), CAKE = new V3(28, 0, -42), MOM_AT = new V3(-30, 0, -38);
const FAMILY = [
  { id: 'blizgutis', name: 'Blizgutis', at: new V3(8, 0, 36), col: 0xbfe6ff, s: 0.75, cry: true, place: 'prie portalo',
    lines: ['Uiii! Žaliasis žmogeliukas! Tu ne demonas? Tikrai tikrai? Fiuuu…',
      'Aš – Blizgutis, mažiausias šeimoje. Kai demonas praskrido, mamytės ragas – KRAKŠT! – ir nulūžo. Visi išsigandom ir išbėgiojom kas kur.',
      'Mano brolis Cukrinukas visada slepiasi prie LEDŲ KALNO – ten, kairėje, kur didžiuliai ledų kamuoliai su vyšnia viršuje. Surask jį!'],
    again: ['Cukrinukas – prie Ledų Kalno, kairėje. O aš eisiu pas mamą!'], hint: 'Surask Cukrinuką prie Ledų Kalno' },
  { id: 'cukrinukas', name: 'Cukrinukas', at: new V3(-28, 0, 9), col: 0xffd1f0, s: 0.85, place: 'prie Ledų Kalno',
    lines: ['Mmm… ai! Neatimk mano ledų! …A, tu ne ledų vagis. Atsiprašau.',
      'Blizgutis tave atsiuntė? Uf, gerai, kad jis sveikas. Aš iš baimės suvalgiau pusę kalno.',
      'Tėtis nubėgo per ŠOKOLADO UPĘ – per didžiulį sausainių tiltą dešinėje – į GUMINUKŲ LAUKĄ. Jis ieško mamos rago.'],
    again: ['Tėtis – Guminukų Lauke, už Šokolado Upės, dešinėje. Per sausainių tiltą!'], hint: 'Pereik Šokolado Upę ir surask tėtį Guminukų Lauke' },
  { id: 'tetis', name: 'Tėtis Vaivorykštis', at: new V3(37, 0, -24), col: 0xf6f4ff, s: 1.3, place: 'Guminukų Lauke',
    lines: ['Stok! Kas eina? …O, tu ne demonas. Atleisk, mažasis, aš labai sunerimęs.',
      'Mano berniukai sveiki? Ačiū tau, ačiū! Bet mano žmona, Mama Saulutė… be rago ji visai nusilpo.',
      'Ji ilsisi CUKRAUS VATOS PIEVOJE – kairėje, už upės, kur purūs rožiniai ir mėlyni medeliai. Eik pas ją, ji žino daugiau.'],
    again: ['Mama – Cukraus Vatos Pievoje, kairėje. Aš tuoj ten ateisiu.'], hint: 'Surask mamą Cukraus Vatos Pievoje' },
  { id: 'mama', name: 'Mama Saulutė', at: MOM_AT.clone(), col: 0xfff0c8, s: 1.3, noHorn: true, lying: true, place: 'Cukraus Vatos Pievoje',
    lines: ['Ak… sveikas, mažasis… atleisk, kad nesikeliu. Be rago neturiu jėgų.',
      'Tu suradai mano vaikus ir vyrą? Kokia laimė… Jie visi ateis čia, pas mane.',
      'Mano ragas nulūžo, bet jo spalvos neužgeso. Jis nukrito ant DIDŽIOJO TORTO viršaus – ten, kur dega žvakutės. Aplink jį – stebuklingas burbulas, bet dabar jis tave praleis.',
      'Užlipk tortu laiptais ir paimk ragą. Nunešk jį į savo pasaulio muziejų – ten demonas jo niekada neras. O mano naujas ragas ataugs… po truputį.'],
    again: ['Ragas – ant Didžiojo Torto viršaus. Laiptai – iš priekio. Saugok jį, mažasis.'], hint: 'Užlipk ant Didžiojo Torto ir paimk ragą' }
];
function famNext() { for (const f of FAMILY) if (!Q4.met.includes(f.id)) return f; return null; }

// ---------- a funny-looking (but real!) unicorn ----------
function makeUnicorn(o) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); body.scale.setScalar(o.s);
  const coat = mat(o.col, { roughness: 0.55 }), hoof = mat(0xffd23a, { metalness: 0.6, roughness: 0.3 });
  body.add(S(G.sph, coat, 0.55, 0.5, 0.95, 0, 1.25, 0));
  { const n = S(G.cyl, coat, 0.22, 0.9, 0.22, 0, 1.75, 0.68); n.rotation.x = 0.55; body.add(n); }
  const head = new THREE.Group(); head.position.set(0, 2.2, 1.0); body.add(head);
  head.add(S(G.sph, coat, 0.32, 0.33, 0.46, 0, 0, 0.1));
  head.add(S(G.sph, mat(0xffc3d6), 0.24, 0.21, 0.22, 0, -0.1, 0.48));
  for (const x of [-0.08, 0.08]) head.add(S(G.sph, bmat(0x3a1a2a), 0.04, 0.03, 0.02, x, -0.06, 0.69));
  const pupils = [];
  for (const x of [-0.2, 0.2]) {   // big googly eyes
    head.add(S(G.sph, mat(0xffffff, { roughness: 0.2 }), 0.15, o.lying ? 0.08 : 0.16, 0.1, x, 0.12, 0.33));
    const p = S(G.sph, bmat(0x111111), 0.07, o.lying ? 0.04 : 0.07, 0.05, x, 0.1, 0.42); head.add(p); pupils.push(p);
  }
  for (const x of [-0.24, 0.24]) head.add(S(G.sph, mat(0xff8fb8), 0.08, 0.05, 0.03, x, -0.06, 0.3));
  for (const x of [-0.16, 0.16]) { const e = S(G.cone, coat, 0.07, 0.24, 0.05, x, 0.33, -0.05); e.rotation.z = -x * 2; head.add(e); }
  let hornM = null;
  if (!o.noHorn) { const h = makeUniHorn(); h.scale.setScalar(0.55); h.position.set(0, 0.28, 0.16); h.rotation.x = 0.35; head.add(h); hornM = h; }
  else { head.add(S(G.cyl, mat(0xffe9c8), 0.09, 0.12, 0.09, 0, 0.33, 0.12)); head.add(S(G.cone, mat(0xffe9c8), 0.05, 0.08, 0.05, 0.03, 0.42, 0.12)); }
  RAINBOW.forEach((c, i) => {
    const m = mat(new THREE.Color(c).getHex(), { roughness: 0.6 });
    body.add(S(G.sph, m, 0.15, 0.15, 0.15, 0, 2.55 - i * 0.15, 0.82 - i * 0.14));
    body.add(S(G.sph, m, 0.15 - i * 0.012, 0.15 - i * 0.012, 0.15 - i * 0.012, 0, 1.4 - i * 0.12, -0.95 - i * 0.1));
  });
  const legs = [];
  for (const [x, z] of [[-0.3, 0.55], [0.3, 0.55], [-0.3, -0.55], [0.3, -0.55]]) {
    const hip = new THREE.Group(); hip.position.set(x, 1.0, z); body.add(hip);
    hip.add(S(G.cyl, coat, 0.1, 0.95, 0.1, 0, -0.47, 0)); hip.add(S(G.cyl, hoof, 0.12, 0.12, 0.12, 0, -0.96, 0));
    legs.push(hip);
  }
  if (o.lying) { legs.forEach((l, i) => { l.rotation.x = i < 2 ? -1.45 : 1.45; }); body.position.y = -0.82 * o.s; head.rotation.x = 0.5; }
  g.userData = { body, legs, head, pupils, lying: !!o.lying, s: o.s, horn: hornM };
  return g;
}
function animUnicorn(u, t, moving) {
  const d = u.userData;
  if (!d.lying) d.legs.forEach((l, i) => { l.rotation.x = moving ? Math.sin(t * 11 + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.55 : 0; });
  if (!d.lying) d.body.position.y = moving ? Math.abs(Math.sin(t * 11)) * 0.08 : Math.sin(t * 2) * 0.02;
  d.head.rotation.x = (d.lying ? 0.5 : 0) + Math.sin(t * (d.lying ? 0.8 : 1.6)) * 0.06;
  d.pupils.forEach((p, i) => { p.position.x = (i ? 0.2 : -0.2) + Math.sin(t * 7 + i * 2) * 0.035; p.position.y = 0.1 + Math.cos(t * 5 + i) * 0.03; });
}

// ---------- building the candy world ----------
function buildCandy() {
  if (CW.built) return; CW.built = true;
  const sc = candyScene, zones = [];
  const zone = (x, z, r) => zones.push({ x, z, r });
  const free = (x, z, r = 0) => zones.every(q => Math.hypot(x - q.x, z - q.z) > q.r + r) && Math.abs(z + 10) > 6 + r;
  const box = (x, z, hx, hz, h) => CW.boxes.push(h ? { x, z, hx, hz, h } : { x, z, hx, hz });
  const sign = (x, z, text, ry = 0) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; sc.add(g);
    g.add(S(G.cyl, mat(0xffffff), 0.08, 2.4, 0.08, 0, 1.2, 0));
    g.add(mesh(new THREE.PlaneGeometry(2.8, 0.55), new THREE.MeshBasicMaterial({ map: labelTex(text, '#ff5fae', '#fff7d6', 512, 100), side: THREE.DoubleSide }), 0, 2.4, 0.05));
  };
  // ground: pastel candy swirl
  const geo = new THREE.PlaneGeometry(130, 130, 80, 80); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, col = [];
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), n = noise(x * 0.06, 0, z * 0.06); const c = new THREE.Color().setHSL(n > 0.15 ? 0.45 : 0.93, 0.75, 0.74 + 0.05 * Math.sin(x * 0.4 + z * 0.3)); col.push(c.r, c.g, c.b); }
  srgbArrayToLinear(col); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  sc.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 })));
  // sprinkles
  { const n = 700, im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.05, 0.3), new THREE.MeshStandardMaterial({ roughness: 0.5 }), n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), cc = new THREE.Color();
    for (let i = 0; i < n; i++) { e.set(0, rr(0, 6.3), 0); q.setFromEuler(e); m4.compose(new V3(rr(-54, 54), 0.03, rr(-54, 54)), q, new V3(1, 1, 1)); im.setMatrixAt(i, m4); cc.set(pick(RAINBOW)).convertSRGBToLinear(); im.setColorAt(i, cc); }
    sc.add(im); }
  // rainbow in the sky + fluffy clouds round the edge
  RAINBOW.forEach((c, i) => { const t = mesh(new THREE.TorusGeometry(95 - i * 3, 1.5, 6, 64, Math.PI), new THREE.MeshBasicMaterial({ color: c, fog: false, transparent: true, opacity: 0.55 })); t.position.set(0, -5, -125); sc.add(t); });
  for (let k = 0; k < 34; k++) {
    const a = k / 34 * Math.PI * 2, r = rr(80, 100), g = new THREE.Group(); g.position.set(Math.cos(a) * r, rr(2, 22), Math.sin(a) * r); sc.add(g);
    const m = mat(pick([0xffffff, 0xffe0f4, 0xe0f0ff]), { roughness: 1 });
    for (let i = 0; i < 6; i++) { const s = rr(4, 9); g.add(S(G.sph, m, s, s * 0.7, s, rr(-8, 8), rr(-2, 3), rr(-4, 4))); }
  }
  // candy-cane fence all round
  const caneT = stripeTex(['#ff3355', '#ffffff'], 6); caneT.repeat.set(1, 2);
  const caneM = new THREE.MeshStandardMaterial({ map: caneT, roughness: 0.35 });
  for (let i = -54; i <= 54; i += 3) for (const [x, z] of [[i, -54.5], [i, 54.5], [-54.5, i], [54.5, i]]) sc.add(S(G.cyl, caneM, 0.18, 1.6, 0.18, x, 0.8, z));
  // ---- the portal home ----
  const pg = makePortal(); pg.position.copy(CANDY_PORTAL); pg.rotation.y = Math.PI; pg.userData.glow.scale.setScalar(5); sc.add(pg); CW.portal = pg; zone(0, 50, 6);
  box(-3.3, 50, 0.6, 0.6); box(3.3, 50, 0.6, 0.6);
  sign(5, 44, 'PORTALAS NAMO', 0);
  // ---- Ice Cream Mountain ----
  const IC = new V3(-40, 0, 5); zone(IC.x, IC.z, 13);
  sc.add(S(G.sph, mat(0xff9ec7, { roughness: 0.5 }), 9, 7, 9, IC.x, 2, IC.z));
  sc.add(S(G.sph, mat(0xa8f0d0, { roughness: 0.5 }), 6.6, 5.4, 6.6, IC.x - 1, 8.5, IC.z + 0.5));
  sc.add(S(G.sph, mat(0xfff2c8, { roughness: 0.5 }), 4.6, 4, 4.6, IC.x, 13.5, IC.z));
  sc.add(S(G.sph, mat(0xd81e3c, { roughness: 0.25, metalness: 0.1 }), 1.3, 1.3, 1.3, IC.x, 18, IC.z)); { const st = S(G.cyl, mat(0x3a8a2a), 0.06, 1.4, 0.06, IC.x + 0.3, 19.5, IC.z); st.rotation.z = -0.4; sc.add(st); }
  for (let i = 0; i < 9; i++) { const a = i * 0.7; sc.add(S(G.sph, mat(0xff9ec7, { roughness: 0.5 }), 0.8, rr(1.5, 3), 0.8, IC.x + Math.cos(a) * 8.4, 2.2, IC.z + Math.sin(a) * 8.4)); }
  box(IC.x, IC.z, 8, 8);
  sign(-27, 15, 'LEDŲ KALNAS', 0.6);
  // ---- Chocolate River (z ≈ -10) with two cookie bridges ----
  const riverT = swirlTex(['#5a2e14', '#6e3a1a', '#4a240e', '#7a4420']); riverT.wrapS = riverT.wrapT = THREE.RepeatWrapping; riverT.repeat.set(10, 1);
  const river = mesh(new THREE.PlaneGeometry(110, 7), new THREE.MeshStandardMaterial({ map: riverT, roughness: 0.2, metalness: 0.15 })); river.rotation.x = -Math.PI / 2; river.position.set(0, 0.04, -10); sc.add(river); CW.river = riverT;
  for (const z of [-13.7, -6.3]) sc.add(S(G.box, mat(0x3a1c0a, { roughness: 0.6 }), 110, 0.16, 0.5, 0, 0.08, z));
  for (const [x0, x1] of [[-55, -24.6], [-19.4, 21.4], [26.6, 55]]) box((x0 + x1) / 2, -10, (x1 - x0) / 2, 3.6);
  for (const bx of [-22, 24]) {
    sc.add(S(G.cyl, mat(0xd99a55, { roughness: 0.8 }), 2.6, 0.45, 5.2, bx, 0.2, -10));
    for (let i = 0; i < 9; i++) sc.add(S(G.sph, mat(0x4a240e), 0.22, 0.12, 0.22, bx + rr(-1.8, 1.8), 0.45, -10 + rr(-4, 4)));
    box(bx, -10, 2.4, 4.8, 0.4);
  }
  sign(-17, -4, 'ŠOKOLADO UPĖ', 0); sign(20, -4, 'SAUSAINIŲ TILTAS ↓', 0);
  // ---- Gumdrop Field ----
  zone(37, -24, 3);
  for (let i = 0; i < 26; i++) { const a = rr(0, 6.3), r = rr(4, 12), x = 37 + Math.cos(a) * r, z = -24 + Math.sin(a) * r; if (Math.hypot(x - CAKE.x, z - CAKE.z) < 10 || Math.abs(z + 10) < 5) continue; const s = rr(0.8, 1.8), c = pick([0xff4f6d, 0xffe14d, 0x5fe37a, 0x3cc6ff, 0xd46bff, 0xff9f1c]); sc.add(S(G.dome, mat(c, { roughness: 0.15, transparent: true, opacity: 0.92 }), s, s * 1.2, s, x, 0, z)); box(x, z, s * 0.7, s * 0.7, s > 1.3 ? 0 : s * 1.1); }
  zone(37, -24, 12); sign(30, -16, 'GUMINUKŲ LAUKAS', 0.3);
  // ---- Cotton Candy Meadow ----
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2 + rr(-0.2, 0.2), r = rr(6, 13), x = MOM_AT.x + Math.cos(a) * r, z = MOM_AT.z + Math.sin(a) * r * 0.8;
    if (Math.abs(z + 10) < 6) continue;
    const g = new THREE.Group(); g.position.set(x, 0, z); sc.add(g); const h = rr(2.5, 4.5), m = mat(pick([0xffb3dd, 0xb8dcff, 0xe2c8ff]), { roughness: 1 });
    g.add(S(G.cyl, mat(0xffffff), 0.1, h, 0.1, 0, h / 2, 0));
    for (let k = 0; k < 6; k++) { const s = rr(0.9, 1.5); g.add(S(G.sph, m, s, s * 0.85, s, rr(-0.8, 0.8), h + rr(-0.3, 0.8), rr(-0.8, 0.8))); }
    box(x, z, 0.3, 0.3);
  }
  for (let i = 0; i < 18; i++) { const x = MOM_AT.x + rr(-14, 14), z = MOM_AT.z + rr(-12, 12); if (Math.hypot(x - MOM_AT.x, z - MOM_AT.z) < 4 || Math.abs(z + 10) < 6) continue; sc.add(S(G.sph, mat(pick([0xffd0ec, 0xd8ecff]), { roughness: 1 }), rr(0.6, 1.2), 0.45, rr(0.6, 1.2), x, 0.2, z)); }
  zone(MOM_AT.x, MOM_AT.z, 15); sign(-20, -24, 'CUKRAUS VATOS PIEVA', -0.4);
  // ---- The Giant Cake, with stairs at the front ----
  const tiers = [[6, 0xff9ec7], [4.3, 0xfff4e6], [2.6, 0xb8f5d8]];
  tiers.forEach(([hs, c], i) => {
    const y0 = i * 1.2;
    sc.add(S(G.box, mat(c, { roughness: 0.6 }), hs * 2, 1.2, hs * 2, CAKE.x, y0 + 0.6, CAKE.z));
    sc.add(S(G.box, mat(0xffffff, { roughness: 0.4 }), hs * 2 + 0.12, 0.16, hs * 2 + 0.12, CAKE.x, y0 + 1.15, CAKE.z));
    for (let k = 0; k < 10; k++) { const side = k % 4, t2 = rr(-hs, hs); const px = side < 2 ? CAKE.x + t2 : CAKE.x + (side === 2 ? hs : -hs), pz = side < 2 ? CAKE.z + (side ? hs : -hs) : CAKE.z + t2; sc.add(S(G.sph, mat(0xffffff, { roughness: 0.4 }), 0.18, rr(0.25, 0.45), 0.18, px, y0 + 0.95, pz)); }
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; if (i < 2 && Math.abs(Math.sin(a)) > 0.9 && Math.cos(a) > -2) continue; sc.add(S(G.sph, mat(0xe8203c, { roughness: 0.3 }), 0.28, 0.32, 0.28, CAKE.x + Math.cos(a) * (hs - 0.5), y0 + 1.42, CAKE.z + Math.sin(a) * (hs - 0.5))); }
    box(CAKE.x, CAKE.z, hs, hs, y0 + 1.2);
  });
  const steps = [[0.4, -35.0], [0.8, -35.6], [1.6, -36.6], [2.0, -37.2], [2.8, -38.3], [3.2, -38.9]];
  const stepCols = [0xff9ec7, 0xb8dcff, 0xfff38a, 0xc9a6ff, 0xa8f0d0, 0xffc39a];
  steps.forEach(([h, z], i) => { sc.add(S(G.box, mat(stepCols[i], { roughness: 0.5 }), 2.4, h, 0.62, CAKE.x, h / 2, z)); box(CAKE.x, z, 1.2, 0.33, h); });
  const candles = [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]], flames = [];
  const candleT = stripeTex(['#ffffff', '#ff5fae'], 4); candleT.repeat.set(1, 1);
  for (const [dx, dz] of candles) {
    sc.add(S(G.cyl, new THREE.MeshStandardMaterial({ map: candleT, roughness: 0.4 }), 0.14, 1.1, 0.14, CAKE.x + dx, 3.6 + 0.55, CAKE.z + dz));
    const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffc040, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); f.scale.setScalar(0.7); f.position.set(CAKE.x + dx, 4.85, CAKE.z + dz); sc.add(f); flames.push(f);
    box(CAKE.x + dx, CAKE.z + dz, 0.2, 0.2);
  }
  { const l = new THREE.PointLight(0xffc860, 1.0, 18); l.position.set(CAKE.x, 6, CAKE.z); sc.add(l); }
  CW.flames = flames; zone(CAKE.x, CAKE.z, 10);
  sign(CAKE.x + 3.5, -32, 'DIDYSIS TORTAS', 0);
  // the horn, inside its magic bubble
  const horn = makeUniHorn(); horn.scale.setScalar(1.3); horn.position.set(CAKE.x, 3.75, CAKE.z); sc.add(horn); CW.horn = horn;
  const bub = mesh(new THREE.SphereGeometry(1.4, 24, 16), new THREE.MeshStandardMaterial({ color: 0xffd0ff, transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0.3, emissive: 0x6a2a8a, emissiveIntensity: 0.3, depthWrite: false })); bub.position.set(CAKE.x, 4.5, CAKE.z); sc.add(bub); CW.bubble = bub;
  if (Q4.stage === 'horn' || Q4.stage === 'done') horn.visible = false;
  if (Q4.met.includes('mama') || Q4.stage === 'horn' || Q4.stage === 'done') bub.visible = false;
  // ---- lollipops & giant candy canes everywhere else ----
  zone(8, 36, 3); zone(-28, 9, 3);
  const lolCols = [['#ff4f9a', '#ffffff'], ['#3cc6ff', '#fff38a'], ['#7a6bff', '#ffd1f0'], ['#5fe37a', '#ffffff'], ['#ff9f1c', '#fff2c8']];
  const lolMats = lolCols.map(c => new THREE.MeshStandardMaterial({ map: swirlTex(c), roughness: 0.25 }));
  let placed = 0;
  for (let tries = 0; tries < 400 && placed < 46; tries++) {
    const x = rr(-50, 50), z = rr(-50, 50); if (!free(x, z, 2)) continue; zone(x, z, 2.2); placed++;
    const h = rr(2.4, 5.5), r = rr(0.9, 1.7), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rr(0, 6.3); sc.add(g);
    g.add(S(G.cyl, mat(0xffffff, { roughness: 0.6 }), 0.09, h, 0.09, 0, h / 2, 0));
    const disc = S(G.cyl, pick(lolMats), r, 0.3, r, 0, h + r * 0.8, 0); disc.rotation.x = Math.PI / 2; g.add(disc);
    box(x, z, 0.3, 0.3);
  }
  for (let k = 0, tries = 0; k < 14 && tries < 200; tries++) {
    const x = rr(-50, 50), z = rr(-50, 50); if (!free(x, z, 3)) continue; zone(x, z, 3); k++;
    const g = new THREE.Group(), h = rr(4, 7); g.position.set(x, 0, z); g.rotation.y = rr(0, 6.3); sc.add(g);
    g.add(S(G.cyl, caneM, 0.28, h, 0.28, 0, h / 2, 0));
    const hook = mesh(new THREE.TorusGeometry(0.8, 0.28, 10, 18, Math.PI), caneM); hook.position.set(0.8, h, 0); g.add(hook);
    box(x, z, 0.4, 0.4);
  }
  // ---- the unicorn family ----
  CW.fam = FAMILY.map(f => {
    const u = makeUnicorn(f); const met = Q4.met.includes(f.id);
    u.position.copy(met && f.id !== 'mama' ? gatherSpot(f) : f.at); u.rotation.y = f.id === 'mama' ? 0.6 : rr(0, 6.3); sc.add(u);
    return { f, u, state: met && f.id !== 'mama' ? 'home' : 'wait', cryT: rr(0, 3) };
  });
  candyScene.environment = scene.environment; linearize(candyScene);
}
function gatherSpot(f) { const i = ['blizgutis', 'cukrinukas', 'tetis'].indexOf(f.id); const a = 1.2 + i * 1.3; return MOM_AT.clone().add(new V3(Math.cos(a) * 4.2, 0, Math.sin(a) * 4.2)); }

function enterCandy() {
  if (transitioning || cinema) return;
  if (player.inCar) onCar();
  transitioning = true; cancelPlace(true); stopClimb(); dropAll(); hideCard();
  [262, 330, 392, 523, 659, 784].forEach((f, i) => tone(f, 0.3, { type: 'sine', vol: 0.06, when: i * 0.07 }));
  fadeTo(() => {
    transitioning = false; buildCandy(); mode = 'candy'; candyScene.add(player.mesh);
    player.pos.set(0, 0, 43); player.up.set(0, 1, 0); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.grounded = true; player.pitch = 0.15;
    camera.position.set(0, 3, 47.5); camera.up.set(0, 1, 0);
    musicSet(5);
    $('bName').textContent = 'Saldainių Pasaulis'; $('bEn').textContent = 'The Candy World'; $('bAtm').textContent = 'Viskas saldu: ledinukai, guminukai, šokolado upė. Čia gyvena vienaragiai.'; document.documentElement.style.setProperty('--biome', '#ff7ac8');
    toast('Saldainių Pasaulis', Q4.stage === 'go' && !Q4.met.length ? 'Kažkas netoliese verkia… Gal mažas vienaragis?' : 'Kvepia cukraus vata', '#ff7ac8');
  });
}
function leaveCandy() {
  if (transitioning) return; transitioning = true; hideCard();
  [784, 659, 523, 392].forEach((f, i) => tone(f, 0.3, { type: 'sine', vol: 0.06, when: i * 0.07 }));
  fadeTo(() => {
    transitioning = false; mode = 'planet'; world.add(player.mesh);
    const P = pixelPortal, dd = P.g.position.clone().addScaledVector(P.fwd, 4.5).normalize();
    player.pos.copy(dd).multiplyScalar(R + groundH(dd) + 0.3); player.up.copy(dd); player.fwd.copy(P.fwd).projectOnPlane(dd).normalize(); player.vel.set(0, 0, 0); player.vr = 0; player.grounded = true;
    curBiome = -1; camera.position.copy(player.pos).addScaledVector(dd, 3).addScaledVector(player.fwd, -6);
    if (Q4.stage === 'horn') setTimeout(() => toast('Spalvotas ragas pas tave!', 'Nunešk jį į muziejų Pradžios Mieste', '#ff9ee8'), 800);
  });
}
function candyNear() {
  const pp = player.pos;
  if (Math.hypot(pp.x - CANDY_PORTAL.x, pp.z - CANDY_PORTAL.z) < 4) return { kind: 'portal' };
  if (CW.horn && CW.horn.visible && pp.y > 3 && Math.hypot(pp.x - CAKE.x, pp.z - CAKE.z) < 2.6) return { kind: 'horn' };
  let best = null, bd = 1e9;
  for (const m of CW.fam) { const r = 2.4 + m.f.s * 1.6, d = Math.hypot(pp.x - m.u.position.x, pp.z - m.u.position.z); if (d < r && d < bd && pp.y < 1.5) { bd = d; best = m; } }
  return best ? { kind: 'uni', m: best } : null;
}
function candyAction() {
  if (card) { if (!advanceTalk()) hideCard(); return; }
  const n = candyNear(); if (!n) return;
  if (n.kind === 'portal') { leaveCandy(); return; }
  if (n.kind === 'horn') { takeUniHorn(); return; }
  const m = n.m, f = m.f;
  if (Q4.stage !== 'go' && Q4.stage !== 'horn') { startTalk(f.name, Q4.stage === 'done' ? ['Ačiū tau, mažasis žaliasi! Mūsų šeima vėl kartu.'] : ['Ihaha! Labas! …Kas tu?'], '#ff7ac8'); return; }
  if (Q4.met.includes(f.id)) { startTalk(f.name, Q4.stage === 'horn' ? ['Tu radai mamos ragą! Ihahaha! Nunešk jį į savo muziejų!'] : f.again, '#ff7ac8'); return; }
  bubbleIn(candyScene, m.u.position, 'Ihaha!', 2.4 * f.s + 0.8);
  startTalk(f.name, f.lines, '#ff7ac8', () => {
    Q4.met.push(f.id); saveQ4();
    [523, 659, 784].forEach((fr, i) => tone(fr, 0.25, { type: 'triangle', vol: 0.06, when: i * 0.09 }));
    if (f.id === 'mama') {
      if (CW.bubble && CW.bubble.visible) { CW.bubble.visible = false; noiseHit(0.3, { f: 2000, vol: 0.08 }); }
      toast('Stebuklingas burbulas aplink ragą sprogo!', 'Užlipk ant Didžiojo Torto ir paimk spalvotą ragą', '#ff9ee8');
    } else {
      m.state = 'walk';
      const nx = famNext(); if (nx) toast(`Suradai: ${f.name} (${Q4.met.length} / 4)`, nx === FAMILY[3] ? 'Dabar surask mamą Cukraus Vatos Pievoje' : f.hint, '#ff7ac8');
    }
  });
}
function takeUniHorn() {
  if (!Q4.met.includes('mama')) { card = { kind: 'info' }; showCard('Spalvotas ragas', 'Ragą saugo stebuklingas burbulas. Gal vienaragių šeima žino, kaip prie jo prieiti? Pirmiausia surask juos visus.'); return; }
  CW.horn.visible = false; Q4.stage = 'horn'; saveQ4(); attachUniHorn(true);
  [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
  for (const m of CW.fam) bubbleIn(candyScene, m.u.position, 'Ihaha!', 2.4 * m.f.s + 0.8);
  toast('Gavai spalvotą vienaragio ragą!', 'Grįžk per portalą ir nunešk jį į muziejų Pradžios Mieste', '#ffe98a');
}
function updateCandy(dt, t) {
  walkFlat(dt, { boxes: CW.boxes, x0: CW.x0, x1: CW.x1, z0: CW.z0, z1: CW.z1, H: CW.H, camDist: 5.2 });
  CW.portal.userData.disc.rotation.z -= dt * 1.6;
  if (CW.river) CW.river.offset.x -= dt * 0.04;
  if (CW.horn && CW.horn.visible) { CW.horn.rotation.y += dt * 1.2; CW.horn.position.y = 3.75 + Math.sin(t * 2) * 0.15; }
  if (CW.bubble && CW.bubble.visible) { CW.bubble.rotation.y += dt * 0.5; CW.bubble.scale.setScalar(1 + Math.sin(t * 3) * 0.04); }
  if (CW.flames) CW.flames.forEach((f, i) => f.scale.setScalar(0.6 + Math.sin(t * 13 + i) * 0.1));
  for (const m of CW.fam) {
    const u = m.u; let moving = false;
    if (m.state === 'walk') {
      const tgt = gatherSpot(m.f), to = tgt.clone().sub(u.position); to.y = 0; const d = to.length();
      if (d < 0.3) { m.state = 'home'; u.rotation.y = Math.atan2(MOM_AT.x - u.position.x, MOM_AT.z - u.position.z); }
      else {
        // walk round the river through the nearest cookie bridge
        let way = tgt;
        if ((u.position.z > -6) !== (tgt.z > -6)) { const bx = Math.abs(u.position.x + 22) < Math.abs(u.position.x - 24) ? -22 : 24; way = Math.abs(u.position.x - bx) > 1.2 ? new V3(bx, 0, u.position.z > -6 ? -3 : -17) : new V3(bx, 0, u.position.z > -6 ? -17 : -3); }
        const w = way.clone().sub(u.position); w.y = 0; const wl = w.length();
        u.position.addScaledVector(w.normalize(), Math.min(wl, 6 * dt)); u.rotation.y = Math.atan2(w.x, w.z); moving = true;
      }
    } else if (m.state === 'wait' && m.f.id !== 'mama') {
      u.rotation.y += Math.sin(t * 0.4 + m.f.s) * dt * 0.3;
      if (m.f.cry && Q4.stage === 'go') { m.cryT -= dt; if (m.cryT < 0) { m.cryT = 4.5; const d = player.pos.distanceTo(u.position); if (d < 35) { tone(880, 0.4, { to: 600, type: 'sine', vol: 0.04 * (1 - d / 35), vib: 7 }); if (d < 25) bubbleIn(candyScene, u.position, pick(['Buhū…', 'Mamyte?', 'Ihi-hi…']), 2.4); } } }
    } else if (m.state === 'home' && m.f.id !== 'mama') { u.rotation.y = lerp(u.rotation.y, Math.atan2(MOM_AT.x - u.position.x, MOM_AT.z - u.position.z), Math.min(1, dt * 2)); }
    animUnicorn(u, t + m.f.s * 3, moving);
  }
  let txt = '';
  const n = card ? null : candyNear();
  if (n && n.kind === 'portal') txt = '<kbd>E</kbd> grįžti per portalą';
  else if (n && n.kind === 'horn') txt = '<kbd>E</kbd> paimti spalvotą ragą';
  else if (n) txt = `<kbd>E</kbd> kalbėtis: ${n.m.f.name}`;
  setPrompt(txt);
  updateQuestHud();
}

// ---------- HUD ----------
function updateQ4Hud(el) {
  if (Q4.stage === 'done') { if (q6Active() && !(mode === 'rainbow' && false)) updateQ6Hud(el); else updateQ5Hud(el); return; }
  if (Q4.stage === 'none') { el.hidden = true; return; }
  el.hidden = false;
  let step = '', arrow = '', dist = '';
  if (Q4.stage === 'ask') step = 'Nueik pas Kūrėją – jis turi naują įsakymą';
  else if (mode === 'candy') {
    let target = null;
    if (Q4.stage === 'horn') { step = 'Grįžk per portalą'; target = CANDY_PORTAL; }
    else if (Q4.met.includes('mama')) { step = 'Užlipk ant Didžiojo Torto ir paimk ragą'; target = CAKE; }
    else { const nx = famNext(), prev = FAMILY[FAMILY.indexOf(nx) - 1]; step = prev ? prev.hint : 'Kažkas verkia netoli portalo…'; if (prev) target = nx.at; }
    if (target) { arrow = arrowTo(target); dist = ` · ${Math.round(Math.hypot(target.x - player.pos.x, target.z - player.pos.z))} m`; }
  } else if (mode === 'planet') {
    const target = Q4.stage === 'horn' ? (museum && museum.g.position) : (pixelPortal && pixelPortal.g.position);
    step = Q4.stage === 'horn' ? 'Nunešk spalvotą ragą į muziejų Pradžios Mieste' : 'Surask portalą Pikselių Pasaulyje';
    if (target) { arrow = arrowTo(target); dist = ` · ${Math.round(target.distanceTo(player.pos))} m`; if (q2Dot) { q2Dot.visible = true; q2Dot.position.copy(target).normalize().multiplyScalar(R + 7); } }
  } else step = Q4.stage === 'horn' ? 'Nunešk spalvotą ragą į muziejų' : 'Surask portalą Pikselių Pasaulyje';
  el.innerHTML = `${arrow}<div><div class="qt">Įsakymas #4: Spalvotas vienaragio ragas</div><div class="qs">${step}${dist}</div></div>`;
}
