// ================= Teleportation – step 6: the TUBE OF PURPLE RAYS (very hard!) =================
// The empty tube waits at the mixing machine in the cave. When you take it, 10 PURPLE RAYS appear on the star.
// They TELEPORT away as soon as you come close (7 m). Hit one with a FIREBALL – it freezes for 4 seconds –
// then run and grab it! And hurry: you have only 5 minutes, otherwise the rays escape from the tube and you start again.
Q26.tubeHave = !!Q26.tubeHave; Q26.tube = !!Q26.tube;
{ const _c = teleCount; teleCount = () => _c() + (Q26.tube ? 1 : 0); }
const TUBE_N = 10, TUBE_TIME = 300, TUBE_POS = new V3(UGC.x - 3, UGC.y, UGC.z + 13.5);
const TB = { tube: null, rays: [], caught: 0, time: TUBE_TIME, hud: null, wait: 0 };
function makeTube(n) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.5, 20, 1, true), mat(0xdff4ff, { transparent: true, opacity: 0.32, roughness: 0.05, side: THREE.DoubleSide })).translateY(0.85));
  g.add(S(G.cyl, mat(0x1a1a1a), 0.33, 0.04, 0.33, 0, 0.1, 0)); g.add(S(G.cyl, mat(0xf4e0a0), 0.36, 0.22, 0.36, 0, 1.68, 0));
  for (const x of [-0.32, 0.32]) g.add(S(G.box, mat(0x1a1a1a), 0.02, 1.5, 0.02, x, 0.85, 0));
  for (let i = 0; i < n; i++) { const s = S(G.cyl, bmat(0xb03ad8), 0.025, rr(0.25, 0.42), 0.025, rr(-0.18, 0.18), 0.3 + (i % 5) * 0.24 + rr(0, 0.1), rr(-0.15, 0.15)); s.rotation.set(rr(-0.4, 0.4), 0, rr(-0.5, 0.5)); g.add(s); }
  return g;
}
function makeRay() {
  const g = new THREE.Group(); const st = S(G.cyl, bmat(0xb03ad8), 0.06, 0.9, 0.06); g.add(st); g.userData.stick = st;
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xc85aff, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(2.4); g.add(gl); g.userData.glow = gl;
  return g;
}
{ const _b = buildStar; buildStar = () => { const first = !ST.built; _b(); if (first) buildTube(); }; }
function buildTube() {
  const t = makeTube(0); t.position.copy(TUBE_POS); stScene.add(t); TB.tube = t;
  // make it easy to see in the dark cave: a purple glow and a light beam from the ceiling
  { const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xc85aff, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(3.2); gl.position.y = 0.9; t.add(gl); TB.glow = gl;
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, 14, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xc85aff, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); beam.position.y = 7; t.add(beam);
    const sg = makeSign('Mėgintuvėlis'); sg.position.set(1.6, 0, 0.6); t.add(sg); }
  linearize(t);
  for (let i = 0; i < TUBE_N; i++) { const r = makeRay(); stScene.add(r); TB.rays.push({ m: r, caught: false, stun: 0, ph: rr(0, 6.28) }); rayJump(TB.rays[i], true); }
  refreshTube();
}
function raySpot(out) { for (let k = 0; k < 40; k++) { const a = rr(0, 6.28), d = rr(14, 105); out.set(Math.cos(a) * d, rr(1.1, 1.6), Math.sin(a) * d); if (onStar(out.x, out.z) && !starHit(out.x, out.z, 1) && !(Math.abs(out.x - ZONE.x) < ZONE_H + 1 && Math.abs(out.z - ZONE.z) < ZONE_H + 1)) return out; } return out; }
function rayJump(r, first) {
  const from = r.m.position.clone();
  if (first) raySpot(r.m.position); else { for (let k = 0; k < 30; k++) { raySpot(_ct); const d = Math.hypot(_ct.x - player.pos.x, _ct.z - player.pos.z); if (d > 15 && d < 40) break; } r.m.position.copy(_ct); }
  if (!first) { for (const p of [from, r.m.position]) { for (let i = 0; i < 8; i++) { const s = S(G.sph, bmat(0xd88aff, { transparent: true, opacity: 0.8 }), 0.12, 0.12, 0.12); s.position.copy(p); stScene.add(s); const v = randDir().multiplyScalar(rr(2, 4)); let life = 0.4; fx.push(d => { life -= d; s.position.addScaledVector(v, d); s.material.opacity = Math.max(0, life * 2); if (life <= 0) { stScene.remove(s); return false; } return true; }); } } tone(rr(1400, 1900), 0.07, { to: 600, type: 'sine', vol: 0.03 }); }
}
const hunting = () => Q26.stage === 'steps' && Q26.tubeHave && !Q26.tube;
function refreshTube() {
  if (!TB.tube) return; TB.tube.visible = Q26.stage === 'steps' && !Q26.tubeHave && !Q26.tube;
  TB.rays.forEach(r => r.m.visible = hunting() && !r.caught);
}
function tubeReset(msg) {
  TB.caught = 0; TB.time = TUBE_TIME; TB.rays.forEach(r => { r.caught = false; r.stun = 0; rayJump(r, true); }); refreshTube();
  if (msg) { redFlash('rgba(176,58,216,.6)', 500); toast('Spinduliai pabėgo! 💨', 'Laikas baigėsi – visi spinduliai iššoko iš mėgintuvėlio ir išsilakstė. Bandyk iš naujo!', '#b03ad8'); }
}
{ const _r = refreshTeleCorner; refreshTeleCorner = () => { _r(); if (Q26.tube && TP.slots) TP.slots[5].add(makeTube(TUBE_N)); }; }
const nearTube = () => TB.tube && TB.tube.visible && isUnder() && Math.hypot(player.pos.x - TUBE_POS.x, player.pos.z - TUBE_POS.z) < 2.2;
{ const _a = starAction; starAction = () => {
    if (card) return _a();
    if (nearTube()) { startTalk('Violetinių spindulių mėgintuvėlis', ['Paėmei TUŠČIĄ MĖGINTUVĖLĮ. Ant jo parašyta: „10 violetinių spindulių“.', 'Violetiniai spinduliai dabar pasirodė ant žvaigždės paviršiaus. Bet jie TELEPORTUOJASI, vos tik prieini arčiau nei 7 metrai!', `Vienintelis būdas: pataikyk į spindulį UGNIES KAMUOLIU (${keyLabel(Q25.key) || 'tavo klavišas'}). Jis sustings 4 sekundėms – tada bėk (Shift) ir pagauk jį!`, 'Ir skubėk: turi tik 5 minutes. Jei nespėsi – spinduliai pabėgs, ir teks pradėti iš naujo.'], '#b03ad8', () => { Q26.tubeHave = true; saveQ26(); tubeReset(false); toast('Medžioklė prasidėjo! ⏱ 5:00', 'Lipk į paviršių ir gaudyk violetinius spindulius', '#b03ad8'); }); return; }
    return _a();
  }; }
{ const _u = updateStar; updateStar = (dt, t) => { _u(dt, t);
    if (!TB.tube) return;
    if (TB.tube.visible) { TB.tube.rotation.y += dt * 0.6; if (TB.glow) TB.glow.material.opacity = 0.6 + Math.sin(t * 4) * 0.25; }
    if (!card && nearTube()) setPrompt('<kbd>E</kbd> paimti tuščią mėgintuvėlį');
    if (!TB.hud) { const d = document.createElement('div'); d.style.cssText = 'position:fixed;top:170px;left:50%;transform:translateX(-50%);background:rgba(36,8,48,.85);color:#f0d8ff;border:1px solid rgba(200,90,255,.5);border-radius:14px;padding:6px 18px;font:700 15px system-ui,sans-serif;z-index:5;pointer-events:none;text-align:center'; document.body.appendChild(d); TB.hud = d; }
    const h = hunting(); TB.hud.hidden = !h || !!card; if (!h) return;
    if (!card && !cinema) TB.time -= dt;
    if (TB.time <= 0) { tubeReset(true); return; }
    const mm = Math.floor(TB.time / 60), ss = Math.floor(TB.time % 60);
    TB.hud.innerHTML = `🧪 Violetiniai spinduliai: <b>${TB.caught}/${TUBE_N}</b> · ⏱ <b style="color:${TB.time < 60 ? '#ff6a6a' : '#fff'}">${mm}:${String(ss).padStart(2, '0')}</b>`;
    for (const r of TB.rays) { if (r.caught) continue; const m = r.m;
      m.userData.stick.rotation.z = Math.sin(t * 3 + r.ph) * 0.5; m.userData.stick.rotation.x = Math.cos(t * 2.3 + r.ph) * 0.4;
      if (r.stun > 0) { r.stun -= dt; m.userData.glow.material.color.setHex(Math.sin(t * 20) > 0 ? 0xffffff : 0xc85aff); m.userData.stick.material = bmat(0x8a8a9a); }
      else { m.userData.glow.material.color.setHex(0xc85aff); m.userData.stick.material = bmat(0xb03ad8); m.position.y = 1.35 + Math.sin(t * 2 + r.ph) * 0.25; }
      const d = Math.hypot(m.position.x - player.pos.x, m.position.z - player.pos.z);
      if (r.stun > 0 && d < 1.4 && Math.abs(player.pos.y - m.position.y) < 2) { r.caught = true; m.visible = false; TB.caught++; tone(1568, 0.15, { type: 'triangle', vol: 0.06 }); tone(2093, 0.15, { type: 'triangle', vol: 0.05, when: 0.08 });
        toast(`Pagavai spindulį! ${TB.caught}/${TUBE_N}`, TB.caught >= TUBE_N ? 'Mėgintuvėlis pilnas!' : 'Dar liko: ' + (TUBE_N - TB.caught), '#b03ad8');
        if (TB.caught >= TUBE_N) { Q26.tube = true; saveQ26(); refreshTube(); refreshTeleCorner(); bigBanner('MĖGINTUVĖLIS PILNAS!', 'Visi 10 violetinių spindulių pagauti'); setTimeout(() => toast('Violetinių spindulių mėgintuvėlis', `Jis atsirado Teleportacijos kampe. Žingsnis ${Q26.step} iš ${TP_STEPS}`, '#b03ad8'), 2600); return; }
        continue; }
      if (r.stun <= 0 && d < 7 && !isUnder()) rayJump(r, false);
    }
    // fireballs freeze the rays
    for (const f of FB.balls) { if (f.sc !== stScene || f.t > 5) continue; for (const r of TB.rays) { if (r.caught || !r.m.visible) continue; if (f.b.position.distanceTo(r.m.position) < 1.7) { r.stun = 4; f.t = 99; tone(300, 0.3, { to: 900, type: 'square', vol: 0.04, lp: 2000 }); toast('Spindulys sustingo! ❄', 'Greitai – 4 sekundės! Bėk (Shift) ir pagauk!', '#b03ad8'); break; } } }
  }; }
fx.push(() => { if (TB.hud && mode !== 'star') TB.hud.hidden = true; return true; });
function tubeTest(n) { zoneTest(); Q26.zkeys = [0, 1, 2, 3]; Q26.card = true; Q26.tubeHave = !!n; Q26.tube = false; saveQ26(); refreshZone(); refreshTele(); tubeReset(false); player.pos.set(0, 0, 30); player.fwd.set(0, 0, -1); toast('Bandymų pasaulis: mėgintuvėlis', n ? 'Medžioklė jau prasidėjo' : 'Tuščias mėgintuvėlis – urve prie aparato', '#b03ad8'); }
// ---------- test world (one time, only on claude.ai – never in the public GitHub game): the empty tube waits in the cave ----------
{ let done = !!window.MODLY_PUBLIC; try { if (localStorage.getItem('modly-tubejump') === '1') done = true; } catch (_) { }
  fx.push(() => {
    if (done || !started || mode === 'attract' || card || cinema || transitioning) return true;
    done = true; try { localStorage.setItem('modly-tubejump', '1'); } catch (_) { }
    if (Q26.tube || Q26.stage === 'done' || Date.now() > Date.UTC(2026, 10, 30)) return true;
    setTimeout(() => { try { hideCard(); tubeTest(0); if (!Q25.key) { Q25.key = 'Digit1'; saveQ25(); } fireKeyRow();
      player.pos.set(TUBE_POS.x + 4, UGC.y, TUBE_POS.z - 3); player.fwd.set(-4, 0, 3).normalize(); player.vel.set(0, 0, 0); player.vr = 0;
      toast('Bandymų pasaulis: mėgintuvėlis', 'Jis čia pat urve – violetinis šviesos stulpas. Spausk E!', '#b03ad8'); } catch (e) { console.error(e); } }, 700);
    return true; }); }
