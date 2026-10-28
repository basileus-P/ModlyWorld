// ================= after the demon: the Creator's giant phone =================
// in the Creator's hall stands a huge phone. In the gods' group chat the Creator tells all the other gods
// that the little green man saved his world from the demon.
let phoneRead = false; try { phoneRead = localStorage.getItem('modly-phone-read') === '1'; } catch (_) { }
const PHONE = { pos: new V3(-5.5, 0, -13), g: null };
let phoneOpen = false, phoneTimers = [];
function buildGodPhone() {
  const g = new THREE.Group(); g.position.copy(PHONE.pos); g.rotation.y = 0.45; sanc.add(g); PHONE.g = g;
  const body = new THREE.Group(); body.rotation.x = -0.12; body.position.y = 0.2; g.add(body); PHONE.body = body;
  body.add(S(G.box, mat(0x1a1a24, { metalness: 0.6, roughness: 0.3 }), 2.6, 5.0, 0.35, 0, 2.6, 0));
  body.add(S(G.box, mat(0xffd23a, { metalness: 0.8, roughness: 0.25 }), 2.75, 5.15, 0.25, 0, 2.6, -0.02));
  const c = document.createElement('canvas'); c.width = 256; c.height = 480; const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 0, 480); gr.addColorStop(0, '#2a1a5a'); gr.addColorStop(1, '#0a1a3a'); x.fillStyle = gr; x.fillRect(0, 0, 256, 480);
  x.fillStyle = '#ffd23a'; x.font = "bold 26px 'Lilita One', sans-serif"; x.textAlign = 'center'; x.fillText('Dievų grupė', 128, 48);
  const bub = (y, w, col, right) => { x.fillStyle = col; const bx = right ? 236 - w : 20; x.beginPath(); x.roundRect ? x.roundRect(bx, y, w, 40, 14) : x.rect(bx, y, w, 40); x.fill(); };
  bub(80, 190, '#ffe98a', true); bub(132, 150, '#ffe98a', true); bub(184, 170, '#8fd8ff', false); bub(236, 130, '#ff9ee8', false); bub(288, 180, '#b0ff9a', false); bub(340, 140, '#ffe98a', true);
  x.fillStyle = '#ffffff'; x.font = "bold 22px sans-serif"; x.fillText('1 nauja žinutė', 128, 430);
  const scr = mesh(new THREE.PlaneGeometry(2.3, 4.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }), 0, 2.6, 0.18); body.add(scr);
  body.add(S(G.cyl, mat(0x30303a), 0.12, 0.05, 0.12, 0.6, 4.95, 0.18).rotateX(Math.PI / 2));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffe98a, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })); glow.scale.setScalar(7); glow.position.y = 2.8; g.add(glow); PHONE.glow = glow;
  g.add(S(G.box, mat(0x3a2a5a), 1.6, 0.4, 1.2, 0, 0.2, 0.3));
  linearize(g);
  sancAnim.push((dt, t) => {
    if (!g.visible) return;
    if (phoneUnread() && !PHONE.toasted && mode === 'sanctum') { PHONE.toasted = true; setTimeout(() => toast('Kūrėjo telefonas vibruoja!', 'Didelis telefonas salėje – nauja žinutė dievų grupėje (E)', '#ffe98a'), 1500); }
    const buzz = phoneUnread() && Math.floor(t * 1.5) % 2 === 0;
    body.position.x = buzz ? Math.sin(t * 60) * 0.05 : 0; glow.material.opacity = !phoneUnread() ? 0.2 : 0.3 + 0.2 * Math.sin(t * 6);
    if (buzz && Math.random() < dt * 4 && player.pos.distanceTo(g.position) < 25) tone(140, 0.08, { type: 'square', vol: 0.03, lp: 600 });
  });
  refreshGodPhone();
}
function refreshGodPhone() { if (PHONE.g) PHONE.g.visible = Q14.stage === 'done'; }
const phoneNear = () => PHONE.g && PHONE.g.visible && Math.hypot(player.pos.x - PHONE.pos.x, player.pos.z - PHONE.pos.z) < 4;
function godChatLines() {
  const L = [
    ['Kūrėjas', 'Labas visiems dievams! Turiu labai didelę naujieną.', 'me'],
    ['Kūrėjas', 'Mano pasaulį burbule ilgai griovė demonas. Meteoritai, milžinai, daiktų lietus… Chaosas kiekvieną dieną.', 'me'],
    ['Kūrėjas', 'Bet atsirado mažas, plonas, ŽALIAS žmogeliukas. Jis įvykdė visus mano dvylika įsakymų – ir NUGALĖJO DEMONĄ!', 'me'],
    ['Kūrėjas', '__photo__', 'me'],
    ['Jūrų Dievas', 'Žalias žmogeliukas?! Tas mažiukas su antenėle? Negali būti!', '#8fd8ff'],
    ['Saulės Dievė', 'Kokia graži naujiena! Siunčiu jam daug šilumos ir saulės spindulių.', '#ffb86a'],
    ['Griaustinio Dievas', 'BUM! BUM! …Atsiprašau. Norėjau pasakyti – BRAVO!', '#c8b0ff'],
    ['Laiko Dievas', 'Aš jį mačiau ir praeityje pas urvinius, ir ateityje Vagių banke. Šaunuolis visais laikais.', '#b0ff9a'],
    ['Žvaigždžių Dievė', S15.stage === 'done' ? 'Jis net atskrido pas mane į kosmosą ir pasiėmė vieną mano žvaigždę. Tegul pasilieka – jis nusipelnė!' : 'Mano žvaigždės irgi apie jį šnabžda. Gal kada nors jis ir pas mane atskris…', '#ffe14d'],
    ['Vėjo Dievas', 'Fiuuu! Papūsiu jam į nugarą, kad visada greitai bėgtų.', '#d8f0ff'],
    ['Kūrėjas', 'Nuo šiol mano pasaulyje – ramybė. Vienaragiai, katės, vorai, debesų princas – visi saugūs. Ačiū tau, žaliasis!', 'me'],
    ['Jūrų Dievas', 'Kūrėjau, paklausk jo – gal jis ir pas mane norėtų atvykti? Mano pasaulis – vien vanduo, ir ne viskas jame gerai…', '#8fd8ff'],
    ['Kūrėjas', 'Žaliasi, girdėjai? Prie miesto atsivėrė JŪROS VARTAI. Įvažiuok į juos mašina – ir būsi pas Jūrų Dievą.', 'me'],
    ['Visi dievai', 'VALIO ŽALIAJAM ŽMOGELIUKUI! VALIO! VALIO!', 'all']
  ];
  return L;
}
function openGodPhone() {
  let el = $('godPhone');
  if (!el) {
    el = document.createElement('div'); el.id = 'godPhone';
    el.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:6;width:min(380px,calc(100vw - 32px));height:min(680px,calc(100vh - 32px));background:#111118;border:6px solid #ffd23a;border-radius:38px;box-shadow:0 20px 60px rgba(0,0,0,.6);display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box';
    el.innerHTML = '<div style="height:26px;display:flex;justify-content:center;align-items:center"><div style="width:90px;height:8px;border-radius:4px;background:#30303a"></div></div>' +
      '<div style="padding:8px 16px 10px;border-bottom:1px solid #2a2a38;display:flex;align-items:center;gap:10px"><div id="gpAva" style="width:40px;height:40px;border-radius:50%;background:radial-gradient(#fff6c8,#ffd23a);flex:none"></div><div style="flex:1;min-width:0"><div id="gpTitle" style="font-weight:800;font-size:17px;color:#fff">Dievų grupė</div><div id="gpSub" style="font-size:12px;color:#9a9ab0">7 dievai</div></div><button id="gpClose" style="font:inherit;background:#2a2a38;color:#ddd;border:none;border-radius:10px;padding:6px 10px;cursor:pointer">Uždaryti</button></div>' +
      '<div id="gpLog" style="flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:linear-gradient(#17142a,#0e1220)"></div>' +
      '<div style="padding:10px 14px;border-top:1px solid #2a2a38;color:#6a6a80;font-size:13px">Tik dievai gali rašyti šioje grupėje</div>';
    document.body.appendChild(el);
    $('gpClose').onclick = e => { e.stopPropagation(); closeGodPhone(); };
  }
  phoneRead = true; try { localStorage.setItem('modly-phone-read', '1'); } catch (_) { } if (Q16.stage === 'done') { phoneRead2 = true; try { localStorage.setItem('modly-phone-read2', '1'); } catch (_) { } } if (typeof refreshSeaGate === 'function') refreshSeaGate();
  phoneOpen = true; el.hidden = false; $('paused').hidden = true; for (const k in keys) keys[k] = false;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  const log = $('gpLog'); log.innerHTML = ''; phoneTimers.forEach(clearTimeout); phoneTimers = [];
  // in the sea it is the SEA GOD's own phone: his messages are on the right, the Creator is just one of the others
  const seaPh = mode === 'sea', sunPh = mode === 'sun';
  el.style.borderColor = seaPh ? '#4ac8ff' : sunPh ? '#ff8a10' : '#ffd23a';
  $('gpAva').style.background = seaPh ? 'radial-gradient(#dff8ff,#2a8ad8)' : sunPh ? 'radial-gradient(#fff6c8,#ff8a10)' : 'radial-gradient(#fff6c8,#ffd23a)';
  $('gpTitle').textContent = seaPh ? 'Jūrų Dievo telefonas' : sunPh ? 'Saulės Dievės telefonas' : 'Dievų grupė'; $('gpSub').textContent = seaPh || sunPh ? 'Dievų grupė · 7 dievai' : '7 dievai';
  const lines = sunPh ? sunPhoneLines() : seaPh ? oceanPhoneLines().filter(l => l[2] !== 'sep').map(([w, tx, c]) => w === 'Jūrų Dievas' ? [w, tx, 'me'] : c === 'me' ? [w, tx, '#ffe98a'] : [w, tx, c])
    : godChatLines().concat(oceanPhoneLines());
  let delay = 300;
  lines.forEach((ln, i) => {
    phoneTimers.push(setTimeout(() => {
      const typing = document.createElement('div'); typing.style.cssText = 'align-self:' + (ln[2] === 'me' ? 'flex-end' : 'flex-start') + ';color:#9a9ab0;font-size:13px;padding:2px 6px'; typing.textContent = (ln[0] === 'Kūrėjas' ? 'Kūrėjas' : ln[0]) + ' rašo…'; log.appendChild(typing); log.scrollTop = 1e6;
      phoneTimers.push(setTimeout(() => { typing.remove(); addPhoneMsg(log, ln); }, 650));
    }, delay));
    delay += ln[1].length * 22 + 900;
  });
}
function addPhoneMsg(log, [who, text, col]) {
  if (col === 'sep') { const d = document.createElement('div'); d.textContent = text; d.style.cssText = 'align-self:center;color:#ffd23a;font-size:12px;font-weight:800;margin:8px 0'; log.appendChild(d); log.scrollTop = 1e6; tone(1200, 0.1, { type: 'triangle', vol: 0.05 }); return; }
  const me = col === 'me', all = col === 'all';
  const wrap = document.createElement('div'); wrap.style.cssText = 'display:flex;flex-direction:column;max-width:82%;align-self:' + (me ? 'flex-end' : all ? 'center' : 'flex-start');
  if (!me) { const n = document.createElement('div'); n.textContent = who; n.style.cssText = 'font-size:12px;font-weight:800;margin:0 8px 2px;color:' + (all ? '#ffd23a' : col); wrap.appendChild(n); }
  const b = document.createElement('div');
  if (text === '__photo__') {
    b.innerHTML = '<svg viewBox="0 0 160 120" width="200" style="display:block;border-radius:12px;background:linear-gradient(#6fc4ff,#cdeeff)"><circle cx="130" cy="22" r="12" fill="#ffe14d"/><rect x="0" y="92" width="160" height="28" fill="#6cd85e"/><circle cx="80" cy="44" r="14" fill="#6ff05a"/><rect x="73" y="56" width="14" height="30" rx="5" fill="#6ff05a"/><rect x="66" y="58" width="5" height="22" rx="2" fill="#3fb33a" transform="rotate(25 68 58)"/><rect x="89" y="58" width="5" height="22" rx="2" fill="#3fb33a" transform="rotate(-25 92 58)"/><rect x="74" y="84" width="5" height="16" rx="2" fill="#3fb33a"/><rect x="81" y="84" width="5" height="16" rx="2" fill="#3fb33a"/><circle cx="75" cy="44" r="2" fill="#111"/><circle cx="85" cy="44" r="2" fill="#111"/><line x1="80" y1="30" x2="80" y2="22" stroke="#3fb33a" stroke-width="2"/><circle cx="80" cy="20" r="3" fill="#ffe14d"/><path d="M30 96 l14 -26 l10 26 z" fill="#7a2030"/><text x="80" y="114" font-size="10" text-anchor="middle" fill="#1a3a10" font-family="sans-serif" font-weight="bold">Mano didvyris!</text></svg>';
    b.style.cssText = 'padding:6px;border-radius:16px;background:#ffe98a';
  } else {
    b.textContent = text;
    b.style.cssText = 'padding:9px 12px;border-radius:16px;font-size:15px;line-height:1.35;color:#1a1a24;background:' + (me ? (mode === 'sea' ? '#bfe8ff' : mode === 'sun' ? '#ffd8a0' : '#ffe98a') : all ? 'linear-gradient(90deg,#ffd23a,#ff9ee8,#8fd8ff)' : '#e8e8f2') + (all ? ';font-weight:800;text-align:center' : '');
  }
  wrap.appendChild(b); log.appendChild(wrap); log.scrollTop = 1e6;
  tone(me ? 880 : 660, 0.08, { type: 'triangle', vol: 0.04 }); tone(me ? 1320 : 990, 0.08, { type: 'triangle', vol: 0.03, when: 0.06 });
  if (all) [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.4, { type: 'triangle', vol: 0.06, when: i * 0.1 }));
}
function closeGodPhone() { if (phoneOpen && seaOpen() && !SEA.told) { SEA.told = true; setTimeout(() => toast('Prie miesto atsivėrė Jūros vartai!', 'Įvažiuok į juos mašina – ir būsi pas Jūrų Dievą', '#4ac8ff'), 600); } const wasOpen = phoneOpen; phoneOpen = false; phoneTimers.forEach(clearTimeout); phoneTimers = []; const el = $('godPhone'); if (el) el.hidden = true; if (!lockFailed) requestLock(); if (wasOpen && mode === 'sea' && Q16.stage === 'done' && !inSun()) setTimeout(sunPickup, 900); if (wasOpen && mode === 'sun' && Q17.stage === 'done' && !inTime()) setTimeout(timePickup, 900); }
