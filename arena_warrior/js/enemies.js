class Enemy extends Actor {
	constructor(x, y, img) {
		super(x, y);
		this.image = img;
		this.width = this.image.width*PIXEL_SIZE;
		this.height = this.image.height*PIXEL_SIZE;
		this.displayWidth = 0;
		this.displayHeight = 0;
		this.isEnemy = true;
		this.chaseRange = -1;

		this.polygon = new Polygon(x,y,this.width/2);
		this.polygon.addPoint(1,-this.height/this.width);
		this.polygon.addPoint(1,this.height/this.width);
		this.polygon.addPoint(-1,this.height/this.width);
		this.polygon.addPoint(-1,-this.height/this.width);

		//check for collision SOLID tiles and move on x/y-axis if colliding
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.dead = true;
				return;
			}
		}
	}
	update() {
		//lerp to correct size
		if (this.displayWidth != this.width) {
			this.displayWidth += (this.width - this.displayWidth) * 0.2;
			this.displayHeight += (this.height - this.displayHeight) * 0.2;
			if (Math.abs(this.displayWidth - this.width) < 0.01) {
				this.displayWidth = this.width;
				this.displayHeight = this.height;
			}
		}

		//update polygon
		this.polygon.x = this.x;
		this.polygon.y = this.y;
		this.polygon.rotation = this.rotation;
	}
	render() {
		this.ctx.drawImage(this.image, -this.displayWidth/2, -this.displayHeight/2, this.displayWidth, this.displayHeight);
	}
	hurt() {

	}
	die() {

	}
}

class Bee extends Enemy {
	constructor(x,y) {
		super(x,y,FRAME.getImage("bee"));

		this.facingRight = true;
		this.xVel = 0;
		this.yVel = 0;

		this.coverImage = FRAME.getImage("beeRed");
		this.coverAlpha = 0.0;

		this.target = player;
		this.speed = 0.02;
	}
	update() {
		var prevx = this.x;
		var prevy = this.y;

		if (Math.abs(this.x - this.target.x) + Math.abs(this.y - this.target.y) < this.chaseRange) {
			//move towards player
			if (this.x-this.width/2 > this.target.x) {
				this.xVel += -this.speed;
			}
			else if (this.x+this.width/2 < this.target.x) {
				this.xVel += this.speed;
			}
			if (this.y-this.height/2 > this.target.y) {
				this.yVel += -this.speed;
			}
			else if (this.y+this.height/2 < this.target.y) {
				this.yVel += this.speed;
			}
		}
		else {
			//move randomly if too far away
			this.xVel += Math.random()*0.1 - 0.05;
			this.yVel += Math.random()*0.1 - 0.05;
		}

		//move bee, but move back if colliding with something
		this.x += this.xVel;
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.x = prevx;
			}
		}
		this.y += this.yVel;
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.y = prevy;
			}
		}
		this.xVel *= 0.99;
		this.yVel *= 0.99;

		if (prevx < this.x) {
			this.facingRight = true;
		}
		else if (prevx > this.x) {
			this.facingRight = false;
		}

		//rotate based on velocity
		this.rotation = this.xVel/5;

		if (this.coverAlpha > 0.0) {
			this.coverAlpha -= 0.05;
			if (this.coverAlpha < 0.0)
				this.coverAlpha = 0.0;
		}

		super.update();
	}
	render() {
		if (!this.facingRight) this.ctx.scale(-1,1,1);
		super.render();
		this.ctx.globalAlpha = this.coverAlpha;
		this.ctx.drawImage(this.coverImage, -this.displayWidth/2, -this.displayHeight/2, this.displayWidth, this.displayHeight);
		this.ctx.globalAlpha = 1.0;
		if (!this.facingRight) this.ctx.scale(-1,1,1);
	}
	hurt() {
		this.coverAlpha = 1.0;
		this.die();
	}
	die() {
		this.dead = true;
		new Coin(this.x, this.y);
		if (Math.random() < 0.25) {
			new Coin(this.x, this.y);
		}
	}
}

class Ghost extends Enemy {
	constructor(x, y) {
		super(x, y, FRAME.getImage("ghost"));

		this.dying = false;

		//flicker effect
		this.alpha = 0.8;
		this.alphaOsc = Math.random()*2*Math.PI;
		this.alphaRate = Math.random()*0.07;

		//movement stuff
		this.speed = 0.05;
		this.xVel = 0;
		this.yVel = 0;
		this.xAccel = 0;
		this.yAccel = 0;
		this.timer = 0;

		//for attacking
		this.target = player;
		this.shootTimer = 100;
	}
	update() {
		var prevx = this.x;
		var prevy = this.y;

		if (Math.abs(this.x - this.target.x) + Math.abs(this.y - this.target.y) < this.chaseRange) {
			//move towards player
			if (this.x-this.width/2 > this.target.x) {
				this.xVel += -this.speed;
			}
			else if (this.x+this.width/2 < this.target.x) {
				this.xVel += this.speed;
			}
			if (this.y-this.height/2 > this.target.y) {
				this.yVel += -this.speed;
			}
			else if (this.y+this.height/2 < this.target.y) {
				this.yVel += this.speed;
			}
		}
		else {
			//change accelerations when this.timer <= 0
			//move randomly
			this.timer -= 1;
			if (this.timer <= 0) {
				this.timer = 50;

				if (Math.random() < 0.5)
					this.xAccel = -this.speed;
				else
					this.xAccel = this.speed;

				if (Math.random() < 0.5)
					this.yAccel = -this.speed;
				else
					this.yAccel = this.speed;
			}
			this.xVel += this.xAccel;
			this.yVel += this.yAccel;
		}

		//move ghost, and maybe move back if colliding with a solid tile
		this.x += this.xVel;
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.x = prevx;
			}
		}
		this.y += this.yVel;
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.y = prevy;
			}
		}
		this.xVel *= 0.9;
		this.yVel *= 0.9;

		//rotate based on velocity
		this.rotation = this.xVel/5;

		//flicker effect
		if (this.dying) {
			this.alpha -= 0.1;
			if (this.alpha <= 0.0) {
				this.alpha = 0.0;
				this.die();
			}
		}
		else {
			this.alphaOsc += this.alphaRate;
			this.alpha = 0.8 + Math.sin(this.alphaOsc)*0.1;
		}

		//attacking player
		if (this.dying == false) {
			if (this.shootTimer > 0)
				this.shootTimer--;
			if (this.shootTimer == 0 && Math.abs(this.target.x - this.x) + Math.abs(this.target.y - this.y) < 300) {
				this.shootTimer = 100;
				var angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
				projectiles.add(new Fireball(this, angle, 5, this.target));
			}
		}

		super.update();
	}
	render() {
		this.ctx.globalAlpha = this.alpha;
		super.render();
		this.ctx.globalAlpha = 1.0;
	}
	hurt() {
		this.dying = true;
	}
	die() {
		this.dead = true;

		var numCoins = Math.floor(Math.random()*3)+3;
		for (var i = 0; i < numCoins; i++) {
			new Coin(this.x, this.y);
		}
	}
}

class BigGhost extends Enemy {
	constructor(x, y) {
		super(x, y, FRAME.getImage("bigGhost"));

		this.coverImage = FRAME.getImage("bigGhostCover");
		this.coverImageAlpha = 0.0;
		this.health = 2;
		this.dying = false;

		//flicker effect
		this.alpha = 0.8;
		this.alphaOsc = Math.random()*2*Math.PI;
		this.alphaRate = Math.random()*0.07;

		//movement stuff
		this.speed = 0.08;
		this.xVel = 0;
		this.yVel = 0;
		this.xAccel = 0;
		this.yAccel = 0;
		this.timer = 0;

		//for attacking
		this.target = player;
		this.shootTimer = 100;
		this.shooting = true;
	}
	update() {
		var prevx = this.x;
		var prevy = this.y;

		if (Math.abs(this.x - this.target.x) + Math.abs(this.y - this.target.y) < this.chaseRange) {
			//move towards player
			if (this.x-this.width/2 > this.target.x) {
				this.xVel += -this.speed;
			}
			else if (this.x+this.width/2 < this.target.x) {
				this.xVel += this.speed;
			}
			if (this.y-this.height/2 > this.target.y) {
				this.yVel += -this.speed;
			}
			else if (this.y+this.height/2 < this.target.y) {
				this.yVel += this.speed;
			}
		}
		else {
			//change accelerations when this.timer <= 0
			//move randomly
			this.timer -= 1;
			if (this.timer <= 0) {
				this.timer = 50;

				if (Math.random() < 0.5)
					this.xAccel = -this.speed;
				else
					this.xAccel = this.speed;

				if (Math.random() < 0.5)
					this.yAccel = -this.speed;
				else
					this.yAccel = this.speed;
			}
			this.xVel += this.xAccel;
			this.yVel += this.yAccel;
		}

		//move ghost, and maybe move back if colliding with a solid tile
		this.x += this.xVel;
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.x = prevx;
			}
		}
		this.y += this.yVel;
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.y = prevy;
			}
		}
		this.xVel *= 0.9;
		this.yVel *= 0.9;

		//rotate based on velocity
		this.rotation = this.xVel/10;

		//flicker effect
		if (this.dying) {
			this.alpha -= 0.1;
			if (this.alpha <= 0.0) {
				this.alpha = 0.0;
				this.die();
			}
		}
		else {
			this.alphaOsc += this.alphaRate;
			this.alpha = 0.85 + Math.sin(this.alphaOsc)*0.1;
		}

		//danger thing
		this.coverImageAlpha -= 0.01;
		if (this.coverImageAlpha < 0) {
			this.coverImageAlpha = 0.0;
		}

		//attacking player
		if (this.dying == false) {
			if (this.shootTimer > 0)
				this.shootTimer--;
			if (this.shootTimer == 0 && Math.abs(this.target.x - this.x) + Math.abs(this.target.y - this.y) < 350) {
				this.shootTimer = 100;
				var angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
				for (let i = 0; i < 5; i++) {
					projectiles.add(new Fireball(this, angle, 7, this.target));
					angle += Math.PI/10;
				}
			}
		}

		super.update();
	}
	render() {
		this.ctx.globalAlpha = this.alpha;
		super.render();
		this.ctx.globalAlpha = this.coverImageAlpha;
		this.ctx.drawImage(this.coverImage, -this.displayWidth/2, -this.displayHeight/2, this.displayWidth, this.displayHeight);
		this.ctx.globalAlpha = 1.0;
	}
	hurt() {
		if (this.coverImageAlpha < 0.2) {
			this.health--;
			if (this.health > 0) this.coverImageAlpha = 1.0;
		}
		if (this.health <= 0) {
			this.dying = true;
		}
	}
	die() {
		this.dead = true;

		var numCoins = Math.floor(Math.random()*10)+13;
		for (var i = 0; i < numCoins; i++) {
			new Coin(this.x, this.y);
		}
	}
}

class Fireball extends Actor {
	constructor(owner, rot, speed, target) {
		super(owner.x, owner.y, rot);

		this.image = FRAME.getImage("fireball");
		this.width = PIXEL_SIZE*3;
		this.height = PIXEL_SIZE*3;

		this.polygon = new Polygon(this.x, this.y, this.width/2);
		this.polygon.addPoint(1,-this.height/this.width);
		this.polygon.addPoint(1,this.height/this.width);
		this.polygon.addPoint(-1,this.height/this.width);
		this.polygon.addPoint(-1,-this.height/this.width);

		this.target = target;
		this.speed = speed;
		this.harmful = true;
		this.alpha = 1.0;
	}
	update() {
		this.x += this.speed*Math.cos(this.rotation);
		this.y += this.speed*Math.sin(this.rotation);
		this.speed *= 0.98;

		if (this.speed <= 1) {
			this.alpha -= 0.05;
			if (this.alpha <= 0.0) {
				this.alpha = 0.0;
				this.dead = true;
			}
			else if (this.alpha <= 0.5)
				this.harmful = false;
		}

		this.polygon.x = this.x;
		this.polygon.y = this.y;
		this.polygon.rotation = this.rotation;

		if (this.harmful && checkSATCollision(this.polygon, this.target.polygon)) {
			this.target.hurt();
		}
	}
	render() {
		this.ctx.globalAlpha = this.alpha;
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
		this.ctx.globalAlpha = 1.0;
	}
}

class Spiker extends Enemy {
	constructor(x, y) {
		super(x, y, FRAME.getImage("spiker"));
		this.xVel = 0;
		this.yVel = 0;
		this.spikeTimer = 0;
		this.target = player;
		this.speed = 0.01;
	}
	update() {
		var prevx = this.x;
		var prevy = this.y;

		if (Math.abs(this.x - this.target.x) + Math.abs(this.y - this.target.y) < this.chaseRange) {
			//move towards player
			if (this.x-this.width/2 > this.target.x) {
				this.xVel += -this.speed;
			}
			else if (this.x+this.width/2 < this.target.x) {
				this.xVel += this.speed;
			}
			if (this.y-this.height/2 > this.target.y) {
				this.yVel += -this.speed;
			}
			else if (this.y+this.height/2 < this.target.y) {
				this.yVel += this.speed;
			}
		}
		else {
			//move randomly if too far away
			this.xVel += Math.random()*0.2 - 0.1;
			this.yVel += Math.random()*0.2 - 0.1;
		}

		//move spiker, but move back if colliding with something
		this.x += this.xVel;
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.x = prevx;
			}
		}
		this.y += this.yVel;
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.y = prevy;
			}
		}
		this.xVel *= 0.99;
		this.yVel *= 0.99;

		if (prevx < this.x) {
			this.facingRight = true;
		}
		else if (prevx > this.x) {
			this.facingRight = false;
		}

		//rotate based on velocity
		this.rotation = this.xVel/5;

		//shoot spikes
		this.spikeTimer++;
		if (this.spikeTimer >= 100 && Math.abs(this.x - this.target.x) + Math.abs(this.y - this.target.y) < 500) {
			this.spikeTimer = 0;
			let angle = 0;
			for (let i = 0; i < 4; i++) {
				let x = this.x + Math.cos(this.rotation+angle)*this.width/2;
				let y = this.y + Math.sin(this.rotation+angle)*this.height/2;
				projectiles.add(new Spike(x, y, this.rotation+angle, 2, this.target));
				angle += Math.PI/2;
			}
		}

		super.update();
	}
	hurt() {
		this.die();
	}
	die() {
		this.dead = true;

		var numCoins = Math.floor(Math.random()*4)+3;
		for (var i = 0; i < numCoins; i++) {
			new Coin(this.x, this.y);
		}
	}
}

class Spike extends Actor {
	constructor(x, y, rot, speed, target) {
		super(x, y, rot);

		this.speed = speed;
		this.target = target;
		this.image = FRAME.getImage("spike");
		this.width = PIXEL_SIZE*1.5;
		this.height = PIXEL_SIZE*1.5;
		this.alpha = 1.0;
		this.harmful = true;

		this.polygon = new Polygon(this.x, this.y, this.width/2);
		this.polygon.addPoint(1,-this.height/this.width);
		this.polygon.addPoint(1,this.height/this.width);
		this.polygon.addPoint(-1,this.height/this.width);
		this.polygon.addPoint(-1,-this.height/this.width);
	}
	update() {
		this.x += Math.cos(this.rotation)*this.speed;
		this.y += Math.sin(this.rotation)*this.speed;

		this.speed *= 0.96;
		if (this.speed < 1) {
			this.alpha -= 0.05;
			if (this.alpha <= 0.6) {
				this.harmful = false;
			}
			if (this.alpha <= 0.0) {
				this.alpha = 0.0;
				this.dead = true;
			}
		}

		//damage target
		if (this.harmful && checkSATCollision(this.polygon, this.target.polygon)) {
			this.target.hurt();
		}

		this.polygon.x = this.x;
		this.polygon.y = this.y;
		this.polygon.rotation = this.rotation;
	}
	render() {
		this.ctx.globalAlpha = this.alpha;
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
		this.ctx.globalAlpha = 1.0;
	}
}

class Chaser extends Enemy {
	constructor(x,y) {
		super(x,y,FRAME.getImage("chaser1"));
		this.walkStrip = new ImageStrip();
		this.walkStrip.add(FRAME.getImage("chaser1"));
		this.walkStrip.add(FRAME.getImage("chaser2"));

		this.coverImages = [FRAME.getImage("chaser1cover"), FRAME.getImage("chaser2cover")];
		this.coverAlpha = 0;
		this.harmful = false;

		this.facingRight = true;
		this.target = player;
		this.fastSpeed = 2.75;
		this.xVel = 0;
		this.yVel = 0;
		this.walkTimer = 0;
		this.chasingTarget = false;
		this.chaseRange = 300;
	}
	update() {
		super.update();
		var prevx = this.x;
		var prevy = this.y;

		this.image = this.walkStrip.step(10, 1);

		//look for target
		if (Math.abs(this.x - this.target.x) + Math.abs(this.y - this.target.y) <= this.chaseRange) {
			this.chasingTarget = true;
		}
		else {
			this.chasingTarget = false;
		}

		//move randomly if not chasing
		if (this.chasingTarget == false) {
			this.walkTimer--;
			if (this.walkTimer <= 0) {
				this.walkTimer = 75;
				this.xVel = Math.floor(Math.random()*3)-1;
				this.yVel = Math.floor(Math.random()*3)-1;
			}

			this.coverAlpha = 0.0;
			this.harmful = false;
		}
		//chase target
		else {
			if (this.x-this.width/2 > this.target.x) {
				this.xVel = -this.fastSpeed;
			}
			else if (this.x+this.width/2 < this.target.x) {
				this.xVel = this.fastSpeed;
			}
			if (this.y-this.height/2 > this.target.y) {
				this.yVel = -this.fastSpeed;
			}
			else if (this.y+this.height/2 < this.target.y) {
				this.yVel = this.fastSpeed;
			}
			this.image = this.walkStrip.step(15, 1);

			//udpate coverAlpha and harmful properties
			if (this.harmful) {
				this.coverAlpha -= 0.05;
				if (this.coverAlpha < 0.5) {
					this.harmful = false;
				}
			}
			else {
				this.coverAlpha -= 0.05;
				if (this.coverAlpha < 0.0) {
					this.coverAlpha = 1.0;
					this.harmful = true;
				}
			}

			//harm target
			if (this.harmful && checkSATCollision(this.polygon, this.target.polygon)) {
				this.target.hurt();
			}
		}


		//rotate and move, check for solid tile collision
		this.x += this.xVel;
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.x = prevx;
			}
		}
		this.y += this.yVel;
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.y = prevy;
			}
		}
		this.rotation += (this.xVel/10 - this.rotation) * 0.2;

		//update facingRight
		if (this.x != prevx) {
			if (this.x - prevx > 0) {
				this.facingRight = true;
			}
			else if (this.x - prevx < 0){
				this.facingRight = false;
			}
		}
	}
	render() {
		if (this.facingRight == false) this.ctx.scale(-1,1,1);
		super.render();
		this.ctx.globalAlpha = this.coverAlpha;
		this.ctx.drawImage(this.coverImages[this.walkStrip.iter], -this.displayWidth/2, -this.displayHeight/2, this.displayWidth, this.displayHeight);
		this.ctx.globalAlpha = 1.0;
		if (this.facingRight == false) this.ctx.scale(-1,1,1);
	}
	hurt() {
		this.die();
	}
	die() {
		this.dead = true;

		var numCoins = Math.floor(Math.random()*3)+2;
		for (var i = 0; i < numCoins; i++) {
			new Coin(this.x, this.y);
		}
	}
}

class Imp extends Enemy {
	constructor(x, y) {
		super(x, y, FRAME.getImage("imp1"));
		this.walkStrip = new ImageStrip();
		this.walkStrip.add(FRAME.getImage("imp1"));
		this.walkStrip.add(FRAME.getImage("imp2"));
		this.facingRight = true;

		this.coverImage1 = FRAME.getImage("imp1cover");
		this.coverImage2 = FRAME.getImage("imp2cover");
		this.coverImageAlpha = 1.0;
		this.invincible = false;
		this.invincibilityTimer = 0;

		this.xVel = 0;
		this.yVel = 0;
		this.speed = 1;
		this.target = player;
		this.health = 2;
		this.chaseRange = 500;

		this.bulletTimer = 0;
	}
	update() {
		super.update();
		var prevx = this.x;
		var prevy = this.y;

		//chase player
		if (Math.abs(this.x - this.target.x) + Math.abs(this.y - this.target.y) <= this.chaseRange) {
			if (this.x-this.width/4 > this.target.x) {
				this.xVel = -this.speed;
			}
			else if (this.x+this.width/4 < this.target.x) {
				this.xVel = this.speed;
			}
			if (this.y-this.height/4 > this.target.y) {
				this.yVel = -this.speed;
			}
			else if (this.y+this.height/4 < this.target.y) {
				this.yVel = this.speed;
			}
		}
		else {
			this.xVel = 0;
			this.yVel = 0;
		}

		//move and check for collisions with solid tiles
		this.x += this.xVel;
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.x = prevx;
			}
		}
		this.y += this.yVel;
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.y = prevy;
			}
		}

		//timer for invincibility
		if (this.invincible) {
			this.invincibilityTimer++;
			this.coverImageAlpha -= 0.05;
			if (this.invincibilityTimer >= 20) {
				this.coverImageAlpha = 0;
				this.invincible = false;
			}
		}

		//shoot at target
		if (this.target.y < this.y + this.height && this.target.y > this.y - this.height && Math.abs(this.target.x - this.x) + Math.abs(this.target.y - this.y) <= this.chaseRange) {
			if (this.bulletTimer >= 60) {
				let rotation = Math.PI;
				if (this.facingRight) {
					rotation = 0;
				}
				projectiles.add(new ImpRay(this.x, this.y, rotation, 6, this.target));
				this.bulletTimer = 0;
			}
		}

		this.bulletTimer += 1;

		//update facingRight
		if (this.x != prevx || this.y != prevy) {
			if (this.x - prevx > 0) {
				this.facingRight = true;
			}
			else if (this.x - prevx < 0){
				this.facingRight = false;
			}

			this.image = this.walkStrip.step(15, 1);
		}

		this.rotation += (this.xVel/15 - this.rotation) * 0.2;
	}
	render() {
		if (this.facingRight == false) this.ctx.scale(-1,1,1);
		super.render();
		if (this.invincible) {
			this.ctx.globalAlpha = this.coverImageAlpha;
			let coverImage = this.coverImage1;
			if (this.walkStrip.iter == 1) {
				coverImage = this.coverImage2;
			}
			this.ctx.drawImage(coverImage, -this.displayWidth/2, -this.displayHeight/2, this.displayWidth, this.displayHeight);
			this.ctx.globalAlpha = 1.0;
		}
		if (this.facingRight == false) this.ctx.scale(-1,1,1);
	}
	hurt() {
		if (this.invincible == false) {
			this.health--;
			if (this.health <= 0) this.die();
			this.invincible = true;
		}
	}
	die() {
		this.dead = true;

		var numCoins = Math.floor(Math.random()*4)+4;
		for (var i = 0; i < numCoins; i++) {
			new Coin(this.x, this.y);
		}
	}
}

class ImpRay extends Actor {
	constructor(x, y, rot, speed, target) {
		super(x, y, rot);

		this.speed = speed;
		this.target = target;
		this.image = FRAME.getImage("fireball");
		this.width = PIXEL_SIZE*1.2;
		this.height = PIXEL_SIZE*1.2;
		this.alpha = 1.0;
		this.harmful = true;

		this.polygon = new Polygon(this.x, this.y, this.width/2);
		this.polygon.addPoint(1,-this.height/this.width);
		this.polygon.addPoint(1,this.height/this.width);
		this.polygon.addPoint(-1,this.height/this.width);
		this.polygon.addPoint(-1,-this.height/this.width);
	}
	update() {
		this.x += Math.cos(this.rotation)*this.speed;
		this.y += Math.sin(this.rotation)*this.speed;

		this.speed *= 0.98;
		if (this.speed < 2) {
			this.alpha -= 0.05;
			if (this.alpha <= 0.6) {
				this.harmful = false;
			}
			if (this.alpha <= 0.0) {
				this.alpha = 0.0;
				this.dead = true;
			}
		}

		//damage target
		if (this.harmful && checkSATCollision(this.polygon, this.target.polygon)) {
			this.target.hurt();
		}

		this.polygon.x = this.x;
		this.polygon.y = this.y;
		this.polygon.rotation = this.rotation;
	}
	render() {
		this.ctx.globalAlpha = this.alpha;
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
		this.ctx.globalAlpha = 1.0;
	}
}

class Crystal extends Enemy {
	constructor(x, y) {
		super(x, y, FRAME.getImage("crystal"));

		this.coverAlpha = 0.0;
		this.coverImage = FRAME.getImage("crystalCover");

		this.alpha = 1;
		this.speed = 0.2;
		this.target = player;
		this.xVel = 0;
		this.yVel = 0;
		this.harmful = false;

		this.teleportDist = 250;
		this.teleporting = false;
		this.teleportTimer = 0;
		this.targetTeleportX = 0;
		this.targetTeleportY = 0;
		this.teleportRefreshTimer = 0;
	}
	update() {
		super.update();
		var prevx = this.x;
		var prevy = this.y;

		//chase player
		if (Math.abs(this.x - this.target.x) + Math.abs(this.y - this.target.y) <= this.chaseRange) {
			if (this.x-this.width/4 > this.target.x) {
				this.xVel += -this.speed;
			}
			else if (this.x+this.width/4 < this.target.x) {
				this.xVel += this.speed;
			}
			if (this.y-this.height/4 > this.target.y) {
				this.yVel += -this.speed;
			}
			else if (this.y+this.height/4 < this.target.y) {
				this.yVel += this.speed;
			}
		}
		else {
			this.xVel += (Math.random()-0.5)*this.speed*2;
			this.yVel += (Math.random()-0.5)*this.speed*2;
		}

		//check distance to decide to teleport
		if (this.teleporting == false && this.teleportRefreshTimer > 40 && Math.abs(this.x - this.target.x) + Math.abs(this.y - this.target.y) <= this.teleportDist) {
			this.teleporting = true;
			this.targetTeleportX = this.target.x;
			this.targetTeleportY = this.target.y;
		}

		//time and teleport our guy
		if (this.teleporting) {
			this.teleportTimer++;
			this.xVel = 0;
			this.yVel = 0;

			//fade away
			this.alpha -= 0.05;
			if (this.alpha < 0) {
				this.alpha = 0.0;
			}

			//reappear and flash
			if (this.alpha == 0 && this.teleportTimer > 15) {
				this.x = this.targetTeleportX;
				this.y = this.targetTeleportY;
				this.alpha = 1;
				this.coverAlpha = 1;
				this.harmful = true;
				this.teleporting = false;
				this.teleportTimer = 0;
				this.teleportRefreshTimer = 0;
			}
		}
		else {
			this.teleportRefreshTimer++;
		}

		//harm target
		if (this.harmful) {
			//fade away
			this.coverAlpha -= 0.05;
			if (this.coverAlpha < 0.5) {
				this.harmful = false;
			}

			//hit player
			if (checkSATCollision(this.polygon, this.target.polygon)) {
				this.target.hurt();
			}
		}
		else {
			//fade away
			this.coverAlpha -= 0.05;
			if (this.coverAlpha < 0) {
				this.coverAlpha = 0.0
			}
		}

		//rotate and move, check for solid tile collision
		this.x += this.xVel;
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.x = prevx;
			}
		}
		this.y += this.yVel;
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.y = prevy;
			}
		}
		this.xVel *= 0.98;
		this.yVel *= 0.98;
		this.rotation += (this.xVel/9 - this.rotation) * 0.2;
	}
	render() {
		super.render();
		this.ctx.globalAlpha = this.coverAlpha;
		this.ctx.drawImage(this.coverImage, -this.displayWidth/2, -this.displayHeight/2, this.displayWidth, this.displayHeight);
		this.ctx.globalAlpha = 1;
	}
	hurt() {
		this.die();
	}
	die() {
		this.dead = true;

		let numCoins = Math.floor(Math.random()*3 + 3);
		for (let i = 0; i < numCoins; i++) {
			new Coin(this.x, this.y);
		}
	}
}
