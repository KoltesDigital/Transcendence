'use strict';
var a;
var bunyan = require('bunyan');
var config = require('config-path')();
var express = require('express');
var http = require('http');
var Server = require('socket.io');

var app = express();
var server = http.Server(app);
var io = new Server(server);

var logger = bunyan.createLogger({
	name: 'transcendence',
	serializers: bunyan.stdSerializers,
});

app.set('view engine', 'pug');

app.get('/camera', function(req, res) {
	res.render('camera');
});

app.get('/', function(req, res) {
	res.render('index');
});

app.use(express.static('static'));

var cameraSocket = null;

io.on('connection', function(socket) {
	socket.on('create', function() {
		if (cameraSocket) return;

		cameraSocket = socket;

		socket.on('disconnect', function() {
			cameraSocket = null;
		});

		function forward(name) {
			socket.on(name, function(id) {
				var socket = io.sockets.connected[id];
				if (socket) {
					arguments[0] = name;
					socket.emit.apply(socket, arguments);
				}
			});
		}

		forward('candidate');
		forward('offer');
	});

	socket.on('join', function() {
		if (cameraSocket) {
			cameraSocket.emit('join', socket.id);
		} else {
			socket.emit('no camera');
		}

		function forward(name) {
			socket.on(name, function() {
				if (cameraSocket) {
					Array.prototype.unshift.call(arguments, socket.id);
					Array.prototype.unshift.call(arguments, name);
					cameraSocket.emit.apply(cameraSocket, arguments);
				}
			});
		}

		forward('answer');
		forward('candidate');
	});
});

server.listen(config.listen, function() {
	logger.info({
		listen: config.listen,
	}, 'Listening');
});
