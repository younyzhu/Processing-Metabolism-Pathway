// -----------
function ForceDirected(graph, ctx, boundingX, boundingY, boundingW, boundingH, minEnergyThreshold) {
    this.graph = graph;
    this.ctx = ctx;
    this.stiffness = 400.0; // spring stiffness constant
    this.repulsion = 1200.0; // repulsion constant
    this.damping = 0.5; // velocity damping factor
    this.minEnergyThreshold = minEnergyThreshold || 1; //threshold used to determine render stop

    this.nodePoints = {}; // keep track of points associated with nodes
    this.edgeSprings = {}; // keep track of springs associated with edges

    this.compartmentX = boundingX+30;
    this.compartmentY = boundingY+15;
    this.compartmentWidth = boundingW-60;
    this.compartmentHeight = boundingH-30;
}
ForceDirected.prototype = {
    initCalculateBB: function () {
        // calculate bounding box of graph layout.. with ease-in
        this.currentBB = this.getBoundingBox();
        this.targetBB = {bottomleft: new Vector(-1, -1), topright: new Vector(1, 1)};
    },
    updateBB: function () {
        this.targetBB = this.getBoundingBox();
        // current gets 20% closer to target every iteration
        this.currentBB = {
            bottomleft: this.currentBB.bottomleft.add(this.targetBB.bottomleft.subtract(this.currentBB.bottomleft)
                .divide(10)),
            topright: this.currentBB.topright.add(this.targetBB.topright.subtract(this.currentBB.topright)
                .divide(10))
        };
    },
    // convert to/from screen coordinates
    toScreen: function (p) {
        var size = this.currentBB.topright.subtract(this.currentBB.bottomleft);
        //var sx = p.subtract(currentBB.bottomleft).divide(size.x).x * canvas.width;
        //var sy = p.subtract(currentBB.bottomleft).divide(size.y).y * canvas.height;
        var sx = p.subtract(this.currentBB.bottomleft).divide(size.x).x * this.compartmentWidth + this.compartmentX;
        var sy = p.subtract(this.currentBB.bottomleft).divide(size.y).y * this.compartmentHeight + this.compartmentY;
        return new Vector(sx, sy);
    },
    clear: function () {
        this.ctx.clearRect(this.compartmentX, this.compartmentY, this.compartmentWidth, this.compartmentHeight);
    },
    nodeInsideCompartment: function (x, y, w, h) {
        return (x >= this.compartmentX && y >= this.compartmentY &&
            (x + w) <= (this.compartmentX + this.compartmentWidth) &&
            (y + h) <= (this.compartmentY + this.compartmentHeight) )
    },
    drawNode: function (node, p) {
        var ctx = this.ctx;
        var s = this.toScreen(p);
        // Pulled out the padding aspect sso that the size functions could be used in multiple places
        // These should probably be settable by the user (and scoped higher) but this suffices for now
        var paddingX = 0;
        var paddingY = 0;
        var boxWidth = node.data.w + paddingX;  //Node rectangle
        var boxHeight = node.data.h + paddingY;
        var rectx = s.x - boxWidth / 2;
        var recty = s.y - boxHeight / 2;
        var offsetX;
        var offsetY;
        offsetX = Data.compartments[node.data.compartmentId].x;
        offsetY = Data.compartments[node.data.compartmentId].y;
        node.data.x = rectx- offsetX;
        node.data.y = recty- offsetY;
        if (!this.nodeInsideCompartment(rectx, recty, boxWidth, boxHeight))
            return;

        ctx.save();
        ctx.clearRect(rectx, recty, boxWidth, boxHeight);
        ctx.fillStyle = "#C2C2C2";
        ctx.fillRect(rectx, recty, boxWidth, boxHeight);
        ctx.restore();
    },
    arrowInsideCompartment: function (x1, y1, x2, y2) {
        return (
            x1 > this.compartmentX && y1 > this.compartmentY &&
            x1 < (this.compartmentX + this.compartmentWidth) &&
            y1 < (this.compartmentY + this.compartmentHeight) &&
            x2 > this.compartmentX && y2 > this.compartmentY &&
            x2 < (this.compartmentX + this.compartmentWidth) &&
            y2 < (this.compartmentY + this.compartmentHeight)
            )
    },
    drawEdge: function (edge, p1, p2) {
        var ctx = this.ctx;
        var x1 = this.toScreen(p1).x;
        var y1 = this.toScreen(p1).y;
        var x2 = this.toScreen(p2).x;
        var y2 = this.toScreen(p2).y;

        var direction = new Vector(x2 - x1, y2 - y1);
        var normal = direction.normal().normalise();

        var from = this.graph.getEdges(edge.source, edge.target);
        var to = this.graph.getEdges(edge.target, edge.source);

        var total = from.length + to.length;

        // Figure out edge's position in relation to other edges between the same nodes
        var n = 0;
        for (var i = 0; i < from.length; i++) {
            if (from[i].id === edge.id) {
                n = i;
            }
        }

        //change default to  10.0 to allow text fit between edges
        var spacing = 0.0;   //default 12

        // Figure out how far off center the line should be drawn
        var offset = normal.multiply(-((total - 1) * spacing) / 2.0 + (n * spacing));

        var paddingX = 0;
        var paddingY = 0;

        var s1 = this.toScreen(p1).add(offset);
        var s2 = this.toScreen(p2).add(offset);

        //var boxWidth = edge.target.getWidth(ctx, this.nodeFont) + paddingX;
        //var boxHeight = edge.target.getHeight() + paddingY;
        var boxWidth = edge.target.data.w + paddingX;  //Node rectangle
        var boxHeight = edge.target.data.h + paddingY;
        var intersection = this.intersect_line_box(s1, s2, {x: x2 - boxWidth / 2.0, y: y2 - boxHeight / 2.0}, boxWidth, boxHeight);

        if (!intersection) {
            intersection = s2;
        }

        var stroke = (edge.data.color !== undefined) ? edge.data.color : '#000000';
        //var stroke = '#000000';
        var arrowWidth;
        var arrowLength;

        var weight = (edge.data.weight !== undefined) ? edge.data.weight : 1.0;

        ctx.lineWidth = Math.max(weight * 2, 0.1);
        arrowWidth = 1 + ctx.lineWidth;
        arrowLength = 8;

        var directional = (edge.data.directional !== undefined) ? edge.data.directional : true;

        // line
        var lineEnd;
        if (directional) {
            lineEnd = intersection.subtract(direction.normalise().multiply(arrowLength * 0.5));
        } else {
            lineEnd = s2;
        }
        if (!this.arrowInsideCompartment(s1.x, s1.y, lineEnd.x, lineEnd.y))
            return;

        ctx.save();
        ctx.strokeStyle = stroke;
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(lineEnd.x, lineEnd.y);
        ctx.stroke();
        ctx.restore();
        // arrow
        if (directional) {
            ctx.save();
            ctx.fillStyle = stroke;
            ctx.translate(intersection.x, intersection.y);
            ctx.rotate(Math.atan2(y2 - y1, x2 - x1));
            ctx.beginPath();
            ctx.moveTo(-arrowLength, arrowWidth);
            ctx.lineTo(0, 0);
            ctx.lineTo(-arrowLength, -arrowWidth);
            ctx.lineTo(-arrowLength * 0.8, -0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    },
    // helpers for figuring out where to draw arrows
    intersect_line_line: function (p1, p2, p3, p4) {
        var denom = ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));

        // lines are parallel
        if (denom === 0) {
            return false;
        }

        var ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
        var ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return false;
        }

        return new Vector(p1.x + ua * (p2.x - p1.x), p1.y + ua * (p2.y - p1.y));
    },

    intersect_line_box: function (p1, p2, p3, w, h) {
        var tl = {x: p3.x, y: p3.y};
        var tr = {x: p3.x + w, y: p3.y};
        var bl = {x: p3.x, y: p3.y + h};
        var br = {x: p3.x + w, y: p3.y + h};

        var result;
        if (result = this.intersect_line_line(p1, p2, tl, tr)) {
            return result;
        } // top
        if (result = this.intersect_line_line(p1, p2, tr, br)) {
            return result;
        } // right
        if (result = this.intersect_line_line(p1, p2, br, bl)) {
            return result;
        } // bottom
        if (result = this.intersect_line_line(p1, p2, bl, tl)) {
            return result;
        } // left

        return false;
    },
//---------------------------------------------------------//
    point: function (node) {
        if (!(node.id in this.nodePoints)) {
            var mass = (node.data.mass !== undefined) ? node.data.mass : 1.0;
            this.nodePoints[node.id] = new Point(Vector.random(), mass);
        }
        return this.nodePoints[node.id];
    },
    spring: function (edge) {
        if (!(edge.id in this.edgeSprings)) {
            var length = (edge.data.length !== undefined) ? edge.data.length : 1.0;

            var existingSpring = false;

            var from = this.graph.getEdges(edge.source, edge.target);
            from.forEach(function (e) {
                if (existingSpring === false && e.id in this.edgeSprings) {
                    existingSpring = this.edgeSprings[e.id];
                }
            }, this);

            if (existingSpring !== false) {
                return new this.Spring(existingSpring.point1, existingSpring.point2, 0.0, 0.0);
            }

            var to = this.graph.getEdges(edge.target, edge.source);
            from.forEach(function (e) {
                if (existingSpring === false && e.id in this.edgeSprings) {
                    existingSpring = this.edgeSprings[e.id];
                }
            }, this);

            if (existingSpring !== false) {
                return new this.Spring(existingSpring.point2, existingSpring.point1, 0.0, 0.0);
            }

            this.edgeSprings[edge.id] = new this.Spring(
                this.point(edge.source), this.point(edge.target), length, this.stiffness
            );
        }

        return this.edgeSprings[edge.id];
    },
    eachNode: function (callback) {
        var t = this;
        this.graph.nodes.forEach(function (n) {
            callback.call(t, n, t.point(n));
        });
    },
    drawEachNode: function () {
        var _this = this;
        this.eachNode(function (node, point) {
            _this.drawNode(node, point.p);
        });
    },
    drawEachEdge: function () {
        var _this = this;
        this.eachEdge(function (edge, spring) {
            _this.drawEdge(edge, spring.point1.p, spring.point2.p);
        });
    },
    eachEdge: function (callback) {
        var t = this;
        this.graph.edges.forEach(function (e) {
            callback.call(t, e, t.spring(e));
        });
    },
    eachSpring: function (callback) {
        var t = this;
        this.graph.edges.forEach(function (e) {
            callback.call(t, t.spring(e));
        });
    },
    applyCoulombsLaw: function () {
        this.eachNode(function (n1, point1) {
            this.eachNode(function (n2, point2) {
                if (point1 !== point2) {
                    var d = point1.p.subtract(point2.p);
                    var distance = d.magnitude() + 0.1; // avoid massive forces at small distances (and divide by zero)
                    var direction = d.normalise();

                    // apply force to each end point
                    point1.applyForce(direction.multiply(this.repulsion).divide(distance * distance * 0.5));
                    point2.applyForce(direction.multiply(this.repulsion).divide(distance * distance * -0.5));
                }
            });
        });
    },

    applyHookesLaw: function () {
        this.eachSpring(function (spring) {
            var d = spring.point2.p.subtract(spring.point1.p); // the direction of the spring
            var displacement = spring.length - d.magnitude();
            var direction = d.normalise();

            // apply force to each end point
            spring.point1.applyForce(direction.multiply(spring.k * displacement * -0.5));
            spring.point2.applyForce(direction.multiply(spring.k * displacement * 0.5));
        });
    },
    attractToCentre: function () {
        this.eachNode(function (node, point) {
            var direction = point.p.multiply(-1.0);
            point.applyForce(direction.multiply(this.repulsion / 2.0)); // 50 to 10
        });
    },
    updateVelocity: function (timestep) {
        this.eachNode(function (node, point) {
            // Is this, along with updatePosition below, the only places that your
            // integration code exist?
            point.v = point.v.add(point.a.multiply(timestep)).multiply(this.damping);
            point.a = new Vector(0, 0);
        });
    },
    updatePosition: function (timestep) {
        this.eachNode(function (node, point) {
            // Same question as above; along with updateVelocity, is this all of
            // your integration code?
            point.p = point.p.add(point.v.multiply(timestep));
        });
    },
    totalEnergy: function (timestep) {
        var energy = 0.0;
        this.eachNode(function (node, point) {
            var speed = point.v.magnitude();
            energy += 0.5 * point.m * speed * speed;
        });

        return energy;
    },
    render: function () {
        this.clear();
        this.drawCompartment();
        this.drawEachEdge();
        this.drawEachNode();
    },
    drawCompartment: function () {
        var ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = "#C2C2C2";
        ctx.lineWidth = 2;
        ctx.rect(this.compartmentX, this.compartmentY, this.compartmentWidth, this.compartmentHeight);
        ctx.stroke();
        ctx.restore();
    },
    //start: function (render, onRenderStop, onRenderStart) {
    start: function () {
        var _this = this;
        if (this._started) return;
        this._started = true;
        this._stop = false;

        function animate() {
            _this.tick(0.01);

            _this.render();

            // stop simulation when energy of the system goes below a threshold
            if (_this._stop || _this.totalEnergy() < _this.minEnergyThreshold) {
                _this._started = false;
            } else {
                requestAnimationFrame(animate);
            }
        }

        animate();
    },
    stop: function () {
        this._stop = true;
        this._started = false;
    },
    tick: function (timestep) {
        this.applyCoulombsLaw();
        this.applyHookesLaw();
        this.attractToCentre();
        this.updateVelocity(timestep);
        this.updatePosition(timestep);
    },
    nearest: function (pos) {
        var min = {node: null, point: null, distance: null};
        var t = this;
        this.graph.nodes.forEach(function (n) {
            var point = t.point(n);
            var distance = point.p.subtract(pos).magnitude();

            if (min.distance === null || distance < min.distance) {
                min = {node: n, point: point, distance: distance};
            }
        });

        return min;
    },
    getBoundingBox: function () {
        var bottomleft = new Vector(-1, -1);
        var topright = new Vector(1, 1);

        this.eachNode(function (n, point) {
            if (point.p.x < bottomleft.x) {
                bottomleft.x = point.p.x;
            }
            if (point.p.y < bottomleft.y) {
                bottomleft.y = point.p.y;
            }
            if (point.p.x > topright.x) {
                topright.x = point.p.x;
            }
            if (point.p.y > topright.y) {
                topright.y = point.p.y;
            }
        });
        var padding = topright.subtract(bottomleft).multiply(0.035); // ~5% padding
        return {bottomleft: bottomleft.subtract(padding), topright: topright.add(padding)};
    },
    Spring: function (point1, point2, length, k) {
        this.point1 = point1;
        this.point2 = point2;
        this.length = length; // spring length at rest
        this.k = k; // spring constant (See Hooke's law) .. how stiff the spring is
    }
};
