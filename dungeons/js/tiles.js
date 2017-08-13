class Tile extends Actor {
	constructor(x, y, w, h, solid) {
		super(x, y);
		this.width = w;
		this.height = h;
		this.solid = solid || false;
		this.dead = false;
		this.parentRoom;
		
		this.collide = function(player) {}
	}
}

class WallTile extends Tile {
	constructor(x, y, w, h) {
		super(x, y, w, h, true);
		
		this.render = function() {
			this.ctx.fillStyle = "#222";
			this.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
		}
	}
}

class RockTile extends Tile {
	constructor(x, y) {
		super(x, y, 0, 0, true);
		
		this.imageNumber = Math.floor(Math.random() * 2 + 1);
		this.image = FRAME.getImage("rock" + this.imageNumber);
		this.width = this.image.width * PIXEL_SCALING;
		this.height = this.image.height * PIXEL_SCALING;
		
		this.render = function() {
			this.ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
		}
	}
}

class CoinTile extends Tile {
	constructor(x, y, xvel, yvel) {
		super(x, y, COIN_SIZE, COIN_SIZE, false);
		this.xVel = xvel || (Math.random() * COIN_SPEED * 2) - COIN_SPEED;
		this.yVel = yvel || (Math.random() * COIN_SPEED * 2) - COIN_SPEED;
		
		this.update = function(realTime) {
			var prevx = this.x;
			var prevy = this.y;
			var solids = this.parentRoom.getSolidTiles();
			
			this.x += this.xVel;
			for (var i = 0; i < solids.length; i++) {
				if (hitTestObjects(this, solids[i])) {
					this.x = prevx;
				}
			}
			this.y += this.yVel;
			for (var i = 0; i < solids.length; i++) {
				if (hitTestObjects(this, solids[i])) {
					this.y = prevy;
				}
			}
			this.xVel *= 0.95;
			this.yVel *= 0.95;
		}
		this.collide = function(player) {
			FRAME.playSound('coin' + (Math.floor(Math.random() * 4) + 1));
			player.coins += 1;
			this.dead = true;
		}
		this.render = function() {
			this.ctx.fillStyle = "#FFEE44";
			this.ctx.fillRect(-COIN_SIZE/2, -COIN_SIZE/2, COIN_SIZE, COIN_SIZE);
		}
	}
}

class ExpTile extends Tile {
	constructor(x, y, xvel, yvel) {
		super(x, y, COIN_SIZE, COIN_SIZE, false);
		this.xVel = xvel || (Math.random() * COIN_SPEED * 2) - COIN_SPEED;
		this.yVel = yvel || (Math.random() * COIN_SPEED * 2) - COIN_SPEED;
		
		this.update = function(realTime) {
			var prevx = this.x;
			var prevy = this.y;
			var solids = this.parentRoom.getSolidTiles();
			
			this.x += this.xVel;
			for (var i = 0; i < solids.length; i++) {
				if (hitTestObjects(this, solids[i])) {
					this.x = prevx;
				}
			}
			this.y += this.yVel;
			for (var i = 0; i < solids.length; i++) {
				if (hitTestObjects(this, solids[i])) {
					this.y = prevy;
				}
			}
			this.xVel *= 0.95;
			this.yVel *= 0.95;
		}
		this.collide = function(player) {
			player.exp += 1;
			this.dead = true;
			FRAME.playSound('exp' + (Math.floor(Math.random() * 5) + 1));
		}
		this.render = function() {
			this.ctx.fillStyle = "#44EEFF";
			this.ctx.fillRect(-COIN_SIZE/2, -COIN_SIZE/2, COIN_SIZE, COIN_SIZE);
		}
	}
}

class HealthTile extends Tile {
	constructor(x, y, xvel, yvel) {
		super(x, y, COIN_SIZE, COIN_SIZE, false);
		this.xVel = xvel || (Math.random() * COIN_SPEED * 2) - COIN_SPEED;
		this.yVel = yvel || (Math.random() * COIN_SPEED * 2) - COIN_SPEED;
		
		this.update = function(realTime) {
			var prevx = this.x;
			var prevy = this.y;
			var solids = this.parentRoom.getSolidTiles();
			
			this.x += this.xVel;
			for (var i = 0; i < solids.length; i++) {
				if (hitTestObjects(this, solids[i])) {
					this.x = prevx;
				}
			}
			this.y += this.yVel;
			for (var i = 0; i < solids.length; i++) {
				if (hitTestObjects(this, solids[i])) {
					this.y = prevy;
				}
			}
			this.xVel *= 0.95;
			this.yVel *= 0.95;
		}
		this.collide = function(player) {
			if (player.health < player.maxHealth) {
				player.health += 1;
				this.dead = true;
			}
		}
		this.render = function() {
			this.ctx.fillStyle = "#EE2222";
			this.ctx.fillRect(-COIN_SIZE, -COIN_SIZE, COIN_SIZE*2, COIN_SIZE*2);
		}
	}
}

class TutorialTile extends Tile {
	constructor() {
		super(0, 0);
		this.lines = [];
		this.lines.push(new Text(FRAME.game_width / 2, FRAME.game_height / 2 - 100, "Use W, A, S, D to move", "Arial", "#222", 20, "center"));
		this.lines.push(new Text(FRAME.game_width / 2, FRAME.game_height / 2 - 50, "Space to shoot", "Arial", "#222", 20, "center"));
		this.lines.push(new Text(FRAME.game_width / 2, FRAME.game_height / 2, "Make it through the dungeon for upgrade points", "Arial", "#222", 20, "center"));
		
		this.render = function() {
			for (var i = 0; i < this.lines.length; i++) {
				this.lines[i].draw();
			}
		}
	}
}

class EndTile extends Tile {
	constructor(x, y) {
		super(x, y, FRAME.game_width, END_TILE_SIZE);
		
		this.update = function() {
			this.height += (FRAME.game_height*2 - this.height) * 0.1;
			if (FRAME.game_height*2 - this.height <= 0.1) {
				this.parentRoom.winAnimationDone = true;
			}
		}
		this.render = function() {
			this.ctx.fillStyle = "#222";
			this.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
		}
	}
}

class SpikeTile extends Tile {
	constructor(x, y) {
		super(x, y);
		this.dangerousImage = FRAME.getImage('spikesDangerous');
		this.safeImage = FRAME.getImage('spikesSafe');
		
		this.dangerous = true;
		this.switchTimer = 0;
		this.image = this.dangerousImage;
		this.width = this.image.width * PIXEL_SCALING;
		this.height = this.image.height * PIXEL_SCALING;
		
		this.collide = function(player) {
			if (this.dangerous && player.invincible == false) {
				player.health -= 1;
				player.invincible = true;
			}
		}
		this.update = function(realTime) {
			this.switchTimer += realTime;
			if (this.switchTimer >= SPIKE_TIMER) {
				this.switchTimer = 0;
				this.dangerous = !this.dangerous
			}
			
			if (this.dangerous) {
				this.image = this.dangerousImage;
			}
			else {
				this.image = this.safeImage;
			}
		}
		this.render = function() {
			this.ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
		}
	}
}

class ChestTile extends Tile {
	constructor(x, y) {
		super(x, y);
		this.closedImage = FRAME.getImage('chestClosed');
		this.openImage = FRAME.getImage('chestOpen');
		
		this.exp = Math.floor(Math.random() * 6) + 2;
		this.gold = Math.floor(Math.random() * 11) + 5;
		this.health = Math.floor(Math.random() * 3);
		this.chestOpen = false;
		this.image = this.closedImage;
		this.width = this.image.width * PIXEL_SCALING;
		this.height = this.image.height * PIXEL_SCALING
		
		this.collide = function(player) {
			if (this.chestOpen == false) {
				this.image = this.openImage;
				this.chestOpen = true;
				this.width = this.image.width * PIXEL_SCALING;
				this.height = this.image.height * PIXEL_SCALING
				
				for (var i = 0; i < this.exp; i++) {
					this.parentRoom.addTile(new ExpTile(this.x, this.y, Math.random() * 6 - 3, Math.random() * -3 - 3));
				}
				for (var i = 0; i < this.gold; i++) {
					this.parentRoom.addTile(new CoinTile(this.x, this.y, Math.random() * 6 - 3, Math.random() * -3 - 3));
				}
				for (var i = 0; i < this.health; i++) {
					this.parentRoom.addTile(new HealthTile(this.x, this.y, Math.random() * 6 - 3, Math.random() * -3 - 3));
				}
			}
		}
		this.render = function() {
			this.ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
		}
	}
}