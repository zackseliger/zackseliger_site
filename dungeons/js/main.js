var timestep = new Timestep();
var testdungeon;
var resultsScreen;
var mainMenu;
var upgradesMenu;
var costText = new Text(0, 150, "", "Arial", "#FFF", 30, "left");
var pointsText = new Text(FRAME.game_width, 150, "", "Arial", "#FFF", 30, "right");;
var optionsMenu;
var headerText = new Text(FRAME.game_width / 2, 25, "TINY DUNGEONS", "Arial", "#FFF", 60, "center");
var startText = new Text(FRAME.game_width / 2, FRAME.game_height / 2, "PRESS SPACE TO START", "Arial", "#FFF", 30, "center");
var phase = 0;

function main() {
	deltaTime = timestep.tick();
	FRAME.clearScreen();
	
	if (phase == 0) {
		headerText.draw();
		startText.draw();
		if (keyboard[32]) {
			phase = 1;
			FRAME.playSound('hurt' + (Math.floor(Math.random() * 3) + 1))
		}
	}
	else if (phase == 1) {
		headerText.draw();
		mainMenu.draw();
		
		mainMenu.update(timestep.realTime);
		if (mainMenu.chosen) {
			if (mainMenu.selected == 0) {
				phase = 2;
				if (PLAY_MUSIC_OPTION == true) {
					FRAME.playSound('soundtrack');
				}
				testdungeon = makeDungeon(3, 3);
			}
			else if (mainMenu.selected == 1) {
				phase = 4;
				upgradesMenu.selected = 0;
				headerText.text = "UPGRADES";
			}
			else if (mainMenu.selected == 2) {
				phase = 5;
				optionsMenu.selected = 0;
				headerText.text = "OPTIONS";
			}
		}
	}
	else if (phase == 2) {
		testdungeon.update(timestep.realTime);
		testdungeon.draw();
		if (testdungeon.state == "lost" || testdungeon.state == "won") {
			phase = 3;
			FRAME.stopSound('soundtrack');
			resultsScreen = new ResultsScreen(Math.floor(testdungeon.timer), testdungeon.level, testdungeon.coins, testdungeon.state == "won");
		}
	}
	else if (phase == 3) {
		resultsScreen.update(timestep.realTime);
		resultsScreen.draw();
		if (resultsScreen.done) {
			phase = 1;
		}
	}
	else if (phase == 4) {
		headerText.draw();
		upgradesMenu.draw();
		costText.draw();
		pointsText.draw();
		
		upgradesMenu.update(timestep.realTime);
		if (upgradesMenu.chosen) {
			if (upgradesMenu.selected == 0) {
				if (CAN_UPGRADE[0] && UPGRADE_POINTS > UPGRADE_COSTS[0]) {
					UPGRADE_POINTS -= UPGRADE_COSTS[0];
					PLAYER_STARTING_HEALTH += 1;
					if (PLAYER_STARTING_HEALTH >= 5) {
						CAN_UPGRADE[0] = false;
						UPGRADE_COSTS[0] = "N/A";
					}
					else {
						UPGRADE_COSTS[0] *= 2;
					}
				}
			}
			else if (upgradesMenu.selected == 1) {
				if (CAN_UPGRADE[1] && UPGRADE_POINTS > UPGRADE_COSTS[1]) {
					UPGRADE_POINTS -= UPGRADE_COSTS[1];
					PLAYER_SPEED += 0.25;
					if (PLAYER_SPEED >= 4) {
						CAN_UPGRADE[1] = false;
						UPGRADE_COSTS[1] = "N/A";
					}
					else {
						UPGRADE_COSTS[1] *= 2;
					}
				}
			}
			else if (upgradesMenu.selected == 2) {
				if (CAN_UPGRADE[2] && UPGRADE_POINTS > UPGRADE_COSTS[2]) {
					UPGRADE_POINTS -= UPGRADE_COSTS[2];
					PLAYER_BULLET_TIMER -= 0.05;
					if (PLAYER_BULLET_TIMER <= 0.2) {
						CAN_UPGRADE[2] = false;
						UPGRADE_COSTS[2] = "N/A";
					}
					else {
						UPGRADE_COSTS[2] *= 2;
					}
				}
			}
			else if (upgradesMenu.selected == 3) {
				phase = 1;
				headerText.text = "TINY DUNGEONS";
			}
		}
		costText.text = "Cost: " + UPGRADE_COSTS[upgradesMenu.selected];
		if (upgradesMenu.selected == 3) costText.text = "Cost: N/A";
		pointsText.text = "Points: " + UPGRADE_POINTS;
	}
	else if (phase == 5) {
		optionsMenu.draw();
		headerText.draw();
		
		optionsMenu.update(timestep.realTime);
		if (optionsMenu.chosen) {
			if (optionsMenu.selected == 0) {
				PLAY_MUSIC_OPTION = !PLAY_MUSIC_OPTION;
				if (PLAY_MUSIC_OPTION == true) {
					optionsMenu.options[0].text = "Play Music: Yes";
				}
				else {
					optionsMenu.options[0].text = "Play Music: No";
				}
			}
			else if (optionsMenu.selected == 1) {
				PLAY_SFX_OPTION = !PLAY_SFX_OPTION;
				if (PLAY_SFX_OPTION == true) {
					optionsMenu.options[1].text = "Play SFX: Yes";
				}
				else {
					optionsMenu.options[1].text = "Play SFX: No";
				}
			}
			else if (optionsMenu.selected == 2) {
				phase = 1;
				headerText.text = "TINY DUNGEONS";
			}
		}
	}
	
	
	requestFrame(main);
}

window.onload = function() {
	mainMenu = new Menu(["Start Game", "Upgrades", "Options"]);
	upgradesMenu = new Menu(["Health", "Movement Speed", "Shooting Speed", "Back"]);
	optionsMenu = new Menu(["Play Music: ", "Play SFX: ", "Back"])
	if (PLAY_MUSIC_OPTION == true) {
		optionsMenu.options[0].text += "Yes";
	}
	else {
		optionsMenu.options[0].text += "No";
	}
	if (PLAY_SFX_OPTION == true) {
		optionsMenu.options[1].text += "Yes";
	}
	else {
		optionsMenu.options[1].text += "No";
	}
	
	main();
}

function makeDungeon(w, h) {
	var dungeon = new Dungeon();
	
	var x = 0;
	var y = 0;
	
	dungeon.addRoom(0, 0, new Room("#FFF"));
	for (var x = 0; x < w*2; x++) {
		for (var y = 0; y < h*2; y++) {
			if (x + 1 < w*2 && y + 1 < h*2) {
				if (Math.random() < 0.5) {
					dungeon.addRoom(x + 1, y, new Room("#FFF"));
				}
				else {
					dungeon.addRoom(x, y + 1, new Room("#FFF"));
				}
			}
			else {
				dungeon.addRoom(x, y, new Room("#FFF"));
			}
		}
	}
	
	dungeon.addPlayer(new Player(0, 0));
	dungeon.makeStartRoom(0, 0);
	dungeon.makeEndRoom(w*2-1, h*2-1);
	dungeon.changeRooms(0, 0);
	
	return dungeon;
}

function drawDungeonLayout(dung) {
	for (var x = 0; x < dung.rooms.length; x++) {
		for (var y = 0; y < dung.rooms[x].length; y++) {
			if (dung.rooms[x][y] === undefined) {
				FRAME.ctx.fillStyle = "#F00";
			}
			else {
				FRAME.ctx.fillStyle = "#FFF";
			}
			FRAME.ctx.fillRect(x*25, y*25, 25, 25);
		}
	}
}