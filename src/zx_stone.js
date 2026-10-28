// ================= Command #9: "Urvinių karaliaus padėjėjas" =================
// the Creator sends you through the time machine 100 000 years back: the same round world, but nothing but jungle.
// King Ugabugas gives three really hard tasks: 1) cooked fish (5 stones + 5 sticks, catch a fish, cook it without
// burning it) 2) 20 shells for his poor friend Gugas 3) catch the crazy circus tiger and lock it in the cage →
// the king's crown goes to the museum
const Q11 = { stage: 'none', stones: [], sticks: [], fish: 'none', fire: false, shells: [] };   // none | go | fish | shells | king2 | tiger | king3 | crown | done
try { const s = JSON.parse(localStorage.getItem('modly-quest11') || 'null'); if (s) Object.assign(Q11, s); } catch (_) { }
function saveQ11() { try { localStorage.setItem('modly-quest11', JSON.stringify(Q11)); } catch (_) { } }
const q11Active = () => Q11.stage !== 'none' && Q11.stage !== 'done';
const Q11_GIVE = [
  'Laiko mašina veikia! Ir jau turiu tau naują įsakymą: URVINIŲ KARALIAUS PADĖJĖJAS.',
  'Prieš 100 000 metų mūsų pasaulis buvo vien džiunglės. Ten gyveno urviniai žmonės ir jų karalius Ugabugas. Jam labai reikia pagalbos.',
  'Prieik prie laiko mašinos mano salėje ir spausk E. Ji nuneš tave į urvinių laikus.'
];
function Q11_LINES() {
  if (Q11.stage === 'go') return ['Laiko mašina stovi mano salėje. Prieik prie jos ir spausk E.'];
  if (Q11.stage === 'crown') return ['Kokia graži karūna! Nunešk ją į muziejų, kad visi matytų.'];
  if (Q11.stage === 'done') { const fin = ['Urvinių karalius turi gerą padėjėją. O aš – gerą pagalbininką.']; return Q12.stage === 'none' ? fin.concat(Q12_GIVE) : (Q12_LINES() || fin); }
  if (q11Active()) return ['Karalius Ugabugas tavęs laukia praeityje. Laiko mašina – čia pat, mano salėje.'];
  return null;
}
function q11TalkEnd() {
  if (Q11.stage !== 'none' || Q10.stage !== 'done') return false;
  Q11.stage = 'go'; saveQ11();
  [196, 262, 330, 392, 523].forEach((f, i) => tone(f, 0.4, { type: 'triangle', vol: 0.06, when: i * 0.12 }));
  toast('Įsakymas #9: Urvinių karaliaus padėjėjas', 'Prieik prie laiko mašinos Kūrėjo Salėje ir spausk E', '#ff9a3a');
  return true;
}
const q11SanctumNear = () => sancTM && (q11Active() || Q11.stage === 'done') && Math.hypot(player.pos.x - sancTM.position.x, player.pos.z - sancTM.position.z) < 3.6;

// ---------- the stone-age world: same planet, all jungle ----------
const ugScene = new THREE.Scene(); ugScene.background = new THREE.Color(0x8fd0c0); ugScene.fog = new THREE.Fog(0xa8d8b8, 45, 190);
ugScene.add(new THREE.AmbientLight(0xffffff, 0.18)); ugScene.add(new THREE.HemisphereLight(0xe8fff0, 0x4a5a2a, 0.75));
const ugSun = new THREE.DirectionalLight(0xfff0d0, 1.6); ugSun.position.set(60, 140, 50); ugScene.add(ugSun);
const UG = { built: false, solids: [], stones: [], sticks: [], shells: [], men: [], ptero: [], fires: [] };
const UG_D0 = new V3(0, 1, 0);
function ugL(x, z) { const d = Math.hypot(x, z); return d < 1e-6 ? UG_D0.clone() : moveAlong(UG_D0, new V3(x / d, 0, z / d), d); }
function ugPut(obj, d, yaw = 0, lift = 0) { obj.position.copy(d).multiplyScalar(R + TH(d) + lift); obj.quaternion.setFromUnitVectors(UP, d); if (yaw) obj.rotateY(yaw); ugScene.add(obj); return obj; }
function ugCirc(d, r, h, lift = 0) { const b = R + TH(d) + lift; UG.solids.push({ p: d.clone().multiplyScalar(b), up: d.clone(), dir: d.clone(), r, top: b + h }); }
function ugBox(obj, hx, hz, h, lx = 0, lz = 0) {
  const q = obj.quaternion, up = new V3(0, 1, 0).applyQuaternion(q), ax = new V3(1, 0, 0).applyQuaternion(q), az = new V3(0, 0, 1).applyQuaternion(q);
  const p = obj.position.clone().addScaledVector(ax, lx).addScaledVector(az, lz);
  UG.solids.push({ type: 'box', p, up, dir: p.clone().normalize(), ax, az, hx, hz, top: obj.position.length() + h });
}
// a fixed little random generator so the shells, stones and sticks always lie in the same places
let ugSeed = 99173; const urnd = () => { ugSeed = (ugSeed * 16807) % 2147483647; return ugSeed / 2147483647; }; const urr = (a, b) => a + (b - a) * urnd();
const UG_SPOTS = { tm: [-8, 4, 5], temple: [0, -28, 15], fire: [7, -12, 4], pond: [-20, -6, 8], cage: [16, -24, 5], hut: [-14, -27, 5], path1: [0, -4, 4], path2: [0, -12, 4], king: [0, -15, 4] };
function ugFree(d, extra = 0) { for (const k in UG_SPOTS) { const [x, z, r] = UG_SPOTS[k]; if (ugL(x, z).angleTo(d) * R < r + extra) return false; } return true; }

function buildStoneWorld() {
  if (UG.built) return; UG.built = true;
  // ground: the very same planet, painted jungle green everywhere
  { const geo = planetGeo.clone(), pos = geo.attributes.position, n = pos.count, col = new Float32Array(n * 3), t = new V3(), c = new THREE.Color(), c2 = new THREE.Color();
    for (let i = 0; i < n; i++) {
      t.fromBufferAttribute(pos, i); const r = t.length(), h = r - R; t.divideScalar(r);
      const nz = noise(t.x * 9, t.y * 9, t.z * 9) * 0.5 + 0.5, nz2 = noise(t.x * 31 + 4, t.y * 31, t.z * 31) * 0.5 + 0.5;
      if (h < 0.25) c.setHex(0xcdb87e).lerp(c2.setHex(0x9a8a5a), nz2 * 0.4);
      else if (h < 7) c.setHex(0x2c7a28).lerp(c2.setHex(0x5aa83a), nz * 0.8).lerp(c2.setHex(0x1f5a1c), nz2 * 0.3);
      else c.setHex(0x3f7a34).lerp(c2.setHex(0x7a7f70), clamp((h - 7) / 6, 0, 1) * (0.5 + nz * 0.5));
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    srgbArrayToLinear(col); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    ugScene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 })));
    const water = new THREE.Mesh(new THREE.SphereGeometry(R, 120, 60), new THREE.MeshStandardMaterial({ color: 0x2f8a86, transparent: true, opacity: 0.85, roughness: 0.1, metalness: 0.1 })); water.renderOrder = 2; ugScene.add(water); }
  // jungle everywhere: instanced trees, bushes, ferns and flowers
  { const trunks = [], leaves = [], bushes = [], ferns = [], m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), qy = new THREE.Quaternion(), sc = new V3(), p = new V3();
    const LEAF = [0x1f7a2e, 0x2a9a3a, 0x167030, 0x3cb043, 0x2f8a2a], FL = [0xff4fa0, 0xffd23a, 0xff6a3d, 0xc77dff, 0xffffff];
    const frame = (d, yaw) => { q.setFromUnitVectors(UP, d); qy.setFromAxisAngle(UP, yaw); q.multiply(qy); return q; };
    for (let k = 0; k < 2600 && trunks.length < 420; k++) {
      const d = randDir(), h0 = TH(d); if (h0 < 0.45) continue;
      const near = d.angleTo(UG_D0) * R < 45; if (near && (!ugFree(d, 2) || urnd() < 0.55)) continue;
      const h = rr(8, 18), s = h / 12, yaw = rr(0, 6.3); frame(d, yaw);
      const base = d.clone().multiplyScalar(R + h0 - 0.3);
      trunks.push(m4.clone().compose(p.copy(base).addScaledVector(d, h / 2), q, sc.set(0.5 * s, h, 0.6 * s)));
      for (let j = 0; j < 4; j++) leaves.push({ m: m4.clone().compose(p.set(rr(-2, 2) * s, h + rr(-1, 1.5), rr(-2, 2) * s).applyQuaternion(q).add(base), q, sc.set(rr(2.5, 4) * s, rr(1.6, 2.4) * s, rr(2.5, 4) * s)), c: pick(LEAF) });
      ugCirc(d, 0.6 * s, h, -0.3);
    }
    for (let k = 0; k < 900; k++) {
      const d = randDir(), h0 = TH(d); if (h0 < 0.3 || (d.angleTo(UG_D0) * R < 45 && !ugFree(d, 1))) continue;
      frame(d, rr(0, 6.3)); const base = d.clone().multiplyScalar(R + h0);
      if (k % 3) bushes.push({ m: m4.clone().compose(p.copy(base).addScaledVector(d, 0.2), q, sc.set(rr(0.8, 1.8), rr(0.5, 1.1), rr(0.8, 1.8))), c: pick(LEAF) });
      else ferns.push({ m: m4.clone().compose(p.copy(base).addScaledVector(d, 0.6), q, sc.set(0.3, 0.2, 0.3)), c: pick(FL) });
    }
    const inst = (geo, list, colored) => {
      const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: colored ? 0xffffff : 0x5a3a22, roughness: 0.85 }), list.length);
      const cc = new THREE.Color();
      list.forEach((it, i) => { im.setMatrixAt(i, colored ? it.m : it); if (colored) im.setColorAt(i, cc.setHex(it.c).convertSRGBToLinear()); });
      im.frustumCulled = false; if (!colored) im.material.color.convertSRGBToLinear(); im.material.userData.lin = true; ugScene.add(im); return im;
    };
    inst(G.cyl6, trunks, false); inst(G.ico1, leaves, true); inst(G.ico1, bushes, true); inst(G.ico, ferns, true);
  }
  // King Ugabugas' temple – a big stone step pyramid with stairs at the front
  { const d = ugL(0, -28), g = new THREE.Group(), st = mat(0x9a8f78), st2 = mat(0x857a64), moss = mat(0x3d8c3a);
    for (let i = 0; i < 5; i++) { const w = 18 - i * 3.4; g.add(S(G.box, i % 2 ? st2 : st, w, 2.4, w, 0, 1.2 + i * 2.4 - 0.6, 0)); }
    g.add(S(G.box, st, 4, 3, 4, 0, 13, 0)); g.add(S(G.box, bmat(0x0a0f08), 1.6, 2.2, 0.1, 0, 12.6, 2.02));
    // a huge stone face on top: the king's sign
    g.add(S(G.sph, mat(0xffd23a, { metalness: 0.6, roughness: 0.3 }), 0.8, 0.8, 0.3, 0, 15.2, 0)); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; g.add(S(G.cone, mat(0xffd23a, { metalness: 0.6, roughness: 0.3 }), 0.2, 0.6, 0.2, Math.cos(a) * 0.9, 15.4 + Math.sin(a) * 0.9, 0.2)); }
    const steps = [];
    for (let i = 0; i < 5; i++) {
      const w = 18 - i * 3.4, top = 1.8 + 2.4 * i, low = i === 0 ? 0.5 : 1.8 + 2.4 * (i - 1), n = Math.ceil((top - low) / 0.4), dep = 1.7 / n;
      for (let k = 0; k < n; k++) { const t = top - k * (top - low) / n, z = w / 2 + dep * (k + 0.5); g.add(S(G.box, k % 2 ? st : st2, 3, t - low + 0.6, dep, 0, low - 0.6 + (t - low + 0.6) / 2, z)); steps.push([z, dep, t]); }
    }
    for (let j = 0; j < 14; j++) g.add(S(G.ico1, moss, rr(0.8, 2), rr(0.5, 1), rr(0.8, 2), rr(-8, 8), rr(1, 10), rr(-8, 8)));
    ugPut(g, d, 0, -0.5); linearize(g);
    for (let i = 0; i < 5; i++) { const w = 18 - i * 3.4; ugBox(g, w / 2, w / 2, 1.8 + 2.4 * i); }
    ugBox(g, 2, 2, 14.5); for (const [z, dep, t] of steps) ugBox(g, 1.5, dep / 2, t, 0, z);
    UG.temple = g;
    // torches beside the throne
    for (const x of [-4, 4]) { const tg = new THREE.Group(); tg.add(S(G.cyl6, mat(0x6b4426), 0.12, 2.2, 0.12, 0, 1.1, 0)); const fl = makeFlames(0.5); fl.position.y = 2.3; tg.add(fl); ugPut(tg, ugL(x, -15), 0); linearize(tg); ugCirc(ugL(x, -15), 0.3, 2.4); }
  }
  // the king on his stone throne
  { const g = new THREE.Group(), st = mat(0x7a7062);
    g.add(S(G.box, st, 2.4, 0.9, 1.6, 0, 0.45, -0.2)); g.add(S(G.box, st, 2.4, 2.4, 0.4, 0, 1.6, -0.9)); for (const x of [-1.1, 1.1]) g.add(S(G.box, st, 0.3, 0.6, 1.4, x, 1.1, -0.2));
    g.add(S(G.ico1, mat(0xc8a070), 1.0, 0.18, 0.7, 0, 0.95, -0.1));
    const k = makeCaveman({ king: true }); k.scale.setScalar(1.3); k.position.set(0, 0.25, 0.1); g.add(k); UG.kingM = k;
    ugPut(g, ugL(0, -15), 0); linearize(g); ugCirc(ugL(0, -15.3), 1.4, 2.2);
    UG.kingPos = g.position.clone();
  }
  // the time machine you arrived in
  { const m = makeTimeMachine(); ugPut(m, ugL(-8, 4), Math.PI / 2, 0); linearize(m); ugBox(m, 1.5, 1.3, 4); UG.tm = m;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex('NAMO', '#d8262e', '#ffffff', 256, 96), transparent: true, depthWrite: false })); s.scale.set(2.2, 0.8, 1); s.position.y = 6.2; m.add(s); }
  // the fishing pond with a little dock
  { const d = ugL(-20, -6), g = new THREE.Group();
    g.add(mesh(new THREE.CircleGeometry(5.2, 40), mat(0x2f9aa0, { roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.92 }), 0, 0.12, 0).rotateX(-Math.PI / 2));
    g.add(mesh(new THREE.RingGeometry(5.0, 5.8, 40), mat(0x8a7a50), 0, 0.1, 0).rotateX(-Math.PI / 2));
    for (let i = 0; i < 18; i++) { const a = rr(0, 6.3), r = rr(4.6, 5.6); if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.5) continue; for (let j = 0; j < 3; j++) g.add(S(G.cyl6, mat(0x4a8a2a), 0.04, rr(1, 1.8), 0.04, Math.cos(a) * r + rr(-0.2, 0.2), 0.6, Math.sin(a) * r + rr(-0.2, 0.2))); }
    for (let i = 0; i < 5; i++) g.add(S(G.box, mat(i % 2 ? 0x8a5a2b : 0x7a4a22), 0.5, 0.12, 1.4, 5.6 - i * 0.52, 0.35, 0));
    for (const z of [-0.6, 0.6]) g.add(S(G.cyl6, mat(0x6b4426), 0.08, 0.9, 0.08, 3.6, 0.15, z));
    ugPut(g, d, 0, 0); linearize(g); ugCirc(d, 4.4, 3);
    UG.pondC = g.position.clone(); UG.dock = ugL(-14.2, -6); UG.dockPos = UG.dock.clone().multiplyScalar(R + TH(UG.dock));
    const sign = makeSign('Žvejyba'); ugPut(sign, ugL(-13.5, -8), Math.PI / 2); linearize(sign);
  }
  // fire pit: an empty spot until you bring 5 stones and 5 sticks
  { const d = ugL(7, -12), g = new THREE.Group();
    g.add(mesh(new THREE.CircleGeometry(1.2, 20), mat(0x3a2a1a), 0, 0.04, 0).rotateX(-Math.PI / 2));
    const ring = new THREE.Group(); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; ring.add(S(G.dodec, mat(0x8a8a86), 0.32, 0.26, 0.32, Math.cos(a) * 0.95, 0.15, Math.sin(a) * 0.95)); }
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + 0.3; const l = S(G.cyl6, mat(0x6b4426), 0.07, 1.1, 0.07, Math.cos(a) * 0.3, 0.25, Math.sin(a) * 0.3); l.rotation.set(0.9, a, 0); ring.add(l); }
    g.add(ring); const fl = makeFlames(1); fl.position.y = 0.25; g.add(fl);
    const light = new THREE.PointLight(0xff8a3a, 1.4, 9); light.position.y = 1.2; g.add(light);
    // spit with a fish on it
    const spit = new THREE.Group(); spit.position.y = 1.1; g.add(spit);
    for (const x of [-0.9, 0.9]) ring.add(S(G.cyl6, mat(0x6b4426), 0.05, 1.2, 0.05, x, 0.6, 0));
    spit.add(S(G.cyl6, mat(0x6b4426), 0.03, 2, 0.03, 0, 0, 0).rotateZ(Math.PI / 2));
    const sf = makeFishMesh(); sf.rotation.y = Math.PI / 2; spit.add(sf); spit.visible = false;
    const sign = makeSign('Laužavietė'); sign.position.set(1.6, 0, 1.2); g.add(sign);
    ugPut(g, d, 0.4, 0); linearize(g);
    UG.fire = { g, ring, fl, light, spit, fishM: sf, pos: g.position.clone(), cooking: false, t: 0, flipped: false };
    refreshFire();
  }
  // the circus cage
  { const d = ugL(16, -24), g = new THREE.Group(), wood = mat(0xc8402a), gold = mat(0xffd23a, { metalness: 0.6, roughness: 0.3 });
    g.add(S(G.box, wood, 4, 0.4, 3, 0, 0.9, 0)); g.add(S(G.box, wood, 4.2, 0.3, 3.2, 0, 3.6, 0));
    for (let i = 0; i < 6; i++) g.add(S(G.box, i % 2 ? mat(0xffffff) : mat(0xe8262e), 0.7, 0.4, 3.3, -1.75 + i * 0.7, 3.95, 0));
    for (const [x, z] of [[-1.5, 1.6], [1.5, 1.6], [-1.5, -1.6], [1.5, -1.6]]) { g.add(S(G.cyl, gold, 0.6, 0.15, 0.6, x, 0.6, z).rotateX(Math.PI / 2)); }
    for (let i = 0; i <= 8; i++) for (const z of [-1.45, 1.45]) g.add(S(G.cyl6, gold, 0.05, 2.6, 0.05, -1.9 + i * 0.475, 2.3, z));
    for (let i = 1; i < 6; i++) g.add(S(G.cyl6, gold, 0.05, 2.6, 0.05, -1.9, 2.3, -1.45 + i * 0.483));
    const door = new THREE.Group(); door.position.set(1.9, 0, -1.45); g.add(door);
    for (let i = 1; i < 6; i++) door.add(S(G.cyl6, gold, 0.05, 2.6, 0.05, 0, 2.3, i * 0.483));
    door.rotation.y = -1.6;
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.6), new THREE.MeshBasicMaterial({ map: labelTex('CIRKAS', '#e8262e', '#ffd23a', 384, 96), side: THREE.DoubleSide })); sign.position.set(0, 4.5, 1.65); g.add(sign);
    ugPut(g, d, -0.5, 0); linearize(g); ugBox(g, 2.1, 1.6, 4.2);
    UG.cage = { g, door, pos: g.position.clone(), d };
  }
  // Gugas' poor little hut
  { const d = ugL(-14, -27), g = new THREE.Group(), stick = mat(0x7a5a32), leaf = mat(0x4a8a2a);
    for (let i = 0; i < 9; i++) { const x = -1.6 + i * 0.4, l = S(G.cyl6, stick, 0.06, 3.2, 0.06, x, 1.3, -0.4); l.rotation.x = -0.55; g.add(l); }
    g.add(S(G.box, leaf, 3.6, 0.15, 2.6, 0, 1.4, -0.45).rotateX(-0.55));
    const gu = makeCaveman({ poor: true }); gu.position.set(0.4, 0, 1.2); g.add(gu); UG.gugas = gu;
    g.add(S(G.dodec, mat(0x7a7f70), 0.4, 0.3, 0.4, -1.2, 0.2, 1.4));
    ugPut(g, d, 0.35, 0); linearize(g); ugBox(g, 1.8, 1.2, 2.6, 0, -0.5);
    g.updateMatrixWorld(true); UG.gugasPos = gu.getWorldPosition(new V3());
    const neck = new THREE.Group(); for (let i = 0; i < 7; i++) { const a = -0.9 + i * 0.3; neck.add(S(G.cone, mat(0xffc0d0), 0.06, 0.1, 0.06, Math.sin(a) * 0.32, 1.42 - Math.cos(a) * 0.08, Math.cos(a) * 0.22)); } gu.userData.body.add(neck); neck.visible = false; UG.gugasNeck = neck; linearize(neck);
  }
  // stones, sticks and shells
  ugSeed = 99173;
  const spot = (min, max, used) => { for (let k = 0; k < 200; k++) { const a = urr(0, Math.PI * 2), r = urr(min, max), d = ugL(Math.cos(a) * r, Math.sin(a) * r); if (TH(d) > 0.3 && ugFree(d, 1) && used.every(u => u.angleTo(d) * R > 5)) { used.push(d); return d; } } const d = ugL(urr(-30, 30), urr(-30, 30)); used.push(d); return d; };
  const used = [];
  for (let i = 0; i < 7; i++) { const d = spot(10, 42, used), m = new THREE.Group(); m.add(S(G.dodec, mat(0x8a8a86), 0.32, 0.26, 0.32, 0, 0.2, 0)); addGlow(m, 0xffe14d); ugPut(m, d, urr(0, 6)); linearize(m); UG.stones.push({ i, m, pos: m.position.clone() }); }
  for (let i = 0; i < 7; i++) { const d = spot(10, 42, used), m = new THREE.Group(); const l = S(G.cyl6, mat(0x7a5a32), 0.06, 1.1, 0.06, 0, 0.1, 0); l.rotation.z = Math.PI / 2; m.add(l); m.add(S(G.cyl6, mat(0x7a5a32), 0.04, 0.4, 0.04, 0.2, 0.2, 0.05).rotateZ(-0.6)); addGlow(m, 0xffe14d); ugPut(m, d, urr(0, 6)); linearize(m); UG.sticks.push({ i, m, pos: m.position.clone() }); }
  for (let i = 0; i < 24; i++) { const d = spot(14, 95, used), m = makeShellMesh(i); addGlow(m, 0xff9ad0); ugPut(m, d, urr(0, 6)); linearize(m); UG.shells.push({ i, m, pos: m.position.clone() }); }
  // cavemen wandering around the temple
  for (let i = 0; i < 6; i++) {
    const d = spot(8, 26, used), m = makeCaveman({}); linearize(m); ugScene.add(m);
    UG.men.push({ mesh: m, pos: d.clone().multiplyScalar(R + TH(d)), up: d.clone(), fwd: tangentToward(d, randDir()), vel: new V3(), vr: 0, grounded: true, timer: rr(1, 3), walk: rr(0, 6), scare: 0, talkT: rr(2, 8) });
  }
  // the crazy circus tiger
  { const m = makeTiger(); linearize(m); ugScene.add(m); const d = ugL(20, 10);
    UG.tiger = { mesh: m, pos: d.clone().multiplyScalar(R + TH(d)), up: d.clone(), fwd: tangentToward(d, randDir()), vel: new V3(), vr: 0, grounded: true, timer: 1, walk: 0, run: 0, tired: 0, burst: 0, burstCool: 0, roarT: 3, leash: false, caged: false };
    const rope = S(G.cyl6, mat(0x5a8a2a), 0.035, 1, 0.035); rope.visible = false; ugScene.add(rope); UG.rope = rope; linearize(rope); }
  // pterodactyls circling high above
  for (let i = 0; i < 3; i++) { const p = makePtero(); linearize(p); ugScene.add(p); UG.ptero.push({ m: p, a: i * 2.1, r: rr(18, 34), h: rr(26, 36), sp: rr(0.12, 0.2) }); }
  linearize(ugScene);
  refreshStoneItems();
}
function addGlow(g, col) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.scale.setScalar(1.4); s.position.y = 0.5; g.add(s); g.userData.glow = s; }
function makeSign(text) { const g = new THREE.Group(); g.add(S(G.cyl6, mat(0x6b4426), 0.07, 1.4, 0.07, 0, 0.7, 0)); g.add(mesh(new THREE.PlaneGeometry(1.5, 0.45), new THREE.MeshBasicMaterial({ map: labelTex(text, '#6b4426', '#fff6e0', 384, 112), side: THREE.DoubleSide }), 0, 1.35, 0.05)); return g; }
function makeFlames(s) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) { const f = S(G.cone, new THREE.MeshBasicMaterial({ color: [0xff5a1a, 0xffa31a, 0xffe14d][i], transparent: true, opacity: 0.9 }), (0.45 - i * 0.12) * s, (1.1 - i * 0.25) * s, (0.45 - i * 0.12) * s, 0, (0.55 - i * 0.12) * s, 0); g.add(f); }
  UG.fires.push(g); return g;
}
function makeFishMesh() {
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: 0x8ab8d8, roughness: 0.4, metalness: 0.3 }); m.color.convertSRGBToLinear(); m.userData.lin = true;
  g.add(S(G.sph, m, 0.16, 0.13, 0.4, 0, 0, 0)); g.add(S(G.cone, m, 0.14, 0.22, 0.05, 0, 0, -0.46).rotateX(-Math.PI / 2));
  g.add(S(G.sph, bmat(0x101010), 0.03, 0.03, 0.03, 0.1, 0.04, 0.27)); g.add(S(G.sph, bmat(0x101010), 0.03, 0.03, 0.03, -0.1, 0.04, 0.27));
  g.userData.mat = m; return g;
}
function fishColor(m, k, burnt) { const c = new THREE.Color(0x8ab8d8).lerp(new THREE.Color(0xc87a2a), k); if (burnt) c.setHex(0x1a1410); m.userData.mat.color.copy(c).convertSRGBToLinear(); }
function makeShellMesh(i) {
  const g = new THREE.Group(), col = [0xffc0d0, 0xfff0e0, 0xffd0a0, 0xf0b0ff][i % 4], m = mat(col, { roughness: 0.4 });
  const fan = S(G.dome, m, 0.42, 0.16, 0.36, 0, 0.05, 0); g.add(fan);
  for (let k = 0; k < 5; k++) { const a = -0.9 + k * 0.45; const r = S(G.box, mat(0xd89aa8), 0.03, 0.05, 0.36, Math.sin(a) * 0.18, 0.15, Math.cos(a) * 0.12); r.rotation.y = a; g.add(r); }
  g.add(S(G.box, m, 0.2, 0.08, 0.12, 0, 0.05, -0.36));
  return g;
}
function makeCaveman(o) {
  const g = new THREE.Group(), skin = mat(pick([0xe0b080, 0xc89060, 0xa8754f])), fur = mat(o.poor ? 0x7a6a5a : o.king ? 0xe8a03a : pick([0x8a5a2b, 0xa06a3a, 0x7a4a22])), hair = mat(pick([0x2a1a10, 0x4a2a14, 0x1a1a1a]));
  const body = new THREE.Group(); g.add(body);
  body.add(S(G.cyl, fur, 0.42, 0.85, 0.46, 0, 0.98, 0));
  if (!o.poor) for (let i = 0; i < 6; i++) body.add(S(G.sph, mat(o.king ? 0x2a1a10 : 0x5a3a1a), 0.08, 0.08, 0.04, Math.sin(i * 2.1) * 0.3, 0.8 + (i % 3) * 0.2, 0.42));
  else for (let i = 0; i < 4; i++) body.add(S(G.box, mat(0x5a4a3a), 0.16, 0.16, 0.04, rr(-0.25, 0.25), rr(0.7, 1.2), 0.44));
  body.add(S(G.cyl, skin, 0.1, 0.4, 0.1, 0.3, 1.25, 0.05).rotateZ(-0.5)); body.add(S(G.cyl, skin, 0.1, 0.4, 0.1, -0.3, 1.25, 0.05).rotateZ(0.5));
  body.add(S(G.sph, skin, 0.32, 0.32, 0.32, 0, 1.72, 0));
  body.add(S(G.sph, skin, 0.08, 0.06, 0.06, 0, 1.68, 0.31));
  body.add(S(G.box, hair, 0.5, 0.06, 0.08, 0, 1.86, 0.27));
  body.add(S(G.sph, bmat(0x111111), 0.05, 0.05, 0.03, 0.11, 1.78, 0.29)); body.add(S(G.sph, bmat(0x111111), 0.05, 0.05, 0.03, -0.11, 1.78, 0.29));
  body.add(S(G.ico1, hair, 0.38, 0.22, 0.38, 0, 1.95, -0.04)); body.add(S(G.ico1, hair, 0.18, 0.16, 0.08, 0, 1.53, 0.27));
  const lL = new THREE.Group(), lR = new THREE.Group(); lL.position.set(0.15, 0.58, 0); lR.position.set(-0.15, 0.58, 0);
  lL.add(S(G.cyl, skin, 0.1, 0.58, 0.1, 0, -0.29, 0)); lR.add(S(G.cyl, skin, 0.1, 0.58, 0.1, 0, -0.29, 0)); body.add(lL, lR);
  if (o.king) { const c = makeStoneCrown(); c.position.set(0, 2.02, 0); c.scale.setScalar(0.9); body.add(c); g.userData.crown = c;
    const club = S(G.cyl6, mat(0x6b4426), 0.07, 1.1, 0.12, 0.55, 1.1, 0.2); club.rotation.z = -0.3; body.add(club); body.add(S(G.sph, mat(0x6b4426), 0.16, 0.22, 0.16, 0.72, 1.6, 0.2)); }
  else if (!o.poor && rnd() < 0.6) { const club = S(G.cyl6, mat(0x6b4426), 0.06, 0.9, 0.1, 0.5, 0.9, 0.15); club.rotation.z = -0.4; body.add(club); }
  g.userData.legs = [lL, lR]; g.userData.body = body; return g;
}
function makeStoneCrown() {
  const g = new THREE.Group(), gold = mat(0xffd23a, { metalness: 0.75, roughness: 0.25 });
  g.add(mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.22, 16, 1, true), Object.assign(gold.clone(), { side: THREE.DoubleSide }), 0, 0.11, 0));
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; g.add(S(G.cone, gold, 0.07, 0.24, 0.07, Math.sin(a) * 0.32, 0.32, Math.cos(a) * 0.32)); g.add(S(G.sph, mat([0xe8262e, 0x3a7bff, 0x3ad65a][i % 3], { roughness: 0.2, metalness: 0.2 }), 0.05, 0.05, 0.05, Math.sin(a) * 0.335, 0.12, Math.cos(a) * 0.335)); }
  const tooth = S(G.cone, mat(0xfff8e8), 0.07, 0.3, 0.07, 0, 0.42, 0.33); g.add(tooth);
  return g;
}
function makeTiger() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const org = mat(0xff8a1a), wh = mat(0xfff4e0), blk = mat(0x1a1410);
  body.add(S(G.sph, org, 0.5, 0.48, 1.05, 0, 0.95, 0));
  for (let i = 0; i < 6; i++) { body.add(S(G.box, blk, 0.92, 0.08, 0.1, 0, 1.25, -0.7 + i * 0.28)); body.add(S(G.box, blk, 0.08, 0.5, 0.1, 0.5, 0.95, -0.7 + i * 0.28)); body.add(S(G.box, blk, 0.08, 0.5, 0.1, -0.5, 0.95, -0.7 + i * 0.28)); }
  const head = new THREE.Group(); head.position.set(0, 1.35, 1.0); body.add(head);
  head.add(S(G.sph, org, 0.42, 0.38, 0.4, 0, 0, 0)); head.add(S(G.sph, wh, 0.24, 0.17, 0.2, 0, -0.1, 0.3)); head.add(S(G.sph, mat(0xff6a8a), 0.07, 0.05, 0.05, 0, -0.02, 0.48));
  for (const x of [-0.15, 0.15]) { head.add(S(G.sph, mat(0xfff8a0), 0.08, 0.09, 0.05, x, 0.1, 0.33)); head.add(S(G.sph, blk, 0.03, 0.08, 0.03, x, 0.1, 0.37)); head.add(S(G.cone, org, 0.12, 0.18, 0.08, x * 2, 0.36, -0.02)); }
  for (let i = 0; i < 3; i++) head.add(S(G.box, blk, 0.04, 0.12, 0.04, -0.12 + i * 0.12, 0.3, 0.3));
  // circus hat and collar with a bell
  head.add(S(G.cone, mat(0xe8262e), 0.15, 0.4, 0.15, 0.12, 0.52, 0).rotateZ(-0.3)); head.add(S(G.sph, mat(0xffd23a), 0.07, 0.07, 0.07, 0.2, 0.72, 0));
  body.add(mesh(new THREE.TorusGeometry(0.32, 0.05, 6, 16), mat(0x3a7bff), 0, 1.25, 0.82)); body.add(S(G.sph, mat(0xffd23a, { metalness: 0.7 }), 0.08, 0.08, 0.08, 0, 1.0, 1.0));
  const legs = [];
  for (const [x, z] of [[0.3, 0.6], [-0.3, 0.6], [0.3, -0.6], [-0.3, -0.6]]) { const p = new THREE.Group(); p.position.set(x, 0.7, z); p.add(S(G.cyl, org, 0.13, 0.7, 0.13, 0, -0.35, 0)); p.add(S(G.sph, wh, 0.14, 0.08, 0.17, 0, -0.68, 0.04)); body.add(p); legs.push(p); }
  const tail = new THREE.Group(); tail.position.set(0, 1.1, -1.0); body.add(tail);
  for (let i = 0; i < 5; i++) tail.add(S(G.sph, i % 2 ? blk : org, 0.08, 0.08, 0.12, 0, i * 0.12, -i * 0.12));
  g.userData = { body, legs, head, tail }; return g;
}
function makePtero() {
  const g = new THREE.Group(), m = mat(0x8a5a6a), wl = new THREE.Group(), wr = new THREE.Group();
  g.add(S(G.sph, m, 0.3, 0.3, 1, 0, 0, 0)); g.add(S(G.cone, m, 0.15, 0.9, 0.15, 0, 0.1, 1.2).rotateX(Math.PI / 2)); g.add(S(G.cone, m, 0.1, 0.6, 0.1, 0, 0.35, 0.7).rotateX(-0.6));
  wl.add(S(G.box, mat(0xb07a8a), 2.6, 0.05, 1, 1.3, 0, 0)); wr.add(S(G.box, mat(0xb07a8a), 2.6, 0.05, 1, -1.3, 0, 0)); g.add(wl, wr);
  g.userData = { wl, wr }; return g;
}

// ---------- what you carry ----------
let ugHeld = null, ugHeldKind = '';
function ugHold(kind) {
  const hand = player.mesh.userData.parts.handL;
  if (ugHeld && ugHeldKind !== kind) { hand.remove(ugHeld); ugHeld = null; ugHeldKind = ''; }
  if (!kind || ugHeld) return;
  if (kind === 'crown') { ugHeld = makeStoneCrown(); ugHeld.scale.setScalar(0.6); ugHeld.position.set(0, -0.2, 0.15); }
  else { ugHeld = makeFishMesh(); ugHeld.position.set(0, -0.12, 0.2); fishColor(ugHeld, kind === 'cooked' ? 1 : 0); }
  hand.add(ugHeld); linearize(ugHeld); ugHeldKind = kind;
}
function refreshHeld() { ugHold(Q11.stage === 'crown' ? 'crown' : mode === 'stone' && Q11.stage === 'fish' && Q11.fish !== 'none' && !(UG.fire && UG.fire.cooking) ? Q11.fish : ''); }
function refreshStoneItems() {
  if (!UG.built) return;
  const fish = Q11.stage === 'fish';
  for (const it of UG.stones) it.m.visible = fish && !Q11.stones.includes(it.i) && Q11.stones.length < 5 && !Q11.fire;
  for (const it of UG.sticks) it.m.visible = fish && !Q11.sticks.includes(it.i) && Q11.sticks.length < 5 && !Q11.fire;
  for (const it of UG.shells) it.m.visible = Q11.stage === 'shells' && !Q11.shells.includes(it.i) && Q11.shells.length < 20;
  UG.gugasNeck.visible = ['king2', 'tiger', 'king3', 'crown', 'done'].includes(Q11.stage);
  UG.kingM.userData.crown.visible = !['crown', 'done'].includes(Q11.stage);
  const caged = ['king3', 'crown', 'done'].includes(Q11.stage), tg = UG.tiger;
  tg.caged = caged; if (caged) { tg.leash = false; tg.pos.copy(UG.cage.pos).addScaledVector(UG.cage.d, 1.0); tg.up.copy(UG.cage.d); tg.fwd.copy(tangentToward(UG.cage.d, UG_D0)); UG.cage.door.rotation.y = 0; }
  refreshFire(); refreshHeld();
}
function refreshFire() {
  const f = UG.fire; if (!f) return;
  f.ring.visible = Q11.fire; f.fl.visible = Q11.fire; f.light.visible = Q11.fire; f.spit.visible = f.cooking;
}

// ---------- travelling through time ----------
function enterStone() {
  if (transitioning) return; transitioning = true; hideCard(); dropAll();
  [1047, 784, 659, 523, 392, 262, 196].forEach((f, i) => tone(f, 0.5, { type: 'sine', vol: 0.06, when: i * 0.12 }));
  toast('Laiko mašina ūžia…', 'Skrendi atgal laiku – 100 000 metų!', '#ff9a3a');
  fadeTo(() => {
    transitioning = false; buildStoneWorld(); mode = 'stone'; ugScene.add(player.mesh); musicSet(5); setScope(false);
    const d = ugL(0, 2.5); player.pos.copy(d).multiplyScalar(R + TH(d) + 0.2); player.up.copy(d); player.fwd.copy(tangentToward(d, ugL(0, -28))); player.vel.set(0, 0, 0); player.vr = 0; player.pitch = 0.3;
    camera.position.copy(player.pos).addScaledVector(d, 3).addScaledVector(player.fwd, -6); camera.up.copy(d);
    $('bName').textContent = 'Urvinių laikai'; $('bEn').textContent = 'Prieš 100 000 metų'; $('bAtm').textContent = 'Tas pats pasaulis, bet visur – tik džiunglės. Danguje sklando pterodaktiliai.'; document.documentElement.style.setProperty('--biome', '#ff9a3a');
    refreshStoneItems();
    toast('Prieš 100 000 metų…', Q11.stage === 'go' ? 'Visas pasaulis – vien džiunglės. Šventykloje laukia urvinių karalius!' : 'Urvinių laikai', '#ff9a3a');
  });
}
function leaveStone() {
  if (transitioning) return; transitioning = true; hideCard(); endFishing(); if (UG.tiger.leash) { UG.tiger.leash = false; UG.rope.visible = false; }
  [196, 262, 392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.5, { type: 'sine', vol: 0.06, when: i * 0.12 }));
  fadeTo(() => {
    transitioning = false; mode = 'sanctum'; sanc.add(player.mesh); musicSet(7); chicksEnterSanctum(); q5EnterSanctum(); q7EnterSanctum(); refreshSanctumFriends();
    player.pos.set(-10.5, 0, -7.5); player.up.set(0, 1, 0); player.fwd.set(0.6, 0, 0.8).normalize(); player.vel.set(0, 0, 0); player.vr = 0;
    camera.position.set(-14, 4, -13); camera.up.set(0, 1, 0); setBiomeHud(7); refreshHeld();
    toast('Grįžai į savo laikus', Q11.stage === 'crown' ? 'Nunešk karaliaus karūną į muziejų!' : 'Kūrėjo Salė', '#ffe98a');
  });
}

// ---------- walking on the stone-age planet ----------
const _ugd = new V3(), _ugh = new V3();
function stepStone(e, dt, rad) {
  e.pos.addScaledVector(e.vel, dt);
  let r = e.pos.length(); _ugd.copy(e.pos).divideScalar(r);
  e.vr -= GRAV * dt; r += e.vr * dt;
  let g = R + Math.max(TH(_ugd), WATER_FLOOR);
  for (const s of UG.solids) {
    if (s.dir.dot(_ugd) < 0.985) continue;
    _ugh.copy(_ugd).multiplyScalar(r).sub(s.p); _ugh.addScaledVector(s.up, -_ugh.dot(s.up));
    if (s.type === 'box') {
      const lx = _ugh.dot(s.ax), lz = _ugh.dot(s.az), alx = Math.abs(lx), alz = Math.abs(lz);
      if (r >= s.top - 0.45) { if (alx < s.hx + rad * 0.8 && alz < s.hz + rad * 0.8 && s.top > g) g = s.top; }
      else if (alx < s.hx + rad && alz < s.hz + rad) { const ex = s.hx + rad - alx, ez = s.hz + rad - alz; _ugd.multiplyScalar(r); if (ex < ez) _ugd.addScaledVector(s.ax, lx < 0 ? -ex : ex); else _ugd.addScaledVector(s.az, lz < 0 ? -ez : ez); r = _ugd.length(); _ugd.divideScalar(r); }
      continue;
    }
    const dist = _ugh.length();
    if (r >= s.top - 0.45) { if (dist < s.r && s.top > g) g = s.top; }
    else if (dist < s.r + rad && dist > 1e-4) { _ugd.multiplyScalar(r).addScaledVector(_ugh, (s.r + rad - dist) / dist); r = _ugd.length(); _ugd.divideScalar(r); }
  }
  if (r <= g || (e.grounded && e.vr <= 0 && r - g < 0.4)) { r = g; if (e.vr < 0) e.vr = 0; e.grounded = true; } else e.grounded = false;
  e.pos.copy(_ugd).multiplyScalar(r); e.vel.addScaledVector(_ugd, -e.vel.dot(_ugd));
  e.fwd.addScaledVector(_ugd, -e.fwd.dot(_ugd)).normalize(); e.up.copy(_ugd); e.ground = g;
}
let fishing = null;
function updateStone(dt, t) {
  const frozen = player.down || !!fishing;
  const f = frozen ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = frozen ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, player.up); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 12 : 7; _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, player.grounded ? Math.min(1, 12 * dt) : Math.min(1, 2.5 * dt));
  if (!frozen && keys.Space && player.grounded) { player.vr = 9; player.grounded = false; sfx.jump(); }
  const g0 = player.grounded, vr0 = player.vr;
  stepStone(player, dt, 0.35);
  if (!g0 && player.grounded) fallCheck(vr0, player.ground - R < WATER_FLOOR + 0.05);
  player.mesh.position.copy(player.pos); orient(player.mesh, player.up, player.fwd);
  if (player.down) downPose(dt, t); else animateMan(dt, f !== 0 || s !== 0, sp);
  // camera
  { const dist = 6.2, pitch = player.pitch, up = player.up;
    _ct.copy(player.pos).addScaledVector(up, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
    const cr = _ct.length(), cd = _ct.clone().divideScalar(cr), minR = R + Math.max(TH(cd), WATER_FLOOR) + 0.6; if (cr < minR) _ct.copy(cd).multiplyScalar(minR);
    camera.position.lerp(_ct, Math.min(1, dt * 10)); camera.up.lerp(up, Math.min(1, dt * 8)).normalize(); camera.lookAt(player.pos.clone().addScaledVector(up, 1.5)); applyShake(dt); }
  ugSun.position.copy(player.pos).normalize().multiplyScalar(150).add(new V3(50, 0, 40));
  // world life
  for (const fl of UG.fires) fl.children.forEach((c, i) => { c.scale.y = (1.1 - i * 0.25) * (fl === UG.fire.fl ? 1 : 0.5) * (0.85 + 0.25 * Math.sin(t * 13 + i * 2)); });
  for (const p of UG.ptero) { p.a += p.sp * dt; const pos = new V3(Math.cos(p.a) * p.r, R + 30 + p.h * 0.2, Math.sin(p.a) * p.r); p.m.position.copy(pos); orient(p.m, pos.clone().normalize(), new V3(-Math.sin(p.a), 0, Math.cos(p.a))); const fl = Math.sin(t * 5 + p.a * 3) * 0.5; p.m.userData.wl.rotation.z = fl; p.m.userData.wr.rotation.z = -fl; }
  for (const arr of [UG.stones, UG.sticks, UG.shells]) for (const it of arr) if (it.m.visible) { it.m.userData.glow.material.opacity = 0.55 + 0.35 * Math.sin(t * 4 + it.i); }
  UG.kingM.userData.body.rotation.y = Math.sin(t * 0.7) * 0.15;
  updateCavemen(dt, t); updateCaveGuard(dt, t); updateTiger(dt, t); updateFishing(dt, t); updateCooking(dt, t);
  // picking things up by walking over them
  if (Q11.stage === 'fish' && !Q11.fire) {
    for (const it of UG.stones) if (it.m.visible && it.pos.distanceTo(player.pos) < 1.7) { Q11.stones.push(it.i); saveQ11(); refreshStoneItems(); tone(520, 0.1, { type: 'triangle', vol: 0.06 }); toast(`Akmuo! (${Q11.stones.length} / 5)`, Q11.stones.length >= 5 ? 'Akmenų užteks laužui' : 'Rink toliau', '#ffe14d'); }
    for (const it of UG.sticks) if (it.m.visible && it.pos.distanceTo(player.pos) < 1.7) { Q11.sticks.push(it.i); saveQ11(); refreshStoneItems(); tone(620, 0.1, { type: 'triangle', vol: 0.06 }); toast(`Pagaliukas! (${Q11.sticks.length} / 5)`, Q11.sticks.length >= 5 ? 'Pagaliukų užteks laužui' : 'Rink toliau', '#ffe14d'); }
  }
  if (Q11.stage === 'shells') for (const it of UG.shells) if (it.m.visible && it.pos.distanceTo(player.pos) < 1.8) {
    Q11.shells.push(it.i); saveQ11(); refreshStoneItems(); [880, 1175].forEach((fq, k) => tone(fq, 0.12, { type: 'triangle', vol: 0.05, when: k * 0.06 }));
    toast(`Kriauklė! (${Q11.shells.length} / 20)`, Q11.shells.length >= 20 ? 'Užtenka! Nunešk jas vargšui Gugui' : 'Ieškok rožinio švytėjimo', '#ff9ad0');
  }
  // prompts
  let txt = '';
  if (!card) {
    const nk = UG.kingPos.distanceTo(player.pos) < 4.2, ng = UG.gugasPos.distanceTo(player.pos) < 3.2, ntm = UG.tm.position.distanceTo(player.pos) < 4;
    if (fishing) txt = fishing.state === 'bite' ? '<b>KIMBA! Spausk <kbd>E</kbd>!</b>' : 'Žvejoji… lauk, kol kibs (nespausk per anksti)';
    else if (UG.fire.cooking) txt = UG.fire.pos.distanceTo(player.pos) < 4 ? cookPromptTxt() : '';
    if (!txt && CS.fight) txt = caveFightHud();
    if (!txt && nearGuard()) txt = '<kbd>E</kbd> kalbėtis su sargybiniu Bumbu';
    if (!txt) {
      if (nk) txt = '<kbd>E</kbd> kalbėtis su karaliumi Ugabugu';
      else if (ng) txt = '<kbd>E</kbd> kalbėtis su vargšu Gugu';
      else if (ntm) txt = '<kbd>E</kbd> keliauti namo – į savo laikus';
      else if (Q11.stage === 'tiger' && !UG.tiger.leash && UG.tiger.pos.distanceTo(player.pos) < 3.2) txt = '<kbd>E</kbd> mesti lianą – pagauti tigrą!';
      else if (Q11.stage === 'fish' && Q11.fish === 'none' && UG.dockPos.distanceTo(player.pos) < 2.6) txt = '<kbd>E</kbd> žvejoti';
      else if (Q11.stage === 'fish' && UG.fire.pos.distanceTo(player.pos) < 3) txt = fireHintTxt();
    }
  }
  setPrompt(txt);
  updateQuestHud();
}
function fireHintTxt() {
  if (!Q11.fire && (Q11.stones.length < 5 || Q11.sticks.length < 5)) return `Laužui reikia 5 akmenų ir 5 pagaliukų (${Q11.stones.length}/5 · ${Q11.sticks.length}/5)`;
  if (!Q11.fire) return '<kbd>E</kbd> sukurti laužą';
  if (Q11.fish === 'raw') return '<kbd>E</kbd> kepti žuvį';
  if (Q11.fish === 'none') return 'Laužas dega. Dabar sužvejok žuvį ežerėlyje';
  return '';
}
function cookPromptTxt() {
  const c = UG.fire, pct = Math.round(c.t / 10 * 100);
  if (!c.flipped && c.t > 4.5) return `<b>APVERSK ŽUVĮ! Spausk <kbd>E</kbd>!</b> · ${pct}%`;
  return `Žuvis kepa… ${pct}%${c.flipped ? ' · apversta' : ' · pasiruošk apversti'}`;
}
function stoneAction() {
  if (card) { if (card.kind === 'talk') advanceTalk(); else hideCard(); return; }
  if (fishing) { fishBite(); return; }
  if (UG.fire.cooking && UG.fire.pos.distanceTo(player.pos) < 4) { flipFish(); return; }
  if (CS.fight) return;
  if (nearGuard()) { talkGuard(); return; }
  if (UG.kingPos.distanceTo(player.pos) < 4.2) { talkKing(); return; }
  if (UG.gugasPos.distanceTo(player.pos) < 3.2) { talkGugas(); return; }
  if (UG.tm.position.distanceTo(player.pos) < 4) { leaveStone(); return; }
  if (Q11.stage === 'tiger' && !UG.tiger.leash && UG.tiger.pos.distanceTo(player.pos) < 3.2) { catchTiger(); return; }
  if (Q11.stage === 'fish' && Q11.fish === 'none' && UG.dockPos.distanceTo(player.pos) < 2.6) { startFishing(); return; }
  if (Q11.stage === 'fish' && UG.fire.pos.distanceTo(player.pos) < 3) { fireAction(); return; }
}

// ---------- the king and his poor friend ----------
const KING = 'Karalius Ugabugas', KC = '#ff9a3a';
function talkKing() {
  const st = Q11.stage;
  if (st === 'go') {
    startTalk(KING, ['UGA! Žalias žmogelis iš ateities! Kūrėjas man sapne sakė, kad ateisi.', 'Aš – Ugabugas, visų džiunglių karalius. Man reikia padėjėjo. Bet padėjėju tampa tik tas, kuris įveikia TRIS iš tiesų sunkias užduotis.', 'Pirma užduotis: noriu keptos žuvies! Surink 5 akmenis ir 5 pagaliukus laužui, sužvejok žuvį ežerėlyje ir iškepk ją ant laužo. Tik nesudegink!'], KC, () => {
      Q11.stage = 'fish'; saveQ11(); refreshStoneItems(); sfx.chime(); toast('1 užduotis: kepta žuvis', 'Surink 5 akmenis ir 5 pagaliukus (geltonai švyti), sužvejok ir iškepk žuvį', KC);
    });
    return;
  }
  if (st === 'fish') {
    if (Q11.fish === 'cooked') {
      startTalk(KING, ['Mmm… KEPTA ŽUVIS! Uga uga! Niekas niekada man nėra iškepęs tokios gardžios žuvies!', 'Antra užduotis: mano draugas Gugas labai vargšas. Jis neturi nė vienos kriauklės, o kriauklės pas mus – kaip pinigai.', 'Surask jam 20 kriauklių. Jos išmėtytos po džiungles ir švyti rožiškai. Tada nunešk jas Gugui – jo trobelė prie šventyklos.'], KC, () => {
        Q11.fish = 'eaten'; Q11.stage = 'shells'; saveQ11(); refreshStoneItems(); sfx.chime(); toast('2 užduotis: 20 kriauklių', 'Kriauklės švyti rožiškai – rodyklė rodo artimiausią', '#ff9ad0');
      });
    } else startTalk(KING, [Q11.fish === 'raw' ? 'Žalia žuvis? Fui! Iškepk ją ant laužo. Ir neužmiršk apversti!' : 'Mano pilvas burzgia… Kur mano kepta žuvis? Akmenys, pagaliukai, žvejyba, laužas!'], KC);
    return;
  }
  if (st === 'shells') { startTalk(KING, [Q11.shells.length >= 20 ? 'Turi 20 kriauklių? Nešk jas Gugui, ne man!' : `Tik ${Q11.shells.length} kriauklės? Gugui reikia dvidešimties!`], KC); return; }
  if (st === 'king2') {
    startTalk(KING, ['Gugas laimingas – ir aš laimingas. Bet dabar – pati sunkiausia užduotis.', 'Kartą iš dangaus skylės iškrito keistas dryžuotas žvėris su kepuraite. Sako – CIRKO TIGRAS. Jis išprotėjo ir laksto po visas džiungles, gąsdina mano žmones!', 'Pagauk jį lianos virve ir uždaryk į narvą prie šventyklos. Jis labai greitas – bėk su Shift ir gaudyk, kai jis pavargsta!'], KC, () => {
      Q11.stage = 'tiger'; saveQ11(); refreshStoneItems(); sfx.chime(); toast('3 užduotis: išprotėjęs cirko tigras', 'Prisivyk tigrą (Shift – bėgti) ir spausk E, kai būsi arti', '#ffb03a');
    });
    return;
  }
  if (st === 'tiger') { startTalk(KING, [UG.tiger.leash ? 'Pagavai! Dabar vesk jį į narvą – jis prie šventyklos, dešinėje.' : 'Tigras vis dar laksto! Jis greitas, bet greitai pavargsta. Tada ir gaudyk!'], KC); return; }
  if (st === 'king3') {
    startTalk(KING, ['Tigras narve! UGA UGA UGA! Tu – tikras herojus!', 'Įveikei visas tris užduotis. Nuo šiol tu – urvinių karaliaus padėjėjas!', 'Imk mano karūną. Nunešk ją į savo laikus, kad visi prisimintų Ugabugą.'], KC, () => {
      Q11.stage = 'crown'; saveQ11(); refreshStoneItems(); [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
      toast('Gavai karaliaus karūną!', 'Grįžk laiko mašina ir nunešk karūną į muziejų', '#ffd23a');
    });
    return;
  }
  startTalk(KING, [pick(['Ugabugas niekada nepamirš savo padėjėjo! Uga!', 'Kai ateisi vėl – iškepsim žuvies. Šįkart kepsiu aš!', 'Tigras narve sako „rrr“. Bet jau linksmai.'])], KC);
}
function talkGugas() {
  if (Q11.stage === 'shells' && Q11.shells.length >= 20) {
    startTalk('Vargšas Gugas', ['Dvidešimt kriauklių?! Man?! Dabar aš turtingiausias urvinis visose džiunglėse!', 'Nusipirksiu tris bananus ir akmeninį kirvį! O iš likusių pasidarysiu karolius.', 'Eik pas karalių – jis turi tau dar vieną užduotį. Pačią sunkiausią…'], '#ff9ad0', () => {
      Q11.stage = 'king2'; saveQ11(); refreshStoneItems(); [659, 784, 988, 1319].forEach((f, k) => tone(f, 0.3, { type: 'triangle', vol: 0.06, when: k * 0.08 }));
      toast('Gugas turtingas!', 'Grįžk pas karalių Ugabugą', KC);
    });
    return;
  }
  if (['king2', 'tiger', 'king3', 'crown', 'done'].includes(Q11.stage)) { startTalk('Gugas', [pick(['Žiūrėk, kokie mano kriauklių karoliai! Gražūs?', 'Ačiū tau! Dabar aš turtingas urvinis!', 'Vakar nusipirkau bananą. Skanus!'])], '#ff9ad0'); return; }
  startTalk('Vargšas Gugas', ['Ech… Aš toks vargšas. Neturiu nė vienos kriauklės. Net bananui nusipirkti…'], '#ff9ad0');
}

// ---------- mission 1: fishing and cooking ----------
function startFishing() {
  fishing = { state: 'wait', t: rr(2.5, 5), misses: 0 };
  player.fwd.copy(tangentToward(player.up, UG.pondC));
  const rod = new THREE.Group(); const r = S(G.cyl6, mat(0x7a5a32), 0.03, 2.2, 0.03, 0, 1.0, 0.2); r.rotation.x = 0.9; rod.add(r); player.mesh.userData.parts.handR.add(rod); linearize(rod); fishing.rod = rod;
  const bob = new THREE.Group(); bob.add(S(G.sph, mat(0xe8262e), 0.12, 0.12, 0.12, 0, 0.06, 0)); bob.add(S(G.sph, mat(0xffffff), 0.1, 0.06, 0.1, 0, 0.14, 0)); linearize(bob); ugScene.add(bob); fishing.bob = bob;
  fishing.bobBase = UG.pondC.clone().lerp(UG.dockPos, 0.42).addScaledVector(UG.pondC.clone().normalize(), 0.12);
  const line = S(G.cyl6, bmat(0xffffff), 0.008, 1, 0.008); ugScene.add(line); fishing.line = line;
  sfx.blip(); toast('Žvejoji!', 'Kai plūdė panirs – greitai spausk E. Per anksti – žuvis išsigąs!', '#6fc4ff');
}
function endFishing() { if (!fishing) return; fishing.rod.parent && fishing.rod.parent.remove(fishing.rod); ugScene.remove(fishing.bob); ugScene.remove(fishing.line); fishing = null; }
function updateFishing(dt, t) {
  if (!fishing) return;
  const F = fishing, up = UG.pondC.clone().normalize();
  F.t -= dt;
  let dip = Math.sin(t * 2.5) * 0.03;
  if (F.state === 'wait') { if (F.t < 1.2 && F.t > 0) dip += Math.sin(t * 30) * 0.03 * (1.2 - F.t); if (F.t <= 0) { F.state = 'bite'; F.t = 0.75; noiseHit(0.15, { f: 900, vol: 0.12 }); tone(300, 0.15, { to: 180, type: 'sine', vol: 0.06 }); } }
  else if (F.state === 'bite') { dip = -0.22 + Math.sin(t * 40) * 0.05; if (F.t <= 0) { F.misses++; F.state = 'wait'; F.t = rr(2.5, 5.5); toast('Žuvis nuplaukė…', 'Buvai per lėtas. Lauk kitos – ir spausk E vos tik plūdė panirs!', '#6fc4ff'); } }
  F.bob.position.copy(F.bobBase).addScaledVector(up, dip);
  const tip = new V3(); F.rod.children[0].localToWorld(tip.set(0, 0.5, 0)); const dv = F.bob.position.clone().sub(tip), len = dv.length();
  F.line.position.copy(tip).addScaledVector(dv, 0.5); F.line.quaternion.setFromUnitVectors(UP, dv.normalize()); F.line.scale.set(0.008, len, 0.008);
  if (player.pos.distanceTo(UG.dockPos) > 3.5) endFishing();
}
function fishBite() {
  const F = fishing;
  if (F.state === 'bite') {
    endFishing(); Q11.fish = 'raw'; saveQ11(); refreshHeld();
    [523, 784, 1047].forEach((f, k) => tone(f, 0.2, { type: 'triangle', vol: 0.07, when: k * 0.07 })); noiseHit(0.2, { f: 1500, vol: 0.1 });
    toast('Pagavai žuvį!', Q11.fire ? 'Dabar iškepk ją ant laužo' : (Q11.stones.length < 5 || Q11.sticks.length < 5) ? 'Dar surink akmenis ir pagaliukus laužui' : 'Sukurk laužą laužavietėje ir iškepk ją', '#6fc4ff');
    return;
  }
  F.state = 'wait'; F.t = rr(3.5, 6); tone(200, 0.2, { type: 'square', vol: 0.04, lp: 1000 });
  toast('Per anksti!', 'Žuvis išsigando ir nuplaukė. Lauk, kol plūdė tikrai panirs', '#ff6b6b');
}
function fireAction() {
  if (!Q11.fire) {
    if (Q11.stones.length < 5 || Q11.sticks.length < 5) { toast('Dar trūksta', `Akmenys ${Q11.stones.length}/5 · pagaliukai ${Q11.sticks.length}/5`, '#ffe14d'); return; }
    Q11.fire = true; saveQ11(); refreshStoneItems(); noiseHit(0.5, { ft: 'bandpass', f: 600, fto: 2000, vol: 0.15 }); sfx.magic();
    toast('Laužas dega!', Q11.fish === 'raw' ? 'Dabar kepk žuvį (E)' : 'Dabar sužvejok žuvį ežerėlyje', '#ff8a3a'); return;
  }
  if (Q11.fish === 'raw') {
    const c = UG.fire; c.cooking = true; c.t = 0; c.flipped = false; c.spit.rotation.x = 0; fishColor(c.fishM, 0); refreshFire(); refreshHeld();
    toast('Žuvis kepa!', 'Kai pasakys „APVERSK“ – greitai spausk E. Kitaip sudegs!', '#ff8a3a');
  }
}
function flipFish() {
  const c = UG.fire;
  if (c.flipped) { toast('Jau apversta', 'Palauk, kol iškeps', '#ff8a3a'); return; }
  if (c.t < 4.5) { toast('Dar per anksti apversti', 'Palauk, kol pasakys „APVERSK“', '#ff8a3a'); return; }
  c.flipped = true; tone(660, 0.1, { type: 'triangle', vol: 0.06 }); toast('Apversta!', 'Dar truputį – ir iškeps', '#ff8a3a');
}
function updateCooking(dt, t) {
  const c = UG.fire; if (!c || !c.cooking) return;
  c.t += dt;
  c.spit.rotation.x += ((c.flipped ? Math.PI : 0) - c.spit.rotation.x) * Math.min(1, dt * 8);
  fishColor(c.fishM, Math.min(1, c.t / 10));
  if (!c.flipped && c.t > 6.6) {
    c.cooking = false; fishColor(c.fishM, 1, true); Q11.fish = 'none'; saveQ11();
    setTimeout(() => { c.spit.visible = false; }, 1500);
    noiseHit(0.5, { f: 400, vol: 0.12 }); tone(200, 0.5, { to: 90, type: 'triangle', vol: 0.06 });
    toast('Oi! Žuvis sudegė!', 'Reikia sužvejoti naują žuvį. Kitą kartą apversk laiku!', '#ff6b6b'); return;
  }
  if (c.t >= 10) {
    c.cooking = false; Q11.fish = 'cooked'; saveQ11(); refreshFire(); refreshHeld();
    [523, 659, 784].forEach((f, k) => tone(f, 0.25, { type: 'triangle', vol: 0.07, when: k * 0.08 }));
    toast('Žuvis iškepė!', 'Nunešk ją karaliui Ugabugui', '#ffd23a');
  }
}

// ---------- the cavemen and the crazy tiger ----------
function updateCavemen(dt, t) {
  for (const c of UG.men) {
    c.timer -= dt; c.talkT -= dt; c.scare = Math.max(0, c.scare - dt);
    if (c.timer < 0) { c.timer = rr(2, 5); c.fwd.applyAxisAngle(c.up, rr(-2, 2)); c.stop = rnd() < 0.3; }
    if (c.pos.angleTo(UG.temple.position) * R > 28) c.fwd.copy(tangentToward(c.up, UG.temple.position));
    const tg = UG.tiger; if (!tg.caged && tg.pos.distanceTo(c.pos) < 4 && c.scare <= 0) { c.scare = 3; c.fwd.copy(tangentToward(c.up, c.pos.clone().sub(tg.pos))); if (c.grounded) c.vr = 6; bubbleIn(ugScene, c.pos.clone().addScaledVector(c.up, 0.2), pick(['Aaa! Tigras!', 'Gelbėkit!', 'Uga!!']), 2.4); }
    const sp = c.scare > 0 ? 6 : c.stop ? 0 : 1.6;
    _mv.copy(c.fwd).multiplyScalar(sp); c.vel.lerp(_mv, Math.min(1, dt * 6));
    stepStone(c, dt, 0.35);
    c.mesh.position.copy(c.pos); orient(c.mesh, c.up, c.fwd);
    if (sp > 0) c.walk += dt * sp * 2.2; const sw = sp > 0 ? Math.sin(c.walk) * 0.6 : 0; c.mesh.userData.legs[0].rotation.x = sw; c.mesh.userData.legs[1].rotation.x = -sw;
    if (c.talkT < 0) { c.talkT = rr(6, 14); if (c.pos.distanceTo(player.pos) < 18) bubbleIn(ugScene, c.pos.clone().addScaledVector(c.up, 0.2), pick(['Uga buga!', 'Ugh!', 'Mamutas!', 'Uga?', 'Žalias!', 'Bum bum!']), 2.4); }
  }
}
function catchTiger() {
  const tg = UG.tiger; tg.leash = true; tg.burst = 0; UG.rope.visible = true;
  noiseHit(0.2, { f: 2000, vol: 0.1 }); tone(160, 0.5, { to: 90, type: 'sawtooth', vol: 0.06, lp: 900 });
  bubbleIn(ugScene, tg.pos.clone().addScaledVector(tg.up, 0.4), 'RRRAU!', 2);
  toast('Pagavai tigrą lianos virve!', 'Nuvesk jį į cirko narvą prie šventyklos', '#ffb03a');
}
function updateTiger(dt, t) {
  const tg = UG.tiger, m = tg.mesh;
  if (tg.caged) {
    tg.pos.copy(UG.cage.pos).addScaledVector(UG.cage.d, 1.0); m.position.copy(tg.pos); orient(m, UG.cage.d, tg.fwd.applyAxisAngle(UG.cage.d, dt * 0.4));
    m.userData.tail.rotation.y = Math.sin(t * 2) * 0.4; return;
  }
  const toP = player.pos.clone().sub(tg.pos), dP = toP.length();
  tg.timer -= dt; tg.roarT -= dt; tg.burstCool -= dt;
  let speed = 6;
  if (tg.leash) {
    const target = player.pos.clone().addScaledVector(player.fwd, -2.6), dv = target.sub(tg.pos), dd = dv.length();
    tg.fwd.copy(tangentToward(tg.up, dv.add(tg.pos))); speed = dd > 1 ? Math.min(13, dd * 3) : 0;
    if (dd > 14) { tg.pos.copy(player.pos).addScaledVector(player.fwd, -2.5); }
    // the rope from your hand to its collar
    const hand = player.mesh.userData.parts.handR.getWorldPosition(new V3()), neck = tg.pos.clone().addScaledVector(tg.up, 1.2).addScaledVector(tg.fwd, 0.85), rv = neck.clone().sub(hand), rl = rv.length();
    UG.rope.position.copy(hand).addScaledVector(rv, 0.5); UG.rope.quaternion.setFromUnitVectors(UP, rv.normalize()); UG.rope.scale.set(0.035, rl, 0.035);
    if (tg.pos.distanceTo(UG.cage.pos) < 5.2) { cageTiger(); return; }
  } else if (tg.tired > 0) { tg.tired -= dt; speed = 1.5; if (tg.roarT < 0) { tg.roarT = 1.2; bubbleIn(ugScene, tg.pos.clone().addScaledVector(tg.up, 0.4), pick(['Uff… uff…', 'Pavargau…', 'Hah hah…']), 2); } }
  else if (dP < 15 && Q11.stage !== 'none') {
    // running away from you – zig-zagging, with a sudden sprint when you get close
    const away = tangentToward(tg.up, tg.pos.clone().sub(toP)); tg.fwd.lerp(away.applyAxisAngle(tg.up, Math.sin(t * 2.4) * 0.9), Math.min(1, dt * 5)).normalize();
    speed = 9.5; tg.run += dt;
    if (dP < 6 && tg.burstCool <= 0) { tg.burst = 1.1; tg.burstCool = 5; bubbleIn(ugScene, tg.pos.clone().addScaledVector(tg.up, 0.4), 'RRAAU!', 2); tone(140, 0.4, { to: 90, type: 'sawtooth', vol: 0.05, lp: 800 }); }
    if (tg.run > 6.5) { tg.run = 0; tg.tired = 2.6; }
  } else {
    tg.run = Math.max(0, tg.run - dt);
    if (tg.timer < 0) { tg.timer = rr(0.6, 2); tg.fwd.applyAxisAngle(tg.up, rr(-2.5, 2.5)); if (tg.grounded && rnd() < 0.4) tg.vr = 7; }
    if (tg.roarT < 0) { tg.roarT = rr(4, 8); if (dP < 30) bubbleIn(ugScene, tg.pos.clone().addScaledVector(tg.up, 0.4), pick(['RRRAU!', 'Hop hop!', 'Cirkas!', 'Rrr-ha-ha!']), 2); }
  }
  if (tg.burst > 0) { tg.burst -= dt; speed = 13; }
  // stay in the jungle near the temple, out of the deep water
  const far = tg.pos.angleTo(UG_D0) * R; if (!tg.leash && far > 70) tg.fwd.lerp(tangentToward(tg.up, UG_D0), Math.min(1, dt * 3)).normalize();
  const ahead = moveAlong(tg.up, tg.fwd, 3); if (!tg.leash && TH(ahead) < -0.2) tg.fwd.applyAxisAngle(tg.up, dt * 6);
  _mv.copy(tg.fwd).multiplyScalar(speed); tg.vel.lerp(_mv, Math.min(1, dt * 8));
  stepStone(tg, dt, 0.7);
  m.position.copy(tg.pos); orient(m, tg.up, tg.fwd);
  tg.walk += dt * Math.max(1, speed) * 1.6; const sw = speed > 0.5 ? Math.sin(tg.walk) * 0.8 : 0, L = m.userData.legs;
  L[0].rotation.x = sw; L[3].rotation.x = sw; L[1].rotation.x = -sw; L[2].rotation.x = -sw; m.userData.tail.rotation.y = Math.sin(t * 6) * 0.5; m.userData.body.position.y = speed > 5 ? Math.abs(Math.sin(tg.walk)) * 0.15 : 0;
}
function cageTiger() {
  const tg = UG.tiger; tg.leash = false; UG.rope.visible = false;
  Q11.stage = 'king3'; saveQ11(); refreshStoneItems();
  noiseHit(0.3, { f: 1500, vol: 0.15 }); [392, 523, 659, 784].forEach((f, i) => tone(f, 0.4, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
  poof(UG.cage.pos.clone().addScaledVector(UG.cage.d, 2), 0xffd23a);
  toast('Tigras narve! Durelės užsitrenkė!', 'Grįžk pas karalių Ugabugą', '#ffd23a');
}

// ---------- the crown goes to the museum ----------
function deliverCrown() {
  ugHold(''); Q11.stage = 'done'; saveQ11(); addMoney(1000); refreshMuseumExtras();
  [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.6, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
  poof(museum.g.position.clone().addScaledVector(museum.d, 2), 0xffd23a);
  toast('Įsakymas #9 įvykdytas!', 'Urvinių karaliaus karūna – muziejuje. Apdovanojimas: 1000 €', '#ffe98a');
}

// ---------- HUD ----------
function nearestOf(list, p) { let best = null, bd = 1e9; for (const it of list) if (it.m.visible) { const d = it.pos.distanceTo(p); if (d < bd) { bd = d; best = it; } } return best; }
function updateQ11Hud(el) {
  if (!q11Active()) { el.hidden = true; return; }
  el.hidden = false;
  let step = '', target = null, arrow = '', dist = '';
  const p = player.inCar ? ride.pos : player.pos, inStone = mode === 'stone';
  if (!inStone) {
    if (Q11.stage === 'crown') { step = 'Nunešk karaliaus karūną į muziejų'; target = museum && museum.g.position; }
    else step = 'Kūrėjo Salėje prieik prie laiko mašinos ir spausk E';
  } else if (Q11.stage === 'go') { step = 'Eik pas urvinių karalių prie šventyklos'; target = UG.kingPos; }
  else if (Q11.stage === 'fish') {
    const need = !Q11.fire && (Q11.stones.length < 5 || Q11.sticks.length < 5);
    if (Q11.fish === 'cooked') { step = 'Nunešk keptą žuvį karaliui'; target = UG.kingPos; }
    else if (UG.fire.cooking) { step = 'Žuvis kepa – nepamiršk apversti!'; target = UG.fire.pos; }
    else if (need) { step = `Akmenys <b>${Q11.stones.length}/5</b> · pagaliukai <b>${Q11.sticks.length}/5</b>${Q11.fish === 'raw' ? ' · žuvis yra' : ''}`; const it = nearestOf(UG.stones.concat(UG.sticks), p); target = it && it.pos; }
    else if (Q11.fish === 'none') { step = 'Sužvejok žuvį ežerėlyje (prie lieptelio)'; target = UG.dockPos; }
    else { step = Q11.fire ? 'Iškepk žuvį ant laužo' : 'Sukurk laužą laužavietėje'; target = UG.fire.pos; }
  } else if (Q11.stage === 'shells') {
    if (Q11.shells.length >= 20) { step = 'Nunešk 20 kriauklių vargšui Gugui'; target = UG.gugasPos; }
    else { step = `Kriauklės <b>${Q11.shells.length}/20</b> – ieškok rožinio švytėjimo`; const it = nearestOf(UG.shells, p); target = it && it.pos; }
  } else if (Q11.stage === 'king2' || Q11.stage === 'king3') { step = 'Grįžk pas karalių Ugabugą'; target = UG.kingPos; }
  else if (Q11.stage === 'tiger') { if (UG.tiger.leash) { step = 'Nuvesk tigrą į cirko narvą'; target = UG.cage.pos; } else { step = UG.tiger.tired > 0 ? '<b>Tigras pavargo – greičiau gaudyk!</b>' : 'Pagauk tigrą: prisivyk (Shift) ir spausk E'; target = UG.tiger.pos; } }
  else if (Q11.stage === 'crown') { step = 'Grįžk į laiko mašiną ir keliauk namo'; target = UG.tm.position; }
  if (target && (mode === 'planet' || inStone)) { arrow = arrowTo(target); dist = ` · ${Math.round(target.distanceTo(p))} m`; if (mode === 'planet' && q2Dot) { q2Dot.visible = true; q2Dot.position.copy(target).normalize().multiplyScalar(R + 7); } }
  el.innerHTML = `${arrow}<div><div class="qt">Įsakymas #9: Urvinių karaliaus padėjėjas</div><div class="qs">${step}${dist}</div></div>`;
}
