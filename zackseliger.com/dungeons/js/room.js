class Room extends Actor {
	constructor(col) {
		super(FRAME.game_width / 2, FRAME.game_height / 2);
		this.color = col || "#222";
		this.tiles = [];
		this.characters = [];
		this.hasWalls = false;
		
		this.addTile = function(tile, test) {
			var keepOffWalls = test || false;
			if (keepOffWalls == true) {
				while (tile.x + tile.width/2 > FRAME.game_width - 10 || tile.x < FRAME.game_width / 3 && tile.x + tile.width/2 > FRAME.game_width / 3) {
					tile.x -= 1;
				}
				while (tile.x - tile.width/2 < 10 || tile.x > FRAME.game_width * 2 / 3 && tile.x - tile.width/2 < FRAME.game_width * 2 / 3) {
					tile.x += 1;
				}
				while (tile.y - tile.height/2 < 10 || tile.y > FRAME.game_height * 2 / 3 && tile.y - tile.height/2 < FRAME.game_height * 2 / 3) {
					tile.y += 1;
				}
				while (tile.y + tile.height/2 > FRAME.game_height - 10 || tile.y < FRAME.game_height / 3 && tile.y + tile.height/2 > FRAME.game_height / 3) {
					tile.y -= 1;
				}
			}
			this.tiles.push(tile);
		}
		this.getSolidTiles = function() {
			var solidTiles = [];
			for (var i = 0; i < this.tiles.length; i++) {
				if (this.tiles[i].solid) {
					solidTiles.push(this.tiles[i]);
				}
			}
			return solidTiles;
		}
		this.addCharacter = function(character) {
			this.characters.push(character);
		}
		this.hurtCharacter = function(index, player) {
			this.characters[index].hurt(player);
		}
		this.getCharacters = function() {
			return this.characters;
		}
		this.update = function(realTime, players) {
			Object.getPrototypeOf(this).update.apply(this, [realTime]);
			//update characters
			for (var i = 0; i < this.characters.length; i++) {
				this.characters[i].update(realTime, this.getSolidTiles());
				if (this.characters[i].dead == true) {
					this.characters.splice(i, 1);
				}
			}
			//update tiles
			for (var i = 0; i < this.tiles.length; i++) {
				this.tiles[i].update(players);
				if (this.tiles[i].dead) {
					this.tiles.splice(i, 1);
				}
			}
		}
		this.render = function() {
			this.ctx.fillStyle = this.color;
			this.ctx.fillRect(-FRAME.game_height / 2, -FRAME.game_height / 2, FRAME.game_height, FRAME.game_height);
		}
		this.draw = function() {
			Object.getPrototypeOf(this).draw.apply(this);
			for (var i = 0; i < this.tiles.length; i++) {
				this.tiles[i].draw();
			}
			for (var i = 0; i < this.characters.length; i++) {
				this.characters[i].draw();
			}
		}
		this.makeStartRoom = function() {
			this.tiles.splice(0, this.tiles.length);
			this.characters.splice(0, this.characters.length);
		}
		
		//adding rocks
		for (var i = 0; i < 8; i++) {
			var xpos = 0;
			var ypos = 0;
			if (Math.random() > 0.5) {
				xpos = Math.random() * FRAME.game_width / 3;
			}
			else {
				xpos = FRAME.game_width - (Math.random() * FRAME.game_width / 3);
			}
			if (Math.random() > 0.5) {
				ypos = Math.random() * FRAME.game_height / 3;
			}
			else {
				ypos = FRAME.game_height - (Math.random() * FRAME.game_height / 3);
			}
			if (Math.random() > 0.6) {
				this.addTile(new RockTile(xpos, ypos), true);
			}
		}
		//boxers
		for (var i = 0; i < 4; i++) {
			var xpos = FRAME.game_width / 2;
			var ypos = Math.random() * (FRAME.game_height - 40) + 20;
			
			if (Math.random() > 0.5) {
				this.addCharacter(new Boxer(xpos, ypos));
			}
		}
		for (var i = 0; i < 3; i++) {
			var xpos = FRAME.game_width / 2;
			var ypos = FRAME.game_width / 2;
			
			if (Math.random() < 0.5) {
				xpos = (Math.random() * (FRAME.game_width - 300)) + 150;
			}
			else {
				ypos = (Math.random() * (FRAME.game_height - 300)) + 150;
			}
			
			if (Math.random() > 0.8) {
				this.addCharacter(new Sprite(xpos, ypos));
			}
		}
		
		//adding walls/doors functions
		this.addLeftDoor = function() {
			this.addTile(new WallTile(0, FRAME.game_height / 6, 20, FRAME.game_height / 3));
			this.addTile(new WallTile(0, FRAME.game_height * 5 / 6, 20, FRAME.game_height / 3));
		}
		this.addLeftWall = function() {
			this.addTile(new WallTile(0, FRAME.game_height / 2, 20, FRAME.game_height));
		}
		this.addRightDoor = function() {
			this.addTile(new WallTile(FRAME.game_width, FRAME.game_height / 6, 20, FRAME.game_height / 3));
			this.addTile(new WallTile(FRAME.game_width, FRAME.game_height * 5 / 6, 20, FRAME.game_height / 3));
		}
		this.addRightWall = function() {
			this.addTile(new WallTile(FRAME.game_width, FRAME.game_height / 2, 20, FRAME.game_height));
		}
		this.addTopDoor = function() {
			this.addTile(new WallTile(FRAME.game_width / 6, 0, FRAME.game_width / 3, 20));
			this.addTile(new WallTile(FRAME.game_width * 5 / 6, 0, FRAME.game_width / 3, 20));
		}
		this.addTopWall = function() {
			this.addTile(new WallTile(FRAME.game_width / 2, 0, FRAME.game_width, 20));
		}
		this.addBottomDoor = function() {
			this.addTile(new WallTile(FRAME.game_width / 6, FRAME.game_height, FRAME.game_width / 3, 20));
			this.addTile(new WallTile(FRAME.game_width * 5 / 6, FRAME.game_height, FRAME.game_width / 3, 20));
		}
		this.addBottomWall = function() {
			this.addTile(new WallTile(FRAME.game_width / 2, FRAME.game_height, FRAME.game_width, 20));
		}
	}
}