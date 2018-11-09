/*
TODO:
-dungeons
-arenas
-save
-sounds
-more lands
-upgrades
-more enemies
-more weapons
-menues
*/

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
		this.prevScene = this.currentScene;
		this.currentScene = name;
		if (this.scenes.get(this.prevScene) != undefined) {
			this.scenes.get(this.prevScene).onUnload();
		}
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

class MainMenuScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.mainMenu = new MainMenu();
		this.menuGroundArea = new GroundAreaManager();
		this.menuGroundArea.addGroundArea(new FirstGroundArea());
	}
	update() {
		characters.update();
		
		this.menuGroundArea.update();
		this.mainMenu.update();
	}
	render() {
		tiles.draw();
		solidTiles.draw();
		characters.draw();
		this.mainMenu.draw();
	}
	onLoad() {
		tiles.clear();
		solidTiles.clear();
		projectiles.clear();
		characters.clear();
		
		groundAreaManager.gotoGroundArea(0);
		FRAME.x = FRAME.y = 0;
	}
}

class MainWorldScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.npcs = new Collection();
		//this.npcs.add(new Mayor(200, -100));
		this.npcs.add(new ArrowLeftChar(50, -100));
		this.npcs.add(new SaveChar(200, -100));
		this.npcs.add(new ShopChar(350, -100));
		this.npcs.add(new InventoryChar(500, -100));
		this.npcs.add(new ArenaChar(650, -100));
		this.npcs.add(new ArrowRightChar(800, -100));
		this.enemies = [];
	}
	update() {
		//moving camera
		FRAME.x += (-player.x*FRAME.scaleX - FRAME.x) * 0.3;
		FRAME.y += (-player.y*FRAME.scaleY - FRAME.y) * 0.3;
		
		//colliding with characters
		for (let character of characters.objects) {
			if (checkAABBCollision(player, character)) {
				//collide function
				if (character.collide != undefined) {
					character.collide(player);
				}
				
				//interact function
				if (keyboard[69] && character.interact != undefined) {
					character.interact(player);
				}
			}
		}
		
		groundAreaManager.update();
		
		//update characters and gui
		tiles.update();
		projectiles.update();
		characters.update(timestep.realTime);
		gui.update();
	}
	render() {
		tiles.draw();
		solidTiles.draw();
		projectiles.draw();
		characters.draw();
		gui.draw();
	}
	onLoad() {
		tiles.clear();
		solidTiles.clear();
		projectiles.clear();
		characters.clear();
		
		//go to/set up first ground area
		groundAreaManager.gotoGroundArea(0);
		
		//add npcs and player
		characters.add(player);
		for (var i = 0; i < this.npcs.objects.length; i++) {
			characters.add(this.npcs.objects[i]);
		}
		//add enemies
		for (var i = 0; i < this.enemies.length; i++) {
			characters.add(this.enemies[i]);
		}
		this.enemies = [];
		
		FRAME.x = -player.x*FRAME.scaleX;
		FRAME.y = -player.y*FRAME.scaleY;
		gui.catchUp();
	}
	onUnload() {
		for (var i = 0; i < characters.objects.length; i++) {
			if (characters.objects[i].constructor === Bee || characters.objects[i].constructor === Ghost) {
				this.enemies.push(characters.objects[i]);
			}
		}
	}
}

class ShopScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.shopGui = new ShopGUI(player);
	}
	update() {
		this.shopGui.update();
	}
	render() {
		tiles.draw();
		solidTiles.draw();
		projectiles.draw();
		characters.draw();
		
		this.shopGui.draw();
	}
	onLoad() {
		this.shopGui.load();
		this.shopGui.update();
	}
}

class InventoryScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.inventoryGui = new InventoryGUI(player);
	}
	update() {
		this.inventoryGui.update();
	}
	render() {
		tiles.draw();
		solidTiles.draw();
		projectiles.draw();
		characters.draw();
		
		this.inventoryGui.draw();
	}
	onLoad() {
		this.inventoryGui.load();
		this.inventoryGui.update();
	}
}

class ArenaMenuScene extends Scene {
	constructor (manager) {
		super(manager);
		
		this.arenaMenu = new ArenaMenu(player);
	}
	update() {
		this.arenaMenu.update();
	}
	render() {
		tiles.draw();
		solidTiles.draw();
		projectiles.draw();
		characters.draw();
		
		this.arenaMenu.draw();
	}
	onload() {
		this.arenaMenu.load();
	}
}
