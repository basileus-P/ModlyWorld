// ================= The Wind God's trouble: everything spins far too fast (50 km/h instead of 3 km/h) =================
// Strange things keep flying at you and bumping into you: strange PLATES (worth little), SMALL ROBOTS and – very rarely – BIG ROBOTS.
// Bring them to the Spinning Station: robots run around it the OPPOSITE way (a big robot does the work of 5 small ones),
// plates sometimes catch more flying things for you. 200 small robots' worth of work and the spinning slows down to 3 km/h.
const Q23 = { stage: 'none', inv: { plate: 0, small: 0, big: 0 }, plates: 0, small: 0, big: 0 };   // none | spin | done
try { const s = JSON.parse(localStorage.getItem('modly-quest23') || 'null'); if (s) Object.assign(Q23, s); } catch (_) { }
function saveQ23() { try { localStorage.setItem('modly-quest23', JSON.stringify(Q23)); } catch (_) { } }
const SPIN_NEED = 200, SPIN_FAST = 50, SPIN_OK = 3;
const spinWork = () => Q23.small + Q23.big * 5;
const spinKmh = () => Q23.stage === 'done' ? SPIN_OK : Math.round(SPIN_FAST - (SPIN_FAST - SPIN_OK) * Math.min(1, spinWork() / SPIN_NEED));
const SPN = { station: null, top: null, deco: null, fly: [], spawnT: 3, catchT: 0, msg: '', msgT: 0, hud: null };
const STATION = new V3(-14, 3, 46);
const ITEM_NAME = { plate: 'keista plokštelė', small: 'mažas robotas', big: 'DIDELIS ROBOTAS' };
function rollItem() { const r = Math.random(); return r < 0.75 ? 'plate' : r < 0.97 ? 'small' : 'big'; }
// ---------- the things ----------
function makePlate() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 6), mat(0x8a5aff, { metalness: 0.8, roughness: 0.2, emissive: 0x3a1a6a })));
  const r = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.04, 4, 3), bmat(0x5affd8)); r.rotation.x = Math.PI / 2; r.position.y = 0.04; g.add(r);
  g.add(S(G.sph, bmat(0xffe14d), 0.07, 0.03, 0.07, 0, 0.05, 0)); return g;
}
function makeBot(big) {
  const g = new THREE.Group(), b = new THREE.Group(); g.add(b); const k = big ? 1.9 : 0.75;
  const metal = mat(big ? 0xe8742a : 0xc8ccd6, { metalness: 0.6, roughness: 0.35 }), dark = mat(0x3a3e46, { metalness: 0.5 });
  b.add(S(G.box, metal, 0.7, 0.7, 0.5, 0, 0.85, 0)); b.add(S(G.box, metal, 0.55, 0.45, 0.45, 0, 1.45, 0));
  for (const x of [-0.13, 0.13]) b.add(S(G.sph, bmat(big ? 0xff3a3a : 0x5affff), 0.07, 0.07, 0.04, x, 1.48, 0.23));
  b.add(S(G.cyl, dark, 0.02, 0.25, 0.02, 0, 1.8, 0)); b.add(S(G.sph, bmat(big ? 0xffe14d : 0xff5ad8), 0.07, 0.07, 0.07, 0, 1.95, 0));
  b.add(S(G.box, dark, 0.3, 0.2, 0.05, 0, 0.9, 0.26));
  const legs = []; for (const x of [-0.18, 0.18]) { const l = new THREE.Group(); l.position.set(x, 0.5, 0); b.add(l); l.add(S(G.box, dark, 0.15, 0.5, 0.15, 0, -0.25, 0)); legs.push(l); }
  for (const x of [-0.45, 0.45]) b.add(S(G.box, dark, 0.12, 0.5, 0.12, x, 0.85, 0));
  g.scale.setScalar(k); g.userData.legs = legs; return g;
}
function makeItem(type) { return type === 'plate' ? makePlate() : makeBot(type === 'big'); }
// ---------- the Spinning Station ----------
{ const _b = buildWind; buildWind = () => { const first = !WI.built; _b(); if (first) buildStation(); }; }
function buildStation() {
  windObj('Sukimo stotis', STATION.x, STATION.y, STATION.z, g => {
    const steel = mat(0x5a606c, { metalness: 0.7, roughness: 0.35 });
    g.add(S(G.cyl, steel, 9, 1.6, 9, 0, -0.85, 0)); for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, t = S(G.box, steel, 1.6, 1.4, 1.2, Math.cos(a) * 9.4, -0.85, Math.sin(a) * 9.4); t.rotation.y = -a; g.add(t); }
    const top = new THREE.Group(); g.add(top); SPN.top = top;
    top.add(S(G.cyl, mat(0xffc83a), 8.2, 0.2, 8.2, 0, 0.0, 0));
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const ar = S(G.cone, mat(0x2a2a3a), 0.5, 1.2, 0.2, Math.cos(a) * 7, 0.15, Math.sin(a) * 7); ar.rotation.x = Math.PI / 2; ar.rotation.z = a; top.add(ar); }
    g.add(S(G.cyl, mat(0x3a6ac8), 0.8, 4, 0.8, 0, 2, 0)); g.add(S(G.sph, bmat(0x5affd8), 0.9, 0.9, 0.9, 0, 4.3, 0));
    const sign = mesh(new THREE.PlaneGeometry(4.6, 0.9), new THREE.MeshBasicMaterial({ map: labelTex('SUKIMO STOTIS', '#2a4a7a', '#ffffff', 512, 100), side: THREE.DoubleSide }), 0, 3.2, 0.85); g.add(sign);
    const sign2 = sign.clone(); sign2.position.z = -0.85; g.add(sign2);
    SPN.deco = new THREE.Group(); top.add(SPN.deco);
    windPlat(g, 0, 0, 6.6, 6.6, 0.1); windPlat(g, 0, 0, 0.9, 0.9, 4, false);
    SPN.station = g;
  });
  linearize(SPN.station); SPN.station.visible = Q23.stage !== 'none'; refreshStation();
}
function refreshStation() {
  const d = SPN.deco; if (!d) return; while (d.children.length) d.remove(d.children[0]);
  const ns = Math.min(40, Q23.small), nb = Math.min(12, Q23.big), np = Math.min(36, Q23.plates);
  for (let i = 0; i < ns; i++) { const m = makeBot(false), a = i / Math.max(1, ns) * Math.PI * 2; m.position.set(Math.cos(a) * 5.4, 0.1, Math.sin(a) * 5.4); m.rotation.y = -a + Math.PI; m.userData.ph = i; d.add(m); }
  for (let i = 0; i < nb; i++) { const m = makeBot(true), a = i / Math.max(1, nb) * Math.PI * 2 + 0.3; m.position.set(Math.cos(a) * 3, 0.1, Math.sin(a) * 3); m.rotation.y = -a + Math.PI; m.userData.ph = i; d.add(m); }
  for (let i = 0; i < np; i++) { const m = makePlate(), a = i / Math.max(1, np) * Math.PI * 2; m.position.set(Math.cos(a) * 7.8, 0.5, Math.sin(a) * 7.8); m.rotation.z = Math.PI / 2; m.rotation.y = -a; d.add(m); }
  linearize(d);
}
const nearStation = () => SPN.station && SPN.station.visible && Math.hypot(player.pos.x - STATION.x, player.pos.z - STATION.z) < 9 && Math.abs(player.pos.y - SPN.station.position.y) < 4;
function spinMsg(m) { SPN.msg = m; SPN.msgT = 3; }
function placeAtStation() {
  const v = Q23.inv, n = v.plate + v.small + v.big;
  if (!n) { startTalk('Sukimo stotis', ['Tu dar nieko neturi. Keisti daiktai atskrenda patys ir atsitrenkia į tave – tada atnešk juos čia!'], '#5affd8'); return; }
  Q23.plates += v.plate; Q23.small += v.small; Q23.big += v.big; const txt = [v.big && `${v.big} didelius robotus`, v.small && `${v.small} mažus robotus`, v.plate && `${v.plate} plokšteles`].filter(Boolean).join(', ');
  Q23.inv = { plate: 0, small: 0, big: 0 }; saveQ23(); refreshStation();
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15, { type: 'triangle', vol: 0.05, when: i * 0.07 }));
  spinMsg(`Padėjai: ${txt}! Vėjas – ${spinKmh()} km/h`);
  if (spinWork() >= SPIN_NEED) finishSpin();
}
function finishSpin() {
  Q23.stage = 'done'; saveQ23(); for (const f of SPN.fly) wiScene.remove(f.m); SPN.fly.length = 0;
  bigBanner('VĖJAS NURIMO!', 'Viskas sukasi tik 3 km/h – kaip seniau!'); addMoney(5000);
  setTimeout(() => startTalk('Vėjo Dievas', ['Fiuuu… Ahhh. Girdi? Tyla. Mano pasaulis sukasi lėtai, ramiai – tik 3 kilometrai per valandą!', 'Mano šuniukai vėl gali ramiai vaikščioti, o ne lėkti ratu kaip ant karuselės!', 'Tavo robotai bėga priešinga kryptimi ir laiko viską ramiai. Štai tau 5000 €, didvyri! FIU!'], '#bfefff'), 2500);
}
// ---------- the Wind God explains ----------
{ const _a = windAction; windAction = () => {
    if (card) return _a();
    if (nearStation() && Q23.stage === 'spin') { placeAtStation(); return; }
    if (nearWindGod() && Q22.met) {
      if (Q23.stage === 'none') { startTalk('Vėjo Dievas', ['Fiuuu… Žaliasis, ar jauti? Viskas čia sukasi PER GREITAI!', 'Anksčiau mano pasaulis sukosi ramiai – 3 kilometrai per valandą. O dabar – 50! Šuniukams svaigsta galvos, namai vos laikosi.', 'Reikia suktis į PRIEŠINGĄ pusę! Tam yra Sukimo stotis – štai ji, už knygos.', 'Į tave nuolat atsitrenks keisti daiktai. Dažniausiai – keistos plokštelės. Jos mažai vertos, bet padėtos stotyje kartais pagauna tau daiktų.', 'Rečiau – maži robotai: jie bėga ratu priešinga kryptimi už tave. O labai retai – DIDELIS robotas: jis dirba už 5 mažus!', 'Kai stotyje bus 200 mažų robotų darbo – sukimasis sustos. Nešk viską į stotį (E). FIU!'], '#bfefff', () => { Q23.stage = 'spin'; saveQ23(); if (SPN.station) SPN.station.visible = true; toast('Vėjo Dievo prašymas: sustabdyk sukimąsi!', 'Gaudyk keistus daiktus ir nešk juos į Sukimo stotį', '#bfefff'); }); return; }
      if (Q23.stage === 'spin') { startTalk('Vėjo Dievas', [`Fiu… Dar sukasi ${spinKmh()} km/h. Robotų darbas: ${spinWork()} iš ${SPIN_NEED}. Nešk daugiau į Sukimo stotį!`], '#bfefff'); return; }
      startTalk('Vėjo Dievas', [pick(['Fiuuu… 3 km/h. Tobula.', 'Mano robotai vis dar bėga ratu – tegul bėga, jiems patinka!', 'Ačiū tau, didvyri. Dabar galiu ramiai pūsti debesėlius.'])], '#bfefff'); return;
    }
    return _a();
  }; }
// ---------- every frame ----------
{ const _u = updateWind; updateWind = (dt, t) => {
    const kmh = spinKmh(); WI.spinK = Math.min(10, kmh / SPIN_OK);
    // the whole world drags you around
    if (Q23.stage === 'spin' && !card && !cinema) { const r = Math.hypot(player.pos.x, player.pos.z) || 1, push = (player.grounded ? 0.015 : 0.06) * kmh * Math.min(1, r / 20); const px = player.pos.x, pz = player.pos.z; player.pos.x += (-pz / r) * push * dt; player.pos.z += (px / r) * push * dt; }
    _u(dt, t);
    if (SPN.top) { SPN.top.rotation.y -= dt * (0.25 + Math.min(1.2, spinWork() / 120)); for (const m of SPN.deco.children) if (m.userData.legs) { const s = Math.sin(t * 10 + m.userData.ph); m.userData.legs[0].rotation.x = s * 0.6; m.userData.legs[1].rotation.x = -s * 0.6; } }
    if (Q23.stage === 'spin') updateFlyers(dt, t);
    spinHud(kmh);
    if (!card && nearStation() && Q23.stage === 'spin') { const n = Q23.inv.plate + Q23.inv.small + Q23.inv.big; setPrompt(n ? `<kbd>E</kbd> padėti daiktus į Sukimo stotį (${n})` : 'Sukimo stotis – atnešk čia keistus daiktus'); }
  }; }
function updateFlyers(dt, t) {
  if (card) return;
  SPN.spawnT -= dt; if (SPN.spawnT < 0) { SPN.spawnT = rr(1.6, 3); const type = rollItem(), m = makeItem(type); const d = randDir(); d.y = Math.abs(d.y) * 0.6 + 0.1; d.normalize(); m.position.copy(player.pos).addScaledVector(d, 26); wiScene.add(m); SPN.fly.push({ m, type, spin: randDir() }); }
  const tgt = player.pos.clone().add(new V3(0, 1.1, 0));
  for (let i = SPN.fly.length - 1; i >= 0; i--) {
    const f = SPN.fly[i], d = tgt.clone().sub(f.m.position), L = d.length();
    if (L < 0.9) { wiScene.remove(f.m); SPN.fly.splice(i, 1); Q23.inv[f.type]++; saveQ23(); player.vel.addScaledVector(d.normalize(), 3); shake = Math.max(shake, f.type === 'big' ? 0.8 : 0.3);
      noiseHit(0.15, { ft: 'lowpass', f: 900, vol: 0.12 }); tone(f.type === 'plate' ? 520 : f.type === 'small' ? 880 : 1320, 0.15, { type: 'triangle', vol: 0.06 });
      spinMsg(f.type === 'big' ? 'BUMPT!!! Į tave atsitrenkė DIDELIS ROBOTAS! ★' : `Bumpt! Į tave atsitrenkė ${ITEM_NAME[f.type]}`); continue; }
    f.m.position.addScaledVector(d.normalize(), Math.min(L, dt * 15)); f.m.rotation.x += f.spin.x * dt * 6; f.m.rotation.y += f.spin.y * dt * 6; f.m.rotation.z += f.spin.z * dt * 6;
  }
  // plates at the station sometimes catch things for you
  const rate = Math.min(1.2, Q23.plates * 0.012); SPN.catchT += dt * rate;
  if (SPN.catchT >= 1) { SPN.catchT -= 1; const type = rollItem(); Q23.inv[type]++; saveQ23(); spinMsg(`Tavo plokštelė pagavo: ${ITEM_NAME[type]}!`); tone(1200, 0.06, { type: 'sine', vol: 0.03 }); }
}
function spinHud(kmh) {
  if (!SPN.hud) { const d = document.createElement('div'); d.id = 'spinHud'; d.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);background:rgba(16,24,44,.82);color:#eaf6ff;border:1px solid rgba(191,239,255,.35);border-radius:14px;padding:8px 16px;font:600 14px system-ui,sans-serif;text-align:center;z-index:5;pointer-events:none;min-width:340px'; document.body.appendChild(d); SPN.hud = d; }
  const show = mode === 'wind' && Q23.stage === 'spin'; SPN.hud.hidden = !show; if (!show) return;
  SPN.msgT -= 1 / 60; const v = Q23.inv;
  SPN.hud.innerHTML = `🌪 Vėjo greitis: <b style="color:${kmh > 20 ? '#ff8a6a' : '#ffe14d'}">${kmh} km/h</b> <span style="opacity:.7">(turi būti 3)</span> · Robotų darbas: <b>${Math.min(SPIN_NEED, spinWork())}/${SPIN_NEED}</b><br><span style="opacity:.85">Turi: 🔘 ${v.plate} · 🤖 ${v.small} · 🦾 ${v.big}</span>${SPN.msgT > 0 ? `<br><span style="color:#ffe14d">${SPN.msg}</span>` : ''}`;
}
function spinTest(n) { if (mode !== 'wind') { hideCard(); enterWind(); } Q22.met = true; saveQ22(); Q23.stage = 'spin'; if (n) Q23.small = Math.min(SPIN_NEED - 1, n); Q23.inv.plate += 3; Q23.inv.small += 1; saveQ23(); if (SPN.station) SPN.station.visible = true; refreshStation(); toast('Bandymų pasaulis: sukimas', 'Gaudyk daiktus ir nešk į Sukimo stotį (už knygos)', '#bfefff'); }
