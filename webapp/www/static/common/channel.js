var Channel = (function() {
	////////////////////////////////////////////////////////////////////////////////
	// Container
	////////////////////////////////////////////////////////////////////////////////

	function Container() {
		this.map = {};
		this.callbacks = [];
	}
	
	Container.prototype.lookup = function(names, index) {
		index = index || 0;
		if (index >= names.length) {
			return this;
		}
		var name = names[index];
		if (!this.map.hasOwnProperty(name)) {
			this.map[name] = new Container();
		}
		return this.map[name].lookup(names, index + 1);
	};
	
	Container.prototype.subscribe = function(callback) {
		this.callbacks.push(callback);
	};
	
	Container.prototype.unsubscribe = function(callback) {
		for (var i = 0; i < this.callbacks.length; i++) {
			if (this.callbacks[i] == callback) {
				this.callbacks.splice(i--, 1);
			}
		}
	};

	Container.prototype.publish = function(data) {
		for (var i = 0; i < this.callbacks.length; i++) {
			this.callbacks[i](data);
		}
	};

	var root = new Container();
	var socket = null;

	////////////////////////////////////////////////////////////////////////////////
	// Channel
	////////////////////////////////////////////////////////////////////////////////

	function Channel(name) {
		this.name = name;
	}

	Channel.prototype.subscribe = function(callback) {
		root.lookup(this.name).subscribe(callback);
	};

	Channel.prototype.unsubscribe = function(callback) {
		root.lookup(this.name).unsubscribe(callback);
	};

	Channel.prototype.publish = function(data) {
		if (socket) {
			socket.send(JSON.stringify({
				'channel': this.name,
				'data': data
			}));
		}
	};
	
	////////////////////////////////////////////////////////////////////////////////
	// socket.io
	////////////////////////////////////////////////////////////////////////////////

	var port = 5000;
	document.write('<script type="text/javascript" src="http://' + document.location.hostname + ':' + port + '/socket.io/socket.io.js"></script>');

	$(window).load(function() {
		window.WEB_SOCKET_SWF_LOCATION = 'http://' + document.location.hostname + ':' + port + window.WEB_SOCKET_SWF_LOCATION;

		socket = new io.Socket(document.location.hostname, { 'port': port });
		socket.on('connect', function() {
			root.lookup(['server', 'status']).publish({ 'status': 'connected' });
		});
		socket.on('disconnect', function() {
			root.lookup(['server', 'status']).publish({ 'status': 'disconnected' });
		});
		socket.on('message', function(data) {
			var json = JSON.parse(data);
			root.lookup(json['channel']).publish(json['data']);
		});
		socket.connect();
	});

	return function() {
		return new Channel(Array.prototype.slice.call(arguments));
	};
})();