//globals
var GAME_WIDTH = 1920;
var GAME_HEIGHT = 1080;
var TILE_SPACING = 200;
var TILE_SIZE = 140;
var ROWS = 8;
var COLS = 8;
var playing = false;
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

class Leaderboard extends Actor {
	constructor() {
		super();
		this.players = [];
		this.playersText = [];
	}
	render() {
		for (var i = 0; i < this.playersText.length; i++) {
			this.playersText[i].draw();
		}
	}
	putPlayers(players) {
		this.players = players;
		this.playersText = [];
		for (var i = 0; i < Math.min(5,this.players.length); i++) {
			this.playersText[i] = new Text(0, 0+i*60, "", "Arial", "#FFF", 42, "right");
			this.playersText[i].text = (i+1)+"."+this.players[i].name+" - "+this.players[i].score;
		}
	}
}

class Tile extends Actor {
	constructor(x,y,type=-1) {
		super(0, -GAME_HEIGHT*2);
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
		this.parent = null;
		this.targetX = getXIndexValue(x);
		this.targetY = getYIndexValue(y);
	}
	update() {
		if (this.moused) {
			this.width += (this.normalWidth*1.4 - this.width) * 0.1;
			this.height += (this.normalHeight*1.4 - this.height) * 0.1;
			this.moused = false;
		}
		else {
			this.width += (this.normalWidth - this.width) * 0.1;
			this.height += (this.normalHeight - this.height) * 0.1;
		}
		this.x += (getXCoordValue(this.targetX)+this.xOffset+this.parent.x - this.x) * 0.1;
		this.y += (getYCoordValue(this.targetY)+this.yOffset - this.y) * 0.1;
	}
	render() {
		if (this.type < 0) {
			this.ctx.fillStyle = "#37B";
			this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
			return;
		}
		this.ctx.globalAlpha = this.alpha;
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
		this.ctx.globalAlpha = 1.0;
	}
	offset(x,y) {
		this.xOffset = x;
		this.yOffset = y;
	}
}

class TimerBar extends Actor {
	constructor(x, y) {
		super(x, y);
		this.width = 1000;
		this.height = 50;
		this.fillness = 1.0;
		this.targetValue = 1.0;
	}
	update() {
		this.fillness += (this.targetValue - this.fillness) * 0.1;
	}
	render() {
		this.ctx.lineWidth = this.height;
		this.ctx.lineCap = "round";
		
		//shadow
		this.ctx.strokeStyle = "#333";
		this.ctx.beginPath();
		this.ctx.moveTo(-this.width/2,0);
		this.ctx.lineTo(this.width/2,0);
		this.ctx.stroke();
		this.ctx.closePath();
		
		//bar
		this.ctx.strokeStyle = "#FE2253";
		this.ctx.beginPath();
		this.ctx.moveTo(-this.width/2*this.fillness,0);
		this.ctx.lineTo(this.width/2*this.fillness,0);
		this.ctx.stroke();
		this.ctx.closePath();
	}
	changeValue(perc) {
		if (perc < 0) return;
		this.targetValue = perc;
	}
}

class Grid extends Actor {
	constructor() {
		super();
		this.score = 0;
		this.name = "";
		this.rows = 8;
		this.cols = 8;
		this.selectedTile = null;
		this.canSwap = true;
		this.tiles = [];
		this.timer = 60.0;
		for (var x = 0; x < this.cols; x++) {
			this.tiles.push([]);
			this.tiles.push([]);
			for (var y = 0; y < this.rows; y++) {
				this.tiles[x].push([]);
				this.addTile(x, y, -1);
			}
		}
		this.gridBack = new ImageActor(0,0,FRAME.getImage("grid"),3.13);
		this.bar = new TimerBar(0,0);
		this.timerText = new Text(0,0,"Score: 0","Arial","#FFF",50, "center");
	}
	update() {
		if (this.netObj.tiles != undefined) {
			this.addTiles(this.netObj.tiles);
			this.netObj.tiles = undefined;
		}
		
		//timer stuff, changing text and bar
		this.timer -= GLUE.realTime/1000;
		this.timerText.text = Math.floor(this.timer*10)/10;
		this.timerText.y = -this.gridBack.height/2 - 100;
		this.bar.y = -this.gridBack.height/2 - 68;
		this.bar.changeValue(this.timer/60.0);
		this.bar.update();
		
		//collapse tiles and find selected tile
		for (var x = 0; x < this.cols; x++) {
			for (var y = 0; y < this.rows; y++) {
				this.tiles[x][y].update();
				if (this.tiles[x][y].type == -1) {
					var respawnType = this.tiles[x][y].respawnType;
					this.tiles[x].splice(y, 1);
					this.tiles[x].unshift(new Tile(getXCoordValue(x),0,respawnType));
					this.tiles[x][0].parent = this;
					this.tiles[x][0].x = this.x;
					this.tiles[x][0].targetX = x;
					this.tiles[x][0].targetY = 0;
					for (var x2 = 0; x2 < this.cols; x2++) {
						for (var y2 = 0; y2 < this.rows; y2++) {
							this.tiles[x2][y2].targetX = x2;
							this.tiles[x2][y2].targetY = y2;
						}
					}
				}
				if (player == this && this.selectedTile == null && checkCollision(mouse, this.tiles[x][y])) {
					if (mouse.clicking == true) {
						this.selectedTile = this.tiles[x][y];
					}
					this.tiles[x][y].moused = true;
				}
			}
		}
		
		if (this !== player) {
			return;
		}
		
		//swap selected tile
		if (mouse.clicking == false && this.selectedTile != null && this.canSwap) {
			if (Math.abs(this.selectedTile.xOffset) + Math.abs(this.selectedTile.yOffset) > TILE_SPACING/2) {
				var xIndex = this.selectedTile.targetX;
				var yIndex = this.selectedTile.targetY;
				var targetX = xIndex;
				var targetY = yIndex;
				if (this.selectedTile.xOffset > 0) targetX = xIndex + 1;
				else if (this.selectedTile.xOffset < 0) targetX = xIndex - 1;
				else if (this.selectedTile.yOffset > 0) targetY = yIndex + 1;
				else if (this.selectedTile.yOffset < 0) targetY = yIndex - 1;
				this.tiles[targetX][targetY].targetX = xIndex;
				this.tiles[targetX][targetY].targetY = yIndex;
				this.selectedTile.targetX = targetX;
				this.selectedTile.targetY = targetY;
				
				GLUE.sendPacket("swap", {selectedTile: {x:xIndex, y:yIndex}, swapTile: {x:targetX, y:targetY}});
				this.canSwap = false;
			}
			
			this.selectedTile.offset(0,0);
			this.selectedTile.moused = false;
			this.selectedTile = null;
		}
		
		//move selected tile while mouse down
		if (this.selectedTile != null) {
			this.selectedTile.moused = true;
			var xDisplacement = Math.abs(mouse.x - this.selectedTile.x+this.selectedTile.xOffset);
			var yDisplacement = Math.abs(mouse.y - this.selectedTile.y+this.selectedTile.yOffset);
			if (Math.abs(xDisplacement) > Math.abs(yDisplacement)) {
				var dis = Math.min(xDisplacement,TILE_SPACING*0.75);
				if (mouse.x - this.selectedTile.x+this.selectedTile.xOffset < 0) dis *= -1;
				this.selectedTile.offset(dis, 0);
			}
			else {
				var dis = Math.min(yDisplacement,TILE_SPACING*0.75);
				if (mouse.y - this.selectedTile.y+this.selectedTile.yOffset < 0) dis *= -1;
				this.selectedTile.offset(0, dis);
			}
			
			//making sure tiles on edges can't be dragged off
			if (this.selectedTile.targetX == 0 && this.selectedTile.xOffset < 0) {
				this.selectedTile.xOffset = 0;
			}
			else if (this.selectedTile.targetX == COLS-1 && this.selectedTile.xOffset > 0) {
				this.selectedTile.xOffset = 0;
			}
			if (this.selectedTile.targetY == 0 && this.selectedTile.yOffset < 0) {
				this.selectedTile.yOffset = 0;
			}
			else if (this.selectedTile.targetY == ROWS-1 && this.selectedTile.yOffset > 0) {
				this.selectedTile.yOffset = 0;
			}
		}
	}
	draw() {
		super.draw();
		for (var x = 0; x < this.cols; x++) {
			for (var y = 0; y < this.rows; y++) {
				this.tiles[x][y].draw();
			}
		}
		if (this.selectedTile != null) this.selectedTile.draw();
	}
	render() {
		this.bar.draw();
		this.timerText.draw();
		this.gridBack.draw();
	}
	addTiles(tiles) {
		for (var i = 0; i < tiles.length; i++) {
			this.addTile(tiles[i].x, tiles[i].y, tiles[i].type);
			this.tiles[tiles[i].x][tiles[i].y].respawnType = tiles[i].respawnType;
		}
	}
	addTile(x, y, type) {
		this.tiles[x][y] = new Tile(getXCoordValue(x), getYCoordValue(y), type);
		this.tiles[x][y].parent = this;
		this.tiles[x][y].x = this.x;
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
		this.canSwap = true;
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

window.onload = function() {
	FRAME.smoothing = true;
	FRAME.init(GAME_WIDTH, GAME_WIDTH, document.getElementById("canvas"));
	keyboard = new Keyboard();
	mouse = new Mouse();
	leaderboard = new Leaderboard();
	
	scoreText = new Text(-GAME_WIDTH/2+175,GAME_HEIGHT-225,"Score: 0","Arial","#FFF",50, "center");
	mainCollection = new Collection();
	mainCollection.add(scoreText);
	mainCollection.add(leaderboard);
	
	//networking
	playerID = -1;
	player = undefined;
	GLUE.init("wss://match3.herokuapp.com");
	GLUE.defineObject("g", Grid);
	
	//types of packets
	GLUE.addPacketFunction("addTiles", function(pack) {
		var obj = GLUE.getInstanceFromID(pack.id);
		obj.addTiles(pack.tiles);
	});
	GLUE.addPacketFunction("swapTiles", function(pack) {
		var obj = GLUE.getInstanceFromID(pack.id);
		obj.swapTiles(pack.tile1, pack.tile2);
	});
	GLUE.addPacketFunction("changeScores", function(pack) {
		var obj = GLUE.getInstanceFromID(pack.id);
		obj.score = pack.score;
		if (pack.id == playerID) {
			scoreText.text = "Score: " + pack.score;
		}
	});
	GLUE.addPacketFunction("leaderboard", function(pack) {
		leaderboard.putPlayers(pack.players);
		for (var i = 0; i < pack.players.length; i++) {
			var obj = GLUE.getInstanceFromID(pack.players[i].id);
			obj.x = 1920 * (pack.players.length - 1 - i);
		}
	});
	GLUE.addPacketFunction("i", function(pack) {
		playerID = pack.id;
		player = GLUE.getInstanceFromID(playerID);
	});
	GLUE.addPacketFunction("d", function(pack) {
		if (playerID == pack.id) {
			player = null;
			playerID = -1;
			document.getElementById("preGameGUI").style.visibility = "visible";
			scoreText.text = "";
			playing = false;
			leaderboard.putPlayers([]);
		}
	});
	GLUE.addPacketFunction("t", function(pack) {
		var obj = GLUE.getInstanceFromID(pack.id);
		obj.timer = pack.time;
	});
}

function main() {
	FRAME.clearScreen();
	mouse.update();
	
	leaderboard.x = (-FRAME.x + window.innerWidth - 200)/FRAME.scaleX;
	leaderboard.y = -window.innerHeight + 20;
	scoreText.x = (-FRAME.x + window.innerWidth/2)/FRAME.scaleX;
	
	for (var i = 0; i < GLUE.instances.length; i++) {
		GLUE.instances[i].update();
		GLUE.instances[i].draw();
	}
	
	//gui stuff
	//FRAME.x = window.innerWidth/2;
	if (player !== undefined && player !== null) {
		FRAME.x += (-player.x * FRAME.scaleX + window.innerWidth/2 - FRAME.x) * 0.05;
	}
	FRAME.y = window.innerHeight/2;
	mainCollection.update();
	mainCollection.draw();
	
	GLUE.update();
	if (playing)
		requestFrame(main);
}

function startGame() {
	document.getElementById("preGameGUI").style.visibility = "hidden";
	GLUE.sendPacket("j", {name: document.getElementById("name").value});
	playing = true;
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