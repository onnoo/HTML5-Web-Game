function Background() {
    this.depth = -1000;

    this.init = function () {
    }

    this.update = function () { };

    this.draw = function (context) {
        var contextWidth = context.canvas.width;
        var contextHeight = context.canvas.height;

        drawRect(context, 0, 0, contextWidth, contextHeight, null, "#CCCCCC", true);
    };
}

function Land() {
    this.depth = 0;
    var height = 100;

    this.init = function () {
    }

    this.update = function () { };

    this.draw = function (context) {
        var contextWidth = context.canvas.width;
        var contextHeight = context.canvas.height;

        drawRect(context, 0, contextHeight - height, contextWidth, contextHeight, null, "#000000", true);
    };
}

function Cursor() {
    this.depth = 1100;
    var input_m;
    var view;
    var image;
    var mouseLeftDown = 0;
    var mouseRightDown = 0;

    this.init = function () {
        input_m = this.gameObject.input_m;
        view = this.room.view;
        image = this.gameObject.image_m.getImage("crosshair");
    };

    this.update = function () {
        if (input_m.getMouseState(2) == 1) {
            if (mouseRightDown == 0) {
                mouseRightDown = 1;

                var roomMousePos = view.viewToRoomPos(input_m.viewMousePos.x, input_m.viewMousePos.y);
                var o = newObject(CursorClickEffect);
                this.manager.addObject(o);
                o.setPos(roomMousePos.x, roomMousePos.y);
            }
        }
        else if (mouseRightDown == 1)
            mouseRightDown = 0;
    };

    this.draw = function (context) {
        var contextMousePos = view.viewToContextPos(input_m.viewMousePos.x, input_m.viewMousePos.y);
        context.drawImage(image, contextMousePos.x - 32, contextMousePos.y - 32);
    };
}


function CursorClickEffect() {
    this.depth = 8;
    var view;
    var circleSize = 10;
    var speed = 35;

    this.init = function () {
        view = this.room.view;
    }

    this.update = function () {
        var tickTimeMul = this.gameObject.tickTimeMul;
        circleSize -= speed * tickTimeMul;
        if (circleSize < 0)
            this.destroySelf();
    };

    this.draw = function (context) {
        var contextPos = view.roomToContextPos(this.x, this.y);
        drawCircle(context, contextPos.x, contextPos.y, circleSize, '#00FF00')
    };
}

function Tank() {
    this.playerControl = false;
    this.depth = 10;
    var input_m;
    var view;
    var speed = 100;
    var gravitySpeed = 10;
    var gravityMax = 300;
    var gravity = 0;

    this.init = function () {
        input_m = this.gameObject.input_m;
        view = this.room.view;
    }

    this.update = function () {
        var tickTimeMul = this.gameObject.tickTimeMul;
        if (this.playerControl) {
            if (input_m.getKeyState('a') == 1) {
                this.x -= speed * tickTimeMul
            }
            else if (input_m.getKeyState('d') == 1) {
                
                this.x += speed * tickTimeMul
            }
        }

        if (gravity < gravityMax)
            gravity += gravitySpeed * tickTimeMul;
            if (gravityMax < gravity)
                gravity = gravityMax;

        this.y += gravity;



        if (this.room.width <= this.x)
            this.x = room.width - 1;
        else if (this.x < 0)
            this.x = 0;
        if (this.room.height <= this.y)
            this.y = this.room.height - 1;
        else if (this.y < 0)
            this.y = 0;
    };

    this.draw = function (context) {
        var contextPos = view.roomToContextPos(this.x, this.y);
        drawRect(context, contextPos.x - 30, contextPos.y - 50, 60, 50, "#000000", "#555555");
    };
}