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

class TextBox extends Actor {
	constructor(txt) {
		super();
		this.width = window.innerWidth / FRAME.scaleX;
		this.height = 200;
		this.done = false;
		this.spaceEnabled = false;
		this.y = (window.innerHeight) / FRAME.scaleY - 200;
		
		this.text = new Text();
		this.text.fillStyle = "#FFF";
		this.text.justify = "center";
		this.text.x = this.width/2;
		this.text.y = 75;
		this.text.text = txt;
	}
	update() {
		//moving self and text
		this.y = (window.innerHeight) / FRAME.scaleY - 200;
		this.width = window.innerWidth / FRAME.scaleX;
		this.text.x = this.width/2;
		
		//check for input and finish
		if (keyboard[69] && this.spaceEnabled) {
			this.done = true;
		}
		if (!keyboard[69]) {
			this.spaceEnabled = true;
		}
	}
	render() {
		this.ctx.fillStyle = "#000";
		this.ctx.fillRect(0,0,this.width,this.height);
		this.text.draw();
	}
}

class DialogueTree extends Actor {
	constructor() {
		super();
		this.textBoxes = [];
		this.done = false;
		this.currentIndex = 0;
	}
	addTextBox(txt) {
		this.textBoxes.push(new TextBox(txt));
	}
	update() {
		this.textBoxes[this.currentIndex].update();
		if (this.textBoxes[this.currentIndex].done) {
			//incrementing textBox we're on or saying we're done
			if (this.currentIndex >= this.textBoxes.length - 1) {
				this.done = true;
			}
			else {
				this.currentIndex++;
			}
		}
	}
	draw() {
		this.textBoxes[this.currentIndex].draw();
	}
}

class GUI extends Actor {
	constructor(target) {
		super();
		this.target = target || player;
		
		this.currentTree = null;
		//money stuff
		this.moneyImage = FRAME.getImage("coin");
		this.moneyText = new Text();
		this.moneyText.text = this.target.money;
		this.moneyText.fillStyle = "#FFF";
		this.moneyText.x = 37;
		this.moneyText.y = 50;
		this.moneyDisplay = 0;
		//health stuff
		this.hearts = [];
		this.targetHealth = this.target.health;
		for (var i = 1; i <= this.target.maxHealth; i++) {
			let img = FRAME.getImage("heart");
			if (i > this.targetHealth)
				img = FRAME.getImage("heartBlack");
			this.hearts.push(new ImageActor(i*50-23, 30, img, PIXEL_SIZE));
		}
	}
	update() {
		this.x = -FRAME.x / FRAME.scaleX;
		this.y = -FRAME.y / FRAME.scaleY;
		
		//manage dialogue tree
		if (this.currentTree != null) {
			this.currentTree.update();
			//getting rid of tree when done, and making the target able to move
			if (this.currentTree.done) {
				this.currentTree = null;
				this.target.canMove = true;
			}
		}
		
		//manage hearts
		if (this.targetHealth != this.target.health) {
			for (var i = 0; i < this.target.maxHealth; i++) {
				if (i+1 > this.target.health && i+1 <= this.targetHealth) {
					this.hearts[i].image = FRAME.getImage("heartBlack");
					this.hearts[i].width *= 1.75;
					this.hearts[i].height *= 1.75;
				}
				else if (i+1 <= this.target.health && i+1 > this.targetHealth) {
					this.hearts[i].image = FRAME.getImage("heart");
					this.hearts[i].width *= 1.75;
					this.hearts[i].height *= 1.75;
				}
			}
			this.targetHealth = this.target.health;
		}
		for (var i = 0; i < this.hearts.length; i++) {//lerp from large to normal size
			this.hearts[i].width += (this.hearts[i].image.width*PIXEL_SIZE - this.hearts[i].width) * 0.2;
			this.hearts[i].height += (this.hearts[i].image.height*PIXEL_SIZE - this.hearts[i].height) * 0.2;
		}
		
		//manage money text
		this.moneyDisplay += (this.target.money - this.moneyDisplay) * 0.2;
		this.moneyText.text = Math.floor(this.moneyDisplay);
		if (Math.abs(this.moneyDisplay - this.target.money) < 0.1) {
			this.moneyDisplay = this.target.money;
		}
	}
	render() {
		if (this.currentTree != null) {
			this.currentTree.draw();
		}
		this.ctx.drawImage(this.moneyImage, 7, 57, 25, 25);
		this.moneyText.draw();
		for (var i = 0; i < this.hearts.length; i++) {
			this.hearts[i].draw();
		}
	}
	showTree(tree) {
		this.currentTree = tree;
		this.target.canMove = false;
	}
}

class ShopGUI extends Actor {
	constructor(target) {
		super((-FRAME.x + window.innerWidth/2) / FRAME.scaleX, (-FRAME.y + window.innerHeight/2) / FRAME.scaleY);
		
		this.target = target;
		this.width = 400;
		this.height = 500;
		
		this.exitButton = new Button(this.width/2-40,-this.height/2+35,"x", 40,40);
		this.exitButton.text.fillStyle = "#CC3333";
		this.exitButton.action = function() {sceneManager.change("mainWorld");}
		
		this.moneyImage = FRAME.getImage("coin");
		this.moneyText = new Text();
		this.moneyText.x = -this.width/2 + 60;
		this.moneyText.y = -this.height/2 + 12;
		this.moneyText.fillStyle = "#FFF";
		this.moneyText.fontsize = 40;
		this.moneyLerp = this.target.money;
		
		//for items that you can buy
		this.items = [];
		this.items.push(this.target.shopList.getUnboughtItem("weapon"));
	}
	update() {
		this.x = (-FRAME.x + window.innerWidth/2) / FRAME.scaleX;
		this.y = (-FRAME.y + window.innerHeight/2) / FRAME.scaleY;
		
		//change back to main scene when ESC is pressed
		if (keyboard[27]) {
			this.exitButton.action();
		}
		
		//update money text
		this.moneyLerp += (this.target.money - this.moneyLerp) * 0.2;
		if (Math.abs(this.moneyLerp - this.target.money) < 0.1) {
			this.moneyLerp = this.target.money;
		}
		this.moneyText.text = Math.floor(this.moneyLerp);
		
		//update items in shop
		for (var i = 0; i < this.items.length; i++) {
			this.items[i].update(this.x, this.y+i*150-50);
			
			//attempt to buy an item
			if (this.items[i].buying) {
				this.items[i].buy(this.target);
			}
			
			//get a new item if item is bought
			if (this.items[i].bought) {
				let newItem = this.target.shopList.getUnboughtItem(this.items[i].type);
				if (newItem != -1) {
					this.items[i] = newItem;
				}
				else {
					this.items.splice(i, 1);
				}
			}
		}
		
		this.exitButton.update(this.x, this.y);
	}
	draw() {
		super.draw();
		this.exitButton.draw();
		//items
		for (var i = 0; i < this.items.length; i++) {
			this.items[i].draw();
		}
	}
	render() {
		//cover
		this.ctx.fillStyle = "rgba(0,0,0,0.5)";
		this.ctx.fillRect(-window.innerWidth/2/FRAME.scaleX, -window.innerHeight/2/FRAME.scaleY, window.innerWidth/FRAME.scaleX, window.innerHeight/FRAME.scaleY);
		//shop window
		this.ctx.fillStyle = "#222034";
		this.ctx.shadowColor = "#000";
		this.ctx.shadowBlur = 15;
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
		this.ctx.shadowBlur = 0;
		//money text
		this.ctx.drawImage(this.moneyImage, -this.width/2+15, -this.height/2+15, 40, 40);
		this.moneyText.draw();
	}
	load() {
		this.moneyLerp = this.target.money;
	}
}

class InventoryGUI extends Actor {
	constructor(target) {
		super((-FRAME.x + window.innerWidth/2) / FRAME.scaleX, (-FRAME.y + window.innerHeight/2) / FRAME.scaleY);
		
		this.target = target;
		this.width = 600;
		this.height = 500;
		
		this.playerBox = new PlayerBox(this.target, 0, -this.height/4);
		
		this.pageTitles = [];
		this.pageItems = [];
		this.currentPage = 0;
		
		this.equipButton = new Button(0,20,"Equip");
		this.equipButton.parent = this;
		this.equipButton.action = function() {
			for (let i = 0; i < this.parent.pageItems[this.parent.currentPage].length; i++) {
				if (this.parent.pageItems[this.parent.currentPage][i].selected) {
					this.parent.pageItems[this.parent.currentPage][i].equip(this.parent.target);
					
					//update playerBox depending on type
					if (this.parent.pageItems[this.parent.currentPage][i].type == "weapon") {
						this.parent.playerBox.modelPlayer.getNewWeapon();
					}
				}
			}
		}
		
		this.exitButton = new Button(this.width/2-40,-this.height/2+35,"x", 40,40);
		this.exitButton.text.fillStyle = "#CC3333";
		this.exitButton.action = function() {sceneManager.change("mainWorld");}
	}
	update() {
		this.x = (-FRAME.x + window.innerWidth/2) / FRAME.scaleX;
		this.y = (-FRAME.y + window.innerHeight/2) / FRAME.scaleY;
		
		//change back to main scene when ESC is pressed
		if (keyboard[27]) {
			this.exitButton.action();
		}
		
		this.playerBox.update();
		
		this.equipButton.update(this.x, this.y);
		this.exitButton.update(this.x, this.y);
		
		//inventory items
		for (var i = 0; i < this.pageItems[this.currentPage].length; i++) {
			this.pageItems[this.currentPage][i].update(this.x, this.y);
		}
	}
	draw() {
		super.draw();
		
		for (var i = 0; i < this.pageItems[this.currentPage].length; i++) {
			this.pageItems[this.currentPage][i].draw();
		}
		
		this.equipButton.draw();
		this.exitButton.draw();
	}
	render() {
		//cover
		this.ctx.fillStyle = "rgba(0,0,0,0.5)";
		this.ctx.fillRect(-window.innerWidth/2/FRAME.scaleX, -window.innerHeight/2/FRAME.scaleY, window.innerWidth/FRAME.scaleX, window.innerHeight/FRAME.scaleY);
		//shop window
		this.ctx.fillStyle = "#222034";
		this.ctx.shadowColor = "#000";
		this.ctx.shadowBlur = 15;
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
		this.ctx.shadowBlur = 0;
		
		this.playerBox.draw();
	}
	load() {
		this.pageTitles = this.target.shopList.getTypes();
		
		//push all page items
		for (var i = 0; i < this.pageTitles.length; i++) {
			let items = this.target.shopList.getItems(this.pageTitles[i]);
			this.pageItems[i] = [];
			for (var j = 0; j < items.length; j++) {
				this.pageItems[i].push(new InventoryItem(items[j], j*125-200, 150));
			}
		}
	}
}

class Button extends Actor {
	constructor(x, y, txt, w=150, h=40, fontsize=32) {
		super(x, y);
		this.realX = this.x;
		this.realY = this.y;
		this.realWidth = w;
		this.realHeight = h;
		this.shadowOffset = 5;
		
		this.width = this.realWidth;
		this.height = this.realHeight;
		
		//text things
		this.textY = -this.realHeight/2;
		this.realTextSize = fontsize;
		this.textSize = 32;
		this.text = new Text(0,this.textY);
		this.text.text = txt;
		this.text.fillStyle = "#FFF";
		this.text.fontsize = this.textSize;
		this.text.justify = "center";
		
		this.prevMouse = true;
	}
	update(x,y) {
		this.x = x + this.realX;
		this.y = y + this.realY;
		
		if (mouse.clicking && checkAABBCollision(this, mouse)) {
			this.width += (this.realWidth*1.025 - this.width) * 0.2;
			this.height += (this.realHeight*1.025 - this.height) * 0.2;
			this.textSize += (this.realTextSize*1.05 - this.textSize) * 0.2;
			this.shadowOffset += (7 - this.shadowOffset) * 0.2;
		}
		if (checkAABBCollision(this, mouse)) {
			this.width += (this.realWidth*1.2 - this.width) * 0.2;
			this.height += (this.realHeight*1.2 - this.height) * 0.2;
			this.textSize += (this.realTextSize*1.13 - this.textSize) * 0.2;
			this.shadowOffset += (10 - this.shadowOffset) * 0.2;
			
			if (this.prevMouse == true && mouse.clicking == false) {
				this.action();
			}
		}
		else {
			this.width += (this.realWidth - this.width) * 0.2;
			this.height += (this.realHeight - this.height) * 0.2;
			this.textSize += (this.realTextSize - this.textSize) * 0.2;
			this.shadowOffset += (5 - this.shadowOffset) * 0.2;
		}
		this.prevMouse = mouse.clicking;
		
		//text stuff
		this.textY += (-this.height/2 - this.textY) * 0.2;
		this.text.fontsize = Math.floor(this.textSize);
		this.text.y = this.textY;
	}
	render() {
		this.ctx.fillStyle = "rgba(0,0,0,0.5)";
		this.ctx.fillRect(-this.width/2+this.shadowOffset, -this.height/2+this.shadowOffset, this.width, this.height);
		this.ctx.fillStyle = "#3F3F57";
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
		this.text.draw();
	}
	action() {}
}

class ShopItem extends Actor {
	constructor(type, cost, className, name) {
		super(-1000);
		
		this.name = name;
		this.type = type;
		this.cost = cost;
		this.className = className;
		this.bought = false;
		this.buying = false;
		this.prevClicking = false;
		
		this.drawingFlash = false;
		this.failedBuy = false;
		this.flashTimer = 0;
		this.failTimer = 0;
		
		this.realWidth = 325;
		this.realHeight = 75;
		this.width = this.realWidth;
		this.height = this.realHeight;
		this.shadowOffset = 5;
		
		this.text = new Text();
		this.text.fillStyle = "#FFF";
		this.text.text = this.name;
		this.text.x = -this.width/2+5;
		this.text.y = -this.height/2;
		this.text.fontsize = 24;
		
		this.image = (new this.className()).image;
		this.imageWidth = this.image.width*PIXEL_SIZE*1.2;
		this.imageHeight = this.image.height*PIXEL_SIZE*1.2;
		
		this.costImage = FRAME.getImage("coin");
		this.costText = new Text();
		this.costText.fillStyle = "#FFF";
		this.costText.text = this.cost;
		this.costText.justify = "right";
		this.costText.fontsize = 24;
		this.costText.x = this.width/2-5;
		this.costText.y = -this.height/2;
	}
	update(x, y) {
		this.x = x;
		this.y = y;
		
		//lerp sizes n stuff when moused over
		if (mouse.clicking && checkAABBCollision(this, mouse)) {
			this.width += (this.realWidth*1.05 - this.width) * 0.2;
			this.height += (this.realHeight*1.05 - this.height) * 0.2;
			this.shadowOffset += (7 - this.shadowOffset) * 0.2;
		}
		else if (checkAABBCollision(this, mouse)) {
			this.width += (this.realWidth*1.1 - this.width) * 0.2;
			this.height += (this.realHeight*1.1 - this.height) * 0.2;
			this.shadowOffset += (10 - this.shadowOffset) * 0.2;
			
			if (this.prevClicking == true) {
				this.buying = true;
			}
		}
		else {
			this.width += (this.realWidth - this.width) * 0.2;
			this.height += (this.realHeight - this.height) * 0.2;
			this.shadowOffset += (5 - this.shadowOffset) * 0.2;
		}
		this.prevClicking = mouse.clicking;
		
		//failed buy flash
		if (this.failedBuy) {
			this.failTimer++;
			this.flashTimer--;
			if (this.flashTimer <= 0) {
				this.flashTimer = 10;
				this.drawingFlash = !this.drawingFlash
			}
			if (this.failTimer >= 60) {
				this.flashTimer = 0;
				this.failTimer = 0;
				this.failedBuy = false;
				this.drawingFlash = false;
			}
		}
		
		//move text n stuff
		this.text.x = -this.width/2+5;
		this.text.y = -this.height/2;
		this.costText.x = this.width/2-5;
		this.costText.y = -this.height/2;
	}
	render() {
		this.ctx.fillStyle = "rgba(0,0,0,0.5)";
		this.ctx.fillRect(-this.width/2+this.shadowOffset, -this.height/2+this.shadowOffset, this.width, this.height);
		this.ctx.fillStyle = "#3F3F57";
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
		
		this.text.draw();
		
		let imageX = -this.imageWidth/2 - this.width/2 + this.text.width/2;
		let imageY = this.height/3 - this.imageHeight - 5;
		this.ctx.drawImage(this.image, imageX, imageY, this.imageWidth, this.imageHeight);
		
		this.ctx.drawImage(this.costImage, this.costText.x-this.costText.width-27, this.costText.y+5, 20, 20);
		this.costText.draw();
		
		//red cover
		if (this.drawingFlash) {
			this.ctx.fillStyle = "#DB5764";
			this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
		}
	}
	buy(target) {
		if (target.money >= this.cost) {
			target.money -= this.cost;
			this.bought = true;
		}
		else {
			this.failedBuy = true;
		}
		this.buying = false;
	}
}

class ShopList {
	constructor() {
		this.items = new Map();
		this.types = [];
	}
	addItem(type, cost, className, name) {
		if (!this.items.has(type)) {
			this.items.set(type, []);
			this.types.push(type);
		}
		this.items.get(type).push(new ShopItem(type, cost, className, name));
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
	getItems(type) {
		return this.items.get(type);
	}
	getTypes() {
		return this.types;
	}
}

class InventoryItem extends Actor {
	constructor(shopItem, x, y) {
		super(-10000);
		
		this.name = shopItem.name;
		this.type = shopItem.type;
		this.bought = shopItem.bought;
		this.className = shopItem.className;
		
		this.realX = x;
		this.realY = y;
		this.realWidth = 100;
		this.realHeight = 100;
		this.width = this.realWidth;
		this.height = this.realHeight;
		this.shadowOffset = 5;
		this.rBits = 63;
		this.gBits = 63;
		this.bBits = 87;
		
		this.selected = false;
		this.prevClicking = false;
		
		this.image = shopItem.image;
		this.imageWidth = this.image.width*PIXEL_SIZE;
		this.imageHeight = this.image.height*PIXEL_SIZE;
		
		this.nameText = new Text();
		this.nameText.fillStyle = "#FFF";
		this.nameText.text = this.name;
		this.nameText.justify = "center";
		this.nameText.fontsize = 24;
		this.nameText.y = -this.height/2;
		
		if (this.bought == false) {
			this.nameText.text = "???";
			this.nameText.y = 0;
		}
	}
	update(x, y) {
		this.x = x + this.realX;
		this.y = y + this.realY;
		
		this.nameText.y = -this.height/2;
		if (this.bought == false) {
			this.nameText.y = -12;
		}
		
		//setting selected status
		if (checkAABBCollision(mouse, this) && this.prevClicking == true && mouse.clicking == false && this.bought) {
			this.selected = true;
		}
		else if (this.prevClicking == true && mouse.clicking == false) {
			this.selected = false;
		}
		
		//change color
		if (this.selected) {
			this.rBits += (150 - this.rBits) * 0.1;
			this.gBits += (150 - this.gBits) * 0.1;
			this.bBits += (170 - this.bBits) * 0.1;
		}
		else if (this.bought == false) {
			this.rBits = 25;
			this.gBits = 25;
			this.bBits = 25;
		}
		else {
			this.rBits += (63 - this.rBits) * 0.1;
			this.gBits += (63 - this.gBits) * 0.1;
			this.bBits += (87 - this.bBits) * 0.1;
		}
		
		//make bigger n stuff
		if (checkAABBCollision(mouse, this) && mouse.clicking) {
			this.width += (this.realWidth*1.05 - this.width) * 0.2;
			this.height += (this.realHeight*1.05 - this.height) * 0.2;
			this.shadowOffset += (7 - this.shadowOffset) * 0.2;
		}
		else if (checkAABBCollision(mouse, this) || this.selected) {
			this.width += (this.realWidth*1.1 - this.width) * 0.2;
			this.height += (this.realHeight*1.1 - this.height) * 0.2;
			this.shadowOffset += (10 - this.shadowOffset) * 0.2;
		}
		else {
			this.width += (this.realWidth - this.width) * 0.2;
			this.height += (this.realHeight - this.height) * 0.2;
			this.shadowOffset += (5 - this.shadowOffset) * 0.2;
		}
		this.prevClicking = mouse.clicking;
	}
	render() {
		this.ctx.fillStyle = "rgba(0,0,0,0.5)";
		this.ctx.fillRect(-this.width/2+this.shadowOffset, -this.height/2+this.shadowOffset, this.width, this.height);
		this.ctx.fillStyle = "#"+rgbToHex(this.rBits, this.gBits, this.bBits);
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
		
		this.nameText.draw();
		if (this.bought) {
			this.ctx.drawImage(this.image, -this.imageWidth/2, -this.imageHeight/2, this.imageWidth, this.imageHeight);
		}
	}
	equip(target) {
		if (this.type == "weapon") {
			target.weapon = new this.className(target);
		}
	}
}

class PlayerBox extends Actor {
	constructor(target, x, y) {
		super(x, y);
		
		this.width = 250;
		this.height = 200;
		this.shadowOffset = 5;
		
		this.modelPlayer = new ModelPlayer(target);
	}
	update() {
		this.modelPlayer.update();
	}
	render() {
		//actual box and shadow
		this.ctx.fillStyle = "rgba(0,0,0,0.5)";
		this.ctx.fillRect(-this.width/2+this.shadowOffset, -this.height/2+this.shadowOffset, this.width, this.height);
		this.ctx.fillStyle = "#3F3F57";
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
		
		//player
		this.modelPlayer.draw();
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