var game_rooms = [
    {
        name: "test",
        object: TestRoom,
        default: true
    }
];

//{
//    name: "",
//    object: null,
//    default: false
//};


function TestRoom() {
    this.width = 3000;
    this.height = 3000;

    this.init = function () {
        var v;
        var o;

        v = new View();
        v.setWidth(this.gameObject.canvas.width);
        v.setHeight(this.gameObject.canvas.height);
        //v.setZoom(1);
        v.setRoom(this);
        v.setGameObject(this.gameObject);
        this.setView(v);

        o = newObject(Background);
        this.object_m.addObject(o);

        o = newObject(Cursor);
        this.object_m.addObject(o);

        o = newObject(Land);
        this.object_m.addObject(o);

        o = newObject(Tank);
        this.object_m.addObject(o);
        o.setPos(100,100);
        o.playerControl = true;
        v.setTarget(o)
        // for (var i = 0; i < 1000; i += 1) {
        //    var o = newObject(Dummy);
        //    this.object_m.addObject(o);
        //    o.setSpriteCenter(i, i);
        // }
    }
}