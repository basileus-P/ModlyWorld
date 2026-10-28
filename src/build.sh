#!/usr/bin/env bash
# Builds the public game: src/*.js -> ../index.html (GitHub Pages)
set -e
cd "$(dirname "$0")"
[ -d i18n/node_modules/acorn ] || (cd i18n && npm install --silent acorn acorn-walk)
cat a_core.js b_biomes.js c_entities.js e_audio.js f_houses.js g_home.js h_pets.js i_cars.js j_realism.js k_roads.js l_cook.js m_quest.js n_mars.js o_museum.js p_spider.js r_unicorn.js s_friends.js t_cat.js u_rainbow.js v_skins.js w_paint.js x_aliens.js y_clouds.js z_fall.js zz_secret.js zy_timemachine.js zx_stone.js zw_future.js zv_pause.js zu_cats.js zt_demon.js zs_space.js zr_phone.js zq_sea.js zp_ocean.js zo_sun.js zn_farm.js zm_dragon.js zl_spider.js zk_castle.js zj_caveskin.js zi_catskin.js zh_ghosts.js zg_time.js zf_notes.js ze_mphone.js zd_thunder.js zc_dig.js zb_wind.js za_spin.js zstar.js zfire.js ztele.js zplum.js zpermit.js zzone.js ztube.js zpod.js zportal.js zplane.js zsword.js zbat.js zgate.js zpark.js zspeed.js ztea.js zgod.js zpets.js d_main.js i18n/html_en.js > game_lt.js
node i18n/apply.js game_lt.js game.js
node --check game.js
(cat head.html; echo '<script>'; cat game.js; echo '</script>') > modly.html
{
  printf '%s\n' '<!DOCTYPE html>' '<html lang="lt">' '<head>' '<meta charset="utf-8">' \
    '<meta name="viewport" content="width=device-width, initial-scale=1">' \
    '<meta name="description" content="Modly World – 3D naršyklės žaidimas: mažas žalias žmogeliukas gelbsti pasaulius.">' \
    '<script>window.MODLY_PUBLIC = true;</script>'
  cat modly.html
  printf '\n</html>\n'
} > ../index.html
echo "built ../index.html"
