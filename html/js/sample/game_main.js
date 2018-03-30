var mainGame = null;

function game_main() {
    var canvas = document.getElementById("main_canvas");
    var targetFPS = 600;

    mainGame = new Game(canvas, targetFPS);

    canvas.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });
    canvas.addEventListener('dragstart', function (e) {
        e.preventDefault();
    });
    canvas.addEventListener('selectstart', function (e) {
        e.preventDefault();
    });
    canvas.addEventListener('wheel', function (e) {
        e.preventDefault();
    });
    canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
    });
}

function start() {
    if (mainGame != null)
        mainGame.run();
}

function stop() {
    if (mainGame != null)
        mainGame.stop();
}

window.onload = game_main