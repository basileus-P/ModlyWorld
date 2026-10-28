// one time: every old save (it got free test-world things: all cars, pets, skins, aliens + Cloud Prince done…) starts over as a clean new game
try { if (localStorage.getItem('modly-reset141') !== '1') {
  const keep = {}; for (const k of ['modly-quality', 'modly-muted', 'modly-lang', 'modly-srunlock', 'modly-srlb']) keep[k] = localStorage.getItem(k);
  const del = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('modly-')) del.push(k); }
  del.forEach(k => localStorage.removeItem(k)); for (const k in keep) if (keep[k] != null) localStorage.setItem(k, keep[k]);
  localStorage.setItem('modly-fresh', '1'); localStorage.setItem('modly-reset141', '1'); } } catch (_) { }
'use strict';
// ================= utilities =================
const V3 = THREE.Vector3, UP = new V3(0, 1, 0);
let frontView = false;
const R = 80, GRAV = 22, WATER_FLOOR = -0.7;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const smooth = (a, b, x) => { let t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
let seed = 20261003;
function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
const rr = (a, b) => a + (b - a) * rnd();
const pick = a => a[Math.floor(rnd() * a.length)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function hsh(i, j, k) { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 1440662683)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h & 0xffffff) / 16777215; }
function noise(x, y, z) {
  const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
  const fx = x - X, fy = y - Y, fz = z - Z;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
  const a = hsh(X, Y, Z), b = hsh(X + 1, Y, Z), c = hsh(X, Y + 1, Z), d = hsh(X + 1, Y + 1, Z);
  const e = hsh(X, Y, Z + 1), f = hsh(X + 1, Y, Z + 1), g = hsh(X, Y + 1, Z + 1), h = hsh(X + 1, Y + 1, Z + 1);
  const x1 = a + (b - a) * u, x2 = c + (d - c) * u, x3 = e + (f - e) * u, x4 = g + (h - g) * u;
  const y1 = x1 + (x2 - x1) * v, y2 = x3 + (x4 - x3) * v;
  return (y1 + (y2 - y1) * w) * 2 - 1;
}
function fbm(x, y, z, o) { let s = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < o; i++) { s += a * noise(x * f, y * f, z * f); n += a; f *= 2.07; a *= 0.5; } return s / n; }
function dirLL(lat, lon) { const la = lat * Math.PI / 180, lo = lon * Math.PI / 180; return new V3(Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)).normalize(); }

// ================= biomes =================
const BIOMES = [
  { id: 'city', name: 'Pradžios Miestas', en: 'The Origin City', atm: 'Spalvinga, linksma ir gyva.', feat: 'Pagrindinis kelionių ir pasaulio tyrinėjimo centras.', lat: 90, lon: 0, hud: '#6cd85e', sky: 0x6fc4ff, fog: 0xcdeeff, far: 230 },
  { id: 'desert', name: 'Begalinė Dykuma', en: 'The Endless Desert', atm: 'Karšta, sausa ir paslaptinga.', feat: 'Nuolat judančios smėlio kopos ir paslėpti griuvėsiai.', lat: 5, lon: 0, hud: '#f3c66f', sky: 0xffb547, fog: 0xf7dca6, far: 210 },
  { id: 'ice', name: 'Ledo Sala', en: 'The Frozen Island', atm: 'Šalta, rami ir paslaptinga.', feat: 'Milžiniški ledo urvai ir paslaptingas pasaulis po ledu.', lat: 5, lon: 72, hud: '#a9e2ff', sky: 0x9fc8e8, fog: 0xe2f0fa, far: 170 },
  { id: 'mushroom', name: 'Grybų Karalystė', en: 'The Mushroom Kingdom', atm: 'Spalvinga, linksma ir keista.', feat: 'Milžiniški grybai sudaro beveik visą kraštovaizdį.', lat: 5, lon: 144, hud: '#c77dff', sky: 0x8c5cff, fog: 0xd7b8ff, far: 180 },
  { id: 'crimson', name: 'Raudonoji Dykuma', en: 'The Crimson Wastes', atm: 'Sausa, laukinė ir paslaptinga.', feat: 'Raudonas smėlis ir didžiulės požeminės oazės.', lat: 5, lon: 216, hud: '#ff6a3d', sky: 0xff7a2e, fog: 0xe9935c, far: 160 },
  { id: 'jungle', name: 'Džiunglės', en: 'The Wild Jungle', atm: 'Laukinė, drėgna ir gyvybinga.', feat: 'Tanki augmenija, paslaptingos šventyklos ir daugybė gyvybės.', lat: 5, lon: 288, hud: '#3ad65a', sky: 0x4fae7a, fog: 0x9cc39a, far: 120 },
  { id: 'pixel', name: 'Pikselių Pasaulis', en: 'The Pixel Realm', atm: 'Linksma, keista ir nenuspėjama.', feat: 'Viskas sudaryta iš pikselių, o fizika čia keista.', lat: -90, lon: 0, hud: '#ff4fd8', sky: 0x5a3cff, fog: 0xd2bfff, far: 200 },
  { id: 'sanctum', name: 'Kūrėjo Salė', en: 'The Sanctum of the Creator', atm: 'Mistinė, didinga ir nepaaiškinama.', feat: 'Pasaulio centras ir didžiausia jo paslaptis.', hud: '#ffe98a' }
];
const NB = 7;
const BC = BIOMES.slice(0, NB).map(b => dirLL(b.lat, b.lon));
const W = new Float32Array(NB);
function weights(dx, dy, dz, out) {
  const s = 2.2;
  let wx = dx + 0.16 * noise(dx * s + 3.1, dy * s, dz * s), wy = dy + 0.16 * noise(dx * s, dy * s + 7.7, dz * s), wz = dz + 0.16 * noise(dx * s, dy * s, dz * s + 13.3);
  const l = Math.hypot(wx, wy, wz); wx /= l; wy /= l; wz /= l;
  let m = -2;
  for (let i = 0; i < NB; i++) { const c = BC[i]; const d = c.x * wx + c.y * wy + c.z * wz; out[i] = d; if (d > m) m = d; }
  let sum = 0;
  for (let i = 0; i < NB; i++) { out[i] = Math.exp((out[i] - m) * 30); sum += out[i]; }
  for (let i = 0; i < NB; i++) out[i] /= sum;
  return out;
}
function cityUV(dx, dy, dz) { const yy = Math.max(dy, 0.25); return [dx / yy * R, dz / yy * R]; }
function hBiome(i, dx, dy, dz) {
  const px = dx * R, py = dy * R, pz = dz * R;
  switch (i) {
    case 0: {
      const [u, v] = cityUV(dx, dy, dz); const r = Math.hypot(u, v);
      let h = 1.2 + 0.35 * fbm(px * .06, py * .06, pz * .06, 2);
      h = lerp(1.2, h, smooth(22, 28, r));
      h += smooth(48, 66, r) * 3.4 * Math.max(0, fbm(px * .045 + 9, py * .045, pz * .045, 3) + 0.25);
      return h;
    }
    case 1: {
      const s = (px * 0.6 + pz * 0.8 + py * 0.3) * 0.2 + 4 * fbm(px * .02, py * .02, pz * .02, 3);
      return 1.0 + Math.pow(1 - Math.abs(Math.sin(s)), 1.6) * 2.6 + 0.4 * fbm(px * .08, py * .08, pz * .08, 2);
    }
    case 2: {
      const c = BC[2]; const di = dx * c.x + dy * c.y + dz * c.z;
      const t = smooth(0.885, 0.945, di + 0.04 * fbm(px * .05, py * .05, pz * .05, 3));
      const land = 1.0 + 2.2 * Math.max(0, fbm(px * .04, py * .04, pz * .04, 3) + 0.2) + 7 * smooth(0.975, 0.997, di);
      return lerp(-3.2, land, t);
    }
    case 3: return 1.0 + 1.8 * (fbm(px * .035, py * .035, pz * .035, 3) * 0.5 + 0.5);
    case 4: {
      const n = fbm(px * .022 + 40, py * .022, pz * .022, 4);
      return 0.9 + 4.8 * smooth(0.03, 0.16, Math.abs(n)) + 0.35 * fbm(px * .1, py * .1, pz * .1, 2);
    }
    case 5: {
      const n = fbm(px * .03 + 80, py * .03, pz * .03, 3); let h = 1.4 + 4 * Math.max(0, n + 0.1);
      const rv = Math.abs(fbm(px * .014 + 120, py * .014, pz * .014, 3));
      return lerp(-1.2, h, smooth(0.025, 0.06, rv));
    }
    case 6: return Math.floor(1.6 + 4.5 * (fbm(px * .03 + 200, py * .03, pz * .03, 3) * 0.5 + 0.5));
  }
  return 0;
}
function terrainH(dx, dy, dz) {
  weights(dx, dy, dz, W); let h = 0, s = 0;
  for (let i = 0; i < NB; i++) if (W[i] > 0.003) { h += W[i] * hBiome(i, dx, dy, dz); s += W[i]; }
  return h / s;
}
const PIX = [0x3cf27a, 0x2ed8a0, 0x30c4ff, 0xff4fd8, 0xffe14d, 0x7a5cff, 0x3cf27a, 0x55ff99];
const _bc = new THREE.Color();
function biomeColor(i, dx, dy, dz, h, out) {
  const px = dx * R, py = dy * R, pz = dz * R;
  switch (i) {
    case 0: {
      const [u, v] = cityUV(dx, dy, dz); const r = Math.hypot(u, v);
      if (r < 16.5) { out.setHex((r % 4) < 0.6 ? 0xc9b58f : 0xe6dccb); if (r < 2.5) out.setHex(0xf6edd8); }
      else if (r < 21.5) out.setHex(0x5d6270);
      else {
        const mu = ((u % 20) + 20) % 20, mv = ((v % 20) + 20) % 20;
        if (r < 58 && (mu < 1.6 || mu > 18.4 || mv < 1.6 || mv > 18.4)) out.setHex(0x5d6270);
        else if (r < 58 && (mu < 2.8 || mu > 17.2 || mv < 2.8 || mv > 17.2)) out.setHex(0xc4c7cf);
        else { out.setHex(0x62c457); out.offsetHSL(0, 0, 0.05 * noise(px * .3, py * .3, pz * .3)); }
      }
      break;
    }
    case 1: out.setHex(0xeec07a).offsetHSL(0, 0, 0.035 * h - 0.07 + 0.03 * noise(px * .5, py * .5, pz * .5)); break;
    case 2: if (h < -0.3) out.setHex(0x2f5f7c); else if (h < 0.6) out.setHex(0xa9d4ea); else out.setHex(h > 5 ? 0xffffff : 0xe6f3fb).offsetHSL(0, 0, 0.03 * noise(px * .4, py * .4, pz * .4)); break;
    case 3: {
      const s = Math.abs(fbm(px * .03 + 300, py * .03, pz * .03, 2));
      if (s < 0.035) out.setHex(0x7ff6ff); else out.setHex(0x8a5cc9).offsetHSL(0.04 * noise(px * .1, py * .1, pz * .1), 0, 0.05 * noise(px * .4, py * .4, pz * .4));
      break;
    }
    case 4: out.setHex(h < 1.7 ? 0x6b2016 : (h > 4.6 ? 0xc65a32 : 0xa5361f)).offsetHSL(0, 0, 0.04 * noise(px * .4, py * .4, pz * .4)); break;
    case 5: if (h < -0.2) out.setHex(0x3d5a36); else out.setHex(0x2e8b3a).offsetHSL(0.02 * noise(px * .2, py * .2, pz * .2), 0, 0.06 * noise(px * .5, py * .5, pz * .5)); break;
    case 6: { const k = hsh(Math.floor(px / 3), Math.floor(py / 3), Math.floor(pz / 3)); out.setHex(PIX[Math.floor(k * PIX.length)]); break; }
  }
  return out;
}

// ================= renderer & scenes =================
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.autoClear = false;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputEncoding = THREE.sRGBEncoding;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcdeeff, 40, 230);
const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 900);
const world = new THREE.Group(); scene.add(world);

const ambient = new THREE.AmbientLight(0xffffff, 0.08); scene.add(ambient);
const hemi = new THREE.HemisphereLight(0xdff2ff, 0x55603a, 0.3); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1d8, 1.9); scene.add(sun); scene.add(sun.target);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
{ const c = sun.shadow.camera; c.left = -42; c.right = 42; c.top = 42; c.bottom = -42; c.near = 5; c.far = 220; }
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;

const M = {};
function mat(c, o) { const k = 'l' + c + (o ? JSON.stringify(o) : ''); return M[k] || (M[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.78, metalness: 0 }, o || {}))); }
function bmat(c, o) { const k = 'b' + c + (o ? JSON.stringify(o) : ''); return M[k] || (M[k] = new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}))); }
function mesh(geo, m, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); return o; }

// ---------- planet mesh ----------
let planetGeo;
function buildPlanet() {
  const geo = new THREE.IcosahedronGeometry(1, 72);
  const pos = geo.attributes.position, n = pos.count;
  const cache = new Map(); const t = new V3();
  const hs = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    t.fromBufferAttribute(pos, i).normalize();
    const key = Math.round(t.x * 1e5) + ',' + Math.round(t.y * 1e5) + ',' + Math.round(t.z * 1e5);
    let h = cache.get(key);
    if (h === undefined) { h = terrainH(t.x, t.y, t.z); cache.set(key, h); }
    hs[i] = h;
    pos.setXYZ(i, t.x * (R + h), t.y * (R + h), t.z * (R + h));
  }
  const col = new Float32Array(n * 3); const c = new THREE.Color(), acc = new THREE.Color();
  const vcache = new Map(), keyOf = (x, y, z) => Math.round(x * 50) + ',' + Math.round(y * 50) + ',' + Math.round(z * 50);
  const colorAt = (dx, dy, dz, h, out) => {
    weights(dx, dy, dz, W); out.setRGB(0, 0, 0);
    for (let b = 0; b < NB; b++) if (W[b] > 0.01) { biomeColor(b, dx, dy, dz, h, c); out.r += c.r * W[b]; out.g += c.g * W[b]; out.b += c.b * W[b]; }
    const px = dx * R, py = dy * R, pz = dz * R, v = 1 + 0.09 * fbm(px * 0.35, py * 0.35, pz * 0.35, 2) + 0.05 * noise(px * 1.7, py * 1.7, pz * 1.7);
    if (W[6] < 0.5) { out.r *= v; out.g *= v; out.b *= v; }
    return W[6];
  };
  const pixW = new Float32Array(n);
  for (let i = 0; i < n; i += 3) {
    let cx = 0, cy = 0, cz = 0, h = (hs[i] + hs[i + 1] + hs[i + 2]) / 3;
    for (let k = 0; k < 3; k++) { cx += pos.getX(i + k); cy += pos.getY(i + k); cz += pos.getZ(i + k); }
    const l = Math.hypot(cx, cy, cz); cx /= l; cy /= l; cz /= l;
    const pw = colorAt(cx, cy, cz, h, acc);
    for (let k = 0; k < 3; k++) {
      pixW[i + k] = pw;
      if (pw >= 0.5) { col[(i + k) * 3] = acc.r; col[(i + k) * 3 + 1] = acc.g; col[(i + k) * 3 + 2] = acc.b; continue; }
      t.fromBufferAttribute(pos, i + k); const r = t.length(); t.divideScalar(r);
      const key = keyOf(t.x * R, t.y * R, t.z * R); let vc = vcache.get(key);
      if (!vc) { vc = new THREE.Color(); colorAt(t.x, t.y, t.z, r - R, vc); vcache.set(key, vc); }
      col[(i + k) * 3] = vc.r; col[(i + k) * 3 + 1] = vc.g; col[(i + k) * 3 + 2] = vc.b;
    }
  }
  srgbArrayToLinear(col);
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  smoothNormals(geo, i => pixW[i] < 0.5);
  planetGeo = geo;
  const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.93, metalness: 0 })); ground.receiveShadow = true; world.add(ground);
  const water = new THREE.Mesh(new THREE.SphereGeometry(R, 160, 80), new THREE.MeshStandardMaterial({ color: 0x3f8fb5, transparent: true, opacity: 0.82, roughness: 0.06, metalness: 0.1, normalMap: waterNormals(), normalScale: new THREE.Vector2(0.35, 0.35) }));
  water.material.normalMap.repeat.set(90, 45); waterMat = water.material; water.userData.shadowSet = true;
  water.renderOrder = 2; world.add(water);
}

let waterMat = null;
function waterNormals() {
  const S2 = 256, c = document.createElement('canvas'); c.width = c.height = S2; const x = c.getContext('2d'), img = x.createImageData(S2, S2);
  const hgt = (i, j) => { const u = i / S2 * Math.PI * 2, v = j / S2 * Math.PI * 2; return Math.sin(u * 3 + Math.sin(v * 2) * 1.5) * 0.5 + Math.sin(v * 5 + u * 2) * 0.3 + Math.sin(u * 9 - v * 7) * 0.15 + Math.sin(u * 17 + v * 13) * 0.08; };
  for (let j = 0; j < S2; j++) for (let i = 0; i < S2; i++) {
    const dx = hgt(i + 1, j) - hgt(i - 1, j), dy = hgt(i, j + 1) - hgt(i, j - 1), l = Math.hypot(dx, dy, 0.25);
    const o = (j * S2 + i) * 4; img.data[o] = (dx / l * 0.5 + 0.5) * 255; img.data[o + 1] = (dy / l * 0.5 + 0.5) * 255; img.data[o + 2] = (0.25 / l * 0.5 + 0.5) * 255; img.data[o + 3] = 255;
  }
  x.putImageData(img, 0, 0); const tx = new THREE.CanvasTexture(c); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; return tx;
}
const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
function srgbArrayToLinear(arr) { for (let i = 0; i < arr.length; i++) { const c = arr[i]; arr[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); } return arr; }
// colours in this game are written as normal (sRGB) hex values; convert every material once for correct lighting
function linearize(root) {
  root.traverse(o => {
    const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of ms) {
      if (!m || m.userData.lin) continue; m.userData.lin = true;
      if (m.isShaderMaterial) continue;
      if (m.color) m.color.convertSRGBToLinear(); if (m.emissive) m.emissive.convertSRGBToLinear();
      for (const k of ['map', 'emissiveMap']) if (m[k]) { m[k].encoding = THREE.sRGBEncoding; m[k].needsUpdate = true; }
      m.needsUpdate = true;
    }
  });
}
// average the normals of faces that share a corner so surfaces look smooth (filter keeps some faces sharp)
function smoothNormals(geo, keep) {
  const pos = geo.attributes.position, nor = geo.attributes.normal, map = new Map(), n = pos.count;
  const key = i => Math.round(pos.getX(i) * 1000) + ',' + Math.round(pos.getY(i) * 1000) + ',' + Math.round(pos.getZ(i) * 1000);
  for (let i = 0; i < n; i++) { if (keep && !keep(i)) continue; const k = key(i); let s = map.get(k); if (!s) map.set(k, s = [0, 0, 0]); s[0] += nor.getX(i); s[1] += nor.getY(i); s[2] += nor.getZ(i); }
  for (let i = 0; i < n; i++) { if (keep && !keep(i)) continue; const s = map.get(key(i)), l = Math.hypot(s[0], s[1], s[2]) || 1; nor.setXYZ(i, s[0] / l, s[1] / l, s[2] / l); }
  nor.needsUpdate = true;
}
// ---------- bubble sky ----------
const bubbleU = { uTop: { value: new THREE.Color(0x6fc4ff) }, uHor: { value: new THREE.Color(0xcdeeff) }, uUp: { value: new V3(0, 1, 0) }, uCam: { value: new V3() }, uTime: { value: 0 }, uSun: { value: new V3(0.4, 0.8, 0.3).normalize() } };
const bubble = new THREE.Mesh(new THREE.SphereGeometry(R * 2.7, 64, 32), new THREE.ShaderMaterial({
  side: THREE.BackSide, uniforms: bubbleU, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `uniform vec3 uTop,uHor,uUp,uCam,uSun; uniform float uTime; varying vec3 vW;
  void main(){ vec3 v=normalize(vW-uCam); vec3 n=normalize(vW);
    float e=dot(v,uUp);
    vec3 zen=uTop*0.78;
    vec3 col=mix(uHor,zen,pow(smoothstep(-0.02,0.9,e),0.7));
    col=mix(col,uHor*1.06,exp(-max(e,0.)*9.)*0.6);
    float s=max(dot(v,uSun),0.);
    col+=vec3(1.,.93,.78)*(pow(s,900.)*7.+pow(s,60.)*.35+pow(s,8.)*.12);
    float f=pow(1.0-abs(dot(v,n)),3.);
    vec3 ir=0.5+0.5*cos(6.2831*(f*1.3+dot(n,vec3(.3,.5,.2))*0.6+vec3(0.,.33,.67))+uTime*0.2);
    col=mix(col,ir,clamp(f*0.25,0.,0.22));
    gl_FragColor=vec4(col,1.); }`
}));
bubble.renderOrder = -1; scene.add(bubble);
// glints on the bubble wall
{
  const g = new THREE.BufferGeometry(), N = 500, a = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const d = new V3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1).normalize().multiplyScalar(R * 2.6); a.set([d.x, d.y, d.z], i * 3); }
  g.setAttribute('position', new THREE.BufferAttribute(a, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, transparent: true, opacity: 0.7, fog: false })));
}

// ---------- placement helpers ----------
const solids = [];
const inspectables = [];
function randDir() { const u = rnd() * 2 - 1, t = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u); return new V3(s * Math.cos(t), u, s * Math.sin(t)); }
function dirIn(bi, minW = 0.8, cond) {
  for (let k = 0; k < 800; k++) { const d = randDir(); weights(d.x, d.y, d.z, W); if (W[bi] >= minW && !nearRoad(d, 3.5) && !nearReserved(d) && (!cond || cond(d))) return d; }
  return null;
}
function dirNear(c, maxDist, minDist = 0) {
  const t1 = new V3().crossVectors(c, Math.abs(c.y) < 0.9 ? UP : new V3(1, 0, 0)).normalize(), t2 = new V3().crossVectors(c, t1);
  const a = rnd() * Math.PI * 2, s = (minDist + rnd() * (maxDist - minDist)) / R;
  const t = t1.multiplyScalar(Math.cos(a)).add(t2.multiplyScalar(Math.sin(a)));
  return c.clone().multiplyScalar(Math.cos(s)).addScaledVector(t, Math.sin(s)).normalize();
}
const TH = d => terrainH(d.x, d.y, d.z);
const isLand = (d, min = 0.4) => TH(d) > min;
function surf(d, lift = 0) { return d.clone().multiplyScalar(R + TH(d) + lift); }
function place(obj, d, yaw = 0, lift = 0, parent = world) { obj.position.copy(surf(d, lift)); obj.quaternion.setFromUnitVectors(UP, d); if (yaw) obj.rotateY(yaw); parent.add(obj); return obj; }
function addSolid(d, r, height, thin = false, baseLift = 0) {
  const base = R + TH(d) + baseLift;
  const s = { p: d.clone().multiplyScalar(base), up: d.clone(), dir: d.clone(), r, top: base + height, thin };
  solids.push(s); return s;
}
// box-shaped solid aligned with an already placed object (lx/lz = local offset of the box centre)
function addBox(obj, hx, hz, height, lx = 0, lz = 0, baseLift = 0) {
  const q = obj.quaternion, up = new V3(0, 1, 0).applyQuaternion(q), ax = new V3(1, 0, 0).applyQuaternion(q), az = new V3(0, 0, 1).applyQuaternion(q);
  const p = obj.position.clone().addScaledVector(ax, lx).addScaledVector(az, lz).addScaledVector(up, baseLift);
  const s = { type: 'box', p, up, dir: p.clone().normalize(), ax, az, hx, hz, r: Math.hypot(hx, hz), top: obj.position.length() + height, thin: false };
  solids.push(s); return s;
}
// round solid at a local offset of an already placed object
function addLocal(obj, lx, lz, r, height) {
  const q = obj.quaternion, up = new V3(0, 1, 0).applyQuaternion(q);
  const p = obj.position.clone().addScaledVector(new V3(1, 0, 0).applyQuaternion(q), lx).addScaledVector(new V3(0, 0, 1).applyQuaternion(q), lz);
  const s = { p, up, dir: p.clone().normalize(), r, top: obj.position.length() + height, thin: false };
  solids.push(s); return s;
}
function addInspect(pos, name, text, r = 5, extra) { const o = Object.assign({ pos, name, text, r }, extra || {}); inspectables.push(o); return o; }
const placedList = [];
function farFromOthers(d, minDist) { for (const p of placedList) if (p.angleTo(d) * R < minDist) return false; return true; }
function tangentToward(d, target, out = new V3()) { out.copy(target).addScaledVector(d, -d.dot(target)); if (out.lengthSq() < 1e-8) out.set(1, 0, 0).addScaledVector(d, -d.x); return out.normalize(); }
function moveAlong(d, t, dist) { const a = dist / R; return d.clone().multiplyScalar(Math.cos(a)).addScaledVector(t, Math.sin(a)).normalize(); }
const _m4 = new THREE.Matrix4(), _or = new V3(), _of = new V3();
function orient(obj, up, fwd) { _or.crossVectors(up, fwd).normalize(); _of.crossVectors(_or, up); _m4.makeBasis(_or, up, _of); obj.quaternion.setFromRotationMatrix(_m4); }

// ---------- canvas textures ----------
function runeTex(sd) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.strokeStyle = '#9ffcff'; g.lineWidth = 7; g.lineCap = 'round'; g.shadowColor = '#4ef'; g.shadowBlur = 14;
  let s = sd; const r2 = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  g.beginPath(); g.arc(64, 64, 46, 0, Math.PI * 2); g.stroke();
  for (let k = 0; k < 4; k++) {
    g.beginPath();
    if (r2() < 0.5) { g.moveTo(30 + r2() * 68, 30 + r2() * 68); g.lineTo(30 + r2() * 68, 30 + r2() * 68); }
    else { g.arc(40 + r2() * 48, 40 + r2() * 48, 8 + r2() * 16, r2() * 6, r2() * 6 + 3); }
    g.stroke();
  }
  return new THREE.CanvasTexture(c);
}
function labelTex(text, bg = '#3b2a1c', fg = '#fff6e0', w = 512, h = 96) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = fg; let fs = Math.round(h * 0.46); g.font = `${fs}px 'Lilita One', sans-serif`;
  const tw = g.measureText(text).width; if (tw > w - 48) { fs = Math.floor(fs * (w - 48) / tw); g.font = `${fs}px 'Lilita One', sans-serif`; }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, w / 2, h / 2 + 2);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
}
function glowTex(inner = 'rgba(255,255,240,1)', outer = 'rgba(255,220,120,0)') {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, inner); gr.addColorStop(0.3, 'rgba(255,240,180,.55)'); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}
