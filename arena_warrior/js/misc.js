class Polygon extends Actor {
	constructor(x,y,size=40) {
		super(x,y);
		this.size = size;
		this.points = [];
		this.color = "rgba(0,0,0,0.5)";
	}
	update() {
		
	}
	render() {
		this.ctx.fillStyle = this.color;
		this.ctx.beginPath();
		if (this.points.length >= 1) this.ctx.moveTo(this.points[0].x*this.size, this.points[0].y*this.size);
		for (var i = 1; i < this.points.length; i++) {
			this.ctx.lineTo(this.points[i].x*this.size, this.points[i].y*this.size);
		}
		this.ctx.closePath();
		this.ctx.fill();
	}
	addPoint(x, y) {
		this.points.push({x: x, y: y});
	}
	getPoints() {
		var points = [];
		for (var i = 0; i < this.points.length; i++) {
			points.push({x: this.x - this.points[i].y*this.size*Math.sin(this.rotation) + this.points[i].x*this.size*Math.cos(this.rotation), y: this.y + this.points[i].y*this.size*Math.cos(this.rotation) + this.points[i].x*this.size*Math.sin(this.rotation)});
		}
		return points;
	}
	getAABB() {
		return {x: this.x, y: this.y, width: this.size*3, height: this.size*3};
	}
}

class ShopList {
	constructor() {
		this.items = new Map();
		this.callbacks = new Map();
		this.types = [];
		this.equippable = [];
	}
	addItem(type, cost, className, name) {
		if (!this.items.has(type)) {
			this.items.set(type, []);
			this.types.push(type);
			this.equippable.push(false);
		}
		this.items.get(type).push(new ShopItem(type, cost, className, name, this.callbacks.get(type)));
	}
	getUnboughtItem(type) {
		var scannerArray = this.items.get(type);
		
		for (var i = 0; i < scannerArray.length; i++) {
			if (scannerArray[i].bought == false)
				return scannerArray[i];
		}
		
		return -1;
	}
	setBought(type, name) {
		var scannerArray = this.items.get(type);
		
		for (let i = 0; i < scannerArray.length; i++) {
			if (scannerArray[i].name == name) {
				scannerArray[i].buy({money: 9999999});
				break;
			}
		}
	}
	makeEquippable(type) {
		for (let i = 0; i < this.types.length; i++) {
			if (this.types[i] == type) {
				this.equippable[i] = true;
				break;
			}
		}
	}
	setBuyCallback(type, callback) {
		this.callbacks.set(type, callback);
	}
	getItems(type) {
		return this.items.get(type);
	}
	getTypes() {
		return this.types;
	}
	getEquippableTypes() {
		var result = [];
		for (let i = 0; i < this.types.length; i++) {
			if (this.equippable[i] == true) {
				result.push(this.types[i]);
			}
		}
		return result;
	}
}

class GroundArea {
	constructor(color, width, height, numEnemies) {
		this.color = color;
		this.width = width;
		this.height = height;
		this.numEnemies = numEnemies;
		this.bought = false;
		this.updateTimer = 100;
		
		this.x = 500;
		this.y = 0;
		
		this.classes = [];
		this.percentages = [];
		
		this.ctx = FRAME.ctx;//for rendering ground color
	}
	giveEnemy(className, percentage) {
		this.classes.push(className);
		this.percentages.push(percentage);
	}
	update() {
		this.updateTimer++;
		if (this.updateTimer < 100) return;
		
		this.updateTimer = 0;
		
		//count nibbas
		var currentNumEnemies = 0;
		for (let i = 0; i < characters.objects.length; i++) {
			for (let j = 0; j < this.classes.length; j++) {
				if (characters.objects[i].constructor == this.classes[j]) {
					currentNumEnemies++;
				}
			}
		}
		
		//repopulate
		while (currentNumEnemies < this.numEnemies) {
			let a = Math.random();
			let total = 0.0;
			for (let i = 0; i < this.classes.length; i++) {
				total += this.percentages[i];
				if (total >= a) {
					characters.add(new this.classes[i](this.x + Math.random()*this.width - this.width/2, this.y + Math.random()*this.height - this.height/2));
					currentNumEnemies++;
					break;
				}
			}
		}
	}
	setUp() {
		FRAME.canvas.style.backgroundColor = this.color;
		this.updateTimer = 100;
		makeFenceBox(this.x,this.y,this.width,this.height);
		//road
		for (var i = 0; i < 23; i++) {
			tiles.add(new Tile(false, i*PIXEL_SIZE*8-100, -25, FRAME.getImage("road" + (1 + i%2))));
		}
	}
	renderImage() {
		let width = 35;
		let height = 35;
		this.ctx.fillStyle = this.color;
		this.ctx.fillRect(-width/2, -height/2, width, height);
	}
}

class PerformanceTestGroundArea extends GroundArea {
	constructor() {
		super("#7E8934", 500, 500, 1000);
		this.giveEnemy(Spiker, 0.5);
		this.giveEnemy(Ghost, 0.5);
		this.ctx = FRAME.ctx;
	}
	setUp() {
		super.setUp();
	}
}

class FirstGroundArea extends GroundArea {
	constructor() {
		super("#222034", 3000, 2000, 60);
		this.giveEnemy(Bee, 0.8);
		this.giveEnemy(Ghost, 0.1);
		this.giveEnemy(Spiker, 0.1);
	}
	setUp() {
		super.setUp();
		makeRandomTiles(Rock,this.x,this.y,this.width,this.height,20,65);
		makeRandomTiles(Shrub,this.x,this.y,this.width,this.height,100,20);
	}
}

class SecondGroundArea extends GroundArea {
	constructor() {
		super("#2C2034", 4000, 3000, 100);
		this.giveEnemy(Spiker, 0.5);
		this.giveEnemy(Ghost, 0.5);
		this.ctx = FRAME.ctx;
	}
	setUp() {
		super.setUp();
	}
}

class GroundAreaManager {
	constructor() {
		this.areas = [];
		this.currentGroundArea = 0;
	}
	addGroundArea(area) {
		this.areas.push(area);
	}
	gotoGroundArea(index) {
		//get rid of tiles/projectiles
		tiles.clear();
		solidTiles.clear();
		projectiles.clear();
		//find the enemies and splice them from characters
		for (let i = 0; i < characters.objects.length; i++) {
			if (characters.objects[i].isEnemy === true) {
				characters.objects.splice(i,1);
				i--;
			}
		}
		this.currentGroundArea = index;
		this.areas[this.currentGroundArea].setUp();
	}
	getCurrentGroundArea() {
		return this.currentGroundArea;
	}
	getMaxGroundArea() {
		return this.areas.length-1;
	}
	update() {
		this.areas[this.currentGroundArea].update();
	}
}

class Tile extends Actor {
	constructor(solid, x, y, img) {
		super(x, y);
		
		this.solid = solid;
		this.image = img;
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
	}
	render() {
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
	}
}

class Coin extends Tile {
	constructor(x,y) {
		super(false, x, y, FRAME.getImage("coin"));
		tiles.add(this);
		
		this.yDist = -10;
		this.xVel = Math.random()*3 - 1.5;
		this.yVel = -7 + Math.random()*-5;
		this.size = 10;
		this.falling = true;
		this.canCollide = false;
		this.alpha = 1.0;
		
		//for aabb collision
		this.width = this.size;
		this.height = this.size;
	}
	update() {
		if (this.falling) {
			//change height/velocity
			if (this.yDist >= 0) {
				this.yVel = 0;
				this.xVel = 0;
				this.falling = false;
				this.canCollide = true;
			}
			else {
				this.yVel += 0.6;
			}
			this.yDist += this.yVel;
		}
		else {
			//fade away
			if (this.canCollide == false) {
				this.xVel = 0;
				this.yVel = -1;
				this.alpha -= 0.02;
				if (this.alpha <= 0) {
					this.alpha = 0;
					this.dead = true;
				}
			}
			//collide with player
			else if (checkAABBCollision(player, this)) {
				player.money += 1;
				this.canCollide = false;
			}
		}
		
		//move
		this.x += this.xVel;
		this.y += this.yVel;
		this.rotation += this.xVel/10;
	}
	render() {
		this.ctx.globalAlpha = this.alpha;
		this.ctx.drawImage(this.image, -this.size/2, -this.size/2, this.size, this.size);
		this.ctx.globalAlpha = 1.0;
	}
}

class Fence extends Tile {
	constructor(x, y, orientation) {
		super(true, x, y, FRAME.getImage("fence"));
		
		this.displayWidth = this.width;
		this.displayHeight = this.height;
		
		//orient fence
		if (orientation == 1) {
			this.rotation = Math.PI/2;
			let temp = this.width;
			this.width = this.height;
			this.height = temp;
		}
		else if (orientation == 2) {
			this.rotation = Math.PI;
		}
		else if (orientation == 3) {
			this.rotation = Math.PI*3/2;
			let temp = this.width;
			this.width = this.height;
			this.height = temp;
		}
	}
	render() {
		this.ctx.drawImage(this.image, -this.displayWidth/2, -this.displayHeight/2, this.displayWidth, this.displayHeight);
	}
	static size() {
		return FRAME.getImage("fence").width * PIXEL_SIZE;
	}
}

class Rock extends Tile {
	constructor(x, y, type) {
		if (type == undefined)
			type = Math.floor(Math.random()*3)+1;
		
		super(true, x, y, FRAME.getImage("rock"+type));
	}
}

class Shrub extends Tile {
	constructor(x, y, type) {
		if (type == undefined)
			type = Math.floor(Math.random()*4)+1;
		
		var flipped = false;
		if (Math.random() < 0.5)
			flipped = true;
		
		super(false, x, y, FRAME.getImage("shrub"+type));
		this.flipped = flipped;
	}
	render() {
		if (this.flipped) this.ctx.scale(-1,1,1);
		super.render();
		if (this.flipped) this.ctx.scale(-1,1,1);
	}
}