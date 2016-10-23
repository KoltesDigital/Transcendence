var socket = io.connect('/');

var clients = {};

socket.on('connect', function() {
	navigator.getUserMedia({
		video: true,
	}, function(stream) {
		socket.on('join', function(id) {
			var pc = new RTCPeerConnection(pcConfig);

			function error() {
				pc.close();
			}

			clients[id] = {
				pc: pc,
				error: error,
			};

			pc.onicecandidate = function(event) {
				if (event.candidate)
					socket.emit('candidate', id, event.candidate);
			};

			pc.addStream(stream);
			pc.createOffer(function(offer) {
				pc.setLocalDescription(offer, function() {
					socket.emit('offer', id, offer);
				}, error);
			}, error, { offerToReceiveVideo: true, });
		});

		socket.on('answer', function(id, answer) {
			var client = clients[id];
			if (!client) return;

			client.pc.setRemoteDescription(new RTCSessionDescription(answer), function() {

			}, client.error);
		});

		socket.on('disconnect', function(id) {
			var client = clients[id];
			if (!client) return;

			client.pc.close();
			delete clients[id];
		});

		socket.emit('create');
	}, function() {});
});
