class Menu extends Actor {
	constructor(options) {
		super();
		this.options = [];
		this.selected = 0;
		this.chosen = false;
		this.upRepeat = true;
		this.downRepeat = true;
		this.selectRepeat = true;
		
		keyboard[87] = false;
		keyboard[38] = false;
		keyboard[83] = false;
		keyboard[40] = false;
		keyboard[32] = false;
		keyboard[13] = false;
		
		for (var i = 0; i < options.length; i++) {
			this.options.push(new Text(FRAME.game_width / 2, (i * 50) + 250, options[i], "Arial", "#FFF", 30, "center"));
		}
		
		this.update = function(realTime) {
			if (this.chosen == true) this.chosen = false;
			//user input
			if (keyboard[87] || keyboard[38]) {
				if (this.upRepeat == false) {
					if (this.selected > 0) {
						this.selected -= 1;
						FRAME.playSound('selectUp');
					}
				}
				this.upRepeat = true;
			}
			else if (keyboard[87] == false && keyboard[38] == false) {
				this.upRepeat = false;
			}
			if (keyboard[83] || keyboard[40]) {
				if (this.downRepeat == false) {
					if (this.selected < this.options.length - 1) {
						this.selected += 1;
						FRAME.playSound('selectDown');
					}
				}
				this.downRepeat = true;
			}
			else if (keyboard[83] == false && keyboard[40] == false) {
				this.downRepeat = false;
			}
			if (keyboard[32] || keyboard[13]) {
				if (this.selectRepeat == false) {
					this.chosen = true;
					FRAME.playSound('hurt' + (Math.floor(Math.random() * 3) + 1));
					
					this.selectRepeat = true;
				}
			}
			else if (keyboard[32] == false && keyboard[13] == false) {
				this.selectRepeat = false;
			}
		}
		this.render = function() {
			for (var i = 0; i < this.options.length; i++) {
				if (i == this.selected) this.options[i].fillStyle = "#EE2222";
				else this.options[i].fillStyle = "#FFF";
				
				this.options[i].draw();
			}
		}
	}
}