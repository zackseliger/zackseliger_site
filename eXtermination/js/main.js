//scenes
var manager = new SceneManager();

var characters = new Collection();
var weapons = new Collection();
var bullets = new Collection();
var tiles = new Collection();
var particles = new Collection();
//editor things
var editorSelected = null;
var currentLevel = "";
var inEditor = false;
var editorDisabled = false;

function main() {
	FRAME.clearScreen();
	timestep.tick();
	mouse.update();
	
	characters.objects.sort(function(a, b) {
		if (a.y > b.y) return 1;
		else return -1;
	});
	
	manager.render();
	manager.update(timestep.realTime);
	
	requestFrame(main);
}

window.onload = function() {
	weapon = new Gun();
	player = new Player(0, 0);
	floor = new FloorRect(0, 0);
	manager.addScene("Shop", new ShopScene(manager));
	
	//load
	loadGame();
	
	manager.addScene("Menu", new MenuScene(manager));
	manager.addScene("Edit", new EditorScene(manager));
	
	manager.addScene("Customize", new InventoryScene(manager));
	manager.addScene("Fight", new FightScene(manager));
	manager.addScene("Settings", new SettingsScene(manager));
	manager.change("Menu");
	
	FRAME.width = GAME_WIDTH;
	FRAME.height = GAME_HEIGHT;
	
	main();
}