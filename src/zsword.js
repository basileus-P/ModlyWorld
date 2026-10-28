// ================= The Star Goddess – commandment 4: the GOLDEN SWORD =================
// Ask the little stars around who has a PICKAXE (only one of them has it – the others give hints).
// Then mine the rocks in the underground star cave: hit a rock 3 times (mouse) to break it. 10 of the ~80 rocks
// hide a GOLD NUGGET – they only glint very faintly when you are close. Bring 10 nuggets: the goddess forges the
// golden sword. It hangs in your hand, and key 4 sends a golden slash wave forward.
const Q28 = { stage: 'none', holder: -1, asked: [], pick: false, broken: [], gold: 0, key: null };   // none | pick | mine | done
try { const s = JSON.parse(localStorage.getItem('modly-quest28') || 'null'); if (s) Object.assign(Q28, s); } catch (_) { }
function saveQ28() { try { localStorage.setItem('modly-quest28', JSON.stringify(Q28)); } catch (_) { } }
const GS = { rocks: [], hud: null, pickMesh: null, sword: null, slashReady: 0, goldIdx: [] };
const ROCK_N = 80, GOLD_N = 10;
function makePickaxe() { const g = new THREE.Group(); g.add(S(G.cyl, mat(0x8a5a2a), 0.04, 0.9, 0.04, 0, 0.45, 0)); const h = S(G.box, mat(0x9aa0aa, { metalness: 0.7, roughness: 0.3 }), 0.7, 0.1, 0.1, 0, 0.9, 0); g.add(h); g.add(S(G.cone, mat(0x9aa0aa, { metalness: 0.7 }), 0.06, 0.2, 0.06, 0.42, 0.9, 0).rotateZ(-Math.PI / 2)); g.add(S(G.cone, mat(0x9aa0aa, { metalness: 0.7 }), 0.06, 0.2, 0.06, -0.42, 0.9, 0).rotateZ(Math.PI / 2)); return g; }
function makeGoldSword() {
  const g = new THREE.Group(), gold = mat(0xffd23a, { metalness: 0.9, roughness: 0.2, emissive: 0x6a4a00, emissiveIntensity: 0.4 });
  g.add(S(G.box, gold, 0.07, 1.1, 0.02, 0, 0.75, 0)); g.add(S(G.cone, gold, 0.05, 0.16, 0.02, 0, 1.38, 0)); g.add(S(G.box, mat(0xc89a1a, { metalness: 0.8 }), 0.34, 0.06, 0.06, 0, 0.18, 0));
  g.add(S(G.cyl, mat(0x6a3a1a), 0.035, 0.22, 0.035, 0, 0.05, 0)); g.add(S(G.sph, mat(0xff3a5a, { emissive: 0x8a0a2a }), 0.05, 0.05, 0.05, 0, -0.08, 0));
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffd23a, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.set(0.5, 1.6, 1); gl.position.y = 0.8; g.add(gl);
  return g;
}
function holdItem(mesh) { const arm = player.mesh.userData.parts.armL; if (GS.held) arm.remove(GS.held); GS.held = null; if (mesh) { mesh.position.set(0, -0.7, 0.04); mesh.rotation.x = Math.PI / 2 - 0.2; arm.add(mesh); linearize(mesh); GS.held = mesh; } }
function refreshGoldHeld() { if (Q28.stage === 'done' && Q28.out) { if (!GS.held || GS.held.userData.kind !== 'sword') { const s = makeGoldSword(); s.userData.kind = 'sword'; holdItem(s); } } else if (Q28.pick && Q28.stage === 'mine') { if (!GS.held || GS.held.userData.kind !== 'pick') { const p = makePickaxe(); p.userData.kind = 'pick'; holdItem(p); } } else if (GS.held) holdItem(null); }
setTimeout(() => { try { refreshGoldHeld(); } catch (_) { } }, 0);
// ---------- the rocks in the underground cave ----------
{ const _b = buildStar; buildStar = () => { const first = !ST.built; _b(); if (first) buildMineRocks(); }; }
function buildMineRocks() {
  // the gold rocks are fixed (seeded), so they stay the same after reloading
  let seed = 4242; const rnd2 = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const idx = []; while (idx.length < GOLD_N) { const k = Math.floor(rnd2() * ROCK_N); if (!idx.includes(k)) idx.push(k); } GS.goldIdx = idx;
  for (let i = 0; i < ROCK_N; i++) {
    let x, z, ok = false;
    for (let k = 0; k < 30 && !ok; k++) { const a = rnd2() * Math.PI * 2, r = 5 + rnd2() * (UGC_R - 9); x = UGC.x + Math.cos(a) * r; z = UGC.z + Math.sin(a) * r; ok = Math.hypot(x - UGC_EXIT.x, z - UGC_EXIT.z) > 5 && Math.hypot(x - MIXER_POS.x, z - MIXER_POS.z) > 4 && Math.hypot(x - TUBE_POS.x, z - TUBE_POS.z) > 4 && Math.hypot(x - (UGC.x + 8), z - (UGC.z + 6)) > 7 && !GS.rocks.some(q => Math.hypot(q.x - x, q.z - z) < 2.6); }
    const sz = 0.9 + rnd2() * 0.6, g = new THREE.Group(); g.position.set(x, UGC.y, z); stScene.add(g);
    const rock = S(G.dodec, mat(pick([0x4a4052, 0x3e3646, 0x524858]), { roughness: 1 }), sz, sz * 0.85, sz, 0, sz * 0.7, 0); rock.rotation.set(rnd2() * 3, rnd2() * 3, 0); g.add(rock);
    const gold = idx.includes(i); let glint = null;
    if (gold) { glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffe14d, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); glint.scale.setScalar(0.5); glint.position.set(sz * 0.5, sz * 0.9, sz * 0.4); g.add(glint); }
    const box = { x, z, hx: sz * 0.8, hz: sz * 0.8, h: UGC.y + sz * 1.4 }; ST.ugBoxes.push(box);
    linearize(g); GS.rocks.push({ i, g, rock, x, z, sz, gold, glint, box, hp: 3 });
  }
  refreshRocks();
}
function refreshRocks() { GS.rocks.forEach(r => { const broken = Q28.broken.includes(r.i); r.g.visible = !broken; r.box.h = broken ? -1e9 : UGC.y + r.sz * 1.4; }); }
function rockBreak(r) {
  Q28.broken.push(r.i); r.g.visible = false; r.box.h = -1e9; noiseHit(0.4, { ft: 'lowpass', f: 600, vol: 0.2 });
  for (let i = 0; i < 10; i++) { const s = S(G.dodec, mat(0x4a4052), 0.2, 0.2, 0.2); s.position.set(r.x, UGC.y + 0.8, r.z); stScene.add(s); const v = randDir().multiplyScalar(rr(2, 5)); v.y = Math.abs(v.y) + 2; let life = 0.9; fx.push(d => { life -= d; v.y -= 12 * d; s.position.addScaledVector(v, d); if (s.position.y < UGC.y) { s.position.y = UGC.y; v.set(0, 0, 0); } if (life <= 0) { stScene.remove(s); return false; } return true; }); }
  if (r.gold) { Q28.gold++; [784, 1047, 1319, 1568].forEach((f, k) => tone(f, 0.18, { type: 'triangle', vol: 0.06, when: k * 0.07 })); redFlash('rgba(255,210,58,.45)', 300); toast(`AUKSO GABALAS! ${Q28.gold}/${GOLD_N} ✨`, Q28.gold >= GOLD_N ? 'Visi 10! Nešk auksą Žvaigždžių Dievei' : 'Jis buvo paslėptas akmenyje. Ieškok toliau – auksas vos vos blyksteli…', '#ffd23a'); }
  saveQ28();
}
// mining: hit with the mouse while holding the pickaxe
{ const _h = starHand; starHand = side => {
    if (Q28.stage === 'mine' && Q28.pick && isUnder()) {
      hands[side].hold = true; GS.swing = 0.25;
      const f = new V3(player.fwd.x, 0, player.fwd.z).normalize(); let best = null, bd = 2.6;
      for (const r of GS.rocks) { if (!r.g.visible) continue; const dx = r.x - player.pos.x, dz = r.z - player.pos.z, d = Math.hypot(dx, dz) - r.sz * 0.6; if (d < bd && (dx * f.x + dz * f.z) > -0.3) { bd = d; best = r; } }
      if (!best) { tone(300, 0.05, { type: 'square', vol: 0.02, lp: 800 }); return; }
      best.hp--; best.g.position.x = best.x + rr(-0.08, 0.08); setTimeout(() => { best.g.position.x = best.x; }, 80);
      tone(rr(900, 1300), 0.06, { type: 'square', vol: 0.05, lp: 3000 }); noiseHit(0.08, { f: 2400, vol: 0.1 });
      for (let i = 0; i < 4; i++) { const s = S(G.sph, bmat(0xffe8a0), 0.05, 0.05, 0.05); s.position.set(best.x, UGC.y + best.sz, best.z).addScaledVector(f, -best.sz * 0.6); stScene.add(s); const v = randDir().multiplyScalar(3); let life = 0.3; fx.push(d => { life -= d; s.position.addScaledVector(v, d); if (life <= 0) { stScene.remove(s); return false; } return true; }); }
      if (best.hp <= 0) rockBreak(best); return;
    }
    return _h(side);
  }; }
// ---------- asking the stars for the pickaxe ----------
const PICK_HINTS = ['Kirtiklį? Ne, aš neturiu… Bet girdėjau, kad viena žvaigždutė jį slepia. Klausk kitų!', 'Kirtiklis? Hmm… Aš mačiau jį pas kažką, kas mėgsta šokinėti. Paklausk dar kelių!', 'Ne pas mane! Mano rankutės per mažos kirtikliui.', 'Kirtiklį turi tik viena žvaigždutė visoje žvaigždėje. Ne aš!', 'Ach, kirtiklis… Mano senelis turėjo. Bet ne aš. Klausinėk toliau!'];
{ const _a = starAction; starAction = () => {
    if (card) return _a();
    if (Q28.stage === 'pick') { const k = nearStarKid(); if (k) { const id = ST.kids.indexOf(k); k.hop = 1;
        if (Q28.holder < 0 || Q28.holder >= ST.kids.length) { Q28.holder = Math.floor(Math.random() * ST.kids.length); saveQ28(); }
        if (!Q28.asked.includes(id)) Q28.asked.push(id); saveQ28();
        if (id === Q28.holder || Q28.asked.length >= 8) { startTalk('Žvaigždutė', ['Kirtiklis? Taip! Jis pas mane – saugojau jį labai seniai. Imk! ⛏', 'Kask Žvaigždžių urve. Auksas slepiasi akmenyse… bet jis labai drovus – vos vos blyksteli tik iš arti.'], '#ffe14d', () => { Q28.pick = true; Q28.stage = 'mine'; saveQ28(); refreshGoldHeld(); toast('Gavai kirtiklį! ⛏', 'Lipk į Žvaigždžių urvą ir daužyk akmenis pele (3 smūgiai). Surask 10 aukso gabalų', '#ffd23a'); }); return; }
        startTalk('Žvaigždutė', [PICK_HINTS[id % PICK_HINTS.length] + ` (paklausei jau ${Q28.asked.length})`], '#ffe14d'); return; } }
    if (nearStarGoddess() && Q27.stage === 'done' && Q28.stage !== 'done') {
      if (Q28.stage === 'none') { startTalk('Žvaigždžių Dievė', ['Žaibas, ugnis, teleportacija… Tu stiprėji. Dabar – KETVIRTASIS įsakymas: AUKSINIS KARDAS.', 'Kardą nukalsiu aš pati. Bet man reikia 10 AUKSO GABALŲ iš mano urvo.', 'Aukso negali iškasti rankomis. Tau reikia KIRTIKLIO. Jį turi viena iš mano žvaigždučių – bet kuri? Kalbinkis su jomis!', 'Ir žinok: auksas labai gerai slepiasi. Jis viduje akmenų, ir tik iš arti vos vos blyksteli.'], '#ffe8a0', () => { Q28.stage = 'pick'; Q28.holder = Math.floor(Math.random() * ST.kids.length); Q28.asked = []; saveQ28(); toast('4 įsakymas: Auksinis kardas', 'Klausinėk žvaigždučių, kuri turi kirtiklį', '#ffd23a'); }); return; }
      if (Q28.stage === 'pick') { startTalk('Žvaigždžių Dievė', ['Kirtiklį turi viena iš mano žvaigždučių. Kalbinkis su jomis mieste ir miške!'], '#ffe8a0'); return; }
      if (Q28.gold < GOLD_N) { startTalk('Žvaigždžių Dievė', [`Aukso gabalų: ${Q28.gold} iš ${GOLD_N}. Daužyk akmenis urve – auksas vos vos blyksteli tik iš arti.`], '#ffe8a0'); return; }
      startTalk('Žvaigždžių Dievė', ['Dešimt aukso gabalų… Kaip jie šviečia! Duok juos man.', 'Dabar žiūrėk – aš pati nukalsiu tau kardą.'], '#ffe8a0', forgeSword); return;
    }
    return _a();
  }; }
function forgeSword() {
  hideCard(); for (const k in keys) keys[k] = false; let t = 0; const c = new V3(0, 7, 0); const s = makeGoldSword(); s.scale.setScalar(4); s.position.copy(c); stScene.add(s); linearize(s); s.visible = false;
  cinema = dt => { t += dt; camera.position.lerp(_ct.set(9, 9, 12), Math.min(1, dt * 2)); camera.lookAt(c);
    if (t < 2.4) { if (Math.random() < dt * 10) { zapLine(stScene, ST.wand.getWorldPosition(new V3()), c.clone().add(randDir().multiplyScalar(0.6)), 0xffd23a, 0.15); tone(rr(1000, 1800), 0.05, { type: 'square', vol: 0.03 }); } }
    else { if (!s.visible) { s.visible = true; redFlash('rgba(255,220,80,.9)', 500); [523, 659, 784, 1047, 1319].forEach((f, k) => tone(f, 0.3, { type: 'triangle', vol: 0.07, when: k * 0.08 })); } s.rotation.y += dt * 2; s.position.y = 7 + Math.sin(t * 2) * 0.3; }
    if (t > 5) { cinema = null; stScene.remove(s); Q28.stage = 'done'; Q28.key = 'Digit4'; Q28.out = true; saveQ28(); refreshGoldHeld(); swordKeyRow(); Q24.done = Math.max(Q24.done, 4); saveQ24(); if (ST.board) { ST.board.material.map = boardTex(); ST.board.material.needsUpdate = true; } addMoney(4000);
      bigBanner('4 ĮSAKYMAS ĮVYKDYTAS!', 'Auksinis kardas – klavišas 4'); setTimeout(() => startTalk('Žvaigždžių Dievė', ['Auksinis kardas – tavo. Spausk 4 – ir jis atsiras tavo rankoje (dar kartą 4 – paslėpsi). Pelės mygtuku paleisi auksinę bangą.', 'Liko tik vienas, paskutinis įsakymas… patys sunkiausias.'], '#ffe8a0'), 2600); }
  };
}
// ---------- the golden slash (key 4) ----------
function goldSlash() {
  const now = performance.now(); if (now < GS.slashReady) return; GS.slashReady = now + 1000; const sc = FB.lastScene; if (!sc) return;
  GS.swing = 0.35; tone(500, 0.25, { to: 1500, type: 'triangle', vol: 0.06 }); noiseHit(0.3, { ft: 'bandpass', f: 2000, vol: 0.1 });
  const w = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.12, 6, 24, Math.PI), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.9, depthWrite: false })); const up = mode === 'planet' ? player.up.clone() : new V3(0, 1, 0), f = player.fwd.clone().projectOnPlane(up).normalize();
  w.position.copy(player.pos).addScaledVector(up, 1.1).addScaledVector(f, 1); w.lookAt(w.position.clone().add(f)); w.rotateZ(Math.PI / 2); sc.add(w);
  let life = 0.6; fx.push(d => { life -= d; w.position.addScaledVector(f, d * 22); w.scale.multiplyScalar(1 + d * 1.5); w.material.opacity = Math.max(0, life * 1.5);
    if (mode === 'planet') for (const c of critters) if (c.pos.distanceTo(w.position) < 2.5) knockCritter(c, f, 12);
    if (life <= 0) { sc.remove(w); return false; } return true; });
}
function swordKeyRow() { const k = $('keys'); if (!k || !Q28.key) return; let r = $('swordRow'); if (!r) { r = document.createElement('span'); r.id = 'swordRow'; const lab = document.createElement('span'); lab.id = 'swordLab'; const hEl = [...k.children].find(c => c.innerHTML.includes('<kbd>H</kbd>')); k.insertBefore(lab, hEl || null); k.insertBefore(r, lab); } r.innerHTML = '<kbd>4</kbd>'; $('swordLab').textContent = '🗡 auksinis kardas (išsitraukti / paslėpti · dešinys pelės – banga)'; }
setTimeout(swordKeyRow, 0);
addEventListener('keydown', e => { if (Q28.stage === 'done' && e.code === 'Digit4' && !e.repeat && started && !card && !mPhoneOpen && !cinema && mode !== 'attract' && mode !== 'dig') { Q28.out = !Q28.out; saveQ28(); refreshGoldHeld(); tone(Q28.out ? 900 : 500, 0.15, { to: Q28.out ? 1500 : 300, type: 'triangle', vol: 0.05 }); toast(Q28.out ? 'Auksinis kardas rankoje! 🗡' : 'Kardas paslėptas', Q28.out ? 'Kairys pelės mygtukas – kirsti kardu · dešinys – auksinė banga · 4 – paslėpti' : '4 – vėl išsitraukti kardą', '#ffd23a'); } }, true);
setTimeout(() => { $('c').addEventListener('mousedown', e => { if (e.button === 2 && Q28.stage === 'done' && Q28.out && started && !card && !cinema && !mPhoneOpen && mode !== 'attract' && mode !== 'dig' && !(Q28.stage === 'mine')) goldSlash(); }); }, 0);
fx.push(dt => { if (GS.swing > 0 && player.mesh) { GS.swing -= dt; const a = player.mesh.userData.parts.armL, k = 1 - Math.max(0, GS.swing) / 0.3; a.rotation.x = -2.6 + k * 2.4; } return true; });
// ---------- every frame: glints, prompts, hud ----------
{ const _u = updateStar; updateStar = (dt, t) => { _u(dt, t);
    if (!GS.rocks.length) return;
    if (Q28.stage === 'mine') for (const r of GS.rocks) { if (!r.gold || !r.g.visible) continue; const d = Math.hypot(r.x - player.pos.x, r.z - player.pos.z); r.glint.material.opacity = d < 4.5 && isUnder() ? Math.max(0, Math.sin(t * 3 + r.i)) ** 8 * (1 - d / 4.5) * 0.9 : 0; }
    if (!GS.hud) { const d = document.createElement('div'); d.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);background:rgba(40,30,4,.85);color:#fff4c8;border:1px solid rgba(255,210,58,.5);border-radius:14px;padding:6px 18px;font:700 15px system-ui,sans-serif;z-index:5;pointer-events:none;text-align:center'; document.body.appendChild(d); GS.hud = d; }
    const show = (Q28.stage === 'pick' || Q28.stage === 'mine') && !card; GS.hud.hidden = !show;
    if (show) GS.hud.innerHTML = Q28.stage === 'pick' ? `🗡 4 įsakymas: Auksinis kardas<br>⛏ Kuri žvaigždutė turi kirtiklį? Paklausta: ${Q28.asked.length}` : `🗡 4 įsakymas: Auksinis kardas<br>✨ Aukso gabalai: <b>${Q28.gold}/${GOLD_N}</b> · sudaužyta akmenų: ${Q28.broken.length}`;
    if (!card && Q28.stage === 'pick' && nearStarKid()) setPrompt('<kbd>E</kbd> paklausti apie kirtiklį');
    if (!card && Q28.stage === 'mine' && isUnder()) { const f = new V3(player.fwd.x, 0, player.fwd.z).normalize(); const near = GS.rocks.some(r => r.g.visible && Math.hypot(r.x - player.pos.x, r.z - player.pos.z) - r.sz * 0.6 < 2.6); if (near) setPrompt('Pelės mygtukas – daužyti akmenį kirtikliu (3 smūgiai)'); void f; }
  }; }
fx.push(() => { if (GS.hud && mode !== 'star') GS.hud.hidden = true; return true; });
function swordTest(n) {
  planeTest(3); Q27.stage = 'done'; Q27.key = 'Digit3'; saveQ27(); refreshPlane();
  Q28.stage = n >= 1 ? 'mine' : 'none'; Q28.pick = n >= 1; Q28.broken = []; Q28.gold = n >= 2 ? GOLD_N : 0; Q28.asked = []; saveQ28(); refreshRocks(); refreshGoldHeld();
  if (n === 1) { player.pos.set(UGC_EXIT.x + 2.5, UGC.y, UGC_EXIT.z); player.fwd.set(1, 0, 0); } else player.pos.set(0, 0, 9);
  toast('Bandymų pasaulis: auksinis kardas', ['Kalbėk su Dieve (E)', 'Turi kirtiklį – daužyk akmenis urve', 'Turi 10 aukso – eik pas Dievę'][Math.min(2, n | 0)], '#ffd23a');
}
