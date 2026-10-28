// ================= inside the museum =================
// One side of the hall shows 15 exhibits; the other side has 15 empty places still waiting for finds.
const museumScene = new THREE.Scene();
museumScene.background = new THREE.Color(0x2a2620);
museumScene.add(new THREE.AmbientLight(0xffffff, 0.3));
museumScene.add(new THREE.HemisphereLight(0xfff6e8, 0x5a4a3a, 0.5));
const MU = { W: 16, D: 34, H: 6, built: false, spots: [], boxes: [], hornSpot: null, hornMesh: null, left: [] };
const EXHIBITS = [
  { name: 'Senovinė moneta', text: 'Rasta Begalinėje Dykumoje, griuvėsių smėlyje. Ant jos išraižyti aštuoni spinduliai – tas pats ženklas kaip Pradžios Miesto aikštėje.', make: () => BIOME_ITEMS[1][1][1]() },
  { name: 'Amfora', text: 'Moliniai indai iš oazių. Juose kadaise buvo laikomas vanduo, kuris niekada nešyla.', make: () => BIOME_ITEMS[1][0][1]() },
  { name: 'Amžinas ledo kubas', text: 'Atgabentas iš Ledo Salos prieš šimtą metų. Jis vis dar netirpsta.', make: () => BIOME_ITEMS[2][1][1]() },
  { name: 'Sniego gniūžtė', text: 'Pati pirmoji sniego gniūžtė, kurią kas nors kada nors metė. Taip teigia lentelė.', make: () => BIOME_ITEMS[2][0][1]() },
  { name: 'Mažas grybas', text: 'Grybų Karalystės grybas. Naktį jis tyliai dainuoja – sargai skundžiasi.', make: () => BIOME_ITEMS[3][0][1]() },
  { name: 'Šviečianti spora', text: 'Spora iš Didžiojo Grybo. Ji šviečia jau trejus metus ir nesiruošia nustoti.', make: () => BIOME_ITEMS[3][1][1]() },
  { name: 'Milžino kaulas', text: 'Rastas Raudonojoje Dykumoje, prie milžino griaučių. Per lygus, kad būtų tikras.', make: () => BIOME_ITEMS[4][0][1]() },
  { name: 'Raudonas akmuo', text: 'Akmuo iš Raudonosios Dykumos. Jei prikiši ausį, girdisi požeminė oazė.', make: () => BIOME_ITEMS[4][1][1]() },
  { name: 'Kokosas', text: 'Atneštas iš Džiunglių. Ant jo kažkas nupiešė veidą ir parašė „Vilius“.', make: () => BIOME_ITEMS[5][0][1]() },
  { name: 'Bananų kekė', text: 'Džiunglių bananai. Jie čia guli nuo atidarymo dienos ir vis dar geltoni. Keista.', make: () => BIOME_ITEMS[5][1][1]() },
  { name: 'Pikselių kubas', text: 'Kubas iš Pikselių Pasaulio. Kartais jis pamiršta, kokios spalvos turėtų būti.', make: () => BIOME_ITEMS[6][0][1]() },
  { name: 'Pikselių širdelė', text: 'Rasta prie pikselių vartų. Mokslininkai mano, kad tai nebaigto pasaulio dalis.', make: () => BIOME_ITEMS[6][1][1]() },
  { name: 'Meteorito gabalas', text: 'Nukrito ant Pradžios Miesto per demono chaosą. Vis dar šiltas.', make: () => S(G.dodec, mat(0x3a2a24, { roughness: 0.9 }), 0.35, 0.3, 0.35, 0, 0.3, 0) },
  { name: 'Dinozauriuko kiaušinis', text: 'Atgabentas iš Marso. Kartais jis pasijuda. Prašome nebelsti į stiklą.', make: () => { const g = new THREE.Group(); g.add(S(G.sph, mat(0xe8f0c8), 0.28, 0.36, 0.28, 0, 0.36, 0)); for (let i = 0; i < 6; i++) g.add(S(G.sph, mat(0x7ccf5a), 0.06, 0.05, 0.03, Math.cos(i) * 0.24, 0.25 + (i % 3) * 0.12, Math.sin(i) * 0.24)); return g; } },
  { name: 'Viščiuko plunksna', text: 'Dovana nuo vištos iš Kūrėjo Salės – už tai, kad kažkas išgelbėjo jos vaikus.', make: () => { const g = new THREE.Group(); const f = S(G.sph, mat(0xffd84a), 0.06, 0.4, 0.12, 0, 0.4, 0); f.rotation.z = 0.4; g.add(f); return g; } }
];
function pedestal(x, z, filled) {
  const g = new THREE.Group(); g.position.set(x, 0, z); museumScene.add(g);
  g.add(S(G.box, mat(0xf2ede2, { roughness: 0.5 }), 0.9, 1.0, 0.9, 0, 0.5, 0));
  g.add(S(G.box, mat(0xd8cfbc), 1.0, 0.08, 1.0, 0, 1.04, 0));
  if (filled) g.add(S(G.box, mat(0xbfe8ff, { transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.2 }), 0.86, 0.9, 0.86, 0, 1.53, 0));
  const spot = new THREE.PointLight(filled ? 0xfff2d0 : 0x9a9488, filled ? 0.35 : 0.12, 4); spot.position.set(0, 3, 0); g.add(spot);
  MU.boxes.push({ x, z, hx: 0.5, hz: 0.5 });
  return g;
}
function buildMuseumHall() {
  if (MU.built) return; MU.built = true;
  const { W: Wd, D, H } = MU;
  museumScene.add(S(G.box, mat(0x9a7a5a, { roughness: 0.45 }), Wd, 0.2, D, 0, -0.1, 0));
  museumScene.add(S(G.box, mat(0x7a2a2a, { roughness: 0.9 }), 3, 0.02, D - 3, 0, 0.01, 0.5));
  museumScene.add(S(G.box, mat(0xf6f1e6), Wd, 0.2, D, 0, H + 0.1, 0));
  const wall = mat(0xe8e0cc, { roughness: 0.8 });
  museumScene.add(S(G.box, wall, Wd, H, 0.2, 0, H / 2, -D / 2 - 0.1)); museumScene.add(S(G.box, wall, Wd, H, 0.2, 0, H / 2, D / 2 + 0.1));
  for (const sx of [-1, 1]) museumScene.add(S(G.box, wall, 0.2, H, D, sx * (Wd / 2 + 0.1), H / 2, 0));
  for (let z = -D / 2 + 3; z < D / 2; z += 5) for (const x of [-3, 3]) museumScene.add(S(G.sph, bmat(0xfff2c8), 0.35, 0.12, 0.35, x, H - 0.05, z));
  museumScene.add(S(G.box, mat(0x6b4426), 2.2, 3.2, 0.1, 0, 1.6, D / 2 - 0.05));
  // signs above each side
  const signL = mesh(new THREE.PlaneGeometry(8, 0.9), new THREE.MeshBasicMaterial({ map: labelTex('LAUKIAMA RADINIŲ', '#e8e0cc', '#8a7a60', 900, 100) }), -Wd / 2 + 0.02, H - 1.2, 0); signL.rotation.y = Math.PI / 2; museumScene.add(signL);
  const signR = mesh(new THREE.PlaneGeometry(8, 0.9), new THREE.MeshBasicMaterial({ map: labelTex('PASAULIO LOBIAI', '#e8e0cc', '#5a3a20', 900, 100) }), Wd / 2 - 0.02, H - 1.2, 0); signR.rotation.y = -Math.PI / 2; museumScene.add(signR);
  // 15 per side, the right side full, the left side still empty
  for (let i = 0; i < 15; i++) {
    const z = -D / 2 + 3 + i * 1.9;
    const L = pedestal(-Wd / 2 + 1.6, z, false);
    const tag = mesh(new THREE.PlaneGeometry(0.8, 0.2), new THREE.MeshBasicMaterial({ map: labelTex('TUŠČIA', '#d8cfbc', '#8a7a60', 256, 64) }), 0, 0.75, 0.46); L.add(tag); L.rotation.y = Math.PI / 2;
    const spot = { x: L.position.x + 1, z, name: 'Tuščias stendas Nr. ' + (i + 1), text: 'Čia dar nieko nėra. Lentelė sako: „Šią vietą užims radinys, kurį atneš drąsus keliautojas.“ Gal tai būsi tu?' };
    MU.spots.push(spot); MU.left.push({ g: L, tag, spot, filled: false });
    const Rg = pedestal(Wd / 2 - 1.6, z, true); Rg.rotation.y = -Math.PI / 2;
    const ex = EXHIBITS[i], m = ex.make(); m.position.y = 1.1; m.scale.multiplyScalar(1.4); Rg.add(m); ex.mesh = m;
    const t2 = mesh(new THREE.PlaneGeometry(0.85, 0.2), new THREE.MeshBasicMaterial({ map: labelTex(ex.name, '#3a2a1a', '#ffd23a', 512, 112) }), 0, 0.75, 0.46); Rg.add(t2);
    MU.spots.push({ x: Rg.position.x - 1, z, name: ex.name, text: ex.text });
  }
  // the centre-piece: the demon's horn
  const c = pedestal(0, -D / 2 + 4, true); c.scale.setScalar(1.4); MU.hornPed = c; { const bx = MU.boxes[MU.boxes.length - 1]; bx.hx = bx.hz = 0.7; }
  const ct = mesh(new THREE.PlaneGeometry(0.85, 0.2), new THREE.MeshBasicMaterial({ map: labelTex('DEMONO RAGAS', '#3a2a1a', '#ff6b4a', 512, 112) }), 0, 0.75, 0.46); c.add(ct);
  MU.hornSpot = { x: 0, z: -D / 2 + 5.4, name: 'Demono ragas', text: '' };
  MU.spots.push(MU.hornSpot);
  MU.spots.push({ x: 0, z: D / 2 - 1, name: 'Durys', door: true });
  refreshMuseumHorn(); refreshMuseumExtras();
  museumScene.environment = scene.environment;
  linearize(museumScene);
}
function refreshMuseumHorn() {
  if (!MU.hornPed) return;
  if (Q2.stage === 'done' && !MU.hornMesh) { const h = makeHorn(); h.position.y = 1.1; MU.hornPed.add(h); MU.hornMesh = h; linearize(h); }
  MU.hornSpot.text = Q2.stage === 'done'
    ? 'Nulūžęs demono ragas. Atrastas Marse, drakono mamos pilyje, ir atneštas mažo žalio žmogeliuko. Be jo demonas silpnesnis.'
    : 'Pagrindinė muziejaus vieta dar tuščia. Lentelė sako: „Čia stovės Demono ragas.“';
}
function enterMuseum() {
  if (transitioning || player.inCar) return;
  transitioning = true; cancelPlace(true); stopClimb(); dropAll(); sfx.blip();
  fadeTo(() => {
    transitioning = false; buildMuseumHall(); refreshMuseumHorn(); refreshMuseumUFO(); refreshS9(); mode = 'museum'; museumScene.add(player.mesh);
    player.pos.set(0, 0, MU.D / 2 - 1.5); player.up.set(0, 1, 0); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.grounded = true;
    camera.position.set(0, 2.6, MU.D / 2 - 0.3); camera.up.set(0, 1, 0);
    $('bName').textContent = 'Muziejus'; $('bEn').textContent = 'Pradžios Miestas'; $('bAtm').textContent = 'Dešinėje – 15 pasaulio lobių. Kairėje – 15 tuščių vietų būsimiems radiniams.'; document.documentElement.style.setProperty('--biome', '#e8c890');
    toast('Sveikas atvykęs į muziejų!', 'Prieik prie eksponato ir spausk E, kad paskaitytum', '#e8c890');
  });
}
function exitMuseum() {
  if (transitioning) return; transitioning = true; hideCard();
  fadeTo(() => {
    transitioning = false; mode = 'planet'; world.add(player.mesh);
    const d = museum.d, out = moveAlong(d, tangentToward(d, UP), 9);
    player.pos.copy(out).multiplyScalar(R + groundH(out) + 0.2); player.up.copy(out); player.fwd.copy(tangentToward(out, UP));
    player.vel.set(0, 0, 0); player.vr = 0; curBiome = -1; camera.position.copy(player.pos).addScaledVector(out, 3).addScaledVector(player.fwd, -6);
  });
}
function nearestMuseumSpot() { let b = null, bd = 1.8; for (const s of MU.spots) { const d = Math.hypot(player.pos.x - s.x, player.pos.z - s.z); if (d < bd) { bd = d; b = s; } } return b; }
function museumAction() {
  if (card) { hideCard(); return; }
  if (s9MuseumAction()) return;
  const s = nearestMuseumSpot(); if (!s) return;
  if (s.door) { exitMuseum(); return; }
  showCard(s.name, s.text, 'E – uždaryti', '#e8c890'); card = { kind: 'info' }; sfx.blip();
}
function updateMuseum(dt, t) {
  for (const ex of EXHIBITS) if (ex.mesh) ex.mesh.rotation.y = t * 0.4;
  if (MU.hornMesh) MU.hornMesh.rotation.y = t * 0.6;
  const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP);
  _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 7 : 4.5; _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, Math.min(1, 12 * dt));
  if (keys.Space && player.grounded) { player.vr = 6; player.grounded = false; sfx.jump(); }
  player.pos.addScaledVector(player.vel, dt); player.vr -= GRAV * dt; player.pos.y += player.vr * dt;
  const rad = 0.3;
  for (const o of MU.boxes) { const dx = player.pos.x - o.x, dz = player.pos.z - o.z, ex = o.hx + rad - Math.abs(dx), ez = o.hz + rad - Math.abs(dz); if (ex > 0 && ez > 0) { if (ex < ez) player.pos.x += dx < 0 ? -ex : ex; else player.pos.z += dz < 0 ? -ez : ez; } }
  player.pos.x = clamp(player.pos.x, -MU.W / 2 + rad, MU.W / 2 - rad); player.pos.z = clamp(player.pos.z, -MU.D / 2 + rad, MU.D / 2 - rad);
  if (player.pos.y <= 0) { player.pos.y = 0; player.vr = 0; player.grounded = true; }
  player.mesh.rotation.set(0, 0, 0); player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd);
  animateMan(dt, f !== 0 || s !== 0, sp);
  const dist = 4.6, pitch = player.pitch;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist * (frontView ? -1 : 1));
  _ct.x = clamp(_ct.x, -MU.W / 2 + 0.25, MU.W / 2 - 0.25); _ct.z = clamp(_ct.z, -MU.D / 2 + 0.25, MU.D / 2 - 0.25); _ct.y = clamp(_ct.y, 0.4, MU.H - 0.25);
  camera.position.lerp(_ct, Math.min(1, dt * 10)); camera.up.set(0, 1, 0); camera.lookAt(player.pos.x, player.pos.y + 1.3, player.pos.z);
  const sp2 = nearestMuseumSpot();
  if (card && card.kind === 'info' && !sp2) hideCard();
  setPrompt(card ? '' : sp2 ? (sp2.door ? '<kbd>E</kbd> išeiti į miestą' : `<kbd>E</kbd> apžiūrėti: ${sp2.name}`) : '');
  updateS9(dt, t); wave(t);
}

// finds brought back from God's commands fill the empty side, one stand at a time
function refreshMuseumExtras() {
  if (!MU.built) return;
  const finds = [];
  if (typeof Q3 !== 'undefined' && Q3.stage === 'done') finds.push({ name: 'Musė voratinklyje', text: 'Senojo Voro dovana iš požemių po Didžiuoju Grybu – už tai, kad jo dukra Voratinklė vėl namie. Vorų pasaulyje tai didžiausias lobis.', make: () => { const m = makeFlyInWeb(); m.scale.setScalar(0.7); m.position.y = 0.4; return m; } });
  if (typeof Q4 !== 'undefined' && Q4.stage === 'done') finds.push({ name: 'Spalvotas vienaragio ragas', text: 'Mamos Saulutės ragas iš Saldainių Pasaulio. Nulūžo, kai pro šalį praskrido demonas. Jo spalvos niekada neužgęsta – sako, kad naktį jis tyliai dainuoja vienaragių lopšinę.', make: () => { const m = makeUniHorn(); m.scale.setScalar(0.7); m.position.y = 0.05; return m; } });
  if (typeof Q8 !== 'undefined' && Q8.stage === 'done') finds.push({ name: 'Stebuklingas debesėlis', text: 'Debesų Karaliaus dovana už sugrąžintą sūnų. Niekada neištirpsta ir niekada nelyja – tik kartais tyliai pasninga ant stiklo.', make: () => { const g = new THREE.Group(); for (const [x, y, s] of [[0, 0.35, 0.3], [-0.22, 0.3, 0.2], [0.22, 0.3, 0.2], [0, 0.5, 0.2]]) g.add(S(G.sph, mat(0xffffff, { emissive: 0xbfe8ff, emissiveIntensity: 0.3, roughness: 1 }), s, s * 0.85, s, x, y, 0)); return g; } });
  if (typeof Q10 !== 'undefined' && Q10.stage === 'done') finds.push({ name: 'Laiko mašinos kopija', text: 'Maža tikros laiko mašinos kopija. Tikroji stovi Kūrėjo Salėje. Pastatyta iš dešimties raudono metalo gabalų, kuriuos padovanojo pasaulio gyventojai, ir Kūrėjo kompiuterio.', make: () => { const m = makeTimeMachine(); m.scale.setScalar(0.18); return m; } });
  if (typeof Q11 !== 'undefined' && Q11.stage === 'done') finds.push({ name: 'Urvinių karaliaus karūna', text: 'Karaliaus Ugabugo karūna iš laikų prieš 100 000 metų: auksas, spalvoti akmenukai ir mamuto dantis. Ją gavo karaliaus padėjėjas – mažas žalias žmogeliukas, kuris iškepė žuvį, surinko 20 kriauklių ir pagavo išprotėjusį cirko tigrą.', make: () => { const m = makeStoneCrown(); m.scale.setScalar(1.1); m.position.y = 0.05; return m; } });
  if (typeof Q12 !== 'undefined' && Q12.stage === 'done') finds.push({ name: 'Pirmasis auksinis krepšinio kamuolys', text: 'Pirmasis pasaulio auksinis krepšinio kamuolys. Ateityje jį pavogė ir paslėpė Vagių banke – už lazerių, sargybinių robotų, seifo su slaptu kodu ir dar slaptos sienos. Parneštas laiko mašina.', make: () => { const m = makeGoldBall(0.38); m.position.y = 0.38; return m; } });
  if (typeof Q13 !== 'undefined' && Q13.stage === 'done') finds.push({ name: 'Auksinė mojuojanti katė', text: 'Viena iš dešimties auksinių laimės kačių. Penkias parnešei rankomis, keturias milžiniškas – traktoriumi, o paskutinę gavai iš miestiečio. Ji moja letenėle visiems muziejaus lankytojams.', make: () => { const m = makeLuckyCat(); m.scale.setScalar(0.62); waving.push(m); return m; } });
  if (typeof Q14 !== 'undefined' && Q14.stage === 'done') finds.push({ name: 'Demono lazda', text: 'Demono lazda. Ji iškilo iš Demonų ežero Pikselių Pasaulyje, kai demonas pagaliau mirė. Dvasios sprogimas buvo toks stiprus, kad susprogdino šešis tuščius muziejaus stendus. Nuo tos dienos pasaulyje nebėra chaoso.', make: () => { const m = makeDemonStaff(); m.scale.setScalar(0.42); return m; } });
  if (typeof S15 !== 'undefined' && S15.stage === 'done') finds.push({ name: 'Žvaigždė iš kosmoso', text: 'Tikra žvaigždė iš kosmoso, už burbulo. Ją parnešė mažas žalias žmogeliukas, kuris užvažiavo ant kosminio tramplino ir nušoko iki jos per asteroidus. Ji šypsosi ir naktį apšviečia visą muziejų. Tai paskutinis muziejaus radinys.', make: () => { const m = makeStar(); m.scale.setScalar(0.38); m.position.y = 0.45; return m; } });
  finds.forEach((fd, i) => {
    const L = MU.left[i]; if (!L || L.filled) return; L.filled = true;
    const m = fd.make(); m.position.y += 1.1; L.g.add(m); linearize(m);
    L.g.add(S(G.box, mat(0xbfe8ff, { transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.2 }), 0.86, 0.9, 0.86, 0, 1.53, 0));
    L.tag.material.map = labelTex(fd.name, '#3a2a1a', '#ffd23a', 512, 112); L.tag.material.needsUpdate = true;
    L.spot.name = fd.name; L.spot.text = fd.text;
  });
  // the spirit explosion blew up the last six empty stands
  if (typeof demonDead === 'function' && demonDead()) for (let i = MU.left.length - 6; i < MU.left.length; i++) {
    const L = MU.left[i]; if (!L || L.filled || L.broken) continue; L.broken = true;
    L.g.children.forEach(o => { if (o.isMesh && o !== L.tag) { o.rotation.z = rr(-0.35, 0.35); o.position.y *= 0.55; o.scale.y *= 0.6; } });
    for (let k = 0; k < 6; k++) L.g.add(S(G.dodec, mat(0xd8cfbc), rr(0.12, 0.3), rr(0.1, 0.22), rr(0.12, 0.3), rr(-0.8, 0.8), 0.1, rr(-0.8, 0.8)));
    L.g.add(S(G.cyl, bmat(0x1a1210, { transparent: true, opacity: 0.55 }), 1.2, 0.02, 1.2, 0, 0.02, 0));
    L.tag.material.map = labelTex('SUSPROGDINTA', '#3a1a1a', '#ff8a6a', 256, 64); L.tag.material.needsUpdate = true;
    L.spot.name = 'Susprogdintas stendas'; L.spot.text = 'Šį tuščią stendą susprogdino demono dvasios sprogimas. Lentelė apdegusi, bet dar galima perskaityti: „Čia galėjo būti radinys.“';
    linearize(L.g);
  }
}
