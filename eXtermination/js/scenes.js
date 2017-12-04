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

class ShopScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.numDoors = 1;
		this.doors = new Collection();
		for (var i = 0; i < this.numDoors; i++) {
			this.doors.add(new ImageActor((i/this.numDoors) * 200, 25, FRAME.getImage("door"), PIXEL_SIZE + 2));
		}
		this.texts = [];
		this.texts.push(new Text(0, -225, "Fight", "Arial", "#FFF", 52, "center"));
		this.selectedDoorIndex = 0;
		this.moneyText = new Text(-250, 100, "Money: " + money, "Arial", "#FFF", 30, "left");
		this.stageText = new Text(250, 100, "Stage: " + stage, "Arial", "#FFF", 30, "right");
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
		}
	}
	render() {
		floor.draw();
		this.doors.draw();
		if (this.selectedDoorIndex != -1) {
			this.texts[this.selectedDoorIndex].draw();
		}
		this.moneyText.draw();
		this.stageText.draw();
	}
	onLoad() {
		characters.clear();
		weapons.clear();
		bullets.clear();
		
		FRAME.x = window.innerWidth / 2;
		FRAME.y = window.innerHeight / 2;
		
		floor = new FloorRect(500, 200);
		player.x = 0;
		player.y = 0;
		
		this.moneyText.text = "Money: " + money;
		this.stageText.text = "Stage: " + stage;
	}
}

class FightScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.wonText = new Text(0, 0, "You Won", "Arial", "#0CF", 128, "center");
		this.deadText = new Text(0, 0, "You Died", "Arial", "#F55", 128, "center");
		this.timer = 0.0;
		this.over = false;
	}
	update(realTime) {
		tiles.update(realTime);
		characters.update(realTime);
		weapons.update(realTime);
		bullets.update(realTime);
		
		FRAME.x += ((-player.x * FRAME.scaleX + window.innerWidth / 2) - FRAME.x) * 0.1;
		FRAME.y += ((-player.y * FRAME.scaleY + window.innerHeight / 2) - FRAME.y) * 0.1;
		
		this.wonText.x = -FRAME.x + window.innerWidth / 2;
		this.wonText.y = -FRAME.y + window.innerHeight / 2 - 100;
		this.deadText.x = -FRAME.x + window.innerWidth / 2;
		this.deadText.y = -FRAME.y + window.innerHeight / 2 - 100;
		
		if (player.dead == true || characters.objects.length == 1 && player.dead == false) {
			this.over = true;
		}
		if (this.over) {
			this.timer += realTime;
			if (this.timer >= 3) {
				if (player.dead == false) stage += 1;
				this.manager.change("shop");
			}
		}
	}
	render() {
		floor.draw();
		tiles.draw();
		weapons.draw();
		bullets.draw();
		characters.draw();
		
		if (this.over) {
			if (player.dead) this.deadText.draw();
			else this.wonText.draw();
		}
	}
	onLoad() {
		var index = stage - 1;
		while (stages.length - 1 < index) index -= 1;
		
		buildLevel(stages[index]);
		this.over = false;
		this.timer = 0.0;
	}
}