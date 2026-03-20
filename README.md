# Arcane Hocus 3D

A browser-playable **true 3D** fantasy platformer prototype inspired by the classic DOS game **Hocus Pocus**, rebuilt with modern controls and friendlier onboarding.

## What changed in this version

This revision upgrades the earlier pseudo-3D approach into a real 3D scene with:

- real `WebGL` rendering via `three.js`,
- mouse-look camera control with pointer lock,
- genuine 3D movement and aiming,
- floating platforms, bridges, enemies, crystals, checkpoints, and a 3D portal,
- assist mode, coyote-time jumping, air dash, and quick respawn support.

## Run locally

Serve the folder locally:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000> in your browser.

> Note: the game loads `three.js` from a CDN in the browser, so your computer needs internet access the first time you run it unless you later vendor that dependency locally.

## Controls

- **Capture mouse / look around:** click the game canvas
- **Move:** `WASD` or arrow keys
- **Jump:** `Space`
- **Cast spell:** left click or `F`
- **Air dash:** `Shift`
- **Pause:** `P`
- **Respawn / restart run:** `R`

## Free asset sources to extend the prototype

The current build uses procedural geometry so it works immediately, but these are good free sources for replacing the placeholder visuals with polished content:

- **Kenney** — free fantasy props, UI, effects, and modular environment kits: <https://kenney.nl/assets>
- **Quaternius** — free stylized 3D characters, monsters, dungeons, castles, and nature packs: <https://quaternius.com>
- **OpenGameArt** — free music, sound effects, ambience, and fantasy HUD/audio resources with per-asset licenses: <https://opengameart.org>

## Suggested next improvements

1. Swap procedural geometry for a cohesive free fantasy asset pack.
2. Add controller support and input rebinding.
3. Save checkpoints, best times, and settings in local storage.
4. Add boss fights, moving platforms, secrets, and multi-level progression.
5. Package the project as a standalone desktop app if you want a one-click launcher.
