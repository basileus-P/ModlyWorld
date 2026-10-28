// ================= God's first command: "Save the chicks" =================
const QUEST = { stage: 'none', delivered: [] };     // stage: none | active | done
try { const q = JSON.parse(localStorage.getItem('modly-quest1') || 'null'); if (q && q.stage) { QUEST.stage = q.stage; QUEST.delivered = q.delivered || []; } } catch (_) { }
function saveQuest() { try { localStorage.setItem('modly-quest1', JSON.stringify({ stage: QUEST.stage, delivered: QUEST.delivered })); } catch (_) { } }

const COMMAND_LINES = [
  'Bet prieš duodamas tau užduotis, turiu įsitikinti. Tai – išbandymas. Ar tikrai teisingai tave pasirinkau?',
  'Pirmasis įsakymas: IŠGELBĖK VIŠČIUKUS. Demono chaosas išsklaidė septynis mažus viščiukus po visą pasaulį – po vieną kiekviename biome.',
  'Jų mama višta atbėgo čia, pas mane, ir verkia jau tris dienas. Surask visus septynis ir atnešk juos jai.',
  'Nebijok – juos rasti lengva. Kiekvienas sėdi prie kelio, o virš jo į dangų šviečia geltonas šviesos stulpas.',
  'Eik. Aš stebėsiu.'
];
const STATUS_LINES = () => [`Višta vis dar laukia. Atnešei ${QUEST.delivered.length} iš 7 viščiukų.`, 'Rodyklė ekrano viršuje parodys kelią iki artimiausio. Klausyk, kaip jie cypsi.'];
const DONE_LINES = [
  'Visi septyni. Višta vėl laiminga, o aš… aš nusišypsojau pirmą kartą nuo tada, kai atėjo demonas.',
  'Tu išlaikei išbandymą. Dabar žinau, kad pasirinkau teisingai.',
  'Kitas įsakymas bus sunkesnis. Kai būsi pasiruošęs – grįžk.'
];
let creatorLines = [];
function creatorTalkLines() {
  if (QUEST.stage === 'none') return CREATOR_LINES.slice(0, -1).concat(COMMAND_LINES);
  if (QUEST.stage === 'active') return STATUS_LINES();
  // after the chicks: the second command, five minutes later
  if (Q2.stage === 'none') {
    const left = q2WaitLeft();
    if (left > 0) { const m = Math.ceil(left / 60000); return DONE_LINES.concat([`Ateik po ${m} ${m === 1 ? 'minutės' : 'minučių'} – tada duosiu tau antrąjį įsakymą.`]); }
    return Q2_LINES;
  }
  if (Q2.stage === 'rocket' || Q2.stage === 'horn') return Q2_STATUS();
  if (Q4.stage !== 'none') return Q4_LINES();
  if (Q3.stage !== 'none') return Q3.stage === 'done' ? Q2_DONE.slice(0, 1).concat(Q3_STATUS()) : Q3_STATUS();
  return Q2_DONE;
}
function onCreatorTalkEnd() {
  if (QUEST.stage === 'none') { startQuest(); return; }
  if (QUEST.stage === 'done' && Q2.stage === 'none' && q2WaitLeft() <= 0) {
    Q2.stage = 'rocket'; saveQ2();
    [330, 392, 494, 659].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.07, when: i * 0.15 }));
    toast('Įsakymas #2: Demono ragas', 'Nueik prie raketos Begalinėje Dykumoje ir skrisk į Marsą', '#ffe98a');
  }
  return q4TalkEnd() || q7TalkEnd() || q8TalkEnd() || q10TalkEnd() || q11TalkEnd() || q12TalkEnd() || q13TalkEnd() || q14TalkEnd();
}

// ---------- the chicks ----------
const chicks = [];
function makeChick() {
  const g = new THREE.Group(), y = mat(0xffd84a, { roughness: 0.9 }), o = mat(0xff9f1c);
  const body = new THREE.Group(); g.add(body);
  body.add(S(G.sph, y, 0.24, 0.22, 0.26, 0, 0.3, 0));
  body.add(S(G.sph, y, 0.16, 0.16, 0.16, 0, 0.55, 0.12));
  { const _o = S(G.cone, o, 0.05, 0.1, 0.05, 0, 0.53, 0.3); _o.rotation.x = Math.PI / 2; body.add(_o); }
  for (const x of [-0.07, 0.07]) body.add(S(G.sph, bmat(0x111111), 0.03, 0.035, 0.02, x, 0.6, 0.26));
  for (const x of [-1, 1]) { const w = S(G.sph, y, 0.06, 0.12, 0.14, x * 0.23, 0.32, -0.02); w.rotation.z = x * 0.4; body.add(w); }
  body.add(S(G.sph, y, 0.05, 0.07, 0.05, 0, 0.73, 0.1));
  for (const x of [-0.08, 0.08]) body.add(S(G.cyl, o, 0.015, 0.12, 0.015, x, 0.06, 0));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffe066, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 }));
  glow.scale.setScalar(1.6); glow.position.y = 1.1; g.add(glow);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 60, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
  beam.position.y = 30.5; g.add(beam); body.scale.setScalar(1.6);
  g.userData = { body, glow, beam };
  return g;
}
function peep(pos, loud) {
  const v = loud ? 0.06 : clamp(0.05 * distVol(pos) * 1.5, 0, 0.05); if (v < 0.004) return;
  tone(2300, 0.07, { to: 2900, type: 'sine', vol: v }); tone(2500, 0.07, { to: 3100, type: 'sine', vol: v, when: 0.12 });
}
// ---------- the hopping mushroom chick ----------
const _hp1 = new V3(), _hp2 = new V3();
function capPoint(s) { return [s.dir.clone(), R + groundH(s.dir)]; }
function hopperPos(hp) {
  if (!hp.flying) return capPoint(hp.cur);
  const k = clamp(hp.t / (hp.dur || 1.2), 0, 1), [a, ha] = capPoint(hp.from), [b, hb] = capPoint(hp.cur);
  const d = a.clone().lerp(b, k).normalize(), h = Math.max(lerp(ha, hb, k), R + groundH(d)) + Math.abs(Math.sin(k * Math.PI * 6)) * 0.35;
  return [d, h];
}
function hopAway(c, hp, scared) {
  const [here] = capPoint(hp.cur);
  // choose another cap not too far and not too near; when scared, prefer one away from the player
  let opts = hp.caps.filter(s => s !== hp.cur && s.dir.angleTo(here) * R > 6 && s.dir.angleTo(here) * R < 45);
  if (!opts.length) opts = hp.caps.filter(s => s !== hp.cur);
  if (scared) { const pd = player.pos.clone().normalize(), away = opts.filter(s => s.dir.angleTo(pd) > hp.cur.dir.angleTo(pd)); if (away.length) opts = away; }
  hp.from = hp.cur; hp.cur = pick(opts); hp.flying = true; hp.t = 0; hp.hops++; hp.dur = Math.max(1.2, hp.from.dir.angleTo(hp.cur.dir) * R / 9);
  peep(c.pos, true); petBubble({ pos: c.pos, up: c.up, def: { id: 'chick' } }, scared ? pick(['Nepagausi!', 'Cyp cyp!', 'Ha ha!', 'Slepiuosi!']) : 'Cyp!');
  for (let i = 0; i < 3; i++) tone(900 + i * 300, 0.08, { to: 1600 + i * 300, type: 'triangle', vol: 0.04, when: i * 0.06 });
}
function updateHopper(c, hp, dt) {
  if (hp.flying) { hp.t += dt; if (hp.t >= (hp.dur || 1.2)) { hp.flying = false; hp.rest = rr(3.5, 5.5); hp.wait = rr(12, 20); } return; }
  hp.rest -= dt; hp.wait -= dt;
  const near = c.pos.distanceTo(player.pos) < 5.5;
  // it gets scared when you come close, but only after catching its breath (so you can grab it if you're quick)
  if (near && hp.rest <= 0) hopAway(c, hp, true);
  else if (hp.wait <= 0) hopAway(c, hp, false);
}
// the seven hiding places, one per biome, mostly somewhere you have to climb
function chickSpots() {
  // easy mode: every chick sits on the ground right beside a road, in plain view
  const spots = [];
  const NAMES = ['Pradžios Miesto aikštėje', 'prie kelio Dykumoje', 'prie kelio Ledo Saloje', 'prie kelio Grybų Karalystėje', 'prie kelio Raudonojoje Dykumoje', 'prie kelio Džiunglėse', 'prie kelio Pikselių Pasaulyje'];
  for (let b = 0; b < NB; b++) {
    let d = null;
    if (b === 0) d = cityDir(5, 7);
    else {
      let best = null, bs = -1e9;
      for (const path of roadPaths) for (const x of path.s) {
        if (x.bridge) continue; weights(x.d.x, x.d.y, x.d.z, W); if (W[b] < 0.8) continue;
        const sc = x.d.dot(BC[b]); if (sc > bs) { bs = sc; best = x; }
      }
      if (best) { d = moveAlong(best.d, best.side, ROAD_HALF + 1.6); if (TH(d) < 0.2) d = moveAlong(best.d, best.side, -(ROAD_HALF + 1.6)); }
      if (!d) d = dirIn(b, 0.85, x => TH(x) > 0.3) || BC[b];
    }
    const dd = d.clone();
    spots.push({ where: NAMES[b], fixed: () => [dd.clone(), R + groundH(dd)] });
  }
  return spots;
}

function buildChicks() {
  const sp = chickSpots();
  sp.forEach((spot, i) => {
    const m = makeChick(); world.add(m);
    const c = { i, spot, mesh: m, state: QUEST.delivered.includes(i) ? 'delivered' : 'waiting', pos: new V3(), up: new V3(0, 1, 0), fwd: new V3(1, 0, 0), hop: rnd() * 6, peepT: rr(1, 5) };
    m.visible = c.state === 'waiting' && QUEST.stage !== 'none';
    chicks.push(c);
  });
  buildHen();
}
function startQuest() {
  QUEST.stage = 'active'; saveQuest();
  chicks.forEach(c => { if (c.state === 'waiting') c.mesh.visible = true; });
  hen.g.visible = true;
  [392, 494, 587, 784].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.07, when: i * 0.15 }));
  toast('Įsakymas #1: Išgelbėk viščiukus', 'Surask 7 viščiukus – po vieną kiekviename biome – ir atnešk vištai čia, Kūrėjo Salėje', '#ffe98a');
}
function nearestWaitingChick(from) { let b = null, bd = 1e9; for (const c of chicks) if (c.state === 'waiting') { const d = c.pos.distanceTo(from); if (d < bd) { bd = d; b = c; } } return b; }
function followers() { return chicks.filter(c => c.state === 'following'); }
const _cq = new V3();
function updateChicks(dt, t) {
  if (QUEST.stage !== 'active') { updateQuestHud(); return; }
  const lead = player.inCar && ride ? ride : player;
  let prev = lead, k = 0;
  for (const c of chicks) {
    const ud = c.mesh.userData;
    if (c.state === 'waiting') {
      if (c.spot.hopper) updateHopper(c, c.spot.hopper, dt);
      const [d, top] = c.spot.fixed();
      c.up.copy(d); c.pos.copy(d).multiplyScalar(top);
      c.hop += dt; c.mesh.position.copy(c.pos).addScaledVector(d, Math.max(0, Math.sin(c.hop * 5)) * 0.15);
      c.fwd.applyAxisAngle(d, dt * 0.6).addScaledVector(d, -c.fwd.dot(d)).normalize(); orient(c.mesh, d, c.fwd);
      ud.glow.material.opacity = 0.5 + 0.35 * Math.sin(t * 3 + c.i);
      c.peepT -= dt; if (c.peepT < 0) { c.peepT = rr(2.5, 5); if (c.pos.distanceTo(player.pos) < 70) { peep(c.pos); petBubble({ pos: c.pos, up: c.up, def: { id: 'chick' } }, 'Cyp!'); } }
    } else if (c.state === 'following') {
      // a little line of chicks trotting after you
      const gap = k === 0 ? 1.6 : 0.9; k++;
      const target = prev.pos.clone().addScaledVector(prev.fwd || player.fwd, -gap);
      if (c.pos.distanceTo(target) > 25) c.pos.copy(target);
      const step = Math.min(1, dt * 6); c.pos.lerp(target, step);
      const d = c.pos.clone().normalize(); c.up.copy(d); c.pos.copy(d).multiplyScalar(R + groundH(d));
      _cq.copy(target).sub(c.pos); if (_cq.lengthSq() > 0.01) c.fwd.copy(tangentToward(d, target));
      c.hop += dt * 12; c.mesh.position.copy(c.pos).addScaledVector(d, Math.abs(Math.sin(c.hop)) * 0.1); orient(c.mesh, d, c.fwd);
      ud.glow.material.opacity = 0; if (ud.beam) ud.beam.visible = false;
      prev = c;
    }
  }
  // HUD: arrow to the nearest chick still waiting
  updateQuestHud();
}
function pickChick(c) {
  c.state = 'following'; c.pos.copy(c.mesh.position); peep(c.pos, true);
  const n = followers().length;
  toast(`Viščiukas rastas ${c.spot.where}!`, `Jis seka paskui tave. Su tavimi: ${n}. Nuvesk juos vištai į Kūrėjo Salę (pro vartus aikštėje)`, '#ffd84a');
}
function nearestChickToPick() { let b = null, bd = 3.5; for (const c of chicks) if (c.state === 'waiting' && !(c.spot.hopper && c.spot.hopper.flying)) { const d = c.pos.distanceTo(player.pos); if (d < bd) { bd = d; b = c; } } return b; }

// ---------- the hen in the Sanctum ----------
const hen = { g: null, chicks: [], pos: new V3(-7, 0, -6) };
function buildHen() {
  const g = ANIMALS.find(a => a.id === 'chicken').make(); g.scale.setScalar(1.5); g.position.copy(hen.pos); g.rotation.y = 0.6; sanc.add(g); hen.g = g;
  const nest = S(G.cyl, mat(0xb08a50, { roughness: 1 }), 1.6, 0.25, 1.6, hen.pos.x, 0.12, hen.pos.z); sanc.add(nest);
  hen.nest = nest;
  g.visible = QUEST.stage !== 'none'; nest.visible = g.visible;
  for (const i of QUEST.delivered) addChickToHen(i, true);
  linearize(sanc);
}
function addChickToHen(i, quiet) {
  const m = makeChick(); m.userData.glow.visible = false; m.userData.beam.visible = false; m.scale.setScalar(0.8);
  const a = hen.chicks.length / 7 * Math.PI * 2; m.position.set(hen.pos.x + Math.cos(a) * 1.4, 0.2, hen.pos.z + Math.sin(a) * 1.4); m.rotation.y = -a + Math.PI / 2;
  sanc.add(m); linearize(m); hen.chicks.push(m);
}
// following chicks come with you into the Sanctum (and back)
const sancFollowers = [];
function chicksEnterSanctum() {
  for (const m of sancFollowers) sanc.remove(m); sancFollowers.length = 0;
  for (const c of followers()) { const m = makeChick(); m.userData.glow.visible = false; m.userData.beam.visible = false; m.userData.chick = c; sanc.add(m); linearize(m); sancFollowers.push(m); m.position.set(rr(-1, 1), 0, 16); }
}
function updateSanctumChicks(dt, t) {
  if (hen.g && hen.g.visible) { hen.g.userData.head.position.z = 0.22 + Math.max(0, Math.sin(t * 5)) * 0.06; }
  let prev = player.pos.clone(), pf = player.fwd;
  sancFollowers.forEach((m, k) => {
    const target = prev.clone().addScaledVector(pf, -(k === 0 ? 1.6 : 0.9)); m.position.lerp(target, Math.min(1, dt * 6)); m.position.y = Math.abs(Math.sin(t * 12 + k)) * 0.1;
    const dx = target.x - m.position.x, dz = target.z - m.position.z; if (dx * dx + dz * dz > 0.001) m.rotation.y = Math.atan2(dx, dz);
    prev = m.position.clone(); pf = new V3(Math.sin(m.rotation.y), 0, Math.cos(m.rotation.y));
  });
  hen.chicks.forEach((m, k) => { m.position.y = 0.2 + Math.abs(Math.sin(t * 3 + k)) * 0.05; });
}
function nearHen() { return hen.g && hen.g.visible && Math.hypot(player.pos.x - hen.pos.x, player.pos.z - hen.pos.z) < 3.8; }
function deliverChicks() {
  const fol = followers(); if (!fol.length) { toast('Višta liūdi', `Atnešta ${QUEST.delivered.length} iš 7. Ieškok viščiukų biomuose`, '#ffd84a'); grunt(600, 400, 0.2, 0.04); return; }
  for (const c of fol) { c.state = 'delivered'; c.mesh.visible = false; QUEST.delivered.push(c.i); addChickToHen(c.i); }
  for (const m of sancFollowers) sanc.remove(m); sancFollowers.length = 0;
  saveQuest();
  for (let i = 0; i < 3; i++) tone(700 + i * 80, 0.09, { to: 500, type: 'square', vol: 0.04, lp: 2200, when: i * 0.11 });
  setTimeout(() => peep(player.pos, true), 300);
  if (QUEST.delivered.length >= 7) {
    QUEST.stage = 'done'; saveQuest(); addMoney(150); markQ1Done();
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.6, { type: 'triangle', vol: 0.07, when: i * 0.12 }));
    toast('Įsakymas įvykdytas!', 'Visi 7 viščiukai pas mamą. Kūrėjas nori su tavimi pasikalbėti. Apdovanojimas: 150 €', '#ffe98a');
    $('questChip').hidden = true;
  } else toast(`Atnešta ${QUEST.delivered.length} iš 7`, 'Višta laiminga! Bet dar trūksta ' + (7 - QUEST.delivered.length), '#ffd84a');
}

// ---------- quest HUD and mini globe dots ----------
const chickDots = [];
function updateQuestHud() {
  const el = $('questChip'); if (!el) return;
  if (QUEST.stage !== 'active') { updateQ2Hud(el); return; }
  el.hidden = false;
  const fol = followers().length, left = 7 - QUEST.delivered.length - fol;
  let arrow = '', dist = '';
  if (mode === 'planet' && left > 0) {
    const c = nearestWaitingChick(player.pos);
    if (c) {
      const up = player.up, to = c.pos.clone().sub(player.pos); to.addScaledVector(up, -to.dot(up)).normalize();
      const cf = new V3(); camera.getWorldDirection(cf); cf.addScaledVector(up, -cf.dot(up)).normalize();
      const right = new V3().crossVectors(cf, up);
      const ang = Math.atan2(to.dot(right), to.dot(cf));
      arrow = `<span class="qarrow" style="transform:rotate(${ang}rad)">▲</span>`;
      dist = ` · ${Math.round(c.pos.distanceTo(player.pos))} m`;
    }
  }
  el.innerHTML = `${arrow}<div><div class="qt">Įsakymas #1: Išgelbėk viščiukus</div><div class="qs">Pas vištą: <b>${QUEST.delivered.length}/7</b> · seka paskui: <b>${fol}</b>${dist}</div></div>`;
  // mini globe
  while (chickDots.length < chicks.length) { const m = mesh(G.sph, bmat(0xffd84a)); m.scale.setScalar(2.4); miniScene.add(m); chickDots.push(m); }
  chicks.forEach((c, i) => { chickDots[i].visible = c.state === 'waiting' && mode !== 'sanctum'; chickDots[i].position.copy(c.pos).normalize().multiplyScalar(R + 6); });
}

function arrowTo(target) {
  const up = player.up, to = target.clone().sub(player.pos); to.addScaledVector(up, -to.dot(up)).normalize();
  const cf = new V3(); camera.getWorldDirection(cf); cf.addScaledVector(up, -cf.dot(up)).normalize();
  const right = new V3().crossVectors(cf, up);
  return `<span class="qarrow" style="transform:rotate(${Math.atan2(to.dot(right), to.dot(cf))}rad)">▲</span>`;
}
let q2Dot = null;
function updateQ2Hud(el) {
  if (!q2Dot) { q2Dot = mesh(G.sph, bmat(0xff5a3a)); q2Dot.scale.setScalar(3); miniScene.add(q2Dot); }
  q2Dot.visible = false;
  if (Q2.stage !== 'rocket' && Q2.stage !== 'horn') { updateQ3Hud(el); return; }
  el.hidden = false;
  let step = '', arrow = '', dist = '';
  if (mode === 'mars') step = Q2.stage === 'horn' ? 'Grįžk į raketą ir skrisk namo' : !Q2.dinosDone ? 'Nugalėk dinozauriukus pilies kieme' : 'Tyliai paimk ragą drakono kambaryje';
  else {
    const target = Q2.stage === 'horn' ? (museum && museum.g.position) : (desertRocket && desertRocket.g.position);
    step = Q2.stage === 'horn' ? 'Nunešk ragą į muziejų Pradžios Mieste' : 'Nueik prie raketos Begalinėje Dykumoje';
    if (target && mode === 'planet') { arrow = arrowTo(target); dist = ` · ${Math.round(target.distanceTo(player.pos))} m`; q2Dot.visible = true; q2Dot.position.copy(target).normalize().multiplyScalar(R + 7); }
  }
  el.innerHTML = `${arrow}<div><div class="qt">Įsakymas #2: Demono ragas</div><div class="qs">${step}${dist}</div></div>`;
}

function updateQ3Hud(el) {
  if (Q3.stage === 'none' || Q3.stage === 'done') { updateQ4Hud(el); return; }
  el.hidden = false;
  let step = '', arrow = '', dist = '';
  if (mode === 'cave') step = Q3.stage === 'go' ? 'Surask Senąjį Vorą – eik tiesiai' : Q3.stage === 'find' ? (CV.girlState === 'following' ? 'Nuvesk Voratinklę pas tėtį' : 'Surask Voratinklę – kairėje, giliausiame kampe') : 'Grįžk liftu aukštyn';
  else if (mode === 'caphouse') step = Q3.stage === 'go' ? 'Leiskis liftu į požemius' : Q3.stage === 'fly' ? 'Išeik ir nunešk musę į muziejų' : 'Leiskis liftu į požemius';
  else {
    const target = Q3.stage === 'fly' ? (museum && museum.g.position) : (capHouse && capHouse.door);
    step = Q3.stage === 'fly' ? 'Nunešk musę į muziejų Pradžios Mieste' : 'Užlipk ant Didžiojo Grybo – durys pačioje kepurėje';
    if (target && mode === 'planet') { arrow = arrowTo(target); dist = ` · ${Math.round(target.distanceTo(player.pos))} m`; if (q2Dot) { q2Dot.visible = true; q2Dot.position.copy(target).normalize().multiplyScalar(R + 7); } }
  }
  el.innerHTML = `${arrow}<div><div class="qt">Įsakymas #3: Slaptas voras</div><div class="qs">${step}${dist}</div></div>`;
}
