// Midnight Vault — game state. One job: alarm, phases, scoring and objectives.
window.Vault = window.Vault || {};
window.Vault.game = (function () {
  'use strict';
  var C = window.Vault.config;
  var L = window.Vault.level;

  function makeState() {
    return {
      phase: 'title', // title | play | caught | won
      time: 0,
      alarm: 0,
      spotted: false,
      spotGrace: 0,
      alarmsRaised: 0,
      player: window.Vault.player.makePlayer(L.spawn),
      guards: L.guards.map(function (g) { return window.Vault.vision.makeGuard(g); }),
      cameras: L.cameras.map(function (c) { return window.Vault.cameras.makeCamera(c); }),
      loot: L.cloneLoot(),
      toast: '',
      toastTimer: 0,
      exitOpen: false,
      frozen: false // screenshot mode: render once, never advance
    };
  }

  function fmtTime(t) {
    var m = Math.floor(t / 60), s = Math.floor(t % 60);
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function objective(s) {
    if (s.phase === 'title') return 'Press ENTER to slip inside';
    if (s.phase === 'won') return 'Clean getaway — the Vault is yours';
    if (s.phase === 'caught') return 'Caught — press R to try again';
    if (!s.player.hasSapphire) return 'Steal the Star Sapphire from its pedestal';
    return 'Sapphire secured — reach the skylight exit, top left';
  }

  function say(s, text, seconds) {
    s.toast = text;
    s.toastTimer = seconds || 2.6;
  }

  function update(s, dt, input, audio) {
    if (s.phase === 'title') {
      if (input.consumePress('enter') || input.consumeClick()) {
        s.phase = 'play';
        audio.ensure();
        say(s, 'Stay out of the cones. Shift sneaks. Click tosses a coin.', 4);
      }
      return;
    }
    if (s.phase === 'caught' || s.phase === 'won') {
      if (input.consumePress('r')) {
        var fresh = makeState();
        fresh.phase = 'play';
        return fresh;
      }
      return null;
    }
    // ---- play ----
    s.time += dt;
    if (s.toastTimer > 0) s.toastTimer -= dt;
    var p = s.player;
    window.Vault.player.move(p, dt, input, L.cover, L.field);
    window.Vault.player.updateTools(p, dt, input, s.guards, s.cameras, audio);
    var got = window.Vault.player.tryPickup(p, s.loot, audio);
    if (got) {
      if (got.kind === 'sapphire') say(s, 'Star Sapphire secured! Get to the exit!', 3.5);
      else say(s, got.name + ' pocketed — $' + got.value, 2.2);
    }
    var anySeen = false;
    for (var i = 0; i < s.guards.length; i++) {
      if (window.Vault.vision.updateGuard(s.guards[i], dt, p, L.cover, s.guards)) anySeen = true;
    }
    for (var j = 0; j < s.cameras.length; j++) {
      if (window.Vault.cameras.updateCamera(s.cameras[j], dt, s.time, p, L.cover)) anySeen = true;
    }
    // Alarm: grace while first spotted, then it climbs fast.
    if (anySeen) {
      if (!s.spotted) {
        s.spotted = true;
        s.spotGrace = C.alarmSpotGrace;
        audio.spotted();
      }
      if (s.spotGrace > 0) {
        s.spotGrace -= dt;
      } else {
        s.alarm += C.alarmRiseSpotted * dt;
        audio.startAlarmLoop();
      }
      s.alarm = Math.min(C.alarmCaught, s.alarm + C.alarmRiseSeen * dt * 0.35);
    } else {
      if (s.spotted) { s.spotted = false; s.alarmsRaised += 1; }
      s.alarm = Math.max(0, s.alarm - C.alarmDecay * dt);
      audio.stopAlarmLoop();
    }
    if (s.alarm >= C.alarmCaught) {
      s.phase = 'caught';
      p.alive = false;
      audio.stopAlarmLoop();
      audio.caught();
      return null;
    }
    // Exit opens once the sapphire is taken.
    s.exitOpen = p.hasSapphire;
    if (s.exitOpen) {
      var e = L.exit;
      if (p.x > e.x - 10 && p.x < e.x + e.w + 10 && p.y > e.y - 10 && p.y < e.y + e.h + 10) {
        s.phase = 'won';
        audio.stopAlarmLoop();
        audio.win();
      }
    }
    if (input.consumePress('m')) audio.toggleMute();
    return null;
  }

  function score(s) {
    var timeBonus = Math.max(0, Math.round((C.parSeconds - s.time) * 2));
    var alarmPenalty = s.alarmsRaised * 40;
    return { loot: s.player.lootValue, timeBonus: timeBonus, penalty: alarmPenalty, total: Math.max(0, s.player.lootValue + timeBonus - alarmPenalty) };
  }

  return { makeState: makeState, fmtTime: fmtTime, objective: objective, say: say, update: update, score: score };
})();
