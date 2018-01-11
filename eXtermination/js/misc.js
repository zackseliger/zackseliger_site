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

class BulletTrailParticle extends Actor {
	constructor(x, y, rot) {
		super(x, y, rot);
		
		this.alpha = 1.0;
		this.width = PIXEL_SIZE;
		this.height = PIXEL_SIZE;
	}
	update(realTime) {
		this.alpha -= 0.1;
		if (this.alpha <= 0.0) this.dead = true;
	}
	render() {
		this.ctx.globalAlpha = this.alpha;
		this.ctx.fillStyle = "#555";
		this.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
		this.ctx.globalAlpha = 1.0;
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
		if (this.timer > 0.05) {
			particles.add(new BulletTrailParticle(this.x, this.y, this.rotation));
		}
		this.partTimer = 0.00;
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
	hitEnemy() {}
}

class Grenade extends Bullet {
	constructor(x, y, rot, owner) {
		super(x, y, rot, 10, owner);
		this.width *= 2;
		this.height *= 2;
		this.dist = distBetween(this, mouse);
		this.numBullets = 20;
	}
	update(realTime) {
		super.update(realTime);
		this.timer += realTime*2;//I purposly add realTime to this.timer twice
		this.speed *= 0.97;
		if (this.dead) {
			for (var i = 0; i < this.numBullets; i++) {
				bullets.add(new Bullet(this.x, this.y, 2*Math.PI * (i/this.numBullets), 10, this.owner));
			}
			var soundName = "grenade";
			var id = FRAME.playSound(soundName);
			var vol = 90/distBetween(this, player);
		}
	}
}

class MineBullet extends Bullet {
	constructor(x, y, rot, owner) {
		super(x, y, rot, 0, owner);
		this.image = FRAME.getImage("mine");
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
	}
	update(realTime) {
		super.update(realTime);
		this.timer -= realTime;
	}
	hitEnemy() {
		this.dead = true;
		for (var i = 0; i < 5; i++) {
			particles.add(new SmokeParticle(this.x, this.y, PIXEL_SIZE));
		}
	}
	render() {
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
	}
}

class Gun extends Actor {
	constructor(x, y, img=FRAME.getImage("pistol")) {
		super(x, y);
		
		this.image = img;
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
		this.normalWidth = this.width;
		this.normalHeight = this.height;
		
		this.dropHeight = 0;
		this.yVel = 0;
		this.xVel = Math.random() * 4 - 2;
		
		this.highlighted = false;
		this.owner = null;
		this.shotTimer = 0.5;
		this.shooting = false;
		this.timer = 0;
		this.times = 0;
		weapons.add(this);
	}
	update(realTime) {
		this.timer += realTime;
		if (this.shooting) {
			this.timer = 0;
			this.fireRound();
			particles.add(new SmokeParticle(this.x, this.y, PIXEL_SIZE));
			this.owner.shotTimer.setTimer(this.shotTimer);
		}
		if (this.shooting) this.shooting = false;
		
		if (this.owner === null) {
			this.rotation += 0.05;
			if (this.dropHeight < 0) {
				this.y += this.yVel;
				this.x += this.xVel;
				this.dropHeight += this.yVel;
				if (this.dropHeight > 0) this.dropHeight = 0;
				this.yVel += (9.8 - this.yVel) * 0.1;
			}
			if (this.highlighted) {
				this.rotation -= 0.04;
				this.width += (this.normalWidth * 1.5 - this.width) * 0.1;
				this.height += (this.normalHeight * 1.5 - this.height) * 0.1;
				this.highlighted = false;
			}
			else {
				this.width += (this.normalWidth - this.width) * 0.1;
				this.height += (this.normalHeight - this.height) * 0.1;
			}
		}
		else {
			this.yVel = -12;
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
		var soundName = "pistol" + (Math.floor(Math.random() * 3) + 1);
		var id = FRAME.playSound(soundName);
		var vol = 90/distBetween(this, player);
		FRAME.sounds.get(soundName).volume(vol, id);
		if (Math.abs(this.rotation) < Math.PI / 2) {
			new Bullet(this.x + 1.5*PIXEL_SIZE*Math.sin(this.rotation), this.y - 1.5*PIXEL_SIZE*Math.cos(this.rotation), this.rotation + Math.random() * 0.1 - 0.05, 15, this.owner);
		}
		else {
			new Bullet(this.x - 1.5*PIXEL_SIZE*Math.sin(this.rotation), this.y + 1.5*PIXEL_SIZE*Math.cos(this.rotation), this.rotation + Math.random() * 0.1 - 0.05, 15, this.owner);
		}
	}
	highlight() {
		this.highlighted = true;
	}
}

class EmptyGun extends Gun {
	constructor() {
		super(0,0);
		this.shotTimer = 0;
	}
	update(realTime) {
		if (this.owner == null) this.dead = true;
	}
	fireRound() {}
	render() {}
}

class Shotgun extends Gun {
	constructor (x, y) {
		super(x, y, FRAME.getImage("shotgun"));
		
		this.shotTimer = 1;
	}
	fireRound() {
		var soundName = "shotgun1";
		var id = FRAME.playSound(soundName);
		var vol = 90/distBetween(this, player);
		FRAME.sounds.get(soundName).volume(vol, id);
		var numBullets = 3;
		for (var i = 0; i < numBullets; i++) {
			if (Math.abs(this.rotation) < Math.PI / 2) {
				new Bullet(this.x + 1.5*PIXEL_SIZE*Math.sin(this.rotation), this.y - 1.5*PIXEL_SIZE*Math.cos(this.rotation), this.rotation + Math.random() * 0.5 - 0.25, 13 + Math.random() * 3 - 1, this.owner);
			}
			else {
				new Bullet(this.x - 1.5*PIXEL_SIZE*Math.sin(this.rotation), this.y + 1.5*PIXEL_SIZE*Math.cos(this.rotation), this.rotation + Math.random() * 0.5 - 0.25, 13 + Math.random() * 3 - 1, this.owner);
			}
		}
	}
}

class Machinegun extends Gun {
	constructor(x, y) {
		super(x, y, FRAME.getImage("machinegun"));
		
		this.shotTimer = 0.1;
	}
	fireRound() {
		var soundName = "machinegun" + (Math.floor(Math.random() * 2) + 1);
		var id = FRAME.playSound(soundName);
		var vol = 90/distBetween(this, player);
		FRAME.sounds.get(soundName).volume(vol, id);
		if (Math.abs(this.rotation) < Math.PI / 2) {
			new Bullet(this.x + 1.5*PIXEL_SIZE*Math.sin(this.rotation), this.y - 1.5*PIXEL_SIZE*Math.cos(this.rotation), this.rotation + Math.random() * 0.4 - 0.2, 15, this.owner);
		}
		else {
			new Bullet(this.x - 1.5*PIXEL_SIZE*Math.sin(this.rotation), this.y + 1.5*PIXEL_SIZE*Math.cos(this.rotation), this.rotation + Math.random() * 0.4 - 0.2, 15, this.owner);
		}
	}
}

class GrenadeLauncher extends Gun {
	constructor(x, y) {
		super(x, y, FRAME.getImage("launcher"));
		
		this.shotTimer = 1.5;
	}
	fireRound() {
		var soundName = "machinegun" + (Math.floor(Math.random() * 2) + 1);
		var id = FRAME.playSound(soundName);
		var vol = 90/distBetween(this, player);
		FRAME.sounds.get(soundName).volume(vol, id);
		if (Math.abs(this.rotation) < Math.PI / 2) {
			new Grenade(this.x + 1.5*PIXEL_SIZE*Math.sin(this.rotation), this.y - 1.5*PIXEL_SIZE*Math.cos(this.rotation), this.rotation, this.owner);
		}
		else {
			new Grenade(this.x - 1.5*PIXEL_SIZE*Math.sin(this.rotation), this.y + 1.5*PIXEL_SIZE*Math.cos(this.rotation), this.rotation, this.owner);
		}
	}
}

class Mine extends Gun {
	constructor(x, y) {
		super(x, y, FRAME.getImage("mine"));
		
		this.shotTimer = 0.75;
	}
	fireRound() {
		var id = FRAME.playSound("mineDrop");
		var vol = 90/distBetween(this, player);
		if (Math.abs(this.rotation) < Math.PI / 2) {
			new MineBullet(this.x + 1.5*PIXEL_SIZE*Math.sin(this.rotation), this.y - 1.5*PIXEL_SIZE*Math.cos(this.rotation), Math.PI % this.rotation, this.owner);
		}
		else {
			new MineBullet(this.x - 1.5*PIXEL_SIZE*Math.sin(this.rotation), this.y + 1.5*PIXEL_SIZE*Math.cos(this.rotation), Math.PI % this.rotation, this.owner);
		}
	}
}

class Helmet extends ImageActor {
	constructor(x, y, img) {
		super(x, y, img);
	}
	setScale(scale) {
		this.width = this.image.width * PIXEL_SIZE * scale;
		this.height = this.image.height * PIXEL_SIZE * scale;
	}
}

class Torso extends ImageActor {
	constructor(x, y, img) {
		super(x, y, img);
	}
	setScale(scale) {
		this.width = this.image.width * PIXEL_SIZE * scale;
		this.height = this.image.height * PIXEL_SIZE * scale;
	}
}

class Tile extends Actor {
	constructor(x=0, y=0, w=100, h=100) {
		super(x, y);
		
		this.solid = true;
		this.width = w;
		this.height = h;
		this.type = "tile";
	}
	render() {
		this.ctx.fillStyle = "#222";
		this.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
	}
}

class Coin extends Tile {
	constructor(x, y, dropHeight) {
		super(x, y, 10, 10);
		
		this.type = "coin";
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
		if (distBetween(this, player) < 500 && player.dead == false) {
			var dist = distBetween(this, player);
			var xVel = 300 / dist;
			var yVel = 300 / dist;
			if (xVel > 0 && xVel > this.MAX_SPEED) xVel = this.MAX_SPEED;
			if (yVel > 0 && yVel > this.MAX_SPEED) yVel = this.MAX_SPEED;
			
			this.pointTo = Math.atan2(player.y - this.y, player.x - this.x);
			this.x += Math.cos(this.pointTo) * xVel;
			this.y += Math.sin(this.pointTo) * yVel;
			if (dist < 20) {
				player.money += 1;
				FRAME.playSound("boop");
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

class ItemCard extends Actor {
	constructor(item) {
		super(mouse.x, mouse.y);
		this.nameText = new Text(10, -70, item.name, "Arial", "#FFF", 24);
		this.typeText = new Text(100, -70, item.type, "Arial", "#FFF", 24, "right");
		this.priceText = new Text(10, -35, "price: ", "Arial", "#FFF", 24);
		this.moneyImage = new ImageActor(85, -11, FRAME.getImage("coin"), 15);
		this.numberText = new Text(98, -34, item.price.toString(), "Arial", "#66EE99", 24);
		if (player.money < item.price)
			this.numberText.fillStyle = "#EE4444";
		this.width = this.nameText.width + this.typeText.width + 50;
		this.height = 75;
		this.offset = 0;
		this.typeText.x = this.width-10;
		this.update(0);
	}
	update(realTime) {
		this.x = mouse.x;
		this.y = mouse.y;
		if (this.x + this.width + this.offset > GAME_WIDTH/2 || this.offset != 0) {
			this.offset = -this.x - this.width + GAME_WIDTH/2;
			this.nameText.x = 10 + this.offset;
			this.typeText.x = this.width-10 + this.offset
			this.priceText.x = 10 + this.offset;
			this.moneyImage.x = 85 + this.offset;
			this.numberText.x = 98 + this.offset;
		}
	}
	render() {
		this.ctx.fillStyle = "#101010";
		this.ctx.globalAlpha = 0.9;
		this.ctx.fillRect(this.offset, -this.height, this.width, this.height);
		this.nameText.draw();
		this.typeText.draw();
		this.priceText.draw();
		this.moneyImage.draw();
		this.numberText.draw();
		this.ctx.globalAlpha = 1.0;
	}
}

class GUI extends Actor {
	constructor(target) {
		super(0,0);
		this.target = target;
		
		this.showingEndScreen = false;
		this.endScreenTimer = 0.0;
		this.doneShowingEndScreen = false;
		this.coinExists = false;
		this.wonText = new Text(0, 0, "You Won", "Arial", "#0CF", 128, "center");
		this.deadText = new Text(0, 0, "You Died", "Arial", "#F55", 128, "center");
		this.getCoinsText = new Text(0, 0, "Get all the coins before you leave", "Arial", "#F55", 32, "center");
		this.coinTextAlpha = 0.0;
		this.moneyText = new Text(0, 0, this.target.money.toString(), "Arial", "#FFF", 64);
		this.moneyImage = new ImageActor(0,0, FRAME.getImage("coin"), 50);
		this.moneyAlpha = 1.0;
		this.moneyIsLeft = true;
		this.moneyTimer = 0.0;
		this.itemCard = null;
		this.showingItemCard = false;
	}
	update(realTime) {
		//money stuff
		if (this.moneyIsLeft == true) {
			this.moneyText.x = -FRAME.x / FRAME.scaleX + 100;
			this.moneyText.y = -FRAME.y / FRAME.scaleY + 5;
			this.moneyImage.x = this.moneyText.x - 50;
			this.moneyImage.y = this.moneyText.y + 65;
		}
		else {
			this.moneyText.x = FRAME.x / FRAME.scaleX - 100;
			this.moneyText.y = -FRAME.y / FRAME.scaleY + 5;
			this.moneyImage.x = this.moneyText.x + 50;
			this.moneyImage.y = this.moneyText.y + 65;
		}
		if (this.moneyText.text != this.target.money.toString()) {
			this.moneyText.text = this.target.money;
			this.moneyTimer = 0.0;
			this.moneyAlpha = 1;
		}
		else if (this.moneyTimer >= 1) {
			this.moneyAlpha -= 0.05;
			if (this.moneyAlpha < 0.0) this.moneyAlpha = 0.0;
		}
		this.moneyTimer += realTime;
		
		//win stuff
		if (this.showingEndScreen) {
			this.endScreenTimer += realTime;
			if (this.endScreenTimer >= 3.0) {
				this.coinExists = coinExists();
				if (player.dead || this.coinTextAlpha == 0.0 && this.coinExists == false)
					this.doneShowingEndScreen = true;
				else if (this.endScreenTimer >= 4.5 && this.coinExists == false)
					this.doneShowingEndScreen = true;
			}
		}
		
		if (this.showingItemCard) {
			this.itemCard.update(realTime);
		}
		
		this.wonText.x = (-FRAME.x + window.innerWidth / 2) / FRAME.scaleX;
		this.wonText.y = (-FRAME.y + window.innerHeight / 2) / FRAME.scaleY - 100;
		this.getCoinsText.x = (-FRAME.x + window.innerWidth / 2) / FRAME.scaleX;
		this.getCoinsText.y = (-FRAME.y + window.innerHeight / 2) / FRAME.scaleY + 25;
		this.deadText.x = (-FRAME.x + window.innerWidth / 2) / FRAME.scaleX;
		this.deadText.y = (-FRAME.y + window.innerHeight / 2) / FRAME.scaleY - 100;
	}
	render() {
		FRAME.ctx.globalAlpha = this.moneyAlpha;
		this.moneyText.draw();
		this.moneyImage.draw();
		FRAME.ctx.globalAlpha = 1.0;
		if (this.showingEndScreen) {
			if (this.target.dead) this.deadText.draw();
			else {
				this.wonText.draw();
				if (this.endScreenTimer >= 3.5) {
					this.coinTextAlpha += 0.075;
					if (this.coinTextAlpha > 1.0) this.coinTextAlpha = 1.0;
					FRAME.ctx.globalAlpha = this.coinTextAlpha;
					this.getCoinsText.draw();
					FRAME.ctx.globalAlpha = 1.0;
					if (this.coinExists == true)
						this.endScreenTimer = 3.5;
				}
			}
		}
		if (this.itemCard != null) {
			this.itemCard.draw();
		}
	}
	showEndScreen() {
		this.showingEndScreen = true;
	}
	reset() {
		this.moneyText.text = this.target.money;
		this.moneyAlpha = 0.0;
		this.showingEndScreen = false;
		this.doneShowingEndScreen = false;
		this.endScreenTimer = 0.0;
		this.coinTextAlpha = 0.0;
	}
	moveMoneyRight() {
		this.moneyText.justify = "right";
		this.moneyIsLeft = false;
	}
	showItemCard(card) {
		this.itemCard = card;
		this.showingItemCard = true;
	}
	hideItemCard() {
		this.showingItemCard = false;
		this.itemCard = null;
	}
}

class InvSquare extends Actor {
	constructor(x, y, type) {
		super(x, y);
		this.type = type;
		if (type === undefined) this.type = null;
		this.width = TILE_SIZE;
		this.height = TILE_SIZE;
		this.color = "#DDD";
		this.mouseOver = false;
	}
	update(realTime) {
		if (checkCollision(mouse, this)) {
			if (this.mouseOver != true)
				FRAME.playSound("over");
			this.color = "#999";
			this.mouseOver = true;
		}
		else {
			if (this.mouseOver != false)
				FRAME.playSound("over");
			this.color = "#DDD";
			this.mouseOver = false;
		}
	}
	render() {
		this.ctx.fillStyle = this.color;
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
	}
}

class TileItem extends Actor {
	constructor(img, type, name, price) {
		super();
		
		this.price = price;
		this.type = type;
		this.name = name;
		this.image = img;
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
	}
	update(realTime) {
		
	}
	render() {
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
	}
}

class Inventory extends Actor {
	constructor(owner, x, y, rows=2) {
		super(0,0);
		if (x === undefined) x = 0;
		if (y === undefined) y = 0;
		
		this.objects = [];
		this.collection = new Collection();
		this.selectedObject = null;
		this.selectedObjectIndex = -1;
		this.mouseOverObject = null;
		this.mouseOverIndex = -1;
		this.owner = owner;
		
		for (var j = 0; j < rows; j += 1) {
			for (var i = 0; i < 6; i += 1) {
				this.objects.push(null);
				this.collection.add(new InvSquare(i*200-GAME_WIDTH/2+100+x, j*200+y));
			}
		}
	}
	update(realTime) {
		if (this.objects[this.selectedObjectIndex] != null) {//letting go of mouse
			this.objects[this.selectedObjectIndex].x += mouse.xVel;
			this.objects[this.selectedObjectIndex].y += mouse.yVel;
			if (mouse.clicking == false) {
				var resolved = false;
				
				for (var i = 0; i < this.collection.objects.length; i++) {
					if (checkCollision(this.collection.objects[i], mouse)) {
						var swap = true;
						
						if (this.objects[this.selectedObjectIndex] != null && this.collection.objects[i].type != null && this.collection.objects[i].type != this.objects[this.selectedObjectIndex].type) {
							swap = false;
						}
						if (this.objects[i] != null && this.collection.objects[this.selectedObjectIndex].type != null && this.collection.objects[this.selectedObjectIndex].type != this.objects[i].type) {
							swap = false;
						}
						
						if (swap == true) {
							//swap positions
							var tempx = this.collection.objects[this.selectedObjectIndex].x;
							var tempy = this.collection.objects[this.selectedObjectIndex].y;
							if (this.objects[this.selectedObjectIndex] != null) {
								this.objects[this.selectedObjectIndex].x = this.collection.objects[i].x;
								this.objects[this.selectedObjectIndex].y = this.collection.objects[i].y;
							}
							if (this.objects[i] != null) {
								this.objects[i].x = tempx;
								this.objects[i].y = tempy;
							}
							
							//swap array values
							var temp = this.objects[i];
							this.objects[i] = this.objects[this.selectedObjectIndex];
							this.objects[this.selectedObjectIndex] = temp;
							resolved = true;
						}
					}
				}
				if (resolved == false) {
					this.objects[this.selectedObjectIndex].x = this.collection.objects[this.selectedObjectIndex].x;
					this.objects[this.selectedObjectIndex].y = this.collection.objects[this.selectedObjectIndex].y;
				}
				
				this.selectedObject = null;
				this.selectedObjectIndex = -1;
				FRAME.playSound("select");
			}
		}
		this.mouseOverObject = null;
		this.mouseOverIndex = -1;
		for (var i = 0; i < this.collection.objects.length; i++) {//finding selected object
			this.collection.objects[i].update(realTime);
			if (this.collection.objects[i].mouseOver == true) {
				this.mouseOverObject = this.objects[i];
				this.mouseOverIndex = i;
				if (mouse.clicking && this.selectedObject == null && this.objects[i] != null) {
					this.selectedObject = this.objects[i];
					this.selectedObjectIndex = i;
					FRAME.playSound("select");
				}
				break;
			}
		}
	}
	draw() {
		this.collection.draw();
		for (var i = 0; i < this.objects.length; i++) {
			if (this.objects[i] != null) {
				this.objects[i].draw();
			}
		}
	}
	getFreeSlotIndex() {
		for (var i = 0; i < this.collection.objects.length; i++) {
			if (this.objects[i] == null) return i;
		}
		return -1;
	}
	addSlot(slot) {
		this.objects.push(null);
		this.collection.add(slot);
	}
	addItem(item) {
		var index = this.getFreeSlotIndex();
		if (index != -1) {
			this.objects[index] = item;
			item.x = this.collection.objects[index].x;
			item.y = this.collection.objects[index].y;
			return true;
		}
		return false;
	}
	addItemAtIndex(item, index) {
		this.objects[index] = item;
		item.x = this.collection.objects[index].x;
		item.y = this.collection.objects[index].y;
	}
	removeItem(item) {
		if (item == this.mouseOverObject) {
			this.mouseOverObject = null;
			this.mouseOverObject = -1;
		}
		var index = this.objects.indexOf(item);
		if (index != -1) {
			this.objects[index] = null;
		}
	}
}

class Cover extends Actor {
	constructor(x, y, mw, mh) {
		super(x, y);
		this.width = 0;
		this.height = 0;
		this.maxWidth = mw;
		this.maxHeight = mh;
		this.growing = true;
		this.active = false;
	}
	update(realTime) {
		if (this.active) {
			if (this.growing == true) {
				this.height += (this.maxHeight - this.height) * 0.2;
				this.width += (this.maxWidth - this.width) * 0.2;
				if (this.maxHeight - this.height < 1) this.growing = false;
			}
			else if (this.height < this.maxHeight - 1) {
				this.height += (0 - this.height) * 0.3;
				this.y += (-this.maxHeight/2 - this.y) * 0.3;
				if (this.height < 0.1) {
					this.growing = true;
					this.width = 0;
					this.y = 0;
				}
			}
		}
		else {
			if (this.growing == true) {
				this.width += (0 - this.width) * 0.2;
				this.height += (0 - this.height) * 0.2;
			}
			else {
				this.height += (0 - this.height) * 0.3;
				this.y += (-this.maxHeight/2 - this.y) * 0.3;
				if (this.height < 0.1) {
					this.growing = true;
					this.y = 0;
				}
			}
		}
	}
	render() {
		this.ctx.fillStyle = "#EE4444";
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
	}
	activate() {
		this.active = true;
	}
	deactivate() {
		this.active = false;
	}
}

class ExitButton extends Actor {
	constructor(x, y) {
		super(x, y);
		
		this.mouseOver = false;
		this.width = 50;
		this.height = 50;
		this.cover = new Cover(0, 0, this.width, this.height);
	}
	update(realTime) {
		this.x = -FRAME.x / FRAME.scaleX + this.width;
		this.y = -FRAME.y / FRAME.scaleY + this.height;
		this.cover.update();
		
		if (checkCollision(mouse, this)) {
			this.mouseOver = true;
			this.cover.activate();
		}
		else {
			this.mouseOver = false;
			this.cover.deactivate();
		}
	}
	render() {
		this.ctx.fillStyle = "#DDD";
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
		this.cover.draw();
		this.ctx.lineCap = "round";
		this.ctx.strokeStyle = "#000";
		this.ctx.lineWidth = 5;
		this.ctx.beginPath();
		this.ctx.moveTo(-this.width/3, -this.height/3);
		this.ctx.lineTo(this.width/3, this.height/3)
		this.ctx.moveTo(this.width/3, -this.height/3);
		this.ctx.lineTo(-this.width/3, this.height/3)
		this.ctx.stroke();
		this.ctx.closePath();
		this.ctx.lineCap = 'butt';
	}
}

class BuyItemParticle extends Actor {
	constructor(x, y) {
		super(x, y);
		
		this.width = 0;
		this.height = 0;
		this.growing = true;
		this.endY = y - TILE_SIZE/2;
	}
	update(realTime) {
		if (this.growing == true) {
			this.height += (TILE_SIZE - this.height) * 0.2;
			this.width += (TILE_SIZE - this.width) * 0.2;
			if (TILE_SIZE - this.height < 1) this.growing = false;
		}
		else if (this.growing == false) {
			this.height += (0 - this.height) * 0.2;
			this.y += (this.endY - this.y) * 0.2;
			if (this.height < 1) this.dead = true;
		}
	}
	render() {
		this.ctx.fillStyle = "#66EE99";
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
	}
}

class ErrorParticle extends Actor {
	constructor(x, y) {
		super(x, y);
		
		this.width = 0;
		this.height = 0;
		this.growing = true;
		this.endY = y - TILE_SIZE/2;
	}
	update(realTime) {
		if (this.growing == true) {
			this.height += (TILE_SIZE - this.height) * 0.2;
			this.width += (TILE_SIZE - this.width) * 0.2;
			if (TILE_SIZE - this.height < 1) this.growing = false;
		}
		else if (this.growing == false) {
			this.height += (0 - this.height) * 0.2;
			this.y += (this.endY - this.y) * 0.2;
			if (this.height < 1) this.dead = true;
		}
	}
	render() {
		this.ctx.fillStyle = "#EE4444";
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
	}
}

class SmokeParticle extends Actor {
	constructor(x, y, size=1) {
		super(x, y);
		this.alpha = 1.0;
		this.xVel = Math.random() * 2 - 1;
		this.yVel = -Math.random();
		var img = "smoke" + Math.floor(Math.random() * 2 + 1);
		this.image = FRAME.getImage(img);
		this.width=this.height = this.image.width * size;
		this.rotationRate = Math.random() * 0.2 - 0.1;
	}
	update(realTime) {
		this.rotation += this.rotationRate;
		this.x += this.xVel;
		this.y += this.yVel;
		this.alpha -= Math.random() * 0.025;
		if (this.alpha <= 0.01) this.dead = true;
		this.yVel -= 0.01;
	}
	render() {
		this.ctx.globalAlpha = this.alpha;
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
		this.ctx.globalAlpha = 1.0;
	}
}