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
var GRID_SPACES = 100;
//misc
var controls = {up: false, down: false, left: false, right: false};
FRAME.loadImage("assets/white.png", "white");

class Grid extends Actor {
	constructor() {
		super(ARENA_X, ARENA_Y);
		this.width = ARENA_WIDTH;
		this.height = ARENA_HEIGHT;
	}
	render() {
		this.ctx.fillStyle = "#F6F6F6";
		this.ctx.fillRect(0,0,ARENA_WIDTH,ARENA_HEIGHT);
		this.ctx.strokeStyle = "#999";
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		for (var x = 0; x <= ARENA_WIDTH; x += GRID_SPACES) {
			this.ctx.moveTo(x, 0);
			this.ctx.lineTo(x, ARENA_HEIGHT);
		}
		for (var y = 0; y <= ARENA_HEIGHT; y += GRID_SPACES) {
			this.ctx.moveTo(0, y);
			this.ctx.lineTo(ARENA_WIDTH, y);
		}
		this.ctx.stroke();
	}
}

class Ninja extends Actor {
	constructor(owner) {
		super();
		this.visual = owner.visual;
		this.image = FRAME.getImage("white");
		this.nameText = new Text(0, -300, owner.name, "Arial", "#000", 64, "center");
		this.width = 200;
		this.height = 200;
	}
	update() {
		this.x = this.visual.position.x;
		this.y = this.visual.position.y;
	}
	render() {
		this.ctx.fillStyle = "#00F";
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
		this.ctx.rotate(-this.rotation);
		this.nameText.draw();
		this.ctx.rotate(this.rotation);
	}
}

window.onload = function() {
	network = new gameIO();
	FRAME.init(GAME_WIDTH, GAME_HEIGHT, document.getElementById("canvas"));
	keyboard = new Keyboard();
	mouse = new Mouse();
	mainCollection = new Collection();
	
	network.addType(
		"player",
		function( obj, packet ) {
			obj.visual = new EmptyVisual();
			obj.name = packet.name;
			obj.ninja = new Ninja(obj);
			mainCollection.add(obj.ninja);
		}, function (obj) {
			var prevRot = Math.round(obj.ninja.rotation * 100);
			if (obj.id != network.me.id) obj.ninja.rotation = obj.visual.rotation;
			else {
				obj.ninja.rotation = Math.atan2(mouse.x - obj.ninja.x, obj.ninja.y - mouse.y);
				if (Math.round(obj.ninja.rotation * 100) != prevRot) {
					network.currentPackets.push({type: "updateRotation", rot: obj.ninja.rotation});
				}
			}
		}, undefined,
		function (obj) {
			mainCollection.remove(obj.ninja);
		}
	);
	
	mainCollection.add(new Grid());
}

function startGame() {
	document.getElementById("preGameGUI").style.visibility = "hidden";
	network.createSocket("wss://ninjaa-io.herokuapp.com");
	//network.createSocket("ws://localhost:5000");
	network.currentPackets.push({
		type: "playerJoin",
		name: document.getElementById("name").value
	});
	main();
}

function main() {
	FRAME.clearScreen();
	mouse.update();
	
	//camera
	FRAME.x = (-network.me.visual.position.x)*FRAME.scaleX + window.innerWidth/2;
	FRAME.y = (-network.me.visual.position.y)*FRAME.scaleY + window.innerHeight/2;
	
	mainCollection.update();
	mainCollection.draw();
	
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
	requestFrame(main);
}