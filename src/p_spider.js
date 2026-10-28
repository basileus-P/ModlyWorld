// ================= God's third command: "The Secret Spider" =================
const Q3 = { stage: 'none' };   // none | go | find | fly | done   (go: reach the spider, find: bring the daughter, fly: take the fly to the museum)
try { const s = JSON.parse(localStorage.getItem('modly-quest3') || 'null'); if (s && s.stage) Q3.stage = s.stage === 'follow' ? 'find' : s.stage; } catch (_) { }
function saveQ3() { try { localStorage.setItem('modly-quest3', JSON.stringify({ stage: Q3.stage })); } catch (_) { } }
function startQ3(silent) {
  if (Q3.stage !== 'none') return;
  Q3.stage = 'go'; saveQ3();
  if (!silent) setTimeout(() => {
    [262, 311, 392, 466].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.07, when: i * 0.15 }));
    toast('Naujas įsakymas #3: Slaptas voras', 'Užlipk ant Didžiojo Grybo Grybų Karalystėje – pačioje jo kepurėje kažkas gyvena', '#c77dff');
  }, 4200);
}
const Q3_STATUS = () => Q3.stage === 'go' ? ['Grybų Karalystėje, pačioje Didžiojo Grybo kepurėje, įrengtas slaptas namelis. Jame – paslaptis.']
  : Q3.stage === 'find' ? ['Po žeme gyvena milžiniškas voras. Jo dukra pasiklydo urvuose. Padėk jam.']
  : Q3.stage === 'fly' ? ['Voras tau padovanojo musę voratinklyje? Nunešk ją į muziejų – ten dar daug tuščių vietų.']
  : ['Voras ir jo dukra vėl kartu, o muziejuje – naujas eksponatas. Ačiū tau, mažasis.'];

// ---------- a little talking system (cards you click through with E) ----------
let talk = null;
function startTalk(name, lines, color, onEnd) { talk = { name, lines, i: 0, color, onEnd }; card = { kind: 'talk' }; showCard(name, lines[0], `E – toliau (1 / ${lines.length})`, color); sfx.blip(); }
function advanceTalk() {
  if (!talk) return false;
  talk.i++;
  if (talk.i >= talk.lines.length) { const cb = talk.onEnd; talk = null; hideCard(); if (cb) cb(); return true; }
  showCard(talk.name, talk.lines[talk.i], `E – toliau (${talk.i + 1} / ${talk.lines.length})`, talk.color); return true;
}
function bubbleIn(sc, pos, text, h = 2.5) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 96; const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,255,255,.93)'; x.beginPath(); x.ellipse(128, 44, 118, 38, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.moveTo(100, 76); x.lineTo(118, 96); x.lineTo(126, 76); x.fill();
  x.fillStyle = '#2a2a40'; x.font = "40px 'Lilita One', sans-serif"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 128, 46);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false })); s.scale.set(2.6, 1, 1); sc.add(s);
  let t = 0; fx.push(dt => { t += dt; s.position.copy(pos).add(new V3(0, h + t * 0.5, 0)); s.material.opacity = Math.max(0, 1 - Math.max(0, t - 1) / 0.5); if (t > 1.5) { sc.remove(s); return false; } return true; });
}

// ---------- shared walking for flat indoor/underground places ----------
function walkFlat(dt, o) {
  const f = player.down ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = player.down ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP);
  _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = (keys.ShiftLeft || keys.ShiftRight ? 9 : 5) * (o.speed || 1); _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, player.grounded ? Math.min(1, 12 * dt) : Math.min(1, 2.5 * dt));
  if (!player.down && keys.Space && player.grounded && Q8.back !== 'jetpack') { player.vr = 7; player.grounded = false; sfx.jump(); }
  if (!player.down) flatJetpack(dt);
  player.pos.addScaledVector(player.vel, dt); player.vr -= GRAV * dt; player.pos.y += player.vr * dt;
  const rad = 0.35; let ground = 0;
  for (const b of o.boxes) { const dx = player.pos.x - b.x, dz = player.pos.z - b.z, ex = b.hx + rad - Math.abs(dx), ez = b.hz + rad - Math.abs(dz); if (ex <= 0 || ez <= 0) continue; if (b.h && player.pos.y >= b.h - 0.45) { if (b.h > ground) ground = b.h; } else if (ex < ez) player.pos.x += dx < 0 ? -ex : ex; else player.pos.z += dz < 0 ? -ez : ez; }
  if (o.circles) for (const c of o.circles) { const dx = player.pos.x - c.x, dz = player.pos.z - c.z, d = Math.hypot(dx, dz); if (d < c.r + rad && d > 1e-4 && player.pos.y < (c.h || 99)) { player.pos.x = c.x + dx / d * (c.r + rad); player.pos.z = c.z + dz / d * (c.r + rad); } }
  player.pos.x = clamp(player.pos.x, o.x0 + rad, o.x1 - rad); player.pos.z = clamp(player.pos.z, o.z0 + rad, o.z1 - rad);
  if (player.pos.y > o.H - 1.9) { player.pos.y = o.H - 1.9; if (player.vr > 0) player.vr = 0; }
  if (player.pos.y <= ground) { if (!player.grounded) fallCheck(player.vr); player.pos.y = ground; player.vr = 0; player.grounded = true; } else player.grounded = false;
  player.mesh.rotation.set(0, 0, 0); player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd);
  if (player.down) downPose(dt, T); else animateMan(dt, f !== 0 || s !== 0, sp);
  const dist = o.camDist || 4.6, pitch = player.pitch, head = player.pos.clone().add(new V3(0, 1.4, 0));
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
  for (let k = 1; k <= 10; k++) { const q = head.clone().lerp(_ct, k / 10); let hit = false; for (const b of o.boxes) if ((!b.h || q.y < b.h + 0.3) && Math.abs(q.x - b.x) < b.hx + 0.3 && Math.abs(q.z - b.z) < b.hz + 0.3) { hit = true; break; } if (hit) { _ct.copy(head).lerp(_ct, Math.max(0, (k - 1.5) / 10)); break; } }
  _ct.x = clamp(_ct.x, o.x0 + 0.25, o.x1 - 0.25); _ct.z = clamp(_ct.z, o.z0 + 0.25, o.z1 - 0.25); _ct.y = clamp(_ct.y, 0.4, o.H - 0.25);
  camera.position.lerp(_ct, Math.min(1, dt * 10)); camera.up.set(0, 1, 0); camera.lookAt(head);
  return f !== 0 || s !== 0;
}

// ---------- the little house on top of the giant mushroom ----------
let capHouse = null;
function buildCapHouse() {
  const c = BC[3];
  let cap = null; for (const s of solids) if (s.thin && s.dir.angleTo(c) < 0.01 && s.r > 8) { cap = s; break; }
  if (!cap) return;
  const capR = 12, capH = capR * 0.45, capBase = cap.top - capH * 0.82;   // the giant cap is a dome: radius 12, height 5.4
  cap.type = 'dome'; cap.thin = false; cap.R = capR; cap.H = capH; cap.base = capBase; cap.r = capR; cap.top = capBase + capH;
  cap.p = c.clone().multiplyScalar(capBase);
  const surf = d => capBase + capH * Math.sqrt(1 - (d / capR) ** 2);
  const fwd = tangentToward(c, UP);
  const g = new THREE.Group(); g.position.copy(c).multiplyScalar(capBase); orient(g, c, fwd); world.add(g);
  const wood = mat(0x8a5a2b), frame = mat(0x5a3a1c);
  const onDome = (x, z, lift = 0.04) => { const r = Math.min(0.995, Math.hypot(x, z) / capR), y = capH * Math.sqrt(1 - r * r); const n = new V3(x / (capR * capR), y / (capH * capH), z / (capR * capR)).normalize(); return { p: new V3(x, y, z).addScaledVector(n, lift), n }; };
  const stick = (o, at) => { o.position.copy(at.p); o.quaternion.setFromUnitVectors(new V3(0, 1, 0), at.n); g.add(o); return o; };
  // round front door set right into the cap
  { const d = stick(new THREE.Group(), onDome(0, 7.2));
    d.add(S(G.cyl, frame, 1.25, 0.12, 1.25, 0, 0, 0)); d.add(S(G.cyl, wood, 1.05, 0.18, 1.05, 0, 0.02, 0));
    for (const x of [-0.5, 0, 0.5]) d.add(S(G.box, frame, 0.06, 0.2, 1.9, x, 0.05, 0));
    d.add(S(G.sph, mat(0xffd23a, { metalness: 0.7 }), 0.12, 0.12, 0.12, 0.7, 0.16, 0)); }
  // little glowing round windows all around the cap
  const glass = bmat(0xffe9a8);
  for (let k = 0; k < 7; k++) {
    const a = k / 7 * Math.PI * 2 + 0.45, rr = 10.6;
    const w = stick(new THREE.Group(), onDome(Math.sin(a) * rr, Math.cos(a) * rr, 0.06));
    w.add(S(G.cyl, frame, 0.75, 0.1, 0.75, 0, 0, 0)); w.add(S(G.cyl, glass, 0.6, 0.14, 0.6, 0, 0.01, 0));
    w.add(S(G.box, frame, 0.06, 0.18, 1.2, 0, 0.02, 0)); w.add(S(G.box, frame, 1.2, 0.18, 0.06, 0, 0.02, 0));
  }
  // a tiny chimney with smoke, and a doormat
  g.add(S(G.cyl, mat(0x9a6a4a), 0.35, 1.6, 0.35, -2.2, capH + 0.4, -1.5));
  const smoke = []; for (let i = 0; i < 4; i++) { const s = S(G.sph, new THREE.MeshStandardMaterial({ color: 0xdddddd, transparent: true, opacity: 0.5, depthWrite: false }), 0.3, 0.3, 0.3, -2.2, capH + 1.3, -1.5); g.add(s); smoke.push(s); }
  animators.push((dt, t) => smoke.forEach((s, i) => { const k = (t * 0.35 + i / 4) % 1; s.position.y = capH + 1.3 + k * 2.4; s.position.x = -2.2 + Math.sin(t + i) * 0.3 * k; s.scale.setScalar(0.3 + k * 0.6); s.material.opacity = 0.5 * (1 - k); }));
  stick(S(G.box, mat(0x4a7a3a), 1.4, 0.05, 0.8, 0, 0, 0), onDome(0, 5.6, 0.03));
  // a low fence all round the rim so you can stroll anywhere on the cap without tumbling off – with a gap above the shelf stairs
  g.updateMatrixWorld(true);
  const ax = new V3(1, 0, 0).applyQuaternion(g.quaternion), az = new V3(0, 0, 1).applyQuaternion(g.quaternion);
  const shelf = solids.filter(o => o.thin && o.r === 1.9 && o.dir.angleTo(c) < 0.25).sort((a, b) => b.top - a.top)[0];
  let gapA = null;
  if (shelf) { const h = shelf.p.clone().sub(cap.p); h.addScaledVector(c, -h.dot(c)); cap.gap = h.normalize(); cap.gapCos = Math.cos(0.2); gapA = Math.atan2(h.dot(ax), h.dot(az)); }
  cap.fence = 11.25;
  const FR = 11.6, fy = capH * Math.sqrt(1 - (FR / capR) ** 2), fenceM = mat(0xf3e9dc), N = 64;
  const gapped = a => gapA !== null && Math.abs(Math.atan2(Math.sin(a - gapA), Math.cos(a - gapA))) < 0.2;
  for (let k = 0; k < N; k++) {
    const a = k / N * Math.PI * 2, a2 = (k + 1) / N * Math.PI * 2;
    if (gapped(a)) continue;
    g.add(S(G.cyl, fenceM, 0.07, 0.9, 0.07, Math.sin(a) * FR, fy + 0.45, Math.cos(a) * FR));
    if (gapped(a2)) continue;
    const am = (a + a2) / 2, len = FR * (a2 - a) + 0.02;
    for (const y of [0.45, 0.85]) { const rail = S(G.box, fenceM, len, 0.07, 0.07, Math.sin(am) * FR, fy + y, Math.cos(am) * FR); rail.rotation.y = am; g.add(rail); }
  }
  if (gapA !== null) for (const s of [-1, 1]) { const a = gapA + s * 0.2; g.add(S(G.sph, mat(0xff3d7f), 0.14, 0.14, 0.14, Math.sin(a) * FR, fy + 0.95, Math.cos(a) * FR)); }
  const door = c.clone().multiplyScalar(surf(6.6) + 1).addScaledVector(fwd, 6.6);
  capHouse = { g, door, exit: c.clone().multiplyScalar(surf(4.8) + 0.3).addScaledVector(fwd, 4.8), fwd };
  addInspect(door, 'Durys grybo kepurėje', '', 3.6, { verb: 'įeiti į namelį grybo kepurėje', onUse: enterCapHouse });
  linearize(g);
}

// ---------- inside the little house ----------
const chScene = new THREE.Scene(); chScene.background = new THREE.Color(0x2a2236);
chScene.add(new THREE.AmbientLight(0xffffff, 0.35)); chScene.add(new THREE.HemisphereLight(0xfff4e0, 0x6a5a4a, 0.45));
{ const l = new THREE.PointLight(0xffe7c0, 0.9, 20); l.position.set(0, 2.6, 0); chScene.add(l); }
const CH = { built: false, boxes: [], W: 8, D: 7, H: 3.2, button: new V3(3.85, 1.0, -1.6), btnMesh: null, hatch: null };
function buildCapHouseRoom() {
  if (CH.built) return; CH.built = true;
  const { W: Wd, D, H } = CH;
  chScene.add(S(G.box, mat(0xb98b5a), Wd, 0.2, D, 0, -0.1, 0));
  // the ceiling is the inside of the mushroom cap: a pink spotted dome
  chScene.add(S(G.dome, mat(0xff6f9f, { side: THREE.BackSide }), Wd * 0.72, 1.6, D * 0.78, 0, H - 0.05, 0));
  for (let k = 0; k < 9; k++) { const a = k * 2.4, r = 1 + (k % 3) * 1.1; chScene.add(S(G.sph, bmat(0xfff3c4), 0.28, 0.06, 0.28, Math.cos(a) * r, H + 1.45 - r * 0.25, Math.sin(a) * r)); }
  const wm = mat(0xffd6e4);
  for (const [x, z, ry] of [[-Wd / 2 + 0.01, 1.2, Math.PI / 2], [-Wd / 2 + 0.01, -1.4, Math.PI / 2], [-1.8, -D / 2 + 0.01, 0], [1.8, D / 2 - 0.01, Math.PI]]) {
    const w = mesh(new THREE.CircleGeometry(0.42, 24), bmat(0xffe9a8), x, 2.0, z); w.rotation.y = ry; chScene.add(w);
    const f = mesh(new THREE.RingGeometry(0.42, 0.55, 24), mat(0x5a3a1c), x, 2.0, z); f.rotation.y = ry; f.position.x += Math.sign(-x) * 0.005 * (ry ? 1 : 0); chScene.add(f);
  }
  chScene.add(S(G.box, wm, Wd, H, 0.2, 0, H / 2, -D / 2 - 0.1)); chScene.add(S(G.box, wm, Wd, H, 0.2, 0, H / 2, D / 2 + 0.1));
  for (const sx of [-1, 1]) chScene.add(S(G.box, wm, 0.2, H, D, sx * (Wd / 2 + 0.1), H / 2, 0));
  chScene.add(S(G.box, mat(0x8a5a2b), 1.2, 2.1, 0.08, 0, 1.05, D / 2 - 0.04));
  // cosy stuff: a bed, a table with a teapot, a mushroom lamp
  chScene.add(S(G.box, mat(0x8a5a2b), 1.3, 0.4, 2.2, -2.9, 0.2, -2)); chScene.add(S(G.box, mat(0xc77dff), 1.2, 0.2, 2.0, -2.9, 0.5, -2)); CH.boxes.push({ x: -2.9, z: -2, hx: 0.65, hz: 1.1, h: 0.6 });
  chScene.add(S(G.cyl, mat(0xa0703c), 0.7, 0.08, 0.7, 0.5, 0.75, 0.5)); chScene.add(S(G.cyl, mat(0xa0703c), 0.08, 0.75, 0.08, 0.5, 0.37, 0.5)); chScene.add(S(G.sph, mat(0xffffff), 0.18, 0.15, 0.18, 0.5, 0.92, 0.5)); CH.boxes.push({ x: 0.5, z: 0.5, hx: 0.7, hz: 0.7, h: 0.8 });
  chScene.add(S(G.cyl, mat(0xf3e9dc), 0.08, 1.2, 0.08, 3.2, 0.6, 2.6)); chScene.add(S(G.dome, mat(0xff3d7f, { emissive: 0x401020 }), 0.5, 0.3, 0.5, 3.2, 1.2, 2.6));
  // a painting of a spider
  const pc = document.createElement('canvas'); pc.width = 128; pc.height = 96; const x = pc.getContext('2d');
  x.fillStyle = '#3a2a4a'; x.fillRect(0, 0, 128, 96); x.strokeStyle = '#ddd'; x.lineWidth = 1; for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(64, 48); x.lineTo(64 + Math.cos(i * 0.8) * 70, 48 + Math.sin(i * 0.8) * 70); x.stroke(); }
  for (let r = 10; r < 60; r += 10) { x.beginPath(); x.arc(64, 48, r, 0, Math.PI * 2); x.stroke(); }
  x.fillStyle = '#111'; x.beginPath(); x.arc(64, 48, 10, 0, Math.PI * 2); x.fill(); x.strokeStyle = '#111'; x.lineWidth = 3; for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(64, 48); x.lineTo(64 + Math.cos(i * 0.8 + 0.3) * 20, 48 + Math.sin(i * 0.8 + 0.3) * 20); x.stroke(); }
  const art = mesh(new THREE.PlaneGeometry(1.4, 1.05), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(pc) }), Wd / 2 - 0.02, 1.9, -1.6); art.rotation.y = -Math.PI / 2; chScene.add(art);
  chScene.add(S(G.box, mat(0xd4a24a), 0.04, 1.2, 1.55, Wd / 2 - 0.01, 1.9, -1.6));
  // the floor hatch that turns into a lift
  const hatch = new THREE.Group(); hatch.position.set(1.8, 0.01, -2.2); chScene.add(hatch);
  CH.hatch = hatch;
  buildLift();
  chScene.environment = scene.environment; linearize(chScene);
}
function enterCapHouse() {
  if (transitioning || player.inCar) return;
  transitioning = true; cancelPlace(true); stopClimb(); dropAll(); sfx.blip();
  fadeTo(() => {
    transitioning = false; buildCapHouseRoom(); mode = 'caphouse'; chScene.add(player.mesh); CH.liftOpen = true;
    player.pos.set(0, 0, CH.D / 2 - 1.2); player.up.set(0, 1, 0); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.grounded = true;
    camera.position.set(0, 2.2, CH.D / 2 - 0.3); camera.up.set(0, 1, 0);
    $('bName').textContent = 'Namelis grybo kepurėje'; $('bEn').textContent = 'Grybų Karalystė'; $('bAtm').textContent = 'Jauku ir keista. Kažkas čia gyvena… ar gyveno?'; document.documentElement.style.setProperty('--biome', '#c77dff');
    if (Q3.stage === 'go') toast('Namelis grybo kepurėje', 'Kampe stovi liftas į požemius – užlipk ant jo ir spausk E', '#c77dff');
  });
}
function exitCapHouse() {
  if (transitioning) return; transitioning = true; hideCard();
  fadeTo(() => {
    transitioning = false; mode = 'planet'; world.add(player.mesh);
    const d = capHouse.exit.clone().normalize();
    player.pos.copy(capHouse.exit); player.up.copy(d); player.fwd.copy(capHouse.fwd).projectOnPlane(d).normalize(); player.vel.set(0, 0, 0); player.vr = 0; player.grounded = true;
    curBiome = -1; camera.position.copy(player.pos).addScaledVector(d, 3).addScaledVector(player.fwd, -6);
  });
}
function capHouseAction() {
  if (card) { if (!advanceTalk()) hideCard(); return; }
  if (Math.hypot(player.pos.x, player.pos.z - (CH.D / 2 - 0.6)) < 1.4) { exitCapHouse(); return; }
  if (CH.liftOpen && Math.hypot(player.pos.x - 1.8, player.pos.z + 2.2) < 1.3) { rideLiftDown(); return; }
}
function buildLift() {   // the lift is always there – just walk on and press E
  CH.liftOpen = true;
  const lift = new THREE.Group(); lift.position.set(1.8, 0, -2.2); chScene.add(lift);
  lift.add(S(G.box, bmat(0x0a0810), 1.5, 0.02, 1.5, 0, 0.02, 0));
  lift.add(S(G.box, mat(0xffd23a, { metalness: 0.5 }), 1.6, 0.03, 0.08, 0, 0.03, 0.78)); lift.add(S(G.box, mat(0xffd23a, { metalness: 0.5 }), 1.6, 0.03, 0.08, 0, 0.03, -0.78));
  for (const [x, z] of [[-0.75, -0.75], [0.75, -0.75], [-0.75, 0.75], [0.75, 0.75]]) lift.add(S(G.cyl, mat(0xc8ccd6, { metalness: 0.7 }), 0.05, 2.6, 0.05, x, 1.3, z));
  lift.add(S(G.box, mat(0x30343e, { metalness: 0.6 }), 1.6, 0.08, 1.6, 0, 2.6, 0));
  lift.add(mesh(new THREE.PlaneGeometry(1.2, 0.3), new THREE.MeshBasicMaterial({ map: labelTex('LIFTAS ↓', '#30343e', '#ffd23a', 384, 96), side: THREE.DoubleSide }), 0, 2.3, 0.8));
  CH.lift = lift;
}
function rideLiftDown() {
  if (transitioning) return; transitioning = true;
  tone(80, 2, { to: 50, type: 'sawtooth', vol: 0.05, lp: 400, attack: 0.3 });
  let t = 0; fx.push(dt => { t += dt; if (mode === 'caphouse') { player.pos.y = -t * 1.5; player.mesh.position.y = player.pos.y; } return t < 0.9; });
  fadeTo(() => { transitioning = false; enterCave(); });
}
function updateCapHouse(dt, t) {
  walkFlat(dt, { boxes: CH.boxes, x0: -CH.W / 2, x1: CH.W / 2, z0: -CH.D / 2, z1: CH.D / 2, H: CH.H, camDist: 3.6 });
  let txt = '';
  if (card) txt = '';
  else if (Math.hypot(player.pos.x, player.pos.z - (CH.D / 2 - 0.6)) < 1.4) txt = '<kbd>E</kbd> išeiti';
  else if (CH.liftOpen && Math.hypot(player.pos.x - 1.8, player.pos.z + 2.2) < 1.3) txt = '<kbd>E</kbd> leistis liftu į požemius';
  setPrompt(txt);
}

// ================= the caves under the mushroom =================
const caveScene = new THREE.Scene(); caveScene.background = new THREE.Color(0x0c0912);
caveScene.fog = new THREE.Fog(0x0c0912, 8, 46);
caveScene.add(new THREE.AmbientLight(0x8a7aaa, 0.25)); caveScene.add(new THREE.HemisphereLight(0x8a6aff, 0x201010, 0.25));
const CV = { built: false, boxes: [], x0: -42, x1: 42, z0: -42, z1: 42, H: 12, dad: null, girl: null, girlPos: new V3(-33, 0, -33), girlState: 'lost', fly: null };
function makeSpider(col, s, girl) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); body.scale.setScalar(s);
  const c = mat(col, { roughness: 0.6 }), c2 = mat(new THREE.Color(col).multiplyScalar(0.7).getHex(), { roughness: 0.6 });
  body.add(S(G.sph, c, 1.0, 0.85, 1.2, 0, 1.3, -1.0));
  body.add(S(G.sph, c2, 0.62, 0.55, 0.7, 0, 1.15, 0.45));
  for (let i = 0; i < 5; i++) body.add(S(G.sph, mat(0xffd23a), 0.12, 0.05, 0.12, Math.sin(i) * 0.3, 2.05 - i * 0.02, -1.4 + i * 0.25));
  const eyes = [];
  for (const [x, y, r] of [[-0.18, 1.35, 0.13], [0.18, 1.35, 0.13], [-0.36, 1.28, 0.08], [0.36, 1.28, 0.08], [-0.1, 1.52, 0.06], [0.1, 1.52, 0.06]]) { const e = S(G.sph, mat(0xffffff, { emissive: 0x6050a0, emissiveIntensity: 0.4 }), r, r, r * 0.6, x, y, 1.05); body.add(e); body.add(S(G.sph, bmat(0x111111), r * 0.5, r * 0.5, r * 0.3, x, y, 1.05 + r * 0.6)); eyes.push(e); }
  for (const x of [-0.12, 0.12]) { const f = S(G.cone, c2, 0.06, 0.3, 0.06, x, 0.85, 0.95); f.rotation.x = Math.PI; body.add(f); }
  if (girl) { for (const x of [-0.22, 0.22]) body.add(S(G.sph, mat(0xff4fa0), 0.22, 0.14, 0.1, x, 1.85, 0.35)); body.add(S(G.sph, mat(0xff4fa0), 0.08, 0.08, 0.08, 0, 1.85, 0.35)); }
  const legs = [];
  for (let side = -1; side <= 1; side += 2) for (let k = 0; k < 4; k++) {
    const hip = new THREE.Group(); hip.position.set(side * 0.45, 1.15, 0.7 - k * 0.42); body.add(hip);
    hip.rotation.y = side * (0.9 - k * 0.45) + (side < 0 ? Math.PI : 0);
    const upper = S(G.cyl, c2, 0.07, 1.3, 0.07, 0.55, 0.45, 0); upper.rotation.z = -1.0; hip.add(upper);
    const knee = new THREE.Group(); knee.position.set(1.1, 0.8, 0); hip.add(knee);
    const lower = S(G.cyl, c2, 0.06, 1.7, 0.06, 0.35, -0.85, 0); lower.rotation.z = 0.35; knee.add(lower);
    legs.push({ hip, k, side });
  }
  g.userData = { body, legs, eyes };
  return g;
}
function animSpider(g, t, moving, speed = 1) {
  g.userData.legs.forEach(L => { const ph = t * 8 * speed + L.k * 1.3 + (L.side > 0 ? Math.PI : 0); L.hip.rotation.z = moving ? Math.sin(ph) * 0.25 : Math.sin(t * 1.2 + L.k) * 0.03; });
  g.userData.body.position.y = moving ? Math.abs(Math.sin(t * 8 * speed)) * 0.05 : Math.sin(t * 1.5) * 0.03;
}
function webMesh(size) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.strokeStyle = 'rgba(235,235,255,.8)'; x.lineWidth = 2;
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.beginPath(); x.moveTo(128, 128); x.lineTo(128 + Math.cos(a) * 128, 128 + Math.sin(a) * 128); x.stroke(); }
  for (let r = 14; r < 128; r += 14) { x.beginPath(); for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI * 2, rr2 = r + Math.sin(i * 3) * 2; const px = 128 + Math.cos(a) * rr2, py = 128 + Math.sin(a) * rr2; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
  return mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
}
function makeFlyInWeb() {
  const g = new THREE.Group();
  const w = webMesh(1.2); g.add(w);
  g.add(mesh(new THREE.TorusGeometry(0.6, 0.03, 6, 24), mat(0x8a5a2b)));
  const fly = new THREE.Group(); fly.position.z = 0.03; g.add(fly);
  fly.add(S(G.sph, mat(0x1a1a20, { metalness: 0.4, roughness: 0.4 }), 0.12, 0.09, 0.16)); fly.add(S(G.sph, mat(0x8a1010), 0.07, 0.06, 0.05, 0, 0.02, 0.15));
  for (const x of [-1, 1]) { const wing = S(G.sph, mat(0xd8e8ff, { transparent: true, opacity: 0.6 }), 0.14, 0.02, 0.08, x * 0.14, 0.06, -0.02); wing.rotation.z = x * 0.4; fly.add(wing); }
  g.userData.fly = fly;
  return g;
}
function buildCave() {
  if (CV.built) return; CV.built = true;
  const geo = new THREE.PlaneGeometry(90, 90, 60, 60); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, col = [];
  for (let i = 0; i < p.count; i++) { const c = new THREE.Color().setHSL(0.75, 0.15, 0.12 + 0.05 * noise(p.getX(i) * 0.3, 0, p.getZ(i) * 0.3)); col.push(c.r, c.g, c.b); }
  srgbArrayToLinear(col); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  caveScene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })));
  caveScene.add(S(G.box, mat(0x1a1424, { roughness: 1 }), 90, 0.5, 90, 0, CV.H + 0.25, 0));
  const rock = mat(0x3a3048, { roughness: 0.95 }), rock2 = mat(0x2a2236, { roughness: 0.95 });
  const wall = (x0, x1, z0, z1) => { caveScene.add(S(G.box, rock, Math.abs(x1 - x0), CV.H, Math.abs(z1 - z0), (x0 + x1) / 2, CV.H / 2, (z0 + z1) / 2)); CV.boxes.push({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, hx: Math.abs(x1 - x0) / 2, hz: Math.abs(z1 - z0) / 2 }); };
  wall(-43, 43, -43, -42); wall(-43, 43, 42, 43); wall(-43, -42, -43, 43); wall(42, 43, -43, 43);
  // tunnels: a few rock walls make a little maze between the elevator, the big spider and the lost daughter
  wall(-42, -10, 12, 15); wall(10, 42, 12, 15);
  wall(-42, -20, -14, -11); wall(-12, 6, -14, -11); wall(9, 30, -14, -11); buildSpiderDoor(rock);
  wall(-24, -21, -42, -22); wall(-24, -21, -18, -14);
  wall(20, 23, -11, 8); wall(-36, -30, -5, 0);
  for (let i = 0; i < 40; i++) { const x = rr(-40, 40), z = rr(-40, 40); if (Math.hypot(x, z) < 9 || Math.hypot(x, z - 32) < 6 || Math.hypot(x - CV.girlPos.x, z - CV.girlPos.z) < 5) continue; const s = rr(0.6, 2); caveScene.add(S(G.dodec, rock2, s, s * rr(0.8, 2), s, x, s * 0.5, z)); if (s > 1.2) CV.boxes.push({ x, z, hx: s * 0.7, hz: s * 0.7 }); }
  // stalactites
  for (let i = 0; i < 60; i++) { const x = rr(-41, 41), z = rr(-41, 41), h = rr(1, 4); const st = S(G.cone, rock2, rr(0.3, 0.8), h, rr(0.3, 0.8), x, CV.H - h / 2, z); st.rotation.x = Math.PI; caveScene.add(st); }
  // glowing mushrooms + lights
  const glowCols = [0x6ff7ff, 0xc77dff, 0x7dff8a, 0xff7ab8];
  let lights = 0;
  for (let i = 0; i < 46; i++) {
    const x = rr(-40, 40), z = rr(-40, 40); const col2 = pick(glowCols), s = rr(0.4, 1.3);
    const g = new THREE.Group(); g.position.set(x, 0, z); caveScene.add(g);
    g.add(S(G.cyl, mat(0xe8e0f0), 0.08 * s, 0.8 * s, 0.08 * s, 0, 0.4 * s, 0)); g.add(S(G.dome, mat(col2, { emissive: col2, emissiveIntensity: 1.2 }), 0.45 * s, 0.3 * s, 0.45 * s, 0, 0.78 * s, 0));
    if (lights < 10 && s > 0.9) { const l = new THREE.PointLight(col2, 0.8, 12); l.position.set(x, 1.5, z); caveScene.add(l); lights++; }
  }
  for (const [x, z, c2] of [[0, 0, 0xc77dff], [0, 30, 0x6ff7ff], [CV.girlPos.x, CV.girlPos.z, 0xff7ab8], [-30, 25, 0x7dff8a], [30, -28, 0x6ff7ff], [30, 28, 0xc77dff]]) { const l = new THREE.PointLight(c2, 1.1, 22); l.position.set(x, 6, z); caveScene.add(l); }
  // webs everywhere
  for (let i = 0; i < 18; i++) { const w = webMesh(rr(3, 7)); w.position.set(rr(-40, 40), rr(4, 10), rr(-40, 40)); w.rotation.set(rr(-0.5, 0.5), rr(0, 6), 0); caveScene.add(w); }
  // the elevator shaft
  const sh = new THREE.Group(); sh.position.set(0, 0, 32); caveScene.add(sh);
  sh.add(S(G.box, mat(0x30343e, { metalness: 0.6 }), 2, 0.1, 2, 0, 0.05, 0));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) sh.add(S(G.cyl, mat(0xc8ccd6, { metalness: 0.7 }), 0.06, CV.H, 0.06, x, CV.H / 2, z));
  sh.add(mesh(new THREE.PlaneGeometry(2, 0.5), new THREE.MeshBasicMaterial({ map: labelTex('LIFTAS AUKŠTYN', '#30343e', '#6ff7ff', 512, 112) }), 0, 3, -1.05));
  // the giant father spider in his chamber
  const dad = makeSpider(0x3a2a5a, 2.6, false); dad.position.set(0, 0, -2); caveScene.add(dad); CV.dad = dad; CV.boxes.push({ x: 0, z: -3, hx: 3.2, hz: 3.6 });
  for (let i = 0; i < 4; i++) { const w = webMesh(9); w.position.set(Math.cos(i * 1.6) * 6, 5, -2 + Math.sin(i * 1.6) * 6); w.rotation.y = i * 1.6; caveScene.add(w); }
  // the fly he will give you
  const fw = makeFlyInWeb(); fw.position.set(4.5, 2.2, 2.2); fw.rotation.y = -0.5; caveScene.add(fw); CV.fly = fw;
  if (Q3.stage === 'fly' || Q3.stage === 'done') fw.visible = false;
  // the lost daughter (bigger than you!)
  const girl = makeSpider(0xb05a9a, 1.25, true); girl.position.copy(CV.girlPos); caveScene.add(girl); CV.girl = girl;
  if (Q3.stage === 'fly' || Q3.stage === 'done') { girl.position.set(4, 0, 4); CV.girlState = 'home'; }
  caveScene.environment = scene.environment; linearize(caveScene);
}
function enterCave() {
  buildCave(); mode = 'cave'; caveScene.add(player.mesh);
  if (CV.girlState === 'following') CV.girlState = 'lost', CV.girl.position.copy(CV.girlPos);
  player.pos.set(0, 0, 32); player.up.set(0, 1, 0); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.grounded = true;
  camera.position.set(0, 3, 37); camera.up.set(0, 1, 0);
  musicSet(2);
  $('bName').textContent = 'Požemiai'; $('bEn').textContent = 'Po Didžiuoju Grybu'; $('bAtm').textContent = 'Tamsu, šviečia grybai, visur voratinkliai.'; document.documentElement.style.setProperty('--biome', '#c77dff');
  toast('Požemiai po Didžiuoju Grybu', Q3.stage === 'go' ? 'Kažkas didelis kvėpuoja tamsoje… Eik tiesiai' : 'Voro urvai', '#c77dff');
}
function leaveCave() {
  if (transitioning) return; transitioning = true; hideCard();
  tone(50, 2, { to: 90, type: 'sawtooth', vol: 0.05, lp: 400, attack: 0.3 });
  fadeTo(() => {
    transitioning = false; buildCapHouseRoom(); mode = 'caphouse'; chScene.add(player.mesh);
    player.pos.set(1.8 + 1.7, 0, -2.2 + 1.4); player.fwd.set(0, 0, 1); player.vel.set(0, 0, 0); player.vr = 0;
    camera.position.set(2, 2.2, 1); camera.up.set(0, 1, 0);
    $('bName').textContent = 'Namelis grybo kepurėje'; $('bEn').textContent = 'Grybų Karalystė'; $('bAtm').textContent = 'Liftas grąžino tave atgal į namelį.';
    if (Q3.stage === 'fly') toast('Turi musę voratinklyje!', 'Išeik iš namelio ir nunešk ją į muziejų Pradžios Mieste', '#c77dff');
  });
}
const DAD_FIRST = [
  'Ššš… Neišsigąsk, mažas žaliasis. Aš – Senasis Voras. Kūrėjas sakė, kad tu ateisi.',
  'Mano dukrelė Voratinklė išėjo pažaisti urvuose ir… pasiklydo. Girdžiu ją verkiant, bet mano kojos per senos ilgiems tuneliams.',
  'Ji nedidukė – na, didesnė už tave, bet vis tiek mažylė. Surask ją ir pasakyk, kad eitų paskui tave. Ji tavęs paklausys.',
  'Ji turėtų būti kažkur kairėje, giliausiame urvo kampe. Klausyk, kaip ji verkia.'
];
const DAD_WAIT = ['Dar nerandi? Ji kairėje, giliausiame kampe. Klausyk verkimo.'];
const DAD_THANKS = [
  'Voratinkle! Mano mažyte! Kaip aš jaudinausi!',
  'Ačiū tau, mažasis žaliasis. Neturiu daug, bet turiu tai, ką voras brangina labiausiai…',
  'Štai – musė mano geriausiame voratinklyje. Tikras lobis. Nunešk ją į muziejų, tegul visi mato, kad vorai irgi geri.',
];
function caveAction() {
  if (card) { if (!advanceTalk()) hideCard(); return; }
  if (spiderDoorAction()) return;
  if (Math.hypot(player.pos.x, player.pos.z - 32) < 2.2) { leaveCave(); return; }
  if (Math.hypot(player.pos.x - CV.dad.position.x, player.pos.z - CV.dad.position.z) < 8.5) {
    if (Q3.stage === 'go') { startTalk('Senasis Voras', DAD_FIRST, '#c77dff', () => { Q3.stage = 'find'; saveQ3(); toast('Surask voro dukrą Voratinklę', 'Ji kažkur kairėje, giliausiame urvų kampe', '#ff7ab8'); }); return; }
    if (Q3.stage === 'find' && CV.girlState === 'following') { reunite(); return; }
    if (Q3.stage === 'find') { startTalk('Senasis Voras', DAD_WAIT, '#c77dff'); return; }
    startTalk('Senasis Voras', ['Mudu su Voratinkle tau visada būsim dėkingi. Užsuk kada nors – arbatos su musėmis.'], '#c77dff'); return;
  }
  if (CV.girlState === 'lost' && Q3.stage !== 'go' && Math.hypot(player.pos.x - CV.girl.position.x, player.pos.z - CV.girl.position.z) < 4.5) {
    startTalk('Voratinklė', ['Ui! Kas tu? …Tave atsiuntė tėtis?', 'Aš pasiklydau ir labai išsigandau. Čia visi tuneliai vienodi!', 'Gerai, eisiu paskui tave. Tik neik per greitai – mano kojos susipainioja.'], '#ff7ab8', () => { CV.girlState = 'following'; toast('Voratinklė seka paskui tave', 'Nuvesk ją pas Senąjį Vorą', '#ff7ab8'); bubbleIn(caveScene, CV.girl.position, 'Einu!', 3.2); });
    return;
  }
  if (CV.girlState === 'lost' && Q3.stage === 'go' && Math.hypot(player.pos.x - CV.girl.position.x, player.pos.z - CV.girl.position.z) < 4.5) { startTalk('Voratinklė', ['Aš pasiklydau… Bet mama sakė nekalbėti su nepažįstamais. Gal pirma pasikalbėk su mano tėčiu?'], '#ff7ab8'); }
}
function reunite() {
  CV.girlState = 'home';
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.4, { type: 'triangle', vol: 0.06, when: i * 0.12 }));
  bubbleIn(caveScene, CV.dad.position, 'Mano mažyte!', 7); setTimeout(() => bubbleIn(caveScene, CV.girl.position, 'Tėti!', 3.2), 500);
  startTalk('Senasis Voras', DAD_THANKS, '#c77dff', () => {
    Q3.stage = 'fly'; saveQ3(); CV.fly.visible = false; attachFly(true);
    [392, 523, 659].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.06, when: i * 0.1 }));
    toast('Gavai musę voratinklyje!', 'Grįžk liftu aukštyn ir nunešk ją į muziejų Pradžios Mieste', '#ffd23a');
  });
}
let heldFly = null;
function attachFly(on) {
  const hand = player.mesh.userData.parts.handR;
  if (on && !heldFly) { heldFly = makeFlyInWeb(); heldFly.scale.setScalar(0.45); heldFly.position.set(0, -0.15, 0.2); hand.add(heldFly); linearize(heldFly); }
  if (!on && heldFly) { hand.remove(heldFly); heldFly = null; }
}
function deliverFly() {
  attachFly(false); Q3.stage = 'done'; saveQ3(); addMoney(250); refreshMuseumExtras();
  [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.6, { type: 'triangle', vol: 0.07, when: i * 0.12 }));
  toast('Įsakymas #3 įvykdytas!', 'Musė voratinklyje – naujas muziejaus eksponatas. Apdovanojimas: 250 €', '#ffe98a');
  q4Ready(true);
}
function updateCave(dt, t) {
  const moving = walkFlat(dt, { boxes: CV.boxes, x0: CV.x0, x1: CV.x1, z0: CV.z0, z1: CV.z1, H: CV.H, camDist: 5.5 });
  // father breathes and looks at you
  animSpider(CV.dad, t, false); CV.dad.rotation.y = lerp(CV.dad.rotation.y, Math.atan2(player.pos.x - CV.dad.position.x, player.pos.z - CV.dad.position.z), Math.min(1, dt * 1.5));
  // the daughter
  const gp = CV.girl.position;
  if (CV.girlState === 'lost') {
    animSpider(CV.girl, t, false); CV.girl.rotation.y = Math.sin(t * 0.5) * 0.6;
    CV.cryT = (CV.cryT || 0) - dt; if (CV.cryT < 0) { CV.cryT = 4; const d = player.pos.distanceTo(gp); if (d < 40) { const v = clamp(0.06 * (1 - d / 40), 0, 0.06); tone(700, 0.5, { to: 500, type: 'sine', vol: v, vib: 6 }); tone(650, 0.6, { to: 420, type: 'sine', vol: v, vib: 6, when: 0.55 }); if (d < 22) bubbleIn(caveScene, gp, pick(['Buhū…', 'Tėti?', 'Kur aš?']), 3.2); } }
  } else if (CV.girlState === 'following') {
    const target = player.pos.clone().addScaledVector(player.fwd, -3.2); target.y = 0;
    const to = target.clone().sub(gp); const d = to.length();
    const mv = d > 0.4; if (mv) { gp.addScaledVector(to.normalize(), Math.min(d, (d > 8 ? 9 : 5) * dt)); CV.girl.rotation.y = Math.atan2(to.x, to.z); }
    if (d > 30) gp.copy(target);
    animSpider(CV.girl, t, mv, 1.3);
    if (Math.hypot(gp.x - CV.dad.position.x, gp.z - CV.dad.position.z) < 11 && Q3.stage === 'find' && !card) reunite();
  } else { animSpider(CV.girl, t, false); gp.lerp(new V3(4.5, 0, 3.5), Math.min(1, dt)); }
  if (CV.fly && CV.fly.visible) CV.fly.userData.fly.rotation.z = Math.sin(t * 20) * 0.15;
  let txt = '';
  if (card) txt = '';
  else if (Math.hypot(player.pos.x, player.pos.z - 32) < 2.2) txt = '<kbd>E</kbd> kilti liftu aukštyn';
  else if (Math.hypot(player.pos.x - CV.dad.position.x, player.pos.z - CV.dad.position.z) < 8.5) txt = '<kbd>E</kbd> kalbėtis su Senuoju Voru';
  else if (CV.girlState === 'lost' && Math.hypot(player.pos.x - gp.x, player.pos.z - gp.z) < 4.5) txt = '<kbd>E</kbd> kalbėtis su Voratinkle';
  else if (CV.girlState === 'following') txt = 'Voratinklė seka paskui tave – nuvesk ją pas tėtį';
  txt = spiderDoorPrompt(txt);
  setPrompt(txt);
  updateQuestHud();
}
