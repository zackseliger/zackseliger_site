FRAME.init(500, 500, document.getElementById('canvas'));
var keyboard = new Keyboard();

FRAME.loadImage('assets/lawless/front_1.png', 'lawlessFront1');
FRAME.loadImage('assets/lawless/front_2.png', 'lawlessFront2');
FRAME.loadImage('assets/lawless/back_1.png', 'lawlessBack1');
FRAME.loadImage('assets/lawless/back_2.png', 'lawlessBack2');
FRAME.loadImage('assets/lawless/right_1.png', 'lawlessRight1');
FRAME.loadImage('assets/lawless/right_2.png', 'lawlessRight2');
FRAME.loadImage('assets/lawless/left_1.png', 'lawlessLeft1');
FRAME.loadImage('assets/lawless/left_2.png', 'lawlessLeft2');

FRAME.loadImage('assets/boxer/idle.png', 'boxerIdle');
FRAME.loadImage('assets/boxer/left_1.png', 'boxerLeft1');
FRAME.loadImage('assets/boxer/left_2.png', 'boxerLeft2');
FRAME.loadImage('assets/boxer/right_1.png', 'boxerRight1');
FRAME.loadImage('assets/boxer/right_2.png', 'boxerRight2');

FRAME.loadImage('assets/sprite/front_1.png', 'spriteFront1');
FRAME.loadImage('assets/sprite/front_2.png', 'spriteFront2');
FRAME.loadImage('assets/sprite/back_1.png', 'spriteBack1');
FRAME.loadImage('assets/sprite/back_2.png', 'spriteBack2');
FRAME.loadImage('assets/sprite/left_1.png', 'spriteLeft1');
FRAME.loadImage('assets/sprite/left_2.png', 'spriteLeft2');
FRAME.loadImage('assets/sprite/right_1.png', 'spriteRight1');
FRAME.loadImage('assets/sprite/right_2.png', 'spriteRight2');

FRAME.loadImage('assets/rock1.png', 'rock1');
FRAME.loadImage('assets/rock2.png', 'rock2');

FRAME.loadImage('assets/spikes_dangerous.png', 'spikesDangerous');
FRAME.loadImage('assets/spikes_safe.png', 'spikesSafe');

function hitTestObjects(obj1, obj2) {
	return (obj1.x - obj1.width/2 < obj2.x + obj2.width/2 &&
			obj1.x + obj1.width/2 > obj2.x - obj2.width/2 &&
			obj1.y - obj1.height/2 < obj2.y + obj2.height/2 &&
			obj1.y + obj1.height/2 > obj2.y - obj2.height/2);
}

//Settings for now
var TILE_SIZE = FRAME.game_height / 10;
var PIXEL_SCALING = 5;
var PLAYER_SPEED = 3;
var PLAYER_BULLET_TIMER = 0.5;
var PLAYER_FLICKER_TIMER = 0.1;
var PLAYER_INVINCIBILITY_TIMER = 1.5;
var BULLET_SPEED = 10;
var BULLET_SIZE = 10;
var BOXER_SPEED = 1;
var BOXER_STATE_TIMER = 0.8;
var SPRITE_TIMER = 0.5;
var SPRITE_SPEED = 1.5;