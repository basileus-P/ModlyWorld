// ================= house kiosk: free houses you can put anywhere =================
const HOUSES = [
  { id: 'cottage', name: 'Mažas namelis', desc: 'Jaukus namelis su raudonu stogu.', w: 6, d: 6, h: 3.2, wall: 0xffe3b3, roof: 'pyramid', roofC: 0xd8584a, roofH: 2.4 },
  { id: 'cabin', name: 'Medinė trobelė', desc: 'Rąstų trobelė su kaminu.', w: 5.5, d: 7, h: 3, wall: 0x9b6a3c, roof: 'pyramid', roofC: 0x4a2f1c, roofH: 2, chimney: true },
  { id: 'tower', name: 'Bokštelis', desc: 'Aukštas siauras bokštas su smailia viršūne.', w: 4.4, d: 4.4, h: 8, wall: 0xb9c2d0, roof: 'cone', roofC: 0x3a7bff, roofH: 3.5 },
  { id: 'shroom', name: 'Grybo namas', desc: 'Baltos sienos ir didžiulė dėmėta kepurė.', w: 5, d: 5, h: 3, wall: 0xf3e9dc, roof: 'dome', roofC: 0xff3d5a, roofH: 2.8 },
  { id: 'igloo', name: 'Iglu', desc: 'Sniego namelis. Viduje stebėtinai šilta.', w: 6.4, d: 6.4, h: 2.8, wall: 0xeef7ff, roof: 'igloo' },
  { id: 'pixel', name: 'Pikselių namas', desc: 'Kvadratinis ir spalvotas, kaip iš Pikselių Pasaulio.', w: 6, d: 6, h: 4, wall: 'pixel', roof: 'flat', roofC: 0x7a5cff },
  { id: 'manor', name: 'Dvaras', desc: 'Didelis namas su kolonomis prie įėjimo.', w: 10, d: 8, h: 4.5, wall: 0xf2efe6, roof: 'pyramid', roofC: 0x4a5568, roofH: 3, columns: true },
  { id: 'tent', name: 'Palapinė', desc: 'Lengva, greitai pastatoma ir labai žalia.', w: 4, d: 5, h: 2.6, roof: 'tent', roofC: 0x3fae4a }
];
const myHouses = [];
// prices: the plainer the cheaper, the fancier the dearer
const PRICE = {
  house: { tent: 40, igloo: 80, cabin: 120, cottage: 180, shroom: 250, pixel: 320, tower: 400, manor: 600 },
  pet: { duck: 10, chicken: 15, frog: 20, sheep: 30, penguin: 40, cat: 50, dog: 60, cow: 80, flamingo: 100, elephant: 150, giraffe: 200 },
  car: { hatch: 50, kart: 80, bus: 100, icecream: 140, limo: 200, fire: 240, police: 280, monster: 350, sport: 450, rocket: 600 }
};
function canPay(v) { return money >= v; }
function pay(v) { if (money < v) return false; addMoney(-v); tone(1200, 0.06, { type: 'triangle', vol: 0.05 }); tone(1600, 0.08, { type: 'triangle', vol: 0.05, when: 0.06 }); return true; }
function tooPoor(v) { toast('Neužtenka pinigų', `Kainuoja ${v} €, o tu turi ${money} €. Užsidirbk restorane „Skanus maistas“`, '#ff6b6b'); tone(220, 0.2, { type: 'square', vol: 0.05, lp: 1200 }); }
function markPrices(gridId, kind, keyOf, owned) {
  document.querySelectorAll('#' + gridId + ' .hcard').forEach(b => {
    const k = keyOf(+b.dataset.i), p = PRICE[kind][k], own = owned && owned(k), el = b.querySelector('.hprice');
    b.classList.toggle('poor', !own && money < p);
    el.innerHTML = own ? 'Jau turi' : `${p} €`;
  });
}
let shopOpen = false, placing = null;
const ghostMat = new THREE.MeshBasicMaterial({ color: 0x5dff7a, transparent: true, opacity: 0.4, depthWrite: false });
let pixelWallTex = null;
function getPixelTex() {
  if (pixelWallTex) return pixelWallTex;
  const c = document.createElement('canvas'); c.width = 8; c.height = 8; const x = c.getContext('2d');
  const cols = ['#ff4fd8', '#30c4ff', '#ffe14d', '#3cf27a', '#7a5cff', '#ff7a3d'];
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = cols[(i * 3 + j * 5 + ((i * j) % 3)) % cols.length]; x.fillRect(i, j, 1, 1); }
  pixelWallTex = new THREE.CanvasTexture(c); pixelWallTex.magFilter = THREE.NearestFilter; pixelWallTex.minFilter = THREE.NearestFilter;
  return pixelWallTex;
}

// footprint corners in world dirs, for checking the ground
function houseFrame(d, fz) { const fx = new V3().crossVectors(d, fz).negate().normalize(); return { fx, fz }; }
function footprintHeights(spec, d, fz) {
  const { fx } = houseFrame(d, fz); const hs = [TH(d)];
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1], [0, 1], [0, -1], [1, 0], [-1, 0]]) {
    const p = d.clone().multiplyScalar(R).addScaledVector(fx, sx * spec.w / 2).addScaledVector(fz, sz * spec.d / 2).normalize();
    hs.push(groundH(p));
  }
  return hs;
}

// builds the house; ghost = see-through preview without collisions
function buildHouse(spec, d, fz, ghost) {
  const g = new THREE.Group();
  const hs = footprintHeights(spec, d, fz), base = Math.max(...hs);
  g.position.copy(d).multiplyScalar(R + base);
  orient(g, d, fz);
  const s0 = solids.length;
  const { w, d: dp, h } = spec, t = 0.3, dg = 1.7, dh = 2.3, below = 3;
  const wallM = spec.wall === 'pixel' ? new THREE.MeshLambertMaterial({ map: getPixelTex() }) : mat(spec.wall || 0xffffff);
  const add = (o) => { g.add(o); return o; };
  const solid = (...a) => { if (!ghost) addBox(g, ...a); };
  if (spec.roof === 'igloo') {
    const r = w / 2;
    add(S(G.dome, mat(0xeef7ff), r, h, r, 0, 0, 0));
    for (let i = 0; i < 6; i++) add(S(new THREE.TorusGeometry(1, 0.03, 4, 32, Math.PI), mat(0xcfe3f2), r * Math.cos(i * 0.25), r * Math.cos(i * 0.25), r * Math.cos(i * 0.25), 0, Math.sin(i * 0.25) * h, 0)).rotation.x = -Math.PI / 2;
    add(S(G.box, mat(0xeef7ff), 1.9, 1.9, 1.8, 0, 0.95, r - 0.1));
    add(S(G.box, mat(0x8a5a2b), 1.3, 1.55, 0.08, 0, 0.78, r + 0.82));
    add(S(G.sph, mat(0xffd23a), 0.08, 0.08, 0.08, 0.45, 0.8, r + 0.88));
    if (!ghost) {
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a)) - Math.PI / 2) < 0.4) continue; const s = addLocal(g, Math.cos(a) * (r - 0.25), Math.sin(a) * (r - 0.25), 0.45, h); }
      solid(0.15, 0.9, 1.9, -0.95, r + 0.3); solid(0.15, 0.9, 1.9, 0.95, r + 0.3);
      solid(1.0, 0.2, 1.9, 0, r + 0.75);
    }
  } else if (spec.roof === 'tent') {
    const tm = mat(spec.roofC, { side: THREE.DoubleSide });
    const sl = Math.hypot(w / 2, h);
    for (const sx of [-1, 1]) { const p = add(S(G.box, tm, 0.12, sl, dp, sx * w / 4, h / 2, 0)); p.rotation.z = sx * Math.atan2(w / 2, h); }
    add(S(G.box, tm, 0.05, 0.05, dp, 0, h, 0));
    const back = add(S(new THREE.ConeGeometry(1, 1, 3), tm, w / 2 * 1.15, h, 0.06, 0, h / 2, -dp / 2)); back.rotation.y = Math.PI;
    add(S(new THREE.ConeGeometry(1, 1, 3), tm, w / 2 * 1.15, h, 0.06, 0, h / 2, dp / 2));
    add(S(G.box, mat(0x2a6a2a), 0.06, h * 0.75, 0.08, 0, h * 0.37, dp / 2 + 0.05));
    solid(0.15, dp / 2, 1.4, -w / 2 + 0.3, 0); solid(0.15, dp / 2, 1.4, w / 2 - 0.3, 0); solid(w / 2, 0.1, h * 0.8, 0, -dp / 2); solid(w / 2, 0.15, h * 0.8, 0, dp / 2);
  } else {
    const H = h + below, yC = h / 2 - below / 2;
    add(S(G.box, wallM, w, H, t, 0, yC, -dp / 2 + t / 2)); solid(w / 2, t / 2 + 0.05, h, 0, -dp / 2 + t / 2);
    for (const sx of [-1, 1]) { add(S(G.box, wallM, t, H, dp, sx * (w / 2 - t / 2), yC, 0)); solid(t / 2 + 0.05, dp / 2, h, sx * (w / 2 - t / 2), 0); }
    const segW = (w - dg) / 2;
    for (const sx of [-1, 1]) { add(S(G.box, wallM, segW, H, t, sx * (dg / 2 + segW / 2), yC, dp / 2 - t / 2)); solid(segW / 2, t / 2 + 0.05, h, sx * (dg / 2 + segW / 2), dp / 2 - t / 2); }
    add(S(G.box, wallM, dg, h - dh, t, 0, (dh + h) / 2, dp / 2 - t / 2));
    add(S(G.box, mat(0x6b4426), dg - 0.1, 0.12, 0.5, 0, 0.06, dp / 2 + 0.1));
    // windows
    const win = bmat(0xbfe8ff);
    for (const sx of [-1, 1]) for (let y = 1.6; y < h - 0.6; y += 2.6) { add(S(G.box, win, 0.05, 0.9, 1.1, sx * (w / 2 + 0.01), y, 0)); }
    for (const sx of [-1, 1]) if (segW > 1.6) add(S(G.box, win, 1, 0.9, 0.05, sx * (dg / 2 + segW / 2), 1.6, dp / 2 + 0.01));
    // closed front door
    add(S(G.box, mat(0x8a5a2b), dg - 0.1, dh, 0.12, 0, dh / 2, dp / 2 - t / 2 + 0.06));
    add(S(G.box, mat(0x6b4426), dg - 0.3, 0.08, 0.04, 0, dh * 0.7, dp / 2 + 0.03));
    add(S(G.box, mat(0x6b4426), dg - 0.3, 0.08, 0.04, 0, dh * 0.3, dp / 2 + 0.03));
    add(S(G.sph, mat(0xffd23a), 0.08, 0.08, 0.08, dg / 2 - 0.3, dh * 0.5, dp / 2 + 0.06));
    solid(dg / 2 + 0.05, t / 2 + 0.05, h, 0, dp / 2 - t / 2);
    // warm light behind the windows
    const glowWin = bmat(0xffe9a8);
    for (const sx of [-1, 1]) add(S(G.box, glowWin, 0.02, 0.7, 0.9, sx * (w / 2 + 0.02), 1.6, 0));
    // roof
    const rm = mat(spec.roofC);
    if (spec.roof === 'pyramid') { const k = 1.12; const c = add(S(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4), rm, w * k, spec.roofH, dp * k, 0, h + spec.roofH / 2, 0)); c.rotation.y = Math.PI / 4; c.scale.set(w * k, spec.roofH, dp * k); }
    else if (spec.roof === 'cone') add(S(new THREE.ConeGeometry(1, 1, 12), rm, w * 0.8, spec.roofH, dp * 0.8, 0, h + spec.roofH / 2, 0));
    else if (spec.roof === 'dome') {
      add(S(G.dome, rm, w * 0.8, spec.roofH, dp * 0.8, 0, h - 0.1, 0));
      for (let i = 0; i < 9; i++) { const a = i * 2.4, rr2 = 0.35 + (i % 3) * 0.2; add(S(G.sph, mat(0xffffff), 0.45, 0.2, 0.45, Math.cos(a) * rr2 * w * 0.8, h - 0.1 + Math.sqrt(1 - rr2 * rr2) * spec.roofH, Math.sin(a) * rr2 * dp * 0.8)); }
      if (!ghost) solids.push({ p: g.position.clone(), up: d.clone(), dir: d.clone(), r: w * 0.45, top: g.position.length() + h + spec.roofH * 0.8, thin: true });
    } else if (spec.roof === 'flat') {
      add(S(G.box, rm, w + 0.4, 0.4, dp + 0.4, 0, h + 0.2, 0));
      if (!ghost) solids.push({ p: g.position.clone(), up: d.clone(), dir: d.clone(), r: Math.min(w, dp) / 2, top: g.position.length() + h + 0.4, thin: true });
    }
    if (spec.chimney) add(S(G.box, mat(0x7a3a2a), 0.7, 2.2, 0.7, w * 0.25, h + 1.4, -dp * 0.2));
    if (spec.columns) for (const sx of [-1.4, 1.4, -3.2, 3.2]) { add(S(G.cyl, mat(0xffffff), 0.28, h, 0.28, sx, h / 2, dp / 2 + 1.2)); if (!ghost) addLocal(g, sx, dp / 2 + 1.2, 0.35, h); }
    if (spec.columns) add(S(G.box, mat(0xe5e0d2), w * 0.8, 0.4, 1.8, 0, h + 0.2, dp / 2 + 0.9));
  }
  // steps up to the door when the ground in front is lower than the floor
  const frontZ = spec.roof === 'igloo' ? w / 2 + 1 : dp / 2 + (spec.columns ? 2.2 : 0.2);
  const fd = g.position.clone().addScaledVector(fz, frontZ + 0.5).normalize();
  const drop = (base + 0.1) - groundH(fd);
  if (drop > 0.35) {
    const n = Math.min(8, Math.ceil(drop / 0.35));
    for (let k = 0; k < n; k++) {
      const top = 0.1 - k * drop / n, z = frontZ + 0.25 + k * 0.45;
      add(S(G.box, mat(0x9a9aa8), 1.8, top + 2, 0.45, 0, top - (top + 2) / 2, z));
      solid(0.9, 0.225, top, 0, z);
    }
  }
  if (ghost) g.traverse(o => { if (o.isMesh) o.material = ghostMat; });
  world.add(g);
  const doorPos = g.position.clone().addScaledVector(fz, frontZ + 0.9).addScaledVector(d, 1);
  return { g, solids: ghost ? [] : solids.slice(s0), base, hs, doorPos };
}

// ---------- kiosk ----------
const kiosk = {};
function buildKiosk() {
  const a = 1.87, d = cityDir(Math.cos(a) * 14, Math.sin(a) * 14);
  const g = new THREE.Group(); g.position.copy(surf(d)); orient(g, d, tangentToward(d, UP)); world.add(g);
  g.add(S(G.box, mat(0x3a7bff), 3.4, 2.6, 1.2, 0, 1.3, -0.8));
  for (const sx of [-1.6, 1.6]) g.add(S(G.box, mat(0x3a7bff), 0.2, 2.9, 2.3, sx, 1.45, -0.05));
  g.add(S(G.box, mat(0xffffff), 3.5, 1.0, 0.5, 0, 0.5, 1.15));
  g.add(S(G.box, mat(0xffd23a), 3.6, 0.1, 0.7, 0, 1.05, 1.15));
  for (let i = 0; i < 6; i++) { const st = S(G.box, mat(i % 2 ? 0xffffff : 0xff4d6d), 0.62, 0.1, 1.8, -1.55 + i * 0.62, 3.0, 0.95); st.rotation.x = 0.35; g.add(st); }
  const sign = mesh(new THREE.PlaneGeometry(3.6, 0.8), new THREE.MeshBasicMaterial({ map: labelTex('NAMŲ KIOSKAS', '#ff4d6d', '#ffffff', 640, 128), side: THREE.DoubleSide }), 0, 3.75, 0.6); g.add(sign);
  // tiny houses on the counter
  const mini = [[0xffe3b3, 0xd8584a], [0x9b6a3c, 0x4a2f1c], [0xf3e9dc, 0xff3d5a]];
  mini.forEach(([wc, rc], i) => { g.add(S(G.box, mat(wc), 0.35, 0.3, 0.35, -1 + i, 1.25, 1.2)); const r = S(new THREE.ConeGeometry(0.3, 0.3, 4), mat(rc), 1, 1, 1, -1 + i, 1.55, 1.2); r.rotation.y = Math.PI / 4; g.add(r); });
  // the seller
  const seller = makePerson(); seller.position.set(0, 0, 0.35); seller.scale.setScalar(1.05); g.add(seller);
  animators.push((dt, t) => { const b = seller.userData.body; b.rotation.z = Math.sin(t * 2) * 0.05; b.rotation.y = Math.sin(t * 0.7) * 0.4; });
  addBox(g, 1.8, 1.5, 2.8, 0, 0.1);
  kiosk.g = g; kiosk.d = d;
  addInspect(surf(d, 1).addScaledVector(tangentToward(d, UP), 1.5), 'Namų kioskas', '', 5.5, { verb: 'atidaryti namų kioską', onUse: openShop });
}

// ---------- shop window ----------
function houseSvg(s) {
  const wc = s.wall === 'pixel' ? '#30c4ff' : '#' + new THREE.Color(s.wall || 0xffffff).getHexString();
  const rc = '#' + new THREE.Color(s.roofC || 0xffffff).getHexString();
  let body = '';
  if (s.roof === 'igloo') body = `<path d="M18 66 A32 30 0 0 1 82 66 Z" fill="${wc}" stroke="#9fc3dd" stroke-width="2"/><rect x="42" y="50" width="16" height="16" rx="7" fill="#1b2a38"/>`;
  else if (s.roof === 'tent') body = `<path d="M22 66 L50 22 L78 66 Z" fill="${rc}"/><path d="M44 66 L50 40 L56 66 Z" fill="#163a1a"/>`;
  else {
    const tall = s.id === 'tower', big = s.id === 'manor';
    const x = tall ? 36 : big ? 14 : 24, w = tall ? 28 : big ? 72 : 52, y = tall ? 28 : 40, hgt = 66 - y;
    const roof = s.roof === 'cone' ? `<path d="M${x - 3} ${y} L50 ${y - 24} L${x + w + 3} ${y} Z" fill="${rc}"/>`
      : s.roof === 'dome' ? `<path d="M${x - 8} ${y + 2} A${w / 2 + 8} 20 0 0 1 ${x + w + 8} ${y + 2} Z" fill="${rc}"/><circle cx="40" cy="${y - 8}" r="4" fill="#fff"/><circle cx="58" cy="${y - 4}" r="3" fill="#fff"/>`
        : s.roof === 'flat' ? `<rect x="${x - 3}" y="${y - 5}" width="${w + 6}" height="6" fill="${rc}"/>`
          : `<path d="M${x - 5} ${y} L50 ${y - 20} L${x + w + 5} ${y} Z" fill="${rc}"/>`;
    body = `${roof}<rect x="${x}" y="${y}" width="${w}" height="${hgt}" fill="${wc}" stroke="rgba(0,0,0,.15)"/>`
      + (s.wall === 'pixel' ? `<rect x="${x}" y="${y}" width="${w / 2}" height="${hgt / 2}" fill="#ff4fd8"/><rect x="${x + w / 2}" y="${y + hgt / 2}" width="${w / 2}" height="${hgt / 2}" fill="#ffe14d"/>` : '')
      + `<rect x="45" y="${66 - 15}" width="10" height="15" fill="#5a3a22"/>`
      + (!tall ? `<rect x="${x + 6}" y="${y + 6}" width="9" height="8" fill="#bfe8ff"/><rect x="${x + w - 15}" y="${y + 6}" width="9" height="8" fill="#bfe8ff"/>` : `<rect x="45" y="${y + 6}" width="10" height="9" fill="#bfe8ff"/>`)
      + (s.chimney ? `<rect x="${x + w - 14}" y="${y - 18}" width="6" height="12" fill="#7a3a2a"/>` : '')
      + (s.columns ? `<rect x="30" y="${y + 2}" width="4" height="${hgt - 2}" fill="#fff"/><rect x="66" y="${y + 2}" width="4" height="${hgt - 2}" fill="#fff"/>` : '');
  }
  return `<svg viewBox="0 0 100 74" aria-hidden="true"><rect x="0" y="66" width="100" height="8" rx="2" fill="#62c457"/>${body}</svg>`;
}
function buildShopUI() {
  const grid = document.getElementById('shopGrid');
  grid.innerHTML = HOUSES.map((s, i) => `<button class="hcard" data-i="${i}" id="house-${s.id}"><div class="hpic">${houseSvg(s)}</div><div class="hname">${s.name}</div><div class="hdesc">${s.desc}</div><div class="hfoot"><span class="hsize">${s.w} × ${s.d} m</span><span class="hprice">${PRICE.house[s.id]} €</span></div><kbd class="hkey">${i + 1}</kbd></button>`).join('');
  grid.querySelectorAll('.hcard').forEach(b => b.addEventListener('click', () => pickHouse(+b.dataset.i)));
  document.getElementById('shopClose').addEventListener('click', () => closeShop(true));
}
function openShop() {
  markPrices('shopGrid', 'house', k => HOUSES[k].id);
  if (shopOpen) return;
  shopOpen = true; cancelPlace(true); for (const k in keys) keys[k] = false; hands.L.hold = hands.R.hold = false;
  document.getElementById('shop').hidden = false; document.getElementById('paused').hidden = true;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  sfx.blip();
  const first = document.querySelector('.hcard'); if (first) first.focus();
  document.getElementById('shopCount').textContent = myHouses.length ? `Jau pastatei: ${myHouses.length}` : 'Dar neturi nė vieno namo';
}
function closeShop(relock) {
  if (!shopOpen) return;
  shopOpen = false; document.getElementById('shop').hidden = true;
  if (relock) requestLock();
}
function pickHouse(i) {
  const spec = HOUSES[i]; if (!spec) return;
  if (!canPay(PRICE.house[spec.id])) { tooPoor(PRICE.house[spec.id]); return; }
  closeShop(true);
  placing = { spec, rot: 0, ghost: null, valid: false, why: '' };
  [523, 659, 784, 1047].forEach((f, k) => tone(f, 0.25, { type: 'triangle', vol: 0.07, when: k * 0.07 }));
  toast(spec.name + ` – ${PRICE.house[spec.id]} €`, 'Pasirink vietą ir spausk kairį pelės mygtuką. Pinigai nuskaičiuojami, kai pastatai', '#7dff6b');
}
function cancelPlace(silent) {
  if (!placing) return;
  if (placing.ghost) world.remove(placing.ghost.g);
  placing = null; if (!silent) toast('Statymas atšauktas', 'Namą gali vėl pasiimti kioske', '#aab4cc');
}
const _pf = new V3();
function updatePlacing() {
  if (!placing) return;
  const spec = placing.spec, dist = Math.max(spec.w, spec.d) / 2 + 3.5;
  const fwdT = tangentToward(player.up, player.pos.clone().add(player.fwd));
  const d = moveAlong(player.up, fwdT, dist);
  const fz = tangentToward(d, player.pos).applyAxisAngle(d, placing.rot);
  // only rebuild the preview when it moved noticeably
  const key = d.x.toFixed(3) + d.y.toFixed(3) + d.z.toFixed(3) + placing.rot;
  if (placing.key !== key) {
    placing.key = key;
    if (placing.ghost) world.remove(placing.ghost.g);
    placing.ghost = buildHouse(spec, d, fz, true);
    placing.d = d; placing.fz = fz;
    // validity
    const hs = placing.ghost.hs, minH = Math.min(...hs), maxH = Math.max(...hs);
    let why = '';
    if (minH < 0.15) why = 'Čia per šlapia – namas negali stovėti vandenyje.';
    else if (maxH - minH > 2.6) why = 'Per statu. Ieškok lygesnės vietos.';
    else {
      const [u, v] = cityUV(d.x, d.y, d.z); if (d.y > 0.6 && Math.hypot(u, v) < 23) why = 'Aikštė turi likti laisva visiems.';
    }
    if (!why) {
      const c = d.clone().multiplyScalar(R + placing.ghost.base + 1), rad = Math.max(spec.w, spec.d) / 2;
      for (const s of solids) { if (s.thin || s.dir.dot(d) < COS_NEAR) continue; if (solidOut(s, c) < rad * 0.85 && s.top > c.length() - 1) { why = 'Kažkas trukdo – per arti kito objekto.'; break; } }
    }
    placing.valid = !why; placing.why = why;
    ghostMat.color.setHex(placing.valid ? 0x5dff7a : 0xff4d4d);
  }
}
function confirmPlace() {
  if (!placing) return;
  if (!placing.valid) { toast('Čia pastatyti negalima', placing.why, '#ff6b6b'); tone(220, 0.2, { type: 'square', vol: 0.05, lp: 1200 }); return; }
  const price = PRICE.house[placing.spec.id];
  if (!pay(price)) { tooPoor(price); return; }
  const { spec, d, fz } = placing; cancelPlace(true);
  const h = buildHouse(spec, d, fz, false);
  const rec = { id: spec.id, d: d.toArray(), fz: fz.toArray(), g: h.g, solids: h.solids, furn: defaultFurniture(spec), wall: 0, floor: 0 };
  attachDoor(rec, h); myHouses.push(rec); saveHouses();
  poof(h.g.position.clone(), 0xffffff); sfx.poof(); sfx.land(14); setTimeout(() => sfx.chime(), 150);
  toast('Namas pastatytas!', `${spec.name} dabar tavo (−${price} €). Prieik prie durų ir spausk E, kad įeitum`, '#7dff6b');
}
function nearMyHouse() {
  for (const h of myHouses) { const spec = HOUSES.find(s => s.id === h.id); if (h.g.position.distanceTo(player.pos) < Math.max(spec.w, spec.d) / 2 + 2) return h; }
  return null;
}
function demolish(h) {
  world.remove(h.g); if (h.ins) { const ii = inspectables.indexOf(h.ins); if (ii >= 0) inspectables.splice(ii, 1); }
  for (const s of h.solids) { const i = solids.indexOf(s); if (i >= 0) solids.splice(i, 1); }
  myHouses.splice(myHouses.indexOf(h), 1); saveHouses();
  poof(h.g.position.clone(), 0xbfa58a); sfx.stomp(h.g.position); toast('Namas nugriautas', 'Kioske visada gali pasiimti naują', '#ffb347');
}
function saveHouses() { try { localStorage.setItem('modly-houses', JSON.stringify(myHouses.map(h => ({ id: h.id, d: h.d, fz: h.fz, furn: h.furn.map(o => ({ t: o.t, x: o.x, z: o.z, r: o.r | 0 })), wall: h.wall | 0, floor: h.floor | 0 })))); } catch (_) { } }
function loadHouses() {
  let list = []; try { list = JSON.parse(localStorage.getItem('modly-houses') || '[]'); } catch (_) { }
  for (const r of list) {
    const spec = HOUSES.find(s => s.id === r.id); if (!spec || !Array.isArray(r.d)) continue;
    const d = new V3().fromArray(r.d).normalize(), fz = new V3().fromArray(r.fz).normalize();
    const h = buildHouse(spec, d, fz, false);
    const rec = { id: r.id, d: r.d, fz: r.fz, g: h.g, solids: h.solids, furn: Array.isArray(r.furn) ? r.furn : defaultFurniture(spec), wall: r.wall | 0, floor: r.floor | 0 };
    attachDoor(rec, h); myHouses.push(rec);
  }
}

function attachDoor(rec, h) {
  const spec = HOUSES.find(s => s.id === rec.id);
  rec.ins = addInspect(h.doorPos, spec.name, '', 3.2, { verb: 'įeiti į namą', house: rec, onUse: () => enterHome(rec) });
}
