class Character extends Actor {
	constructor(x, y) {
		super(x||0, y||0);
		
		this.width = 0;
		this.height = 0;
		this.scale = 1;
		this.dead = false;
		this.moveXAccum = 0;
		this.moveYAccum = 0;
		this.walkStrip = new ImageStrip();
		this.type = "c";
		this.shotTimer = new Timer(40, -40, 1);
		
		this.image = null;
		this.inRightHand = null;
		this.rightHandx = 0;
		this.rightHandy = 0;
	}
	setScale(scale) {
		this.scale = scale;
		this.width = this.image.width * PIXEL_SIZE * this.scale;
		this.height = this.image.height * PIXEL_SIZE * this.scale;
	}
	update(realTime) {
		//movement
		var prevx = this.x;
		var prevy = this.y;
		
		this.x += this.moveXAccum;
		if (checkCoveredBy(this, floor) === false) this.x = prevx;
		for (var i = 0; i < tiles.objects.length; i++) {
			if (tiles.objects[i].solid == true && checkCollision(this, tiles.objects[i])) {
				this.x = prevx;
				break;
			}
		}
		this.y += this.moveYAccum;
		if (checkCoveredBy(this, floor) === false) this.y = prevy;
		for (var i = 0; i < tiles.objects.length; i++) {
			if (tiles.objects[i].solid == true && checkCollision(this, tiles.objects[i])) {
				this.y = prevy;
				break;
			}
		}
		this.moveXAccum = 0;
		this.moveYAccum = 0;
		
		if (this.x != prevx || this.y != prevy) {
				this.image = this.walkStrip.step(0.1, realTime);
				if (this.x < prevx) {
					this.rotation += (-0.1 - this.rotation) * 0.2;
				}
				else if (this.x > prevx) {
					this.rotation += (0.1 - this.rotation) * 0.2;
				}
		}
		else {
			this.image = this.idleImage
		}
		this.rotation += (0 - this.rotation) * 0.1;
		
		//shotTimer
		this.shotTimer.update(realTime);
		
		//gun
		if (this.inRightHand != null) {
			if (this.facingRight) this.inRightHand.x = this.x + this.rightHandx;
			else this.inRightHand.x = this.x + -this.rightHandx;
			if (this.image == this.idleImage) this.inRightHand.y = this.y + this.height/2 + this.rightHandy;
			else this.inRightHand.y = this.y + this.height/2 + (this.rightHandy + PIXEL_SIZE);
			
			if (Math.abs(this.inRightHand.rotation) > Math.PI / 2) {
				this.facingRight = false;
			}
			else if (Math.abs(this.inRightHand.rotation) < Math.PI / 2) {
				this.facingRight = true;
			}
		}
		
		//bullet
		for (var i = 0; i < bullets.objects.length; i++) {
			if (bullets.objects[i].owner !== this && checkCollision(this, bullets.objects[i])) {
				this.dead = true;
				if (this.inRightHand !== null) this.dropRightHandItem();
			}
		}
		
		//drop money
		if (this.dead == true) {
			var numMoney = this.money / 4;
			if (this.money == undefined) numMoney = 25;
			else this.money -= Math.round(this.money/4);
			for (var i = 0; i < numMoney; i++) {
				tiles.add(new Coin(this.x, this.y, -this.height/2 + Math.random() * 10 - 5));
			}
		}
	}
	render() {
		if (this.facingRight == false) this.ctx.scale(-1, 1);
		this.ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
		if (inEditor == false) this.shotTimer.draw();
		if (this.facingRight == false) this.ctx.scale(-1, 1);
	}
	putInRightHand(obj) {
		this.inRightHand = obj;
		this.inRightHand.owner = this;
		
		if (this.facingRight) this.inRightHand.x = this.x + this.rightHandx;
		else this.inRightHand.x = this.x + -this.rightHandx;
		if (this.image == this.idleImage) this.inRightHand.y = this.y + this.rightHandy;
		else this.inRightHand.y = this.y + (this.rightHandy + PIXEL_SIZE);
	}
	dropRightHandItem() {
		this.inRightHand.dropHeight = this.rightHandy;
		this.inRightHand.owner = null;
		this.inRightHand = null;
	}
	pointAt(xpos, ypos) {
		if (this.inRightHand != null) {
			var y = ypos - this.inRightHand.y;
			var x = xpos - this.inRightHand.x;
			this.inRightHand.rotation = Math.atan2(y, x);
		}
	}
	shoot() {
		if (this.inRightHand != null) this.inRightHand.shoot();
	}
	moveX(amt) {
		this.moveXAccum += amt;
	}
	moveY(amt) {
		this.moveYAccum += amt;
	}
}

class Player extends Character {
	constructor(x, y) {
		super(x, y);
		
		this.walkStrip = new ImageStrip();
		this.walkStrip.add(FRAME.getImage("playerWalk1"));
		this.walkStrip.add(FRAME.getImage("playerWalk2"));
		
		this.idleImage = this.walkStrip.images[0];
		this.putInRightHand(weapon);
		
		//player-specific stuff
		this.stage = 1;
		this.money = 0;
		this.type = "p";
		
		this.facingRight = true;
		this.image = this.idleImage;
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
		this.rightHandx = 3 * PIXEL_SIZE;
		this.rightHandy = -6 * PIXEL_SIZE;
	}
	update(realTime) {
		super.update(realTime);
		
		//moving x/y
		if (keyboard[87] || keyboard[38]) {//w
			this.moveY(-PLAYER_SPEED);
		}
		if (keyboard[83] || keyboard[40]) {//s
			this.moveY(PLAYER_SPEED);
		}
		if (keyboard[65] || keyboard[37]) {//a
			this.moveX(-PLAYER_SPEED);
		}
		if (keyboard[68] || keyboard[39]) {//d
			this.moveX(PLAYER_SPEED);
		}
		
		//gun stuff
		this.pointAt(mouse.x, mouse.y);
		if (mouse.clicking) this.shoot();
	}
}

class ChaserEnemy extends Character {
	constructor(x, y, target) {
		super(x, y);
		
		this.walkStrip = new ImageStrip();
		this.walkStrip.add(FRAME.getImage("chaserEnemyWalk1"));
		this.walkStrip.add(FRAME.getImage("chaserEnemyWalk2"));
		
		this.idleImage = this.walkStrip.images[0];
		this.putInRightHand(new Gun());
		this.inRightHand.timer = 0.5;
		if (target === undefined) this.target = player;
		else this.target = target;
		this.type = "ce";
		
		this.movementSpeed = PLAYER_SPEED - 1.5;
		this.facingRight = true;
		this.image = this.idleImage;
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
		this.rightHandx = 3 * PIXEL_SIZE;
		this.rightHandy = -7 * PIXEL_SIZE;
	}
	update(realTime) {
		super.update(realTime);
		
		if (Math.abs(this.y - this.target.y) + Math.abs(this.x - this.target.x) < 800) {
			if (Math.abs(this.y - this.target.y) + Math.abs(this.x - this.target.x) > 200) {
				if (this.y > this.target.y) {
					this.moveY(-this.movementSpeed);
				}
				if (this.y < this.target.y) {
					this.moveY(this.movementSpeed);
				}
				if (this.x > this.target.x) {
					this.moveX(-this.movementSpeed);
				}
				if (this.x < this.target.x) {
					this.moveX(this.movementSpeed);
				}
			}
			
			this.pointAt(this.target.x, this.target.y - this.target.height * 0.1);
			this.shoot();
		}
	}
}

class ProximityEnemy extends Character {
	constructor(x, y, target) {
		super(x, y);
		
		this.walkStrip = new ImageStrip();
		this.walkStrip.add(FRAME.getImage("proximityEnemyWalk1"));
		this.walkStrip.add(FRAME.getImage("proximityEnemyWalk2"));
		
		this.idleImage = this.walkStrip.images[0];
		this.putInRightHand(new Shotgun());
		if (target === undefined) this.target = player;
		else this.target = target;
		this.type = "pe";
		
		this.movementSpeed = PLAYER_SPEED - 3;
		this.facingRight = true;
		this.image = this.idleImage;
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
		this.rightHandx = 3 * PIXEL_SIZE;
		this.rightHandy = -5 * PIXEL_SIZE;
	}
	update(realTime) {
		super.update(realTime);
		
		if (Math.abs(this.y - this.target.y) + Math.abs(this.x - this.target.x) < 500) {
			if (this.y > this.target.y) {
				this.moveY(-this.movementSpeed);
			}
			if (this.y < this.target.y) {
				this.moveY(this.movementSpeed);
			}
			if (this.x > this.target.x) {
				this.moveX(-this.movementSpeed);
			}
			if (this.x < this.target.x) {
				this.moveX(this.movementSpeed);
			}
			
			this.pointAt(this.target.x, this.target.y - this.target.height * 0.1);
			this.shoot();
		}
	}
}

class RandomEnemy extends Character {
	constructor(x, y, target) {
		super(x, y);
		
		this.walkStrip = new ImageStrip();
		this.walkStrip.add(FRAME.getImage("randomEnemyWalk1"));
		this.walkStrip.add(FRAME.getImage("randomEnemyWalk2"));
		
		this.idleImage = this.walkStrip.images[0];
		this.putInRightHand(new Gun());
		if (target === undefined) this.target = player;
		else this.target = target;
		this.type = "re";
		
		this.movex = 0;
		this.movey = 0;
		this.timer = 0;
		this.movementSpeed = PLAYER_SPEED/2;
		this.facingRight = true;
		this.image = this.idleImage;
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
		this.rightHandx = 3 * PIXEL_SIZE;
		this.rightHandy = -6 * PIXEL_SIZE;
	}
	update(realTime) {
		super.update(realTime);
		
		this.timer -= realTime;
		if (this.timer <= 0) {
			this.timer = 0.5;
			var randx = Math.random();
			var randy = Math.random();
			
			if (randx < 0.33) {
				this.movex = -1;
			}
			else if (randx < 0.66) {
				this.movex = 1;
			}
			else this.movex = 0;
			
			if (randy < 0.33) {
				this.movey = -1;
			}
			else if (randy < 0.66) {
				this.movey = 1;
			}
			else this.movey = 0;
		}
		
		if (this.movex == -1) this.moveX(-this.movementSpeed);
		if (this.movex == 1) this.moveX(this.movementSpeed);
		if (this.movey == -1) this.moveY(-this.movementSpeed);
		if (this.movey == 1) this.moveY(this.movementSpeed);
		
		if (Math.abs(this.y - this.target.y) + Math.abs(this.x - this.target.x) < window.innerWidth/4 + window.innerHeight/4) {
			this.pointAt(this.target.x, this.target.y - this.target.height * 0.1);
			this.shoot();
		}
	}
}