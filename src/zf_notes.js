// ================= The Time God's request: the NOTE HUNT → fix the Great Past Clock =================
// The Time God gives the first riddle. Each note tells where the next one is; only the current note exists.
// The last note sends you through the elevator to the OTHER SIDE OF THE WORLD (everything upside down!), where
// the clock parts lie in the middle of the street – and at the very end there is a little room with a secret costume.
// Bring the parts back: the Time God hammers the clock together and you ALL travel into the past.
const Q18 = { stage: 'none', step: 0, parts: false, suit: false };   // none | hunt | parts | done
try { const s = JSON.parse(localStorage.getItem('modly-quest18') || 'null'); if (s) Object.assign(Q18, s); } catch (_) { }
function saveQ18() { try { localStorage.setItem('modly-quest18', JSON.stringify(Q18)); } catch (_) { } }
const NOTE_N = 7;
const NOTE_TXT = [
  'Laikrodukas mėlynas vaikštinėja po šiandieną.',
  'Kokia graži mašinėlė, koks gražus namelis – abudu mirė.',
  'Įdomu, iš kur tas smėlis?',
  'Tiesiai, tiesiai kažkas žiūri.',
  'O kažkur prie kaulų tyliai vagys ten tipena.',
  'Tyliai ateiviai skraido.',
  'Laikrodžiui sutvarkyti dalis lengva surasti – kitapus pasaulio gi guli dalys.'
];
const GOD_HINT = 'Auksinis ratas – ne. Praeities ratas – ratas kairėje.';
const NP = { wheel: new V3(-62, 0, 0), crash: new V3(60, 0, -35), forest: new V3(-25, 0, 98), forestNote: new V3(-31, 0, 104), straight: new V3(0, 0, 116), bones: new V3(-46, 0, -58), saucerC: new V3(84, 0, 0), lift: new V3(100, 0, 62) };
const NT = { note: null, blue: null, thieves: [], saucer: null, lift: null, wreck: null, steal: 0 };
function makePaper() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 80; const x = c.getContext('2d');
  x.fillStyle = '#fbf6e4'; x.fillRect(0, 0, 64, 80); x.fillStyle = '#7a6a5a'; for (let i = 0; i < 6; i++) x.fillRect(8, 12 + i * 10, 40 + (i % 3) * 6, 3);
  const g = new THREE.Group(); const p = mesh(new THREE.PlaneGeometry(0.55, 0.7), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), side: THREE.DoubleSide })); p.rotation.x = -Math.PI / 2; p.position.y = 0.04; g.add(p);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xfff8c8, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(0.9); s.position.y = 0.3; g.add(s); g.userData.spark = s;
  return g;
}
// ---------- extra things in the Time God's world ----------
{ const _b = buildTimeWorld; buildTimeWorld = () => { const first = !TW.built; _b(); if (first) buildNoteHunt(); }; }
function buildNoteHunt() {
  // the old stone wheel of the past
  { const g = new THREE.Group(); g.position.copy(NP.wheel); twScene.add(g); const st = mat(0x8a7a6a, { roughness: 1 });
    const w = mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.6, 20), st, 0, 2.1, 0); w.rotation.x = Math.PI / 2; w.rotation.z = 0.15; g.add(w); g.add(mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.7, 10), mat(0x5a4a3a), 0, 2.1, 0).rotateX(Math.PI / 2));
    g.add(S(G.box, mat(0x6a5a4a), 1, 0.4, 1.4, 0, 0.2, 0)); TW.boxes.push({ x: NP.wheel.x, z: NP.wheel.z, hx: 2.2, hz: 0.5, h: 4.3 }); }
  // the blue little clock (the only blue one) – it wanders around today's middle
  { const c = TW.clocks[0]; const cm = c.m.userData.body.children[0].material, blue = mat(0x2a6aff, { metalness: 0.5, roughness: 0.3 }); c.m.traverse(o => { if (o.isMesh && o.material === cm) o.material = blue; }); c.blue = true; c.line = 'Tik tak! Aš – vienintelis mėlynas laikrodukas visame laiko pasaulyje!'; NT.blue = c; c.m.position.set(5, 0, 8); }
  // the future bubble car crashed into a future bubble house
  { const g = new THREE.Group(); g.position.copy(NP.crash); twScene.add(g);
    g.add(S(G.sph, new THREE.MeshStandardMaterial({ color: 0xbfefff, transparent: true, opacity: 0.45, metalness: 0.3, roughness: 0.05 }), 4, 3.2, 4, 0, 0, 0)); g.add(S(G.cyl, mat(0xc8ccd6, { metalness: 0.8 }), 4.1, 0.3, 4.1, 0, 0.15, 0));
    for (let i = 0; i < 6; i++) { const cr = S(G.box, bmat(0xffffff), 0.05, rr(0.8, 1.8), 0.02, 2.8 + rr(-0.4, 0.4), 1.6 + rr(-0.6, 0.6), 2.6 + rr(-0.4, 0.4)); cr.rotation.set(rr(-1, 1), 0.8, rr(-1, 1)); g.add(cr); }
    const car = makeEraCar(2, 0xff5ad8); car.position.set(3.4, 0.3, 3.4); car.rotation.set(0.5, -2.3, 0.4); g.add(car);
    for (let i = 0; i < 8; i++) g.add(S(G.box, mat(0xc8ccd6, { metalness: 0.7 }), rr(0.2, 0.5), 0.05, rr(0.2, 0.5), rr(1, 5), 0.05, rr(1, 5)));
    NT.wreck = g; TW.boxes.push({ x: NP.crash.x, z: NP.crash.z, hx: 3.6, hz: 3.6, h: 4 }); }
  // the hourglass forest
  for (let i = 0; i < 30; i++) {
    const x = NP.forest.x + rr(-14, 14), z = NP.forest.z + rr(-12, 13); if (Math.hypot(x - NP.forestNote.x, z - NP.forestNote.z) < 2.5) continue;
    const s = rr(0.8, 2.4), g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); twScene.add(g); const wood = mat(0x6a4426);
    g.add(S(G.cyl, wood, 0.7, 0.15, 0.7, 0, 0.08, 0)); g.add(S(G.cyl, wood, 0.7, 0.15, 0.7, 0, 2.3, 0)); for (const [px, pz] of [[-0.5, 0], [0.5, 0], [0, 0.5], [0, -0.5]]) g.add(S(G.cyl, wood, 0.05, 2.2, 0.05, px, 1.2, pz));
    const gl = new THREE.MeshStandardMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.35, roughness: 0.05 });
    g.add(S(G.cone, gl, 0.55, 1.05, 0.55, 0, 1.7, 0).rotateX(Math.PI)); g.add(S(G.cone, gl, 0.55, 1.05, 0.55, 0, 0.67, 0)); g.add(S(G.cone, mat(0xe8c870), 0.4, 0.5, 0.4, 0, 0.42, 0)); g.add(S(G.cone, mat(0xe8c870), 0.25, 0.35, 0.25, 0, 1.45, 0).rotateX(Math.PI));
    TW.boxes.push({ x, z, hx: 0.6 * s, hz: 0.6 * s, h: 2.4 * s });
  }
  { const sg = mesh(new THREE.PlaneGeometry(5, 0.9), new THREE.MeshBasicMaterial({ map: labelTex('SMĖLIO LAIKRODŽIŲ MIŠKAS', '#6a4426', '#ffe8a0', 640, 110), side: THREE.DoubleSide }), NP.forest.x + 8, 1.6, NP.forest.z - 15); twScene.add(sg); }
  // a little post far away, straight ahead of the Time God
  { twScene.add(S(G.cyl, mat(0x6a4426), 0.1, 1, 0.1, NP.straight.x, 0.5, NP.straight.z)); twScene.add(S(G.box, mat(0x6a4426), 0.8, 0.06, 0.8, NP.straight.x, 1.02, NP.straight.z)); }
  // bones by the old house + two sneaky thieves
  { const bone = mat(0xf4ecd8, { roughness: 0.6 }); for (let i = 0; i < 9; i++) { const b = S(G.cyl, bone, 0.12, rr(1, 2.2), 0.12, NP.bones.x + rr(-2, 2), 0.15, NP.bones.z + rr(-2, 2)); b.rotation.set(Math.PI / 2, 0, rr(0, 3)); twScene.add(b); }
    twScene.add(S(G.sph, bone, 0.6, 0.5, 0.7, NP.bones.x + 1.6, 0.4, NP.bones.z - 1.2)); for (let i = 0; i < 5; i++) { const r = mesh(new THREE.TorusGeometry(0.8, 0.08, 6, 12, Math.PI), bone, NP.bones.x - 1.5, 0, NP.bones.z + 1 - i * 0.35); r.rotation.y = Math.PI / 2; twScene.add(r); }
    for (let i = 0; i < 2; i++) { const t = makeThief(); t.position.set(NP.bones.x + 3 + i * 2, 0, NP.bones.z + 3); twScene.add(t); NT.thieves.push({ m: t, a: i * Math.PI, home: NP.bones.clone().add(new V3(3, 0, 4)), flee: 0, fleeDir: new V3() }); } }
  // humans flying an alien saucer
  { const g = new THREE.Group(); twScene.add(g); NT.saucer = g;
    g.add(S(G.sph, mat(0xc8ccd6, { metalness: 0.9, roughness: 0.2 }), 2.6, 0.55, 2.6)); g.add(S(G.sph, new THREE.MeshStandardMaterial({ color: 0x9af0ff, transparent: true, opacity: 0.5, roughness: 0.05 }), 1.3, 0.9, 1.3, 0, 0.45, 0));
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.add(S(G.sph, bmat(i % 2 ? 0x5affff : 0xff5ad8), 0.18, 0.18, 0.18, Math.cos(a) * 2.3, -0.1, Math.sin(a) * 2.3)); }
    for (const x of [-0.45, 0.45]) { const p = makePerson(); p.scale.setScalar(0.45); p.position.set(x, 0.1, 0); g.add(p); }
    const beam = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0x9af0ff, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })); beam.scale.set(3, 4, 1); beam.position.y = -1.5; g.add(beam); }
  // the elevator to the other side of the world
  { const g = new THREE.Group(); g.position.copy(NP.lift); twScene.add(g); NT.lift = g;
    g.add(S(G.cyl, mat(0x3a3a48, { metalness: 0.7 }), 2, 0.3, 2, 0, 0.15, 0)); g.add(S(G.cyl, new THREE.MeshStandardMaterial({ color: 0x9af0ff, transparent: true, opacity: 0.3, roughness: 0.05 }), 2, 9, 2, 0, 4.5, 0)); g.add(S(G.cyl, mat(0x3a3a48, { metalness: 0.7 }), 2.1, 0.4, 2.1, 0, 9.1, 0));
    g.add(mesh(new THREE.PlaneGeometry(5, 0.9), new THREE.MeshBasicMaterial({ map: labelTex('LIFTAS · KITA PASAULIO PUSĖ', '#3a3a48', '#5affff', 640, 110), side: THREE.DoubleSide }), 0, 10.2, 0)); }
  linearize(twScene);
  refreshNotes();
}
function makeThief() {
  const g = makePerson(); const b = g.userData.body;
  b.add(S(G.box, bmat(0x111111), 0.62, 0.14, 0.05, 0, 1.78, 0.29)); for (const x of [-0.12, 0.12]) b.add(S(G.sph, bmat(0xffffff), 0.05, 0.05, 0.02, x, 1.78, 0.32));
  b.add(S(G.sph, mat(0x8a7a5a, { roughness: 1 }), 0.35, 0.4, 0.3, 0, 1.1, -0.35)); for (let i = 0; i < 4; i++) b.add(S(G.box, bmat(0x111111), 0.62, 0.06, 0.6, 0, 0.8 + i * 0.22, 0));
  return g;
}
// which note lies where right now
function notePos(step) {
  if (step === 0) return NP.wheel.clone().add(new V3(0.8, 0, 1.2));
  if (step === 2) return NP.crash.clone().add(new V3(-4.4, 0, 1));
  if (step === 3) return NP.forestNote.clone();
  if (step === 4) return NP.straight.clone().add(new V3(0, 1.06, 0));
  return null;   // the others are carried: the blue clock, the thieves, the saucer people
}
function refreshNotes() {
  if (!TW.built) return;
  const hunt = Q18.stage === 'hunt';
  const p = hunt ? notePos(Q18.step) : null;
  if (p) { if (!NT.note) { NT.note = makePaper(); twScene.add(NT.note); linearize(NT.note); } NT.note.visible = true; NT.note.position.copy(p); }
  else if (NT.note) NT.note.visible = false;
  NT.lift.visible = Q18.stage === 'parts' || (Q18.stage === 'hunt' && Q18.step >= NOTE_N) || Q18.stage === 'done';
}
function findNote() {
  const k = Q18.step; Q18.step++; if (Q18.step >= NOTE_N) { Q18.stage = 'parts'; } saveQ18(); refreshNotes();
  [659, 784, 988].forEach((f, i) => tone(f, 0.25, { type: 'triangle', vol: 0.06, when: i * 0.07 })); noiseHit(0.12, { ft: 'highpass', f: 3000, vol: 0.04 });
  startTalk(`Lapelis ${k + 1} / ${NOTE_N}`, [`„${NOTE_TXT[k]}“`].concat(k === NOTE_N - 1 ? ['Ateityje atsirado LIFTAS į kitą pasaulio pusę!'] : []), '#fff6c8');
}
const curClue = () => Q18.stage === 'hunt' ? (Q18.step === 0 ? GOD_HINT : NOTE_TXT[Q18.step - 1]) : Q18.stage === 'parts' ? (Q18.parts ? 'Nunešk laikrodžio dalis Laiko Dievui!' : NOTE_TXT[NOTE_N - 1]) : '';
// ---------- the Time God ----------
{ const _t = talkTimeGod; talkTimeGod = () => {
    if (Q18.stage === 'done') { startTalk('Laiko Dievas', [pick(['Tik tak! Praeities Laikrodis vėl eina – ir mes visi praeityje!', 'Ačiū tau, mažasis laiko meistre. Mano laikrodukai šoka iš džiaugsmo!'])], '#b0ff9a'); return; }
    if (Q18.stage === 'parts' && Q18.parts) { startTalk('Laiko Dievas', ['Tik tak!!! Tu radai Praeities Laikrodžio dalis! Duok jas čia…', 'Dabar – mano plaktukas!'], '#b0ff9a', fixPastClock); return; }
    if (Q18.stage === 'hunt' || Q18.stage === 'parts') { startTalk('Laiko Dievas', [`Paskutinė užuomina: „${curClue()}“`, 'Kiekvienas lapelis pasako, kur ieškoti kito. Tik tak!'], '#b0ff9a'); return; }
    // first time (or the old greeting already heard): the story + the first riddle
    const intro = TW.met ? ['Tik tak… Ar padėsi man pataisyti Praeities Laikrodį?'] : ['Tik tak… Sveikas, mažasis žaliasis! Aš – Laiko Dievas. Ačiū, kad atvykai.', 'Mano pasaulyje laikas sumaišytas: kairėje – praeitis, dešinėje – ateitis, o viduryje – šiandiena.', 'Bet pas mane bėda… Didysis PRAEITIES LAIKRODIS sustojo. Todėl niekas nebegali keliauti į praeitį.'];
    startTalk('Laiko Dievas', intro.concat([
      'Laikrodžio dalis kažkas paslėpė. O kelią iki jų rodo LAPELIAI su mįslėmis – kiekvienas pasako, kur kitas.',
      'Kai rasi vieną, tik tada atsiras kitas. Štai pirmoji mįslė:',
      `„${GOD_HINT}“`
    ]), '#b0ff9a', () => { TW.met = true; try { localStorage.setItem('modly-timemet', '1'); } catch (_) { } Q18.stage = 'hunt'; Q18.step = 0; saveQ18(); refreshNotes(); sfx.chime(); toast('Laiko Dievo prašymas: lapelių paieška!', `„${GOD_HINT}“`, '#b0ff9a'); });
  }; }
// ---------- E in the Time God's world ----------
{ const _a = timeAction; timeAction = () => {
    if (card) return _a();
    const pp = player.pos, d = p => Math.hypot(pp.x - p.x, pp.z - p.z);
    if (Q18.stage === 'hunt') {
      const s = Q18.step;
      if (NT.note && NT.note.visible && NT.note.position.distanceTo(pp.clone().setY(NT.note.position.y)) < 2.2) { findNote(); return; }
      if (s === 1 && d(NT.blue.m.position) < 2.6) { NT.blue.hop = 1; bubbleIn(twScene, NT.blue.m.position, 'Tik tak! Imk!', 2.4); findNote(); return; }
      if (s === 5) { const th = NT.thieves.find(t => d(t.m.position) < 2.4); if (th) { if (th.flee > 0) { toast('Vagys tave pamatė!', 'Prieik tyliau – neik bėgte (be Shift)', '#ff6b4a'); return; } bubbleIn(twScene, th.m.position, '…?!', 2.4); toast('Tyliai ištraukei lapelį iš vagies kišenės!', 'Jie net nepastebėjo', '#b0ff9a'); findNote(); return; } }
      if (s === 6 && d(NT.saucer.position) < 3.2) { scareSaucer(); return; }
    }
    if (NT.lift && NT.lift.visible && d(NP.lift) < 3) { enterUpside(); return; }
    return _a();
  }; }
function scareSaucer() {
  const g = NT.saucer; NT.scared = 1.6;
  bubbleIn(twScene, player.pos.clone().add(new V3(0, 0.5, 0)), 'BŪŪŪ!', 2.6); setTimeout(() => bubbleIn(twScene, g.position, 'AAAAA!', 1.6), 300);
  tone(200, 0.4, { to: 900, type: 'sawtooth', vol: 0.06, lp: 2000, when: 0.3 }); shake = Math.max(shake, 0.2);
  setTimeout(() => { toast('Žmonės ateivių lėkštėje išsigando!', 'Iš lėkštės iškrito lapelis…', '#b0ff9a'); findNote(); }, 900);
}
// ---------- per frame ----------
{ const _u = updateTimeWorld; updateTimeWorld = (dt, t) => {
    _u(dt, t); if (!TW.built) return;
    const pp = player.pos;
    if (NT.note && NT.note.visible) NT.note.userData.spark.material.opacity = 0.2 + 0.2 * Math.sin(t * 4);
    // the blue clock stays in today's middle
    const bc = NT.blue; if (bc) { bc.m.position.x = clamp(bc.m.position.x, -20, 20); if (Math.abs(bc.m.position.x) >= 19.9) bc.fwd.x = -bc.fwd.x; }
    // thieves sneak around the bones; if you come running they flee
    const running = (keys.ShiftLeft || keys.ShiftRight) && (keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD);
    for (const th of NT.thieves) {
      const dist = Math.hypot(pp.x - th.m.position.x, pp.z - th.m.position.z);
      if (running && dist < 14 && th.flee <= 0) { th.flee = 4; th.fleeDir.set(th.m.position.x - pp.x, 0, th.m.position.z - pp.z).normalize(); bubbleIn(twScene, th.m.position, 'Bėgam!', 2.4); }
      if (th.flee > 0) { th.flee -= dt; th.m.position.addScaledVector(th.fleeDir, dt * 7); th.m.rotation.y = Math.atan2(th.fleeDir.x, th.fleeDir.z); }
      else { th.a += dt * 0.5; const tgt = th.home.clone().add(new V3(Math.cos(th.a) * 4, 0, Math.sin(th.a) * 4)); const dv = tgt.sub(th.m.position); th.m.position.addScaledVector(dv, Math.min(1, dt * 1.2)); th.m.rotation.y = Math.atan2(dv.x, dv.z); }
      th.m.position.x = clamp(th.m.position.x, -120, -30); th.m.position.z = clamp(th.m.position.z, -110, -30);
      th.m.userData.body.position.y = -0.25 + Math.abs(Math.sin(t * 6 + th.a)) * 0.05;   // crouching
    }
    // the saucer circles low over the future
    { const g = NT.saucer; NT.scared = Math.max(0, (NT.scared || 0) - dt); const a = t * 0.25; g.position.set(NP.saucerC.x + Math.cos(a) * 12, 3.4 + Math.sin(t * 2) * 0.2 + (NT.scared > 0 ? Math.sin(t * 30) * 0.3 : 0), NP.saucerC.z + Math.sin(a) * 12); g.rotation.y = t * 0.8; g.rotation.z = NT.scared > 0 ? Math.sin(t * 25) * 0.3 : 0; }
    if (NT.lift) NT.lift.rotation.y = 0;
    // prompts
    if (!card) {
      const d = p => Math.hypot(pp.x - p.x, pp.z - p.z); let txt = '';
      if (Q18.stage === 'hunt') {
        const s = Q18.step;
        if (NT.note && NT.note.visible && d(NT.note.position) < 2.2) txt = '<kbd>E</kbd> paimti lapelį';
        else if (s === 1 && d(NT.blue.m.position) < 2.6) txt = '<kbd>E</kbd> paklausti mėlyno laikroduko';
        else if (s === 5 && NT.thieves.some(th => d(th.m.position) < 2.4)) txt = '<kbd>E</kbd> tyliai ištraukti lapelį iš vagies kišenės';
        else if (s === 6 && d(NT.saucer.position) < 3.2) txt = '<kbd>E</kbd> išgąsdinti juos – BŪ!';
      }
      if (!txt && NT.lift && NT.lift.visible && d(NP.lift) < 3) txt = '<kbd>E</kbd> važiuoti liftu į kitą pasaulio pusę';
      if (txt) setPrompt(txt);
      else if ((Q18.stage === 'hunt' || Q18.stage === 'parts') && !nearClock() && !nearTimeGod() && !nearPastClock()) setPrompt(`📜 ${Q18.stage === 'hunt' ? `Lapelis ${Q18.step + 1}/${NOTE_N}` : 'Dalys'}: „${curClue()}“`);
    }
  }; }

// ================= the OTHER SIDE OF THE WORLD (everything upside down) =================
const udScene = new THREE.Scene(); udScene.background = new THREE.Color(0x14102e); udScene.fog = new THREE.Fog(0x14102e, 30, 120);
udScene.add(new THREE.AmbientLight(0xffffff, 0.6)); udScene.add(new THREE.HemisphereLight(0xc8d8ff, 0x4a3a6a, 0.6));
{ const l = new THREE.DirectionalLight(0xffffff, 0.6); l.position.set(10, 30, 10); udScene.add(l); }
const UD = { built: false, boxes: [], parts: null, door: null, doorOpen: false, stand: null };
function buildUpside() {
  if (UD.built) return; UD.built = true;
  const gm = mesh(new THREE.PlaneGeometry(40, 170), mat(0x3a2a5a, { roughness: 0.9 }), 0, 0, -65); gm.rotation.x = -Math.PI / 2; udScene.add(gm);
  udScene.add(S(G.box, mat(0x2a2a38), 6, 0.05, 160, 0, 0.03, -65));
  for (let z = 5; z > -135; z -= 6) udScene.add(S(G.box, bmat(0xffe14d), 0.15, 0.06, 2, 0, 0.06, z));
  { const sv = []; for (let i = 0; i < 900; i++) { const v = randDir(); v.y = Math.abs(v.y) + 0.05; v.normalize().multiplyScalar(rr(90, 140)); sv.push(v.x, v.y, v.z - 60); } const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3)); udScene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.2, color: 0xffffff, fog: false }))); }
  for (let i = 0; i < 14; i++) { const z = 0 - i * 10, side = i % 2 ? 1 : -1, h = makeEraHouse(i % 3); h.position.set(side * 11, 0, z); h.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; udScene.add(h); }
  for (let z = 0; z > -135; z -= 15) for (const sx of [-1, 1]) { udScene.add(S(G.cyl, mat(0x2a2a30), 0.08, 3, 0.08, sx * 5, 1.5, z)); udScene.add(S(G.sph, bmat(0xfff0b0), 0.25, 0.25, 0.25, sx * 5, 3.1, z)); }
  // the lift back
  { const g = new THREE.Group(); g.position.set(0, 0, 6); udScene.add(g); g.add(S(G.cyl, mat(0x3a3a48, { metalness: 0.7 }), 2, 0.3, 2, 0, 0.15, 0)); g.add(S(G.cyl, new THREE.MeshStandardMaterial({ color: 0x9af0ff, transparent: true, opacity: 0.3 }), 2, 6, 2, 0, 3, 0)); g.add(mesh(new THREE.PlaneGeometry(4, 0.8), new THREE.MeshBasicMaterial({ map: labelTex('LIFTAS ATGAL', '#3a3a48', '#5affff', 512, 100), side: THREE.DoubleSide }), 0, 6.6, 0)); }
  // the clock parts in the middle of the street
  { const g = new THREE.Group(); g.position.set(0, 0, -65); udScene.add(g); UD.parts = g; const gold = mat(0xffd23a, { metalness: 0.8, roughness: 0.25 });
    g.add(S(G.cyl, mat(0x5a4a6a), 1, 0.8, 1, 0, 0.4, 0));
    const gear = new THREE.Group(); gear.position.set(-0.35, 1.05, 0); g.add(gear); gear.add(mesh(new THREE.TorusGeometry(0.3, 0.08, 6, 16), gold)); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; gear.add(S(G.box, gold, 0.1, 0.1, 0.08, Math.cos(a) * 0.4, Math.sin(a) * 0.4, 0).rotateZ(a)); }
    for (let i = 0; i < 8; i++) g.add(mesh(new THREE.TorusGeometry(0.15, 0.03, 5, 12), mat(0xc8ccd6, { metalness: 0.8 }), 0.35, 0.85 + i * 0.07, 0).rotateX(Math.PI / 2));
    g.add(S(G.box, bmat(0x1a1008), 0.08, 0.8, 0.03, 0, 1.2, 0.35)); g.add(mesh(new THREE.CircleGeometry(0.35, 20), new THREE.MeshStandardMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.5 }), 0.1, 1.1, -0.35));
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffd23a, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(3); s.position.y = 1.1; g.add(s);
    UD.boxes.push({ x: 0, z: -65, hx: 1, hz: 1, h: 0.8 }); }
  // the little room at the end (nothing to see from outside – just a door)
  { const g = new THREE.Group(); g.position.set(0, 0, -140); udScene.add(g); const w = mat(0x4a3a6a, { roughness: 0.8 });
    g.add(S(G.box, w, 6, 3.6, 0.3, 0, 1.8, -3)); g.add(S(G.box, w, 0.3, 3.6, 6, -3, 1.8, 0)); g.add(S(G.box, w, 0.3, 3.6, 6, 3, 1.8, 0)); g.add(S(G.box, w, 6.3, 0.3, 6.3, 0, 3.7, 0));
    g.add(S(G.box, w, 2, 3.6, 0.3, -2, 1.8, 3)); g.add(S(G.box, w, 2, 3.6, 0.3, 2, 1.8, 3)); g.add(S(G.box, w, 2, 1, 0.3, 0, 3.1, 3));
    const door = new THREE.Group(); door.position.set(-1, 0, 3); g.add(door); door.add(S(G.box, mat(0x8a5a2b), 2, 2.6, 0.12, 1, 1.3, 0)); door.add(S(G.sph, mat(0xffd23a, { metalness: 0.8 }), 0.08, 0.08, 0.08, 1.75, 1.3, 0.1)); UD.door = door;
    for (const [x, z, hx, hz] of [[0, -143, 3, 0.3], [-3, -140, 0.3, 3], [3, -140, 0.3, 3], [-2, -137, 1, 0.3], [2, -137, 1, 0.3]]) UD.boxes.push({ x, z, hx, hz, h: 99 });
    UD.doorBox = { x: 0, z: -137, hx: 1, hz: 0.3, h: 99 }; UD.boxes.push(UD.doorBox);
    const l = new THREE.PointLight(0xffd8a0, 1, 7); l.position.set(0, 2.8, -140); udScene.add(l);
    const st = new THREE.Group(); st.position.set(0, 0, -141.5); udScene.add(st); UD.stand = st; st.add(S(G.cyl, mat(0x2a2a38), 0.6, 0.2, 0.6, 0, 0.1, 0));
    const man = makeMan(); man.position.y = 0.2; st.add(man); man.traverse(o => { if (o.isMesh && !o.material.isMeshBasicMaterial) o.material = mat(0x1a6a6a, { roughness: 0.5 }); }); addCeilBits(man.userData.parts.body); UD.man = man;
    st.visible = !Q18.suit; }
  linearize(udScene);
}
// the secret costume: an original "ceiling walker" suit (teal, orange suction cups, big goggles)
SKINS.push({ id: 'ceil', name: 'Lubų vaikščiotojas', desc: 'Žydras kostiumas su oranžiniais siurbtukais ir didžiuliais akiniais – kad galėtum vaikščioti aukštyn kojom. Rastas kitoje pasaulio pusėje.', price: -1, body: '#1a6a6a', hat: '#ff8a1a', secret: true, hint: 'Sako, jis guli mažame kambarėlyje kitoje pasaulio pusėje, ten kur viskas aukštyn kojom…' });
HATS.add('ceil');
{ const _eq = equipSkin; equipSkin = (id, quiet) => { _eq(id, quiet); if (skinNow === 'ceil') tintPlayer(0x1a6a6a, 0x0e4a4a); };
  const _bs = buildSkin; buildSkin = (id, g) => { _bs(id, g); if (id === 'ceil') addCeilBits(g); }; }
function addCeilBits(g) {
  const or = mat(0xff8a1a, { roughness: 0.5 }), gl = new THREE.MeshStandardMaterial({ color: 0x9af0ff, transparent: true, opacity: 0.6, metalness: 0.4, roughness: 0.05 });
  for (const x of [-0.12, 0.12]) { g.add(mesh(new THREE.TorusGeometry(0.11, 0.035, 6, 16), or, x, 1.88, 0.28)); g.add(mesh(new THREE.CircleGeometry(0.1, 14), gl, x, 1.88, 0.3)); }
  g.add(S(G.box, or, 0.6, 0.06, 0.04, 0, 1.92, -0.05).rotateY(Math.PI / 2));
  for (let i = 0; i < 3; i++) g.add(S(G.sph, or, 0.07, 0.07, 0.03, -0.09 + i * 0.09, 1.25, 0.22));
  g.add(S(G.cone, or, 0.12, 0.2, 0.03, 0, 1.05, 0.22).rotateZ(Math.PI));
  for (const x of [-0.18, 0.18]) g.add(S(G.cyl, or, 0.04, 0.5, 0.04, x, 1.3, 0.2));
  g.add(S(G.box, mat(0x0e4a4a), 0.36, 0.42, 0.14, 0, 1.3, -0.28)); for (const [x, y] of [[-0.1, 1.42], [0.1, 1.42], [-0.1, 1.2], [0.1, 1.2]]) g.add(S(G.cyl, or, 0.05, 0.04, 0.05, x, y, -0.36).rotateX(Math.PI / 2));
}
function enterUpside() {
  if (transitioning) return; transitioning = true; hideCard();
  tone(200, 1.2, { to: 60, type: 'sine', vol: 0.07 }); toast('Liftas leidžiasi… per visą pasaulį!', 'Kitoje pusėje viskas aukštyn kojom!', '#5affff');
  fadeTo(() => {
    transitioning = false; buildUpside(); mode = 'upside'; udScene.add(player.mesh);
    player.pos.set(0, 0, 2); player.fwd.set(0, 0, -1); player.vel.set(0, 0, 0); player.vr = 0; player.grounded = true;
    $('bName').textContent = 'Kita pasaulio pusė'; $('bEn').textContent = 'Aukštyn kojom'; $('bAtm').textContent = 'Čia viskas aukštyn kojom – tu vaikštai kaip voras lubomis. Dalys – gatvės viduryje.'; document.documentElement.style.setProperty('--biome', '#5affff');
    setTimeout(() => toast('Tu kitoje pasaulio pusėje!', 'Viskas aukštyn kojom – kaip voras ant lubų. Laikrodžio dalys – gatvės viduryje', '#5affff'), 500);
  });
}
function leaveUpside() {
  if (transitioning) return; transitioning = true; hideCard();
  fadeTo(() => { transitioning = false; mode = 'time'; twScene.add(player.mesh); player.pos.set(NP.lift.x - 3, 0, NP.lift.z); player.fwd.set(-1, 0, 0); player.vel.set(0, 0, 0); camera.up.set(0, 1, 0);
    $('bName').textContent = 'Laiko pasaulis'; $('bEn').textContent = 'Laiko Dievo namai'; $('bAtm').textContent = 'Kairėje – praeitis, dešinėje – ateitis. Gyventojai – laikrodžiai.'; document.documentElement.style.setProperty('--biome', '#b0ff9a');
    if (Q18.parts) toast('Grįžai su laikrodžio dalimis!', 'Nunešk jas Laiko Dievui', '#b0ff9a'); });
}
function upsideHand(side) { hands[side].hold = true; }
function upsideAction() {
  if (card) { if (card.kind === 'talk') advanceTalk(); else hideCard(); return; }
  const pp = player.pos;
  if (Math.hypot(pp.x, pp.z - 6) < 2.6) { leaveUpside(); return; }
  if (UD.parts.visible && Math.hypot(pp.x, pp.z + 65) < 2.4 && !Q18.parts) { Q18.parts = true; saveQ18(); UD.parts.visible = false; [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.06, when: i * 0.08 })); toast('Radai Praeities Laikrodžio DALIS!', 'Krumpliaratis, spyruoklė, stiklas ir rodyklė. Nunešk jas Laiko Dievui (liftas – gatvės pradžioje)', '#ffd23a'); return; }
  if (!UD.doorOpen && Math.hypot(pp.x, pp.z + 136) < 2.4) { UD.doorOpen = true; UD.boxes = UD.boxes.filter(b => b !== UD.doorBox); tone(300, 0.4, { to: 200, type: 'square', vol: 0.03, lp: 800 }); return; }
  if (UD.stand.visible && Math.hypot(pp.x, pp.z + 141.5) < 2) {
    UD.stand.visible = false; Q18.suit = true; saveQ18(); unlockSkin('ceil'); equipSkin('ceil', true);
    [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.4, { type: 'triangle', vol: 0.07, when: i * 0.09 }));
    toast('SLAPTAS KOSTIUMAS: LUBŲ VAIKŠČIOTOJAS!', 'Bet kur spausk X – atsidarys kostiumų parduotuvė', '#5affff'); return;
  }
}
function updateUpside(dt, t) {
  const f = player.down ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = player.down ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  _rt.crossVectors(player.fwd, UP); _mv.copy(player.fwd).multiplyScalar(f).addScaledVector(_rt, s); if (_mv.lengthSq() > 1) _mv.normalize();
  const sp = keys.ShiftLeft || keys.ShiftRight ? 9 : 5; _mv.multiplyScalar(sp);
  player.vel.lerp(_mv, Math.min(1, (player.grounded ? 10 : 3) * dt));
  if (keys.Space && player.grounded) { player.vr = 7; player.grounded = false; sfx.jump(); }
  player.vr -= 20 * dt; player.pos.addScaledVector(player.vel, dt); player.pos.y += player.vr * dt;
  let ground = 0; const rad = 0.4;
  for (const b of UD.boxes) { const dx = player.pos.x - b.x, dz = player.pos.z - b.z, ex = b.hx + rad - Math.abs(dx), ez = b.hz + rad - Math.abs(dz); if (ex <= 0 || ez <= 0) continue; if (player.pos.y >= b.h - 0.5) { if (b.h > ground) ground = b.h; } else if (ex < ez) player.pos.x += dx < 0 ? -ex : ex; else player.pos.z += dz < 0 ? -ez : ez; }
  if (player.pos.y <= ground) { player.pos.y = ground; if (player.vr < 0) player.vr = 0; player.grounded = true; } else player.grounded = false;
  player.pos.x = clamp(player.pos.x, -7, 7); player.pos.z = clamp(player.pos.z, -144, 8);
  player.mesh.position.copy(player.pos); orient(player.mesh, UP, player.fwd);
  animateMan(dt, f !== 0 || s !== 0, sp);
  // the view does NOT turn the right way up: the whole world hangs over you, and you walk like a spider on the ceiling
  const dist = 6, pitch = 0.35;
  _ct.copy(player.pos).addScaledVector(UP, 1.6 + Math.sin(pitch) * dist).addScaledVector(player.fwd, -Math.cos(pitch) * dist);
  camera.position.lerp(_ct, Math.min(1, dt * 8)); camera.up.set(0, -1, 0); camera.lookAt(player.pos.clone().add(new V3(0, 1.2, 0)));
  if (UD.parts && UD.parts.visible) UD.parts.children[1].rotation.z = t;
  UD.door.rotation.y += ((UD.doorOpen ? -1.6 : 0) - UD.door.rotation.y) * Math.min(1, dt * 4);
  let txt = '';
  if (!card) {
    const pp = player.pos;
    if (Math.hypot(pp.x, pp.z - 6) < 2.6) txt = '<kbd>E</kbd> važiuoti liftu atgal';
    else if (UD.parts.visible && Math.hypot(pp.x, pp.z + 65) < 2.4) txt = '<kbd>E</kbd> paimti laikrodžio dalis';
    else if (!UD.doorOpen && Math.hypot(pp.x, pp.z + 136) < 2.4) txt = '<kbd>E</kbd> atidaryti duris';
    else if (UD.stand.visible && Math.hypot(pp.x, pp.z + 141.5) < 2) txt = '<kbd>E</kbd> paimti slaptą kostiumą';
    else txt = Q18.parts ? 'Dalys tavo! Liftas atgal – gatvės pradžioje' : 'Viskas aukštyn kojom… Dalys – gatvės viduryje';
  }
  setPrompt(txt);
}
// ---------- the Time God fixes the clock with a hammer – and everybody travels into the past ----------
function fixPastClock() {
  Q18.parts = false; Q18.stage = 'fixing'; saveQ18();
  const hammer = new THREE.Group(); const wood = mat(0x6a4426), iron = mat(0x5a5a62, { metalness: 0.7, roughness: 0.3 });
  hammer.add(S(G.cyl, wood, 0.3, 6, 0.3, 0, 3, 0)); hammer.add(S(G.box, iron, 2.6, 1.3, 1.3, 0, 6.2, 0));
  const piv = new THREE.Group(); piv.position.set(-9, 9, -22); twScene.add(piv); piv.add(hammer); hammer.rotation.z = Math.PI / 2; linearize(piv);
  let t = 0, hits = 0;
  cinema = dt => {
    t += dt; const ph = (t % 1.1) / 1.1;
    piv.rotation.z = ph < 0.6 ? -0.9 + ph * 1.5 : 0.0 - (ph - 0.6) * 1.8;
    if (ph > 0.55 && ph < 0.6 && hits < Math.floor(t / 1.1) + 1 && hits < 4) {
      hits++; shake = Math.max(shake, 0.5); noiseHit(0.25, { f: 1800, fto: 300, vol: 0.25 }); tone(220, 0.2, { to: 110, type: 'square', vol: 0.08, lp: 1500 });
      const p = TW.past.position.clone().add(new V3(1, 11, 1.8)); for (let i = 0; i < 10; i++) { const sp2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffd23a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp2.scale.setScalar(0.6); sp2.position.copy(p); twScene.add(sp2); const v = randDir().multiplyScalar(6); let k = 0; fx.push(d2 => { k += d2; sp2.position.addScaledVector(v, d2); sp2.material.opacity = Math.max(0, 1 - k * 2); if (k > 0.5) { twScene.remove(sp2); return false; } return true; }); }
      bubbleIn(twScene, TW.god.position.clone().add(new V3(0, 20, 0)), pick(['BANG!', 'DUNK!', 'BUM!', 'TIK!']), 1);
      if (hits === 4) TW.past.children.forEach(o => { if (o.isMesh && o.material && o.material.color && o.material.color.getHex() === 0x1a1008 && o.geometry === G.box) o.visible = false; });
    }
    camera.position.lerp(_ct.set(-2, 10, -4), Math.min(1, dt * 2)); camera.up.set(0, 1, 0); camera.lookAt(-14, 9, -25);
    if (t > 4.6) {
      TW.warn.material.color.setHex(0x5aff8a); TW.pastFace.userData.min.rotation.z += dt * 30; TW.pastFace.userData.hour.rotation.z += dt * 3;
      if (t > 4.6 && !NT.ticked) { NT.ticked = true; [1000, 1400, 1000, 1400].forEach((f, i) => tone(f, 0.05, { type: 'square', vol: 0.05, lp: 3000, when: i * 0.3 })); bubbleIn(twScene, TW.past.position.clone().add(new V3(0, 17, 2)), 'TIK TAK!', 1.4); }
    }
    if (t > 7 && !transitioning) {
      transitioning = true; piv.parent && twScene.remove(piv);
      tone(1200, 1.6, { to: 120, type: 'sine', vol: 0.08 }); redFlash('rgba(255,255,255,.9)', 1500);
      fadeTo(() => { transitioning = false; cinema = null; Q18.stage = 'done'; saveQ18(); makeWorldPast(); addMoney(3000); player.pos.set(0, 0, -10); player.fwd.set(0, 0, -1);
        bigBanner('VISI NUKELIAVOTE Į PRAEITĮ!', 'Praeities Laikrodis vėl eina. Apdovanojimas: 3000 €');
        setTimeout(() => startTalk('Laiko Dievas', ['TIK TAK! Laikrodis vėl eina – ir žiūrėk: mes visi PRAEITYJE!', 'Seni nameliai, senos mašinos… Mano laikrodukai vėl gali aplankyti savo senelius. Ačiū tau!'], '#b0ff9a'), 1800);
      });
    }
  };
}
function makeWorldPast() {
  if (!TW.built || TW.isPast) return; TW.isPast = true;
  twScene.background.setHex(0x7a5a3a); twScene.fog.color.setHex(0x8a6a4a);
  { const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'); x.fillStyle = '#c0a070'; x.fillRect(0, 0, 512, 512); for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${120 + Math.random() * 60},${90 + Math.random() * 40},50,.35)`; x.fillRect(Math.random() * 512, Math.random() * 512, 6, 3); } const tx = new THREE.CanvasTexture(c); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(4, 4); TW.ground.material.map = tx; TW.ground.material.needsUpdate = true; }
  for (const hh of TW.houses) if (hh.era !== 0) { const n = makeEraHouse(0); n.position.copy(hh.h.position); n.rotation.copy(hh.h.rotation); twScene.remove(hh.h); twScene.add(n); linearize(n); hh.h = n; hh.era = 0; }
  for (const tw of TW.towers) twScene.remove(tw);
  for (const c of TW.cars) if (c.era !== 0) { const n = makeEraCar(0, pick([0x1a1a1a, 0x3a2a1a, 0x2a3a2a])); twScene.remove(c.m); twScene.add(n); linearize(n); c.m = n; c.era = 0; c.sp = 0.03; }
  if (NT.wreck) NT.wreck.visible = false; if (NT.saucer) NT.saucer.visible = false; if (NT.lift) NT.lift.visible = false;
  if (TW.warn) TW.warn.material.color.setHex(0x5aff8a);
  TW.past.children.forEach(o => { if (o.isMesh && o.material && o.material.color && o.material.color.getHex() === 0x1a1008 && o.geometry === G.box) o.visible = false; });
  $('bAtm').textContent = 'Visi nukeliavome į praeitį! Seni nameliai, senos mašinos, o laikrodžiai vėl tiksi.';
}
{ const _b2 = buildTimeWorld; buildTimeWorld = () => { const first = !TW.built; _b2(); if (first && Q18.stage === 'done') makeWorldPast(); if (first && Q18.stage === 'fixing') { Q18.stage = 'parts'; Q18.parts = true; saveQ18(); } }; }
function notesTest(n) {
  if (mode !== 'time') { hideCard(); enterTime(); }
  Q18.stage = 'hunt'; Q18.step = clamp(n | 0, 0, NOTE_N); Q18.parts = false; if (Q18.step >= NOTE_N) Q18.stage = 'parts'; saveQ18(); refreshNotes();
  toast('Bandymų pasaulis: lapelių paieška', `Lapelis ${Q18.step + 1}: „${curClue()}“`, '#ffd23a');
}
