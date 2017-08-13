class Player extends Actor {
	constructor(startx, starty) {
		super(startx, starty);
		//images and image strips
		this.idleFrontImage = FRAME.getImage('lawlessFront1');
		this.idleBackImage = FRAME.getImage('lawlessBack1');
		this.idleRightImage = FRAME.getImage('lawlessRight1');
		this.idleLeftImage = FRAME.getImage('lawlessLeft1');
		this.walkFrontStrip = new ImageStrip();
		this.walkFrontStrip.add(FRAME.getImage('lawlessFront1'));
		this.walkFrontStrip.add(FRAME.getImage('lawlessFront2'));
		this.walkBackStrip = new ImageStrip();
		this.walkBackStrip.add(FRAME.getImage('lawlessBack1'));
		this.walkBackStrip.add(FRAME.getImage('lawlessBack2'));
		this.walkRightStrip = new ImageStrip();
		this.walkRightStrip.add(FRAME.getImage('lawlessRight1'));
		this.walkRightStrip.add(FRAME.getImage('lawlessRight2'));
		this.walkLeftStrip = new ImageStrip();
		this.walkLeftStrip.add(FRAME.getImage('lawlessLeft1'));
		this.walkLeftStrip.add(FRAME.getImage('lawlessLeft2'));
		
		this.flickerTimer = FLICKER_TIMER;
		this.light = true;
		this.invincible = true;
		this.invinTimer = INVINCIBILITY_TIMER;
		
		this.direction = 1;//0=right,1=down,2=left,3=up
		this.rightRepeat = false;
		this.downRepeat = false;
		this.leftRepeat = false;
		this.upRepeat = false;
		this.bullets = new Collection();
		this.bulletTimer = PLAYER_BULLET_TIMER;
		this.exp = 0;
		this.maxExp = 10;
		this.level = 1;
		this.coins = 0;
		this.health = PLAYER_STARTING_HEALTH;
		this.prevHealth = this.health;
		this.maxHealth = PLAYER_STARTING_HEALTH;
		this.facingFront = true;
		this.image = this.idleFrontImage;
		this.width = this.image.width * PIXEL_SCALING;//concerned about this
		this.height = this.image.height * PIXEL_SCALING;//worried image won't load in time
		this.levelText = new Text(this.width/2, -this.height/2-17, this.level, "Arial", "#222", 15, "right");
		
		this.update = function(realTime, room) {
			if (this.invincible) {
				this.invinTimer -= realTime;
				this.flickerTimer -= realTime;
				if (this.flickerTimer <= 0) {
					this.light = !this.light;
					this.flickerTimer = 0.1;
				}
				if (this.invinTimer <= 0) {
					this.invincible = false;
					this.flickerTimer = FLICKER_TIMER;
					this.light = false;
					this.invinTimer = INVINCIBILITY_TIMER;
				}
			}
			
			var prevX = this.x;
			var prevY = this.y;
			var solids = room.getSolidTiles();
			var tiles = room.tiles;
			var characters = room.getCharacters();
			
			//get user input, and correct collision with solids on each axis
			if (keyboard[65] || keyboard[37]) {//A
				if (this.leftRepeat == false) {
					this.direction = 2;
					this.leftRepeat = true;
				}
				this.x -= PLAYER_SPEED;
			}
			else {
				this.upRepeat = false;
				this.downRepeat = false;
				this.leftRepeat = false;
				this.rightRepeat = false;
			}
			if (keyboard[68] || keyboard[39]) {//D
				if (this.rightRepeat == false) {
					this.direction = 0;
					this.rightRepeat = true;
				}
				this.x += PLAYER_SPEED;
			}
			else {
				this.upRepeat = false;
				this.downRepeat = false;
				this.leftRepeat = false;
				this.rightRepeat = false;
			}
			for (var i = 0; i < solids.length; i++) {
				if (hitTestObjects(this, solids[i])) {
					this.x = prevX;
					break;
				}
			}
			if (keyboard[87] || keyboard[38]) {//W
				if (this.upRepeat == false) {
					this.direction = 3;
					this.upRepeat = true;
				}
				this.y -= PLAYER_SPEED;
				this.facingFront = false;
			}
			else {
				this.upRepeat = false;
				this.downRepeat = false;
				this.leftRepeat = false;
				this.rightRepeat = false;
			}
			if (keyboard[83] || keyboard[40]) {//S
				if (this.downRepeat == false) {
					this.direction = 1;
					this.downRepeat = true;
				}
				this.y += PLAYER_SPEED;
				this.facingFront = true;
			}
			else {
				this.upRepeat = false;
				this.downRepeat = false;
				this.leftRepeat = false;
				this.rightRepeat = false;
			}
			for (var i = 0; i < solids.length; i++) {
				if (hitTestObjects(this, solids[i])) {
					this.y = prevY;
					break;
				}
			}
			if (keyboard[32] && this.bulletTimer <= 0) {
				var xvel = 0;
				var yvel = 0;
				if (this.direction == 0) {
					xvel = BULLET_SPEED;
				}
				else if (this.direction == 1) {
					yvel = BULLET_SPEED;
				}
				else if (this.direction == 2) {
					xvel = -BULLET_SPEED;
				}
				else if (this.direction == 3) {
					yvel = -BULLET_SPEED;
				}
				this.bullets.add(new Bullet(this.x, this.y, xvel, yvel));
				this.bulletTimer = PLAYER_BULLET_TIMER;
			}
			this.bulletTimer -= realTime;
			
			//manage bullets
			this.bullets.update();
			for (var i = 0; i < this.bullets.objects.length; i++) {
				for (var j = 0; j < characters.length; j++) {
					if (hitTestObjects(characters[j], this.bullets.objects[i])) {
						room.hurtCharacter(j, this);
						this.bullets.remove(this.bullets.objects[i]);
						break;
					}
				}
				if (this.bullets.objects[i] != undefined) {
					for (var j = 0; j < solids.length; j++) {
						if (hitTestObjects(solids[j], this.bullets.objects[i]) == true) {
							this.bullets.remove(this.bullets.objects[i]);
							break;
						}
					}
				}
				if (this.bullets.objects[i] != undefined) {
					if (this.bullets.objects[i].x < -50 ||
						this.bullets.objects[i].x > FRAME.game_width + 50 ||
						this.bullets.objects[i].y < -50 ||
						this.bullets.objects[i].y > FRAME.game_height + 50) {
						this.bullets.remove(this.bullets.objects[i]);
					}
				}
			}
			
			//colliding with characters and tiles
			for (var i = 0; i < characters.length; i++) {
				if (hitTestObjects(characters[i], this)) {
					characters[i].collide(this);
				}
			}
			for (var i = 0; i < tiles.length; i++) {
				if (hitTestObjects(tiles[i], this)) {
					tiles[i].collide(this);
				}
			}
			
			//level up
			if (this.exp >= this.maxExp) {
				this.exp -= this.maxExp;
				this.maxExp *= 3;
				this.level += 1;
				this.levelText.text = this.level;
			}
			
			//see if hurt, play sound
			if (this.prevHealth > this.health) {
				FRAME.playSound('hurt' + (Math.floor(Math.random() * 3) + 1));
			}
			this.prevHealth = this.health;
			
			//change image
			if (prevX != this.x || prevY != this.y) {
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
			this.ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
			for (var i = 0; i < this.health; i++) {
				this.ctx.fillStyle = "#EE2222";
				this.ctx.fillRect(-this.width/2 + i*13, -this.height/2-12, 10, 10);
			}
			this.levelText.draw();
			this.ctx.globalAlpha = 1;
		}
		this.draw = function() {
			this.bullets.draw();
			Object.getPrototypeOf(this).draw.apply(this);
		}
	}
}