// Midnight Vault — guards and sight. One job: patrols, vision cones, detection.
window.Vault = window.Vault || {};
window.Vault.vision = (function () {
  'use strict';
  var C = window.Vault.config;

  function dist(ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function angleTo(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }

  function angleDiff(a, b) {
    var d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function segmentHitsRect(x1, y1, x2, y2, r) {
    // Slab test: does segment (x1,y1)-(x2,y2) cross rect r?
    var dx = x2 - x1, dy = y2 - y1;
    var tmin = 0, tmax = 1;
    var axes = [
      { p: x1, d: dx, lo: r.x, hi: r.x + r.w },
      { p: y1, d: dy, lo: r.y, hi: r.y + r.h }
    ];
    for (var i = 0; i < 2; i++) {
      var a = axes[i];
      if (Math.abs(a.d) < 1e-9) {
        if (a.p < a.lo || a.p > a.hi) return false;
      } else {
        var t1 = (a.lo - a.p) / a.d, t2 = (a.hi - a.p) / a.d;
        if (t1 > t2) { var tmp = t1; t1 = t2; t2 = tmp; }
        if (t1 > tmin) tmin = t1;
        if (t2 < tmax) tmax = t2;
        if (tmin > tmax) return false;
      }
    }
    return true;
  }

  function segmentHitsCircle(x1, y1, x2, y2, c) {
    var dx = x2 - x1, dy = y2 - y1;
    var len2 = dx * dx + dy * dy;
    var t = len2 === 0 ? 0 : ((c.x - x1) * dx + (c.y - y1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    var px = x1 + t * dx, py = y1 + t * dy;
    var ddx = px - c.x, ddy = py - c.y;
    return (ddx * ddx + ddy * ddy) < c.r * c.r;
  }

  // True when nothing vision-blocking stands between the two points.
  function hasLineOfSight(x1, y1, x2, y2, cover) {
    for (var i = 0; i < cover.length; i++) {
      var c = cover[i];
      if (c.kind === 'rope') continue; // ropes block feet, not eyes
      if (c.kind === 'case') {
        if (segmentHitsRect(x1, y1, x2, y2, c)) return false;
      } else if (c.kind === 'planter') {
        if (segmentHitsCircle(x1, y1, x2, y2, { x: c.x, y: c.y, r: c.r })) return false;
      }
    }
    return true;
  }

  function inCone(ox, oy, facing, range, halfAngle, tx, ty) {
    var d = dist(ox, oy, tx, ty);
    if (d > range) return false;
    if (d < 26) return true; // right on top of the watcher
    return Math.abs(angleDiff(angleTo(ox, oy, tx, ty), facing)) <= halfAngle;
  }

  function makeGuard(def) {
    return {
      name: def.name,
      path: def.path,
      pause: def.pause,
      x: def.path[0].x,
      y: def.path[0].y,
      target: 1,
      facing: 0,
      waiting: 0,
      state: 'patrol', // patrol | investigate | return
      investigate: null,
      investigateTimer: 0,
      alert: 0 // 0..1, how sure this guard is
    };
  }

  function updateGuard(g, dt, player, cover, coins) {
    var speed = g.state === 'investigate' ? C.guardInvestigateSpeed : C.guardSpeed;
    if (g.state === 'patrol') {
      var wp = g.path[g.target];
      if (g.waiting > 0) {
        g.waiting -= dt;
        g.facing += Math.sin(performance.now() / 900 + g.x) * 0.0012; // idle look-around
      } else {
        var dx = wp.x - g.x, dy = wp.y - g.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 4) {
          g.target = (g.target + 1) % g.path.length;
          g.waiting = g.pause;
        } else {
          g.x += (dx / d) * speed * dt;
          g.y += (dy / d) * speed * dt;
          g.facing = Math.atan2(dy, dx);
        }
      }
    } else if (g.state === 'investigate' && g.investigate) {
      var ix = g.investigate.x - g.x, iy = g.investigate.y - g.y;
      var id = Math.sqrt(ix * ix + iy * iy);
      if (id < 8) {
        g.investigateTimer -= dt;
        g.facing += dt * 1.4; // scanning the spot
        if (g.investigateTimer <= 0) { g.state = 'return'; }
      } else {
        g.x += (ix / id) * speed * dt;
        g.y += (iy / id) * speed * dt;
        g.facing = Math.atan2(iy, ix);
      }
    } else if (g.state === 'return') {
      // Walk back to the nearest patrol waypoint, then resume.
      var best = g.path[0], bd = Infinity;
      for (var i = 0; i < g.path.length; i++) {
        var dd = dist(g.x, g.y, g.path[i].x, g.path[i].y);
        if (dd < bd) { bd = dd; best = g.path[i]; }
      }
      var rx = best.x - g.x, ry = best.y - g.y;
      var rd = Math.sqrt(rx * rx + ry * ry);
      if (rd < 6) {
        g.target = (g.path.indexOf(best) + 1) % g.path.length;
        g.state = 'patrol';
      } else {
        g.x += (rx / rd) * speed * dt;
        g.y += (ry / rd) * speed * dt;
        g.facing = Math.atan2(ry, rx);
      }
    }
    // Detection: cone + line of sight + not hidden by smoke.
    var seen = false;
    if (player.alive && !player.inSmoke) {
      seen = inCone(g.x, g.y, g.facing, C.visionRangeGuard, C.visionHalfAngle, player.x, player.y) &&
        hasLineOfSight(g.x, g.y, player.x, player.y, cover);
    }
    var rate = seen ? (player.sneaking ? 0.55 : 1.15) : -0.8;
    g.alert = Math.max(0, Math.min(1, g.alert + rate * dt));
    return seen;
  }

  function distractGuard(g, x, y) {
    g.investigate = { x: x, y: y };
    g.investigateTimer = C.investigateSeconds;
    g.state = 'investigate';
    g.alert = Math.max(0, g.alert - 0.4);
  }

  return { dist: dist, angleTo: angleTo, angleDiff: angleDiff, hasLineOfSight: hasLineOfSight, inCone: inCone, makeGuard: makeGuard, updateGuard: updateGuard, distractGuard: distractGuard };
})();
