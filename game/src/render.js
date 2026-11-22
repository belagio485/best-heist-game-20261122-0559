// Midnight Vault — rendering. One job: draw the whole room, HUD and overlays.
window.Vault = window.Vault || {};
window.Vault.render = (function () {
  'use strict';
  var C = window.Vault.config;
  var L = window.Vault.level;
  var V = window.Vault.vision;
  var COL = C.colors;

  function conePath(ctx, x, y, facing, range, half) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, range, facing - half, facing + half);
    ctx.closePath();
  }

  function drawFloor(ctx, time) {
    var f = L.field;
    ctx.fillStyle = COL.floorA;
    ctx.fillRect(0, C.hudHeight, C.canvasWidth, C.canvasHeight - C.hudHeight);
    var tile = 80;
    for (var y = f.y; y < f.y + f.h; y += tile) {
      for (var x = f.x; x < f.x + f.w; x += tile) {
        if (((x / tile) + (y / tile)) % 2 === 0) {
          ctx.fillStyle = COL.floorB;
          ctx.fillRect(x, y, tile, tile);
        }
      }
    }
    // Warm spotlight pools over the cases.
    var spots = [[285, 247], [555, 217], [905, 247], [375, 507], [695, 537], [1025, 597]];
    for (var i = 0; i < spots.length; i++) {
      var g = ctx.createRadialGradient(spots[i][0], spots[i][1], 8, spots[i][0], spots[i][1], 130);
      g.addColorStop(0, 'rgba(242, 193, 78, 0.10)');
      g.addColorStop(1, 'rgba(242, 193, 78, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(spots[i][0] - 130, spots[i][1] - 130, 260, 260);
    }
    // Walls.
    ctx.fillStyle = COL.wall;
    ctx.fillRect(0, C.hudHeight, C.canvasWidth, C.wall);
    ctx.fillRect(0, C.canvasHeight - C.wall, C.canvasWidth, C.wall);
    ctx.fillRect(0, C.hudHeight, C.wall, C.canvasHeight - C.hudHeight);
    ctx.fillRect(C.canvasWidth - C.wall, C.hudHeight, C.wall, C.canvasHeight - C.hudHeight);
    ctx.strokeStyle = COL.wallEdge;
    ctx.lineWidth = 3;
    ctx.strokeRect(C.wall - 1, C.hudHeight + C.wall - 1, C.canvasWidth - C.wall * 2 + 2, C.canvasHeight - C.hudHeight - C.wall * 2 + 2);
  }

  function drawCover(ctx) {
    for (var i = 0; i < L.cover.length; i++) {
      var c = L.cover[i];
      if (c.kind === 'case') {
        ctx.fillStyle = '#241f30';
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.fillStyle = COL.caseGlass;
        ctx.fillRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8);
        ctx.strokeStyle = COL.caseFrame;
        ctx.lineWidth = 4;
        ctx.strokeRect(c.x, c.y, c.w, c.h);
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(c.x + 10, c.y + c.h - 10);
        ctx.lineTo(c.x + 40, c.y + 10);
        ctx.stroke();
        ctx.fillStyle = COL.textDim;
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h - 8);
      } else if (c.kind === 'planter') {
        ctx.fillStyle = COL.plant;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3f8f46';
        ctx.beginPath();
        ctx.arc(c.x - 10, c.y - 8, c.r * 0.55, 0, Math.PI * 2);
        ctx.arc(c.x + 12, c.y + 6, c.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5a4632';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (c.kind === 'rope') {
        ctx.strokeStyle = COL.velvet;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y + c.h / 2);
        ctx.quadraticCurveTo(c.x + c.w / 2, c.y + c.h / 2 + 12, c.x + c.w, c.y + c.h / 2);
        ctx.stroke();
        ctx.fillStyle = COL.goldDim;
        ctx.beginPath();
        ctx.arc(c.x, c.y + c.h / 2, 5, 0, Math.PI * 2);
        ctx.arc(c.x + c.w, c.y + c.h / 2, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawLoot(ctx, state, time) {
    // Sapphire pedestal.
    var px = 1010, py = 392;
    ctx.fillStyle = '#2c2536';
    ctx.fillRect(px - 34, py - 10, 68, 78);
    ctx.strokeStyle = COL.goldDim;
    ctx.lineWidth = 3;
    ctx.strokeRect(px - 34, py - 10, 68, 78);
    var sap = null;
    for (var i = 0; i < state.loot.length; i++) if (state.loot[i].id === 'sapphire') sap = state.loot[i];
    if (sap && !sap.taken) {
      var pulse = 0.75 + Math.sin(time * 3) * 0.25;
      var glow = ctx.createRadialGradient(px, py - 26, 4, px, py - 26, 70);
      glow.addColorStop(0, 'rgba(90, 200, 255, ' + (0.55 * pulse) + ')');
      glow.addColorStop(1, 'rgba(90, 200, 255, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(px - 70, py - 96, 140, 140);
      ctx.fillStyle = '#7fd4ff';
      ctx.beginPath();
      ctx.moveTo(px, py - 46);
      ctx.lineTo(px + 15, py - 26);
      ctx.lineTo(px, py - 6);
      ctx.lineTo(px - 15, py - 26);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#dff4ff';
      ctx.beginPath();
      ctx.moveTo(px, py - 46);
      ctx.lineTo(px + 7, py - 26);
      ctx.lineTo(px, py - 18);
      ctx.lineTo(px - 7, py - 26);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = COL.textDim;
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('EMPTY', px, py - 20);
    }
    for (var j = 0; j < state.loot.length; j++) {
      var l = state.loot[j];
      if (l.taken || l.kind === 'sapphire') continue;
      if (l.kind === 'painting') {
        ctx.fillStyle = COL.gold;
        ctx.fillRect(l.x - 20, l.y - 14, 40, 28);
        ctx.fillStyle = '#274b63';
        ctx.fillRect(l.x - 16, l.y - 10, 32, 20);
        ctx.fillStyle = '#e8d9a0';
        ctx.beginPath();
        ctx.arc(l.x - 4, l.y - 2, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (l.kind === 'gold') {
        ctx.fillStyle = COL.gold;
        for (var k = 0; k < 3; k++) {
          ctx.fillRect(l.x - 16 + k * 12, l.y - 8 + (k % 2) * 8, 12, 8);
        }
        ctx.strokeStyle = COL.goldDim;
        ctx.lineWidth = 1;
        ctx.strokeRect(l.x - 16, l.y - 8, 36, 16);
      }
    }
  }

  function drawDoors(ctx, state, time) {
    // Entry door, bottom left.
    ctx.fillStyle = '#17131f';
    ctx.fillRect(56, 700, 96, 44);
    ctx.strokeStyle = COL.wallEdge;
    ctx.lineWidth = 3;
    ctx.strokeRect(56, 700, 96, 44);
    ctx.fillStyle = COL.textDim;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SERVICE ENTRY', 104, 726);
    // Skylight exit, top left.
    var e = L.exit;
    var open = state.exitOpen;
    var blink = open ? (0.6 + Math.sin(time * 5) * 0.4) : 0;
    ctx.fillStyle = open ? 'rgba(57, 194, 176, ' + (0.25 + blink * 0.3) + ')' : '#17131f';
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.strokeStyle = open ? COL.teal : COL.wallEdge;
    ctx.lineWidth = 3;
    ctx.strokeRect(e.x, e.y, e.w, e.h);
    ctx.fillStyle = open ? COL.teal : COL.textDim;
    ctx.font = 'bold 12px monospace';
    ctx.fillText(open ? 'EXIT — GO!' : 'SKYLIGHT EXIT', e.x + e.w / 2, e.y + e.h / 2 + 4);
  }

  function drawCones(ctx, state) {
    for (var i = 0; i < state.guards.length; i++) {
      var g = state.guards[i];
      var hot = g.alert > 0.45;
      ctx.fillStyle = hot ? COL.coneHot : COL.cone;
      conePath(ctx, g.x, g.y, g.facing, C.visionRangeGuard, C.visionHalfAngle);
      ctx.fill();
    }
    for (var j = 0; j < state.cameras.length; j++) {
      var cam = state.cameras[j];
      if (cam.disabled > 0) continue;
      ctx.fillStyle = COL.cameraCone;
      conePath(ctx, cam.x, cam.y, cam.facing, C.visionRangeCamera, C.visionHalfAngle);
      ctx.fill();
    }
  }

  function drawGuards(ctx, state, time) {
    for (var i = 0; i < state.guards.length; i++) {
      var g = state.guards[i];
      // Body.
      ctx.fillStyle = '#232030';
      ctx.beginPath();
      ctx.arc(g.x, g.y, C.guardRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = g.alert > 0.45 ? COL.red : '#8d86a3';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Facing tick + torch.
      ctx.strokeStyle = '#ffd97a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(g.x, g.y);
      ctx.lineTo(g.x + Math.cos(g.facing) * 22, g.y + Math.sin(g.facing) * 22);
      ctx.stroke();
      ctx.fillStyle = '#f4ead2';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(g.name.toUpperCase(), g.x, g.y - C.guardRadius - 6);
      if (g.alert > 0.05) {
        ctx.fillStyle = g.alert > 0.45 ? COL.red : COL.gold;
        ctx.fillRect(g.x - 14, g.y + C.guardRadius + 4, 28 * g.alert, 4);
      }
      if (g.state === 'investigate') {
        ctx.fillStyle = COL.gold;
        ctx.font = 'bold 12px monospace';
        ctx.fillText('?', g.x, g.y - C.guardRadius - 18);
      }
    }
  }

  function drawCameras(ctx, state, time) {
    for (var i = 0; i < state.cameras.length; i++) {
      var cam = state.cameras[i];
      ctx.fillStyle = '#2c2f3a';
      ctx.beginPath();
      ctx.arc(cam.x, cam.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = cam.disabled > 0 ? '#555' : COL.red;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = cam.disabled > 0 ? '#555' : (Math.sin(time * 6) > 0 ? COL.red : '#7a2025');
      ctx.beginPath();
      ctx.arc(cam.x, cam.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COL.textDim;
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(cam.disabled > 0 ? 'OFF ' + Math.ceil(cam.disabled) + 's' : cam.name, cam.x, cam.y + 24);
    }
  }

  function drawPlayer(ctx, state, time) {
    var p = state.player;
    if (!p.alive) return;
    // Smoke clouds under the thief.
    for (var i = 0; i < p.smokeClouds.length; i++) {
      var cl = p.smokeClouds[i];
      var a = Math.min(0.6, cl.t / C.smokeSeconds);
      ctx.fillStyle = 'rgba(200, 200, 210, ' + (a * 0.55) + ')';
      ctx.beginPath();
      ctx.arc(cl.x, cl.y, C.smokeRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    // Coin in flight.
    if (p.coinFlight) {
      ctx.fillStyle = COL.gold;
      ctx.beginPath();
      ctx.arc(p.coinFlight.x, p.coinFlight.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Hooded thief: teal cloak, dark hood, pale mask.
    ctx.fillStyle = p.sneaking ? COL.tealDark : COL.teal;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0e3a34';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#f4ead2';
    ctx.beginPath();
    ctx.arc(p.x + Math.cos(p.facing) * 4, p.y + Math.sin(p.facing) * 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#17131f';
    ctx.beginPath();
    ctx.arc(p.x + Math.cos(p.facing) * 6, p.y + Math.sin(p.facing) * 6 - 1, 2.2, 0, Math.PI * 2);
    ctx.arc(p.x + Math.cos(p.facing) * 6, p.y + Math.sin(p.facing) * 6 + 3, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COL.text;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WREN', p.x, p.y - p.r - 6);
    if (p.hasSapphire) {
      ctx.fillStyle = '#7fd4ff';
      ctx.beginPath();
      ctx.moveTo(p.x + 10, p.y - 12);
      ctx.lineTo(p.x + 16, p.y - 4);
      ctx.lineTo(p.x + 10, p.y + 2);
      ctx.lineTo(p.x + 4, p.y - 4);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawHud(ctx, state) {
    ctx.fillStyle = '#100d16';
    ctx.fillRect(0, 0, C.canvasWidth, C.hudHeight);
    ctx.strokeStyle = COL.wallEdge;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, C.hudHeight);
    ctx.lineTo(C.canvasWidth, C.hudHeight);
    ctx.stroke();
    ctx.fillStyle = COL.gold;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MIDNIGHT VAULT', 16, 28);
    ctx.fillStyle = COL.textDim;
    ctx.font = '12px monospace';
    ctx.fillText(window.Vault.game.objective(state), 16, 50);
    // Alarm meter.
    var ax = 560, ay = 16, aw = 260, ah = 18;
    ctx.fillStyle = '#2a1214';
    ctx.fillRect(ax, ay, aw, ah);
    var frac = state.alarm / C.alarmCaught;
    ctx.fillStyle = frac < 0.5 ? COL.gold : (frac < 0.8 ? '#e07b39' : COL.red);
    ctx.fillRect(ax, ay, aw * frac, ah);
    ctx.strokeStyle = COL.textDim;
    ctx.lineWidth = 1;
    ctx.strokeRect(ax, ay, aw, ah);
    ctx.fillStyle = COL.text;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(state.spotted ? 'SPOTTED!' : 'ALARM', ax, ay + ah + 15);
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(state.alarm) + '%', ax + aw, ay + ah + 15);
    // Loot, tools, timer.
    ctx.textAlign = 'left';
    ctx.fillStyle = COL.text;
    ctx.font = 'bold 15px monospace';
    ctx.fillText('LOOT $' + state.player.lootValue, 860, 26);
    ctx.font = '13px monospace';
    ctx.fillStyle = COL.textDim;
    ctx.fillText('Coin ' + state.player.coins + ' · Smoke ' + state.player.smoke + ' (Q) · EMP ' + state.player.emp + ' (E)', 860, 48);
    ctx.textAlign = 'right';
    ctx.fillStyle = COL.text;
    ctx.font = 'bold 16px monospace';
    ctx.fillText(window.Vault.game.fmtTime(state.time), C.canvasWidth - 16, 28);
  }

  function drawToast(ctx, state) {
    if (state.toastTimer <= 0 || !state.toast) return;
    ctx.font = '13px monospace';
    var w = ctx.measureText(state.toast).width + 28;
    ctx.fillStyle = 'rgba(16, 13, 22, 0.85)';
    ctx.fillRect((C.canvasWidth - w) / 2, C.canvasHeight - 96, w, 30);
    ctx.strokeStyle = COL.goldDim;
    ctx.lineWidth = 1;
    ctx.strokeRect((C.canvasWidth - w) / 2, C.canvasHeight - 96, w, 30);
    ctx.fillStyle = COL.text;
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(state.toast, C.canvasWidth / 2, C.canvasHeight - 76);
  }

  function overlay(ctx, title, lines, accent) {
    ctx.fillStyle = 'rgba(10, 8, 14, 0.78)';
    ctx.fillRect(0, 0, C.canvasWidth, C.canvasHeight);
    ctx.fillStyle = accent;
    ctx.font = 'bold 44px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, C.canvasWidth / 2, 300);
    ctx.fillStyle = COL.text;
    ctx.font = '16px monospace';
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], C.canvasWidth / 2, 350 + i * 28);
    }
  }

  function draw(ctx, state, time) {
    ctx.clearRect(0, 0, C.canvasWidth, C.canvasHeight);
    drawFloor(ctx, time);
    drawDoors(ctx, state, time);
    drawCover(ctx);
    drawLoot(ctx, state, time);
    drawCones(ctx, state);
    drawGuards(ctx, state, time);
    drawCameras(ctx, state, time);
    drawPlayer(ctx, state, time);
    drawHud(ctx, state);
    drawToast(ctx, state);
    if (state.spotted && state.phase === 'play') {
      ctx.fillStyle = COL.red;
      ctx.font = 'bold 26px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SPOTTED — BREAK LINE OF SIGHT!', C.canvasWidth / 2, 120);
    }
    if (state.phase === 'title') {
      overlay(ctx, 'MIDNIGHT VAULT', [
        'One room. Three guards. Two cameras. One Star Sapphire.',
        'Cross the gallery unseen, grab the loot, slip out the skylight.',
        'WASD / arrows to move · Shift to sneak · Click to toss a coin',
        'Q smoke bomb · E EMP pulse · M mute',
        'Press ENTER to slip inside'
      ], COL.gold);
    } else if (state.phase === 'caught') {
      overlay(ctx, 'CAUGHT!', [
        'The alarm hit 100% and the gallery locked down.',
        'Loot kept: $' + state.player.lootValue + ' · Time: ' + window.Vault.game.fmtTime(state.time),
        'Press R to try the heist again'
      ], COL.red);
    } else if (state.phase === 'won') {
      var sc = window.Vault.game.score(state);
      overlay(ctx, 'CLEAN GETAWAY!', [
        'The Star Sapphire is yours. Wren vanishes into the night.',
        'Loot $' + sc.loot + ' · Time bonus $' + sc.timeBonus + ' · Alarm penalty -$' + sc.penalty,
        'Final score: $' + sc.total + ' · Time: ' + window.Vault.game.fmtTime(state.time),
        'Press R to run it again'
      ], COL.teal);
    }
  }

  return { draw: draw };
})();
