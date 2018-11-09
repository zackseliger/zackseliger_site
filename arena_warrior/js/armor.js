class Armor extends Actor {
	constructor(img, owner, health) {
		if (owner == undefined) {
			owner = {x:0, y:0};
		}
		
		super(owner.x, owner.y);
		this.health = health;
		this.owner = owner;
		this.image = FRAME.getImage(img);
		this.width = this.image.width*PIXEL_SIZE;
		this.height = this.image.height*PIXEL_SIZE;
		this.facingRight = true;
	}
	update() {
		this.x = this.owner.x;
		this.y = this.owner.y+PIXEL_SIZE;
		this.rotation = this.owner.rotation*1.1;
		this.facingRight = this.owner.facingRight;
	}
	render() {
		if (this.facingRight) this.ctx.scale(-1,1,1);
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
		if (this.facingRight) this.ctx.scale(-1,1,1);
	}
}

class Leather extends Armor {
	constructor(owner) {
		super("armor1", owner, 1);
	}
}

class GoldArmor extends Armor {
	constructor(owner) {
		super("armor2", owner, 2);
	}
}
