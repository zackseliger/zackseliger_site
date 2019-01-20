//constants
var GAME_WIDTH = 800;
var GAME_HEIGHT = 600;
var PIXEL_SIZE = 6;

//important global variables
var player = {};
var gui = {};
var specialThings = {};//literally just tutorial object
var tiles = {};//only has non-solid tiles
var solidTiles = {};
var projectiles = {};
var characters = {};
var sceneManager = {};
var mousePolygon = {};
var groundAreaManager = {};
var onScreenActors = {};
var arenaBattles = [];
var localStorageVar = "sav3dG4me";

//loading images
FRAME.loadImage("assets/img/bird_guy/walk1.png", "playerWalk1");
FRAME.loadImage("assets/img/bird_guy/walk2.png", "playerWalk2");
FRAME.loadImage("assets/img/mayor/idle1.png", "mayorIdle1");
FRAME.loadImage("assets/img/mayor/idle2.png", "mayorIdle2");

FRAME.loadImage("assets/img/tiles/road.png", "road1");
FRAME.loadImage("assets/img/tiles/road2.png", "road2");
FRAME.loadImage("assets/img/tiles/rock1.png", "rock1");
FRAME.loadImage("assets/img/tiles/rock2.png", "rock2");
FRAME.loadImage("assets/img/tiles/rock3.png", "rock3");
FRAME.loadImage("assets/img/tiles/shrubs/01.png", "shrub1type0");
FRAME.loadImage("assets/img/tiles/shrubs/02.png", "shrub2type0");
FRAME.loadImage("assets/img/tiles/shrubs/03.png", "shrub3type0");
FRAME.loadImage("assets/img/tiles/shrubs/04.png", "shrub4type0");
FRAME.loadImage("assets/img/tiles/shrubs/05.png", "shrub5type0");
FRAME.loadImage("assets/img/tiles/shrubs/11.png", "shrub1type1");
FRAME.loadImage("assets/img/tiles/shrubs/12.png", "shrub2type1");
FRAME.loadImage("assets/img/tiles/shrubs/13.png", "shrub3type1");
FRAME.loadImage("assets/img/tiles/shrubs/14.png", "shrub4type1");
FRAME.loadImage("assets/img/tiles/shrubs/21.png", "shrub1type2");
FRAME.loadImage("assets/img/tiles/shrubs/22.png", "shrub2type2");
FRAME.loadImage("assets/img/tiles/shrubs/23.png", "shrub3type2");
FRAME.loadImage("assets/img/tiles/shrubs/24.png", "shrub4type2");
FRAME.loadImage("assets/img/tiles/crown-wall.png", "arenaCrownWall");
FRAME.loadImage("assets/img/tiles/wall-small.png", "arenaTopWallSmall");
FRAME.loadImage("assets/img/tiles/wall.png", "arenaTopWall");
FRAME.loadImage("assets/img/tiles/side-wall.png", "arenaSideWall");
FRAME.loadImage("assets/img/tiles/gate.png", "arenaGate");
FRAME.loadImage("assets/img/tiles/fence.png", "fence");
FRAME.loadImage("assets/img/coin.png", "coin");
FRAME.loadImage("assets/img/tiles/flowers/1.png", "flower1");
FRAME.loadImage("assets/img/tiles/flowers/2.png", "flower2");
FRAME.loadImage("assets/img/tiles/flowers/3.png", "flower3");
FRAME.loadImage("assets/img/tiles/flowers/4.png", "flower4");
FRAME.loadImage("assets/img/tiles/flowers/5.png", "flower5");
FRAME.loadImage("assets/img/tiles/flowers/6.png", "flower6");

FRAME.loadImage("assets/img/weapons/sword/idle.png", "sword");
FRAME.loadImage("assets/img/weapons/sword/idleWhite.png", "swordWhite");
FRAME.loadImage("assets/img/weapons/spear/idle.png", "spear");
FRAME.loadImage("assets/img/weapons/spear/idleWhite.png", "spearWhite");
FRAME.loadImage("assets/img/weapons/bow/idle.png", "bow");
FRAME.loadImage("assets/img/weapons/bow/arrow.png", "bowArrow");
FRAME.loadImage("assets/img/armor/1.png", "armor1");
FRAME.loadImage("assets/img/armor/2.png", "armor2");

FRAME.loadImage("assets/img/enemies/bee.png", "bee");
FRAME.loadImage("assets/img/enemies/beeRed.png", "beeRed");
FRAME.loadImage("assets/img/enemies/ghost.png", "ghost");
FRAME.loadImage("assets/img/enemies/fireball.png", "fireball");
FRAME.loadImage("assets/img/enemies/spiker.png", "spiker");
FRAME.loadImage("assets/img/enemies/spike.png", "spike");
FRAME.loadImage("assets/img/enemies/chaser1.png", "chaser1");
FRAME.loadImage("assets/img/enemies/chaser2.png", "chaser2");
FRAME.loadImage("assets/img/enemies/chaser1cover.png", "chaser1cover");
FRAME.loadImage("assets/img/enemies/chaser2cover.png", "chaser2cover");
FRAME.loadImage("assets/img/enemies/imp1.png", "imp1");
FRAME.loadImage("assets/img/enemies/imp2.png", "imp2");
FRAME.loadImage("assets/img/enemies/imp1cover.png", "imp1cover");
FRAME.loadImage("assets/img/enemies/imp2cover.png", "imp2cover");
FRAME.loadImage("assets/img/enemies/crystal.png", "crystal");
FRAME.loadImage("assets/img/enemies/crystalCover.png", "crystalCover");
FRAME.loadImage("assets/img/enemies/bigGhost.png", "bigGhost");
FRAME.loadImage("assets/img/enemies/bigGhostCover.png", "bigGhostCover");

FRAME.loadImage("assets/img/floppyDisk.png", "floppyDisk");
FRAME.loadImage("assets/img/market.png", "market");
FRAME.loadImage("assets/img/fittingRoom.png", "fittingRoom");
FRAME.loadImage("assets/img/arena.png", "arena");
FRAME.loadImage("assets/img/arrow.png", "charArrow");
FRAME.loadImage("assets/img/dungeon.png", "dungeon");

FRAME.loadImage("assets/img/heart.png", "heart");
FRAME.loadImage("assets/img/heartBlack.png", "heartBlack");
FRAME.loadImage("assets/img/shield.png", "shield");
FRAME.loadImage("assets/img/shieldBlack.png", "shieldBlack");

//to save the game
function saveGame() {
	var saveState = {};
	saveState.money = player.money;
	saveState.xpos = player.x;
	saveState.ypos = player.y;
	saveState.shopList = player.shopList.getBoughtItemsAsString();
	saveState.maxHealth = player.maxHealth;
	saveState.health = player.health;
	saveState.armorHealth = player.armorHealth;
	saveState.currentGroundArea = groundAreaManager.getCurrentGroundArea();

	//weapons and armors
	saveState.weapon = "none";
	saveState.armor = "none";
	if (player.weapon != null) {
		scannerArray = player.shopList.getItems("weapon");
		for (let i = 0; i < scannerArray.length; i++) {
			if (player.weapon.constructor == scannerArray[i].className) {
				saveState.weapon = scannerArray[i].name;
			}
		}
	}
	if (player.armor != null) {
		scannerArray = player.shopList.getItems("armor");
		for (let i = 0; i < scannerArray.length; i++) {
			if (player.armor.constructor == scannerArray[i].className) {
				saveState.armor = scannerArray[i].name;
			}
		}
	}

	saveState = JSON.stringify(saveState);

	localStorage.setItem(localStorageVar, saveState);
	gui.flashSaveText();
}

//to load game state
function loadGame() {
	var saveState = localStorage.getItem(localStorageVar);
	if (saveState === null || saveState === undefined) {
		return false;
	}

	saveState = JSON.parse(saveState);

	player.money = saveState.money;
	player.x = saveState.xpos;
	player.y = saveState.ypos;
	//unlock shopList stuff
	player.shopList.buyItemsFromString(saveState.shopList);
	//equip weapon and armor
	if (saveState.weapon != "none") {
		scannerArray = player.shopList.getItems("weapon");
		for (let i = 0; i < scannerArray.length; i++) {
			if (scannerArray[i].name == saveState.weapon) {
				let a = new InventoryItem(scannerArray[i], 0, 0);
				a.equip(player);
			}
		}
	}
	if (saveState.armor != "none") {
		scannerArray = player.shopList.getItems("armor");
		for (let i = 0; i < scannerArray.length; i++) {
			if (scannerArray[i].name == saveState.armor) {
				let a = new InventoryItem(scannerArray[i], 0, 0);
				a.equip(player);
			}
		}
	}
	//health
	player.maxHealth = saveState.maxHealth;
	player.health = saveState.health;
	player.armorHealth = saveState.armorHealth;
	//ground area
	groundAreaManager.gotoGroundArea(saveState.currentGroundArea);
	return true;
}

//rgb to hex
function rgbToHex(r,g,b){
    var bin = r << 16 | g << 8 | b;
    return (function(h){
        return new Array(7-h.length).join("0")+h
    })(bin.toString(16).toUpperCase())
}

//functions
function checkAABBCollision(obj1, obj2) {
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

function checkSATCollision(poly1, poly2) {
	//make sure AABB's are colliding
	if (checkAABBCollision(poly1.getAABB(), poly2.getAABB()) == false) {
		return false;
	}

	//get points and all normal slopes
	var points1 = poly1.getPoints();
	var points2 = poly2.getPoints();
	var normalSlopes = [];

	//get all normal slopes from poly1
	//dont forget about first/last points
	normalSlopes.push(-(points1[0].x - points1[points1.length-1].x) / (points1[0].y - points1[points1.length-1].y));
	for (var i = 0; i < points1.length-1; i++) {
		var slope = -(points1[i].x - points1[i+1].x) / (points1[i].y - points1[i+1].y);
		normalSlopes.push(slope);
	}
	//now do the same for poly2
	normalSlopes.push(-(points2[0].x - points2[points2.length-1].x) / (points2[0].y - points2[points2.length-1].y));
	for (var i = 0; i < points2.length-1; i++) {
		var slope = -(points2[i].x - points2[i+1].x) / (points2[i].y - points2[i+1].y);
		normalSlopes.push(slope);
	}

	//now run through each slope, and find collisions on axis
	for (var i = 0; i < normalSlopes.length; i++) {
		//use mag to make unit vector on that slope
		var mag = Math.sqrt(1 + Math.pow(normalSlopes[i],2));
		var unitVec = [1/mag, normalSlopes[i]/mag];
		if (mag == Infinity) {
			unitVec[0] = 0;
			unitVec[1] = -1;
		}

		//find min and max projections of first polygon
		var min1 = points1[0].x*unitVec[0] + points1[0].y*unitVec[1];
		//console.log(unitVec[1]);
		var max1 = min1;
		for (var j = 1; j < points1.length; j++) {
			var testProj = points1[j].x*unitVec[0] + points1[j].y*unitVec[1];
			if (testProj < min1) min1 = testProj;
			else if (testProj > max1) max1 = testProj;
		}
		//find min and max projections of second polygon
		var min2 = points2[0].x*unitVec[0] + points2[0].y*unitVec[1];
		var max2 = min2;
		for (var j = 1; j < points2.length; j++) {
			var testProj = points2[j].x*unitVec[0] + points2[j].y*unitVec[1];
			if (testProj < min2) min2 = testProj;
			else if (testProj > max2) max2 = testProj;
		}

		//compare mins and maxes on axis, if they don't overlap, then there is no collision
		//in other words, this means a line can be drawn between the polygons
		if (min1 > max2 || min2 > max1) {
			return false;
		}
	}

	//if there cannot be a line draw between two polygons, they are colliding
	return true;
}

function renderOnScreenActors(collectionList) {
	onScreenActors.clear();
	var frameRect = {
		x: -FRAME.x/FRAME.scaleX,
		y: -FRAME.y/FRAME.scaleY,
		width: FRAME.canvas.width/FRAME.scaleX,
		height: FRAME.canvas.height/FRAME.scaleY
	}

	//define our own collection list if undefined
	if (collectionList == undefined) {
		collectionList = [tiles, solidTiles, projectiles, characters];
	}

	//only add on-screen actors from our collection list, in order
	collectionList.forEach(function(collection) {
		collection.objects.forEach(function(x) {
			if (checkAABBCollision(frameRect, x)) onScreenActors.add(x);
		});
	});
	onScreenActors.draw();
}

function showTree(tree) {
	gui.showTree(tree);
}

//for spawning things
function makeFenceBox(x,y,w,h) {
	var numX = Math.round(w/Fence.size());
	var numY = Math.round(h/Fence.size());
	var leftPoint = x - numX*Fence.size()/2;
	var topPoint = y - numY*Fence.size()/2;
	w = numX*Fence.size();
	h = numY*Fence.size();

	//x-axis
	for (var i = 0; i < numX; i++) {
		solidTiles.add(new Fence(leftPoint+i*Fence.size()+Fence.size()/2, topPoint, 0));
		solidTiles.add(new Fence(leftPoint+i*Fence.size()+Fence.size()/2, topPoint+h, 2));
	}

	//y axis
	for (var i = 0; i < numY; i++) {
		solidTiles.add(new Fence(leftPoint+w, topPoint+i*Fence.size()+Fence.size()/2, 1));
		solidTiles.add(new Fence(leftPoint, topPoint+i*Fence.size()+Fence.size()/2, 3));
	}
}

function makeRandomTiles(obj,x,y,w,h,num,seed) {
	var isSolid = (new obj()).solid;
	for (var t = 1; t < num+1; t++) {
		if (isSolid) {
			solidTiles.add(new obj(Math.sin((seed+0.6)*t)*(w/2) + x, Math.cos(seed*t)*(h/2) + y));
		}
		else {
			tiles.add(new obj(Math.sin((seed+0.6)*t)*(w/2) + x, Math.cos(seed*t)*(h/2) + y));
		}
	}
}

function randomInt(min, max, seed) {
	return Math.floor(Math.abs(Math.sin(seed)) * (max+1-min)) + min;
}

function setupArenaBattles() {
	var a = new ArenaBattle("Test");
	a.addSequence(new ArenaSequence(Bee, 25, 0, 0.2));
	a.addSequence(new ArenaSequence(Imp, 1, 0, 0.2));
	arenaBattles.push(a);

	a = new ArenaBattle("BIG GHOST");
	a.addSequence(new ArenaSequence(BigGhost, 1, 3, 0));
	a.addSequence(new ArenaSequence(Ghost, 5, 20, 0.5));
	arenaBattles.push(a);

	a = new ArenaBattle("Third");
	a.addSequence(new ArenaSequence(BigGhost, 1, 3, 0));
	a.addSequence(new ArenaSequence(Ghost, 5, 20, 0.5));
	arenaBattles.push(a);
}

function resetGame() {
	player.restart();
	arenaBattles = [];
	setupArenaBattles();
	groundAreaManager = new GroundAreaManager();
	groundAreaManager.addGroundArea(new FirstGroundArea());
	sceneManager.addScene("mainWorld", new MainWorldScene());
	sceneManager.addScene("shop", new ShopScene());
	sceneManager.addScene("inventory", new InventoryScene());
	sceneManager.addScene("arenaMenu", new ArenaMenuScene());
}
