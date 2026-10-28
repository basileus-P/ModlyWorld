// ================= The Sun Goddess's request: the GHOST WAR =================
// Ghosts attacked the Sun and her little ray people. She gives you the SUN SWORD. Hundreds of ghosts roam the Sun;
// near the Goddess it is safe. Far away stands the Ghost Castle with the GHOST KING (350 HP, hits 1/2/3 – like the demon).
// You have 30 HP. The sword does 1/3/5/10/15 and sometimes +20 extra – but only up close.
// Ordinary ghosts have 30 HP (like you) and hit 1/2/3.
const Q17 = { stage: 'none', kills: 0 };   // none | fight | done
try { const s = JSON.parse(localStorage.getItem('modly-quest17') || 'null'); if (s) Object.assign(Q17, s); } catch (_) { }
function saveQ17() { try { localStorage.setItem('modly-quest17', JSON.stringify(Q17)); } catch (_) { } }
const GW = { ghosts: [], built: false, php: 30, regenT: 0, swingCD: 0, swingT: 0, king: null, kingFight: false, orbs: [], castle: null, gateBox: null, gateM: null, sword: null };
const SAFE_C = new V3(0, 0, -6), SAFE_R = 44, CASTLE_C = new V3(0, 0, -205);
const GDMG = [1, 3, 5, 10, 15];
let ghostTex = null;
function makeGhostTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 50, 10, 64, 60, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.7, 'rgba(220,235,255,.95)'); g.addColorStop(1, 'rgba(180,200,255,.85)');
  x.fillStyle = g; x.beginPath(); x.moveTo(20, 120); x.lineTo(20, 56); x.arc(64, 56, 44, Math.PI, 0); x.lineTo(108, 120);
  for (let i = 0; i < 4; i++) x.quadraticCurveTo(108 - i * 22 - 5, 100, 108 - i * 22 - 11, 120), x.quadraticCurveTo(108 - i * 22 - 16, 104, 108 - (i + 1) * 22, 120);
  x.closePath(); x.fill();
  x.fillStyle = '#1a1030'; for (const ex of [48, 80]) { x.beginPath(); x.ellipse(ex, 54, 9, 13, 0, 0, Math.PI * 2); x.fill(); }
  x.beginPath(); x.ellipse(64, 84, 10, 8, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#7dffb0'; for (const ex of [50, 82]) { x.beginPath(); x.arc(ex, 51, 3, 0, Math.PI * 2); x.fill(); }
  return new THREE.CanvasTexture(c);
}
function makeSunSword() {
  const g = new THREE.Group(), gold = mat(0xffd23a, { metalness: 0.8, roughness: 0.2, emissive: 0x6a4a00 }), blade = new THREE.MeshStandardMaterial({ color: 0xfff4c0, emissive: 0xffc040, emissiveIntensity: 0.8, metalness: 0.6, roughness: 0.2 });
  g.add(S(G.box, blade, 0.1, 1.15, 0.03, 0, 0.75, 0)); g.add(S(G.cone, blade, 0.07, 0.18, 0.02, 0, 1.4, 0));
  g.add(S(G.box, gold, 0.42, 0.07, 0.08, 0, 0.16, 0)); g.add(S(G.cyl, mat(0x8a3a10), 0.04, 0.24, 0.04, 0, 0.02, 0)); g.add(S(G.sph, gold, 0.07, 0.07, 0.07, 0, -0.12, 0));
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; g.add(S(G.cone, gold, 0.03, 0.08, 0.02, Math.cos(a) * 0.09, 0.16 + Math.sin(a) * 0.09, 0.05).rotateZ(a - Math.PI / 2)); }
  return g;
}
function attachSunSword(on) {
  const hand = player.mesh.userData.parts.armR;   // (the hand ball itself is scaled down – hang the sword on the arm)
  if (on && !GW.sword) { const s = makeSunSword(); s.position.set(0, -0.7, 0.04); s.rotation.x = Math.PI / 2 - 0.2; hand.add(s); linearize(s); GW.sword = s; }
  if (!on && GW.sword) { hand.remove(GW.sword); GW.sword = null; }
}
const hasSword = () => Q17.stage === 'fight' || Q17.stage === 'done';
function sunDmgNum(pos, n, col) {
  const c = document.createElement('canvas'); c.width = 160; c.height = 64; const x = c.getContext('2d'); x.font = "bold 46px 'Lilita One', sans-serif"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 6; x.strokeStyle = '#000'; x.strokeText(n, 80, 34); x.fillStyle = col; x.fillText(n, 80, 34);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false })); s.scale.set(2, 0.8, 1); sunScene.add(s);
  let t = 0; fx.push(dt => { t += dt; s.position.copy(pos).add(new V3(0, t * 1.5, 0)); s.material.opacity = Math.max(0, 1 - t); if (t > 1) { sunScene.remove(s); return false; } return true; });
}
function sunPuff(p, col, n = 8, sc = 0.5) {
  const parts = []; for (let i = 0; i < n; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); m.scale.setScalar(sc * 2); m.position.copy(p).add(randDir().multiplyScalar(0.6)); sunScene.add(m); parts.push({ m, v: randDir().multiplyScalar(rr(1, 4)) }); }
  let t = 0; fx.push(dt => { t += dt; for (const q of parts) { q.m.position.addScaledVector(q.v, dt); q.m.material.opacity = Math.max(0, 1 - t * 1.4); } if (t > 0.75) { parts.forEach(q => sunScene.remove(q.m)); return false; } return true; });
}
// ---------- the HUD: your health, kills and the king ----------
function ghostHud() {
  let el = $('ghostHud');
  if (!el) {
    el = document.createElement('div'); el.id = 'ghostHud';
    el.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:3;width:min(460px,calc(100vw - 200px));display:flex;flex-direction:column;gap:5px;pointer-events:none;font-weight:800;text-shadow:0 2px 4px #000';
    el.innerHTML = '<div id="ghKingRow"><div style="display:flex;justify-content:space-between;color:#9affc8"><span>VAIDUOKLIŲ KARALIUS</span><span id="ghKingN"></span></div><div style="height:14px;background:rgba(0,0,0,.5);border-radius:8px;overflow:hidden"><div id="ghKing" style="height:100%;background:linear-gradient(90deg,#3affa0,#a0fff0)"></div></div></div>' +
      '<div style="display:flex;justify-content:space-between;color:#ffe14d"><span>TU · Saulės kardas</span><span id="ghMeN"></span></div><div style="height:12px;background:rgba(0,0,0,.5);border-radius:8px;overflow:hidden"><div id="ghMe" style="height:100%;background:linear-gradient(90deg,#ffb020,#ffe14d)"></div></div>';
    document.body.appendChild(el);
  }
  const show = mode === 'sun' && Q17.stage === 'fight';
  el.hidden = !show; if (!show) return;
  $('ghKingRow').hidden = !GW.kingFight;
  if (GW.kingFight) { $('ghKing').style.width = Math.max(0, GW.king.hp / 350 * 100) + '%'; $('ghKingN').textContent = `${Math.max(0, GW.king.hp)} / 350`; }
  $('ghMe').style.width = Math.max(0, GW.php / 30 * 100) + '%'; $('ghMeN').textContent = `${Math.max(0, Math.ceil(GW.php))} / 30`;
}
// ---------- building the ghost army and the castle ----------
function buildGhostWar() {
  if (GW.built) return; GW.built = true;
  ghostTex = makeGhostTex();
  // the Ghost Castle
  { const g = new THREE.Group(); g.position.copy(CASTLE_C); sunScene.add(g); GW.castle = g;
    const st = mat(0x2e2840, { roughness: 0.9 }), st2 = mat(0x3a3450, { roughness: 0.9 }), glowM = new THREE.MeshBasicMaterial({ color: 0x5affa8 });
    const W = 22, D = 20, H = 9, door = 3.5;
    const wall = (x0, x1, z0, z1, h = H, m = st) => { g.add(S(G.box, m, x1 - x0, h, z1 - z0, (x0 + x1) / 2, h / 2, (z0 + z1) / 2)); SUN.boxes.push({ x: CASTLE_C.x + (x0 + x1) / 2, z: CASTLE_C.z + (z0 + z1) / 2, hx: (x1 - x0) / 2, hz: (z1 - z0) / 2, h: 99 }); };
    wall(-W, W, -D - 1, -D); wall(-W - 1, -W, -D, D + 1); wall(W, W + 1, -D, D + 1); wall(-W, -door, D, D + 1); wall(door, W, D, D + 1);
    for (let i = 0; i < 22; i++) { const x = -W + 1 + i * 2; g.add(S(G.box, st2, 1.1, 1.2, 1.1, x, H + 0.6, D + 0.5)); g.add(S(G.box, st2, 1.1, 1.2, 1.1, x, H + 0.6, -D - 0.5)); }
    for (const [x, z] of [[-W, -D], [W, -D], [-W, D], [W, D]]) { g.add(S(G.cyl, st2, 3, 16, 3, x, 8, z)); g.add(S(G.cone, mat(0x1a1428), 3.8, 6, 3.8, x, 19, z)); for (let k = 0; k < 3; k++) g.add(S(G.box, glowM, 0.6, 1, 0.1, x, 5 + k * 4, z + 3.02)); }
    // the big keep at the back with the king's throne
    g.add(S(G.box, st2, 14, 18, 8, 0, 9, -D + 4)); g.add(S(G.cone, mat(0x1a1428), 9, 8, 6, 0, 22, -D + 4)); for (const x of [-4, 0, 4]) g.add(S(G.box, glowM, 1, 2, 0.1, x, 12, -D + 8.06));
    SUN.boxes.push({ x: CASTLE_C.x, z: CASTLE_C.z - D + 4, hx: 7, hz: 4, h: 99 });
    g.add(S(G.box, mat(0x1a1428), 4, 3, 2, 0, 1.5, -D + 9)); g.add(S(G.box, mat(0x1a1428), 4, 5, 0.5, 0, 4, -D + 8.2));
    // the gate (a portcullis that drops when the king fight starts)
    const gate = new THREE.Group(); gate.position.set(0, 10, D + 0.5); g.add(gate); for (let i = -3; i <= 3; i++) gate.add(S(G.box, mat(0x1a1a22, { metalness: 0.6 }), 0.15, 7, 0.15, i * 1.05, 3.5, 0)); for (let j = 0; j < 5; j++) gate.add(S(G.box, mat(0x1a1a22, { metalness: 0.6 }), 7, 0.12, 0.12, 0, 0.7 + j * 1.4, 0)); GW.gateM = gate;
    GW.gateBox = { x: CASTLE_C.x, z: CASTLE_C.z + D + 0.5, hx: door, hz: 0.4, h: 99 };
    // spooky green glow and a sign
    const l = new THREE.PointLight(0x5affa8, 1.2, 40); l.position.set(0, 8, 0); g.add(l);
    const sign = mesh(new THREE.PlaneGeometry(10, 1.6), new THREE.MeshBasicMaterial({ map: labelTex('VAIDUOKLIŲ PILIS', '#1a1428', '#7dffb0', 640, 100), side: THREE.DoubleSide }), 0, H + 2.5, D + 1.1); g.add(sign);
    linearize(g);
  }
  // the Ghost King
  { const k = new THREE.Group(); const body = new THREE.MeshStandardMaterial({ color: 0xe8f4ff, emissive: 0x6a8aaa, emissiveIntensity: 0.6, transparent: true, opacity: 0.88, roughness: 0.4 });
    k.add(S(G.sph, body, 2.2, 2.2, 2.2, 0, 4.6, 0)); k.add(S(G.cone, body, 2.4, 4.2, 2.4, 0, 2.4, 0).rotateX(Math.PI));
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; k.add(S(G.cone, body, 0.5, 1, 0.5, Math.cos(a) * 1.6, 0.3, Math.sin(a) * 1.6).rotateX(Math.PI)); }
    for (const x of [-0.75, 0.75]) { k.add(S(G.sph, bmat(0x0a0614), 0.45, 0.6, 0.2, x, 4.9, 1.95)); k.add(S(G.sph, bmat(0x5affa8), 0.16, 0.16, 0.1, x, 4.95, 2.12)); }
    k.add(S(G.sph, bmat(0x0a0614), 0.6, 0.45, 0.2, 0, 3.8, 2.0));
    const arms = []; for (const sx of [-1, 1]) { const a = new THREE.Group(); a.position.set(sx * 2, 4, 0); k.add(a); a.add(S(G.sph, body, 0.55, 1.6, 0.55, sx * 0.6, -0.8, 0.4)); arms.push(a); }
    const gold = mat(0xffd23a, { metalness: 0.8, roughness: 0.25 }); k.add(S(G.cyl, gold, 1.3, 0.6, 1.3, 0, 6.8, 0)); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; k.add(S(G.cone, gold, 0.25, 0.7, 0.25, Math.cos(a) * 1.15, 7.4, Math.sin(a) * 1.15)); k.add(S(G.sph, bmat(0x5affa8), 0.14, 0.14, 0.14, Math.cos(a) * 1.25, 6.85, Math.sin(a) * 1.25)); }
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0x7dffb0, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending })); aura.scale.setScalar(12); aura.position.y = 4; k.add(aura);
    k.position.set(CASTLE_C.x, 0.5, CASTLE_C.z - 8); sunScene.add(k); linearize(k);
    GW.king = { m: k, arms, hp: 350, cd: 2, orbCD: 3, sumCD: 6, pos: k.position, dead: false, inv: 0 };
  }
  spawnGhosts();
  refreshGhostWar();
}
function spawnGhosts() {
  for (const g of GW.ghosts) sunScene.remove(g.s); GW.ghosts.length = 0;
  if (Q17.stage === 'done') return;
  let tries = 0;
  while (GW.ghosts.length < 160 && tries++ < 4000) {
    const x = rr(-140, 140), z = rr(-232, 140);
    if (Math.hypot(x - SAFE_C.x, z - SAFE_C.z) < SAFE_R + 6) continue;
    if (Math.abs(x - CASTLE_C.x) < 24 && Math.abs(z - CASTLE_C.z) < 22) continue;
    if (z > 40 && rnd() < 0.6) continue;                       // more of them on the way to the castle
    addGhost(new V3(x, rr(0.6, 2), z));
  }
}
function addGhost(p) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: ghostTex, transparent: true, depthWrite: false })); s.scale.set(2, 2.2, 1); s.position.copy(p); sunScene.add(s);
  const g = { s, pos: s.position, home: p.clone(), hp: 30, cd: rr(0.5, 1.5), ph: rr(0, 9), chase: false, fl: 0, vel: new V3() }; GW.ghosts.push(g); return g;
}
function refreshGhostWar() {
  if (!GW.built) return;
  const fight = Q17.stage === 'fight';
  GW.king.m.visible = fight && !GW.king.dead;
  attachSunSword(hasSword() && mode === 'sun');
}
// ---------- the Sun Goddess's story ----------
function ghostTalk() {
  const SG = 'Saulės Dievė', C = '#ffb020';
  if (Q17.stage === 'none') {
    startTalk(SG, [
      'Mažasis žaliasis! Ačiū, kad atvykai. Aš – Saulės Dievė, o čia gyvena mano vaikai – SPINDULIAI.',
      'Bet pas mus labai blogai… Iš tamsos atskrido VAIDUOKLIAI. Jų šimtai! Jie puola mano spindulius ir gesina šviesą.',
      'Tik čia, prie manęs, saugu – vaiduokliai bijo mano šviesos. O toli, už ugnies arkų, jie pasistatė VAIDUOKLIŲ PILĮ.',
      'Joje sėdi Vaiduoklių Karalius. Jis stiprus kaip demonas, kurį tu nugalėjai. Kol jis gyvas – vaiduokliai niekur nedings.',
      'Imk mano SAULĖS KARDĄ. Jis kerta 1, 3, 5, 10 ar 15 – o kartais net 20 daugiau! Bet atsimink: kirsti gali tik iš arti.',
      'Prasiveržk iki pilies ir nugalėk karalių. Kai būsi sužeistas – sugrįžk čia, mano šviesa tave išgydys. Sėkmės!'
    ], C, () => {
      Q17.stage = 'fight'; saveQ17(); refreshGhostWar(); GW.php = 30;
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.4, { type: 'triangle', vol: 0.07, when: i * 0.1 })); sunPuff(player.pos.clone().add(new V3(0, 1.4, 0)), 0xffd23a, 14, 0.7);
      toast('Gavai SAULĖS KARDĄ!', 'Pelės mygtukai – kirsti (iš arti). Tikslas: Vaiduoklių pilis toli priekyje', '#ffd23a');
    });
    return true;
  }
  if (Q17.stage === 'fight') { GW.php = 30; startTalk(SG, [pick(['Mano šviesa tave išgydė. Pilis – toli priekyje, už ugnies arkų. Eik!', 'Spinduliai tiki tavimi! Nugalėk Vaiduoklių Karalių!', 'Vaiduoklius kirsk iš arti, o kai sunku – bėk (Shift) ir grįžk pas mane.'])], C); return true; }
  startTalk(SG, [pick(['Mano Saulė vėl šviečia! Tu išgelbėjai mano spindulius, mažasis didvyri.', 'Spinduliai vėl skrenda šviesti į visus pasaulius – ir į tavo burbulą!', 'Saulės kardas – tavo visam laikui. Nešiok jį su pasididžiavimu!'])], C);
  return true;
}
// ---------- fighting ----------
{ const _sh = sunHand; sunHand = side => { if (!hasSword()) return _sh(side); swingSword(); }; }
function swingSword() {
  if (GW.swingCD > 0) return; GW.swingCD = 0.38; GW.swingT = 0.3; hands.R.hold = true;
  tone(900, 0.12, { to: 300, type: 'sawtooth', vol: 0.04, lp: 2500 });
  const front = player.pos.clone().add(new V3(0, 1, 0));
  const hit = (pos, r) => { const d = pos.clone().sub(front); d.y = 0; const dist = d.length(); return dist < r && (dist < 0.8 || d.normalize().dot(player.fwd) > 0.2); };
  const rollDmg = () => { const base = pick(GDMG), bonus = Math.random() < 0.2 ? 20 : 0; return { dmg: base + bonus, bonus }; };
  let any = false;
  for (let i = GW.ghosts.length - 1; i >= 0; i--) {
    const g = GW.ghosts[i]; if (!hit(g.pos, 2.6)) continue;
    const { dmg, bonus } = rollDmg(); g.hp -= dmg; g.fl = 0.25; g.vel.copy(player.fwd).multiplyScalar(7); any = true;
    sunDmgNum(g.pos.clone().add(new V3(0, 1.2, 0)), (bonus ? '+20! ' : '') + '-' + dmg, bonus ? '#ff6bff' : dmg >= 10 ? '#ffd23a' : '#ffffff');
    if (g.hp <= 0) { sunPuff(g.pos.clone(), 0xdff4ff, 10, 0.6); sunScene.remove(g.s); GW.ghosts.splice(i, 1); Q17.kills++; tone(1200, 0.2, { to: 400, type: 'sine', vol: 0.05 }); }
  }
  const k = GW.king;
  if (GW.kingFight && !k.dead && hit(k.pos.clone().setY(1), 4.2)) {
    const { dmg, bonus } = rollDmg(); k.hp -= dmg; k.inv = 0.2; any = true; shake = Math.max(shake, 0.15);
    sunDmgNum(k.pos.clone().add(new V3(0, 6, 0)), (bonus ? '+20! ' : '') + '-' + dmg, bonus ? '#ff6bff' : dmg >= 10 ? '#ffd23a' : '#ffffff');
    if (k.hp <= 0) winGhostKing();
  }
  if (any) { sfx.hit && sfx.hit(); }
}
function hurtPlayer(n, from) {
  if (GW.dying) return;
  GW.php -= n; GW.regenT = 3; redFlash(); shake = Math.max(shake, 0.3); noiseHit(0.15, { f: 500, vol: 0.1 });
  sunDmgNum(player.pos.clone().add(new V3(0, 2.4, 0)), '-' + n, '#ff5a5a');
  if (from) { const d = player.pos.clone().sub(from); d.y = 0; if (d.lengthSq() > 0.001) player.vel.copy(d.normalize()).multiplyScalar(7); }
  if (GW.php <= 0) ghostDefeat();
}
function ghostDefeat() {
  if (GW.dying) return; GW.dying = true;
  GW.php = 30; const wasKing = GW.kingFight; endKingFight(false);
  fadeTo(() => {
    GW.dying = false; endKingFight(false);   // make sure the gate is open again
    player.pos.set(0, 0, -20); player.vel.set(0, 0, 0); player.vr = 0; player.fwd.set(0, 0, 1);
    toast(wasKing ? 'Vaiduoklių Karalius šįkart laimėjo…' : 'Vaiduokliai tave įveikė…', 'Saulės Dievė tave išgydė. Bandyk dar kartą!', '#ff6b4a');
  });
}
function startKingFight() {
  GW.kingFight = true; const k = GW.king; k.hp = 350; k.cd = 2; k.orbCD = 3; k.sumCD = 6; k.dead = false; k.m.visible = true;
  SUN.boxes.push(GW.gateBox);
  bigBanner('VAIDUOKLIŲ KARALIUS', 'Kirsk jį iš arti! Saugokis žalių kamuolių');
  [98, 87, 73, 65].forEach((f, i) => tone(f, 0.8, { type: 'sawtooth', vol: 0.08, lp: 600, when: i * 0.25 })); shake = Math.max(shake, 0.6);
}
function endKingFight(won) {
  GW.kingFight = false; SUN.boxes = SUN.boxes.filter(b => b !== GW.gateBox);
  for (const o of GW.orbs) sunScene.remove(o.m); GW.orbs.length = 0;
  if (!won && GW.king) { GW.king.hp = 350; GW.king.pos.set(CASTLE_C.x, 0.5, CASTLE_C.z - 8); }
  if (!won) for (let i = GW.ghosts.length - 1; i >= 0; i--) { const g = GW.ghosts[i]; if (Math.abs(g.pos.x - CASTLE_C.x) < 22 && Math.abs(g.pos.z - CASTLE_C.z) < 20) { sunScene.remove(g.s); GW.ghosts.splice(i, 1); } }   // the king's summoned ghosts go away too
}
function winGhostKing() {
  const k = GW.king; k.dead = true; endKingFight(true);
  for (let i = 0; i < 6; i++) setTimeout(() => sunPuff(k.pos.clone().add(new V3(rr(-2, 2), rr(2, 6), rr(-2, 2))), pick([0x7dffb0, 0xffffff, 0xffd23a]), 16, 1.2), i * 150);
  [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.6, { type: 'triangle', vol: 0.07, when: 0.3 + i * 0.1 }));
  setTimeout(() => { k.m.visible = false; }, 700);
  // every ghost on the Sun fades away
  const gs = GW.ghosts.slice(); GW.ghosts.length = 0; let t = 0;
  fx.push(dt => { t += dt; for (const g of gs) { g.s.material.opacity = Math.max(0, 1 - t / 1.5); g.pos.y += dt * 3; } if (t > 1.6) { gs.forEach(g => sunScene.remove(g.s)); return false; } return true; });
  Q17.stage = 'done'; saveQ17(); addMoney(5000); GW.php = 30;
  bigBanner('VAIDUOKLIAI IŠNYKO!', 'Saulė vėl šviečia. Apdovanojimas: 5000 €');
  setTimeout(() => toast('Saulės Dievės prašymas įvykdytas!', 'Grįžk pas ją – spinduliai tave sveikina! Saulės kardas lieka tau', '#ffd23a'), 2500);
}
function updateGhosts(dt, t) {
  if (!GW.built) return;
  GW.swingCD = Math.max(0, GW.swingCD - dt);
  if (GW.swingT > 0) { GW.swingT -= dt; const p = player.mesh.userData.parts, k = 1 - GW.swingT / 0.3; p.armR.rotation.x = -2.6 + k * 2.4; p.armR.rotation.z = 0.3; if (GW.swingT <= 0) hands.R.hold = false; }
  ghostHud();
  if (Q17.stage !== 'fight') return;
  const pp = player.pos, inSafe = Math.hypot(pp.x - SAFE_C.x, pp.z - SAFE_C.z) < SAFE_R;
  // heal: right away next to the Goddess, slowly when no ghost is near
  GW.regenT -= dt;
  if (inSafe) GW.php = Math.min(30, GW.php + dt * 6); else if (GW.regenT <= 0) GW.php = Math.min(30, GW.php + dt * 1.2);
  let chasers = 0;
  for (const g of GW.ghosts) {
    const dx = pp.x - g.pos.x, dz = pp.z - g.pos.z, dist = Math.hypot(dx, dz);
    g.fl = Math.max(0, g.fl - dt); g.s.material.color.setHex(g.fl > 0 ? 0xff8080 : 0xffffff);
    const wantChase = !inSafe && dist < 13 && chasers < 5 && !GW.kingFight;
    if (wantChase) { chasers++; if (dist > 1.3) { g.vel.x += (dx / dist * 4.2 - g.vel.x) * Math.min(1, dt * 3); g.vel.z += (dz / dist * 4.2 - g.vel.z) * Math.min(1, dt * 3); } else g.vel.multiplyScalar(0.8); }
    else { const hx = g.home.x - g.pos.x, hz = g.home.z - g.pos.z; g.vel.x += (hx * 0.3 + Math.sin(t * 0.7 + g.ph) * 1.2 - g.vel.x) * Math.min(1, dt); g.vel.z += (hz * 0.3 + Math.cos(t * 0.6 + g.ph) * 1.2 - g.vel.z) * Math.min(1, dt); }
    g.pos.x += g.vel.x * dt; g.pos.z += g.vel.z * dt; g.pos.y = 1.3 + Math.sin(t * 2 + g.ph) * 0.35;
    // ghosts can't enter the Goddess's light
    const sx = g.pos.x - SAFE_C.x, sz = g.pos.z - SAFE_C.z, sd = Math.hypot(sx, sz); if (sd < SAFE_R) { g.pos.x = SAFE_C.x + sx / sd * SAFE_R; g.pos.z = SAFE_C.z + sz / sd * SAFE_R; }
    if (wantChase && dist < 1.7) { g.cd -= dt; if (g.cd <= 0) { g.cd = 1.3; hurtPlayer(pick([1, 2, 3]), g.pos); if (Q17.stage !== 'fight' || GW.php === 30) break; } }
  }
  // the castle: walk in through the gate → the king wakes up
  const inCourt = Math.abs(pp.x - CASTLE_C.x) < 21 && pp.z < CASTLE_C.z + 13 && pp.z > CASTLE_C.z - 19;
  if (!GW.kingFight && inCourt && !GW.king.dead && !GW.dying) startKingFight();
  GW.gateM.position.y += ((GW.kingFight ? 0 : 10) - GW.gateM.position.y) * Math.min(1, dt * 4);
  const k = GW.king;
  if (k.m.visible && !k.dead) {
    k.m.position.y = 0.5 + Math.sin(t * 1.5) * 0.4; k.arms.forEach((a, i) => a.rotation.x = Math.sin(t * 2 + i * 3) * 0.4);
    k.m.rotation.y = Math.atan2(pp.x - k.pos.x, pp.z - k.pos.z);
    if (GW.kingFight) {
      const dx = pp.x - k.pos.x, dz = pp.z - k.pos.z, dist = Math.hypot(dx, dz);
      if (dist > 3.2) { k.pos.x += dx / dist * 2.6 * dt; k.pos.z += dz / dist * 2.6 * dt; }
      k.pos.x = clamp(k.pos.x, CASTLE_C.x - 18, CASTLE_C.x + 18); k.pos.z = clamp(k.pos.z, CASTLE_C.z - 12, CASTLE_C.z + 17);
      k.cd -= dt; if (k.cd <= 0 && dist < 3.8) { k.cd = 1.2; k.arms.forEach(a => a.rotation.x = -1.2); hurtPlayer(pick([1, 2, 3]), k.pos); }
      k.orbCD -= dt; if (k.orbCD <= 0 && GW.kingFight) { k.orbCD = 2.6; const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0x5affa8, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); m.scale.setScalar(1.6); m.position.copy(k.pos).add(new V3(0, 4.5, 0)); sunScene.add(m); const v = pp.clone().add(new V3(0, 1, 0)).sub(m.position).normalize().multiplyScalar(11); GW.orbs.push({ m, v, t: 0 }); tone(300, 0.3, { to: 150, type: 'sine', vol: 0.05 }); }
      k.sumCD -= dt; if (k.sumCD <= 0 && GW.kingFight) { k.sumCD = 7; for (let i = 0; i < 2; i++) { const g = addGhost(k.pos.clone().add(new V3(rr(-3, 3), 1.3, rr(-3, 3)))); g.home.copy(pp); } bubbleIn(sunScene, k.pos.clone().add(new V3(0, 7, 0)), 'Ateikit, mano vaiduokliai!', 2); }
      // summoned ghosts inside the castle always attack
      for (const g of GW.ghosts) { if (Math.abs(g.pos.x - CASTLE_C.x) > 22 || Math.abs(g.pos.z - CASTLE_C.z) > 20) continue; const gx = pp.x - g.pos.x, gz = pp.z - g.pos.z, gd = Math.hypot(gx, gz); if (gd > 1.3) { g.pos.x += gx / gd * 3.8 * dt; g.pos.z += gz / gd * 3.8 * dt; } else { g.cd -= dt; if (g.cd <= 0) { g.cd = 1.3; hurtPlayer(pick([1, 2, 3]), g.pos); } } }
    }
  }
  for (let i = GW.orbs.length - 1; i >= 0; i--) { const o = GW.orbs[i]; o.t += dt; o.m.position.addScaledVector(o.v, dt); if (o.m.position.distanceTo(pp.clone().add(new V3(0, 1, 0))) < 1.1) { hurtPlayer(pick([1, 2, 3]), o.m.position); sunScene.remove(o.m); GW.orbs.splice(i, 1); continue; } if (o.t > 4 || o.m.position.y < 0) { sunScene.remove(o.m); GW.orbs.splice(i, 1); } }
}
{ const _us = updateSunWorld; updateSunWorld = (dt, t) => {
    _us(dt, t); updateGhosts(dt, t);
    if (!card && Q17.stage === 'fight' && !nearKid() && !nearSunGod()) {
      const d = Math.round(Math.hypot(player.pos.x - CASTLE_C.x, player.pos.z - CASTLE_C.z - 20));
      setPrompt(GW.kingFight ? 'Kirsk Vaiduoklių Karalių iš arti! (pelės mygtukai)' : `Vaiduoklių pilis: ${d} m · nugalėta vaiduoklių: ${Q17.kills} · pelė – kirsti kardu`);
    } else if (!card && Q17.stage === 'done' && !nearKid() && !nearSunGod()) setPrompt('<kbd>Space</kbd> – pašokti · pelės mygtukai – mojuoti Saulės kardu');
  }; }
{ const _bs = buildSun; buildSun = () => { const first = !SUN.built; _bs(); if (first) buildGhostWar(); }; }
{ const _es = enterSun; enterSun = () => { _es(); refreshGhostWar(); if (Q17.stage === 'none') setTimeout(() => Q17.stage === 'none' && mode === 'sun' && toast('Saulės Dievė tavęs laukia', 'Nueik pas ją – pas mus kažkas negerai… (E)', '#ffb020'), 3500); }; }
function ghostTest() {
  Q17.stage = 'fight'; Q17.kills = 0; saveQ17(); GW.php = 30;
  if (mode !== 'sun') { giveFishSkin(); hideCard(); enterSun(); }
  if (GW.built) { if (GW.king.dead || !GW.ghosts.length) { GW.king.dead = false; GW.king.hp = 350; spawnGhosts(); } refreshGhostWar(); }
  toast('Bandymų pasaulis: vaiduoklių karas', 'Kardas rankoje. Pilis – tiesiai priekyje (už 200 m)', '#ffd23a');
}
