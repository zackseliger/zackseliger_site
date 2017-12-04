var GAME_WIDTH = 1200;
var GAME_HEIGHT = 800;
FRAME.init(GAME_WIDTH, GAME_HEIGHT, document.getElementById("canvas"));

var keyboard = new Keyboard();
var mouse = new Mouse();
var timestep = new Timestep();

var PIXEL_SIZE = 7;

var PLAYER_SPEED = 5;

function checkSpecialCollision(obj1, obj2) {
	if (obj1.width === undefined) {
		obj1.width = 1;
		obj1.height = 1;
	}
	if (obj2.width === undefined) {
		obj2.width = 1;
		obj2.height = 1;
	}
	
	return (obj1.x - obj1.width/2 < obj2.x + obj2.width/2 &&
			obj1.x + obj1.width/2 > obj2.x - obj2.width/2 &&
			obj1.y - obj1.height < obj2.y &&
			obj1.y > obj2.y - obj2.height);
}

function checkCollision(obj1, obj2) {
	if (obj1.width === undefined) {
		obj1.width = 1;
		obj1.height = 1;
	}
	if (obj2.width === undefined) {
		obj2.width = 1;
		obj2.height = 1;
	}
	
	return (obj1.x - obj1.width/2 < obj2.x + obj2.width/2 &&
			obj1.x + obj1.width/2 > obj2.x - obj2.width/2 &&
			obj1.y - obj1.height/2 < obj2.y + obj2.height/2 &&
			obj1.y + obj1.height/2 > obj2.y - obj2.height/2);
}

function checkCoveredBy(obj1, obj2) {//if obj1 is inside obj2
	if (obj1.width === undefined) {
		obj1.width = 1;
		obj1.height = 1;
	}
	if (obj2.width === undefined) {
		obj2.width = 1;
		obj2.height = 1;
	}
	
	return (obj1.x - obj1.width/2 > obj2.x - obj2.width/2 &&
			obj1.x + obj1.width/2 < obj2.x + obj2.width/2 &&
			obj1.y - obj1.height/2 > obj2.y - obj2.height/2 &&
			obj1.y + obj1.height/2 < obj2.y + obj2.height/2);
}

function buildLevel(input) {
	bullets.clear();
	characters.clear();
	weapons.clear();
	tiles.clear();
	
	var lines = input.split("~");
	for (var i = 0; i < lines.length; i++) {
		param = lines[i].split(" ");
		if (param[0] == "p") {
			player.dead = false;
			player.putInRightHand(weapon);
			player.x = parseFloat(param[1]);
			player.y = parseFloat(param[2]);
			characters.add(player);
			if (player.inRightHand !== null) weapons.add(player.inRightHand);
		}
		else if (param[0] == "f") {
			floor = new FloorRect(parseFloat(param[1]), parseFloat(param[2]));
		}
		else if (param[0] == "c") {
			characters.add(new ChaserEnemy(parseFloat(param[1]), parseFloat(param[2])));
		}
		else if (param[0] == "pe") {
			characters.add(new ProximityEnemy(parseFloat(param[1]), parseFloat(param[2])));
		}
		else if (param[0] == "t") {
			tiles.add(new Tile(parseFloat(param[1]), parseFloat(param[2]), parseFloat(param[3]), parseFloat(param[4])));
		}
	}
}

////////////////////////
/////////IMAGES/////////
////////////////////////

FRAME.loadImage("assets/img/player/walk1.png", "playerWalk1");
FRAME.loadImage("assets/img/player/walk2.png", "playerWalk2");

FRAME.loadImage("assets/img/enemies/chaser/walk1.png", "chaserEnemyWalk1");
FRAME.loadImage("assets/img/enemies/chaser/walk2.png", "chaserEnemyWalk2");
FRAME.loadImage("assets/img/enemies/proximity/walk1.png", "proximityEnemyWalk1");
FRAME.loadImage("assets/img/enemies/proximity/walk2.png", "proximityEnemyWalk2");

FRAME.loadImage("assets/img/pistol.png", "pistol");
FRAME.loadImage("assets/img/coin.png", "coin");
FRAME.loadImage("assets/img/door.png", "door");