function Output(name) {
	this.name = name;
	this.nodes = [];
	this.element = null;
	this.rect = null;
}

Output.prototype.connectsToNode = function(node) {
	for (var i = 0; i < this.nodes.length; i++) {
		if (this.nodes[i] == node) {
			return true;
		}
	}
	return false;
};