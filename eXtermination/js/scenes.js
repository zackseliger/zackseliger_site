class SceneManager {
	constructor() {
		this.scenes = new Map();
		this.currentScene = "";
		this.prevScene = "";
	}
	addScene(name, scene) {
		this.scenes.set(name, scene);
	}
	change(name) {
		if (this.scenes.get(this.currentScene) != undefined) {
			this.scenes.get(this.currentScene).onUnload();
		}
		this.prevScene = this.currentScene;
		this.currentScene = name;
		this.scenes.get(this.currentScene).onLoad();
	}
	update(realTime) {
		this.scenes.get(this.currentScene).update(realTime);
	}
	render() {
		this.scenes.get(this.currentScene).render();
	}
}

class Scene {
	constructor(manager) {
		this.manager = manager;
	}
	update(realTime) {}
	render() {}
	onLoad() {}
	onUnload() {}
}

class MenuScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.messages = ["Fight", "Shop", "Customize", "Edit"];
		this.numDoors = this.messages.length;
		
		this.doors = new Collection();
		this.texts = [];
		for (var i = 0; i < this.numDoors; i++) {
			this.doors.add(new ImageActor(i * 100 - (50 * (this.numDoors - 1)), 75, FRAME.getImage("door"), PIXEL_SIZE + 2));
			this.texts.push(new Text(0, -225, this.messages[i], "Arial", "#FFF", 52, "center"));
		}
		this.selectedDoorIndex = -1;
		this.prevDoorIndex = -1;
		this.moneyImage = new ImageActor(-237, 156, FRAME.getImage("coin"), 25);
		this.moneyText = new Text(-215, 125, player.money, "Arial", "#FFF", 30, "left");
		this.stageText = new Text(250, 125, "Stage: " + player.stage, "Arial", "#FFF", 30, "right");
	}
	update(realTime) {
		characters.update(realTime);
		
		FRAME.x = window.innerWidth / 2;
		FRAME.y = window.innerHeight / 2;
		
		//select a door via mouse movements
		this.selectedDoorIndex = -1;
		for (var i = 0; i < this.doors.objects.length; i++) {
			if (checkSpecialCollision(mouse, this.doors.objects[i])) {
				this.selectedDoorIndex = i;
			}
			
			if (this.selectedDoorIndex == i) {
				this.doors.objects[i].width += (this.doors.objects[i].image.width * (PIXEL_SIZE + 2) + 10 - this.doors.objects[i].width) * 0.1;
				this.doors.objects[i].height += (this.doors.objects[i].image.height * (PIXEL_SIZE + 2) + 20 - this.doors.objects[i].height) * 0.1;
			}
			else {
				this.doors.objects[i].width += (this.doors.objects[i].image.width * (PIXEL_SIZE + 2) - this.doors.objects[i].width) * 0.1;
				this.doors.objects[i].height += (this.doors.objects[i].image.height * (PIXEL_SIZE + 2) - this.doors.objects[i].height) * 0.1;
			}
		}
		if (this.prevDoorIndex != this.selectedDoorIndex) {
			FRAME.playSound("over");
		}
		this.prevDoorIndex = this.selectedDoorIndex;
		
		//mouse click
		if (mouse.clicking && this.selectedDoorIndex != -1) {
			if (this.texts[this.selectedDoorIndex].text == "Fight") {
				this.manager.change("fight");
			}
			else if (this.texts[this.selectedDoorIndex].text == "Edit") {
				editLevel("f 1000 800~p 0 0");
			}
			else if (this.texts[this.selectedDoorIndex].text == "Shop") {
				this.manager.change("shop");
			}
			else if (this.texts[this.selectedDoorIndex].text == "Customize") {
				this.manager.change("inventory");
			}
			FRAME.playSound("changeScene");
		}
	}
	render() {
		floor.draw();
		this.doors.draw();
		if (this.selectedDoorIndex != -1) {
			this.texts[this.selectedDoorIndex].draw();
		}
		this.moneyImage.draw();
		this.moneyText.draw();
		this.stageText.draw();
	}
	onLoad() {
		characters.clear();
		weapons.clear();
		bullets.clear();
		
		FRAME.x = window.innerWidth / 2;
		FRAME.y = window.innerHeight / 2;
		
		floor = new FloorRect(500, 250);
		player.x = 0;
		player.y = 0;
		
		this.prevDoorIndex = -1;
		this.moneyText.text = player.money;
		this.stageText.text = "Stage: " + player.stage;
		
		//reset doors
		this.selectedDoorIndex = -1;
		for (var i = 0; i < this.doors.objects.length; i++) {
			this.doors.objects[i].width = this.doors.objects[i].image.width * (PIXEL_SIZE+2);
			this.doors.objects[i].height = this.doors.objects[i].image.height * (PIXEL_SIZE+2);
		}
	}
}

class FightScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.pickUpText = new Text(0,0,"space to swap", "Arial", "#FFF", 24, "center");
		this.pickUpTimer = 0.0;
		this.pickUpShow = false;
		
		this.gui = new GUI(player);
		this.editorMoney = 0;
		this.over = false;
	}
	update(realTime) {
		tiles.update(realTime);
		characters.update(realTime);
		weapons.update(realTime);
		bullets.update(realTime);
		particles.update(realTime);
		
		//gui and camera
		FRAME.x += ((-player.x * FRAME.scaleX + window.innerWidth / 2) - FRAME.x) * 0.1;
		FRAME.y += ((-player.y * FRAME.scaleY + window.innerHeight / 2) - FRAME.y) * 0.1;
		this.gui.update(realTime);
		
		this.pickUpShow = false;
		for (var i = 0; i < weapons.objects.length; i++) {
			if (weapons.objects[i].owner == null && distBetween(player, weapons.objects[i]) < player.width*1.5 + weapons.objects[i].width) {
				this.pickUpText.x = weapons.objects[i].x;
				this.pickUpText.y = weapons.objects[i].y - 25;
				if (player.dead == false && weapons.objects[i].dropHeight == 0) this.pickUpShow = true;
				break;
			}
		}
		if (this.pickUpShow) {
			this.pickUpTimer += realTime;
			if (this.pickUpTimer >= 2.0) this.pickUpShow = true;
			else this.pickUpShow = false;
		}
		else this.pickUpTimer = 0.0;
		
		//if player is dead or beat the level
		if (player.dead == true || characters.objects.length == 1 && player.dead == false) {
			this.over = true;
			this.gui.showEndScreen();
		}
		if (this.over) {
			if (this.gui.doneShowingEndScreen) {
				if (inEditor == false) {
					if (player.dead == false) player.stage += 1;
					this.manager.change("menu");
				}
				else {
					editLevel(currentLevel);
				}
			}
		}
	}
	render() {
		floor.draw();
		tiles.draw();
		particles.draw();
		weapons.draw();
		bullets.draw();
		characters.draw();
		this.gui.draw();
		if (this.pickUpShow) this.pickUpText.draw();
	}
	onLoad() {
		if (inEditor == false) {
			var index = player.stage - 1;
			if (stages.length - 1 < index) {
				var level = randomLevel();
				console.log(level);
				buildLevel(level);
			}
			else {
				buildLevel(stages[index]);
			}
		}
		else this.editorMoney = player.money;
		
		particles.clear();
		FRAME.x = -player.x * FRAME.scaleX + window.innerWidth / 2;
		FRAME.y = -player.y * FRAME.scaleY + window.innerHeight / 2;
		this.gui.reset();
		this.over = false;
	}
	onUnload() {
		if (inEditor == true) player.money = this.editorMoney;
	}
}

class EditorScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.CAM_SPEED = 5;
		this.selected = null;
		this.looseSelected = null;
		this.level = "";
		this.prevMouseClicking = mouse.clicking;
	}
	update(realTime) {
		//guns in hands
		for (var i = 0; i < characters.objects.length; i++) {
			if (characters.objects[i].inRightHand != null) {
				characters.objects[i].putInRightHand(characters.objects[i].inRightHand);
			}
		}
		
		//select a thing
		if (mouse.clicking && this.prevMouseClicking == false) {
			this.selected = null;
			for (var i = 0; i < tiles.objects.length; i++) {
				if (checkCollision(mouse, tiles.objects[i])) {
					this.selected = tiles.objects[i];
					this.looseSelected = tiles.objects[i];
					break;
				}
			}
			for (var i = 0; i < characters.objects.length; i++) {
				if (checkCollision(mouse, characters.objects[i])) {
					this.selected = characters.objects[i];
					this.looseSelected = characters.objects[i];
					break;
				}
			}
			
			editorSelected = this.looseSelected;
			if (this.selected != null) {
				document.getElementById("x").value = this.selected.x;
				document.getElementById("y").value = this.selected.y;
				document.getElementById("w").value = this.selected.width;
				document.getElementById("h").value = this.selected.height;
			}
		}
		//moving selected thing
		if (mouse.clicking && this.selected !== null) {
			if (mouse.xVel !== 0) this.selected.x += mouse.xVel;
			if (mouse.yVel !== 0) this.selected.y += mouse.yVel;
			document.getElementById("x").value = Math.floor(this.selected.x);
			document.getElementById("y").value = Math.floor(this.selected.y);
		}
		this.prevMouseClicking = mouse.clicking;
		
		//changing things via keyboard
		if (this.looseSelected != null && mouse.clicking == false) {
			this.looseSelected.x = parseFloat(document.getElementById("x").value);
			this.looseSelected.y = parseFloat(document.getElementById("y").value);
			this.looseSelected.width = document.getElementById("w").value;
			this.looseSelected.height = document.getElementById("h").value;
		}
		if (mouse.clicking == false) {
			floor.width = document.getElementById("fw").value;
			floor.height = document.getElementById("fh").value;
		}
		
		//keyboard input
		if (keyboard[37] || keyboard[65]) FRAME.x += this.CAM_SPEED;
		if (keyboard[38] || keyboard[87]) FRAME.y += this.CAM_SPEED;
		if (keyboard[39] || keyboard[68]) FRAME.x -= this.CAM_SPEED;
		if (keyboard[40] || keyboard[83]) FRAME.y -= this.CAM_SPEED;
		if (keyboard[81]) FRAME.scaleX = FRAME.scaleY = FRAME.scaleX - 0.01;
		if (keyboard[69]) FRAME.scaleX = FRAME.scaleY = FRAME.scaleX + 0.01;
		if (mouse.deltaY > 0) FRAME.scaleX = FRAME.scaleY = FRAME.scaleX - 0.1;
		if (mouse.deltaY < 0) FRAME.scaleX = FRAME.scaleY = FRAME.scaleX + 0.1
		if (keyboard[46]) editorDelete();
		if (keyboard[13]) editorAdd();
	}
	render() {
		floor.draw();
		tiles.draw();
		characters.draw();
		weapons.draw();
	}
	onLoad() {
		player.reset();
		inEditor = true;
		document.getElementById("fw").value = floor.width;
		document.getElementById("fh").value = floor.height;
		document.getElementById("editor-gui").style.visibility = "visible";
	}
	onUnload() {
		document.getElementById("editor-gui").style.visibility = "hidden";
		FRAME.resize();
	}
}

class ShopScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.shopText = new Text(0, -400, "Shop", "Arial", "#FFF", 100, "center");
		
		this.shopInv = new Inventory(null, 0, -50);
		this.shopInv.addItem(new TileItem(FRAME.getImage("shotgun"), "weapon", "shotgun", 125));
		this.shopInv.addItem(new TileItem(FRAME.getImage("machinegun"), "weapon", "machine gun", 250));
		this.shopInv.addItem(new TileItem(FRAME.getImage("launcher"), "weapon", "grenade launcher", 400));
		this.shopInv.addItem(new TileItem(FRAME.getImage("mine"), "weapon", "mines", 25));
		this.shopInv.addItem(new TileItem(FRAME.getImage("forestHelmet"), "helmet", "forest mask", 25));
		this.shopInv.addItem(new TileItem(FRAME.getImage("forestTorso"), "torso", "forest body", 25));
		this.shopInv.addItem(new TileItem(FRAME.getImage("headband"), "helmet", "headband", 50));
		this.shopInv.addItem(new TileItem(FRAME.getImage("sash"), "torso", "sash", 50));
		this.shopInv.addItem(new TileItem(FRAME.getImage("chainmailHelmet"), "helmet", "chainmail mask", 50));
		this.shopInv.addItem(new TileItem(FRAME.getImage("chainmailTorso"), "torso", "chainmail body", 50));
		
		this.exitButton = new ExitButton();
		this.gui = new GUI(player);
		this.gui.moveMoneyRight();
		this.prevMouseClicking = true;
	}
	update(realTime) {
		FRAME.x = window.innerWidth / 2;
		FRAME.y = window.innerHeight / 2;
		this.gui.update(realTime);
		this.exitButton.update(realTime);
		particles.update(realTime);
		
		//shop inventory update
		this.shopInv.update(realTime);
		this.shopInv.selectedObject = null;//special inventory hacks
		this.shopInv.selectedObjectIndex = -1;
		if (FRAME.sounds.get("select").playing)
			FRAME.stopSound("select");
		if (this.shopInv.mouseOverObject != null) {//mousing over an item
			if (this.gui.showingItemCard == false)
				this.gui.showItemCard(new ItemCard(this.shopInv.mouseOverObject));
			if (mouse.clicking && this.prevMouseClicking == false) {//if they click
				if (player.money >= this.shopInv.mouseOverObject.price) {
					player.money -= this.shopInv.mouseOverObject.price;
					particles.add(new BuyItemParticle(this.shopInv.mouseOverObject.x, this.shopInv.mouseOverObject.y));
					player.inventory.addItem(this.shopInv.mouseOverObject);
					this.shopInv.removeItem(this.shopInv.mouseOverObject);
					FRAME.playSound("buy");
				}
				else {
					particles.add(new ErrorParticle(this.shopInv.mouseOverObject.x, this.shopInv.mouseOverObject.y));
					FRAME.playSound("error");
				}
			}
		}
		else {
			this.gui.hideItemCard();
		}
		//exit button
		if (mouse.clicking && this.prevMouseClicking == false) {
			if (this.exitButton.mouseOver) {
				this.manager.change("menu");
				FRAME.playSound("changeScene");
			}
		}
		this.prevMouseClicking = mouse.clicking;
	}
	render() {
		this.shopInv.draw();
		this.shopText.draw();
		this.exitButton.draw();
		particles.draw();
		this.gui.moneyText.draw();
		this.gui.moneyImage.draw();
		if (this.gui.showingItemCard) {
			this.gui.itemCard.draw();
		}
	}
	onLoad() {
		particles.clear();
		this.prevMouseClicking = true;
		this.gui.reset();
		this.gui.update(0);
		this.exitButton = new ExitButton();
		this.exitButton.update(0);
	}
}

class InventoryScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.helmetText = new Text(-150, -345, "Helmet:", "Arial", "#FFF", 64, "right");
		this.weaponText = new Text(-150, -220, "Weapon:", "Arial", "#FFF", 64, "right");
		this.torsoText = new Text(-150, -95, "Torso:", "Arial", "#FFF", 64, "right");
		this.prevMouseClicking = true;
		this.exitButton = new ExitButton();
		this.INV_SCALE = 3;
	}
	update(realTime) {
		FRAME.x = window.innerWidth / 2;
		FRAME.y = window.innerHeight / 2;
		this.exitButton.update(realTime);
		
		player.inventory.update(realTime);
		//update player inv and handle swapping items
		var rightHandIndex = player.inventory.collection.objects.indexOf(player.rightHandSquare);
		var helmetIndex = player.inventory.collection.objects.indexOf(player.helmetSquare);
		var torsoIndex = player.inventory.collection.objects.indexOf(player.torsoSquare);
		if (player.inventory.objects[rightHandIndex] == null) {
			weapons.remove(player.weapon);
			player.weapon = null;
			player.dropRightHandItem();
		}
		else if (player.weapon == null || player.inventory.objects[rightHandIndex].image != player.weapon.image) {
			weapons.remove(player.weapon);
			//player.dropRightHandItem();
			var newImage = player.inventory.objects[rightHandIndex].image;
			if (newImage == FRAME.getImage("shotgun")) {
				player.changeWeapon(new Shotgun());
			}
			else if (newImage == FRAME.getImage("pistol")) {
				player.changeWeapon(new Gun());
			}
			else if (newImage == FRAME.getImage("machinegun")) {
				player.changeWeapon(new Machinegun());
			}
			else if (newImage == FRAME.getImage("launcher")) {
				player.changeWeapon(new GrenadeLauncher());
			}
			else if (newImage == FRAME.getImage("mine")) {
				player.changeWeapon(new Mine());
			}
			else {
				player.changeWeapon(new Gun(0,0,newImage));
			}
			player.setScale(this.INV_SCALE);
		}
		if (player.inventory.objects[helmetIndex] == null && player.helmet != null) {
			player.takeOffHelmet();
		}
		else if (player.inventory.objects[helmetIndex] != null && player.helmet == null) {
			player.putOnHead(new Helmet(0,0,player.inventory.objects[helmetIndex].image));
		}
		else if (player.inventory.objects[helmetIndex] != null && player.helmet != null && player.helmet.image != player.inventory.objects[helmetIndex].image) {
			player.takeOffHelmet();
			player.putOnHead(new Helmet(0,0,player.inventory.objects[helmetIndex].image));
		}
		if (player.inventory.objects[torsoIndex] == null && player.torso != null) {
			player.takeOffTorso();
		}
		else if (player.inventory.objects[torsoIndex] != null && player.torso == null) {
			player.putOnTorso(new Torso(0,0,player.inventory.objects[torsoIndex].image));
		}
		else if (player.inventory.objects[torsoIndex] != null && player.torso != null && player.torso.image != player.inventory.objects[torsoIndex].image) {
			player.takeOffTorso();
			player.putOnTorso(new Torso(0,0,player.inventory.objects[torsoIndex].image));
		}
		
		//exit button
		if (mouse.clicking && this.prevMouseClicking == false) {
			if (this.exitButton.mouseOver) {
				this.manager.change("menu");
				FRAME.playSound("changeScene");
			}
		}
		
		this.prevMouseClicking = mouse.clicking;
	}
	render() {
		floor.draw();
		player.draw();
		weapons.draw();
		this.helmetText.draw();
		this.weaponText.draw();
		this.torsoText.draw();
		
		player.inventory.draw();
		this.exitButton.draw();
	}
	onLoad () {
		floor = new FloorRect(400, 350);
		floor.y = -175;
		floor.x = 262.5;
		player.x = floor.x;
		player.y = floor.y;
		player.image = player.idleImage;
		player.rotation = 0;
		player.facingRight = true;
		if (player.weapon != null) {
			player.putInRightHand(player.weapon);
			weapons.add(player.weapon);
			player.weapon.rotation = 0;
		}
		player.setScale(this.INV_SCALE);
		player.putInRightHand(player.weapon);
		if (player.helmet != null) player.putOnHead(player.helmet);
		if (player.torso != null) player.putOnTorso(player.torso);
		
		this.prevMouseClicking = true;
		this.exitButton = new ExitButton();
		this.exitButton.update(0);
	}
	onUnload() {
		player.reset();
	}
}