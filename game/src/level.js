// Midnight Vault — the room. One job: the gallery layout, cover, loot and patrols.
window.Vault = window.Vault || {};
window.Vault.level = (function () {
  'use strict';
  var C = window.Vault.config;
  // Playfield inside the walls and under the HUD bar.
  var field = { x: C.wall, y: C.hudHeight + 8, w: C.canvasWidth - C.wall * 2, h: C.canvasHeight - C.hudHeight - 8 - C.wall };

  // Cover blocks movement and blocks vision. kind: 'case' | 'planter' | 'rope'.
  // Ropes block movement but not sight lines.
  var cover = [
    { kind: 'case', x: 210, y: 210, w: 150, h: 74, label: 'Vase Hall' },
    { kind: 'case', x: 480, y: 180, w: 150, h: 74, label: 'Coin Hoard' },
    { kind: 'case', x: 830, y: 210, w: 150, h: 74, label: 'Crown Jewels' },
    { kind: 'case', x: 300, y: 470, w: 150, h: 74, label: 'Ivory Room' },
    { kind: 'case', x: 620, y: 500, w: 150, h: 74, label: 'Silk Road' },
    { kind: 'case', x: 950, y: 560, w: 150, h: 74, label: 'Relic Row' },
    { kind: 'planter', x: 205, y: 620, r: 42 },
    { kind: 'planter', x: 1120, y: 180, r: 42 },
    { kind: 'planter', x: 660, y: 300, r: 38 },
    { kind: 'rope', x: 880, y: 300, w: 180, h: 14 },
    { kind: 'rope', x: 240, y: 330, w: 180, h: 14 }
  ];

  var loot = [
    { id: 'sapphire', kind: 'sapphire', x: 1010, y: 392, r: 20, value: C.loot.sapphire, taken: false, name: 'Star Sapphire' },
    { id: 'painting-a', kind: 'painting', x: 330, y: 170, r: 16, value: C.loot.painting, taken: false, name: 'Moonlit Portrait' },
    { id: 'painting-b', kind: 'painting', x: 1150, y: 640, r: 16, value: C.loot.painting, taken: false, name: 'Gilded Sunrise' },
    { id: 'gold', kind: 'gold', x: 640, y: 660, r: 16, value: C.loot.gold, taken: false, name: 'Gold Ingots' }
  ];

  var guards = [
    { name: 'Bram', path: [{ x: 300, y: 140 }, { x: 900, y: 140 }], pause: 1.6 },
    { name: 'Sable', path: [{ x: 1080, y: 220 }, { x: 1080, y: 640 }], pause: 1.2 },
    { name: 'Odo', path: [{ x: 260, y: 600 }, { x: 820, y: 600 }], pause: 2.0 }
  ];

  var cameras = [
    { id: 'cam-a', x: 1212, y: 104, base: Math.PI * 0.72, name: 'Cam A' },
    { id: 'cam-b', x: 52, y: 420, base: 0, name: 'Cam B' }
  ];

  var spawn = { x: 100, y: 716 };
  var exit = { x: 100, y: 122, w: 90, h: 42 };

  function cloneLoot() {
    return loot.map(function (l) {
      return { id: l.id, kind: l.kind, x: l.x, y: l.y, r: l.r, value: l.value, taken: false, name: l.name };
    });
  }

  return { field: field, cover: cover, loot: loot, guards: guards, cameras: cameras, spawn: spawn, exit: exit, cloneLoot: cloneLoot };
})();
