var pc = new RTCPeerConnection(pcConfig);

pc.onaddstream = function(event) {
	var videoElement = document.createElement('video');
	document.body.appendChild(videoElement);
	videoElement.src = URL.createObjectURL(event.stream);
	videoElement.autoplay = true;
};

function error() {
	pc.close();
}

var socket = io.connect('/');

socket.on('offer', function(offer) {
	pc.setRemoteDescription(new RTCSessionDescription(offer), function() {
		pc.createAnswer(function(answer) {
			pc.setLocalDescription(answer, function() {
				socket.emit('answer', answer);
			}, error);
		}, error);
	}, error);
});

socket.on('candidate', function(candidate) {
	pc.addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on('connect', function() {
	socket.emit('join');
});
