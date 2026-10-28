// ================= Sanctum of the Creator =================
const sanc = new THREE.Scene();
sanc.background = new THREE.Color(0x0e0824);
sanc.fog = new THREE.FogExp2(0x1a0f3a, 0.011);
sanc.add(new THREE.AmbientLight(0xbfb0ff, 0.6));
const sancLight = new THREE.PointLight(0xfff1c0, 2.2, 120); sancLight.position.set(0, 16, -18); sanc.add(sancLight);
const creator = new THREE.Group(); creator.position.set(0, 14, -18); sanc.add(creator);
const sancAnim = [];
function buildSanctum() {
  const plat = mesh(new THREE.CylinderGeometry(30, 24, 2, 64), mat(0xf1eaff), 0, -1, 0); sanc.add(plat);
  for (const r of [8, 16, 24, 29]) { const ring = mesh(new THREE.RingGeometry(r - 0.15, r + 0.15, 96), bmat(0xffd76a, { side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; sanc.add(ring); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const l = mesh(new THREE.PlaneGeometry(0.3, 24), bmat(0xffd76a, { side: THREE.DoubleSide }), Math.cos(a) * 16, 0.03, Math.sin(a) * 16); l.rotation.x = -Math.PI / 2; l.rotation.z = -a + Math.PI / 2; sanc.add(l); }
  // the Creator
  creator.add(S(G.sph, bmat(0xfffbe8), 2.2, 2.2, 2.2));
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(22); creator.add(halo);
  const rings = [[4.5, 0.14], [6, 0.1], [7.6, 0.07]].map(([r, w], i) => { const m = mesh(new THREE.TorusGeometry(r, w, 8, 80), bmat(0xffd76a)); m.rotation.set(i * 0.9, i * 0.5, 0); creator.add(m); return m; });
  const orbs = BIOMES.map((b, i) => { const o = mesh(G.sph, bmat(new THREE.Color(b.hud).getHex())); o.scale.setScalar(0.55); creator.add(o); return o; });
  const eye = S(G.sph, bmat(0x2a1a5a), 0.8, 0.8, 0.3, 0, 0, 2.05); creator.add(eye);
  sancAnim.push((dt, t) => {
    rings.forEach((m, i) => { m.rotation.x += dt * (0.3 + i * 0.15); m.rotation.y += dt * (0.2 - i * 0.07); });
    orbs.forEach((o, i) => { const a = t * 0.5 + i / 8 * Math.PI * 2; o.position.set(Math.cos(a) * 10, Math.sin(a * 2) * 1.5, Math.sin(a) * 10); });
    creator.position.y = 14 + Math.sin(t * 0.8) * 0.6; halo.material.opacity = 0.75 + 0.25 * Math.sin(t * 1.7);
    const look = player.pos.clone().sub(creator.position).normalize(); eye.position.copy(look.multiplyScalar(2.05));
    eye.lookAt(creator.position.clone().add(eye.position.clone().multiplyScalar(2)));
  });
  // particles of energy
  const N = 1600, g = new THREE.BufferGeometry(), a = new Float32Array(N * 3), c = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const d = randDir().multiplyScalar(rr(20, 140)); a.set([d.x, d.y * 0.7 + 10, d.z], i * 3); _c3.setHSL(rr(0.7, 0.95), 0.8, rr(0.6, 0.85)); c.set([_c3.r, _c3.g, _c3.b], i * 3); }
  g.setAttribute('position', new THREE.BufferAttribute(a, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.9, map: dotTex, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); sanc.add(pts);
  sancAnim.push(dt => { pts.rotation.y += dt * 0.03; });
  // floating crystals
  for (let i = 0; i < 26; i++) {
    const d = randDir(); d.y = Math.abs(d.y) * 0.6; const p = d.normalize().multiplyScalar(rr(45, 90));
    const cr = mesh(new THREE.OctahedronGeometry(rr(1.5, 4), 0), mat(pick([0x6a4cff, 0x9b7bff, 0x3a2a8a]), { emissive: 0x2a1060 }), p.x, p.y, p.z); cr.scale.y = 2; sanc.add(cr);
    const sp = rr(0.2, 0.6); sancAnim.push(dt => { cr.rotation.y += dt * sp; });
  }
  // exit portal
  const ex = new THREE.Group(); ex.position.set(0, 0, 22); sanc.add(ex);
  ex.add(mesh(new THREE.TorusGeometry(3, 0.35, 10, 40), bmat(0x7dff6b), 0, 3.4, 0));
  const exDisc = mesh(new THREE.CircleGeometry(2.7, 40), new THREE.MeshBasicMaterial({ color: 0x9dffb0, transparent: true, opacity: 0.45, side: THREE.DoubleSide }), 0, 3.4, 0); ex.add(exDisc);
  sancAnim.push((dt, t) => { exDisc.material.opacity = 0.35 + 0.2 * Math.sin(t * 3); });
  const exLbl = mesh(new THREE.PlaneGeometry(4, 0.75), new THREE.MeshBasicMaterial({ map: labelTex('Atgal į pasaulį', '#13301a', '#bfffb0'), transparent: true, side: THREE.DoubleSide }), 0, 7.4, 0); ex.add(exLbl);
}
const CREATOR_LINES = [
  'Sveikas, mažasis keliautojau. Laukiau tavęs nuo pat pirmojo pikselio.',
  'Šį pasaulį sukūriau burbule, kad jis būtų saugus. Iš išorės jis atrodo mažas, bet viduje – didesnis, nei atrodo. Kiekvienas biomas yra atskira mano svajonė.',
  'Miestas, kuriame viskas prasideda. Dykuma, kuri niekada nesibaigia. Ledas, saugantis paslaptis. Grybai, kurie šviečia, kai niekas nežiūri.',
  'Raudonas smėlis, slepiantis vandenį. Džiunglės, kurios viską prisimena. Ir pikseliai – vieta, kurios dar nespėjau pabaigti.',
  'Bet kažkas atėjo iš už burbulo. Demonas, kuris verčia mano pasaulį chaosu. Sprogimai, krentantys daiktai, milžinai – tai jo darbas.',
  'Kodėl pasirinkau būtent tave, mažą žalią žmogeliuką? To nepasakysiu. Tai turi suprasti pats.',
  'Eik. Daryk darbus, padėk gyventojams, stiprėk. Kai būsi pasiruošęs, grįžk – ir aš duosiu tau pirmąjį įsakymą.'
];

// ================= HUD =================
const $ = id => document.getElementById(id);
const hudEl = $('hud'), promptEl = $('prompt'), toastEl = $('toast'), cardEl = $('card');
let toastTimer = 0;
function toast(a, b, color) { $('t1').textContent = a; $('t2').textContent = b || ''; $('t1').style.color = color || 'var(--text)'; toastEl.classList.add('show'); toastTimer = 3.6; }
let card = null;
function showCard(title, text, hint, color) { $('cardTitle').textContent = title; $('cardText').textContent = text; $('cardHint').textContent = hint || 'E – uždaryti'; $('cardTitle').style.color = color || 'var(--biome)'; cardEl.hidden = false; }
function hideCard() { cardEl.hidden = true; card = null; }
const visited = new Set([0]);
const checklist = $('checklist');
BIOMES.forEach((b, i) => {
  const li = document.createElement('li'); li.id = 'ck' + i; li.style.color = b.hud;
  li.innerHTML = `<span class="dot" style="background:${b.hud}"></span><span style="color:inherit">${b.name}</span><span class="ok"></span>`;
  checklist.appendChild(li);
});
function refreshChecklist() {
  try { localStorage.setItem('modly-visited', JSON.stringify([...visited])); } catch (_) { }
  BIOMES.forEach((b, i) => { const li = $('ck' + i); const on = visited.has(i); li.classList.toggle('on', on); li.querySelector('.ok').textContent = on ? '✓' : ''; li.style.color = on ? b.hud : ''; });
  $('checkHead').textContent = `Aplankyta ${visited.size} / 8`;
  gate.lamps && gate.lamps.forEach((l, k) => { l.material = visited.has(k + 1) ? bmat(l.userData.color.getHex()) : bmat(0x555566); });
  const wasOpen = gateOpen;
  gateOpen = [1, 2, 3, 4, 5, 6].every(i => visited.has(i));
  if (gateOpen && !wasOpen && started) setTimeout(() => sfx.magic(), 1200);
}
let gateOpen = false;
let curBiome = 0;
function setBiomeHud(i) {
  const b = BIOMES[i];
  document.documentElement.style.setProperty('--biome', b.hud);
  $('bName').textContent = b.name; $('bEn').textContent = b.en; $('bAtm').textContent = b.atm + ' ' + b.feat;
}

// ================= input =================
const keys = {};
let mode = 'attract', started = false, locked = false, showKeys = true;
addEventListener('keydown', e => {
  if (!started) return;
  if (consoleOpen) { if (e.code === 'Escape') closeConsole(); return; }
  if (mPhoneOpen) { if (e.code === 'Escape' || e.code === 'KeyP') closeMPhone(); return; }
  if (chatOpen) { if (e.code === 'Escape') closeGodChat(); return; }
  if (tmOpen) { if (e.code === 'Escape') closeTMBuild(); return; }
  if (padOpen) { padKey(e); return; }
  if (ritShopOpen) { if (e.code === 'Escape' || e.code === 'KeyE') closeRitShop(); return; }
  if (demonDialog) return;
  if (phoneOpen) { if (e.code === 'Escape' || e.code === 'KeyE') closeGodPhone(); return; }
  if (quizOpen) { const m = /^Digit([1-4])$/.exec(e.code); if (m) answerQuiz(+m[1] - 1); else if (e.code === 'Escape') { quizClose(); } e.preventDefault(); return; }
  if (choiceOpen) { if (['KeyT', 'KeyY', 'Digit1', 'Enter'].includes(e.code)) answerChoice(true); else if (['KeyN', 'Digit2', 'Escape'].includes(e.code)) answerChoice(false); e.preventDefault(); return; }
  if (e.code === 'Backquote' && mode !== 'attract') { e.preventDefault(); openConsole(); return; }
  if (furnOpen) { furnKey(e); return; }
  if (petShopOpen) { petKey(e); return; }
  if (petBookOpen) { petBookKey(e); return; }
  if (carShopOpen) { carKey(e); return; }
  if (skinShopOpen) { skinKey(e); return; }
  if (garageOpen) { garageKey(e); return; }
  if (shopOpen) {
    if (e.code === 'Escape' || e.code === 'KeyE') { e.preventDefault(); closeShop(e.code === 'KeyE'); }
    const m = /^Digit([1-8])$/.exec(e.code); if (m) pickHouse(+m[1] - 1);
    return;
  }
  if (!$('paused').hidden) { if (e.code === 'Escape' && performance.now() - pauseShownAt > 350) closePause(true); return; }
  if (e.code === 'Escape' && mode !== 'attract') { openPause(); return; }
  if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
  if (keys[e.code]) return; keys[e.code] = true;
  if (e.code === 'Space' && player.inCar && ride === auto) carTrick();
  if (e.code === 'Space' && player.down) { standUp(); return; }
  if (e.code === 'KeyE') onInspect();
  if (e.code === 'KeyR') onCar();
  if (e.code === 'KeyT') q5Throw();
  if (e.code === 'KeyV') { frontView = !frontView; sfx.blip(); toast(frontView ? 'Vaizdas iš priekio' : 'Vaizdas iš nugaros', frontView ? 'Dabar matai savo veidą ir kostiumą. V – grįžti atgal' : 'V – vėl pažiūrėti iš priekio', '#7dff6b'); }
  if (e.code === 'KeyF') onSpawnCar();
  if (e.code === 'KeyB' && mode === 'home') openFurn();
  if (e.code === 'KeyI') openPetBook();
  if (e.code === 'KeyP') { if (Q19.has) openMPhone(); }
  if (e.code === 'KeyQ' && furnPlacing) { furnPlacing.r = (furnPlacing.r + 1) % 4; tone(700, 0.05, { type: 'triangle', vol: 0.05 }); }
  if (e.code === 'KeyQ' && placing) { placing.rot += Math.PI / 8; tone(700, 0.05, { type: 'triangle', vol: 0.05 }); }
  if (e.code === 'KeyX' && mode === 'home') { if (furnPlacing) cancelFurn(); else { const nf = nearestFurn(); if (nf) removeFurn(nf); } }
  else if (e.code === 'KeyX') { if (placing) cancelPlace(); else if (mode === 'planet' && !player.inCar && nearestPet()) releasePet(nearestPet()); else { const h = mode === 'planet' && !player.inCar && nearMyHouse(); if (h) demolish(h); else if (mode !== 'attract' && started && !player.inCar) openSkinShop(); } }
  if (e.code === 'KeyG') toggleQuality();
  if (e.code === 'KeyM') { sndInit(); setMuted(!SND.muted); }
  if (e.code === 'KeyH') { showKeys = !showKeys; $('keys').hidden = !showKeys; }
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; hands.L.hold = hands.R.hold = false; });
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('mousedown', e => {
  if (!started || choiceOpen || quizOpen || chatOpen || tmOpen || padOpen || ritShopOpen || demonDialog || phoneOpen || mPhoneOpen) return;
  if (!locked) { requestLock(); }
  if (e.button === 0) handDown('L'); else if (e.button === 2) handDown('R');
});
addEventListener('mouseup', e => { if (e.button === 0) handUp('L'); else if (e.button === 2) handUp('R'); });
function requestLock() { try { const p = canvas.requestPointerLock && canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { }); } catch (_) { } canvas.focus(); }
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === canvas; if (locked) { if (!$('paused').hidden) closePause(false); return; } if (!(!started || lockFailed || consoleOpen || choiceOpen || quizOpen || skinShopOpen || chatOpen || tmOpen || padOpen || ritShopOpen || demonDialog || phoneOpen || mPhoneOpen || shopOpen || furnOpen || petShopOpen || petBookOpen || carShopOpen || garageOpen)) openPause(); });
addEventListener('wheel', e => { if (furnPlacing && started) { furnPlacing.r = (furnPlacing.r + (e.deltaY > 0 ? 1 : 3)) % 4; e.preventDefault(); return; } if (placing && started) { placing.rot += Math.sign(e.deltaY) * Math.PI / 8; e.preventDefault(); } }, { passive: false });
let lockFailed = false;
document.addEventListener('pointerlockerror', () => { lockFailed = true; $('paused').hidden = true; toast('Pelės užrakinti nepavyko', 'Kamerą suk rodyklėmis ← → ↑ ↓', '#ffb347'); });
addEventListener('mousemove', e => {
  if (!locked) return;
  look(e.movementX, e.movementY);
});
function look(dx, dy) {
  const ent = player.inCar ? ride : player;
  if (!player.inCar) player.fwd.applyAxisAngle(player.up, -dx * 0.0024 * (scoped ? 0.3 : 1));
  else ride.fwd.applyAxisAngle(ride.up, -dx * 0.0024);
  player.pitch = clamp(player.pitch + dy * 0.0022 * (scoped ? 0.3 : 1), scoped ? -1.3 : -0.35, 1.25);
}
let camYaw = 0;
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });

// ================= actions =================
// Holding a mouse button keeps that arm stretched out; an item near the hand gets picked up.
// Releasing the button lowers the arm and throws whatever it held.
const hands = { L: { hold: false, reach: 0, item: null }, R: { hold: false, reach: 0, item: null } };
const _hp = new V3(), _side = new V3();
function reachPoint(side, out) {
  _side.crossVectors(player.up, player.fwd).normalize();
  return out.copy(player.pos).addScaledVector(player.up, 1.45).addScaledVector(player.fwd, 0.85).addScaledVector(_side, side === 'L' ? 0.27 : -0.27);
}
function tryGrab(side) {
  const h = hands[side]; if (h.item || mode !== 'planet' || player.inCar) return false;
  reachPoint(side, _hp);
  let best = null, bd = 2.2;
  for (const b of bodies) {
    if (b.held) continue;
    const dd = b.pos.clone().addScaledVector(b.up, 0.35).distanceTo(_hp);
    if (dd < bd) { bd = dd; best = b; }
  }
  if (!best) return false;
  sfx.grab(); best.held = side; h.item = best; best.vel.set(0, 0, 0); best.vr = 0; best.spin.set(0, 0, 0); best.rot.identity();
  return true;
}
function nearestGrabbable() {
  if (player.inCar || mode !== 'planet') return null;
  let best = null, bd = 2.6;
  for (const b of bodies) { if (b.held) continue; const dd = b.pos.distanceTo(player.pos); if (dd < bd) { bd = dd; best = b; } }
  return best;
}
function handDown(side) {
  if (player.down) return;
  if (mode === 'attract' || shopOpen || furnOpen || petShopOpen || petBookOpen || carShopOpen || garageOpen || skinShopOpen || cinema) return;
  if (mode === 'mars') { hands[side].hold = true; shootLaser(); return; }
  if (mode === 'rainbow') { hands[side].hold = true; rbPunch(); return; }
  if (mode === 'museum') { hands[side].hold = true; s9Shoot(); return; }
  if (mode === 'sea') { seaHand(side); return; }
  if (mode === 'sun') { sunHand(side); return; }
  if (mode === 'time') { timeHand(side); return; }
  if (mode === 'upside') { upsideHand(side); return; }
  if (mode === 'dig') return;
  if (mode === 'wind') { windHand(side); return; }
  if (mode === 'pk') { hands[side].hold = true; return; }
  if (mode === 'sr') { srHand(side); return; }
  if (mode === 'tea') { hands[side].hold = true; return; }
  if (mode === 'void') { hands[side].hold = true; return; }
  if (mode === 'mine') { mineHand(side); return; }
  if (mode === 'star') { starHand(side); return; }
  if (mode === 'thunder') { thunderHand(side); return; }
  if (mode === 'cloudcastle') { hands[side].hold = true; sfx.whoosh(0.08); return; }
  if (mode === 'stone' && caveFightHand(side)) return;
  if (mode === 'caphouse' || mode === 'cave' || mode === 'candy' || mode === 'marscloud' || mode === 'stone' || mode === 'future' || mode === 'space') { hands[side].hold = true; sfx.whoosh(0.08); return; }
  if ((mode === 'planet' || mode === 'sanctum') && q14HandDown(side)) return;
  if (mode === 'planet' && q7HandDown(side)) return;
  if (furnPlacing) { if (side === 'L') confirmFurn(); else cancelFurn(); return; }
  if (sleeping) return;
  if (placing) { if (side === 'L') confirmPlace(); else cancelPlace(); return; }
  const h = hands[side]; h.hold = true;
  if (player.inCar) return;
  if (tryGrab(side)) return;
  sfx.whoosh(0.08);
  setTimeout(() => {
    if (mode !== 'planet' || hands[side].item) return;
    reachPoint(side, _hp); let any = false;
    for (const c of critters) if (c.pos.clone().addScaledVector(c.up, 0.8).distanceTo(_hp) < 1.9) { knockCritter(c, player.fwd, 13); any = true; }
    if (any) sfx.hit();
    for (const pt of pets) if (pt.pos.clone().addScaledVector(pt.up, 0.5).distanceTo(_hp) < 1.8) { knockPet(pt, player.fwd, 11); any = true; }
    if (car.exists && car.pos.distanceTo(_hp) < 2.6) { car.vel.addScaledVector(player.fwd, 5); car.vr = 4; pigScare(player.pos); any = true; }
    if (any) shake = Math.max(shake, 0.15);
  }, 110);
}
function handUp(side, gentle) {
  if (!gentle && q7HandUp(side)) { hands[side].hold = false; return; }
  const h = hands[side]; h.hold = false;
  const b = h.item; if (!b) return;
  h.item = null; b.held = null; b.grounded = false;
  if (gentle) { b.vel.set(0, 0, 0); b.vr = 0; return; }
  sfx.whoosh(0.14); b.vel.copy(player.vel).addScaledVector(player.fwd, 9); b.vr = 5 + Math.max(0, player.pitch < 0.2 ? 3 : 0);
  b.spin.set(rr(-6, 6), rr(-6, 6), rr(-6, 6));
}
function dropAll() { handUp('L', true); handUp('R', true); }

// ================= hanging on with your hands / climbing =================
// Stretch an arm (hold LMB/RMB) against a wall, a ledge, a tree, a rock or a steep slope and you grab on.
const climb = { active: false, s: null, terr: false, n: new V3(), cool: 0, ph: 0, spaceWas: false };
const _cn = new V3(), _ch = new V3(), _cd = new V3();
function solidOut(s, p) { // horizontal distance from point p to the side of solid s (negative = inside)
  _ch.copy(p).sub(s.p); _ch.addScaledVector(s.up, -_ch.dot(s.up));
  if (s.type === 'dome') return _ch.length() - s.R;
  if (s.type === 'box') { const ex = Math.abs(_ch.dot(s.ax)) - s.hx, ez = Math.abs(_ch.dot(s.az)) - s.hz; return ex > 0 && ez > 0 ? Math.hypot(ex, ez) : Math.max(ex, ez); }
  return _ch.length() - s.r;
}
function findGrip(side) {
  reachPoint(side, _hp); const hr = _hp.length(); _cd.copy(_hp).normalize();
  let best = null, bd = 1e9;
  for (const s of solids) {
    if (s.dir.dot(_cd) < COS_NEAR) continue;
    const out = solidOut(s, _hp);
    if (out > 0.45 || out < -0.7) continue;
    const base = s.p.length();
    if (s.thin) { if (hr < s.top - 0.9 || hr > s.top + 0.5) continue; }
    else if (hr < base - 0.3 || hr > s.top + 0.5 || s.top - base < 1.2) continue;
    if (out < bd) { bd = out; best = s; }
  }
  if (best) return { s: best, terr: false };
  // a steep bit of ground right in front (canyon walls, pixel steps, hills)
  _cd.copy(player.pos).addScaledVector(player.fwd, 0.7).normalize();
  if (R + groundH(_cd) > player.pos.length() + 0.9) return { s: null, terr: true };
  return null;
}
function startClimb(g) {
  climb.active = true; climb.s = g.s; climb.terr = g.terr; climb.n.copy(player.fwd).negate(); climb.spaceWas = !!keys.Space;
  player.vel.set(0, 0, 0); player.vr = 0; sfx.grab();
}
function stopClimb() { climb.active = false; climb.s = null; climb.cool = 0.35; }
function wallNormal(s, pos, out) {
  _ch.copy(pos).sub(s.p); _ch.addScaledVector(s.up, -_ch.dot(s.up));
  if (s.type === 'box') {
    const lx = _ch.dot(s.ax), lz = _ch.dot(s.az);
    if (Math.abs(lx) - s.hx > Math.abs(lz) - s.hz) out.copy(s.ax).multiplyScalar(lx < 0 ? -1 : 1); else out.copy(s.az).multiplyScalar(lz < 0 ? -1 : 1);
  } else { if (_ch.lengthSq() < 1e-6) _ch.copy(player.fwd).negate(); out.copy(_ch).normalize(); }
  return out;
}
function mantle(pos, top) { player.pos.copy(pos).normalize().multiplyScalar(top + 0.05); player.vr = 0; player.grounded = true; stopClimb(); climb.cool = 0.6; sfx.jump(); toastSoft(); }
let mantleCount = 0; function toastSoft() { if (++mantleCount === 1) toast('Užsiropštei!', 'Rankomis gali įsikibti į sienas, kraštus, medžius ir uolas', '#7dff6b'); }
function updateClimb(dt) {
  const holding = (hands.L.hold && !hands.L.item) || (hands.R.hold && !hands.R.item);
  if (!holding || player.inCar || mode !== 'planet') { stopClimb(); return false; }
  const up = _cd.copy(player.pos).normalize(); player.up.copy(up);
  const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), sd = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  const both = hands.L.hold && hands.R.hold && !hands.L.item && !hands.R.item;
  const sp = both ? 3.4 : 2.3;
  const n = climb.n;
  if (climb.terr) n.addScaledVector(up, -n.dot(up)).normalize();
  else { wallNormal(climb.s, player.pos, n); n.addScaledVector(up, -n.dot(up)).normalize(); }
  // jump off the wall
  if (keys.Space && !climb.spaceWas) { player.vel.copy(n).multiplyScalar(6); player.vr = 7.5; stopClimb(); sfx.jump(); return false; }
  climb.spaceWas = !!keys.Space;
  const side = new V3().crossVectors(up, n);
  player.pos.addScaledVector(side, sd * sp * 0.7 * dt);
  let r = player.pos.length() + f * sp * dt;
  const ground = R + groundH(_cd.copy(player.pos).normalize());
  if (r < ground) r = ground;
  player.pos.normalize().multiplyScalar(r);
  if (climb.terr) {
    const ahead = player.pos.clone().addScaledVector(n, -0.75), ad = ahead.clone().normalize(), gA = R + groundH(ad);
    if (r >= gA - 0.35) { mantle(ahead, gA); return false; }
    if (gA < r + 0.2 && f <= 0) { stopClimb(); return false; }
  } else {
    const s = climb.s;
    if (s.type === 'dome') {
      if (r >= s.base + 0.6) { mantle(player.pos.clone().addScaledVector(n, -1.2), s.base + s.H * Math.sqrt(Math.max(0, 1 - ((s.R - 0.8) / s.R) ** 2))); return false; }
      const out = solidOut(s, player.pos); player.pos.addScaledVector(n, 0.4 - out);
    } else if (s.thin) {
      const hang = s.top - 1.65;
      if (r >= hang - 0.05 && f > 0) { mantle(player.pos.clone().addScaledVector(n, -0.9), s.top); return false; }
      if (r > hang) player.pos.normalize().multiplyScalar(hang);
      // stay just outside the rim
      const out = solidOut(s, player.pos); player.pos.addScaledVector(n, 0.25 - out);
    } else {
      if (r >= s.top - 0.35) {
        // a mushroom cap or a ledge right above the stem? climb onto it instead
        const dome = solids.find(o => o.type === 'dome' && o.p.distanceTo(s.p) < 0.6 && o.base > s.top - 1);
        if (dome) { mantle(dome.p.clone().addScaledVector(n, dome.R - 1.4), dome.base + dome.H * Math.sqrt(1 - ((dome.R - 1.4) / dome.R) ** 2)); return false; }
        const cap = solids.find(o => o.thin && o.p.distanceTo(s.p) < 0.6 && o.top > s.top && o.top - s.top < 4);
        if (cap) { mantle(cap.p.clone().addScaledVector(n, cap.r - 0.7), cap.top); return false; }
        mantle(player.pos.clone().addScaledVector(n, -1.0), s.top); return false;
      }
      const out = solidOut(s, player.pos); player.pos.addScaledVector(n, 0.4 - out);   // hug the wall
    }
  }
  player.vel.set(0, 0, 0); player.vr = 0; player.grounded = false;
  player.fwd.copy(n).negate();
  const moved = f !== 0 || sd !== 0; const ph0 = climb.ph;
  if (moved) climb.ph += dt * 9;
  if (Math.floor(ph0 / Math.PI) !== Math.floor(climb.ph / Math.PI)) noiseHit(0.08, { ft: 'bandpass', f: 1500, vol: 0.05 });
  animateClimb(dt);
  return true;
}
function animateClimb(dt) {
  const p = player.mesh.userData.parts, s = Math.sin(climb.ph);
  const hl = hands.L.hold && !hands.L.item, hrr = hands.R.hold && !hands.R.item;
  hands.L.reach = hands.L.hold ? 1 : 0; hands.R.reach = hands.R.hold ? 1 : 0;
  p.armL.rotation.set(hl ? -2.9 + s * 0.35 : 0.2, 0, hl ? -0.15 : 0.3);
  p.armR.rotation.set(hrr ? -2.9 - s * 0.35 : 0.2, 0, hrr ? 0.15 : -0.3);
  p.legL.rotation.set(-0.35 + s * 0.45, 0, 0.05); p.legR.rotation.set(-0.35 - s * 0.45, 0, -0.05);
  p.body.position.y = 0;
}

function updateHeld() {
  const p = player.mesh.userData.parts;
  player.mesh.updateMatrixWorld(true);
  for (const side of ['L', 'R']) {
    const h = hands[side];
    if (h.hold && !h.item && h.reach > 0.8 && !climb.active) { if (!tryGrab(side) && climb.cool <= 0 && mode === 'planet' && !player.inCar && !paintNear) { const g = findGrip(side); if (g) startClimb(g); } }
    const b = h.item; if (!b) continue;
    (side === 'L' ? p.handL : p.handR).getWorldPosition(_hp);
    b.pos.copy(_hp).addScaledVector(player.fwd, 0.22).addScaledVector(player.up, -0.3);
    b.up.copy(player.up); b.fwd.copy(player.fwd);
    b.mesh.position.copy(b.pos); orient(b.mesh, b.up, b.fwd);
  }
}
let nearInspect = null;
function onInspect() {
  if (player.down) return;
  if (mode === 'home') { homeAction(); return; }
  if (mode === 'mars') { marsAction(); return; }
  if (mode === 'museum') { museumAction(); return; }
  if (mode === 'caphouse') { capHouseAction(); return; }
  if (mode === 'cave') { caveAction(); return; }
  if (mode === 'candy') { candyAction(); return; }
  if (mode === 'rainbow') { rainbowAction(); return; }
  if (mode === 'marscloud') { marsCloudAction(); return; }
  if (mode === 'stone') { stoneAction(); return; }
  if (mode === 'future') { futureAction(); return; }
  if (mode === 'space') { spaceAction(); return; }
  if (mode === 'sea') { seaAction(); return; }
  if (mode === 'sun') { sunAction(); return; }
  if (mode === 'time') { timeAction(); return; }
  if (mode === 'upside') { upsideAction(); return; }
  if (mode === 'dig') { leaveDig(); return; }
  if (mode === 'wind') { windAction(); return; }
  if (mode === 'pk') { pkAction(); return; }
  if (mode === 'sr') { srAction(); return; }
  if (mode === 'tea') { teaAction(); return; }
  if (mode === 'void') { voidAction(); return; }
  if (mode === 'mine') { mineAction(); return; }
  if (mode === 'star') { starAction(); return; }
  if (mode === 'thunder') { thunderAction(); return; }
  if (mode === 'cloudcastle') { cloudCastleAction(); return; }
  if (mode === 'kitchen') { if (card && card.kind === 'info') { hideCard(); return; } kitchenAction(); return; }
  if (card && card.kind === 'creator') {
    card.i++;
    if (card.i >= creatorLines.length) { hideCard(); const wasNone = QUEST.stage === 'none'; const handled = onCreatorTalkEnd(); if (!wasNone && !handled && !choiceOpen) toast('Kūrėjas nutilo', 'Kai kuriuos atsakymus turėsi suprasti pats', '#ffe98a'); return; }
    showCard('Kūrėjas', creatorLines[card.i], `E – toliau (${card.i + 1} / ${creatorLines.length})`, '#ffe98a'); return;
  }
  if (card && card.kind === 'talk') { advanceTalk(); return; }
  if (card) { hideCard(); return; }
  if (mode === 'sanctum') {
    const dx = player.pos.x - creator.position.x, dz = player.pos.z - creator.position.z;
    if (QUEST.stage === 'active' && nearHen()) { deliverChicks(); return; }
    if (q7SanctumNear()) { q7TakeSniper(); return; }
    if (tmSanctumNear()) { useSanctumTM(); return; }
    if (q13SanctumNear()) { q13PlaceCats(); return; }
    if (q14SanctumNear()) { q14SanctumAction(); return; }
    if (phoneNear()) { openGodPhone(); return; }
    const nf = nearFriend(); if (nf) { talkFriend(nf); return; }
    if (Math.hypot(dx, dz) < 14 && q10CreatorTalk()) return;
    if (Math.hypot(dx, dz) < 14) { creatorLines = creatorTalkLines(); card = { kind: 'creator', i: 0 }; sfx.magic(); showCard('Kūrėjas', creatorLines[0], `E – toliau (1 / ${creatorLines.length})`, '#ffe98a'); }
    return;
  }
  if (mode === 'planet' && !player.inCar && QUEST.stage === 'active') { const ch = nearestChickToPick(); if (ch) { pickChick(ch); return; } }
  if (mode === 'planet' && !player.inCar) { const pt = nearestPet(); if (pt && (!nearInspect || pt.pos.distanceTo(player.pos) < nearInspect.pos.distanceTo(player.pos))) { petPet(pt); return; } }
  if (nearInspect && nearInspect.onUse) { nearInspect.onUse(); return; }
  if (nearInspect) {
    let text = nearInspect.text;
    if (nearInspect === gate.inspect) {
      const left = [1, 2, 3, 4, 5, 6].filter(i => !visited.has(i)).map(i => BIOMES[i].name);
      text = gateOpen ? 'Visi septyni žiburiai dega. Vartai atsivėrė – įeik į jų šviesą, ir jie nuves tave į pasaulio centrą, pas Kūrėją.'
        : `Vartai uždaryti. Aplink juos – septyni žiburiai, kiekvienas skirtas vienam biomui. Kai aplankysi visus, vartai atsivers. Dar liko: ${left.join(', ')}.`;
    }
    card = { kind: 'info' }; showCard(nearInspect.name, text); sfx.blip();
  }
}
function onCar() {
  if (player.down) return;
  if (mode !== 'planet') return;
  if (player.inCar) {
    if (ride === auto) { exitAuto(); return; }
    player.inCar = false; ride = null; player.mesh.visible = true;
    { const p = player.mesh.userData.parts; p.legL.rotation.set(0, 0, 0); p.legR.rotation.set(0, 0, 0); p.body.rotation.x = 0; }
    const right = new V3().crossVectors(car.fwd, car.up);
    player.pos.copy(car.pos).addScaledVector(right, -2.2).addScaledVector(car.up, 0.5); player.fwd.copy(car.fwd); player.vel.set(0, 0, 0); player.vr = 0;
    car.speed = 0;
    return;
  }
  const dPig = car.exists ? car.pos.distanceTo(player.pos) : 1e9;
  const dAuto = auto.exists ? auto.pos.distanceTo(player.pos) - auto.spec.len / 2 : 1e9;
  if (auto.exists && dAuto < 4.5 && dAuto <= dPig) { enterAuto(); return; }
  if (car.exists && dPig < 5.5) {
    cancelPlace(true); stopClimb(); dropAll(); car.mesh.userData.body.rotation.x = 0; pig.state = 'graze'; player.inCar = true; ride = car; camYaw = 0; hideCard(); toast('Joji ant kiaulės!', 'Kiaulė suka ten, kur rodo pelė. W – pirmyn, Shift – greičiau', '#ffa3c0'); oink();
  }
}
function onSpawnCar() {
  if (mode !== 'planet') return;
  openGarage();
}
function spawnPigNow() {
  if (player.inCar && ride === car) onCar();
  const d = player.pos.clone().addScaledVector(player.fwd, 4.5).normalize();
  car.pos.copy(d).multiplyScalar(R + groundH(d) + 1.5); car.up.copy(d);
  car.fwd.copy(player.fwd).addScaledVector(d, -player.fwd.dot(d)).normalize();
  car.vel.set(0, 0, 0); car.vr = 0; car.speed = 0; car.exists = true; car.mesh.visible = true;
  sfx.poof(); poof(car.pos.clone(), 0xffffff); pig.state = 'look'; pig.t = 2; setTimeout(oink, 300); toast('Kiaulė atspawninta!', 'Prieik ir spausk R, kad užsėstum ant jos', '#ffa3c0');
}


// ================= the pig is alive =================
const pig = { state: 'graze', t: 2, oinkT: 4, blinkT: 3, headX: 0, headY: 0 };
function pigBubble(text) {
  if (!car.exists) return;
  const c = document.createElement('canvas'); c.width = 256; c.height = 96; const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,255,255,.92)'; x.beginPath(); x.ellipse(128, 44, 118, 38, 0, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.moveTo(100, 76); x.lineTo(118, 96); x.lineTo(126, 76); x.fill();
  x.fillStyle = '#d0406f'; x.font = "44px 'Lilita One', sans-serif"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 128, 46);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  s.scale.set(2.4, 0.9, 1); world.add(s); let t = 0;
  fx.push(dt => { t += dt; s.position.copy(car.pos).addScaledVector(car.up, 3 + t * 0.6).addScaledVector(car.fwd, 1); s.material.opacity = Math.max(0, 1 - Math.max(0, t - 0.8) / 0.5); if (t > 1.3) { world.remove(s); return false; } return true; });
}
function oink() { const near = car.pos.distanceTo(camera.position); const v = clamp(0.25 * (1 - near / 45), 0, 0.25); if (v > 0.005) { grunt(210, 130, 0.16, v); grunt(190, 120, 0.2, v, 0.2); } pigBubble(pick(['Oink!', 'Kriu!', 'Kriu kriu!'])); }
function pigSqueal() { const v = clamp(0.25 * (1 - car.pos.distanceTo(camera.position) / 45), 0, 0.25); if (v > 0.005) grunt(700, 1100, 0.35, v * 0.8); pigBubble('Kvyyy!'); }
function pigScare(from) {
  if (!car.exists) return;
  pigSqueal();
  if (player.inCar && ride === car) return;
  pig.state = 'flee'; pig.t = 2.5; tangentToward(car.up, car.pos.clone().sub(from), car.fwd);
}
function pigLife(dt) {
  const pu = car.mesh.userData;
  pig.blinkT -= dt; const bl = pig.blinkT < 0.12 ? 0.15 : 1; if (pig.blinkT < 0) pig.blinkT = rr(2, 5);
  pu.eyes.forEach(e => e.scale.y = 0.1 * bl);
  pig.oinkT -= dt; if (pig.oinkT < 0) { pig.oinkT = rr(5, 11); if (car.pos.distanceTo(player.pos) < 35) oink(); }
  if (player.inCar && ride === car) { pig.headX = keys.KeyW ? -0.1 : 0.05; pig.headY = 0; }
}
function pigAI(dt) {
  const toP = car.pos.distanceTo(player.pos);
  pig.t -= dt;
  if (pig.state !== 'flee' && toP > 20) pig.state = 'follow';
  if (pig.t <= 0 || (pig.state === 'follow' && toP < 6)) {
    if (pig.state === 'flee') oink();
    const r = rnd(); pig.t = rr(2, 5);
    pig.state = r < 0.35 ? 'wander' : r < 0.7 ? 'graze' : r < 0.85 ? 'look' : 'sit';
    if (pig.state === 'wander') car.fwd.applyAxisAngle(car.up, rr(-2, 2));
    if (pig.state === 'look' && toP < 12) pigBubble('?');
  }
  let target = 0; pig.headX = 0; pig.headY = 0;
  const toPlayer = tangentToward(car.up, player.pos.clone().sub(car.pos));
  if (pig.state === 'wander') { target = 2.2; car.fwd.applyAxisAngle(car.up, Math.sin(T * 0.9) * dt * 0.6); }
  else if (pig.state === 'follow') { target = 5; car.fwd.lerp(toPlayer, Math.min(1, dt * 3)).normalize(); }
  else if (pig.state === 'flee') { target = 7; }
  else if (pig.state === 'graze') { pig.headX = 0.55 + Math.sin(T * 7) * 0.08; }
  else if (pig.state === 'look' || pig.state === 'sit') {
    const side = new V3().crossVectors(car.up, car.fwd);
    pig.headY = clamp(Math.atan2(toPlayer.dot(side), toPlayer.dot(car.fwd)), -0.9, 0.9);
    pig.headX = -0.15;
  }
  car.speed = lerp(car.speed, target, Math.min(1, dt * 3));
  if (car.grounded) car.vel.copy(car.fwd).multiplyScalar(car.speed);
  stepPlanet(car, dt, 1.2);
  // sit down / stand up
  const pu = car.mesh.userData; pu.body.rotation.x = lerp(pu.body.rotation.x, pig.state === 'sit' ? -0.35 : 0, Math.min(1, dt * 4));
  // bump into the traveller gently
  if (toP < 1.6 && pig.state !== 'flee') { car.vel.addScaledVector(toPlayer, -2); }
}

// ================= update: planet =================
const _mv = new V3(), _rt = new V3(), _ct = new V3(), _cl = new V3();
const fogS = new THREE.Color(0xcdeeff), fogCol = new THREE.Color(), skyCol = new THREE.Color(), tmpC = new THREE.Color();
let lastDom = 0;
function updatePlayer(dt) {
  if (player.inCar && ride === auto) { driveAuto(dt); return; }
  if (player.inCar) {
    const thr = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), steer = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
    if (car.grounded) {
      const top = keys.ShiftLeft || keys.ShiftRight ? 13 : 9;
      car.speed += thr * (thr * car.speed < 0 ? 20 : 7) * dt;
      car.speed *= Math.max(0, 1 - (thr === 0 ? 2 : 0.2) * dt);
      car.speed = clamp(car.speed, -4, top);
      if (keys.Space && car.vr === 0) car.vr = 7;
    }
    const yawRate = -steer * 2.2;
    car.fwd.applyAxisAngle(car.up, yawRate * dt);
    _mv.copy(car.fwd).multiplyScalar(car.speed);
    car.vel.lerp(_mv, car.grounded ? Math.min(1, 8 * dt) : Math.min(1, 0.5 * dt));
    stepPlanet(car, dt, 1.4);
    // stop when hitting solids
    player.pos.copy(car.pos); player.up.copy(car.up);
    for (const c of critters) if (c.knocked <= 0 && c.pos.distanceTo(car.pos) < 2.2 && Math.abs(car.speed) > 4) knockCritter(c, car.fwd.clone().addScaledVector(randDir(), 0.4).normalize(), Math.abs(car.speed) * 0.9 + 4);
    for (const b of bodies) if (b.pos.distanceTo(car.pos) < 2 && Math.abs(car.speed) > 3) { b.vel.copy(car.fwd).multiplyScalar(Math.abs(car.speed) * 1.1); b.vr = 7; b.grounded = false; b.spin.set(rr(-8, 8), rr(-8, 8), rr(-8, 8)); }
    // dust devils lift
    return;
  }
  climb.cool = Math.max(0, climb.cool - dt);
  if (player.down) { player.vel.multiplyScalar(Math.max(0, 1 - 6 * dt)); stepPlanet(player, dt, 0.35); downPose(dt, T); return; }
  if (climb.active && updateClimb(dt)) return;
  const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, player.up);
  _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s);
  if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 12 : 7;
  _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, player.grounded ? Math.min(1, 12 * dt) : Math.min(1, 2.5 * dt));
  if (keys.Space && player.grounded) { player.vr = 9; player.grounded = false; sfx.jump(); spaceWas = true; }
  flyUpdate(dt);
  const g0 = player.grounded, vr0 = player.vr;
  stepPlanet(player, dt, 0.35);
  if (!g0 && player.grounded && vr0 < -9) sfx.land(-vr0);
  if (!g0 && player.grounded) fallCheck(vr0, player.ground - R < WATER_FLOOR + 0.05);
  // dust devils lift you up
  for (const dd of dustDevils) { if (dd.g.position.distanceTo(player.pos) < 3.2) { player.vr = Math.max(player.vr, 13); player.fwd.applyAxisAngle(player.up, dt * 8); } }
  animateMan(dt, f !== 0 || s !== 0, sp);
}
function animateMan(dt, moving, sp) {
  const p = player.mesh.userData.parts;
  const w0 = player.walk;
  if (moving && player.grounded) player.walk += dt * sp * 1.4;
  if (Math.floor(w0 / Math.PI) !== Math.floor(player.walk / Math.PI)) sfx.step(mode === 'sanctum' ? 7 : curBiome, mode === 'planet' && player.ground - R < WATER_FLOOR + 0.05);
  const sw = moving && player.grounded ? Math.sin(player.walk) * 0.75 : (player.grounded ? 0 : 0.5);
  p.legL.rotation.x = sw; p.legR.rotation.x = player.grounded ? -sw : -0.4;
  const k = Math.min(1, dt * 14);
  hands.L.reach = lerp(hands.L.reach, hands.L.hold ? 1 : 0, k); hands.R.reach = lerp(hands.R.reach, hands.R.hold ? 1 : 0, k);
  const rl = hands.L.reach, rR = hands.R.reach;
  p.armL.rotation.x = lerp(-sw * 0.8, -1.5, rl); p.armR.rotation.x = lerp(sw * 0.8, -1.5, rR);
  const zl = player.grounded ? 0.08 : 0.9;
  p.armL.rotation.z = lerp(zl, -0.12, rl); p.armR.rotation.z = lerp(-zl, 0.12, rR);
  p.body.position.y = moving && player.grounded ? Math.abs(Math.sin(player.walk)) * 0.06 : 0;
}
function updatePlanet(dt, t) {
  updatePlayer(dt);
  if (!player.inCar) { player.mesh.position.copy(player.pos); orient(player.mesh, player.up, player.fwd); updateHeld(); }
  if (car.exists) {
    if (!(player.inCar && ride === car)) pigAI(dt);
    pigLife(dt);
    car.mesh.position.copy(car.pos); orient(car.mesh, car.up, car.fwd);
    // pig gallop
    const pu = car.mesh.userData, spd = Math.abs(car.speed);
    const ws0 = car.wheelSpin;
    car.wheelSpin += spd * dt * 1.6 + dt * 0.5;
    if (spd > 1.5 && car.grounded && Math.floor(ws0 / Math.PI) !== Math.floor(car.wheelSpin / Math.PI) && car.pos.distanceToSquared(camera.position) < 900) sfx.hoof();
    const amp = clamp(spd / 10, 0, 1) * 0.8, ph = car.wheelSpin;
    pu.legs[0].rotation.x = Math.sin(ph) * amp; pu.legs[3].rotation.x = Math.sin(ph) * amp;
    pu.legs[1].rotation.x = -Math.sin(ph) * amp; pu.legs[2].rotation.x = -Math.sin(ph) * amp;
    pu.body.position.y = car.grounded ? Math.abs(Math.sin(ph)) * 0.18 * clamp(spd / 10, 0, 1) : 0;
    pu.head.rotation.x = lerp(pu.head.rotation.x, pig.headX, Math.min(1, dt * 5)) + Math.sin(ph * 0.5) * 0.04;
    pu.head.rotation.y = lerp(pu.head.rotation.y, pig.headY, Math.min(1, dt * 4));
    pu.tail.rotation.z = Math.sin(T * (pig.state === 'flee' ? 20 : 6)) * 0.6;
    if (player.inCar && ride === car) {
      // rider sits in the saddle
      player.mesh.position.copy(car.pos).addScaledVector(car.up, 1.25 + pu.body.position.y);
      orient(player.mesh, car.up, car.fwd);
      const p = player.mesh.userData.parts;
      p.legL.rotation.set(-0.5, 0, 0.75); p.legR.rotation.set(-0.5, 0, -0.75);
      p.armL.rotation.set(-0.9 - (keys.KeyW ? 0.4 : 0), 0, -0.15); p.armR.rotation.set(-0.9 - (keys.KeyW ? 0.4 : 0), 0, 0.15);
      p.body.position.y = 0; p.body.rotation.x = 0.12 + clamp(car.speed / 30, -0.2, 0.25);
    }
  }
  updateDunes(dt); updateIce(dt); updateCrimson(dt, t); updateBirds(dt, t); updatePixel(dt, t);
  for (const a of animators) a(dt, t);
  updateAuto(dt, t); updateTraffic(dt, t); updateChicks(dt, t); updateFarm(dt, t);
  updateCritters(dt, t); updatePets(dt, t); updateQ13(dt, t); updateDemonQuest(dt, t); updateSpaceRamp(dt); updateSeaGate(dt); updateQ5(dt, t); updatePondPlanet(); updatePaintJob(dt, t); updateTow(dt, t); updateCow(dt, t); updateFeathers(dt, t); updatePrince(dt, t); checkSpaceFlight(); updateS9World(dt, t); updateVillagerJobs(dt, t); updateBodies(dt); separateAll(); updatePlacing();
  if (player.inCar) player.pos.copy(ride.pos);
  else { player.mesh.position.copy(player.pos); }
  if (car.exists) { car.mesh.position.copy(car.pos); if (player.inCar && ride === car) player.mesh.position.copy(car.pos).addScaledVector(car.up, 1.25 + car.mesh.userData.body.position.y); }
  if (!demonDead() && Q14.stage !== 'fight') updateChaos(t);
  // biome & environment
  const d = player.up; weights(d.x, d.y, d.z, W);
  let dom = 0; for (let i = 1; i < NB; i++) if (W[i] > W[dom]) dom = i;
  if (W[dom] > 0.6 && dom !== curBiome) {
    curBiome = dom; setBiomeHud(dom);
    const isNew = !visited.has(dom); visited.add(dom); refreshChecklist();
    musicSet(dom); if (isNew) sfx.chime();
    toast(BIOMES[dom].name, isNew ? 'Naujas biomas! ' + BIOMES[dom].atm : BIOMES[dom].atm, BIOMES[dom].hud);
    if (isNew && gateOpen) setTimeout(() => toast('Kūrėjo vartai atsivėrė', 'Grįžk į Pradžios Miesto aikštę', '#ffe98a'), 4000);
  }
  fogCol.setRGB(0, 0, 0); skyCol.setRGB(0, 0, 0); let far = 0;
  for (let i = 0; i < NB; i++) { tmpC.setHex(BIOMES[i].fog); fogCol.r += tmpC.r * W[i]; fogCol.g += tmpC.g * W[i]; fogCol.b += tmpC.b * W[i]; tmpC.setHex(BIOMES[i].sky); skyCol.r += tmpC.r * W[i]; skyCol.g += tmpC.g * W[i]; skyCol.b += tmpC.b * W[i]; far += BIOMES[i].far * W[i]; }
  fogS.lerp(fogCol, Math.min(1, dt * 2)); scene.fog.color.copy(fogS).convertSRGBToLinear(); scene.fog.far = lerp(scene.fog.far, far * 1.15, Math.min(1, dt * 2)); scene.fog.near = scene.fog.far * 0.32;
  bubbleU.uHor.value.copy(fogS); bubbleU.uTop.value.lerp(skyCol, Math.min(1, dt * 2));
  bubbleU.uUp.value.copy(player.up);
  hemi.position.copy(player.up); hemi.color.copy(skyCol).lerp(new THREE.Color(0xffffff), 0.5).convertSRGBToLinear();
  updateAmbient(dt, t, dom, W[dom]);
  ambience(dt, W, false);
  // light follows the traveller so the local sky is always day
  _rt.crossVectors(player.fwd, player.up);
  updateSun(dt, t);
  // gate
  if (gate.disc) {
    gate.disc.uniforms.uOpen.value = lerp(gate.disc.uniforms.uOpen.value, gateOpen ? 1 : 0, Math.min(1, dt * 2));
    if (gateOpen && !player.inCar && player.pos.distanceTo(gate.center) < 3.4) enterSanctum();
  }
  // prompts
  nearInspect = null; let best = 1e9;
  if (!player.inCar) for (const it of inspectables) { const dd = it.pos.distanceTo(player.pos); if (dd < it.r && dd < best) { best = dd; nearInspect = it; } }
  let ptxt = '';
  if (player.inCar && ride === auto) ptxt = `${auto.spec.name} · ${Math.round(Math.abs(auto.speed) * 3.6)} km/h · Pelė – kryptis · <kbd>W</kbd>/<kbd>S</kbd> · <kbd>Space</kbd> ${auto.spec.trickName} · <kbd>R</kbd> išlipti`;
  else if (player.inCar) ptxt = 'Pelė – kryptis · <kbd>W</kbd> pirmyn · <kbd>Shift</kbd> greičiau · <kbd>Space</kbd> šuolis · <kbd>R</kbd> nulipti';
  else if (auto.exists && auto.pos.distanceTo(player.pos) - auto.spec.len / 2 < 4.5) ptxt = `<kbd>R</kbd> sėsti į mašiną: ${auto.spec.name}`;
  else if (car.exists && car.pos.distanceTo(player.pos) < 5.5) ptxt = '<kbd>R</kbd> užsėsti ant kiaulės';
  else if (climb.active) ptxt = 'Kabai! <kbd>W</kbd>/<kbd>S</kbd> lipti · <kbd>A</kbd>/<kbd>D</kbd> į šonus · <kbd>Space</kbd> atsispirti · atleisk pelę – paleisti';
  else if (hands.L.item || hands.R.item) ptxt = 'Rankoje: ' + [hands.L.item, hands.R.item].filter(Boolean).map(b => b.name).join(' ir ') + ' · atleisk mygtuką – mesti';
  else if (QUEST.stage === 'active' && nearestChickToPick()) ptxt = '<kbd>E</kbd> paimti viščiuką';
  else if (placing) ptxt = (placing.valid ? '' : '<span style="color:#ff8a8a">' + placing.why + '</span> · ') + '<kbd>LMB</kbd> pastatyti · <kbd>Q</kbd> / ratukas – sukti · <kbd>RMB</kbd> atšaukti';
  else if (nearestPet() && (!nearInspect || nearestPet().pos.distanceTo(player.pos) < nearInspect.pos.distanceTo(player.pos))) { const pt = nearestPet(); ptxt = `<kbd>E</kbd> paglostyti: ${pt.name} (${pt.def.kind.toLowerCase()}) · <kbd>X</kbd> paleisti`; }
  else if (nearInspect) ptxt = nearInspect.verb ? `<kbd>E</kbd> ${nearInspect.verb}` : `<kbd>E</kbd> apžiūrėti: ${nearInspect.name}`;
  else if (nearestPet()) { const pt = nearestPet(); ptxt = `<kbd>E</kbd> paglostyti: ${pt.name} (${pt.def.kind.toLowerCase()}) · <kbd>X</kbd> paleisti`; }
  else if (nearMyHouse()) ptxt = '<kbd>X</kbd> nugriauti šį namą';
  else { const g = nearestGrabbable(); if (g) ptxt = `Laikyk <kbd>LMB</kbd> / <kbd>RMB</kbd> – paimti: ${g.name}`; }
  if (card && card.kind === 'info' && !nearInspect) hideCard();
  setPrompt(player.down ? '<kbd>Space</kbd> – atsistoti' : ptxt);
}
let lastPrompt = null;
function setPrompt(html) { if (html === lastPrompt) return; lastPrompt = html; promptEl.innerHTML = html; promptEl.hidden = !html; }

function updateCameraPlanet(dt) {
  const ent = player.inCar ? ride : player;
  const up = ent.up;
  let fwd = ent.fwd;
  if (player.inCar) { fwd = ride.fwd; }
  const dist = (player.inCar ? (ride === auto ? auto.spec.cam : 8.5) : 6.2) * (((ufo && ufo.towing) || towCat) && player.inCar ? 2 : 1), pitch = player.inCar && ((ufo && ufo.towing) || towCat) ? Math.max(player.pitch, 0.55) : player.pitch;
  _ct.copy(ent.pos).addScaledVector(up, 1.6 + Math.sin(pitch) * dist).addScaledVector(fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
  const cr = _ct.length(), cd = _ct.clone().divideScalar(cr), minR = R + groundH(cd) + 0.6;
  if (cr < minR) _ct.copy(cd).multiplyScalar(minR);
  // keep the camera out of buildings, rocks and trees
  { const head = ent.pos.clone().addScaledVector(up, 1.5), q = new V3(), qd = new V3();
    for (let k = 1; k <= 12; k++) {
      q.lerpVectors(head, _ct, k / 12); qd.copy(q).normalize(); const qr = q.length(); let hit = false;
      for (const s of solids) { if (s.thin || s.dir.dot(qd) < COS_NEAR) continue; if (s.type === 'dome') { const dd = -solidOut(s, q); if (dd > -0.3 && qr > s.base - 1 && qr < s.base + s.H * Math.sqrt(Math.max(0, 1 - ((s.R - dd) / s.R) ** 2)) + 0.3) { hit = true; break; } continue; } if (qr < s.top + 0.3 && qr > s.p.length() - 1 && solidOut(s, q) < 0.25) { hit = true; break; } }
      if (hit) { _ct.lerpVectors(head, _ct, Math.max(0, (k - 1.5) / 12)); break; }
    } }
  camera.position.lerp(_ct, Math.min(1, dt * 10));
  camera.up.lerp(up, Math.min(1, dt * 8)).normalize();
  const tgt = ent.pos.clone().addScaledVector(up, player.inCar ? (ride === auto ? 1.4 + auto.spec.wid * 0.3 : 1.8) : 1.5);
  camera.lookAt(tgt);
  applyShake(dt);
}
function applyShake(dt) {
  if (shake > 0.001) {
    const s = reduceMotion ? shake * 0.2 : shake;
    camera.position.add(new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).multiplyScalar(s * 0.5));
    shake = Math.max(0, shake - dt * 1.4);
  }
}

// ================= Sanctum mode =================
let returnCooldown = 0;
function fadeTo(fn) { $('fade').classList.add('on'); setTimeout(() => { fn(); setTimeout(() => $('fade').classList.remove('on'), 150); }, 650); }
let transitioning = false;
function enterSanctum() {
  if (!transitioning) sfx.magic();
  cancelPlace(true); stopSiren();
  if (transitioning) return; transitioning = true; dropAll();
  toast('Leidiesi į pasaulio centrą…', '', '#ffe98a');
  fadeTo(() => {
    mode = 'sanctum'; transitioning = false; sanc.add(player.mesh); musicSet(7); chicksEnterSanctum(); q5EnterSanctum(); q7EnterSanctum(); setScope(false); refreshSanctumFriends();
    player.pos.set(0, 0, 14); player.up.set(0, 1, 0); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0;
    camera.position.set(0, 4, 22); camera.up.set(0, 1, 0);
    const isNew = !visited.has(7); visited.add(7); refreshChecklist(); setBiomeHud(7);
    toast('Kūrėjo Salė', isNew ? 'Paskutinė ir paslaptingiausia vieta. Prieik prie šviesos ir spausk E.' : 'Kūrėjas laukia', '#ffe98a');
  });
}
function exitSanctum() {
  if (transitioning) return; transitioning = true; hideCard();
  fadeTo(() => {
    mode = 'planet'; transitioning = false; world.add(player.mesh); for (const m of sancFollowers) sanc.remove(m); sancFollowers.length = 0;
    const d = cityDir(0, 9); player.pos.copy(d).multiplyScalar(R + groundH(d) + 0.5); player.up.copy(d); player.fwd.copy(tangentToward(d, cityDir(0, 30)));
    player.vel.set(0, 0, 0); player.vr = 0; curBiome = -1; camera.position.copy(player.pos).addScaledVector(d, 4);
  });
}
function updateSanctum(dt, t) {
  ambience(dt, W, true);
  for (const a of sancAnim) a(dt, t);
  const f = player.down ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = player.down ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP);
  _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft ? 12 : 7; _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, player.grounded ? Math.min(1, 12 * dt) : Math.min(1, 2.5 * dt));
  if (!player.down && keys.Space && player.grounded && Q8.back !== 'jetpack') { player.vr = 9; player.grounded = false; sfx.jump(); }
  if (!player.down) flatJetpack(dt);
  player.pos.addScaledVector(player.vel, dt);
  player.vr -= GRAV * 0.6 * dt; player.pos.y += player.vr * dt;
  const rr2 = Math.hypot(player.pos.x, player.pos.z); if (rr2 > 28.5) { player.pos.x *= 28.5 / rr2; player.pos.z *= 28.5 / rr2; }
  if (player.pos.y <= 0) { if (!player.grounded) fallCheck(player.vr); player.pos.y = 0; player.vr = 0; player.grounded = true; } else player.grounded = false;
  player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd);
  if (player.down) downPose(dt, t); else animateMan(dt, f !== 0 || s !== 0, sp);
  // camera
  const dist = 6.2, pitch = player.pitch;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
  if (_ct.y < 0.5) _ct.y = 0.5;
  camera.position.lerp(_ct, Math.min(1, dt * 10)); camera.up.set(0, 1, 0);
  camera.lookAt(player.pos.clone().add(new V3(0, 1.5, 0)));
  // prompts
  const nearC = Math.hypot(player.pos.x - creator.position.x, player.pos.z - creator.position.z) < 14;
  updateSanctumChicks(dt, t); updateSanctumFriends(dt, t); updateFight(dt, t); updateQuestHud();
  const nf = nearFriend();
  const hn = QUEST.stage === 'active' && nearHen();
  setPrompt(card ? '' : hn ? (followers().length ? `<kbd>E</kbd> atiduoti viščiukus vištai (${followers().length})` : 'Višta laukia savo viščiukų') : q7SanctumNear() ? '<kbd>E</kbd> paimti snaiperio šautuvą' : tmSanctumNear() ? '<kbd>E</kbd> keliauti laiko mašina' : q13SanctumNear() ? '<kbd>E</kbd> sudėti auksines kates į ratą' : q14SanctumNear() ? q14SanctumPrompt() : phoneNear() ? (!phoneUnread() ? '<kbd>E</kbd> paskaityti dievų pokalbį telefone' : '<kbd>E</kbd> pažiūrėti į Kūrėjo telefoną – nauja žinutė!') : nf ? `<kbd>E</kbd> kalbėtis: ${nf.name}` : nearC ? '<kbd>E</kbd> kalbėtis su Kūrėju' : '');
  if (!nearC && card && (card.kind === 'creator' || (card.kind === 'info' && !nf))) hideCard();
  if (Math.hypot(player.pos.x, player.pos.z - 22) < 2.4 && player.pos.y < 3) exitSanctum();
}

// ================= mini globe =================
const miniScene = new THREE.Scene(), miniCam = new THREE.PerspectiveCamera(32, 1, 1, 2000);
miniScene.add(new THREE.AmbientLight(0xffffff, 0.75)); const miniSun = new THREE.DirectionalLight(0xffffff, 0.6); miniScene.add(miniSun);
const miniDot = mesh(G.sph, bmat(0xff2a2a)); miniDot.scale.setScalar(4); miniScene.add(miniDot);
const miniCarDot = mesh(G.sph, bmat(0xffffff)); miniCarDot.scale.setScalar(2.6); miniScene.add(miniCarDot);
function renderMini() {
  const size = innerWidth <= 640 ? 110 : 150, x = innerWidth - size - 16, y = innerHeight - size - 16;
  const d = mode === 'sanctum' ? UP : player.up;
  miniCam.position.copy(d).multiplyScalar(R * 4.6); miniCam.up.copy(mode === 'sanctum' ? new V3(0, 0, -1) : player.fwd); miniCam.lookAt(0, 0, 0);
  miniSun.position.copy(miniCam.position);
  miniDot.position.copy(d).multiplyScalar(R + 8); miniDot.visible = mode !== 'sanctum';
  miniCarDot.visible = car.exists && mode !== 'sanctum'; miniCarDot.position.copy(car.pos).normalize().multiplyScalar(R + 7);
  renderer.setViewport(x, y, size, size); renderer.setScissor(x, y, size, size); renderer.setScissorTest(true);
  renderer.clearDepth(); renderer.render(miniScene, miniCam);
  renderer.setScissorTest(false); renderer.setViewport(0, 0, innerWidth, innerHeight);
}

// ================= loop =================
const clock = new THREE.Clock(); let T = 0;
function attract(dt) {
  if (inStar()) { buildStar(); const a = T * 0.05; camera.position.set(Math.cos(a) * 110, 50, Math.sin(a) * 110); camera.up.set(0, 1, 0); camera.lookAt(0, 6, 0); return; }
  if (inWind()) { buildWind(); const a = T * 0.06; camera.position.set(Math.cos(a) * 75, 24, Math.sin(a) * 75); camera.up.set(0, 1, 0); camera.lookAt(0, 12, -20); return; }
  if (inThunder()) { buildThunder(); const a = T * 0.07; camera.position.set(Math.cos(a) * 50, 22, Math.sin(a) * 50); camera.up.set(0, 1, 0); camera.lookAt(0, 6, -15); poseDragon(THW.dragon, T * 0.5, 3); return; }
  if (inTime()) { buildTimeWorld(); const a = T * 0.07; camera.position.set(Math.cos(a) * 60, 26 + Math.sin(T * 0.2) * 4, Math.sin(a) * 60); camera.up.set(0, 1, 0); camera.lookAt(0, 8, -10); return; }
  if (inSun()) { buildSun(); const a = T * 0.07; camera.position.set(Math.cos(a) * 60, 22 + Math.sin(T * 0.2) * 4, -20 + Math.sin(a) * 60); camera.up.set(0, 1, 0); camera.lookAt(0, 8, -20); SUN.tex.offset.x = T * 0.004; return; }
  if (inSeaForever()) { buildSea(); const a = T * 0.08; camera.position.set(-20 + Math.cos(a) * 70, 26 + Math.sin(T * 0.2) * 4, -30 + Math.sin(a) * 70); camera.up.set(0, 1, 0); camera.lookAt(-20, 4, -30); for (const b of SEA.bubbles) { b.position.y += dt * 1.2; if (b.position.y > SEA_TOP) b.position.y = 0; } return; }
  const a = T * 0.06;
  camera.position.set(Math.cos(a) * R * 2.25, R * 0.9 + Math.sin(T * 0.1) * 20, Math.sin(a) * R * 2.25);
  camera.up.set(0, 1, 0); camera.lookAt(0, 0, 0);
  scene.fog.far = 900; scene.fog.near = 400;
  bubbleU.uUp.value.set(0, 1, 0);
  for (const an of animators) an(dt, T);
  updateDunes(dt); updateIce(dt); updateCrimson(dt, T); updateBirds(dt, T); updatePixel(dt, T); updateTraffic(dt, T);
  sun.position.copy(camera.position).add(new V3(40, 80, 0)); sun.target.position.set(0, 0, 0); bubbleU.uSun.value.copy(sun.position).normalize(); if (waterMat) waterMat.normalMap.offset.x = T * 0.004;
  hemi.position.set(0, 1, 0);
}
// hold Space in the air to fly – everywhere, even without a jet-pack or wings
function freeFly(dt) {
  if (mode !== 'wind') return;   // free flying with Space (no skin) works only on the Wind planet
  if (!keys.Space || player.grounded || player.inCar || player.down || card || Q8.back === 'jetpack') return;
  if (typeof noFlyHere === 'function' && noFlyHere()) return;
  if (mode === 'attract' || mode === 'dig' || mode === 'sea') return;
  if (mode === 'planet' && (Q8.back === 'wings' || Q8.back === 'dragonwings')) return;
  const fast = keys.ShiftLeft || keys.ShiftRight;
  player.vr = Math.min(player.vr + (GRAV + (player.vr < 0 ? 40 : 14)) * dt, fast ? 13 : 8);
}
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05); T += dt;
  if (toastTimer > 0) { toastTimer -= dt; if (toastTimer <= 0) toastEl.classList.remove('show'); }
  for (let i = fx.length - 1; i >= 0; i--) if (!fx[i](dt)) fx.splice(i, 1);
  const isPaused = started && !$('paused').hidden;
  if (!isPaused && !cinema) freeFly(dt);
  if (isPaused) { }
  else if (cinema) { cinema(dt); }
  else if (mode === 'attract') attract(dt);
  else if (mode === 'planet') {
    if (!locked) { const k = 1.8 * dt / 0.0024; if (keys.ArrowLeft) look(-k, 0); if (keys.ArrowRight) look(k, 0); if (keys.ArrowUp) look(0, -k * 0.6); if (keys.ArrowDown) look(0, k * 0.6); }
    updatePlanet(dt, T); updateCameraPlanet(dt); if (scoped) scopeCamera();
  } else {
    if (!locked) { const k = 1.8 * dt / 0.0024; if (keys.ArrowLeft) look(-k, 0); if (keys.ArrowRight) look(k, 0); if (keys.ArrowUp) look(0, -k * 0.6); if (keys.ArrowDown) look(0, k * 0.6); }
    if (mode === 'home') updateHome(dt, T); else if (mode === 'kitchen') updateKitchen(dt, T); else if (mode === 'mars') updateMars(dt, T); else if (mode === 'museum') updateMuseum(dt, T); else if (mode === 'caphouse') updateCapHouse(dt, T); else if (mode === 'cave') updateCave(dt, T); else if (mode === 'candy') updateCandy(dt, T); else if (mode === 'rainbow') updateRainbow(dt, T); else if (mode === 'marscloud') updateMarsCloud(dt, T); else if (mode === 'stone') updateStone(dt, T); else if (mode === 'future') updateFuture(dt, T); else if (mode === 'space') updateSpace(dt, T); else if (mode === 'sea') updateSea(dt, T); else if (mode === 'sun') updateSunWorld(dt, T); else if (mode === 'time') updateTimeWorld(dt, T); else if (mode === 'upside') updateUpside(dt, T); else if (mode === 'thunder') updateThunder(dt, T); else if (mode === 'dig') updateDig(dt, T); else if (mode === 'wind') updateWind(dt, T); else if (mode === 'star') updateStar(dt, T); else if (mode === 'cloudcastle') updateCloudCastle(dt, T); else if (mode === 'pk') updatePk(dt, T); else if (mode === 'sr') updateSr(dt, T); else if (mode === 'tea') updateTea(dt, T); else if (mode === 'void') updateVoid(dt, T); else if (mode === 'mine') updateMine(dt, T); else { updateSanctum(dt, T); applyShake(dt); }
  }
  bubbleU.uTime.value = T; bubbleU.uCam.value.copy(camera.position);
  renderer.setViewport(0, 0, innerWidth, innerHeight); renderer.clear();
  renderer.render(mode === 'mine' ? mineScene : mode === 'void' ? voidScene : mode === 'tea' ? teaScene : mode === 'sr' ? srScene : mode === 'pk' ? pkScene : mode === 'sanctum' ? sanc : mode === 'home' ? homeScene : mode === 'kitchen' ? kitchenScene : mode === 'mars' ? marsScene : mode === 'museum' ? museumScene : mode === 'caphouse' ? chScene : mode === 'cave' ? caveScene : mode === 'candy' ? candyScene : mode === 'rainbow' ? rbScene : mode === 'marscloud' ? mcScene : mode === 'stone' ? ugScene : mode === 'future' ? fuScene : mode === 'space' ? spScene : mode === 'cloudcastle' ? ccScene : mode === 'upside' ? udScene : mode === 'star' || (mode === 'attract' && inStar()) ? stScene : mode === 'wind' || (mode === 'attract' && inWind()) ? wiScene : mode === 'thunder' || mode === 'dig' || (mode === 'attract' && inThunder()) ? thScene : mode === 'time' || (mode === 'attract' && inTime()) ? twScene : mode === 'sun' || (mode === 'attract' && inSun()) ? sunScene : mode === 'sea' || (mode === 'attract' && inSeaForever()) ? seaScene : scene, camera);
  if (mode !== 'attract' && mode !== 'home' && mode !== 'kitchen' && mode !== 'mars' && mode !== 'museum' && mode !== 'caphouse' && mode !== 'cave' && mode !== 'candy' && mode !== 'rainbow' && mode !== 'marscloud' && mode !== 'stone' && mode !== 'future' && mode !== 'space' && mode !== 'sea' && mode !== 'sun' && mode !== 'cloudcastle' && mode !== 'time' && mode !== 'upside' && mode !== 'thunder' && mode !== 'dig' && mode !== 'wind' && mode !== 'star' && mode !== 'pk' && mode !== 'sr' && mode !== 'tea' && mode !== 'void' && mode !== 'mine') renderMini();
  $('mapFrame').style.visibility = mode === 'home' || mode === 'kitchen' || mode === 'mars' || mode === 'museum' || mode === 'caphouse' || mode === 'cave' || mode === 'candy' || mode === 'rainbow' || mode === 'marscloud' || mode === 'stone' || mode === 'future' || mode === 'space' || mode === 'sea' || mode === 'sun' || mode === 'cloudcastle' || mode === 'time' || mode === 'upside' || mode === 'thunder' || mode === 'dig' || mode === 'wind' || mode === 'star' || mode === 'pk' || mode === 'sr' || mode === 'tea' || mode === 'void' || mode === 'mine' ? 'hidden' : '';
  requestAnimationFrame(frame);
}

// ================= boot =================
function startGame() {
  if (started) return;
  started = true; $('start').hidden = true; hudEl.hidden = false; mode = 'planet';
  sndInit(); setMuted(SND.muted); musicSet(0);
  const d = cityDir(0, 9); player.pos.copy(d).multiplyScalar(R + groundH(d) + 0.2); player.up.copy(d); player.fwd.copy(tangentToward(d, UP)).negate();
  player.fwd.copy(tangentToward(d, cityDir(0, 0)));
  camera.position.copy(player.pos).addScaledVector(d, 30);
  scene.fog.far = 230; scene.fog.near = 40;
  setBiomeHud(0); refreshChecklist(); $('money').textContent = fmtMoney(money);
  // every game starts on the first planet – the other worlds are reached again the normal way (sea → sun → …)
  try { for (const k of ['modly-instar', 'modly-inwind', 'modly-inthunder', 'modly-intime', 'modly-insun', 'modly-insea', 'modly-portalworld']) localStorage.removeItem(k); } catch (_) { }
  if (inStar()) { enterStar(); toast('Žvaigždė', 'Tu pas Žvaigždžių Dievę. Esc – meniu', '#ffe8a0'); }
  else if (inWind()) { enterWind(); toast('Vėjo pasaulis', 'Tu pas Vėjo Dievą. Esc – meniu', '#bfefff'); }
  else if (inThunder()) { enterThunder(); toast('Audrų pasaulis', 'Tu pas Griaustinio Dievą. Esc – meniu', '#c8b0ff'); }
  else if (inTime()) { enterTime(); toast('Laiko pasaulis', 'Tu gyveni pas Laiko Dievą. Esc – meniu', '#b0ff9a'); }
  else if (inSun()) { enterSun(); toast('Saulė', 'Tu gyveni Saulėje pas Saulės Dievą. Esc – meniu', '#ffb020'); }
  else if (inSeaForever()) { enterSea(); if (!freshStart() && Q16.stage !== 'done') setTimeout(testFinishOcean, 1500); toast('Jūrų pasaulis', 'Tu gyveni po vandeniu pas Jūrų Dievą. Esc – meniu', '#4ac8ff'); }
  else if (restorePlayerSpot()) toast('Sveikas sugrįžęs!', 'Tęsi ten, kur išsaugojai. Esc – meniu', '#7dff6b');
  else toast('Pradžios Miestas', 'Čia prasideda dauguma kelionių. Apžiūrėk vartus aikštės centre (E). Esc – meniu', BIOMES[0].hud);
  audio();
  requestLock();
  try { window.claude && window.claude.hot && window.claude.hot.snapshot && window.claude.hot.snapshot(() => ({ visited: [...visited] })); } catch (_) { }
}
function boot(data) {
  buildPlanet(); miniScene.add(new THREE.Mesh(planetGeo, new THREE.MeshLambertMaterial({ vertexColors: true }))); miniScene.add(new THREE.Mesh(new THREE.SphereGeometry(R, 48, 24), new THREE.MeshLambertMaterial({ color: 0x5fb8e0, transparent: true, opacity: 0.8 }))); buildRoads(); reserveRocketSpot(); reservePortalSpot(); reservePondSpot(); reservePaintSpot(); buildVillages(); buildCity(); buildRestaurant(); buildDesert(); buildIce(); buildMushroom(); buildCrimson(); buildJungle(); buildPixel(); buildClouds(); buildSanctum();
  for (let k = 0; k < 16; k++) { const d = dirIn(0, 0.8, d => { const [u, v] = cityUV(d.x, d.y, d.z); const r = Math.hypot(u, v); return r > 6 && r < 50; }); if (d) spawnCritter('person', d); }
  for (let k = 0; k < 10; k++) { const d = dirIn(6, 0.8); if (d) spawnCritter('slime', d); }
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + 0.2, d = cityDir(Math.cos(a) * 14.5, Math.sin(a) * 14.5); spawnJunk(k % junk.length, d.clone().multiplyScalar(R + groundH(d) + 0.5)); }
  spawnBiomeItems(); buildKiosk(); loadHouses(); buildShopUI(); buildFurnUI(); buildPetKiosk(); loadPets(); buildPetUI(); buildCarKiosk(); buildCarUI(); loadGarage(); loadCar();
  spawnTraffic(); spawnPedestrians(); buildChicks(); buildDesertRocket(); buildMuseum(); if (Q2.stage === 'horn') attachHorn(true);
  buildCapHouse(); if (Q2.stage === 'done') startQ3(true); if (Q3.stage === 'fly') attachFly(true);
  buildPixelPortal(); q4Ready(false); buildQ5Cat(); if (Q4.stage === 'done') startQ5(true);
  buildIcePond(); if (Q6.stage === 'horn') attachDadHorn(true); if (Q6.skin) unlockSkin('unicorn'); equipSkin(skinNow, true); buildSkinKiosk(); buildPaintShop(); buildUFO(); buildVillagers(); buildLuckyCats(); buildDemonQuest(); buildFarm(); buildCaveCap(); buildSpaceRamp(); buildGodPhone(); buildSeaGate(); if (S15.stage === 'star') attachStar(true); if (Q13.stage === 'museum') attachMuseumCat(true); placeSanctumTM(); if (Q10.stage === 'mini') attachMiniTM(true); refreshHeld(); attachGoldBall(Q12.stage === 'carry'); buildFeathers(); buildCloudKingdom(); if (Q8.back) wearBack(Q8.back); if (Q8.stage === 'cloud') attachMiniCloud(true); showPrinceAtCastle(); if (Q7.stage === 'shoot') attachSniper(true); if (Q7.stage === 'sniper') placeSanctumSniper(); if (Q4.stage === 'horn') attachUniHorn(true);
  buildEnvironment(); buildGrass(); shadowPass(world); applyQuality();
  if (data && data.visited) data.visited.forEach(v => visited.add(v));
  try { const v = JSON.parse(localStorage.getItem('modly-visited') || 'null'); if (Array.isArray(v)) v.forEach(i => visited.add(i)); } catch (_) { }
  buildPauseMenu();
  refreshChecklist();
  const go = $('go'); go.disabled = false; let hasSave = false; try { hasSave = !!localStorage.getItem('modly-pos'); } catch (_) { } go.textContent = hasSave || visited.size > 1 || money > 0 ? 'Tęsti kelionę' : 'Pradėti kelionę'; go.onclick = startGame; const ng = $('newGo'); if (ng) { ng.hidden = !(hasSave || visited.size > 1 || money > 0); ng.onclick = () => newJourneyClick(ng); } go.focus();
  frame();
}
const fontsReady = (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
fontsReady.then(() => setTimeout(() => {
  const h = window.claude && window.claude.hot;
  if (h && h.ready) h.ready(boot); else boot(h && h.data || {});
}, 30));
$('muteBtn').addEventListener('click', () => { sndInit(); setMuted(!SND.muted); canvas.focus(); });

$('cheatForm').addEventListener('submit', e => { e.preventDefault(); runCommand($('cheatInput').value); closeConsole(); });
