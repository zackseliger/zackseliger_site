FRAME.init(500, 500, document.getElementById('canvas'));
var keyboard = new Keyboard();

FRAME.loadImage('assets/img/lawless/front_1.png', 'lawlessFront1');
FRAME.loadImage('assets/img/lawless/front_2.png', 'lawlessFront2');
FRAME.loadImage('assets/img/lawless/back_1.png', 'lawlessBack1');
FRAME.loadImage('assets/img/lawless/back_2.png', 'lawlessBack2');
FRAME.loadImage('assets/img/lawless/right_1.png', 'lawlessRight1');
FRAME.loadImage('assets/img/lawless/right_2.png', 'lawlessRight2');
FRAME.loadImage('assets/img/lawless/left_1.png', 'lawlessLeft1');
FRAME.loadImage('assets/img/lawless/left_2.png', 'lawlessLeft2');

FRAME.loadImage('assets/img/boxer/idle.png', 'boxerIdle');
FRAME.loadImage('assets/img/boxer/left_1.png', 'boxerLeft1');
FRAME.loadImage('assets/img/boxer/left_2.png', 'boxerLeft2');
FRAME.loadImage('assets/img/boxer/right_1.png', 'boxerRight1');
FRAME.loadImage('assets/img/boxer/right_2.png', 'boxerRight2');

FRAME.loadImage('assets/img/sprite/front_1.png', 'spriteFront1');
FRAME.loadImage('assets/img/sprite/front_2.png', 'spriteFront2');
FRAME.loadImage('assets/img/sprite/back_1.png', 'spriteBack1');
FRAME.loadImage('assets/img/sprite/back_2.png', 'spriteBack2');
FRAME.loadImage('assets/img/sprite/left_1.png', 'spriteLeft1');
FRAME.loadImage('assets/img/sprite/left_2.png', 'spriteLeft2');
FRAME.loadImage('assets/img/sprite/right_1.png', 'spriteRight1');
FRAME.loadImage('assets/img/sprite/right_2.png', 'spriteRight2');

FRAME.loadImage('assets/img/rock1.png', 'rock1');
FRAME.loadImage('assets/img/rock2.png', 'rock2');

FRAME.loadImage('assets/img/chest_closed.png', 'chestClosed');
FRAME.loadImage('assets/img/chest_open.png', 'chestOpen');

FRAME.loadImage('assets/img/spikes_dangerous.png', 'spikesDangerous');
FRAME.loadImage('assets/img/spikes_safe.png', 'spikesSafe');

FRAME.loadSound('assets/audio/coinGrab/1.wav', 'coin1', false, 15);
FRAME.loadSound('assets/audio/coinGrab/2.wav', 'coin2', false, 15);
FRAME.loadSound('assets/audio/coinGrab/3.wav', 'coin3', false, 15);
FRAME.loadSound('assets/audio/coinGrab/4.wav', 'coin4', false, 15);

FRAME.loadSound('assets/audio/expGrab/1.wav', 'exp1', false, 15);
FRAME.loadSound('assets/audio/expGrab/2.wav', 'exp2', false, 15);
FRAME.loadSound('assets/audio/expGrab/3.wav', 'exp3', false, 15);
FRAME.loadSound('assets/audio/expGrab/4.wav', 'exp4', false, 15);
FRAME.loadSound('assets/audio/expGrab/5.wav', 'exp5', false, 15);

FRAME.loadSound('assets/audio/hurt/1.wav', 'hurt1', false, 10);
FRAME.loadSound('assets/audio/hurt/2.wav', 'hurt2', false, 10);
FRAME.loadSound('assets/audio/hurt/3.wav', 'hurt3', false, 10);

FRAME.loadSound('assets/audio/selectUp.wav', 'selectUp', false, 3);
FRAME.loadSound('assets/audio/selectDown.wav', 'selectDown', false, 3);
FRAME.loadSound('assets/audio/error.wav', 'error', false, 3);

FRAME.loadSound('assets/audio/soundtrack.mp3', 'soundtrack', true);

function hitTestObjects(obj1, obj2) {
	return (obj1.x - obj1.width/2 < obj2.x + obj2.width/2 &&
			obj1.x + obj1.width/2 > obj2.x - obj2.width/2 &&
			obj1.y - obj1.height/2 < obj2.y + obj2.height/2 &&
			obj1.y + obj1.height/2 > obj2.y - obj2.height/2);
}

//Settings for now
var TILE_SIZE = FRAME.game_height / 10;
var PIXEL_SCALING = 5;
var FLICKER_TIMER = 0.1;
var INVINCIBILITY_TIMER = 1.5;
var FLICKER_ALPHA = 0.6;
var BULLET_SPEED = 10;
var BULLET_SIZE = 10;
var BOXER_SPEED = 1;
var BOXER_STATE_TIMER = 0.8;
var SPRITE_TIMER = 0.5;
var SPRITE_SPEED = 1.5;
var COIN_SIZE = 4;
var COIN_SPEED = 2;
var SPIKE_TIMER = 5;
var END_TILE_SIZE = 2;

//options
var PLAY_MUSIC_OPTION = true;
var PLAY_SFX_OPTION = true;

//upgrades
var UPGRADE_POINTS = 0;
var UPGRADE_COSTS = [100, 30, 50];
var CAN_UPGRADE = [true, true, true];
var PLAYER_STARTING_HEALTH = 3;
var PLAYER_SPEED = 3;
var PLAYER_BULLET_TIMER = 0.5;

//other
var TIMES_PLAYED = 0;