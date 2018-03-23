var mainGame = null;

function init() {
    var canvas = document.getElementById("main_canvas");

    mainGame = new Game(canvas, 600);

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

// Utill -------------------------------------------

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function radToDeg(radians) {
    return radians * 180 / Math.PI;
}

function angleDistanceToPos(degrees, distance) {
    var radAngle = degToRad(degrees);
    return {
        x: distance * Math.cos(radAngle),
        y: distance * Math.sin(radAngle)
    };
}

function getDistance(x1, y1, x2, y2) {
    var disX = x1 - x2;
    var disY = y1 - y2;

    return Math.sqrt(Math.abs(disX * disX) + Math.abs(disY * disY));
}

function getAngle(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;

    var rad = Math.atan2(dy, dx);
    var degree = (rad * 180) / Math.PI;

    return degree;
}

function rotationPos(x1, y1, x2, y2, degrees) {
    var radAngle = degToRad(degrees);

    var rx = ((x2 - x1) * Math.cos(radAngle) - (y2 - y1) * Math.sin(radAngle)) + x1;
    var ry = ((x2 - x1) * Math.sin(radAngle) + (y2 - y1) * Math.cos(radAngle)) + y1;
    return { x: rx, y: ry }
}

function getIntersectionPos(a1, a2, b1, b2) {
    var area_abc = (a1.x - b1.x) * (a2.y - b1.y) - (a1.y - b1.y) * (a2.x - b1.x);
    var area_abd = (a1.x - b2.x) * (a2.y - b2.y) - (a1.y - b2.y) * (a2.x - b2.x);

    //°ãÃÄÁü
    if ((a1.x == b1.x && a1.y == b1.y) || (a1.x == b2.x && a1.y == b2.y))
        return { x: a1.x, y: a1.y };
    else if ((a2.x == b1.x && a2.y == b1.y) || (a2.x == b2.x && a2.y == b2.y))
        return { x: a2.x, y: a2.y };

    if (area_abc * area_abd >= 0) {
        return false;
    }

    var area_cda = (b1.x - a1.x) * (b2.y - a1.y) - (b1.y - a1.y) * (b2.x - a1.x);
    var area_cdb = area_cda + area_abc - area_abd;
    if (area_cda * area_cdb >= 0) {
        return false;
    }

    var t = area_cda / (area_abd - area_abc);
    var dx = t * (a2.x - a1.x),
        dy = t * (a2.y - a1.y);
    return { x: a1.x + dx, y: a1.y + dy };
}

function getIntersectionPos2(a, b, c, d) {
    var nx1 = (b.y - a.y), ny1 = (a.x - b.x);

    var nx2 = (d.y - c.y), ny2 = (c.x - d.x);

    var denominator = nx1 * ny2 - ny1 * nx2;
    if (denominator == 0) {
        return false;
    }

    var distC_N2 = nx2 * c.x + ny2 * c.y;
    var distA_N2 = nx2 * a.x + ny2 * a.y - distC_N2;
    var distB_N2 = nx2 * b.x + ny2 * b.y - distC_N2;

    if (distA_N2 * distB_N2 >= 0) {
        return false;
    }

    var distA_N1 = nx1 * a.x + ny1 * a.y;
    var distC_N1 = nx1 * c.x + ny1 * c.y - distA_N1;
    var distD_N1 = nx1 * d.x + ny1 * d.y - distA_N1;
    if (distC_N1 * distD_N1 >= 0) {
        return false;
    }

    var fraction = distA_N2 / denominator;
    var dx = fraction * ny1,
        dy = -fraction * nx1;
    return { x: a.x + dx, y: a.y + dy };
}

function drawImageEx(context, image, x, y, split_x, split_y, split_width, split_height, width, height, centerX, centerY, degrees, alpha) {
    split_x = typeof split_x !== 'undefined' ? split_x : 0;
    split_y = typeof split_y !== 'undefined' ? split_y : 0;
    split_width = typeof split_width !== 'undefined' ? split_width : image.width;
    split_height = typeof split_height !== 'undefined' ? split_height : image.height;
    width = typeof width !== 'undefined' ? width : image.width;
    height = typeof height !== 'undefined' ? height : image.height;
    centerX = typeof centerX !== 'undefined' ? centerX : 0;
    centerY = typeof centerY !== 'undefined' ? centerY : 0;
    degrees = typeof degrees !== 'undefined' ? degrees : 0;
    alpha = typeof alpha !== 'undefined' ? alpha : 1;
    if (alpha == 0)
        return

    context.save();
    context.translate(x, y);
    if (degrees != 0)
        context.rotate(degToRad(degrees));
    context.globalAlpha = alpha;
    context.drawImage(image, split_x, split_y, split_width, split_height, -centerX, -centerY, width, height);
    context.restore();
}

function newObject(obj) {
    obj.prototype = new ObjectPreset();
    obj.prototype.constructor = obj;
    return new obj();
}

function newRoom(room) {
    room.prototype = new RoomPreset();
    room.prototype.constructor = room;
    return new room();
}

var cloneObject = typeof Object.assign !== 'undefined' ?
    function (obj) {
        return Object.assign({}, obj)
    } :
    function (obj) {
        var clone = {};
        for (var key in obj) {
            clone[key] = obj[key];
        }
        return clone;
    };

function collisionCheckBox(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    return ax1 <= bx2 &&
        ax2 >= bx1 &&
        ay1 <= by2 &&
        ay2 >= by1;
}

function collisionCheckObjects(obj1, obj2) {
    var collisionSet1 = obj1.collisionSet;
    var collisionSet2 = obj2.collisionSet;
    var len1 = collisionSet1.length;
    var len2 = collisionSet2.length;

    var i = 0;
    while (i < len1) {
        var ii = 0;
        while (ii < len2) {
            var a1 = obj1.getOffsetSpritePos(collisionSet1[i][0].x, collisionSet1[i][0].y);
            a1.x += obj1.x;
            a1.y += obj1.y;
            var a2 = obj1.getOffsetSpritePos(collisionSet1[i][1].x, collisionSet1[i][1].y);
            a2.x += obj1.x;
            a2.y += obj1.y;
            var b1 = obj2.getOffsetSpritePos(collisionSet2[ii][0].x, collisionSet2[ii][0].y);
            b1.x += obj2.x;
            b1.y += obj2.y;
            var b2 = obj2.getOffsetSpritePos(collisionSet2[ii][1].x, collisionSet2[ii][1].y);
            b2.x += obj2.x;
            b2.y += obj2.y;
            iPoint = getIntersectionPos2(a1, a2, b1, b2);
            if (iPoint != false) {
                obj1.collidedObjects.push({ iPoint: iPoint, obj: obj2 });//Room ÁÂÇ¥
                obj2.collidedObjects.push({ iPoint: iPoint, obj: obj1 });
                return true;
            }
            ii += 1;
        }
        i += 1;
    }
    return false;
}

// Class -------------------------------------------

function ObjectPreset() {
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.scale = 1;
    this.sprite = {
        image: null,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        cellWidth: 0,
        cellHeight: 0,
        centerX: 0,
        centerY: 0,
        imageSet: 0,
        frame: 0,
        alpha: 1
    };
    this.depth = 0;
    this.visible = true;
    this.type = "";
    this.class = "";
    this.name = "";
    this.manager = null;
    this.gameObject = null;
    this.solid = false;
    this.collisionSet = [];
    this.collidedObjects = [];

    this.getX = function () {
        return this.x;
    }
    this.getY = function () {
        return this.y;
    }
    this.getPos = function () {
        return {
            x: this.x,
            y: this.y
        };
    }
    this.getAngle = function () {
        return this.angle;
    }
    this.getScale = function () {
        return this.scale;
    }
    this.getAlpha = function () {
        return this.sprite.alpha;
    }
    this.getSprite = function () {
        return this.sprite;
    }
    this.getDepth = function () {
        return this.depth;
    }
    this.isVisible = function () {
        return this.visible;
    }
    this.getType = function () {
        return this.type;
    }
    this.getClass = function () {
        return this.class;
    }
    this.getName = function () {
        return this.name;
    }
    this.getManager = function () {
        return this.manager;
    }
    this.getGameObject = function () {
        return this.gameObject;
    }

    this.setX = function (x, relative) {
        relative = typeof relative !== 'undefined' ? relative : false;
        if (relative)
            this.x += x;
        else
            this.x = x;
    }
    this.setY = function (y, relative) {
        relative = typeof relative !== 'undefined' ? relative : false;
        if (relative)
            this.y += y;
        else
            this.y = y;
    }
    this.setPos = function (x, y, relative) {
        relative = typeof relative !== 'undefined' ? relative : false;
        if (relative) {
            this.x += x;
            this.y += y;
        }
        else {
            this.x = x;
            this.y = y;
        }
    }
    this.setAngle = function (angle, relative) {
        relative = typeof relative !== 'undefined' ? relative : false;
        if (relative)
            this.angle += angle;
        else
            this.angle = angle;
        this.angle %= 360;
    }
    this.setScale = function (scale, relative) {
        relative = typeof relative !== 'undefined' ? relative : false;
        if (relative)
            this.scale += scale;
        else
            this.scale = scale;
    }
    this.setAlpha = function (alpha, relative) {
        relative = typeof relative !== 'undefined' ? relative : false;
        if (relative)
            this.sprite.alpha += alpha;
        else
            this.sprite.alpha = alpha;
        this.angle %= 1;
    }
    this.setSprite = function (image, x, y, width, height, cellWidth, cellHeight, centerX, centerY) {
        x = typeof x !== 'undefined' ? x : 0;
        y = typeof y !== 'undefined' ? y : 0;
        width = typeof width !== 'undefined' ? width : image.width - x;
        height = typeof height !== 'undefined' ? height : image.height - y;
        cellWidth = typeof cellWidth !== 'undefined' ? cellWidth : width;
        cellHeight = typeof cellHeight !== 'undefined' ? cellHeight : height;
        centerX = typeof centerX !== 'undefined' ? centerX : 0;
        centerY = typeof centerY !== 'undefined' ? centerY : 0;
        if ((x < 0) || (x < 0) || (width < 1) || (height < 1) || (cellWidth < 1) || (cellHeight < 1) ||
            (image.width < x + width) || (image.height < y + height) || (width < cellWidth) || (height < cellHeight))
            return false

        this.sprite.image = image;
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.width = width;
        this.sprite.height = height;
        this.sprite.cellWidth = cellWidth;
        this.sprite.cellHeight = cellHeight;
        this.sprite.centerX = centerX;
        this.sprite.centerY = centerY;
        this.sprite.frame = 0;
        return true
    }
    this.setSpriteFrame = function (imageSet, frame) {
        if ((this.sprite.image == null) || (this.sprite.height < (this.sprite.cellHeight * imageSet)) || (this.sprite.width < (this.sprite.cellWidth * frame)))
            return false
        this.sprite.imageSet = imageSet;
        this.sprite.frame = frame;
        return true
    }
    this.setSpriteCenter = function (centerX, centerY) {
        if ((centerX < 0) || (this.sprite.cellWidth <= centerX) || (centerY < 0) || (this.sprite.cellHeight <= centerY))
            return false
        this.sprite.centerX = centerX;
        this.sprite.centerY = centerY;
        return true
    }
    this.setDepth = function (depth) {
        this.depth = depth;
    }
    this.setVisible = function (visible) {
        this.visible = visible;
    }
    this.setType = function (type) {
        this.type = type;
    }
    this.setClass = function (className) {
        this.class = className;
    }
    this.setName = function (name) {
        this.name = name;
    }
    this.setManager = function (manager) {
        this.manager = manager;
    }
    this.setGameObject = function (gameObject) {
        this.gameObject = gameObject;
    }

    this.getOffsetPos = function (x, y) {
        return rotationPos(0, 0, x * this.scale, y * this.scale, this.angle);
    }

    this.getOffsetSpritePos = function (x, y) {
        return rotationPos(0, 0, (x - (this.sprite.cellWidth / 2)) * this.scale, (y - (this.sprite.cellHeight / 2)) * this.scale, this.angle);
    }

    this.drawSprite = function (context) {
        if (this.visible) {
            var view = this.gameObject.getRoom().getView();
            if (view.insideSprite(this))
                drawImageEx(context,
                    this.sprite.image,
                    view.roomToViewX(this.x),// - (this.sprite.centerX * this.scale)
                    view.roomToViewY(this.y),// - (this.sprite.centerY * this.scale)
                    this.sprite.x + (this.sprite.cellWidth * this.sprite.frame),
                    this.sprite.y + (this.sprite.cellHeight * this.sprite.imageSet),
                    this.sprite.cellWidth,
                    this.sprite.cellHeight,
                    this.sprite.cellWidth * this.scale,
                    this.sprite.cellHeight * this.scale,
                    this.sprite.centerX * this.scale,
                    this.sprite.centerY * this.scale,
                    this.angle,
                    this.sprite.alpha);
        }
    }

    this.destroySelf = function () {
        this.manager.removeObject(this);
    }

    this.preUpdate = function () { }
    this.update = function () { }
    this.postUpdate = function () { }

    this.preDraw = function (context) { }
    this.draw = function (context) { }
    this.postDraw = function (context) { }

    this.distanceToPoint = function (x, y) {
        return distance(this.x, this.y, x, y);
    }
    this.distanceToObject = function (object) {
        return distance(this.x, this.y, object.getX(), object.GetY());
    }

    this.init = function () { }
    this.destructor = function () { }
}

function RoomPreset() {
    this.width = 10000;
    this.height = 10000;
    this.object_m = null;
    this.manager = null;
    this.gameObject = null;
    this.view = null;
    this.name = "";

    this.init = function () { }

    this.getWidth = function () {
        return this.width;
    }
    this.getHeight = function () {
        return this.height;
    }
    this.getObjectManager = function () {
        return this.object_m;
    }
    this.getManager = function () {
        return this.manager;
    }
    this.getGameObject = function () {
        return this.gameObject;
    }
    this.getView = function () {
        return this.view;
    }
    this.getName = function () {
        return this.name;
    }

    this.setWidth = function (width) {
        this.width = width;
    }
    this.setHeight = function (height) {
        this.height = height;
    }
    this.setManager = function (manager) {
        this.manager = manager;
    }
    this.setGameObject = function (gameObject) {
        this.gameObject = gameObject;
        this.object_m = new ObjectManager(this.gameObject);
        this.object_m.setRoom(this);
    }
    this.setView = function (view) {
        this.view = view;
    }
    this.setName = function (name) {
        this.name = name;
    }

    this.destructor = function () { }
}

function ImageManager() {
    var imageList = {};
    var removeImageList = [];

    this.loadImage = function (name, src) {
        if (name in imageList)
            return false;

        imageList[name] = new Image();
        imageList[name].name = name;
        imageList[name].src = src;
        return true;
    };

    this.getImage = function (name) {
        return imageList[name];
    };

    this.removeImageNow = function (name) {
        if (name in imageList) {
            delete imageList[name];
        }
        else
            return false;

        return true;
    };

    this.removeImage = function (name) {
        if (name in imageList) {
            if (removeImageList.indexOf(imageList[name]) == -1)
                removeImageList.push(imageList[name]);
        }
        else
            return false;

        return true;
    };

    this.performRemoveImages = function () {
        var len = removeImageList.length;
        var i = 0;
        while (i < len) {
            this.removeImageNow(removeImageList[i].name);
            i += 1;
        }
        removeImageList.splice(0, len);
    };

    this.checkAllImagesLoaded = function () {
        for (var key in imageList) {
            if (!imageList[key].complete)
                return false;
        }
        return true;
    }
}

function AudioManager() {
    var audioList = {};
    var removeAudioList = [];
    var playQueue = [];

    this.loadAudio = function (name, src) {
        if (name in audioList)
            return false;

        var A = new Audio();
        A.name = name;
        A.src = src;
        A.complete = false;
        A.addEventListener('canplay', function () { A.complete = true; });
        audioList[name] = A;
        return true;
    };

    this.addPlayQueue = function (name) {
        if (name in audioList) {
            if (playQueue.indexOf(audioList[name]) == -1)
                playQueue.push(audioList[name]);
        }
        else
            return false;

        return true;
    };

    this.getAudio = function (name) {
        return audioList[name];
    };

    this.setAudioVolume = function (name, volume) {
        volume = typeof volume !== 'undefined' ? volume : 1;
        if (name in audioList)
            audioList[name].volume = volume;
        else
            return false;
        return true;
    };

    this.playAudioNow = function (name) {
        if (name in audioList) {
            var A = audioList[name];
            A.currentTime = 0
            A.play();
        }
        else
            return false;

        return true;
    };

    this.removeAudioNow = function (name) {
        if (name in audioList) {
            delete audioList[name];
        }
        else
            return false;

        return true;
    };

    this.removeAudio = function (name) {
        if (name in audioList) {
            if (removeAudioList.indexOf(audioList[name]) == -1)
                removeAudioList.push(audioList[name]);
        }
        else
            return false;

        return true;
    };

    this.performRemoveAudios = function () {
        var len = removeAudioList.length;
        var i = 0;
        while (i < len) {
            this.removeAudioNow(removeAudioList[i].name);
            i += 1;
        }
        removeAudioList.splice(0, len);
    };

    this.performPlayAudios = function () {
        var len = playQueue.length;
        var i = 0;
        while (i < len) {
            this.playAudioNow(playQueue[i].name);
            i += 1;
        }
        playQueue.splice(0, len);
    };

    this.checkAllAudiosLoaded = function () {
        for (var key in audioList) {
            if (!audioList[key].complete)
                return false;
        }
        return true;
    }
}

function ObjectManager(gameObject) {
    this.gameObject = gameObject;
    this.room = null;
    var objectList = [];
    var addObjectList = [];
    var removeObjectList = [];

    this.getObjectList = function () {
        return objectList;
    };

    this.getRoom = function () {
        return this.room;
    };

    this.setRoom = function (room) {
        this.room = room;
    };

    this.addObjectNow = function (object) {
        if (objectList.indexOf(object) != -1)
            return false;

        object.setManager(this);
        object.setGameObject(this.gameObject);
        object.init();
        objectList.push(object);
        return true;
    };

    this.addObject = function (object) {
        if (objectList.indexOf(object) != -1)
            return false;

        addObjectList.push(object);
        return true;
    };

    this.removeObjectNow = function (object) {
        var removeIdx = objectList.indexOf(object);
        if (removeIdx != -1) {
            objectList.splice(removeIdx, 1);
            //object.destructor();
        }
        else
            return false;

        return true;
    };

    this.removeObject = function (object) {
        var removeIdx = objectList.indexOf(object);
        if (removeIdx > -1) {
            removeObjectList.push(object);
            object.destructor();
        }
        else
            return false;

        return true;
    };

    this.refreshDepth = function () {
        objectList.sort(function (a, b) { return a.depth - b.depth; });
    };

    this.performAddObjects = function () {
        var len = addObjectList.length;
        if (0 < len) {
            var i = 0;
            while (i < len) {
                this.addObjectNow(addObjectList[i]);
                i += 1;
            }
            addObjectList.splice(0, len);
            this.refreshDepth();
        }
    };

    this.performRemoveObjects = function () {
        var len = removeObjectList.length;
        var i = 0;
        while (i < len) {
            this.removeObjectNow(removeObjectList[i]);
            i += 1;
        }
        removeObjectList.splice(0, len);
    };
}

function RoomManager(gameObject) {
    this.gameObject = gameObject;
    var roomList = {};
    var removeRoomList = [];

    this.addRoom = function (name, room) {
        if (name in roomList)
            return false;

        room.setName(name);
        room.setManager(this);
        room.setGameObject(this.gameObject);
        room.init();
        roomList[name] = room;
        return true;
    };

    this.getRoom = function (name) {
        return roomList[name];
    };

    this.inside = function (name) {
        return (name in roomList);
    };

    this.removeRoomNow = function (name) {
        if (name in roomList) {
            roomList[name].destructor();
            delete roomList[name];
        }
        else
            return false;

        return true;
    };

    this.removeRoom = function (name) {
        if (name in roomList) {
            if (removeRoomList.indexOf(roomList[name]) == -1)
                removeRoomList.push(roomList[name]);
        }
        else
            return false;

        return true;
    };

    this.performRemoveRooms = function () {
        var len = removeRoomList.length;
        var i = 0;
        while (i < len) {
            this.removeRoomNow(removeRoomList[i].getName());
            i += 1;
        }
        removeRoomList.splice(0, len);
    };
}

function InputManager(target) {
    target = typeof target !== 'undefined' ? target : window;
    this.keyStates = {};
    this.mouseStates = {};
    this.mousePos = {
        x: 0,
        y: 0
    };
    this.viewMousePos = {
        x: 0,
        y: 0
    };
    var asynKeyStates = {};
    var asynMouseStates = {};
    var asynMousePos = {
        x: 0,
        y: 0
    };
    var target = target;

    this.update = function () {
        this.keyStates = cloneObject(asynKeyStates);
        this.mouseStates = cloneObject(asynMouseStates);
        this.mousePos = cloneObject(asynMousePos);


        var ratioX = target.width / target.offsetWidth;
        var ratioY = target.height / target.offsetHeight;
        this.viewMousePos.x = target.offsetLeft <= this.mousePos.x ? (this.mousePos.x - target.offsetLeft) * ratioX : 0;
        this.viewMousePos.y = target.offsetTop <= this.mousePos.y ? (this.mousePos.y - target.offsetTop) * ratioY : 0;
    };

    this.getKeyState = function (key) {
        return this.keyStates.hasOwnProperty(key) ? this.keyStates[key] : 0;
    };

    this.getMouseState = function (mouse) {
        return this.mouseStates.hasOwnProperty(mouse) ? this.mouseStates[mouse] : 0;
    };

    this.getViewMousePos = function () {
        var ratioX = target.width / target.offsetWidth;
        var ratioY = target.height / target.offsetHeight;
        return {
            x: target.offsetLeft <= this.mousePos.x ? (this.mousePos.x - target.offsetLeft) * ratioX : 0,
            y: target.offsetTop <= this.mousePos.y ? (this.mousePos.y - target.offsetTop) * ratioY : 0
        };
    };

    this.getCanvasMousePos = function () {
        return {
            x: target.offsetLeft <= this.mousePos.x ? this.mousePos.x - target.offsetLeft : 0,
            y: target.offsetTop <= this.mousePos.y ? this.mousePos.y - target.offsetTop : 0
        };
    };

    this.getRealMousePos = function () {
        return this.MousePos;
    };

    target.addEventListener('keyup', function (e) {
        asynKeyStates[e.key] = 0;
        e.preventDefault();
    });
    target.addEventListener('keydown', function (e) {
        asynKeyStates[e.key] = 1;
        e.preventDefault();
    });
    target.addEventListener('mousemove', function (e) {
        asynMousePos.x = e.clientX;
        asynMousePos.y = e.clientY;
    });
    target.addEventListener('mousedown', function (e) {
        asynMouseStates[e.button] = 1;
    });
    target.addEventListener('mouseup', function (e) {
        asynMouseStates[e.button] = 0;
    });
}

function View(width, height) {
    width = typeof width !== 'undefined' ? width : 1280;
    height = typeof height !== 'undefined' ? height : 720;
    this.x = 0;
    this.y = 0;
    this.width = 1280;
    this.height = 720;
    this.room = null;
    this.target = null;
    this.gameObject = null;

    this.getX = function () {
        return this.x;
    }
    this.getY = function () {
        return this.y;
    }
    this.getPos = function () {
        return {
            x: this.x,
            y: this.y
        };
    }
    this.getWidth = function () {
        return this.width;
    }
    this.getHeight = function () {
        return this.height;
    }
    this.getRoom = function () {
        return this.room;
    }
    this.getTarget = function () {
        return this.target;
    }
    this.getGmaeObject = function () {
        return this.gameObject;
    }

    this.setWidth = function (width) {
        this.width = width;
    }
    this.setHeight = function (height) {
        this.height = height;
    }
    this.setRoom = function (room) {
        this.room = room;
    }
    this.setTarget = function (target) {
        this.target = target;
    }
    this.setGameObject = function (gameObject) {
        this.gameObject = gameObject;
    }

    this.update = function () {
        if (this.target != null) {
            this.x = this.target.getX() - (this.width / 2);
            this.y = this.target.getY() - (this.height / 2);
        }

        if (this.room.getWidth() < this.x + this.width)
            this.x = this.room.getWidth() - this.width;
        if (this.room.getHeight() < this.y + this.height)
            this.y = this.room.getHeight() - this.height;

        if (this.x < 0)
            this.x = 0;
        if (this.y < 0)
            this.y = 0;
    };

    this.insidePoint = function (x, y) {
        if ((this.x <= x) && (x <= this.x + this.width) && (this.y <= y) && (y <= this.y + this.height))
            return true;
        else
            return false;
    }

    this.insideRect = function (x1, y1, x2, y2) {
        return checkCollisionBox(this.x, this.y, this.x + this.width - 1, this.y + this.height - 1, x1, y1, x2, y2);
    }

    this.insideSprite = function (object) {
        var sprite = object.getSprite();
        var ox1 = object.x - sprite.centerX;
        var oy1 = object.y - sprite.centerY;
        var ox2 = ox1 + sprite.cellWidth - 1;
        var oy2 = oy1 + sprite.cellHeight - 1;
        return collisionCheckBox(this.x, this.y, this.x + this.width - 1, this.y + this.height - 1, ox1, oy1, ox2, oy2);
    }

    this.viewToRoomX = function (x) {
        return this.x + x;
    }
    this.viewToRoomY = function (y) {
        return this.y + y;
    }
    this.viewToRoomPos = function (x, y) {
        return {
            x: this.x + x,
            y: this.y + y
        };
    }

    this.roomToViewX = function (x) {
        return x - this.x;
    }
    this.roomToViewY = function (y) {
        return y - this.y;
    }
    this.roomToViewPos = function (x, y) {
        return {
            x: x - this.x,
            y: y - this.y
        };
    }
}

function FPSCounter(maxQueued) {
    var maxQueued = maxQueued;
    var fpsQueue = [];
    var averageFPS = 0;

    this.update = function () {
        var len = fpsQueue.length;
        var i = 0, temp = 0;
        while (i < len) {
            temp += fpsQueue[i];
            i += 1;
        }
        averageFPS = temp / len;
    }

    this.addFPS = function (fps) {
        fpsQueue.push(fps);
        if (maxQueued < fpsQueue.length)
            fpsQueue.shift();
    }

    this.getFPS = function () {
        return averageFPS;
    }
}

function Game(canvas, targetFPS) {
    targetFPS = typeof targetFPS !== 'undefined' ? targetFPS : 60;
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.targetFPS = targetFPS;
    this.targetFrameTime = (1000 / this.targetFPS);
    this.image_m = new ImageManager();
    this.audio_m = new AudioManager();
    this.object_m = new ObjectManager(this);
    this.room_m = new RoomManager(this);
    this.input_m = new InputManager(canvas);
    this.nowLoopTime = 0;
    this.lastTickTime = 0;
    this.loopCallback = null;
    this.room = null;
    this.fpsCounter = new FPSCounter(10);
    var lastLoopTime = 0;
    var deltaTime = 0;
    var _this = this;
    var ready = false;
    
    this.loadAssets = function () {
        this.image_m.loadImage("ship", "/static/image/ship.png");

    }
    this.loadAssets();

    this.checkAllAssetsLoaded = function () {
        if (this.image_m.checkAllImagesLoaded() && this.audio_m.checkAllAudiosLoaded())
            this.init();
        else
            setTimeout(function () { _this.checkAllAssetsLoaded() }, 100);
    }
    this.checkAllAssetsLoaded()

    this.init = function () {
        this.room_m.addRoom("test", newRoom(TestRoom)); // Room major에 TestRoom 추가

        this.room = this.room_m.getRoom("test");    // Room major에서 "test"를 가져온다.

        this.performProcesss();

        ready = true;
        console.log("ready!");
    }

    this.getRoom = function () {
        return this.room;
    }

    this.setRoom = function (name) {
        if (name in this.room_m.inside(name)) {
            this.room = this.room_m.getRoom(name);
        }
        else
            return false;

        return true;
    }
    this.setTargetFPS = function (targetFPS) {
        this.targetFPS = targetFPS;
        this.targetFrameTime = (1000 / this.targetFPS);
    }

    this.run = function () {
        if (ready && this.loopCallback == null) {
            this.lastTickTime = Date.now();
            this.loopCallback = setTimeout(function () { _this.loop() }, 0);
        }
    }

    this.stop = function () {
        if (this.loopCallback != null) {
            clearTimeout(this.loopCallback)
            this.loopCallback = null;
        }
    }

    this.loop = function () {
        var targetFrameTime = (1000 / this.targetFPS);
        this.nowLoopTime = Date.now();
        deltaTime += (this.nowLoopTime - lastLoopTime);
        if (targetFrameTime <= deltaTime) {
            this.fpsCounter.addFPS(1000 / (this.nowLoopTime - this.lastTickTime));
            this.fpsCounter.update();

            //var ttt1 = Date.now();
            this.logic();
            //var ttt2 = Date.now();
            this.render();
            //var ttt3 = Date.now();
            //console.log("logic: " + (ttt2 - ttt1) + ", render: " + (ttt3 - ttt2));

            this.lastTickTime = this.nowLoopTime;
            deltaTime -= targetFrameTime;
            if (targetFrameTime < deltaTime)
                deltaTime = targetFrameTime;
        }
        lastLoopTime = this.nowLoopTime;
        this.loopCallback = setTimeout(function () { _this.loop() }, 0);
    };

    this.logic = function () {
        this.input_m.update();
        // Global objects update
        var objectList = this.object_m.getObjectList();
        var len = objectList.length;

        var i = 0;
        while (i < len) {
            objectList[i].preUpdate();
            i += 1;
        }
        i = 0;
        while (i < len) {
            objectList[i].update();
            i += 1;
        }
        i = 0;
        while (i < len) {
            objectList[i].postUpdate();
            i += 1;
        }

        // Room objects update
        if (this.room != null) {
            objectList = this.room.getObjectManager().getObjectList();
            len = objectList.length;

            i = 0;
            while (i < len) {
                objectList[i].preUpdate();
                i += 1;
            }
            i = 0;
            while (i < len) {
                objectList[i].update();
                i += 1;
            }
            i = 0;
            while (i < len) {
                objectList[i].postUpdate();
                i += 1;
            }
        }

        this.room.getView().update();

        this.performProcesss();

        // Room objects collision check
        if (this.room != null) {
            objectList = this.room.getObjectManager().getObjectList();
            len = objectList.length;

            i = 0;
            while (i < len) {
                if (objectList[i].solid) {
                    var ii = i + 1;
                    while (ii < len) {
                        if (objectList[ii].solid)
                            collisionCheckObjects(objectList[i], objectList[ii]);
                        ii += 1;
                    }
                }
                i += 1;
            }
        }
    };

    this.render = function () {
        if (document.visibilityState != "visible")
            return;
        // Room objects draw
        if (this.room != null) {
            var objectList = this.room.getObjectManager().getObjectList();
            var len = objectList.length;

            var i = 0;
            while (i < len) {
                if (objectList[i].visible)
                    objectList[i].preDraw(this.context);
                i += 1;
            }
            i = 0;
            while (i < len) {
                if (objectList[i].visible)
                    objectList[i].draw(this.context);
                i += 1;
            }
            i = 0;
            while (i < len) {
                if (objectList[i].visible)
                    objectList[i].postDraw(this.context);
                i += 1;
            }
        }
    };

    this.performProcesss = function () {
        this.object_m.performRemoveObjects();
        this.image_m.performRemoveImages();
        this.audio_m.performRemoveAudios();
        this.room_m.performRemoveRooms();
        this.room.object_m.performRemoveObjects();

        this.object_m.performAddObjects();
        this.room.object_m.performAddObjects();

        this.audio_m.performPlayAudios();
    };
}

// Game Object -------------------------------------------


// Room -------------------------------------------

function TestRoom() {
    this.init = function () {   // this.를 통해 내부화를 해준다, init : 초기화 코드
        var v = new View();
        v.setWidth(this.gameObject.canvas.width);   //여기서 this는 room, gameObject는 Game. View의 너비 설정
        v.setHeight(this.gameObject.canvas.height);
        v.setRoom(this);
        v.setGameObject(this.gameObject);
        this.setView(v);
    }
}

function start() {
    if (mainGame != null)
        mainGame.run();
}

function stop() {
    if (mainGame != null)
        mainGame.stop();
}




















