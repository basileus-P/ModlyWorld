// ================= Secret in the past: the CAVEMAN costume =================
// Once you have taken the cavemen mission (command #9), a strange BASEBALL CAP appears behind the Creator's gate
// in the city square. Take it to the stone age: the temple guard Bumbas has never seen such a hat – he wants it!
// Beat him in a fight (mouse buttons = punch) and you swap clothes: he gets the cap, you get his fur.
const CS = { cap: 'none', done: false, capM: null, capDir: null, headCap: null, guard: null, fight: null, hp: 5 };   // cap: none | held | given
try { const s = JSON.parse(localStorage.getItem('modly-caveskin') || 'null'); if (s) { CS.cap = s.cap || 'none'; CS.done = !!s.done; } } catch (_) { }
function saveCS() { try { localStorage.setItem('modly-caveskin', JSON.stringify({ cap: CS.cap, done: CS.done })); } catch (_) { } }

SKINS.push({ id: 'caveman', name: 'Urvinis', desc: 'Dėmėtas kailis per petį, kaulas plaukuose ir medinė kuoka ant nugaros. Laimėtas kovoje su šventyklos sargybiniu Bumbu.', price: -1, body: '#6ff05a', hat: '#a06a3a', secret: true, hint: 'Sako, jį nešioja šventyklos sargybinis praeityje. Jis labai mėgsta keistas kepures…' });
{ const _bs = buildSkin; buildSkin = (id, g) => { _bs(id, g); if (id === 'caveman') addCaveBits(g); }; }
function addCaveBits(g) {
  const fur = mat(0xa06a3a, { roughness: 1 }), spot = mat(0x5a3a1a, { roughness: 1 }), bone = mat(0xf4ecd8, { roughness: 0.6 }), wood = mat(0x6b4426, { roughness: 0.9 });
  g.add(S(G.cyl, fur, 0.26, 0.55, 0.26, 0, 1.12, 0));
  for (let i = 0; i < 7; i++) { const a = i * 2.1; g.add(S(G.sph, spot, 0.06, 0.06, 0.03, Math.sin(a) * 0.25, 0.98 + (i % 3) * 0.14, Math.cos(a) * 0.25)); }
  const strap = S(G.box, fur, 0.1, 0.6, 0.06, 0.08, 1.48, 0); strap.rotation.z = 0.5; g.add(strap); g.add(S(G.box, fur, 0.1, 0.6, 0.06, 0.08, 1.48, 0.0).rotateZ(0.5).translateZ(-0.2));
  for (let i = 0; i < 5; i++) g.add(S(G.cone, fur, 0.06, 0.12, 0.06, -0.2 + i * 0.1, 0.82, 0.24).rotateX(Math.PI));
  // a bone in the hair
  g.add(S(G.cyl, bone, 0.04, 0.42, 0.04, 0, 2.12, 0.02).rotateZ(Math.PI / 2)); for (const x of [-0.22, 0.22]) for (const z of [-0.04, 0.06]) g.add(S(G.sph, bone, 0.06, 0.06, 0.06, x, 2.12, z));
  g.add(S(G.ico1, mat(0x2a1a10), 0.3, 0.12, 0.3, 0, 2.06, -0.05));
  // club on the back
  const club = S(G.cyl6, wood, 0.05, 0.9, 0.08, 0.05, 1.3, -0.3); club.rotation.z = 0.6; g.add(club); g.add(S(G.sph, wood, 0.12, 0.16, 0.12, 0.3, 1.66, -0.3));
}
function makeBaseballCap(col = 0xe8262e) {
  const g = new THREE.Group(), m = mat(col, { roughness: 0.7 });
  g.add(S(G.dome, m, 0.3, 0.2, 0.3, 0, 0, 0)); const bill = S(G.box, m, 0.32, 0.03, 0.26, 0, 0.01, 0.3); bill.rotation.x = -0.12; g.add(bill);
  g.add(S(G.sph, mat(0xffffff), 0.05, 0.04, 0.05, 0, 0.2, 0)); g.add(S(G.sph, mat(0xffffff), 0.08, 0.08, 0.02, 0, 0.1, 0.27));
  return g;
}
// ---------- the cap behind the Creator's gate ----------
function buildCaveCap() {
  CS.capDir = cityDir(0, -6.5);
  const g = new THREE.Group(); const c = makeBaseballCap(); c.position.y = 0.45; c.scale.setScalar(1.6); g.add(c); addGlow(g, 0xff6b6b); g.userData.cap = c;
  place(g, CS.capDir, Math.PI); linearize(g); CS.capM = g; g.userData.noCollapse = true;
  refreshCaveCap();
  animators.push((dt, t) => {
    CS.capM.visible = Q11.stage !== 'none' && CS.cap === 'none' && !CS.done; if (!CS.capM.visible) return;
    c.rotation.y = t * 1.5; c.position.y = 0.45 + Math.sin(t * 2.5) * 0.12;
    if (mode === 'planet' && !player.inCar && player.pos.distanceTo(CS.capM.position) < 1.8) takeCaveCap();
  });
}
function refreshCaveCap() {
  if (CS.capM) CS.capM.visible = Q11.stage !== 'none' && CS.cap === 'none' && !CS.done;
  wearCaveCap(CS.cap === 'held');
}
function wearCaveCap(on) {
  const body = player.mesh.userData.parts.body;
  if (on && !CS.headCap) { const c = makeBaseballCap(); c.position.set(0, 2.0, 0.02); body.add(c); linearize(c); CS.headCap = c; }
  if (!on && CS.headCap) { body.remove(CS.headCap); CS.headCap = null; }
}
function takeCaveCap() {
  CS.cap = 'held'; saveCS(); refreshCaveCap(); poof(player.pos.clone().addScaledVector(player.up, 1.5), 0xff6b6b);
  [523, 659, 784].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.06, when: i * 0.08 }));
  toast('Radai keistą BEISBOLKĘ!', 'Iš kur ji čia? Urviniai praeityje tokios niekada nematė… Gal kas nors jos labai norės?', '#ff6b6b');
}
// ---------- the temple guard Bumbas ----------
{ const _bsw = buildStoneWorld; buildStoneWorld = () => { const first = !UG.built; _bsw(); if (first) buildCaveGuard(); }; }
function buildCaveGuard() {
  const m = makeCaveman({}); m.scale.setScalar(1.3);
  const b = m.userData.body; b.children.filter(o => o.geometry === G.cyl6).forEach(o => o.visible = false);
  const club = new THREE.Group(); club.position.set(0.5, 1.2, 0.15); b.add(club); club.add(S(G.cyl6, mat(0x6b4426), 0.08, 1.1, 0.12, 0, 0.45, 0)); club.add(S(G.sph, mat(0x6b4426), 0.2, 0.28, 0.2, 0, 1.0, 0)); club.rotation.z = -0.3;
  for (let i = 0; i < 5; i++) b.add(S(G.cone, mat(0xf4ecd8), 0.04, 0.14, 0.04, -0.2 + i * 0.1, 1.42, 0.42).rotateX(Math.PI));   // tooth necklace
  const hat = makeBaseballCap(); hat.position.set(0, 2.0, 0.02); hat.visible = CS.done; b.add(hat);
  linearize(m); ugScene.add(m);
  const d = ugL(5.8, -20), home = d.clone();
  CS.guard = { mesh: m, club, hat, pos: d.clone().multiplyScalar(R + TH(d)), up: d.clone(), fwd: tangentToward(d, UG.kingPos), vel: new V3(), vr: 0, grounded: true, home, hp: 8, inv: 0, swing: 0, cd: 1.5, walk: 0, sit: CS.done };
}
const nearGuard = () => CS.guard && CS.guard.pos.distanceTo(player.pos) < 3.2;
function talkGuard() {
  const G0 = 'Sargybinis Bumbas', GC = '#c8843a';
  if (CS.done) { startTalk(G0, [pick(['Žiūrėk, kokia mano kepurė! Visi urviniai pavydi! UGA!', 'Tu stiprus, žaliasis. Bet mano kepurė gražesnė.', 'Kailis tau tinka. Beveik kaip tikram urviniui!'])], GC); return; }
  if (CS.cap !== 'held') { startTalk(G0, ['UGH! Aš – Bumbas, karaliaus šventyklos sargybinis. Niekas manęs neįveiks!', 'Mano kailis – gražiausias visose džiunglėse. Bet… aš visada norėjau KEPURĖS. Keistos, su snapeliu. Tokios niekas neturi.'], GC); return; }
  startTalk(G0, ['UGA?! Kas ant tavo galvos?! Tai… tai KEPURĖ SU SNAPELIU!', 'Noriu jos! Kovojam! Jei laimėsi tu – gausi mano kailį. Jei aš – kepurė mano!', 'Mušk mane pelės mygtukais. Saugokis mano kuokos! UGA BUGA!'], GC, startCaveFight);
}
function startCaveFight() {
  const g = CS.guard; g.hp = 8; g.inv = 0; g.cd = 1.2; CS.hp = 5; CS.fight = { t: 0 };
  tone(110, 0.5, { to: 70, type: 'sawtooth', vol: 0.08, lp: 700 }); toast('KOVA!', 'Prieik arti ir mušk (pelės mygtukai). Kai Bumbas užsimoja – atsitrauk!', '#ff6b4a');
}
function caveFightHand(side) {
  if (!CS.fight) return false;
  hands[side].hold = true; sfx.whoosh(0.08);
  const g = CS.guard; if (g.pos.distanceTo(player.pos) < 2.3 && g.inv <= 0) {
    g.hp--; g.inv = 0.35; g.vel.copy(tangentToward(g.up, g.pos.clone().add(player.fwd))).multiplyScalar(6); g.vr = 3; g.grounded = false;
    sfx.hit && sfx.hit(); shake = Math.max(shake, 0.15); bubbleIn(ugScene, g.pos.clone().addScaledVector(g.up, 0.6), pick(['Ugh!', 'Ai!', 'Uga!', 'Bum!']), 2.6);
    if (g.hp <= 0) winCaveFight();
  }
  return true;
}
function winCaveFight() {
  CS.fight = null; CS.done = true; CS.cap = 'given'; saveCS(); wearCaveCap(false);
  const g = CS.guard; g.sit = true; g.hat.visible = true;
  unlockSkin('caveman'); equipSkin('caveman', true); poof(player.pos.clone().addScaledVector(player.up, 1), 0xa06a3a);
  [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.45, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
  toast('Laimėjai! Gavai URVINIO KOSTIUMĄ!', 'Bumbas gavo kepurę, o tu – jo kailį su kaulu plaukuose', '#c8843a');
  setTimeout(() => startTalk('Sargybinis Bumbas', ['Gerai, gerai… UGH. Tu stipresnis už mane.', 'Imk mano kailį. O aš imsiu KEPURĘ! …Na kaip? Gražu?', 'Karaliau, žiūrėk! Aš dabar madingiausias urvinis!'], '#c8843a'), 700);
}
function loseCaveFight() {
  CS.fight = null; const g = CS.guard; g.hp = 8;
  toast('Bumbas laimėjo šį kartą…', 'Kepurė vis dar tavo. Pakalbink jį dar kartą ir bandyk iš naujo!', '#ff6b4a');
  player.vel.copy(tangentToward(player.up, player.pos.clone().sub(g.pos).add(player.pos))).multiplyScalar(10); player.vr = 6; player.grounded = false;
}
function updateCaveGuard(dt, t) {
  const g = CS.guard; if (!g) return;
  const ud = g.mesh.userData; g.inv = Math.max(0, g.inv - dt);
  let sp = 0;
  if (CS.fight) {
    const to = player.pos.clone().sub(g.pos), dist = to.length();
    g.fwd.lerp(tangentToward(g.up, player.pos), Math.min(1, dt * 6)).normalize();
    if (dist > 1.7 && g.swing <= 0) sp = 3.2;
    g.cd -= dt;
    if (g.cd <= 0 && dist < 2.6 && g.swing <= 0) { g.swing = 0.9; g.cd = rr(1.3, 2); bubbleIn(ugScene, g.pos.clone().addScaledVector(g.up, 0.6), 'UGA!', 2.6); tone(180, 0.3, { to: 120, type: 'square', vol: 0.05, lp: 900 }); }
    if (g.swing > 0) {
      const before = g.swing; g.swing -= dt;
      g.club.rotation.x = g.swing > 0.45 ? -(0.9 - g.swing) * 4 : -1.8 + (0.45 - g.swing) * 4;
      if (before > 0.45 && g.swing <= 0.45 && dist < 2.4) {
        CS.hp--; shake = Math.max(shake, 0.4); tone(140, 0.25, { to: 70, type: 'square', vol: 0.07, lp: 800 });
        player.vel.copy(to.normalize()).multiplyScalar(9); player.vr = 5; player.grounded = false;
        if (CS.hp <= 0) loseCaveFight();
      }
      if (g.swing <= 0) g.club.rotation.x = 0;
    }
    if (g.pos.angleTo(g.home) * R > 14) g.fwd.copy(tangentToward(g.up, g.home.clone().multiplyScalar(R)));
  } else {
    const hd = g.home.clone().multiplyScalar(R + TH(g.home));
    if (g.pos.distanceTo(hd) > 0.8) { g.fwd.copy(tangentToward(g.up, hd)); sp = 2; }
    else g.fwd.lerp(tangentToward(g.up, player.pos.distanceTo(g.pos) < 10 ? player.pos : UG.kingPos), Math.min(1, dt * 3)).normalize();
  }
  _mv.copy(g.fwd).multiplyScalar(sp); g.vel.lerp(_mv, Math.min(1, dt * (g.inv > 0 ? 1 : 6)));
  stepStone(g, dt, 0.45);
  g.mesh.position.copy(g.pos); orient(g.mesh, g.up, g.fwd);
  if (g.sit && !CS.fight) { ud.body.position.y = -0.25; ud.legs[0].rotation.x = -1.3; ud.legs[1].rotation.x = -1.3; g.hat.rotation.y = Math.sin(t * 0.8) * 0.15; }
  else { ud.body.position.y = 0; if (sp > 0) g.walk += dt * sp * 2.2; const sw = sp > 0 ? Math.sin(g.walk) * 0.6 : 0; ud.legs[0].rotation.x = sw; ud.legs[1].rotation.x = -sw; }
}
function caveFightHud() { return CS.fight ? `<b>Bumbas</b> ${'♥'.repeat(Math.max(0, CS.guard.hp))} &nbsp;·&nbsp; <b>Tu</b> ${'♥'.repeat(Math.max(0, CS.hp))} &nbsp;– mušk pelės mygtukais!` : ''; }
function capTest() {
  CS.cap = 'none'; CS.done = false; saveCS(); skinOwned = skinOwned.filter(s => s !== 'caveman'); if (skinNow === 'caveman') equipSkin('classic', true); saveSkins();
  if (Q11.stage === 'none') { Q11.stage = 'go'; saveQ11(); }
  if (CS.guard) { CS.guard.sit = false; CS.guard.hat.visible = false; }
  refreshCaveCap();
  if (mode === 'planet' && !player.inCar) { const d = cityDir(0, -10); player.pos.copy(d).multiplyScalar(R + groundH(d) + 0.3); player.up.copy(d); player.fwd.copy(tangentToward(d, CS.capM.position)); player.vel.set(0, 0, 0); }
  toast('Bandymų pasaulis: urvinio paslaptis', 'Beisbolkė – už Kūrėjo vartų. Paskui laiko mašina į praeitį (komanda „urviniai“) ir pas sargybinį prie šventyklos', '#ffd23a');
}
