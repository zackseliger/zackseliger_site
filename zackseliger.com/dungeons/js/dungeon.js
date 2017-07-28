class Dungeon {
	constructor() {
		this.players = [];
		this.rooms = [[]];
		this.currx = 0;
		this.curry = 0;
		
		this.addPlayer = function(player) {
			player.x = FRAME.game_width / 2;
			player.y = FRAME.game_height / 2;
			this.players.push(player);
		}
		this.addRoom = function(x, y, room) {
			if (this.rooms[x] == undefined) this.rooms[x] = [];
			this.rooms[x][y] = room;
		}
		this.changeRooms = function(x, y) {
			this.currx = x;
			this.curry = y;
			
			for (var i = 0; i < this.players.length; i++) {
				this.players[i].bullets.clear();
			}
			
			if (this.rooms[x][y].hasWalls == false) {
				if (x > 0 && this.rooms[x-1][y] != undefined) {
					this.rooms[x][y].addLeftDoor();
				}
				else {
					this.rooms[x][y].addLeftWall();
				}
				if (x < this.rooms.length - 1 && this.rooms[x+1][y] != undefined) {
					this.rooms[x][y].addRightDoor();
				}
				else {
					this.rooms[x][y].addRightWall();
				}
				if (y > 0 && this.rooms[x][y-1] != undefined) {
					this.rooms[x][y].addTopDoor();
				}
				else {
					this.rooms[x][y].addTopWall();
				}
				if (y < this.rooms[x].length - 1 && this.rooms[x][y+1] != undefined) {
					this.rooms[x][y].addBottomDoor();
				}
				else {
					this.rooms[x][y].addBottomWall();
				}
			}
			this.rooms[x][y].hasWalls = true;
		}
		this.makeStartRoom = function(x, y) {
			this.rooms[x][y].makeStartRoom();
		}
		this.update = function(realTime) {
			var prevx = this.currx;
			var prevy = this.curry;
			this.rooms[this.currx][this.curry].update(realTime, this.players);
			for (var i = 0; i < this.players.length; i++) {
				this.players[i].update(realTime, this.rooms[this.currx][this.curry]);
				if (this.players[i].x - this.players[i].width/2 > FRAME.game_width) {
					this.currx += 1;
					this.players[i].x -= FRAME.game_width;
				}
				else if (this.players[i].x + this.players[i].width/2 < 0) {
					this.currx -= 1;
					this.players[i].x += FRAME.game_width;
				}
				else if (this.players[i].y - this.players[i].height/2 > FRAME.game_height) {
					this.curry += 1;
					this.players[i].y -= FRAME.game_height;
				}
				else if (this.players[i].y + this.players[i].height/2 < 0) {
					this.curry -= 1;
					this.players[i].y += FRAME.game_height;
				}
			}
			if (prevx != this.currx || prevy != this.curry) {
				this.changeRooms(this.currx, this.curry);
			}
		}
		this.draw = function() {
			this.rooms[this.currx][this.curry].draw();
			for (var i = 0; i < this.players.length; i++) {
				this.players[i].draw();
			}
			
			FRAME.ctx.fillStyle = "#222";
			FRAME.ctx.fillRect(-200, 0, 200, FRAME.game_height);
			FRAME.ctx.fillRect(FRAME.game_width, 0, 200, FRAME.game_height);
			FRAME.ctx.fillRect(0, -200, FRAME.game_width, 200);
			FRAME.ctx.fillRect(0, FRAME.game_height, FRAME.game_width, 200);
		}
	}
}