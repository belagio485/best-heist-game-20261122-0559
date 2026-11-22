// Midnight Vault — boot. One job: wire the modules together and run the loop.
(function () {
  'use strict';
  var V = window.Vault;
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var state = V.game.makeState();
  var input = V.input;
  var audio = V.audio;
  var last = performance.now();

  input.attach(canvas);

  // ?shot=1..4 stages a fixed scene and freezes it: real renders of this code.
  var params = new URLSearchParams(window.location.search);
  var shot = parseInt(params.get('shot') || '0', 10);
  if (shot >= 1 && shot <= 4) {
    V.shots.applyShot(state, shot);
    V.render.draw(ctx, state, state.time);
    return;
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var fresh = V.game.update(state, dt, input, audio);
    if (fresh) state = fresh;
    V.render.draw(ctx, state, state.time);
    input.endFrame();
    requestAnimationFrame(frame);
  }

  V.render.draw(ctx, state, 0);
  requestAnimationFrame(frame);
})();
