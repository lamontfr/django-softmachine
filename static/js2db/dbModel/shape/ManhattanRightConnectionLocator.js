/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2014 Giovanni Victorette
 ****************************************/
/**
 * @class dbModel.shape.ManhattanRightConnectionLocator
 *
 * A ManhattanRightConnectionLocator that is used to place figures at the right position of a Manhattan routed
 * connection.
 *
 * @author Giovanni Victorette
 * @extend draw2d.layout.locator.ConnectionLocator
 */
dbModel.shape.ManhattanRightConnectionLocator = draw2d.layout.locator.ConnectionLocator.extend({
    NAME: "dbModel.shape.ManhattanRightConnectionLocator",

    /**
     * @constructor
     * Constructs a ManhattanRightConnectionLocator with associated Connection c.
     *
     * @param {draw2d.Connection} c the connection associated with the locator
     */
    init: function(c) {
        this._super(c);
    },

    /**
     * @method
     * Relocates the given Figure always in the center of an edge.
     *
     * @param {Number} index child index of the target
     * @param {draw2d.Figure} target The figure to relocate
     **/
    relocate: function(index, target) {
        var conn = this.getParent();
        var points = conn.getVertices();

		var coordR = points.get(points.getSize()-1);
        var x = coordR.x - 35;
        var y = coordR.y - 20;

        target.setPosition(x, y);
    }
}); 