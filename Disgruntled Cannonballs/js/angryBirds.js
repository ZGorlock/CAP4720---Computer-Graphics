	var renderer;
	var scene;
	var camera;
	var spotLight;

	var groundPlane;
	var ball;
	var ballLaunched = false;

	var level = 1;
	var score = 0;
	var balls = 0;
	var ammo = 1;
	var cameraSelected = 1;

	Physijs.scripts.worker = 'libs/physijs_worker.js';
	Physijs.scripts.ammo = 'ammo.js';

	function init()
	{
		scene = new Physijs.Scene();
		scene.setGravity(new THREE.Vector3( 0, 0, -30 ));

		setupCamera();
		setupRenderer();
		addSpotLight();

		loadSounds();

		createGroundPlane();
		createCannon();

		loadLevel();

		createBall();

		document.body.appendChild( renderer.domElement );
		modal.style.display = "block";

		render();
	}

	function render()
	{
		scene.simulate();

		maintainCameraSelection();
		maintainAmmoSelection();

		maintainCannonElevationControls();
		maintainCannonRightLeft();

		maintainBallKeypresses();
		checkBallPosition();

		displayHeader();

		requestAnimationFrame( render );
		renderer.render( scene, camera );
	}

	var levelObject = null;
	var scoreObject = null;
	var ballsObject = null;
	var ammoObject = null;

	var oldLevel = -1;
	var oldScore = -1;
	var oldBalls = -1;
	var oldAmmo = -1;

	function displayHeader()
	{
			if(oldLevel != level)
			{
				if( levelObject != null )
				{
					scene.remove( levelObject );
				}

				var levelString = "Level: " + level;
				var levelObjectGeometry = new THREE.TextGeometry( levelString,
				{
					size: 10,
					height: 1,
					curveSegments: 10,
					bevelEnabled: false
				});
				var levelObjectMaterial = new THREE.MeshLambertMaterial({color:0x00FF00});
				levelObject = new THREE.Mesh( levelObjectGeometry, levelObjectMaterial );
				levelObject.position.x = -100;
				levelObject.position.y = 100;
				levelObject.position.z = 40;
				levelObject.rotation.x = 60 * Math.PI / 180;
				scene.add( levelObject );

				oldLevel = level;
			}

			if (oldScore != score)
			{
				if ( scoreObject != null )
				{
					scene.remove( scoreObject );
				}

				var scoreString = "Score: " + score;
				var scoreObjectGeometry = new THREE.TextGeometry( scoreString,
				{
					size: 10,
					height: 1,
					curveSegments: 10,
					bevelEnabled: false
				});
				var scoreObjectMaterial = new THREE.MeshLambertMaterial({color:0x00FF00});
				scoreObject = new THREE.Mesh( scoreObjectGeometry, scoreObjectMaterial );
				scoreObject.position.x = -30;
				scoreObject.position.y = 100;
				scoreObject.position.z = 40;
				scoreObject.rotation.x = 60 * Math.PI / 180;
				scene.add( scoreObject );

				oldScore = score;
			}

			if (oldBalls != balls)
			{
				if( ballsObject != null )
				{
					scene.remove( ballsObject );
				}

				var ballsString = "Balls: " + balls;
				var ballsObjectGeometry = new THREE.TextGeometry( ballsString,
				{
					size: 10,
					height: 1,
					curveSegments: 10,
					bevelEnabled: false
				});
				var ballsObjectMaterial = new THREE.MeshLambertMaterial({color:0x00FF00});
				ballsObject = new THREE.Mesh( ballsObjectGeometry, ballsObjectMaterial );
				ballsObject.position.x = 50;
				ballsObject.position.y = 100;
				ballsObject.position.z = 40;
				ballsObject.rotation.x = 60 * Math.PI / 180;
				scene.add( ballsObject );

				oldBalls = balls;
			}

			if (oldAmmo != ammo)
			{
				if ( ammoObject != null )
				{
					scene.remove( ammoObject );
				}

				var ammoName;
				if (ammo == 1)
				{
					ammoName = "Cannonballs";
				}
				else if (ammo == 2)
				{
					ammoName = "Fast Cannonballs";
				}
				else if (ammo == 3)
				{
					ammoName = "Heavy Cannonballs"
				}

				var ammoString = "Ammo: " + ammoName;
				var ammoObjectGeometry = new THREE.TextGeometry( ammoString,
				{
					size: 4,
					height: 1,
					curveSegments: 10,
					bevelEnabled: false
				});
				var ammoObjectMaterial = new THREE.MeshLambertMaterial({color:0x00FF00});
				ammoObject = new THREE.Mesh( ammoObjectGeometry, ammoObjectMaterial );
				ammoObject.position.x = -80;
				ammoObject.position.y = -100;
				ammoObject.position.z = 10;
				ammoObject.rotation.x = 60 * Math.PI / 180;
				scene.add( ammoObject );

				oldAmmo = ammo;
			}
	}

	function createGroundPlane()
	{
		var planeMaterial = new Physijs.createMaterial(new THREE.MeshLambertMaterial({color:'white'}), .4, .8 );
		var planeGeometry = new THREE.PlaneGeometry( 200, 200, 6 );
		groundPlane = new Physijs.BoxMesh( planeGeometry, planeMaterial, 0 );
		groundPlane.name = "GroundPlane";

		scene.add( groundPlane );
	}

	function loadLevel()
	{
		if (level == 1)
		{
				var texture = THREE.ImageUtils.loadTexture('images/blue.jpg');
				var planeMaterial = new Physijs.createMaterial(new THREE.MeshLambertMaterial({map:texture}), .4, .8 );
				groundPlane.material = planeMaterial;
				blue.loop = true;
				blue.play();
		}
		else if (level == 2)
		{
				var texture = THREE.ImageUtils.loadTexture('images/green.jpg');
				var planeMaterial = new Physijs.createMaterial(new THREE.MeshLambertMaterial({map:texture}), .4, .8 );
				groundPlane.material = planeMaterial;
				blue.pause();
				green.loop = true;
				green.play();
		}
		else if (level == 3)
		{
				var texture = THREE.ImageUtils.loadTexture('images/yellow.jpg');
				var planeMaterial = new Physijs.createMaterial(new THREE.MeshLambertMaterial({map:texture}), .4, .8 );
				groundPlane.material = planeMaterial;
				green.pause();
				yellow.loop = true;
				yellow.play();
		}
		else if (level == 4)
		{
				var texture = THREE.ImageUtils.loadTexture('images/red.jpg');
				var planeMaterial = new Physijs.createMaterial(new THREE.MeshLambertMaterial({map:texture}), .4, .8 );
				groundPlane.material = planeMaterial;
				yellow.pause();
				red.loop = true;
				red.play();
		}

		createTarget();
	}

	function createCannon()
	{
		var cylinderGeometry = new THREE.CylinderGeometry( 3, 3, 16 );
		var cylinderMaterial = new THREE.MeshLambertMaterial({map:THREE.ImageUtils.loadTexture("images/gunmetal.png")});
		var can = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
		can.position.y = -5;
		cannon = new THREE.Object3D();
		cannon.add( can );

		cannon.rotation.x = Math.PI;
		cannon.position.x -= 0;
		cannon.position.y -= 84;
		cannon.position.z += 20;
		cannon.name = "CannonBall";
		scene.add( cannon );


		var wheelGeometry = new THREE.CylinderGeometry( 5, 5, 2 );
		var wheelMaterial = new THREE.MeshLambertMaterial({map:THREE.ImageUtils.loadTexture("images/gunmetal.png")});

		wheel1 = new THREE.Mesh( wheelGeometry, wheelMaterial );
		wheel1.position.x += 4;
		wheel1.position.y -= 84;
		wheel1.position.z += 16;
		wheel1.rotation.z = Math.PI / 2;
		wheel1.name = 'Wheel1';

		wheel2 = new THREE.Mesh( wheelGeometry, wheelMaterial );
		wheel2.position.x -= 4;
		wheel2.position.y -= 84;
		wheel2.position.z += 16;
		wheel2.rotation.z = Math.PI / 2;
		wheel2.name = 'Wheel2';

		scene.add( wheel1 );
		scene.add( wheel2 );
	}

	function maintainCannonElevationControls()
	{
		if( Key.isDown(Key.W))
		{
			cannon.rotation.x += 0.01;
			if( cannon.rotation.x > ( 5 * Math.PI / 4 ) )
			{
				cannon.rotation.x = ( 5 * Math.PI / 4 );
			}
		}
		if( Key.isDown(Key.S))
		{
			cannon.rotation.x -= 0.01;
			if( cannon.rotation.x < ( 7 * Math.PI / 8 ) )
			{
				cannon.rotation.x = ( 7 * Math.PI / 8 );
			}
		}
	}

	function maintainCannonRightLeft()
	{
		if( Key.isDown(Key.A))
		{
			cannon.rotation.z -= 0.01;
			if ( cannon.rotation.z < -( Math.PI / 4 ) ) {
				cannon.rotation.z = -( Math.PI / 4 );
			}
		}
		if( Key.isDown(Key.D))
		{
			cannon.rotation.z += 0.01;
			if ( cannon.rotation.z > ( Math.PI / 4 ) ) {
				cannon.rotation.z = ( Math.PI / 4 );
			}
		}
	}

	function maintainBallKeypresses()
	{
		if( ballLaunched == false && Key.isDown(Key.SPACE) )
		{
			ballLaunched = true;
			createBall();
			balls += 1;
			scene.add( ball );
			ball.applyCentralImpulse( new THREE.Vector3( cannon.rotation.z * 8000, 8000, -(Math.PI - cannon.rotation.x) * 8000));
			fire.pause();
			fire.currentTime = 0;
			fire.play();
		}
		if( ballLaunched && Key.isDown(Key.L) )
		{
			ballLaunched = false;
			scene.remove( ball );
			load.pause();
			load.currentTime = 0;
			load.play();
		}
	}

	function createBall()
	{
		var ballGeometry;
		if (ammo == 1)
		{
			ballGeometry = new THREE.SphereGeometry( 3 );
		}
		else if (ammo == 2)
		{
			ballGeometry = new THREE.SphereGeometry( 2 );
		}
		else if (ammo == 3)
		{
			ballGeometry = new THREE.SphereGeometry( 4 );
		}

		var ballMaterial = Physijs.createMaterial( new THREE.MeshLambertMaterial({map:THREE.ImageUtils.loadTexture("images/gunmetal.png")}), .95, .95 );
		ball = new Physijs.SphereMesh( ballGeometry, ballMaterial );

		ball.position.x = cannon.position.x + Math.sin(cannon.rotation.z) * 16;
		ball.position.y = cannon.position.y + Math.cos(cannon.rotation.z) * 16;
		ball.position.z = cannon.position.z - Math.cos((Math.PI / 2) - cannon.rotation.x) * 16;

		ball.name = 'CannonBall';

		ball.addEventListener( 'collision', function( other_object, linear_velocity, angular_velocity )
		{
			if( other_object.name != "GroundPlane" )
			{
				if (other_object.name == "TargetBall")
				{
					hit_orb.play();
					score += 1;
				}
				else
				{
					hit.play();
					score += 1;
				}
			}
		});
	}

	var targetlist = [];
	var smshlist = [];
	function createTarget()
	{
		for (var i = 0; i < targetlist.length; i++) {
			scene.remove(targetlist[i]);
		}
		for (var i = 0; i < smshlist.length; i++) {
			scene.remove(smshlist[i]);
		}
		targetlist = [];
		smshlist = [];

		var factory = new Factory();

		if (level == 1)
		{
			for( var i=0; i<4; i++ )
			{
				var msh;
				switch( i )
				{
					case 0: msh = factory.createBlock(4, 4, 12, 0, 70, 6); break;
					case 1: msh = factory.createBlock(4, 4, 12, 5, 75, 6); break;
					case 2: msh = factory.createBlock(4, 4, 12, 0, 80, 6); break;
					case 3: msh = factory.createBlock(4, 4, 12, -5, 75, 6); break;
				}
				targetlist.push( msh );
				scene.add( msh );
			}

			var smshe = factory.createOrb(5, 0, 75, 16);
			smshlist.push( smshe );
			scene.add( smshe );

		}
		else if (level == 2)
		{
			for (var j=0; j<2; j++)
			{
				for( var i=0; i<4; i++ )
				{
					var msh;
					switch( i )
					{
						case 0: msh = factory.createBlock(4, 4, 6, -40 + (80 * j) + 8, 85, 3); break;
						case 1: msh = factory.createBlock(4, 4, 6, -40 + (80 * j), 93, 3); break;
						case 2: msh = factory.createBlock(4, 4, 6, -40 + (80 * j) - 8, 85, 3); break;
						case 3: msh = factory.createBlock(4, 4, 6, -40 + (80 * j), 85, 3); break;
					}
					targetlist.push( msh );
					scene.add( msh );
				}

				var smshe = factory.createOrb(5, -40 + (80 * j), 85, 11);
				smshlist.push( smshe );
				scene.add( smshe );
			}
		}
		else if (level == 3)
		{
			for (var j=0; j<2; j++)
			{
				for( var i=0; i<3; i++ )
				{
					var msh;
					switch( i )
					{
						case 0: msh = factory.createBlock(4, 4, 6, -30 + (60 * j) + 8, 85, 3); break;
						case 1: msh = factory.createBlock(4, 4, 6, -30 + (60 * j) - 8, 85, 3); break;
						case 2: msh = factory.createBlock(4, 4, 6, -30 + (60 * j), 85, 3); break;
					}
					targetlist.push( msh );
					scene.add( msh );
				}

				var smshe = factory.createOrb(5, -30 + (60 * j), 85, 11);
				smshlist.push( smshe );
				scene.add( smshe );
			}

			for( var i=0; i<4; i++ )
			{
				var msh;
				switch( i )
				{
					case 0: msh = factory.createBlock(4, 4, 12, 0, 70, 6); break;
					case 1: msh = factory.createBlock(4, 4, 12, 5, 75, 6); break;
					case 2: msh = factory.createBlock(4, 4, 12, 0, 80, 6); break;
					case 3: msh = factory.createBlock(4, 4, 12, -5, 75, 6); break;
				}
				targetlist.push( msh );
				scene.add( msh );
			}

			var smshe = factory.createOrb(5, 0, 75, 16);
			smshlist.push( smshe );
			scene.add( smshe );
		}
		else if (level == 4) {

				for (var j=0; j<2; j++)
				{
					for( var i=0; i<4; i++ )
					{
						var msh;
						switch( i )
						{
							case 0: msh = factory.createBlock(4, 4, 12, -40 + (80 * j) + 8, 85, 6); break;
							case 1: msh = factory.createBlock(4, 4, 12, -40 + (80 * j), 93, 6); break;
							case 2: msh = factory.createBlock(4, 4, 12, -40 + (80 * j) - 8, 85, 6); break;
							case 3: msh = factory.createBlock(4, 4, 12, -40 + (80 * j), 85, 6); break;
						}
						targetlist.push( msh );
						scene.add( msh );
					}

					var smshe = factory.createOrb(5, -40 + (80 * j), 85, 16);
					smshlist.push( smshe );
					scene.add( smshe );
				}

				for( var i=0; i<4; i++ )
				{
					var msh;
					switch( i )
					{
						case 0: msh = factory.createBlock(4, 4, 16, 0, 70, 8); break;
						case 1: msh = factory.createBlock(4, 4, 16, 5, 75, 8); break;
						case 2: msh = factory.createBlock(4, 4, 16, 0, 80, 8); break;
						case 3: msh = factory.createBlock(4, 4, 16, -5, 75, 8); break;
					}
					targetlist.push( msh );
					scene.add( msh );
				}

				for( var i=0; i<4; i++ )
				{
					var msh;
					switch( i )
					{
						case 0: msh = factory.createBlock(4, 4, 16, 10, 85, 8); break;
						case 1: msh = factory.createBlock(4, 4, 16, 10, 70, 8); break;
						case 2: msh = factory.createBlock(4, 4, 16, -10, 85, 8); break;
						case 3: msh = factory.createBlock(4, 4, 16, -10, 70, 8); break;
					}
					targetlist.push( msh );
					scene.add( msh );
				}

				var msh = factory.createBlock(14, 4, 4, 0, 75, 18);
				targetlist.push( msh );
				scene.add( msh );

				var smshe = factory.createOrb(5, 0, 75, 24);
				smshlist.push( smshe );
				scene.add( smshe );
		}
	}

	function Factory() {
		this.createBlock = function(w, h, l, x, y, z) {
			var geo = new THREE.BoxGeometry(w, h, l);
			var mat = Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'white'}), .95, .95);
			var msh = new Physijs.BoxMesh( geo, mat );
			msh.position.x = x;
			msh.position.y = y;
			msh.position.z = z;

			return msh;
		}

		this.createOrb = function(r, x, y, z) {
			var sg = new THREE.SphereGeometry( r );
			var sm;
			if (level == 1)
			{
				var sm = new Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'blue'}), .95, .95 );
			}
			else if (level == 2)
			{
				var sm = new Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'green'}), .95, .95 );
			}
			else if (level == 3)
			{
				var sm = new Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'yellow'}), .95, .95 );
			}
			else if (level == 4)
			{
				var sm = new Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'red'}), .95, .95 );
			}
			var smshe = new Physijs.SphereMesh( sg, sm );
			smshe.position.x = x;
			smshe.position.y = y;
			smshe.position.z = z;
			smshe.name = "TargetBall";
			smshe.addEventListener( 'collision', function( other_object, linear_velocity, angular_velocity )
			{
				if( other_object.name == "GroundPlane" )
				{
						score += 5;
				}
			});
			return smshe;
		}

	}

	var won = false;
	function checkBallPosition()
	{
		var pass = true;
		for (var i = 0; i < smshlist.length; i++) {
			if( smshlist[i].position.y <= 100 && smshlist[i].position.y >= -100 && smshlist[i].position.x <= 100 && smshlist[i].position.x >= -100)
			{
				pass = false;
			}
		}
		if (pass == true && won == false) {
			if (level == 4) {
				won = true;
				win.play();
				scene.remove(ball);
				ballLaunched = false;

				var winString = "You Win!";
				var winObjectGeometry = new THREE.TextGeometry( winString,
				{
					size: 16,
					height: 1,
					curveSegments: 10,
					bevelEnabled: false
				});
				var winObjectMaterial = new THREE.MeshLambertMaterial({color:0x00FF00});
				winObject = new THREE.Mesh( winObjectGeometry, winObjectMaterial );
				winObject.position.x = -50;
				winObject.position.y = 0
				winObject.position.z = 20;
				winObject.rotation.x = 60 * Math.PI / 180;
				scene.add( winObject );

			} else {
				level_up.play();
				level += 1;
				scene.remove(ball);
				ballLaunched = false;
				loadLevel();
			}
		}
	}

	var hitC = 0;
	function maintainCameraSelection()
	{
		if( Key.isDown( Key.C ) )
		{
			if ( hitC == 0 )
		 	{
				hitC = 1;
				cameraSelected += 1;
				if (cameraSelected > 3) {
					cameraSelected = 1;
				}

				if (cameraSelected == 1) {
					camera.position.x = 0;
					camera.position.y = -200;
					camera.position.z = 100;
				} else if (cameraSelected == 2) {
					camera.position.x = 0;
					camera.position.y = -180;
					camera.position.z = 50;
				} else if (cameraSelected == 3) {
					camera.position.x = 0;
					camera.position.y = -200;
					camera.position.z = 250;
				}
				camera.lookAt( scene.position );
			}
		} else {
			hitC = 0;
		}
	}

	var hitQ = 0;
	function maintainAmmoSelection()
	{
		if( Key.isDown( Key.Q ) )
		{
			if ( hitQ == 0 )
		 	{
				hitQ = 1;
				ammo += 1;
				if (ammo > 3) {
					ammo = 1;
				}
			}
		} else {
			hitQ = 0;
		}
	}

	function setupCamera()
	{
		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
		camera.position.x = 0;
		camera.position.y = -200;
		camera.position.z = 100;
		camera.lookAt( scene.position );
	}

	function setupRenderer()
	{
		renderer = new THREE.WebGLRenderer();
		//						color     alpha
		renderer.setClearColor( 0x000000, 1.0 );
		renderer.setSize( window.innerWidth - 20, window.innerHeight - 20 );
		renderer.shadowMapEnabled = true;
	}

	function addSpotLight()
	{
    spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 0, 0, 200 );
    spotLight.shadowCameraNear = 10;
    spotLight.shadowCameraFar = 100;
    spotLight.castShadow = true;
		spotLight.intensity = 3;
    scene.add(spotLight);
	}

	var blue, green, yellow, red, fire, load, hit, hit_orb, explosion, level_up, win;
	function loadSounds()
	{
		blue = new Audio("sounds/blue.mp3");
		green = new Audio("sounds/green.mp3");
		yellow = new Audio("sounds/yellow.mp3");
		red = new Audio("sounds/red.mp3");

		fire = new Audio("sounds/fire.mp3");
		load = new Audio("sounds/load.mp3");
		hit = new Audio("sounds/hit.mp3");
		hit_orb = new Audio("sounds/hit_orb.mp3");
		explosion = new Audio("sounds/explosion.mp3");

		level_up = new Audio("sounds/level_up.mp3");
		win = new Audio("sounds/win.mp3");
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
