class ResultsScreen extends Actor {
	constructor(seconds, level, coins, won) {
		super();
		this.done = false;
		this.won = won;
		this.renderText = [];
		if (this.won == true) {
			this.renderText = [false, false, false, false, false, false];
		}
		else {
			this.renderText = [false, false];
		}
		
		//text for winning
		this.seconds = seconds;
		this.secondsText = new Text(FRAME.game_width / 2, 100, "Seconds: " + this.seconds, "Arial", "#FFF", 30, "center");
		this.level = level;
		this.levelText = new Text(FRAME.game_width / 2, 150, "Level: " + this.level, "Arial", "#FFF", 30, "center");
		this.coins = coins;
		this.coinsText = new Text(FRAME.game_width / 2, 200, "Coins: " + this.coins, "Arial", "#FFF", 30, "center");
		this.finalScore = Math.floor((this.level * this.coins * 60) / this.seconds);
		this.finalText = new Text(FRAME.game_width / 2, 250, "Final Score: " + this.finalScore, "Arial", "#FFF", 30, "center");
		this.upgradePoints = Math.floor(this.finalScore / 10);
		this.upgradeText = new Text(FRAME.game_width / 2, 300, "Upgrade Points: " + this.upgradePoints, "Arial", "#FFF", 30, "center");
		this.backText = new Text(FRAME.game_width / 2, 350, "Back", "Arial", "#EE2222", 30, "center");
		UPGRADE_POINTS += this.upgradePoints;
		
		//text for losing
		this.lostText = new Text(FRAME.game_width / 2, 200, "You died!", "Arial", "#FFF", 30, "center");
		if (this.won == false) {
			this.backText = new Text(FRAME.game_width / 2, 250, "Back", "Arial", "#EE2222", 30, "center");
		}
		
		this.update = function(realTime) {
			this.age += realTime;
			for (var i = 0; i < this.renderText.length; i++) {
				if (this.renderText[i] == false) {
					if (this.age >= (i + 1) * 0.75) {
						this.renderText[i] = true;
						FRAME.playSound('hurt1');
					}
				}
			}
		}
		this.render = function() {
			if (this.won) {
				if (this.renderText[0] == true) {
					this.secondsText.draw();
				}
				if (this.renderText[1] == true) {
					this.levelText.draw();
				}
				if (this.renderText[2] == true) {
					this.coinsText.draw();
				}
				if (this.renderText[3] == true) {
					this.finalText.draw();
				}
				if (this.renderText[4] == true) {
					this.upgradeText.draw();
				}
				if (this.renderText[5] == true) {
					this.backText.draw();
				}
			}
			else {
				if (this.renderText[0] == true) {
					this.lostText.draw();
				}
				if (this.renderText[1] == true) {
					this.backText.draw();
				}
			}
			
			if (this.renderText[this.renderText.length - 1] == true) {
				if (keyboard[13] || keyboard[32]) {
					this.done = true;
					TIMES_PLAYED += 1;
				}
			}
		}
	}
}