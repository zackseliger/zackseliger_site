//globals
var GAME_WIDTH = 1920;
var GAME_HEIGHT = 1080;
var TILE_SPACING = 200;
var TILE_SIZE = 140;
var ROWS = 8;
var COLS = 8;
FRAME.loadImage("assets/1.png", "tile1");
FRAME.loadImage("assets/2.png", "tile2");
FRAME.loadImage("assets/3.png", "tile3");
FRAME.loadImage("assets/4.png", "tile4");
FRAME.loadImage("assets/5.png", "tile5");
FRAME.loadImage("assets/6.png", "tile6");
FRAME.loadImage("assets/7.png", "tile7");
FRAME.loadImage("assets/grid.png", "grid");

function getXIndexValue(x) {
	return (Math.round(x)/TILE_SPACING + (ROWS-1)/2);
}
function getYIndexValue(y) {
	return (Math.round(y)/TILE_SPACING + (COLS-1)/2);
}
function getXCoordValue(x) {
	return (x*TILE_SPACING-(TILE_SPACING/2*(ROWS-1)));
}
function getYCoordValue(y) {
	return (y*TILE_SPACING-(TILE_SPACING/2*(COLS-1)));
}

class EmptyVisual extends GameObj {
	constructor() {
		super();
		this.position = {x: 0, y: 0};
		this.position.clone = function() {
			return new network.Vector2(this.x, this.y);
		}
		this.width = 0;
		this.height = 0;
	}
	update() {}
	render() {}
}

class Leaderboard extends Actor {
	constructor() {
		super();
	}
}

class Tile extends Actor {
	constructor(x,y,type=-1) {
		super(x, -GAME_HEIGHT*2);
		this.alpha = 1.0;
		this.type = type;
		this.moused = false;
		this.image = FRAME.getImage("tile" + (this.type+1));
		this.normalHeight = TILE_SIZE;
		this.normalWidth = TILE_SIZE;
		this.width = this.normalWidth;
		this.height = this.normalHeight;
		this.xOffset = 0;
		this.yOffset = 0;
		this.targetX = getXIndexValue(x);
		this.targetY = getYIndexValue(y);
	}
	update() {
		if (checkCollision(mouse, this)) {
			this.moused = true;
			this.width += (this.normalWidth*1.4 - this.width) * 0.1;
			this.height += (this.normalHeight*1.4 - this.height) * 0.1;
		}
		else {
			this.moused = false;
			this.width += (this.normalWidth - this.width) * 0.1;
			this.height += (this.normalHeight - this.height) * 0.1;
		}
		this.x += (getXCoordValue(this.targetX) - this.x) * 0.1;
		this.y += (getYCoordValue(this.targetY) - this.y) * 0.1;
	}
	render() {
		if (this.type < 0) {
			this.ctx.fillStyle = "#37B";
			this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
			return;
		}
		this.ctx.globalAlpha = this.alpha;
		this.ctx.drawImage(this.image, -this.width/2+this.xOffset, -this.height/2+this.yOffset, this.width, this.height);
		this.ctx.globalAlpha = 1.0;
	}
	offset(x,y) {
		this.xOffset = x;
		this.yOffset = y;
	}
}

class Grid extends Actor {
	constructor(rows, cols) {
		super();
		this.score = 0;
		this.rows = rows;
		this.cols = cols;
		this.selectedTile = null;
		this.tiles = [];
		for (var x = 0; x < this.cols; x++) {
			this.tiles.push([]);
			this.tiles.push([]);
			for (var y = 0; y < this.rows; y++) {
				this.tiles[x].push([]);
				this.addTile(x, y, -1);
			}
		}
	}
	update() {
		//find selected tile
		for (var x = 0; x < this.cols; x++) {
			for (var y = 0; y < this.rows; y++) {
				this.tiles[x][y].update();
				if (this.tiles[x][y].type == -1) {
					var respawnType = this.tiles[x][y].respawnType;
					this.tiles[x].splice(y, 1);
					this.tiles[x].unshift(new Tile(getXCoordValue(x),0,respawnType));
					this.tiles[x][0].targetX = x;
					this.tiles[x][0].targetY = 0;
					for (var x2 = 0; x2 < this.cols; x2++) {
						for (var y2 = 0; y2 < this.rows; y2++) {
							this.tiles[x2][y2].targetX = x2;
							this.tiles[x2][y2].targetY = y2;
						}
					}
				}
				if (this.selectedTile == null && this.tiles[x][y].moused == true && mouse.clicking == true) {
					this.selectedTile = this.tiles[x][y];
				}
			}
		}
		
		//swap selected tile
		if (mouse.clicking == false && this.selectedTile != null) {
			if (Math.abs(this.selectedTile.xOffset) + Math.abs(this.selectedTile.yOffset) > TILE_SPACING/2) {
				var xIndex = getXIndexValue(this.selectedTile.x);
				var yIndex = getYIndexValue(this.selectedTile.y);
				var targetX = xIndex;
				var targetY = yIndex;
				if (this.selectedTile.xOffset > 0) targetX = xIndex + 1;
				else if (this.selectedTile.xOffset < 0) targetX = xIndex - 1;
				else if (this.selectedTile.yOffset > 0) targetY = yIndex + 1;
				else if (this.selectedTile.yOffset < 0) targetY = yIndex - 1;
				
				network.currentPackets.push({type: "swap", selectedTile: {x:xIndex, y:yIndex}, swapTile: {x:targetX, y:targetY}});
			}
			
			this.selectedTile.offset(0,0);
			this.selectedTile = null;
		}
		
		//move selected tile while mouse down
		if (this.selectedTile != null) {
			var xDisplacement = Math.abs(mouse.x - this.selectedTile.x);
			var yDisplacement = Math.abs(mouse.y - this.selectedTile.y);
			if (Math.abs(xDisplacement) > Math.abs(yDisplacement)) {
				var dis = Math.min(xDisplacement,TILE_SPACING);
				if (mouse.x - this.selectedTile.x < 0) dis *= -1;
				this.selectedTile.offset(dis, 0);
			}
			else {
				var dis = Math.min(yDisplacement,TILE_SPACING);
				if (mouse.y - this.selectedTile.y < 0) dis *= -1;
				this.selectedTile.offset(0, dis);
			}
		}
	}
	draw() {
		for (var x = 0; x < this.cols; x++) {
			for (var y = 0; y < this.rows; y++) {
				this.tiles[x][y].draw();
			}
		}
		if (this.selectedTile != null) this.selectedTile.draw();
	}
	addTiles(tiles) {
		for (var i = 0; i < tiles.length; i++) {
			this.addTile(tiles[i].x, tiles[i].y, tiles[i].type);
			this.tiles[tiles[i].x][tiles[i].y].respawnType = tiles[i].respawnType;
		}
	}
	addTile(x, y, type) {
		this.tiles[x][y] = new Tile(getXCoordValue(x), getYCoordValue(y), type);
	}
	swapTiles(tile1, tile2) {
		this.tiles[tile1.x][tile1.y].targetX = tile2.x;
		this.tiles[tile1.x][tile1.y].targetY = tile2.y;
		this.tiles[tile2.x][tile2.y].targetX = tile1.x;
		this.tiles[tile2.x][tile2.y].targetY = tile1.y;
		var tiles = this.getTilesArray();
		for (var i = 0; i < tiles.length; i++) {
			this.tiles[tiles[i].targetX][tiles[i].targetY] = tiles[i];
		}
	}
	getTilesArray() {
		var arr = [];
		for (var x = 0; x < this.cols; x++) {
			for (var y = 0; y < this.rows; y++) {
				arr.push(this.tiles[x][y]);
			}
		}
		return arr;
	}
}

//load images
window.onload = function() {
	network = new gameIO();
	FRAME.smoothing = true;
	FRAME.init(GAME_WIDTH, GAME_WIDTH, document.getElementById("canvas"));
	keyboard = new Keyboard();
	mouse = new Mouse();
	
	scoreText = new Text(-GAME_WIDTH/2+175,GAME_HEIGHT-225,"Score: 0","Arial","#222",50);
	var gridActor = new ImageActor(0,0,FRAME.getImage("grid"),3.13);
	mainCollection = new Collection();
	mainCollection.add(scoreText);
	mainCollection.add(gridActor);
	
	//types of packets
	network.addPacketType("addTiles", function(packet) {
		var obj = network.getObj(packet.id);
		obj.grid.addTiles(packet.tiles);
	});
	network.addPacketType("moveTiles", function(packet) {
		
	});
	network.addPacketType("swapTiles", function(packet) {
		var obj = network.getObj(packet.id);
		obj.grid.swapTiles(packet.tile1, packet.tile2);
	});
	network.addPacketType("changeScore", function(packet) {
		var obj = network.getObj(packet.id);
		obj.grid.score = packet.score;
		scoreText.text = "Score: " + obj.grid.score;
	});
	
	//types of objects
	network.addType(
		"player",
		function(obj, packet) {
			obj.visual = new EmptyVisual();
			obj.grid = new Grid(packet.grid.rows, packet.grid.cols);
			obj.grid.addTiles(packet.tiles);
			mainCollection.add(obj.grid);
		}, undefined, undefined,
		function (obj, packet) {
			mainCollection.remove(obj.grid);
		}
	);
}

function main() {
	FRAME.clearScreen();
	mouse.update();
	
	for (var i = 0; i < network.objects.length; i++) {
		if (network.me.id != -1 && network.objects[i].id != network.me.id) {
			mainCollection.remove(network.objects[i].grid);
		}
	}
	
	//update/draw things and camera
	mainCollection.update(0);
	mainCollection.draw();
	FRAME.x = window.innerWidth/2;
	FRAME.y = window.innerHeight/2;
	
	network.update();
	requestFrame(main);
}

function startGame() {
	document.getElementById("preGameGUI").style.visibility = "hidden";
	network.createSocket("wss://match-3---.herokuapp.com");
	//network.createSocket("ws://localhost:5000");
	network.currentPackets.push({
		type: "playerJoin",
		name: document.getElementById("name").value
	});
	main();
}

function checkCollision(obj1, obj2) {
	if (obj1.width === undefined) {obj1.width = 1;obj1.height = 1;}
	if (obj2.width === undefined) {obj2.width = 1;obj2.height = 1;}
	
	return (obj1.x - obj1.width/2 < obj2.x + obj2.width/2 &&
			obj1.x + obj1.width/2 > obj2.x - obj2.width/2 &&
			obj1.y - obj1.height/2 < obj2.y + obj2.height/2 &&
			obj1.y + obj1.height/2 > obj2.y - obj2.height/2);
}
