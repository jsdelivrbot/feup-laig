/**
 * MyGraphLeaf class, representing a leaf in the scene graph.
 * @constructor
**/


function MyGraphLeaf(graph, xmlelem) {
    this.graph = graph;

    //Getting leaf type ('rectangle', 'cylinder', 'sphere', 'triangle', 'patch')
    this.type = graph.reader.getString(xmlelem, 'type');
    console.log("TYPE : " + this.type);

    var coordinates = graph.reader.getString(xmlelem, 'args');
    console.log("Args : " + coordinates);

    //Default value for now
    this.primitive = new MyQuad(graph.scene);

    switch(this.type) {
        case 'rectangle':
            this.primitive = new MyQuad(graph.scene);
        case 'cylinder':
            this.primitive = new MyCylinder(graph.scene, 2, 4);
            break;
        case 'triangle':
            //this.primitive = new MyTriangle(cenas);
            break;
        case 'patch':
            //this.primitive = new MyPatch(cenas);
            break;
        case 'sphere':
            //this.primitive = new MyPatch(cenas);
            break;
    }
}

MyGraphLeaf.prototype.constructor = MyGraphLeaf;

MyGraphLeaf.prototype.display = function() {
    this.primitive.display();
}