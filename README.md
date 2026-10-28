# ModlyWorld
Game, created by kids for kids

Play: https://basileus-p.github.io/ModlyWorld/

## Structure
- `index.html` – the built game served by GitHub Pages (do not edit by hand).
- `src/` – game source modules; `src/build.sh` lists the module order.

## Update the game
```
bash src/build.sh   # rebuilds index.html from src/
git add -A && git commit -m "..." && git push
```
