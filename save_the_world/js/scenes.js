class SceneManager {
	constructor() {
		this.scenes = new Map();
		this.currentScene = "";
	}
	addScene(name, scene) {
		this.scenes.set(name, scene);
	}
	change(name) {
		if (this.scenes.get(this.currentScene) != undefined) {
			this.scenes.get(this.currentScene).onUnload();
		}
		this.currentScene = name;
		this.scenes.get(this.currentScene).onLoad();
	}
	update(realTime) {
		this.scenes.get(this.currentScene).update(realTime);
	}
	render() {
		this.scenes.get(this.currentScene).render();
	}
}

class Scene {
	constructor(manager) {
		this.manager = manager;
	}
	update(realTime) {}
	render() {}
	onLoad() {}
	onUnload() {}
}

class RoadScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.room = 0;
		this.spaceEnabled = false;
		this.dialogueType = 0;
		
		this.redThing = new RedThing(35 * PIXEL_SIZE, -12 * PIXEL_SIZE);
		this.oldie = new Oldie(40 * PIXEL_SIZE, 31 * PIXEL_SIZE);
		this.lady = new Lady(350, 310);
		
		this.sign = new ImageActor(FRAME.getImage("sign"), 450, 300);
		this.trash1 = new ImageActor(FRAME.getImage("trash1"), 90, 300);
		this.trashHeap = new TrashHeap();
		
		this.moon = new Planet(FRAME.getImage("moon"));
		this.moon.x = 5 * PIXEL_SIZE;
		this.moon.y = 3 * PIXEL_SIZE;
	}
	update(realTime) {
		if (this.room == -3) {
			var spacePressed = false;
			if (keyboard[32] && this.spaceEnabled == true) {
				spacePressed = true;
				this.spaceEnabled = false;
			}
			if (keyboard[32] == false) {
				this.spaceEnabled = true;
			}
			
			if (this.dialogueType == 1) {
				if (spacePressed) {
					if (background.image == FRAME.getImage("cantReadBack") || background.image == FRAME.getImage("signSpaceshipologistBack")) {
						this.room = -1;
						background.change(FRAME.getImage("roadBack"));
					}
					else {
						player.readSign = true;
						background.change(FRAME.getImage("signSpaceshipologistBack"));
					}
					FRAME.shake(25, 0.25);
					FRAME.playSound("thud" + (Math.floor(Math.random() * 3) + 1));
				}
			}
			else if (this.dialogueType == 2) {
				if (spacePressed) {
					if (this.trashHeap.getTrashImage() == FRAME.getImage("trashBlueHeadband")) {
						player.setHeadbandStatus(true);
						this.trashHeap.trashThings.splice(this.trashHeap.trashThings.indexOf(FRAME.getImage("trashBlueHeadband")), 1);
					}
					else if (this.trashHeap.getTrashImage() == FRAME.getImage("trashSpaceshipRepairKit")) {
						player.hasRepairKit = true;
						this.trashHeap.trashThings.splice(this.trashHeap.trashThings.indexOf(FRAME.getImage("trashSpaceshipRepairKit")), 1);
					}
					
					tooltip.move(FRAME);
					background.change(FRAME.getImage("roadBack"));
					this.room = -2;
					FRAME.shake(25, 0.25);
					FRAME.playSound("thud" + (Math.floor(Math.random() * 3) + 1));
				}
			}
			else if (this.dialogueType == 3) {
				if (spacePressed) {
					if (background.image == FRAME.getImage("lostGlassesBack")) {
						background.change(FRAME.getImage("takeGlassesBack"));
					}
					else {
						player.hasGlasses = true;
						this.room = 2;
						background.change(FRAME.getImage("roadBack"));
					}
					
					FRAME.shake(25, 0.25);
					FRAME.playSound("thud" + (Math.floor(Math.random() * 3) + 1));
				}
			}
		}
		else if (this.room == -2) {
			if (this.trashHeap.canFindSomething == true) {
				tooltip.move(this.trashHeap);
			}
			else {
				tooltip.move(FRAME);
			}
			
			//interact
			if (keyboard[32] && this.trashHeap.canFindSomething) {
				this.spaceEnabled = false;
				this.room = -3;
				this.dialogueType = 2;
				background.change(this.trashHeap.getTrashImage());
			}
			
			player.boundLeft();
			if (player.goneRight()) {
				this.room = -1;
			}
			this.trashHeap.update(realTime);
		}
		else if (this.room == -1) {
			if (checkCollision(player, this.sign) && player.readSign == false) {
				tooltip.move(this.sign);
			}
			else {
				tooltip.move(FRAME);
			}
			
			if (keyboard[32] && this.spaceEnabled == true) {
				if (tooltip.x == this.sign.x) {
					this.room = -3;
					this.dialogueType = 1;
					if (player.hasGlasses == false) {
						background.change(FRAME.getImage("cantReadBack"));
					}
					else {
						background.change(FRAME.getImage("signBecomeBack"));
					}
				}
				this.spaceEnabled = false;
			}
			if (keyboard[32] === false) {
				this.spaceEnabled = true;
			}
			
			if (player.goneLeft()) {
				this.room = -2;
			}
			if (player.goneRight()) {
				this.room = 0;
			}
		}
		else if (this.room == 0) {
			if (player.x > 200 && this.redThing.finishedComingIn == false) {
				player.setMoveable(false);
				this.redThing.comeInTo(20);
			}
			if (this.redThing.finishedComingIn == true && player.canMove == false) {
				player.setMoveable(true);
			}
			
			if (timesCompleted <= 0) {
				player.boundLeft();
			}
			else if (player.goneLeft()) {
				this.room = -1;
			}
			if (player.goneRight()) {
				this.room = 1;
			}
		}
		else if (this.room == 1) {
			if (checkCollision(player, this.oldie)) {
				tooltip.move(this.oldie);
			}
			else {
				tooltip.move(FRAME);
			}
			
			//interact
			if (keyboard[32]) {
				if (tooltip.x == this.oldie.x) {
					this.manager.change("forest");
				}
			}
			
			if (player.goneLeft()) {
				this.room = 0;
			}
			if (timesCompleted <= 0) {
				player.boundRight();
			}
			else if (player.goneRight()) {
				this.room = 2;
			}
			this.oldie.update(realTime);
		}
		else if (this.room == 2) {
			if (checkCollision(player, this.lady) && player.hasGlasses == false) {
				tooltip.move(this.lady);
			}
			else {
				tooltip.move(FRAME);
			}
			
			//interact
			if (keyboard[32]) {
				if (tooltip.x == this.lady.x) {
					this.room = -3;
					this.dialogueType = 3;
					this.spaceEnabled = false;
					background.change(FRAME.getImage("lostGlassesBack"));
				}
			}
			
			if (player.goneLeft()) {
				this.room = 1;
			}
			player.boundRight();
			this.lady.update(realTime);
		}
		
		tooltip.update();
		player.update(realTime);
		this.moon.update(realTime);
		if (this.redThing.finishedComingIn || this.redThing.comingIn) {
			this.redThing.update();
		}
	}
	render() {
		background.draw();
		
		if (this.room == -2) {
			this.trashHeap.draw();
		}
		else if (this.room == -1) {
			this.sign.draw();
			this.trash1.draw();
		}
		else if (this.room == 1) {
			this.oldie.draw();
		}
		else if (this.room == 2) {
			this.lady.draw();
		}
		
		if (this.room != -3) {
			this.moon.draw();
			this.redThing.draw();
			tooltip.draw();
			player.draw();
		}
	}
	onLoad() {
		this.room = 0;
		this.redThing = new RedThing(35 * PIXEL_SIZE, -12 * PIXEL_SIZE);
		background.change(FRAME.getImage("roadBack"));
		player.x = 20 + player.width / 2;
	}
}

class ForestScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.room = 0;
		this.dialogueType = 0;
		this.spaceEnabled = false;
		this.playerRemoved = false;
		this.spaceshipFixed = false;
		
		this.spaceship1 = new Spaceship(1, 550, 310);
		this.spaceship2 = new Spaceship(2, 270, 310);
		this.spaceship3 = new Spaceship(3, 470, 310);
		this.greenery = new Background();
		this.moon = new Planet(FRAME.getImage("moon"), 50, 30);
		this.redThing = new RedThing(350, 20);
	}
	update(realTime) {
		if (this.room == -1) {
			var spacePressed = false;
			if (keyboard[32] && this.spaceEnabled == true) {
				spacePressed = true;
				this.spaceEnabled = false;
			}
			if (keyboard[32] == false) {
				this.spaceEnabled = true;
			}
			
			if (this.dialogueType == 1) {
				if (spacePressed) {
					if (background.image == FRAME.getImage("spaceshipFixBack")) {
						this.spaceshipFixed = true;
					}
					this.room = 1;
					background.change(FRAME.getImage("forestBack"));
					FRAME.shake(25, 0.25);
					FRAME.playSound("thud" + (Math.floor(Math.random() * 3) + 1));
				}
			}
		}
		else if (this.room == 0) {
			if (keyboard[32] && this.spaceEnabled) {
				this.room = 1;
				this.reset();
				FRAME.shake(25, 0.25);
				FRAME.playSound("thud" + (Math.floor(Math.random() * 3) + 1));
				FRAME.stopSound("themeMusic");
				FRAME.playSound("fightMusic");
			}
			if (!keyboard[32]) {
				this.spaceEnabled = true;
			}
		}
		else if (this.room == 1) {
			if (timesCompleted >= 1 && checkCollision(player, this.spaceship3)) {
				tooltip.move(this.spaceship3);
			}
			else {
				tooltip.move(FRAME);
			}
			
			//interact
			if (keyboard[32] && this.spaceEnabled) {
				if (tooltip.x == this.spaceship3.x) {
					if (this.spaceshipFixed == true) {
						this.spaceship3.fly();
						battleSpaceship = 3;
						this.playerRemoved = true;
						player.x = 0;
						FRAME.playSound("blast");
					}
					else {
						this.room = -1;
						this.dialogueType = 1;
						if (player.readSign == false && player.hasRepairKit == false) {
							background.change(FRAME.getImage("spaceshipIsBrokenBack"));
						}
						else if (player.readSign == true && player.hasRepairKit == false) {
							background.change(FRAME.getImage("spaceshipNeedToolsBack"));
						}
						else if (player.readSign == false && player.hasRepairKit == true) {
							background.change(FRAME.getImage("spaceshipNeedKnowledgeBack"));
						}
						else if (player.readSign == true && player.hasRepairKit == true) {
							background.change(FRAME.getImage("spaceshipFixBack"));
						}
					}
				}
				this.spaceEnabled = false;
			}
			else if (keyboard[32] == false) {
				this.spaceEnabled = true;
			}
			
			if (this.spaceship3.y <= -150) {
				this.manager.change("inSpace");
			}
			
			player.boundLeft();
			if (player.goneRight()) {
				this.room = 2;
				this.reset();
			}
			this.spaceship3.update(realTime);
		}
		else if (this.room == 2) {
			if (checkCollision(player, this.spaceship1)) {
				tooltip.move(this.spaceship1);
			}
			else if (timesCompleted >= 1 && checkCollision(player, this.spaceship2)) {
				tooltip.move(this.spaceship2);
			}
			else {
				tooltip.move(FRAME);
			}
			
			//interact
			if (keyboard[32] && this.spaceEnabled) {
				if (tooltip.x == this.spaceship1.x) {
					this.spaceship1.fly();
					battleSpaceship = 1;
					this.playerRemoved = true;
					player.x = 0;
					FRAME.playSound("blast");
				}
				else if (tooltip.x == this.spaceship2.x) {
					this.spaceship2.fly();
					battleSpaceship = 2;
					this.playerRemoved = true;
					player.x = 0;
					FRAME.playSound("blast");
				}
				
				this.spaceEnabled = false;
			}
			else if (keyboard[32] == false) {
				this.spaceEnabled = true;
			}
			
			if (this.spaceship1.y <= -150 || this.spaceship2.y <= -150) {
				this.manager.change("battle");
			}
			else if (player.goneLeft()) {
				this.room = 1;
				this.reset();
			}
			player.boundRight();
			this.spaceship1.update(realTime);
			this.spaceship2.update(realTime);
		}
		
		this.redThing.update();
		if (this.room != 0) {//to have red thing and moon not on the same y-axis
			this.moon.update(realTime);
		}
		tooltip.update();
		if (this.room != 0 && this.room != -1 && this.playerRemoved == false) {
			player.update(realTime);
		}
	}
	render(realTime) {
		background.draw();
		
		if (this.room != 0 && this.room != -1) {
			this.moon.draw();
			this.redThing.draw();
			this.greenery.draw();
		}
		if (this.room == 1) {
			if (timesCompleted > 0) {this.spaceship3.draw();}
		}
		else if (this.room == 2) {
			if (timesCompleted > 0) {this.spaceship2.draw();}
			this.spaceship1.draw();
		}
		
		if (this.room != -1) {
			tooltip.draw();
		}
		if (this.room != 0 && this.room != -1 && this.playerRemoved == false) {
			player.draw();
		}
	}
	onLoad() {
		this.spaceship1 = new Spaceship(1, 550, 310);
		this.spaceship2 = new Spaceship(2, 270, 310);
		this.spaceship3 = new Spaceship(3, 470, 310);
		this.room = 0;
		this.spaceEnabled = false;
		this.playerRemoved = false;
		tooltip.x = GAME_WIDTH / 2 - 20;
		tooltip.y = 280;
		player.x = 20 + player.width / 2;
		background.change(FRAME.getImage("whereBack"));
	}
	reset() {
		background.change(FRAME.getImage("forestBack"));
		if (this.room == 1) {
			this.greenery.change(FRAME.getImage("forestGreeneryBack"));
		}
		else if (this.room == 2) {
			this.greenery.change(FRAME.getImage("forestGreenery2Back"));
		}
	}
}

class BattleScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.back1 = new Background();
		this.back1.change(FRAME.getImage("space1Back"));
		this.back2 = new Background();
		this.back2.change(FRAME.getImage("space2Back"));
		this.back2.x = GAME_WIDTH;
		this.player = new BattleSpaceship(1);
		this.shot = false;
		this.timer = 0;
		this.pan = false;
		
		this.moon = new ImageActor(FRAME.getImage("moon"), 1300);
		this.earth = new ImageActor(FRAME.getImage("earth"), 1900);
		
		this.redThing = new RedThing(GAME_WIDTH - 40, 20);
		this.redThing.turnOnBattleMode();
	}
	update(realTime) {
		this.back1.x -= SPACE_SPEED;
		this.back2.x -= SPACE_SPEED;
		if (this.back1.x + GAME_WIDTH <= 0) {this.back1.x = GAME_WIDTH;}
		if (this.back2.x + GAME_WIDTH <= 0) {this.back2.x = GAME_WIDTH;}
		
		if (this.shot == false && timesCompleted == 0) {
			tooltip.move(this.player);
			if (this.player.bullets.objects.length > 0) {
				this.shot = true;
				tooltip.move(FRAME);
			}
		}
		
		for (var i = 0; i < this.player.bullets.objects.length; i++) {
			if (checkCollisionWithRedThing(this.player.bullets.objects[i], this.redThing)) {
				if (battleSpaceship == 1) {
					this.redThing.health -= 1;
					FRAME.shake(50, 0.25);
					FRAME.playSound("thud" + (Math.floor(Math.random() * 3) + 1));
					this.player.bullets.remove(this.player.bullets.objects[i]);
					
					if (this.redThing.health <= 0 && this.player.canMove == true) {
						if (battleSpaceship == 1) {
							this.player.canMove = false;
							this.redThing.turnOffBattleMode();
							this.redThing.rotation = Math.PI / 2;
							this.redThing.comeInTo(-310);
							FRAME.shake(20, 2);
							FRAME.playSound("die");
						}
					}
				}
				else if (battleSpaceship == 2) {
					this.player.canMove = false;
					this.redThing.fadeAway();
					this.pan = true;
				}
			}
		}
		
		if (this.pan) {
			for (var i = 0; i < this.player.bullets.objects.length; i++) {
				this.player.bullets.objects[i].x -= PAN_SPEED;
			}
			this.player.x -= PAN_SPEED;
			this.moon.x -= PAN_SPEED;
			this.earth.x -= PAN_SPEED;
			this.redThing.x -= PAN_SPEED;
			this.redThing.health = 0;
			
			this.moon.update();
			this.earth.update();
		}
		
		//set moon and earth's y-coordinate and collide them with the bullet
		if (this.player.bullets.objects.length >= 1 && battleSpaceship == 2) {
			if (checkCollisionWithRedThing(this.player.getFirstBullet(), this.redThing)) {
				FRAME.shake(50, 0.25);
				FRAME.playSound("thud" + (Math.floor(Math.random() * 3) + 1));
				this.moon.y = this.player.getFirstBullet().y - this.player.getFirstBullet().height / 2 + this.moon.height / 2;
				this.earth.y = this.player.getFirstBullet().y - this.player.getFirstBullet().height / 2 + this.earth.height / 2;
			}
			
			if (checkCollision(this.player.getFirstBullet(), this.moon)) {
				this.moon.fadeAway();
				FRAME.shake(50, 0.25);
				FRAME.playSound("thud" + (Math.floor(Math.random() * 3) + 1));
			}
			else if (checkCollision(this.player.getFirstBullet(), this.earth)) {
				this.earth.fadeAway();
				FRAME.shake(75, 0.4);
				FRAME.playSound("thud" + (Math.floor(Math.random() * 3) + 1));
				FRAME.playSound("dieQuiet");
			}
		}
		
		if (this.redThing.health <= 0) {
			this.timer += realTime;
			if (this.timer >= 2.5 && battleSpaceship == 1) {
				FRAME.stopSound("fightMusic");
				FRAME.playSound("themeMusic");
				this.manager.change("won");
			}
			else if (this.timer >= 5 && battleSpaceship == 2) {
				FRAME.stopSound("fightMusic");
				this.manager.change("title");
			}
		}
		
		tooltip.update();
		this.redThing.update(realTime);
		this.player.update(realTime);
	}
	render() {
		this.back1.draw();
		this.back2.draw();
		
		if (this.pan == true) {
			this.moon.draw();
			this.earth.draw();
		}
		
		this.player.draw();
		this.redThing.draw();
		FRAME.ctx.fillStyle = BACK_COLOR;
		FRAME.ctx.fillRect(GAME_WIDTH / 2, -500, GAME_WIDTH / 2, 500);
		tooltip.draw();
	}
	onLoad() {
		this.redThing = new RedThing(GAME_WIDTH - 40, 20);
		this.redThing.turnOnBattleMode();
		this.timer = 0;
		this.player = new BattleSpaceship(battleSpaceship, this.player.width/2, GAME_HEIGHT / 2 + this.player.height/2);
		this.pan = false;
	}
}

class AlienWorldScene extends Scene {
	constructor(manager) {
		super(manager);
	}
	update(realTime) {
		player.update(realTime);
		player.boundLeft();
		player.boundRight();
	}
	render() {
		background.draw();
		player.draw();
	}
	onLoad() {
		background.change(FRAME.getImage("alienWorldBack"));
	}
}

class WonScene extends Scene {
	constructor(manager) {
		super(manager);
		this.spaceEnabled = false;
	}
	update(realTime) {
		if (keyboard[32] && this.spaceEnabled == true) {
			this.manager.change("road");
			timesCompleted += 1;
			FRAME.shake(25, 0.25);
			FRAME.playSound("thud" + (Math.floor(Math.random() * 3) + 1));
		}
		if (keyboard[32] == false) {
			this.spaceEnabled = true;
		}
	}
	render() {
		background.draw();
	}
	onLoad() {
		background.change(FRAME.getImage("wonBack"));
		this.spaceEnabled = false;
	}
}

class TitleScene extends Scene {
	constructor(manager) {
		super(manager);
		this.spaceEnabled = false;
	}
	update(realTime) {
		if (keyboard[32] && this.spaceEnabled == true) {
			this.manager.change("road");
			FRAME.shake(25, 0.25);
			FRAME.playSound("thud" + (Math.floor(Math.random() * 3) + 1));
		}
		if (keyboard[32] == false) {
			this.spaceEnabled = true;
		}
		tooltip.update(realTime);
	}
	render() {
		background.draw();
		tooltip.draw();
	}
	onLoad() {
		FRAME.playSound("themeMusic");
		tooltip.x = GAME_WIDTH / 2;
		tooltip.y = 250;
		background.change(FRAME.getImage("titleBack"));
	}
	onUnload() {
		tooltip.move(FRAME);
	}
}

class InSpaceScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.back1 = new Background();
		this.back1.change(FRAME.getImage("space1Back"));
		this.back2 = new Background();
		this.back2.change(FRAME.getImage("space2Back"));
		this.back2.x = GAME_WIDTH;
		
		this.spaceship = new BattleSpaceship(3, -100, GAME_HEIGHT / 2);
		this.spaceship.y += this.spaceship.height / 2;
		
		this.timer = 0;
		this.room = 0;
	}
	update(realTime) {
		if (this.room == 0) {
			this.back1.x -= SPACE_SPEED;
			this.back2.x -= SPACE_SPEED;
			if (this.back1.x + GAME_WIDTH <= 0) {this.back1.x = GAME_WIDTH;}
			if (this.back2.x + GAME_WIDTH <= 0) {this.back2.x = GAME_WIDTH;}
			
			this.spaceship.x += 4;
			
			this.timer += realTime;
			if (this.timer >= 3.8) {
				this.room = 1;
				this.timer = 0;
				FRAME.playSound("thud" + (Math.floor(Math.random() * 3) + 1));
				FRAME.stopSound("flyingMusic");
			}
		}
		else if (this.room == 1) {
			this.timer += realTime;
			if (this.timer >= 1) {
				this.manager.change("alienWorld");
			}
		}
	}
	render() {
		if (this.room == 0) {
			this.back1.draw();
			this.back2.draw();
			
			this.spaceship.draw();
		}
		else if (this.room == 1) {
			background.draw();
		}
	}
	onLoad() {
		this.timer = 0;
		this.room = 0;
		background.change(FRAME.getImage("blackBack"));
		FRAME.stopSound("fightMusic");
		FRAME.playSound("flyingMusic");
	}
}