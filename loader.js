// Loading screen, 1% → 100%. A plain script so it runs before the game's code has downloaded.
// The game reports real progress with pipsLoader.step(percent) and pipsLoader.done(); the
// number climbs smoothly towards the latest step and only reaches 100% once the game is ready.
(function () {
  var root = document.getElementById('loader');
  if (!root) return;
  var bar = root.querySelector('.loader-fill');
  var label = root.querySelector('.loader-percent');
  var shown = 1;
  var target = 60; // until the game's code has loaded
  var ready = false;
  var onHidden = function () {};

  function draw() {
    bar.style.width = shown + '%';
    label.textContent = shown + '%';
    root.setAttribute('aria-valuenow', String(shown));
  }

  var timer = setInterval(function () {
    if (shown < target) shown++;
    draw();
    if (ready && shown >= 100) {
      clearInterval(timer);
      root.classList.add('loader-hide');
      setTimeout(function () {
        root.remove();
        onHidden();
      }, 400);
    }
  }, 10);
  draw();

  // A startup error: if the game still isn't ready shortly after, say so instead of waiting
  // forever. (Errors that don't stop the game are ignored this way.)
  function failed() {
    setTimeout(function () {
      if (ready) return;
      clearInterval(timer);
      root.classList.add('loader-error');
      label.textContent = 'Something went wrong. Please restart the game.';
    }, 3000);
  }
  addEventListener('error', failed);

  window.pipsLoader = {
    step: function (percent) {
      target = Math.max(target, Math.min(percent, 99));
    },
    /** Finishes the count to 100%, fades out, then calls `then` (if given). */
    done: function (then) {
      if (then) onHidden = then;
      ready = true;
      target = 100;
      removeEventListener('error', failed);
    },
  };
})();
