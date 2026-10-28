// ================= The Star Goddess – commandment 3: the LIGHTNING STRIKE =================
// Build an AIRPLANE. The pod tower grows MUCH higher and harder, with CHECKPOINTS; 6 airplane parts lie on its stones.
// Build the plane like the time machine (drag the parts onto the blueprint), fly it to the Thunder God,
// get the LIGHTNING STRIKE from him and fly back to the Star Goddess.
const Q27 = { stage: 'none', parts: [], cp: -1, key: null };   // none | parts | build | fly | back | done
try { const s = JSON.parse(localStorage.getItem('modly-quest27') || 'null'); if (s) Object.assign(Q27, s); } catch (_) { }
function saveQ27() { try { localStorage.setItem('modly-quest27', JSON.stringify(Q27)); } catch (_) { } }
const PLN = { ext: [], cps: [], parts: [], flags: [], maxY: 0, starPlane: null, thPlane: null, fly: null, hud: null, picking: false, ready: 0 };
const EXT_N = 56, CP_EVERY = 10, CP_MID = 9, RUNWAY = new V3(9, 0, 34), TH_PARK = new V3(-9, 0, 12);
const PLANE_PARTS = [
  { id: 'prop', name: 'Propeleris', col: '#c8ccd6', path: '<rect x="45" y="10" width="10" height="80" rx="5" fill="#c8ccd6"/><circle cx="50" cy="50" r="12" fill="#ff5a3a"/>', at: 6 },
  { id: 'cockpit', name: 'Kabina', col: '#5ab0ff', path: '<path d="M15 70 Q50 10 85 70 Z" fill="#5ab0ff"/><rect x="15" y="68" width="70" height="12" fill="#e8e8f0"/>', at: 15 },
  { id: 'wingL', name: 'Kairysis sparnas', col: '#ffd23a', path: '<path d="M90 40 L10 30 L10 52 L90 60 Z" fill="#ffd23a"/>', at: 24 },
  { id: 'wingR', name: 'Dešinysis sparnas', col: '#ffd23a', path: '<path d="M10 40 L90 30 L90 52 L10 60 Z" fill="#ffd23a"/>', at: 33 },
  { id: 'tail', name: 'Uodega', col: '#ff5a3a', path: '<path d="M20 80 L40 15 L60 15 L70 80 Z" fill="#ff5a3a"/><rect x="10" y="70" width="80" height="12" fill="#ff5a3a"/>', at: 43 },
  { id: 'wheels', name: 'Ratai', col: '#2a2a2a', path: '<circle cx="28" cy="62" r="18" fill="#2a2a2a"/><circle cx="72" cy="62" r="18" fill="#2a2a2a"/><rect x="25" y="25" width="50" height="10" fill="#8a8a9a"/>', at: 52 }
];
const PLANE_SLOTS = { prop: [12, 50], cockpit: [42, 28], wingL: [50, 82], wingR: [50, 16], tail: [88, 40], wheels: [40, 92] };
function makePlane() {
  const g = new THREE.Group(), body = mat(0xf4f4fa, { roughness: 0.4 }), red = mat(0xff5a3a, { roughness: 0.4 }), yel = mat(0xffd23a, { roughness: 0.4 });
  const fus = S(G.cyl, body, 0.75, 6, 0.75, 0, 1.6, 0); fus.rotation.x = Math.PI / 2; g.add(fus);
  const nose = S(G.cone, red, 0.75, 1.2, 0.75, 0, 1.6, 3.6); nose.rotation.x = Math.PI / 2; g.add(nose);
  const prop = new THREE.Group(); prop.position.set(0, 1.6, 4.25); g.add(prop); prop.add(S(G.box, mat(0xc8ccd6, { metalness: 0.6 }), 0.25, 3, 0.08)); prop.add(S(G.sph, red, 0.25, 0.25, 0.25)); g.userData.prop = prop;
  g.add(S(G.box, yel, 9, 0.18, 1.7, 0, 1.5, 0.6));
  g.add(S(G.box, red, 3.2, 0.14, 0.9, 0, 1.9, -2.7)); g.add(S(G.box, red, 0.14, 1.5, 1, 0, 2.5, -2.8));
  g.add(S(G.sph, mat(0x5ab0ff, { transparent: true, opacity: 0.7, roughness: 0.05 }), 0.6, 0.55, 1, 0, 2.25, 0.9));
  for (const x of [-1.2, 1.2]) { g.add(S(G.cyl, mat(0x8a8a9a), 0.06, 0.9, 0.06, x, 0.75, 1)); g.add(S(G.cyl, mat(0x1a1a1a), 0.4, 0.25, 0.4, x, 0.4, 1).rotateZ(Math.PI / 2)); }
  g.add(S(G.cyl, mat(0x1a1a1a), 0.22, 0.15, 0.22, 0, 0.9, -2.6).rotateZ(Math.PI / 2));
  for (const x of [-4.3, 4.3]) g.add(S(G.sph, bmat(x < 0 ? 0xff3a3a : 0x3aff5a), 0.12, 0.12, 0.12, x, 1.5, 0.6));
  return g;
}
function makePlanePart(p) {
  const g = new THREE.Group(), col = new THREE.Color(p.col).getHex();
  if (p.id === 'prop') { g.add(S(G.box, mat(col, { metalness: 0.6 }), 0.25, 2.2, 0.1, 0, 1, 0)); g.add(S(G.sph, mat(0xff5a3a), 0.25, 0.25, 0.25, 0, 1, 0)); }
  else if (p.id === 'cockpit') g.add(S(G.sph, mat(col, { transparent: true, opacity: 0.75 }), 0.6, 0.5, 0.9, 0, 0.6, 0));
  else if (p.id === 'wingL' || p.id === 'wingR') g.add(S(G.box, mat(col), 2.4, 0.15, 0.9, 0, 0.5, 0));
  else if (p.id === 'tail') { g.add(S(G.box, mat(col), 1.6, 0.12, 0.6, 0, 0.4, 0)); g.add(S(G.box, mat(col), 0.12, 1, 0.6, 0, 0.9, 0)); }
  else { for (const x of [-0.5, 0.5]) g.add(S(G.cyl, mat(0x1a1a1a), 0.4, 0.25, 0.4, x, 0.45, 0).rotateZ(Math.PI / 2)); g.add(S(G.box, mat(0x8a8a9a), 1, 0.08, 0.08, 0, 0.45, 0)); }
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffe14d, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(2.6); gl.position.y = 0.8; g.add(gl);
  return g;
}
// ---------- the higher, harder tower with checkpoints ----------
{ const _b = buildStar; buildStar = () => { const first = !ST.built; _b(); if (first) buildTowerExt(); }; }
function buildTowerExt() {
  const g = PD.g, t = PD.top; let a = Math.atan2(t.z, t.x), y = t.y;
  const stone = mat(0x6a5a9a, { roughness: 0.9 }), moveM = mat(0x5a8ae8, { emissive: 0x1a2a6a }), blinkM = mat(0xe85ab0, { emissive: 0x5a1a3a }), cpM = mat(0x3ae85a, { emissive: 0x1a6a2a });
  for (let i = 0; i < EXT_N; i++) {
    const cp = i === CP_MID, type = cp || i < 2 ? 0 : i % 4 === 1 ? 1 : i % 3 === 2 ? 2 : 0, r = 8 + (i % 2) * 0.8;
    a += 0.4; y += 1.45;
    const x = Math.cos(a) * r, z = Math.sin(a) * r, sz = cp ? 1.6 : type === 1 ? 1.25 : 1.1;
    const m = S(G.box, cp ? cpM : type === 1 ? moveM : type === 2 ? blinkM : stone, sz * 2, 0.5, sz * 2, x, y - 0.25, z); g.add(m);
    const box = { x: POD_C.x + x, z: POD_C.z + z, hx: sz, hz: sz, h: y, top: true };
    ST.boxes.push(box); const p = { m, box, x, y, z, type, ph: i * 1.7 + 0.5, dx: 0, dz: 0, ext: true, cp }; PD.plats.push(p); PLN.ext.push(p);
    if (cp) { const f = new THREE.Group(); f.position.set(x, y, z); g.add(f); f.add(S(G.cyl, mat(0xdddddd), 0.06, 2.4, 0.06, 0.9, 1.2, 0.9)); const fl = S(G.box, mat(0x3ae85a, { emissive: 0x1a8a2a }), 0.9, 0.55, 0.04, 1.35, 2.1, 0.9); f.add(fl); f.userData.fl = fl; PLN.flags.push({ f, p }); PLN.cps.push(p); }
  }
  // only ONE checkpoint – right in the middle of the whole climb. cps[0] is an unreachable placeholder (keeps the 🚩 1/1 counter)
  PLN.cps.unshift({ box: { x: 1e9, z: 1e9, hx: 0, hz: 0, h: -1e9 } });
  if (Q27.cp > 1) Q27.cp = 1; else if (Q27.cp === 0) Q27.cp = -1; saveQ27();
  PLANE_PARTS.forEach(pp => { const p = PLN.ext[pp.at], m = makePlanePart(pp); m.position.set(p.x, p.y, p.z); g.add(m); PLN.parts.push({ m, p, id: pp.id }); });
  // a higher "no flying" column
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(POD_R, POD_R, 90, 40, 1, true), new THREE.MeshBasicMaterial({ color: 0x3ae85a, transparent: true, opacity: 0.03, side: THREE.DoubleSide, depthWrite: false })).translateY(95));
  linearize(g);
  // the parked airplane on the star
  PLN.starPlane = makePlane(); PLN.starPlane.position.copy(RUNWAY); PLN.starPlane.rotation.y = Math.PI; stScene.add(PLN.starPlane); linearize(PLN.starPlane);
  ST.boxes.push({ x: RUNWAY.x, z: RUNWAY.z, hx: 1, hz: 3, h: 1.8, plane: true });
  refreshPlane();
}
const extOn = () => Q27.stage === 'parts';
function refreshPlane() {
  PLN.ext.forEach(p => { p.m.visible = extOn(); if (!extOn()) p.box.h = -999; else if (p.type !== 2) p.box.h = p.y; });
  PLN.flags.forEach(f => f.f.visible = extOn());
  PLN.parts.forEach(pt => pt.m.visible = extOn() && !Q27.parts.includes(pt.id));
  if (PLN.starPlane) { const on = Q27.stage === 'fly' || Q27.stage === 'done' || (Q27.stage === 'back' && Q27.home); PLN.starPlane.visible = on && !(PLN.fly && PLN.fly.scene === stScene); const b = ST.boxes.find(q => q.plane); if (b) b.h = PLN.starPlane.visible ? 1.8 : -999; }
}
// ---------- the build (the same blueprint table as the time machine) ----------
let PBD = { on: false, placed: {} };
function openPlaneBuild() {
  PBD = { on: true, placed: {} }; tmOpen = true; $('tmBuild').hidden = false; $('paused').hidden = true; for (const k in keys) keys[k] = false;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  const area = $('tmArea'), tray = $('tmTray'); area.querySelectorAll('.tmSlot').forEach(e => e.remove()); tray.innerHTML = '';
  $('tmBuild').querySelector('h2').textContent = 'Lėktuvo statyba'; $('tmBuild').querySelector('.eyebrow').textContent = 'Žvaigždžių Dievės dirbtuvė'; $('tmHammer').textContent = 'Suveržti varžtus';
  area.querySelector('.tmBlue').style.display = 'none';
  let bp = area.querySelector('.planeBlue'); if (!bp) { bp = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); bp.setAttribute('class', 'planeBlue'); bp.setAttribute('viewBox', '0 0 100 60'); bp.setAttribute('preserveAspectRatio', 'none'); bp.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    bp.innerHTML = '<rect width="100" height="60" fill="#1d3a6a"/><rect width="100" height="60" fill="url(#tmGrid)"/><g fill="none" stroke="#bfe0ff" stroke-width=".4" stroke-dasharray="1.5 1"><path d="M14 30 Q20 22 40 23 L82 26 L90 18 L94 18 L92 30 L94 42 L90 42 L82 34 L40 37 Q20 38 14 30 Z"/><path d="M44 23 L50 4 L58 4 L56 24"/><path d="M44 37 L50 56 L58 56 L56 36"/><path d="M12 22 L12 38"/></g>'; area.insertBefore(bp, area.firstChild); }
  bp.style.display = '';
  for (const p of PLANE_PARTS) { const [x, y] = PLANE_SLOTS[p.id]; const s = document.createElement('div'); s.className = 'tmSlot'; s.dataset.id = p.id; s.style.left = x + '%'; s.style.top = y + '%'; s.innerHTML = `<svg viewBox="0 0 100 100">${p.path}</svg><span>${p.name}</span>`; area.appendChild(s); }
  PLANE_PARTS.slice().sort(() => Math.random() - 0.5).forEach(p => { const b = document.createElement('div'); b.className = 'tmPart'; b.dataset.id = p.id; b.innerHTML = `<svg viewBox="0 0 100 100">${p.path}</svg><span>${p.name}</span>`; tray.appendChild(b); b.addEventListener('pointerdown', e => dragPlanePart(e, b, p)); });
  $('tmHammer').disabled = true; $('tmMsg').textContent = 'Tempk kiekvieną lėktuvo dalį ant jos vietos brėžinyje.';
}
function dragPlanePart(e, el, p) {
  if (el.classList.contains('placed')) return; e.preventDefault();
  const ghost = el.cloneNode(true); ghost.classList.add('drag'); document.body.appendChild(ghost);
  const move = ev => { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; }; move(e);
  const up = ev => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); ghost.remove(); let hit = null;
    document.querySelectorAll('#tmArea .tmSlot').forEach(s => { const r = s.getBoundingClientRect(); if (ev.clientX > r.left - 10 && ev.clientX < r.right + 10 && ev.clientY > r.top - 10 && ev.clientY < r.bottom + 10) hit = s; });
    if (hit && !hit.classList.contains('filled') && hit.dataset.id === p.id) { planePlace(hit, el); }
    else if (hit) { tone(220, 0.2, { type: 'square', vol: 0.05, lp: 1200 }); $('tmMsg').textContent = `Ne, ${p.name.toLowerCase()} čia netinka. Pažiūrėk į formą!`; el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 400); } };
  addEventListener('pointermove', move); addEventListener('pointerup', up);
}
function planePlace(slot, el) {
  slot.classList.add('filled'); el.classList.add('placed'); PBD.placed[slot.dataset.id] = true; tone(660, 0.1, { type: 'triangle', vol: 0.06 }); tone(990, 0.12, { type: 'triangle', vol: 0.05, when: 0.06 });
  const left = PLANE_PARTS.length - Object.keys(PBD.placed).length; $('tmMsg').textContent = left ? `Puiku! Liko ${left}.` : 'Visos dalys savo vietose! Dabar suveržk varžtus.'; if (!left) $('tmHammer').disabled = false;
}
setTimeout(() => {
$('tmHammer').addEventListener('click', e => { if (!PBD.on) return; e.stopImmediatePropagation(); $('tmHammer').disabled = true; let k = 0; const bang = () => { tone(900 + k * 60, 0.05, { type: 'square', vol: 0.04 }); noiseHit(0.06, { f: 2400, vol: 0.1 }); $('tmArea').classList.toggle('bump'); if (++k < 8) setTimeout(bang, 160); else finishPlane(); }; $('tmMsg').textContent = 'Vrrr… vrrr… vrrr…'; bang(); }, true);
$('tmClose').addEventListener('click', () => { if (PBD.on) planeBuildClose(); }, true);
}, 0);
function planeBuildClose() { PBD.on = false; const area = $('tmArea'); area.querySelector('.tmBlue').style.display = ''; const bp = area.querySelector('.planeBlue'); if (bp) bp.style.display = 'none'; $('tmBuild').querySelector('h2').textContent = 'Laiko mašinos statyba'; $('tmBuild').querySelector('.eyebrow').textContent = 'Kūrėjo Salė'; $('tmHammer').textContent = 'Sukalti plaktuku ir vinimis'; }
function finishPlane() {
  $('tmMsg').textContent = 'LĖKTUVAS PASTATYTAS!'; [262, 392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
  setTimeout(() => { closeTMBuild(); planeBuildClose(); Q27.stage = 'fly'; saveQ27(); refreshPlane(); toast('Lėktuvas pastatytas! ✈', 'Jis stovi mieste, netoli Dievės. Lipk į jį (E) ir skrisk pas Griaustinio Dievą!', '#ffd23a'); }, 1400);
}
addEventListener('keydown', e => { if (PBD.on && e.code === 'Escape') setTimeout(planeBuildClose, 0); }, true);
// ---------- flying ----------
const FLY_GOAL_STAR = new V3(0, 95, -330), FLY_GOAL_TH = new V3(-60, 75, -560);
function makeFlyRing(col) { const g = new THREE.Group(); const r = new THREE.Mesh(new THREE.TorusGeometry(9, 0.8, 10, 48), bmat(col)); g.add(r); const d = new THREE.Mesh(new THREE.CircleGeometry(8.4, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false })); g.add(d); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: col, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); gl.scale.setScalar(50); g.add(gl); g.userData.r = r; return g; }
function startFlight(scene, plane, goal, ringCol, onArrive, meteors) {
  if (!PLN.rings) PLN.rings = {}; let ring = PLN.rings[ringCol]; if (!ring) { ring = makeFlyRing(ringCol); PLN.rings[ringCol] = ring; }
  scene.add(ring); ring.position.copy(goal); ring.lookAt(plane.position.x, goal.y, plane.position.z);
  hideCard(); for (const k in keys) keys[k] = false;
  const f = { meteors, mets: [], metT: 2, hits: 0, scene, plane, goal, ring, pos: plane.position.clone(), yaw: plane.rotation.y, vy: 0, speed: 0, t: 0 }; PLN.fly = f;
  player.mesh.visible = false; toast('Skrendi! ✈', 'A/D – sukti · W – aukštyn · S – žemyn · Shift – greičiau. Skrisk į didįjį ratą danguje!', '#ffd23a');
  cinema = dt => {
    f.t += dt; const fast = keys.ShiftLeft || keys.ShiftRight; f.speed = Math.min(fast ? 34 : 22, f.speed + dt * 12);
    if (keys.KeyA || keys.ArrowLeft) f.yaw += dt * 1.3; if (keys.KeyD || keys.ArrowRight) f.yaw -= dt * 1.3;
    const climb = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0); f.vy += (climb * 12 - f.vy) * Math.min(1, dt * 2);
    const takeoff = Math.min(1, f.t / 1.2); f.pos.x += Math.sin(f.yaw) * f.speed * dt; f.pos.z += Math.cos(f.yaw) * f.speed * dt; f.pos.y = Math.max(2 * takeoff, f.pos.y + (f.vy + (f.t < 3.2 ? 14 : 0)) * dt * takeoff);
    if (f.pos.y > 150) f.pos.y = 150; const R0 = Math.hypot(f.pos.x, f.pos.z); if (R0 > 600) { f.pos.x *= 600 / R0; f.pos.z *= 600 / R0; }
    plane.position.copy(f.pos); plane.rotation.set(-f.vy * 0.03, f.yaw, ((keys.KeyA ? -1 : 0) + (keys.KeyD ? 1 : 0)) * 0.35); plane.userData.prop.rotation.z += dt * 40;
    player.pos.copy(f.pos); ring.userData.r.rotation.z += dt;
    if (f.meteors) {   // meteors fly across the sky on the way back
      f.metT -= dt; if (f.metT < 0) { f.metT = rr(0.25, 0.6); const m = new THREE.Group(); const sz = rr(1.2, 3.2); m.add(S(G.dodec, mat(pick([0x6a4a3a, 0x5a5a62, 0x7a3a2a]), { roughness: 1 }), sz, sz * 0.85, sz)); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xff7a1a, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(sz * 3.2); m.add(gl);
        const ahead = new V3(Math.sin(f.yaw), 0, Math.cos(f.yaw)), side = new V3(Math.cos(f.yaw), 0, -Math.sin(f.yaw)), tgt = f.pos.clone().addScaledVector(ahead, rr(25, 70)).addScaledVector(side, rr(-12, 12)).add(new V3(0, rr(-8, 8), 0));
        const from = tgt.clone().addScaledVector(side, rr(-1, 1) > 0 ? 60 : -60).add(new V3(0, rr(20, 45), 0)); m.position.copy(from); scene.add(m); f.mets.push({ m, v: tgt.clone().sub(from).normalize().multiplyScalar(rr(22, 34)), r: sz * 1.1 + 2, life: 6, spin: randDir() }); }
      for (let i = f.mets.length - 1; i >= 0; i--) { const q = f.mets[i]; q.life -= dt; q.m.position.addScaledVector(q.v, dt); q.m.rotation.x += q.spin.x * dt * 3; q.m.rotation.y += q.spin.y * dt * 3;
        if (Math.random() < dt * 20) { const s = S(G.sph, bmat(pick([0xff7a1a, 0xffd23a]), { transparent: true, opacity: 0.7 }), 0.4, 0.4, 0.4); s.position.copy(q.m.position); scene.add(s); let life = 0.5; fx.push(d => { life -= d; s.scale.multiplyScalar(1 - d * 1.5); if (life <= 0) { scene.remove(s); return false; } return true; }); }
        if (q.m.position.distanceTo(f.pos) < q.r) { scene.remove(q.m); f.mets.splice(i, 1); f.hits++; fireBoom(scene, f.pos); shake = Math.max(shake, 1); redFlash('rgba(255,120,40,.6)', 300); noiseHit(0.8, { f: 400, fto: 60, vol: 0.25 }); f.speed = 0; f.pos.addScaledVector(new V3(Math.sin(f.yaw), 0, Math.cos(f.yaw)), -20); f.pos.y = Math.max(4, f.pos.y - 6); toast('BUMPT! Meteoras! ☄', 'Lėktuvą atmušė atgal – suk (A/D) ir kilk ar leiskis (W/S), kad apskristum meteorus', '#ff7a1a'); continue; }
        if (q.life <= 0 || q.m.position.y < -20) { scene.remove(q.m); f.mets.splice(i, 1); } }
    }
    _ct.set(f.pos.x - Math.sin(f.yaw) * 16, f.pos.y + 6, f.pos.z - Math.cos(f.yaw) * 16); camera.position.lerp(_ct, Math.min(1, dt * 3)); camera.up.set(0, 1, 0); camera.lookAt(f.pos.x + Math.sin(f.yaw) * 10, f.pos.y + 1, f.pos.z + Math.cos(f.yaw) * 10);
    if (Math.random() < dt * 3) tone(rr(90, 110), 0.15, { type: 'sawtooth', vol: 0.015, lp: 400 });
    const dist = f.pos.distanceTo(goal);
    if (!PLN.hud) { const d = document.createElement('div'); d.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);background:rgba(30,24,8,.85);color:#fff4c8;border:1px solid rgba(255,210,58,.5);border-radius:14px;padding:6px 18px;font:700 15px system-ui,sans-serif;z-index:5;pointer-events:none;text-align:center'; document.body.appendChild(d); PLN.hud = d; }
    PLN.hud.hidden = false; const ang = Math.atan2(goal.x - f.pos.x, goal.z - f.pos.z) - f.yaw, a2 = Math.atan2(Math.sin(ang), Math.cos(ang));
    PLN.hud.innerHTML = `✈ Iki rato: <b>${Math.round(dist)} m</b> · ${Math.abs(a2) < 0.3 ? 'tiesiai ⬆' : a2 > 0 ? '⬅ sukis į kairę (A)' : 'sukis į dešinę (D) ➡'} · ${goal.y - f.pos.y > 8 ? 'kilk aukštyn (W)' : f.pos.y - goal.y > 8 ? 'leiskis žemyn (S)' : 'aukštis gerai'}`;
    if (dist < 9 && !transitioning) { transitioning = true; PLN.hud.hidden = true; redFlash('rgba(255,240,180,.9)', 500); fadeTo(() => { transitioning = false; cinema = null; scene.remove(ring); f.mets.forEach(q => scene.remove(q.m)); PLN.fly = null; player.mesh.visible = true; onArrive(); }); }
  };
}
// ---------- the lightning power ----------
let boltReadyAt = 0;
function doBolt() {
  const now = performance.now(); if (now < boltReadyAt) return; boltReadyAt = now + 1500;
  const sc = FB.lastScene; if (!sc) return; let p;
  if (mode === 'planet') { const d = moveAlong(player.pos.clone().normalize(), player.fwd, 10); p = d.clone().multiplyScalar(R + groundH(d)); const top = d.clone().multiplyScalar(R + groundH(d) + 40);
    zapLine(sc, top, p, 0xffffff, 0.35); zapLine(sc, top.clone().add(randDir().multiplyScalar(2)), p, 0xffe14d, 0.3);
    for (const c of critters) if (c.pos.distanceTo(p) < 5) knockCritter(c, player.fwd, 14); }
  else { p = player.pos.clone().addScaledVector(new V3(player.fwd.x, 0, player.fwd.z).normalize(), 10); const top = p.clone().add(new V3(rr(-3, 3), 40, rr(-3, 3))); zapLine(sc, top, p, 0xffffff, 0.35); zapLine(sc, top.clone().add(new V3(1, 0, 1)), p, 0xffe14d, 0.3); }
  fireBoom(sc, p); redFlash('rgba(230,240,255,.7)', 160); shake = Math.max(shake, 0.5);
  noiseHit(1.2, { f: 300, fto: 50, vol: 0.25 }); tone(80, 0.6, { to: 40, type: 'sawtooth', vol: 0.1, lp: 600 });
}
function boltKeyRow() { const k = $('keys'); if (!k || !Q27.key) return; let r = $('boltRow'); if (!r) { r = document.createElement('span'); r.id = 'boltRow'; const lab = document.createElement('span'); lab.id = 'boltLab'; const hEl = [...k.children].find(c => c.innerHTML.includes('<kbd>H</kbd>')); k.insertBefore(lab, hEl || null); k.insertBefore(r, lab); } r.innerHTML = `<kbd>${keyLabel(Q27.key)}</kbd>`; $('boltLab').textContent = '⚡ žaibo smūgis'; }
setTimeout(boltKeyRow, 0);
const boltKeys = () => FREE_KEYS.filter(k => k !== Q25.key && k !== Q26.key);
addEventListener('keydown', e => {
  if (PLN.picking) { e.stopImmediatePropagation(); e.preventDefault();
    if (e.code === 'Escape') return;
    PLN.picking = false; Q27.key = 'Digit3'; Q27.stage = 'back'; saveQ27(); hideCard(); boltKeyRow();
    bigBanner('⚡ ŽAIBO SMŪGIS!', 'Klavišas 3 – dabar skrisk atgal pas Žvaigždžių Dievę');
    setTimeout(() => toast('Išbandyk!', `Spausk 3 – žaibas trenks 10 m priešais tave. Paskui lipk į lėktuvą (E) ir skrisk atgal!`, '#ffe14d'), 2500); return; }
  if (Q27.key && e.code === Q27.key && !e.repeat && started && !card && !mPhoneOpen && !cinema && mode !== 'attract' && mode !== 'dig') doBolt();
}, true);
// ---------- the Thunder God gives the power; fly back from the storm world ----------
function parkThunderPlane() { if (!PLN.thPlane) { PLN.thPlane = makePlane(); linearize(PLN.thPlane); } thScene.add(PLN.thPlane); PLN.thPlane.position.copy(TH_PARK); PLN.thPlane.rotation.y = Math.PI; PLN.thPlane.visible = true; }
const nearThPlane = () => PLN.thPlane && PLN.thPlane.visible && mode === 'thunder' && Math.hypot(player.pos.x - TH_PARK.x, player.pos.z - TH_PARK.z) < 5;
{ const _a = thunderAction; thunderAction = () => {
    if (card) return _a();
    if (Q27.stage === 'fly' && PLN.thPlane && PLN.thPlane.visible && nearThunderGod()) {
      startTalk('Griaustinio Dievas', ['BUM BUM?! Lėktuvu?! Pas MANE?! Tu – beprotiškai drąsus, žaliasis!', 'Žvaigždžių Dievė tave atsiuntė? Žinau, žinau. Jos trečiasis įsakymas – ŽAIBO SMŪGIS.', 'Gerai. Tu nukasei man 5 kilometrus ir grąžinai lietų. Tu to nusipelnei.', 'Ištiesk ranką… BUUUUM! Štai – dabar tavyje gyvena mano žaibas!'], '#c8b0ff', () => {
        redFlash('rgba(230,240,255,.95)', 600); shake = 1; noiseHit(1.5, { f: 300, fto: 50, vol: 0.3 }); zapLine(thScene, THW.dragon.position.clone().add(new V3(0, 6, 0)), player.pos.clone().add(new V3(0, 1, 0)), 0xffffff, 0.6);
        setTimeout(() => { PLN.picking = true; card = { kind: 'keypick' }; showCard('⚡ Žaibas tavyje!', 'Tavo ŽAIBO SMŪGIS visada bus klavišas 3. Paspausk bet kurį klavišą, kad tęstum.', 'Paspausk klavišą', '#ffe14d'); }, 700); }); return;
    }
    if (nearThPlane() && (Q27.stage === 'back' || Q27.stage === 'fly')) {
      if (Q27.stage === 'fly') { startTalk('Lėktuvas', ['Pirma pasikalbėk su Griaustinio Dievu – jis ant didžiojo debesies!'], '#ffd23a'); return; }
      startFlight(thScene, PLN.thPlane, FLY_GOAL_TH, 0xffd23a, () => { PLN.thPlane.visible = false; enterStar(); player.pos.set(RUNWAY.x - 3.5, 0, RUNWAY.z); Q27.home = true; saveQ27(); refreshPlane(); PLN.starPlane.visible = true; toast('Grįžai ant žvaigždės! ✈', 'Eik pas Žvaigždžių Dievę (E)', '#ffe8a0'); }, true); return;
    }
    return _a();
  }; }
{ const _u = updateThunder; updateThunder = (dt, t) => { _u(dt, t); if (!card && nearThPlane()) setPrompt(Q27.stage === 'back' ? '<kbd>E</kbd> lipti į lėktuvą ir skristi atgal' : 'Tavo lėktuvas'); }; }
// ---------- the Star Goddess, the tower and the plane on the star ----------
const nearStarPlane = () => PLN.starPlane && PLN.starPlane.visible && mode === 'star' && Math.hypot(player.pos.x - RUNWAY.x, player.pos.z - RUNWAY.z) < 5;
{ const _a = starAction; starAction = () => {
    if (card) return _a();
    { const pt = PLN.parts.find(q => q.m.visible && player.pos.distanceTo(q.m.getWorldPosition(new V3()).add(new V3(0, 0.5, 0))) < 2.2); if (pt) { Q27.parts.push(pt.id); saveQ27(); refreshPlane(); tone(1047, 0.15, { type: 'triangle', vol: 0.06 }); tone(1568, 0.15, { type: 'triangle', vol: 0.05, when: 0.08 }); const nm = PLANE_PARTS.find(q => q.id === pt.id).name; toast(`Radai: ${nm}! (${Q27.parts.length}/6)`, Q27.parts.length >= 6 ? 'Visos lėktuvo dalys! Nešk jas Žvaigždžių Dievei' : 'Lipk aukštyn – kitos dalys dar aukščiau', '#ffd23a'); return; } }
    if (nearStarPlane() && Q27.stage === 'fly') { startFlight(stScene, PLN.starPlane, FLY_GOAL_STAR, 0x9a7aff, () => { PLN.starPlane.visible = false; enterThunder(); parkThunderPlane(); player.pos.set(TH_PARK.x + 4, 0, TH_PARK.z); toast('Atskridai į Audrų pasaulį! ⚡', 'Eik pas Griaustinio Dievą ant didžiojo debesies (E)', '#c8b0ff'); }); return; }
    if (nearStarGoddess() && Q26.stage === 'done' && Q27.stage !== 'done') {
      if (Q27.stage === 'none') { startTalk('Žvaigždžių Dievė', ['Teleportacija – tavo. Bet trečiasis įsakymas dar sunkesnis: ŽAIBO SMŪGIS.', 'Žaibą turi tik vienas – Griaustinio Dievas. Pas jį reikia NUSKRISTI. Lėktuvu!', 'Lėktuvo dalys – ant mano Ankščių bokšto. Jis dabar išaugo daug AUKŠČIAU ir pasidarė daug SUNKESNIS. Bet ten yra žalios vėliavėlės – kontroliniai taškai. Nukritęs atsirasi ant paskutinės, kurią pasiekei.', 'Surink 6 lėktuvo dalis, atnešk man – ir pastatysi lėktuvą taip pat, kaip kadaise laiko mašiną.'], '#ffe8a0', () => { Q27.stage = 'parts'; Q27.cp = -1; saveQ27(); refreshPlane(); toast('3 įsakymas: Žaibo smūgis', 'Ankščių bokštas išaugo! Lipk aukštyn ir rink lėktuvo dalis', '#ffd23a'); }); return; }
      if (Q27.stage === 'parts') { if (Q27.parts.length < 6) { startTalk('Žvaigždžių Dievė', [`Lėktuvo dalių: ${Q27.parts.length} iš 6. Lipk aukščiau Ankščių bokštu!`], '#ffe8a0'); return; }
        startTalk('Žvaigždžių Dievė', ['Visos šešios dalys! Štai mano dirbtuvės stalas su brėžiniu. Statyk!'], '#ffe8a0', () => { Q27.stage = 'build'; saveQ27(); refreshPlane(); openPlaneBuild(); }); return; }
      if (Q27.stage === 'build') { openPlaneBuild(); return; }
      if (Q27.stage === 'fly') { startTalk('Žvaigždžių Dievė', ['Tavo lėktuvas stovi mieste, netoli manęs. Lipk (E) ir skrisk į didįjį violetinį ratą danguje – jis nuves pas Griaustinio Dievą.'], '#ffe8a0'); return; }
      if (Q27.stage === 'back') {
        startTalk('Žvaigždžių Dievė', ['Grįžai… ir mano žvaigždės dar niekada taip nešvietė nuo žaibo! ⚡', 'Trečiasis įsakymas įvykdytas. Žaibo smūgis – tavo. Liko du… ir jie – patys sunkiausi.'], '#ffe8a0', () => { Q27.stage = 'done'; saveQ27(); refreshPlane(); Q24.done = Math.max(Q24.done, 3); saveQ24(); if (ST.board) { ST.board.material.map = boardTex(); ST.board.material.needsUpdate = true; } bigBanner('3 ĮSAKYMAS ĮVYKDYTAS!', `Žaibo smūgis – klavišas ${keyLabel(Q27.key)}`); addMoney(3000); }); return;
      }
    }
    return _a();
  }; }
{ const _u = updateStar; updateStar = (dt, t) => { _u(dt, t);
    if (!PLN.ext.length) return;
    refreshPlaneTick(); if (!extOn()) { for (const p of PLN.ext) { p.m.visible = false; p.box.h = -999; } if (!card && nearStarPlane() && Q27.stage === 'fly') setPrompt('<kbd>E</kbd> lipti į lėktuvą ir skristi pas Griaustinio Dievą'); return; }
    PLN.parts.forEach(pt => { if (pt.m.visible) { pt.m.position.set(pt.p.m.position.x, pt.p.y + Math.sin(t * 2) * 0.1, pt.p.m.position.z); pt.m.rotation.y += dt * 1.5; } });
    PLN.flags.forEach(f => { f.f.position.set(f.p.m.position.x, f.p.y, f.p.m.position.z); f.f.userData.fl.rotation.y = Math.sin(t * 3) * 0.3; });
    if (!inPodTower()) return;
    // checkpoints
    if (player.grounded) PLN.cps.forEach((p, i) => { if (i > Q27.cp && Math.abs(player.pos.y - p.box.h) < 0.1 && Math.abs(player.pos.x - p.box.x) < p.box.hx + 0.4 && Math.abs(player.pos.z - p.box.z) < p.box.hz + 0.4) { Q27.cp = i; saveQ27(); tone(784, 0.15, { type: 'triangle', vol: 0.06 }); tone(1175, 0.2, { type: 'triangle', vol: 0.05, when: 0.1 }); toast(`Kontrolinis taškas ${i}/${PLN.cps.length - 1}! 🚩`, 'Nukritęs atsirasi čia', '#3ae85a'); } });
    if (!player.grounded) PLN.maxY = Math.max(PLN.maxY, player.pos.y);
    else { const lastP = PLN.ext[EXT_N - 1]; if (Math.abs(player.pos.y - lastP.box.h) < 0.1 && Math.hypot(player.pos.x - lastP.box.x, player.pos.z - lastP.box.z) < 2) { if (!Q27.topped) { Q27.topped = true; saveQ27(); toast('Pasiekei viršūnę! 🏆', 'Dabar gali drąsiai nušokti žemyn – kontrolinis taškas tavęs nebetrauks', '#3ae85a'); } }
    if (player.pos.y < 0.5 && PLN.maxY > 4 && Q27.cp >= 1 && PLN.cps[Q27.cp] && !Q27.topped && Q27.parts.length < 6) { const p = PLN.cps[Q27.cp]; player.pos.set(p.box.x, p.box.h + 0.05, p.box.z); player.vel.set(0, 0, 0); player.vr = 0; redFlash('rgba(58,232,90,.4)', 300); toast('Nukritai…', `Grįžai į kontrolinį tašką ${Q27.cp}`, '#3ae85a'); } PLN.maxY = 0; }
    if (!card) { const near = PLN.parts.find(q => q.m.visible && player.pos.distanceTo(q.m.getWorldPosition(new V3()).add(new V3(0, 0.5, 0))) < 2.2); setPrompt(near ? '<kbd>E</kbd> paimti lėktuvo dalį' : `✈ Dalys: ${Q27.parts.length}/6 · 🚩 ${Math.max(0, Q27.cp)}/${PLN.cps.length - 1} · aukštis ${Math.floor(player.pos.y)} m / ${Math.floor(PLN.ext[EXT_N - 1].y)} m`); }
  }; }
let plTickRef = '';
function refreshPlaneTick() { const k = Q27.stage + Q27.parts.length + !!Q27.home; if (k !== plTickRef) { plTickRef = k; refreshPlane(); } }
fx.push(() => { if (PLN.hud && !PLN.fly) PLN.hud.hidden = true; return true; });
function planeTest(n) {
  portalTest(1); Q26.stage = 'done'; Q26.key = 'Digit2'; saveQ26(); teleKeyRow(); Q25.key = 'Digit1'; saveQ25(); fireKeyRow();
  Q27.stage = 'parts'; Q27.parts = []; Q27.cp = -1; if (n >= 1) Q27.parts = PLANE_PARTS.map(p => p.id); if (n >= 2) Q27.stage = 'fly'; if (n >= 3) Q27.stage = 'back'; saveQ27(); refreshPlane();
  if (n >= 2) player.pos.set(RUNWAY.x - 3.5, 0, RUNWAY.z); else player.pos.set(POD_C.x + 3, 0, POD_C.z + 3);
  toast('Bandymų pasaulis: lėktuvas', ['Lipk Ankščių bokštu ir rink dalis', 'Visos dalys – eik pas Dievę', 'Lėktuvas pastatytas – lipk (E)', 'Turi žaibą – eik pas Dievę'][Math.min(3, n | 0)], '#ffd23a');
}

// ---------- test world (one time): send you back to the Thunder world to fly home through the meteors ----------
{ const _u = updateStar; updateStar = (dt, t) => { _u(dt, t);
    let done = true;   // test-world jump switched off (flyback)
    if (done || Q27.stage !== 'back' || Q27.home || cinema || transitioning || Date.now() > Date.UTC(2026, 9, 31)) return;
    try { localStorage.setItem('modly-flyback', '1'); } catch (_) { }
    enterThunder(); parkThunderPlane(); player.pos.set(TH_PARK.x + 4, 0, TH_PARK.z);
    setTimeout(() => toast('Bandymų pasaulis: skrydis atgal ✈', 'Lipk į lėktuvą (E) – kelias atgal ilgas, pilnas meteorų!', '#ffd23a'), 900);
  }; }

if (Q27.key && Q27.key !== 'Digit3') { Q27.key = 'Digit3'; saveQ27(); }
