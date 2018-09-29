class Weapon extends Actor {
	constructor(img, owner) {
		if (owner == undefined) {
			owner = {x: 0, y: 0};
		}
		
		super(owner.x, owner.y);
		this.owner = owner;
		this.image = FRAME.getImage(img);
		this.width = this.image.width*PIXEL_SIZE;
		this.height = this.image.height*PIXEL_SIZE;
		this.displayWidth = 0;
		this.displayHeight = 0;
		
		this.polygon = new Polygon(0,0,this.width/1.9);
		this.polygon.addPoint(1,-this.height/this.width);
		this.polygon.addPoint(1,this.height/this.width);
		this.polygon.addPoint(-1,this.height/this.width);
		this.polygon.addPoint(-1,-this.height/this.width);
		
		this.attackTimer = 0;
		this.attackFrames = 20;
		this.canAttack = true;
		this.attacking = false;
	}
	update() {
		this.displayWidth += (this.width - this.displayWidth) * 0.2;
		this.displayHeight += (this.height - this.displayHeight) * 0.2;
		
		//while not attacking
		if (this.canAttack == false) {
			this.attackTimer += 1;
			if (this.attackTimer >= this.attackFrames) {
				this.canAttack = true;
				this.attackTimer = 0;
			}
		}
		
		//for attacking
		if (this.attacking) {
			this.strike();
			
			for (let i = 0; i < characters.objects.length; i++) {
				if (this.owner != characters.objects[i] && characters.objects[i].polygon !== undefined) {
					if (checkSATCollision(characters.objects[i].polygon, this.polygon)) {
						characters.objects[i].hurt();
					}
				}
			}
		}
		
		this.polygon.x = this.x;
		this.polygon.y = this.y;
		this.polygon.rotation = this.rotation;
	}
	render() {
		this.ctx.drawImage(this.image, -this.displayWidth/2, -this.displayHeight/2, this.displayWidth, this.displayHeight);
	}
	attack() {
		if (this.canAttack) {
			this.attacking = true;
			this.canAttack = false;
		}
	}
	strike() {
		
	}
	relax() {
		this.attacking = false;
	}
}

class Spear extends Weapon {
	constructor(owner) {
		super("spear", owner);
		
		this.coverImage = FRAME.getImage("spearWhite");
		this.coverAlpha = 1.0;
		
		this.extraX = 0;
		this.attackFrames = 35;
	}
	update() {
		super.update();
		
		//relax
		if (this.attacking == false) {
			this.extraX += (0 - this.extraX) * 0.1;
		}
		
		//move spear according to player position and extraX value
		this.y += (this.owner.y+3 - this.y) * 0.3;
		if (this.owner.facingRight == false) {
			this.x += (this.owner.x-38 - this.x) * 0.3 + Math.cos(this.rotation)*this.extraX;
			this.rotation += (Math.PI - this.rotation) * 0.3;
		}
		else if (this.owner.facingRight) {
			this.x += (this.owner.x+38 - this.x) * 0.3 + Math.cos(this.rotation)*this.extraX;
			this.rotation += (0 - this.rotation) * 0.3;
		}
		
		//fade white cover
		if (this.coverAlpha > 0.0) {
			this.coverAlpha -= 0.05;
			if (this.coverAlpha < 0.0)
				this.coverAlpha = 0.0;
		}
	}
	render() {
		super.render();
		this.ctx.globalAlpha = this.coverAlpha;
		this.ctx.drawImage(this.coverImage, -this.displayWidth/2, -this.displayHeight/2, this.displayWidth, this.displayHeight);
		this.ctx.globalAlpha = 1.0;
	}
	strike() {
		this.extraX += (13 - this.extraX) * 0.3;
		if (Math.abs(13 - this.extraX) < 0.1) {
			this.relax();//preferred to just attacking = false;
		}
	}
}

class Sword extends Weapon {
	constructor(owner) {
		super("sword", owner);
		
		this.extraHeight = 0;
		this.extraX = 0;
		this.extraRot = 0;
		
		this.coverImage = FRAME.getImage("swordWhite");
		this.coverAlpha = 1.0;
		this.attackFrames = 40;
		this.swingDown = false;
	}
	update() {
		super.update();
		
		//relax the sword
		if (this.attacking == false) {
			this.extraHeight += (0 - this.extraHeight) * 0.3;
			this.extraX  += (0 - this.extraX) * 0.3;
			this.extraRot += (0 - this.extraRot) * 0.3;
		}
		
		//move sword according to player position and other stuff
		this.y += (this.owner.y+3 - this.y) * 0.3 + this.extraHeight;
		if (this.owner.facingRight == false) {
			this.x += (this.owner.x-38 - this.x) * 0.3 + Math.cos(this.rotation)*this.extraX;
			this.rotation += (Math.PI - this.rotation) * 0.3 + this.extraRot;
		}
		else if (this.owner.facingRight) {
			this.x += (this.owner.x+38 - this.x) * 0.3 + Math.cos(this.rotation)*this.extraX;
			this.rotation += (0 - this.rotation) * 0.3 - this.extraRot;
		}
		
		//fade white cover
		if (this.coverAlpha > 0.0) {
			this.coverAlpha -= 0.05;
			if (this.coverAlpha < 0.0)
				this.coverAlpha = 0.0;
		}
	}
	render() {
		super.render();
		this.ctx.globalAlpha = this.coverAlpha;
		this.ctx.drawImage(this.coverImage, -this.displayWidth/2, -this.displayHeight/2, this.displayWidth, this.displayHeight);
		this.ctx.globalAlpha = 1.0;
	}
	strike() {
		if (this.swingDown == false) {
			this.extraHeight += (-6 - this.extraHeight) * 0.3;
			this.extraX += (-4 - this.extraX) * 0.3;
			this.extraRot += (0.7 - this.extraRot) * 0.3;
			
			if (Math.abs(this.extraRot - 0.7) < 0.01) {
				//this.attacking = false;
				this.swingDown = true;
			}
		}
		else {
			this.extraHeight += (7 - this.extraHeight) * 0.3;
			this.extraX += (3 - this.extraX) * 0.3;
			this.extraRot += (-0.4 - this.extraRot) * 0.3;
			
			if (Math.abs(this.extraRot + 0.4) < 0.01) {
				this.attacking = false;
				this.swingDown = false;
			}
		}
	}
}