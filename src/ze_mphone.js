// ================= After the past: the clocks cry – find a PHONE (P) and invite 10 people to fix the clock =================
// The phone is yours forever (P anywhere): make your own number (-123 …), call and text random people (prank calls!),
// Goosle search, Goosle Play with 3 games (zombie army, chicken catching, Bananas), JuTūbas (a long 2-min video + shorts).
// When 10 people agree to come (pay them or give them something you found), they fix the clock, everything is normal again,
// and you get added to the gods' group chat – where the THUNDER GOD wants you.
const Q19 = { stage: 'none', has: false, num: '', invited: [], gave: [], found: [], chats: {}, asked: {}, seenGods: false };   // none | cry | phone | fixed
try { const s = JSON.parse(localStorage.getItem('modly-quest19') || 'null'); if (s) Object.assign(Q19, s); } catch (_) { }
function saveQ19() { try { localStorage.setItem('modly-quest19', JSON.stringify(Q19)); } catch (_) { } }
const MP_NAMES = ['Jonas', 'Ona', 'Petras', 'Rūta', 'Tomas', 'Greta', 'Mantas', 'Eglė', 'Lukas', 'Austėja', 'Domas', 'Ieva', 'Matas', 'Kamilė', 'Paulius', 'Gabija', 'Rokas', 'Urtė', 'Karolis', 'Emilija'];
const MP_TAGS = ['mėgsta cepelinus', 'turi tris katinus', 'dirba kepykloje', 'vairuoja autobusą', 'groja būgnais', 'labai mėgsta futbolą', 'augina pomidorus', 'moka žongliruoti', 'visada pavėluoja', 'renka akmenukus', 'kepa blynus', 'žiūri multikus', 'bijo vorų', 'šoka breiką', 'taiso dviračius', 'mėgsta žvejoti', 'piešia komiksus', 'turi papūgą', 'bėgioja maratonus', 'dainuoja duše'];
const MP_ITEMS = [['candy', 'Saldainis', '#ff6bb0'], ['button', 'Auksinė saga', '#ffd23a'], ['key', 'Senas raktas', '#c8a070'], ['toycar', 'Žaislinė mašinėlė', '#ff5a3a'], ['stone', 'Gražus akmenukas', '#9ad8ff'], ['spring', 'Laikrodžio spyruoklė', '#c8ccd6']];
const MP_PPL = MP_NAMES.map((n, i) => { let s = 9137 + i * 7919; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; const num = '+370 6' + String(Math.floor(r() * 1e7)).padStart(7, '0'); const wantItem = r() < 0.4; return { id: i, name: n, num, tag: MP_TAGS[i], col: `hsl(${Math.floor(r() * 360)},70%,60%)`, want: wantItem ? { item: MP_ITEMS[Math.floor(r() * MP_ITEMS.length)][0] } : { money: 150 + Math.floor(r() * 10) * 50 } }; });
const itemName = id => (MP_ITEMS.find(x => x[0] === id) || [0, id])[1];
let mPhoneOpen = false, mpScreen = 'home', mpRaf = 0, mpGame = null, mpNotif = '';

// ---------- the clocks cry after travelling into the past ----------
{ const _f = fixPastClock; fixPastClock = () => { _f(); setTimeout(() => { if (Q19.stage === 'none') startCry(); }, 9500); }; }
function startCry() {
  if (Q19.stage !== 'none') return;
  if (card || cinema || mode !== 'time') { setTimeout(startCry, 1000); return; }
  startTalk('Laiko Dievas', ['…O ne. O NE! Mes praeityje – bet laikrodis dabar eina tik atgal!', 'Dabar nebegalime grįžti atgal į tikrą mūsų pasaulį… Niekada…', 'Žiūrėk – visi mano laikrodukai pradėjo verkti…', 'Bet palauk! Kažkas čia praeityje pametė TELEFONĄ. Girdi, kaip jis skamba? Surask jį!'], '#b0ff9a', () => { Q19.stage = 'cry'; saveQ19(); refreshMPhoneWorld(); toast('Surask pamestą telefoną!', 'Klausyk – jis skamba „dzin dzin“. Laikrodukai verkia…', '#ff9ad0'); });
}
const MPH = { phone: null, items: [], workers: [] };
const MP_PHONE_POS = new V3(28, 0, 34);
const MP_ITEM_POS = [[-58, 40], [-90, -40], [35, -20], [-30, 60], [15, 100], [-100, 70]];
{ const _b = buildTimeWorld; buildTimeWorld = () => { const first = !TW.built; _b(); if (first) { buildMPhoneWorld(); if (Q19.stage === 'fixed') unPast(); else if (Q18.stage === 'done' && Q19.stage === 'none') setTimeout(startCry, 2500); } }; }
function buildMPhoneWorld() {
  const g = new THREE.Group(); g.position.copy(MP_PHONE_POS); twScene.add(g); MPH.phone = g;
  g.add(S(G.box, mat(0x1a1a24, { metalness: 0.5, roughness: 0.3 }), 0.5, 0.06, 0.9, 0, 0.05, 0)); g.add(S(G.box, bmat(0x5ad8ff), 0.42, 0.02, 0.78, 0, 0.09, 0));
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0x9af0ff, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(1.4); s.position.y = 0.3; g.add(s); MPH.glow = s;
  MP_ITEM_POS.forEach(([x, z], i) => { const it = MP_ITEMS[i], m = new THREE.Group(); m.position.set(x, 0, z); twScene.add(m); m.add(S(G.ico, mat(new THREE.Color(it[2]).getHex(), { emissive: new THREE.Color(it[2]).multiplyScalar(0.3).getHex(), roughness: 0.3 }), 0.35, 0.35, 0.35, 0, 0.6, 0)); addGlow(m, new THREE.Color(it[2]).getHex()); MPH.items.push({ m, id: it[0] }); });
  linearize(g); refreshMPhoneWorld();
}
function refreshMPhoneWorld() {
  if (!MPH.phone) return;
  MPH.phone.visible = Q19.stage === 'cry' && !Q19.has;
  for (const it of MPH.items) it.m.visible = Q19.stage === 'phone' && !Q19.found.includes(it.id);
}
{ const _u = updateTimeWorld; updateTimeWorld = (dt, t) => {
    _u(dt, t); if (!MPH.phone) return;
    const pp = player.pos, crying = Q19.stage === 'cry' || Q19.stage === 'phone';
    if (Q19.stage === 'phone' && Q19.invited.length >= 10 && !card && !cinema && !mPhoneOpen && !transitioning) fixWithWorkers();
    if (MPH.phone.visible) {
      MPH.glow.material.opacity = 0.3 + 0.3 * Math.abs(Math.sin(t * 6)); MPH.phone.rotation.y = Math.sin(t * 20) * 0.08 * (Math.sin(t * 2) > 0 ? 1 : 0);
      MPH.ringT = (MPH.ringT || 0) - dt; const d = Math.hypot(pp.x - MP_PHONE_POS.x, pp.z - MP_PHONE_POS.z);
      if (MPH.ringT < 0 && d < 60) { MPH.ringT = 2.2; const v = 0.06 * (1 - d / 60); [1320, 1580, 1320, 1580].forEach((f, i) => tone(f, 0.08, { type: 'square', vol: v, lp: 3500, when: i * 0.12 })); }
      if (d < 1.8) takeMPhone();
    }
    for (const it of MPH.items) if (it.m.visible) { it.m.children[0].rotation.y = t * 2; if (Math.hypot(pp.x - it.m.position.x, pp.z - it.m.position.z) < 1.6) { Q19.found.push(it.id); saveQ19(); refreshMPhoneWorld(); tone(880, 0.15, { type: 'triangle', vol: 0.06 }); toast(`Radai: ${itemName(it.id)}!`, 'Gal kam nors jo reikės? Žmonėms gali jį pasiūlyti už pagalbą', '#ffd23a'); } }
    // crying clocks
    if (crying) for (const c of TW.clocks) {
      c.tearT = (c.tearT || rr(0, 2)) - dt;
      if (c.tearT < 0) { c.tearT = rr(0.6, 1.4); const tr = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0x6ab8ff, transparent: true, depthWrite: false })); tr.scale.setScalar(0.18); const sx = rnd() < 0.5 ? -0.13 : 0.13; tr.position.copy(c.m.position).add(new V3(sx, 1.45, 0.25).applyAxisAngle(UP, c.m.rotation.y)); twScene.add(tr); let k = 0; fx.push(d2 => { k += d2; tr.position.y -= d2 * 1.6; tr.material.opacity = Math.max(0, 1 - k); if (k > 0.9) { twScene.remove(tr); return false; } return true; }); }
      if (rnd() < dt * 0.05 && c.m.position.distanceTo(pp) < 25) bubbleIn(twScene, c.m.position, pick(['Buuu…', 'Noriu namo…', 'Uhuhu…', 'Tik… tak… snirkšt…']), 2.4);
    }
    if (!card && crying && !prompt0()) setPrompt(Q19.stage === 'cry' ? '📱 Surask pamestą telefoną – klausyk, kur skamba' : `📱 Spausk <kbd>P</kbd> – pakviesk 10 žmonių pataisyti laikrodį (${Q19.invited.length}/10)`);
  }; }
const prompt0 = () => { const el = $('prompt'); return el && !el.hidden && /<kbd>E<\/kbd>/.test(el.innerHTML); };
{ const _t = talkTimeGod; talkTimeGod = () => {
    if (Q19.stage === 'cry') { startTalk('Laiko Dievas', ['Buuu… Surask tą telefoną – jis kažkur čia skamba!'], '#b0ff9a'); return; }
    if (Q19.stage === 'phone') { startTalk('Laiko Dievas', [`Pakviesk žmonių iš tikro pasaulio – mums reikia dešimties meistrų! Jau sutiko: ${Q19.invited.length} iš 10.`, 'Jiems gali pasiūlyti pinigų… arba ką nors, ką rasi čia praeityje. Spausk P – telefonas.'], '#b0ff9a'); return; }
    if (Q19.stage === 'fixed') { startTalk('Laiko Dievas', [pick(['Tik tak! Viskas vėl normaliai – ir praeitis, ir ateitis!', 'Tavo telefone – Dievų grupė. Rodos, tavęs ieško Griaustinio Dievas…'])], '#b0ff9a'); return; }
    _t();
  }; }
function takeMPhone() {
  Q19.has = true; Q19.stage = 'phone'; saveQ19(); refreshMPhoneWorld();
  [523, 784, 1047].forEach((f, i) => tone(f, 0.25, { type: 'triangle', vol: 0.07, when: i * 0.08 }));
  toast('Radai TELEFONĄ! Jis tavo visam laikui', 'Spausk P – bet kur ir bet kada', '#5ad8ff');
  setTimeout(() => startTalk('Laiko Dievas', ['Telefonas! Puiku! Su juo gali paskambinti žmonėms į tikrą pasaulį.', 'Pakviesk DEŠIMT žmonių – jie atvyks ir pataisys laikrodį. Pasiūlyk jiems pinigų… arba ką nors, ką rasi čia praeityje.'], '#b0ff9a'), 900);
}

// ================= the phone itself (an HTML overlay) =================
function mpEl() {
  let el = $('mPhone'); if (el) return el;
  const st = document.createElement('style'); st.textContent = `
#mPhone{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:7;width:min(370px,calc(100vw - 24px));height:min(700px,calc(100vh - 24px));background:#0c0c14;border:7px solid #2a2a3a;border-radius:42px;box-shadow:0 24px 70px rgba(0,0,0,.7);display:flex;flex-direction:column;overflow:hidden;font-family:inherit;color:#fff;box-sizing:border-box}
#mPhone .mpTop{height:30px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;font-size:13px;font-weight:800;color:#dde}
#mPhone .mpBody{flex:1;overflow:auto;position:relative}
#mPhone .mpBar{height:46px;display:flex;align-items:center;justify-content:center;gap:40px;border-top:1px solid #222}
#mPhone button{font:inherit;cursor:pointer;border:none;border-radius:12px}
#mPhone .mpBtn{background:#2a2a3a;color:#fff;padding:9px 14px;font-weight:800;margin:4px}
#mPhone .mpBtn.go{background:#3cc86a}#mPhone .mpBtn.no{background:#e04a4a}#mPhone .mpBtn.gold{background:#ffb020;color:#2a1a00}
#mPhone .mpGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px 8px;padding:22px 14px}
#mPhone .mpApp{display:flex;flex-direction:column;align-items:center;gap:6px;background:none;color:#fff;font-size:12px;font-weight:700}
#mPhone .mpIco{width:58px;height:58px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;color:#fff;box-shadow:0 4px 10px rgba(0,0,0,.4)}
#mPhone .mpH{padding:12px 16px;font-size:20px;font-weight:900;display:flex;align-items:center;gap:10px}
#mPhone .mpRow{display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid #1c1c28;cursor:pointer}
#mPhone .mpAva{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;flex:none}
#mPhone .mpMsg{max-width:78%;padding:8px 12px;border-radius:16px;margin:4px 10px;font-size:14px;line-height:1.35}
#mPhone .mpMsg.me{align-self:flex-end;background:#3a7bff}#mPhone .mpMsg.them{align-self:flex-start;background:#2a2a3a}
#mPhone input{font:inherit;border:none;border-radius:20px;padding:10px 14px;background:#22222e;color:#fff;flex:1;outline:none}
#mPhone canvas{display:block;margin:0 auto;background:#111;border-radius:10px;touch-action:none}
#mPhone .mpSmall{font-size:12px;color:#9a9ab0;padding:0 16px}`;
  document.head.appendChild(st);
  el = document.createElement('div'); el.id = 'mPhone'; el.hidden = true;
  el.innerHTML = '<div class="mpTop"><span id="mpClock">12:00</span><span id="mpNum"></span><span>▮▮▮ 🔋</span></div><div class="mpBody" id="mpBody"></div><div class="mpBar"><button class="mpBtn" id="mpBack">◀</button><button class="mpBtn" id="mpHome">●</button><button class="mpBtn" id="mpX">✕</button></div>';
  document.body.appendChild(el);
  $('mpBack').onclick = () => mpBack(); $('mpHome').onclick = () => mpShow('home'); $('mpX').onclick = () => closeMPhone();
  el.addEventListener('mousedown', e => e.stopPropagation()); el.addEventListener('keydown', e => e.stopPropagation());
  return el;
}
function openMPhone() {
  if (!Q19.has || mPhoneOpen || card) return;
  const el = mpEl(); mPhoneOpen = true; el.hidden = false; for (const k in keys) keys[k] = false; hands.L.hold = hands.R.hold = false;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  tone(1047, 0.06, { type: 'triangle', vol: 0.04 });
  mpShow(Q19.num ? 'home' : 'setup');
}
function closeMPhone() { if (!mPhoneOpen) return; mPhoneOpen = false; mpStopGame(); $('mPhone').hidden = true; if (!lockFailed) requestLock(); checkWorkers(); }
let mpHist = [];
function mpBack() { mpStopGame(); const prev = mpHist.pop(); if (prev) mpShow(prev, true); else mpShow('home', true); }
function mpShow(scr, back, arg) {
  mpStopGame(); if (!back && mpScreen && mpScreen !== scr && mpScreen !== 'setup') mpHist.push(mpScreen); if (scr === 'home') mpHist = [];
  mpScreen = scr; const b = $('mpBody'); const d = new Date(); $('mpClock').textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; $('mpNum').textContent = Q19.num ? Q19.num : '';
  const SCR = { setup: mpSetup, home: mpHome, people: mpPeople, person: mpPerson, chat: mpChat, call: mpCall, invite: mpInvite, goosle: mpGoosle, play: mpPlay, game: mpGameScreen, tube: mpTube, video: mpVideo, shorts: mpShorts, gods: mpGods, bag: mpBag };
  (SCR[scr] || mpHome)(b, arg);
}
// ---------- make your own number ----------
let mpDigits = '';
function mpSetup(b) {
  b.innerHTML = `<div class="mpH">Susikurk savo numerį</div><div class="mpSmall">Lietuvoje numeriai prasideda +370… bet čia – Laiko pasaulis, tad visi numeriai prasideda <b>-123</b>. Nu supranti. Kiti skaičiai – tik nuo 2 iki 6.</div>
  <div style="font-size:30px;font-weight:900;text-align:center;margin:26px 0;letter-spacing:2px">-123 <span id="mpDig">${mpDigits.padEnd(6, '_')}</span></div>
  <div style="display:grid;grid-template-columns:repeat(3,70px);gap:10px;justify-content:center">${[2, 3, 4, 5, 6].map(n => `<button class="mpBtn" style="font-size:24px;padding:14px" data-n="${n}">${n}</button>`).join('')}<button class="mpBtn no" style="font-size:20px" data-n="del">⌫</button></div>
  <div style="text-align:center;margin-top:20px"><button class="mpBtn go" id="mpSave">Išsaugoti numerį</button></div>`;
  b.querySelectorAll('[data-n]').forEach(x => x.onclick = () => { const n = x.dataset.n; if (n === 'del') mpDigits = mpDigits.slice(0, -1); else if (mpDigits.length < 6) mpDigits += n; tone(600 + (+n || 0) * 80, 0.05, { type: 'sine', vol: 0.04 }); $('mpDig').textContent = mpDigits.padEnd(6, '_'); });
  $('mpSave').onclick = () => { if (mpDigits.length < 4) { toast('Per trumpas numeris', 'Įvesk bent 4 skaičius (nuo 2 iki 6)', '#ff6b4a'); return; } Q19.num = '-123 ' + mpDigits; saveQ19(); sfx.chime(); mpShow('home'); };
}
// ---------- home screen ----------
function mpHome(b) {
  const apps = [['people', 'Žmonės', '#3cc86a', '☎'], ['goosle', 'Goosle', '#ffffff', 'G'], ['play', 'Goosle Play', '#3a7bff', '▶'], ['tube', 'JuTūbas', '#e8262e', '▷'], ['bag', 'Mano daiktai', '#ffb020', '★']];
  if (Q19.stage === 'fixed') apps.push(['gods', 'Dievų grupė', '#b07aff', '⚡']);
  b.innerHTML = `<div style="padding:16px 18px 0"><div style="font-size:44px;font-weight:900">${$('mpClock').textContent}</div><div class="mpSmall" style="padding:0">Tavo numeris: ${Q19.num}</div>${Q19.stage === 'phone' ? `<div style="margin-top:8px;background:#22222e;border-radius:12px;padding:8px 12px;font-size:13px">🔧 Laikrodžio meistrai: <b>${Q19.invited.length} / 10</b></div>` : ''}${mpNotif ? `<div style="margin-top:8px;background:#3a2a5a;border-radius:12px;padding:8px 12px;font-size:13px">${mpNotif}</div>` : ''}</div>
  <div class="mpGrid">${apps.map(([id, n, c, ic]) => `<button class="mpApp" data-a="${id}"><div class="mpIco" style="background:${c};${c === '#ffffff' ? 'color:#3a7bff' : ''}">${ic}</div>${n}</button>`).join('')}</div>`;
  b.querySelectorAll('[data-a]').forEach(x => x.onclick = () => { tone(880, 0.04, { type: 'triangle', vol: 0.03 }); mpShow(x.dataset.a); });
}
function mpBag(b) {
  b.innerHTML = `<div class="mpH">Mano daiktai</div><div class="mpSmall">Daiktai, kuriuos radai Laiko pasaulyje (praeityje jie šviečia). Juos gali pasiūlyti žmonėms.</div>` +
    MP_ITEMS.map(([id, n, c]) => `<div class="mpRow" style="cursor:default"><div class="mpAva" style="background:${c}">★</div><div style="flex:1">${n}</div><div class="mpSmall">${Q19.gave.includes(id) ? 'atiduota' : Q19.found.includes(id) ? '<b style="color:#3cc86a">turi</b>' : 'dar nerasta'}</div></div>`).join('');
}
// ---------- people, chats and calls ----------
function mpPeople(b) {
  b.innerHTML = `<div class="mpH">Žmonės</div><div class="mpSmall">Atsitiktiniai žmonės iš tikro pasaulio. Paskambink, parašyk – arba pakviesk taisyti laikrodžio!</div>` +
    MP_PPL.map(p => `<div class="mpRow" data-p="${p.id}"><div class="mpAva" style="background:${p.col}">${p.name[0]}</div><div style="flex:1"><div style="font-weight:800">${p.name}${Q19.invited.includes(p.id) ? ' ✅' : ''}</div><div class="mpSmall" style="padding:0">${p.num}</div></div></div>`).join('');
  b.querySelectorAll('[data-p]').forEach(x => x.onclick = () => mpShow('person', false, +x.dataset.p));
}
let mpCur = 0;
function mpPerson(b, id) {
  if (id != null) mpCur = id; const p = MP_PPL[mpCur];
  b.innerHTML = `<div style="text-align:center;padding:24px 10px"><div class="mpAva" style="background:${p.col};width:90px;height:90px;font-size:40px;margin:0 auto">${p.name[0]}</div><div style="font-size:24px;font-weight:900;margin-top:10px">${p.name}</div><div class="mpSmall">${p.num} · ${p.tag}</div>${Q19.invited.includes(p.id) ? '<div style="color:#3cc86a;font-weight:800;margin-top:8px">Sutiko taisyti laikrodį ✅</div>' : ''}
  <div style="margin-top:22px"><button class="mpBtn go" id="mpCallB">📞 Skambinti</button><button class="mpBtn" id="mpChatB">💬 Rašyti</button></div>${Q19.stage === 'phone' && !Q19.invited.includes(p.id) ? '<div><button class="mpBtn gold" id="mpInvB">🔧 Pakviesti taisyti laikrodį</button></div>' : ''}</div>`;
  $('mpCallB').onclick = () => mpShow('call'); $('mpChatB').onclick = () => mpShow('chat'); if ($('mpInvB')) $('mpInvB').onclick = () => mpShow('invite');
}
function mpReply(p, txt) {
  const t = txt.toLowerCase();
  const R = (a) => pick(a);
  if (/^(labas|sveik|hey|hi|lab|hello)/.test(t)) return R([`Labas! O kas čia?`, `Sveikas! Iš kur turi mano numerį?`, `Labas labas! Aš ${p.name}.`]);
  if (/kas tu|kuo vardu|vardas|who are you|your name/.test(t)) return `Aš ${p.name}. Ir aš ${p.tag}. O tu?`;
  if (/kaip sekasi|kaip tu|kaip gyveni|how are you/.test(t)) return R(['Gerai! O tau?', 'Normaliai, tik katinas vėl suvalgė mano sumuštinį.', 'Puikiai, ką tik suvalgiau tris blynus!']);
  if (/šaldytuv|saldytuv|fridge/.test(t)) return R(['Ką?! Mano šaldytuvas BĖGA?! …Ei, palauk. Tai pokštas!', 'Tai pagausiu jį! …Hmm, jis stovi vietoj. Tu pokštininkas!']);
  if (/pinig|eur|money/.test(t)) return R(['Pinigų? Man pačiam trūksta!', 'Už pinigus aš viską padarysiu! Na… beveik viską.']);
  if (/laikrod|tik tak|praeit|clock|past/.test(t)) return R(['Laikrodis? Praeitis? Apie ką tu kalbi?', 'Aš moku taisyti laikrodžius! Tiesa, tik plastikinius…']);
  if (/zomb/.test(t)) return 'ZOMBIAI?! Kur?! …A, tu apie žaidimą Goosle Play? Aš jame 5 lygyje!';
  if (/banan/.test(t)) return R(['Bananas – geriausias vaisius!', 'Aš esu banano gerbėjas nuo gimimo!']);
  if (/cha|ha+|lol|xd/.test(t)) return R(['Cha cha cha!', 'XD', 'Juokinga!']);
  if (/viš|vist|chicken/.test(t)) return 'Kudakudak! Aš moku pagauti vištą per 3 sekundes!';
  if (/\?$/.test(t)) return R(['Hmm… gal taip, gal ne.', 'Geras klausimas! Nežinau.', 'Paklausk mano mamos.', 'Taip! …Arba ne.']);
  if (/ačiū|aciu|thank/.test(t)) return 'Nėra už ką!';
  if (/^.{0,2}$/.test(t)) return '??';
  return R([`Įdomu… O kodėl rašai apie „${txt.slice(0, 24)}“?`, 'Cha, tu keistas. Bet man patinka!', 'Aš dabar ' + p.tag.replace(/^(mėgsta|turi|dirba|vairuoja|groja|augina|moka|visada|renka|kepa|žiūri|bijo|šoka|taiso|bėgioja|dainuoja|piešia)/, m => m) + ', parašyk vėliau!', 'Ok 👍', 'Kas čia rašo?! Iš kur tu?', 'Tikrai?! Nebūna!']);
}
function mpChat(b) {
  const p = MP_PPL[mpCur], log = Q19.chats[p.id] || (Q19.chats[p.id] = []);
  b.innerHTML = `<div class="mpH"><div class="mpAva" style="background:${p.col};width:32px;height:32px">${p.name[0]}</div>${p.name}</div><div id="mpLog" style="display:flex;flex-direction:column;padding-bottom:8px">${log.map(([w, tx]) => `<div class="mpMsg ${w}">${tx.replace(/</g, '&lt;')}</div>`).join('')}</div>
  <div style="position:sticky;bottom:0;display:flex;gap:6px;padding:8px;background:#0c0c14"><input id="mpIn" placeholder="Rašyk žinutę…" maxlength="120"><button class="mpBtn go" id="mpSend">➤</button></div>`;
  const send = () => { const v = $('mpIn').value.trim(); if (!v) return; log.push(['me', v]); $('mpIn').value = ''; saveQ19(); mpShow('chat', true); tone(1200, 0.05, { type: 'triangle', vol: 0.03 });
    setTimeout(() => { if (mpScreen !== 'chat') { log.push(['them', mpReply(p, v)]); saveQ19(); return; } log.push(['them', mpReply(p, v)]); saveQ19(); mpShow('chat', true); tone(900, 0.06, { type: 'triangle', vol: 0.04 }); }, 900 + Math.random() * 900); };
  $('mpSend').onclick = send; $('mpIn').onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') send(); if (e.key === 'Escape') closeMPhone(); };
  setTimeout(() => { try { $('mpIn').focus(); } catch (_) { } $('mpBody').scrollTop = 1e6; }, 30);
}
const PRANKS = [['Ar jūsų šaldytuvas bėga?', ['Ką? …Palauk, patikrinsiu. NE, jis stovi! …Ei, tai pokštas?!', 'Taip, bėga! Jau trečią kartą šiandien!']], ['Čia jūsų katinas skambina. Miau.', ['Murkis?! Kaip tu išmokai naudotis telefonu?!', 'Mano katinas niekada neskambina… jis tik rašo žinutes.']], ['Sveiki, jūs laimėjote 1000 bananų!', ['TIKRAI?! Kur juos pasiimti?! …Alio? Alio?!', 'Aš net nemėgstu bananų… nors gerai, imsiu.']], ['Kalba ateivis iš kosmoso. Bip bup.', ['AAAA! Nevežkit manęs į savo lėkštę!', 'Bip bup tau irgi. Pasakyk Marsui labų dienų.']], ['Ar čia pica? Norėčiau 5 picų su ananasais.', ['Čia ne picerija! …Bet aš irgi norėčiau picos.', 'Ananasai ant picos?! Padėk ragelį!']]];
let mpCallT = null;
function mpCall(b) {
  const p = MP_PPL[mpCur]; clearTimeout(mpCallT);
  b.innerHTML = `<div style="text-align:center;padding:34px 10px"><div class="mpAva" style="background:${p.col};width:100px;height:100px;font-size:44px;margin:0 auto">${p.name[0]}</div><div style="font-size:24px;font-weight:900;margin-top:12px">${p.name}</div><div class="mpSmall" id="mpCallSt">Skambinama… ${p.num}</div><div id="mpCallTxt" style="min-height:70px;margin:18px 10px;font-size:16px"></div><div id="mpCallOpts"></div><button class="mpBtn no" id="mpHang" style="margin-top:14px">📵 Padėti ragelį</button></div>`;
  $('mpHang').onclick = () => { clearTimeout(mpCallT); tone(400, 0.2, { type: 'sine', vol: 0.04 }); mpShow('person', true); };
  [0, 1.4, 2.8].forEach(w => { tone(440, 0.5, { type: 'sine', vol: 0.03, when: w }); tone(480, 0.5, { type: 'sine', vol: 0.03, when: w }); });
  mpCallT = setTimeout(() => {
    if (mpScreen !== 'call') return;
    $('mpCallSt').textContent = 'Kalbama… 00:0' + Math.floor(Math.random() * 9); $('mpCallTxt').textContent = pick(['Alio? Kas čia?', `Alio, ${p.name} klauso.`, 'Klausau…', 'Alio?! Kas skambina taip vėlai?']);
    const opts = $('mpCallOpts'); opts.innerHTML = PRANKS.map((pr, i) => `<button class="mpBtn" style="display:block;width:92%;margin:5px auto;font-size:13px" data-k="${i}">${pr[0]}</button>`).join('') + (Q19.stage === 'phone' && !Q19.invited.includes(p.id) ? '<button class="mpBtn gold" style="display:block;width:92%;margin:5px auto" id="mpCallInv">🔧 Ateik pataisyti laikrodžio!</button>' : '');
    opts.querySelectorAll('[data-k]').forEach(x => x.onclick = () => { const pr = PRANKS[+x.dataset.k]; $('mpCallTxt').innerHTML = `<i>Tu: ${pr[0]}</i><br><br>${pick(pr[1])}`; tone(700, 0.05, { type: 'triangle', vol: 0.03 }); });
    if ($('mpCallInv')) $('mpCallInv').onclick = () => mpShow('invite');
  }, 3200);
}
function mpInvite(b) {
  const p = MP_PPL[mpCur]; const asked = Q19.asked[p.id] || 0; const w = p.want;
  if (Q19.invited.includes(p.id)) { mpShow('person', true); return; }
  const price = w.money ? w.money + asked * 100 : 0;
  b.innerHTML = `<div class="mpH"><div class="mpAva" style="background:${p.col};width:32px;height:32px">${p.name[0]}</div>${p.name}</div><div style="display:flex;flex-direction:column">
    <div class="mpMsg me">Labas! Ar galėtum atvykti į Laiko pasaulį ir pataisyti Praeities Laikrodį? Mums labai reikia!</div>
    <div class="mpMsg them">${w.money ? (asked ? `Hmm… nu gerai, bet tik už ${price} €.` : `Laiko pasaulis?! Įdomu… Ateisiu, jei sumokėsi ${price} €.`) : `Pinigų man nereikia. Bet jei atneštum man… <b>${itemName(w.item)}</b> – ateisiu!`}</div></div>
    <div style="padding:10px;text-align:center">${w.money ? `<button class="mpBtn go" id="mpPay">💶 Sumokėti ${price} €</button><button class="mpBtn" id="mpHaggle">Gal pigiau?</button>` : `<button class="mpBtn go" id="mpGive">🎁 Duoti: ${itemName(w.item)}</button>`}<button class="mpBtn" id="mpOther">Pasiūlyti kitą daiktą</button><button class="mpBtn no" id="mpNo">Ne, ačiū</button></div><div class="mpSmall" id="mpInvMsg"></div><div class="mpSmall">Tavo pinigai: ${fmtMoney(money)} · Meistrų: ${Q19.invited.length}/10</div>`;
  const accept = (how) => { Q19.invited.push(p.id); saveQ19(); [523, 659, 784].forEach((f, i) => tone(f, 0.2, { type: 'triangle', vol: 0.05, when: i * 0.07 })); $('mpInvMsg').innerHTML = `<b style="color:#3cc86a">${p.name}: „${how}“ – ateis taisyti laikrodžio! (${Q19.invited.length}/10)</b>`; setTimeout(() => { if (mpScreen === 'invite') mpShow('people'); }, 1600); if (Q19.invited.length >= 10) toast('Visi 10 meistrų sutiko!', 'Uždaryk telefoną – jie jau keliauja pas Praeities Laikrodį!', '#3cc86a'); };
  if ($('mpPay')) $('mpPay').onclick = () => { if (money < price) { $('mpInvMsg').textContent = 'Neturi tiek pinigų… Gal pasiūlyk daiktą?'; return; } addMoney(-price); accept('Sutarta! Jau lekiu!'); };
  if ($('mpHaggle')) $('mpHaggle').onclick = () => { Q19.asked[p.id] = asked + 1; saveQ19(); if (Math.random() < 0.4) { addMoney(-Math.max(0, Math.round(price / 2))); accept('Gerai, perpus pigiau – bet tik dėl tavęs!'); } else { $('mpInvMsg').textContent = `${p.name}: „Pigiau?! Tai dabar bus dar brangiau!“`; setTimeout(() => mpShow('invite', true), 900); } };
  const giveItem = (id) => { Q19.gave.push(id); saveQ19(); accept(`${itemName(id)}! Kaip tik to ir norėjau!`); };
  if ($('mpGive')) $('mpGive').onclick = () => { if (!Q19.found.includes(w.item) || Q19.gave.includes(w.item)) { $('mpInvMsg').textContent = `Neturi daikto „${itemName(w.item)}“. Paieškok praeityje – daiktai ten šviečia!`; return; } giveItem(w.item); };
  $('mpOther').onclick = () => { const have = Q19.found.filter(id => !Q19.gave.includes(id)); if (!have.length) { $('mpInvMsg').textContent = 'Neturi jokių daiktų. Jie šviečia Laiko pasaulyje (praeityje).'; return; } const id = have[0]; if (Math.random() < 0.6) giveItem(id); else $('mpInvMsg').textContent = `${p.name}: „${itemName(id)}? Ne, man to nereikia.“`; };
  $('mpNo').onclick = () => mpShow('person', true);
}
// ---------- Goosle ----------
function mpGoosle(b) {
  b.innerHTML = `<div style="text-align:center;padding:30px 0 10px;font-size:42px;font-weight:900"><span style="color:#3a7bff">G</span><span style="color:#e8262e">o</span><span style="color:#ffb020">o</span><span style="color:#3a7bff">s</span><span style="color:#3cc86a">l</span><span style="color:#e8262e">e</span></div>
  <div style="display:flex;gap:6px;padding:8px 14px"><input id="mpQ" placeholder="Ieškok bet ko…" maxlength="60"><button class="mpBtn go" id="mpS">🔍</button></div><div id="mpRes"></div>`;
  const run = () => {
    const q = $('mpQ').value.trim(); if (!q) return; const t = q.toLowerCase();
    const R = [];
    if (/laikrod|praeit|grįžt|grizt|clock|past/.test(t)) R.push(['Kaip pataisyti Praeities Laikrodį?', 'Atsakymas: pakviesk 10 meistrų iš tikro pasaulio. Jie mėgsta pinigus ir saldainius.'], ['Laiko pasaulio forumas', '„Mano laikrodukas verkia jau 3 dienas, ką daryti?“ – 47 atsakymai']);
    if (/zomb/.test(t)) R.push(['Zombių apokalipsė: armija – Goosle Play', 'Statyk armiją ir apgink miestą! ★★★★★'], ['Ar zombiai tikri?', 'Mokslininkai sako: NE. Bet žaidime – TAIP.']);
    if (/banan/.test(t)) R.push(['Bananas – žaidimas', 'Gaudyk bananus, venk supuvusių! Goosle Play'], ['Kodėl bananai lenkti?', 'Nes jie auga link saulės. Tikrai!']);
    if (/viš|vist|chicken/.test(t)) R.push(['Gaudyk vištas – Goosle Play', 'Sugaudyk visas vištas į gardą per 45 sekundes!']);
    if (/dievas|diev|god/.test(t)) R.push(['Dievų grupė', 'Prieiga tik dievams… ir vienam žaliam žmogeliukui.']);
    R.push([`„${q}“ – Goosle enciklopedija`, `${q} – tai labai svarbus dalykas. Apie ${q} žino visi, išskyrus tuos, kurie nežino.`], [`10 faktų apie ${q}`, `3 faktas jus nustebins! (Iš tikro – ne.)`], [`Ar ${q} valgomas?`, pick(['Taip, su kečupu.', 'Ne, bet labai skanu.', 'Priklauso nuo dienos.'])]);
    $('mpRes').innerHTML = R.slice(0, 5).map(([h, d]) => `<div style="padding:10px 16px;border-bottom:1px solid #1c1c28"><div style="color:#8ab4ff;font-weight:800">${h.replace(/</g, '&lt;')}</div><div class="mpSmall" style="padding:0">${d.replace(/</g, '&lt;')}</div></div>`).join('');
  };
  $('mpS').onclick = run; $('mpQ').onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') run(); if (e.key === 'Escape') closeMPhone(); };
}
// ---------- Goosle Play ----------
const MP_GAMES = [['zombie', 'Zombių apokalipsė: armija', '#5a8a3a', '🧟', 'Zombiai puola! Statyk armiją ir apgink miestą.'], ['chicken', 'Gaudyk vištas', '#ffb020', '🐔', 'Sugaudyk visas vištas į gardą!'], ['banana', 'Bananas', '#ffd23a', '🍌', 'Beždžionėlė gaudo bananus. Venk supuvusių ir bombų!']];
function mpPlay(b) {
  b.innerHTML = `<div class="mpH"><span style="color:#3a7bff">▶</span> Goosle Play</div>` + MP_GAMES.map(([id, n, c, ic, d]) => `<div class="mpRow" data-g="${id}"><div class="mpIco" style="background:${c};width:52px;height:52px">${ic}</div><div style="flex:1"><div style="font-weight:800">${n}</div><div class="mpSmall" style="padding:0">${d}</div></div><button class="mpBtn go">Žaisti</button></div>`).join('');
  b.querySelectorAll('[data-g]').forEach(x => x.onclick = () => mpShow('game', false, x.dataset.g));
}
function mpStopGame() { cancelAnimationFrame(mpRaf); mpRaf = 0; mpGame = null; }
function mpCanvas(b, h = 470) { b.innerHTML = `<canvas id="mpCv" width="340" height="${h}"></canvas><div id="mpGUI" style="text-align:center;padding:6px"></div>`; const c = $('mpCv'); return [c, c.getContext('2d')]; }
function mpPtr(c, e) { const r = c.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return [(t.clientX - r.left) * c.width / r.width, (t.clientY - r.top) * c.height / r.height]; }
function mpLoop(fn) { let last = performance.now(); const f = now => { if (!mpGame) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; fn(dt); mpRaf = requestAnimationFrame(f); }; mpRaf = requestAnimationFrame(f); }
function mpGameScreen(b, id) { mpGame = { id }; ({ zombie: gameZombie, chicken: gameChicken, banana: gameBanana })[id](b); }
// --- 1) zombie apocalypse: build an army ---
function gameZombie(b) {
  const [c, x] = mpCanvas(b); const G2 = mpGame; const lanes = [120, 240, 360];
  Object.assign(G2, { coins: 40, lives: 5, kills: 0, wave: 1, waveT: 0, spawnT: 2, units: [], zs: [], shots: [], sel: 0, over: false });
  const U = [['Kareivis', 15, 6, 2, 130, '#3a7bff'], ['Lankininkas', 25, 4, 3, 220, '#3cc86a'], ['Tankas', 60, 25, 6, 160, '#8a8a9a']];
  const gui = () => { $('mpGUI').innerHTML = U.map((u, i) => `<button class="mpBtn${G2.sel === i ? ' gold' : ''}" data-u="${i}" style="font-size:12px">${u[0]} ${u[1]}🪙</button>`).join('') + (G2.over ? '<button class="mpBtn go" id="zR">Iš naujo</button>' : ''); $('mpGUI').querySelectorAll('[data-u]').forEach(y => y.onclick = () => { G2.sel = +y.dataset.u; gui(); }); if ($('zR')) $('zR').onclick = () => mpShow('game', true, 'zombie'); };
  gui();
  c.onpointerdown = e => { if (G2.over) return; const [px, py] = mpPtr(c, e); const lane = lanes.reduce((a, l, i) => Math.abs(l - py) < Math.abs(lanes[a] - py) ? i : a, 0); const u = U[G2.sel]; if (G2.coins < u[1]) return; if (G2.units.filter(v => v.lane === lane).length >= 5) return; G2.coins -= u[1]; G2.units.push({ lane, x: 30 + G2.units.filter(v => v.lane === lane).length * 32, hp: u[2], max: u[2], dmg: u[3], range: u[4], col: u[5], cd: 0, type: G2.sel }); tone(500, 0.06, { type: 'square', vol: 0.03, lp: 2000 }); };
  mpLoop(dt => {
    if (!G2.over) {
      G2.coins += dt * 6; G2.waveT += dt; if (G2.waveT > 25) { G2.waveT = 0; G2.wave++; }
      G2.spawnT -= dt; if (G2.spawnT < 0) { G2.spawnT = Math.max(0.6, 3 - G2.wave * 0.25) * rr(0.6, 1.3); const hp = 8 + G2.wave * 4; G2.zs.push({ lane: Math.floor(Math.random() * 3), x: 345, hp, max: hp, sp: rr(14, 24) + G2.wave * 2, cd: 0 }); }
      for (const u of G2.units) { u.cd -= dt; const tgt = G2.zs.filter(z => z.lane === u.lane && z.x > u.x && z.x - u.x < u.range).sort((a, b2) => a.x - b2.x)[0]; if (tgt && u.cd <= 0) { u.cd = u.type === 2 ? 1.4 : 0.8; G2.shots.push({ lane: u.lane, x: u.x + 10, tgt, dmg: u.dmg, col: u.type === 1 ? '#c8ff8a' : '#ffe14d' }); } }
      for (const s of G2.shots) { s.x += dt * 300; if (s.x >= s.tgt.x) { s.tgt.hp -= s.dmg; s.done = true; } }
      G2.shots = G2.shots.filter(s => !s.done && s.x < 350);
      for (const z of G2.zs) { const blocker = G2.units.find(u => u.lane === z.lane && z.x - u.x < 22 && z.x > u.x - 10); if (blocker) { z.cd -= dt; if (z.cd <= 0) { z.cd = 1; blocker.hp -= 2; } } else z.x -= z.sp * dt; if (z.x < 5) { z.dead = true; G2.lives--; tone(150, 0.3, { type: 'sawtooth', vol: 0.05, lp: 800 }); } if (z.hp <= 0 && !z.dead) { z.dead = true; G2.kills++; G2.coins += 5; } }
      G2.zs = G2.zs.filter(z => !z.dead); G2.units = G2.units.filter(u => u.hp > 0);
      if (G2.lives <= 0) { G2.over = true; gui(); }
    }
    x.fillStyle = '#2a3a22'; x.fillRect(0, 0, 340, 470); x.fillStyle = '#3a4a2a'; for (const l of lanes) x.fillRect(0, l - 40, 340, 80);
    x.fillStyle = '#6a6a7a'; x.fillRect(0, 60, 14, 360); x.font = 'bold 14px sans-serif'; x.fillStyle = '#fff';
    for (const u of G2.units) { x.fillStyle = u.col; if (u.type === 2) { x.fillRect(u.x - 14, lanes[u.lane] - 10, 28, 18); x.fillRect(u.x, lanes[u.lane] - 14, 16, 5); } else { x.beginPath(); x.arc(u.x, lanes[u.lane] - 14, 7, 0, 7); x.fill(); x.fillRect(u.x - 5, lanes[u.lane] - 8, 10, 18); } x.fillStyle = '#3cc86a'; x.fillRect(u.x - 12, lanes[u.lane] + 14, 24 * u.hp / u.max, 3); }
    for (const z of G2.zs) { const y = lanes[z.lane]; x.fillStyle = '#7ab85a'; x.beginPath(); x.arc(z.x, y - 16, 8, 0, 7); x.fill(); x.fillStyle = '#5a3a6a'; x.fillRect(z.x - 6, y - 8, 12, 20); x.fillStyle = '#7ab85a'; x.fillRect(z.x - 16, y - 6, 10, 4); x.fillStyle = '#e8262e'; x.fillRect(z.x - 3, y - 18, 2, 2); x.fillRect(z.x + 1, y - 18, 2, 2); x.fillStyle = '#e8262e'; x.fillRect(z.x - 10, y + 14, 20 * Math.max(0, z.hp) / z.max, 3); }
    for (const s of G2.shots) { x.fillStyle = s.col; x.fillRect(s.x, lanes[s.lane] - 8, 8, 3); }
    x.fillStyle = '#fff'; x.fillText(`🪙 ${Math.floor(G2.coins)}   ❤ ${G2.lives}   Banga ${G2.wave}   Zombių: ${G2.kills}`, 10, 22); x.fillText('Pasirink karį ir paspausk ant juostos', 10, 44);
    if (G2.over) { x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(0, 180, 340, 100); x.fillStyle = '#fff'; x.font = 'bold 26px sans-serif'; x.fillText('Zombiai laimėjo!', 70, 225); x.font = 'bold 16px sans-serif'; x.fillText(`Nugalėjai ${G2.kills} zombių, ${G2.wave} banga`, 70, 255); }
  });
}
// --- 2) catch the chickens and put them in the pen ---
function gameChicken(b) {
  const [c, x] = mpCanvas(b); const G2 = mpGame; const pen = { x: 10, y: 360, w: 120, h: 100 };
  Object.assign(G2, { t: 45, ch: Array.from({ length: 8 }, () => ({ x: rr(150, 320), y: rr(60, 330), vx: rr(-60, 60), vy: rr(-60, 60), inPen: false, turn: rr(0.5, 2) })), held: null, px: 0, py: 0, over: false, win: false });
  const gui = () => { $('mpGUI').innerHTML = G2.over ? '<button class="mpBtn go" id="cR">Iš naujo</button>' : '<span class="mpSmall">Paspausk vištą – ji atsiduria rankoje. Paspausk gardą – ji ten lieka.</span>'; if ($('cR')) $('cR').onclick = () => mpShow('game', true, 'chicken'); };
  gui();
  c.onpointermove = e => { [G2.px, G2.py] = mpPtr(c, e); };
  c.onpointerdown = e => { if (G2.over) return; const [px, py] = mpPtr(c, e); G2.px = px; G2.py = py;
    if (G2.held) { if (px > pen.x && px < pen.x + pen.w && py > pen.y && py < pen.y + pen.h) { G2.held.inPen = true; G2.held.x = px; G2.held.y = py; G2.held = null; tone(880, 0.08, { type: 'triangle', vol: 0.04 }); } else { G2.held.x = px; G2.held.y = py; G2.held = null; } return; }
    const h = G2.ch.find(k => !k.inPen && Math.hypot(k.x - px, k.y - py) < 22); if (h) { G2.held = h; tone(1200, 0.06, { type: 'square', vol: 0.03, lp: 2500 }); } };
  mpLoop(dt => {
    if (!G2.over) { G2.t -= dt; for (const k of G2.ch) { if (k === G2.held) { k.x = G2.px; k.y = G2.py; continue; } if (k.inPen) { k.x += Math.sin(performance.now() / 300 + k.y) * 0.3; continue; } k.turn -= dt; if (k.turn < 0) { k.turn = rr(0.4, 1.6); k.vx = rr(-90, 90); k.vy = rr(-90, 90); } const d = Math.hypot(k.x - G2.px, k.y - G2.py); if (d < 50) { k.vx += (k.x - G2.px) * 3 * dt; k.vy += (k.y - G2.py) * 3 * dt; } k.x += k.vx * dt; k.y += k.vy * dt; if (k.x < 140 && k.y > 340) k.vx = Math.abs(k.vx) + 20; if (k.x < 15 || k.x > 325) k.vx = -k.vx; if (k.y < 50 || k.y > 455) k.vy = -k.vy; k.x = clamp(k.x, 15, 325); k.y = clamp(k.y, 50, 455); }
      const caught = G2.ch.filter(k => k.inPen).length; if (caught === 8) { G2.over = true; G2.win = true; gui(); sfx.chime(); } else if (G2.t <= 0) { G2.over = true; gui(); } }
    x.fillStyle = '#6cbf5a'; x.fillRect(0, 0, 340, 470); x.strokeStyle = '#8a5a2b'; x.lineWidth = 5; x.strokeRect(pen.x, pen.y, pen.w, pen.h); x.fillStyle = '#c8a060'; x.fillRect(pen.x + 3, pen.y + 3, pen.w - 6, pen.h - 6); x.fillStyle = '#5a3a1a'; x.font = 'bold 13px sans-serif'; x.fillText('GARDAS', pen.x + 34, pen.y - 6);
    for (const k of G2.ch) { x.fillStyle = '#fff'; x.beginPath(); x.ellipse(k.x, k.y, 12, 10, 0, 0, 7); x.fill(); x.beginPath(); x.arc(k.x + (k.vx > 0 ? 9 : -9), k.y - 8, 6, 0, 7); x.fill(); x.fillStyle = '#e8262e'; x.fillRect(k.x + (k.vx > 0 ? 7 : -11), k.y - 16, 4, 4); x.fillStyle = '#ffb020'; x.fillRect(k.x + (k.vx > 0 ? 14 : -18), k.y - 8, 5, 3); }
    x.fillStyle = '#fff'; x.font = 'bold 15px sans-serif'; x.fillText(`⏱ ${Math.max(0, Math.ceil(G2.t))}   🐔 gardė: ${G2.ch.filter(k => k.inPen).length}/8`, 10, 24);
    if (G2.over) { x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(0, 180, 340, 90); x.fillStyle = '#fff'; x.font = 'bold 24px sans-serif'; x.fillText(G2.win ? 'Visos vištos gardė!' : 'Laikas baigėsi!', G2.win ? 60 : 85, 230); }
  });
}
// --- 3) Bananas: the monkey catches bananas, avoids rotten ones and bombs ---
function gameBanana(b) {
  const [c, x] = mpCanvas(b); const G2 = mpGame;
  Object.assign(G2, { px: 170, score: 0, lives: 3, items: [], t: 0, spawn: 0.8, over: false, best: +(localStorage.getItem('modly-banana') || 0) });
  const gui = () => { $('mpGUI').innerHTML = G2.over ? '<button class="mpBtn go" id="bR">Iš naujo</button>' : '<span class="mpSmall">Vedžiok pele / pirštu. 🍌 +1 · auksinis +5 · 🟤 supuvęs ir 💣 – atima gyvybę</span>'; if ($('bR')) $('bR').onclick = () => mpShow('game', true, 'banana'); };
  gui();
  c.onpointermove = e => { G2.px = clamp(mpPtr(c, e)[0], 25, 315); }; c.onpointerdown = c.onpointermove;
  mpLoop(dt => {
    if (!G2.over) { G2.t += dt; G2.spawn -= dt; if (G2.spawn < 0) { G2.spawn = Math.max(0.3, 0.9 - G2.t * 0.01); const r = Math.random(); G2.items.push({ x: rr(20, 320), y: -20, k: r < 0.08 ? 'gold' : r < 0.22 ? 'rotten' : r < 0.32 ? 'bomb' : 'ban', sp: rr(120, 180) + G2.t * 3, rot: rr(0, 6) }); }
      for (const it of G2.items) { it.y += it.sp * dt; it.rot += dt * 3; if (it.y > 420 && it.y < 450 && Math.abs(it.x - G2.px) < 34) { it.done = true; if (it.k === 'ban') { G2.score++; tone(990, 0.05, { type: 'triangle', vol: 0.04 }); } else if (it.k === 'gold') { G2.score += 5; [990, 1320].forEach((f, i) => tone(f, 0.08, { type: 'triangle', vol: 0.05, when: i * 0.06 })); } else { G2.lives--; tone(160, 0.25, { type: 'sawtooth', vol: 0.05, lp: 900 }); } } if (it.y > 490) it.done = true; }
      G2.items = G2.items.filter(i => !i.done); if (G2.lives <= 0) { G2.over = true; if (G2.score > G2.best) { G2.best = G2.score; try { localStorage.setItem('modly-banana', String(G2.best)); } catch (_) { } } gui(); } }
    const g = x.createLinearGradient(0, 0, 0, 470); g.addColorStop(0, '#6ad8ff'); g.addColorStop(1, '#3a9a4a'); x.fillStyle = g; x.fillRect(0, 0, 340, 470);
    x.fillStyle = '#2a7a2a'; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(i * 70, 30, 40, 0, 7); x.fill(); }
    for (const it of G2.items) { x.save(); x.translate(it.x, it.y); x.rotate(it.rot); if (it.k === 'bomb') { x.fillStyle = '#1a1a1a'; x.beginPath(); x.arc(0, 0, 12, 0, 7); x.fill(); x.fillStyle = '#ffb020'; x.fillRect(-2, -18, 4, 6); } else { x.strokeStyle = it.k === 'gold' ? '#ffd23a' : it.k === 'rotten' ? '#5a4a1a' : '#ffe14d'; x.lineWidth = 8; x.lineCap = 'round'; x.beginPath(); x.arc(0, -10, 16, 0.3, 2.6); x.stroke(); if (it.k === 'gold') { x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.arc(0, -10, 16, 0.6, 1.2); x.stroke(); } } x.restore(); }
    // the monkey with a basket
    const mx = G2.px; x.fillStyle = '#8a5a2b'; x.beginPath(); x.arc(mx, 446, 16, 0, 7); x.fill(); x.fillStyle = '#e8c890'; x.beginPath(); x.arc(mx, 449, 9, 0, 7); x.fill(); x.fillStyle = '#111'; x.fillRect(mx - 6, 441, 3, 3); x.fillRect(mx + 3, 441, 3, 3);
    x.fillStyle = '#c8903a'; x.fillRect(mx - 34, 422, 68, 12); x.fillStyle = '#a8702a'; for (let i = 0; i < 6; i++) x.fillRect(mx - 32 + i * 11, 424, 2, 8);
    x.fillStyle = '#fff'; x.font = 'bold 16px sans-serif'; x.fillText(`🍌 ${G2.score}   ❤ ${G2.lives}   Rekordas: ${G2.best}`, 10, 70);
    if (G2.over) { x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(0, 190, 340, 90); x.fillStyle = '#fff'; x.font = 'bold 26px sans-serif'; x.fillText(`Bananų: ${G2.score}`, 100, 242); }
  });
}
// ---------- JuTūbas ----------
const SHORTS = [['Katinas groja pianinu', 0], ['Banano šokis', 1], ['Višta bėga NAMO', 2], ['Laikrodukas verkia (liūdna)', 3], ['Sprogo arbūzas!!!', 4], ['Žalias žmogeliukas šoka', 5], ['Zombis bijo voro', 6], ['Skraidanti karvė?!', 7]];
function mpTube(b) {
  b.innerHTML = `<div class="mpH"><span style="background:#e8262e;border-radius:8px;padding:0 8px">▶</span> JuTūbas</div>
  <div class="mpRow" id="mpV1"><div style="width:120px;height:68px;background:#333;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px">🐶</div><div style="flex:1"><div style="font-weight:800">Streamerio Greitulio LOJIMAS (blogai nupieštas)</div><div class="mpSmall" style="padding:0">GreitulysTV · 2:00 · 1 mlrd. peržiūrų</div></div></div>
  <div class="mpH" style="font-size:16px">Shorts</div><div class="mpGrid" style="grid-template-columns:repeat(2,1fr);padding:4px 12px">${SHORTS.map(([n], i) => `<button class="mpApp" data-s="${i}" style="background:#1c1c28;border-radius:12px;padding:8px"><div style="width:100%;height:100px;background:#2a2a3a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:30px">▶</div>${n}</button>`).join('')}</div>`;
  $('mpV1').onclick = () => mpShow('video');
  b.querySelectorAll('[data-s]').forEach(x => x.onclick = () => mpShow('shorts', false, +x.dataset.s));
}
// a long 2-minute video: a badly drawn (made-up) streamer barking
function mpVideo(b) {
  const [c, x] = mpCanvas(b, 260); mpGame = { t: 0, play: true };
  const G2 = mpGame;
  $('mpGUI').innerHTML = '<div style="font-weight:800;text-align:left;padding:4px 8px">Streamerio Greitulio LOJIMAS (blogai nupieštas)</div><div class="mpSmall" style="text-align:left">GreitulysTV · 1 mlrd. peržiūrų · 👍 9 mln.</div><button class="mpBtn" id="vP">⏸</button><input type="range" id="vS" min="0" max="120" value="0" style="width:60%;vertical-align:middle">';
  $('vP').onclick = () => { G2.play = !G2.play; $('vP').textContent = G2.play ? '⏸' : '▶'; }; $('vS').oninput = e => { G2.t = +e.target.value; };
  let barkT = 0;
  mpLoop(dt => {
    if (G2.play) { G2.t += dt; if (G2.t >= 120) { G2.t = 120; G2.play = false; $('vP').textContent = '▶'; } }
    $('vS').value = G2.t; const t = G2.t;
    x.fillStyle = '#f4f0e0'; x.fillRect(0, 0, 340, 260);
    x.strokeStyle = '#222'; x.lineWidth = 3; x.fillStyle = '#ffd8b0';
    // the wobbly, badly drawn streamer
    const bark = Math.sin(t * 6) > 0.3, jump = Math.abs(Math.sin(t * 3)) * (t % 20 > 10 ? 20 : 4), cx = 170 + Math.sin(t * 1.3) * 30, cy = 120 - jump;
    x.beginPath(); x.ellipse(cx, cy, 44 + Math.sin(t * 7) * 3, 50, Math.sin(t) * 0.1, 0, 7); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(cx - 46, cy - 10); x.quadraticCurveTo(cx, cy - 80, cx + 48, cy - 8); x.stroke();   // headset band
    x.fillStyle = '#222'; x.fillRect(cx - 54, cy - 14, 14, 26); x.fillRect(cx + 42, cy - 14, 14, 26);
    x.beginPath(); x.arc(cx - 16, cy - 10, 6, 0, 7); x.fill(); x.beginPath(); x.arc(cx + 18, cy - 14, 9, 0, 7); x.fill();
    x.fillStyle = '#c8303a'; x.beginPath(); x.ellipse(cx, cy + 22, bark ? 20 : 12, bark ? 16 : 4, 0, 0, 7); x.fill(); x.stroke();
    x.strokeStyle = '#222'; x.beginPath(); x.moveTo(cx - 20, cy + 48); x.lineTo(cx - 40, cy + 110); x.moveTo(cx + 20, cy + 48); x.lineTo(cx + 45, cy + 110); x.moveTo(cx - 40, cy + 40); x.lineTo(cx - 90, cy + 20 - jump); x.moveTo(cx + 40, cy + 40); x.lineTo(cx + 92, cy + 10 + jump); x.stroke();
    if (bark) { x.fillStyle = '#e8262e'; x.font = `bold ${26 + Math.sin(t * 20) * 4}px sans-serif`; x.fillText(pick(['AU!', 'AU AU!', 'AUUU!', 'VAU!']), cx + 50, cy - 50); barkT -= dt; if (barkT < 0) { barkT = 0.45; noiseHit(0.08, { ft: 'bandpass', f: 700, vol: 0.05 }); tone(320, 0.1, { to: 180, type: 'sawtooth', vol: 0.03, lp: 1200 }); } }
    x.fillStyle = '#222'; x.font = '12px sans-serif'; x.fillText('🔴 LIVE', 8, 18); x.fillText(`${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')} / 2:00`, 260, 250);
    x.fillStyle = '#e8262e'; x.fillRect(0, 256, 340 * t / 120, 4);
  });
}
function mpShorts(b, k) {
  if (k != null) mpCur = k; const [c, x] = mpCanvas(b, 470); mpGame = { t: 0 }; const G2 = mpGame; const [title, kind] = SHORTS[mpCur];
  $('mpGUI').innerHTML = `<button class="mpBtn" id="sUp">▲</button><b style="font-size:13px">${title}</b> <span class="mpSmall">👍 ${100 + mpCur * 37}k</span><button class="mpBtn" id="sDn">▼</button>`;
  $('sUp').onclick = () => mpShow('shorts', true, (mpCur + SHORTS.length - 1) % SHORTS.length); $('sDn').onclick = () => mpShow('shorts', true, (mpCur + 1) % SHORTS.length);
  mpLoop(dt => {
    G2.t += dt; const t = G2.t; x.fillStyle = ['#2a1a3a', '#ffe680', '#8ad86a', '#3a4a6a', '#ff8a8a', '#2a2050', '#4a3a2a', '#6ad8ff'][kind]; x.fillRect(0, 0, 340, 470);
    x.font = 'bold 40px sans-serif'; x.textAlign = 'center';
    if (kind === 0) { x.fillStyle = '#111'; x.fillRect(40, 300, 260, 80); x.fillStyle = '#fff'; for (let i = 0; i < 10; i++) x.fillRect(45 + i * 25, 305, 22, 70); x.fillText('🐱', 170 + Math.sin(t * 8) * 60, 290); if (Math.sin(t * 8) > 0.9) tone(rr(300, 900), 0.1, { type: 'triangle', vol: 0.03 }); }
    if (kind === 1) { x.save(); x.translate(170, 240); x.rotate(Math.sin(t * 6) * 0.5); x.font = 'bold 120px sans-serif'; x.fillText('🍌', 0, 40); x.restore(); x.fillStyle = '#5a3a00'; x.font = 'bold 22px sans-serif'; x.fillText('ŠOKAM!', 170, 420); }
    if (kind === 2) { const px = ((t * 120) % 440) - 50; x.fillText('🐔', px, 300 + Math.abs(Math.sin(t * 14)) * -20); x.fillText('🏠', 300, 300); }
    if (kind === 3) { x.font = 'bold 110px sans-serif'; x.fillText('🕰️', 170, 260); x.fillStyle = '#6ab8ff'; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(130 + (i % 2) * 80, 230 + ((t * 80 + i * 40) % 120), 6, 0, 7); x.fill(); } x.fillStyle = '#fff'; x.font = 'bold 22px sans-serif'; x.fillText('buuu…', 170, 400); }
    if (kind === 4) { const p = (t % 3) / 3; if (p < 0.6) x.fillText('🍉', 170, 260); else { for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28, r = (p - 0.6) * 500; x.fillStyle = i % 2 ? '#e8262e' : '#3cc86a'; x.fillRect(170 + Math.cos(a) * r, 240 + Math.sin(a) * r, 14, 14); } x.fillText('💥', 170, 260); } }
    if (kind === 5) { x.fillStyle = '#6ff05a'; const sy = Math.abs(Math.sin(t * 5)) * 30; x.beginPath(); x.arc(170, 200 - sy, 30, 0, 7); x.fill(); x.fillRect(158, 230 - sy, 24, 70); x.strokeStyle = '#6ff05a'; x.lineWidth = 9; x.beginPath(); x.moveTo(160, 245 - sy); x.lineTo(120, 210 - sy + Math.sin(t * 10) * 30); x.moveTo(180, 245 - sy); x.lineTo(220, 210 - sy - Math.sin(t * 10) * 30); x.moveTo(165, 300 - sy); x.lineTo(150, 350); x.moveTo(175, 300 - sy); x.lineTo(190, 350); x.stroke(); }
    if (kind === 6) { x.fillText('🧟', 120 - Math.min(80, t * 20), 280); x.fillText('🕷️', 250, 280 + Math.sin(t * 4) * 10); x.fillStyle = '#fff'; x.font = 'bold 22px sans-serif'; x.fillText('AAAA!', 110, 210); }
    if (kind === 7) { x.fillText('🐄', ((t * 90) % 420) - 40, 200 + Math.sin(t * 3) * 60); x.fillText('☁️', 80, 120); x.fillText('☁️', 260, 160); }
    x.textAlign = 'left'; x.fillStyle = 'rgba(255,255,255,.8)'; x.font = '12px sans-serif'; x.fillText('@atsitiktinis_kanalas', 10, 456);
  });
}
// ---------- the gods' group (after the clock is fixed) ----------
function mpGods(b) {
  Q19.seenGods = true; saveQ19(); mpNotif = '';
  const L = [['Kūrėjas', 'Ei, dievai! Žaliasis žmogeliukas dabar irgi mūsų grupėje!', '#ffe98a'], ['Laiko Dievas', 'Tik tak! Jis pakvietė 10 meistrų, ir jie pataisė mano Praeities Laikrodį. Laikas vėl eina į abi puses!', '#b0ff9a'], ['Saulės Dievė', 'Sveikas atvykęs į grupę, didvyri! ☀', '#ffb86a'], ['Jūrų Dievas', 'Blub blub! Sveikas!', '#8fd8ff'], ['Griaustinio Dievas', 'BUM! Pagaliau! Žaliasi, TAVĘS man reikia. Mano debesų pasaulyje didelė bėda…', '#c8b0ff'], ['Griaustinio Dievas', 'Kai būsi pasiruošęs – parašyk man. BUM BUM!', '#c8b0ff']];
  b.innerHTML = `<div class="mpH">⚡ Dievų grupė</div><div style="display:flex;flex-direction:column">${L.map(([w, t, c]) => `<div style="padding:2px 12px;font-size:12px;font-weight:800;color:${c}">${w}</div><div class="mpMsg them" style="margin-top:0">${t}</div>`).join('')}</div>`;
}
// ---------- the 10 workers arrive and fix the clock ----------
function checkWorkers() {
  if (Q19.stage !== 'phone' || Q19.invited.length < 10 || mode !== 'time' || cinema || card || mPhoneOpen) return;
  setTimeout(fixWithWorkers, 600);
}
function fixWithWorkers() {
  if (Q19.stage !== 'phone' || cinema) return;
  Q19.stage = 'fixing'; const base = TW.past.position.clone().add(new V3(0, 0, 5));
  const ws = Q19.invited.slice(0, 10).map((id, i) => { const p = makePerson(); const a = i / 10 * Math.PI * 2; p.position.set(base.x + Math.cos(a) * 30, 0, base.z + Math.sin(a) * 30); const hm = new THREE.Group(); hm.add(S(G.cyl, mat(0x6a4426), 0.04, 0.6, 0.04, 0, 0.3, 0)); hm.add(S(G.box, mat(0x5a5a62, { metalness: 0.7 }), 0.25, 0.12, 0.12, 0, 0.6, 0)); hm.position.set(0.45, 1.1, 0.1); p.userData.body.add(hm); twScene.add(p); linearize(p); return { p, hm, tgt: new V3(base.x + Math.cos(a) * 3.6, 0, base.z - 3 + Math.sin(a) * 2.6), name: MP_PPL[id].name }; });
  toast('Atvyko 10 meistrų iš tikro pasaulio!', 'Jie taiso Praeities Laikrodį…', '#3cc86a');
  let t = 0;
  cinema = dt => {
    t += dt;
    for (const w of ws) { const d = w.tgt.clone().sub(w.p.position); d.y = 0; if (d.length() > 0.3) { w.p.position.addScaledVector(d.normalize(), Math.min(d.length(), dt * 9)); w.p.rotation.y = Math.atan2(d.x, d.z); } else { w.p.rotation.y = Math.atan2(TW.past.position.x - w.p.position.x, TW.past.position.z - w.p.position.z); w.hm.rotation.x = -Math.abs(Math.sin(t * 8 + w.tgt.x)) * 1.5; } }
    if (t > 3 && Math.random() < dt * 6) { noiseHit(0.08, { f: 2000, fto: 600, vol: 0.06 }); const p = TW.past.position.clone().add(new V3(rr(-2, 2), rr(2, 12), 2)); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffd23a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.setScalar(0.7); sp.position.copy(p); twScene.add(sp); let k = 0; fx.push(d2 => { k += d2; sp.material.opacity = 1 - k * 2; if (k > 0.5) { twScene.remove(sp); return false; } return true; }); }
    if (t > 3 && t < 3.1) bubbleIn(twScene, ws[0].p.position, 'Darbas virs!', 2.4);
    camera.position.lerp(_ct.set(base.x + 14, 9, base.z + 16), Math.min(1, dt * 2)); camera.up.set(0, 1, 0); camera.lookAt(base.x, 5, base.z - 3);
    if (t > 8 && !transitioning) {
      transitioning = true; redFlash('rgba(255,255,255,.9)', 1400); tone(200, 1.5, { to: 1200, type: 'sine', vol: 0.08 });
      fadeTo(() => { transitioning = false; cinema = null; for (const w of ws) twScene.remove(w.p); Q19.stage = 'fixed'; saveQ19(); unPast(); addMoney(2000); mpNotif = '⚡ Nauja žinutė Dievų grupėje: Griaustinio Dievas tavęs ieško!';
        bigBanner('LAIKRODIS PATAISYTAS!', 'Viskas vėl normaliai. Tave pridėjo į Dievų grupę!');
        player.pos.set(0, 0, -8); player.fwd.set(0, 0, -1);
        setTimeout(() => { startTalk('Laiko Dievas', ['TIK TAK! Dešimt meistrų – ir laikrodis eina į abi puses! Praeitis, šiandiena, ateitis – viskas vėl savo vietose!', 'Mano laikrodukai nebeverkia. Ačiū tau!', 'O dabar pažiūrėk į telefoną (P) – tave pridėjo į DIEVŲ GRUPĘ. Rodos, tavęs labai nori Griaustinio Dievas…'], '#b0ff9a'); toast('⚡ Dievų grupė: nauja žinutė!', 'Griaustinio Dievas tavęs ieško. Spausk P', '#c8b0ff'); }, 1800);
      });
    }
  };
}
function unPast() {
  if (!TW.built || !TW.isPast) return; TW.isPast = false;
  twScene.background.setHex(0x2a2050); twScene.fog.color.setHex(0x3a3060);
  TW.ground.material.map = twGroundTex(); TW.ground.material.needsUpdate = true;
  for (const hh of TW.houses) { const x = hh.h.position.x, era = x < -25 ? 0 : x > 25 ? 2 : 1; if (era === hh.era) continue; const n = makeEraHouse(era); n.position.copy(hh.h.position); n.rotation.copy(hh.h.rotation); twScene.remove(hh.h); twScene.add(n); linearize(n); hh.h = n; hh.era = era; }
  for (const tw of TW.towers) twScene.add(tw);
  const CE = [[0, 0x1a1a1a], [1, 0xd8303a], [2, 0x5affff], [0, 0x3a2a1a], [1, 0x3a6ad8], [2, 0xff5ad8]];
  TW.cars.forEach((c, i) => { const [era, col] = CE[i % 6]; if (c.era === era) return; const n = makeEraCar(era, col); twScene.remove(c.m); twScene.add(n); linearize(n); c.m = n; c.era = era; c.sp = era === 0 ? 0.03 : era === 1 ? 0.05 : 0.07; });
  if (NT.wreck) NT.wreck.visible = true; if (NT.saucer) NT.saucer.visible = true;
  $('bAtm').textContent = 'Viskas vėl normaliai: kairėje – praeitis, dešinėje – ateitis. Laikrodžiai vėl linksmi!';
}
function mphoneTest(n) {
  if (mode !== 'time') { hideCard(); enterTime(); }
  Q18.stage = 'done'; saveQ18(); if (TW.built) makeWorldPast();
  Q19.stage = 'phone'; Q19.has = true; Q19.invited = n ? MP_PPL.slice(0, Math.min(10, n)).map(p => p.id) : []; saveQ19(); refreshMPhoneWorld();
  toast('Bandymų pasaulis: telefonas', 'Spausk P. Pakviesta: ' + Q19.invited.length + '/10', '#ffd23a');
}
