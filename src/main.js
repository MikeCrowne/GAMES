import * as THREE from 'three';

const canvas = document.querySelector('#game');
const statsEl = document.querySelector('#stats');
const skillsEl = document.querySelector('#skills');
const logEl = document.querySelector('#log');
const townPanel = document.querySelector('#townPanel');
const townTitle = document.querySelector('#townTitle');
const townDescription = document.querySelector('#townDescription');
const townRewards = document.querySelector('#townRewards');
const introPanel = document.querySelector('#introPanel');
const endPanel = document.querySelector('#endPanel');
const startButton = document.querySelector('#startButton');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07080d);
scene.fog = new THREE.FogExp2(0x07080d, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 320);

const ambient = new THREE.HemisphereLight(0x6c7fa7, 0x111114, 0.95);
scene.add(ambient);

const moon = new THREE.DirectionalLight(0xa0bbff, 0.8);
moon.position.set(16, 28, 10);
moon.castShadow = true;
moon.shadow.mapSize.set(1024, 1024);
moon.shadow.camera.near = 1;
moon.shadow.camera.far = 160;
moon.shadow.camera.left = -50;
moon.shadow.camera.right = 50;
moon.shadow.camera.top = 50;
moon.shadow.camera.bottom = -50;
scene.add(moon);

const world = new THREE.Group();
scene.add(world);

const cameraRig = new THREE.Group();
const pitchRig = new THREE.Group();
world.add(cameraRig);
cameraRig.add(pitchRig);
pitchRig.add(camera);
camera.position.set(0, 1.55, 0);

const playerLight = new THREE.PointLight(0xffc875, 1.15, 10, 2.2);
playerLight.position.set(0, 0.4, 0.2);
pitchRig.add(playerLight);

const handRig = new THREE.Group();
handRig.position.set(0.42, -0.36, -0.8);
pitchRig.add(handRig);
const hand = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.1, 0.26, 4, 8),
  new THREE.MeshStandardMaterial({ color: 0xe1c3aa, roughness: 0.85 })
);
hand.rotation.z = -0.2;
const sword = new THREE.Mesh(
  new THREE.BoxGeometry(0.08, 1.15, 0.14),
  new THREE.MeshStandardMaterial({ color: 0xc8d3de, metalness: 0.85, roughness: 0.25 })
);
sword.position.set(0.02, 0.55, 0);
sword.rotation.z = -0.18;
const crossguard = new THREE.Mesh(
  new THREE.BoxGeometry(0.36, 0.05, 0.08),
  new THREE.MeshStandardMaterial({ color: 0x7c5a31, roughness: 0.55 })
);
crossguard.position.set(0.02, 0.03, 0);
const pommel = new THREE.Mesh(
  new THREE.CylinderGeometry(0.03, 0.04, 0.18, 8),
  new THREE.MeshStandardMaterial({ color: 0x6b220f, roughness: 0.7 })
);
pommel.rotation.z = Math.PI / 2;
pommel.position.set(0, -0.18, 0);
handRig.add(hand, sword, crossguard, pommel);

const pathLength = 900;
const townPositions = [0, 130, 260, 390, 520, 650, 780, 900];
const townData = [
  {
    name: 'Dunmere Outpost',
    lore: 'Timber palisades, chapel bells, and smoke from pitch kilns mark the last truly calm night you will know. The wardens tie the Heartflame Ember to your oathblade.',
    rest: 'The quartermaster restores your supplies, marks the first haunted leagues on your map, and teaches you to recover while out of combat.',
    reward: { maxHealth: 18, gold: 12, skill: 'Warden\'s Resolve — regenerate health while not under attack.' },
  },
  {
    name: 'Barrowford',
    lore: 'A grave-road market built atop saintly mounds. Lantern sellers and gravediggers barter under iron charms while restless dead claw beneath the roots.',
    rest: 'You trade trophies for sharpened steel and learn to burst forward through ambushes with Torchstep.',
    reward: { attack: 4, potions: { health: 2 }, skill: 'Torchstep — Dash Slash travels farther and burns foes it cuts.' },
  },
  {
    name: 'Rookwatch',
    lore: 'This raven-banner fortress watches a gorge where missing caravans scream into the mist. Veteran scouts teach you to read movement in the tree line.',
    rest: 'The battlemages etch sigils into your gauntlet, unlocking Nova Burst and improving your mana reserve.',
    reward: { maxMana: 25, gold: 16, skill: 'Nova Burst — radial arcane shockwave damages and slows the pack.' },
  },
  {
    name: 'Gloammarket',
    lore: 'A half-lawful bazaar of relic dealers, witchglass lamp makers, and monster trappers. Every stall sells a different way to survive one more night.',
    rest: 'You upgrade your satchel, improving treasure finds and raising the chance of rare road chests.',
    reward: { attack: 5, luck: true, skill: 'Relic Satchel — chest rewards double and rare drops become more common.' },
  },
  {
    name: 'Ashen Cloister',
    lore: 'Ember-priests keep this monastery warm with furnace prayers. Monks carve verses into the roadstones so the kingdom can still be reached at dawn.',
    rest: 'Sacred disciplines refine your sword form, empowering every third strike into a sanctified cleave.',
    reward: { maxHealth: 24, crit: 0.12, potions: { health: 1, mana: 1 }, skill: 'Sanctified Steel — every third hit deals heavy bonus damage.' },
  },
  {
    name: 'Kingsward Gate',
    lore: 'Thousands of refugees shelter behind these walls while the king\'s last riders hold the forest edge. Beyond lies the final march to the kingdom.',
    rest: 'You receive royal armor plates, ward sigils, and a blessing that hardens you against the final assault.',
    reward: { attack: 7, defense: 5, maxMana: 20, skill: 'King\'s Oath — stronger defenses and faster stamina recovery in the final leg.' },
  },
  {
    name: 'Ember Kingdom',
    lore: 'At sunrise the citadel of dawnfire rises beyond the final torches. The Heartflame is delivered, the kingdom survives, and the cursed road burns bright again.',
    rest: 'Victory',
    reward: {},
  },
];

const enemyArchetypes = {
  briarwolf: { hp: 38, speed: 5.8, damage: 11, xp: 14, gold: 7, color: 0x50693d, y: 0.75 },
  hollowKnight: { hp: 62, speed: 3.6, damage: 16, xp: 22, gold: 12, color: 0x798099, y: 1.1 },
  mireWitch: { hp: 44, speed: 2.8, damage: 13, xp: 24, gold: 14, color: 0x744897, y: 1.1 },
  emberBat: { hp: 28, speed: 7.1, damage: 9, xp: 12, gold: 6, color: 0xb5612d, y: 2.2 },
  antlerFiend: { hp: 84, speed: 3.2, damage: 19, xp: 32, gold: 20, color: 0x8a2f2d, y: 1.5 },
};

const state = {
  running: false,
  gameOver: false,
  pointerLocked: false,
  inTown: false,
  nearTownExit: false,
  roadProgress: 0,
  leg: 0,
  kills: 0,
  gold: 0,
  xp: 0,
  level: 1,
  waveIntensity: 1,
  nextSpawnAt: 28,
  combatTimer: 0,
  loreShown: false,
  log: [],
  enemies: [],
  loot: [],
  particles: [],
  townRewardsClaimed: new Set(),
  player: {
    health: 120,
    maxHealth: 120,
    mana: 70,
    maxMana: 70,
    attack: 18,
    defense: 5,
    moveSpeed: 7.4,
    sprintSpeed: 10.3,
    attackCd: 0,
    dashCd: 0,
    novaCd: 0,
    slashAnim: 0,
    manaPotions: 2,
    healthPotions: 3,
    regen: 0,
    critChance: 0.08,
    luck: false,
    cleaveCounter: 0,
  },
  camera: {
    yaw: 0,
    pitch: -0.08,
    bob: 0,
  },
};

const keys = new Set();
const mouse = { attackHeld: false };
const tempVec = new THREE.Vector3();
const tempVec2 = new THREE.Vector3();
const raycaster = new THREE.Raycaster();

function addLog(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 10);
  logEl.innerHTML = state.log.map((entry) => `<div class="log-entry">${entry}</div>`).join('');
}

function makeNoiseTexture(base, variance, repeatX, repeatY) {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const s = Math.random() * 5 + 1;
    const r = variance[0] + Math.random() * variance[1];
    const g = variance[2] + Math.random() * variance[3];
    const b = variance[4] + Math.random() * variance[5];
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.18)`;
    ctx.fillRect(x, y, s, s);
  }
  const texture = new THREE.CanvasTexture(c);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  return texture;
}

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(120, pathLength + 120),
  new THREE.MeshStandardMaterial({
    color: 0x31442b,
    roughness: 1,
    map: makeNoiseTexture('#22311d', [40, 55, 35, 45, 20, 25], 26, 180),
  })
);
ground.rotation.x = -Math.PI / 2;
ground.position.z = pathLength / 2;
ground.receiveShadow = true;
world.add(ground);

const road = new THREE.Mesh(
  new THREE.PlaneGeometry(12, pathLength + 80),
  new THREE.MeshStandardMaterial({
    color: 0x8f7754,
    roughness: 1,
    map: makeNoiseTexture('#7d6a4e', [65, 50, 52, 38, 20, 20], 1, 120),
  })
);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.02;
road.position.z = pathLength / 2;
road.receiveShadow = true;
world.add(road);

const stars = new THREE.Points(
  new THREE.BufferGeometry().setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      Array.from({ length: 800 }, () => [
        (Math.random() - 0.5) * 260,
        40 + Math.random() * 70,
        -60 + Math.random() * (pathLength + 140),
      ]).flat(),
      3
    )
  ),
  new THREE.PointsMaterial({ color: 0xd9e5ff, size: 0.4 })
);
scene.add(stars);

function addTree(x, z, scale = 1) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.32 * scale, 3.4 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0x4f3422, roughness: 1 })
  );
  trunk.position.y = 1.7 * scale;
  trunk.castShadow = true;
  group.add(trunk);

  const canopy = new THREE.Mesh(
    new THREE.ConeGeometry(1.7 * scale, 4.5 * scale, 10),
    new THREE.MeshStandardMaterial({ color: 0x162715, roughness: 1 })
  );
  canopy.position.y = 4.6 * scale;
  canopy.castShadow = true;
  group.add(canopy);

  const deadBranch = new THREE.Mesh(
    new THREE.BoxGeometry(1.5 * scale, 0.08 * scale, 0.08 * scale),
    new THREE.MeshStandardMaterial({ color: 0x3d2717, roughness: 1 })
  );
  deadBranch.position.set((Math.random() - 0.5) * 0.6, 2.7 * scale, 0);
  deadBranch.rotation.z = (Math.random() - 0.5) * 1.2;
  deadBranch.rotation.y = Math.random() * Math.PI;
  group.add(deadBranch);

  group.position.set(x, 0, z);
  world.add(group);
}

for (let z = -50; z < pathLength + 70; z += 4.5) {
  addTree(-12 - Math.random() * 38, z + Math.random() * 4, 0.75 + Math.random() * 1.5);
  addTree(12 + Math.random() * 38, z + Math.random() * 4, 0.75 + Math.random() * 1.5);
}

function addTorch(z) {
  [-4.8, 4.8].forEach((x) => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 3.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x553a22, roughness: 0.9 })
    );
    pole.position.set(x, 1.7, z);
    pole.castShadow = true;
    world.add(pole);

    const bracket = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.07, 0.07),
      new THREE.MeshStandardMaterial({ color: 0x4a311d, roughness: 0.8 })
    );
    bracket.position.set(x + Math.sign(x) * 0.2, 3, z);
    world.add(bracket);

    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffbd6b })
    );
    flame.position.set(x + Math.sign(x) * 0.45, 3.1, z);
    world.add(flame);

    const light = new THREE.PointLight(0xff9b3d, 2.4, 16, 2.1);
    light.position.copy(flame.position);
    world.add(light);
  });
}

for (let z = 10; z < pathLength; z += 13.5) addTorch(z);

function addTownGate(z, index) {
  const gate = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: 0x72614e, roughness: 1 });
  const left = new THREE.Mesh(new THREE.BoxGeometry(1.4, 5, 1.4), material);
  const right = left.clone();
  const top = new THREE.Mesh(new THREE.BoxGeometry(10, 0.85, 1.4), material);
  left.position.set(-4.5, 2.5, z);
  right.position.set(4.5, 2.5, z);
  top.position.set(0, 5.05, z);
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(6.5, 1.3),
    new THREE.MeshBasicMaterial({ color: index === 6 ? 0xe2b054 : 0xc86e31, side: THREE.DoubleSide })
  );
  banner.position.set(0, 4.1, z + 0.72);
  gate.add(left, right, top, banner);
  gate.traverse((obj) => { obj.castShadow = true; });
  world.add(gate);

  if (index < 6) {
    const bonfire = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.4, 0.6, 7),
      new THREE.MeshStandardMaterial({ color: 0x3e2f25, roughness: 1 })
    );
    bonfire.position.set(0, 0.35, z + 11);
    bonfire.castShadow = true;
    world.add(bonfire);
    const bonfireLight = new THREE.PointLight(0xff8f35, 2.8, 19, 2);
    bonfireLight.position.set(0, 2.8, z + 11);
    world.add(bonfireLight);
  }
}

townPositions.forEach((z, index) => addTownGate(z, index));

function createEnemy(type) {
  const cfg = enemyArchetypes[type];
  const root = new THREE.Group();
  const body = new THREE.Mesh(
    type === 'emberBat' ? new THREE.SphereGeometry(0.55, 12, 12) : new THREE.CapsuleGeometry(0.42, 1.0, 4, 8),
    new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.9 })
  );
  body.position.y = cfg.y;
  body.castShadow = true;
  root.add(body);

  if (type === 'emberBat') {
    const wings = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.08, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x2b1711, side: THREE.DoubleSide })
    );
    wings.position.y = cfg.y;
    root.add(wings);
    root.userData.wings = wings;
  }

  if (type === 'mireWitch' || type === 'hollowKnight' || type === 'antlerFiend') {
    const head = new THREE.Mesh(
      type === 'antlerFiend' ? new THREE.OctahedronGeometry(0.5) : new THREE.SphereGeometry(0.34, 10, 10),
      new THREE.MeshStandardMaterial({ color: type === 'hollowKnight' ? 0xb7bdcd : 0xd8c0c0, roughness: 0.8 })
    );
    head.position.y = cfg.y + 0.9;
    head.castShadow = true;
    root.add(head);
  }

  if (type === 'mireWitch') {
    const hat = new THREE.Mesh(
      new THREE.ConeGeometry(0.54, 1.1, 9),
      new THREE.MeshStandardMaterial({ color: 0x29152e, roughness: 0.9 })
    );
    hat.position.y = cfg.y + 1.45;
    hat.castShadow = true;
    root.add(hat);
  }

  if (type === 'antlerFiend') {
    const antlers = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.05, 8, 18, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x8d7c65, roughness: 1 })
    );
    antlers.position.y = cfg.y + 1.25;
    antlers.rotation.z = Math.PI;
    root.add(antlers);
  }

  const hpFrame = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.16), new THREE.MeshBasicMaterial({ color: 0x190708 }));
  hpFrame.position.set(0, cfg.y + 1.85, 0);
  const hpFill = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.09), new THREE.MeshBasicMaterial({ color: 0xff5d5d }));
  hpFill.position.set(0, cfg.y + 1.85, 0.01);
  root.add(hpFrame, hpFill);
  root.userData.hpFill = hpFill;

  const side = Math.random() > 0.5 ? 1 : -1;
  root.position.set(side * (9 + Math.random() * 16), 0, cameraRig.position.z + 30 + Math.random() * 28);
  world.add(root);
  return {
    type,
    mesh: root,
    hpFill,
    health: cfg.hp,
    maxHealth: cfg.hp,
    speed: cfg.speed,
    damage: cfg.damage,
    xp: cfg.xp,
    gold: cfg.gold,
    attackCd: 1 + Math.random(),
    specialCd: 3 + Math.random() * 2,
    strafeDir: Math.random() > 0.5 ? 1 : -1,
  };
}

function createLoot(kind, position) {
  const color = kind === 'health' ? 0xd94f46 : kind === 'mana' ? 0x4f7be8 : 0xe6bd5d;
  const mesh = new THREE.Mesh(
    kind === 'chest' ? new THREE.BoxGeometry(0.8, 0.56, 0.56) : new THREE.OctahedronGeometry(0.28, 0),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, roughness: 0.5 })
  );
  mesh.position.copy(position);
  mesh.position.y = kind === 'chest' ? 0.45 : 0.52;
  world.add(mesh);
  state.loot.push({ kind, mesh, bob: Math.random() * Math.PI * 2 });
}

function spawnParticleRing(color, scale = 1) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.45, 0.6, 28),
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(cameraRig.position.x, 0.08, cameraRig.position.z);
  world.add(ring);
  state.particles.push({ mesh: ring, life: 0.5, grow: 15 * scale });
}

function applyTownReward(index) {
  if (state.townRewardsClaimed.has(index)) return [];
  state.townRewardsClaimed.add(index);
  const reward = townData[index].reward;
  const lines = [];
  if (reward.maxHealth) {
    state.player.maxHealth += reward.maxHealth;
    state.player.health = Math.min(state.player.maxHealth, state.player.health + reward.maxHealth);
    lines.push(`+${reward.maxHealth} max health`);
  }
  if (reward.maxMana) {
    state.player.maxMana += reward.maxMana;
    state.player.mana = state.player.maxMana;
    lines.push(`+${reward.maxMana} max mana`);
  }
  if (reward.attack) {
    state.player.attack += reward.attack;
    lines.push(`+${reward.attack} attack`);
  }
  if (reward.defense) {
    state.player.defense += reward.defense;
    lines.push(`+${reward.defense} defense`);
  }
  if (reward.gold) {
    state.gold += reward.gold;
    lines.push(`+${reward.gold} gold stipend`);
  }
  if (reward.crit) {
    state.player.critChance += reward.crit;
    lines.push(`+${Math.round(reward.crit * 100)}% critical chance`);
  }
  if (reward.luck) {
    state.player.luck = true;
    lines.push('Relic drops and chest rewards improved');
  }
  if (reward.potions) {
    if (reward.potions.health) {
      state.player.healthPotions += reward.potions.health;
      lines.push(`+${reward.potions.health} health potion${reward.potions.health > 1 ? 's' : ''}`);
    }
    if (reward.potions.mana) {
      state.player.manaPotions += reward.potions.mana;
      lines.push(`+${reward.potions.mana} mana potion${reward.potions.mana > 1 ? 's' : ''}`);
    }
  }
  if (reward.skill) {
    lines.push(reward.skill);
    if (index === 0) state.player.regen = 3.2;
    if (index === 1) state.player.sprintSpeed += 0.9;
    if (index === 5) state.player.moveSpeed += 0.65;
  }
  return lines;
}

function enterTown(index) {
  state.inTown = true;
  townPanel.classList.remove('hidden');
  townTitle.textContent = townData[index].name;
  townDescription.textContent = `${townData[index].lore} ${townData[index].rest}`;
  const rewards = applyTownReward(index);
  townRewards.innerHTML = rewards.map((line) => `<div>• ${line}</div>`).join('') || '<div>• Rest, resupply, and prepare for the final dawn.</div>';
  state.player.health = Math.min(state.player.maxHealth, state.player.health + 35);
  state.player.mana = Math.min(state.player.maxMana, state.player.mana + 30);
  addLog(`You reach ${townData[index].name}. ${townData[index].lore}`);
}

function leaveTown() {
  state.inTown = false;
  townPanel.classList.add('hidden');
  state.leg += 1;
  state.waveIntensity = 1 + state.leg * 0.2;
  state.nextSpawnAt = state.roadProgress + 20;
  addLog(`You leave ${townData[state.leg - 1].name} and step into the torchlit dark.`);
}

function gainXp(amount) {
  state.xp += amount;
  while (state.xp >= state.level * 70) {
    state.xp -= state.level * 70;
    state.level += 1;
    state.player.maxHealth += 12;
    state.player.health = state.player.maxHealth;
    state.player.attack += 2;
    state.player.maxMana += 10;
    state.player.mana = state.player.maxMana;
    addLog(`Level ${state.level}! Your oathblade and body harden against the road.`);
  }
}

function destroyEnemy(enemy, reason = 'fell') {
  world.remove(enemy.mesh);
  state.enemies = state.enemies.filter((entry) => entry !== enemy);
  state.kills += 1;
  state.gold += enemy.gold;
  gainXp(enemy.xp);
  addLog(`${formatEnemyName(enemy.type)} ${reason}. +${enemy.gold} gold, +${enemy.xp} xp.`);
  const roll = Math.random();
  const chestChance = state.player.luck ? 0.08 : 0.03;
  if (roll < 0.18) createLoot('health', enemy.mesh.position);
  else if (roll < 0.32) createLoot('mana', enemy.mesh.position);
  else if (roll < 0.32 + chestChance) createLoot('chest', enemy.mesh.position);
}

function formatEnemyName(type) {
  return {
    briarwolf: 'Briarwolf',
    hollowKnight: 'Hollow Knight',
    mireWitch: 'Mire Witch',
    emberBat: 'Ember Bat',
    antlerFiend: 'Antler Fiend',
  }[type];
}

function meleeAttack() {
  if (state.player.attackCd > 0 || state.inTown || state.gameOver) return;
  state.player.attackCd = 0.42;
  state.player.slashAnim = 0.22;
  state.player.cleaveCounter += 1;
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

  let hit = false;
  for (const enemy of state.enemies) {
    const toEnemy = tempVec.copy(enemy.mesh.position).sub(cameraRig.position);
    const distance = toEnemy.length();
    const facing = tempVec2.set(0, 0, -1).applyQuaternion(camera.quaternion).dot(toEnemy.normalize());
    if (distance < 4.2 && facing > 0.58) {
      let damage = state.player.attack + Math.random() * 7;
      if (Math.random() < state.player.critChance) damage *= 1.65;
      if (state.player.cleaveCounter >= 3) {
        damage *= 1.35;
        state.player.cleaveCounter = 0;
      }
      enemy.health -= damage;
      hit = true;
      if (enemy.health <= 0) destroyEnemy(enemy, 'is cut down');
    }
  }

  if (hit) {
    state.combatTimer = 4;
    spawnParticleRing(0xffd18a, 0.45);
  }
}

function castDashSlash() {
  if (state.player.dashCd > 0 || state.player.mana < 16 || state.inTown || state.gameOver) return;
  state.player.dashCd = 4.5;
  state.player.mana -= 16;
  const forward = tempVec.set(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), state.camera.yaw);
  cameraRig.position.addScaledVector(forward, 6.5);
  cameraRig.position.x = THREE.MathUtils.clamp(cameraRig.position.x, -4.8, 4.8);
  state.roadProgress = Math.max(state.roadProgress, cameraRig.position.z);
  spawnParticleRing(0xff8c46, 0.7);
  for (const enemy of state.enemies) {
    if (enemy.mesh.position.distanceTo(cameraRig.position) < 4.2) {
      enemy.health -= state.player.attack * 1.9;
      if (enemy.health <= 0) destroyEnemy(enemy, 'is burned apart by Torchstep');
    }
  }
  state.combatTimer = 4;
}

function castNovaBurst() {
  if (state.player.novaCd > 0 || state.player.mana < 26 || state.inTown || state.leg < 2 || state.gameOver) return;
  state.player.novaCd = 8.5;
  state.player.mana -= 26;
  spawnParticleRing(0x8eb4ff, 1.2);
  for (const enemy of state.enemies) {
    const distance = enemy.mesh.position.distanceTo(cameraRig.position);
    if (distance < 8.5) {
      enemy.health -= state.player.attack * 1.65;
      enemy.specialCd += 1.6;
      enemy.speed *= 0.92;
      if (enemy.health <= 0) destroyEnemy(enemy, 'is shattered by Nova Burst');
    }
  }
  state.combatTimer = 4;
}

function usePotion(kind) {
  if (kind === 'health' && state.player.healthPotions > 0) {
    state.player.healthPotions -= 1;
    state.player.health = Math.min(state.player.maxHealth, state.player.health + 48);
    addLog('You drink a health potion and steady your breath.');
  }
  if (kind === 'mana' && state.player.manaPotions > 0) {
    state.player.manaPotions -= 1;
    state.player.mana = Math.min(state.player.maxMana, state.player.mana + 42);
    addLog('A mana draught rekindles the sigils in your gauntlet.');
  }
}

function spawnEnemyPack() {
  const types = ['briarwolf', 'hollowKnight', 'emberBat'];
  if (state.leg >= 2) types.push('mireWitch');
  if (state.leg >= 4) types.push('antlerFiend');
  const count = Math.min(2 + state.leg + Math.floor(Math.random() * 2), 6);
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const enemy = createEnemy(type);
    enemy.health *= state.waveIntensity;
    enemy.maxHealth = enemy.health;
    enemy.damage *= state.waveIntensity;
    enemy.speed *= 1 + state.leg * 0.05;
    state.enemies.push(enemy);
  }
  addLog('The woods stir. Shapes emerge beyond the torchlight and charge the road.');
}

function updateTownTriggers() {
  const nextTownIndex = state.leg + 1;
  if (!state.inTown && state.roadProgress >= townPositions[nextTownIndex]) {
    enterTown(nextTownIndex);
    if (nextTownIndex === townData.length - 1) {
      winGame();
    }
  }
}

function updateLoot() {
  state.loot = state.loot.filter((item) => {
    item.bob += 0.05;
    item.mesh.position.y = (item.kind === 'chest' ? 0.45 : 0.52) + Math.sin(item.bob) * 0.11;
    item.mesh.rotation.y += 0.02;
    if (item.mesh.position.distanceTo(cameraRig.position) < 1.4) {
      if (item.kind === 'health') {
        state.player.health = Math.min(state.player.maxHealth, state.player.health + 26);
        addLog('You found a discarded crimson draught on the road.');
      }
      if (item.kind === 'mana') {
        state.player.mana = Math.min(state.player.maxMana, state.player.mana + 28);
        addLog('You gathered a moonwell mana vial from the mud.');
      }
      if (item.kind === 'chest') {
        const gold = (24 + Math.floor(Math.random() * 22)) * (state.player.luck ? 2 : 1);
        state.gold += gold;
        state.player.healthPotions += 1;
        state.player.manaPotions += 1;
        gainXp(25);
        addLog(`A relic chest opens: +${gold} gold, potions, and hidden lore fragments.`);
      }
      world.remove(item.mesh);
      return false;
    }
    return true;
  });
}

function updateParticles(dt) {
  state.particles = state.particles.filter((particle) => {
    particle.life -= dt;
    particle.mesh.scale.addScalar(particle.grow * dt);
    particle.mesh.material.opacity = Math.max(0, particle.life * 2);
    if (particle.life <= 0) {
      world.remove(particle.mesh);
      return false;
    }
    return true;
  });
}

function updateEnemies(dt) {
  for (const enemy of state.enemies) {
    const dir = tempVec.copy(cameraRig.position).sub(enemy.mesh.position);
    const distance = dir.length();
    dir.normalize();

    if (enemy.type === 'emberBat') {
      enemy.mesh.position.y = 1.6 + Math.sin(performance.now() * 0.008 + enemy.mesh.position.z) * 0.8;
      if (enemy.mesh.userData.wings) enemy.mesh.userData.wings.rotation.z = Math.sin(performance.now() * 0.03) * 0.9;
    }

    if (enemy.type === 'mireWitch' && distance > 7) {
      const strafe = tempVec2.set(-dir.z, 0, dir.x).multiplyScalar(enemy.strafeDir * 1.5 * dt);
      enemy.mesh.position.add(strafe);
      enemy.mesh.position.addScaledVector(dir, enemy.speed * 0.7 * dt);
    } else if (distance > 1.8) {
      enemy.mesh.position.addScaledVector(dir, enemy.speed * dt);
    }

    enemy.attackCd -= dt;
    enemy.specialCd -= dt;

    if (distance < 2 && enemy.attackCd <= 0) {
      enemy.attackCd = enemy.type === 'briarwolf' ? 0.9 : 1.2;
      const damage = Math.max(3, enemy.damage - state.player.defense * 0.8);
      state.player.health -= damage;
      state.combatTimer = 4;
      addLog(`${formatEnemyName(enemy.type)} hits you for ${Math.round(damage)} damage.`);
    }

    if (enemy.type === 'mireWitch' && enemy.specialCd <= 0 && distance < 15) {
      enemy.specialCd = 4.8;
      state.player.health -= 8;
      state.player.mana = Math.max(0, state.player.mana - 7);
      state.combatTimer = 4;
      addLog('A mire witch curse scorches flesh and drains mana.');
    }

    if (enemy.type === 'antlerFiend' && enemy.specialCd <= 0 && distance < 9) {
      enemy.specialCd = 5.5;
      const rush = tempVec.copy(dir).multiplyScalar(4.4);
      enemy.mesh.position.add(rush);
      state.player.health -= 10;
      state.combatTimer = 4;
      addLog('An antler fiend lunges through the smoke with brutal force.');
    }

    enemy.mesh.lookAt(cameraRig.position.x, enemy.mesh.position.y + 0.5, cameraRig.position.z);
    enemy.hpFill.scale.x = Math.max(0.05, enemy.health / enemy.maxHealth);
  }
}

function updatePlayer(dt) {
  const movingForward = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0);
  const movingRight = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
  const sprinting = keys.has('shift');
  const speed = sprinting ? state.player.sprintSpeed : state.player.moveSpeed;

  const forward = tempVec.set(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), state.camera.yaw);
  const right = tempVec2.set(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), state.camera.yaw);
  const move = new THREE.Vector3();
  move.addScaledVector(forward, movingForward);
  move.addScaledVector(right, movingRight);
  if (move.lengthSq() > 0) move.normalize().multiplyScalar(speed * dt);

  if (!state.inTown && state.running) {
    cameraRig.position.add(move);
    cameraRig.position.addScaledVector(forward, 2.55 * dt);
  }

  cameraRig.position.x = THREE.MathUtils.clamp(cameraRig.position.x, -5.2, 5.2);
  cameraRig.position.z = THREE.MathUtils.clamp(cameraRig.position.z, 1.5, pathLength);
  state.roadProgress = Math.max(state.roadProgress, cameraRig.position.z);

  state.player.attackCd = Math.max(0, state.player.attackCd - dt);
  state.player.dashCd = Math.max(0, state.player.dashCd - dt);
  state.player.novaCd = Math.max(0, state.player.novaCd - dt);
  state.player.slashAnim = Math.max(0, state.player.slashAnim - dt);
  state.combatTimer = Math.max(0, state.combatTimer - dt);

  if (state.combatTimer <= 0 && state.player.regen > 0) {
    state.player.health = Math.min(state.player.maxHealth, state.player.health + state.player.regen * dt);
  }
  state.player.mana = Math.min(state.player.maxMana, state.player.mana + 4.8 * dt);

  const bobSpeed = move.lengthSq() > 0.0001 ? 9 : 0;
  state.camera.bob += dt * bobSpeed;
  const bob = move.lengthSq() > 0.0001 ? Math.sin(state.camera.bob) * 0.05 : 0;
  pitchRig.position.y = bob;

  handRig.rotation.x = -0.2 - state.player.slashAnim * 6.2;
  handRig.rotation.y = 0.28 + Math.sin(state.camera.bob * 0.5) * 0.04;
  handRig.rotation.z = 0.12 - state.player.slashAnim * 2.6;
  handRig.position.x = 0.42 + Math.sin(state.camera.bob * 0.5) * 0.03;
  handRig.position.y = -0.36 + bob * 0.5;
}

function updateSpawns() {
  if (state.inTown || state.gameOver) return;
  if (state.roadProgress >= state.nextSpawnAt) {
    spawnEnemyPack();
    state.nextSpawnAt += Math.max(18, 28 - state.leg * 2);
  }
}

function renderHud() {
  const nextTown = townData[Math.min(state.leg + 1, townData.length - 1)].name;
  statsEl.innerHTML = `
    <div><strong>Road Progress:</strong> ${Math.round((state.roadProgress / pathLength) * 100)}%</div>
    <div><strong>Next Haven:</strong> ${nextTown}</div>
    <div><strong>Health:</strong> ${Math.ceil(state.player.health)} / ${state.player.maxHealth}</div>
    <div><strong>Mana:</strong> ${Math.ceil(state.player.mana)} / ${state.player.maxMana}</div>
    <div><strong>Level:</strong> ${state.level} (${state.xp}/${state.level * 70} XP)</div>
    <div><strong>Attack:</strong> ${state.player.attack} | <strong>Defense:</strong> ${state.player.defense}</div>
    <div><strong>Gold:</strong> ${state.gold} | <strong>Kills:</strong> ${state.kills}</div>
    <div><strong>Potions:</strong> ${state.player.healthPotions} HP / ${state.player.manaPotions} MP</div>
    <div><strong>Cooldowns:</strong> Dash ${state.player.dashCd.toFixed(1)}s | Nova ${state.player.novaCd.toFixed(1)}s</div>
  `;

  skillsEl.innerHTML = `
    <h2>Warden Build</h2>
    <div>Mouse Look: ${state.pointerLocked ? 'Active' : 'Click to capture'}</div>
    <div>Passive Regen: ${state.player.regen > 0 ? `${state.player.regen.toFixed(1)}/s` : 'Locked'}</div>
    <div>Critical Chance: ${Math.round(state.player.critChance * 100)}%</div>
    <div>Relic Fortune: ${state.player.luck ? 'Enhanced' : 'Normal'}</div>
    <div>Towns Reached: ${Math.min(state.leg, 6)} / 6</div>
  `;
}

function winGame() {
  if (state.gameOver) return;
  state.gameOver = true;
  state.running = false;
  townPanel.classList.add('hidden');
  endPanel.classList.remove('hidden');
  endPanel.innerHTML = `
    <h2>The Ember Kingdom Endures</h2>
    <p>You crossed the full haunted road, reached all six towns, and delivered the Heartflame Ember to the kingdom at dawn.</p>
    <p><strong>Final tally:</strong> Level ${state.level}, ${state.kills} kills, ${state.gold} gold, ${state.player.healthPotions} health potions, ${state.player.manaPotions} mana potions.</p>
    <button onclick="window.location.reload()">March Again</button>
  `;
  if (document.pointerLockElement === canvas) document.exitPointerLock();
}

function loseGame() {
  if (state.gameOver) return;
  state.gameOver = true;
  state.running = false;
  endPanel.classList.remove('hidden');
  endPanel.innerHTML = `
    <h2>The Forest Closes Over the Road</h2>
    <p>Caelan falls before the Heartflame reaches the capital. The torches gutter and the kingdom waits in darkness.</p>
    <p><strong>Progress:</strong> town ${state.leg} of 6, level ${state.level}, ${state.kills} kills, ${state.gold} gold.</p>
    <button onclick="window.location.reload()">Try Again</button>
  `;
  if (document.pointerLockElement === canvas) document.exitPointerLock();
}

function tick(dt) {
  if (!state.running || state.gameOver) return;
  if (mouse.attackHeld) meleeAttack();
  updatePlayer(dt);
  updateSpawns();
  updateEnemies(dt);
  updateLoot();
  updateParticles(dt);
  updateTownTriggers();

  cameraRig.rotation.y = state.camera.yaw;
  pitchRig.rotation.x = state.camera.pitch;

  if (state.player.health <= 0) loseGame();

  renderHud();
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);
  if (key === ' ') meleeAttack();
  if (key === 'q') castDashSlash();
  if (key === 'r') castNovaBurst();
  if (key === '1') usePotion('health');
  if (key === '2') usePotion('mana');
  if (key === 'e' && state.inTown && !state.gameOver && state.leg < 6) leaveTown();
});
window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));

canvas.addEventListener('click', () => {
  if (!state.gameOver && state.running && document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
  }
});

document.addEventListener('pointerlockchange', () => {
  state.pointerLocked = document.pointerLockElement === canvas;
  renderHud();
});

document.addEventListener('mousemove', (event) => {
  if (!state.pointerLocked) return;
  state.camera.yaw -= event.movementX * 0.0024;
  state.camera.pitch -= event.movementY * 0.0022;
  state.camera.pitch = THREE.MathUtils.clamp(state.camera.pitch, -1.15, 1.05);
});

window.addEventListener('mousedown', (event) => {
  if (event.button === 0) {
    mouse.attackHeld = true;
    meleeAttack();
  }
});
window.addEventListener('mouseup', (event) => {
  if (event.button === 0) mouse.attackHeld = false;
});

startButton.addEventListener('click', () => {
  introPanel.classList.add('hidden');
  state.running = true;
  cameraRig.position.set(0, 0, 2);
  enterTown(0);
  renderHud();
  canvas.requestPointerLock();
});

addLog('Lore: Carry the Heartflame Ember across six haunted towns to the Ember Kingdom before the forest devours the road.');
renderHud();

let previous = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.033, (now - previous) / 1000);
  previous = now;
  tick(dt);
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
