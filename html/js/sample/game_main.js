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
    // canvas.addEventListener('touchmove', function (e) {
    //     e.preventDefault();
    // });
    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();
    window.scrollTo(0, 1);
}

function resizeCanvas() {
    var canvas = mainGame.canvas;
    var gameWidth = mainGame.width;
    var gameHeight = mainGame.height;
    var viewportWidth = window.innerWidth;
    var viewportHeigth = window.innerHeight;
    var newGameWidth, newGameHeight, newGameX, newGameY;

    if (gameHeight / gameWidth > viewportHeigth / viewportWidth) {
        newGameHeight = viewportHeigth;
        newGameWidth = newGameHeight * gameWidth / gameHeight;  
    } else {
        newGameWidth = viewportWidth;
        newGameHeight = newGameWidth * gameHeight / gameWidth;		 
    }

    canvas.style.width = newGameWidth.toFixed() + "px";
    canvas.style.height = newGameHeight.toFixed() + "px";

    newGameX = (viewportWidth - newGameWidth) / 2;
    newGameY = (viewportHeigth - newGameHeight) / 2;

    canvas.style.margin = newGameY.toFixed() + "px " + newGameX.toFixed() + "px";
};

function start() {
    if (mainGame != null)
        mainGame.run();
}

function stop() {
    if (mainGame != null)
        mainGame.stop();
}

window.onload = game_main