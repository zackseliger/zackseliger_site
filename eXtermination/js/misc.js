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
	constructor(x, y, img=FRAME.getImage("pistol")) {
		super(x, y);
		
		this.image = img;
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
		
		this.dropHeight = 0;
		this.yVel = -12;
		this.xVel = Math.random() * 4 - 2;
		
		this.owner = null;
		this.shotTimer = 0.5;
		this.shooting = false;
		this.timer = this.shotTimer;
		this.times = 0;
		weapons.add(this);
	}
	update(realTime) {
		this.timer += realTime;
		if (this.shooting) {
			this.timer = 0;
			this.fireRound();
			this.owner.shotTimer.setTimer(this.shotTimer);
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
		if (this.owner !== null && this.timer > this.shotTimer) this.shooting = true;
	}
	fireRound() {
		if (Math.abs(this.rotation) < Math.PI / 2) {
			new Bullet(this.x + 1.5*PIXEL_SIZE*Math.sin(this.rotation), this.y - 1.5*PIXEL_SIZE*Math.cos(this.rotation), this.rotation, 15, this.owner);
		}
		else {
			new Bullet(this.x - 1.5*PIXEL_SIZE*Math.sin(this.rotation), this.y + 1.5*PIXEL_SIZE*Math.cos(this.rotation), this.rotation, 15, this.owner);
		}
	}
}

class Shotgun extends Gun {
	constructor (x, y) {
		super(x, y, FRAME.getImage("shotgun"));
		
		this.shotTimer = 1.5;
	}
	fireRound() {
		var numBullets = 4 + Math.floor(Math.random() * 3 - 1);
		for (var i = 0; i < numBullets; i++) {
			if (Math.abs(this.rotation) < Math.PI / 2) {
				new Bullet(this.x + 1.5*PIXEL_SIZE*Math.sin(this.rotation), this.y - 1.5*PIXEL_SIZE*Math.cos(this.rotation), this.rotation + Math.random() * 0.5 - 0.25, 15 + Math.random() * 3 - 1, this.owner);
			}
			else {
				new Bullet(this.x - 1.5*PIXEL_SIZE*Math.sin(this.rotation), this.y + 1.5*PIXEL_SIZE*Math.cos(this.rotation), this.rotation + Math.random() * 0.5 - 0.25, 15 + Math.random() * 3 - 1, this.owner);
			}
		}
	}
}

class Tile extends Actor {
	constructor(x=0, y=0, w=100, h=100) {
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
		this.pointTo = 0;
		this.MAX_SPEED = 20;
	}
	update(realTime) {
		if (this.dropHeight <= 0) {
			this.y += this.yVel;
			this.x += this.xVel;
			this.dropHeight += this.yVel;
			this.yVel += (9.8 - this.yVel) * 0.1;
			this.rotation += this.xVel + this.yVel / 10;
		}
		if (Math.abs(this.x - player.x) + Math.abs(this.y - player.y) < 500 && player.dead == false) {
			var xVel = 300 / (Math.abs(player.x - this.x) + Math.abs(player.y - this.y));
			var yVel = 300 / (Math.abs(player.y - this.y) + Math.abs(player.x - this.x));
			if (xVel > 0 && xVel > this.MAX_SPEED) xVel = this.MAX_SPEED;
			if (yVel > 0 && yVel > this.MAX_SPEED) yVel = this.MAX_SPEED;
			
			this.pointTo = Math.atan2(player.y - this.y, player.x - this.x);
			this.x += Math.cos(this.pointTo) * xVel;
			this.y += Math.sin(this.pointTo) * yVel;
			if (Math.abs(this.x - player.x) + Math.abs(this.y - player.y) < 20) {
				player.money += 1;
				this.dead = true;
			}
		}
	}
	render() {
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
	}
}

class Timer extends Actor {
	constructor(x, y, t, col, r) {
		super(x, y);
		
		this.color = col || "#FFF";
		this.radius = r || 10;
		this.fullTime = t || 1.0;
		this.time = t || 1.0;
		this.done = false;
	}
	update(realTime) {
		if (this.time > 0) {
			this.time -= realTime;
			if (this.time < 0) {
				this.time = 0;
				this.done = true;
			}
		}
	}
	render() {
		this.ctx.strokeStyle = this.color;
		this.ctx.lineWidth = 5;
		this.ctx.beginPath();
		this.ctx.arc(0, 0, this.radius, 0, (this.time/this.fullTime) * 2*Math.PI);
		this.ctx.stroke();
		this.ctx.closePath();
	}
	setTimer(t) {
		this.time = t;
		this.fullTime = t;
	}
}

class GUI extends Actor {
	constructor(target) {
		super(0,0);
		this.target = target;
		
		this.showingEndScreen = false;
		this.wonText = new Text(0, 0, "You Won", "Arial", "#0CF", 128, "center");
		this.deadText = new Text(0, 0, "You Died", "Arial", "#F55", 128, "center");
		this.moneyText = new Text(0, 0, this.target.money.toString(), "Arial", "#FFF", 64);
		this.moneyImage = new ImageActor(0,0, FRAME.getImage("coin"), 50);
		this.moneyAlpha = 1.0;
		this.moneyTween = this.target.money;
	}
	update(realTime) {
		this.moneyText.x = (-FRAME.x + 120) / FRAME.scaleX;
		this.moneyText.y = (-FRAME.y + 20) / FRAME.scaleY;
		this.moneyImage.x = this.moneyText.x - 50/FRAME.scaleX;
		this.moneyImage.y = this.moneyText.y + 80/FRAME.scaleY;
		this.moneyTween += (this.target.money - this.moneyTween) * 0.05;
		if (Math.abs(this.target.money - this.moneyTween) < 0.02)
			this.moneyTween = this.target.money;
		this.moneyText.text = Math.round(this.moneyTween);
		if (this.moneyTween == this.target.money)
			this.moneyAlpha += (0.0 - this.moneyAlpha) * 0.05;
		else this.moneyAlpha += (1.0 - this.moneyAlpha) * 0.2;
		
		this.wonText.x = (-FRAME.x + window.innerWidth / 2) / FRAME.scaleX;
		this.wonText.y = (-FRAME.y + window.innerHeight / 2 - 100) / FRAME.scaleY;
		this.deadText.x = (-FRAME.x + window.innerWidth / 2) / FRAME.scaleX;
		this.deadText.y = (-FRAME.y + window.innerHeight / 2 - 100) / FRAME.scaleY;
	}
	render() {
		FRAME.ctx.globalAlpha = this.moneyAlpha;
		this.moneyText.draw();
		this.moneyImage.draw();
		FRAME.ctx.globalAlpha = 1.0;
		if (this.showingEndScreen) {
			if (this.target.dead) this.deadText.draw();
			else this.wonText.draw();
		}
	}
	showEndScreen() {
		this.showingEndScreen = true;
	}
	reset() {
		this.moneyTween = player.money;
		this.moneyAlpha = 0.0;
		this.showingEndScreen = false;
	}
}