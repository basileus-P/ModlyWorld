// ================= job: cook at "Skanus maistas" =================
let money = 0, served = 0;
try { money = +localStorage.getItem('modly-money') || 0; served = +localStorage.getItem('modly-served') || 0; } catch (_) { }
const fmtMoney = v => Math.round(v).toLocaleString('lt-LT') + ' €';
function addMoney(v) { money += v; try { localStorage.setItem('modly-money', String(money)); } catch (_) { } const el = $('money'); if (el) { el.textContent = fmtMoney(money); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } }

const INGR = {
  miltai: { name: 'Miltai', col: 0xf4efe4, make() { const g = new THREE.Group(); g.add(S(G.sph, mat(0xf4efe4), 0.22, 0.26, 0.18, 0, 0.24, 0)); g.add(S(G.cyl, mat(0xc9a36a), 0.08, 0.06, 0.08, 0, 0.5, 0)); return g; } },
  kiausiniai: { name: 'Kiaušiniai', col: 0xfff4e0, make() { const g = new THREE.Group(); for (const x of [-0.1, 0.1]) g.add(S(G.sph, mat(0xfff4e0), 0.09, 0.12, 0.09, x, 0.12, 0)); return g; } },
  pienas: { name: 'Pienas', col: 0xffffff, make() { const g = new THREE.Group(); g.add(S(G.box, mat(0xffffff), 0.18, 0.34, 0.18, 0, 0.17, 0)); g.add(S(G.box, mat(0x3a7bff), 0.19, 0.08, 0.19, 0, 0.2, 0)); return g; } },
  bulves: { name: 'Bulvės', col: 0xb88a4e, make() { const g = new THREE.Group(); for (const [x, z] of [[-0.1, 0], [0.1, 0.05], [0, -0.1]]) g.add(S(G.ico1, mat(0xb88a4e), 0.11, 0.08, 0.09, x, 0.08, z)); return g; } },
  mesa: { name: 'Mėsa', col: 0xd65a5a, make() { const g = new THREE.Group(); g.add(S(G.sph, mat(0xd65a5a), 0.22, 0.07, 0.16, 0, 0.07, 0)); g.add(S(G.sph, mat(0xffe0e0), 0.06, 0.075, 0.05, 0.1, 0.07, 0.05)); return g; } },
  zuvis: { name: 'Žuvis', col: 0x8fa8c0, make() { const g = new THREE.Group(); g.add(S(G.sph, mat(0x8fa8c0, { metalness: 0.4, roughness: 0.3 }), 0.24, 0.08, 0.09, 0, 0.08, 0)); { const _o = S(G.cone, mat(0x8fa8c0), 0.08, 0.12, 0.03, -0.28, 0.08, 0); _o.rotation.z = Math.PI / 2; g.add(_o); } return g; } },
  pomidorai: { name: 'Pomidorai', col: 0xe8332e, make() { const g = new THREE.Group(); for (const x of [-0.1, 0.1]) { g.add(S(G.sph, mat(0xe8332e, { roughness: 0.35 }), 0.1, 0.09, 0.1, x, 0.09, 0)); g.add(S(G.cyl, mat(0x3faf47), 0.02, 0.03, 0.02, x, 0.19, 0)); } return g; } },
  morkos: { name: 'Morkos', col: 0xff8a1c, make() { const g = new THREE.Group(); for (const x of [-0.07, 0.07]) { const c = S(G.cone, mat(0xff8a1c), 0.05, 0.32, 0.05, x, 0.05, 0); c.rotation.z = Math.PI / 2; g.add(c); } return g; } },
  makaronai: { name: 'Makaronai', col: 0xf2d27a, make() { const g = new THREE.Group(); for (let i = 0; i < 7; i++) g.add(S(G.cyl, mat(0xf2d27a), 0.012, 0.36, 0.012, -0.05 + (i % 4) * 0.03, 0.18, (i > 3 ? 0.03 : 0))); return g; } },
  suris: { name: 'Sūris', col: 0xffd23a, make() { const g = new THREE.Group(); const w = S(new THREE.CylinderGeometry(1, 1, 1, 3), mat(0xffd23a), 0.2, 0.14, 0.2, 0, 0.07, 0); g.add(w); return g; } },
  obuoliai: { name: 'Obuoliai', col: 0x7ccf3a, make() { const g = new THREE.Group(); for (const x of [-0.1, 0.1]) g.add(S(G.sph, mat(0x7ccf3a, { roughness: 0.4 }), 0.1, 0.1, 0.1, x, 0.1, 0)); return g; } },
  desreles: { name: 'Dešrelės', col: 0xe08a8a, make() { const g = new THREE.Group(); for (const z of [-0.05, 0.05]) { const c = S(G.cyl, mat(0xe08a8a), 0.04, 0.32, 0.04, 0, 0.05, z); c.rotation.z = Math.PI / 2; g.add(c); } return g; } }
};
const DISHES = [
  { name: 'Blynai', ing: ['miltai', 'kiausiniai', 'pienas'], how: 'kepti', pay: 14, col: 0xe8b860 },
  { name: 'Kiaušinienė', ing: ['kiausiniai', 'pienas'], how: 'kepti', pay: 9, col: 0xffe27a },
  { name: 'Kepta žuvis', ing: ['zuvis'], how: 'kepti', pay: 10, col: 0xd9a060 },
  { name: 'Kotletai', ing: ['mesa', 'kiausiniai'], how: 'kepti', pay: 12, col: 0x8a5a3a },
  { name: 'Bulviniai blynai', ing: ['bulves', 'kiausiniai', 'miltai'], how: 'kepti', pay: 15, col: 0xc8903a },
  { name: 'Virtos dešrelės', ing: ['desreles'], how: 'virti', pay: 7, col: 0xe08a8a },
  { name: 'Bulvių sriuba', ing: ['bulves', 'morkos'], how: 'virti', pay: 11, col: 0xe8d090 },
  { name: 'Makaronai su sūriu', ing: ['makaronai', 'suris'], how: 'virti', pay: 12, col: 0xf2d27a },
  { name: 'Pomidorų sriuba', ing: ['pomidorai', 'morkos'], how: 'virti', pay: 11, col: 0xd8442e },
  { name: 'Cepelinai', ing: ['bulves', 'mesa'], how: 'virti', pay: 18, col: 0xe8dcc0 },
  { name: 'Kompotas', ing: ['obuoliai'], how: 'virti', pay: 6, col: 0xd98aa0 }
];
const ORDER_TIME = 80, COOK_TIME = 6, BURN_TIME = 7, SHIFT_TIME = 180;
const shift = { active: false, t: 0, earned: 0, dishes: 0 };
const dishWord = n => (n % 10 === 1 && n % 100 !== 11) ? 'patiekalas' : (n % 10 >= 2 && !(n % 100 >= 11 && n % 100 <= 19)) ? 'patiekalai' : 'patiekalų';
const mmss = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const kitchenScene = new THREE.Scene();
kitchenScene.background = new THREE.Color(0x2a2230);
kitchenScene.add(new THREE.AmbientLight(0xffffff, 0.35));
kitchenScene.add(new THREE.HemisphereLight(0xfff4e0, 0x6a5a4a, 0.4));
const kLight = new THREE.PointLight(0xfff0d0, 1.0, 30); kLight.position.set(0, 3.2, 0); kitchenScene.add(kLight);
const K = { W: 14, D: 10, H: 3.6, built: false, boxes: [], spots: [], held: null, heldMesh: null, vessels: {}, order: null, orderT: 0, boardTex: null, boardCtx: null, boardT: 0, customer: null, streak: 0 };
let restaurantDoor = null;

// ---------- the building in the city ----------
function buildRestaurant() {
  const d = cityDir(-10, 30);
  const g = new THREE.Group(); place(g, d, Math.PI);
  const w = 12, dp = 10, h = 7;
  g.add(S(G.box, mat(0xfff1dc), w, h + 1, dp, 0, h / 2 - 0.5, 0));
  g.add(S(G.box, mat(0xb5402f), w + 0.4, 0.5, dp + 0.4, 0, h, 0));
  for (let i = 0; i < 10; i++) { const st = S(G.box, mat(i % 2 ? 0xffffff : 0xd9342b), w / 10, 0.1, 1.6, -w / 2 + w / 20 + i * w / 10, 3.3, dp / 2 + 0.7); st.rotation.x = 0.4; g.add(st); }
  const sign = mesh(new THREE.PlaneGeometry(8, 1.6), new THREE.MeshBasicMaterial({ map: labelTex('SKANUS MAISTAS', '#b5402f', '#fff6e0', 1024, 200) }), 0, 4.9, dp / 2 + 0.06); g.add(sign);
  const glassM = mat(0x40536f, { metalness: 0.6, roughness: 0.12 });
  for (const x of [-4, 4]) g.add(S(G.box, glassM, 2.6, 1.8, 0.05, x, 1.6, dp / 2 + 0.03));
  for (const x of [-4.5, 0, 4.5]) g.add(S(G.box, glassM, 0.05, 1.6, 2.2, w / 2 + 0.03, 2.2, x * 0.7)), g.add(S(G.box, glassM, 0.05, 1.6, 2.2, -w / 2 - 0.03, 2.2, x * 0.7));
  g.add(S(G.box, mat(0x8a5a2b), 1.6, 2.4, 0.1, 0, 1.2, dp / 2 + 0.05));
  g.add(S(G.sph, mat(0xffd23a, { metalness: 0.7, roughness: 0.3 }), 0.08, 0.08, 0.08, 0.55, 1.2, dp / 2 + 0.12));
  // a chef's hat on the roof corner, because why not
  const hat = new THREE.Group(); hat.position.set(w / 2 - 1.5, h + 0.3, dp / 2 - 1.5); hat.add(S(G.cyl, mat(0xffffff), 0.7, 0.9, 0.7, 0, 0.45, 0)); hat.add(S(G.ico1, mat(0xffffff), 1.1, 0.8, 1.1, 0, 1.2, 0)); g.add(hat);
  // terrace
  for (const x of [-4, 4]) { g.add(S(G.cyl, mat(0xffffff), 0.6, 0.06, 0.6, x, 0.9, dp / 2 + 2.6)); g.add(S(G.cyl, mat(0x8a8f9c), 0.05, 0.9, 0.05, x, 0.45, dp / 2 + 2.6)); g.add(S(G.cyl, mat(0xd9342b), 0.08, 2.2, 0.08, x, 1.1, dp / 2 + 2.6)); g.add(S(G.cone, mat(0xffffff), 1.3, 0.5, 1.3, x, 2.3, dp / 2 + 2.6)); }
  addBox(g, w / 2 + 0.1, dp / 2 + 0.1, h);
  for (const x of [-4, 4]) addLocal(g, x, dp / 2 + 2.6, 0.65, 1.0);
  restaurantDoor = g.position.clone().addScaledVector(new V3(0, 0, 1).applyQuaternion(g.quaternion), dp / 2 + 1.0);
  const dd = restaurantDoor.clone().normalize();
  addInspect(dd.clone().multiplyScalar(R + TH(dd) + 1), 'Skanus maistas', '', 3.4, { verb: 'pradėti darbą: virėjas', onUse: enterKitchen });
}

// ---------- the kitchen ----------
function ingredientKeys() { return Object.keys(INGR); }
function boardDraw() {
  const x = K.boardCtx, W2 = 1024, H2 = 512; if (!x) return;
  x.fillStyle = '#1f2a24'; x.fillRect(0, 0, W2, H2); x.strokeStyle = '#8a5a2b'; x.lineWidth = 22; x.strokeRect(11, 11, W2 - 22, H2 - 22);
  const o = K.order;
  x.fillStyle = '#f6f0dc'; x.textAlign = 'left'; x.textBaseline = 'top';
  // shift clock in the top-right corner
  x.textAlign = 'right'; x.font = "60px 'Lilita One', sans-serif"; x.fillStyle = shift.active ? (shift.t < 30 ? '#ff6b6b' : '#ffd23a') : '#b8d8c0';
  x.fillText(shift.active ? mmss(shift.t) : '0:00', W2 - 60, 60);
  x.font = "30px 'Nunito', sans-serif"; x.fillStyle = '#b8d8c0'; x.fillText(`Pamainoje: ${shift.dishes} ${dishWord(shift.dishes)} · ${shift.earned} €`, W2 - 60, 130); x.textAlign = 'left';
  if (!shift.active) { x.fillStyle = '#fff6e0'; x.font = "72px 'Lilita One', sans-serif"; x.fillText('Pamaina baigta', 60, 60); x.font = "38px 'Nunito', sans-serif"; x.fillStyle = '#f6f0dc'; x.fillText('E prie lentos – nauja 3 min. pamaina', 60, 210); x.fillText('E prie durų – eiti namo', 60, 270); K.boardTex.needsUpdate = true; return; }
  if (!o) { x.font = "64px 'Lilita One', sans-serif"; x.fillText('Laukiam kliento…', 60, 60); K.boardTex.needsUpdate = true; return; }
  x.font = "34px 'Nunito', sans-serif"; x.fillStyle = '#b8d8c0'; x.fillText('UŽSAKYMAS #' + (shift.dishes + 1), 60, 46);
  x.font = "84px 'Lilita One', sans-serif"; x.fillStyle = '#fff6e0'; x.fillText(o.name, 60, 90);
  // how to cook it
  const isPan = o.how === 'kepti';
  x.fillStyle = isPan ? '#ff9a3a' : '#5ec8ff'; x.font = "56px 'Lilita One', sans-serif"; x.fillText(isPan ? 'KEPTI KEPTUVĖJE' : 'VIRTI PUODE', 60, 196);
  x.save(); x.translate(860, 150);
  if (isPan) { x.fillStyle = '#3a3a40'; x.beginPath(); x.ellipse(0, 40, 90, 34, 0, 0, Math.PI * 2); x.fill(); x.fillRect(80, 30, 110, 18); }
  else { x.fillStyle = '#9aa0ae'; x.fillRect(-80, -10, 160, 100); x.fillRect(-100, -20, 200, 18); x.fillStyle = '#5ec8ff'; x.fillRect(-70, 0, 140, 10); }
  x.restore();
  // ingredients
  x.font = "40px 'Nunito', sans-serif"; x.fillStyle = '#f6f0dc'; x.fillText('Reikia:', 60, 290);
  o.ing.forEach((k, i) => { const c = '#' + new THREE.Color(INGR[k].col).getHexString(); x.fillStyle = c; x.beginPath(); x.arc(84 + i * 300, 380, 24, 0, Math.PI * 2); x.fill(); x.fillStyle = '#fff6e0'; x.font = "44px 'Lilita One', sans-serif"; x.fillText(INGR[k].name, 120 + i * 300, 356); });
  // patience
  const f = clamp(K.orderT / ORDER_TIME, 0, 1);
  x.fillStyle = '#3a4a40'; x.fillRect(60, 446, W2 - 120, 26); x.fillStyle = f > 0.5 ? '#7dff6b' : f > 0.2 ? '#ffd23a' : '#ff5a5a'; x.fillRect(60, 446, (W2 - 120) * f, 26);
  x.fillStyle = '#f6f0dc'; x.font = "28px 'Nunito', sans-serif"; x.textAlign = 'right'; x.fillText(`Atlygis: ${o.pay} € + arbatpinigiai`, W2 - 60, 404); x.textAlign = 'left';
  K.boardTex.needsUpdate = true;
}
function newOrder() { if (!shift.active || mode !== 'kitchen') return; const o = pick(DISHES); K.order = o; K.orderT = ORDER_TIME; boardDraw(); if (K.customer) { K.customer.visible = true; } sfx.blip(); toast('Naujas užsakymas: ' + o.name, (o.how === 'kepti' ? 'Kepti keptuvėje: ' : 'Virti puode: ') + o.ing.map(k => INGR[k].name).join(', '), '#ffd23a'); }
function buildKitchen() {
  if (K.built) return; K.built = true;
  const { W: Wd, D, H } = K, root = new THREE.Group(); kitchenScene.add(root);
  // room
  root.add(S(G.box, mat(0xe9e4da, { roughness: 0.6 }), Wd, 0.2, D, 0, -0.1, 0));
  for (let i = -Wd / 2; i < Wd / 2; i += 1) for (let j = -D / 2; j < D / 2; j += 1) if ((i + j) % 2 === 0) root.add(S(G.box, mat(0xc9c2b4, { roughness: 0.6 }), 1, 0.01, 1, i + 0.5, 0.005, j + 0.5));
  root.add(S(G.box, mat(0xfaf6ef), Wd, 0.2, D, 0, H + 0.1, 0));
  const tile = mat(0xd8eef2, { roughness: 0.4 });
  root.add(S(G.box, tile, Wd, H, 0.2, 0, H / 2, -D / 2 - 0.1)); root.add(S(G.box, mat(0xfff1dc), Wd, H, 0.2, 0, H / 2, D / 2 + 0.1));
  for (const sx of [-1, 1]) root.add(S(G.box, tile, 0.2, H, D, sx * (Wd / 2 + 0.1), H / 2, 0));
  root.add(S(G.box, mat(0x8a5a2b), 1.4, 2.3, 0.08, 0, 1.15, D / 2 - 0.04));
  for (const x of [-3, 0, 3]) root.add(S(G.sph, bmat(0xfff2b0), 0.3, 0.12, 0.3, x, H - 0.08, 0));
  // stove counter with the frying pan and the pot
  root.add(S(G.box, mat(0x30343e, { metalness: 0.5, roughness: 0.4 }), 5, 0.9, 1.2, 0, 0.45, -D / 2 + 0.6)); K.boxes.push({ x: 0, z: -D / 2 + 0.6, hx: 2.5, hz: 0.6 });
  root.add(S(G.box, mat(0x1a1a1e, { metalness: 0.3, roughness: 0.5 }), 4.6, 0.04, 1.0, 0, 0.92, -D / 2 + 0.6));
  for (const x of [-1.2, 1.2]) root.add(S(G.cyl, bmat(0x5a1a10), 0.38, 0.02, 0.38, x, 0.95, -D / 2 + 0.6));
  const pan = new THREE.Group(); pan.position.set(-1.2, 0.97, -D / 2 + 0.6); root.add(pan);
  pan.add(S(G.cyl, mat(0x2a2a30, { metalness: 0.6, roughness: 0.35 }), 0.45, 0.08, 0.45, 0, 0.04, 0)); pan.add(S(G.box, mat(0x6b4426), 0.6, 0.05, 0.08, 0.7, 0.07, 0));
  const pot = new THREE.Group(); pot.position.set(1.2, 0.97, -D / 2 + 0.6); root.add(pot);
  pot.add(S(G.cyl, mat(0xb8bec8, { metalness: 0.8, roughness: 0.25 }), 0.42, 0.55, 0.42, 0, 0.28, 0)); pot.add(S(G.cyl, mat(0x5ec8ff, { roughness: 0.1 }), 0.38, 0.02, 0.38, 0, 0.45, 0));
  for (const sx of [-1, 1]) pot.add(S(G.box, mat(0x30343e), 0.14, 0.05, 0.06, sx * 0.5, 0.48, 0));
  // big order board above the stove
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; K.boardCtx = c.getContext('2d'); K.boardTex = new THREE.CanvasTexture(c);
  const board = mesh(new THREE.PlaneGeometry(4.6, 2.3), new THREE.MeshBasicMaterial({ map: K.boardTex }), 0, 2.35, -D / 2 + 0.02); root.add(board);
  // ingredient crates along both side walls
  const keys = ingredientKeys();
  keys.forEach((k, i) => {
    const side = i < 6 ? -1 : 1, z = -2.6 + (i % 6) * 1.25, x = side * (Wd / 2 - 0.6);
    const cr = new THREE.Group(); cr.position.set(x, 0, z); root.add(cr);
    cr.add(S(G.box, mat(0xb98b5a), 1.0, 0.8, 1.05, 0, 0.4, 0)); cr.add(S(G.box, mat(0x8a5a2b), 1.04, 0.08, 1.09, 0, 0.8, 0));
    const ic = INGR[k].make(); ic.position.set(0, 0.84, 0); ic.scale.setScalar(1.4); cr.add(ic);
    const lbl = mesh(new THREE.PlaneGeometry(0.95, 0.24), new THREE.MeshBasicMaterial({ map: labelTex(INGR[k].name, '#3a2a1a', '#fff6e0', 512, 128) }), -side * 0.53, 0.45, 0); lbl.rotation.y = -side * Math.PI / 2; cr.add(lbl);
    K.boxes.push({ x, z, hx: 0.5, hz: 0.52 });
    K.spots.push({ kind: 'crate', k, x: x - side * 0.6, z, name: INGR[k].name });
  });
  // serving counter by the door with a waiting customer
  root.add(S(G.box, mat(0xfff1dc), 2.4, 1.0, 0.8, 4.2, 0.5, D / 2 - 1.6)); root.add(S(G.box, mat(0xb5402f), 2.5, 0.06, 0.9, 4.2, 1.02, D / 2 - 1.6));
  root.add(S(G.sph, mat(0xffd23a, { metalness: 0.8, roughness: 0.2 }), 0.12, 0.08, 0.12, 4.9, 1.1, D / 2 - 1.6));
  K.boxes.push({ x: 4.2, z: D / 2 - 1.6, hx: 1.2, hz: 0.4 });
  const cust = makePerson(); cust.position.set(4.2, 0, D / 2 - 0.8); cust.rotation.y = Math.PI; root.add(cust); K.customer = cust;
  // bin
  root.add(S(G.cyl, mat(0x3a7bff), 0.32, 0.8, 0.32, -4.2, 0.4, D / 2 - 1.4)); K.boxes.push({ x: -4.2, z: D / 2 - 1.4, hx: 0.32, hz: 0.32 });
  K.spots.push({ kind: 'pan', x: -1.2, z: -D / 2 + 1.45, name: 'Keptuvė' }, { kind: 'pot', x: 1.2, z: -D / 2 + 1.45, name: 'Puodas' }, { kind: 'board', x: 0, z: -D / 2 + 1.6, name: 'Užsakymų lenta' },
    { kind: 'serve', x: 4.2, z: D / 2 - 2.3, name: 'Patiekimo stalas' }, { kind: 'bin', x: -4.2, z: D / 2 - 2.1, name: 'Šiukšlių dėžė' }, { kind: 'door', x: 0, z: D / 2 - 0.8, name: 'Durys' });
  K.vessels.pan = { kind: 'pan', g: pan, items: [], state: 'empty', t: 0, food: null };
  K.vessels.pot = { kind: 'pot', g: pot, items: [], state: 'empty', t: 0, food: null };
  K.root = root;
  kitchenScene.environment = scene.environment;
  linearize(kitchenScene);
}

// ---------- entering, leaving ----------
let kitchenMusicPrev = 0;
function enterKitchen() {
  if (transitioning || player.inCar) return;
  transitioning = true; cancelPlace(true); stopClimb(); dropAll(); sfx.blip();
  fadeTo(() => {
    transitioning = false; buildKitchen(); mode = 'kitchen'; kitchenScene.add(player.mesh);
    player.pos.set(0, 0, K.D / 2 - 1.3); player.up.set(0, 1, 0); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.grounded = true;
    camera.position.set(0, 2.6, K.D / 2 - 0.3); camera.up.set(0, 1, 0);
    musicSet(0);
    $('bName').textContent = 'Skanus maistas'; $('bEn').textContent = 'Darbas: virėjas'; $('bAtm').textContent = 'Paimk ingredientus iš dėžių, įdėk į keptuvę arba puodą ir patiek klientui.'; document.documentElement.style.setProperty('--biome', '#ff9a3a');
    if (!shift.active) startShift(); else if (!K.order) setTimeout(newOrder, 1200);
    toast('Pamaina prasidėjo: 3 minutės!', 'Kuo daugiau patiekalų pagaminsi, tuo daugiau uždirbsi. Pažiūrėk į lentelę', '#ff9a3a');
  });
}
function exitKitchen() {
  if (transitioning) return; if (shift.active) finishShift(true); $('shiftChip').hidden = true; transitioning = true; dropHeldK(); hands.L.hold = hands.R.hold = false;
  fadeTo(() => {
    $('shiftChip').hidden = true; transitioning = false; mode = 'planet'; world.add(player.mesh);
    const d = restaurantDoor.clone().normalize(), out = moveAlong(d, tangentToward(d, UP), 1.5);
    player.pos.copy(out).multiplyScalar(R + groundH(out) + 0.2); player.up.copy(out); player.fwd.copy(tangentToward(out, UP));
    player.vel.set(0, 0, 0); player.vr = 0; curBiome = -1; camera.position.copy(player.pos).addScaledVector(out, 3).addScaledVector(player.fwd, -6);
  });
}

// ---------- holding things ----------
function holdK(kind, key, meshObj) {
  dropHeldK();
  K.held = { kind, key }; K.heldMesh = meshObj; kitchenScene.add(meshObj);
}
function dropHeldK() { if (K.heldMesh) kitchenScene.remove(K.heldMesh); K.held = null; K.heldMesh = null; }
function plateMesh(col, ruined) {
  const g = new THREE.Group(); g.add(S(G.cyl, mat(0xffffff, { roughness: 0.3 }), 0.32, 0.04, 0.32, 0, 0.02, 0));
  if (ruined) g.add(S(G.ico1, mat(0x1a1410), 0.2, 0.12, 0.2, 0, 0.1, 0));
  else { g.add(S(G.sph, mat(col, { roughness: 0.5 }), 0.24, 0.09, 0.24, 0, 0.08, 0)); g.add(S(G.sph, mat(0x3faf47), 0.04, 0.02, 0.06, 0.08, 0.16, 0.02)); }
  linearize(g); return g;
}

// ---------- cooking ----------
function vesselResult(v) {
  const o = K.order; if (!o) return null;
  const want = [...o.ing].sort().join(','), got = v.items.map(x => x.key).sort().join(',');
  const rightPlace = (o.how === 'kepti') === (v.kind === 'pan');
  return want === got && rightPlace ? o : null;
}
function addToVessel(v, key) {
  if (v.state !== 'empty' && v.state !== 'filling') { toast(v.kind === 'pan' ? 'Keptuvė užimta' : 'Puodas užimtas', 'Pirma paimk tai, kas jame', '#ffb347'); return false; }
  const m = INGR[key].make(); m.scale.setScalar(0.9); m.position.set((v.items.length - 1) * 0.18, v.kind === 'pan' ? 0.08 : 0.4, (v.items.length % 2) * 0.1 - 0.05); v.g.add(m); linearize(m);
  v.items.push({ key, m }); v.state = 'filling';
  tone(v.kind === 'pan' ? 300 : 500, 0.12, { to: 200, type: 'triangle', vol: 0.06 });
  const need = K.order ? K.order.ing.length : 1;
  if (v.items.length >= need) { v.state = 'cooking'; v.t = 0; v.result = vesselResult(v); toast(v.kind === 'pan' ? 'Kepa…' : 'Verda…', 'Palauk, kol bus paruošta, bet nepervirk!', '#ff9a3a'); }
  else toast(INGR[key].name + ' įdėta', `Dar trūksta ${need - v.items.length}`, '#ffd23a');
  return true;
}
function clearVessel(v) { for (const it of v.items) v.g.remove(it.m); v.items = []; if (v.food) v.g.remove(v.food); v.food = null; v.state = 'empty'; v.t = 0; v.result = null; }
let sizzleT = 0;
function updateVessels(dt, t) {
  for (const v of Object.values(K.vessels)) {
    if (v.state === 'cooking' || v.state === 'ready') {
      v.t += dt;
      // steam / sizzle
      sizzleT -= dt; if (sizzleT < 0) { sizzleT = 0.12; if (v.kind === 'pan') noiseHit(0.1, { ft: 'highpass', f: 3500, vol: 0.03 }); else tone(300 + Math.random() * 300, 0.06, { to: 600, vol: 0.015 }); }
      if (Math.random() < dt * 5) {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false })); s.scale.setScalar(0.25);
        const p0 = v.g.position.clone().add(new V3(rr(-0.2, 0.2), 0.3, rr(-0.2, 0.2))); s.position.copy(p0); K.root.add(s); let k = 0;
        fx.push(d2 => { k += d2; s.position.y = p0.y + k * 0.7; s.scale.setScalar(0.18 + k * 0.28); s.material.opacity = Math.max(0, 0.32 - k * 0.3); if (k > 1.2) { K.root.remove(s); return false; } return true; });
      }
      v.items.forEach((it, i) => { it.m.position.y = (v.kind === 'pan' ? 0.08 : 0.4) + Math.abs(Math.sin(t * 9 + i)) * 0.04; });
      if (v.state === 'cooking' && v.t >= COOK_TIME) {
        v.state = 'ready'; v.t = 0; for (const it of v.items) v.g.remove(it.m); v.items = [];
        v.food = v.result ? plateLike(v.result.col) : plateLike(0x1a1410); v.g.add(v.food);
        if (v.result) { [784, 988, 1175].forEach((f, i) => tone(f, 0.2, { type: 'triangle', vol: 0.06, when: i * 0.08 })); toast(v.result.name + ' paruošta!', 'Paimk (E) ir nunešk klientui į patiekimo stalą', '#7dff6b'); }
        else { tone(200, 0.5, { to: 90, type: 'sawtooth', vol: 0.05, lp: 600 }); toast('Sugadinta!', 'Ne tie ingredientai arba ne tas būdas. Pažiūrėk į lentelę ir išmesk tai į šiukšlių dėžę', '#ff6b6b'); }
      }
      if (v.state === 'ready' && v.result && v.t > BURN_TIME) { v.result = null; v.g.remove(v.food); v.food = plateLike(0x1a1410); v.g.add(v.food); toast('Sudegė!', 'Per ilgai laikei ant ugnies', '#ff6b6b'); noiseHit(0.6, { f: 800, vol: 0.08 }); }
    }
  }
}
function plateLike(col) { const g = new THREE.Group(); g.add(S(G.sph, mat(col, { roughness: 0.55 }), 0.3, 0.1, 0.3, 0, 0.1, 0)); linearize(g); return g; }

// ---------- E inside the kitchen ----------
function nearestSpotK() { let best = null, bd = 1.5; for (const s of K.spots) { const d = Math.hypot(player.pos.x - s.x, player.pos.z - s.z); if (d < bd) { bd = d; best = s; } } return best; }
function kitchenAction() {
  const s = nearestSpotK(); if (!s) return;
  if (s.kind === 'door') { exitKitchen(); return; }
  if (s.kind === 'board') { if (!shift.active) { startShift(); return; } if (K.order) showCard(K.order.name, `${K.order.how === 'kepti' ? 'Kepti keptuvėje' : 'Virti puode'}. Reikia: ${K.order.ing.map(k => INGR[k].name).join(', ')}. Atlygis ${K.order.pay} € ir arbatpinigiai, jei paskubėsi.`, 'E – uždaryti', '#ffd23a'), card = { kind: 'info' }; return; }
  if (s.kind === 'crate') { const m = INGR[s.k].make(); linearize(m); holdK('ing', s.k, m); sfx.grab(); return; }
  if (s.kind === 'bin') { if (K.held) { dropHeldK(); noiseHit(0.2, { f: 900, vol: 0.08 }); toast('Išmesta', '', '#aab4cc'); } return; }
  if (s.kind === 'pan' || s.kind === 'pot') {
    const v = K.vessels[s.kind];
    if (v.state === 'ready') { const ok = v.result; const pm = plateMesh(ok ? ok.col : 0, !ok); holdK(ok ? 'dish' : 'ruined', ok ? ok.name : null, pm); K.held.dish = ok; clearVessel(v); sfx.grab(); return; }
    if (K.held && K.held.kind === 'ing') { if (addToVessel(v, K.held.key)) dropHeldK(); return; }
    if (v.state === 'filling') { const it = v.items.pop(); v.g.remove(it.m); if (!v.items.length) v.state = 'empty'; const m = INGR[it.key].make(); linearize(m); holdK('ing', it.key, m); return; }
    toast(s.name, s.kind === 'pan' ? 'Čia kepama. Atnešk ingredientų iš dėžių' : 'Čia verdama. Atnešk ingredientų iš dėžių', '#aab4cc');
    return;
  }
  if (s.kind === 'serve') {
    if (!K.held || K.held.kind !== 'dish') { toast('Klientas laukia', K.order ? 'Jis nori: ' + K.order.name : 'Kol kas nieko', '#aab4cc'); return; }
    const dish = K.held.dish; dropHeldK();
    if (K.order && dish && dish.name === K.order.name) {
      const tip = Math.round(8 * clamp(K.orderT / ORDER_TIME, 0, 1)); served++; K.streak++;
      try { localStorage.setItem('modly-served', String(served)); } catch (_) { }
      shift.earned += dish.pay + tip; shift.dishes++;
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.18, { type: 'triangle', vol: 0.06, when: i * 0.06 }));
      toast(`+${dish.pay + tip} €`, `Klientas patenkintas! Šioje pamainoje: ${shift.dishes} ${dishWord(shift.dishes)}, ${shift.earned} €. Sumokės pamainos pabaigoje`, '#7dff6b');
      K.order = null; boardDraw(); setTimeout(() => { if (mode === 'kitchen') newOrder(); }, 2500);
    } else toast('Ne tas patiekalas', 'Klientas užsakė: ' + (K.order ? K.order.name : '—'), '#ff6b6b');
  }
}
function updateKitchen(dt, t) {
  updateVessels(dt, t);
  if (shift.active) { shift.t -= dt; if (shift.t <= 0) finishShift(false); }
  const sc = $('shiftChip'); sc.hidden = false; sc.innerHTML = shift.active ? `Pamaina <b>${mmss(shift.t)}</b> · ${shift.dishes} ${dishWord(shift.dishes)} · <b>${shift.earned} €</b>` : 'Pamaina baigta';
  sc.classList.toggle('late', shift.active && shift.t < 30);
  if (K.order) { K.orderT -= dt; K.boardT -= dt; if (K.boardT < 0) { K.boardT = 0.5; boardDraw(); } if (K.orderT <= 0) { toast('Klientas išėjo nesulaukęs', 'Kitas bus kantresnis… gal', '#ff6b6b'); K.order = null; K.streak = 0; boardDraw(); setTimeout(() => { if (mode === 'kitchen') newOrder(); }, 2500); } }
  if (K.customer) { const b = K.customer.userData.body; b.rotation.z = Math.sin(t * 2) * 0.04; b.position.y = K.order && K.orderT < 20 ? Math.abs(Math.sin(t * 10)) * 0.06 : 0; }
  // walking, same feel as at home
  const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP);
  _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 7 : 4.5; _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, Math.min(1, 12 * dt));
  if (keys.Space && player.grounded) { player.vr = 6; player.grounded = false; sfx.jump(); }
  player.pos.addScaledVector(player.vel, dt); player.vr -= GRAV * dt; player.pos.y += player.vr * dt;
  const rad = 0.3;
  for (const o of K.boxes) { const dx = player.pos.x - o.x, dz = player.pos.z - o.z, ex = o.hx + rad - Math.abs(dx), ez = o.hz + rad - Math.abs(dz); if (ex > 0 && ez > 0) { if (ex < ez) player.pos.x += dx < 0 ? -ex : ex; else player.pos.z += dz < 0 ? -ez : ez; } }
  player.pos.x = clamp(player.pos.x, -K.W / 2 + rad, K.W / 2 - rad); player.pos.z = clamp(player.pos.z, -K.D / 2 + rad, K.D / 2 - rad);
  if (player.pos.y <= 0) { player.pos.y = 0; player.vr = 0; player.grounded = true; }
  player.mesh.rotation.set(0, 0, 0); player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd);
  hands.L.hold = hands.R.hold = !!K.held;
  animateMan(dt, f !== 0 || s !== 0, sp);
  if (K.heldMesh) { K.heldMesh.position.copy(player.pos).addScaledVector(player.fwd, 0.85).add(new V3(0, 1.3, 0)); K.heldMesh.rotation.y = Math.atan2(player.fwd.x, player.fwd.z); }
  // camera inside the room
  const dist = 4.2, pitch = player.pitch;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
  _ct.x = clamp(_ct.x, -K.W / 2 + 0.25, K.W / 2 - 0.25); _ct.z = clamp(_ct.z, -K.D / 2 + 0.25, K.D / 2 - 0.25); _ct.y = clamp(_ct.y, 0.4, K.H - 0.25);
  camera.position.lerp(_ct, Math.min(1, dt * 10)); camera.up.set(0, 1, 0); camera.lookAt(player.pos.x, player.pos.y + 1.3, player.pos.z);
  // prompt
  const sp2 = nearestSpotK(); let txt = '';
  if (sp2) {
    if (sp2.kind === 'crate') txt = `<kbd>E</kbd> paimti: ${sp2.name}`;
    else if (sp2.kind === 'pan' || sp2.kind === 'pot') { const v = K.vessels[sp2.kind]; txt = v.state === 'ready' ? `<kbd>E</kbd> paimti iš ${sp2.kind === 'pan' ? 'keptuvės' : 'puodo'}` : v.state === 'cooking' ? (sp2.kind === 'pan' ? 'Kepa… ' : 'Verda… ') + Math.round(v.t / COOK_TIME * 100) + '%' : K.held && K.held.kind === 'ing' ? `<kbd>E</kbd> įdėti ${INGR[K.held.key].name.toLowerCase()} į ${sp2.kind === 'pan' ? 'keptuvę' : 'puodą'}` : v.items.length ? `<kbd>E</kbd> išimti paskutinį · ${sp2.name}: ${v.items.map(i => INGR[i.key].name).join(', ')}` : sp2.name + ' tuščia'; }
    else if (sp2.kind === 'serve') txt = K.held && K.held.kind === 'dish' ? '<kbd>E</kbd> patiekti klientui' : 'Klientas nori: ' + (K.order ? K.order.name : '…');
    else if (sp2.kind === 'bin') txt = K.held ? '<kbd>E</kbd> išmesti' : 'Šiukšlių dėžė';
    else if (sp2.kind === 'board') txt = '<kbd>E</kbd> skaityti užsakymą';
    else if (sp2.kind === 'door') txt = '<kbd>E</kbd> baigti darbą ir išeiti';
  } else if (K.held) txt = 'Rankose: ' + (K.held.kind === 'ing' ? INGR[K.held.key].name : K.held.kind === 'dish' ? K.held.key : 'sugadintas patiekalas');
  if (card && card.kind === 'info' && (!sp2 || sp2.kind !== 'board')) hideCard();
  setPrompt(txt);
}

function startShift() {
  shift.active = true; shift.t = SHIFT_TIME; shift.earned = 0; shift.dishes = 0;
  for (const v of Object.values(K.vessels)) clearVessel(v);
  dropHeldK(); hideCard(); K.order = null; boardDraw();
  [392, 523, 659].forEach((f, i) => tone(f, 0.25, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
  toast('Pamaina prasidėjo: 3 minutės!', 'Kuo daugiau patiekalų pagaminsi, tuo daugiau uždirbsi', '#ff9a3a');
  setTimeout(newOrder, 1500);
}
function finishShift(leaving) {
  shift.active = false; K.order = null;
  for (const v of Object.values(K.vessels)) clearVessel(v);
  dropHeldK(); boardDraw();
  if (shift.earned > 0) addMoney(shift.earned);
  const msg = shift.dishes ? `Pagaminai ${shift.dishes} ${shift.dishes % 10 === 1 && shift.dishes % 100 !== 11 ? 'patiekalą' : dishWord(shift.dishes) === 'patiekalai' ? 'patiekalus' : 'patiekalų'} ir uždirbai ${shift.earned} €.` : 'Šį kartą nepagaminai nė vieno patiekalo, todėl atlyginimo nėra.';
  if (shift.earned > 0) [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
  if (leaving) toast('Darbas baigtas', msg, '#ffd23a');
  else { toast('Laikas baigėsi!', msg, '#ffd23a'); showCard('Pamaina baigta', msg + ' Prie lentos spausk E – nauja pamaina, prie durų – eik namo.', 'E – uždaryti', '#ffd23a'); card = { kind: 'info' }; }
  const sc = $('shiftChip'); if (sc) sc.hidden = true;
}

// ---------- test console: press ` (or ~) and type a command ----------
let consoleOpen = false;
function openConsole() {
  consoleOpen = true; for (const k in keys) keys[k] = false;
  const box = $('cheat'); box.hidden = false; const inp = $('cheatInput'); inp.value = ''; setTimeout(() => inp.focus(), 0);
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
}
function closeConsole() { consoleOpen = false; $('cheat').hidden = true; requestLock(); }
function runCommand(txt) {
  const [cmd, arg] = txt.trim().toLowerCase().split(/\s+/);
  if (cmd === 'pinigai' || cmd === 'money') {
    const v = arg !== undefined ? Number(arg.replace(/[^0-9]/g, '')) : 10000000000000000;
    if (!isFinite(v)) { toast('Nesupratau skaičiaus', 'Pvz.: pinigai 5000', '#ff6b6b'); return; }
    addMoney(v - money); toast('Bandymų pasaulis', 'Dabar turi ' + fmtMoney(money), '#ffd23a'); sfx.chime(); return;
  }
  if (cmd === 'kuprine' || cmd === 'kuprinė' || cmd === 'jetpack') { if (!Q8.owned.includes('jetpack')) Q8.owned.push('jetpack'); wearBack('jetpack'); toast('Debesų kuprinė uždėta!', 'Laikyk Space – skrisi, Shift – greičiau', '#bfe8ff'); sfx.chime(); return; }
  if (cmd === 'sparnai' || cmd === 'wings') { if (!Q8.owned.includes('wings')) Q8.owned.push('wings'); wearBack('wings'); toast('Sparnai uždėti!', 'Ore spausk Space vėl ir vėl', '#bfe8ff'); sfx.chime(); return; }
  if (cmd === 'viskas' || cmd === 'all') { grantEverything(false); return; }
  if (cmd === 'pistoletas' || cmd === 'pistol') { unlockSecretTest(true); s9WorldT = 0; if (mode === 'planet') { if (!dropPistolNearPlayer()) toast('Pistoletą jau turi', 'Nueik į muziejų ir pašaudyk į lėkštę', '#7dff6b'); } else if (mode === 'museum') { if (!s9Pistol && !s9Held) spawnFallingPistol(); } else toast('Išeik į lauką', 'Pistoletas nukris šalia tavęs', '#7dff6b'); return; }
  if (cmd === 'slapta' || cmd === 'secret') { const wasMuseum = mode === 'museum'; unlockSecretTest(false); if (wasMuseum) toast('Slapta misija paruošta!', 'Išeik iš muziejaus ir įeik vėl', '#7dff6b'); return; }
  if (cmd === 'urviniai' || cmd === 'urvinis') { if (Q10.stage !== 'done') { Q10.stage = 'done'; saveQ10(); attachMiniTM(false); placeSanctumTM(); refreshMuseumExtras(); } if (Q11.stage === 'none') { Q11.stage = 'go'; saveQ11(); } toast('Įsakymas #9 paruoštas!', 'Kūrėjo Salėje prieik prie laiko mašinos ir spausk E', '#ff9a3a'); sfx.chime(); return; }
  if (cmd === 'ateitis' || cmd === 'kamuolys') { if (Q10.stage !== 'done') { Q10.stage = 'done'; saveQ10(); attachMiniTM(false); placeSanctumTM(); } if (Q11.stage !== 'done') { Q11.stage = 'done'; saveQ11(); refreshHeld(); } refreshMuseumExtras(); if (Q12.stage === 'none') { Q12.stage = 'go'; Q12.code = String(1000 + Math.floor(Math.random() * 9000)); saveQ12(); } toast('Įsakymas #10 paruoštas!', 'Kūrėjo Salėje prie laiko mašinos spausk E ir rinkis ATEITĮ', '#6ff7ff'); sfx.chime(); return; }
  if (cmd === 'kates' || cmd === 'katės') { for (const Q of [Q10, Q11, Q12]) Q.stage = 'done'; saveQ10(); saveQ11(); saveQ12(); placeSanctumTM(); attachMiniTM(false); refreshHeld(); attachGoldBall(false); refreshMuseumExtras(); if (Q13.stage === 'none') { Q13.stage = 'hunt'; saveQ13(); refreshCats(); } toast('Įsakymas #11 paruoštas!', 'Ieškok auksinių katinų – rodyklė parodys', '#ffd23a'); sfx.chime(); return; }
  if (cmd === 'demonas' || cmd === 'demon') { for (const Q of [Q10, Q11, Q12, Q13]) Q.stage = 'done'; saveQ10(); saveQ11(); saveQ12(); saveQ13(); placeSanctumTM(); attachMiniTM(false); refreshHeld(); attachGoldBall(false); attachMuseumCat(false); refreshCats(); refreshMuseumExtras(); if (Q14.stage === 'none') { Q14.stage = 'shop'; saveQ14(); refreshDemonQuest(); } if (money < 1000) addMoney(1000 - money); toast('Įsakymas #12 paruoštas!', 'Ritualų parduotuvė – miesto aikštėje', '#ff4a3a'); sfx.chime(); return; }
  if (cmd === 'kosmosas' || cmd === 'space') { for (const Q of [Q10, Q11, Q12, Q13]) Q.stage = 'done'; Q14.stage = 'done'; saveQ10(); saveQ11(); saveQ12(); saveQ13(); saveQ14(); placeSanctumTM(); attachMiniTM(false); refreshHeld(); attachGoldBall(false); attachMuseumCat(false); refreshCats(); refreshDemonQuest(); refreshMuseumExtras(); refreshSpaceRamp(); refreshGodPhone(); toast('Kosminis tramplinas atsirado!', 'Jis ant kelio prie miesto. Užvažiuok ant jo greitai su mašina', '#ffd23a'); sfx.chime(); return; }
  if (cmd === 'griaustinis' || cmd === 'thunder') { thunderTest(); return; }
  if (cmd === 'siksnosparnis') { batTest(+arg || 0); return; }
  if (cmd === 'kardas') { swordTest(+arg || 0); return; }
  if (cmd === 'lektuvas') { planeTest(+arg || 0); return; }
  if (cmd === 'portalai') { portalTest(+arg || 0); return; }
  if (cmd === 'ankstis') { podTest(+arg || 0); return; }
  if (cmd === 'megintuvelis') { tubeTest(+arg || 0); return; }
  if (cmd === 'zona') { zoneTest(); return; }
  if (cmd === 'leidimas') { permitTest(); return; }
  if (cmd === 'slyva') { plumTest(); return; }
  if (cmd === 'teleportas') { teleTest(+arg || 0); return; }
  if (cmd === 'ugnis') { fireTest(+arg || 0); return; }
  if (cmd === 'zvaigzde' || cmd === 'žvaigždė') { starTest(+arg || 0); return; }
  if (cmd === 'sukimas') { spinTest(+arg || 0); return; }
  if (cmd === 'vejas') { windTest(+arg || 0); return; }
  if (cmd === 'kasimas') { digTest(+arg || 0); return; }
  if (cmd === 'telefonas' || cmd === 'phone') { mphoneTest(+arg || 0); return; }
  if (cmd === 'lapeliai' || cmd === 'lapelis') { notesTest(+arg || 0); return; }
  if (cmd === 'laikas' || cmd === 'time') { timeTest(); return; }
  if (cmd === 'vaiduokliai' || cmd === 'ghosts') { ghostTest(); return; }
  if (cmd === 'katinas' || cmd === 'paskutine') { catSkinTest(); return; }
  if (cmd === 'kepure' || cmd === 'kepurė') { capTest(); return; }
  if (cmd === 'pilis' || cmd === 'castle') { castleTest(); return; }
  if (cmd === 'voras' || cmd === 'spider') { spiderTest(); return; }
  if (cmd === 'marsas' || cmd === 'mars') { marsTest(); return; }
  if (cmd === 'ukis' || cmd === 'ūkis' || cmd === 'farm') { farmTest(); return; }
  if (cmd === 'perejau' || cmd === 'jura' || cmd === 'jūra') {
    if (mode === 'sea') { if (!testFinishOcean()) toast('Jūrų planeta jau pereita', 'Pakalbink Jūrų Dievą (E)', '#4ac8ff'); return; }
    if (mode === 'sun') { toast('Tu jau Saulėje!', '', '#ffb020'); return; }
    for (const Q of [Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q10, Q11, Q12, Q13, Q14]) Q.stage = 'done'; QUEST.stage = 'done'; saveQ10(); saveQ11(); saveQ12(); saveQ13(); saveQ14(); phoneRead = true; try { localStorage.setItem('modly-phone-read', '1'); } catch (_) { } refreshDemonQuest(); refreshSpaceRamp(); refreshGodPhone(); refreshSeaGate();
    toast('Bandymų pasaulis: visi Kūrėjo įsakymai įvykdyti!', 'Prie miesto atsivėrė Jūros vartai – įvažiuok mašina (F)', '#ffd23a'); sfx.chime(); return;
  }
  if (cmd === 'saule' || cmd === 'saulė' || cmd === 'sun') { giveFishSkin(); hideCard(); enterSun(); return; }
  toast('Nežinoma komanda', 'Bandyk: pinigai · pinigai 5000 · kuprine · sparnai · viskas · slapta · urviniai · ateitis · kates · demonas · kosmosas · saule · perejau · ukis · marsas · voras · pilis · kepure · katinas · vaiduokliai · laikas · lapeliai (lapeliai 5) · telefonas (telefonas 9) · griaustinis · kasimas (kasimas 99) · vejas (vejas 2) · sukimas (sukimas 190) · zvaigzde (zvaigzde 2) · ugnis (ugnis 1) · teleportas (teleportas 1) · slyva · leidimas · zona · megintuvelis (megintuvelis 1) · ankstis (ankstis 38) · portalai (portalai 1) · lektuvas (lektuvas 1/2/3) · kardas (kardas 1/2) · siksnosparnis (siksnosparnis 1/2)', '#ff6b6b');
}
