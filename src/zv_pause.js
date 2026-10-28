// ================= Esc: pause menu with "save and quit", controls and progress =================
let pauseOpen = false, pauseShownAt = 0, pauseConfirm = false;
const CMD_LIST = () => [
  ['Išgelbėk viščiukus', QUEST.stage === 'done'], ['Demono ragas', Q2.stage === 'done'], ['Slaptas voras', Q3.stage === 'done'], ['Spalvotas vienaragio ragas', Q4.stage === 'done'],
  ['Katinas ant kelio', Q5.stage === 'done'], ['Nugalėk ateivius', Q7.stage === 'done'], ['Debesų Princas', Q8.stage === 'done'], ['Laiko mašina', Q10.stage === 'done'],
  ['Urvinių karaliaus padėjėjas', Q11.stage === 'done'], ['Auksinis kamuolys', Q12.stage === 'done'], ['Dešimt auksinių katinų', Q13.stage === 'done'], ['Demono ritualas', Q14.stage === 'done']
];
const CONTROLS = [
  ['W A S D', 'vaikščioti'], ['Shift', 'bėgti'], ['Space', 'pašokti / atsistoti · Vėjo planetoje laikyk ore – skristi'], ['Pelė arba ← → ↑ ↓', 'sukti kamerą'],
  ['E', 'kalbėtis, apžiūrėti, naudoti'], ['Kairys / dešinys pelės mygt.', 'ištiesti ranką: paimti, mesti, įsikibti, šauti'],
  ['R', 'sėsti į mašiną / ant kiaulės'], ['F', 'iškviesti mašiną ar kiaulę'], ['I', 'mano gyvūnai'], ['P', 'telefonas (kai jį rasi)'], ['T', 'mesti pagaliuką'],
  ['V', 'pažiūrėti į save iš priekio'], ['X', 'kostiumų parduotuvė (bet kur) · paleisti gyvūną / nugriauti namą'], ['Q', 'pasukti statomą namą ar baldą'], ['B', 'baldai (namuose)'],
  ['M', 'garsas įj./išj.'], ['G', 'grafikos kokybė'], ['H', 'slėpti klavišų lentelę'], ['`', 'bandymų pasaulio komandos'], ['Esc', 'šis meniu']
];
function buildPauseMenu() {
  const el = $('paused');
  el.innerHTML = `<div class="pauseCard chip" role="dialog" aria-label="Pauzė">
    <div class="pauseTop"><div class="pauseTitle">Pauzė</div><div id="pmStats"></div></div>
    <div class="pauseBtns">
      <button class="btn" id="pmResume" type="button">Tęsti</button>
      <button class="btn pmSave" id="pmSave" type="button">Išsaugoti ir išeiti</button>
      <button class="btn pmNew" id="pmNew" type="button">Pradėti naują kelionę</button>
    </div>
    <div class="pauseBtns small"><button id="pmSound" type="button"></button><button id="pmQuality" type="button"></button><button id="pmView" type="button"></button><button id="pmKeys" type="button"></button></div>
    <div class="pauseBtns small" id="pmLang"><span style="align-self:center;font-weight:700">🌐 Kalba · Language:</span><button id="pmLangLt" type="button">🇱🇹 LT</button><button id="pmLangEn" type="button">🇬🇧 EN</button></div>
    <div class="pauseCols">
      <div><h3>Dabartinė užduotis</h3><div id="pmQuest"></div><h3>Kūrėjo įsakymai</h3><ol id="pmCmds"></ol></div>
      <div><h3>Valdymas</h3><div class="pmCtl">${CONTROLS.map(([k, t]) => `<span>${k.split(/ arba | or /).map(x => x === 'W A S D' ? '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>' : `<kbd>${x}</kbd>`).join(' ')}</span><span>${t}</span>`).join('')}</div></div>
    </div>
    <div class="pmNote">Žaidimas išsaugomas automatiškai. „Išsaugoti ir išeiti“ dar įsimena, kur stovi, ir grąžina į pradžios ekraną.</div>
  </div>`;
  el.onclick = e => { if (e.target === el) closePause(true); };
  $('pmResume').onclick = e => { e.stopPropagation(); closePause(true); };
  $('pmSave').onclick = e => { e.stopPropagation(); saveAndQuit(); };
  $('pmNew').onclick = e => { e.stopPropagation(); newJourneyClick($('pmNew')); };
  $('pmSound').onclick = e => { e.stopPropagation(); sndInit(); setMuted(!SND.muted); fillPause(); };
  $('pmQuality').onclick = e => { e.stopPropagation(); toggleQuality(); fillPause(); };
  $('pmView').onclick = e => { e.stopPropagation(); frontView = !frontView; fillPause(); };
  { const cur = (() => { try { return localStorage.getItem('modly-lang') === 'en' ? 'en' : 'lt'; } catch (_) { return 'lt'; } })(); const set = l => { try { localStorage.setItem('modly-lang', l); localStorage.removeItem('modly-pos'); } catch (_) { } location.reload(); };
    $('pmLangLt').style.outline = cur === 'lt' ? '2px solid #7dff6b' : ''; $('pmLangEn').style.outline = cur === 'en' ? '2px solid #7dff6b' : '';
    $('pmLangLt').onclick = e => { e.stopPropagation(); if (cur !== 'lt') set('lt'); }; $('pmLangEn').onclick = e => { e.stopPropagation(); if (cur !== 'en') set('en'); }; }
  $('pmKeys').onclick = e => { e.stopPropagation(); showKeys = !showKeys; $('keys').hidden = !showKeys; fillPause(); };
}
function fillPause() {
  const cmds = CMD_LIST(), done = cmds.filter(c => c[1]).length;
  $('pmStats').innerHTML = `<span>${fmtMoney(money)}</span><span>Biomai: ${visited.size} / 8</span><span>Įsakymai: ${done} / ${cmds.length}</span>`;
  $('pmCmds').innerHTML = cmds.map(([n, ok]) => `<li class="${ok ? 'ok' : ''}">${ok ? '✓ ' : ''}${n}</li>`).join('');
  const q = $('questChip'); $('pmQuest').innerHTML = q && !q.hidden && q.querySelector('.qt') ? `<b>${q.querySelector('.qt').textContent}</b><br>${q.querySelector('.qs').innerHTML}` : 'Šiuo metu užduoties nėra. Nueik pas Kūrėją – gal jis turi naują įsakymą?';
  $('pmSound').textContent = 'Garsas: ' + (SND.muted ? 'išj.' : 'įj.');
  $('pmQuality').textContent = 'Grafika: ' + (quality === 'high' ? 'aukšta' : 'žema');
  $('pmView').textContent = 'Vaizdas: ' + (frontView ? 'iš priekio' : 'iš nugaros');
  $('pmKeys').textContent = 'Klavišų lentelė: ' + (showKeys ? 'rodoma' : 'paslėpta');
  $('pmSave').textContent = pauseConfirm ? 'Tikrai išeiti? Spausk dar kartą' : 'Išsaugoti ir išeiti';
}
function openPause() {
  if (!started || !$('paused').hidden) return;
  if (!$('pmResume')) buildPauseMenu();
  pauseOpen = true; pauseShownAt = performance.now(); pauseConfirm = false;
  for (const k in keys) keys[k] = false; hands.L.hold = hands.R.hold = false;
  fillPause(); $('paused').hidden = false;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
}
function closePause(relock) {
  pauseOpen = false; pauseConfirm = false; $('paused').hidden = true;
  if (relock && !lockFailed) requestLock(); canvas.focus();
}
function savePlayerSpot() {
  try {
    localStorage.setItem('modly-visited', JSON.stringify([...visited]));
    if (mode === 'planet') { const e = player.inCar ? ride : player; localStorage.setItem('modly-pos', JSON.stringify({ p: e.pos.toArray(), f: e.fwd.toArray() })); }
    else localStorage.removeItem('modly-pos');
  } catch (_) { }
}
function saveAndQuit() {
  if (!pauseConfirm) { pauseConfirm = true; fillPause(); return; }
  savePlayerSpot();
  saveQ10(); saveQ11(); saveQ12(); try { localStorage.setItem('modly-money', String(money)); } catch (_) { }
  $('pmSave').textContent = 'Išsaugota! Grįžtame į pradžią…'; $('pmSave').disabled = true;
  setTimeout(() => { try { location.reload(); } catch (_) { } }, 500);
}
// called when the game starts: put you back where you saved
function restorePlayerSpot() {
  try {
    const s = JSON.parse(localStorage.getItem('modly-pos') || 'null'); if (!s) return false;
    const p = new V3().fromArray(s.p), d = p.clone().normalize();
    player.pos.copy(d).multiplyScalar(R + groundH(d) + 0.3); player.up.copy(d); player.fwd.fromArray(s.f).projectOnPlane(d).normalize();
    if (player.fwd.lengthSq() < 0.5) player.fwd.copy(tangentToward(d, UP));
    camera.position.copy(player.pos).addScaledVector(d, 4).addScaledVector(player.fwd, -6);
    return true;
  } catch (_) { return false; }
}

// ---------- "Pradėti naują kelionę": wipe everything and start from the very beginning ----------
const freshStart = () => { try { return localStorage.getItem('modly-fresh') === '1'; } catch (_) { return false; } };
function newJourney() {
  try {
    const keep = {}; for (const k of ['modly-quality', 'modly-muted', 'modly-lang', 'modly-srunlock', 'modly-srlb', 'modly-batjump', 'modly-thunderpass', 'modly-digjump', 'modly-flyback']) keep[k] = localStorage.getItem(k);
    if (typeof portalReady === 'function' && portalReady()) keep['modly-srunlock'] = '1';
    for (const k of ['modly-batjump', 'modly-thunderpass', 'modly-digjump', 'modly-flyback']) keep[k] = '1';   // a new journey is always a normal game – test-world jumps never fire again
    const del = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('modly-')) del.push(k); }
    del.forEach(k => localStorage.removeItem(k));
    for (const k in keep) if (keep[k] != null) localStorage.setItem(k, keep[k]);
    localStorage.setItem('modly-fresh', '1');          // a real fresh start: the test world does not hand out everything again
    localStorage.setItem('modly-test-secret', '1');
  } catch (_) { }
  try { if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ visited: [0] })); } catch (_) { }
  setTimeout(() => { try { location.reload(); } catch (_) { } }, 300);
}
let newConfirm = false;
function newJourneyClick(btn) {
  if (!newConfirm) { newConfirm = true; btn.textContent = 'Tikrai? Viskas bus ištrinta – spausk dar kartą'; btn.style.background = '#ff6b6b'; btn.style.boxShadow = '0 5px 0 #a83a3a'; setTimeout(() => { if (newConfirm) { newConfirm = false; btn.textContent = 'Pradėti naują kelionę'; btn.style.background = ''; btn.style.boxShadow = ''; } }, 8000); return; }
  btn.disabled = true; btn.textContent = 'Kuriamas naujas pasaulis…'; newJourney();
}
