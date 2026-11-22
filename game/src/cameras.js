// Midnight Vault — cameras. One job: sweeping camera cones and their detection.
window.Vault = window.Vault || {};
window.Vault.cameras = (function () {
  'use strict';
  var C = window.Vault.config;
  var V = window.Vault.vision;

  function makeCamera(def) {
    return {
      id: def.id,
      name: def.name,
      x: def.x,
      y: def.y,
      base: def.base,
      phase: Math.random() * Math.PI * 2,
      facing: def.base,
      disabled: 0, // seconds left of EMP shutdown
      alert: 0
    };
  }

  function updateCamera(cam, dt, time, player, cover) {
    if (cam.disabled > 0) {
      cam.disabled -= dt;
      cam.alert = Math.max(0, cam.alert - dt);
      return false;
    }
    cam.facing = cam.base + Math.sin(time * C.cameraSweepSpeed + cam.phase) * C.cameraSweepArc;
    var seen = false;
    if (player.alive && !player.inSmoke) {
      seen = V.inCone(cam.x, cam.y, cam.facing, C.visionRangeCamera, C.visionHalfAngle, player.x, player.y) &&
        V.hasLineOfSight(cam.x, cam.y, player.x, player.y, cover);
    }
    var rate = seen ? (player.sneaking ? 0.5 : 1.0) : -0.8;
    cam.alert = Math.max(0, Math.min(1, cam.alert + rate * dt));
    return seen;
  }

  return { makeCamera: makeCamera, updateCamera: updateCamera };
})();
