var cameraRatio = 16 / 9;

var container = document.getElementById( 'container' );

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10)
scene.add( camera );

var geometry = new THREE.PlaneGeometry(cameraRatio, 1);

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor( 0x000000 );
renderer.setPixelRatio( window.devicePixelRatio );
container.appendChild( renderer.domElement );

var controls = new THREE.VRControls( camera );
var effect = new THREE.VREffect( renderer );
// effect.scale = 0; // video doesn't need eye separation

if ( WEBVR.isAvailable() ) {
	document.body.appendChild( WEBVR.getButton( effect ) );
} else {
	document.body.appendChild( WEBVR.getMessage() );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	effect.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize, false );
onWindowResize();

function animate() {
	effect.requestAnimationFrame( animate );

	controls.update();
	effect.render( scene, camera );
}

document.body.addEventListener('click', function(){
	effect.setFullScreen( true );
});

var pc = new RTCPeerConnection(pcConfig);

pc.onaddstream = function(event) {
	var videoElement = document.createElement('video');
	videoElement.src = URL.createObjectURL(event.stream);
	videoElement.autoplay = true;

	var texture = new THREE.VideoTexture( videoElement );
	texture.minFilter = THREE.NearestFilter;
	texture.maxFilter = THREE.NearestFilter;
	texture.format = THREE.RGBFormat;
	texture.generateMipmaps = false;

	var material = new THREE.MeshBasicMaterial( { map: texture } );
	mesh = new THREE.Mesh( geometry, material );
	mesh.position.z = -2;
	scene.add( mesh );

	animate();
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
