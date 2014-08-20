/**
 * Created by Yongnan on 7/31/2014.
 */
function Hierarchy(array){

     this.objects = this.convertToHierarchy(array);
     this.tmp =[];
     this.removeCircle();
     this.calculateNum();
     this.arrangeGraph();
}
Hierarchy.prototype ={
    arrangeGraph: function(){

        for(var i=0; i<this.objects.length-1; ++i)
         {
             for(var j=i; j<this.objects.length; ++j)
             {
                 if(this.objects[j].nodeNum>this.objects[i].nodeNum)
                 {
                     var tmp = this.objects[j];
                     this.objects[j]=this.objects[i] ;
                     this.objects[i] = tmp;
                 }
             }
         }
        var levels=[];
        for(var i=0; i<this.objects[0].nodeNum; ++i)
        {
            var level ={};
            level.id = i;
            level.data=[];
            levels.push(level);
        }
        for(var i=0; i<this.objects.length; ++i)
        {
                for(var j=1; j<=this.objects[0].nodeNum; ++j)
                {
                    if(this.objects[i].nodeNum === j)
                    {
                        levels[this.objects[0].nodeNum-j].data.push(this.objects[i]);
                    }
                }
        }
        //calculate the maxHeight of every level
        for(var i=0; i<levels.length; ++i)
        {
            var max=0;
             for(var j=0; j<levels[i].data.length; ++j)
             {
                  if(max<levels[i].data[j].value.h)
                  {
                      max=levels[i].data[j].value.h;
                  }
             }
            levels[i].maxHeight = max;
        }
        var paddingX = 15;
        var paddingY = 15;
        var tempy = 0;
        for (var i = 0; i < levels.length; ++i) {

            if (i === 0) {
                tempy = paddingY;
            }
            else {
                tempy = (i + 1) * paddingY;
                for (var k = 0; k < i; k++) {
                    tempy += levels[k].maxHeight;
                }
            }
            //Now we know the ypos, width, height
            //so we need to get xpos
            var needWidth = -paddingX;
            for (var j = 0; j < levels[i].data.length; ++j) {
                needWidth += paddingX + levels[i].data[j].value.w;
            }
            levels[i].needWidth = needWidth;
            var offsetX = 0;
             if (needWidth < window.innerWidth) {//This is trying to layout from the center of the screen
             offsetX = (window.innerWidth - needWidth) / 2.0;
             }

            var tempx = 0;
            for (var j = 0; j < levels[i].data.length; ++j) {
                if (j === 0) {
                    tempx = 0;
                }
                else {
                    tempx = j * paddingY;
                    for (k = 0; k < j; k++) {
                        tempx += levels[i].data[k].value.w;
                    }
                }
                levels[i].data[j].value.x = tempx + offsetX;
                levels[i].data[j].value.y = tempy;
            }
        }
        var canvas = $("#bgCanvas")[0];
        var needCanvasWidth = 0;
        var needCanvasHeight = 0;
        for(var i=0; i<levels.length; ++i)
        {
            needCanvasWidth = Math.max(needCanvasWidth, levels[i].needWidth);
            needCanvasHeight += levels[i].maxHeight;
        }
        canvas.width = needCanvasWidth;
        canvas.height = needCanvasHeight;
        if(needCanvasWidth>window.innerWidth)
        {
            canvas.width=needCanvasWidth;
        }
        if(needCanvasHeight>window.innerHeight)
        {
            canvas.height=needCanvasHeight;
        }
        for(var i=0; i<graphs.length; ++i)
        {
             for(var j=0; j<Data.compartments.length; ++j)
             {
                 if(graphs[i].compartmentId === Data.compartments[j].id)
                 {
                     graphs[i].setBoundingCB(Data.compartments[j].x, Data.compartments[j].y, Data.compartments[j].w, Data.compartments[j].h);
                 }
             }
        }
        if (graphs.length !== 0)
            springy = new Manage({graphs: graphs});
    },
    calculateNum: function(){
        for(var i=0; i<this.objects.length; ++i)
        {
            this.objects[i].nodeNum = 1;
        }
        for(var i=0; i<this.objects.length; ++i)
        {
            this.getNum(this.objects[i]);
        }
    },
    getNum: function(node){
        if(node.children.length ===0)
        {
            return node.nodeNum;
        }
        var a=1;
        for(var i=0; i<node.children.length; ++i)
        {
            a = Math.max( a, this.getNum(node.children[i]) );
        }
        node.nodeNum = a+1;
        return node.nodeNum;
    },
    convertToHierarchy: function (array) {
        var nodeObjects = this.createStructure(array);
        for (var i = nodeObjects.length - 1; i >= 0; i--) {
            if(nodeObjects[i] !== null)
            {
                var currentNode = nodeObjects[i];
                var children = this.getChildren(currentNode, nodeObjects);
                for(var j=0; j<children.length; ++j)
                {
                    currentNode.children.push(children[j]);
                }
            }
        }
        return nodeObjects;
    },
    createStructure: function (nodes) {
        var objects = [];

        for (var i = 0; i < nodes.length; i++) {
            objects.push({ value: nodes[i], children: [] });
        }

        return objects;
    },
    getChildren: function (node, objects)
    {
        var children = [];
        var to = node.value.to;
        for(var i=0; i<to.length; ++i)
        {
            for(var j=0; j<objects.length; ++j)
            {
                if(to[i].compartmentId === objects[j].value.id)
                {
                    children.push(objects[j]);
                }
            }
        }
        return children;
    },
    removeCircle: function(){
        for(var i=0; i<this.objects.length; ++i)
        {
            this.tmp.length =0;
            this.detectCircle(this.objects[i]);
        }
    },
    detectCircle: function(node){
        if(node.children.length)
        {
            for(var i=0; i<this.tmp.length; ++i)
            {
                if(this.tmp[i] === node)
                {
                    break;
                }
            }
            if(i>= this.tmp.length)
            {
                this.tmp.push(node);
            }
            else{
                node.children.length=0;
            }
            for(var i=0; i<node.children.length; ++i)
            {
                this.detectCircle(node.children[i]);
            }
        }

    }
};




