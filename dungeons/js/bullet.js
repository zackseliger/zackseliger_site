class Bullet extends Actor {
	constructor(x, y, xvel, yvel) {
		super(x, y);
		this.xVel = xvel;
		this.yVel = yvel;
		this.width = BULLET_SIZE;
		this.height = BULLET_SIZE;
		
		this.update = function() {
			this.x += this.xVel;
			this.y += this.yVel;
		}
		this.render = function() {
			this.ctx.fillStyle="#2299EE";
			this.ctx.fillRect(-BULLET_SIZE / 2, -BULLET_SIZE / 2, BULLET_SIZE, BULLET_SIZE);
		}
	}
}