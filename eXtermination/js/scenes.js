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
		
		this.numDoors = 2;
		this.messages = ["Fight", "Edit"];
		
		this.doors = new Collection();
		this.texts = [];
		for (var i = 0; i < this.numDoors; i++) {
			this.doors.add(new ImageActor(i * 100 - (50 * (this.numDoors - 1)), 75, FRAME.getImage("door"), PIXEL_SIZE + 2));
			this.texts.push(new Text(0, -225, this.messages[i], "Arial", "#FFF", 52, "center"));
		}
		this.selectedDoorIndex = 0;
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
		
		//mouse click
		if (mouse.clicking && this.selectedDoorIndex != -1) {
			if (this.selectedDoorIndex == 0) {
				this.manager.change("fight");
			}
			else if (this.selectedDoorIndex == 1) {
				editLevel("f 1000 800~p 0 0");
			}
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
		
		this.moneyText.text = player.money;
		this.stageText.text = "Stage: " + player.stage;
	}
}

class FightScene extends Scene {
	constructor(manager) {
		super(manager);
		
		//gui stuff
		this.gui = new GUI(player);
		
		this.editorMoney = 0;
		this.timer = 0.0;
		this.over = false;
	}
	update(realTime) {
		tiles.update(realTime);
		characters.update(realTime);
		weapons.update(realTime);
		bullets.update(realTime);
		
		//gui and camera
		FRAME.x += ((-player.x * FRAME.scaleX + window.innerWidth / 2) - FRAME.x) * 0.1;
		FRAME.y += ((-player.y * FRAME.scaleY + window.innerHeight / 2) - FRAME.y) * 0.1;
		this.gui.update(realTime);
		
		if (player.dead == true || characters.objects.length == 1 && player.dead == false) {
			this.over = true;
			this.gui.showEndScreen();
		}
		if (this.over) {
			this.timer += realTime;
			if (this.timer >= 3) {
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
		weapons.draw();
		bullets.draw();
		characters.draw();
		this.gui.draw();
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
		
		this.gui.reset();
		this.over = false;
		this.timer = 0.0;
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
	}
	onLoad() {
		player.image = player.idleImage;
		player.rotation = 0;
		player.facingRight = true;
		inEditor = true;
		document.getElementById("fw").value = floor.width;
		document.getElementById("fh").value = floor.height;
		document.getElementById("editor-gui").style.visibility = "visible";
	}
	onUnload() {
		document.getElementById("editor-gui").style.visibility = "hidden";
	}
}