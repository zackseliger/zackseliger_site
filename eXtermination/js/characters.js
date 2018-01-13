class Character extends Actor {
	constructor(x, y, gun) {
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
		
		//equip/visual stuff
		this.image = null;
		this.inRightHand = null;
		this.rightHandx = 0;
		this.rightHandy = 0;
		this.helmet = null;
		this.headY = -2 * PIXEL_SIZE;
		this.torso = null;
		
		this.putInRightHand(weaponFromString(gun));
	}
	setScale(scale) {
		this.scale = scale;
		this.width = this.image.width * PIXEL_SIZE * this.scale;
		this.height = this.image.height * PIXEL_SIZE * this.scale;
		if (this.inRightHand != null) {
			this.inRightHand.width = this.inRightHand.image.width * PIXEL_SIZE * this.scale;
			this.inRightHand.height = this.inRightHand.image.height * PIXEL_SIZE * this.scale;
		}
		if (this.helmet != null) {
			this.helmet.setScale(scale);
		}
		if (this.torso != null) {
			this.torso.setScale(scale);
		}
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
			this.putInRightHand(this.inRightHand);
			
			if (Math.abs(this.inRightHand.rotation) > Math.PI / 2) {
				this.facingRight = false;
			}
			else if (Math.abs(this.inRightHand.rotation) < Math.PI / 2) {
				this.facingRight = true;
			}
		}
		
		//helmet
		if (this.helmet != null) {
			this.helmet.x = PIXEL_SIZE/2*this.scale;
			this.helmet.y = this.headY*this.scale;
			if (this.image == this.walkStrip.images[1]) {
				this.helmet.y += PIXEL_SIZE*this.scale;
			}
		}
		
		//torso
		if (this.torso != null) {
			this.torso.y = this.height/2 - PIXEL_SIZE*this.scale;
			if (this.image == this.walkStrip.images[1]) {
				this.torso.y += PIXEL_SIZE*this.scale;
			}
		}
		
		//bullets
		for (var i = 0; i < bullets.objects.length; i++) {
			if (bullets.objects[i].owner !== this && checkCollision(this, bullets.objects[i])) {
				bullets.objects[i].hitEnemy();
				this.dead = true;
				if (this.inRightHand !== null) this.dropRightHandItem();
			}
		}
		
		//on death
		if (this.dead == true) {
			//play sound
			var soundName = "hurt" + (Math.floor(Math.random() * 3) + 1);
			var id = FRAME.playSound(soundName);
			var vol = 90/distBetween(this, player);
			//particles
			for (var i = 0; i < 20; i++)
				particles.add(new SmokeParticle(this.x + Math.random() * this.width - this.width/2, this.y + Math.random() * this.height - this.height/2, PIXEL_SIZE + Math.random() * 2));
			//money
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
		if (this.helmet != null) this.helmet.draw();
		if (this.torso != null) this.torso.draw();
		if (manager.currentScene == "fight") this.shotTimer.draw();
		if (this.facingRight == false) this.ctx.scale(-1, 1);
	}
	putInRightHand(obj) {
		if (obj == null) obj = new EmptyGun();
		this.inRightHand = obj;
		this.inRightHand.owner = this;
		if (this.inRightHand != null) {
			this.inRightHand.width = this.inRightHand.image.width * PIXEL_SIZE * this.scale;
			this.inRightHand.height = this.inRightHand.image.height * PIXEL_SIZE * this.scale;
		}
		
		if (this.facingRight) this.inRightHand.x = this.x + this.rightHandx*this.scale;
		else this.inRightHand.x = this.x + -this.rightHandx*this.scale;
		if (this.image == this.idleImage) this.inRightHand.y = this.y + this.height/2 + this.rightHandy*this.scale;
		else this.inRightHand.y = this.y + this.height/2 + (this.rightHandy + PIXEL_SIZE)*this.scale;
	}
	dropRightHandItem() {
		if (this.inRightHand != null) {
			this.inRightHand.dropHeight = this.rightHandy+PIXEL_SIZE;
			this.inRightHand.owner = null;
			this.inRightHand = null;
		}
	}
	putOnHead(obj) {
		if (obj == null) return;
		this.helmet = obj;
		this.helmet.setScale(this.scale);
		this.helmet.x = PIXEL_SIZE/2*this.scale;
		this.helmet.y = this.headY*this.scale;
	}
	takeOffHelmet() {
		if (this.helmet != null) {
			this.helmet = null;
		}
	}
	putOnTorso(obj) {
		if (obj == null) return;
		this.torso = obj;
		this.torso.setScale(this.scale);
		this.torso.y = this.height/2 - PIXEL_SIZE*this.scale;
	}
	takeOffTorso() {
		if (this.torso != null) {
			this.torso = null;
		}
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
	reset() {
		this.image = this.idleImage;
		this.putOnTorso(this.torso);
		this.putOnHead(this.helmet);
		this.rotation = 0;
		this.facingRight = true;
		this.setScale(1);
	}
}

class Player extends Character {
	constructor(x, y) {
		super(x, y);
		
		this.walkStrip = new ImageStrip();
		this.walkStrip.add(FRAME.getImage("playerWalk1"));
		this.walkStrip.add(FRAME.getImage("playerWalk2"));
		this.idleImage = this.walkStrip.images[0];
		
		//player-specific stuff
		this.spaceEnabled = false;
		this.stage = 1;
		this.money = 0;
		this.type = "p";
		this.inventory = new Inventory(this, 0, 125);
		
		this.rightHandSquare = new InvSquare(-100, -175, "weapon");
		this.inventory.addSlot(this.rightHandSquare);
		this.weapon = new Gun();
		this.inventory.addItemAtIndex(new TileItem(this.weapon.image, "weapon", "pistol", 0), this.inventory.collection.objects.indexOf(this.rightHandSquare));
		this.helmetSquare = new InvSquare(-100, -300, "helmet");
		this.inventory.addSlot(this.helmetSquare);
		this.torsoSquare = new InvSquare(-100, -50, "torso");
		this.inventory.addSlot(this.torsoSquare);
		
		this.putInRightHand(this.weapon);
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
		
		for (var i = 0; i < weapons.objects.length; i++) {//picking up guns
			if (weapons.objects[i].owner == null && distBetween(this, weapons.objects[i]) < this.width*1.5 + weapons.objects[i].width) {
				if (keyboard[32] && this.spaceEnabled) {
					this.dropRightHandItem();
					this.putInRightHand(weapons.objects[i]);
					FRAME.playSound("swap");
				}
				else {
					weapons.objects[i].highlight();
				}
				
				break;
			}
		}
		if (keyboard[32]) {//space
			this.spaceEnabled = false;
		}
		else {
			this.spaceEnabled = true;
		}
		
		//gun stuff
		this.pointAt(mouse.x, mouse.y);
		if (mouse.clicking) this.shoot();
	}
	changeWeapon(obj) {
		this.dropRightHandItem();
		super.putInRightHand(obj);
		this.weapon = obj;
	}
	reset() {
		super.reset();
		this.dead = false;
		this.putInRightHand(this.weapon);
		if (this.weapon != null) this.weapon.rotation = 0;
	}
}

class ChaserEnemy extends Character {
	constructor(x, y, gun, target) {
		super(x, y, gun);
		
		this.walkStrip = new ImageStrip();
		this.walkStrip.add(FRAME.getImage("chaserEnemyWalk1"));
		this.walkStrip.add(FRAME.getImage("chaserEnemyWalk2"));
		
		this.idleImage = this.walkStrip.images[0];
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
	constructor(x, y, gun, target) {
		super(x, y, gun);
		
		this.walkStrip = new ImageStrip();
		this.walkStrip.add(FRAME.getImage("proximityEnemyWalk1"));
		this.walkStrip.add(FRAME.getImage("proximityEnemyWalk2"));
		
		this.idleImage = this.walkStrip.images[0];
		//this.putInRightHand(new Shotgun());
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
	constructor(x, y, gun, target) {
		super(x, y, gun);
		
		this.walkStrip = new ImageStrip();
		this.walkStrip.add(FRAME.getImage("randomEnemyWalk1"));
		this.walkStrip.add(FRAME.getImage("randomEnemyWalk2"));
		
		this.idleImage = this.walkStrip.images[0];
		//this.putInRightHand(new Gun());
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