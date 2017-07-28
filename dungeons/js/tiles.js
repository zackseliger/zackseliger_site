class Tile extends Actor {
	constructor(x, y, w, h, solid) {
		super(x, y);
		this.width = w;
		this.height = h;
		this.solid = solid || false;
		this.dead = false;
		
		this.update = function(players) {}
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
	constructor(x, y) {
		super(x, y, 20, 20, false);
		
		this.update = function(players) {
			for (var i = 0; i < players.length; i++) {
				if (hitTestObjects(this, players[i])) {
					players[i].coins += 1;
					this.dead = false;
				}
			}
		}
		this.render = function() {
			this.ctx.fillStyle = "#EE9900";
			this.ctx.fillRect(-10, -10, 20, 20);
		}
	}
}