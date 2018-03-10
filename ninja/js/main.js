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
var firstPlay = true;
FRAME.loadImage("assets/skins/1.png", "skin1");
FRAME.loadImage("assets/belts/1.png", "belt1");
FRAME.loadImage("assets/belts/2.png", "belt2");
FRAME.loadImage("assets/belts/3.png", "belt3");
FRAME.loadImage("assets/belts/4.png", "belt4");
FRAME.loadImage("assets/belts/5.png", "belt5");
FRAME.loadImage("assets/belts/6.png", "belt6");
FRAME.loadImage("assets/star.png", "star");

class WhiteBack extends Actor {
	constructor() {
		super(ARENA_X, ARENA_Y);
	}
	update() {
		this.x = -FRAME.x/FRAME.scaleX;
		this.y = -FRAME.y/FRAME.scaleY;
		if (this.x < 0) this.x = 0;
		else if (this.x + window.innerWidth/FRAME.scaleX > ARENA_WIDTH) this.x = ARENA_WIDTH - window.innerWidth/FRAME.scaleX;
		if (this.y < 0) this.y = 0;
		else if (this.y + window.innerHeight/FRAME.scaleY > ARENA_HEIGHT) this.y = ARENA_HEIGHT - window.innerHeight/FRAME.scaleY;
	}
	render() {
		this.ctx.fillStyle = "#F6F6F6";
		this.ctx.fillRect(0,0,window.innerWidth/FRAME.scaleX,window.innerHeight/FRAME.scaleY);
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
		this.x = -FRAME.x/FRAME.scaleX;
		this.y = -FRAME.y/FRAME.scaleY;
		this.offsetX -= this.prevFrameX - FRAME.x/FRAME.scaleX;
		this.offsetY -= this.prevFrameY - FRAME.y/FRAME.scaleY;
		while (this.offsetX > GRID_SPACES) this.offsetX -= GRID_SPACES;
		while (this.offsetX < -GRID_SPACES) this.offsetX += GRID_SPACES;
		while (this.offsetY > GRID_SPACES) this.offsetY -= GRID_SPACES;
		while (this.offsetY < -GRID_SPACES) this.offsetY += GRID_SPACES;
		this.x += this.offsetX;
		this.y += this.offsetY;
		
		this.prevFrameX = FRAME.x/FRAME.scaleX;
		this.prevFrameY = FRAME.y/FRAME.scaleY;
	}
	render() {
		this.ctx.strokeStyle = "#CCC";
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		for (var x = 0; x <= (window.innerWidth+GRID_SPACES)/FRAME.scaleX; x += GRID_SPACES) {
			this.ctx.moveTo(x, -GRID_SPACES);
			this.ctx.lineTo(x, (window.innerHeight+GRID_SPACES)/FRAME.scaleX);
		}
		for (var y = 0; y <= (window.innerHeight+GRID_SPACES)/FRAME.scaleY; y += GRID_SPACES) {
			this.ctx.moveTo(-GRID_SPACES, y);
			this.ctx.lineTo((window.innerWidth+GRID_SPACES)/FRAME.scaleY, y);
		}
		this.ctx.stroke();
	}
}

class Leaderboard extends Actor {
	constructor() {
		super();
		this.players = [];
		this.playersText = [];
		this.width = 0;
		this.height = 0;
	}
	update() {
		this.x = (-FRAME.x + window.innerWidth)/FRAME.scaleX - this.width/2 - 10;
		this.y = -FRAME.y/FRAME.scaleY + 10;
	}
	render() {
		this.ctx.fillStyle = "rgba(41,41,41,0.5)";
		this.ctx.fillRect(-this.width/2, 0, this.width, this.height);
		for (var i = 0; i < this.playersText.length; i++) {
			this.playersText[i].draw();
		}
	}
	putPlayers(players) {
		this.players = players;
		this.playersText = [];
		this.width = 0;
		this.height = 0;
		
		for (var i = 0; i < Math.min(5,this.players.length); i++) {
			this.playersText[i] = new Text(0, 10+i*60, (i+1)+". "+this.players[i].name+" - "+this.players[i].exp, "Arial", "#FFF", 42, "center");
			if (this.playersText[i].width > this.width) this.width = this.playersText[i].width;
			this.height += 60;
		}
		this.width += 20;
		this.height += 20;
	}
}

class ExpBar extends Actor {
	constructor() {
		super();
		this.value = 0;
		this.targetValue = 0;
		this.max = 0;
		this.width = 600;
		this.height = 60;
		this.expText = new Text(0,-32,"","Arial","#222",52, "center");
		this.levelText = new Text(0,-100,"","Arial","#222",52,"center");
	}
	update() {
		this.value += (this.targetValue - this.value) * 0.1;
		if (Math.abs(this.targetValue - this.value) < 0.1) {
			this.value = this.targetValue;
		}
		this.expText.text = Math.floor(this.value)+"/"+this.max;
		if (network.me.ninja != undefined) this.levelText.text = "Level "+network.me.ninja.level;
		
		this.x = (-FRAME.x + window.innerWidth/2)/FRAME.scaleX;
		this.y = (-FRAME.y + window.innerHeight)/FRAME.scaleY - 100;
	}
	render() {
		this.ctx.fillStyle = "#FFF";
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
		this.ctx.fillStyle = "#2299EE";
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width*(this.value/this.max), this.height);
		this.ctx.lineWidth = 5;
		this.ctx.strokeStyle = "#222";
		this.ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
		this.expText.draw();
		this.levelText.draw();
	}
	setValue(val) {
		this.targetValue = val;
	}
	setMax(max) {
		this.max = max;
	}
}

class TrailParticle extends Actor {
	constructor(obj, fadeRate) {
		super(obj.x, obj.y, obj.rotation);
		this.image = obj.image;
		this.width = obj.width;
		this.height = obj.height;
		this.alpha = 1.0;
		this.fadeRate = fadeRate || 0.3;
	}
	update() {
		this.alpha -= this.fadeRate;
		if (this.alpha <= 0.0) {
			this.alpha = 0.0;
			this.dead = true;
		}
	}
	render() {
		this.ctx.globalAlpha = this.alpha;
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
		this.ctx.globalAlpha = 1.0;
	}
}

class Ninja extends Actor {
	constructor(owner) {
		super();
		this.visual = owner.visual;
		this.image = FRAME.getImage("skin1");
		this.beltImage = FRAME.getImage("belt1");
		this.name = owner.name;
		this.nameText = new Text(0, -175, this.name+" (0/5)", "Arial", "#222", 42, "center");
		this.width = 100;
		this.height = 100;
		this.leftClicking = false;
		this.rightClicking = false;
		this.prevLevel = 0;
		//we get this data from the server on add
		this.health = 0;
		this.targetHealth = 0;
		this.level = 0;
		this.exp = 0;
		this.maxExp = 0;
		this.numStars = 0;
	}
	update() {
		if (this.prevLevel != this.level) {
			this.prevLevel = this.level;
			this.beltImage = FRAME.getImage("belt"+this.level);
		}
		this.x = this.visual.position.x;
		this.y = this.visual.position.y;
		this.nameText.text = this.name+" ("+this.numStars+"/5)";
		this.health += (this.targetHealth - this.health) * 0.1;
		addTrail(this, 0.4);
	}
	render() {
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
		this.ctx.drawImage(this.beltImage, -this.width/2, 15, this.width, 55/3.6);
		this.ctx.rotate(-this.rotation);
		this.nameText.draw();//name
		//health bar
		this.ctx.fillStyle = "rgba(41, 41, 41, 0.2)";
		this.ctx.fillRect(-this.width/2, -100, this.width, 20);
		this.ctx.fillStyle = "#22EE97";
		this.ctx.fillRect(-this.width/2, -100, this.width*(this.health/100), 20);
		this.ctx.rotate(this.rotation);
	}
}

class Star extends Actor {
	constructor(visual, id) {
		super();
		this.visual = visual;
		this.image = FRAME.getImage("star");
		this.width = 50;
		this.height = 50;
		this.ownerID = id;
	}
	update() {
		this.x = this.visual.position.x;
		this.y = this.visual.position.y;
		this.rotation += 0.01;
		if (this.ownerID != -1) {
			addTrail(this, 0.3);
			this.rotation += 0.02;
		}
	}
	render() {
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
	}
}

function addTrail(obj, rate) {
	particleCollection.add(new TrailParticle(obj, rate));
}

window.onblur = function() {
	keyboard[87] = false;
	keyboard[38] = false;
	keyboard[83] = false;
	keyboard[40] = false;
	keyboard[65] = false;
	keyboard[37] = false;
	keyboard[68] = false;
	keyboard[39] = false;
	mouse.leftClicking = false;
	mouse.rightClicking = false;
}

window.onload = function() {
	network = new gameIO();
	FRAME.init(GAME_WIDTH, GAME_HEIGHT, document.getElementById("canvas"));
	document.getElementById("canvas").style.backgroundColor = "#EEE";
	document.addEventListener('contextmenu', event => event.preventDefault());
	network.createSocket("wss://ninjaa-io.herokuapp.com");
	//network.createSocket("ws://localhost:5000");
	keyboard = new Keyboard();
	mouse = new Mouse();
	scoreText = new Text(0,0,"","Arial","#222",32);
	expBar = new ExpBar();
	leaderboard = new Leaderboard();
	backgroundCollection = new Collection();
	particleCollection = new Collection();
	starCollection = new Collection();
	playerCollection = new Collection();
	
	network.addType(
		"player",
		function( obj, packet ) {
			obj.visual = new EmptyVisual();
			obj.name = packet.name;
			obj.ninja = new Ninja(obj);
			obj.ninja.health = packet.health;
			obj.ninja.targetHealth = packet.health;
			obj.ninja.level = packet.level;
			obj.ninja.exp = packet.exp;
			obj.ninja.maxExp = packet.maxExp;
			playerCollection.add(obj.ninja);
		}, function (obj) {
			var prevRot = Math.round(obj.ninja.rotation * 100);
			if (obj.id != network.me.id) obj.ninja.rotation = obj.visual.rotation;
			else {
				obj.ninja.rotation = Math.atan2(mouse.x - obj.ninja.x, obj.ninja.y - mouse.y);
				if (Math.round(obj.ninja.rotation * 100) != prevRot) {
					network.currentPackets.push({type: "updateRotation", rot: obj.ninja.rotation});
				}
				if (obj.ninja.leftClicking != mouse.leftClicking || obj.ninja.rightClicking != mouse.rightClicking) {
					obj.ninja.leftClicking = mouse.leftClicking;
					obj.ninja.rightClicking = mouse.rightClicking;
					network.currentPackets.push({type: "updateMouse", leftClicking: obj.ninja.leftClicking, rightClicking: obj.ninja.rightClicking});
				}
			}
		}, 
		function (obj, packet) {
			obj.ninja.numStars = packet.numStars;
		},
		function (obj) {
			playerCollection.remove(obj.ninja);
		}
	);
	
	network.addType(
		"star",
		function( obj, packet ) {
			obj.visual = new EmptyVisual();
			obj.star = new Star(obj.visual, packet.ownerID);
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
	network.addPacketType(
		"changeHealth",
		function(packet) {
			for (var i = 0; i < network.objects.length; i++) {
				if (network.objects[i].id == packet.id) {
					network.objects[i].ninja.targetHealth = packet.health;
					break;
				}
			}
		}
	);
	network.addPacketType(
		"changeExp",
		function(packet) {
			for (var i = 0; i < network.objects.length; i++) {
				if (network.objects[i].id == packet.id) {
					network.objects[i].ninja.level = packet.level;
					network.objects[i].ninja.exp = packet.exp;
					network.objects[i].ninja.maxExp = packet.maxExp;
					break;
				}
			}
			
			if (network.me.id == packet.id) {
				expBar.setValue(packet.exp);
				expBar.setMax(packet.maxExp);
			}
		}
	);
	network.addPacketType(
		"leaderboard",
		function(packet) {
			leaderboard.putPlayers(packet.players);
		}
	);
}

function endGame() {
	gamePlaying = false;
	
	document.getElementById("preGameGUI").style.visibility = "visible";
}

function startGame() {
	backgroundCollection.clear();
	backgroundCollection.add(new WhiteBack());
	backgroundCollection.add(new Grid());
	document.getElementById("preGameGUI").style.visibility = "hidden";
	network.currentPackets.push({
		type: "playerJoin",
		name: document.getElementById("name").value
	});
	
	gamePlaying = true;
	if (firstPlay) {
		network.update();
		FRAME.x = (-network.me.visual.position.x)*FRAME.scaleX + window.innerWidth/2;
		FRAME.y = (-network.me.visual.position.y)*FRAME.scaleY + window.innerHeight/2;
		main();
		firstPlay = false;
	}
}

function main() {
	FRAME.clearScreen();
	mouse.update();
	
	scoreText.x = -FRAME.x/FRAME.scaleX + 20;
	scoreText.y = (-FRAME.y + window.innerHeight)/FRAME.scaleY - 50;
	if (network.me.ninja !== undefined) scoreText.text = "Score: " + network.me.ninja.exp;
	
	backgroundCollection.update();
	particleCollection.update();
	starCollection.update();
	playerCollection.update();
	leaderboard.update();
	expBar.update();
	
	backgroundCollection.draw();
	particleCollection.draw();
	starCollection.draw();
	playerCollection.draw();
	
	//ui
	scoreText.draw();
	leaderboard.draw();
	expBar.draw();
	
	//camera
	FRAME.x = (-network.me.visual.position.x)*FRAME.scaleX + window.innerWidth/2;
	FRAME.y = (-network.me.visual.position.y)*FRAME.scaleY + window.innerHeight/2;
	
	if (gamePlaying == true) {
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
	}
	
	//misc
	network.update();
	requestFrame(main);
}