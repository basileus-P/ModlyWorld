// ================= Command #5: "The Cat on the Road" =================
const Q5 = { stage: 'none', sticks: 0 };   // none | go | follow | done
try { const s = JSON.parse(localStorage.getItem('modly-quest5') || 'null'); if (s && s.stage) { Q5.stage = s.stage === 'follow' ? 'go' : s.stage; Q5.sticks = s.sticks || 0; } } catch (_) { }
function saveQ5() { try { localStorage.setItem('modly-quest5', JSON.stringify({ stage: Q5.stage, sticks: Q5.sticks })); } catch (_) { } }
function startQ5(silent) {
  if (Q5.stage !== 'none' || Q4.stage !== 'done') return;
  Q5.stage = 'go'; saveQ5(); if (catQ) { catQ.mesh.visible = true; catQ.inspect.r = 3.2; }
  if (!silent) setTimeout(() => {
    [392, 494, 587, 784].forEach((f, i) => tone(f, 0.45, { type: 'triangle', vol: 0.07, when: i * 0.14 }));
    toast('Įsakymas #5: Katinas ant kelio', 'Grybų Karalystėje ant kelio sėdi išsigandęs katinas. Nuvesk jį pas Kūrėją', '#ffb35a');
  }, 4500);
}
function Q5_LINES() {
  if (Q5.stage === 'go') return ['Grybų Karalystėje, tiesiai ant kelio, sėdi katinas. Jis bijo ir mašinų, ir šunų.', 'Pakalbink jį ir atvesk čia, pas mane. Šunys seks jį visur – bet tu turėsi daug pagaliukų. Šunys pagaliukus myli labiau už katinus.'];
  if (Q5.stage === 'follow') return ['Katinas seka paskui tave? Gerai. Mesk šunims pagaliukus (T) ir eik per vartus aikštėje – čia jis bus saugus.'];
  if (Q5.stage === 'done' && Q7.stage !== 'none') return Q7_LINES();
  if (Q5.stage === 'done') return Q7_GIVE.slice(0, 0).concat(['Katinas čia jau prisijaukino – miega ant mano šviesos, lyg ji būtų saulės lopinėlis. Ačiū tau.'], Q7_GIVE);
  return null;
}

// ---------- the cat ----------
let catQ = null;
function buildQ5Cat() {
  let best = null, bs = -1e9;
  for (const path of roadPaths) for (const x of path.s) { if (x.bridge) continue; weights(x.d.x, x.d.y, x.d.z, W); if (W[3] < 0.9) continue; const sc = -Math.abs(x.d.dot(BC[3]) - 0.97) - (nearReserved(x.d, 4) ? 1 : 0); if (sc > bs) { bs = sc; best = x; } }
  if (!best) return;
  const def = ANIMALS.find(a => a.id === 'cat'), mesh3 = def.make(); mesh3.scale.setScalar(1.15); world.add(mesh3); linearize(mesh3);
  const d = best.d.clone(), home = d.clone().multiplyScalar(R + best.h + 0.1);
  catQ = { def, mesh: mesh3, home, homeDir: d, pos: home.clone(), fwd: tangentToward(d, best.side).normalize(), vel: new V3(), vr: 0, up: d.clone(), grounded: true, rad: 0.5, walk: 0, state: 'sit', sayT: 3, scared: 0, ground: R };
  catQ.inspect = addInspect(catQ.pos, 'Katinas', '', 3.2, { verb: 'pakalbinti katiną', onUse: talkCat });
  mesh3.visible = Q5.stage === 'go';
  if (Q5.stage !== 'go') catQ.inspect.r = 0;
}
function talkCat() {
  if (Q5.stage === 'follow') { petBubble(catQ, pick(['Miau!', 'Šunys!', 'Murr…'])); SAYS.cat(); return; }
  if (Q5.stage !== 'go') return;
  SAYS.cat();
  startTalk('Katinas', ['Miau?! …A, tu ne mašina. Ir ne šuo. Fiu.', 'Aš čia sėdžiu ant kelio, nes visur aplinkui – šunys. Jie mane vaikosi nuo pat ryto!', 'Pas Kūrėją? Ten šilta ir nėra šunų? …Gerai, eisiu paskui tave. Bet jei šuo prieis arti – aš pabėgsiu atgal čia!'], '#ffb35a', () => {
    Q5.stage = 'follow'; Q5.sticks = Math.max(Q5.sticks, 99); saveQ5(); catQ.state = 'follow'; catQ.inspect.r = 0; dogT = 4;
    toast('Katinas seka paskui tave! Gavai 99 pagaliukus', 'Spausk T – mesk pagaliuką, ir šunys nubėgs paskui jį. Vesk katiną į Kūrėjo vartus', '#ffb35a');
  });
}
function catFlee() {
  catQ.state = 'flee'; Q5.stage = 'go'; saveQ5(); catQ.inspect.r = 3.2;
  catQ.scared = 1; petBubble(catQ, 'Šššš!'); SAYS.cat();
  for (const dg of dogs) dg.state = 'leave';
  toast('Šuo išgąsdino katiną!', 'Katinas pabėgo atgal ant kelio Grybų Karalystėje. Nueik ir pakalbink jį vėl', '#ff7a5a');
}
function updateCat(dt, t) {
  const c = catQ; if (!c || !c.mesh.visible) return;
  const ud = c.mesh.userData; let speed = 0, moving = false;
  if (c.state === 'follow') {
    let toP = c.pos.distanceTo(player.pos);
    if (toP > 60) { const back = moveAlong(player.up, tangentToward(player.up, player.pos.clone().add(player.fwd)), -3); c.pos.copy(back).multiplyScalar(R + groundH(back) + 0.5); c.vel.set(0, 0, 0); toP = 3; }
    if (toP > 3) { speed = toP > 14 ? 11 : 7.5; c.fwd.lerp(tangentToward(c.up, player.pos.clone().sub(c.pos)).normalize(), Math.min(1, dt * 6)).normalize(); }
  } else if (c.state === 'flee') {
    const toH = c.home.distanceTo(c.pos);
    if (toH > 120) { c.pos.copy(c.home); c.up.copy(c.homeDir); }
    if (toH < 1) { c.state = 'sit'; }
    else { speed = 13; c.fwd.lerp(tangentToward(c.up, c.home.clone().sub(c.pos)).normalize(), Math.min(1, dt * 6)).normalize(); }
  } else {
    // sitting on the road, looking round nervously
    if (c.pos.distanceTo(c.home) > 1.5) { speed = 3; c.fwd.copy(tangentToward(c.up, c.home.clone().sub(c.pos))).normalize(); }
    c.sayT -= dt; if (c.sayT < 0) { c.sayT = rr(4, 8); if (c.pos.distanceTo(player.pos) < 35) { petBubble(c, pick(['Miau…', 'Kur eiti?', 'Mrrr…'])); if (distVol(c.pos) > 0.05) SAYS.cat(); } }
  }
  if (c.grounded) c.vel.copy(c.fwd).multiplyScalar(speed);
  moving = speed > 0.1; if (moving) c.walk += dt * (speed * 2.2 + 2);
  stepPlanet(c, dt, c.rad);
  const sw = moving ? Math.sin(c.walk) : 0;
  if (ud.legs) ud.legs.forEach((l, i) => { l.rotation.x = (i % 2 === 0) === (i < 2) ? sw * 0.6 : -sw * 0.6; });
  if (ud.tail) ud.tail.rotation.z = Math.sin(t * (c.state === 'flee' ? 20 : 4)) * 0.4;
  if (ud.head) ud.head.rotation.y = c.state === 'sit' ? Math.sin(t * 1.3) * 0.6 : 0;
  c.mesh.position.copy(c.pos); orient(c.mesh, c.up, c.fwd);
}

// ---------- the dogs ----------
const dogs = [], sticks = [];
let dogT = 4;
function spawnDog() {
  const base = catQ.pos.clone().normalize();
  let d = null;
  for (let k = 0; k < 8 && !d; k++) { const cand = moveAlong(base, tangentToward(base, randDir()).normalize(), rr(28, 38)); weights(cand.x, cand.y, cand.z, W); if (TH(cand) > -0.3) d = cand; }
  if (!d) return;
  const def = ANIMALS.find(a => a.id === 'dog'), m = def.make(); m.scale.setScalar(rr(1.0, 1.4)); world.add(m); linearize(m);
  const dg = { def, mesh: m, pos: d.clone().multiplyScalar(R + groundH(d) + 0.4), fwd: tangentToward(d, randDir()).normalize(), vel: new V3(), vr: 0, up: d.clone(), grounded: false, rad: 0.45, walk: 0, state: 'chase', t: 0, speed: rr(6, 7.2), sayT: rr(0.5, 2), ground: R };
  dogs.push(dg);
  if (dg.pos.distanceTo(player.pos) < 60) { SAYS.dog(); petBubble(dg, 'Au au!'); }
}
function makeStick() {
  const g = new THREE.Group(), w = mat(0x8a5a2b, { roughness: 0.9 });
  { const s = S(G.cyl, w, 0.07, 1.0, 0.07, 0, 0.07, 0); s.rotation.z = Math.PI / 2; g.add(s); }
  { const s = S(G.cyl, w, 0.04, 0.35, 0.04, 0.2, 0.18, 0); s.rotation.z = 0.7; g.add(s); }
  return g;
}
function q5Throw() {
  if (mode !== 'planet' || player.inCar || Q5.stage !== 'follow') return;
  if (Q5.sticks <= 0) { toast('Pagaliukų nebeliko!', 'Bėk greičiau (Shift)', '#ff7a5a'); return; }
  Q5.sticks--; saveQ5();
  const m = makeStick(); linearize(m);
  const start = player.pos.clone().addScaledVector(player.up, 1.6).addScaledVector(player.fwd, 0.6);
  const b = spawnBody(m, start, 0.25, 'Pagaliukas');
  const cf = new V3(); camera.getWorldDirection(cf); cf.addScaledVector(player.up, -cf.dot(player.up)).normalize();
  b.vel.copy(cf).multiplyScalar(17); b.vr = 7; b.spin.set(rr(-8, 8), rr(-8, 8), rr(-8, 8));
  sticks.push({ b, age: 0, taken: false });
  tone(300, 0.12, { to: 700, type: 'triangle', vol: 0.05 }); noiseHit(0.1, { ft: 'highpass', f: 2500, vol: 0.05 });
  if (hands.R) { hands.R.reach = 1; }
}
function updateDogs(dt, t) {
  if (Q5.stage === 'follow' && catQ) {
    dogT -= dt;
    const near = dogs.filter(d => d.state === 'chase').length;
    if (dogT < 0) { dogT = rr(5, 8); if (near < 4) spawnDog(); }
  }
  for (const s of sticks) s.age += dt;
  for (let i = sticks.length - 1; i >= 0; i--) if (sticks[i].age > 25 || !bodies.includes(sticks[i].b)) { if (!sticks[i].taken && bodies.includes(sticks[i].b)) { world.remove(sticks[i].b.mesh); bodies.splice(bodies.indexOf(sticks[i].b), 1); } sticks.splice(i, 1); }
  for (let i = dogs.length - 1; i >= 0; i--) {
    const dg = dogs[i], ud = dg.mesh.userData; let target = null, speed = 0;
    dg.t += dt;
    if (dg.state === 'chase') {
      if (Q5.stage !== 'follow') dg.state = 'leave';
      // a stick nearby beats a cat any day
      let bs = null, bd = 26;
      for (const s of sticks) { if (s.taken || s.age < 0.3) continue; const d = s.b.pos.distanceTo(dg.pos); if (d < bd) { bd = d; bs = s; } }
      if (bs) { dg.state = 'stick'; dg.stick = bs; bs.taken = true; petBubble(dg, 'Pagaliukas!'); if (distVol(dg.pos) > 0.05) SAYS.dog(); }
      else if (catQ) { target = catQ.pos; speed = dg.speed; if (catQ.pos.distanceTo(dg.pos) < 1.5 && catQ.state === 'follow') catFlee(); }
    }
    if (dg.state === 'stick') {
      const s = dg.stick; target = s.b.pos; speed = dg.speed * 1.25;
      if (s.b.pos.distanceTo(dg.pos) < 1.3) {
        const bi = bodies.indexOf(s.b); if (bi >= 0) bodies.splice(bi, 1); world.remove(s.b.mesh);
        const held = makeStick(); held.scale.setScalar(0.9); held.position.set(0, 0.45, 0.95); dg.mesh.add(held); linearize(held);
        dg.state = 'happy'; dg.t = 0; s.age = 99;
      }
    } else if (dg.state === 'happy') {
      if (dg.grounded && dg.t % 0.45 < dt * 1.5) dg.vr = 4.5;
      dg.fwd.applyAxisAngle(dg.up, dt * 6);
      if (dg.t > 1.6) { dg.state = 'leave'; dg.t = 0; dg.away = tangentToward(dg.up, dg.pos.clone().sub(catQ ? catQ.pos : player.pos)).normalize(); }
    } else if (dg.state === 'leave') {
      if (!dg.away) dg.away = tangentToward(dg.up, dg.pos.clone().sub(player.pos)).normalize();
      dg.fwd.lerp(dg.away, Math.min(1, dt * 3)).normalize(); speed = 8;
      if (dg.t > 6 || dg.pos.distanceTo(player.pos) > 90) { world.remove(dg.mesh); dogs.splice(i, 1); continue; }
    }
    if (target) dg.fwd.lerp(tangentToward(dg.up, target.clone().sub(dg.pos)).normalize(), Math.min(1, dt * 6)).normalize();
    if (dg.grounded && dg.state !== 'happy') dg.vel.copy(dg.fwd).multiplyScalar(speed);
    else if (dg.grounded) dg.vel.set(0, 0, 0);
    const moving = speed > 0.1; if (moving) dg.walk += dt * (speed * 2.2 + 2);
    stepPlanet(dg, dt, dg.rad);
    const sw = moving ? Math.sin(dg.walk) : 0;
    if (ud.legs) ud.legs.forEach((l, k) => { l.rotation.x = (k % 2 === 0) === (k < 2) ? sw * 0.7 : -sw * 0.7; });
    if (ud.tail) ud.tail.rotation.z = Math.sin(t * 16) * 0.7;
    dg.sayT -= dt; if (dg.sayT < 0 && dg.state === 'chase') { dg.sayT = rr(1.5, 3.5); if (dg.pos.distanceTo(player.pos) < 45) { petBubble(dg, pick(['Au!', 'Au au!', 'Katinas!', 'Vuf!'])); if (distVol(dg.pos) > 0.05) SAYS.dog(); } }
    dg.mesh.position.copy(dg.pos); orient(dg.mesh, dg.up, dg.fwd);
  }
}
function updateQ5(dt, t) { updateCat(dt, t); updateDogs(dt, t); }

// ---------- arriving at the Creator ----------
function q5EnterSanctum() {
  if (Q5.stage !== 'follow' || !catQ) return;
  Q5.stage = 'done'; saveQ5(); catQ.mesh.visible = false; catQ.inspect.r = 0; addMoney(300);
  for (const dg of dogs) world.remove(dg.mesh); dogs.length = 0;
  setTimeout(() => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.6, { type: 'triangle', vol: 0.07, when: i * 0.12 })); SAYS.cat();
    toast('Įsakymas #5 įvykdytas!', 'Katinas saugus pas Kūrėją ir čia liks. Apdovanojimas: 300 €', '#ffe98a');
  }, 1500);
}
function addSanctumCat() {
  if (Q5.stage !== 'done' || FR.cat) return;
  FR.cat = true;
  const m = ANIMALS.find(a => a.id === 'cat').make(); m.scale.setScalar(1.3); m.position.set(3, 0, -9); m.rotation.y = 2.6;
  const f = addFriend('Katinas', m, ['Murrr… Čia šilta, šviesu ir nė vieno šuns. Geriausia vieta pasaulyje.', 'Kūrėjas mane kasdien paglosto. Na, ne ranka – šviesa. Bet vis tiek malonu.', 'Ačiū, kad atvedei. Tie pagaliukai buvo genialu.'], { r: 3, cat: true });
  f.def = ANIMALS.find(a => a.id === 'cat');
}

// ---------- HUD ----------
function updateQ5Hud(el) {
  if (Q5.stage === 'done' && q7Active()) { updateQ7Hud(el); return; }
  if (Q5.stage === 'done' && q8Active()) { updateQ8Hud(el); return; }
  if (Q5.stage === 'done' && q10Active()) { updateQ10Hud(el); return; }
  if (Q5.stage === 'done' && q11Active()) { updateQ11Hud(el); return; }
  if (Q5.stage === 'done' && q12Active()) { updateQ12Hud(el); return; }
  if (Q5.stage === 'done' && q13Active()) { updateQ13Hud(el); return; }
  if (Q5.stage === 'done' && q14Active()) { updateQ14Hud(el); return; }
  if (S15.stage === 'star') { updateS15Hud(el); return; }
  if (Q16.stage === 'help') { updateQ16Hud(el); return; }
  if (Q5.stage === 'none' || Q5.stage === 'done') { el.hidden = true; return; }
  el.hidden = false;
  let step = '', arrow = '', dist = '';
  const target = Q5.stage === 'follow' ? gate.center : (catQ && catQ.pos);
  step = Q5.stage === 'follow' ? `Nuvesk katiną į Kūrėjo vartus · pagaliukai: <b>${Q5.sticks}</b> (<kbd>T</kbd> – mesti)` : 'Grybų Karalystėje ant kelio sėdi katinas – pakalbink jį';
  if (target && mode === 'planet') { arrow = arrowTo(target); dist = ` · ${Math.round(target.distanceTo(player.pos))} m`; if (q2Dot) { q2Dot.visible = true; q2Dot.position.copy(target).normalize().multiplyScalar(R + 7); } }
  el.innerHTML = `${arrow}<div><div class="qt">Įsakymas #5: Katinas ant kelio</div><div class="qs">${step}${dist}</div></div>`;
}
