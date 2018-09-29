class Enemy extends Actor {
	constructor(x, y, img) {
		super(x, y);
		this.image = img;
		this.width = this.image.width*PIXEL_SIZE;
		this.height = this.image.height*PIXEL_SIZE;
		this.displayWidth = 0;
		this.displayHeight = 0;
		
		this.polygon = new Polygon(x,y,this.width/2);
		this.polygon.addPoint(1,-this.height/this.width);
		this.polygon.addPoint(1,this.height/this.width);
		this.polygon.addPoint(-1,this.height/this.width);
		this.polygon.addPoint(-1,-this.height/this.width);
	}
	update() {
		//lerp to correct size
		this.displayWidth += (this.width - this.displayWidth) * 0.2;
		this.displayHeight += (this.height - this.displayHeight) * 0.2;
		if (Math.abs(this.displayWidth - this.width) < 0.01) {
			this.displayWidth = this.width;
			this.displayHeight = this.height;
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
		
		//check for collision SOLID tiles and move on x/y-axis if colliding
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.dead = true;
				return;
			}
		}
		
		this.coverImage = FRAME.getImage("beeRed");
		this.coverAlpha = 0.0;
		
		numBees++;
	}
	update() {
		var prevx = this.x;
		var prevy = this.y;
		
		this.xVel += Math.random()*0.1 - 0.05;
		this.yVel += Math.random()*0.1 - 0.05;
		
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
		numBees--;
		this.dead = true;
		new Coin(this.x, this.y);
		if (Math.random() < 0.25) {
			new Coin(this.x, this.y);
		}
	}
}

class Ghost extends Enemy {
	constructor(x, y) {
		super(x, y, FRAME.getImage("ghost2"));
		
		this.dying = false;
		
		//check for collision SOLID tiles and move on x/y-axis if colliding
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.dead = true;
				return;
			}
		}
		
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
		
		numGhosts++;
	}
	update() {
		var prevx = this.x;
		var prevy = this.y;
		
		//change accelerations when this.timer == 0
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
		numGhosts--;
		this.dead = true;
		
		var numCoins = Math.floor(Math.random()*2)+3;
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