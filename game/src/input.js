// Midnight Vault — input. One job: keyboard and mouse state for the game.
window.Vault = window.Vault || {};
window.Vault.input = (function () {
  'use strict';
  var keys = {};
  var mouse = { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 };
  var pressed = {}; // edge-triggered keys, consumed by the game each frame

  function keyName(e) {
    return (e.key || '').toLowerCase();
  }

  function onKeyDown(e) {
    var k = keyName(e);
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].indexOf(k) !== -1) e.preventDefault();
    if (!keys[k]) pressed[k] = true;
    keys[k] = true;
  }

  function onKeyUp(e) { keys[e.key ? e.key.toLowerCase() : ''] = false; }

  function onMouseMove(e) {
    var rect = e.target.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (e.target.width / rect.width);
    mouse.y = (e.clientY - rect.top) * (e.target.height / rect.height);
  }

  function onMouseDown(e) {
    onMouseMove(e);
    mouse.clicked = true;
    mouse.clickX = mouse.x;
    mouse.clickY = mouse.y;
  }

  function attach(canvas) {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
  }

  function moveVector() {
    var x = 0, y = 0;
    if (keys['a'] || keys['arrowleft']) x -= 1;
    if (keys['d'] || keys['arrowright']) x += 1;
    if (keys['w'] || keys['arrowup']) y -= 1;
    if (keys['s'] || keys['arrowdown']) y += 1;
    if (x !== 0 && y !== 0) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
    return { x: x, y: y };
  }

  function sneaking() { return !!(keys['shift']); }

  function consumePress(k) {
    var v = !!pressed[k];
    pressed[k] = false;
    return v;
  }

  function consumeClick() {
    var v = mouse.clicked;
    mouse.clicked = false;
    return v ? { x: mouse.clickX, y: mouse.clickY } : null;
  }

  function endFrame() { pressed = {}; }

  return { attach: attach, moveVector: moveVector, sneaking: sneaking, consumePress: consumePress, consumeClick: consumeClick, endFrame: endFrame, mouse: mouse };
})();
