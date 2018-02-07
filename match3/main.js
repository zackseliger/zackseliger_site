//globals
var GAME_WIDTH = 1920;
var GAME_HEIGHT = 1080;
var TILE_SPACING = 200;
var TILE_SIZE = 140;
FRAME.loadImage("assets/1.png", "tile1");
FRAME.loadImage("assets/2.png", "tile2");
FRAME.loadImage("assets/3.png", "tile3");
FRAME.loadImage("assets/4.png", "tile4");
FRAME.loadImage("assets/5.png", "tile5");
FRAME.loadImage("assets/6.png", "tile6");
FRAME.loadImage("assets/7.png", "tile7");
FRAME.loadImage("assets/grid.png", "grid");

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

class Tile extends Actor {
	constructor(x,y,type=-1) {
		super(x, y);
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
		this.targetX = x;
		this.targetY = y;
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
		this.x += (this.targetX - this.x) * 0.1;
		this.y += (this.targetY - this.y) * 0.1;
	}
	render() {
		if (this.type < 0) return;
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
				if (this.selectedTile == null && this.tiles[x][y].moused == true && mouse.clicking == true) {
					this.selectedTile = this.tiles[x][y];
				}
			}
		}
		
		//swap selected tile
		if (mouse.clicking == false && this.selectedTile != null) {
			if (Math.abs(this.selectedTile.xOffset) + Math.abs(this.selectedTile.yOffset) > TILE_SPACING/2) {
				var xIndex = this.getXIndexValue(this.selectedTile);
				var yIndex = this.getYIndexValue(this.selectedTile);
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
	changeTiles(tiles) {
		for (var x = 0; x < this.cols; x++) {
			for (var y = 0; y < this.rows; y++) {
				if (this.tiles[x][y].type != tiles[x][y].type) {
					var xVal = this.tiles[x][y].x;
					var yVal = this.tiles[x][y].y;
					this.addTile(x, y, tiles[x][y].type);
					this.tiles[x][y].targetX = xVal;
					this.tiles[x][y].targetY = yVal;
				}
			}
		}
	}
	addTile(x, y, type) {
		this.tiles[x][y] = new Tile(x*TILE_SPACING-(TILE_SPACING/2*(this.rows-1)), y*TILE_SPACING-(TILE_SPACING/2*(this.cols-1)), type);
	}
	getXIndexValue(tile) {
		return (Math.round(tile.x)/TILE_SPACING + (this.rows-1)/2);
	}
	getYIndexValue(tile) {
		return (Math.round(tile.y)/TILE_SPACING + (this.cols-1)/2);
	}
}

//load images
window.onload = function() {
	network = new gameIO();
	FRAME.smoothing = true;
	FRAME.init(GAME_WIDTH, GAME_WIDTH, document.getElementById("canvas"));
	keyboard = new Keyboard();
	mouse = new Mouse();
	
	var gridActor = new ImageActor(0,0,FRAME.getImage("grid"),3.13);
	mainCollection = new Collection();
	mainCollection.add(gridActor);
	
	//types of packets
	network.addPacketType("updateTiles", function(packet) {
		var obj = network.getObj(packet.id);
		obj.grid.changeTiles(packet.tiles);
	});
	
	//types of objects
	network.addType(
		"player",
		function(obj, packet) {
			obj.visual = new EmptyVisual();
			obj.grid = new Grid(packet.grid.rows, packet.grid.cols);
			obj.grid.changeTiles(packet.grid.tiles);
			mainCollection.add(obj.grid);
		}, undefined, undefined,
		function (obj, packet) {
			mainCollection.remove(obj.grid);
		}
	);
	
	network.createSocket("ws://match-3---.herokuapp.com");
	main();
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

function checkCollision(obj1, obj2) {
	if (obj1.width === undefined) {obj1.width = 1;obj1.height = 1;}
	if (obj2.width === undefined) {obj2.width = 1;obj2.height = 1;}
	
	return (obj1.x - obj1.width/2 < obj2.x + obj2.width/2 &&
			obj1.x + obj1.width/2 > obj2.x - obj2.width/2 &&
			obj1.y - obj1.height/2 < obj2.y + obj2.height/2 &&
			obj1.y + obj1.height/2 > obj2.y - obj2.height/2);
}
