import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('game');
const lockHint = document.getElementById('lockHint');
const ui = {
  health: document.getElementById('health'),
  crystals: document.getElementById('crystals'),
  combo: document.getElementById('combo'),
  checkpoint: document.getElementById('checkpoint'),
  message: document.getElementById('message'),
  assistToggle: document.getElementById('assistToggle'),
};

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1324);
scene.fog = new THREE.Fog(0x0b1324, 20, 90);

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 220);
camera.rotation.order = 'YXZ';
scene.add(camera);

const hemi = new THREE.HemisphereLight(0x87b9ff, 0x182030, 1.8);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffffff, 1.7);
sun.position.set(14, 24, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 90;
sun.shadow.camera.left = -30;
sun.shadow.camera.right = 30;
sun.shadow.camera.top = 30;
sun.shadow.camera.bottom = -30;
scene.add(sun);

const starField = new THREE.Points(
  new THREE.BufferGeometry(),
  new THREE.PointsMaterial({ color: 0xdaf4ff, size: 0.18, transparent: true, opacity: 0.95 })
);
const stars = [];
for (let i = 0; i < 350; i += 1) {
  stars.push((Math.random() - 0.5) * 160, Math.random() * 80 + 14, (Math.random() - 0.5) * 160);
}
starField.geometry.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
scene.add(starField);

const platformMaterialPalette = [0x5985ff, 0x53d0c6, 0x8d68ff, 0xffb54d, 0xf86fd0, 0x5ee7a5, 0x8dd4ff];
const platforms = [
  { pos: [0, 0, 0], size: [12, 1.4, 12], color: platformMaterialPalette[0] },
  { pos: [11, 3, -2], size: [10, 1.2, 10], color: platformMaterialPalette[1] },
  { pos: [23, 6, -5], size: [10, 1.2, 10], color: platformMaterialPalette[2] },
  { pos: [34, 8.4, -2], size: [12, 1.4, 12], color: platformMaterialPalette[3] },
  { pos: [19, 10.7, 11], size: [8, 1.2, 8], color: platformMaterialPalette[4] },
  { pos: [31, 13.2, 14], size: [8, 1.2, 8], color: platformMaterialPalette[5] },
  { pos: [43, 16, 10], size: [12, 1.6, 12], color: platformMaterialPalette[6] },
];

const worldBoxes = [];
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x6ea2ff, roughness: 0.72, metalness: 0.08 });
platforms.forEach((platform) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...platform.size), floorMaterial.clone());
  mesh.material.color.setHex(platform.color);
  mesh.position.set(...platform.pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  worldBoxes.push({
    minX: platform.pos[0] - platform.size[0] / 2,
    maxX: platform.pos[0] + platform.size[0] / 2,
    minZ: platform.pos[2] - platform.size[2] / 2,
    maxZ: platform.pos[2] + platform.size[2] / 2,
    top: platform.pos[1] + platform.size[1] / 2,
  });

  const trim = new THREE.Mesh(
    new THREE.TorusGeometry(Math.max(platform.size[0], platform.size[2]) * 0.22, 0.08, 10, 40),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 })
  );
  trim.rotation.x = Math.PI / 2;
  trim.position.set(platform.pos[0], platform.pos[1] + platform.size[1] / 2 + 0.18, platform.pos[2]);
  scene.add(trim);
});

const bridgeMaterial = new THREE.MeshStandardMaterial({ color: 0x30476d, roughness: 0.9 });
[
  { pos: [17, 4.5, -3.5], size: [6, 0.4, 3] },
  { pos: [29, 7.2, -3], size: [6, 0.4, 3] },
  { pos: [26, 11.8, 12.6], size: [5, 0.4, 3] },
  { pos: [37, 14.5, 12.2], size: [5, 0.4, 3] },
].forEach((bridge) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...bridge.size), bridgeMaterial);
  mesh.position.set(...bridge.pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  worldBoxes.push({
    minX: bridge.pos[0] - bridge.size[0] / 2,
    maxX: bridge.pos[0] + bridge.size[0] / 2,
    minZ: bridge.pos[2] - bridge.size[2] / 2,
    maxZ: bridge.pos[2] + bridge.size[2] / 2,
    top: bridge.pos[1] + bridge.size[1] / 2,
  });
});

const skyIsles = [];
for (let i = 0; i < 18; i += 1) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(Math.random() * 1.5 + 0.8),
    new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x263555 : 0x30446c, roughness: 1 })
  );
  rock.position.set((Math.random() - 0.5) * 120, Math.random() * 20 - 10, (Math.random() - 0.5) * 120);
  rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  scene.add(rock);
  skyIsles.push(rock);
}

const checkpoints = [
  { name: 'Start', position: new THREE.Vector3(0, 2.6, 0) },
  { name: 'Sky Bridge', position: new THREE.Vector3(23, 7.4, -5) },
  { name: 'Star Spire', position: new THREE.Vector3(43, 17.6, 10) },
];

const checkpointVisuals = checkpoints.map((checkpoint, index) => {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 3.3),
    new THREE.MeshStandardMaterial({ color: 0xd7dff9, metalness: 0.3, roughness: 0.4 })
  );
  pole.position.copy(checkpoint.position).add(new THREE.Vector3(index === 0 ? -3 : 0, 1.3, index === 0 ? -2 : 0));
  pole.castShadow = true;
  const banner = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.9, 0.08),
    new THREE.MeshStandardMaterial({ color: index === 0 ? 0x4fd8ff : index === 1 ? 0xffd166 : 0xc77dff, emissive: 0x111111 })
  );
  banner.position.copy(pole.position).add(new THREE.Vector3(0.8, 0.75, 0));
  scene.add(pole, banner);
  return { checkpoint, pole, banner };
});

const crystalGeo = new THREE.OctahedronGeometry(0.55, 0);
const crystalMat = new THREE.MeshStandardMaterial({ color: 0x7cf2ff, emissive: 0x2ecdf3, emissiveIntensity: 0.75, roughness: 0.15, metalness: 0.4 });
const crystals = [
  [3, 2.7, 0], [10.5, 5.2, -2], [18, 7.6, -4], [24.5, 8.4, -5],
  [32, 10.7, -1], [19, 12.1, 11], [31, 14.7, 14], [43, 18.4, 10],
].map((coords) => {
  const mesh = new THREE.Mesh(crystalGeo, crystalMat.clone());
  mesh.position.set(...coords);
  mesh.castShadow = true;
  scene.add(mesh);
  return { mesh, taken: false, baseY: coords[1] };
});

const enemies = [
  { pos: [13, 4.3, -2], hp: 3, speed: 2.1, radius: 0.9, color: 0xff7f7f },
  { pos: [27, 7.2, -5], hp: 3, speed: 2.3, radius: 0.95, color: 0xffad66 },
  { pos: [31, 14.1, 14], hp: 4, speed: 2.5, radius: 1.05, color: 0xff5c8a },
  { pos: [42, 17.2, 8], hp: 5, speed: 2.7, radius: 1.15, color: 0xc77dff },
].map((enemyData) => {
  const root = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(enemyData.radius, 18, 18),
    new THREE.MeshStandardMaterial({ color: enemyData.color, emissive: enemyData.color, emissiveIntensity: 0.18, roughness: 0.6 })
  );
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x101010 });
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeMat);
  const rightEye = leftEye.clone();
  leftEye.position.set(-0.22, 0.18, 0.72);
  rightEye.position.set(0.22, 0.18, 0.72);
  root.add(body, leftEye, rightEye);
  root.position.set(...enemyData.pos);
  root.castShadow = true;
  body.castShadow = true;
  body.receiveShadow = true;
  scene.add(root);
  return { ...enemyData, baseY: enemyData.pos[1], root, alive: true };
});

const portalGroup = new THREE.Group();
const portalRing = new THREE.Mesh(
  new THREE.TorusGeometry(1.5, 0.24, 18, 60),
  new THREE.MeshStandardMaterial({ color: 0xa68cff, emissive: 0x7257ff, emissiveIntensity: 1.2, roughness: 0.2, metalness: 0.3 })
);
portalRing.rotation.y = Math.PI / 2;
const portalCore = new THREE.Mesh(
  new THREE.SphereGeometry(0.95, 24, 24),
  new THREE.MeshBasicMaterial({ color: 0x8ff7ff, transparent: true, opacity: 0.72 })
);
portalGroup.add(portalRing, portalCore);
portalGroup.position.set(46, 17.8, 10);
scene.add(portalGroup);

const projectileGeometry = new THREE.SphereGeometry(0.18, 12, 12);
const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xe6d6ff });
const particleGeometry = new THREE.SphereGeometry(0.06, 8, 8);
const projectiles = [];
const particles = [];

const player = {
  position: checkpoints[0].position.clone().add(new THREE.Vector3(0, 1.2, 0)),
  velocity: new THREE.Vector3(),
  checkpoint: checkpoints[0],
  health: 5,
  crystals: 0,
  combo: 1,
  onGround: false,
  coyote: 0,
  jumpBuffer: 0,
  dashReady: true,
  fireCooldown: 0,
  hurtTimer: 0,
};

const state = {
  paused: false,
  assistMode: false,
  won: false,
  pointerLocked: false,
};

const input = new Set();
let yaw = -0.55;
let pitch = -0.15;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function syncCamera() {
  camera.position.copy(player.position).add(new THREE.Vector3(0, 0.9, 0));
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
}

function setMessage(text) {
  ui.message.textContent = text;
}

function setPointerLock(active) {
  state.pointerLocked = active;
  lockHint.classList.toggle('hidden', active);
}

canvas.addEventListener('click', () => {
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
    return;
  }
  castSpell();
});

document.addEventListener('pointerlockchange', () => {
  setPointerLock(document.pointerLockElement === canvas);
});

document.addEventListener('mousemove', (event) => {
  if (!state.pointerLocked || state.paused || state.won) return;
  yaw -= event.movementX * 0.0026;
  pitch = clamp(pitch - event.movementY * 0.0022, -1.2, 1.1);
});

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  input.add(key);
  if (event.code === 'Space') player.jumpBuffer = 0.15;
  if (key === 'p') state.paused = !state.paused;
  if (key === 'r') respawn(false);
  if (key === 'f') castSpell();
});
window.addEventListener('keyup', (event) => input.delete(event.key.toLowerCase()));

ui.assistToggle.addEventListener('click', () => {
  state.assistMode = !state.assistMode;
  ui.assistToggle.textContent = `Assist mode: ${state.assistMode ? 'ON' : 'OFF'}`;
  setMessage(
    state.assistMode
      ? 'Assist mode active: taller jumps, softer damage, and a larger portal target.'
      : 'Assist mode disabled. Standard challenge restored.'
  );
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function spawnParticleBurst(position, color, count, scale = 1) {
  for (let i = 0; i < count; i += 1) {
    const mesh = new THREE.Mesh(particleGeometry, new THREE.MeshBasicMaterial({ color }));
    mesh.position.copy(position);
    scene.add(mesh);
    particles.push({
      mesh,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 4 * scale, Math.random() * 4 * scale, (Math.random() - 0.5) * 4 * scale),
      life: Math.random() * 0.55 + 0.2,
    });
  }
}

function respawn(fullReset) {
  player.position.copy(player.checkpoint.position).add(new THREE.Vector3(0, 1.2, 0));
  player.velocity.set(0, 0, 0);
  player.onGround = false;
  player.coyote = 0;
  player.jumpBuffer = 0;
  player.dashReady = true;
  player.fireCooldown = 0;
  player.hurtTimer = 0;
  player.health = fullReset ? 5 : Math.max(player.health, state.assistMode ? 4 : 3);
  player.combo = 1;

  if (fullReset) {
    player.crystals = 0;
    player.health = 5;
    player.checkpoint = checkpoints[0];
    crystals.forEach((crystal) => {
      crystal.taken = false;
      crystal.mesh.visible = true;
    });
    enemies.forEach((enemy, index) => {
      enemy.alive = true;
      enemy.hp = index < 2 ? 3 : index === 2 ? 4 : 5;
      enemy.root.visible = true;
      enemy.root.position.set(...enemy.pos);
    });
    state.won = false;
    setMessage('New run! Explore the floating ruins in full 3D, collect the crystals, and clear the portal.');
  }

  syncCamera();
}

function castSpell() {
  if (player.fireCooldown > 0 || state.paused || state.won) return;
  const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  projectile.position.copy(camera.position).add(direction.clone().multiplyScalar(0.8));
  scene.add(projectile);
  projectiles.push({ mesh: projectile, velocity: direction.multiplyScalar(28), life: 1.4 });
  player.fireCooldown = 0.22;
}

function groundHeightAt(position, previousY) {
  let best = -Infinity;
  for (const box of worldBoxes) {
    const insideX = position.x > box.minX - 0.45 && position.x < box.maxX + 0.45;
    const insideZ = position.z > box.minZ - 0.45 && position.z < box.maxZ + 0.45;
    const nearTop = previousY >= box.top - 0.9;
    if (insideX && insideZ && nearTop) best = Math.max(best, box.top);
  }
  return best;
}

function updatePlayer(dt) {
  player.fireCooldown = Math.max(0, player.fireCooldown - dt);
  player.hurtTimer = Math.max(0, player.hurtTimer - dt);
  player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);
  player.coyote = Math.max(0, player.coyote - dt);

  const move = new THREE.Vector3();
  if (input.has('w') || input.has('arrowup')) move.z -= 1;
  if (input.has('s') || input.has('arrowdown')) move.z += 1;
  if (input.has('a') || input.has('arrowleft')) move.x -= 1;
  if (input.has('d') || input.has('arrowright')) move.x += 1;
  if (move.lengthSq() > 0) move.normalize();

  const speed = state.assistMode ? 10.4 : 8.8;
  const acceleration = state.assistMode ? 30 : 22;
  const friction = player.onGround ? 12 : 3.5;

  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).negate();
  const desired = new THREE.Vector3()
    .add(forward.multiplyScalar(-move.z))
    .add(right.multiplyScalar(move.x))
    .multiplyScalar(speed);

  player.velocity.x = THREE.MathUtils.lerp(player.velocity.x, desired.x, clamp(acceleration * dt, 0, 1));
  player.velocity.z = THREE.MathUtils.lerp(player.velocity.z, desired.z, clamp(acceleration * dt, 0, 1));
  if (move.lengthSq() === 0) {
    player.velocity.x = THREE.MathUtils.lerp(player.velocity.x, 0, clamp(friction * dt, 0, 1));
    player.velocity.z = THREE.MathUtils.lerp(player.velocity.z, 0, clamp(friction * dt, 0, 1));
  }

  if ((input.has('shift') || input.has('q')) && player.dashReady && !player.onGround) {
    const dashDirection = new THREE.Vector3(Math.sin(yaw), 0.15, Math.cos(yaw)).normalize();
    player.velocity.add(dashDirection.multiplyScalar(state.assistMode ? 8.8 : 7));
    player.dashReady = false;
    spawnParticleBurst(player.position, 0x45f6d2, 18, 1.2);
  }

  if (player.jumpBuffer > 0 && (player.onGround || player.coyote > 0)) {
    player.velocity.y = state.assistMode ? 12.5 : 10.8;
    player.onGround = false;
    player.coyote = 0;
    player.jumpBuffer = 0;
    spawnParticleBurst(player.position.clone().add(new THREE.Vector3(0, -0.8, 0)), 0xffffff, 14);
  }

  player.velocity.y -= 28 * dt;
  const previousY = player.position.y;
  player.position.addScaledVector(player.velocity, dt);
  player.onGround = false;

  const floorY = groundHeightAt(player.position, previousY);
  if (floorY > -Infinity && player.position.y <= floorY + 1.2 && player.velocity.y <= 0) {
    player.position.y = floorY + 1.2;
    player.velocity.y = 0;
    player.onGround = true;
    player.coyote = state.assistMode ? 0.2 : 0.14;
    player.dashReady = true;
  }

  if (player.position.y < -18) {
    setMessage('You fell into the void. Respawning at your latest checkpoint.');
    respawn(false);
  }

  checkpoints.forEach((checkpoint, index) => {
    const bannerPos = checkpointVisuals[index].pole.position;
    if (player.position.distanceTo(bannerPos) < 2.4 && player.checkpoint !== checkpoint) {
      player.checkpoint = checkpoint;
      ui.checkpoint.textContent = checkpoint.name;
      spawnParticleBurst(bannerPos.clone().add(new THREE.Vector3(0, 1.2, 0)), 0xffd166, 18, 1.1);
      setMessage(`${checkpoint.name} checkpoint unlocked.`);
    }
  });
}

function updateCollectiblesAndEnemies(dt, elapsed) {
  crystals.forEach((crystal) => {
    if (crystal.taken) return;
    crystal.mesh.rotation.y += dt * 1.6;
    crystal.mesh.position.y = crystal.baseY + Math.sin(elapsed * 2 + crystal.baseY) * 0.25;
    if (player.position.distanceTo(crystal.mesh.position) < 1.35) {
      crystal.taken = true;
      crystal.mesh.visible = false;
      player.crystals += 1;
      player.combo = Math.min(5, player.combo + 0.16);
      spawnParticleBurst(crystal.mesh.position, 0x7cf2ff, 16, 1.1);
      setMessage('Crystal collected! Your combo multiplier increased.');
    }
  });

  enemies.forEach((enemy) => {
    if (!enemy.alive) return;
    enemy.root.position.y = enemy.baseY + Math.sin(elapsed * 4 + enemy.baseY) * 0.16;
    const target = player.position.clone();
    target.y = enemy.root.position.y;
    const delta = target.sub(enemy.root.position);
    const dist = delta.length();
    if (dist < 10) {
      delta.normalize();
      enemy.root.position.addScaledVector(delta, enemy.speed * dt);
    }

    if (dist < enemy.radius + 0.8 && player.hurtTimer === 0) {
      player.health -= state.assistMode ? 0.5 : 1;
      player.hurtTimer = 1;
      spawnParticleBurst(player.position, 0xff4d6d, 18, 1.2);
      setMessage('You were hit by a slime. Blast enemies before they crowd you.');
      if (player.health <= 0) {
        setMessage('You ran out of health. Restarting from your checkpoint.');
        respawn(false);
      }
    }
  });
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = projectiles[i];
    projectile.life -= dt;
    projectile.mesh.position.addScaledVector(projectile.velocity, dt);
    if (projectile.life <= 0) {
      scene.remove(projectile.mesh);
      projectiles.splice(i, 1);
      continue;
    }

    let hitEnemy = false;
    enemies.forEach((enemy) => {
      if (!enemy.alive || hitEnemy) return;
      if (projectile.mesh.position.distanceTo(enemy.root.position) < enemy.radius + 0.45) {
        enemy.hp -= 1;
        hitEnemy = true;
        spawnParticleBurst(enemy.root.position.clone(), 0x9f7bff, 14, 1.1);
        if (enemy.hp <= 0) {
          enemy.alive = false;
          enemy.root.visible = false;
          player.combo = Math.min(5, player.combo + 0.35);
          spawnParticleBurst(enemy.root.position.clone(), 0x45f6d2, 22, 1.4);
          setMessage('Enemy defeated! Keep moving and cash in your combo route.');
        }
      }
    });

    if (hitEnemy) {
      scene.remove(projectile.mesh);
      projectiles.splice(i, 1);
    }
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.life -= dt;
    particle.velocity.y -= 8 * dt;
    particle.mesh.position.addScaledVector(particle.velocity, dt);
    particle.mesh.scale.setScalar(Math.max(0.01, particle.life * 1.8));
    if (particle.life <= 0) {
      scene.remove(particle.mesh);
      particles.splice(i, 1);
    }
  }
}

function updatePortal(elapsed) {
  portalGroup.rotation.y = elapsed * 1.5;
  portalCore.scale.setScalar(1 + Math.sin(elapsed * 3.2) * 0.08);
  const portalRadius = state.assistMode ? 2.8 : 2.15;
  if (!state.won && player.crystals === crystals.length && player.position.distanceTo(portalGroup.position) < portalRadius) {
    state.won = true;
    setMessage('Portal cleared! You completed the 3D prototype. Reload or press R for another run.');
  }
}

function updateUi() {
  ui.health.textContent = Math.ceil(player.health).toString();
  ui.crystals.textContent = `${player.crystals} / ${crystals.length}`;
  ui.combo.textContent = `x${player.combo.toFixed(1)}`;
  ui.checkpoint.textContent = player.checkpoint.name;
}

function animate(time) {
  const elapsed = time * 0.001;
  const dt = Math.min(0.033, animate.last ? elapsed - animate.last : 0.016);
  animate.last = elapsed;

  if (!state.paused && !state.won) {
    updatePlayer(dt);
    updateCollectiblesAndEnemies(dt, elapsed);
    updateProjectiles(dt);
    updateParticles(dt);
  } else {
    updateParticles(dt);
  }

  updatePortal(elapsed);

  checkpointVisuals.forEach(({ banner }, index) => {
    banner.rotation.y = elapsed * 0.8 + index;
  });
  skyIsles.forEach((rock, index) => {
    rock.rotation.x += dt * 0.08;
    rock.rotation.y += dt * (0.06 + index * 0.001);
  });

  syncCamera();
  updateUi();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

respawn(true);
setPointerLock(false);
requestAnimationFrame(animate);
