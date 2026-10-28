// ================= Secret mission: "Žvaigždė iš kosmoso" (after the game is finished) =================
// when the demon is gone a space ramp appears on a road near the city. Drive onto it FAST and the car flies right
// through the bubble into space. Jump from asteroid to asteroid (gravity is weak up there) to a big, smiling star,
// take it (it shrinks into your hands) and bring it to the museum – it fills the very last empty stand.
const S15 = { stage: 'none' };   // none | star | done
try { const s = JSON.parse(localStorage.getItem('modly-secret15') || 'null'); if (s) Object.assign(S15, s); } catch (_) { }
function saveS15() { try { localStorage.setItem('modly-secret15', JSON.stringify(S15)); } catch (_) { } }
const spaceOpen = () => Q14.stage === 'done';

// ---------- the star ----------
function makeStar(face = true) {
  const g = new THREE.Group(), sh = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + Math.PI / 2, r = i % 2 ? 0.45 : 1; const x = Math.cos(a) * r, y = Math.sin(a) * r; if (i) sh.lineTo(x, y); else sh.moveTo(x, y); }
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.35, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.08, bevelSegments: 2 }); geo.center();
  g.add(new THREE.Mesh(geo, mat(0xffd23a, { emissive: 0xffb000, emissiveIntensity: 0.9, roughness: 0.35, metalness: 0.2 })));
  if (face) {
    for (const x of [-0.18, 0.18]) g.add(S(G.sph, bmat(0x3a2a00), 0.07, 0.1, 0.04, x, 0.08, 0.3));
    const sm = mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 16, Math.PI), bmat(0x3a2a00), 0, -0.05, 0.3); sm.rotation.z = Math.PI; g.add(sm);
    for (const x of [-0.32, 0.32]) g.add(S(G.sph, mat(0xff8aa0, { transparent: true, opacity: 0.7 }), 0.08, 0.05, 0.02, x, -0.06, 0.29));
  }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffe14d, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); glow.scale.setScalar(4); g.add(glow);
  g.userData.glow = glow; return g;
}

// ---------- the space ramp on a road near the city ----------
const RAMP = {};
function buildSpaceRamp() {
  let best = null, bd = 1e9;
  const clear = d => solids.every(s => s.dir.angleTo(d) * R > (s.r || Math.hypot(s.hx || 0, s.hz || 0)) + 9);
  for (const path of roadPaths) for (let i = 0; i < path.s.length; i += 3) { const smp = path.s[i]; if (smp.bridge) continue; const dist = smp.d.angleTo(UP) * R; if (dist < 50) continue; const sc = Math.abs(dist - 62); if (sc < bd && clear(smp.d)) { bd = sc; best = smp; } }
  if (!best) return;
  const d = best.d, fwd = best.tan.clone(); if (fwd.dot(tangentToward(d, UP)) > 0) fwd.negate();   // the ramp points away from the city
  const g = new THREE.Group(); g.position.copy(d).multiplyScalar(R + best.h); orient(g, d, fwd); world.add(g); RAMP.g = g; RAMP.d = d; RAMP.fwd = fwd; RAMP.h = best.h;
  const blue = mat(0x3a2a8a, { metalness: 0.4, roughness: 0.4 }), neon = bmat(0x6ff7ff);
  const deck = S(G.box, blue, 4.2, 0.3, 9, 0, 1.3, 0); deck.rotation.x = -0.32; g.add(deck);
  for (const x of [-2.2, 2.2]) { const rail = S(G.box, neon, 0.12, 0.12, 9.2, x, 1.65, 0); rail.rotation.x = -0.32; g.add(rail); }
  for (const z of [-1.5, 3.0]) g.add(S(G.box, blue, 3.8, z > 0 ? 2.6 : 1.0, 0.4, 0, (z > 0 ? 2.6 : 1.0) / 2, z));
  for (let i = 0; i < 4; i++) { const a = S(G.cone, bmat(0xffd23a), 0.4, 0.6, 0.08, 0, 0.65 + i * 0.7, -3.4 + i * 2.1); a.rotation.x = -0.32 + Math.PI / 2; g.add(a); }
  const sign = makeSign('KOSMOSAS ↑'); sign.position.set(3.2, 0, -4.5); g.add(sign);
  // a trail of little stars going up into the sky – a hint
  RAMP.trail = []; for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffe14d, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(1.2); s.position.set(0, 6 + i * 4.5, 6 + i * 3); g.add(s); RAMP.trail.push(s); }
  linearize(g); g.userData.noCollapse = true;
  RAMP.center = g.position.clone();
  RAMP.inspect = addInspect(g.position.clone().addScaledVector(d, 1), 'Kosminis tramplinas', 'Didelis švytintis tramplinas su užrašu „KOSMOSAS ↑“. Pėsčiomis čia nieko neįvyks… Gal reikia labai greitai užvažiuoti mašina?', 0);
  animators.push((dt, t) => { if (!g.visible) return; RAMP.trail.forEach((s, i) => s.material.opacity = 0.35 + 0.45 * Math.max(0, Math.sin(t * 3 - i * 0.5))); });
  refreshSpaceRamp();
}
function refreshSpaceRamp() { if (!RAMP.g) return; RAMP.g.visible = spaceOpen(); RAMP.inspect.r = spaceOpen() ? 6 : 0; }
let rampWarn = 0;
function updateSpaceRamp(dt) {
  if (!RAMP.g || !RAMP.g.visible || cinema || transitioning) return;
  rampWarn = Math.max(0, rampWarn - dt);
  if (player.inCar && ride === auto) {
    if (auto.pos.distanceTo(RAMP.center) < 5.5) {
      if (Math.abs(auto.speed) > 8) launchToSpace();
      else if (rampWarn <= 0) { rampWarn = 3; toast('Per lėtai!', 'Įsibėk toliau ir užvažiuok ant tramplino greitai (Shift)', '#6ff7ff'); }
    }
  }
}
function launchToSpace() {
  cancelPlace(true); stopClimb(); dropAll(); hideCard(); stopSiren();
  const clone = auto.mesh.clone(); world.add(clone); auto.mesh.visible = false;
  exitAuto(); player.mesh.visible = false;
  const d = RAMP.d, fwd = auto.fwd.clone(), p0 = clone.position.clone(), q0 = clone.quaternion.clone();
  const camAt = RAMP.center.clone().addScaledVector(d, 8).addScaledVector(fwd, -14);
  let t = 0;
  tone(80, 2.6, { to: 400, type: 'sawtooth', vol: 0.1, lp: 900, attack: 0.3 }); noiseHit(2.6, { f: 500, fto: 3000, vol: 0.2, attack: 0.4 });
  toast('Iiiiiii!', 'Skrendi pro burbulą – tiesiai į kosmosą!', '#6ff7ff');
  cinema = dt => {
    t += dt;
    clone.position.copy(p0).addScaledVector(fwd, t * 26).addScaledVector(d, t * t * 14 + t * 6); clone.quaternion.copy(q0); clone.rotateX(-Math.min(0.9, t * 0.6));
    camera.position.lerp(camAt, Math.min(1, dt * 3)); camera.up.copy(d); camera.lookAt(clone.position); shake = Math.max(shake, 0.15); applyShake(dt);
    if (t > 2.4 && !transitioning) {
      transitioning = true;
      fadeTo(() => { transitioning = false; cinema = null; world.remove(clone); auto.mesh.visible = true; auto.speed = 0; player.mesh.visible = true; enterSpace(); });
    }
  };
}

// ---------- space ----------
const spScene = new THREE.Scene(); spScene.background = new THREE.Color(0x05040f);
spScene.add(new THREE.AmbientLight(0xc0c8ff, 0.45)); { const l = new THREE.DirectionalLight(0xfff0d0, 1.1); l.position.set(40, 60, 30); spScene.add(l); }
const SP = { built: false, plats: [], last: null };
function buildSpace() {
  if (SP.built) return; SP.built = true;
  { const sv = [], col = []; const c = new THREE.Color(); for (let i = 0; i < 2500; i++) { const v = randDir().multiplyScalar(rr(180, 320)); sv.push(v.x, v.y, v.z); c.setHSL(rr(0.55, 0.75), 0.5, rr(0.7, 1)); col.push(c.r, c.g, c.b); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3)); sg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); spScene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.3, vertexColors: true }))); }
  for (const [x, y, z, c, s] of [[-120, 40, -160, 0x7a3aff, 160], [140, -20, -120, 0xff4fd8, 130], [0, 90, -200, 0x3ad8ff, 180]]) { const n = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: c, transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending })); n.position.set(x, y, z); n.scale.setScalar(s); spScene.add(n); }
  // our little world far below, in its bubble
  const home = new THREE.Group(); home.position.set(30, -110, -40); spScene.add(home); SP.home = home;
  home.add(new THREE.Mesh(planetGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 })));
  home.add(new THREE.Mesh(new THREE.SphereGeometry(R, 48, 24), new THREE.MeshStandardMaterial({ color: 0x3f8fb5, transparent: true, opacity: 0.8 })));
  home.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.25, 48, 24), new THREE.MeshBasicMaterial({ color: 0x8fd8ff, transparent: true, opacity: 0.1, depthWrite: false })));
  home.scale.setScalar(0.6);
  // asteroids from the start to the star
  const rock = mat(0x6a6478, { roughness: 0.9 }), top = mat(0x8a849a, { roughness: 0.8 });
  const addPlat = (x, y, z, r, moving) => {
    const g = new THREE.Group(); g.position.set(x, y, z); spScene.add(g);
    g.add(S(G.cyl, top, r, 0.4, r, 0, -0.2, 0)); g.add(S(G.dodec, rock, r * 0.95, r * 0.8, r * 0.95, 0, -r * 0.6, 0));
    for (let k = 0; k < 3; k++) g.add(S(G.sph, mat(0x4a4458), r * 0.18, 0.06, r * 0.18, rr(-r * 0.5, r * 0.5), 0.01, rr(-r * 0.5, r * 0.5)));
    const p = { g, x, y, z, r, y0: y, moving, ph: rr(0, 6) }; SP.plats.push(p); return p;
  };
  SP.start = addPlat(0, 0, 0, 5);
  let a = 0, x = 0, z = 0, y = 0;
  for (let i = 0; i < 11; i++) { a += 0.5; const step = rr(6.5, 8); x += Math.sin(a) * step; z -= Math.cos(a) * step; y += rr(1.2, 2.2); addPlat(x, y, z, rr(2.0, 2.8), i % 3 === 2); }
  a += 0.5; x += Math.sin(a) * 9; z -= Math.cos(a) * 9; y += 1.5;
  SP.end = addPlat(x, y, z, 6);
  // the star
  SP.star = makeStar(); SP.star.scale.setScalar(2.6); SP.star.position.set(x, y + 5, z); spScene.add(SP.star);
  { const l = new THREE.PointLight(0xffd23a, 2.2, 40); l.position.set(x, y + 5, z); spScene.add(l); }
  // portals home on the first and the last asteroid
  SP.portals = [];
  for (const p of [SP.start, SP.end]) {
    const g = new THREE.Group(); g.position.set(p.x + (p === SP.start ? -2.5 : 3), p.y, p.z + (p === SP.start ? 2.5 : 1)); spScene.add(g);
    g.add(mesh(new THREE.TorusGeometry(1.4, 0.15, 8, 32), bmat(0x6ff7ff), 0, 1.6, 0)); g.add(mesh(new THREE.CircleGeometry(1.25, 32), new THREE.MeshBasicMaterial({ color: 0x6ff7ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide }), 0, 1.6, 0));
    g.add(mesh(new THREE.PlaneGeometry(2, 0.5), new THREE.MeshBasicMaterial({ map: labelTex('NAMO', '#0a2a3a', '#6ff7ff', 256, 64), side: THREE.DoubleSide }), 0, 3.4, 0));
    SP.portals.push(g);
  }
  linearize(spScene);
}
function enterSpace() {
  buildSpace(); mode = 'space'; spScene.add(player.mesh); musicSet(7); setScope(false);
  const s = SP.start; player.pos.set(s.x, s.y + 0.1, s.z + 2); player.up.set(0, 1, 0); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.pitch = 0.3; SP.last = s;
  camera.position.set(s.x, s.y + 4, s.z + 9); camera.up.set(0, 1, 0);
  SP.star.visible = S15.stage === 'none';
  $('bName').textContent = 'Kosmosas'; $('bEn').textContent = 'Už burbulo'; $('bAtm').textContent = 'Tylu ir labai daug žvaigždžių. Čia sunkis silpnas – šokinėk per asteroidus.'; document.documentElement.style.setProperty('--biome', '#ffd23a');
  toast('Tu kosmose!', S15.stage === 'none' ? 'Toli virš asteroidų šviečia didelė žvaigždė. Šokinėk iki jos! (sunkis čia silpnas)' : 'Kosmosas. Portalas NAMO – šalia', '#ffd23a');
}
function leaveSpace() {
  if (transitioning) return; transitioning = true; hideCard();
  [1047, 784, 659, 523, 392].forEach((f, i) => tone(f, 0.4, { type: 'sine', vol: 0.05, when: i * 0.1 }));
  fadeTo(() => {
    transitioning = false; mode = 'planet'; world.add(player.mesh);
    const d = moveAlong(RAMP.d, tangentToward(RAMP.d, new V3().crossVectors(RAMP.d, RAMP.fwd)), 5);
    player.pos.copy(d).multiplyScalar(R + groundH(d) + 0.4); player.up.copy(d); player.fwd.copy(RAMP.fwd).projectOnPlane(d).normalize(); player.vel.set(0, 0, 0); player.vr = 0; curBiome = -1;
    camera.position.copy(player.pos).addScaledVector(d, 4).addScaledVector(player.fwd, -6);
    toast('Grįžai namo!', S15.stage === 'star' ? 'Nunešk žvaigždę į muziejų' : 'Pradžios Miestas', '#ffd23a');
  });
}
function updateSpace(dt, t) {
  const f = player.down ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = player.down ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 10 : 6.5; _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, player.grounded ? Math.min(1, 12 * dt) : Math.min(1, 3 * dt));
  if (!player.down && keys.Space && player.grounded) { player.vr = 8.6; player.grounded = false; sfx.jump(); }
  player.pos.addScaledVector(player.vel, dt); player.vr -= GRAV * 0.42 * dt; player.pos.y += player.vr * dt;
  for (const p of SP.plats) { if (p.moving) { p.y = p.y0 + Math.sin(t * 0.8 + p.ph) * 0.9; p.g.position.y = p.y; } p.g.rotation.y += dt * 0.05; }
  let ground = -1e9, on = null;
  for (const p of SP.plats) { const d = Math.hypot(player.pos.x - p.x, player.pos.z - p.z); if (d < p.r + 0.2 && player.pos.y >= p.y - 0.7 && p.y > ground) { ground = p.y; on = p; } }
  if (player.pos.y <= ground && player.vr <= 0.5) { player.pos.y = ground; player.vr = 0; player.grounded = true; SP.last = on; } else player.grounded = false;
  if (player.pos.y < -35) { const p = SP.last || SP.start; player.pos.set(p.x, p.y + 3, p.z); player.vel.set(0, 0, 0); player.vr = 0; tone(300, 0.4, { to: 120, type: 'triangle', vol: 0.05 }); toast('Nukritai į kosmosą!', 'Kosmosas tave grąžino ant asteroido', '#6ff7ff'); }
  player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd);
  if (player.down) downPose(dt, t); else animateMan(dt, f !== 0 || s !== 0, sp);
  const dist = 6.5, pitch = player.pitch;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
  camera.position.lerp(_ct, Math.min(1, dt * 10)); camera.up.set(0, 1, 0); camera.lookAt(player.pos.clone().add(new V3(0, 1.4, 0)));
  // the star, the planet below
  if (SP.star.visible) { SP.star.rotation.y = t * 0.6; SP.star.position.y = SP.end.y + 5 + Math.sin(t * 1.3) * 0.4; SP.star.userData.glow.material.opacity = 0.5 + 0.2 * Math.sin(t * 3); }
  SP.home.rotation.y += dt * 0.02;
  SP.portals.forEach(g => g.children[1].material.opacity = 0.3 + 0.15 * Math.sin(t * 4));
  let txt = '';
  if (!card) {
    const nearP = SP.portals.some(g => Math.hypot(player.pos.x - g.position.x, player.pos.z - g.position.z) < 2.6 && Math.abs(player.pos.y - g.position.y) < 3);
    if (SP.star.visible && Math.hypot(player.pos.x - SP.end.x, player.pos.z - SP.end.z) < SP.end.r + 1 && Math.abs(player.pos.y - SP.end.y) < 2) txt = '<kbd>E</kbd> paimti žvaigždę';
    else if (nearP) txt = '<kbd>E</kbd> keliauti namo';
  }
  setPrompt(txt);
  updateQuestHud();
}
function spaceAction() {
  if (card) { hideCard(); return; }
  if (SP.star.visible && Math.hypot(player.pos.x - SP.end.x, player.pos.z - SP.end.z) < SP.end.r + 1 && Math.abs(player.pos.y - SP.end.y) < 2) { takeStar(); return; }
  if (SP.portals.some(g => Math.hypot(player.pos.x - g.position.x, player.pos.z - g.position.z) < 2.6 && Math.abs(player.pos.y - g.position.y) < 3)) { leaveSpace(); return; }
}
function takeStar() {
  const st = SP.star, p0 = st.position.clone(); let t = 0;
  [784, 988, 1175, 1568, 2093].forEach((f, i) => tone(f, 0.5, { type: 'sine', vol: 0.06, when: i * 0.1 }));
  fx.push(dt => { t += dt; const k = Math.min(1, t / 1); st.position.lerpVectors(p0, player.pos.clone().add(new V3(0, 1.2, 0)), k); st.scale.setScalar(2.6 * (1 - k) + 0.1); if (k >= 1) { st.visible = false; st.scale.setScalar(2.6); st.position.copy(p0); S15.stage = 'star'; saveS15(); attachStar(true); toast('Žvaigždė susitraukė ir įšoko tau į rankas!', 'Keliauk namo per portalą ir nunešk ją į muziejų', '#ffd23a'); return false; } return true; });
}
let heldStar = null;
function attachStar(on) {
  const hand = player.mesh.userData.parts.handL;
  if (on && !heldStar) { heldStar = makeStar(); heldStar.scale.setScalar(0.22); heldStar.userData.glow.scale.setScalar(2); heldStar.position.set(0, -0.15, 0.2); hand.add(heldStar); linearize(heldStar); }
  if (!on && heldStar) { hand.remove(heldStar); heldStar = null; }
}
function deliverStar() {
  attachStar(false); S15.stage = 'done'; saveS15(); addMoney(5000); refreshMuseumExtras();
  [523, 659, 784, 1047, 1319, 1568, 2093, 2637].forEach((f, i) => tone(f, 0.7, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
  poof(museum.g.position.clone().addScaledVector(museum.d, 2), 0xffd23a);
  toast('Slapta misija įvykdyta!', 'Žvaigždė iš kosmoso užėmė paskutinį tuščią muziejaus stendą. Apdovanojimas: 5000 €', '#ffe98a');
}
function updateS15Hud(el) {
  if (S15.stage !== 'star') { el.hidden = true; return; }
  el.hidden = false; let arrow = '', dist = '';
  const target = mode === 'planet' && museum ? museum.g.position : null, p = player.inCar ? ride.pos : player.pos;
  if (target) { arrow = arrowTo(target); dist = ` · ${Math.round(target.distanceTo(p))} m`; }
  el.innerHTML = `${arrow}<div><div class="qt">Slapta misija: Žvaigždė iš kosmoso</div><div class="qs">${mode === 'space' ? 'Grįžk namo per portalą NAMO' : 'Nunešk žvaigždę į muziejų'}${dist}</div></div>`;
}
