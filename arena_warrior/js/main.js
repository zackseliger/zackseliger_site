window.onload = function() {
	FRAME.init(GAME_WIDTH, GAME_HEIGHT, document.getElementById("canvas"));
	FRAME.defaultFont = "Bungee";
	keyboard = new Keyboard();
	mouse = new Mouse();
	timestep = new Timestep();

	//initializing things that had to be after FRAME
	specialThings = new Collection();
	tiles = new Collection();
	solidTiles = new Collection();
	projectiles = new Collection();
	characters = new Collection();
	onScreenActors = new Collection();
	player = new Player(500,500);
	gui = new GUI();
	sceneManager = new SceneManager();
	//mouse polygon
	mousePolygon = new Polygon(0,0,0.5);
	mousePolygon.addPoint(1,-1);
	mousePolygon.addPoint(1,1);
	mousePolygon.addPoint(-1,1);
	mousePolygon.addPoint(-1,-1);
	//init area grounds
	groundAreaManager = new GroundAreaManager();
	groundAreaManager.addGroundArea(new TutorialGroundArea());
	//arena sequences
	setupArenaBattles();

	//add scenes
	sceneManager.addScene("mainMenu", new MainMenuScene());
	sceneManager.addScene("mainWorld", new MainWorldScene());
	sceneManager.addScene("arenaWorld", new ArenaWorldScene());
	sceneManager.addScene("shop", new ShopScene());
	sceneManager.addScene("inventory", new InventoryScene());
	sceneManager.addScene("arenaMenu", new ArenaMenuScene());
	sceneManager.change("mainMenu");
	main();
}

function main() {
	FRAME.clearScreen();
	timestep.tick();
	mouse.update();
	mousePolygon.x = mouse.x;
	mousePolygon.y = mouse.y;

	//sorting characters by height
	characters.objects.sort(function(a, b) {
		if (a.y + a.height/2 > b.y + b.height/2)
			return 1;
		return -1;
	});

	sceneManager.render();
	sceneManager.update(timestep.realTime);

	requestFrame(main);
}
