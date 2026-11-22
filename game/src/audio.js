// Midnight Vault — sound. One job: every sound effect, synthesized in code.
window.Vault = window.Vault || {};
window.Vault.audio = (function () {
  'use strict';
  var ctx = null;
  var muted = false;
  var alarmTimer = null;

  function ensure() {
    if (!ctx) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      } catch (err) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, seconds, type, gain) {
    if (muted) return;
    var c = ensure();
    if (!c) return;
    var t = c.currentTime;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(gain || 0.08, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t);
    osc.stop(t + seconds + 0.02);
  }

  function coin() { tone(1320, 0.09, 'triangle', 0.07); setTimeout(function () { tone(1760, 0.14, 'triangle', 0.07); }, 70); }
  function clink() { tone(2400, 0.05, 'square', 0.035); setTimeout(function () { tone(1900, 0.06, 'square', 0.03); }, 60); }
  function pickup() { tone(660, 0.08, 'sine', 0.08); setTimeout(function () { tone(990, 0.12, 'sine', 0.08); }, 80); }
  function smokePuff() { tone(220, 0.25, 'sawtooth', 0.04); }
  function empZap() { tone(880, 0.12, 'sawtooth', 0.05); setTimeout(function () { tone(440, 0.2, 'sawtooth', 0.05); }, 90); }
  function spotted() { tone(520, 0.16, 'square', 0.07); setTimeout(function () { tone(520, 0.16, 'square', 0.07); }, 200); }
  function win() {
    [523, 659, 784, 1047].forEach(function (f, i) {
      setTimeout(function () { tone(f, 0.22, 'triangle', 0.09); }, i * 130);
    });
  }
  function caught() {
    [392, 311, 233].forEach(function (f, i) {
      setTimeout(function () { tone(f, 0.3, 'sawtooth', 0.06); }, i * 180);
    });
  }

  function startAlarmLoop() {
    if (alarmTimer || muted) return;
    alarmTimer = setInterval(function () { tone(740, 0.12, 'square', 0.045); }, 420);
  }

  function stopAlarmLoop() {
    if (alarmTimer) { clearInterval(alarmTimer); alarmTimer = null; }
  }

  function toggleMute() {
    muted = !muted;
    if (muted) stopAlarmLoop();
    return muted;
  }

  return { ensure: ensure, coin: coin, clink: clink, pickup: pickup, smokePuff: smokePuff, empZap: empZap, spotted: spotted, win: win, caught: caught, startAlarmLoop: startAlarmLoop, stopAlarmLoop: stopAlarmLoop, toggleMute: toggleMute, isMuted: function () { return muted; } };
})();
