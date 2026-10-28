// ================= roads through every biome, traffic, and villages =================
const ROAD_HALF = 2.7;                 // half width of the asphalt
const roadPaths = [];                  // { closed, s: [ {d, h, side, bridge} ] }
const roadCells = new Map();
const CELL = 4, INS = 8;
const cellKey = (x, y, z) => ((Math.floor(x / CELL) + 200) * 400 + (Math.floor(y / CELL) + 200)) * 400 + (Math.floor(z / CELL) + 200);
const reserved = [];                   // village houses: keep props away from them
let roadsReady = false;

function roadGround(d) {
  if (!roadsReady) return -99;
  const px = d.x * R, py = d.y * R, pz = d.z * R, list = roadCells.get(cellKey(px, py, pz));
  if (!list) return -99;
  let best = -99;
  for (let i = 0; i < list.length; i++) { const s = list[i]; const dx = s.px - px, dy = s.py - py, dz = s.pz - pz; if (dx * dx + dy * dy + dz * dz < ROAD_HALF * ROAD_HALF && s.h > best) best = s.h; }
  return best;
}
function nearRoad(d, margin) {
  if (!roadsReady) return false;
  const px = d.x * R, py = d.y * R, pz = d.z * R, list = roadCells.get(cellKey(px, py, pz)), lim = (ROAD_HALF + margin) ** 2;
  if (!list) return false;
  for (let i = 0; i < list.length; i++) { const s = list[i]; const dx = s.px - px, dy = s.py - py, dz = s.pz - pz; if (dx * dx + dy * dy + dz * dz < lim) return true; }
  return false;
}
function nearReserved(d, extra = 0) { for (const r of reserved) if (r.d.angleTo(d) * R < r.r + extra) return true; return false; }

function buildPathLL(fn, closed, n) {
  // sample a lat/lon curve finely, then resample to ~1 unit spacing
  const fine = []; for (let i = 0; i <= n; i++) { const [la, lo] = fn(i / n); fine.push(dirLL(la, lo)); }
  const out = [fine[0]]; let acc = 0;
  for (let i = 1; i < fine.length; i++) { acc += fine[i].angleTo(fine[i - 1]) * R; if (acc >= 1.05) { out.push(fine[i]); acc = 0; } }
  if (closed && out[out.length - 1].angleTo(out[0]) * R < 0.6) out.pop();
  return out;
}
function buildRoads() {
  const defs = [];
  defs.push({ closed: true, fn: t => [-12 + 2.5 * Math.sin(t * Math.PI * 2 * 4), t * 360] });           // ring road through the five biomes
  for (let k = 0; k < 5; k++) { const L = 72 * k + 22; defs.push({ closed: false, fn: t => [52 - t * 64, L + 3 * Math.sin(t * Math.PI * 2)] }); } // from the city down to the ring
  for (const k of [0, 2, 4]) { const L = 72 * k + 50; defs.push({ closed: false, fn: t => [-12 - t * 50, L + 4 * Math.sin(t * Math.PI)] }); } // down into the Pixel Realm
  defs.push({ closed: true, fn: t => [-62, t * 360] });                                                     // Pixel Realm loop
  for (const df of defs) {
    const pts = buildPathLL(df.fn, df.closed, 6000), s = [];
    for (let i = 0; i < pts.length; i++) {
      const d = pts[i], prev = pts[df.closed ? (i - 1 + pts.length) % pts.length : Math.max(0, i - 1)], next = pts[df.closed ? (i + 1) % pts.length : Math.min(pts.length - 1, i + 1)];
      const tan = next.clone().sub(prev); tan.addScaledVector(d, -tan.dot(d)).normalize();
      const side = new V3().crossVectors(d, tan).normalize();
      const l = moveAlong(d, side, -ROAD_HALF), r = moveAlong(d, side, ROAD_HALF);
      const hc = TH(d), hl = TH(l), hr = TH(r), low = Math.min(hc, hl, hr);
      s.push({ d, tan, side, raw: Math.max(hc, hl, hr), low });
    }
    // smooth the road profile so it doesn't follow every bump, but never sink into the ground
    for (let i = 0; i < s.length; i++) {
      let sum = 0, cnt = 0; for (let k = -4; k <= 4; k++) { const j = df.closed ? (i + k + s.length) % s.length : clamp(i + k, 0, s.length - 1); sum += s[j].raw; cnt++; }
      s[i].h = Math.max(sum / cnt, s[i].raw, 0.6) + 0.1;
      s[i].bridge = s[i].low < 0.3 || s[i].h - s[i].low > 3;
    }
    roadPaths.push({ closed: df.closed, s });
  }
  // spatial hash for "am I on a road?"
  for (const path of roadPaths) for (const smp of path.s) {
    smp.px = smp.d.x * R; smp.py = smp.d.y * R; smp.pz = smp.d.z * R;
    const keys = new Set();
    for (let a = -INS; a <= INS; a += CELL) for (let b = -INS; b <= INS; b += CELL) for (let c = -INS; c <= INS; c += CELL) keys.add(cellKey(smp.px + a, smp.py + b, smp.pz + c));
    for (const k of keys) { let l = roadCells.get(k); if (!l) roadCells.set(k, l = []); l.push(smp); }
  }
  roadsReady = true;
  // meshes: asphalt ribbon with side skirts, dashed centre line, bridge pillars and rails
  const asphalt = mat(0x3c3f46, { roughness: 0.92 }), line = mat(0xf2e6b0, { roughness: 0.7 }), stone = mat(0x8a8a90), rail = mat(0xd8dce4, { metalness: 0.5, roughness: 0.35 });
  for (const path of roadPaths) {
    const S2 = path.s, n = S2.length, pos = [], idx = [], lp = [], li = [];
    const P = (smp, off, dh) => smp.d.clone().multiplyScalar(R + smp.h + dh).addScaledVector(smp.side, off);
    for (let i = 0; i < n; i++) {
      const a = P(S2[i], -ROAD_HALF, 0), b = P(S2[i], ROAD_HALF, 0), c = P(S2[i], -ROAD_HALF - 0.4, -1.4), e = P(S2[i], ROAD_HALF + 0.4, -1.4);
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z, e.x, e.y, e.z);
      const lA = P(S2[i], -0.1, 0.03), lB = P(S2[i], 0.1, 0.03); lp.push(lA.x, lA.y, lA.z, lB.x, lB.y, lB.z);
    }
    const segs = path.closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const j = (i + 1) % n, A = i * 4, B = j * 4;
      idx.push(A, B, A + 1, A + 1, B, B + 1);           // top
      idx.push(A + 2, B + 2, A, A, B + 2, B);           // left skirt
      idx.push(A + 1, B + 1, A + 3, A + 3, B + 1, B + 3); // right skirt
      if (i % 4 < 2) { const a2 = i * 2, b2 = j * 2; li.push(a2, b2, a2 + 1, a2 + 1, b2, b2 + 1); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, asphalt); m.receiveShadow = true; m.userData.shadowSet = true; world.add(m);
    const gl = new THREE.BufferGeometry(); gl.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3)); gl.setIndex(li); gl.computeVertexNormals();
    const ml = new THREE.Mesh(gl, line); ml.receiveShadow = true; ml.userData.shadowSet = true; world.add(ml);
    for (let i = 0; i < n; i++) {
      const smp = S2[i]; if (!smp.bridge) continue;
      if (i % 6 === 0) for (const off of [-ROAD_HALF + 0.6, ROAD_HALF - 0.6]) { const top = R + smp.h - 0.2, bot = R + Math.min(smp.low, -0.5) - 1; const c = S(G.cyl, stone, 0.35, top - bot, 0.35); c.position.copy(smp.d).multiplyScalar((top + bot) / 2).addScaledVector(smp.side, off); c.quaternion.setFromUnitVectors(UP, smp.d); world.add(c); }
      if (i % 2 === 0) for (const off of [-ROAD_HALF - 0.1, ROAD_HALF + 0.1]) { const p = S(G.box, rail, 0.12, 0.9, 0.12); p.position.copy(smp.d).multiplyScalar(R + smp.h + 0.45).addScaledVector(smp.side, off); p.quaternion.setFromUnitVectors(UP, smp.d); world.add(p); }
      const nx = path.s[(i + 1) % n]; if (nx && nx.bridge) for (const off of [-ROAD_HALF - 0.1, ROAD_HALF + 0.1]) { const a = smp.d.clone().multiplyScalar(R + smp.h + 0.85).addScaledVector(smp.side, off), b = nx.d.clone().multiplyScalar(R + nx.h + 0.85).addScaledVector(nx.side, off); const r = S(G.box, rail, 0.1, 0.1, a.distanceTo(b) + 0.05); r.position.copy(a).lerp(b, 0.5); r.lookAt(b); world.add(r); }
    }
    // the road on the mini globe
    const lineGeo = new THREE.BufferGeometry().setFromPoints(S2.map(x => x.d.clone().multiplyScalar(R + 1.5)).concat(path.closed ? [S2[0].d.clone().multiplyScalar(R + 1.5)] : []));
    miniScene.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x2a2a30 })));
  }
  // road signs where a road enters each biome
  for (let b = 1; b < NB; b++) {
    const path = roadPaths[b <= 5 ? b : 6] || roadPaths[1];
    const smp = path.s.find(x => { weights(x.d.x, x.d.y, x.d.z, W); return W[b] > 0.7; }); if (!smp) continue;
    const pd = moveAlong(smp.d, smp.side, ROAD_HALF + 1.2), post = new THREE.Group();
    post.add(S(G.cyl, mat(0x8a8f9c, { metalness: 0.6, roughness: 0.4 }), 0.06, 2.6, 0.06, 0, 1.3, 0));
    const tex = labelTex(BIOMES[b].name, '#1f6b3a', '#ffffff', 512, 96);
    post.add(mesh(new THREE.BoxGeometry(2.6, 0.5, 0.06), [mat(0x1f6b3a), mat(0x1f6b3a), mat(0x1f6b3a), mat(0x1f6b3a), new THREE.MeshStandardMaterial({ map: tex }), new THREE.MeshStandardMaterial({ map: tex })], 0, 2.4, 0));
    post.position.copy(pd).multiplyScalar(R + TH(pd)); orient(post, pd, smp.tan); post.rotateY(Math.PI / 2); world.add(post);
  }
}

// ---------- villages: at least six houses in every biome outside the city ----------
const VILLAGE_STYLES = {
  1: [['cottage', 0xead7b0, 0xb5652f], ['manor', 0xf0e0c0, 0x9a5a2a], ['cottage', 0xf2e4c4, 0x8a4a2a]],
  2: [['igloo'], ['cabin', 0x7a5a44, 0xffffff], ['igloo']],
  3: [['shroom', 0xf3e9dc, 0xff3d5a], ['shroom', 0xf3e9dc, 0x4dd8ff], ['shroom', 0xf3e9dc, 0xb04dff]],
  4: [['cottage', 0xb8653f, 0x5a2a1a], ['tower', 0xa0523a, 0x3a1a10], ['cabin', 0x8a4a2a, 0x3a1a10]],
  5: [['cabin', 0x8a6a3a, 0x2f6a2a], ['tent'], ['cottage', 0xd8c8a0, 0x3f7a3a]],
  6: [['pixel'], ['pixel'], ['tower', 0x7a5cff, 0xff4fd8]]
};
const villageHouses = [];
function buildVillages() {
  for (let b = 1; b < NB; b++) {
    const cands = [];
    for (const path of roadPaths) for (let i = 0; i < path.s.length; i += 3) { const x = path.s[i]; weights(x.d.x, x.d.y, x.d.z, W); if (W[b] > 0.8 && !x.bridge) cands.push(x); }
    for (let i = cands.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [cands[i], cands[j]] = [cands[j], cands[i]]; }
    let built = 0;
    const tryHouse = (d, faceTo, minW) => {
      const [id, wall, roof] = pick(VILLAGE_STYLES[b]);
      const spec = Object.assign({}, HOUSES.find(h => h.id === id)); if (wall) spec.wall = wall; if (roof) spec.roofC = roof;
      const rad = Math.max(spec.w, spec.d) / 2 + 1;
      if (nearReserved(d, rad + 6) || nearRoad(d, rad - 0.5)) return false;
      weights(d.x, d.y, d.z, W); if (W[b] < minW) return false;
      const fz = tangentToward(d, faceTo);
      const hs = footprintHeights(spec, d, fz), mn = Math.min(...hs), mx = Math.max(...hs);
      if (mn < 0.3 || mx - mn > 2.4) return false;
      placeVillageHouse(spec, d, fz, b); built++; return true;
    };
    for (const smp of cands) {
      if (built >= 7) break;
      const side = rnd() < 0.5 ? -1 : 1, dist = ROAD_HALF + 2.5 + 3.5 + rnd() * 2;
      tryHouse(moveAlong(smp.d, smp.side.clone().multiplyScalar(side), dist), smp.d, 0.7);
    }
    // not enough room by the road (small islands, steep places): build further away too
    for (let tries = 0; built < 6 && tries < 3000; tries++) {
      const d = randDir(); weights(d.x, d.y, d.z, W); if (W[b] < 0.75) continue;
      tryHouse(d, d.clone().add(randDir().multiplyScalar(0.05)).normalize(), 0.75);
    }
  }
}
function placeVillageHouse(spec, d, fz, b) {
  {
    {
      const h = buildHouse(spec, d, fz, false);
      const rad = Math.max(spec.w, spec.d) / 2 + 1;
      reserved.push({ d: d.clone(), r: rad + 1 });
      // a mailbox and a little lamp by the road make it look lived-in
      const mb = new THREE.Group(); mb.add(S(G.cyl, mat(0x6b4426), 0.05, 1.1, 0.05, 0, 0.55, 0)); mb.add(S(G.box, mat(pick([0x3a7bff, 0xd94848, 0x3fbf8a])), 0.3, 0.25, 0.45, 0, 1.15, 0));
      const md = moveAlong(d, fz, Math.max(spec.w, spec.d) / 2 + 1.5).clone(); const md2 = moveAlong(md, new V3().crossVectors(md, fz).normalize(), 1.6);
      mb.position.copy(md2).multiplyScalar(R + TH(md2)); orient(mb, md2, fz); world.add(mb);
      villageHouses.push({ g: h.g, d, biome: b, spec, fz: fz.clone() });
      addInspect(h.doorPos, 'Gyventojų namas', pick(['Durys užrakintos. Viduje kažkas groja radiją.', 'Ant durų raštelis: „Išėjau į darbą. Grįšiu, kai demonas nustos mėtyti meteorus.“', 'Pro langą matosi katė, kuri į tave žiūri labai įtariai.', 'Kvepia blynais. Bet niekas neatidaro.', 'Ant slenksčio guli batai, per maži bet kam, išskyrus tave.']), 3);
    }
  }
}

// ---------- traffic ----------
const traffic = [];
function spawnTraffic() {
  const kinds = ['hatch', 'sport', 'police', 'bus', 'icecream', 'limo', 'hatch', 'fire', 'kart', 'hatch'];
  const plan = [[0, 7], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 2]];
  for (const [pi, cnt] of plan) {
    const path = roadPaths[pi]; if (!path) continue;
    for (let k = 0; k < cnt; k++) {
      const kid = pick(kinds), spec = CARS.find(c => c.id === kid); const wheels = [];
      const m = spec.make(wheels); m.userData.wheels = wheels; world.add(m);
      const t = { m, spec, path, i: Math.floor(rnd() * (path.s.length - 2)), f: 0, dir: rnd() < 0.5 ? 1 : -1, speed: 0, top: Math.min(spec.top * 0.45, 13) * rr(0.8, 1.1), honk: 0, pos: new V3(), fwd: new V3(), up: new V3(), spin: 0 };
      traffic.push(t); cityCars.push(m);
    }
  }
}
const _tp = new V3(), _ta = new V3();
function hitByCar(c, t) {
  knockCritter(c, t.fwd.clone().addScaledVector(t.up, 0.3).addScaledVector(randDir(), 0.25).normalize(), t.speed * 1.2 + 7);
  c.vr = 10 + t.speed * 0.7; c.knocked = 3.4; c.spin.set(rr(-16, 16), 0, rr(-16, 16));
  if (c.road) c.roadBack = true;
  t.speed *= 0.6;
  if (c.pos.distanceTo(player.pos) < 70) { noiseHit(0.25, { f: 260, vol: 0.18 }); t.honk = 0; sfx.horn(t.pos); }
}
// pedestrians who stroll right along the roads (careless!)
function spawnPedestrians() {
  const plan = [[0, 6], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 2]];
  for (const [pi, cnt] of plan) {
    const path = roadPaths[pi]; if (!path) continue;
    for (let k = 0; k < cnt; k++) {
      const n = path.s.length, i = Math.floor(rnd() * (n - 2));
      const c = spawnCritter('person', path.s[i].d.clone());
      c.road = { path, i, f: rnd(), dir: rnd() < 0.5 ? 1 : -1, lane: rr(-1.8, 1.8), sw: rr(4, 10) };
      c.speed = rr(1.4, 2.2);
    }
  }
}
const _pw = new V3();
function roadWalkPoint(r, out) {
  const s = r.path.s, n = s.length, a = s[r.i], b = s[(r.i + 1) % n];
  out.copy(a.d).lerp(b.d, r.f).normalize();
  const h = a.h + (b.h - a.h) * r.f, sd = _ta.copy(a.side).lerp(b.side, r.f).normalize();
  return out.multiplyScalar(R + h).addScaledVector(sd, r.lane);
}
function updatePedestrian(c, dt) {   // returns true when it handled the movement
  const r = c.road;
  if (c.roadBack) {
    roadWalkPoint(r, _pw); const d = _pw.distanceTo(c.pos);
    if (d < 1.2) c.roadBack = false;
    else { tangentToward(c.up, _pw.clone().sub(c.pos), c.fwd).normalize(); c.vel.copy(c.fwd).multiplyScalar(c.speed * 1.3); return false; }
  }
  const s = r.path.s, n = s.length;
  r.f += c.speed * dt * r.dir;
  while (r.f >= 1) { r.f -= 1; r.i++; if (r.i >= n - 1 && !r.path.closed) { r.i = n - 2; r.f = 0.999; r.dir = -1; } if (r.path.closed) r.i %= n; }
  while (r.f < 0) { r.f += 1; r.i--; if (r.i < 0) { if (r.path.closed) r.i = n - 1; else { r.i = 0; r.f = 0.001; r.dir = 1; } } }
  r.sw -= dt; if (r.sw < 0) { r.sw = rr(4, 12); r.lane = clamp(r.lane + rr(-1.5, 1.5), -2, 2); }   // wander from lane to lane
  roadWalkPoint(r, _pw);
  const to = _pw.clone().sub(c.pos); tangentToward(c.up, to, c.fwd).normalize();
  c.vel.copy(to).addScaledVector(c.up, -to.dot(c.up)).multiplyScalar(Math.min(8, 1 / Math.max(dt, 1e-3)) * 0.5);
  if (c.vel.length() > c.speed * 3) c.vel.setLength(c.speed * 3);
  return true;
}
function trafficAt(t, i, f, out) {
  const s = t.path.s, n = s.length, a = s[i], b = s[(i + 1) % n];
  const lane = t.dir > 0 ? -1.3 : 1.3;   // keep to the right
  out.copy(a.d).lerp(b.d, f).normalize();
  const h = a.h + (b.h - a.h) * f;
  const sd = _ta.copy(a.side).lerp(b.side, f).normalize();
  return out.multiplyScalar(R + h).addScaledVector(sd, lane);
}
function updateTraffic(dt, t0) {
  const focus = player.inCar && ride ? ride.pos : player.pos;
  for (const t of traffic) {
    const s = t.path.s, n = s.length;
    if (t.pos.lengthSq() > 0 && t.pos.distanceToSquared(focus) > 220 * 220) { // far away: move cheaply, skip details
      t.f += t.top * dt * t.dir; } else {
      // look ahead for anything in the way
      const ahead = t.pos.clone().addScaledVector(t.fwd, 6.5 + t.spec.len / 2);
      let blocked = false, isPlayer = false;
      const check = (p, r) => { if (p.distanceTo(ahead) < r) blocked = true; };
      if (!player.inCar) { if (player.pos.distanceTo(ahead) < 3.6) { blocked = true; isPlayer = true; } }
      if (player.inCar && ride) { if (ride.pos.distanceTo(ahead) < 4.2) { blocked = true; isPlayer = true; } }
      if (car.exists && !(player.inCar && ride === car)) check(car.pos, 3.2);
      if (auto.exists && !(player.inCar && ride === auto)) check(auto.pos, 4);
      for (const o of traffic) if (o !== t && o.pos.distanceTo(ahead) < 4.5 && o.fwd.dot(t.fwd) > -0.2) { blocked = true; break; }
      if (!blocked) for (const c of critters) if (c.type !== 'person' && c.pos.distanceTo(ahead) < 2.6) { blocked = true; break; }
      // people on the road don't stop the cars… they get sent flying (but never you)
      if (t.speed > 2.5) for (const c of critters) {
        if (c.type !== 'person' || c.knocked > 0) continue;
        _ta.copy(c.pos).sub(t.pos); const along = _ta.dot(t.fwd); if (along < -0.4 || along > t.spec.len / 2 + 0.7) continue;
        _ta.addScaledVector(t.fwd, -along); _ta.addScaledVector(t.up, -_ta.dot(t.up)); if (_ta.length() > t.spec.wid / 2 + 0.45) continue;
        hitByCar(c, t);
      }
      if (!blocked) for (const pt of pets) if (pt.pos.distanceTo(ahead) < 2.6) { blocked = true; break; }
      if (!blocked && catQ && catQ.mesh.visible && catQ.pos.distanceTo(ahead) < 3) blocked = true;
      const target = blocked ? 0 : t.top;
      t.speed += clamp(target - t.speed, -14 * dt, 5 * dt);
      t.honk -= dt; if (blocked && isPlayer && t.honk <= 0 && t.speed < 1) { t.honk = rr(3, 6); sfx.horn(t.pos); }
      t.f += t.speed * dt * t.dir;
    }
    // walk along the polyline
    while (t.f >= 1) { t.f -= 1; t.i++; if (t.i >= n - 1 && !t.path.closed) { t.i = n - 2; t.f = 1 - (t.f); t.dir = -1; } if (t.path.closed) t.i %= n; }
    while (t.f < 0) { t.f += 1; t.i--; if (t.i < 0) { if (t.path.closed) t.i = n - 1; else { t.i = 0; t.f = 1 - t.f; t.dir = 1; } } }
    trafficAt(t, t.i, t.f, t.pos);
    const a = s[t.i], b = s[(t.i + 1) % n];
    t.up.copy(a.d).lerp(b.d, t.f).normalize();
    t.fwd.copy(b.d).sub(a.d).multiplyScalar(t.dir); t.fwd.addScaledVector(t.up, -t.fwd.dot(t.up)).normalize();
    if (t.pos.distanceToSquared(focus) < 250 * 250) {
      t.m.visible = true; t.m.position.copy(t.pos); orient(t.m, t.up, t.fwd);
      t.spin += t.speed * dt / 0.45; t.m.userData.wheels.forEach(w => w.rotation.x = t.spin);
      if (t.m.userData.lights) { const ph = Math.floor(t0 * 5) % 2; t.m.userData.lights[0].material.color.setHex(ph ? 0xff2020 : 0x551010); t.m.userData.lights[1].material.color.setHex(!ph ? 0x2060ff : 0x101a55); }
    } else t.m.visible = false;
  }
}
