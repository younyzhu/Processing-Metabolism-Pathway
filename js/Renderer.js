/**
 * Created by Yongnan on 7/15/2014.
 */
//function Renderer(layout, clear, drawEdge, drawNode, onRenderStop, onRenderStart) {
function Renderer(layout) {
    this.layout = layout;
    this.layout.graph.addGraphListener(this);
}
Renderer.prototype = {
    graphChanged: function () {
        this.start();
    },
    start: function () {
        this.layout.start();
    }
};
