var GAME_WIDTH = 700;
var GAME_HEIGHT = 350;
FRAME.init(GAME_WIDTH, GAME_HEIGHT, document.getElementById("canvas"));
FRAME.width = GAME_WIDTH;
FRAME.height = GAME_HEIGHT;

var keyboard = new Keyboard();
var mouse = new Mouse();
var timestep = new Timestep();

var PIXEL_SIZE = 10;

var PLAYER_SPEED = 5;
var SPACESHIP_SPEED = 5;
var RED_THING_BATTLE_SPEED = 4;
var SPACE_SPEED = 5;
var PAN_SPEED = 12;
var BACK_COLOR = "#222";
var TRASH_INTERVAL = 0.1;
var TRASH_RARITY = 20;
var PLAY_MUSIC = true;

function checkCollision(obj1, obj2) {
	return (obj1.x - obj1.width/2 < obj2.x + obj2.width/2 &&
			obj1.x + obj1.width/2 > obj2.x - obj2.width/2 &&
			obj1.y - obj1.height < obj2.y &&
			obj1.y > obj2.y - obj2.height);
}

function checkCollisionWithRedThing(obj1, thing) {
	return (obj1.x - obj1.width/2 < thing.x &&
			obj1.x + obj1.width/2 > thing.x - thing.height &&
			obj1.y - obj1.height < thing.y + thing.width &&
			obj1.y > thing.y);
}

////////////////////////
/////////IMAGES/////////
////////////////////////

//backgrounds
FRAME.loadImage("assets/img/backs/black.png", "blackBack");
FRAME.loadImage("assets/img/backs/title.png", "titleBack");
FRAME.loadImage("assets/img/backs/road.png", "roadBack");
FRAME.loadImage("assets/img/backs/old_man/where.png", "whereBack");
FRAME.loadImage("assets/img/backs/forest.png", "forestBack");
FRAME.loadImage("assets/img/backs/greenery.png", "forestGreeneryBack");
FRAME.loadImage("assets/img/backs/greenery2.png", "forestGreenery2Back");
FRAME.loadImage("assets/img/backs/stars1.png", "space1Back");
FRAME.loadImage("assets/img/backs/stars2.png", "space2Back");
FRAME.loadImage("assets/img/backs/won.png", "wonBack");
FRAME.loadImage("assets/img/backs/alienworld.png", "alienWorldBack");
FRAME.loadImage("assets/img/backs/lady/glasses.png", "lostGlassesBack");
FRAME.loadImage("assets/img/backs/lady/glassesTake.png", "takeGlassesBack");
FRAME.loadImage("assets/img/backs/spaceship/spaceshipIsBroken.png", "spaceshipIsBrokenBack");
FRAME.loadImage("assets/img/backs/spaceship/spaceshipFix.png", "spaceshipFixBack");
FRAME.loadImage("assets/img/backs/spaceship/spaceshipNeedTools.png", "spaceshipNeedToolsBack");
FRAME.loadImage("assets/img/backs/spaceship/spaceshipNeedKnowledge.png", "spaceshipNeedKnowledgeBack");
FRAME.loadImage("assets/img/backs/spaceship/realizationBack.png", "spaceshipRealizationBack");
FRAME.loadImage("assets/img/backs/spaceship/spaceshipKitDestroyed.png", "spaceshipKitDestroyedBack");
FRAME.loadImage("assets/img/backs/doorLocked.png", "doorLockedBack");
FRAME.loadImage("assets/img/backs/gramps/talk1.png", "grampsTalk1Back");
FRAME.loadImage("assets/img/backs/gramps/talk2.png", "grampsTalk2Back");
FRAME.loadImage("assets/img/backs/gramps/talk3.png", "grampsTalk3Back");
FRAME.loadImage("assets/img/backs/gramps/talk4.png", "grampsTalk4Back");
FRAME.loadImage("assets/img/backs/gramps/wonder.png", "grampsWonderBack");
FRAME.loadImage("assets/img/backs/explain.png", "explainBack");
FRAME.loadImage("assets/img/backs/bunker/signText.png", "bunkerSignTextBack");
FRAME.loadImage("assets/img/backs/noOneBack.png", "bunkerNoOneBack");
FRAME.loadImage("assets/img/backs/unlockDoorBack.png", "unlockDoorBack");
FRAME.loadImage("assets/img/backs/foundToolsBack.png", "foundToolsBack");

//player
FRAME.loadImage("assets/img/player/idle.png", "playerIdle");
FRAME.loadImage("assets/img/player/right1.png", "playerRight1");
FRAME.loadImage("assets/img/player/right2.png", "playerRight2");
FRAME.loadImage("assets/img/player/left1.png", "playerLeft1");
FRAME.loadImage("assets/img/player/left2.png", "playerLeft2");
FRAME.loadImage("assets/img/player/headband/idle.png", "playerIdleHeadband");
FRAME.loadImage("assets/img/player/headband/right1.png", "playerRight1Headband");
FRAME.loadImage("assets/img/player/headband/right2.png", "playerRight2Headband");
FRAME.loadImage("assets/img/player/headband/left1.png", "playerLeft1Headband");
FRAME.loadImage("assets/img/player/headband/left2.png", "playerLeft2Headband");

//spaceship
FRAME.loadImage("assets/img/spaceship/1idle.png", "spaceship1Idle");
FRAME.loadImage("assets/img/spaceship/1fly1.png", "spaceship1Fly1");
FRAME.loadImage("assets/img/spaceship/1fly2.png", "spaceship1Fly2");
FRAME.loadImage("assets/img/spaceship/1battleIdle.png", "spaceship1Battle");
FRAME.loadImage("assets/img/spaceship/2idle.png", "spaceship2Idle");
FRAME.loadImage("assets/img/spaceship/2fly1.png", "spaceship2Fly1");
FRAME.loadImage("assets/img/spaceship/2fly2.png", "spaceship2Fly2");
FRAME.loadImage("assets/img/spaceship/2battleIdle.png", "spaceship2Battle");
FRAME.loadImage("assets/img/spaceship/3idle.png", "spaceship3Idle");
FRAME.loadImage("assets/img/spaceship/3fly1.png", "spaceship3Fly1");
FRAME.loadImage("assets/img/spaceship/3fly2.png", "spaceship3Fly2");
FRAME.loadImage("assets/img/spaceship/3battleIdle.png", "spaceship3Battle");
FRAME.loadImage("assets/img/spaceship/3battleIdleFlipped.png", "spaceship3BattleFlipped");
FRAME.loadImage("assets/img/spaceship/3broken.png", "spaceship3Broken");

//oldie
FRAME.loadImage("assets/img/oldie/idle1.png", "oldieIdle1");
FRAME.loadImage("assets/img/oldie/idle2.png", "oldieIdle2");

//ladie
FRAME.loadImage("assets/img/lady/idle1.png", "ladyIdle1");
FRAME.loadImage("assets/img/lady/idle2.png", "ladyIdle2");

//planets
FRAME.loadImage("assets/img/moon.png", "moon");
FRAME.loadImage("assets/img/earth.png", "earth");
FRAME.loadImage("assets/img/sun.png", "sun");

//red thing
FRAME.loadImage("assets/img/thing.png", "redThingIdle");

//tooltip
FRAME.loadImage("assets/img/tooltip.png", "tooltip");

//trash and related backgrounds
FRAME.loadImage("assets/img/trash.png", "trash1");
FRAME.loadImage("assets/img/trash2.png", "trash2");
FRAME.loadImage("assets/img/backs/trash/emptyBox.png", "trashEmptyBoxBack");
FRAME.loadImage("assets/img/backs/trash/drillPress.png", "trashDrillPressBack");
FRAME.loadImage("assets/img/backs/trash/blueHeadband.png", "trashBlueHeadband");
FRAME.loadImage("assets/img/backs/trash/spaceshipRepairKit.png", "trashSpaceshipRepairKit");
FRAME.loadImage("assets/img/backs/trash/wornOutBlanket.png", "trashBlanket");
FRAME.loadImage("assets/img/backs/trash/monitor.png", "trashMonitor");

//sign and related backgrounds
FRAME.loadImage("assets/img/sign.png", "sign");
FRAME.loadImage("assets/img/backs/sign/cant_read.png", "cantReadBack");
FRAME.loadImage("assets/img/backs/sign/signBecome.png", "signBecomeBack");
FRAME.loadImage("assets/img/backs/sign/signSpaceshipologist.png", "signSpaceshipologistBack");

////////////////////////
/////////SOUNDS/////////
////////////////////////

//blips
FRAME.loadSound("assets/audio/blips/blip1.wav", "blip1");
FRAME.loadSound("assets/audio/blips/blip2.wav", "blip2");
FRAME.loadSound("assets/audio/blips/blip3.wav", "blip3");
FRAME.loadSound("assets/audio/blips/blip4.wav", "blip4");
FRAME.loadSound("assets/audio/blips/blip5.wav", "blip5");

//thuds
FRAME.loadSound("assets/audio/thud1.wav", "thud1");
FRAME.loadSound("assets/audio/thud2.wav", "thud2");
FRAME.loadSound("assets/audio/thud3.wav", "thud3");

//shoot
FRAME.loadSound("assets/audio/shoot1.wav", "shoot1");
FRAME.loadSound("assets/audio/shoot2.wav", "shoot2");
FRAME.loadSound("assets/audio/shoot3.wav", "shoot3");

//die/blast
FRAME.loadSound("assets/audio/die.wav", "die");
FRAME.loadSound("assets/audio/die.wav", "dieQuiet", false, 0.1);
FRAME.loadSound("assets/audio/blast.wav", "blast", false, 0.5);

//music
FRAME.loadSound("assets/audio/music/theme.wav", "themeMusic", true);
FRAME.loadSound("assets/audio/music/fight.wav", "fightMusic", true);
FRAME.loadSound("assets/audio/music/flying.wav", "flyingMusic", true);