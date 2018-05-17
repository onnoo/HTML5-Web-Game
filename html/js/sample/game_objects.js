function Background() {
    this.depth = -1000;
    var fpsElement;
    var room;
    var view;
    var image;

    this.init = function () {
        fpsElement = document.getElementById("fps");
        room = this.manager.room;
        view = room.view;
        image = this.gameObject.image_m.getImage("background_stars");
    }

    this.update = function () { };

    this.draw = function (context) {
        var contextWidth = context.canvas.width;
        var contextHeight = context.canvas.height;

        var imageWidth = image.width / view.zoom;
        var imageHeight = image.height / view.zoom;

        var offsetX = (view.x % image.width);
        var offsetY = (view.y % image.height);
        var contextPos = view.viewToContextPos(-offsetX, -offsetY);
        var drawX = contextPos.x;
        var drawY = contextPos.y;
        context.fillStyle = "#030303";
        context.fillRect(0, 0, contextWidth, contextHeight);

        var roomEndPos = view.roomToContextPos(room.width, room.height);
        while (drawY < Math.min(contextHeight, roomEndPos.y)) {
            drawX = contextPos.x;
            while (drawX < Math.min(contextWidth, roomEndPos.x)) {
                context.drawImage(image, drawX, drawY, imageWidth, imageHeight);
                drawX += imageWidth;
            }
            drawY += imageHeight;
        }
        this.debug = false;
    };
}

function Ship() {
    this.collisionSet = [[{ x: 140, y: 43 }, { x: 16, y: 4 }], [{ x: 140, y: 43 }, { x: 16, y: 82 }], [{ x: 16, y: 82 }, { x: 16, y: 4 }]]
    this.playerControl = false;
    this.depth = 10;
    this.type = "ship";
    var input_m;
    var room;
    var view;
    var targetX = -1;
    var targetY = -1;
    var speed = 100;
    var BoosterEffectFrequency = 10;
    var BoosterEffectDeltaTime = 0;
    var gun = null;
    var maxHP = 100;
    var hp = 100;

    this.init = function () {
        this.setSprite(this.gameObject.image_m.getImage("ship"));
        this.setSpriteCenter(73, 43);

        input_m = this.gameObject.input_m;
        room = this.manager.room;
        view = room.view;

        gun = newObject(Gun);
        this.addChild(gun);
        gun.setShip(this);
        gun.setPos(this.x, this.y);
        gun.setDepth(this.depth + 1);

        this.solid = true;
    }

    this.update = function () {
        var tickTimeMul = this.gameObject.tickTimeMul;
        if (this.playerControl) {
            if (input_m.getMouseState(2) == 1) {
                var roomMousePos = view.viewToRoomPos(input_m.viewMousePos.x, input_m.viewMousePos.y);
                targetX = roomMousePos.x;
                targetY = roomMousePos.y;
            }
        }

        if ((0 <= targetX) && (0 <= targetY) && ((this.x != targetX) || (this.y != targetY))) {
            var targetDistance = getDistance(this.x, this.y, targetX, targetY);
            var targetAngle = getAngle(this.x, this.y, targetX, targetY);
            if (speed * tickTimeMul < targetDistance) {
                var targetMovePos = angleDistanceToPos(targetAngle, speed * tickTimeMul);
                this.x += targetMovePos.x;
                this.y += targetMovePos.y;
            }
            else {
                this.x = targetX;
                this.y = targetY;
            }
            this.angle = targetAngle;

            BoosterEffectDeltaTime += BoosterEffectFrequency * tickTimeMul;
            if (1 <= BoosterEffectDeltaTime) {
                //var boosterPos = angleDistanceToPos(this.angle - 180, 60);
                var boosterPos = this.getOffsetSpritePos(13, 43);
                var o = newObject(BoosterEffect);
                this.manager.addObject(o);
                o.setPos(this.x + boosterPos.x, this.y + boosterPos.y);
                o.setDepth(this.depth - 1);
                BoosterEffectDeltaTime -= 1;
            }
        }

        if (room.width <= this.x)
            this.x = room.width - 1;
        if (room.height <= this.y)
            this.y = room.height - 1;
    };

    this.draw = function (context) {
        var drawTargetPath = true;
        if (drawTargetPath) {
            if ((targetX != -1) || (targetY != -1) && ((this.x != targetX) || (this.y != targetY))) {
                var contextPos = view.roomToContextPos(this.x, this.y);
                var contextTragetPos = view.roomToContextPos(targetX, targetY);
                drawLine(context, contextTragetPos.x, contextTragetPos.y, contextPos.x, contextPos.y, "#00FF00", [5, 15])
            }
        }
        this.drawSprite(context);
        var drawCollisionSet = true;
        if (drawCollisionSet) {
            var len = this.collisionSet.length;
            var i = 0;
            var lineColor = "#FF0000"

            if (0 < this.collidedObjects.length) {
                var contextIPointPos = view.roomToContextPos(this.collidedObjects[0].iPoint.x, this.collidedObjects[0].iPoint.y);
                drawCircle(context, contextIPointPos.x, contextIPointPos.y, 5, '#FF0000', 'green')
            }
            else
                lineColor = '#00FF00';
                
            while (i < len) {
                var aPos = this.getOffsetSpritePos(this.collisionSet[i][0].x, this.collisionSet[i][0].y);
                var bPos = this.getOffsetSpritePos(this.collisionSet[i][1].x, this.collisionSet[i][1].y);
                var contextAPos = view.roomToContextPos(this.x + aPos.x, this.y + aPos.y);
                var contextBPos = view.roomToContextPos(this.x + bPos.x, this.y + bPos.y);
                drawLine(context, contextAPos.x, contextAPos.y, contextBPos.x, contextBPos.y, lineColor)
                i += 1;
            }
            this.collidedObjects = [];
        }
        this.drawHpBar(context);
    };

    this.drawHpBar = function (context) {
        var contextMousePos = view.roomToContextPos(this.x, this.y);
        var hpBarX = contextMousePos.x - ((maxHP / 2) / view.zoom);
        var hpBarY = contextMousePos.y + (70 / view.zoom);
        var maxHpBarWidth = maxHP / view.zoom;
        var hpBarWidth = hp / view.zoom;
        var hpBarHeight = 6 / view.zoom;

        context.globalAlpha = 0.2;
        drawRect(context, hpBarX - 2, hpBarY - 2, maxHpBarWidth + 4, hpBarHeight + 4, null, '#FFFFFF', true)
        context.globalAlpha = 1;
        drawRect(context, hpBarX, hpBarY, hpBarWidth, hpBarHeight, null, '#00FF00', true)
    };

    this.takeDamage = function (damage) {
        hp -= damage;
        if (hp <= 0) {
            var o = newObject(ExplosionEffect);
            this.manager.addObject(o);
            o.setPos(this.x, this.y);


            this.gameObject.audio_m.addPlayQueue("boom");

            gun.destroySelf();
            this.destroySelf();
        }
    }
}

function Gun() {
    var input_m;
    var view;
    var ship = null;
    var nextFire = 0;
    var fireRate = 3;

    this.init = function () {
        this.setSprite(this.gameObject.image_m.getImage("gun"));
        this.setSpriteCenter(23, 11);

        input_m = this.gameObject.input_m;
        view = this.manager.room.view;
    }

    this.getShip = function () {
        return ship;
    }
    this.setShip = function (_ship) {
        ship = _ship;
    }

    this.canFire = function () {
        return nextFire <= this.gameObject.nowLoopTime
    }

    this.fire = function () {
        var offsetPos = this.getOffsetSpritePos(58, 11);
        var firedPos = { x: this.x + offsetPos.x, y: this.y + offsetPos.y };

        var bullet = newObject(Bullet);
        this.manager.addObject(bullet);
        bullet.setShip(ship);
        bullet.setPos(firedPos.x, firedPos.y);
        bullet.setAngle(this.angle);
        bullet.firedPos = firedPos

        this.gameObject.audio_m.addPlayQueue("laser");

        nextFire = this.gameObject.nowLoopTime + (1000 / fireRate);
    }

    this.update = function () {
        var offsetPos = ship.getOffsetSpritePos(60, 43);
        this.x = ship.x + offsetPos.x;
        this.y = ship.y + offsetPos.y;
        if (ship.playerControl) {
            var roomMousePos = view.viewToRoomPos(input_m.viewMousePos.x, input_m.viewMousePos.y);
            this.angle = getAngle(this.x, this.y, roomMousePos.x, roomMousePos.y);

            if (input_m.getMouseState(0) == 1) {
                if (this.canFire())
                    this.fire();
            }
        }
    };

    this.draw = function (context) {
        this.drawSprite(context);
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
        view = this.manager.room.view;
        //image = this.gameObject.image_m.getImage("cursor");
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
        view = this.manager.room.view;
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

function BoosterEffect() {
    var view;
    var circleSize = 10;
    var speed = 15;

    this.init = function () {
        view = this.manager.room.view;
    }

    this.update = function () {
        var tickTimeMul = this.gameObject.tickTimeMul;
        circleSize -= speed * tickTimeMul;
        if (circleSize < 0)
            this.destroySelf();
    };

    this.draw = function (context) {
        var contextPos = view.roomToContextPos(this.x, this.y);
        drawCircle(context, contextPos.x, contextPos.y, circleSize / view.zoom, '#0000FF')
    };
}

function HitEffect() {
    this.depth = 15;
    var view;
    var circleSize = 0;
    var circleMaxSize = 10;
    var speed = 50;

    this.init = function () {
        view = this.manager.room.view;
    }

    this.update = function () {
        var tickTimeMul = this.gameObject.tickTimeMul;
        circleSize += speed * tickTimeMul;
        if (circleMaxSize < circleSize)
            this.destroySelf();
    };

    this.draw = function (context) {
        var contextPos = view.roomToContextPos(this.x, this.y);
        drawCircle(context, contextPos.x, contextPos.y, circleSize / view.zoom, '#FF0000')
    };
}

function ExplosionEffect() {
    this.depth = 15;
    this.scale = 1.5;
    var view;
    var frameSpeed = 60;
    var animFrame = 0;
    var animMaxFrame = 64;

    this.init = function () {
        view = this.manager.room.view;

        var image = this.gameObject.image_m.getImage("explosion");
        this.setSprite(image, 0, 0, image.width, image.height, 256, 256, 128, 128);
        this.setSpriteFrame(0, 0);
    }

    this.update = function () {
        var tickTimeMul = this.gameObject.tickTimeMul;
        animFrame += frameSpeed * tickTimeMul;
        var intAnimFrame = Math.floor(animFrame);
        if (animMaxFrame <= intAnimFrame)
            this.destroySelf();
        else {
            this.setSpriteFrame(Math.floor(intAnimFrame / 8), intAnimFrame % 8);
        }
    };

    this.draw = function (context) {
        this.drawSprite(context);
    };
}

function Bullet() {
    this.collisionSet = [[{ x: 37, y: 33 }, { x: 56, y: 33 }]]
    this.depth = 15;
    this.solid = true;
    this.type = "bullet";
    this.firedPos;
    var room;
    var view;
    var ship = null;
    var speed = 500;
    var maxRange = 2000;
    var damage = 10;


    this.init = function () {
        var image = this.gameObject.image_m.getImage("laser_bullet");
        this.setSprite(image, 0, 0, image.width, image.height, 95, 68, 46, 33);
        this.setSpriteFrame(0, 0);

        room = this.manager.room;
        view = room.view;
    }

    this.getShip = function () {
        return ship;
    }
    this.setShip = function (_ship) {
        ship = _ship;
    }

    this.update = function () {
        var tickTimeMul = this.gameObject.tickTimeMul;
        var targetMovePos = angleDistanceToPos(this.angle, speed * tickTimeMul)
        var moveDistance = getDistance(0, 0, targetMovePos.x, targetMovePos.y);
        this.x += targetMovePos.x;
        this.y += targetMovePos.y;

        this.collisionSet[0][0].x = 55 - moveDistance;



        var collidedObjectsLen = this.collidedObjects.length;
        if (0 < collidedObjectsLen) {
            var i = 0;
            while (i < collidedObjectsLen) {
                var cObj = this.collidedObjects[i].obj;
                var iPoint = this.collidedObjects[i].iPoint;
                if (cObj != ship && cObj.type != "bullet") {
                    this.gameObject.audio_m.addPlayQueue("hit");

                    var o = newObject(HitEffect);
                    this.manager.addObject(o);
                    o.setPos(iPoint.x, iPoint.y);

                    if (cObj.type == "ship")
                        cObj.takeDamage(damage);

                    this.destroySelf();
                }
                i += 1;
            }
        }
        this.collidedObjects = [];


        if (this.x < -100 || this.y < -100 || room.width + 100 < this.x || room.height + 100 < this.y ||
            maxRange < getDistance(this.firedPos.x, this.firedPos.y, this.x, this.y)) {
            this.destroySelf();
        }
    };

    this.draw = function (context) {
        this.drawSprite(context);
    };
}

function ShipGUI() {

}

function Dummy() {
}