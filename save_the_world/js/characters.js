class Player extends Actor {
	constructor(x, y) {
		super(x||0, y||0);
		this.canMove = true;
		this.hasHeadband = false;
		this.hasGlasses = false;
		this.readSign = false;
		this.hasRepairKit = false;
		
		this.walkLeftStrip = new ImageStrip();
		this.walkLeftStrip.add(FRAME.getImage("playerLeft1"));
		this.walkLeftStrip.add(FRAME.getImage("playerLeft2"));
		this.walkRightStrip = new ImageStrip();
		this.walkRightStrip.add(FRAME.getImage("playerRight1"));
		this.walkRightStrip.add(FRAME.getImage("playerRight2"));
		this.idleImage = FRAME.getImage("playerIdle");
		
		this.image = this.idleImage;
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
	}
	update(realTime) {
		if (this.canMove) {
			if (keyboard[65] || keyboard[37]) {
				this.x -= PLAYER_SPEED;
				this.image = this.walkLeftStrip.step(0.1, realTime);
			}
			else if (keyboard[68] || keyboard[39]) {
				this.x += PLAYER_SPEED;
				this.image = this.walkRightStrip.step(0.1, realTime);
			}
			else {
				this.image = this.idleImage;
			}
		}
		else {
			this.image = this.idleImage;
		}
	}
	render() {
		this.ctx.drawImage(this.image, -this.width / 2, -this.height, this.width, this.height);
	}
	setMoveable(m) {
		this.canMove = m;
	}
	setHeadbandStatus(stat) {
		this.hasHeadband = stat;
		
		if (this.hasHeadband == true) {
			this.walkLeftStrip = new ImageStrip();
			this.walkLeftStrip.add(FRAME.getImage("playerLeft1Headband"));
			this.walkLeftStrip.add(FRAME.getImage("playerLeft2Headband"));
			this.walkRightStrip = new ImageStrip();
			this.walkRightStrip.add(FRAME.getImage("playerRight1Headband"));
			this.walkRightStrip.add(FRAME.getImage("playerRight2Headband"));
			this.idleImage = FRAME.getImage("playerIdleHeadband");
		}
		else {
			this.walkLeftStrip = new ImageStrip();
			this.walkLeftStrip.add(FRAME.getImage("playerLeft1"));
			this.walkLeftStrip.add(FRAME.getImage("playerLeft2"));
			this.walkRightStrip = new ImageStrip();
			this.walkRightStrip.add(FRAME.getImage("playerRight1"));
			this.walkRightStrip.add(FRAME.getImage("playerRight2"));
			this.idleImage = FRAME.getImage("playerIdle");
		}
	}
	boundLeft() {
		if (this.x - this.width / 2 < PIXEL_SIZE * 2) {
			this.x += PLAYER_SPEED;
		}
	}
	boundRight() {
		if (this.x + this.width / 2 > GAME_WIDTH - PIXEL_SIZE * 2) {
			this.x -= PLAYER_SPEED;
		}
	}
	goneRight() {
		if (player.x - player.width / 2 > GAME_WIDTH) {
			player.x = player.width / 2;
			return true;
		}
		return false;
	}
	goneLeft() {
		if (player.x + player.width / 2 < 0) {
			player.x = GAME_WIDTH - player.width / 2;
			return true;
		}
		return false;
	}
}

class Oldie extends Actor {
	constructor(x, y) {
		super(x||0, y||0);
		
		this.idleStrip = new ImageStrip();
		this.idleStrip.add(FRAME.getImage("oldieIdle1"));
		this.idleStrip.add(FRAME.getImage("oldieIdle2"));
		
		this.image = this.idleStrip.images[0];
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
	}
	update(realTime) {
		this.image = this.idleStrip.step(0.4, realTime);
	}
	render() {
		this.ctx.drawImage(this.image, -this.width / 2, -this.height, this.width, this.height);
	}
}

class Lady extends Actor {
	constructor(x, y) {
		super(x||0, y||0);
		
		this.idleStrip = new ImageStrip();
		this.idleStrip.add(FRAME.getImage("ladyIdle1"));
		this.idleStrip.add(FRAME.getImage("ladyIdle2"));
		
		this.image = this.idleStrip.images[0];
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
	}
	update(realTime) {
		this.image = this.idleStrip.step(0.4, realTime);
	}
	render() {
		this.ctx.drawImage(this.image, -this.width / 2, -this.height, this.width, this.height);
	}
}

class RedThing extends Actor {
	constructor(x, y) {
		super(x||0, y||0);
		this.comingIn = false;
		this.finishedComingIn = false;
		this.fading = false;
		this.finishedFading = false;
		this.bobbingDown = true;
		this.health = 10;
		this.target = 0;
		this.boby = 0;
		//battle mode
		this.battleMode = false;
		this.headingUp = false;
		
		this.image = FRAME.getImage("redThingIdle");
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
		this.alpha = 1.0;
	}
	update(realTime) {
		//code for fading
		if (this.fading == true) {
			this.x -= 2;
			this.alpha -= 0.1;
			if (this.alpha < 0.0) this.alpha = 0.0;
		}
		if (this.fading == true && this.alpha <= 0.0) {
			this.fading = false;
			this.finishedFading = true;
		}
		
		if (this.battleMode == false) {
			//code for coming in
			if (this.comingIn == true) {
				this.y += (this.target - this.y) * 0.1;
			}
			if (this.comingIn == true && Math.round(this.y) == this.target) {
				this.y = this.target;
				this.comingIn = false;
				this.finishedComingIn = true;
			}
			
			//code for bobbing
			if (this.bobbingDown == true) {
				this.boby += 0.1;
			}
			else {
				this.boby -= 0.1;
			}
			if (Math.floor(this.boby) + 1 == PIXEL_SIZE && this.bobbingDown == true) {
				this.bobbingDown = false;
			}
			else if (Math.floor(this.boby) == 0 && this.bobbingDown == false) {
				this.bobbingDown = true;
			}
		}
		else {
			if (this.headingUp == true) {
				this.y -= RED_THING_BATTLE_SPEED;
			}
			else {
				this.y += RED_THING_BATTLE_SPEED;
			}
			if (this.y <= 0) {this.headingUp = false;}
			else if (this.y + this.width >= GAME_HEIGHT) {this.headingUp = true;}
			
			//code for dying
			if (false) {//if hit test bullet
				this.health -= 1;
			}
		}
	}
	render() {
		this.ctx.globalAlpha = this.alpha;
		this.ctx.drawImage(this.image, 0, this.boby, this.width, this.height);
		this.ctx.globalAlpha = 1.0;
	}
	comeInTo(tar) {
		this.comingIn = true;
		this.finishedComingIn = false;
		this.target = tar;
	}
	turnOnBattleMode() {
		this.battleMode = true;
		this.rotation = Math.PI / 2;
		this.headingUp = false;
	}
	turnOffBattleMode() {
		this.battleMode = false;
		this.rotation = 0;
	}
	fadeAway() {
		this.fading = true;
		this.finishedFading = false;
	}
}

class Spaceship extends Actor {
	constructor(type, x, y) {
		super(x||0, y||0);
		this.flying = false;
		
		this.flyStrip = new ImageStrip();
		this.flyStrip.add(FRAME.getImage("spaceship" + type + "Fly1"));
		this.flyStrip.add(FRAME.getImage("spaceship" + type + "Fly2"));
		this.idleImage = FRAME.getImage("spaceship" + type + "Idle");
		
		this.image = this.idleImage;
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
	}
	update(realTime) {
		if (this.flying) {
			this.y -= SPACESHIP_SPEED;
			this.image = this.flyStrip.step(0.2, realTime);
		}
	}
	render() {
		this.ctx.drawImage(this.image, -this.width / 2, -this.height, this.width, this.height);
	}
	fly() {
		this.flying = true;
	}
}

class BattleSpaceship extends Actor {
	constructor(type, x, y) {
		super(x||0, y||0);
		
		this.type = type;
		this.canMove = true;
		this.spaceEnabled = false;
		this.bullets = new Collection();
		
		this.image = FRAME.getImage("spaceship" + type + "Battle");
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
	}
	update(realTime) {
		if (this.canMove) {
			if (keyboard[87] || keyboard[38]) {
				if (this.y - this.height > 0) {
					this.y -= SPACESHIP_SPEED;
				}
			}
			if (keyboard[83] || keyboard[40]) {
				if (this.y < GAME_HEIGHT) {
					this.y += SPACESHIP_SPEED;
				}
			}
			if (keyboard[32] && this.spaceEnabled == true) {
				if (this.type == 1) {
					this.bullets.add(new Laser(30, 10, "#F74222", 20));
				}
				else if (this.type == 2) {
					this.bullets.add(new Laser(50, 30, "#F01C1C", 10));
				}
				
				this.bullets.objects[this.bullets.objects.length - 1].x = this.x + this.width / 2;
				this.bullets.objects[this.bullets.objects.length - 1].y = this.y - this.height / 2;
				
				FRAME.shake(25, 0.25);
				FRAME.playSound("thud" + Math.floor(Math.random() * 3 + 1));
				this.spaceEnabled = false;
			}
			if (keyboard[32] == false) {
				this.spaceEnabled = true;
			}
		}
		
		this.bullets.update(realTime);
	}
	draw() {
		this.ctx.translate(this.x, this.y);
		this.ctx.rotate(this.rotation);
		this.render();
		this.ctx.rotate(-this.rotation);
		this.ctx.translate(-this.x, -this.y);
		
		this.bullets.draw();
	}
	render() {
		this.ctx.drawImage(this.image, -this.width / 2, -this.height, this.width, this.height);
	}
	getFirstBullet() {
		return this.bullets.objects[0];
	}
}