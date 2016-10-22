'use strict';

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

io.on('connection', function(socket) {
	socket.on('message', function() {

	});

	socket.on('disconnect', function() {

	});
});

server.listen(config.listen, function() {
	logger.info({
		listen: config.listen,
	}, 'Listening');
});
