// ================= Command #6: "Defeat the Aliens" =================
// find a sniper rifle hidden in the Creator's Hall → shoot down the flying saucer that is abducting a cow →
// bring the cow to the Creator → the cow gives you a tractor → tow the crashed saucer to the museum (it hangs from the ceiling)
const Q7 = { stage: 'none' };   // none | sniper | shoot | cow | tractor | tow | done
try { const s = JSON.parse(localStorage.getItem('modly-quest7') || 'null'); if (s && s.stage) Q7.stage = s.stage === 'tow' ? 'tractor' : s.stage; } catch (_) { }
function saveQ7() { try { localStorage.setItem('modly-quest7', JSON.stringify({ stage: Q7.stage })); } catch (_) { } }
const q7Active = () => Q7.stage !== 'none' && Q7.stage !== 'done';
const Q7_GIVE = [
  'Mažasis… pažvelk į dangų virš Begalinės Dykumos. Ten kabo svetimas laivas – ATEIVIAI!',
  'Jie siurbia į savo lėkštę karvę. Vargšė karvė ore jau trečią dieną ir sako, kad jai svaigsta galva.',
  'Naujas įsakymas: NUGALĖK ATEIVIUS. Mano salėje kažkur paslėptas snaiperio šautuvas – suradęs, pamatysi. Numušk lėkštę ir atvesk karvę pas mane.'
];
function Q7_LINES() {
  if (Q7.stage === 'none') return Q7_GIVE;
  if (Q7.stage === 'sniper') return ['Šautuvas paslėptas čia, mano salėje. Pasidairyk prie kristalų, pačiame krašte.'];
  if (Q7.stage === 'shoot') return ['Lėkštė kabo virš Begalinės Dykumos. Dešinys pelės mygtukas – taikiklis, kairys – šūvis. Trys taiklūs šūviai, ir ji kris.'];
  if (Q7.stage === 'cow') return ['Karvė saugi! Atvesk ją čia, per vartus aikštėje. Ji labai nori tau padėkoti.'];
  if (Q7.stage === 'tractor' || Q7.stage === 'tow') return ['Karvė padovanojo tau traktorių? Puiku. Prikabink ateivių lėkštę (Space) ir nuvilk ją į muziejų – tegul kaba po lubomis.'];
  const fin = ['Ateivių lėkštė kabo muziejuje, karvė ganosi mano salėje, o ateiviai… sako, išsigando ir išskrido namo. Gerai padirbėta.'];
  return Q8.stage === 'none' ? fin.concat(Q8_GIVE) : Q8_LINES();
}
function q7TalkEnd() {
  if (Q7.stage !== 'none' || Q5.stage !== 'done') return false;
  Q7.stage = 'sniper'; saveQ7(); placeSanctumSniper();
  [262, 330, 392, 523, 392].forEach((f, i) => tone(f, 0.4, { type: 'square', vol: 0.05, lp: 1400, when: i * 0.13 }));
  toast('Įsakymas #6: Nugalėk ateivius', 'Surask snaiperio šautuvą Kūrėjo Salėje', '#7dff6b');
  return true;
}

// ---------- the sniper rifle ----------
function makeSniper() {
  const g = new THREE.Group(), dark = mat(0x2a2e36, { metalness: 0.7, roughness: 0.35 }), wood = mat(0x6b4426, { roughness: 0.7 });
  g.add(S(G.box, wood, 0.12, 0.16, 0.7, 0, 0, -0.25));
  g.add(S(G.cyl, dark, 0.035, 1.5, 0.035, 0, 0.04, 0.8).rotateX(Math.PI / 2));
  g.add(S(G.cyl, dark, 0.07, 0.45, 0.07, 0, 0.16, 0.2).rotateX(Math.PI / 2));
  g.add(S(G.cyl, bmat(0x6ff7ff), 0.06, 0.02, 0.06, 0, 0.16, 0.43).rotateX(Math.PI / 2));
  g.add(S(G.box, dark, 0.04, 0.2, 0.08, 0, -0.12, 0.1));
  for (const x of [-0.08, 0.08]) { const l = S(G.cyl, dark, 0.012, 0.3, 0.012, x, -0.13, 1.25); l.rotation.z = x * 3; g.add(l); }
  return g;
}
let sancSniper = null;
const SNIPER_AT = new V3(-21, 0, -17);
function placeSanctumSniper() {
  if (sancSniper || Q7.stage !== 'sniper') return;
  const g = new THREE.Group(); g.position.copy(SNIPER_AT); sanc.add(g);
  g.add(S(G.cyl, mat(0x3a2a8a, { emissive: 0x1a0a40 }), 0.8, 0.9, 0.8, 0, 0.45, 0));
  const r = makeSniper(); r.position.set(0, 1.05, 0); r.rotation.y = 0.8; g.add(r); g.userData.r = r;
  for (let i = 0; i < 3; i++) { const cr = mesh(new THREE.OctahedronGeometry(rr(1.2, 2), 0), mat(0x6a4cff, { emissive: 0x2a1060 }), rr(-2.5, 2.5), 1.8, rr(1.2, 2.2)); cr.scale.y = 2; g.add(cr); }
  linearize(g); sancSniper = g;
}
let heldSniper = null;
function attachSniper(on) {
  const hand = player.mesh.userData.parts.handR;
  if (on && !heldSniper) { heldSniper = makeSniper(); heldSniper.scale.setScalar(0.85); heldSniper.position.set(0, 0.05, 0.25); hand.add(heldSniper); linearize(heldSniper); }
  if (!on && heldSniper) { hand.remove(heldSniper); heldSniper = null; }
}
function q7SanctumNear() { return Q7.stage === 'sniper' && sancSniper && Math.hypot(player.pos.x - SNIPER_AT.x, player.pos.z - SNIPER_AT.z) < 3.2; }
function q7TakeSniper() {
  sanc.remove(sancSniper); sancSniper = null; Q7.stage = 'shoot'; saveQ7(); attachSniper(true);
  tone(500, 0.08, { type: 'square', vol: 0.05 }); tone(300, 0.12, { type: 'square', vol: 0.05, when: 0.09 });
  toast('Radai snaiperio šautuvą!', 'Ateivių lėkštė – virš Begalinės Dykumos. Dešinys pelės mygtukas – taikiklis, kairys – šūvis', '#7dff6b');
}

// ---------- the flying saucer ----------
let ufo = null;
function makeUFO() {
  const g = new THREE.Group(), metal = mat(0xc8ccd6, { metalness: 0.85, roughness: 0.25 }), dark = mat(0x5a6070, { metalness: 0.8, roughness: 0.3 });
  g.add(S(G.sph, metal, 5, 1.1, 5, 0, 0, 0));
  g.add(S(G.cyl, dark, 3.2, 0.5, 3.2, 0, -0.7, 0));
  g.add(S(G.dome, new THREE.MeshStandardMaterial({ color: 0x9fffb0, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.2 }), 2.2, 1.8, 2.2, 0, 0.6, 0));
  const lights = [];
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, l = S(G.sph, bmat(i % 2 ? 0x7dff6b : 0xffe14d), 0.28, 0.28, 0.28, Math.cos(a) * 4.4, -0.15, Math.sin(a) * 4.4); g.add(l); lights.push(l); }
  // two little aliens looking out of the dome
  const aliens = [];
  for (const x of [-0.7, 0.7]) { const a = new THREE.Group(); a.position.set(x, 0.6, 0.3); g.add(a); a.add(S(G.sph, mat(0x7dff6b), 0.45, 0.55, 0.45, 0, 0.6, 0)); for (const ex of [-0.17, 0.17]) a.add(S(G.sph, bmat(0x111111), 0.15, 0.22, 0.08, ex, 0.68, 0.38)); a.add(S(G.cyl, mat(0x7dff6b), 0.03, 0.4, 0.03, 0, 1.25, 0)); a.add(S(G.sph, mat(0xff5fae), 0.08, 0.08, 0.08, 0, 1.45, 0)); aliens.push(a); }
  g.userData = { lights, aliens };
  return g;
}
function buildUFO() {
  if (Q7.stage === 'done') return;
  // a spot in the Endless Desert, well away from the rocket and the road
  let d = null;
  for (let k = 0; k < 200 && !d; k++) { const c = dirIn(1, 0.9); if (!c) continue; if (nearReserved(c, 12) || nearRoad(c, 8)) continue; if (rocketSpot && c.angleTo(rocketSpot.d) * R < 40) continue; d = c; }
  if (!d) d = BC[1].clone();
  const ground = R + groundH(d), g = makeUFO(); world.add(g); linearize(g);
  const fwd = tangentToward(d, randDir()).normalize();
  const beamM = new THREE.MeshBasicMaterial({ color: 0x9dffb0, transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 4.2, 20, 24, 1, true), beamM); world.add(beam);
  const cow = ANIMALS.find(a => a.id === 'cow').make(); world.add(cow); linearize(cow);
  ufo = { g, d, fwd, ground, beam, cow, hp: 3, state: 'hover', hover: ground + 24, cowH: ground + 9, t: 0, crashPos: null, smokeT: 0 };
  if (Q7.stage === 'cow' || Q7.stage === 'tractor' || Q7.stage === 'tow') crashUFO(true);
  placeUFO(0);
}
function placeUFO(t) {
  const u = ufo; if (!u) return;
  if (u.state === 'hover') {
    // the aliens only arrive once the unicorn horn mission is done
    const here = Q4.stage === 'done'; u.g.visible = here; u.beam.visible = here; u.cow.visible = here; if (!here) return;
    const wob = new V3().copy(u.fwd).multiplyScalar(Math.sin(t * 0.4) * 2);
    u.g.position.copy(u.d).multiplyScalar(u.hover + Math.sin(t * 1.3) * 0.6).add(wob); orient(u.g, u.d, u.fwd); u.g.rotateY(t * 0.6);
    u.beam.position.copy(u.d).multiplyScalar((u.ground + u.hover) / 2 - 0.5).add(wob); orient(u.beam, u.d, u.fwd);
    u.cow.position.copy(u.d).multiplyScalar(u.cowH + Math.sin(t * 1.7) * 1.2).add(wob); orient(u.cow, u.d, u.fwd); u.cow.rotateY(t * 0.9); u.cow.rotateX(Math.sin(t * 1.1) * 0.4);
    u.g.userData.lights.forEach((l, i) => l.visible = (Math.floor(t * 6) + i) % 3 !== 0);
  }
}
function crashUFO(quiet) {
  const u = ufo; u.state = 'crashed'; u.beam.visible = false; u.cow.visible = false;
  const cd = moveAlong(u.d, u.fwd, 14); u.crashDir = cd; u.crashPos = cd.clone().multiplyScalar(R + groundH(cd) + 0.6);
  if (quiet) { setUFOOnGround(); spawnSavedCow(true); return; }
  // fall down in a spiral of smoke, then boom
  let k = 0; const from = u.g.position.clone();
  fx.push(dt => {
    k += dt / 2.2; const kk = Math.min(1, k);
    u.g.position.lerpVectors(from, u.crashPos, kk * kk); u.g.rotateZ(dt * 2.5); u.g.rotateY(dt * 4);
    if (Math.random() < 0.5) poof(u.g.position.clone(), 0x555555);
    if (kk >= 1) { explode(u.crashPos.clone(), 1.2); setUFOOnGround(); aliensFlee(); return false; }
    return true;
  });
  // the cow floats gently down
  const c0 = u.cow.position.clone(), cowD = u.d.clone(), cowG = cowD.clone().multiplyScalar(u.ground + 0.2); u.cow.visible = true; let c = 0;
  fx.push(dt => { c += dt / 4; const cc = Math.min(1, c); u.cow.position.lerpVectors(c0, cowG, cc); u.cow.rotateY(dt * 2); if (cc >= 1) { u.cow.visible = false; spawnSavedCow(false); return false; } return true; });
}
function setUFOOnGround() {
  const u = ufo; u.g.position.copy(u.crashPos); orient(u.g, u.crashDir, tangentToward(u.crashDir, u.fwd)); u.g.rotateZ(0.25); u.g.rotateX(-0.1); u.g.scale.setScalar(0.7);
  u.g.userData.lights.forEach(l => l.visible = false); u.g.userData.aliens.forEach(a => a.visible = false);
  u.solid = { p: u.crashPos.clone().addScaledVector(u.crashDir, -0.6), up: u.crashDir.clone(), dir: u.crashDir.clone(), r: 3.2, top: u.crashPos.length() + 0.7, thin: false }; solids.push(u.solid);
}
function aliensFlee() {
  const u = ufo;
  u.g.userData.aliens.forEach((a, i) => {
    const m = new THREE.Group(); m.add(S(G.sph, mat(0x7dff6b), 0.45, 0.55, 0.45, 0, 0.6, 0)); for (const ex of [-0.17, 0.17]) m.add(S(G.sph, bmat(0x111111), 0.15, 0.22, 0.08, ex, 0.68, 0.38)); linearize(m); world.add(m);
    const dir = tangentToward(u.crashDir, randDir()).normalize(); let t = 0;
    fx.push(dt => { t += dt; const dd = moveAlong(u.crashDir, dir, 3 + t * 6); m.position.copy(dd).multiplyScalar(R + groundH(dd) + (t > 2.5 ? (t - 2.5) * 12 : Math.abs(Math.sin(t * 12)) * 0.4)); orient(m, dd, dir);
      if (t > 4) { world.remove(m); return false; } return true; });
  });
  setTimeout(() => toast('Ateiviai išsigando ir išskrido namo!', 'Karvė nusileido – pakalbink ją (E)', '#7dff6b'), 900);
}

// ---------- shooting ----------
let scoped = false;
const scopeEl = (() => { const d = document.createElement('div'); d.id = 'scope'; d.hidden = true; d.innerHTML = '<div class="ring"></div><div class="h"></div><div class="v"></div>'; document.body.appendChild(d); return d; })();
function sniperActive() { return Q7.stage === 'shoot' && heldSniper && mode === 'planet' && !player.inCar; }
function setScope(on) { const was = scoped; scoped = on && sniperActive(); scopeEl.hidden = !scoped; camera.fov = scoped ? 14 : 65; camera.updateProjectionMatrix(); player.mesh.visible = !scoped; if (was && !scoped) player.pitch = Math.max(player.pitch, -0.35); }
function q7HandDown(side) {
  if (!sniperActive()) return false;
  if (side === 'R') { setScope(true); return true; }
  shootSniper(); return true;
}
function q7HandUp(side) { if (side === 'R' && scoped) { setScope(false); return true; } return false; }
const _ray = new THREE.Ray();
function shootSniper() {
  noiseHit(0.35, { f: 500, vol: 0.25 }); tone(90, 0.3, { to: 40, type: 'sawtooth', vol: 0.12, lp: 600 }); shake = Math.max(shake, 0.3);
  const dir = new V3(); camera.getWorldDirection(dir);
  _ray.set(camera.position, dir);
  // a bright tracer
  const end = camera.position.clone().addScaledVector(dir, 300), tr = new THREE.Line(new THREE.BufferGeometry().setFromPoints([camera.position.clone().addScaledVector(dir, 2), end]), new THREE.LineBasicMaterial({ color: 0xfff3a0, transparent: true }));
  world.add(tr); let t = 0; fx.push(dt => { t += dt; tr.material.opacity = 1 - t / 0.25; if (t > 0.25) { world.remove(tr); return false; } return true; });
  if (!ufo || ufo.state !== 'hover') return;
  const c = ufo.g.position, hit = _ray.distanceSqToPoint(c) < 5.2 * 5.2 && dir.dot(c.clone().sub(camera.position)) > 0;
  if (!hit) return;
  ufo.hp--; poof(c.clone(), 0xffe14d); noiseHit(0.3, { ft: 'bandpass', f: 2500, vol: 0.15 });
  ufo.g.userData.aliens.forEach(a => a.position.y = 0.9);
  if (ufo.hp > 0) { toast(`Pataikei! Lėkštei liko ${ufo.hp} ${ufo.hp === 1 ? 'smūgis' : 'smūgiai'}`, 'Ateiviai panikoje!', '#7dff6b'); return; }
  setScope(false); attachSniper(false); Q7.stage = 'cow'; saveQ7();
  toast('NUMUŠEI ATEIVIŲ LĖKŠTĘ!', 'Karvė leidžiasi žemyn…', '#7dff6b');
  crashUFO(false);
}

// ---------- the cow ----------
let cowQ = null;
function spawnSavedCow(quiet) {
  if (cowQ || Q7.stage !== 'cow') return;
  const def = ANIMALS.find(a => a.id === 'cow'), m = def.make(); world.add(m); linearize(m);
  const d = ufo.d.clone();
  cowQ = { def, mesh: m, pos: d.clone().multiplyScalar(R + groundH(d) + 0.3), fwd: ufo.fwd.clone(), vel: new V3(), vr: 0, up: d.clone(), grounded: false, rad: 0.8, walk: 0, state: 'wait', sayT: 2, ground: R };
  cowQ.inspect = addInspect(cowQ.pos, 'Karvė', '', 3.5, { verb: 'pakalbinti karvę', onUse: talkCow });
  if (!quiet) setTimeout(() => { petBubble(cowQ, 'Mūūū!'); SAYS.cow(); }, 300);
}
function talkCow() {
  if (cowQ.state === 'follow') { petBubble(cowQ, pick(['Mūū!', 'Einu, einu!'])); SAYS.cow(); return; }
  SAYS.cow();
  startTalk('Karvė', ['Mūūū… Žemė! Tikra žemė po kanopomis! Tris dienas sukausi ore kaip skalbinys.', 'Tu mane išgelbėjai? Mažas žalias žmogeliukas su šautuvu? Mūū, kaip įdomu.', 'Nuvesk mane pas Kūrėją. Ten saugu. O aš tau atsidėkosiu – turiu kai ką labai didelio ir labai žalio.'], '#7dff6b', () => {
    cowQ.state = 'follow'; cowQ.inspect.r = 0; toast('Karvė seka paskui tave', 'Nuvesk ją per Kūrėjo vartus aikštėje', '#7dff6b');
  });
}
function updateCow(dt, t) {
  const c = cowQ; if (!c) return;
  const ud = c.mesh.userData; let speed = 0;
  if (c.state === 'follow') {
    let toP = c.pos.distanceTo(player.pos);
    if (toP > 60) { const back = moveAlong(player.up, tangentToward(player.up, player.pos.clone().add(player.fwd)), -4); c.pos.copy(back).multiplyScalar(R + groundH(back) + 0.5); c.vel.set(0, 0, 0); toP = 4; }
    if (toP > 4) { speed = toP > 14 ? 11 : 7; c.fwd.lerp(tangentToward(c.up, player.pos.clone().sub(c.pos)).normalize(), Math.min(1, dt * 5)).normalize(); }
  } else { c.sayT -= dt; if (c.sayT < 0) { c.sayT = rr(5, 9); if (c.pos.distanceTo(player.pos) < 40) { petBubble(c, pick(['Mūū…', 'Kur ateiviai?', 'Galva sukasi…'])); if (distVol(c.pos) > 0.05) SAYS.cow(); } } }
  if (c.grounded) c.vel.copy(c.fwd).multiplyScalar(speed);
  const moving = speed > 0.1; if (moving) c.walk += dt * (speed * 2 + 2);
  stepPlanet(c, dt, c.rad);
  const sw = moving ? Math.sin(c.walk) : 0;
  if (ud.legs) ud.legs.forEach((l, i) => { l.rotation.x = (i % 2 === 0) === (i < 2) ? sw * 0.5 : -sw * 0.5; });
  c.mesh.position.copy(c.pos); orient(c.mesh, c.up, c.fwd);
}
function q7EnterSanctum() {
  if (Q7.stage !== 'cow' || !cowQ || cowQ.state !== 'follow') return;
  world.remove(cowQ.mesh); cowQ.inspect.r = 0; cowQ = null;
  Q7.stage = 'tractor'; saveQ7();
  if (!garage.includes('tractor')) { garage.push('tractor'); saveGarage(); }
  setTimeout(() => {
    [392, 523, 659, 784].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.07, when: i * 0.12 })); SAYS.cow();
    startTalk('Karvė', ['Mūū! Kokia graži salė! Liksiu čia gyventi – žolė čia šviečia!', 'Kaip ir žadėjau: štai mano traktorius. Didelis, žalias ir labai stiprus. Jis tavo!', 'Su juo gali nutempti tą ateivių lėkštę į muziejų. Prisiartink traktoriumi ir spausk Space – prikabinsi.'], '#7dff6b', () =>
      toast('Gavai traktorių!', 'F – iškviesk traktorių, nuvažiuok prie lėkštės dykumoje ir spausk Space', '#7dff6b'));
  }, 1300);
}
function addSanctumCow() {
  if (FR.cow || !(Q7.stage === 'tractor' || Q7.stage === 'tow' || Q7.stage === 'done')) return;
  FR.cow = true;
  const m = ANIMALS.find(a => a.id === 'cow').make(); m.scale.setScalar(1.2); m.position.set(-9, 0, 9); m.rotation.y = 0.8;
  addFriend('Karvė', m, ['Mūū. Čia žolė šviečia ir niekas manęs nesiurbia į dangų. Tobula.', 'Kaip sekasi mano traktoriui? Neužmiršk jo tepti. Mūū.', 'Kartais sapnuoju ateivius. Bet čia, pas Kūrėją, nebijau.'], { r: 3.5 });
}

// ---------- the tractor ----------
CARS.push({ id: 'tractor', secret: true, name: 'Traktorius', desc: 'Karvės dovana. Lėtas, bet tempia viską. Space – prikabinti / atkabinti.', top: 13, accel: 8, turn: 1.6, len: 4.2, wid: 2.4, cam: 11, seat: [0, 1.75, -0.6], trick: 'hook', trickName: 'prikabinti / atkabinti',
  make(w) {
    const g = new THREE.Group(), c = paint(0x2fae4a), y = paint(0xffd23a);
    g.add(S(G.box, c, 1.3, 1.0, 2.6, 0, 1.2, 0.6)); g.add(S(G.box, c, 1.9, 0.3, 3.8, 0, 0.75, 0));
    g.add(S(G.box, glass(), 1.5, 1.2, 1.4, 0, 2.15, -0.6)); g.add(S(G.box, c, 1.6, 0.1, 1.5, 0, 2.8, -0.6));
    for (const [x, z] of [[-0.75, -1.35], [0.75, -1.35], [-0.75, 0.15], [0.75, 0.15]]) g.add(S(G.cyl, c, 0.04, 1.2, 0.04, x, 2.2, z));
    g.add(S(G.cyl, mat(0x30343e, { metalness: 0.6 }), 0.09, 1.0, 0.09, 0.4, 2.1, 1.3));
    for (const x of [-1.15, 1.15]) wheel(g, x, -1.2, 1.0, 0.6, w, 0x1a1a1a);
    for (const x of [-0.95, 0.95]) wheel(g, x, 1.4, 0.55, 0.4, w, 0x1a1a1a);
    g.children.filter(o => o.geometry && o.geometry.type === 'CylinderGeometry' && o.rotation.z).forEach(o => o.children.forEach(h => h.material = y));
    g.add(S(G.box, mat(0x30343e), 0.3, 0.3, 0.6, 0, 0.75, -2.1));
    for (const x of [-0.45, 0.45]) g.add(S(G.cyl, bmat(0xfff3a0), 0.12, 0.08, 0.12, x, 1.4, 1.92).rotateX(Math.PI / 2));
    return g;
  } });
function q7Hook() {
  if (!ufo || !(player.inCar && ride === auto && auto.spec.id === 'tractor')) return false;
  if (Q7.stage === 'tow') { Q7.stage = 'tractor'; saveQ7(); ufo.towing = false; tone(300, 0.15, { type: 'square', vol: 0.05 }); toast('Atkabinai lėkštę', 'Space – prikabinti vėl', '#7dff6b'); if (!ufo.solid.parent) solids.push(ufo.solid); return true; }
  if (Q7.stage !== 'tractor' || ufo.state !== 'crashed') return false;
  if (auto.pos.distanceTo(ufo.g.position) > 15) { toast('Per toli nuo lėkštės', 'Privažiuok arčiau ir spausk Space', '#ffb347'); return true; }
  Q7.stage = 'tow'; saveQ7(); ufo.towing = true;
  const i = solids.indexOf(ufo.solid); if (i >= 0) solids.splice(i, 1);
  noiseHit(0.3, { f: 1200, vol: 0.12 }); tone(200, 0.2, { to: 400, type: 'square', vol: 0.05 });
  toast('Lėkštė prikabinta!', 'Tempk ją į muziejų Pradžios Mieste', '#7dff6b');
  return true;
}
let towRope = null;
function updateTow(dt, t) {
  if (!ufo) return;
  if (ufo.state === 'hover') { ufo.t += dt; placeUFO(ufo.t); return; }
  if (ufo.state === 'crashed' && !ufo.towing && ufo.smokeT !== undefined) { ufo.smokeT -= dt; if (ufo.smokeT < 0 && Q7.stage !== 'done') { ufo.smokeT = 0.6; if (ufo.g.position.distanceTo(player.pos) < 120) poof(ufo.g.position.clone().addScaledVector(ufo.g.position.clone().normalize(), 1.5), 0x777777); } }
  const towing = ufo.towing && Q7.stage === 'tow' && player.inCar && ride === auto && auto.spec.id === 'tractor';
  if (ufo.towing && !towing && Q7.stage === 'tow') { Q7.stage = 'tractor'; saveQ7(); ufo.towing = false; if (!solids.includes(ufo.solid)) { ufo.solid.p = ufo.g.position.clone(); ufo.solid.up = ufo.g.position.clone().normalize(); ufo.solid.dir = ufo.solid.up.clone(); ufo.solid.top = ufo.g.position.length() + 0.9; solids.push(ufo.solid); } }
  if (towing) {
    const back = auto.pos.clone().addScaledVector(auto.fwd, -(auto.spec.len / 2 + 4.5)), bd = back.clone().normalize();
    const target = bd.clone().multiplyScalar(R + groundH(bd) + 0.9);
    ufo.g.position.lerp(target, Math.min(1, dt * 6)); orient(ufo.g, bd, auto.fwd); ufo.g.rotateX(-0.08);
    if (!towRope) { towRope = mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 6), mat(0x30343e)); world.add(towRope); }
    const a = auto.pos.clone().addScaledVector(auto.fwd, -auto.spec.len / 2).addScaledVector(auto.up, 0.8), b = ufo.g.position.clone().addScaledVector(auto.fwd, 3.2);
    towRope.visible = true; towRope.position.copy(a).add(b).multiplyScalar(0.5); towRope.scale.y = a.distanceTo(b); towRope.quaternion.setFromUnitVectors(new V3(0, 1, 0), b.clone().sub(a).normalize());
    if (museum && ufo.g.position.distanceTo(museum.g.position) < 18) deliverUFO();
  } else if (towRope) towRope.visible = false;
}
function deliverUFO() {
  ufo.towing = false; world.remove(ufo.g); if (towRope) towRope.visible = false; Q7.stage = 'done'; saveQ7(); addMoney(600);
  explode(museum.g.position.clone().addScaledVector(museum.d, 1), 0.3);
  [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.6, { type: 'triangle', vol: 0.07, when: i * 0.11 }));
  toast('Įsakymas #6 įvykdytas!', 'Ateivių lėkštė dabar kabo po muziejaus lubomis. Apdovanojimas: 600 €', '#ffe98a');
  refreshMuseumUFO();
}
let museumUFO = null;
function refreshMuseumUFO() {
  if (!MU.built || museumUFO || Q7.stage !== 'done') return;
  const g = makeUFO(); g.userData.aliens.forEach(a => a.visible = false); g.scale.setScalar(0.5); g.position.set(0, MU.H - 1.6, -8); g.rotation.z = 0.12; museumScene.add(g);
  g.userData.cables = [];
  for (const [x, z] of [[-1.6, 0], [1.6, 0], [0, 1.6], [0, -1.6]]) { const c = S(G.cyl, mat(0x30343e), 0.02, 1.3, 0.02, x, MU.H - 0.65, -8 + z); museumScene.add(c); g.userData.cables.push(c); }
  linearize(g); museumUFO = g;
  MU.spots.push({ x: 0, z: -8, name: 'Ateivių lėkštė', text: 'Numušta virš Begalinės Dykumos ir atitempta traktoriumi. Ateiviai paliko ją ir išskrido namo. Lemputės kartais dar sumirksi – sargai sako, kad lėkštė svajoja apie žvaigždes.' });
  animators.push((dt, t) => { if (museumUFO) { museumUFO.rotation.y += dt * 0.3; museumUFO.userData.lights.forEach((l, i) => l.visible = (Math.floor(t * 3) + i) % 4 === 0); } });
}

// ---------- HUD ----------
function updateQ7Hud(el) {
  if (!q7Active()) { el.hidden = true; return; }
  el.hidden = false;
  let step = '', target = null, arrow = '', dist = '';
  if (Q7.stage === 'sniper') { step = mode === 'sanctum' ? 'Surask snaiperio šautuvą – prie kristalų, krašte' : 'Eik pas Kūrėją – šautuvas jo salėje'; target = mode === 'planet' ? gate.center : null; }
  else if (Q7.stage === 'shoot') { step = 'Numušk lėkštę virš Begalinės Dykumos · RMB – taikiklis, LMB – šūvis' + (ufo ? ` · liko ${ufo.hp}` : ''); target = ufo && ufo.g.position; }
  else if (Q7.stage === 'cow') { step = cowQ && cowQ.state === 'follow' ? 'Nuvesk karvę pas Kūrėją (vartai aikštėje)' : 'Pakalbink karvę dykumoje'; target = cowQ && cowQ.state === 'follow' ? gate.center : cowQ && cowQ.pos; }
  else if (Q7.stage === 'tractor') { step = player.inCar && auto.spec && auto.spec.id === 'tractor' ? 'Privažiuok prie lėkštės ir spausk Space' : 'F – iškviesk traktorių ir važiuok prie lėkštės'; target = ufo && ufo.g.position; }
  else if (Q7.stage === 'tow') { step = 'Tempk lėkštę į muziejų Pradžios Mieste'; target = museum && museum.g.position; }
  if (target && mode === 'planet') { arrow = arrowTo(target); dist = ` · ${Math.round(target.distanceTo(player.pos))} m`; if (q2Dot) { q2Dot.visible = true; q2Dot.position.copy(target).normalize().multiplyScalar(R + 7); } }
  el.innerHTML = `${arrow}<div><div class="qt">Įsakymas #6: Nugalėk ateivius</div><div class="qs">${step}${dist}</div></div>`;
}

// first-person view through the scope
function scopeCamera() {
  const p = player.pitch, head = player.pos.clone().addScaledVector(player.up, 1.7);
  const dir = player.fwd.clone().multiplyScalar(Math.cos(p)).addScaledVector(player.up, -Math.sin(p));
  camera.position.copy(head); camera.up.copy(player.up); camera.lookAt(head.clone().add(dir));
}
