var renderer;
var scene;
var camera;

var mouse = new THREE.Vector2();

var raycaster = new THREE.Raycaster();

const boardWidth = 8;
const boardHeight = 8;


function init()
{
	scene = new THREE.Scene();

	setupCamera();
	setupRenderer();
	addLighting();

	loadSounds();
	loadFont();

	createPlayField();
	initGame();

	document.body.appendChild(renderer.domElement);

	renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
	renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
	renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);

	modal.style.display = "block";

	loadPieces();

	render();
}

function setupCamera()
{
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.x = 0;
	camera.position.y = 200;
	camera.position.z = -250;
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

var background, putPiece, winner;
function loadSounds()
{
	background = new Audio("sounds/lament of meiyerditch.mp3");
	putPiece = new Audio("sounds/hit.mp3");
	winner = new Audio("sounds/win.mp3");

	background.loop = true;
	background.play();
}

var font;
var fontLoaded = false;
function loadFont() {
	var loader = new THREE.FontLoader();
	loader.load('fonts/helvetiker_bold.typeface.json', function (response) {
		font = response;
		fontLoaded = true;
	});
}

var plane;
var playField;
var squaretiles = [];
function createPlayField()
{
	plane = new THREE.Mesh(new THREE.PlaneGeometry(24 * 8 + 48, 24 * 8 + 48, 10, 10), new THREE.MeshBasicMaterial({transparent: true, color: 0x0000ff, opacity: 0.0}));
	plane.position.z = .5;
	plane.rotation.x = - (Math.PI / 2);
	plane.name = "plane";
	scene.add(plane);

	var colors = ['black', 'white'];
	var squareWidth = 24, squareHeight = 24;

	var darkTexture = THREE.ImageUtils.loadTexture('images/darkSquare.jpg');
	var lightTexture = THREE.ImageUtils.loadTexture('images/lightSquare.png');

	var squareGeo = new THREE.BoxGeometry(squareWidth, squareHeight, 1);

	playField = new THREE.Object3D();

	for (var row = 0; row < boardHeight; row++) {
		var alternate = ((row + 1) & 1);
		for (var col = boardWidth - 1; col >= 0; col--) {
			var mesh;
			if (alternate == 0) {
				var darkSquareMat = new THREE.MeshLambertMaterial({map:darkTexture});
				mesh = new THREE.Mesh(squareGeo, darkSquareMat);
			} else {
				var lightSquareMat = new THREE.MeshLambertMaterial({map:lightTexture});
				mesh = new THREE.Mesh(squareGeo, lightSquareMat);
			}
			mesh.position.x = - (squareWidth * 3.5) + col * squareWidth;
			mesh.position.y = - (squareHeight * 3.5) + row * squareHeight;
			mesh.name = 'square-' + row + 'x' + (boardWidth - 1 - col) + '-' + colors[alternate];

			alternate ^= 1;

			squaretiles.push(mesh);
			playField.add(mesh);
		}
	}

	playField.rotation.x = - (Math.PI / 2);
	scene.add(playField);
}

var models = [5];
var modelEnum = {
	NULL: 0,
	SINGLE_WHITE: 1,
	DOUBLE_WHITE: 2,
	SINGLE_BLACK: 3,
	DOUBLE_BLACK: 4
};
var modelNameEnum = {
	0: 'null',
	1: 'piece-single-white',
	2: 'piece-double-white',
	3: 'piece-single-black',
	4: 'piece-double-black',
};

var pieces = [...Array(boardHeight).keys()].map(i => Array(boardWidth));

var whiteTexture;
var blackTexture;
function loadPieces()
{
	whiteTexture = THREE.ImageUtils.loadTexture('images/whitePiece.jpg');
	blackTexture = THREE.ImageUtils.loadTexture('images/blackPiece.jpg');

	loadPiece('single', 'white', 1);
	loadPiece('double', 'white', 2);
	loadPiece('single', 'black', 3);
	loadPiece('double', 'black', 4);

	setTimeout(waitForPiecesToLoad, 500);
}

function loadPiece(type, color, index)
{
	var loader = new THREE.OBJLoader();

	loader.load(
		'models/piece.obj',

		function(object)
		{
			object.castShadow = true;
			object.receiveShadow = true;
			object.scale.set( 2, 4, 2 );

			var obj = new THREE.Object3D();
			obj.name = 'piece-' + type + '-' + color;
			object.parent = obj;
			obj.add(object);

			if (type == 'double') {
				var crown = object.clone();
				crown.position.y = -5;
				obj.add(crown);
			}
			obj.rotation.x = - (Math.PI / 2);

			var texture;
			if (color == 'white') {
				texture = whiteTexture;
			} else {
				texture = blackTexture;
			}

			obj.traverse(function(child) {
				if (child instanceof THREE.Mesh) {
					child.material.map = texture;
					child.material.needsUpdate = true;
				}
			});

			models[index] = obj;
		}
	);
}

var piecesLoaded = false;
function waitForPiecesToLoad()
{
	var allloaded = true;
	for (var i = 0; i < 4; i++)	{
		if (models[i] == null) {
			allloaded = false;
			break;
		}
	}

	if (!allloaded)	{
		setTimeout(waitForPiecesToLoad, 500);
	} else {
		placePieces(startBoard);
		piecesLoaded = true;
	}
}

function placePieces(state)
{
	for (var i = 0; i < boardWidth * boardHeight - 1; i++) {
		squaretiles[i].material.color.set(0xffffff);
	}

	for (var i = 0; i < state.length; i++) {
		for (var j = 0; j < state[i].length; j++) {
			var pieceX = 24 * 4 - j * 24 - 12;
			var pieceY = 24 * (-4 + i + 1) - 12;

			var piece = pieces[i][j];
			var squareState = state[i][j];

			if (squareState == 0) {
				if (piece != null) {
					playField.remove(piece);
					pieces[i][j] = null;
				}

			} else {
				var model;
				if (piece == null || piece.name != modelNameEnum[squareState]) {
					if (piece != null) {
						playField.remove(piece);
						pieces[i][j] = null;
					}

					piece = models[squareState].clone();
					piece.name = modelNameEnum[squareState];
					playField.add(piece);
					pieces[i][j] = piece;
				}
				piece.position.x = pieceX;
				piece.position.y = pieceY;
				piece.position.z = 5;
			}
		}
	}
}

async function switchPlayer()
{
	if (!downkeep()) {
		upkeep();
		return;
	}

	player ^= 1;

	crownee = -1;
	impasse = false;
	resumeList = [];
	upkeep();

	var smoothing = 15;
	var startingZ = playField.rotation.z;
	var endingZ = playField.rotation.z + Math.PI;
	var step = (endingZ - startingZ) / smoothing;
	var delay = 750 / smoothing;

	for (var i = 0; i < smoothing - 1; i++) {
		await sleep(delay);
		playField.rotation.z += step;
	}
	playField.rotation.z = endingZ;
	if (playField.rotation.z > 2 * Math.PI) {
		playField.rotation.z %= (2 * Math.PI);
	}
}

function render()
{
	recognizeKeys();

	displayHeader();

	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function recognizeKeys()
{
	if (Key.isDown(Key.A)) {
		playField.rotation.y += 0.1;
		boundRotation();
	}
	if (Key.isDown(Key.D)) {
		playField.rotation.y -= 0.1;
		boundRotation();
	}

	if (Key.isDown(Key.W)) {
		playField.rotation.x += 0.1;
		boundRotation();
	}
	if (Key.isDown(Key.S)) {
		playField.rotation.x -= 0.1;
		boundRotation();
	}
}

var playerHeading = null;
var player1ScoreHeading = null;
var player2ScoreHeading = null;
var lastPlayer = -1;
var lastPlayer1Score = -1;
var lastPlayer2Score = -1;
function displayHeader()
{
	if (!fontLoaded) {
		return;
	}
	if (won) {
		player = -1;
	}

	if (playerHeading == null || lastPlayer != player) {
		if (playerHeading != null) {
			scene.remove(playerHeading);
		}
		var playerString = (player == 0) ? "White's Turn" : "Black's Turn";
		if (won) {
			var playerString = (player1Score == 0) ? "White Wins!!" : "Black Wins!!";
			winner.play();
		}

		var headerObjectGeometry = new THREE.TextBufferGeometry(playerString, {
			font: font,
			size: 12,
			height: 4,
			curveSegments: 4,
			material: 0,
			extrudeMaterial: 0,
			hover: 0
		});
		headerObjectGeometry.computeBoundingBox();
		headerObjectGeometry.computeVertexNormals();
		playerHeading = new THREE.Mesh(headerObjectGeometry, new THREE.MeshBasicMaterial({color: 0xf0f0f0})) ;
		playerHeading.position.x = 50;
		playerHeading.position.y = 100;
		playerHeading.position.z = 0;
		playerHeading.rotation.x = Math.PI / 8;
		playerHeading.rotation.y = Math.PI;
		scene.add(playerHeading);
		lastPlayer = player;
	}

	if (player1ScoreHeading == null || lastPlayer1Score != player1Score) {
		if (player1ScoreHeading != null) {
			scene.remove(player1ScoreHeading);
		}

		var headerObjectGeometry = new THREE.TextBufferGeometry("White: " + player1Score, {
			font: font,
			size: 8,
			height: 1,
			curveSegments: 4,
			material: 0,
			extrudeMaterial: 0,
			hover: 0
		});
		headerObjectGeometry.computeBoundingBox();
		headerObjectGeometry.computeVertexNormals();
		player1ScoreHeading = new THREE.Mesh(headerObjectGeometry, new THREE.MeshBasicMaterial({color: 0xf0f0f0})) ;
		player1ScoreHeading.position.x = 120;
		player1ScoreHeading.position.y = 100;
		player1ScoreHeading.position.z = -50;
		player1ScoreHeading.rotation.x = Math.PI / 10;
		player1ScoreHeading.rotation.y = Math.PI;
		scene.add(player1ScoreHeading);
		lastPlayer1Score = player1Score;
	}

	if (player2ScoreHeading == null || lastPlayer2Score != player2Score) {
		if (player2ScoreHeading != null) {
			scene.remove(player2ScoreHeading);
		}

		var headerObjectGeometry = new THREE.TextBufferGeometry("Black: " + player2Score, {
			font: font,
			size: 8,
			height: 1,
			curveSegments: 4,
			material: 0,
			extrudeMaterial: 0,
			hover: 0
		});
		headerObjectGeometry.computeBoundingBox();
		headerObjectGeometry.computeVertexNormals();
		player2ScoreHeading = new THREE.Mesh(headerObjectGeometry, new THREE.MeshBasicMaterial({color: 0xf0f0f0})) ;
		player2ScoreHeading.position.x = -70;
		player2ScoreHeading.position.y = 100;
		player2ScoreHeading.position.z = -50;
		player2ScoreHeading.rotation.x = Math.PI / 10;
		player2ScoreHeading.rotation.y = Math.PI;
		scene.add(player2ScoreHeading);
		lastPlayer2Score = player2Score;
	}
}

function boundRotation()
{
	if (playField.rotation.y > Math.PI / 4) {
		playField.rotation.y = Math.PI / 4;
	}
	if (playField.rotation.y < - Math.PI / 4) {
		playField.rotation.y = - Math.PI / 4;
	}
	if (playField.rotation.x > - Math.PI / 2) {
		playField.rotation.x = - Math.PI / 2;
	}
	if (playField.rotation.x < - 3 * Math.PI / 4) {
		playField.rotation.x = - 3 * Math.PI / 4;
	}

	plane.rotation.x = playField.rotation.x;
	plane.rotation.y = playField.rotation.y;
	plane.rotation.z = playField.rotation.z;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


var modal = document.getElementById('myModal');
var span = document.getElementsByClassName("close")[0];
span.onclick = function() {
		modal.style.display = "none";
}
window.onclick = function(event) {
		if (event.target == modal) {
				modal.style.display = "none";
		}
}

window.onload = init;


function onDocumentMouseMove( event )
{
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

	var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
	vector.unproject(camera);
	raycaster.set(camera.position, vector.sub(camera.position).normalize());

	if (selectedObject != null) {
		var intersects = raycaster.intersectObject(plane);
		if (intersects.length > 0) {
			if (player == 0) {
				selectedObject.position.set(intersects[0].point.x, -intersects[0].point.z, 15);
			} else {
				selectedObject.position.set(-intersects[0].point.x, intersects[0].point.z, 15);
			}
		}
	}
}

var selectedObject = null;
var selectedSquare = null;
var x, y, z;
function onDocumentMouseDown(event)
{
	event.preventDefault();

	if (won) {
		return;
	}

	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	vector.unproject(camera);
	raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

	var intersects = raycaster.intersectObjects(scene.children, true);
	if (intersects.length > 0) {

		selectedSquare = -1;
		for (var i = 0; i < intersects.length; i++) {
			var obj = intersects[i].object;
			var name = obj.name;
			if (name.startsWith('square')) {
				var row = name.substring(7, 8);
				var col = name.substring(9, 10);
				selectedSquare = parseInt(row) * 8 + parseInt(col);
				break;
			}
		}

		var validPick = true;
		if (resumeList.length > 0) {
			validPick = false;
			for (var j = 0; j < resumeList.length; j++) {
				if (resumeList[j] == selectedSquare) {
					validPick = true;
					break;
				}
			}
		}
		if (!validPick) {
			selectedSquare = -1;
		}

		var pickedUp = false;
		if (selectedSquare != -1) {
			var selectedRow = Math.floor(selectedSquare / 8);
			var selectedCol = selectedSquare % 8;

			for (var i = 0; i < intersects.length; i++) {
				var obj = intersects[i].object;
				var name = obj.name;
				var par = obj;
				while ((par = par.parent) != null) {
					name = par.name;
					if (name.length > 0 && name.startsWith('piece') && name.endsWith((player == 0) ? 'white' : 'black')) {

						if (impasse) {
							if (player == 0) {
								if (board[selectedRow][selectedCol] == modelEnum.SINGLE_WHITE) {
									board[selectedRow][selectedCol] = modelEnum.NULL;
								} else if (board[selectedRow][selectedCol] == modelEnum.DOUBLE_WHITE) {
									board[selectedRow][selectedCol] = modelEnum.SINGLE_WHITE;
								}
							} else {
								if (board[selectedRow][selectedCol] == modelEnum.SINGLE_BLACK) {
									board[selectedRow][selectedCol] = modelEnum.NULL;
								} else if (board[selectedRow][selectedCol] == modelEnum.DOUBLE_BLACK) {
									board[selectedRow][selectedCol] = modelEnum.SINGLE_BLACK;
								}
							}

							placePieces(board);
							switchPlayer();
							return;

						} else {
							obj = par;
							selectedObject = obj;
							pickedUp = true;
							x = selectedObject.position.x;
							y = selectedObject.position.y;
							z = selectedObject.position.z;
							break;
						}
					}
				}
				if (pickedUp) {
					break;
				}
			}
		}

		if (pickedUp) {
			getLegalMoves(selectedSquare);

			if (resumeList.length > 0) {
				for (var j = 0; j < resumeList.length; j++) {
					squaretiles[resumeList[j]].material.color.set(0xffffff);
				}
			}

			for (var j = 0; j < moveList.length; j++) {
				squaretiles[moveList[j]].material.color.set(0x00ff00);
			}
		}
	}
}

var crownee = -1;
function onDocumentMouseUp(event)
{
	event.preventDefault();

	if (won) {
		return;
	}

	var destSquare = -1;
	var intersects = raycaster.intersectObjects(scene.children, true);
	if (intersects.length > 0) {
		for (var i = 0; i < intersects.length; i++) {
			intersects[i].object;
			var name = intersects[i].object.name;
			if (name.startsWith('square')) {
				var row = name.substring(7, 8);
				var col = name.substring(9, 10);
				destSquare = parseInt(row) * 8 + parseInt(col);
				break;
			}
		}
	}

	var legalmovemade = false;
	for (var i = 0; i < moveList.length; i++) {
		if (moveList[i] == destSquare) {
			legalmovemade = true;
			putPiece.play();

			resumeList = [];
			resetResumeList = true;

			var src = selectedSquare;
			var dst = destSquare;

			var srcRow = Math.floor(src / 8);
			var srcCol = src % 8;
			var dstRow = Math.floor(dst / 8);
			var dstCol = dst % 8;
			var pieceValue = board[srcRow][srcCol];

			switch (moveTypes[i]) {
				case moveTypeEnum.SLIDE:
				case moveTypeEnum.DOUBLE_SLIDE:
				case moveTypeEnum.CROWN_START:
					board[srcRow][srcCol] = modelEnum.NULL;
					board[dstRow][dstCol] = pieceValue;
					break;
				case moveTypeEnum.TRANSPOSE:
					if (player == 0) {
						board[srcRow][srcCol] = modelEnum.SINGLE_WHITE;
						board[dstRow][dstCol] = modelEnum.DOUBLE_WHITE;
					} else {
						board[srcRow][srcCol] = modelEnum.SINGLE_BLACK;
						board[dstRow][dstCol] = modelEnum.DOUBLE_BLACK;
					}
					break;
				case moveTypeEnum.CROWN_FINISH:
					if (player == 0) {
						board[srcRow][srcCol] = modelEnum.NULL;
						board[dstRow][dstCol] = modelEnum.DOUBLE_WHITE;
					} else {
						board[srcRow][srcCol] = modelEnum.NULL;
						board[dstRow][dstCol] = modelEnum.DOUBLE_BLACK;
					}
					crownee = -1;
					break;
				case moveTypeEnum.BEAR_OFF:
					if (player == 0) {
						board[srcRow][srcCol] = modelEnum.NULL;
						board[dstRow][dstCol] = modelEnum.SINGLE_WHITE;
					} else {
						board[srcRow][srcCol] = modelEnum.NULL;
						board[dstRow][dstCol] = modelEnum.SINGLE_BLACK;
					}
					break;
			}

			break;
		}
	}

	placePieces(board);

	selectedObject = null;
	moveList = [];

	if (legalmovemade) {
		switchPlayer();
	} else if (resumeList.length > 0) {
		for (var j = 0; j < resumeList.length; j++) {
			squaretiles[resumeList[j]].material.color.set(0x00ff00);
		}
	}
}
