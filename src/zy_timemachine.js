// ================= Command #8: "The Time Machine" =================
// help 10 villagers (each gives a red metal part, plus a hammer and nails) → TYPE to the Creator yourself and ask
// politely: "prašau duok kompiuterį" → put every part in the right place on the blueprint → hammer it together →
// a small copy of the time machine goes to the museum
const Q10 = { stage: 'none', done: [], cur: null, carry: false };   // none | people | chat | build | mini | done
try { const s = JSON.parse(localStorage.getItem('modly-quest10') || 'null'); if (s) { Object.assign(Q10, s); Q10.cur = null; Q10.carry = false; } } catch (_) { }
function saveQ10() { try { localStorage.setItem('modly-quest10', JSON.stringify({ stage: Q10.stage, done: Q10.done })); } catch (_) { } }
const q10Active = () => Q10.stage !== 'none' && Q10.stage !== 'done';
const Q10_GIVE = [
  'Atėjo laikas didžiausiam darbui. Naujas įsakymas: LAIKO MAŠINA. Su ja kada nors grįšime į laiką prieš demoną.',
  'Mašinai reikia dešimties raudono metalo gabalų. Juos turi mano pasaulio gyventojai – padėk dešimčiai žmonių, ir kiekvienas tau duos po gabalą.',
  'O kai surinksi viską – ateik pas mane. Bet šį kartą nekalbėsiu taip, kaip visada. Turėsi man PARAŠYTI pats. Ir nepamiršk, kaip mandagiai prašoma.'
];
function Q10_LINES() {
  if (Q10.stage === 'people') return [`Padėjai ${Q10.done.length} iš 10 žmonių. Ieškok tų, virš kurių galvos šviečia geltonas šauktukas.`];
  if (Q10.stage === 'mini') return ['Laiko mašina stovi mano salėje. Mažą jos kopiją nunešk į muziejų.'];
  if (Q10.stage === 'done') { const fin = ['Laiko mašina paruošta. Ačiū tau, mažasis meistre.']; return Q11.stage === 'none' ? fin.concat(Q11_GIVE) : (Q11_LINES() || fin); }
  return null;
}
function q10TalkEnd() {
  if (Q10.stage !== 'none' || Q8.stage !== 'done') return false;
  Q10.stage = 'people'; saveQ10(); refreshVillagers();
  [262, 330, 392, 523, 659].forEach((f, i) => tone(f, 0.4, { type: 'triangle', vol: 0.06, when: i * 0.12 }));
  toast('Įsakymas #8: Laiko mašina', 'Padėk 10 žmonių – virš jų galvų šviečia geltonas šauktukas', '#ff6b4a');
  return true;
}

// ---------- the 10 villagers and their little jobs ----------
const PARTS = [
  { id: 'wheel1', name: 'Ratas', path: '<circle cx="50" cy="50" r="38" fill="#e8262e"/><circle cx="50" cy="50" r="14" fill="#7a1010"/>' },
  { id: 'wheel2', name: 'Ratas', path: '<circle cx="50" cy="50" r="38" fill="#e8262e"/><circle cx="50" cy="50" r="14" fill="#7a1010"/>' },
  { id: 'door', name: 'Durys', path: '<rect x="25" y="8" width="50" height="84" rx="6" fill="#e8262e"/><circle cx="66" cy="52" r="5" fill="#ffd23a"/>' },
  { id: 'roof', name: 'Stogas', path: '<path d="M5 80 L50 15 L95 80 Z" fill="#e8262e"/>' },
  { id: 'clock', name: 'Laikrodis', path: '<circle cx="50" cy="50" r="42" fill="#e8262e"/><circle cx="50" cy="50" r="32" fill="#fff4e0"/><path d="M50 50 L50 26 M50 50 L66 58" stroke="#7a1010" stroke-width="6" stroke-linecap="round"/>' },
  { id: 'engine', name: 'Variklis', path: '<rect x="10" y="22" width="80" height="56" rx="8" fill="#e8262e"/><rect x="20" y="32" width="12" height="36" fill="#7a1010"/><rect x="44" y="32" width="12" height="36" fill="#7a1010"/><rect x="68" y="32" width="12" height="36" fill="#7a1010"/>' },
  { id: 'antenna', name: 'Antena', path: '<rect x="45" y="20" width="10" height="75" fill="#e8262e"/><circle cx="50" cy="16" r="12" fill="#e8262e"/>' },
  { id: 'pipe', name: 'Vamzdis', path: '<path d="M20 90 L20 40 Q20 15 45 15 L80 15" stroke="#e8262e" stroke-width="18" fill="none" stroke-linecap="round"/>' },
  { id: 'window', name: 'Langas', path: '<circle cx="50" cy="50" r="40" fill="#e8262e"/><circle cx="50" cy="50" r="28" fill="#bfe8ff"/>' },
  { id: 'wing', name: 'Sparnas', path: '<path d="M5 70 Q40 10 95 30 Q60 45 50 85 Z" fill="#e8262e"/>' },
  { id: 'computer', name: 'Kompiuteris', path: '<rect x="12" y="15" width="76" height="52" rx="5" fill="#4a5060"/><rect x="20" y="22" width="60" height="38" fill="#6ff7ff"/><rect x="35" y="70" width="30" height="8" fill="#4a5060"/><rect x="22" y="78" width="56" height="8" rx="3" fill="#4a5060"/>' }
];
const VILLAGERS = [
  { name: 'Ponas Petras', kind: 'fetch', item: 'skrybėlę', ask: 'Vėjas nupūtė mano mėgstamiausią skrybėlę! Ji kažkur netoliese… Atneši?', thanks: 'Mano skrybėlė! Imk šį raudoną metalo gabalą – ir mano seną plaktuką. Man jo nebereikia.', extra: 'hammer' },
  { name: 'Močiutė Onutė', kind: 'fetch', item: 'akinius', ask: 'Vaikeli, kur aš padėjau akinius? Be jų nematau net savo katino. Gal surasi?', thanks: 'Dabar matau tave! Koks tu žalias. Še, raudonas metalo gabalas ir dėžutė vinių.', extra: 'nails' },
  { name: 'Tomukas', kind: 'fetch', item: 'kamuolį', ask: 'Mano kamuolys nuriedėjo toli toli! Atneši? Prašau prašau!', thanks: 'Ačiū! Turiu raudoną metalo gabalą – radau jį smėlyje. Jis tavo!' },
  { name: 'Paštininkė Rūta', kind: 'deliver', item: 'laišką', ask: 'Turiu per daug laiškų! Nuneši šį į mėlyną pašto dėžutę? Ji netoli – pamatysi šviesos stulpą.', thanks: 'Puiku, laiškas pristatytas! Štai tau raudonas metalo gabalas.' },
  { name: 'Kepėjas Jonas', kind: 'deliver', item: 'pyragą', ask: 'Iškepiau pyragą kaimynui, bet negaliu palikti krosnies. Nuneši į jo pašto dėžutę?', thanks: 'Kaimynas sako – skanu! Imk raudoną metalo gabalą, jis gulėjo mano kepykloje.' },
  { name: 'Ūkininkė Asta', kind: 'fetch', item: 'kibirą', ask: 'Milžinas spyrė mano kibirą į tolį. Be jo negaliu pamelžti karvės!', thanks: 'Ačiū! Karvė irgi dėkoja. Štai raudonas metalo gabalas.' },
  { name: 'Žvejys Algis', kind: 'fetch', item: 'meškerę', ask: 'Pamiršau meškerę kažkur pakeliui. Atneši – duosiu kai ką raudono!', thanks: 'Mano meškerė! Kaip ir žadėjau – raudonas metalo gabalas.' },
  { name: 'Mokytoja Gintarė', kind: 'deliver', item: 'knygą', ask: 'Ši knyga – bibliotekai. Nuneši į knygų dėžutę? Ji šviečia netoliese.', thanks: 'Ačiū, mokinuk! Už gerą darbą – raudonas metalo gabalas.' },
  { name: 'Daktaras Vytas', kind: 'deliver', item: 'vaistinėlę', ask: 'Skubiai! Šią vaistinėlę reikia nunešti į dėžutę prie kelio. Ten ją pasiims ligonis.', thanks: 'Ligonis sveiksta! Imk raudoną metalo gabalą.' },
  { name: 'Muzikantas Lukas', kind: 'fetch', item: 'gitarą', ask: 'Mano gitara! Paliku ją ant kalvos, o dabar nerandu. Be jos negaliu groti!', thanks: 'Tilin tilin! Ačiū! Štai paskutinis raudonas metalo gabalas.' }
];
const villagers = [];
function makeFetchItem(i) {
  const g = new THREE.Group();
  const k = i % 6;
  if (k === 0) { g.add(S(G.cyl, mat(0x3a2a1a), 0.45, 0.06, 0.45, 0, 0.05, 0)); g.add(S(G.cyl, mat(0x3a2a1a), 0.28, 0.35, 0.28, 0, 0.25, 0)); g.add(S(G.cyl, mat(0xe8262e), 0.29, 0.07, 0.29, 0, 0.12, 0)); }
  else if (k === 1) { for (const x of [-0.18, 0.18]) g.add(mesh(new THREE.TorusGeometry(0.13, 0.025, 6, 16), mat(0x30343e), x, 0.2, 0)); g.add(S(G.box, mat(0x30343e), 0.12, 0.03, 0.03, 0, 0.22, 0)); }
  else if (k === 2) { g.add(S(G.sph, mat(0xffffff), 0.35, 0.35, 0.35, 0, 0.35, 0)); g.add(mesh(new THREE.TorusGeometry(0.35, 0.04, 6, 20), mat(0x3a7bff), 0, 0.35, 0)); }
  else if (k === 3) { g.add(S(G.cyl, mat(0xb8bec8, { metalness: 0.6 }), 0.3, 0.45, 0.25, 0, 0.23, 0)); g.add(mesh(new THREE.TorusGeometry(0.28, 0.02, 4, 16, Math.PI), mat(0x60646e), 0, 0.45, 0)); }
  else if (k === 4) { const r = S(G.cyl, mat(0x8a5a2b), 0.03, 1.8, 0.03, 0, 0.1, 0); r.rotation.z = 1.3; g.add(r); g.add(S(G.cyl, mat(0x30343e), 0.08, 0.08, 0.08, -0.4, 0.15, 0)); }
  else { g.add(S(G.sph, mat(0xc87a3a), 0.35, 0.12, 0.45, 0, 0.15, 0)); g.add(S(G.box, mat(0x6b4426), 0.1, 0.06, 0.9, 0, 0.15, 0.6)); }
  return g;
}
function makePostbox() {
  const g = new THREE.Group();
  g.add(S(G.cyl, mat(0x30343e), 0.07, 1.2, 0.07, 0, 0.6, 0)); g.add(S(G.box, mat(0x3a7bff), 0.6, 0.5, 0.8, 0, 1.4, 0)); g.add(S(G.dome, mat(0x3a7bff), 0.3, 0.25, 0.4, 0, 1.65, 0));
  g.add(S(G.box, mat(0xe8262e), 0.04, 0.35, 0.12, 0.32, 1.65, 0.2));
  return g;
}
function beamMesh(col) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 50, 12, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })); b.position.y = 25.5; return b; }
function buildVillagers() {
  const byB = {}; for (const v of villageHouses) if (v.spec.roof !== 'igloo') (byB[v.biome] = byB[v.biome] || []).push(v);
  const picked = []; for (let round = 0; picked.length < 10 && round < 4; round++) for (let b = 1; b < NB && picked.length < 10; b++) if (byB[b] && byB[b][round]) picked.push(byB[b][round]);
  picked.forEach((v, i) => {
    const def = VILLAGERS[i]; const off = Math.max(v.spec.w, v.spec.d) / 2 + 2.2;
    const side = new V3().crossVectors(v.d, v.fz).normalize();
    const d = moveAlong(moveAlong(v.d, v.fz, off), side, 1.4);
    const m = makePerson(); m.position.copy(d).multiplyScalar(R + groundH(d)); orient(m, d, v.fz.clone().negate().projectOnPlane(d).normalize()); world.add(m); linearize(m);
    const mark = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex('!', '#ffd23a', '#30343e', 96, 96), transparent: true, depthWrite: false })); mark.scale.setScalar(0.9); m.add(mark); mark.position.y = 2.8;
    const ok = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex('✓', '#5fe37a', '#ffffff', 96, 96), transparent: true, depthWrite: false })); ok.scale.setScalar(0.7); m.add(ok); ok.position.y = 2.7;
    const vg = { i, def, mesh: m, d, pos: m.position.clone(), mark, ok, target: null, tgtMesh: null };
    vg.inspect = addInspect(vg.pos.clone().addScaledVector(d, 1), def.name, '', 3.2, { verb: 'kalbėtis: ' + def.name, onUse: () => talkVillager(vg) });
    villagers.push(vg);
  });
  refreshVillagers();
  $('gcForm').addEventListener('submit', e => { e.preventDefault(); const v = $('gcInput').value.trim(); if (!v) return; $('gcInput').value = ''; godSay(v, true); godReply(v); });
  $('gcClose').addEventListener('click', closeGodChat); $('tmClose').addEventListener('click', closeTMBuild); $('tmHammer').addEventListener('click', hammerTM);
  animators.push((dt, t) => { for (const vg of villagers) { if (vg.mark.visible) vg.mark.position.y = 2.8 + Math.sin(t * 3 + vg.i) * 0.15; if (vg.tgtMesh) vg.tgtMesh.rotateY(dt * 1.5); } });
}
function refreshVillagers() {
  for (const vg of villagers) {
    const done = Q10.done.includes(vg.i);
    vg.mark.visible = Q10.stage === 'people' && !done; vg.ok.visible = done && q10Active();
    vg.inspect.r = Q10.stage === 'people' || done ? 3.2 : 0;
  }
}
function placeTarget(vg) {
  let d = null;
  for (let k = 0; k < 30 && !d; k++) { const c = moveAlong(vg.d, tangentToward(vg.d, randDir()).normalize(), rr(18, 32)); if (TH(c) > 0.2 && !nearReserved(c, 3)) d = c; }
  if (!d) d = moveAlong(vg.d, tangentToward(vg.d, randDir()).normalize(), 20);
  const m = vg.def.kind === 'fetch' ? makeFetchItem(vg.i) : makePostbox();
  m.add(beamMesh(vg.def.kind === 'fetch' ? 0xffd23a : 0x3a7bff));
  m.position.copy(d).multiplyScalar(R + groundH(d)); orient(m, d, tangentToward(d, UP)); world.add(m); linearize(m);
  vg.target = m.position.clone(); vg.tgtMesh = m;
}
function talkVillager(vg) {
  if (Q10.done.includes(vg.i)) { startTalk(vg.def.name, ['Ačiū tau dar kartą! Sėkmės statant… ką ten statai?'], '#ffd23a'); return; }
  if (Q10.stage !== 'people') { startTalk(vg.def.name, ['Labas, žaliasis! Gražią dieną šiandien, ar ne?'], '#ffd23a'); return; }
  if (Q10.cur && Q10.cur !== vg) { startTalk(vg.def.name, ['Matau, kad jau kažkam padedi. Kai baigsi – užsuk pas mane!'], '#ffd23a'); return; }
  if (Q10.cur === vg) {
    if ((vg.def.kind === 'fetch' && Q10.carry) || (vg.def.kind === 'deliver' && Q10.carry === 'delivered')) { finishVillager(vg); return; }
    startTalk(vg.def.name, [vg.def.kind === 'fetch' ? `Dar neradai? ${vg.def.item[0].toUpperCase() + vg.def.item.slice(1)} – ten, kur šviečia geltonas stulpas.` : 'Pašto dėžutė – ten, kur šviečia mėlynas stulpas.'], '#ffd23a'); return;
  }
  startTalk(vg.def.name, [vg.def.ask], '#ffd23a', () => {
    Q10.cur = vg; Q10.carry = vg.def.kind === 'deliver' ? 'parcel' : false; placeTarget(vg);
    toast(vg.def.kind === 'fetch' ? `Surask ${vg.def.item}` : `Nunešk ${vg.def.item}`, vg.def.kind === 'fetch' ? 'Ieškok geltono šviesos stulpo netoliese' : 'Ieškok mėlyno šviesos stulpo – ten pašto dėžutė', '#ffd23a');
  });
}
function finishVillager(vg) {
  if (vg.tgtMesh) { world.remove(vg.tgtMesh); vg.tgtMesh = null; }
  startTalk(vg.def.name, [vg.def.thanks], '#ffd23a', () => {
    Q10.done.push(vg.i); Q10.cur = null; Q10.carry = false; saveQ10(); refreshVillagers();
    [659, 784, 988].forEach((f, k) => tone(f, 0.25, { type: 'triangle', vol: 0.06, when: k * 0.08 }));
    const n = Q10.done.length;
    if (n >= 10) { Q10.stage = 'chat'; saveQ10(); refreshVillagers(); toast('Visi 10 raudonų metalo gabalų!', 'Eik pas Kūrėją ir PARAŠYK jam pats. Mandagiai!', '#ff6b4a'); }
    else toast(`Raudonas metalo gabalas! (${n} / 10)`, vg.def.extra === 'hammer' ? 'Gavai ir plaktuką!' : vg.def.extra === 'nails' ? 'Gavai ir vinių!' : 'Ieškok kitų žmonių su šauktuku', '#ff6b4a');
  });
}
function updateVillagerJobs(dt, t) {
  const vg = Q10.cur; if (!vg || !vg.target) return;
  const p = player.inCar ? ride.pos : player.pos;
  if (vg.def.kind === 'fetch' && !Q10.carry && p.distanceTo(vg.target) < 2.8) { Q10.carry = true; if (vg.tgtMesh) { world.remove(vg.tgtMesh); vg.tgtMesh = null; } tone(880, 0.12, { type: 'triangle', vol: 0.05 }); toast(`Radai ${vg.def.item}!`, `Nunešk atgal: ${vg.def.name}`, '#ffd23a'); }
  if (vg.def.kind === 'deliver' && Q10.carry === 'parcel' && p.distanceTo(vg.target) < 3) { Q10.carry = 'delivered'; if (vg.tgtMesh) vg.tgtMesh.children.filter(c => c.geometry && c.geometry.type === 'CylinderGeometry' && c.material.blending === THREE.AdditiveBlending).forEach(c => c.visible = false); tone(880, 0.12, { type: 'triangle', vol: 0.05 }); toast('Pristatyta!', `Grįžk pas: ${vg.def.name}`, '#3a7bff'); }
}

// ---------- typing to the Creator ----------
let chatOpen = false, chatN = 0;
function q10CreatorTalk() {
  if (Q10.stage === 'chat') { openGodChat(); return true; }
  if (Q10.stage === 'build') { openTMBuild(); return true; }
  return false;
}
function openGodChat() {
  chatOpen = true; $('godChat').hidden = false; $('paused').hidden = true;
  for (const k in keys) keys[k] = false;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  if (!$('gcLog').children.length) godSay('Taip, mažasis? Dabar tu pats man rašai. Ko tau reikia?');
  setTimeout(() => $('gcInput').focus(), 50);
}
function closeGodChat() { chatOpen = false; $('godChat').hidden = true; if (!lockFailed) requestLock(); }
function godSay(text, me) {
  const d = document.createElement('div'); d.className = me ? 'gcMe' : 'gcGod'; d.textContent = (me ? 'Tu: ' : 'Kūrėjas: ') + text; $('gcLog').appendChild(d); $('gcLog').scrollTop = 1e6;
  if (!me) tone(392 + Math.random() * 200, 0.15, { type: 'sine', vol: 0.04 });
}
function godReply(raw) {
  const t = raw.toLowerCase().replace(/[ą]/g, 'a').replace(/[č]/g, 'c').replace(/[ęė]/g, 'e').replace(/[į]/g, 'i').replace(/[š]/g, 's').replace(/[ųū]/g, 'u').replace(/[ž]/g, 'z').trim();
  chatN++;
  const has = re => re.test(t);
  const polite = has(/pra[sz]+[ao]u|prasom|prasyc|malonia|plz|please/), pc = has(/komp(iu|ju|iuo|u)t|kompik|komriut|computer|\bpc\b/);
  // politely asking for the computer – in any words ("prašau, galiu kompiuterį?", "prašau duok kompiuterį"…)
  if (Q10.stage === 'chat' && polite && pc) {
    setTimeout(() => {
      godSay('Žinoma, gali! Matau, kad išmokai mandagumo. Štai tau kompiuteris – laiko mašinos smegenys. Dabar sudėk visas dalis į savo vietas.');
      Q10.stage = 'build'; saveQ10(); sfx.magic();
      setTimeout(() => { closeGodChat(); toast('Gavai kompiuterį!', 'Sudėk dalis į tinkamas vietas', '#6ff7ff'); setTimeout(openTMBuild, 900); }, 2600);
    }, 500);
    return;
  }
  const n = Q10.done.length, now = new Date();
  let a = null;
  const m = t.match(/(-?\d+(?:[.,]\d+)?)\s*([+\-*x×/:])\s*(-?\d+(?:[.,]\d+)?)/);
  if (m) { const x = parseFloat(m[1].replace(',', '.')), y = parseFloat(m[3].replace(',', '.')), op = m[2]; const r = op === '+' ? x + y : op === '-' ? x - y : (op === '/' || op === ':') ? (y === 0 ? null : x / y) : x * y; a = r === null ? 'Iš nulio dalinti negalima – net Kūrėjui!' : `${m[1]} ${op} ${m[3]} = ${Math.round(r * 1000) / 1000}. Matematika – mano mėgstamiausia magija.`; }
  else if (has(/(ko|kas|kokio|kokiu|kokios|ka) (man |dar |tau )*(reik|truk|pritruk)|ko man dar|ko reikes|kas truksta|ka man (dar )?atnest|ka (man )?gauti|ko (man )?(dar )?nera|ka (dar )?turiu (gauti|surast)|what (do )?i (still )?need|what.*(missing|need)|what should i (get|bring)/)) a = Q10.stage === 'chat' ? 'Tau reikia KOMPIUTERIO! Jis – laiko mašinos smegenys. Jį turiu aš. Tik paprašyk mandagiai – su stebuklingu žodžiu.' : Q10.stage === 'build' ? 'Kompiuterį jau turi. Dabar sudėk visas laiko mašinos dalis į savo vietas.' : 'Dabar tau nieko netrūksta. Tu jau viską turi!';
  else if (pc && !polite) a = Q10.stage === 'chat' ? 'Kompiuterį? Hmm… O kaip reikia paprašyti? Prisimink stebuklingą žodį.' : 'Kompiuterį tau jau daviau. Jis – laiko mašinos smegenys.';
  else if (polite && !pc) a = 'Kokia graži „prašau“! Bet ko tu prašai? Pasakyk tiksliai.';
  else if (has(/^(labas|labukas|sveikas|sveiki|sveika|hi\b|hello|hey|labutis|ate\b)/)) a = pick(['Labas, mažasis žaliasis!', 'Sveikas! Smagu, kad rašai.', 'Labas labas! Kaip sekasi keliauti?']);
  else if (has(/viso gero|iki|ate ate|bye|goodbye/)) a = 'Iki, mažasis! Kai reikės – rašyk.';
  else if (has(/kaip tave vadin|tavo vard|kuo tu vard|kuo vardu|your name/)) a = 'Mane visi vadina tiesiog Kūrėju. O tu – mažasis žaliasis.';
  else if (has(/kas tu|kas esi|kas tu toks|who are you/)) a = 'Aš – Kūrėjas. Sukūriau šį pasaulį burbule: miestą, dykumas, ledą, grybus, džiungles ir pikselius. O tu – mano mažasis pagalbininkas.';
  else if (has(/kas as|kas esu|koks as|who am i/)) a = 'Tu – mažas, plonas, žalias žmogeliukas su antenėle. Ir labai drąsus.';
  else if (has(/kiek tau metu|kiek tu metu|tavo amz|ar tu senas|how old/)) a = 'Aš senesnis už patį laiką. Bet jaučiuosi visai jaunas!';
  else if (has(/kur tu gyven|kur gyveni|kur tu esi|where do you live|where are you/)) a = 'Čia, Kūrėjo Salėje – pasaulio centre. Iš čia matau viską.';
  else if (has(/kiek valand|kiek laiko|kelinta valanda|what time/)) a = `Dabar ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}. Laiką aš žinau visada – juk statome laiko mašiną!`;
  else if (has(/kokia diena|kokia data|kelinta/)) a = `Šiandien ${now.toLocaleDateString('lt-LT')}.`;
  else if (has(/kaip sekas|kaip tu|kaip gyveni|kaip laikais/)) a = 'Man puikiai! Mano salėje dabar tiek draugų – vienaragiai, vorai, katinas, karvė, debesų karalius…';
  else if (has(/ka veiki|ka darai|ka tu darai/)) a = 'Žiūriu į pasaulį burbule ir rūpinuosi juo. Ir laukiu, kol baigsi laiko mašiną!';
  else if (has(/laiko masin/)) a = Q10.stage === 'chat' ? 'Laiko mašinai jau turi visus dešimt raudonų metalo gabalų. Trūksta tik smegenų – kompiuterio. Jį turiu aš. Tereikia mandagiai paprašyti.' : 'Laiko mašina beveik baigta! Sudėk dalis į vietas ir sukalk plaktuku.';
  else if (has(/ka daryt|ka man daryt|kaip padaryt|nezinau|padek|pagalb|uzuomin|hint/)) a = Q10.stage === 'chat' ? 'Užuomina: tau reikia mano kompiuterio. Parašyk, ko nori, ir nepamiršk stebuklingo žodžio, kurį sako mandagūs vaikai.' : 'Sudėk laiko mašinos dalis į vietas – kiekviena dalis turi savo formą.';
  else if (has(/kompiuter|kam reik.*kompiut|kam kompiut/)) a = 'Kompiuteris – tai laiko mašinos smegenys. Be jo ji nežinotų, į kurį laiką skristi.';
  else if (has(/metal|gabal/)) a = `Raudonų metalo gabalų turi ${n} iš 10. Juos davė mano pasaulio žmonės – tu jiems padėjai.`;
  else if (has(/plaktuk|vin/)) a = 'Plaktuką davė Ponas Petras, vinis – Močiutė Onutė. Jų reikės, kai kalsi laiko mašiną.';
  else if (has(/demon/)) a = 'Demonas… Jis siunčia meteoritus ir milžinus. Bet tu jau tiek daug padarei, kad jis darosi silpnesnis.';
  else if (has(/vienarag/)) a = 'Vienaragiai laksto mano salėje. Mažieji žaidžia gaudynes su Voratinkle.';
  else if (has(/vor/)) a = 'Senasis Voras mezga voratinklius net čia. Iš įpratimo.';
  else if (has(/kat/)) a = 'Katinas sėdi prie manęs ir murkia. Labai rimtas katinas.';
  else if (has(/karv/)) a = 'Karvė sako „mū“ ir džiaugiasi, kad jos niekas nesiurbia į dangų.';
  else if (has(/viscuk|vist/)) a = 'Višta su septyniais viščiukais – tavo pirmasis darbas. Prisimeni?';
  else if (has(/debes|princ|karal/)) a = 'Debesų Karalius ir princas dabar gyvena pas mane. Princas skraido ratu, kai džiaugiasi.';
  else if (has(/ateiv|lekst|nlo|ufo/)) a = 'Ateivių lėkštė kabo muziejuje. Ateiviai buvo triukšmingi, bet ne pikti.';
  else if (has(/mars/)) a = 'Marsas – už burbulo. Ten drakono pilis ir dinozauriukai. Raketa stovi dykumoje.';
  else if (has(/muziej/)) a = 'Muziejus – Pradžios Mieste. Kairėje pusėje dar yra tuščių stendų tavo radiniams.';
  else if (has(/pinig|euru|eur\b|turtin/)) a = `Tu turi ${fmtMoney(money)}. Pinigų gali užsidirbti restorane, dažydamas sienas ar vykdydamas mano įsakymus.`;
  else if (has(/megstam.*spalv|kokia.*spalv|spalva/)) a = 'Mano mėgstamiausia spalva – žalia. Kaip tu!';
  else if (has(/megstam.*maist|ka valgai|ar valgai|maist|valgyt|alk/)) a = 'Aš nevalgau, bet man patinka kvapas iš restorano „Skanus maistas“. Ypač blynai.';
  else if (has(/juokel|anekdot|pralinksmink|juok/)) a = pick(['Kodėl vienaragis neina į mokyklą? Nes jis jau ragų mokslus baigęs! Cha!', 'Ką sako grybas grybui? „Tu – fun-gas!“ …Gerai, gal nelabai juokinga.', 'Kodėl voras gerai moka kompiuteriu? Nes jis visada tinkle!']);
  else if (has(/dainuok|daina/)) a = 'La-la-laa… Laiko mašina, skrisk per laiką! …Daugiau dainuoti nemoku.';
  else if (has(/ar tu mane myli|ar as tau patinku|ar mane megsti/)) a = 'Žinoma! Tu – mano mėgstamiausias pagalbininkas visame pasaulyje.';
  else if (has(/ar tu robot|ar tu dirbtin|ar tu ai\b|ar tu tikras/)) a = 'Aš – Kūrėjas. Šiame pasaulyje esu tikras kaip saulė virš miesto.';
  else if (has(/oras|lyja|sauleta|snig/)) a = 'Mano pasaulyje oras visada geras. Na, jei neskaičiuoti meteoritų.';
  else if (has(/kodel/)) a = pick(['Todėl, kad taip sukūriau pasaulį. O gal todėl, kad taip smagiau!', 'Kodėl? Nes kiekvienas klausimas turi atsakymą – kartais jį reikia surasti pačiam.']);
  else if (has(/aciu|dekoju|thanks|thank you/)) a = 'Prašom, mažasis.';
  else if (has(/^(taip|aha|jo|yes)\b/)) a = 'Puiku!';
  else if (has(/^(ne|nea|no)\b/)) a = 'Gerai, gerai. Nieko tokio.';
  else if (has(/duok|gal gali|ar gali|noriu/)) a = 'Ko tau duoti? Pasakyk tiksliai – ir mandagiai.';
  else if (has(/\?$|^(kas|kur|kaip|kada|kiek|ar|koks|kokia|kuris|kuri)\b/)) a = pick(['Geras klausimas! Manau, atsakymą rasi keliaudamas po pasaulį.', 'Hmm… Į tai atsakyti sunku net Kūrėjui. Paklausk ko nors kito!', 'To dar niekas manęs neklausė! Turiu pagalvoti.']);
  else a = pick(['Įdomu…', 'Supratau. Ir ką toliau?', 'Tu labai gražiai rašai.', 'Klausau tavęs.', 'Papasakok daugiau!']);
  if (Q10.stage === 'chat' && chatN % 3 === 0 && !pc && !/mandag/.test(a)) a += ' (Jei tau kažko reikia – paprašyk. Mandagiai.)';
  setTimeout(() => godSay(a), 450);
}

// ---------- building: put every part in its place ----------
const SLOTS = { roof: [50, 14], antenna: [70, 7], window: [36, 36], clock: [20, 50], door: [56, 52], computer: [80, 40], engine: [86, 64], pipe: [12, 72], wing: [50, 76], wheel1: [30, 90], wheel2: [70, 90] };
let tmOpen = false, tmPlaced = {};
function openTMBuild() {
  tmOpen = true; tmPlaced = {}; $('tmBuild').hidden = false; $('paused').hidden = true;
  for (const k in keys) keys[k] = false;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  const area = $('tmArea'), tray = $('tmTray');
  area.querySelectorAll('.tmSlot').forEach(e => e.remove()); tray.innerHTML = '';
  for (const p of PARTS) {
    const [x, y] = SLOTS[p.id];
    const s = document.createElement('div'); s.className = 'tmSlot'; s.dataset.id = p.id; s.style.left = x + '%'; s.style.top = y + '%';
    s.innerHTML = `<svg viewBox="0 0 100 100">${p.path}</svg><span>${p.name}</span>`; area.appendChild(s);
  }
  PARTS.slice().sort(() => Math.random() - 0.5).forEach(p => {
    const b = document.createElement('div'); b.className = 'tmPart'; b.dataset.id = p.id; b.title = p.name;
    b.innerHTML = `<svg viewBox="0 0 100 100">${p.path}</svg><span>${p.name}</span>`; tray.appendChild(b);
    b.addEventListener('pointerdown', e => startDragPart(e, b, p));
  });
  $('tmHammer').disabled = true; $('tmMsg').textContent = 'Tempk kiekvieną dalį ant jos vietos brėžinyje.';
}
function closeTMBuild() { tmOpen = false; $('tmBuild').hidden = true; if (!lockFailed) requestLock(); }
function startDragPart(e, el, p) {
  if (el.classList.contains('placed')) return;
  e.preventDefault();
  const ghost = el.cloneNode(true); ghost.classList.add('drag'); document.body.appendChild(ghost);
  const move = ev => { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; };
  move(e);
  const up = ev => {
    removeEventListener('pointermove', move); removeEventListener('pointerup', up); ghost.remove();
    let hit = null;
    document.querySelectorAll('#tmArea .tmSlot').forEach(s => { const r = s.getBoundingClientRect(); if (ev.clientX > r.left - 10 && ev.clientX < r.right + 10 && ev.clientY > r.top - 10 && ev.clientY < r.bottom + 10) hit = s; });
    // the two wheels may go in either wheel slot
    const fits = hit && !hit.classList.contains('filled') && (hit.dataset.id === p.id || (p.id.startsWith('wheel') && hit.dataset.id.startsWith('wheel')));
    if (fits) {
      hit.classList.add('filled'); el.classList.add('placed'); tmPlaced[hit.dataset.id] = true;
      tone(660, 0.1, { type: 'triangle', vol: 0.06 }); tone(990, 0.12, { type: 'triangle', vol: 0.05, when: 0.06 });
      const left = PARTS.length - Object.keys(tmPlaced).length;
      $('tmMsg').textContent = left ? `Puiku! Liko ${left}.` : 'Visos dalys savo vietose! Dabar sukalk jas plaktuku ir vinimis.';
      if (!left) $('tmHammer').disabled = false;
    } else if (hit) {
      tone(220, 0.2, { type: 'square', vol: 0.05, lp: 1200 }); $('tmMsg').textContent = `Ne, ${p.name.toLowerCase()} čia netinka. Pažiūrėk į formą!`;
      el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 400);
    }
  };
  addEventListener('pointermove', move); addEventListener('pointerup', up);
}
function hammerTM() {
  $('tmHammer').disabled = true;
  let k = 0; const bang = () => { noiseHit(0.08, { f: 1800, vol: 0.15 }); tone(1200, 0.05, { type: 'square', vol: 0.05 }); $('tmArea').classList.toggle('bump'); if (++k < 8) setTimeout(bang, 180); else finishTM(); };
  $('tmMsg').textContent = 'Kaukšt kaukšt kaukšt…'; bang();
}
function finishTM() {
  $('tmMsg').textContent = 'LAIKO MAŠINA PASTATYTA!';
  [262, 392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
  setTimeout(() => {
    closeTMBuild(); Q10.stage = 'mini'; saveQ10(); placeSanctumTM(); attachMiniTM(true);
    toast('Laiko mašina pastatyta!', 'Ji stovi Kūrėjo Salėje. Mažą jos kopiją nunešk į muziejų', '#ff6b4a');
  }, 1400);
}

// ---------- the machine itself ----------
function makeTimeMachine() {
  const g = new THREE.Group(), red = mat(0xd8262e, { metalness: 0.5, roughness: 0.35 }), dark = mat(0x7a1010, { metalness: 0.5, roughness: 0.4 }), brass = mat(0xffd23a, { metalness: 0.8, roughness: 0.25 });
  g.add(S(G.box, red, 2.6, 2.4, 2.2, 0, 1.6, 0));
  g.add(S(G.cone, red, 2.0, 1.2, 1.7, 0, 3.4, 0).rotateY(Math.PI / 4));
  g.add(S(G.cyl, dark, 0.06, 1.3, 0.06, 0.7, 4.3, 0)); g.add(S(G.sph, mat(0xff3b3b, { emissive: 0xff2020, emissiveIntensity: 1 }), 0.15, 0.15, 0.15, 0.7, 5.0, 0));
  g.add(S(G.box, dark, 0.8, 1.6, 0.05, 0.4, 1.3, 1.11)); g.add(S(G.sph, brass, 0.06, 0.06, 0.06, 0.65, 1.3, 1.16));
  g.add(S(G.cyl, brass, 0.5, 0.06, 0.5, -0.7, 2.0, 1.12).rotateX(Math.PI / 2)); g.add(S(G.cyl, mat(0xfff4e0), 0.42, 0.07, 0.42, -0.7, 2.0, 1.13).rotateX(Math.PI / 2));
  const hand = S(G.box, dark, 0.05, 0.35, 0.03, -0.7, 2.15, 1.18); g.add(hand); g.userData.hand = hand;
  g.add(S(G.cyl, mat(0xbfe8ff, { transparent: true, opacity: 0.6 }), 0.35, 0.05, 0.35, -0.6, 2.9, 1.12).rotateX(Math.PI / 2));
  for (const x of [-0.9, 0.9]) for (const z of [-0.9, 0.9]) g.add(S(G.cyl, mat(0x1a1a1a), 0.45, 0.3, 0.45, x, 0.45, z).rotateZ(Math.PI / 2));
  g.add(S(G.box, dark, 0.7, 0.9, 1.2, 1.6, 1.4, 0)); g.add(S(G.sph, mat(0x6ff7ff, { emissive: 0x3ad8ff, emissiveIntensity: 0.9 }), 0.2, 0.2, 0.2, 1.95, 1.4, 0));
  { const w = S(G.box, red, 0.08, 0.5, 1.8, -1.4, 2.0, 0); w.rotation.z = 0.5; g.add(w); }
  { const p = mesh(new THREE.TorusGeometry(0.5, 0.12, 6, 12, Math.PI), dark, -1.35, 1.0, 0); p.rotation.y = Math.PI / 2; g.add(p); }
  g.add(S(G.box, mat(0x4a5060), 0.5, 0.35, 0.05, 0.9, 2.6, 1.12)); g.add(S(G.box, bmat(0x6ff7ff), 0.42, 0.27, 0.02, 0.9, 2.6, 1.15));
  return g;
}
let sancTM = null;
function placeSanctumTM() {
  if (sancTM || !(Q10.stage === 'mini' || Q10.stage === 'done')) return;
  sancTM = makeTimeMachine(); sancTM.position.set(-13, 0, -11); sancTM.rotation.y = 0.7; sanc.add(sancTM); linearize(sancTM);
  sancAnim.push((dt, t) => { if (sancTM) sancTM.userData.hand.rotation.z = -t * 2; });
}
let heldMiniTM = null;
function attachMiniTM(on) {
  const hand = player.mesh.userData.parts.handL;
  if (on && !heldMiniTM) { heldMiniTM = makeTimeMachine(); heldMiniTM.scale.setScalar(0.14); heldMiniTM.position.set(0, -0.15, 0.15); hand.add(heldMiniTM); linearize(heldMiniTM); }
  if (!on && heldMiniTM) { hand.remove(heldMiniTM); heldMiniTM = null; }
}
function deliverMiniTM() {
  attachMiniTM(false); Q10.stage = 'done'; saveQ10(); addMoney(800); refreshVillagers(); refreshMuseumExtras();
  [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.6, { type: 'triangle', vol: 0.07, when: i * 0.1 }));
  poof(museum.g.position.clone().addScaledVector(museum.d, 2), 0xff6b4a);
  toast('Įsakymas #8 įvykdytas!', 'Laiko mašinos kopija – muziejuje. Apdovanojimas: 800 €', '#ffe98a');
}

// ---------- HUD ----------
function updateQ10Hud(el) {
  if (!q10Active()) { el.hidden = true; return; }
  el.hidden = false;
  let step = '', target = null, arrow = '', dist = '';
  const p = player.inCar ? ride.pos : player.pos;
  if (Q10.stage === 'people') {
    const vg = Q10.cur;
    if (vg) { const back = (vg.def.kind === 'fetch' && Q10.carry) || Q10.carry === 'delivered'; step = back ? `Grįžk pas: ${vg.def.name}` : vg.def.kind === 'fetch' ? `Surask ${vg.def.item}` : `Nunešk ${vg.def.item} į pašto dėžutę`; target = back ? vg.pos : vg.target; }
    else { let best = null, bd = 1e9; for (const v of villagers) if (!Q10.done.includes(v.i)) { const d = v.pos.distanceTo(p); if (d < bd) { bd = d; best = v; } } step = 'Rask žmogų su geltonu šauktuku'; target = best && best.pos; }
    step += ` · metalo gabalai <b>${Q10.done.length}/10</b>`;
  } else if (Q10.stage === 'chat') step = 'Eik pas Kūrėją ir parašyk jam (E prie Kūrėjo)';
  else if (Q10.stage === 'build') step = 'Sudėk laiko mašinos dalis (E prie Kūrėjo)';
  else if (Q10.stage === 'mini') { step = 'Nunešk laiko mašinos kopiją į muziejų'; target = museum && museum.g.position; }
  if (target && mode === 'planet') { arrow = arrowTo(target); dist = ` · ${Math.round(target.distanceTo(p))} m`; if (q2Dot) { q2Dot.visible = true; q2Dot.position.copy(target).normalize().multiplyScalar(R + 7); } }
  el.innerHTML = `${arrow}<div><div class="qt">Įsakymas #8: Laiko mašina</div><div class="qs">${step}${dist}</div></div>`;
}
