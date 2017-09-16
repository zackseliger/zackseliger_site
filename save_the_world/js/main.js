//scenes
var manager = new SceneManager();

var player;
var background;
var tooltip;
//misc variables
var timesCompleted = 0;
var battleSpaceship = 0;

function main() {
	FRAME.clearScreen();
	timestep.tick();
	
	manager.update(timestep.realTime);
	manager.render();
	
	//black bars
	FRAME.ctx.fillStyle = BACK_COLOR;
	FRAME.ctx.fillRect(0, -FRAME.y / FRAME.scaleY, GAME_WIDTH, (window.innerHeight - GAME_HEIGHT * FRAME.scaleY) / 2 / FRAME.scaleY);
	FRAME.ctx.fillRect(0, GAME_HEIGHT, GAME_WIDTH, (window.innerHeight - GAME_HEIGHT * FRAME.scaleY) / 2 / FRAME.scaleY);
	
	FRAME.ctx.fillRect(-FRAME.x / FRAME.scaleX, -FRAME.y / FRAME.scaleY, (window.innerWidth - GAME_WIDTH * FRAME.scaleX) / 2 / FRAME.scaleX, window.innerHeight);
	FRAME.ctx.fillRect(GAME_WIDTH, -FRAME.y / FRAME.scaleY, (window.innerWidth - GAME_WIDTH * FRAME.scaleX) / 2 / FRAME.scaleX, window.innerHeight);
	
	requestFrame(main);
}

window.onload = function() {
	keyboard[32] = false;
	player = new Player();
	player.x = 2 * PIXEL_SIZE + player.width / 2;
	player.y = 31 * PIXEL_SIZE;
	background = new Background();
	tooltip = new Tooltip();
	
	manager.addScene("road", new RoadScene(manager));
	manager.addScene("forest", new ForestScene(manager));
	manager.addScene("battle", new BattleScene(manager));
	manager.addScene("won", new WonScene(manager));
	manager.addScene("title", new TitleScene(manager));
	manager.addScene("inSpace", new InSpaceScene(manager));
	manager.addScene("alienWorld", new AlienWorldScene(manager));
	manager.change("title");
	main();
}