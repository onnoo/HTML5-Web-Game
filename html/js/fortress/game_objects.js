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
    var view;

    this.init = function () {
        view = this.room.view;
    }

    this.update = function () { };

    this.draw = function (context) {
        var contextWidth = context.canvas.width;
        var contextHeight = context.canvas.height;
        var contextPos = view.roomToContextPos(0, this.room.height - height);

        drawRect(context, 0, contextPos.y, contextWidth, contextHeight, null, "#000000", true);
    };
}

function Tank() {
    this.playerControl = false;
    this.depth = 10;
    var input_m = null;
    var view;
    var moveSpeed = 150;
    var moveX = 0;
    var moveY = 0;
    var onGround = false;
    var width = 60;
    var height = 50;
    var mouseLeftDown = false;

    this.init = function () {
        view = this.room.view;
        input_m = this.gameObject.input_m;
    }

    this.update = function () {
        var tickTimeMul = this.gameObject.tickTimeMul;
        if (this.playerControl) {
            if (input_m.getKeyState('a') == 1) {
                moveX = -moveSpeed;
            }
            else if (input_m.getKeyState('d') == 1) {
                moveX = moveSpeed;
            }
            else {
                moveX = 0;
            }

            if (input_m.getKeyState(' ') == 1) {
                if (onGround) {
                    moveY = -500;
                    onGround = false;
                }
            }

            if (input_m.getMouseState(0) == 1) {
                if (!mouseLeftDown) {
                    mouseLeftDown = true;
                    var viewMousePos = input_m.getViewMousePos()
                    var roomMousePos = view.viewToRoomPos(viewMousePos.x, viewMousePos.y);
                    
                    var fireAngle = getAngle(this.x, this.y - 30, roomMousePos.x, roomMousePos.y);
                    

                    o = newObject(Ball);
                    o.setPos(this.x, this.y - 30);
                    o.setAngle(fireAngle);
                    this.manager.addObject(o);
                    
                }
            }
            else
                mouseLeftDown = false;
        }

        moveY += this.room.gravity * tickTimeMul;
        this.x += moveX * tickTimeMul;
        this.y += moveY * tickTimeMul;

        var landY = this.room.height - 100;
        if (landY < this.y) {
            this.y = landY;
            moveY = 0;
            onGround = true;
        }

        if (this.room.width <= this.x)
            this.x = this.room.width - 1;
        else if (this.x < 0)
            this.x = 0;
        if (this.room.height <= this.y)
            this.y = this.room.height - 1;
        else if (this.y < 0)
            this.y = 0;
    };

    this.draw = function (context) {
        var contextPos1 = view.roomToContextPos(this.x - (width / 2), this.y - height);
        var contextPos2 = view.roomToContextPos(this.x + (width / 2), this.y);
        var drawX = contextPos1.x;
        var drawY = contextPos1.y;
        var drawWidth = contextPos2.x - contextPos1.x;
        var drawHeight = contextPos2.y - contextPos1.y;

        drawRect(context, drawX, drawY, drawWidth, drawHeight, "#000000", "#555555");
    };
}

function Ball() {
    var moveSpeed = 1500;
    var moveX = 0;
    var moveY = 0;
    var view;

    this.init = function () {
        view = this.room.view;
        var movePos = angleDistanceToPos(this.angle, moveSpeed);
        moveX = movePos.x;
        moveY = movePos.y;

    }

    this.update = function () {
        var tickTimeMul = this.gameObject.tickTimeMul;

        moveY += this.room.gravity * tickTimeMul;
        this.x += moveX * tickTimeMul;
        this.y += moveY * tickTimeMul;

        var landY = this.room.height - 100;
        if (landY < this.y) {
            this.destroySelf();
        }
    }

    this.draw = function (context) {
        var contextPos = view.roomToContextPos(this.x, this.y)
        drawCircle(context, contextPos.x, contextPos.y, 5, null, "#FF0000");
    }
}