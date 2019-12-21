	var renderer, rendererHUD;
	var scene;
	var camera, cameraHUD;

	var player;

	var ghosts = [];
	var ghostDirection = [];
	var candies = [];
	var walls = [];

	var score = 0;
	var lives = 2;
	var loser = false;

	var jumping = false;
	var jumpTime;

	var rw = 200, rh = 150;
	var ca = 30, ar = 1;

	function init()
	{
		scene = new THREE.Scene();

		setupRenderers();
		setupCameras();

		loadSounds();
		loadFont();

		setupSpotlight(100,100,0xffffff,1);
		setupSpotlight(100,-100,0xffffff,2);
		setupSpotlight(-100,-100,0xffffff,3);
		setupSpotlight(-100,100,0xffffff,4);
		setBrightness(2);

		setupPlayer();
		setupGhosts();

		addObjectsToScene();

		var container = document.getElementById("MainView");
		container.appendChild( renderer.domElement );

		var containerHUD = document.getElementById("HUDView");
		containerHUD.appendChild( rendererHUD.domElement );

		modal.style.display = "block";

		render();
	}

	function setupPlayer()
	{
		var ballGeometry = new THREE.SphereGeometry( .45 );
		var ballMaterial = new THREE.MeshLambertMaterial({color:'white'});
		player = new THREE.Mesh( ballGeometry, ballMaterial );
		scene.add( player );
	}

	function setupGhosts()
	{
		var ghostGeometry = new THREE.SphereGeometry( .45 );
		for (var i = 0; i < 4; i++) {
			var ghostMaterial;
			if (i == 0) {
				ghostMaterial = new THREE.MeshLambertMaterial({color:'cyan'});
			} else if (i == 1) {
				ghostMaterial = new THREE.MeshLambertMaterial({color:'pink'});
			} else if (i == 2) {
				ghostMaterial = new THREE.MeshLambertMaterial({color:'red'});
			} else if (i == 3) {
				ghostMaterial = new THREE.MeshLambertMaterial({color:'yellow'});
			}

			var ghost = new THREE.Mesh( ghostGeometry, ghostMaterial );

			var z, x, trueX, trueZ;
			do {
				z = Math.floor(Math.random() * board.length);
				x = Math.floor(Math.random() * board[z].length);
				trueX = (x - (board[z].length / 2)) + .5;
				trueZ = (z - (board.length / 2)) + .5;
			} while (board[z][x] == 1 || (Math.abs(trueX) < 4 || Math.abs(trueZ) < 4));

			ghost.position.x = trueX;
			ghost.position.z = trueZ;

			ghosts.push(ghost);
			ghostDirection.push(0);
			scene.add(ghost);
		}
	}

	function setupRenderers()
	{
		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor( 0x000000, 0 );
		renderer.setSize( window.innerWidth - 20, window.innerHeight - 20 );
		renderer.shadowMapEnabled = true;

		rendererHUD = new THREE.WebGLRenderer();
		rendererHUD.setClearColor( 0x000000, 0 );
		rendererHUD.setSize( rw, rh);
		rendererHUD.shadowMapEnabled = true;
	}

	function setupCameras()
	{
		camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000);
		camera.lookAt( scene.position );
		camera.position.y = .1;

		cameraHUD = new THREE.PerspectiveCamera(ca, ar, 0.1, 100);
		cameraHUD.position.y = 60;
		cameraHUD.lookAt( new THREE.Vector3(0,0,0) );
	}

	var background, start, chomp, death, eat_ghost;
	function loadSounds()
	{
		background = new Audio("sounds/background.mp3");
		start = new Audio("sounds/pacman_beginning.wav");
		chomp = new Audio("sounds/pacman_chomp.wav");
		death = new Audio("sounds/pacman_death.wav");
		eat_ghost = new Audio("sounds/pacman_eatghost.wav");

		start.play();
		background.loop = true;
		background.play();
	}

	function render()
	{
		keys();
		calculate();

		displayHeader();

		requestAnimationFrame( render );

		renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
		renderer.render( scene, camera );

		rendererHUD.setScissorTest(true);
		rendererHUD.setViewport( 0, 0, rw, rh );
		rendererHUD.render( scene, cameraHUD );
	}

	function keys()
	{
		if( Key.isDown( Key.A ) )
		{
			camera.rotation.y += 0.05;
		}
		if( Key.isDown( Key.D ) )
		{
			camera.rotation.y -= 0.05;
		}
		if( Key.isDown( Key.Q ) )
		{
			camera.rotation.x += 0.05;
		}
		if( Key.isDown( Key.Z ) )
		{
			camera.rotation.x -= 0.05;
		}

		if( Key.isDown( Key.W ) )
		{
			var deltaX = Math.sin(camera.rotation.y)*.04;
			var deltaZ = Math.cos(camera.rotation.y)*.04;
			camera.position.x -= deltaX;
			camera.position.z -= deltaZ;
		}
		if( Key.isDown( Key.S ) )
		{
			var deltaX = Math.sin(camera.rotation.y)*.04;
			var deltaZ = Math.cos(camera.rotation.y)*.04;
			camera.position.x += deltaX;
			camera.position.z += deltaZ;
		}

		player.position.x = camera.position.x;
		player.position.z = camera.position.z;

		cameraHUD.position.x = player.position.x;
		cameraHUD.position.z = player.position.z;

		if ( Key.isDown(Key.SPACE) && jumping == false )
		{
			jumping = true;
			jumpTime = new Date().getTime();
		}
	}

	function calculate()
	{
		var z = player.position.z;
		var x = player.position.x;
		var standardZ = Math.floor(z);
		var standardX = Math.floor(x);
		var mapPlayerZ = standardZ + (board.length / 2);
		var mapPlayerX = standardX + (board[0].length / 2);

		if (board[mapPlayerZ][mapPlayerX] == 0) {
			player.position.y = 0;

			if (mapPlayerZ >= 0 && mapPlayerZ < board.length) {
				if (board[mapPlayerZ - 1][mapPlayerX] == 1) { //up
					if (Math.abs(standardZ - player.position.z) < .45) {
						player.position.z = standardZ + .45;
					}
				}
				if (board[mapPlayerZ + 1][mapPlayerX] == 1) { //down
					if (Math.abs(standardZ - player.position.z) > .45) {
						player.position.z = standardZ + .45;
					}
				}
			}
			if (mapPlayerX >= 0 && mapPlayerX < board[0].length) {
				if (board[mapPlayerZ][mapPlayerX - 1] == 1) { //left
					if (Math.abs(standardX - player.position.x) < .45) {
						player.position.x = standardX + .45;
					}
				}
				if (board[mapPlayerZ][mapPlayerX + 1] == 1) { //right
					if (Math.abs(standardX - player.position.x) > .45) {
						player.position.x = standardX + .45;
					}
				}
			}
		} else {
			player.position.y = .76;
		}

		if (jumping) {
			var elapsed = (new Date().getTime() - jumpTime) / 1000;
			if (elapsed > 2) {
				player.position.y = 0;
				jumping = false;
			} else {
				if (elapsed > 1) {
					player.position.y = 1.5 * (1 - (elapsed - 1));
				} else {
					player.position.y = 1.5 * (elapsed);
				}
			}
		}

		if ( player.position.x > 14 ) {
			player.position.x = -14;
		} else if ( player.position.x < -14 ) {
			player.position.x = 14;
		}

		camera.position.x = player.position.x;
		camera.position.y = player.position.y + .1;
		camera.position.z = player.position.z;

		for (var i = 0; i < candies.length; i++) {
			if (Math.sqrt(Math.pow(candies[i].position.x - player.position.x, 2) + Math.pow(candies[i].position.z - player.position.z, 2) + Math.pow(candies[i].position.y - player.position.y, 2)) <= .475) {
				scene.remove(candies[i]);
				candies.splice(i, 1);
				chomp.play();
				if (loser == false) {
					score++;
					if (candies.legth == 0) {
						result("WIN");
					}
				}
			}
		}

		for (var i = 0; i < ghosts.length; i++) {
			if (Math.sqrt(Math.pow(ghosts[i].position.x - player.position.x, 2) + Math.pow(ghosts[i].position.z - player.position.z, 2) + Math.pow(ghosts[i].position.y - player.position.y, 2)) <= .9) {
				death.play();
				player.position.x = 0;
				player.position.z = 0;
				camera.rotation.x = 0;
				camera.rotation.y = 0;
				camera.rotation.z = 0;
				camera.position.x = player.position.x;
				camera.position.y = player.position.y;
				camera.position.z = player.position.z;
				if (lives == 0) {
					result("LOSE");
					loser = true;
				} else {
					lives--;
				}
			}
		}

		moveGhosts();
	}

	function moveGhosts()
	{
		for (var i = 0; i < ghosts.length; i++) {
			if (ghostDirection[i] != 0) {
				if (ghostDirection[i] == 1) {
					ghosts[i].position.z -= .05;
				} else if (ghostDirection[i] == 2) {
					ghosts[i].position.x += .05;
				} else if (ghostDirection[i] == 3) {
					ghosts[i].position.z += .05;
				} else if (ghostDirection[i] == 4) {
					ghosts[i].position.x -= .05;
				}
			}

			var adjustedX = ghosts[i].position.x - .5;
			var adjustedZ = ghosts[i].position.z - .5;
			var remainderX = adjustedX - Math.floor(adjustedX);
			var remainderZ = adjustedZ - Math.floor(adjustedZ);

			if (remainderX < .0001 || remainderX > .9999 || remainderZ < .0001 || remainderZ > .9999) {
				var oldDirection = ghostDirection[i];
				ghostDirection[i] = 0;
				var z = ghosts[i].position.z;
				var x = ghosts[i].position.x;
				var standardZ = Math.floor(z);
				var standardX = Math.floor(x);
				var mapPlayerZ = standardZ + (board.length / 2);
				var mapPlayerX = standardX + (board[0].length / 2);

				while (ghostDirection[i] == 0) {
					if (board[mapPlayerZ - 1][mapPlayerX] == 0 && oldDirection != 3) { //up
						if (Math.floor(Math.random() * 4) + 1 == 1) {
							ghostDirection[i] = 1;
						}
					}
					if (board[mapPlayerZ + 1][mapPlayerX] == 0 && oldDirection != 1) { //down
						if (Math.floor(Math.random() * 4) + 1 == 1) {
							ghostDirection[i] = 3;
						}
					}
					if (board[mapPlayerZ][mapPlayerX - 1] == 0 && oldDirection != 2) { //left
						if (Math.floor(Math.random() * 4) + 1 == 1) {
							ghostDirection[i] = 4;
						}
					}
					if (board[mapPlayerZ][mapPlayerX + 1] == 0 && oldDirection != 4) { //right
						if (Math.floor(Math.random() * 4) + 1 == 1) {
							ghostDirection[i] = 2;
						}
					}
				}
			}
		}
	}

	var font;
	function loadFont() {
		var loader = new THREE.FontLoader();
		loader.load( 'fonts/helvetiker_bold.typeface.json', function ( response ) {
			font = response;
			displayHeader();
		} );
	}

	var headerObject = null;
	var lastScore = -1;
	var lastLives = -1;
	function displayHeader()
	{
		if (score != lastScore || lives != lastLives) {
			if( headerObject != null )
			{
				scene.remove( headerObject );
			}
			var headerObjectGeometry = new THREE.TextBufferGeometry( "Score: " + score + "    Lives: " + lives, {
				font: font,
				size: 1,
				height: .25,
				curveSegments: 4,
				material: 0,
				extrudeMaterial: 0,
				hover: 30
			});
			headerObjectGeometry.computeBoundingBox();
			headerObjectGeometry.computeVertexNormals();
			headerObject = new THREE.Mesh( headerObjectGeometry, new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) ) ;
			headerObject.position.x = -6;
			headerObject.position.y = 8;
			headerObject.position.z = -40;
			scene.add(headerObject);
			lastScore = score;
			lastLives = lives;
		}
	}

	var resultObject = null;
	function result(result)
	{
		if( resultObject != null )
		{
			scene.remove( resultObject );
		}
		var resultObjectGeometry = new THREE.TextBufferGeometry( "YOU " + result + "!!!", {
			font: font,
			size: 2,
			height: 1,
			curveSegments: 4,
			material: 0,
			extrudeMaterial: 0,
			hover: 30
		});
		resultObjectGeometry.computeBoundingBox();
		resultObjectGeometry.computeVertexNormals();
		resultObject = new THREE.Mesh( resultObjectGeometry, new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) ) ;
		resultObject.position.x = -7;
		resultObject.position.y = 5;
		resultObject.position.z = -40;
		scene.add(resultObject);
	}

	function setBrightness( value )
	{
		var i;
		for( i=1; i<=4; i++ )
		{
			var name = "SpotLight" + i;
			var light = scene.getObjectByName( name );
			light.intensity = value;
		}
	}

	var board = [
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
		[1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
		[1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
		[1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
		[1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
		[1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
		[1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1],
		[1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1],
		[1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
		[1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	];

	function addObjectsToScene()
	{
		var planeGeometry = new THREE.BoxGeometry(56, 1, 62);
		var planeTexture = THREE.ImageUtils.loadTexture('images/10125-v1.jpg');

		var planeMaterial = new THREE.MeshLambertMaterial( { map: planeTexture } );
		var groundPlane = new THREE.Mesh( planeGeometry, planeMaterial );
		groundPlane.name = "GroundPlane";
		groundPlane.position.y = -1;

		planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
    planeTexture.offset.set( 0, 0 );
    planeTexture.repeat.set( 20, 20 );

		scene.add( groundPlane );

		var x, z;
		var cubeGeometry = new THREE.BoxGeometry(1, .5, 1);
		var cubeTexture = THREE.ImageUtils.loadTexture('images/9353.jpg');
		var cubeMaterial = new THREE.MeshLambertMaterial( { map: cubeTexture } );

		var candyGeometry = new THREE.SphereGeometry(.05);
		var candyMaterial = new THREE.MeshLambertMaterial( { color: 'yellow' } );

		for (z = 0; z < board.length; z++) {
			for (x = 0; x < board[z].length; x++) {
				var trueX = (x - (board[z].length / 2)) + .5;
				var trueZ = (z - (board.length / 2)) + .5;
				if (board[z][x] == 1) {
					var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
					cube.position.x = trueX;
					cube.position.z = trueZ;
					scene.add( cube );
				} else {
					if (true) {
						var candy = new THREE.Mesh(candyGeometry, candyMaterial);
						candy.position.x = trueX;
						candy.position.z = trueZ;
						candies.push( candy );
						scene.add( candy );
					}
				}
			}
		}
	}

	function setupSpotlight(x,z,color,number)
	{
		spotLight = new THREE.SpotLight( color, 12, 300, 1, 0, 0 );
    spotLight.position.set( x, 100, z );
		spotLight.target.position.set( x,0,z);
		spotLight.name = "SpotLight"+number;
    scene.add(spotLight);
	}

	//modal
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
