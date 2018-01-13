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
	
	manager.addScene("menu", new MenuScene(manager));
	manager.addScene("editor", new EditorScene(manager));
	manager.addScene("shop", new ShopScene(manager));
	manager.addScene("inventory", new InventoryScene(manager));
	manager.addScene("fight", new FightScene(manager));
	manager.change("menu");
	
	FRAME.width = GAME_WIDTH;
	FRAME.height = GAME_HEIGHT;
	
	main();
}