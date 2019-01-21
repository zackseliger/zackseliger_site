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
	isBought(type, name) {
		var scannerArray = this.items.get(type);

		for (let i = 0; i < scannerArray.length; i++) {
			if (scannerArray[i].name == name) {
				if (scannerArray[i].bought) return true;
			}
		}
		return false;
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
	getBoughtItemsAsString() {
		var result = "";
		for (var pair of this.items) {
			for (let i = 0; i < pair[1].length; i++) {
				if (pair[1][i].bought == true) {
					result += pair[0]+"~"+pair[1][i].name+"`";
				}
			}
		}
		return result;
	}
	buyItemsFromString(str) {
		var itemArr = str.split("`");

		for (var pair of this.items) {
			for (let i = 0; i < pair[1].length; i++) {
				//check every item in itemArr with the actual item we have
				for (let j = 0; j < itemArr.length; j++) {
					let typeAndName = itemArr[j].split("~");
					if (typeAndName[0] == pair[0] && typeAndName[1] == pair[1][i].name) {
						//if name and type match, buy the item
						this.setBought(typeAndName[0], typeAndName[1]);
					}
				}
			}
		}
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

class TutorialGroundArea extends GroundArea {
	constructor() {
		super("#222", 1500, 1150, 20);
		this.giveEnemy(Bee, 1);
		this.tutorialGUI = new TutorialGUI();
	}
	setUp() {
		super.setUp();
		makeRandomTiles(Rock,this.x,this.y,this.width,this.height,5,57);
		specialThings.add(this.tutorialGUI);
	}
}

class FirstGroundArea extends GroundArea {
	constructor() {
		super("#222034", 3000, 2000, 60);
		this.giveEnemy(Bee, 0.6);
		this.giveEnemy(Ghost, 0.2);
		this.giveEnemy(Spiker, 0.2);
	}
	setUp() {
		super.setUp();
		makeRandomTiles(Rock,this.x,this.y,this.width,this.height,20,65);
		makeRandomTiles(ShrubTypeOne,this.x,this.y,this.width,this.height,100,20);
	}
}

class SecondGroundArea extends GroundArea {
	constructor() {
		super("#2C2034", 4000, 3000, 100);
		this.giveEnemy(Spiker, 0.4);
		this.giveEnemy(Ghost, 0.2);
		this.giveEnemy(Bee, 0.2);
		this.giveEnemy(Chaser, 0.2);
		this.ctx = FRAME.ctx;
	}
	setUp() {
		super.setUp();
		makeRandomTiles(ShrubTypeTwo,this.x,this.y,this.width,this.height,200,80);
		makeRandomTiles(Rock,this.x,this.y,this.width,this.height,40,95);
		makeRandomTiles(Flower,this.x,this.y,this.width,this.height,20,10);
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
		specialThings.clear();
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
	constructor(solid, x=0, y=0, img) {
		super(x, y);

		this.solid = solid;
		this.image = img;
		this.width = 0;
		this.height = 0;

		if (this.image === undefined) {
			this.render = function() {};
		}
		else {
			this.width = this.image.width * PIXEL_SIZE;
			this.height = this.image.height * PIXEL_SIZE;
		}
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
		this.isCoin = true;

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
			else if (player.health > 0 && checkAABBCollision(player, this)) {
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

class Flower extends Tile {
	constructor(x, y, type) {
		if (type == undefined)
			type = randomInt(1,6,x+y);

		super(false, x, y, FRAME.getImage("flower"+type));
	}
}

class Rock extends Tile {
	constructor(x, y, type) {
		if (type == undefined)
			type = randomInt(1,3,x+y);

		super(true, x, y, FRAME.getImage("rock"+type));
	}
}

class Shrub extends Tile {
	constructor(x, y, type, num) {
		if (num == undefined)
			num = randomInt(1,4,x+y);
		else
			num = randomInt(1,num,x+y);

		var flipped = false;
		if (randomInt(0,1,x+y) == 0)
			flipped = true;

		super(false, x, y, FRAME.getImage("shrub"+num+"type"+type));
		this.flipped = flipped;
	}
	render() {
		if (this.flipped) this.ctx.scale(-1,1,1);
		super.render();
		if (this.flipped) this.ctx.scale(-1,1,1);
	}
}

class ArenaShrub extends Shrub {
	constructor(x, y) {
		super(x, y, 0, 5);
	}
}

class ShrubTypeOne extends Shrub {
	constructor(x, y) {
		super(x, y, 1, 4);
	}
}

class ShrubTypeTwo extends Shrub {
	constructor(x, y) {
		super(x, y, 2, 4);
	}
}

class ArenaSequence {
	constructor(className, num, start, interval) {
		this.className = className;
		this.num = num;
		this.startTime = start;
		this.interval = interval;
		this.finished = false;
		this.count = 0;
		this.spawnOnLeft = true;
	}
	update(t) {
		if (this.finished == false) {
			//calculate how many characters we should have made
			var currentPos = Math.floor(Math.max((t - this.startTime)/this.interval,0));
			if (currentPos >= this.num) {
				this.finished = true;
				currentPos = this.num;
			}

			//add a character if we need to
			if (this.count < currentPos) {
				let a = new this.className(0,0);
				a.chaseRange = 700;
				a.y = -300-35;//+a.height/2+1;
				if (this.spawnOnLeft) {
					a.x = -300;
				}
				else {
					a.x = 300;
				}
				this.spawnOnLeft = !this.spawnOnLeft;


				characters.add(a);
				this.count++;
			}
		}
	}
}

class ArenaBattle {
	constructor(name) {
		this.time = 0;
		this.finished = false;
		this.sequences = [];
		this.name = name;
	}
	update(t) {
		if (this.finished) return;
		this.time += t;

		let allFinished = true;
		for (var i = 0; i < this.sequences.length; i++) {
			this.sequences[i].update(this.time);
			if (this.sequences[i].finished == false) {
				allFinished = false;
			}
		}

		if (allFinished) {
			this.finished = true;
		}
	}
	addSequence(seq) {
		this.sequences.push(seq);
	}
	reset() {
		this.time = 0;
	}
	getSequenceClasses() {
		var classMap = new Map();
		for (let i = 0; i < this.sequences.length; i++) {
			if (classMap.has(this.sequences[i].className)) {
				classMap.set(this.sequences[i].className, classMap.get(this.sequences[i].className) + this.sequences[i].num);
			}
			else {
				classMap.set(this.sequences[i].className, this.sequences[i].num);
			}
		}
		return classMap;
	}
	isFinished() {
		return this.finished;
	}
}
