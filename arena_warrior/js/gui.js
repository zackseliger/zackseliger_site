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
		//armor stuff
		this.shields = [];
		this.targetArmor = this.target.armorHealth;
		this.targetMaxArmor = this.target.maxArmorHealth;
		for (var i = 1; i <= this.targetMaxArmor; i++) {
			var img = FRAME.getImage("shield");
			if (i > this.targetArmor)
				img = FRAME.getImage("shieldBlack");
			this.shields.push(new ImageActor(i*50+this.hearts.length*50-23, 30, img, PIXEL_SIZE));
		}
		//on-death stuff
		this.targetDead = false;
		this.youDiedText = new Text(0, -150, "You Died");
		this.youDiedText.fillStyle = "#DF4050";
		this.youDiedText.justify = "center";
		this.youDiedText.setFontSize(64);
		this.dimBackground = new Actor();
		this.dimBackground.render = function() {
			this.ctx.fillStyle = "rgba(0,0,0,0.5)";
			this.ctx.fillRect(0, 0, window.innerWidth/FRAME.scaleX, window.innerHeight/FRAME.scaleY);
		}
		//save text
		this.saveText = new Text(0,0,"Saved...");
		this.saveText.fillStyle = "#56DF69";
		this.saveText.justify = "right";
		this.saveText.setFontSize(32);
		this.saveTextAlpha = 0.0;
	}
	update() {
		this.x = (-FRAME.x - window.innerWidth/2) / FRAME.scaleX;
		this.y = (-FRAME.y - window.innerHeight/2) / FRAME.scaleY;

		//see if dead
		if (this.target.health <= 0 && this.target.armorHealth <= 0) {
			this.targetDead = true;
			this.youDiedText.x = window.innerWidth/2/FRAME.scaleX;
			this.youDiedText.y = window.innerHeight/2/FRAME.scaleY - 250;
		}
		else {
			this.targetDead = false;
		}

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
			for (var i = 0; i < this.targetHealth; i++) {
				//if health was lost change image and make them large
				if (i+1 > this.target.health && i+1 <= this.targetHealth) {
					this.hearts[i].image = FRAME.getImage("heartBlack");
					this.hearts[i].width *= 1.75;
					this.hearts[i].height *= 1.75;
				}
			}
			//if health was gained change image and make them large
			for (var i = 0;i < this.target.health; i++) {
				if (i+1 <= this.target.health && i+1 > this.targetHealth) {
					this.hearts[i].image = FRAME.getImage("heart");
					this.hearts[i].width *= 1.75;
					this.hearts[i].height *= 1.75;
				}
			}
			this.targetHealth = this.target.health;
		}
		//lerp from large to normal size
		for (var i = 0; i < this.hearts.length; i++) {
			this.hearts[i].width += (this.hearts[i].image.width*PIXEL_SIZE - this.hearts[i].width) * 0.2;
			this.hearts[i].height += (this.hearts[i].image.height*PIXEL_SIZE - this.hearts[i].height) * 0.2;
		}

		//recreate array if max armor changed
		if (this.targetMaxArmor != this.target.maxArmorHealth) {
			this.shields = [];
			this.targetMaxArmor = this.target.maxArmorHealth;
			for (var i = 1; i <= this.targetMaxArmor; i++) {
				var img = FRAME.getImage("shield");
				if (i > this.target.armorHealth)
					img = FRAME.getImage("shieldBlack");
				this.shields.push(new ImageActor(i*50+this.hearts.length*50-23, 30, img, PIXEL_SIZE));
			}
		}
		//manage shields
		if (this.targetArmor != this.target.armorHealth) {
			//if armor was lost change image and make them large
			for (var i = 0; i < this.shields.length; i++) {
				if (i+1 > this.target.armorHealth && i+1 <= this.targetArmor) {
					this.shields[i].image = FRAME.getImage("shieldBlack");
					this.shields[i].width *= 1.75;
					this.shields[i].height *= 1.75;
				}
			}
			//if armor was gained change image and make them large
			for (var i = 0; i < this.shields.length; i++) {
				if (i+1 > this.targetArmor && i+1 <= this.target.armorHealth) {
					this.shields[i].image = FRAME.getImage("shield");
					this.shields[i].width *= 1.75;
					this.shields[i].height *= 1.75;
				}
			}
			this.targetArmor = this.target.armorHealth;
		}
		//lerp from large to normal size
		for (var i = 0; i < this.shields.length; i++) {
			this.shields[i].width += (this.shields[i].image.width*PIXEL_SIZE - this.shields[i].width) * 0.2;
			this.shields[i].height += (this.shields[i].image.height*PIXEL_SIZE - this.shields[i].height) * 0.2;
		}

		//manage money text
		this.moneyDisplay += (this.target.money - this.moneyDisplay) * 0.2;
		this.moneyText.text = Math.floor(this.moneyDisplay);
		if (Math.abs(this.moneyDisplay - this.target.money) < 0.1) {
			this.moneyDisplay = this.target.money;
		}

		//update saveText
		this.saveText.x = (window.innerWidth - 5) / FRAME.scaleX;
		this.saveTextAlpha -= 0.01;
		if (this.saveTextAlpha < 0) {
			this.saveTextAlpha = 0.0;
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
		for (var i = 0; i < this.shields.length; i++) {
			this.shields[i].draw();
		}

		//see if dead
		if (this.target.health <= 0 && this.target.armorHealth <= 0) {
			this.dimBackground.draw();
			this.youDiedText.draw();
		}

		//render saved text
		if (this.saveTextAlpha > 0.0) {
			this.ctx.globalAlpha = this.saveTextAlpha;
			this.saveText.draw();
			this.ctx.globalAlpha = 1;
		}
	}
	showTree(tree) {
		this.currentTree = tree;
		this.target.canMove = false;
	}
	catchUp() {
		this.moneyDisplay = this.target.money;
		this.update();
	}
	flashSaveText() {
		this.saveTextAlpha = 1.0;
	}
}

class TutorialGUI extends Actor {
	constructor() {
		super();
		
		this.target = player;
		
		this.firstText = new Text(0,0,"");
		this.firstText.setFontSize(36);
		this.firstText.justify = "center";
		this.firstText.fillStyle = "#FFF";
		
		this.secondText = new Text(0,0,"");
		this.secondText.setFontSize(36);
		this.secondText.justify = "center";
		this.secondText.fillStyle = "#FFF";
		
		this.phase = -1;
		this.firstLines = ["Welcome to Arenaa.io!", "Use \'E\' to enter buildings", "Go to the \'Inventory\' building", "Use \'Space\' or left mouse to attack", "Nice. You can afford the next stage", "Before you go", "If you die in the arena", "Enter the right arrow to advance"];
		this.secondLines = ["Use WASD or the arrow keys to move", "Buy a Spear from the shop", "To equip your new spear", "Get 15 gold", "Buy \'first stage\' when you're ready", "The arena is dangerous", "You must restart the game", ""];
		
		//for testing moving
		this.targetPrevx = this.target.x;
		this.targetPrevy = this.target.y;
		this.wBox = new LightUpBox(0, 150);
		this.aBox = new LightUpBox(-60, 210);
		this.sBox = new LightUpBox(0, 210);
		this.dBox = new LightUpBox(60, 210);
		
		//for last couple phases
		this.phaseTimer = 0;
	}
	update() {
		var prevPhase = this.phase;
		this.x = -FRAME.x / FRAME.scaleX;
		this.y = -FRAME.y / FRAME.scaleY;
		
		//move text
		this.firstText.y = -250;
		this.secondText.y = -200;
		
		if (this.phase == 0) {
			this.wBox.update();
			this.aBox.update();
			this.sBox.update();
			this.dBox.update();
			
			//testing for w,a,s,d input
			if (this.target.x - this.targetPrevx < 0) this.aBox.lightUp();
			if (this.target.x - this.targetPrevx > 0) this.dBox.lightUp();
			if (this.target.y - this.targetPrevy < 0) this.wBox.lightUp();
			if (this.target.y - this.targetPrevy > 0) this.sBox.lightUp();
			this.targetPrevx = this.target.x;
			this.targetPrevy = this.target.y;
			
			//to see if player went in every direction
			if (this.wBox.isLit() && this.aBox.isLit() && this.sBox.isLit() && this.dBox.isLit()) {
				this.phase++;
			}
		}
		else if (this.phase == 1) {
			//see if player bought the spear
			if (this.target.shopList.isBought("weapon", "Spear")) {
				this.phase++;
			}
		}
		else if (this.phase == 2) {
			//put text at bottom
			this.firstText.y = 150;
			this.secondText.y = 200;
			
			//to see if player has a weapon
			if (this.target.weapon != null) {
				this.phase++;
			}
		}
		else if (this.phase == 3) {
			//put text at bottom
			this.firstText.y = 150;
			this.secondText.y = 200;
			
			//see if player can afford the new ground area
			if (this.target.money >= 15) {
				this.phase++;
			}
		}
		else if (this.phase == 4) {
			//put text at bottom
			this.firstText.y = 150;
			this.secondText.y = 200;
			
			if (this.target.shopList.isBought("land", "First Stage")) {
				this.phase++;
			}
		}
		else if (this.phase == 5) {
			//put text at bottom
			this.firstText.y = 150;
			this.secondText.y = 200;
			//make text color red
			this.firstText.fillStyle = "#DF4050";
			this.secondText.fillStyle = "#DF4050";
			
			this.phaseTimer++;
			if (this.phaseTimer > 300) {
				this.phase++;
				this.phaseTimer = 0;
			}
		}
		else if (this.phase == 6) {
			//put text at bottom
			this.firstText.y = 150;
			this.secondText.y = 200;
			
			this.phaseTimer++;
			if (this.phaseTimer > 300) {
				this.phase++;
				this.phaseTimer = 0;
			}
		}
		else if (this.phase == 7) {
			//put text at bottom
			this.firstText.y = 150;
			this.secondText.y = 200;
			//color back
			this.firstText.fillStyle = "#FFF";
		}
		
		//goto first phase
		if (this.phase < 0) {
			this.phase++;
		}
		//screen shake for passing and changing text
		if (this.phase != prevPhase) {
			FRAME.shake(100, 0.2);
			this.firstText.text = this.firstLines[this.phase];
			this.secondText.text = this.secondLines[this.phase];
		}
	}
	render() {
		this.firstText.draw();
		this.secondText.draw();
		
		if (this.phase == 0) {
			this.wBox.draw();
			this.aBox.draw();
			this.sBox.draw();
			this.dBox.draw();
		}
	}
	setPhase(ph) {
		this.phase = ph;
	}
}

class ArenaGUI extends Actor {
	constructor(target) {
		super();

		this.won = 0;
		this.target = target;
		if (this.target === undefined)
			this.target = player;

		//text
		this.victoryText = new Text(0,-200,"Victory");
		this.victoryText.fillStyle = "#56DF69";
		this.victoryText.justify = "center";
		this.victoryText.setFontSize(64);

		//background. This one is only used for victory
		this.dimBackground = new Actor();
		this.dimBackground.render = function() {
			this.ctx.fillStyle = "rgba(0,0,0,0.5)";
			this.ctx.fillRect(-window.innerWidth/2/FRAME.scaleX, -window.innerHeight/2/FRAME.scaleY, window.innerWidth/FRAME.scaleX, window.innerHeight/FRAME.scaleY);
		}

		//back button
		this.backButtonTimer = 40;
		this.backButton = new Button(0, 0, "Back");
		this.backButton.parent = this;
		this.backButton.action = function() {
			if (this.backButtonTimer > 0) return;
			if (this.parent.won == 1) {
				sceneManager.change("mainWorld");
			}
			//if lost, we have to reset :/
			else if (this.parent.won == -1) {
				resetGame();
				sceneManager.change("mainMenu");
			}
			this.parent.backButtonTimer = 40;
		}
	}
	update() {
		this.x = -FRAME.x / FRAME.scaleX;
		this.y = -FRAME.y / FRAME.scaleY;

		if (characters.objects.length == 1 && characters.objects[0] === this.target) {
			this.won = 1;
		}
		if (this.target.health <= 0 && this.target.armorHealth <= 0) {
			this.won = -1;
			this.backButton.text.text = "=(";
			if (this.target.canMove) {
				this.target.die();
			}
		}

		if (this.won != 0) {
			this.backButtonTimer -= 1;
		}

		this.backButton.update(this.x, this.y + window.innerHeight/10);
	}
	draw() {
		super.draw();
		if (this.won != 0 && this.backButtonTimer <= 0) {
			this.backButton.draw();
		}
	}
	render() {
		if (this.canDraw == false) return;
		if (this.won == 1) {
			this.dimBackground.draw();
			this.victoryText.draw();
		}
	}
}

class LightUpBox extends Actor {
	constructor(x, y) {
		super(x, y);
		
		this.litUp = false;
		this.realSize = 50;
		this.size = 50;
	}
	update() {
		this.size += (this.realSize - this.size) * 0.2;
	}
	render() {
		this.ctx.globalAlpha = 0.8;
		if (this.litUp) {
			this.ctx.fillStyle = "#FCF932";
		}
		else {
			this.ctx.fillStyle = "#EEE";
		}
		this.ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
		this.ctx.globalAlpha = 1.0;
	}
	lightUp() {
		if (this.litUp) return;
		this.litUp = true;
		this.size *= 2;
	}
	isLit() {
		return this.litUp;
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

class MainMenu extends Actor {
	constructor() {
		super();

		this.titleText = new Text(0,-250,"Arenaa.io");
		this.titleText.justify = "center";
		this.titleText.fillStyle = "#FFF";
		this.titleText.setFontSize(64);

		this.startButton = new Button(0,-50,"Start");
		this.startButton.action = function() {
			sceneManager.change("mainWorld");
		}
		this.settingsButton = new Button(0,50,"Settings",200);
		this.settingsButton.action = function() {

		}
		this.loadButton = new Button(0,150,"Load Game",200);
		this.loadButton.action = function() {
			if (loadGame()) {
				sceneManager.change("mainWorld");
			}
		}
	}
	update() {
		this.x = -FRAME.x / FRAME.scaleX;
		this.y = -FRAME.y / FRAME.scaleY;

		this.titleText.x = this.x;
		this.titleText.y = this.y - 250;

		this.startButton.update(this.x,this.y);
		this.settingsButton.update(this.x,this.y);
		this.loadButton.update(this.x, this.y);
	}
	draw() {
		super.draw();
		this.titleText.draw();
		this.startButton.draw();
		this.settingsButton.draw();
		this.loadButton.draw();
	}
	render() {
		//dimmed background
		this.ctx.fillStyle = "rgba(0,0,0,0.5)";
		this.ctx.fillRect(-window.innerWidth/2/FRAME.scaleX, -window.innerHeight/2/FRAME.scaleY, window.innerWidth/FRAME.scaleX, window.innerHeight/FRAME.scaleY);
	}
}

class ArenaMenu extends Actor {
	constructor(target) {
		super(-FRAME.x/FRAME.scaleX, -FRAME.y/FRAME.scaleY);
		this.target = target;
		this.width = 400;
		this.height = 550;

		this.exitButton = new Button(this.width/2-40, -this.height/2+35, "x", 40,40);
		this.exitButton.text.fillStyle = "#CC3333";
		this.exitButton.action = function() {
			gui.catchUp();//this is for money
			sceneManager.change("mainWorld");
		}

		//create cards according to global variable arenaBattles
		this.lastSelectedCard = null;
		this.cards = [];
		for (var i = 0; i < arenaBattles.length; i++) {
			this.cards.push(new ArenaCard(0, i*125-100, arenaBattles[i]));
		}

		//top text
		this.topText = new Text(this.width, -this.height/2+25, "Select an arena");
		this.topText.fillStyle = "#FFF";
		this.topText.justify = "center";
	}
	update() {
		this.x = -FRAME.x / FRAME.scaleX;
		this.y = -FRAME.y / FRAME.scaleY;

		//exit menu when ESC is pressed
		if (keyboard[27]) {
			this.exitButton.action();
		}

		//update text
		this.topText.x = this.x;
		this.topText.y = this.y - this.height/2+60;

		//update our buttons
		this.exitButton.update(this.x, this.y);

		//update the arena cards and go to arena if clicked
		for (var i = 0; i < this.cards.length; i++) {
			this.cards[i].update(this.x, this.y);
			if (mouse.clicking && this.cards[i].selected) {
				sceneManager.getScene("arenaWorld").setBattle(this.cards[i].battle);
				sceneManager.change("arenaWorld");
			}
		}
	}
	draw() {
		super.draw();
		this.exitButton.draw();
		for (var i = 0; i < this.cards.length; i++) {
			this.cards[i].draw();
		}
		this.topText.draw();
	}
	render() {
		//dimmed background
		this.ctx.fillStyle = "rgba(0,0,0,0.5)";
		this.ctx.fillRect(-window.innerWidth/2/FRAME.scaleX, -window.innerHeight/2/FRAME.scaleY, window.innerWidth/FRAME.scaleX, window.innerHeight/FRAME.scaleY);
		//menu window
		this.ctx.fillStyle = "#222034";
		this.ctx.shadowColor = "#000";
		this.ctx.shadowBlur = 15;
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
		this.ctx.shadowBlur = 0;
	}
	load() {
		this.update();
	}
}

class ShopGUI extends Actor {
	constructor(target) {
		super(-FRAME.x/FRAME.scaleX, -FRAME.y/FRAME.scaleY);

		this.target = target;
		this.width = 400;
		this.height = 550;

		this.exitButton = new Button(this.width/2-40,-this.height/2+35,"x", 40,40);
		this.exitButton.text.fillStyle = "#CC3333";
		this.exitButton.action = function() {
			gui.catchUp();
			sceneManager.change("mainWorld");
		}

		this.moneyImage = FRAME.getImage("coin");
		this.moneyText = new Text();
		this.moneyText.x = -this.width/2 + 60;
		this.moneyText.y = -this.height/2 + 12;
		this.moneyText.fillStyle = "#FFF";
		this.moneyText.fontSize = 40;
		this.moneyLerp = this.target.money;

		//for items that you can buy
		this.items = [];
		let types = this.target.shopList.getTypes();
		for (let i = 0; i < types.length; i++) {
			this.items.push(this.target.shopList.getUnboughtItem(types[i]));
		}
	}
	update() {
		this.x = -FRAME.x / FRAME.scaleX;
		this.y = -FRAME.y / FRAME.scaleY;

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
			this.items[i].update(this.x, this.y+i*100-110);

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
		//dimmed background
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
		super(-FRAME.x / FRAME.scaleX, -FRAME.y / FRAME.scaleY);

		this.target = target;
		this.width = 600;
		this.height = 500;

		this.playerBox = new PlayerBox(this.target, 0, -this.height/4);

		//left/right pages buttons
		this.leftButton = new TriangleButton(-this.width/2+50,150,25,true);
		this.leftButton.parent = this;
		this.leftButton.action = function() {
			if (this.parent.currentPage > 0) {
				this.parent.currentPage--;
				this.parent.changePages = true;
			}
		}
		this.rightButton = new TriangleButton(this.width/2-50,150,25);
		this.rightButton.parent = this;
		this.rightButton.action = function() {
			if (this.parent.currentPage < this.parent.pageTitles.length-1) {
				this.parent.currentPage++;
				this.parent.changePages = true;
			}
		}

		this.pageTitles = [];
		this.pageItems = [];
		this.currentPage = 0;
		this.changePages = true;

		this.titleText = new Text();
		this.titleText.fillStyle = "#FFF";
		this.titleText.justify = "center";
		this.titleText.y = 50;

		//equip button
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
					else if (this.parent.pageItems[this.parent.currentPage][i].type == "armor") {
						this.parent.playerBox.modelPlayer.getNewArmor();
					}
				}
			}
		}

		this.exitButton = new Button(this.width/2-40,-this.height/2+35,"x", 40,40);
		this.exitButton.text.fillStyle = "#CC3333";
		this.exitButton.action = function() {sceneManager.change("mainWorld");}
	}
	update() {
		this.x = -FRAME.x / FRAME.scaleX;
		this.y = -FRAME.y / FRAME.scaleY;

		if (this.changePages) {
			this.titleText.text = this.pageTitles[this.currentPage];
			this.changePages = false;

			//disable/enable left button
			if (this.currentPage == 0) {
				this.leftButton.disable();
			}
			else if (this.leftButton.disabled) {
				this.leftButton.enable();
			}

			//disable/enable right button
			if (this.currentPage == this.pageTitles.length-1) {
				this.rightButton.disable();
			}
			else if (this.rightButton.disabled) {
				this.rightButton.enable();
			}
		}

		//change back to main scene when ESC is pressed
		if (keyboard[27]) {
			this.exitButton.action();
		}

		this.playerBox.update();

		this.leftButton.update(this.x, this.y);
		this.rightButton.update(this.x, this.y);
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

		this.leftButton.draw();
		this.rightButton.draw();
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

		//text
		this.titleText.draw();

		//player box
		this.playerBox.draw();
	}
	load() {
		this.pageTitles = this.target.shopList.getEquippableTypes();
		this.titleText.text = this.pageTitles[this.currentPage];

		//push all page items
		for (var i = 0; i < this.pageTitles.length; i++) {
			let items = this.target.shopList.getItems(this.pageTitles[i]);
			this.pageItems[i] = [];
			for (var j = 0; j < items.length; j++) {
				this.pageItems[i].push(new InventoryItem(items[j], -(items.length-1)*125/2+j*125, 150));
			}
		}

		//make sure weapon and armor are up-to-date
		this.playerBox.modelPlayer.getNewWeapon();
		this.playerBox.modelPlayer.getNewArmor();
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
		this.text.fontSize = this.textSize;
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
		this.text.fontSize = Math.floor(this.textSize);
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

class TriangleButton extends Polygon {
	constructor(x, y, size=100, backwards=false) {
		super(x,y,0);

		this.realX = x;
		this.realY = y;
		this.shadowOffset = 5;
		this.realSize = size;

		this.backwards = backwards;
		if (this.backwards) {
			this.addPoint(1,-1);
			this.addPoint(1,1);
			this.addPoint(-1,0);
		}
		else {
			this.addPoint(-1,-1);
			this.addPoint(-1,1);
			this.addPoint(1,0);
		}

		this.disabled = false;
		this.prevMouse = false;
	}
	update(x,y) {
		this.x = x + this.realX;
		this.y = y + this.realY;

		if (this.disabled) {
			this.size += (0 - this.size) * 0.2;
			this.shadowOffset += (0 - this.shadowOffset) * 0.2;
		}
		else if (mouse.clicking && checkSATCollision(this, mousePolygon)) {
			this.size += (this.realSize*1.025 - this.size) * 0.2;
			this.shadowOffset += (7 - this.shadowOffset) * 0.2;
		}
		else if (checkSATCollision(this, mousePolygon)) {
			this.size += (this.realSize*1.2 - this.size) * 0.2;
			this.shadowOffset += (10 - this.shadowOffset) * 0.2;

			if (this.prevMouse == true && mouse.clicking == false) {
				this.action();
			}
		}
		else {
			this.size += (this.realSize - this.size) * 0.2;
			this.shadowOffset += (5 - this.shadowOffset) * 0.2;
		}
		this.prevMouse = mouse.clicking;
	}
	render() {
		this.color = "rgba(0,0,0,0.5)";
		this.ctx.translate(this.shadowOffset,this.shadowOffset);
		super.render();
		this.ctx.translate(-this.shadowOffset,-this.shadowOffset);

		this.color = "#3F3F57";
		super.render();
	}
	disable() {
		this.disabled = true;
	}
	enable() {
		this.disabled = false;
	}
	action() {}
}

class ShopItem extends Actor {
	constructor(type, cost, className, name, buyCallback) {
		super(-1000);

		this.name = name;
		this.type = type;
		this.cost = cost;
		this.className = className;
		this.buyCallback = buyCallback;
		this.bought = false;
		this.buying = false;
		this.pressedDown = false;
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
		this.text.fontSize = 24;

		this.image = (new this.className()).image;
		this.hasImage = (this.image !== undefined);
		if (this.hasImage) {
			this.imageWidth = this.image.width*PIXEL_SIZE*1.2;
			this.imageHeight = this.image.height*PIXEL_SIZE*1.2;
		}
		else {
			this.classInstance = new this.className();
			this.imageWidth = 0;
			this.imageHeight = 0;
		}

		//fixing image height
		if (this.imageHeight > 45) {
			var ratio = this.imageHeight / 45;
			this.imageHeight = 45;
			this.imageWidth /= ratio;
		}

		this.costImage = FRAME.getImage("coin");
		this.costText = new Text();
		this.costText.fillStyle = "#FFF";
		this.costText.text = this.cost;
		this.costText.justify = "right";
		this.costText.fontSize = 24;
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

			if (this.prevClicking == false) {
				this.pressedDown = true;
			}
		}
		else if (checkAABBCollision(this, mouse)) {
			this.width += (this.realWidth*1.1 - this.width) * 0.2;
			this.height += (this.realHeight*1.1 - this.height) * 0.2;
			this.shadowOffset += (10 - this.shadowOffset) * 0.2;

			if (this.prevClicking == true && this.pressedDown) {
				this.buying = true;
			}
		}
		else {
			this.width += (this.realWidth - this.width) * 0.2;
			this.height += (this.realHeight - this.height) * 0.2;
			this.shadowOffset += (5 - this.shadowOffset) * 0.2;
		}
		if (mouse.clicking == false) {
			this.pressedDown = false;
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

		let imageX = -this.imageWidth/2 - this.width/2 + 45;
		let imageY = -this.imageHeight/2+12;
		if (this.hasImage) {
			this.ctx.drawImage(this.image, imageX, imageY, this.imageWidth, this.imageHeight);
		}
		else {
			this.ctx.translate(imageX, imageY);
			this.classInstance.renderImage();
			this.ctx.translate(-imageX, -imageY);
		}

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
			if (this.buyCallback != undefined) {
				this.buyCallback(this);
			}
		}
		else {
			this.failedBuy = true;
		}
		this.buying = false;
	}
}

class InventoryItem extends Actor {
	constructor(shopItem, x, y) {
		super();

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

		this.nameText = new Text(0,-this.height/2,this.name);
		this.nameText.fillStyle = "#FFF";
		this.nameText.justify = "center";
		this.nameText.fontSize = 24;

		if (this.bought == false) {
			this.nameText.text = "???";
			this.nameText.fontSize = 24;
			this.nameText.y = 0;
		}
		else {
			while (this.nameText.width > this.realWidth) {
				this.nameText.setFontSize(this.nameText.fontSize-1);
			}
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
			this.ctx.drawImage(this.image, -this.imageWidth/2, -this.imageHeight/2+PIXEL_SIZE, this.imageWidth, this.imageHeight);
		}
	}
	equip(target) {
		if (this.type == "weapon") {
			target.weapon = new this.className(target);
		}
		else if (this.type == "armor") {
			target.equipArmor(this.className);
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

class ArenaCard extends Actor {
	constructor(x,y,battle) {
		super();

		this.realX = x;
		this.realY = y;
		this.realWidth = 325;
		this.realHeight = 100;
		this.width = this.realWidth;
		this.height = this.realHeight;
		this.shadowOffset = 5;

		this.prevClicking = false
		this.selected = false;
		this.rBits = 63;
		this.gBits = 63;
		this.bBits = 87;

		//get class images and number of enemies
		this.battle = battle;
		this.classInfo = [];
		let classMap = this.battle.getSequenceClasses();
		for (var classInfo of classMap) {
			let a = new Text();
			a.text = "x"+classInfo[1];
			a.fillStyle = "#FFF";
			a.fontSize = 12;

			this.classInfo.push([new classInfo[0]().image, a]);
		}

		this.nameText = new Text();
		this.nameText.text = battle.name;
		this.nameText.fontSize = 24;
		this.nameText.fillStyle = "#FFF";
	}
	update(x,y) {
		this.x = x + this.realX;
		this.y = y + this.realY;

		//moving text relative to card size
		this.nameText.x = -this.width/2 + 5;
		this.nameText.y = -this.height/2;

		//change color
		/*if (this.selected) {
			this.rBits += (150 - this.rBits) * 0.1;
			this.gBits += (150 - this.gBits) * 0.1;
			this.bBits += (170 - this.bBits) * 0.1;
		}
		else {*/
			this.rBits += (63 - this.rBits) * 0.1;
			this.gBits += (63 - this.gBits) * 0.1;
			this.bBits += (87 - this.bBits) * 0.1;
		//}

		//deselection code
		if (this.selected) {
			this.selected = false;
		}

		//changing size
		if (checkAABBCollision(mouse, this) && mouse.clicking) {
			this.width += (this.realWidth*1.05 - this.width) * 0.2;
			this.height += (this.realHeight*1.05 - this.height) * 0.2;
			this.shadowOffset += (7 - this.shadowOffset) * 0.2;
			if (this.prevClicking == false) {
				this.selected = true;
			}
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
		//base card and shadow
		this.ctx.fillStyle = "rgba(0,0,0,0.5)";
		this.ctx.fillRect(-this.width/2+this.shadowOffset, -this.height/2+this.shadowOffset, this.width, this.height);
		this.ctx.fillStyle = "#"+rgbToHex(this.rBits, this.gBits, this.bBits);
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);

		//other things
		this.nameText.draw();

 		//enemy things
		for (let i = 0; i < this.classInfo.length; i++) {
			let h = 25;
			let w = this.classInfo[i][0].width/this.classInfo[i][0].height * h;
			this.ctx.drawImage(this.classInfo[i][0], (i*75-this.realWidth/2+5)*(this.width/this.realWidth), -20, w, h);
			this.classInfo[i][1].x = (i*75+this.classInfo[i][0].width+w-this.realWidth/2+5)*(this.width/this.realWidth);
			this.classInfo[i][1].y = -15;
			this.classInfo[i][1].draw();
		}
	}
}
