// Midnight Vault — screenshot staging. One job: fixed scenes for the 4 screenshots.
window.Vault = window.Vault || {};
window.Vault.shots = (function () {
  'use strict';
  var V = window.Vault.vision;

  function placeGuard(state, i, x, y, facing) {
    var g = state.guards[i];
    g.x = x; g.y = y; g.facing = facing;
    g.state = 'patrol'; g.waiting = 99; g.alert = 0;
  }

  function placeCamera(state, i, facing, disabled) {
    var cam = state.cameras[i];
    cam.facing = facing;
    cam.disabled = disabled || 0;
    cam.alert = 0;
  }

  // Each shot is a real render of the game's own code, frozen mid-moment.
  function applyShot(state, n) {
    state.phase = 'play';
    state.frozen = true;
    state.toast = '';
    state.toastTimer = 0;
    if (n === 1) {
      // The approach: Wren sneaking behind a case, cones sweeping, sapphire glowing.
      state.time = 42;
      state.alarm = 22;
      state.player.x = 280; state.player.y = 600; state.player.sneaking = true;
      state.player.facing = Math.PI / 4;
      placeGuard(state, 0, 520, 140, Math.PI * 0.45);
      placeGuard(state, 1, 1080, 420, Math.PI);
      placeGuard(state, 2, 420, 600, 0);
      placeCamera(state, 0, Math.PI * 0.72, 0);
      placeCamera(state, 1, -0.3, 0);
      state.toast = 'Stay out of the cones. Shift sneaks. Click tosses a coin.';
      state.toastTimer = 99;
    } else if (n === 2) {
      // Spotted at the pedestal: cones converging, alarm nearly full.
      state.time = 88;
      state.alarm = 78;
      state.spotted = true;
      state.player.x = 905; state.player.y = 400; state.player.sneaking = false;
      state.player.facing = 0;
      state.player.lootValue = 120; state.player.lootCount = 1;
      state.loot[1].taken = true; // Moonlit Portrait pocketed
      placeGuard(state, 0, 700, 250, Math.PI * 0.15);
      placeGuard(state, 1, 1080, 470, Math.PI * 0.85);
      state.guards[1].alert = 0.9;
      placeGuard(state, 2, 640, 600, -Math.PI * 0.4);
      state.guards[0].alert = 0.7;
      placeCamera(state, 0, Math.PI * 0.6, 0);
      placeCamera(state, 1, 0.1, 0);
      state.toast = 'SPOTTED — break line of sight!';
      state.toastTimer = 99;
    } else if (n === 3) {
      // The getaway: sapphire in hand, running for the skylight exit.
      state.time = 104;
      state.alarm = 55;
      state.player.x = 560; state.player.y = 300; state.player.sneaking = false;
      state.player.facing = Math.PI;
      state.player.hasSapphire = true;
      state.player.lootValue = 620; state.player.lootCount = 2;
      state.loot[0].taken = true;
      state.loot[1].taken = true;
      placeGuard(state, 0, 700, 210, Math.PI * 0.8);
      state.guards[0].alert = 0.6;
      placeGuard(state, 1, 1080, 300, Math.PI * 0.9);
      placeGuard(state, 2, 380, 600, -Math.PI * 0.5);
      placeCamera(state, 0, Math.PI * 0.5, 0);
      placeCamera(state, 1, -0.5, 0);
      state.toast = 'Star Sapphire secured! Get to the exit!';
      state.toastTimer = 99;
    } else {
      // Clean sweep: EMP has the cameras dark, smoke covers Odo, gold in hand.
      state.time = 76;
      state.alarm = 12;
      state.player.x = 640; state.player.y = 640; state.player.sneaking = true;
      state.player.facing = -Math.PI / 2;
      state.player.lootValue = 770; state.player.lootCount = 3;
      state.player.emp = 0; state.player.smoke = 1;
      state.loot[0].taken = true;
      state.loot[1].taken = true;
      state.loot[3].taken = true;
      state.player.hasSapphire = true;
      state.player.smokeClouds = [{ x: 560, y: 600, t: 2.4 }];
      state.player.inSmoke = false;
      placeGuard(state, 0, 800, 210, Math.PI * 0.2);
      placeGuard(state, 1, 1080, 560, Math.PI);
      placeGuard(state, 2, 470, 600, 0);
      placeCamera(state, 0, Math.PI * 0.72, 4.5);
      placeCamera(state, 1, 0, 4.5);
      state.toast = 'Cameras dark — 6 seconds of quiet.';
      state.toastTimer = 99;
    }
    return state;
  }

  return { applyShot: applyShot };
})();
