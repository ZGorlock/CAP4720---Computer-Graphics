var renderer;
var scene;
var camera;


function init()
{
	scene = new THREE.Scene();

	setupCamera();
	setupRenderer();
	addLighting();

	createObjects();

	document.body.appendChild(renderer.domElement);
	render();
}

function setupCamera()
{
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.x = 0;
	camera.position.y = 50;
	camera.position.z = -75;
	camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function setupRenderer()
{
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0x000000, 1.0);
	renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
	renderer.shadowMapEnabled = true;
}

function addLighting()
{
	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
    hemiLight.position.set( 0, 100, 0 );
    scene.add(hemiLight);
}

function render()
{
	performShadingCalculations();
	recognizeKeys();

	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

var intensity = 0.0, dir = 0.0025;
var round = 0;
var tme = 0, tme_dir = 0.01;
function performShadingCalculations()
{
	intensity += dir;
	if (intensity > 0.5) {
		intensity = 0.0;
		round++;
	}
	if (round >= 4) {
		round = 0;
	}

	switch (round) {
		case 0:
			orb.material.uniforms.sr.value = 0.5 + intensity;
			orb.material.uniforms.sg.value = 0.0 + intensity;
			orb.material.uniforms.sb.value = 0.5 - intensity;
			break;
		case 1:
			orb.material.uniforms.sr.value = 1.0 - intensity;
			orb.material.uniforms.sg.value = 0.5 + intensity;
			orb.material.uniforms.sb.value = 0.0 + intensity;
			break;
		case 2:
			orb.material.uniforms.sr.value = 0.5 - intensity;
			orb.material.uniforms.sg.value = 1.0 - intensity;
			orb.material.uniforms.sb.value = 0.5 + intensity;
			break;
		case 3:
			orb.material.uniforms.sr.value = 0.0 + intensity;
			orb.material.uniforms.sg.value = 0.5 - intensity;
			orb.material.uniforms.sb.value = 1.0 - intensity;
			break;
	}

	tme += tme_dir;
	if (tme > 1.0) {
		tme_dir = -tme_dir;
	} else if(tme < 0.0) {
		tme_dir = -tme_dir;
	}
	orb.material.uniforms.time.value = tme;

	// orb.rotation.x -= 0.002525;
	orb.rotation.y -= 0.00525;
	// orb.rotation.z -= 0.002525;

	for (var i = 0; i < boxes.length; i++) {
		boxes[i].material.uniforms.sr.value = orb.material.uniforms.sr.value;
		boxes[i].material.uniforms.sg.value = orb.material.uniforms.sg.value;
		boxes[i].material.uniforms.sb.value = orb.material.uniforms.sb.value;
	}
}

function recognizeKeys()
{
	if (Key.isDown(Key.A)) {
		scene.rotation.y += 0.1;
	}
	if (Key.isDown(Key.D)) {
		scene.rotation.y -= 0.1;
	}

	if (Key.isDown(Key.W)) {
		scene.rotation.x += 0.1;
	}
	if (Key.isDown(Key.S)) {
		scene.rotation.x -= 0.1;
	}
}

var orb, pedestal, boxes;
function createObjects()
{
		var orbGeo = new THREE.SphereGeometry(12, 50, 50);
		var orbMat = createCustomOrbMaterial();
		orb = new THREE.Mesh(orbGeo, orbMat);
		orb.position.y = 12;


		boxes = [];
	  pedestal = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10, 10), new THREE.MeshBasicMaterial({transparent: true, color: 0x0000ff, opacity: 0.0}));
		var boxGeo = new THREE.BoxGeometry(10, 10, 10);
		var smallBoxGeo = new THREE.BoxGeometry(5, 5, 5);
		var boxMat = createCustomPedestalMaterial();

		var box1 = new THREE.Mesh(boxGeo, boxMat);
		box1.position.y = -25;
		boxes.push(box1);
		pedestal.add(box1);

		var box2 = new THREE.Mesh(boxGeo, boxMat);
		box2.position.y = -15;
		boxes.push(box2);
		pedestal.add(box2);

		var box3 = new THREE.Mesh(boxGeo, boxMat);
		box3.position.y = -5;
		boxes.push(box3);
		pedestal.add(box3);

		var smallBox1N = new THREE.Mesh(smallBoxGeo, boxMat);
		smallBox1N.position.z = 12.5;
		boxes.push(smallBox1N);
		pedestal.add(smallBox1N);

		var smallBox1W = new THREE.Mesh(smallBoxGeo, boxMat);
		smallBox1W.position.x = -12.5;
		boxes.push(smallBox1W);
		pedestal.add(smallBox1W);

		var smallBox1S = new THREE.Mesh(smallBoxGeo, boxMat);
		smallBox1S.position.z = -12.5;
		boxes.push(smallBox1S);
		pedestal.add(smallBox1S);

		var smallBox1E = new THREE.Mesh(smallBoxGeo, boxMat);
		smallBox1E.position.x = 12.5;
		boxes.push(smallBox1E);
		pedestal.add(smallBox1E);

		var smallBox2N = new THREE.Mesh(smallBoxGeo, boxMat);
		smallBox2N.position.x = 12.5;
		smallBox2N.position.y = 20;
		smallBox2N.position.z = 12.5;
		boxes.push(smallBox2N);
		pedestal.add(smallBox2N);

		var smallBox2W = new THREE.Mesh(smallBoxGeo, boxMat);
		smallBox2W.position.x = -12.5;
		smallBox2W.position.y = 20;
		smallBox2W.position.z = 12.5;
		boxes.push(smallBox2W);
		pedestal.add(smallBox2W);

		var smallBox2S = new THREE.Mesh(smallBoxGeo, boxMat);
		smallBox2S.position.x = 12.5;
		smallBox2S.position.y = 20;
		smallBox2S.position.z = -12.5;
		boxes.push(smallBox2S);
		pedestal.add(smallBox2S);

		var smallBox2E = new THREE.Mesh(smallBoxGeo, boxMat);
		smallBox2E.position.x = -12.5;
		smallBox2E.position.y = 20;
		smallBox2E.position.z = -12.5;
		boxes.push(smallBox2E);
		pedestal.add(smallBox2E);


		scene.add(pedestal);
		scene.add(orb);
}


window.onload = init;


function loadShader(shadertype)
{
	return document.getElementById(shadertype).textContent;
}

var orbUniforms = { time: {type: 'f', value: 0}, tDiffuse: {type: "t", value: THREE.ImageUtils.loadTexture('images/background.png')}, sr: {type: 'f', value: 0.2}, sg: {type: 'f', value: 0.2}, sb: {type: 'f', value: 0.0} };
var pedestalUniforms = { sr: {type: 'f', value: 0.2}, sg: {type: 'f', value: 0.2}, sb: {type: 'f', value: 0.0} };

function createCustomOrbMaterial()
{
	var frag = loadShader("orbFragment");
	var vert = loadShader("vertex");
	var shaderMaterial = new THREE.ShaderMaterial({uniforms:orbUniforms,vertexShader:vert,fragmentShader:frag});
	return shaderMaterial;
}

function createCustomPedestalMaterial()
{
	var frag = loadShader("pedestalFragment");
	var vert = loadShader("vertex");
	var shaderMaterial = new THREE.ShaderMaterial({uniforms:pedestalUniforms,vertexShader:vert,fragmentShader:frag});
	return shaderMaterial;
}
