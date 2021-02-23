function makeBall(element) {
  let position = {
    x: 0.5,
    y: 0.5,
  };

  let direction = {
    x: 0.004,
    y: 0.002,
  };

  let scoreListeners = [];

  function updatePosition(rackets) {
    position.x += direction.x;
    position.y += direction.y;

    checkScore();

    if (horizontalColision(rackets)) {
      direction.x = -direction.x;
      position.x += direction.x;
    }

    if (verticalColision(rackets)) {
      direction.y = -direction.y;
      position.y += direction.y;
    }

    updateDOM();
  }

  function checkScore() {
    if (position.x <= 0) fireScoreEvent("right");
    else if (position.x >= 1) fireScoreEvent("left");
  }

  function horizontalColision(rackets) {
    let horizontalImpact = hittedLeftRacket(rackets.left) || hittedRightRacket(rackets.right);

    rackets.right.getCoordinates();
    return horizontalImpact || position.x < 0 || position.x > 1;
  }

  function hittedLeftRacket(racket) {
    return (
      racket.getCoordinates().right >= element.getBoundingClientRect().left &&
      direction.x < 0 &&
      racket.getCoordinates().top <= element.getBoundingClientRect().bottom &&
      racket.getCoordinates().bottom >= element.getBoundingClientRect().top
    );
  }

  function hittedRightRacket(racket) {
    return (
      racket.getCoordinates().left <= element.getBoundingClientRect().right &&
      direction.x > 0 &&
      racket.getCoordinates().top <= element.getBoundingClientRect().bottom &&
      racket.getCoordinates().bottom >= element.getBoundingClientRect().top
    );
  }

  function verticalColision(rackets) {
    return position.y < 0 || position.y > 1;
  }

  function restart() {
    position = { x: 0.5, y: 0.5 };
    direction = { x: 0.004, y: 0.002 };
    updateDOM();
  }

  function updateDOM() {
    element.style.setProperty("--position-x", position.x);
    element.style.setProperty("--position-y", position.y);
  }

  function addScoreListener(listener) {
    if (!scoreListeners.find((l) => l == listener)) scoreListeners.push(listener);
  }

  function removeScoreListener(listener) {
    scoreListeners = scoreListeners.filter((l) => l != listener);
  }

  function fireScoreEvent(data) {
    scoreListeners.forEach((l) => l(data));
  }

  return { updatePosition, restart, addScoreListener, removeScoreListener };
}

function makeRacket(element) {
  let position = 0.5;

  const step = 0.01;

  function up() {
    position = position + step < 1 ? position + step : 1;
    updateDOM();
  }

  function down() {
    position = position - step > 0 ? position - step : 0;
    updateDOM();
  }

  function restart() {
    position = 0.5;
    updateDOM();
  }

  function updateDOM() {
    element.style.setProperty("--racket-position", position);
  }

  function getCoordinates() {
    return element.getBoundingClientRect();
  }

  return { up, down, restart, getCoordinates };
}

function makeScore(element) {
  let score = 0;

  function updateDOM() {
    element.innerText = score;
  }

  function restart() {
    score = 0;
    updateDOM();
  }

  function increment() {
    score++;
    updateDOM();
  }

  return { restart, increment };
}

function makeGame() {
  let running = false;

  let ball = makeBall(document.querySelector(".container .ball"));

  let scores = {
    left: makeScore(document.querySelector(".container .left .score")),
    right: makeScore(document.querySelector(".container .right .score")),
  };

  let keys = {
    left: { direction: { up: false, down: false }, key: { up: "w", down: "s" } },
    right: { direction: { up: false, down: false }, key: { up: "arrowup", down: "arrowdown" } },
  };

  let rackets = {
    left: makeRacket(document.querySelector(".container .left .racket")),
    right: makeRacket(document.querySelector(".container .right .racket")),
  };

  window.setInterval(() => {
    if (running) ball.updatePosition(rackets);

    if (keys.left.direction.down) rackets.left.down();
    if (keys.left.direction.up) rackets.left.up();
    if (keys.right.direction.down) rackets.right.down();
    if (keys.right.direction.up) rackets.right.up();
  }, 10);

  window.addEventListener("keydown", ({ key }) => {
    key = key.toLocaleLowerCase();
    if (key == keys.left.key.down) keys.left.direction.down = true;
    else if (key == keys.left.key.up) keys.left.direction.up = true;
    else if (key == keys.right.key.down) keys.right.direction.down = true;
    else if (key == keys.right.key.up) keys.right.direction.up = true;
  });

  window.addEventListener("keyup", ({ key }) => {
    key = key.toLocaleLowerCase();
    if (key == keys.left.key.down) keys.left.direction.down = false;
    else if (key == keys.left.key.up) keys.left.direction.up = false;
    else if (key == keys.right.key.down) keys.right.direction.down = false;
    else if (key == keys.right.key.up) keys.right.direction.up = false;
  });

  ball.addScoreListener((side) => {
    if (side == "right") scores.right.increment();
    else scores.left.increment();
  });

  function stop() {
    running = false;
  }

  function start() {
    running = true;
  }

  function restart() {
    running = false;

    ball.restart();
    rackets.left.restart();
    rackets.right.restart();
    scores.left.restart();
    scores.right.restart();
  }

  return { start, stop, restart };
}

let game = makeGame();

game.start();
