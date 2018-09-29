/*
TODO:
-dungeons
-arenas
-save
-sounds
-more lands
-upgrades
-armor
-more enemies
-more weapons
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

class MainWorldScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.npcs = new Collection();
		this.npcs.add(new Mayor(200, -100));
		this.npcs.add(new SaveChar(500, -100));
		this.npcs.add(new ShopChar(650, -100));
		this.npcs.add(new InventoryChar(800, -100));
		this.enemies = [];
	}
	update() {
		//moving camera
		FRAME.x += (-player.x*FRAME.scaleX + window.innerWidth/2 - FRAME.x) * 0.3;
		FRAME.y += (-player.y*FRAME.scaleY + window.innerHeight/2 - FRAME.y) * 0.3;
		
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
		
		//spawning in new guys
		while (numBees < maxBees) {
			characters.add(new Bee(Math.random()*2800-900, Math.random()*1800-800));
		}
		while (numGhosts < maxGhosts) {
			characters.add(new Ghost(Math.random()*2800-900, Math.random()*1800-800));
		}
		
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
		
		//road
		for (var i = 0; i < 20; i++) {
			tiles.add(new Tile(false, i*PIXEL_SIZE*8+50, -25, FRAME.getImage("road" + (1 + i%2))));
		}
		
		//rocks
		makeRandomTiles(Rock,500,0,3000,2000,20,65);
		//shrubs
		makeRandomTiles(Shrub,500,0,3000,2000,100,20);
		
		//fences
		makeFenceBox(500,0,3000,2000);
		
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