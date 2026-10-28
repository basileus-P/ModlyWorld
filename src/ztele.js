// ================= The Star Goddess – commandment 2: TELEPORTATION (8 steps) =================
// Step 1: find the TELEPORT BERRY somewhere in the underground star cave – a red berry with green leaves and an orange "T".
const Q26 = { stage: 'none', step: 0, berry: false, plant: false };   // none | steps | done
try { const s = JSON.parse(localStorage.getItem('modly-quest26') || 'null'); if (s) Object.assign(Q26, s); } catch (_) { }
if (Q26.step >= 1) Q26.berry = true;
function teleCount() { return (Q26.berry ? 1 : 0) + (Q26.plant ? 1 : 0) + (Q26.plum ? 1 : 0); }
function saveQ26() { Q26.step = teleCount();  try { localStorage.setItem('modly-quest26', JSON.stringify(Q26)); } catch (_) { } }
const TP = { berry: null, hud: null }, TP_STEPS = 8;
const BERRY_POS = new V3(UGC.x + 15, UGC.y, UGC.z - 18);
function makeTeleBerry() {
  const g = new THREE.Group();
  g.add(S(G.sph, mat(0xe8202a, { roughness: 0.35, emissive: 0x3a0005 }), 0.55, 0.5, 0.5, 0, 0.55, 0));
  const tm = bmat(0xff8a1a); g.add(S(G.box, tm, 0.42, 0.08, 0.06, 0, 0.75, 0.49)); g.add(S(G.box, tm, 0.08, 0.5, 0.06, 0, 0.5, 0.5));   // the orange "T"
  const stem = S(G.cyl, mat(0x7ad81a), 0.035, 0.6, 0.035, 0.08, 1.3, 0); stem.rotation.z = -0.25; g.add(stem);
  for (const [rz, ry] of [[0.9, 0.4], [-0.6, -0.5], [0.2, 2.6]]) { const l = new THREE.Group(); l.position.set(0.02, 1.0, 0); l.rotation.set(0, ry, rz); g.add(l); l.add(S(G.sph, mat(0x8ae02a, { roughness: 0.6 }), 0.32, 0.06, 0.14, 0.3, 0, 0)); }
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xff5a3a, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(2.4); gl.position.y = 0.6; g.add(gl);
  return g;
}
// ---------- the Teleportation corner: everything you find appears on one tip of the star ----------
const TP_CORNER = (() => { const [x, z] = armDir(3); return new V3(x * 118, 0, z * 118); })();
function makeTelePlant() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.4, 0.7, 14), mat(0xc8642a)).translateY(0.35)); g.add(S(G.cyl, mat(0x4a2a14), 0.5, 0.05, 0.5, 0, 0.68, 0));
  const stem = new THREE.Group(); g.add(stem); for (let i = 0; i < 6; i++) { const seg = S(G.cyl, mat(0x3ac86a), 0.05, 0.3, 0.05, Math.sin(i * 0.9) * 0.08, 0.85 + i * 0.27, Math.cos(i * 0.9) * 0.08); stem.add(seg); const l = S(G.sph, mat(0x5ae88a, { emissive: 0x0a3a1a }), 0.28, 0.04, 0.12, Math.cos(i * 2.1) * 0.25, 0.85 + i * 0.27, Math.sin(i * 2.1) * 0.25); l.rotation.y = -i * 2.1; stem.add(l); }
  const bud = S(G.sph, mat(0x8a5aff, { emissive: 0x5a2aff, emissiveIntensity: 0.8 }), 0.3, 0.38, 0.3, 0, 2.6, 0); g.add(bud);
  for (let i = 0; i < 5; i++) { const p = S(G.sph, mat(0xff8ae8, { emissive: 0x8a2a8a }), 0.22, 0.05, 0.1, Math.cos(i * 1.26) * 0.3, 2.5, Math.sin(i * 1.26) * 0.3); p.rotation.y = -i * 1.26; p.rotation.z = 0.5; g.add(p); }
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xa87aff, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(2.2); gl.position.y = 2.6; g.add(gl);
  return g;
}
function buildTeleCorner() {
  const g = new THREE.Group(); g.position.copy(TP_CORNER); stScene.add(g); TP.corner = g; TP.slots = [];
  g.add(S(G.cyl, mat(0x2a2050, { emissive: 0x1a0a40 }), 9, 0.3, 9, 0, 0.15, 0));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(8.6, 0.15, 6, 48), bmat(0xa87aff)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.32; g.add(ring);
  for (let i = 0; i < TP_STEPS; i++) { const a = i / TP_STEPS * Math.PI * 2, x = Math.cos(a) * 6, z = Math.sin(a) * 6; g.add(S(G.cyl, mat(0xd8d0f0, { emissive: 0x2a2050 }), 0.8, 1, 0.8, x, 0.8, z));
    const q = mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: labelTex(String(i + 1), '#2a2050', '#ffe14d', 128, 128), side: THREE.DoubleSide }), x * 1.22, 0.9, z * 1.22); q.lookAt(TP_CORNER.x + x * 3, 0.9, TP_CORNER.z + z * 3); g.add(q);
    const slot = new THREE.Group(); slot.position.set(x, 1.3, z); g.add(slot); TP.slots.push(slot); ST.boxes.push({ x: TP_CORNER.x + x, z: TP_CORNER.z + z, hx: 0.7, hz: 0.7, h: 1.3 }); }
  const sign = mesh(new THREE.PlaneGeometry(7, 1.2), new THREE.MeshBasicMaterial({ map: labelTex('TELEPORTACIJOS KAMPAS', '#2a2050', '#ffe14d', 640, 110), side: THREE.DoubleSide }), 0, 3.4, 0); g.add(sign); TP.sign = sign;
  g.add(S(G.cyl, mat(0x6a5a8a), 0.1, 3, 0.1, 0, 1.5, 0));
  linearize(g);
}
function refreshTeleCorner() {
  if (!TP.slots) return;
  for (const s of TP.slots) while (s.children.length) s.remove(s.children[0]);
  if (Q26.berry) { const b = makeTeleBerry(); b.scale.setScalar(1.2); TP.slots[0].add(b); }
  TP.sprout = null; if (Q26.plant) { const p = makeTelePlant(); TP.slots[1].add(p); } else if (Q26.bought) { const p = makeTelePlant(); TP.slots[1].add(p); TP.sprout = p; growScale(); }
  if (Q26.plum) { const p = makeTanglePlum(); p.scale.setScalar(1.4); TP.slots[2].add(p); }
  linearize(TP.corner);
}
{ const _b = buildStar; buildStar = () => { const first = !ST.built; _b(); if (first) buildTeleQuest(); }; }
function buildTeleQuest() {
  buildTeleCorner();
  const g = makeTeleBerry(); g.position.copy(BERRY_POS); stScene.add(g); TP.berry = g;
  // tucked away behind a few big rocks near the cave wall
  const rock = mat(0x3a3042, { roughness: 1 });
  for (const [x, z, s] of [[-2.2, 1.5, 1.8], [2, 2, 1.6], [0, 2.8, 1.4], [-2.6, -1, 1.3]]) { stScene.add(S(G.dodec, rock, s, s * 0.9, s, BERRY_POS.x + x, BERRY_POS.y + s * 0.5, BERRY_POS.z + z)); ST.ugBoxes.push({ x: BERRY_POS.x + x, z: BERRY_POS.z + z, hx: s * 0.7, hz: s * 0.7, h: BERRY_POS.y + s * 1.2 }); }
  linearize(g); refreshTele();
}
function refreshTele() { if (TP.berry) TP.berry.visible = Q26.stage === 'steps' && !Q26.berry; refreshTeleCorner(); }
const nearBerry = () => TP.berry && TP.berry.visible && isUnder() && Math.hypot(player.pos.x - BERRY_POS.x, player.pos.z - BERRY_POS.z) < 2.2;
{ const _a = starAction; starAction = () => {
    if (card) return _a();
    if (nearBerry()) { Q26.berry = true; saveQ26(); refreshTele(); [659, 880, 1175].forEach((f, i) => tone(f, 0.18, { type: 'triangle', vol: 0.05, when: i * 0.08 })); redFlash('rgba(255,120,60,.5)', 300);
      startTalk('Teleporto uoga', ['Radai TELEPORTO UOGĄ! Raudona, su žaliais lapeliais ir oranžine T raide. Ji vos vos virpa – lyg norėtų kur nors dingti…', `Žingsnis įvykdytas – jau ${Q26.step} iš ${TP_STEPS}! Uoga dingo iš tavo rankų… ir atsirado ant Teleportacijos kampo – ant vieno žvaigždės kampo!`], '#ff8a3a'); return; }
    if (nearStarGoddess() && Q25.stage === 'done' && Q26.stage !== 'done') {
      if (Q26.stage === 'none') { startTalk('Žvaigždžių Dievė', ['Ugnis jau tavo. Bet tai buvo lengviausias įsakymas…', 'Mano ANTRASIS įsakymas: TELEPORTACIJA. Tu išmoksi akimirksniu dingti ir atsirasti kitur.', `Tai ilgas kelias – net ${TP_STEPS} žingsniai.`, 'Pirmas žingsnis: kažkur mano požeminiame urve auga TELEPORTO UOGA. Ji raudona, su žaliais lapeliais ir oranžine T raide. Surask ją!'], '#ffe8a0', () => { Q26.stage = 'steps'; saveQ26(); refreshTele(); toast('2 įsakymas: Teleportacija', `Žingsnis 1 iš ${TP_STEPS}: surask Teleporto uogą urve`, '#ff8a3a'); }); return; }
      const L = []; if (!Q26.berry) L.push('Teleporto uoga vis dar slepiasi mano urve. Ieškok už akmenų…'); if (Q26.bought && !Q26.plant) L.push(EN ? `Your Teleport plant is still growing in the Teleport Corner. Wait a little longer – ${plantLeft()} left.` : `Tavo Teleporto augalas dar auga Teleportacijos kampe. Palauk – liko ${plantLeft()}.`); else if (!Q26.plant) L.push('Kitas žingsnis: TELEPORTO AUGALAS. Jį parduoda „Kaka“ – bet labai brangiai, net 3000 €. Taupyk!');
      L.push(`Kiekvienas rastas daiktas atsiranda ant mano žvaigždės kampo – Teleportacijos kampe. Jau ${Q26.step} iš ${TP_STEPS}.`); if (!Q26.plum) L.push(`Dar vienas žingsnis: SUSIPAINIOJUSI SLYVA. Ji auga Žvaigždžių miške, ant seno Painiavų medžio. Juodi vijokliai ją laiko… Bet tu juk turi UGNĮ, ar ne? (${keyLabel(Q25.key) || 'tavo klavišas'})`); if (!Q26.permit) L.push('Ir be LEIDIMO teleportuotis negalima! Eik į LEIDIMŲ BIURĄ miesto centre – ponia Antspaudė tau viską paaiškins.'); if (!Q26.card) L.push('O dabar – sunkiau. Už mano sosto yra PAVOJAUS ZONA. Ten šokinėja spalvoti laidai, o viduryje, narve, guli TELEPORTO KELIŲ KORTELĖ. Skraidyti ten negalima… tik šokinėti. Sėkmės!'); if (!Q26.tube) L.push('Ir pats sunkiausias: VIOLETINIŲ SPINDULIŲ MĖGINTUVĖLIS. Tuščias mėgintuvėlis laukia prie maišymo aparato urve. O spinduliai… jie patys TELEPORTUOJASI. Pagauti juos beveik neįmanoma.'); if (!Q26.pod) L.push('O dar sunkiau – TELEPORTO ANKŠTIS. Jos 7 sėklos guli ant skraidančių akmenų ANKŠČIŲ BOKŠTE, kuris kyla į dangų. Ten skraidyti negalima – tik šokinėti. Ir jei nukrisi – visos sėklos sugrįš atgal!'); if (Q26.pod && !Q26.crystal) L.push('Ir paskutinis, aštuntas žingsnis: PORTALŲ LENKTYNĖS. Kai Teleportacijos kampe bus 7 daiktai, stok į jo vidurį ir spausk E. Atsiras 8 portalai – kiekvieną turi pasiekti, kol nespėjo užgesti!'); if (false) L.push('Kiti žingsniai dar laukia… Kai ateis laikas, aš tau pasakysiu. ✨');
      startTalk('Žvaigždžių Dievė', L, '#ffe8a0'); return;
    }
    return _a();
  }; }
{ const _u = updateStar; updateStar = (dt, t) => { _u(dt, t);
    if (TP.berry && TP.berry.visible) { TP.berry.rotation.y += dt * 0.8; TP.berry.position.y = BERRY_POS.y + 0.15 + Math.sin(t * 2) * 0.1; TP.berry.position.x = BERRY_POS.x + Math.sin(t * 23) * 0.015; }
    if (!TP.hud) { const d = document.createElement('div'); d.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);background:rgba(40,8,12,.82);color:#ffe0d0;border:1px solid rgba(255,90,58,.45);border-radius:14px;padding:7px 16px;font:600 14px system-ui,sans-serif;z-index:5;pointer-events:none;text-align:center'; document.body.appendChild(d); TP.hud = d; }
    const show = Q26.stage === 'steps' && !card && Q25.stage === 'done'; TP.hud.hidden = !show;
    if (show) { const c = b => b ? '✅' : '⬜'; TP.hud.innerHTML = `🌀 2 įsakymas: Teleportacija · žingsnis <b>${Q26.step}/${TP_STEPS}</b><br><span style="opacity:.85">${c(Q26.berry)} Teleporto uoga (urve) · ${c(Q26.plant)} Teleporto augalas (${Q26.bought && !Q26.plant ? (EN ? 'growing ' : 'auga ') + plantLeft() : 'Kaka, 3000 €'}) · ${c(Q26.plum)} Susipainiojusi slyva (miške) · ${c(Q26.permit)} Leidimas teleportuotis (Leidimų biuras)<br>${c(Q26.card)} Teleporto kelių kortelė (Pavojaus zona už sosto) · ${c(Q26.tube)} Violetinių spindulių mėgintuvėlis (urve)<br>${c(Q26.pod)} Teleporto ankštis (Ankščių bokštas danguje) · ${c(Q26.crystal)} Portalų lenktynės (Teleportacijos kampas)</span>`; }
    if (!card && nearBerry()) setPrompt('<kbd>E</kbd> paimti Teleporto uogą');
  }; }
fx.push(() => { if (TP.hud && mode !== 'star') TP.hud.hidden = true; return true; });
function teleTest(n) { if (mode !== 'star') { hideCard(); enterStar(); } Q24.met = true; Q24.done = Math.max(1, Q24.done); saveQ24(); Q25.stage = 'done'; saveQ25(); Q26.stage = 'steps'; Q26.berry = n >= 1; Q26.plant = false; Q26.bought = false; Q26.growT = 0; saveQ26(); refreshTele(); if (n >= 1) addMoney(3000); toast('Bandymų pasaulis: teleportacija', 'Teleporto uoga – urve, už akmenų', '#ff8a3a'); }

// ---------- step 2: the TELEPORT PLANT in the phone shop "Kaka" (only after you took the commandment) ----------
{ const _k = mpKaka; mpKaka = b => { _k(b);
    if (Q26.stage !== 'steps') return;
    const row = document.createElement('div'); row.className = 'mpRow'; row.style.cursor = 'default';
    row.innerHTML = `<div class="mpIco" style="background:#5a2aaa;width:52px;height:52px">🪴</div><div style="flex:1"><div style="font-weight:800">Teleporto augalas</div><div class="mpSmall" style="padding:0">Retas augalas iš tolimų žvaigždžių. Jo žiedas virpa ir dingsta. 3000 €</div></div>${Q26.plant ? '<b style="color:#3cc86a">Turi ✅</b>' : Q26.bought ? `<b style="color:#a87aff">${EN ? 'Growing…' : 'Auga…'} ${plantLeft()}</b>` : '<button class="mpBtn gold" id="kkPlant">3000 €</button>'}`;
    const msg = b.querySelector('#kkMsg'); b.insertBefore(row, msg ? msg.previousElementSibling : null);
    if ($('kkPlant')) $('kkPlant').onclick = () => { if (money < 3000) { $('kkMsg').textContent = `Teleporto augalas kainuoja 3000 €, o tu turi ${Math.floor(money)} €. Taupyk!`; return; }
      addMoney(-3000); Q26.bought = true; Q26.growT = 0; saveQ26(); refreshTeleCorner(); sfx.chime(); mpShow('kaka', true);
      toast('Teleporto augalas nupirktas! 🪴', EN ? 'It was planted in the Teleport Corner. Now it must GROW – wait 3 minutes!' : 'Jis pasodintas Teleportacijos kampe. Dabar jis turi UŽAUGTI – palauk 3 minutes!', '#a87aff'); };
  }; }

// ---------- the Teleport plant has to GROW for 3 minutes after you buy it ----------
const PLANT_GROW = 180;
function plantLeft() { const r = Math.max(0, Math.ceil(PLANT_GROW - (Q26.growT || 0))); return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}`; }
function growScale() { if (!TP.sprout) return; const k = Math.min(1, (Q26.growT || 0) / PLANT_GROW); TP.sprout.scale.setScalar(0.15 + k * 0.85); }
{ let saveT = 0; fx.push(dt => {
    if (!Q26.bought || Q26.plant || !started || mode === 'attract') return true;
    const pz = document.getElementById('paused'); if (pz && !pz.hidden) return true;
    Q26.growT = (Q26.growT || 0) + Math.min(dt, 0.5); growScale(); saveT += dt; if (saveT > 5) { saveT = 0; saveQ26(); }
    if (Q26.growT >= PLANT_GROW) { Q26.plant = true; saveQ26(); refreshTeleCorner(); sfx.chime();
      toast(EN ? 'The Teleport plant has grown! 🪴' : 'Teleporto augalas užaugo! 🪴', EN ? `Its flower trembles and blinks. Step ${Q26.step} of ${TP_STEPS}` : `Jo žiedas virpa ir mirksi. Žingsnis ${Q26.step} iš ${TP_STEPS}`, '#a87aff'); }
    return true; }); }
