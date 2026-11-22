// Midnight Vault — tuning and palette. One job: every number the game uses.
window.Vault = window.Vault || {};
window.Vault.config = (function () {
  'use strict';
  return {
    canvasWidth: 1280,
    canvasHeight: 800,
    hudHeight: 64,
    wall: 40,
    playerRadius: 14,
    playerWalkSpeed: 175,
    playerSneakSpeed: 96,
    guardSpeed: 78,
    guardInvestigateSpeed: 118,
    guardRadius: 15,
    visionRangeGuard: 265,
    visionRangeCamera: 305,
    visionHalfAngle: 0.61, // ~35 degrees each side
    cameraSweepSpeed: 0.55,
    cameraSweepArc: 0.85,
    alarmSpotGrace: 0.8,
    alarmRiseSeen: 34,
    alarmRiseSpotted: 52,
    alarmDecay: 7,
    alarmCaught: 100,
    coinStart: 3,
    smokeStart: 2,
    empStart: 1,
    smokeRadius: 95,
    smokeSeconds: 3.2,
    empSeconds: 6,
    investigateSeconds: 4,
    parSeconds: 120,
    loot: { sapphire: 500, painting: 120, gold: 150 },
    colors: {
      floorA: '#1c1a26',
      floorB: '#211e2e',
      wall: '#3a3348',
      wallEdge: '#574a72',
      gold: '#f2c14e',
      goldDim: '#a8842e',
      teal: '#39c2b0',
      tealDark: '#1d7f73',
      red: '#e5484d',
      redDim: '#8c2f33',
      cone: 'rgba(242, 193, 78, 0.20)',
      coneHot: 'rgba(229, 72, 77, 0.30)',
      cameraCone: 'rgba(120, 200, 255, 0.16)',
      caseGlass: 'rgba(150, 200, 230, 0.16)',
      caseFrame: '#6b5a34',
      velvet: '#7a1f2b',
      plant: '#2e6b34',
      text: '#f4ead2',
      textDim: '#b9ac8d',
      smoke: 'rgba(200, 200, 210, 0.55)'
    }
  };
})();
