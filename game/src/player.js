// Midnight Vault — the thief. One job: movement, collision and the tool belt.
window.Vault = window.Vault || {};
window.Vault.player = (function () {
  'use strict';
  var C = window.Vault.config;

  function makePlayer(spawn) {
    return {
      x: spawn.x, y: spawn.y, r: C.playerRadius,
      alive: true, sneaking: false, inSmoke: false,
      facing: -Math.PI / 2,
      coins: C.coinStart, smoke: C.smokeStart, emp: C.empStart,
      lootValue: 0, lootCount: 0, hasSapphire: false,
      coinFlight: null, // {x, y, tx, ty, t}
      smokeClouds: [], // {x, y, t}
      empTimer: 0
    };
  }

  function collideCircleRect(px, py, r, rect) {
    var cx = Math.max(rect.x, Math.min(px, rect.x + rect.w));
    var cy = Math.max(rect.y, Math.min(py, rect.y + rect.h));
    var dx = px - cx, dy = py - cy;
    return (dx * dx + dy * dy) < r * r;
  }

  function collideCircleCircle(px, py, r, c) {
    var dx = px - c.x, dy = py - c.y;
    return (dx * dx + dy * dy) < (r + c.r) * (r + c.r);
  }

  function blocked(x, y, r, cover, field) {
    if (x - r < field.x || x + r > field.x + field.w) return true;
    if (y - r < field.y || y + r > field.y + field.h) return true;
    for (var i = 0; i < cover.length; i++) {
      var c = cover[i];
      if (c.kind === 'case' || c.kind === 'rope') {
        if (collideCircleRect(x, y, r, c)) return true;
      } else if (c.kind === 'planter') {
        if (collideCircleCircle(x, y, r, c)) return true;
      }
    }
    return false;
  }

  function move(p, dt, input, cover, field) {
    var v = input.moveVector();
    p.sneaking = input.sneaking();
    var speed = p.sneaking ? C.playerSneakSpeed : C.playerWalkSpeed;
    if (v.x !== 0 || v.y !== 0) p.facing = Math.atan2(v.y, v.x);
    var nx = p.x + v.x * speed * dt;
    if (!blocked(nx, p.y, p.r, cover, field)) p.x = nx;
    var ny = p.y + v.y * speed * dt;
    if (!blocked(p.x, ny, p.r, cover, field)) p.y = ny;
  }

  function updateTools(p, dt, input, guards, cams, audio) {
    // Coin toss: click to throw at the cursor. Nearest guard investigates.
    var click = input.consumeClick();
    if (click && p.coins > 0 && !p.coinFlight) {
      p.coins -= 1;
      p.coinFlight = { x: p.x, y: p.y, tx: click.x, ty: click.y, t: 0 };
      audio.coin();
    }
    if (p.coinFlight) {
      var f = p.coinFlight;
      f.t += dt * 2.2;
      if (f.t >= 1) {
        var lx = f.tx, ly = f.ty;
        p.coinFlight = null;
        audio.clink();
        var best = null, bd = Infinity;
        for (var i = 0; i < guards.length; i++) {
          var d = Math.sqrt((guards[i].x - lx) * (guards[i].x - lx) + (guards[i].y - ly) * (guards[i].y - ly));
          if (d < bd) { bd = d; best = guards[i]; }
        }
        if (best && bd < 520) window.Vault.vision.distractGuard(best, lx, ly);
      } else {
        f.x = p.x + (f.tx - p.x) * f.t;
        f.y = p.y + (f.ty - p.y) * f.t - Math.sin(f.t * Math.PI) * 34;
      }
    }
    // Smoke bomb (Q): a cloud that hides the thief.
    if (input.consumePress('q') && p.smoke > 0) {
      p.smoke -= 1;
      p.smokeClouds.push({ x: p.x, y: p.y, t: C.smokeSeconds });
      audio.smokePuff();
    }
    // EMP pulse (E): shuts every camera down for a while.
    if (input.consumePress('e') && p.emp > 0 && p.empTimer <= 0) {
      p.emp -= 1;
      p.empTimer = C.empSeconds;
      for (var j = 0; j < cams.length; j++) cams[j].disabled = C.empSeconds;
      audio.empZap();
    }
    if (p.empTimer > 0) p.empTimer -= dt;
    // Smoke clouds age; the thief is hidden while standing in one.
    p.inSmoke = false;
    for (var k = p.smokeClouds.length - 1; k >= 0; k--) {
      var cl = p.smokeClouds[k];
      cl.t -= dt;
      if (cl.t <= 0) { p.smokeClouds.splice(k, 1); continue; }
      var dx = p.x - cl.x, dy = p.y - cl.y;
      if (dx * dx + dy * dy < C.smokeRadius * C.smokeRadius) p.inSmoke = true;
    }
  }

  function tryPickup(p, loot, audio) {
    for (var i = 0; i < loot.length; i++) {
      var l = loot[i];
      if (l.taken) continue;
      var dx = p.x - l.x, dy = p.y - l.y;
      if (dx * dx + dy * dy < (p.r + l.r + 8) * (p.r + l.r + 8)) {
        l.taken = true;
        p.lootValue += l.value;
        p.lootCount += 1;
        if (l.kind === 'sapphire') p.hasSapphire = true;
        audio.pickup();
        return l;
      }
    }
    return null;
  }

  return { makePlayer: makePlayer, move: move, updateTools: updateTools, tryPickup: tryPickup, blocked: blocked };
})();
