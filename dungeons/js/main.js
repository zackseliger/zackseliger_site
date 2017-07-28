var timestep = new Timestep();
var testdungeon = new Dungeon();
var startText = new Text(FRAME.game_width / 2, FRAME.game_height / 2, "PRESS SPACE TO START", "Arial", "#FFF", 30, "center");
var phase = 0;

function main() {
	deltaTime = timestep.tick();
	FRAME.clearScreen();
	
	if (phase == 0) {
		startText.draw();
		if (keyboard[32]) {
			phase = 1;
		}
	}
	else if (phase == 1) {
		testdungeon.update(timestep.realTime);
		testdungeon.draw();
	}
	
	requestFrame(main);
}

window.onload = function() {
	testdungeon.addRoom(0, 0, new Room("#FFF"));
	testdungeon.addRoom(0, 1, new Room("#FFF"));
	testdungeon.addRoom(1, 0, new Room("#FFF"));
	testdungeon.addPlayer(new Player(0, 0));
	testdungeon.makeStartRoom(0, 0);
	testdungeon.changeRooms(0, 0);
	
	main();
}