// ================= The Thunder God's trouble: the rain only falls one hour a day =================
// Buy a SHOVEL (100 €) in the phone shop "Kaka", dig down as deep as you can – up to 5 km, through caves.
// Every 50 m a strange DROUGHT PLUG blocks the way: the shovel can't dig it – buy DYNAMITE (12 € each) and blow it up.
// When all 100 plugs are blown, the rain and the thunder come back all day long. Progress is always saved.
const Q21 = { stage: 'none', shovel: false, dyn: 0, x: 15.5, y: -1, dug: [], blown: [], gems: 0, best: 0 };   // none | dig | done
try { const s = JSON.parse(localStorage.getItem('modly-quest21') || 'null'); if (s) Object.assign(Q21, s); } catch (_) { }
function saveQ21() { try { localStorage.setItem('modly-quest21', JSON.stringify(Object.assign({}, Q21, { dug: [...DG.dug] }))); } catch (_) { } }
const DW = 31, DMAX = 5040, LAYER = 50, NLAYERS = 100;
const DG = { dug: new Set(Q21.dug), canvas: null, ctx: null, vy: 0, digT: 0, digCell: -1, msgT: 0, msg: '', fuse: [], boomFx: [], saveT: 0, prevF: false, prevE: false };
// ---------- the phone shop "Kaka" ----------
function mpKaka(b) {
  b.innerHTML = `<div class="mpH"><span style="background:#8a5a2b;border-radius:8px;padding:0 8px">🛒</span> Kaka – parduotuvė</div><div class="mpSmall">Viskas, ko reikia kasti. Tavo pinigai: <b>${fmtMoney(money)}</b></div>
  <div class="mpRow" style="cursor:default"><div class="mpIco" style="background:#8a6a4a;width:52px;height:52px">⛏</div><div style="flex:1"><div style="font-weight:800">Kastuvas</div><div class="mpSmall" style="padding:0">Kasti žemyn, į šonus ir aukštyn. 100 €</div></div>${Q21.shovel ? '<b style="color:#3cc86a">Turi ✅</b>' : '<button class="mpBtn go" id="kkS">100 €</button>'}</div>
  <div class="mpRow" style="cursor:default"><div class="mpIco" style="background:#c8302a;width:52px;height:52px">🧨</div><div style="flex:1"><div style="font-weight:800">Dinamitas</div><div class="mpSmall" style="padding:0">Susprogdina keistus dalykus, kurių kastuvas neįveikia. 12 € · turi: <b>${Q21.dyn}</b></div></div></div>
  <div style="text-align:center"><button class="mpBtn go" data-d="1">×1 · 12 €</button><button class="mpBtn go" data-d="5">×5 · 60 €</button><button class="mpBtn go" data-d="10">×10 · 120 €</button><button class="mpBtn gold" data-d="25">×25 · 300 €</button></div><div class="mpSmall" id="kkMsg" style="text-align:center;margin-top:8px"></div>`;
  if ($('kkS')) $('kkS').onclick = () => { if (money < 100) { $('kkMsg').textContent = 'Neužtenka pinigų…'; return; } addMoney(-100); Q21.shovel = true; saveQ21(); sfx.chime(); mpShow('kaka', true); };
  b.querySelectorAll('[data-d]').forEach(x => x.onclick = () => { const n = +x.dataset.d, c = n * 12; if (money < c) { $('kkMsg').textContent = `Reikia ${c} €, o turi ${Math.floor(money)} €. Kasdamas rasi brangakmenių!`; return; } addMoney(-c); Q21.dyn += n; saveQ21(); tone(880, 0.06, { type: 'triangle', vol: 0.04 }); mpShow('kaka', true); });
}
{ const _h = mpHome; mpHome = b => { _h(b); const grid = b.querySelector('.mpGrid'); if (!grid) return; const bt = document.createElement('button'); bt.className = 'mpApp'; bt.innerHTML = '<div class="mpIco" style="background:#8a5a2b">🛒</div>Kaka'; bt.onclick = () => { tone(880, 0.04, { type: 'triangle', vol: 0.03 }); mpShow('kaka'); }; grid.appendChild(bt); }; }
{ const _s = mpShow; mpShow = (scr, back, arg) => { if (scr === 'kaka') { mpStopGame(); if (!back && mpScreen !== 'kaka') mpHist.push(mpScreen); mpScreen = 'kaka'; mpKaka($('mpBody')); return; } _s(scr, back, arg); }; }

// ---------- the ground underneath the storm world ----------
function dHash(x, y) { let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function dNoise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, s = t => t * t * (3 - 2 * t); const a = dHash(xi, yi), b = dHash(xi + 1, yi), c = dHash(xi, yi + 1), d = dHash(xi + 1, yi + 1); return a + (b - a) * s(xf) + (c - a) * s(yf) + (a - b - c + d) * s(xf) * s(yf); }
// tile types: 0 air, 1 cloud-soil, 2 clay, 3 stone, 4 deep rock, 5 gem, 6 cave air, 7 DROUGHT PLUG, 8 hard wall
function baseTile(x, y) {
  if (y < 0) return 0; if (x <= 0 || x >= DW - 1) return 8;
  if (y > 0 && y % LAYER === 0 && y / LAYER <= NLAYERS) return 7;
  if (y >= DMAX) return 8;
  if (y > 12) { const n = dNoise(x / 5, y / 4) * 0.6 + dNoise(x / 11 + 50, y / 9) * 0.4; if (n > 0.68 - Math.min(0.1, y / 40000)) return 6; }
  if (dHash(x * 3 + 7, y * 5 + 1) < 0.011 + Math.min(0.015, y / 250000)) return 5;
  return y < 60 ? 1 : y < 600 ? 2 : y < 2500 ? 3 : 4;
}
const dKey = (x, y) => y * DW + x;
function tileAt(x, y) { const t = baseTile(x, y); if (t === 8 || t === 0) return t; if (DG.dug.has(dKey(x, y))) return t === 6 ? 6 : 0; if (t === 7 && Q21.blown.includes(y / LAYER)) { const hx = (y * 7) % (DW - 6) + 3; if (Math.abs(x - hx) <= 2) return 0; } return t; }
const solid = t => t !== 0 && t !== 6;
const HARD = [0, 0.1, 0.14, 0.2, 0.27, 0.18, 0, 999, 999];
const DCOL = [null, '#7a6a8a', '#8a6a4a', '#6a6a72', '#3a3a48', '#3a3a48', null, '#7a2aaa', '#1a1a22'];
// ---------- entering and leaving the dig ----------
const DIG_SITE = new V3(12, 0, 8);
{ const _b = buildThunder; buildThunder = () => { const first = !THW.built; _b(); if (first) buildDigSite(); }; }
function buildDigSite() {
  const g = new THREE.Group(); g.position.copy(DIG_SITE); thScene.add(g);
  g.add(mesh(new THREE.CircleGeometry(1.8, 24), new THREE.MeshBasicMaterial({ color: 0x0a0812 }), 0, 0.03, 0).rotateX(-Math.PI / 2));
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; g.add(S(G.sph, mat(0x5a4a6a), 0.5, 0.3, 0.5, Math.cos(a) * 2.1, 0.1, Math.sin(a) * 2.1)); }
  const sign = makeSign('Kasimo vieta'); sign.position.set(2.6, 0, 0); g.add(sign);
  g.add(S(G.cyl, mat(0x8a6a4a), 0.05, 2.6, 0.05, -1.2, 1.3, -1.2).rotateZ(0.3)); g.add(S(G.box, mat(0xa0a8b0, { metalness: 0.7 }), 0.4, 0.5, 0.05, -0.85, 0.05, -1.2));
  linearize(g); THW.digSite = g; g.visible = Q21.stage !== 'none';
}
const nearDig = () => THW.digSite && THW.digSite.visible && Math.hypot(player.pos.x - DIG_SITE.x, player.pos.z - DIG_SITE.z) < 3;
function enterDig() {
  if (!Q21.shovel) { toast('Neturi kastuvo!', 'Nusipirk jį telefonu: P → programėlė „Kaka“ (100 €)', '#ff8a3a'); return; }
  if (!DG.canvas) { const c = document.createElement('canvas'); c.id = 'digView'; c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:1;background:#0a0812'; document.body.appendChild(c); DG.canvas = c; DG.ctx = c.getContext('2d'); }
  DG.canvas.hidden = false; mode = 'dig'; digHud(true); if (Q21.y < -0.5) { Q21.x = 15.5; Q21.y = -1; } DG.vy = 0;
  $('bName').textContent = 'Po debesimis'; $('bEn').textContent = 'Kasimas'; $('bAtm').textContent = 'Kask kuo giliau! Keistus dalykus sprogdink dinamitu.';
  toast('Kasi po debesimis!', 'A/D – į šonus · S – žemyn · W – aukštyn · F – dinamitas · E – išlipti', '#ffb020');
}
function leaveDig() {
  saveQ21(); if (DG.canvas) DG.canvas.hidden = true; mode = 'thunder'; digHud(false); player.pos.set(DIG_SITE.x - 2.5, 0, DIG_SITE.z); player.vel.set(0, 0, 0);
  $('bName').textContent = 'Audrų pasaulis'; $('bEn').textContent = 'Griaustinio Dievo namai'; $('bAtm').textContent = 'Tamsūs debesys, lietus, žaibai, maži žaibukai – ir drakonas iš žaibo.';
  toast(`Išlipai! Gylis: ${Math.max(0, Math.floor(Q21.y))} m`, `Susprogdinta kamščių: ${Q21.blown.length}/100 · progresas išsaugotas`, '#c8b0ff');
}
function digHud(on) { const k = $('keys'), c = $('checklist'); if (k) k.style.visibility = on ? 'hidden' : ''; if (c && c.parentElement) c.parentElement.style.visibility = on ? 'hidden' : ''; }
function digMsg(m) { DG.msg = m; DG.msgT = 2.5; }
function placeDynamite() {
  if (Q21.dyn <= 0) { digMsg('Neturi dinamito! Nusipirk telefonu (P → Kaka), 12 € vienas'); return; }
  Q21.dyn--; const cx = Math.floor(Q21.x), cy = Math.floor(Q21.y + 0.5); DG.fuse.push({ x: cx + 0.5, y: cy + 0.5, t: 2 }); tone(1600, 0.1, { type: 'square', vol: 0.03, lp: 4000 }); saveQ21();
}
function digBoom(fx0, fy0) {
  const R = 2.6; let plug = false;
  for (let y = Math.floor(fy0 - R); y <= Math.ceil(fy0 + R); y++) for (let x = Math.floor(fx0 - R); x <= Math.ceil(fx0 + R); x++) {
    if (Math.hypot(x + 0.5 - fx0, y + 0.5 - fy0) > R) continue; const t = baseTile(x, y); if (t === 8 || t === 0) continue;
    if (t === 7) { const L = y / LAYER; if (!Q21.blown.includes(L)) { Q21.blown.push(L); plug = true; } }
    DG.dug.add(dKey(x, y));
  }
  DG.boomFx.push({ x: fx0, y: fy0, t: 0 }); noiseHit(0.8, { f: 600, fto: 60, vol: 0.3 }); tone(80, 0.6, { to: 40, type: 'sawtooth', vol: 0.12, lp: 500 });
  if (plug) { [523, 659, 784].forEach((f, i) => tone(f, 0.2, { type: 'triangle', vol: 0.06, when: 0.3 + i * 0.08 })); digMsg(`Keistas dalykas susprogdintas! ${Q21.blown.length}/100`); if (Q21.blown.length >= NLAYERS) finishDig(); }
  saveQ21();
}
function finishDig() {
  Q21.stage = 'done'; saveQ21();
  setTimeout(() => { if (mode === 'dig') leaveDig(); addMoney(5000); bigBanner('LIETUS GRĮŽO!', 'Visi 100 keistų dalykų susprogdinti. Lyja ir griaudžia visą dieną!'); thFlash.intensity = 3;
    setTimeout(() => startTalk('Griaustinio Dievas', ['BUM BUM BUM!!! Girdi?! Lyja VISĄ DIENĄ – kaip seniau! Ir mano griaustinis vėl griaudžia!', 'Tu nukasei taip giliai, kaip niekas nekasė, ir susprogdinai visus sausros kamščius. Mano žaibukai šoka iš laimės!', 'Štai tau 5000 €. Tu – tikras audrų didvyris. BUM!'], '#c8b0ff'), 1500); }, 1200);
}
// ---------- the dig itself (a side view, drawn on a 2D canvas) ----------
function updateDig(dt, t) {
  const k = keys, x0 = Q21.x, y0 = Q21.y;
  const cell = (x, y) => tileAt(Math.floor(x), Math.floor(y));
  const tryDig = (tx, ty) => {
    const tt = tileAt(tx, ty); if (!solid(tt)) return true;
    if (tt === 8) { digMsg(ty >= DMAX ? 'Čia – pats dugnas. Toliau kasti nebeįmanoma!' : 'Kieta siena – čia nepakasi'); return false; }
    if (tt === 7) { digMsg('Keistas dalykas! Kastuvu neįkasi – reikia DINAMITO (F)'); return false; }
    const key = dKey(tx, ty); if (DG.digCell !== key) { DG.digCell = key; DG.digT = 0; }
    DG.digT += dt; if (Math.random() < dt * 8) tone(rr(180, 320), 0.04, { type: 'square', vol: 0.02, lp: 900 });
    if (DG.digT >= HARD[tt]) { DG.dug.add(key); DG.digT = 0; DG.digCell = -1; if (tt === 5) { const v = 5 + Math.floor(dHash(tx, ty) * 6) * 5 + Math.floor(ty / 500) * 5; addMoney(v); Q21.gems++; digMsg(`Brangakmenis! +${v} €`); tone(1320, 0.1, { type: 'triangle', vol: 0.05 }); } return true; }
    return false;
  };
  // left/right
  const dir = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0);
  if (dir) { const nx = Q21.x + dir * 5 * dt, tx = Math.floor(nx + dir * 0.4), ty = Math.floor(Q21.y + 0.5); if (!solid(tileAt(tx, ty)) || tryDig(tx, ty)) Q21.x = clamp(nx, 1.45, DW - 1.45); }
  // down
  const below = tileAt(Math.floor(Q21.x), Math.floor(Q21.y + 1));
  if (k.KeyS && solid(below)) tryDig(Math.floor(Q21.x), Math.floor(Q21.y + 1));
  // up (climb the tunnel walls)
  if (k.KeyW) { const above = tileAt(Math.floor(Q21.x), Math.floor(Q21.y - 0.1)); if (Q21.y > -1 && (!solid(above) || tryDig(Math.floor(Q21.x), Math.floor(Q21.y - 0.1)))) { Q21.y = Math.max(-1, Q21.y - 4 * dt); DG.vy = 0; } }
  // gravity
  else if (!solid(tileAt(Math.floor(Q21.x), Math.floor(Q21.y + 1)))) { DG.vy = Math.min(16, DG.vy + 30 * dt); const ny = Q21.y + DG.vy * dt; if (solid(tileAt(Math.floor(Q21.x), Math.floor(ny + 1)))) { Q21.y = Math.floor(ny + 1) - 1; DG.vy = 0; } else Q21.y = ny; }
  else { DG.vy = 0; Q21.y = Math.floor(Q21.y + 0.5); }
  if (Q21.y > Q21.best) Q21.best = Q21.y;
  if (k.KeyF && !DG.prevF) placeDynamite(); DG.prevF = !!k.KeyF;
  for (let i = DG.fuse.length - 1; i >= 0; i--) { const f = DG.fuse[i]; f.t -= dt; if (f.t <= 0) { DG.fuse.splice(i, 1); digBoom(f.x, f.y); } }
  DG.saveT -= dt; if (DG.saveT < 0) { DG.saveT = 5; saveQ21(); }
  DG.msgT -= dt;
  drawDig(t);
  setPrompt('A/D – į šonus · S – kasti žemyn · W – aukštyn · <kbd>F</kbd> dinamitas · <kbd>E</kbd> išlipti');
}
function drawDig(t) {
  const c = DG.canvas, x = DG.ctx, W = innerWidth, H = innerHeight; if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  const TS = Math.max(26, Math.min(40, Math.floor(W / 34))), ox = Math.floor(W / 2 - DW * TS / 2), camY = Q21.y * TS - H * 0.45;
  const depth = Math.max(0, Q21.y);
  const bg = x.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, depth < 5 ? '#2a2850' : '#120e1c'); bg.addColorStop(1, '#0a0812'); x.fillStyle = bg; x.fillRect(0, 0, W, H);
  const y0 = Math.floor(camY / TS) - 1, y1 = y0 + Math.ceil(H / TS) + 2;
  for (let ty = y0; ty <= y1; ty++) for (let tx = 0; tx < DW; tx++) {
    const px = ox + tx * TS, py = Math.round(ty * TS - camY); const base = baseTile(tx, ty), tt = tileAt(tx, ty);
    if (ty < 0) continue;
    if (!solid(tt)) {
      // tunnels show a darker wall behind, caves have glowing crystals
      x.fillStyle = base === 6 ? '#100c1a' : '#1c1626'; x.fillRect(px, py, TS, TS);
      if (base === 6 && dHash(tx + 9, ty) < 0.06) { x.fillStyle = dHash(tx, ty + 3) < 0.5 ? '#6af0ff' : '#ff8ae0'; x.beginPath(); x.moveTo(px + TS / 2, py + 4); x.lineTo(px + TS * 0.7, py + TS); x.lineTo(px + TS * 0.3, py + TS); x.fill(); }
      if (base === 6 && dHash(tx + 2, ty + 7) < 0.02) { x.fillStyle = '#e8e0c8'; x.fillRect(px + 6, py + TS / 2, TS - 12, 4); x.fillRect(px + 8, py + TS / 2 - 6, 4, 14); }
      continue;
    }
    x.fillStyle = DCOL[tt]; x.fillRect(px, py, TS, TS);
    x.fillStyle = 'rgba(0,0,0,.18)'; if (dHash(tx, ty) < 0.5) x.fillRect(px + TS * 0.2, py + TS * 0.3, 4, 4); if (dHash(ty, tx) < 0.5) x.fillRect(px + TS * 0.65, py + TS * 0.6, 5, 3);
    if (tt === 5) { x.fillStyle = ['#ff5a8a', '#5affd8', '#ffd23a', '#8a7aff'][Math.floor(dHash(tx, ty) * 4)]; x.beginPath(); x.moveTo(px + TS / 2, py + 5); x.lineTo(px + TS - 6, py + TS / 2); x.lineTo(px + TS / 2, py + TS - 5); x.lineTo(px + 6, py + TS / 2); x.fill(); }
    if (tt === 7) { const pulse = 0.5 + 0.5 * Math.sin(t * 4 + tx); x.fillStyle = `rgba(255,120,255,${0.3 + pulse * 0.4})`; x.fillRect(px + 2, py + 2, TS - 4, TS - 4); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(px + TS / 2, py + TS / 2, TS * 0.25, TS * 0.16, 0, 0, 7); x.fill(); x.fillStyle = '#2a0a3a'; x.beginPath(); x.arc(px + TS / 2 + Math.sin(t * 2 + tx) * 3, py + TS / 2, TS * 0.1, 0, 7); x.fill(); }
    if (tt === 8) { x.fillStyle = '#0e0e14'; x.fillRect(px + 3, py + 3, TS - 6, TS - 6); }
    if (DG.digCell === dKey(tx, ty)) { x.strokeStyle = '#fff'; x.lineWidth = 2; const p = DG.digT / HARD[tt]; x.beginPath(); x.moveTo(px + 4, py + 4); x.lineTo(px + 4 + (TS - 8) * p, py + TS - 4); x.stroke(); }
  }
  // layer depth labels on the side
  x.fillStyle = '#9a90c0'; x.font = 'bold 12px sans-serif'; for (let ty = Math.ceil(y0 / 50) * 50; ty <= y1; ty += 50) if (ty > 0) x.fillText(`${ty} m`, ox - 52, Math.round(ty * TS - camY) + 18);
  // dynamite
  for (const f of DG.fuse) { const px = ox + f.x * TS, py = f.y * TS - camY; x.fillStyle = '#c8302a'; x.fillRect(px - 5, py - 9, 10, 18); x.fillStyle = Math.sin(t * 30) > 0 ? '#ffe14d' : '#ff8a1a'; x.beginPath(); x.arc(px + 3, py - 12, 4, 0, 7); x.fill(); }
  for (let i = DG.boomFx.length - 1; i >= 0; i--) { const b = DG.boomFx[i]; b.t += 1 / 60; const px = ox + b.x * TS, py = b.y * TS - camY, r = b.t * TS * 9; x.fillStyle = `rgba(255,${180 - b.t * 200},40,${Math.max(0, 0.8 - b.t * 1.4)})`; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); if (b.t > 0.6) DG.boomFx.splice(i, 1); }
  // the little green man with his shovel
  { const px = ox + Q21.x * TS, py = (Q21.y + 1) * TS - camY, s = TS / 32;
    x.fillStyle = skinNow === 'classic' ? '#6ff05a' : '#6ff05a'; x.beginPath(); x.arc(px, py - 26 * s, 8 * s, 0, 7); x.fill(); x.fillRect(px - 5 * s, py - 19 * s, 10 * s, 13 * s); x.fillRect(px - 5 * s, py - 6 * s, 3 * s, 6 * s); x.fillRect(px + 2 * s, py - 6 * s, 3 * s, 6 * s);
    x.fillStyle = '#111'; x.fillRect(px - 4 * s, py - 28 * s, 2 * s, 3 * s); x.fillRect(px + 2 * s, py - 28 * s, 2 * s, 3 * s); x.fillStyle = '#ffe14d'; x.beginPath(); x.arc(px, py - 38 * s, 2.5 * s, 0, 7); x.fill(); x.fillStyle = '#3fb33a'; x.fillRect(px - 0.5 * s, py - 37 * s, 1 * s, 4 * s);
    const sw = DG.digCell >= 0 ? Math.sin(t * 25) * 0.6 : 0; x.save(); x.translate(px + 6 * s, py - 14 * s); x.rotate(0.8 + sw); x.fillStyle = '#8a6a4a'; x.fillRect(-1.5 * s, 0, 3 * s, 16 * s); x.fillStyle = '#c8ccd6'; x.fillRect(-4 * s, 14 * s, 8 * s, 7 * s); x.restore(); }
  // HUD
  x.fillStyle = 'rgba(10,8,20,.75)'; x.fillRect(W / 2 - 230, 12, 460, 58); x.fillStyle = '#fff'; x.font = 'bold 20px sans-serif'; x.textAlign = 'center';
  x.fillText(`Gylis: ${Math.floor(depth)} m / 5000 m   ·   Kamščiai: ${Q21.blown.length}/100   ·   🧨 ${Q21.dyn}`, W / 2, 38); x.font = '13px sans-serif'; x.fillStyle = '#c8c0e8'; x.fillText(`Giliausiai: ${Math.floor(Q21.best)} m · brangakmenių: ${Q21.gems} · pinigai: ${fmtMoney(money)}`, W / 2, 60);
  if (DG.msgT > 0) { x.fillStyle = 'rgba(40,20,60,.85)'; x.fillRect(W / 2 - 260, H * 0.62, 520, 40); x.fillStyle = '#ffe14d'; x.font = 'bold 17px sans-serif'; x.fillText(DG.msg, W / 2, H * 0.62 + 26); }
  x.textAlign = 'left';
}
// ---------- the Thunder God explains; the rain falls only one hour a day until it is fixed ----------
{ const _a = thunderAction; thunderAction = () => {
    if (card) return _a();
    if (nearDig()) { enterDig(); return; }
    if (nearThunderGod() && THW.met && Q21.stage !== 'done') {
      if (Q21.stage === 'none') { startTalk('Griaustinio Dievas', ['BUM… Štai mano bėda. Anksčiau pas mus lijo VISĄ DIENĄ, o griaustinis griaudė be perstojo.', 'O dabar lyja tik vieną valandą per dieną! Mano žaibukai be lietaus nebeblizga…', 'Kažkas giliai po debesimis užkimšo audros šaknis – keistais SAUSROS KAMŠČIAIS. Jų ten net šimtas!', 'Nusipirk telefonu KASTUVĄ (programėlė „Kaka“, 100 €) ir kask kuo giliau – net iki 5 kilometrų! Kasimo vieta – štai ten, prie lentelės.', 'Kamščių kastuvu neįkasi – jiems reikės DINAMITO (12 € vienas). Susprogdink visus 100! Ir nebijok – kai išlipsi, viskas lieka išsaugota.'], '#c8b0ff', () => { Q21.stage = 'dig'; saveQ21(); if (THW.digSite) THW.digSite.visible = true; toast('Griaustinio Dievo prašymas: kask!', 'P → Kaka: kastuvas 100 €, dinamitas 12 €. Kasimo vieta – prie lentelės', '#c8b0ff'); }); return; }
      startTalk('Griaustinio Dievas', [`Susprogdinta ${Q21.blown.length} iš 100 kamščių. Giliausiai buvai ${Math.floor(Q21.best)} m. Kask toliau! BUM!`], '#c8b0ff'); return;
    }
    if (nearThunderGod() && Q21.stage === 'done') { startTalk('Griaustinio Dievas', [pick(['BUM BUM! Lyja visą dieną – nuostabu!', 'Mano žaibukai vėl blizga lietuje. Ačiū, kasėjau!'])], '#c8b0ff'); return; }
    return _a();
  }; }
{ const _u = updateThunder; updateThunder = (dt, t) => {
    // before it is fixed it only rains for a short while (one "hour" of the day)
    const raining = Q21.stage === 'done' || (t % 120) < 20;
    if (!raining) THW.flashT = Math.max(THW.flashT, 1);
    _u(dt, t);
    THW.rain.visible = raining;
    if (!card && nearDig()) setPrompt(Q21.shovel ? '<kbd>E</kbd> lipti į duobę ir kasti' : '<kbd>E</kbd> kasti (reikia kastuvo – P → Kaka)');
  }; }
function digTest(layers) { if (mode !== 'thunder') { hideCard(); enterThunder(); } THW.met = true; Q21.stage = 'dig'; Q21.shovel = true; Q21.dyn = Math.max(Q21.dyn, 10); if (layers) { Q21.blown = Array.from({ length: Math.min(99, layers) }, (_, i) => i + 1); Q21.y = layers * LAYER - 1; Q21.best = Q21.y; } saveQ21(); if (THW.digSite) THW.digSite.visible = true; toast('Bandymų pasaulis: kasimas', 'Kastuvas ir 10 dinamitų. Kasimo vieta prie lentelės', '#ffd23a'); }
// ---------- test world (one time): jump straight to the very last plug ----------
{ const _u = updateThunder; updateThunder = (dt, t) => { _u(dt, t);
    let done = true;   // test-world jump switched off (digjump)
    if (done || Q21.stage !== 'dig' || Date.now() > Date.UTC(2026, 9, 31)) return;
    try { localStorage.setItem('modly-digjump', '1'); } catch (_) { }
    THW.met = true; try { localStorage.setItem('modly-thundermet', '1'); } catch (_) { }
    Q21.stage = 'dig'; Q21.shovel = true; Q21.dyn = Math.max(Q21.dyn, 5);
    Q21.blown = Array.from({ length: 99 }, (_, i) => i + 1); Q21.x = 15.5; Q21.y = 4998; Q21.best = Math.max(Q21.best, 4998);
    for (let x = 1; x < DW - 1; x++) for (let y = 4996; y <= 4999; y++) DG.dug.add(dKey(x, y));
    saveQ21(); if (THW.digSite) THW.digSite.visible = true;
    setTimeout(() => toast('Bandymų pasaulis: paskutinis kamštis!', 'Susprogdinta 99 iš 100. Lipk į duobę (E) – tu jau prie paskutinio kamščio. Spausk F!', '#ffd23a'), 800);
  }; }
// ---------- test world (one time, only on claude.ai – never in the public GitHub game): the Thunder planet is DONE ----------
{ let done = !!window.MODLY_PUBLIC; try { if (localStorage.getItem('modly-thunderpass2') === '1') done = true; } catch (_) { }
  fx.push(() => {
    if (done || !started || mode === 'attract' || card || cinema || transitioning) return true;
    done = true; try { localStorage.setItem('modly-thunderpass2', '1'); } catch (_) { }
    if (Q21.stage === 'done' || Date.now() > Date.UTC(2026, 10, 30)) return true;
    try { windTest(); THW.met = true; localStorage.setItem('modly-thundermet', '1'); localStorage.setItem('modly-digjump', '1'); addMoney(5000);
      setTimeout(() => startTalk('Griaustinio Dievas', ['BUM BUM BUM!!! Bandymų pasaulis: mano planeta jau išgelbėta – lyja visą dieną!', 'Dabar telefone (P) atidaryk Dievų grupę ir parašyk: „aš išgelbėjau griaustinio planetą“. Tada tave pasiims Vėjo Dievas!'], '#c8b0ff'), 1200); } catch (e) { console.error(e); }
    return true; }); }
