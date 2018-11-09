//constants
var GAME_WIDTH = 800;
var GAME_HEIGHT = 600;
var PIXEL_SIZE = 6;

//important global variables
var player = {};
var gui = {};
var tiles = {};//only has non-solid tiles
var solidTiles = {};
var projectiles = {};
var characters = {};
var sceneManager = {};
var mousePolygon = {};
var groundAreaManager = {};

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
FRAME.loadImage("assets/img/tiles/shrub1.png", "shrub1");
FRAME.loadImage("assets/img/tiles/shrub2.png", "shrub2");
FRAME.loadImage("assets/img/tiles/shrub3.png", "shrub3");
FRAME.loadImage("assets/img/tiles/shrub4.png", "shrub4");
FRAME.loadImage("assets/img/tiles/fence.png", "fence");
FRAME.loadImage("assets/img/coin.png", "coin");

FRAME.loadImage("assets/img/weapons/sword/idle.png", "sword");
FRAME.loadImage("assets/img/weapons/sword/idleWhite.png", "swordWhite");
FRAME.loadImage("assets/img/weapons/spear/idle.png", "spear");
FRAME.loadImage("assets/img/weapons/spear/idleWhite.png", "spearWhite");
FRAME.loadImage("assets/img/armor/1.png", "armor1");
FRAME.loadImage("assets/img/armor/2.png", "armor2");

FRAME.loadImage("assets/img/enemies/bee.png", "bee");
FRAME.loadImage("assets/img/enemies/beeRed.png", "beeRed");
FRAME.loadImage("assets/img/enemies/ghost1.png", "ghost1");
FRAME.loadImage("assets/img/enemies/ghost2.png", "ghost2");
FRAME.loadImage("assets/img/enemies/fireball.png", "fireball");
FRAME.loadImage("assets/img/enemies/spiker.png", "spiker");
FRAME.loadImage("assets/img/enemies/spike.png", "spike");

FRAME.loadImage("assets/img/floppyDisk.png", "floppyDisk");
FRAME.loadImage("assets/img/market.png", "market");
FRAME.loadImage("assets/img/fittingRoom.png", "fittingRoom");
FRAME.loadImage("assets/img/arena.png", "arena");
FRAME.loadImage("assets/img/dungeon.png", "dungeon");
FRAME.loadImage("assets/img/arrow.png", "arrow");

FRAME.loadImage("assets/img/heart.png", "heart");
FRAME.loadImage("assets/img/heartBlack.png", "heartBlack");
FRAME.loadImage("assets/img/shield.png", "shield");
FRAME.loadImage("assets/img/shieldBlack.png", "shieldBlack");

//npc images
for (var i = 1; i <= 6; i++) {
	for (var j = 1; j <= 2; j++) {
		FRAME.loadImage("assets/img/npc/"+i+"/walk"+j+".png", "npc"+i+"walk"+j);
	}
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

function showTree(tree) {
	gui.showTree(tree);
}

//area ground settings
function initAreaGrounds() {
	groundAreaManager = new GroundAreaManager();
	
	groundAreaManager.addGroundArea(new FirstGroundArea());
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
	for (var t = 0; t < num; t++) {
		if (isSolid) {
			solidTiles.add(new obj(Math.sin((seed+0.6)*t)*(w/2) + x, Math.cos(seed*t)*(h/2) + y));
		}
		else {
			tiles.add(new obj(Math.sin((seed+0.6)*t)*(w/2) + x, Math.cos(seed*t)*(h/2) + y));
		}
	}
}