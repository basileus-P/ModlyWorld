# Modly World – source

The game is built from these files into one `index.html`.

## Build
1. `cd src/i18n && npm install acorn acorn-walk` (once)
2. `cd src && bash build.sh` – concatenates the modules (order in build.sh) into game_lt.js,
   runs i18n/apply.js (adds English: `EN ? en : lt`) → game.js, then modly.html = head.html + script.
3. `build.sh` also writes the public `/index.html` in the repo root with the GitHub Pages header
   (`MODLY_PUBLIC = true` switches off all test-world jumps.)

The full change log is in the Claude project doc "modly-world-biomu-zaidimas.md".
