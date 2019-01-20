/*
TODO:
-NPCs/events
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
	getScene(name) {
		return this.scenes.get(name);
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
		this.oldPlayerPosition = 0;
	}
	update() {
		projectiles.update();
		characters.update();

		this.menuGroundArea.update();
		this.mainMenu.update();
	}
	render() {
		renderOnScreenActors();
		this.mainMenu.draw();
	}
	onLoad() {
		tiles.clear();
		solidTiles.clear();
		projectiles.clear();
		characters.clear();

		this.oldPlayerPosition = player.x;
		player.x = 5000;

		this.menuGroundArea.gotoGroundArea(0);
		FRAME.x = Math.random()*2000-1000;
		FRAME.y = Math.random()*2000-1000;

		document.getElementById("links-box").style.visibility = "visible";
	}
	onUnload() {
		document.getElementById("links-box").style.visibility = "hidden";
		if (player.x != 5000) this.oldPlayerPosition = player.x;
		player.x = this.oldPlayerPosition;
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

		//respawn button
		this.respawnButton = new Button(0,0,"Respawn", 200);
		this.respawnButton.timer = 70;
		this.respawnButton.action = function() {
			if (this.timer > 0) return;
			//respawn player with full health and invincible
			player.refresh();
			characters.add(player);
			player.canMove = true;
			player.x = 500;
			player.y = 500;
			player.invincible = true;
			//remove coins from ground
			for (let i = 0; i < tiles.objects.length; i++) {
				if (tiles.objects[i].isCoin == true) {
					tiles.remove(tiles.objects[i]);
					i--;
				}
			}
			this.timer = 70;
		}
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

		//update ground area - spawning new guys
		groundAreaManager.update();

		//update characters and gui
		tiles.update();
		projectiles.update();
		characters.update(timestep.realTime);
		gui.update();

		//seeing if player is dead
		if (gui.targetDead) {
			player.die();
			this.respawnButton.update(player.x, player.y + window.innerHeight/10);
		}

		specialThings.update();
	}
	render() {
		specialThings.draw();
		renderOnScreenActors();
		gui.draw();

		if (gui.targetDead) {
			this.respawnButton.timer -= 1;
			if (this.respawnButton.timer <= 0) {
				this.respawnButton.draw();
			}
		}
	}
	onLoad() {
		tiles.clear();
		solidTiles.clear();
		projectiles.clear();
		characters.clear();

		//set up ground area
		groundAreaManager.gotoGroundArea(groundAreaManager.getCurrentGroundArea());

		//set position of player
		if (player.x == 5000) {
			player.x = 500;
			player.y = 500;
		}

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
			if (characters.objects[i].isEnemy) {
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
		renderOnScreenActors();
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
		renderOnScreenActors();
		this.inventoryGui.draw();
	}
	onLoad() {
		this.inventoryGui.load();
		this.inventoryGui.update();
	}
}

class ArenaMenuScene extends Scene {
	constructor(manager) {
		super(manager);

		this.arenaMenu = new ArenaMenu(player);
	}
	update() {
		this.arenaMenu.update();
	}
	render() {
		renderOnScreenActors();
		this.arenaMenu.draw();
	}
	onLoad() {
		this.arenaMenu.update();
	}
}

class ArenaWorldScene extends Scene {
	constructor(manager) {
		super(manager);

		this.ARENA_WIDTH = 1600;
		this.ARENA_HEIGHT = 600;
		this.battle = new ArenaBattle();
		this.arenaGUI = new ArenaGUI();
		this.leftGate = new Tile(false, -300, -this.ARENA_HEIGHT/2-58, FRAME.getImage("arenaGate"));
		this.rightGate = new Tile(false, 300, -this.ARENA_HEIGHT/2-58, FRAME.getImage("arenaGate"));
	}
	update() {
		//moving camera
		if (player.x > -400 && player.x < 400)
			FRAME.x += (-player.x*FRAME.scaleX - FRAME.x) * 0.3;
		else if (player.x <= -400)
			FRAME.x += (400*FRAME.scaleX - FRAME.x) * 0.3;
		else if (player.x >= 400)
			FRAME.x += (-400*FRAME.scaleX - FRAME.x) * 0.3;
		if (player.y < 0)
			FRAME.y += (-player.y*FRAME.scaleY - FRAME.y) * 0.3;
		else
			FRAME.y += (0 - FRAME.y) * 0.3;

		//update sequence
		this.battle.update(timestep.realTime);

		//update characters and gui
		tiles.update();
		projectiles.update();
		characters.update(timestep.realTime);
		gui.update();
		if (this.battle.isFinished() || player.health <= 0 && player.armorHealth <= 0) {
			this.arenaGUI.update();
		}
	}
	render() {
		renderOnScreenActors([solidTiles, tiles, projectiles, characters]);
		gui.draw();
		this.arenaGUI.draw();
	}
	onLoad() {
		tiles.clear();
		solidTiles.clear();
		projectiles.clear();
		characters.clear();

		//scenery and tiles :)
		makeRandomTiles(ArenaShrub,0,0,this.ARENA_WIDTH-10,this.ARENA_HEIGHT,50,65);
		var bottomTile = new Tile(true, 0, this.ARENA_HEIGHT/2+2);
		bottomTile.width = this.ARENA_WIDTH;
		bottomTile.height = 4;
		solidTiles.add(bottomTile);
		solidTiles.add(new Tile(true, 0, -this.ARENA_HEIGHT/2-50, FRAME.getImage("arenaTopWallSmall")));
		solidTiles.add(new Tile(true, this.ARENA_WIDTH/2-200, -this.ARENA_HEIGHT/2-50, FRAME.getImage("arenaTopWallSmall")));
		solidTiles.add(new Tile(true, -this.ARENA_WIDTH/2+200, -this.ARENA_HEIGHT/2-50, FRAME.getImage("arenaTopWallSmall")));
		tiles.add(new Tile(false, 0, -this.ARENA_HEIGHT/2-50, FRAME.getImage("arenaTopWall")));
		solidTiles.add(new Tile(true, 0, -this.ARENA_HEIGHT/2-16*PIXEL_SIZE-50, FRAME.getImage("arenaTopWall")));
		solidTiles.add(new Tile(true, this.ARENA_WIDTH/2+65, -75, FRAME.getImage("arenaSideWall")));
		solidTiles.add(new Tile(true, -this.ARENA_WIDTH/2-65, -75, FRAME.getImage("arenaSideWall")));
		for (let i = 0; i < 9; i++) {
			tiles.add(new Tile(false, -this.ARENA_WIDTH/2+i*30*PIXEL_SIZE+75, -this.ARENA_HEIGHT/2-200+PIXEL_SIZE, FRAME.getImage("arenaCrownWall")));
		}
		tiles.add(this.leftGate);
		tiles.add(this.rightGate);

		//add in player, reset health
		characters.add(player);
		player.x = 0;
		player.y = 0;
		player.refresh();

		//move camera
		FRAME.x = -player.x*FRAME.scaleX;
		FRAME.y = -player.y*FRAME.scaleY;

		this.battle.reset();
		this.arenaGUI = new ArenaGUI();
		FRAME.canvas.style.backgroundColor = "#EEC39A";
	}
	setBattle(seq) {
		this.battle = seq;
		this.battle.reset();
	}
}
