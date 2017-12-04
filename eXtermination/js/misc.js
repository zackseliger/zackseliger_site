class Rect extends Actor {
	constructor(x, y, w, h, col) {
		super(x, y);
		this.width = w;
		this.height = h;
		this.color = col;
	}
	render() {
		this.ctx.fillStyle = this.color;
		this.ctx.fillRect(-this.width / 2, -this.height/2, this.width, this.height);
	}
}

class FloorRect extends Rect {
	constructor(w, h) {
		super(0, 0, w, h, "#DDD");
	}
}

class Bullet extends Actor {
	constructor(x, y, rot, spd, owner) {
		super(x, y);
		this.rotation = rot;
		this.speed = spd;
		this.owner = owner;
		this.timer = 0.0;
		this.dead = false;
		
		this.width = PIXEL_SIZE;
		this.height = PIXEL_SIZE;
		bullets.add(this);
	}
	update(realTime) {
		this.timer += realTime;
		if (this.timer >= 3.0) this.dead = true;
		this.x += this.speed * Math.cos(this.rotation);
		this.y += this.speed * Math.sin(this.rotation);
		
		if (this.dead === false)
			if (checkCoveredBy(this, floor) === false) this.dead = true;
		if (this.dead === false) {
			for (var i = 0; i < tiles.objects.length; i++) {
				if (tiles.objects[i].solid == true && checkCollision(this, tiles.objects[i])) {
					this.dead = true;
					break;
				}
			}
		}
	}
	render() {
		this.ctx.fillStyle = "#000";
		this.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
	}
}

class Gun extends Actor {
	constructor(x, y) {
		super(x, y);
		
		this.image = FRAME.getImage("pistol");
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
		
		this.dropHeight = 0;
		this.yVel = -12;
		this.xVel = Math.random() * 4 - 2;
		
		this.owner = null;
		this.shooting = false;
		this.timer = 0.0;
		this.times = 0;
		weapons.add(this);
	}
	update(realTime) {
		this.timer += realTime;
		if (this.shooting) {
			this.timer = 0;
			if (Math.abs(this.rotation) < Math.PI / 2) {
				new Bullet(this.x + PIXEL_SIZE*Math.sin(this.rotation), this.y - PIXEL_SIZE*Math.cos(this.rotation), this.rotation, 15, this.owner)
			}
			else {
				new Bullet(this.x - 2*PIXEL_SIZE*Math.sin(this.rotation), this.y + 2*PIXEL_SIZE*Math.cos(this.rotation), this.rotation, 15, this.owner)
			}
		}
		if (this.shooting) this.shooting = false;
		
		if (this.owner === null) {
			this.rotation += 0.05;
			if (this.dropHeight <= 0) {
				this.y += this.yVel;
				this.x += this.xVel;
				this.dropHeight += this.yVel;
				this.yVel += (9.8 - this.yVel) * 0.1;
			}
		}
	}
	render() {
		if (Math.abs(this.rotation) > Math.PI / 2 && this.owner != null) {
			this.ctx.scale(1, -1);
		}
		this.ctx.drawImage(this.image, 0, -this.height, this.width, this.height);
		if (Math.abs(this.rotation) > Math.PI / 2 && this.owner != null) {
			this.ctx.scale(1, -1);
		}
	}
	shoot() {
		if (this.owner !== null && this.timer > this.owner.shootInterval) this.shooting = true;
	}
}

class Tile extends Actor {
	constructor(x, y, w, h) {
		super(x, y);
		
		this.solid = true;
		this.width = w;
		this.height = h;
	}
	render() {
		this.ctx.fillStyle = "#222";
		this.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
	}
}

class Coin extends Tile {
	constructor(x, y, dropHeight) {
		super(x, y, 10, 10);
		
		this.image = FRAME.getImage("coin");
		this.solid = false;
		this.dropHeight = dropHeight;
		this.yVel = -12 + Math.random() * 10 - 5;
		this.xVel = Math.random() * 4 - 2;
	}
	update(realTime) {
		if (this.dropHeight <= 0) {
			this.y += this.yVel;
			this.x += this.xVel;
			this.dropHeight += this.yVel;
			this.yVel += (9.8 - this.yVel) * 0.1;
			this.rotation += this.xVel + this.yVel / 10;
		}
	}
	render() {
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
	}
}