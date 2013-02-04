var JAI = JAI || { REVISION: '1' };

JAI.Point = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};

JAI.Point.prototype = {
	constructor: JAI.Point,

	equalTo: function(point) {
		if (!(point instanceof JAI.Point))
			throw "parameter is not a JAI.Point";

		return (this.x == point.x && this.y == point.y);
	}
};

JAI.Node = function(cost_g, cost_h, parent_key) {
	this.cost_g = cost_g;
	this.cost_h = cost_h;
	this.cost_f = cost_g + cost_h;
	this.parent_key = parent_key;
};

JAI.Node.prototype = {
	constructor: JAI.Node
};

JAI.List = function() {
	this.content = new Array();
};

JAI.List.prototype = {
	constructor: JAI.List,

	add: function(node, x, y) {
		if (!(node instanceof JAI.Node))
			throw "parameter is not a JAI.Node";

		x = x == null ? 0 : x;
		y = y == null ? 0 : y;

		var add = true;
		var find = this.find(x, y);

		if (find !== false) {
			add = false;
			if (node.cost_f < this.content[find][2].cost_f)
				this.content[find][2] = node;
		};

		if (add) 
			this.content.push(new Array(x, y, node));
	},

	find: function(x, y) {
		var present = false;
		this.content.forEach(function(element, index, array) {
			if (element[0] == x && element[1] == y) {
				present = index;
			};
		});

		return present;
	},

	getBetter: function() {
		var better = false;
		if (this.content.length > 0) {
			better = 0;
			this.content.forEach(function(element, index, array) {
				if (element[2].cost_f < array[better][2].cost_f) {
					better = index;
				};
			});
		};
		return (better === false ? false : this.content[better]);
	}
};

JAI.Map = function(min_x, max_x, min_y, max_y) {
	this.min_x = min_x;
	this.max_x = max_x;
	this.min_y = min_y;
	this.max_y = max_y;
	this.length = 0;

	this.points = new Object();
	for (var x = min_x; x <= max_x; x++) {
		for (var y = min_y; y <= max_y; y++) {
			this.points['x' + x + ':y' + y] = new JAI.Point(x, y);
			this.length++;
		};
	};
};

JAI.Map.prototype = {
	constructor: JAI.Map,
	
	find: function(x, y) {
		return (this.points['x' + x + ':y' + y] == undefined ? false : this.points['x' + x + ':y' + y]);
	}
};

JAI.Astar = function(map) {
	if (!(map instanceof JAI.Map)) 
		throw "new instance of JAI.Astar needs a JAI.Map";

	this.map = map;
	this.open_list = new JAI.List();
	this.close_list = new JAI.List();
	this.start = 0;
	this.end = 0;
};

JAI.Astar.prototype = {
	constructor: JAI.Astar,
	
	init: function(start_x, start_y, end_x, end_y) {
		var error = '';
		if (this.map.find(start_x, start_y) == false)
			error += 'start';
			
		if (this.map.find(end_x, end_y) == false)
			error += (error == '' ? 'end' : ' and end');
		
		if (error != '')
			throw error + " should be in the map";
			
		this.start = this.map.find(start_x, start_y);
		this.end = this.map.find(end_x, end_y);
		
		var starting_node = new JAI.Node(0, JAI.Astar.getDistance(this.start, this.end), false);
		this.close_list.add(starting_node, this.start.x, this.start.y);
	},
	
	treatNeighboringNodes: function(x, y) {
		var count = 0;
		for (var i = (x-1); i <= (x+1); i++) {
			for (var j = (y-1); j <= (y+1); j++) {
				if (this.map.find(i, j) && !(i == x && j == y)) {
					var node = new JAI.Node(0, 0, 'x' + x + ':y' + y);
					this.open_list.add(node, i, j);
					count++;
				};
			};
		};
		return count;
	}
};

JAI.Astar.getDistance = function(start, end, kind) {
	if (!(start instanceof JAI.Point) || !(end instanceof JAI.Point))
		throw "getDistance needs JAI.Point parameters";

	if (kind == 'manhattan') {
		var distance = Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
	} else {
		var distance = (start.x - end.x) * (start.x - end.x) + (start.y - end.y) * (start.y - end.y);
	};
	return (kind == undefined ? Math.sqrt(distance) : distance);
}

