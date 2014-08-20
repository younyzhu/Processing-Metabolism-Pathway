/**
 * Created by Yongnan on 7/15/2014.
 */
    // Data fields used by layout algorithm in this file:
    // this.Jsondata.mass
    // Data used by default renderer in springyui.js
    // this.Jsondata.label
 function Node(id, data) {
    this.id = id;
    this.data = (data !== undefined) ? data : {};
}
var getTextWidth = function (node,ctx,nodeFont) {
    var text = (node.data.label !== undefined) ? node.data.label : node.id;
    if (node._width && node._width[text])
        return node._width[text];

    ctx.save();
    ctx.font = (node.data.font !== undefined) ? node.data.font : nodeFont;
    var width = ctx.measureText(text).width;
    ctx.restore();

    node._width || (node._width = {});
    node._width[text] = width;

    return width;
};

var getTextHeight = function (node) {
    return 10;
    // In a more modular world, this would actually read the font size, but I think leaving it a constant is sufficient for now.
    // If you change the font size, I'd adjust this too.
};

Node.prototype.getHeight = function () {
    var height;
    if (this.data.image == undefined) {
        height = getTextHeight(this);
    } else
    {
        height = 10;

    }
    return height;
};

Node.prototype.getWidth = function (ctx,nodeFont) {
    var width;
    if (this.data.image == undefined) {
        width = getTextWidth(this,ctx,nodeFont);
    } else {
        width = 10;
    }
    return width;
};
// Point
function Point(position, mass) {
    this.p = position; // position
    this.m = mass; // mass
    this.v = new Vector(0, 0); // velocity
    this.a = new Vector(0, 0); // acceleration
}
Point.prototype.applyForce = function(force) {
    this.a = this.a.add(force.divide(this.m));
};

