//to make gameIO happy
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

//globals
var GAME_WIDTH = 1920;
var GAME_HEIGHT = 1080;
//arena crap
var ARENA_WIDTH = 5000;
var ARENA_HEIGHT = 5000;
var ARENA_X = 0;
var ARENA_Y = 0;
var GRID_SPACES = 50;
//misc
var controls = {up: false, down: false, left: false, right: false};
var gamePlaying = false;
FRAME.loadImage("assets/white.png", "white");
FRAME.loadImage("assets/star.png", "star");

class WhiteBack extends Actor {
	constructor() {
		super(ARENA_X, ARENA_Y);
	}
	update() {
		this.x = -FRAME.x;
		this.y = -FRAME.y;
		if (this.x < 0) this.x = 0;
		else if (this.x + window.innerWidth > ARENA_WIDTH) this.x = ARENA_WIDTH - window.innerWidth;
		if (this.y < 0) this.y = 0;
		else if (this.y + window.innerHeight > ARENA_HEIGHT) this.y = ARENA_HEIGHT - window.innerHeight;
	}
	render() {
		this.ctx.fillStyle = "#F6F6F6";
		this.ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
	}
}

class Grid extends Actor {
	constructor() {
		super(ARENA_X, ARENA_Y);
		this.prevFrameX = FRAME.x;
		this.prevFrameY = FRAME.y;
		this.offsetX = 0;
		this.offsetY = 0;
	}
	update() {
		this.x = -FRAME.x;
		this.y = -FRAME.y;
		this.offsetX -= this.prevFrameX - FRAME.x;
		this.offsetY -= this.prevFrameY - FRAME.y;
		while (this.offsetX > GRID_SPACES) this.offsetX -= GRID_SPACES;
		while (this.offsetX < -GRID_SPACES) this.offsetX += GRID_SPACES;
		while (this.offsetY > GRID_SPACES) this.offsetY -= GRID_SPACES;
		while (this.offsetY < -GRID_SPACES) this.offsetY += GRID_SPACES;
		this.x += this.offsetX;
		this.y += this.offsetY;
		
		this.prevFrameX = FRAME.x;
		this.prevFrameY = FRAME.y;
	}
	render() {
		this.ctx.strokeStyle = "#CCC";
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		for (var x = 0; x <= window.innerWidth; x += GRID_SPACES) {
			this.ctx.moveTo(x, -GRID_SPACES);
			this.ctx.lineTo(x, window.innerHeight+GRID_SPACES);
		}
		for (var y = 0; y <= window.innerHeight; y += GRID_SPACES) {
			this.ctx.moveTo(-GRID_SPACES, y);
			this.ctx.lineTo(window.innerWidth+GRID_SPACES, y);
		}
		this.ctx.stroke();
	}
}

class Ninja extends Actor {
	constructor(owner) {
		super();
		this.visual = owner.visual;
		this.image = FRAME.getImage("white");
		this.name = owner.name;
		this.nameText = new Text(0, -175, this.name+" (0)", "Arial", "#000", 42, "center");
		this.width = 100;
		this.height = 100;
		this.health = 100;
		this.numStars = 0;
		this.clicking = false;
	}
	update() {
		this.x = this.visual.position.x;
		this.y = this.visual.position.y;
		this.nameText.text = this.name+" ("+this.numStars+")";
	}
	render() {
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
		this.ctx.rotate(-this.rotation);
		this.nameText.draw();
		this.ctx.fillStyle = "rgba(41, 41, 41, 0.2)";
		this.ctx.fillRect(-this.width/2, -100, this.width, 20);
		this.ctx.fillStyle = "#22EE97";
		this.ctx.fillRect(-this.width/2, -100, this.width*(this.health/100), 20);
		this.ctx.rotate(this.rotation);
	}
}

class Star extends Actor {
	constructor(visual) {
		super();
		this.visual = visual;
		this.image = FRAME.getImage("star");
		this.width = 50;
		this.height = 50;
	}
	update() {
		this.x = this.visual.position.x;
		this.y = this.visual.position.y;
		this.rotation += 0.01;
	}
	render() {
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
	}
}

window.onload = function() {
	network = new gameIO();
	FRAME.init(GAME_WIDTH, GAME_HEIGHT, document.getElementById("canvas"));
	keyboard = new Keyboard();
	mouse = new Mouse();
	backgroundCollection = new Collection();
	starCollection = new Collection();
	playerCollection = new Collection();
	
	network.addType(
		"player",
		function( obj, packet ) {
			obj.visual = new EmptyVisual();
			obj.name = packet.name;
			obj.ninja = new Ninja(obj);
			playerCollection.add(obj.ninja);
		}, function (obj) {
			var prevRot = Math.round(obj.ninja.rotation * 100);
			if (obj.id != network.me.id) obj.ninja.rotation = obj.visual.rotation;
			else {
				obj.ninja.rotation = Math.atan2(mouse.x - obj.ninja.x, obj.ninja.y - mouse.y);
				if (Math.round(obj.ninja.rotation * 100) != prevRot) {
					network.currentPackets.push({type: "updateRotation", rot: obj.ninja.rotation});
				}
				if (obj.ninja.clicking != mouse.clicking) {
					obj.ninja.clicking = mouse.clicking
					network.currentPackets.push({type: "updateMouse", clicking: obj.ninja.clicking});
				}
			}
		}, 
		function (obj, packet) {
			obj.ninja.numStars = packet.numStars;
			obj.ninja.health = packet.health;
		},
		function (obj) {
			playerCollection.remove(obj.ninja);
		}
	);
	
	network.addType(
		"star",
		function( obj, packet ) {
			obj.visual = new EmptyVisual();
			obj.star = new Star(obj.visual);
			starCollection.add(obj.star);
		}, function (obj) {
			
		}, undefined,
		function (obj) {
			starCollection.remove(obj.star);
		}
	);
	
	network.addPacketType(
    "playerDie",
    function(packet) {
        endGame();
    }
);
}

function endGame() {
	backgroundCollection.clear();
	starCollection.clear();
	playerCollection.clear();
	gamePlaying = false;
	
	document.getElementById("preGameGUI").style.visibility = "visible";
	document.getElementById("canvas").style.visibility = "hidden";
}

function startGame() {
	backgroundCollection.add(new WhiteBack());
	backgroundCollection.add(new Grid());
	document.getElementById("preGameGUI").style.visibility = "hidden";
	document.getElementById("canvas").style.visibility = "visible";
	//network.createSocket("wss://ninjaa-io.herokuapp.com");
	network.createSocket("ws://localhost:5000");
	network.currentPackets.push({
		type: "playerJoin",
		name: document.getElementById("name").value
	});
	preMain();
}

function preMain() {
	network.update();
	
	if (network.me.id == -1) {
		requestFrame(preMain);
	}
	else {
		document.getElementById("canvas").style.backgroundColor = "#EEE";
		FRAME.x = (-network.me.visual.position.x)*FRAME.scaleX + window.innerWidth/2;
		FRAME.y = (-network.me.visual.position.y)*FRAME.scaleY + window.innerHeight/2;
		gamePlaying = true;
		main();
	}
}

function main() {
	FRAME.clearScreen();
	mouse.update();
	
	//camera
	FRAME.x += ((-network.me.visual.position.x)*FRAME.scaleX + window.innerWidth/2 - FRAME.x) * 0.2;
	FRAME.y += ((-network.me.visual.position.y)*FRAME.scaleY + window.innerHeight/2 - FRAME.y) * 0.2;
	
	backgroundCollection.update();
	starCollection.update();
	playerCollection.update();
	
	backgroundCollection.draw();
	starCollection.draw();
	playerCollection.draw();
	
	//input
	var prevControls = JSON.stringify(controls);
	if (keyboard[87] || keyboard[38]) {
		controls.up = true;
	}
	else {
		controls.up = false;
	}
	if (keyboard[83] || keyboard[40]) {
		controls.down = true;
	}
	else {
		controls.down = false;
	}
	if (keyboard[65] || keyboard[37]) {
		controls.left = true;
	}
	else {
		controls.left = false;
	}
	if (keyboard[68] || keyboard[39]) {
		controls.right = true;
	}
	else {
		controls.right = false;
	}
	if (JSON.stringify(controls) != prevControls) {
		network.currentPackets.push({type: "updateControls", ctrls: controls});
	}
	
	network.update();
	if (gamePlaying == true) {
		requestFrame(main);
	}
}