class Character extends Actor {
	constructor(x, y) {
		super(x, y);
		this.dangerous = false;
		this.health = 1;
		this.exp = 5;
		this.coins = 1;
		this.dead = false;
		this.parentRoom;
		
		this.hurt = function(player) {}
		this.collide = function(player) {}
	}
}

class Boxer extends Character {
	constructor(x, y) {
		super(x, y);
		
		this.idleImage = FRAME.getImage('boxerIdle');
		this.walkLeftStrip = new ImageStrip();
		this.walkLeftStrip.add(FRAME.getImage('boxerLeft1'));
		this.walkLeftStrip.add(FRAME.getImage('boxerLeft2'));
		this.walkRightStrip = new ImageStrip();
		this.walkRightStrip.add(FRAME.getImage('boxerRight1'));
		this.walkRightStrip.add(FRAME.getImage('boxerRight2'));
		
		this.coins = Math.floor(Math.random() * 3) + 3;
		this.stateTimer = 0;
		this.state = 1;//0=left,1=idle,2=right
		this.facingRight = false;
		this.image = this.idleImage;
		this.width = this.image.width * PIXEL_SCALING;//again, little worried about this
		this.height = this.image.height * PIXEL_SCALING;//see player class for more details
		
		this.hurt = function(player) {
			this.health -= 1;
			if (this.health <= 0) {
				this.dead = true;
				for (var i = 0; i < this.exp; i++) {
					this.parentRoom.addTile(new ExpTile(this.x, this.y));
				}
				for (var i = 0; i < this.coins; i++) {
					this.parentRoom.addTile(new CoinTile(this.x, this.y));
				}
			}
		}
		this.update = function(realTime, solids) {
			this.stateTimer -= realTime;
			if (this.stateTimer <= 0) {
				this.stateTimer = (Math.random() - 0.5) + BOXER_STATE_TIMER;
				this.state = Math.floor(Math.random() * 4);
			}
			
			var prevx = this.x;
			if (this.state == 0) {
				this.x -= BOXER_SPEED;
				this.facingRight = false;
			}
			else if (this.state == 2) {
				this.x += BOXER_SPEED;
				this.facingRight = true;
			}
			for (var i = 0; i < solids.length; i++) {
				if (hitTestObjects(solids[i], this)) {
					this.x = prevx;
				}
			}
			if (this.x - this.width / 2 < 0 || this.x + this.width / 2 > FRAME.game_width) {
				this.x = prevx;
			}
			
			if (prevx != this.x) {
				if (this.facingRight) {
					this.image = this.walkRightStrip.step(0.2, realTime);
				}
				else {
					this.image = this.walkLeftStrip.step(0.2, realTime);
				}
			}
			else {
				this.image = this.idleImage;
			}
		}
		this.render = function() {
			this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
		}
	}
}

class Sprite extends Character {
	constructor(x, y) {
		super(x, y);
		
		this.idleFrontImage = FRAME.getImage('spriteFront1');
		this.idleLeftImage = FRAME.getImage('spriteLeft1');
		this.idleRightImage = FRAME.getImage('spriteRight1');
		this.idleBackImage = FRAME.getImage('spriteBack1');
		this.walkFrontStrip = new ImageStrip();
		this.walkFrontStrip.add(FRAME.getImage('spriteFront1'));
		this.walkFrontStrip.add(FRAME.getImage('spriteFront2'));
		this.walkBackStrip = new ImageStrip();
		this.walkBackStrip.add(FRAME.getImage('spriteBack1'));
		this.walkBackStrip.add(FRAME.getImage('spriteBack2'));
		this.walkLeftStrip = new ImageStrip();
		this.walkLeftStrip.add(FRAME.getImage('spriteLeft1'));
		this.walkLeftStrip.add(FRAME.getImage('spriteLeft2'));
		this.walkRightStrip = new ImageStrip();
		this.walkRightStrip.add(FRAME.getImage('spriteRight1'));
		this.walkRightStrip.add(FRAME.getImage('spriteRight2'));
		
		this.light = false;
		this.invincible = false;
		this.invincibilityTimer = INVINCIBILITY_TIMER / 2;
		this.flickerTimer = FLICKER_TIMER;
		
		this.health = 2;
		this.exp = 15;
		this.coins = Math.floor(Math.random() * 11) + 5;
		this.timer = 0;
		this.direction = 1;//0=right,1=front,etc
		this.image = this.idleFrontImage;
		this.width = this.image.width * PIXEL_SCALING;
		this.height = this.image.height * PIXEL_SCALING;
		
		this.collide = function(player) {
			if (player.invincible == false) {
				player.health -= 1;
				player.invincible = true;
			}
			if (this.invincible == false) {
				this.health -= 1;
				this.invincible = true;
				if (this.health <= 0) {
					this.dead = true;
					for (var i = 0; i < this.exp; i++) {
						this.parentRoom.addTile(new ExpTile(this.x, this.y));
					}
					for (var i = 0; i < this.coins; i++) {
						this.parentRoom.addTile(new CoinTile(this.x, this.y));
					}
				}
			}
		}
		this.hurt = function(player) {
			if (this.invincible == false) {
				this.health -= 1;
				this.invincible = true;
				if (this.health <= 0) {
					this.dead = true;
					for (var i = 0; i < this.exp; i++) {
						this.parentRoom.addTile(new ExpTile(this.x, this.y));
					}
					for (var i = 0; i < this.coins; i++) {
						this.parentRoom.addTile(new CoinTile(this.x, this.y));
					}
				}
			}
		}
		this.update = function(realTime, solids) {
			if (this.invincible == true) {
				this.invincibilityTimer -= realTime;
				this.flickerTimer -= realTime;
				if (this.flickerTimer <= 0) {
					this.flickerTimer = FLICKER_TIMER;
					this.light = !this.light;
				}
				if (this.invincibilityTimer <= 0) {
					this.light = false;
					this.invincible = false;
					this.invincibilityTimer = INVINCIBILITY_TIMER;
					this.flickerTimer = FLICKER_TIMER;
				}
			}
			
			this.timer -= realTime;
			if (this.timer <= 0) {
				this.timer = SPRITE_TIMER + (Math.random() * 0.25 - 0.125);
				this.direction = Math.floor(Math.random() * 4);
			}
			
			var prevx = this.x;
			var prevy = this.y;
			if (this.direction == 0) {
				this.x += SPRITE_SPEED;
			}
			else if (this.direction == 2) {
				this.x -= SPRITE_SPEED;
			}
			for (var i = 0; i < solids.length; i++) {
				if (hitTestObjects(this, solids[i])) {
					this.x = prevx;
				}
			}
			if (this.x + this.width / 2 > FRAME.game_width || this.x - this.width / 2 < 0) {
				this.x = prevx;
			}
			if (this.direction == 3) {
				this.y -= SPRITE_SPEED;
			}
			else if (this.direction == 1) {
				this.y += SPRITE_SPEED;
			}
			for (var i = 0; i < solids.length; i++) {
				if (hitTestObjects(this, solids[i])) {
					this.y = prevy;
				}
			}
			if (this.y + this.height / 2 > FRAME.game_height || this.y - this.height / 2 < 0) {
				this.y = prevy;
			}
			
			if (prevx != this.x || prevy != this.y) {
				if (this.direction == 0) {
					this.image = this.walkRightStrip.step(0.2, realTime);
				}
				else if (this.direction == 1) {
					this.image = this.walkFrontStrip.step(0.2, realTime);
				}
				else if (this.direction == 2) {
					this.image = this.walkLeftStrip.step(0.2, realTime);
				}
				else {
					this.image = this.walkBackStrip.step(0.2, realTime);
				}
			}
			else {
				if (this.direction == 0) {
					this.image = this.idleRightImage;
				}
				else if (this.direction == 1) {
					this.image = this.idleFrontImage;
				}
				else if (this.direction == 2) {
					this.image = this.idleLeftImage;
				}
				else {
					this.image = this.idleBackImage;
				}
			}
		}
		this.render = function() {
			if (this.light) {this.ctx.globalAlpha = FLICKER_ALPHA;}
			this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
			this.ctx.globalAlpha = 1.0;
		}
	}
}