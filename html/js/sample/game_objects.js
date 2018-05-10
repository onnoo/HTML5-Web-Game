function Background() {
    this.depth = -1000;
    var fpsElement;
    var view;
    var image;

    this.init = function () {
        fpsElement = document.getElementById("fps");
        view = this.manager.room.view;
        image = this.gameObject.image_m.getImage("background_stars");
    }

    this.update = function () {
        fpsElement.innerHTML = this.gameObject.fpsCounter.getFPS().toFixed(0);
    };

    this.draw = function (context) {
        var offsetX = (view.x % image.width) / view.zoom;
        var offsetY = (view.y % image.height) / view.zoom;
        var drawX = -offsetX;
        var drawY = -offsetY;
        context.fillStyle = "#030303";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        while (drawY < view.height) {
            drawX = -offsetX;
            while (drawX < view.width) {
                context.drawImage(image, drawX, drawY);
                drawX += image.width;
            }
            drawY += image.height;
        }
    };
}

function Ship() {
    this.collisionSet = [[{ x: 140, y: 43 }, { x: 16, y: 4 }], [{ x: 140, y: 43 }, { x: 16, y: 82 }], [{ x: 16, y: 82 }, { x: 16, y: 4 }]]
    this.playerControl = false;
    this.depth = 10;
    this.type = "ship";
    var input_m;
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
        view = this.manager.room.view;

        gun = newObject(Gun);
        this.manager.addObject(gun);
        gun.setShip(this);
        gun.setPos(this.x, this.y);
        gun.setDepth(this.depth + 1);

        this.solid = true;
    }

    this.update = function () {
        var tickTimeMul = (this.gameObject.nowLoopTime - this.gameObject.lastTickTime) / 1000;
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
                var targetMovePos = angleDistanceToPos(targetAngle, speed * tickTimeMul)
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
                var boosterPos = angleDistanceToPos(this.angle - 180, 60);
                var o = newObject(BoosterEffect);
                this.manager.addObject(o);
                o.setPos(this.x + boosterPos.x, this.y + boosterPos.y);
                o.setDepth(this.depth - 1);
                BoosterEffectDeltaTime -= 1;
            }
        }
    };

    this.draw = function (context) {
        var drawTargetPath = false;
        if (drawTargetPath) {
            if ((targetX != -1) || (targetY != -1) && ((this.x != targetX) || (this.y != targetY))) {
                var viewPos = view.roomToViewPos(this.x, this.y);
                var viewTragetPos = view.roomToViewPos(targetX, targetY);
                context.beginPath();
                context.strokeStyle = '#00FF00';
                context.setLineDash([5, 15]);
                //context.moveTo(viewPos.x, viewPos.y);
                //context.lineTo(viewTragetPos.x, viewTragetPos.y);
                context.moveTo(viewTragetPos.x, viewTragetPos.y);
                context.lineTo(viewPos.x, viewPos.y);
                context.stroke();
            }
        }
        this.drawSprite(context);
        var drawCollisionSet = false;
        if (drawCollisionSet) {
            var viewPos = view.roomToViewPos(this.x, this.y);
            var len = this.collisionSet.length;
            var i = 0;

            context.setLineDash([]);
            if (0 < this.collidedObjects.length) {
                var viewIPointPos = view.roomToViewPos(this.collidedObjects[0].iPoint.x, this.collidedObjects[0].iPoint.y);
                context.beginPath();
                context.strokeStyle = '#FF0000';
                context.arc(viewIPointPos.x, viewIPointPos.y, 5, 0, 2 * Math.PI);
                context.fillStyle = 'green';
                context.fill();
                context.stroke();
            }
            else
                context.strokeStyle = '#00FF00';
            context.beginPath();
            while (i < len) {
                var aPos = this.getOffsetSpritePos(this.collisionSet[i][0].x, this.collisionSet[i][0].y);
                var bPos = this.getOffsetSpritePos(this.collisionSet[i][1].x, this.collisionSet[i][1].y);
                context.moveTo(viewPos.x + aPos.x, viewPos.y + aPos.y);
                context.lineTo(viewPos.x + bPos.x, viewPos.y + bPos.y);
                i += 1;
            }
            context.stroke();
            this.collidedObjects = [];
        }

    };

    this.postDraw = function (context) {
        var contextMousePos = view.roomToContextPos(this.x, this.y);
        context.beginPath();
        context.globalAlpha = 0.2;
        context.fillStyle = '#FFFFFF';
        context.fillRect(contextMousePos.x - (maxHP / 2) - 2, contextMousePos.y + 68, maxHP + 4, 10);
        context.globalAlpha = 1;
        context.fillStyle = '#00FF00';
        context.fillRect(contextMousePos.x - (maxHP / 2), contextMousePos.y + 70, hp, 6);
        context.stroke();
    }

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

    this.update = function () {
        if (ship.playerControl) {
            var roomMousePos = view.viewToRoomPos(input_m.viewMousePos.x, input_m.viewMousePos.y);
            var offsetPos = ship.getOffsetSpritePos(60, 43);
            this.x = ship.x + offsetPos.x;
            this.y = ship.y + offsetPos.y;
            this.angle = getAngle(this.x, this.y, roomMousePos.x, roomMousePos.y);

            if (input_m.getMouseState(0) == 1) {
                if (nextFire <= this.gameObject.nowLoopTime) {
                    offsetPos = this.getOffsetSpritePos(58, 11);
                    var firedPos = { x: this.x + offsetPos.x, y: this.y + offsetPos.y };
                    var b = newObject(Bullet);
                    this.manager.addObject(b);
                    b.setShip(ship);
                    b.setPos(firedPos.x, firedPos.y);
                    b.setAngle(this.angle);
                    b.firedPos = firedPos

                    this.gameObject.audio_m.addPlayQueue("laser");

                    nextFire = this.gameObject.nowLoopTime + (1000 / fireRate);
                }
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
        var tickTimeMul = (this.gameObject.nowLoopTime - this.gameObject.lastTickTime) / 1000;
        circleSize -= speed * tickTimeMul;
        if (circleSize < 0)
            this.destroySelf();
    };

    this.draw = function (context) {
        var contextPos = view.roomToContextPos(this.x, this.y);
        context.beginPath();
        context.strokeStyle = '#00FF00';
        context.setLineDash([]);
        context.arc(contextPos.x, contextPos.y, circleSize, 0, 2 * Math.PI);
        context.stroke();
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
        var tickTimeMul = (this.gameObject.nowLoopTime - this.gameObject.lastTickTime) / 1000;
        circleSize -= speed * tickTimeMul;
        if (circleSize < 0)
            this.destroySelf();
    };

    this.draw = function (context) {
        var contextPos = view.roomToContextPos(this.x, this.y);
        context.beginPath();
        context.strokeStyle = '#0000FF';
        context.setLineDash([]);
        context.arc(contextPos.x, contextPos.y, circleSize, 0, 2 * Math.PI);
        context.stroke();
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
        var tickTimeMul = (this.gameObject.nowLoopTime - this.gameObject.lastTickTime) / 1000;
        circleSize += speed * tickTimeMul;
        if (circleMaxSize < circleSize)
            this.destroySelf();
    };

    this.draw = function (context) {
        var viewPos = view.roomToViewPos(this.x, this.y);
        context.beginPath();
        context.strokeStyle = '#FF0000';
        context.setLineDash([]);
        context.arc(viewPos.x, viewPos.y, circleSize, 0, 2 * Math.PI);
        context.stroke();
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
        var tickTimeMul = (this.gameObject.nowLoopTime - this.gameObject.lastTickTime) / 1000;
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
        var tickTimeMul = (this.gameObject.nowLoopTime - this.gameObject.lastTickTime) / 1000;
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