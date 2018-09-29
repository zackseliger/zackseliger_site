window.onload = function() {
	FRAME.init(GAME_WIDTH, GAME_HEIGHT, document.getElementById("canvas"));
	FRAME.canvas.style.backgroundColor = "#222034";
	keyboard = new Keyboard();
	mouse = new Mouse();
	timestep = new Timestep();
	
	//initializing things that had to be after FRAME
	tiles = new Collection();
	solidTiles = new Collection();
	projectiles = new Collection();
	characters = new Collection();
	player = new Player(GAME_WIDTH/2, GAME_HEIGHT/2);
	gui = new GUI();
	sceneManager = new SceneManager();
	
	sceneManager.addScene("mainWorld", new MainWorldScene());
	sceneManager.addScene("shop", new ShopScene());
	sceneManager.addScene("inventory", new InventoryScene());
	sceneManager.change("mainWorld");
	main();
}

function main() {
	FRAME.clearScreen();
	timestep.tick();
	mouse.update();
	
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