# Kingdom Road: Hollow Torches

A fully playable **3D fantasy survival horror game** built as a browser experience with free Three.js ESM imports and no paid assets.

## What changed in this improved version
- Upgraded the game into a **true first-person 3D experience** with **mouse-look controls** using pointer lock.
- Reworked the presentation around a full 3D torch road, deep forest walls, town gates, bonfires, enemy silhouettes, and a first-person weapon rig.
- Expanded progression so each town now provides stronger identity, lore, and build-changing rewards.
- Improved combat pacing with camera-facing melee checks, dash mobility, radial magic, better enemy variety, and heavier late-game pressure.

## Story
The old kingdom road is the final safe artery between the frontier and the Ember Kingdom. The forest surrounding it has become a feeding ground for corrupted beasts, dead knights, witches, bats, and horned fiends drawn to the **Heartflame Ember**. You are **Caelan**, an oathsworn road warden charged with carrying that living ember from **Dunmere Outpost** to the capital before the torch line fails and the realm is swallowed in darkness.

Your journey passes through six towns before the final kingdom:
1. **Dunmere Outpost**
2. **Barrowford**
3. **Rookwatch**
4. **Gloammarket**
5. **Ashen Cloister**
6. **Kingsward Gate**
7. **Ember Kingdom**

## Core gameplay loop
- Walk the long torchlit road in first person.
- Use the **mouse to look around** and watch the woods for movement.
- Fight enemies emerging from either side of the road.
- Collect health potions, mana draughts, gold, XP, and rare relic chests.
- Reach each town alive to heal, gain upgrades, and prepare for the next leg.
- Survive all six legs and deliver the Heartflame to the kingdom.

## Enemy roster
- **Briarwolves** — fast melee rushers.
- **Hollow Knights** — durable cursed soldiers.
- **Mire Witches** — curse casters that damage health and mana.
- **Ember Bats** — aerial skirmishers.
- **Antler Fiends** — late-game charging brutes.

## Controls
- **Look around:** Mouse
- **Move:** WASD / Arrow Keys
- **Sprint:** Shift
- **Attack:** Left Click or Space
- **Dash Slash:** Q
- **Nova Burst:** R
- **Health Potion:** 1
- **Mana Potion:** 2
- **Leave Town / Continue Journey:** E
- **Capture mouse:** Click the game window

## Running locally
```bash
python3 -m http.server 4173
```
Then open `http://localhost:4173` in your browser.

Or run:
```bash
npm run serve
```

## Asset note
The game uses **procedural materials, primitive geometry, and a free Three.js CDN import**, so there are no paid textures, skins, or external commercial assets required.
