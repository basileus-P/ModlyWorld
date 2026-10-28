// ================= The world portal (after all 5 commandments): key 5 opens a portal next to you – go to any world =================
const PG = { m: null, sc: null, t: 0, open: false, el: null };
const PG_DEST = [
  { name: 'Pradžios planeta', icon: '🌍', go: () => portalToPlanet() },
  { name: 'Jūrų pasaulis', icon: '🐟', go: () => enterSea() },
  { name: 'Saulė', icon: '☀', go: () => enterSun() },
  { name: 'Laiko pasaulis', icon: '⏰', go: () => enterTime() },
  { name: 'Audrų pasaulis', icon: '⚡', go: () => enterThunder() },
  { name: 'Vėjo pasaulis', icon: '🌪', go: () => enterWind() },
  { name: 'Žvaigždė', icon: '⭐', go: () => enterStar() },
  { name: 'Kosmosas', icon: '🚀', go: () => enterSpace() }
];
const portalReady = () => typeof Q29 !== 'undefined' && Q29.stage === 'done';
function portalToPlanet() {
  mode = 'planet'; world.add(player.mesh); player.mesh.visible = true; const d = cityDir(0, 9);
  player.pos.copy(d).multiplyScalar(R + groundH(d) + 0.4); player.up.copy(d); player.fwd.copy(tangentToward(d, cityDir(0, 0))); player.vel.set(0, 0, 0); player.vr = 0; curBiome = -1;
  camera.up.set(0, 1, 0); camera.position.copy(player.pos).addScaledVector(d, 4).addScaledVector(player.fwd, -6); musicSet(0); setBiomeHud(0);
}
function makeWorldPortal() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.18, 10, 40), bmat(0x9a5aff)); ring.position.y = 1.8; g.add(ring);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(1.35, 36), new THREE.MeshBasicMaterial({ color: 0x5affd8, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })); inner.position.y = 1.8; g.add(inner);
  const sw = new THREE.Group(); sw.position.y = 1.8; g.add(sw); for (let i = 0; i < 16; i++) { const s = S(G.sph, bmat(pick([0xffffff, 0xd88aff, 0x5affd8, 0xffe14d])), 0.07, 0.07, 0.07); const a = i / 16 * Math.PI * 2, r = 0.3 + (i % 4) * 0.25; s.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.02); sw.add(s); }
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0x9a5aff, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(4.5); gl.position.y = 1.8; g.add(gl);
  g.userData = { ring, sw, inner }; return g;
}
function spawnWorldPortal() {
  const sc = FB.lastScene; if (!sc) return; if (PG.m && PG.sc) PG.sc.remove(PG.m);
  const m = makeWorldPortal(); PG.m = m; PG.sc = sc; PG.t = 0; sc.add(m);
  if (mode === 'planet') { const d = moveAlong(player.pos.clone().normalize(), player.fwd, 3.5); m.position.copy(d).multiplyScalar(R + groundH(d)); orient(m, d, player.fwd); }
  else { const f = new V3(player.fwd.x, 0, player.fwd.z).normalize(); m.position.copy(player.pos).addScaledVector(f, 3.5); m.lookAt(player.pos.x, m.position.y, player.pos.z); }
  m.scale.setScalar(0.05); [523, 784, 1047, 1568].forEach((f, i) => tone(f, 0.25, { type: 'sine', vol: 0.05, when: i * 0.06 }));
  toast('Portalas atsivėrė! 🌀', 'Įeik į jį arba spausk E – ir pasirink, į kurią planetą keliauti', '#9a5aff');
}
function closeWorldPortal() { if (PG.m && PG.sc) PG.sc.remove(PG.m); PG.m = null; PG.sc = null; }
function openPortalMenu() {
  if (PG.open) return; PG.open = true; card = { kind: 'portal' }; for (const k in keys) keys[k] = false; try { document.exitPointerLock && document.exitPointerLock(); } catch (_) { }
  if (!PG.el) { const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:7;width:min(560px,calc(100vw - 24px));background:rgba(20,12,40,.96);border:1px solid rgba(154,90,255,.6);border-radius:18px;padding:16px;color:#f0e8ff;font:600 15px system-ui,sans-serif;text-align:center'; document.body.appendChild(d); PG.el = d; }
  PG.el.innerHTML = `<div style="font-size:22px;font-weight:800;color:#c8a0ff;margin-bottom:4px">🌀 Kur keliausi?</div><div style="opacity:.75;margin-bottom:12px">Spausk planetą arba skaičių 1–${PG_DEST.length} · Esc – uždaryti</div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">${PG_DEST.map((w, i) => `<button type="button" data-i="${i}" style="padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(154,90,255,.18);color:#fff;font:700 15px system-ui;cursor:pointer;text-align:left"><small style="opacity:.6">${i + 1}</small> ${w.icon} ${w.name}</button>`).join('')}</div>`;
  PG.el.hidden = false; PG.el.querySelectorAll('button').forEach(b => b.onclick = e => { e.stopPropagation(); portalGo(+b.dataset.i); });
  $('paused').hidden = true;
}
function closePortalMenu() { PG.open = false; if (PG.el) PG.el.hidden = true; if (card && card.kind === 'portal') card = null; if (!lockFailed && started) requestLock(); }
function portalGo(i) {
  const w = PG_DEST[i]; if (!w) return; closePortalMenu(); closeWorldPortal(); if (transitioning) return; transitioning = true;
  redFlash('rgba(154,90,255,.8)', 500); tone(300, 0.6, { to: 1500, type: 'sine', vol: 0.06 });
  fadeTo(() => { transitioning = false; cinema = null; hideCard(); try { w.go(); } catch (err) { console.error(err); } try { localStorage.setItem('modly-portalworld', String(i)); } catch (_) { } toast(`${w.icon} ${w.name}`, 'Portalas tave nunešė. Spausk 5 – vėl atidaryti portalą', '#9a5aff'); });
}
addEventListener('keydown', e => {
  if (PG.open) { e.stopImmediatePropagation(); e.preventDefault(); if (e.code === 'Escape') { closePortalMenu(); return; } const m = /^Digit([1-9])$/.exec(e.code); if (m) portalGo(+m[1] - 1); return; }
  if (e.code === 'Digit5' && portalReady() && !e.repeat && started && !card && !mPhoneOpen && !cinema && !transitioning && mode !== 'attract' && mode !== 'dig') spawnWorldPortal();
}, true);
// grow, spin, and walk-in detection (works in every world)
fx.push(dt => {
  if (!PG.m) return true; const m = PG.m, u = m.userData; PG.t += dt; m.scale.setScalar(Math.min(1, 0.05 + PG.t * 2)); u.sw.rotation.z -= dt * 3; u.ring.rotation.z += dt; u.inner.material.opacity = 0.35 + Math.sin(PG.t * 4) * 0.1;
  if (PG.sc !== FB.lastScene || PG.t > 30) { closeWorldPortal(); return true; }
  const wp = m.getWorldPosition(new V3()); if (!PG.open && !card && !cinema && PG.t > 0.6 && wp.distanceTo(player.pos) < 1.6) openPortalMenu();
  return true;
});
// E next to the portal opens the menu too
addEventListener('keydown', e => { if (e.code === 'KeyE' && PG.m && !PG.open && !card && !cinema && PG.m.getWorldPosition(new V3()).distanceTo(player.pos) < 4) { e.stopImmediatePropagation(); openPortalMenu(); } }, true);
// after a reload you come back to the world you travelled to last
{ const _s = startGame; startGame = (...a) => { const r = _s(...a); let i = -1; try { i = +(localStorage.getItem('modly-portalworld') ?? -1); } catch (_) { } if (portalReady() && i >= 0 && PG_DEST[i]) setTimeout(() => { try { PG_DEST[i].go(); } catch (_) { } }, 50); return r; }; }
function gateKeyRow() { const k = $('keys'); if (!k || !portalReady()) return; let r = $('gateRow'); if (!r) { r = document.createElement('span'); r.id = 'gateRow'; const lab = document.createElement('span'); lab.id = 'gateLab'; const hEl = [...k.children].find(c => c.innerHTML.includes('<kbd>H</kbd>')); k.insertBefore(lab, hEl || null); k.insertBefore(r, lab); } r.innerHTML = '<kbd>5</kbd>'; $('gateLab').textContent = '🌀 portalas į bet kurią planetą'; }
setTimeout(gateKeyRow, 0);
{ const _g = goddessReveal; goddessReveal = sk => { _g(sk); setTimeout(() => { gateKeyRow(); }, 100); }; }
{ let told = false; try { told = localStorage.getItem('modly-gatetold') === '1'; } catch (_) { }
  fx.push(() => { if (told || !portalReady() || card || cinema || !started || mode === 'attract') return true; if (typeof Q24 === 'undefined' || Q24.done < 5) return true; told = true; try { localStorage.setItem('modly-gatetold', '1'); } catch (_) { } gateKeyRow(); setTimeout(() => startTalk('Žvaigždžių Dievė', ['Ir dar viena dovana: spausk 5 – šalia tavęs atsivers PORTALAS. Juo gali keliauti į bet kurią planetą!'], '#ffe8a0'), 3500); return true; }); }
