class Background extends Actor {
	constructor() {
		super(0, 0);
		this.width = GAME_WIDTH;
		this.height = GAME_HEIGHT;
		this.image = FRAME.getImage("roadBack");
	}
	change(img) {
		this.image = img;
	}
	render() {
		this.ctx.drawImage(this.image, 0, 0, this.width, this.height);
	}
}

class Planet extends Actor {
	constructor(img, x, y) {
		super(x||0, y||0);
		this.imagey = 0;
		this.image = img;
		this.bobbingDown = true;
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
	}
	update(realTime) {
		if (this.bobbingDown == true) {
			this.imagey += 0.1;
		}
		else {
			this.imagey -= 0.1;
		}
		
		if (Math.floor(this.imagey) + 1 == PIXEL_SIZE && this.bobbingDown == true) {
			this.bobbingDown = false;
		}
		else if (Math.floor(this.imagey) == 0 && this.bobbingDown == false) {
			this.bobbingDown = true;
		}
		
		
	}
	render() {
		this.ctx.drawImage(this.image, 0, this.imagey, this.width, this.height);
	}
}

class Tooltip extends Actor {
	constructor() {
		super(-1000, -1000);
		this.fading = true;
		this.alpha = 1.0;
		
		this.image = FRAME.getImage("tooltip");
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
	}
	move(obj) {
		this.x = obj.x;
		this.y = obj.y - obj.height - 50;
		if (this.y <= -10) {
			this.y -= 500;
		}
	}
	render() {
		this.ctx.globalAlpha = this.alpha;
		this.ctx.drawImage(this.image, -this.width / 2, 0, this.width, this.height);
		this.ctx.globalAlpha = 1.0;
	}
	update() {
		if (this.fading == true) {
			this.alpha -= 0.025;
		}
		else {
			this.alpha += 0.025;
		}
		
		if (this.alpha <= 0.05) {
			this.fading = false;
		}
		else if (this.alpha >= 1.0) {
			this.fading = true;
		}
		
		if (this.x == FRAME.x && this.y == FRAME.y) {
			this.alpha = 0.0;
		}
	}
}

class Laser extends Actor {
	constructor(w, h, col, spd, x, y) {
		super(x||0, y||0);
		this.speed = spd;
		this.color = col;
		this.width = w;
		this.height = h;
	}
	update(realTime) {
		this.x += this.speed;
	}
	render() {
		this.ctx.fillStyle = this.color;
		this.ctx.fillRect(-this.width / 2, -this.height, this.width, this.height);
	}
}

class ImageActor extends Actor {
	constructor(img, x, y) {
		super(x||0, y||0);
		this.alpha = 1.0;
		this.fading = false;
		
		this.image = img;
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
	}
	update(realTime) {
		if (this.fading) {
			this.x -= 2;
			this.alpha -= 0.1;
			if (this.alpha < 0.0) this.alpha = 0.0;
		}
	}
	render() {
		this.ctx.globalAlpha = this.alpha;
		this.ctx.drawImage(this.image, -this.width / 2, -this.height, this.width, this.height);
		this.ctx.globalAlpha = 1.0;
	}
	fadeAway() {
		this.fading = true;
	}
}

class TrashHeap extends Actor {
	constructor() {
		super(GAME_WIDTH / 2, 300);
		
		this.image = FRAME.getImage("trash2");
		this.width = this.image.width * PIXEL_SIZE;
		this.fixedWidth = this.width;
		this.height = this.image.height * PIXEL_SIZE;
		
		this.canFindSomething = false;
		this.timer = 0.0;
		this.chosenTrash = 0;
		this.trashThings = [];
		this.trashThings.push(FRAME.getImage("trashEmptyBoxBack"));
		this.trashThings.push(FRAME.getImage("trashDrillPressBack"));
		this.trashThings.push(FRAME.getImage("trashBlanket"));
		this.trashThings.push(FRAME.getImage("trashMonitor"));
		this.trashThings.push(FRAME.getImage("trashBlueHeadband"));
		this.trashThings.push(FRAME.getImage("trashSpaceshipRepairKit"));
	}
	update(realTime) {
		this.timer += realTime;
		if (this.timer >= TRASH_INTERVAL) {
			if (Math.floor(Math.random() * TRASH_RARITY) == 1 && this.canFindSomething == false) {
				this.canFindSomething = true;
				this.width += 100;
				FRAME.playSound("blip" + Math.floor(Math.random() * 5 + 1));
				this.chosenTrash = Math.floor(Math.random() * this.trashThings.length);
			}
			this.timer = 0;
		}
		
		this.width += (this.fixedWidth - this.width) * 0.1;
	}
	render() {
		this.ctx.drawImage(this.image, -this.width / 2, -this.height, this.width, this.height);
	}
	getTrashImage() {
		this.canFindSomething = false;
		return this.trashThings[this.chosenTrash];
	}
}