// ================= TEA WITH MAMA DINOSAUR (after you finish the game) =================
// A phone message from Mama Dinosaur invites you for tea. You appear in her children's room: a little table with a
// tea set, two little dinosaurs and three plush toys sitting around it. E at the table – tea! Door – back home.
// Later you can come back through the world portal (key 5).
const TEA = { built: false, invited: false, sips: 0, wait: 0, pour: 0, chars: [], hud: null };
try { TEA.invited = localStorage.getItem('modly-teainv') === '1'; } catch (_) { }
const tL = (lt, en) => EN ? en : lt;
const teaScene = new THREE.Scene(); teaScene.background = new THREE.Color(0xffe8f0);
teaScene.add(new THREE.AmbientLight(0xffffff, 0.65)); teaScene.add(new THREE.HemisphereLight(0xfff4e8, 0xc8a080, 0.55));
{ const l = new THREE.PointLight(0xfff0d0, 0.8, 30); l.position.set(0, 5, 0); teaScene.add(l); }
const TEA_W = 7, TEA_D = 6, TEA_TABLE = new V3(0, 0, -1), TEA_DOOR = new V3(0, 0, TEA_D - 0.2);
function makeTeaDino(col, belly, s, mama) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const c = mat(col, { roughness: 0.6 }), b = mat(belly, { roughness: 0.7 });
  body.add(S(G.sph, c, 0.75, 0.85, 0.7, 0, 0.95, 0)); body.add(S(G.sph, b, 0.55, 0.65, 0.4, 0, 0.9, 0.38));
  const head = new THREE.Group(); head.position.set(0, 1.85, 0.15); body.add(head);
  head.add(S(G.sph, c, 0.55, 0.5, 0.55)); head.add(S(G.sph, c, 0.42, 0.32, 0.45, 0, -0.08, 0.42));
  for (const x of [-0.22, 0.22]) { head.add(S(G.sph, bmat(0xffffff), 0.14, 0.15, 0.08, x, 0.15, 0.44)); head.add(S(G.sph, bmat(0x1a1a1a), 0.07, 0.08, 0.05, x, 0.15, 0.5)); head.add(S(G.sph, bmat(0x1a1a1a), 0.03, 0.03, 0.03, x * 0.4, -0.05, 0.86)); }
  head.add(S(G.box, bmat(0x8a2a3a), 0.3, 0.04, 0.05, 0, -0.22, 0.8));
  for (let i = 0; i < 4; i++) body.add(S(G.cone, mat(mama ? 0xff9a3a : 0xffd23a), 0.13, 0.28, 0.13, 0, 1.75 - i * 0.32, -0.55 - i * 0.08).rotateX(-0.6));
  const tail = S(G.cone, c, 0.35, 1.1, 0.35, 0, 0.55, -0.85); tail.rotation.x = -1.9; body.add(tail);
  for (const x of [-0.6, 0.6]) { const a = S(G.cyl, c, 0.11, 0.45, 0.11, x, 1.2, 0.35); a.rotation.x = -0.9; body.add(a); }
  for (const x of [-0.35, 0.35]) body.add(S(G.cyl, c, 0.2, 0.4, 0.2, x, 0.2, 0.15));
  if (mama) { body.add(S(G.box, mat(0xffffff), 0.95, 0.85, 0.05, 0, 0.95, 0.66)); body.add(S(G.box, mat(0xff8ab8), 0.9, 0.12, 0.06, 0, 1.3, 0.67));
    for (let i = 0; i < 9; i++) { const a = (i / 8 - 0.5) * 2.2; head.add(S(G.sph, bmat(0xfff8f0), 0.06, 0.06, 0.06, Math.sin(a) * 0.48, -0.45, Math.cos(a) * 0.3 + 0.05)); } }
  g.scale.setScalar(s); g.userData = { head, body }; return g;
}
function makePlush(kind) {
  const g = new THREE.Group();
  if (kind === 'bear') { const m = mat(0xa0683a, { roughness: 1 }), l = mat(0xe0b088, { roughness: 1 });
    g.add(S(G.sph, m, 0.4, 0.45, 0.35, 0, 0.45, 0)); g.add(S(G.sph, l, 0.25, 0.3, 0.1, 0, 0.45, 0.28)); g.add(S(G.sph, m, 0.33, 0.3, 0.3, 0, 1.05, 0)); g.add(S(G.sph, l, 0.14, 0.11, 0.1, 0, 1.0, 0.27));
    for (const x of [-0.24, 0.24]) { g.add(S(G.sph, m, 0.12, 0.12, 0.06, x, 1.3, 0)); g.add(S(G.sph, m, 0.12, 0.12, 0.2, x * 1.2, 0.2, 0.25)); g.add(S(G.sph, bmat(0x1a1a1a), 0.04, 0.04, 0.03, x * 0.4, 1.12, 0.27)); }
    g.add(S(G.box, mat(0xff4a6a), 0.32, 0.1, 0.06, 0, 0.82, 0.25)); }
  if (kind === 'bunny') { const m = mat(0xf8f4f0, { roughness: 1 }), p = mat(0xffb8d0, { roughness: 1 });
    g.add(S(G.sph, m, 0.35, 0.42, 0.32, 0, 0.42, 0)); g.add(S(G.sph, m, 0.3, 0.28, 0.28, 0, 0.98, 0));
    for (const x of [-0.12, 0.12]) { const e = S(G.sph, m, 0.08, 0.38, 0.05, x, 1.42, 0); e.rotation.z = x * 1.2; g.add(e); g.add(S(G.sph, p, 0.04, 0.26, 0.02, x, 1.42, 0.03)); g.add(S(G.sph, bmat(0x1a1a1a), 0.035, 0.035, 0.03, x * 0.9, 1.03, 0.25)); g.add(S(G.sph, m, 0.11, 0.1, 0.18, x * 1.8, 0.18, 0.22)); }
    g.add(S(G.sph, p, 0.04, 0.03, 0.03, 0, 0.96, 0.28)); }
  if (kind === 'elephant') { const m = mat(0x9ab0d0, { roughness: 1 });
    g.add(S(G.sph, m, 0.42, 0.45, 0.38, 0, 0.45, 0)); g.add(S(G.sph, m, 0.34, 0.32, 0.32, 0, 1.02, 0.05));
    const tr = S(G.cyl, m, 0.07, 0.45, 0.07, 0, 0.82, 0.36); tr.rotation.x = 0.4; g.add(tr);
    for (const x of [-0.36, 0.36]) { g.add(S(G.sph, mat(0xb8c8e8, { roughness: 1 }), 0.22, 0.26, 0.04, x, 1.05, -0.02)); g.add(S(G.sph, bmat(0x1a1a1a), 0.035, 0.035, 0.03, x * 0.35, 1.1, 0.33)); g.add(S(G.sph, m, 0.12, 0.12, 0.2, x * 0.7, 0.18, 0.28)); } }
  return g;
}
function buildTea() {
  if (TEA.built) return; TEA.built = true; const g = new THREE.Group(); teaScene.add(g);
  // the room: wooden floor, pastel walls with dots, a window, a rug, a little bed and a shelf with toys
  g.add(S(G.box, mat(0xd8a870), TEA_W * 2, 0.1, TEA_D * 2, 0, -0.05, 0));
  for (let i = -TEA_W; i < TEA_W; i += 1.2) g.add(S(G.box, mat(0xb88850), 0.04, 0.02, TEA_D * 2, i, 0.01, 0));
  const wall = mat(0xbfe8d8, { roughness: 0.9 });
  g.add(S(G.box, wall, TEA_W * 2, 6, 0.2, 0, 3, -TEA_D)); g.add(S(G.box, wall, TEA_W * 2, 6, 0.2, 0, 3, TEA_D)); g.add(S(G.box, wall, 0.2, 6, TEA_D * 2, -TEA_W, 3, 0)); g.add(S(G.box, wall, 0.2, 6, TEA_D * 2, TEA_W, 3, 0));
  g.add(S(G.box, mat(0xfff4f8), TEA_W * 2, 0.2, TEA_D * 2, 0, 6, 0));
  for (let i = 0; i < 40; i++) { const wz = i % 2 ? -TEA_D + 0.12 : TEA_D - 0.12; g.add(S(G.sph, bmat(pick([0xffd23a, 0xff8ab8, 0x8ad8ff, 0xffffff])), 0.12, 0.12, 0.02, rr(-TEA_W + 0.5, TEA_W - 0.5), rr(0.8, 5.5), wz)); }
  { const w = new THREE.Group(); w.position.set(-3, 3.2, -TEA_D + 0.12); w.add(S(G.box, mat(0xffffff), 2.6, 2.2, 0.08)); w.add(S(G.box, bmat(0x9ad8ff), 2.3, 1.9, 0.1)); w.add(S(G.box, mat(0xffffff), 0.1, 1.9, 0.12)); w.add(S(G.box, mat(0xffffff), 2.3, 0.1, 0.12)); w.add(S(G.sph, bmat(0xffffff), 0.5, 0.25, 0.05, 0.5, 0.4, 0.06)); g.add(w); }
  g.add(S(G.cyl, mat(0xff9ac8, { roughness: 1 }), 3.2, 0.03, 3.2, TEA_TABLE.x, 0.02, TEA_TABLE.z));
  // the little bed + shelf
  g.add(S(G.box, mat(0xffffff), 2.2, 0.5, 4, 5.2, 0.35, -3.5)); g.add(S(G.box, mat(0x8ad8ff), 2.1, 0.25, 3.8, 5.2, 0.7, -3.5)); g.add(S(G.box, mat(0xffffff), 1.4, 0.3, 0.8, 5.2, 0.9, -5));
  g.add(S(G.box, mat(0xc89a6a), 3, 0.15, 0.8, -4.5, 2.2, -TEA_D + 0.5)); g.add(S(G.box, mat(0xc89a6a), 3, 0.15, 0.8, -4.5, 3.4, -TEA_D + 0.5));
  for (let i = 0; i < 5; i++) g.add(S(G.box, mat(pick([0xff4a6a, 0x4ab0ff, 0xffd23a, 0x5ae06a])), 0.35, 0.35, 0.35, -5.6 + i * 0.55, 2.47, -TEA_D + 0.5));
  // the door back home
  { const d = new THREE.Group(); d.position.copy(TEA_DOOR); d.add(S(G.box, mat(0xa06a3a), 1.6, 3, 0.1, 0, 1.5, -0.05)); d.add(S(G.sph, mat(0xffd23a, { metalness: 0.6 }), 0.1, 0.1, 0.1, 0.55, 1.5, -0.15)); g.add(d);
    const s = makeSign(tL('Namo', 'Home')); s.position.set(1.4, 0, TEA_D - 0.6); g.add(s); }
  // the little table with a tea set
  const tb = new THREE.Group(); tb.position.copy(TEA_TABLE); g.add(tb);
  tb.add(S(G.cyl, mat(0xffffff), 1.3, 0.08, 1.3, 0, 0.62, 0)); tb.add(S(G.cyl, mat(0xff8ab8), 1.32, 0.04, 1.32, 0, 0.58, 0)); tb.add(S(G.cyl, mat(0xffffff), 0.15, 0.6, 0.15, 0, 0.3, 0));
  const pot = new THREE.Group(); pot.position.set(0, 0.66, 0); tb.add(pot); const pm = mat(0xfff0f8, { roughness: 0.3 });
  pot.add(S(G.sph, pm, 0.3, 0.26, 0.3, 0, 0.25, 0)); pot.add(S(G.sph, mat(0xff8ab8), 0.12, 0.08, 0.12, 0, 0.5, 0)); const sp = S(G.cyl, pm, 0.05, 0.3, 0.05, 0.33, 0.3, 0); sp.rotation.z = -0.9; pot.add(sp); pot.add(S(G.box, pm, 0.06, 0.25, 0.2, -0.34, 0.28, 0)); TEA.pot = pot;
  TEA.cups = [];
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 2, c = new THREE.Group(); c.position.set(Math.cos(a) * 0.95, 0.66, Math.sin(a) * 0.95); c.add(S(G.cyl, mat(0xffffff), 0.16, 0.02, 0.16, 0, 0.01, 0)); c.add(S(G.cyl, mat(pick([0xffd23a, 0x8ad8ff, 0xff8ab8, 0xb88aff])), 0.1, 0.14, 0.1, 0, 0.09, 0)); const tea = S(G.cyl, mat(0xb85a2a), 0.085, 0.02, 0.085, 0, 0.15, 0); c.add(tea); tb.add(c); TEA.cups.push({ c, tea }); }
  for (let i = 0; i < 5; i++) tb.add(S(G.cyl, mat(pick([0xe8b860, 0xffd8a8])), 0.09, 0.03, 0.09, rr(-0.4, 0.4), 0.68, rr(-0.4, 0.4)));
  // who sits around the table (the empty place in front – for you)
  const seat = (i, obj, name, line, h) => { const a = i / 6 * Math.PI * 2 + Math.PI / 2, x = TEA_TABLE.x + Math.cos(a) * 1.75, z = TEA_TABLE.z + Math.sin(a) * 1.75;
    g.add(S(G.cyl, mat(pick([0xffd23a, 0x8ad8ff, 0xff8ab8, 0x8ae0a0])), 0.35, 0.3, 0.35, x, 0.15, z)); obj.position.set(x, h, z); obj.lookAt(TEA_TABLE.x, h, TEA_TABLE.z); g.add(obj); TEA.chars.push({ obj, name, line, ph: i }); };
  seat(1, makeTeaDino(0x4ab0ff, 0xbfe8ff, 0.42, false), tL('Rexiukas', 'Rexy'), () => teaRexLine(), 0.3);
  seat(2, makePlush('bear'), tL('Meškiukas', 'Teddy'), () => tL('…(pliušinis meškiukas tyli, bet atrodo labai laimingas)', '…(the teddy bear is quiet, but looks very happy)'), 0.3);
  seat(3, makeTeaDino(0xff8ab8, 0xffe0ec, 0.4, false), tL('Trikė', 'Trixie'), () => pick(tL(['Hihi! Aš pati padėjau puodelius!', 'Kai užaugsiu, būsiu tokia didelė kaip mama!', 'Zuikutė nori daugiau sausainių!'], ['Hihi! I set the cups myself!', 'When I grow up I will be as big as Mom!', 'Bunny wants more cookies!'])), 0.3);
  seat(4, makePlush('bunny'), tL('Zuikutė', 'Bunny'), () => tL('…(pliušinė zuikutė žiūri į sausainius)', '…(the plush bunny is staring at the cookies)'), 0.3);
  seat(5, makePlush('elephant'), tL('Drambliukas', 'Little Elephant'), () => tL('…(pliušinis drambliukas laiko straublį prie puodelio)', '…(the plush elephant holds its trunk near the cup)'), 0.3);
  // Mama Dinosaur stands next to the table
  const mama = makeTeaDino(0x5ac85a, 0xe8f8c8, 1.15, true); mama.position.set(-3, 0, -2.6); mama.lookAt(TEA_TABLE.x, 0, TEA_TABLE.z); g.add(mama); TEA.mama = mama;
  linearize(g);
}
// fix the Rexy line helper (plain random line)
function teaRexLine() { return pick(tL(['Rrrr! Aš moku urgzti kaip didelis!', 'Ar tu tikrai nugalėjai šikšnosparnį?! Vau!', 'Mano arbata su trimis šaukšteliais medaus!'], ['Rrrr! I can roar like a big one!', 'Did you really beat the bat?! Wow!', 'My tea has three spoons of honey!'])); }
function enterTea() {
  buildTea(); if (typeof closeWorldPortal === 'function') closeWorldPortal(); setScope(false);
  mode = 'tea'; teaScene.add(player.mesh); player.mesh.visible = true; player.up.set(0, 1, 0);
  player.pos.set(0, 0, TEA_D - 3); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.pitch = 0.3; player.grounded = true;
  camera.position.set(0, 4, TEA_D + 2); camera.up.set(0, 1, 0); musicSet(1);
  $('bName').textContent = tL('Mamos Dinozaurės namai', "Mama Dinosaur's home"); $('bEn').textContent = '☕'; $('bAtm').textContent = tL('Vaikų kambarys, mažas staliukas ir arbata.', "The kids' room, a little table and tea."); document.documentElement.style.setProperty('--biome', '#ff8ab8');
  try { localStorage.removeItem('modly-pos'); } catch (_) { }
  setTimeout(() => startTalk(tL('Mama Dinozaurė', 'Mama Dinosaur'), [tL('Sveikas atvykęs, didvyri! Tu išgelbėjai visus pasaulius – dabar laikas ARBATAI! ☕', 'Welcome, hero! You saved all the worlds – now it is time for TEA! ☕'),
    tL('Čia mano mažylių kambarys. Susipažink: Rexiukas ir Trikė. O čia jų pliušiniai draugai – Meškiukas, Zuikutė ir Drambliukas.', 'This is my little ones\' room. Meet Rexy and Trixie. And these are their plush friends – Teddy, Bunny and Little Elephant.'),
    tL('Tavo vieta – priekyje, ten, kur tuščias puodelis. Prieik prie staliuko ir spausk E – įpilsiu arbatos!', 'Your place is in front, where the empty cup is. Walk up to the table and press E – I will pour you some tea!')], '#ff8ab8'), 700);
}
function leaveTea() { fadeTo(() => { cinema = null; portalToPlanet(); toast(tL('Ačiū už arbatą! ☕', 'Thanks for the tea! ☕'), tL('Mamos Dinozaurės namus rasi per portalą (5)', "You can find Mama Dinosaur's home through the portal (5)"), '#ff8ab8'); }); }
const teaNearTable = () => Math.hypot(player.pos.x - TEA_TABLE.x, player.pos.z - TEA_TABLE.z) < 2.6;
const teaAtMySeat = () => Math.hypot(player.pos.x - TEA_TABLE.x, player.pos.z - (TEA_TABLE.z + 2.1)) < 1.3;
const teaNearDoor = () => Math.hypot(player.pos.x - TEA_DOOR.x, player.pos.z - TEA_DOOR.z) < 1.8;
function teaNearChar() { let best = null, bd = 2.2; for (const c of TEA.chars) { if (!c.obj.visible) continue; const d = Math.hypot(player.pos.x - c.obj.position.x, player.pos.z - c.obj.position.z); if (d < bd) { bd = d; best = c; } } return best; }
const teaNearMama = () => TEA.mama && Math.hypot(player.pos.x - TEA.mama.position.x, player.pos.z - TEA.mama.position.z) < 2.6;
function teaAction() {
  if (card) { if (card.kind === 'talk') advanceTalk(); else hideCard(); return; }
  if (teaNearDoor()) { leaveTea(); return; }
  if (teaNearMama()) { startTalk(tL('Mama Dinozaurė', 'Mama Dinosaur'), [pick(tL(['Ar dar arbatos? Prieik prie staliuko!', 'Mano mažyliai kalba tik apie tave – didvyrį, kuris nugalėjo šikšnosparnį!', 'Sausainius iškepiau pati. Su šokoladu!'], ['More tea? Come to the table!', 'My little ones talk only about you – the hero who beat the bat!', 'I baked the cookies myself. With chocolate!']))], '#ff8ab8'); return; }
  const c = teaNearChar(); if (c && !teaAtMySeat()) { c.hop = 1; startTalk(c.name, [c.line()], '#ff8ab8'); return; }
  if (teaNearTable()) { if (TEA.pour > 0) return; TEA.pour = 1.6; tone(700, 0.4, { to: 400, type: 'sine', vol: 0.04 }); setTimeout(() => { TEA.sips++; tone(523, 0.12, { type: 'triangle', vol: 0.05 }); tone(784, 0.12, { type: 'triangle', vol: 0.05, when: 0.1 });
      toast(tL('Gurkšt! ☕', 'Sip! ☕'), pick(tL(['Mmm! Avietinė arbata su medumi!', 'Šilta ir saldi!', 'Dinozaurai sako: „Į sveikatą!“', 'Dar vienas sausainis? Taip!'], ['Mmm! Raspberry tea with honey!', 'Warm and sweet!', 'The dinosaurs say: “Cheers!”', 'One more cookie? Yes!'])), '#ff8ab8');
      TEA.chars.forEach(ch => { ch.hop = 1; }); }, 1500); return; }
}
function updateTea(dt, t) {
  const f = player.down ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = player.down ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 7 : 4; _mv.multiplyScalar(sp); player.vel.lerp(_mv, Math.min(1, 10 * dt));
  if (keys.Space && player.grounded) { player.vr = 7; player.grounded = false; sfx.jump(); }
  player.vr -= 20 * dt; player.pos.addScaledVector(player.vel, dt); player.pos.y += player.vr * dt;
  if (player.pos.y <= 0) { player.pos.y = 0; player.vr = 0; player.grounded = true; } else player.grounded = false;
  player.pos.x = Math.max(-TEA_W + 0.6, Math.min(TEA_W - 0.6, player.pos.x)); player.pos.z = Math.max(-TEA_D + 0.6, Math.min(TEA_D - 0.6, player.pos.z));
  { const dx = player.pos.x - TEA_TABLE.x, dz = player.pos.z - TEA_TABLE.z, d = Math.hypot(dx, dz); if (d < 2.1 && d > 0.01) { player.pos.x = TEA_TABLE.x + dx / d * 2.1; player.pos.z = TEA_TABLE.z + dz / d * 2.1; } }
  if (TEA.mama) { const dx = player.pos.x - TEA.mama.position.x, dz = player.pos.z - TEA.mama.position.z, d = Math.hypot(dx, dz); if (d < 1.3 && d > 0.01) { player.pos.x = TEA.mama.position.x + dx / d * 1.3; player.pos.z = TEA.mama.position.z + dz / d * 1.3; } }
  if (player.pos.x > 3.8 && player.pos.z < -1.3) player.pos.x = Math.min(player.pos.x, 3.8);   // the bed
  player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd); animateMan(dt, f !== 0 || s !== 0, sp);
  const dist = 5, pitch = player.pitch;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
  _ct.x = Math.max(-TEA_W + 0.4, Math.min(TEA_W - 0.4, _ct.x)); _ct.z = Math.max(-TEA_D + 0.4, Math.min(TEA_D - 0.4, _ct.z)); _ct.y = Math.min(5.6, _ct.y);
  camera.position.lerp(_ct, Math.min(1, dt * 8)); camera.up.set(0, 1, 0); camera.lookAt(player.pos.clone().add(new V3(0, 1.2, 0)));
  // little life in the room
  TEA.chars.forEach(c => { if (c.hop) { c.hop = Math.max(0, c.hop - dt * 2.5); } c.obj.position.y = 0.3 + Math.abs(Math.sin((c.hop || 0) * Math.PI)) * 0.25 + Math.sin(t * 2 + c.ph) * 0.02; });
  if (TEA.mama) { TEA.mama.userData.head.rotation.y = Math.sin(t * 0.7) * 0.25; TEA.mama.userData.body.rotation.z = Math.sin(t * 1.2) * 0.03; }
  if (TEA.pour > 0) { TEA.pour -= dt; TEA.pot.rotation.z = Math.sin(Math.min(1, (1.6 - TEA.pour) / 0.5) * Math.PI) * -0.6; TEA.pot.position.y = 0.66 + Math.sin(Math.min(1, (1.6 - TEA.pour) / 1.6) * Math.PI) * 0.25; } else { TEA.pot.rotation.z = 0; TEA.pot.position.y = 0.66; }
  if (!card) setPrompt(teaNearDoor() ? tL('<kbd>E</kbd> grįžti namo', '<kbd>E</kbd> go home') : teaNearMama() ? tL('<kbd>E</kbd> kalbėtis su Mama Dinozaure', '<kbd>E</kbd> talk to Mama Dinosaur') : teaAtMySeat() ? tL('<kbd>E</kbd> gerti arbatą ☕', '<kbd>E</kbd> drink tea ☕') : teaNearChar() ? `<kbd>E</kbd> ${teaNearChar().name}` : teaNearTable() ? tL('<kbd>E</kbd> gerti arbatą ☕', '<kbd>E</kbd> drink tea ☕') : '');
}
// ---------- the invitation: a message on the phone ----------
fx.push(dt => {
  if (TEA.invited || !started || mode === 'attract' || card || cinema || transitioning || (typeof SR !== 'undefined' && SR.on)) return true;
  if (typeof portalReady !== 'function' || !portalReady()) return true;
  TEA.wait += dt; if (TEA.wait < 12) return true;
  TEA.invited = true; try { localStorage.setItem('modly-teainv', '1'); } catch (_) { }
  [1319, 1568, 1319, 1568].forEach((f, i) => tone(f, 0.12, { type: 'sine', vol: 0.06, when: i * 0.15 }));
  toast(tL('📱 Nauja žinutė!', '📱 New message!'), tL('Nuo: Mama Dinozaurė', 'From: Mama Dinosaur'), '#ff8ab8');
  setTimeout(() => startTalk(tL('📱 Mama Dinozaurė', '📱 Mama Dinosaur'), [tL('Labas, didvyri! 🦕 Girdėjau, kad tu išgelbėjai VISUS pasaulius!', 'Hi, hero! 🦕 I heard you saved ALL the worlds!'),
    tL('Mano mažyliai labai nori su tavimi susipažinti. Kviečiu tave ARBATOS į mūsų namus! ☕🍪', 'My little ones really want to meet you. I invite you for TEA at our home! ☕🍪'),
    tL('Užverk žinutę – ir aš tave atsiųsiu pas mus! 💚', 'Close the message – and I will bring you over! 💚')], '#ff8ab8',
    () => { transitioning = true; fadeTo(() => { transitioning = false; enterTea(); }); }), 1200);
  return true;
});
// come back any time through the world portal (key 5)
setTimeout(() => { if (typeof PG_DEST !== 'undefined') PG_DEST.push({ name: tL('Mamos Dinozaurės namai', "Mama Dinosaur's home"), icon: '🦕', go: () => enterTea() }); }, 0);
function teaTest() { if (typeof Q29 !== 'undefined') { Q29.stage = 'done'; saveQ29(); } TEA.invited = false; TEA.wait = 99; try { localStorage.removeItem('modly-teainv'); } catch (_) { } }
