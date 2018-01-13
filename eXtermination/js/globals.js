var GAME_WIDTH = 1200;
var GAME_HEIGHT = 800;
FRAME.init(GAME_WIDTH, GAME_HEIGHT, document.getElementById("canvas"));

var keyboard = new Keyboard();
var mouse = new Mouse();
var timestep = new Timestep();

var PIXEL_SIZE = 7;
var TILE_SIZE = 75;
var PLAYER_SPEED = 5;

//collision functions (we have a few)
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
function checkGunCollision(obj1, gun) {
	if (obj1.width === undefined) {
		obj1.width = 1;
		obj1.height = 1;
	}
	if (gun.width === undefined) {
		gun.width = 1;
		gun.height = 1;
	}
	
	return (obj1.x - obj1.width/2 < gun.x + gun.width &&
			obj1.x + obj1.width/2 > gun.x &&
			obj1.y - obj1.height/2 < gun.y &&
			obj1.y + obj1.height/2 > gun.y - gun.height);
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

//distance
function distBetween(obj1, obj2) {
	return Math.abs(obj1.x - obj2.x) + Math.abs(obj1.y - obj2.y);
}

//level-building functions
function buildLevel(input) {
	bullets.clear();
	characters.clear();
	weapons.clear();
	tiles.clear();
	
	var lines = input.split("~");
	for (var i = 0; i < lines.length; i++) {
		param = lines[i].split(" ");
		if (param[0] == "p") {
			player.reset();
			player.x = parseFloat(param[1]);
			player.y = parseFloat(param[2]);
			characters.add(player);
			if (player.inRightHand !== null) weapons.add(player.inRightHand);
		}
		else if (param[0] == "f") {
			floor = new FloorRect(parseFloat(param[1]), parseFloat(param[2]));
		}
		else if (param[0] == "ce") {
			characters.add(new ChaserEnemy(parseFloat(param[1]), parseFloat(param[2]), param[3]));
		}
		else if (param[0] == "pe") {
			characters.add(new ProximityEnemy(parseFloat(param[1]), parseFloat(param[2]), param[3]));
		}
		else if (param[0] == "re") {
			characters.add(new RandomEnemy(parseFloat(param[1]), parseFloat(param[2]), param[3]));
		}
		else if (param[0][1] == "w" || param[0] == "mgw") {
			var wep = weaponFromString(param[0]);
			wep.x = parseFloat(param[1]);
			wep.y = parseFloat(param[2]);
		}
		else if (param[0] == "t") {
			tiles.add(new Tile(parseFloat(param[1]), parseFloat(param[2]), parseFloat(param[3]), parseFloat(param[4])));
		}
	}
}
function randomLevel() {
	var level = "";
	var lines = Math.floor(Math.random() * 15) + 20;
	
	level += "p 0 0~";
	level += "f 2000 2000";
	for (var i = 0; i < lines; i++) {
		var rand = Math.random() * 100;
		if (rand < 50) {
			var randChar = Math.floor(Math.random() * 3 + 1);
			var character = "";
			if (randChar == 1) character = "ce";
			else if (randChar == 2) character = "pe";
			else if (randChar == 3) character = "re";
			var xpos = Math.random() * 2000 - 1000;
			var ypos = Math.random() * 2000 - 1000;
			while (Math.sqrt(Math.pow(xpos, 2) + Math.pow(ypos, 2)) < 500) {
				xpos = Math.random() * 2000 - 1000;
				ypos = Math.random() * 2000 - 1000;
			}
			
			level += character + " " + Math.floor(xpos) + " " + Math.floor(ypos) + "~";
		}
		else {
			var xpos = Math.random() * 2000 - 1000;
			var ypos = Math.random() * 2000 - 1000;
			while (Math.sqrt(Math.pow(xpos, 2) + Math.pow(ypos, 2)) < 500) {
				xpos = Math.random() * 2000 - 1000;
				ypos = Math.random() * 2000 - 1000;
			}
			level += "t " + Math.floor(xpos) + " " + Math.floor(ypos) + " " + Math.floor(Math.random() * 500 + 25) + " " + Math.floor(Math.random() * 500 + 25) + "~";
		}
	}

	return level;
}

//misc functions
function coinExists() {
	for (var i = 0; i < tiles.objects.length; i++) {
		if (tiles.objects[i].type == "coin") return true;
	}
	return false;
}
function weaponFromString(str) {
	var weapon = new EmptyGun();
	if (str == "pw") {
		weapon = new Gun();
	}
	else if (str == "sw") {
		weapon = new Shotgun();
	}
	else if (str == "mgw") {
		weapon = new Machinegun();
	}
	else if (str == "gw") {
		weapon = new GrenadeLauncher();
	}
	else if (str == "mw") {
		weapon = new Mine();
	}
	return weapon;
}

////////////////////////
/////////EDITOR/////////
////////////////////////
function editLevel(level) {
	buildLevel(level);
	currentLevel = level;
	manager.change("editor");
}
function editorBack() {
	inEditor = false;
	manager.change("menu");
}
function editorDelete() {
	if (tiles.objects.indexOf(editorSelected) != -1) {
		tiles.remove(editorSelected);
	}
	else if (characters.objects.indexOf(editorSelected) != -1 && editorSelected != player) {
		weapons.remove(editorSelected.inRightHand);
		characters.remove(editorSelected);
	}
	else if (weapons.objects.indexOf(editorSelected) != -1) {
		weapons.remove(editorSelected);
	}
}
function editorAdd() {
	var type = document.getElementById("type").value;
	document.getElementById("type").value = "";
	if (type == "t") tiles.add(new Tile());
	else if (type == "pe") characters.add(new ProximityEnemy());
	else if (type == "ce") characters.add(new ChaserEnemy());
	else if (type == "re") characters.add(new RandomEnemy());
	else if (type == "pw") weapons.add(new Gun());
	else if (type == "sw") weapons.add(new Shotgun());
	else if (type == "mgw") weapons.add(new Machinegun());
	else if (type == "gw") weapons.add(new GrenadeLauncher());
	else if (type == "mw") weapons.add(new Mine());
}
function editorSave() {
	var level = "";
	level += "f " + floor.width + " " + floor.height + "~";
	level += "p " + player.x + " " + player.y + "~";
	for (var i = 0; i < characters.objects.length; i++) {
		var type = characters.objects[i].type;
		if (type != "p" && type != "c") {
			level += type + " " + characters.objects[i].x + " " + characters.objects[i].y + " " + characters.objects[i].inRightHand.type + "~";
		}
	}
	for (var i = 0; i < tiles.objects.length; i++) {
		level += "t " + tiles.objects[i].x + " " + tiles.objects[i].y + " " + tiles.objects[i].width + " " + tiles.objects[i].height + "~";
	}
	for (var i = 0; i < weapons.objects.length; i++) {
		if (weapons.objects[i].owner == null) {
			level += weapons.objects[i].type + " " + weapons.objects[i].x + " " + weapons.objects[i].y + "~";
		}
	}
	
	currentLevel = level;
	return level;
}
function editorPlay() {
	FRAME.resize();
	buildLevel(editorSave());
	manager.change("fight");
}
function editorRandomize() {
	editLevel(randomLevel());
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
FRAME.loadImage("assets/img/enemies/random/walk1.png", "randomEnemyWalk1");
FRAME.loadImage("assets/img/enemies/random/walk2.png", "randomEnemyWalk2");

FRAME.loadImage("assets/img/weapons/pistol.png", "pistol");
FRAME.loadImage("assets/img/weapons/shotgun.png", "shotgun");
FRAME.loadImage("assets/img/weapons/machinegun.png", "machinegun");
FRAME.loadImage("assets/img/weapons/launcher.png", "launcher");
FRAME.loadImage("assets/img/weapons/mine.png", "mine");

FRAME.loadImage("assets/img/helmets/forest.png", "forestHelmet");
FRAME.loadImage("assets/img/helmets/headband.png", "headband");
FRAME.loadImage("assets/img/helmets/chainmail.png", "chainmailHelmet");

FRAME.loadImage("assets/img/torso/forest.png", "forestTorso");
FRAME.loadImage("assets/img/torso/sash.png", "sash");
FRAME.loadImage("assets/img/torso/chainmail.png", "chainmailTorso");

FRAME.loadImage("assets/img/smoke1.png", "smoke1");
FRAME.loadImage("assets/img/smoke2.png", "smoke2");
FRAME.loadImage("assets/img/coin.png", "coin");
FRAME.loadImage("assets/img/door.png", "door");
FRAME.loadImage("assets/img/tile.png", "tile");

////////////////////////
/////////SOUNDS/////////
////////////////////////
FRAME.loadSound("assets/audio/misc/boop.wav", "boop");
FRAME.loadSound("assets/audio/misc/hurt1.wav", "hurt1", false, 0.9);
FRAME.loadSound("assets/audio/misc/hurt2.wav", "hurt2", false, 0.9);
FRAME.loadSound("assets/audio/misc/hurt3.wav", "hurt3", false, 0.9);
FRAME.loadSound("assets/audio/ui/buy.wav", "buy");
FRAME.loadSound("assets/audio/ui/error.wav", "error");
FRAME.loadSound("assets/audio/ui/back.wav", "changeScene", false, 0.8);
FRAME.loadSound("assets/audio/ui/select.wav", "select");
FRAME.loadSound("assets/audio/ui/over.wav", "over", false, 0.7);
FRAME.loadSound("assets/audio/weapons/pistol1.wav", "pistol1");
FRAME.loadSound("assets/audio/weapons/pistol2.wav", "pistol2");
FRAME.loadSound("assets/audio/weapons/pistol3.wav", "pistol3");
FRAME.loadSound("assets/audio/weapons/shotgun1.wav", "shotgun1");
FRAME.loadSound("assets/audio/weapons/machinegun1.wav", "machinegun1");
FRAME.loadSound("assets/audio/weapons/machinegun2.wav", "machinegun2");
FRAME.loadSound("assets/audio/weapons/grenade.wav", "grenade");
FRAME.loadSound("assets/audio/weapons/minedrop.wav", "mineDrop");
FRAME.loadSound("assets/audio/weapons/swap.wav", "swap");