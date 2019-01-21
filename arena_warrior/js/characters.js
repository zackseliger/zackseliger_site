class Player extends Actor {
	constructor(x, y) {
		super(x, y);

		this.walkStrip = new ImageStrip();
		this.walkStrip.add(FRAME.getImage("playerWalk1"));
		this.walkStrip.add(FRAME.getImage("playerWalk2"));
		this.idleImage = this.walkStrip.images[0];

		this.facingRight = true;
		this.image = this.idleImage;
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
		this.canMove = true;

		//stuff to help gui
		this.health = 3;
		this.maxHealth = 3;
		this.armorHealth = 0;
		this.maxArmorHealth = 0;

		this.polygon = new Polygon(x,y,this.width/2-PIXEL_SIZE/2);
		this.polygon.addPoint(1,-this.height/this.width);
		this.polygon.addPoint(1,this.height/this.width);
		this.polygon.addPoint(-1,this.height/this.width);
		this.polygon.addPoint(-1,-this.height/this.width);

		this.restart();
	}
	update(realTime) {
		var prevx = this.x;
		var prevy = this.y;

		//y-axis
		if (keyboard[38] || keyboard[87]) {
			this.y -= this.speed;
		}
		if (keyboard[40] || keyboard[83]) {
			this.y += this.speed;
		}
		//not moving through solid tiles
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.y = prevy;
			}
		}

		//x-axis
		if (keyboard[37] || keyboard[65]) {
			this.x -= this.speed;
		}
		if (keyboard[39] || keyboard[68]) {
			this.x += this.speed;
		}
		//not moving through solid tiles
		for (var i = 0; i < solidTiles.objects.length; i++) {
			if (checkAABBCollision(this, solidTiles.objects[i])) {
				this.x = prevx;
			}
		}

		//attack with weapon
		if (keyboard[32] || (mouse.clicking && mouse.prevClicking == false)) {
			if (this.weapon != null && this.weapon.attacking == false) {
				this.weapon.attack();
			}
		}

		//moving/not moving
		if (this.canMove == false) {
			this.x = prevx;
			this.y = prevy;
		}

		//updating images
		if (prevx != this.x || prevy != this.y) {
			if (prevx < this.x) {
				this.facingRight = true;
				this.rotation += (0.1 - this.rotation) * 0.2;
			}
			else if (prevx > this.x) {
				this.facingRight = false;
				this.rotation += (-0.1 - this.rotation) * 0.2;
			}
			this.image = this.walkStrip.step(0.1, realTime);
		}
		else {
			this.image = this.idleImage;
			this.rotation *= 0.9;
		}

		//weapon stuff
		if (this.weapon != null) {
			this.weapon.update();
		}
		//armor stuff
		if (this.armor != null) {
			this.armor.update();
			if (this.image != this.idleImage) {
				this.armor.y += PIXEL_SIZE;
			}
		}

		//invincible handling
		if (this.invinTimer >= 175) {
			this.invinTimer = 0;
			this.invincible = false;
			this.flickerTimer = 0;
			this.flickering = false;
		}
		else if (this.invincible) {
			this.invinTimer += 1;
			this.flickerTimer += 1;
			if (this.flickerTimer >= 10) {
				this.flickering = !this.flickering;
				this.flickerTimer = 0.0;
			}
		}

		//polygon updating
		this.polygon.x = this.x;
		this.polygon.y = this.y;
		this.polygon.rotation = this.rotation;
	}
	draw() {
		if (this.weapon != null) this.weapon.draw();

		if (this.flickering) this.ctx.globalAlpha = 0.5;
		super.draw();
		if (this.armor != null) this.armor.draw();
		if (this.flickering) this.ctx.globalAlpha = 1.0;
	}
	render() {
		if (!this.facingRight) this.ctx.scale(-1, 1, 1);
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
		if (!this.facingRight) this.ctx.scale(-1, 1, 1);
	}
	hurt() {
		if (this.invincible == false) {
			FRAME.shake(100,0.2);
			this.invincible = true;
			this.flickering = true;
			if (this.armorHealth > 0) {
				this.armorHealth -= 1;
				this.armorHealthPercentage = (this.armorHealth / this.maxArmorHealth);
			}
			else {
				this.health -= 1;
			}
		}
	}
	die() {
		if (this.canMove == true) {
			let minusMoney = this.money/4;
			this.money -= minusMoney;
			for (let i = 0; i < minusMoney; i++) {
				new Coin(this.x, this.y);
			}
		}
		this.canMove = false;
		characters.remove(this);
	}
	equipArmor(className) {
		this.armor = new className(this);
		this.maxArmorHealth = this.armor.health;
		this.armorHealth = this.armor.health;
	}
	restart() {
		//weapon and armor
		this.weapon = null;
		this.armor = null;

		//settings and health
		this.speed = 4;
		this.health = 3;
		this.maxHealth = 3;
		this.armorHealth = 0;
		this.maxArmorHealth = 0;
		this.armorHealthPercentage = 1;
		this.money = 0;
		this.canMove = true;

		//shop stuff
		this.shopList = new ShopList();
		this.shopList.setBuyCallback("land", function(item){groundAreaManager.addGroundArea(new item.className())});
		this.shopList.addItem("weapon", 0, Spear, "Spear");
		this.shopList.addItem("weapon", 75, Sword, "Sword");
		this.shopList.addItem("weapon", 150, Bow, "Bow");
		this.shopList.addItem("armor", 50, Leather, "Leather Armor");
		this.shopList.addItem("armor", 200, GoldArmor, "Gold Armor");
		this.shopList.addItem("land", 15, FirstGroundArea, "First Stage");
		this.shopList.addItem("land", 150, SecondGroundArea, "Second Stage");
		this.shopList.makeEquippable("weapon");
		this.shopList.makeEquippable("armor");

		//invincibility stuff
		this.invincible = false;
		this.invinTimer = 0.0;
		this.flickering = false;
		this.flickerTimer = 0.0;
	}
	refresh() {
		this.health = this.maxHealth;
		this.armorHealth = this.maxArmorHealth;
	}
}

class ModelPlayer extends Actor {
	constructor(target) {
		super();

		this.target = target;
		this.walkStrip = new ImageStrip();
		this.walkStrip.add(FRAME.getImage("playerWalk1"));
		this.walkStrip.add(FRAME.getImage("playerWalk2"));
		this.idleImage = this.walkStrip.images[0];

		this.facingRight = true;
		this.image = this.idleImage;
		this.width = this.image.width*PIXEL_SIZE;
		this.height = this.image.height*PIXEL_SIZE;
		this.scale = 2;
		this.weapon = new Spear(this);
		this.armor = null;

		this.running = false;
		this.animationTimer = 0;
	}
	update() {
		//weapon updating
		if (this.weapon != null) {
			this.weapon.update();
		}
		//armor updating
		if (this.armor != null) {
			this.armor.update();
			if (this.image != this.idleImage) {
				this.armor.y += PIXEL_SIZE;
			}
		}

		//update animation state
		this.animationTimer -= 1;
		if (this.animationTimer <= 0) {
			this.animationTimer = Math.random()*100+60;

			if (Math.random() < 0.5) this.facingRight = true;
			else this.facingRight = false;

			if (Math.random() < 0.5) this.running = true;
			else {
				this.running = false;
				this.image = this.idleImage;
			}
		}

		//update images and rotate
		if (this.running) {
			if (this.facingRight) {
				this.rotation += (0.1 - this.rotation) * 0.2;
			}
			else {
				this.rotation += (-0.1 - this.rotation) * 0.2;
			}
			this.image = this.walkStrip.step(6, 1);
		}
		else {
			this.rotation *= 0.9;
		}
	}
	draw() {
		this.ctx.scale(this.scale, this.scale, 1);
		if (this.weapon != null) this.weapon.draw();
		this.ctx.scale(1/this.scale, 1/this.scale, 1);

		super.draw();

		this.ctx.scale(this.scale, this.scale, 1);
		if (this.armor != null) this.armor.draw();
		this.ctx.scale(1/this.scale, 1/this.scale, 1);
	}
	render() {
		this.ctx.scale(this.scale, this.scale, 1);
		if (!this.facingRight) this.ctx.scale(-1, 1, 1);
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
		if (!this.facingRight) this.ctx.scale(-1, 1, 1);
		this.ctx.scale(1/this.scale, 1/this.scale, 1);
	}
	getNewWeapon() {
		if (this.target.weapon == null) {
			this.weapon = null;
			return;
		}
		let construct = this.target.weapon.constructor;
		this.weapon = new construct(this);
	}
	getNewArmor() {
		if (this.target.armor == null) {
			this.armor = null;
			return;
		}
		let construct = this.target.armor.constructor;
		this.armor = new construct(this);
	}
}

class Mayor extends Actor {
	constructor(x, y) {
		super(x, y);

		this.idleStrip = new ImageStrip();
		this.idleStrip.add(FRAME.getImage("mayorIdle1"));
		this.idleStrip.add(FRAME.getImage("mayorIdle2"));

		this.image = this.idleStrip.images[0];
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;

		this.dialogueTree = new DialogueTree();
		this.dialogueTree.addTextBox("hey, kiddo");
		this.dialogueTree.addTextBox("hows it goin?");
	}
	update(realTime) {
		this.image = this.idleStrip.step(0.3, realTime);
	}
	render() {
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
	}
	interact(player) {
		showTree(this.dialogueTree);
	}
}

class MenuChar extends Actor {
	constructor(x, y, img, txt) {
		super(x, y);
		this.yOscillator = Math.random()*2*Math.PI;
		this.extraY = 0;
		this.startingY = this.y;
		this.colliding = false;

		this.image = img;
		this.normalWidth = this.image.width*PIXEL_SIZE;
		this.normalHeight = this.image.height*PIXEL_SIZE;
		this.expandedWidth = this.normalWidth*1.2;
		this.expandedHeight = this.normalHeight*1.2;
		this.width = this.normalWidth;
		this.height = this.normalHeight;
		this.displayWidth = this.width;
		this.displayHeight = this.height;

		this.text = new Text();
		this.text.fillStyle = "#FFF";
		this.text.text = txt;
		this.text.fontsize = 32;
		this.text.justify = "center";
		this.text.y = -this.height;
	}
	update() {
		//changing display size
		this.displayWidth += (this.width - this.displayWidth) * 0.2;
		this.displayHeight += (this.height - this.displayHeight) * 0.2;
		if (Math.abs(this.displayWidth - this.width) < 0.01 && Math.abs(this.displayHeight - this.height) < 0.01) {
			this.displayWidth = this.width;
			this.displayHeight = this.height;
		}

		//resize when colliding with player
		if (this.colliding) {
			this.width = this.expandedWidth;
			this.height = this.expandedHeight;
		}
		else {
			this.width = this.normalWidth;
			this.height = this.normalHeight;
		}
		this.colliding = false;

		//oscillating motion
		this.yOscillator += 0.03;
		this.extraY = Math.sin(this.yOscillator)*5;
		this.y = this.startingY + this.extraY;

		//managing text
		this.text.y = -this.displayHeight - 10 - this.extraY;
	}
	render() {
		this.ctx.drawImage(this.image, -this.displayWidth/2, -this.displayHeight/2, this.displayWidth, this.displayHeight);
		if (this.width > this.normalWidth) this.text.draw();
	}
	collide() {
		this.colliding = true;
	}
}

class SaveChar extends MenuChar {
	constructor(x, y) {
		super(x, y, FRAME.getImage("floppyDisk"), "Save");
	}
	interact() {
		saveGame();
	}
}

class ShopChar extends MenuChar {
	constructor(x, y) {
		super(x, y, FRAME.getImage("market"), "Shop");
	}
	interact() {
		sceneManager.change("shop");
	}
}

class InventoryChar extends MenuChar {
	constructor(x, y) {
		super(x, y, FRAME.getImage("fittingRoom"), "Inventory");
	}
	interact() {
		sceneManager.change("inventory");
	}
}

class ArenaChar extends MenuChar {
	constructor(x, y) {
		super(x, y, FRAME.getImage("arena"), "Arena");
	}
	update() {
		super.update();
	}
	interact() {
		if (groundAreaManager.getCurrentGroundArea() != 0) {
			sceneManager.change("arenaMenu");
		}
	}
}

class ArrowRightChar extends MenuChar {
	constructor(x, y) {
		super(x, y, FRAME.getImage("charArrow"), "Next Area");
		this.canInteract = true;
	}
	update() {
		super.update();

		if (this.canInteract == false && keyboard[69] == false) {
			this.canInteract = true;
		}
		if (groundAreaManager.getCurrentGroundArea() == groundAreaManager.getMaxGroundArea()) {
			this.canInteract = false;
			this.width = 0;
			this.height = 0;
		}
	}
	interact() {
		if (this.canInteract == true) {
			groundAreaManager.gotoGroundArea(groundAreaManager.getCurrentGroundArea()+1);
			this.canInteract = false;
		}
	}
}

class ArrowLeftChar extends MenuChar {
	constructor(x, y) {
		super(x, y, FRAME.getImage("charArrow"), "Previous Area");
		this.canInteract = true;
	}
	update() {
		super.update();

		if (this.canInteract == false && keyboard[69] == false) {
			this.canInteract = true;
		}
		if (groundAreaManager.getCurrentGroundArea() == 0) {
			this.canInteract = false;
			this.width = 0;
			this.height = 0;
		}
	}
	interact() {
		if (this.canInteract == true) {
			groundAreaManager.gotoGroundArea(groundAreaManager.getCurrentGroundArea()-1);
			this.canInteract = false;
		}
	}
	render() {
		this.ctx.scale(-1, 1, 1);
		this.ctx.drawImage(this.image, -this.displayWidth/2, -this.displayHeight/2, this.displayWidth, this.displayHeight);
		this.ctx.scale(-1, 1, 1);
		if (this.width > this.normalWidth) this.text.draw();
	}
}

/*class DungeonEntrance extends Actor {
	constructor(x, y, difficulty) {
		super(x, y);
		this.image = FRAME.getImage("dungeon");
		this.width = this.image.width*PIXEL_SIZE;
		this.height = this.image.height*PIXEL_SIZE;
		this.displayWidth = this.width;
		this.displayHeight = this.height;
		this.colliding = false;
		this.difficulty = difficulty;

		this.text = new Text();
		this.text.fillStyle = "#FFF";
		this.text.text = "difficulty: "+difficulty;
		this.text.fontsize = 24;
		this.text.justify = "center";
		this.text.y = -this.height;
	}
	update() {
		this.displayWidth += (this.width - this.displayWidth) * 0.2;
		this.displayHeight += (this.height - this.displayHeight) * 0.2;
		if (Math.abs(this.displayWidth - this.width) < 0.01 && Math.abs(this.displayHeight - this.height) < 0.01) {
			this.displayWidth = this.width;
			this.displayHeight = this.height;
		}

		//resizing when colliding with player
		if (this.colliding) {
			this.width = this.image.width*PIXEL_SIZE*1.2;
			this.height = this.image.height*PIXEL_SIZE*1.2;
		}
		else {
			this.width = this.image.width*PIXEL_SIZE;
			this.height = this.image.height*PIXEL_SIZE;
		}
		this.colliding = false;

		//managing text
		this.text.y = -this.displayHeight + 15;
	}
	render() {
		this.ctx.drawImage(this.image, -this.displayWidth/2, -this.displayHeight/2, this.displayWidth, this.displayHeight);
		if (this.width > this.image.width*PIXEL_SIZE) this.text.draw();
	}
	collide() {
		this.colliding = true;
	}
}*/

class NPC extends Actor {
	constructor(x,y,type) {
		super(x,y);

		//type stuff
		this.type = type;
		if (type == undefined) {
			this.type = Math.floor(Math.random() * 6 + 1);
		}

		//loadimg images
		this.walkStrip = new ImageStrip();
		this.walkStrip.add(FRAME.getImage("npc"+this.type+"walk1"));
		this.walkStrip.add(FRAME.getImage("npc"+this.type+"walk2"));
		this.idleImage = this.walkStrip.images[0];

		//dialogue
		this.dialogueTree = new DialogueTree();
		this.dialogueTree.addTextBox("lmaooo");

		//everything else
		this.image = this.idleImage;
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
		this.facingRight = true;
		this.speed = 1;
		this.timer = 0;
		this.horizontalMovement = 0;
		this.verticalMovement = 0;
	}
	update(realTime) {
		var prevx = this.x;
		var prevy = this.y;

		//movement
		this.x += this.speed * this.horizontalMovement;
		this.y += this.speed * this.verticalMovement;

		//resetting timer
		this.timer -= 1;
		if (this.timer < 0) {
			this.horizontalMovement = Math.floor(Math.random() * 3 - 1);
			this.verticalMovement = Math.floor(Math.random() * 3 - 1);
			this.timer = Math.floor(Math.random() * 30 + 30);
		}

		//changing image if moved
		if (prevx != this.x || prevy != this.y) {
			if (prevx < this.x) {
				this.facingRight = true;
				this.rotation += (0.05 - this.rotation) * 0.2;
			}
			else if (prevx > this.x) {
				this.facingRight = false;
				this.rotation += (-0.05 - this.rotation) * 0.2;
			}
			this.image = this.walkStrip.step(0.1, realTime);
		}
		else {
			this.image = this.idleImage;
			this.rotation *= 0.9;
		}
	}
	render() {
		if (!this.facingRight) this.ctx.scale(-1, 1, 1);
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
		if (!this.facingRight) this.ctx.scale(-1, 1, 1);
	}
	interact() {
		showTree(this.dialogueTree);
	}
}
