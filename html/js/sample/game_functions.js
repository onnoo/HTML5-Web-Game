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