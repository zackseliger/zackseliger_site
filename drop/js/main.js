GAME_WIDTH = 1000;
GAME_HEIGHT = 800;
//collision group things
PLAYER = Math.pow(2,0);
TARGET = Math.pow(2,1);
BLOCK = Math.pow(2,2);
ENEMY = Math.pow(2,3);
//global kinda things
var gameState = 0;//0=start screen, 1=in-game, 2=after game
var cameraEndHeight = 0.5;
var endRoomy = 15;

class Circle extends Actor {
	constructor(x, y, r) {
		super(x, y);
		this.radius = r;
		this.color = "#000";
		this.speed = 500;
		this.roomx = 0;
		this.roomy = 0;
		this.prevroomx = 0;
		this.prevroomy = 0;
		this.score = 0;
		
		this.body = new p2.Body({mass:1, position:[x,y]});
		this.body.damping = 0.0;
		this.shape = new p2.Circle({radius: this.radius});
		this.shape.collisionGroup = PLAYER;
		this.shape.collisionMask = BLOCK;
		this.body.addShape(this.shape);
		world.addBody(this.body);
	}
	update() {
		if (keyboard[37] || keyboard[65]) {
			this.body.applyForce([-this.speed,0]);
		}
		if (keyboard[39] || keyboard[68]) {
			this.body.applyForce([this.speed,0]);
		}
		
		this.x = this.body.position[0];
		this.y = this.body.position[1];
		
		if (this.x > (this.roomx+1)*GAME_WIDTH) {
			this.prevroomx = this.roomx;
			this.prevroomy = this.roomy;
			this.roomx += 1;
		}
		else if (this.x < (this.roomx)*GAME_WIDTH) {
			this.prevroomx = this.roomx;
			this.prevroomy = this.roomy;
			this.roomx -= 1;
		}
		if (this.y > (this.roomy+1)*GAME_HEIGHT) {
			this.prevroomx = this.roomx;
			this.prevroomy = this.roomy;
			this.roomy += 1;
		}
		else if (this.y < (this.roomy)*GAME_HEIGHT) {
			this.prevroomx = this.roomx;
			this.prevroomy = this.roomy;
			this.roomy -= 1;
		}
		
		if (this.roomx != this.prevroomx || this.roomy != this.prevroomy) {
			var exists = false;
			for (var i = 0; i < roomCollection.objects.length; i++) {
				if (roomCollection.objects[i].x/GAME_WIDTH == this.roomx && roomCollection.objects[i].y/GAME_HEIGHT == this.roomy) {
					exists = true;
					if (roomCollection.objects[i].active == false) {
						roomCollection.objects[i].activate();
						activeRoom = roomCollection.objects[i];
					}
					break;
				}
			}
			if (!exists) {
				var type = "random";
				
				if (this.prevroomy < this.roomy)
					type = "up";
				else if (this.prevroomx < this.roomx)
					type = "left";
				else if (this.prevroomx > this.roomx)
					type = "right";
				
				if (this.roomy > endRoomy) {
					type = "finish";
				}
				
				activeRoom = new Room(this.roomx, this.roomy, type);
				roomCollection.add(activeRoom);
			}
		}
	}
	render() {
		this.ctx.fillStyle = this.color;
		this.ctx.beginPath();
		this.ctx.arc(0,0,this.radius,0,2*Math.PI);
		this.ctx.closePath();
		this.ctx.fill();
	}
}

class Target extends Actor {
	constructor(x,y) {
		super(x,y);
		
		this.radius = 25;
		this.lineThickness = 10;
		
		this.body = new p2.Body({mass:0.2, position:[x,y], gravityScale: 0});
		this.body.damping = 0.05;
		this.shape = new p2.Circle({radius: this.radius});
		this.shape.collisionGroup = TARGET;
		this.shape.collisionMask = BLOCK | TARGET;
		this.body.addShape(this.shape);
		//this body needs 2 shapes, one to be normal w physics, and
		//the other to collide with the player as a sensor
		this.sensor = new p2.Circle({radius: this.radius});
		this.sensor.collisionGroup = BLOCK;
		this.sensor.sensor = true;
		this.body.addShape(this.sensor);
		world.addBody(this.body);
		this.body.parentTarget = this;
		
		targetCollection.add(this);
	}
	update() {
		this.x = this.body.position[0];
		this.y = this.body.position[1];
		this.rotation = this.body.angle;
	}
	render() {
		this.ctx.save();
		if (this.x - this.radius - this.lineThickness/2 < this.room.x) {
			this.ctx.rect(this.room.x - this.x,-this.radius-this.lineThickness/2,this.radius*2+this.lineThickness,this.radius*2+this.lineThickness);
			this.ctx.clip();
		}
		else if (this.x + this.radius + this.lineThickness/2 > this.room.x + GAME_WIDTH) {
			this.ctx.rect(-this.radius-this.lineThickness/2,-this.radius-this.lineThickness/2,this.radius+this.lineThickness/2+this.room.x+GAME_WIDTH-this.x,this.radius*2+this.lineThickness);
			this.ctx.clip();
		}
		if (this.y - this.radius - this.lineThickness/2 < this.room.y) {
			this.ctx.rect(-this.radius-this.lineThickness/2,this.room.y - this.y,this.radius*2+this.lineThickness,this.radius*2+this.lineThickness);
			this.ctx.clip();
		}
		else if (this.y + this.radius + this.lineThickness/2 > this.room.y + GAME_HEIGHT) {
			this.ctx.rect(-this.radius-this.lineThickness/2,-this.radius-this.lineThickness/2,this.radius*2+this.lineThickness,this.radius+this.lineThickness/2+this.room.y+GAME_HEIGHT-this.y);
			this.ctx.clip();
		}
		
		this.ctx.strokeStyle = "#2E6";
		this.ctx.lineWidth = this.lineThickness;
		this.ctx.beginPath();
		this.ctx.arc(0,0,this.radius,0,2*Math.PI);
		this.ctx.closePath();
		this.ctx.stroke();
		
		this.ctx.fillStyle = "#2E6";
		this.ctx.beginPath();
		this.ctx.arc(0,0,this.radius/4,0,2*Math.PI);
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.restore();
	}
}

class Rectangle extends Actor {
	constructor(x,y,w,h,r=0) {
		super(x,y);
		
		this.width = w;
		this.height = h;
		
		this.body = new p2.Body({position:[x,y], angle: r});
		this.shape = new p2.Box({width: w, height: h});
		this.shape.collisionGroup = BLOCK;
		this.shape.collisionMask = PLAYER | TARGET;
		this.body.addShape(this.shape);
		world.addBody(this.body);
		
		blockCollection.add(this);
	}
	update() {
		this.x = this.body.position[0];
		this.y = this.body.position[1];
		this.rotation = this.body.angle;
	}
	render() {
		this.ctx.fillStyle = "#000";
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
	}
}

class Room extends Actor {
	constructor(x,y,opt="default") {
		super(x*GAME_WIDTH,y*GAME_HEIGHT);
		this.r = this.sr = Math.floor(Math.random()*50) + 30;
		this.g = this.sg = Math.floor(Math.random()*100) + 80;
		this.b = this.sb = Math.floor(Math.random()*130) + 120;
		
		this.backColor = "rgb("+this.r+","+this.g+","+this.b+")";
		this.roomx = x;
		this.roomy = y;
		this.blocks = [];
		this.targets = [];
		this.active = true;
		this.type = opt;
		if (this.type == "default") {
			this.blocks.push(new Rectangle(this.x+GAME_WIDTH/2, this.y+GAME_HEIGHT*0.75,200,40));
		}
		else if (this.type == "random") {
			this.makeRandoms(5);
		}
		else if (this.type == "up") {
			this.makeFullFloor();
			var section = Math.abs(Math.floor((player.x%GAME_WIDTH)/(GAME_WIDTH/3)));
			if (player.x < 0) {
				if (section == 0) section = 2;
				else if (section == 2) section = 0;
			}
			if (section != 0) {
				this.makeFloaters(0,Math.floor(Math.random()*2)+1);
			}
			if (section != 1) {
				this.makeFloaters(1,Math.floor(Math.random()*2)+1);
			}
			if (section != 2) {
				this.makeFloaters(2,Math.floor(Math.random()*2)+1);
			}
		}
		else if (this.type == "right") {
			this.makeLeftWall();
			this.makeFloorTile(1);
			this.makeRandoms(Math.floor(Math.random()*3));
			var section = Math.abs(Math.floor((player.x%GAME_WIDTH)/(GAME_WIDTH/3)));
			this.makeFloaters(section,1+Math.floor(Math.random()*2));
			if (section == 0) {
				this.makeFloorTile(2);
			}
			else {
				this.makeFloorTile(0);
			}
		}
		else if (this.type == "left") {
			this.makeRightWall();
			this.makeFloorTile(1);
			this.makeRandoms(Math.floor(Math.random()*3));
			var section = Math.abs(Math.floor((player.x%GAME_WIDTH)/(GAME_WIDTH/3)));
			this.makeFloaters(section,1+Math.floor(Math.random()*2));
			if (section != 0) {
				if (Math.random() > 0.3) this.makeFloorTile(0);
				else this.makeFloorTile(2);
			}
			else {
				if (Math.random() > 0.3) this.makeFloorTile(2);
				else this.makeFloorTile(0);
			}
		}
		else if (this.type == "finish") {
			var blockx = this.x + GAME_WIDTH/2;
			var blocky = this.y + GAME_HEIGHT;
			this.blocks.push(new Rectangle(blockx, blocky, GAME_WIDTH+5, 40));
			
			//end the game
			endGame();
		}
		
		//making targets
		if (this.type != "default" && this.type != "finish")
			this.makeRandomTargets(Math.floor(Math.random()*3)+1);
		
		//setting 'room' property of each target and 'pushing' them towards center
		for (var i = 0; i < this.targets.length; i++) {
			this.targets[i].room = this;
			var force = 200;
			var angle = Math.atan2(-this.targets[i].y + this.y+GAME_HEIGHT/2, -this.targets[i].x + this.x+GAME_WIDTH/2);
			this.targets[i].body.applyForce([force*Math.cos(angle), force*Math.sin(angle)]);
		}
		//removing blocks that go outside the room
		if (this.type != "finish") {
			for (var i = 0; i < this.blocks.length; i++) {
				if (this.blocks[i].body.getAABB().upperBound[0] > this.x + GAME_WIDTH ||
					this.blocks[i].body.getAABB().lowerBound[0] < this.x) {
					blockCollection.remove(this.blocks[i]);
					world.removeBody(this.blocks[i].body);
					this.blocks.splice(i, 1);
					i--;
				}
			}
		}
	}
	update() {
		for (var i = 0; i < this.blocks.length; i++) {
			this.blocks[i].update();
		}
		for (var i = 0; i < this.targets.length; i++) {
			this.targets[i].update();
			//removing targets if they go too far away
			if (this.targets[i].x - this.targets[i].radius > this.x + GAME_WIDTH ||
				this.targets[i].x + this.targets[i].radius < this.x ||
				this.targets[i].y + this.targets[i].radius < this.y ||
				this.targets[i].y - this.targets[i].radius > this.y + GAME_HEIGHT) {
				targetCollection.remove(this.targets[i]);
				world.removeBody(this.targets[i].body);
				this.targets.splice(i,1);
				i--;
			}
		}
		
		//fade and remove blocks when faded enough
		if (this.active == false && this.r > 0) {
			this.r += (0 - this.r) * 0.1;
			this.g += (0 - this.g) * 0.1;
			this.b += (0 - this.b) * 0.1;
			this.backColor = "rgb("+Math.floor(this.r)+","+Math.floor(this.g)+","+Math.floor(this.b)+")";
			
			//finalize destroy, including removing stuff
			if (this.r < 0.05) {
				this.r = 0;
				this.g = 0;
				this.b = 0;
				this.backColor = "#000";
				
				for (var i = 0; i < this.blocks.length; i++) {
					blockCollection.remove(this.blocks[i]);
					world.removeBody(this.blocks[i].body);
				}
			}
		}
	}
	render() {
		this.ctx.fillStyle = this.backColor;
		this.ctx.fillRect(0,0,GAME_WIDTH,GAME_HEIGHT);
	}
	activate() {
		this.r = this.sr;
		this.g = this.sg;
		this.b = this.sb;
		this.backColor = "rgb("+this.sr+","+this.sg+","+this.sb+")";
		for (var i = 0; i < this.blocks.length; i++) {
			blockCollection.remove(this.blocks[i]);
			world.removeBody(this.blocks[i].body);
			blockCollection.add(this.blocks[i]);
			world.addBody(this.blocks[i].body);
		}
		for (var i = 0; i < this.targets.length; i++) {
			targetCollection.add(this.targets[i]);
			world.addBody(this.targets[i].body);
		}
		this.active = true;
	}
	deactivate() {
		for (var i = 0; i < this.targets.length; i++) {
			targetCollection.remove(this.targets[i]);
			world.removeBody(this.targets[i].body);
		}
		this.active = false;
	}
	//either 2 or 3 split up pieces that go across the whole width
	makeFullFloor() {
		var floorType = Math.floor(Math.random()*2);
		
		if (floorType == 0) {
			for (var i = 0; i < 3; i++) {
				var blockx = this.x + GAME_WIDTH/5 + (GAME_WIDTH/3)*i;
				var blocky = this.y + GAME_HEIGHT*0.9;
				var w = Math.random()*(GAME_WIDTH/6) + GAME_WIDTH/5 - 25;
				var h = Math.random()*40 + 40;
				this.blocks.push(new Rectangle(blockx,blocky,w,h,Math.random()*0.2-0.1));
			}
		}
		else if (floorType == 1) {
			for (var i = 0; i < 2; i++) {
				var blockx = this.x + GAME_WIDTH*0.25 + GAME_WIDTH*0.5*(i);
				var blocky = this.y + GAME_HEIGHT*0.9;
				var w = Math.random()*(GAME_WIDTH/7) + GAME_WIDTH/3 - 50;
				var h = Math.random()*40 + 40;
				this.blocks.push(new Rectangle(blockx,blocky,w,h,Math.random()*0.2-0.1));
			}
		}
	}
	//section is for x axis, 0=first 1/3, 1=second 1/3, 2=third 1/3
	makeFloaters(section,num) {
		for (var i = 0; i < num; i++) {
			var blockx = this.x + Math.random()*GAME_WIDTH/3 + section*GAME_WIDTH/3;
			var blocky = this.y + Math.random()*GAME_HEIGHT*0.6 + GAME_HEIGHT*0.2;
			this.blocks.push(new Rectangle(blockx,blocky,50+Math.random()*100,50+Math.random()*100,Math.random()*2*Math.PI));
		}
	}
	//can only spawn on the inner 8/10ths of the screen
	makeRandoms(num) {
		for (var i = 0; i < num; i++) {
			var blockx = this.x + Math.random()*GAME_WIDTH*0.6 + GAME_WIDTH*0.2;
			var blocky = this.y + Math.random()*GAME_HEIGHT*0.6 + GAME_HEIGHT*0.2;
			this.blocks.push(new Rectangle(blockx, blocky, 50+Math.random()*150,50+Math.random()*150, Math.random()*2*Math.PI));
		}
	}
	//makes one floor tile based on 1/3 sections, like in makeFloaters()
	makeFloorTile(section) {
		var blockx = this.x + GAME_WIDTH/5 + (GAME_WIDTH/3)*section;
		var blocky = this.y + GAME_HEIGHT*0.9;
		var w = Math.random()*(GAME_WIDTH/7) + GAME_WIDTH/5;
		var h = Math.random()*40 + 40;
		this.blocks.push(new Rectangle(blockx,blocky,w,h,Math.random()*0.2-0.1));
		
	}
	//one piece
	makeLeftWall() {
		for (var i = 0; i < 2; i++) {
			var blockx = this.x + GAME_WIDTH*0.1;
			var blocky = this.y + GAME_HEIGHT*0.25 + GAME_HEIGHT*0.5*(i);
			var w = Math.random()*40 + 40;
			var h = GAME_HEIGHT/2 - 50 - Math.random()*(GAME_HEIGHT/6);
			this.blocks.push(new Rectangle(blockx,blocky,w,h,Math.random()*0.2-0.1));
		}
	}
	//one piece
	makeRightWall() {
		for (var i = 0; i < 2; i++) {
			var blockx = this.x + GAME_WIDTH*0.9;
			var blocky = this.y + GAME_HEIGHT*0.25 + GAME_HEIGHT*0.5*(i);
			var w = Math.random()*40 + 40;
			var h = GAME_HEIGHT/2 - 50 - Math.random()*(GAME_HEIGHT/6);
			this.blocks.push(new Rectangle(blockx,blocky,w,h,Math.random()*0.2-0.1));
		}
	}
	//add targets randomly
	makeRandomTargets(num) {
		for (var i = 0; i < num; i++) {
			var targetx = this.x + Math.random()*GAME_WIDTH*0.6 + GAME_WIDTH*0.2;
			var targety = this.y + Math.random()*GAME_HEIGHT*0.6 + GAME_HEIGHT*0.2;
			this.targets.push(new Target(targetx, targety));
			
			var results = [];
			world.broadphase.aabbQuery(world, this.targets[this.targets.length-1].body.getAABB(), results);
			if (results.length > 1) {
				targetCollection.remove(this.targets[this.targets.length-1]);
				world.removeBody(this.targets[this.targets.length-1].body);
				this.targets.pop();
				i--;
			}
		}
	}
}

class GUI extends Actor {
	constructor() {
		super();
		
		//title text
		this.titleText = new Text();
		this.titleText.fontsize = 128;
		this.titleText.justify = "center";
		this.titleText.fillStyle = "#FFF";
		this.titleText.text = "BALL DROP!!!";
		//instructions text
		this.instructionsText = new Text();
		this.instructionsText.fontsize = 128;
		this.instructionsText.justify = "center";
		this.instructionsText.fillStyle = "#FFF";
		this.instructionsText.text = "Use left/right to begin";
		//player score
		this.scoreText = new Text();
		this.scoreText.fontsize = 128;
		this.scoreText.justify = "center";
		this.scoreText.fillStyle = "#FFF";
		//final score text
		this.finalScoreText = new Text();
		this.finalScoreText.fontsize = 128;
		this.finalScoreText.justify = "center";
		this.finalScoreText.fillStyle = "#FFF";
		//restart text
		this.restartText = new Text();
		this.restartText.fontsize = 128;
		this.restartText.justify = "center";
		this.restartText.fillStyle = "#FFF";
		this.restartText.text = "SPACE to restart";
	}
	update() {
		this.x = -FRAME.x/FRAME.scaleX;
		this.y = -FRAME.y/FRAME.scaleY;
		
		this.titleText.x = window.innerWidth/2/FRAME.scaleX;
		this.instructionsText.x = window.innerWidth/2/FRAME.scaleX;
		this.instructionsText.y = window.innerHeight*0.85/FRAME.scaleY;
		this.scoreText.x = window.innerWidth/2/FRAME.scaleX;
		this.scoreText.text = player.score;
		this.finalScoreText.x = window.innerWidth/2/FRAME.scaleX;
		this.finalScoreText.text = "Your final score is " + player.score;
		this.restartText.x = window.innerWidth/2/FRAME.scaleX;
		this.restartText.y = window.innerHeight*0.85/FRAME.scaleY;
	}
	render() {
		if (gameState == 0) {
			this.titleText.draw();
			this.instructionsText.draw();
		}
		else if (gameState == 1) {
			this.scoreText.draw();
		}
		else {
			this.finalScoreText.draw();
			this.restartText.draw();
		}
	}
}

window.onload = function() {
	FRAME.init(GAME_WIDTH, GAME_HEIGHT, document.getElementById("canvas"));
	timestep = new Timestep();
	keyboard = new Keyboard();
	world = new p2.World({gravity: [0,30]});
	playerCollection = new Collection();
	roomCollection = new Collection();
	blockCollection = new Collection();
	targetCollection = new Collection();
	
	material = new p2.ContactMaterial(world.defaultMaterial,world.defaultMaterial, {restitution: 1,
	stiffness: Number.MAX_VALUE});
	world.defaultContactMaterial = material;
	
	gui = new GUI();
	player = new Circle(GAME_WIDTH/2,GAME_HEIGHT*0.25,20);
	playerCollection.add(player);
	activeRoom = new Room(0,0);
	roomCollection.add(activeRoom);
	
	//get rid of targets when touching the player
	world.on("beginContact", function(e) {
		if (e.bodyA == player.body && e.bodyB.parentTarget !== undefined) {
			var index = e.bodyB.parentTarget.room.targets.indexOf(e.bodyB.parentTarget);
			e.bodyB.parentTarget.room.targets.splice(index,1);
			targetCollection.remove(e.bodyB.parentTarget);
			world.removeBody(e.bodyB);
			player.score++;
		}
		else if (e.bodyB == player.body && e.bodyA.parentTarget !== undefined) {
			var index = e.bodyA.parentTarget.room.targets.indexOf(e.bodyA.parentTarget);
			e.bodyA.parentTarget.room.targets.splice(index,1);
			targetCollection.remove(e.bodyA.parentTarget);
			world.removeBody(e.bodyA);
			player.score++;
		}
	});
	
	main();
}

function main() {
	FRAME.clearScreen();
	timestep.tick();
	
	world.step(1/60,timestep.deltaTime,10);
	
	playerCollection.update();
	for (var i = 0; i < roomCollection.objects.length; i++) {
		roomCollection.objects[i].update();
		if (roomCollection.objects[i].active == true) {
			if (roomCollection.objects[i].roomx != player.roomx || roomCollection.objects[i].roomy != player.roomy) {
				roomCollection.objects[i].deactivate();
			}
		}
	}
	gui.update();
	
	roomCollection.draw();
	blockCollection.draw();
	targetCollection.draw();
	playerCollection.draw();
	gui.draw();
	
	if (gameState == 0) {
		if (player.body.velocity[0] !== 0) {
			gameState = 1;
			material.restitution = 0.95;
			player.body.damping = 0.05;
		}
		FRAME.x += ((-player.x * FRAME.scaleX + window.innerWidth / 2) - FRAME.x) * 0.3;
		FRAME.y += (((-GAME_HEIGHT/2) * FRAME.scaleY + window.innerHeight / 2) - FRAME.y) * 0.3;
	}
	else if (gameState == 1) {
		FRAME.x += ((-player.x * FRAME.scaleX + window.innerWidth / 2) - FRAME.x) * 0.3;
		FRAME.y += ((-player.y * FRAME.scaleY + window.innerHeight / 2) - FRAME.y) * 0.3;
	}
	else if (gameState == 2) {
		FRAME.x += ((-player.x * FRAME.scaleX + window.innerWidth / 2) - FRAME.x) * 0.3;
		FRAME.y += ((-player.y * FRAME.scaleY + window.innerHeight * cameraEndHeight) - FRAME.y) * 0.3;
		//only increase cameEndHeight if below 1/3 of the final room
		if (player.y / GAME_HEIGHT > endRoomy+1.33) {
			cameraEndHeight += (0.8 - cameraEndHeight) * 0.05;
		}
		//restart game using space
		if (keyboard[32]) {
			restartGame();
		}
	}
	
	//white boxes
	/*FRAME.ctx.fillStyle = "#FFF";
	FRAME.ctx.fillRect(-FRAME.x / FRAME.scaleX, -FRAME.y / FRAME.scaleY, GAME_WIDTH, (window.innerHeight - GAME_HEIGHT * FRAME.scaleY) / 2 / FRAME.scaleY);
	FRAME.ctx.fillRect(-FRAME.x / FRAME.scaleX, -FRAME.y / FRAME.scaleY + GAME_HEIGHT + (window.innerHeight - GAME_HEIGHT * FRAME.scaleY) / 2 / FRAME.scaleY, GAME_WIDTH, (window.innerHeight - GAME_HEIGHT * FRAME.scaleY) / 2 / FRAME.scaleY);
	FRAME.ctx.fillRect(-FRAME.x / FRAME.scaleX, -FRAME.y / FRAME.scaleY, (window.innerWidth - GAME_WIDTH * FRAME.scaleX) / 2 / FRAME.scaleX, window.innerHeight);
	FRAME.ctx.fillRect(-FRAME.x / FRAME.scaleX + GAME_WIDTH + (window.innerWidth - GAME_WIDTH * FRAME.scaleX) / 2 / FRAME.scaleX, -FRAME.y / FRAME.scaleY, (window.innerWidth - GAME_WIDTH * FRAME.scaleX) / 2 / FRAME.scaleX, window.innerHeight);*/
	
	requestFrame(main);
}

function restartGame() {
	playerCollection.clear();
	blockCollection.clear();
	targetCollection.clear();
	roomCollection.clear();
	
	player = new Circle(GAME_WIDTH/2,GAME_HEIGHT*0.25,20);
	playerCollection.add(player);
	activeRoom = new Room(0,0);
	roomCollection.add(activeRoom);
	
	material.restitution = 1.0;
	player.damping = 0.0;
	gameState = 0;
}

function endGame() {
	material.restitution = 0.1;
	gameState = 2;
}