// ================= Your pets follow you EVERYWHERE (all the flat worlds, not only the planet) =================
const PF = { groundY: 0, scene: null };
function petFollowFx(dt) {
  const flat = started && mode !== 'planet' && mode !== 'attract' && mode !== 'dig' && mode !== 'sr';
  const sc = FB.lastScene;
  for (const pt of pets) {
    if (!flat || !sc) { if (pt.flat) { pt.flat.visible = false; } continue; }
    if (!pt.flat) { pt.flat = pt.def.make(); pt.flatPos = new V3(); pt.flatWalk = 0; pt.flatT = 0; linearize(pt.flat); }
    const m = pt.flat, i = pets.indexOf(pt);
    if (m.parent !== sc) { sc.add(m); const a = i * 1.3 + 2.4; pt.flatPos.set(player.pos.x + Math.sin(a) * 2.5, player.pos.y, player.pos.z + Math.cos(a) * 2.5); }
    m.visible = true;
    if (player.grounded) PF.groundY = player.pos.y;
    // a spot a little behind you, every pet in its own place
    const a = Math.atan2(player.fwd.x, player.fwd.z) + Math.PI + (i - (pets.length - 1) / 2) * 0.6, r = 2.2 + (i % 2) * 1.1;
    const tx = player.pos.x + Math.sin(a) * r, tz = player.pos.z + Math.cos(a) * r;
    const flying = mode === 'wind' || mode === 'sea';
    const ty = flying ? player.pos.y - 0.4 : (player.grounded ? player.pos.y : PF.groundY);
    const dx = tx - pt.flatPos.x, dz = tz - pt.flatPos.z, d = Math.hypot(dx, dz);
    if (d > 40) { pt.flatPos.set(tx, ty, tz); }
    const moving = d > 0.6, sp = Math.min(d, dt * (pt.def.speed || 5) * (d > 8 ? 2 : 1.1));
    if (moving) { pt.flatPos.x += dx / d * sp; pt.flatPos.z += dz / d * sp; m.rotation.set(0, Math.atan2(dx, dz), 0); pt.flatWalk += dt * 12; }
    else m.rotation.set(0, Math.atan2(player.pos.x - pt.flatPos.x, player.pos.z - pt.flatPos.z), 0);
    pt.flatPos.y += (ty - pt.flatPos.y) * Math.min(1, dt * 6);
    m.position.copy(pt.flatPos); if (mode === 'upside') m.position.y = pt.flatPos.y;
    const ud = m.userData, sw = moving ? Math.sin(pt.flatWalk) : 0;
    if (ud.legs) ud.legs.forEach((l, k) => { l.rotation.x = (k % 2 === 0) === (k < 2) ? sw * 0.6 : -sw * 0.6; });
    if (ud.body) ud.body.position.y = moving ? Math.abs(Math.sin(pt.flatWalk)) * 0.06 + (pt.def.hop ? Math.abs(Math.sin(pt.flatWalk * 0.5)) * 0.4 : 0) : 0;
    if (ud.tail) ud.tail.rotation.z = Math.sin(T * (pt.def.id === 'dog' ? 14 : 4)) * (pt.def.id === 'dog' ? 0.7 : 0.3);
    pt.flatT -= dt; if (pt.flatT < 0) { pt.flatT = rr(9, 18); if (d < 12 && SAYS[pt.def.id] && !card) SAYS[pt.def.id](); }
  }
  return true;
}
fx.push(petFollowFx);
// a pet that is sent away / swapped must also disappear from the flat worlds
{ const _d = despawnPet; despawnPet = (pt, f) => { if (pt.flat && pt.flat.parent) pt.flat.parent.remove(pt.flat); pt.flat = null; _d(pt, f); }; }
// ---------- on the Star Goddess's star wings and the jet-pack do not work ----------
let starNoFlyTold = false;
{ const _u = updateStar; updateStar = (dt, t) => {
    const back = Q8.back, flyer = back === 'jetpack' || back === 'wings' || back === 'dragonwings';
    if (flyer) { Q8.back = null; const g = player.mesh.userData.parts.body.userData.back; if (g && g.userData.flames) g.userData.flames.forEach(f => f.visible = false); }
    try { _u(dt, t); } finally { Q8.back = back; }
    if (flyer && keys.Space && !player.grounded && !starNoFlyTold) { starNoFlyTold = true; toast('Čia neskraidysi!', 'Ant Žvaigždžių Dievės žvaigždės sparnai ir kuprinė neveikia – tik šokinėti', '#ffe8a0'); }
  }; }
