/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/



var PHI = 1.618;

var Z_SCALE = .6;

var DRAW_COLLISION_BOUNDRIES = false;

var Z_WIDTH = 114;
var Z_HEIGHT = 306;
var Z_ARM_SOCKET_X = 33;
var Z_ARM_SOCKET_Y = 146;
var Z_HORIZANTAL_POSITION = 2 - PHI;
var Z_FEET_ABOVE_FRAME = 10;

var Z_WALKING_FRAME_SPEED = .16;
var Z_WALKING_FRAMES = 6;
var Z_STANDING_FRAME_SPEED = .55;
var Z_STANDING_FRAMES = 2;

var Z_FALLING_UP_FRAMES = 1;
var Z_FALLING_DOWN_FRAMES = 2;
var Z_FALLING_FRAME_SPEED = .16;

var Z_SOMERSAULT_WIDTH = 462;
var Z_SOMERSAULT_HEIGHT = 306;
var Z_SOMERSAULT_FRAME_SPEED = .1;
var Z_SOMERSAULT_FRAMES = 10;

var Z_SLASH_WIDTH = 558;
var Z_SLASH_HEIGHT = 390;
var Z_SLASH_FRAME_SPEED = .04;
var Z_SLASH_FRAMES = 20;
var Z_ARM_SOCKET_X_SLASH_FRAME = 69;
var Z_ARM_SOCKET_Y_SLASH_FRAME = 230;
var Z_SLASH_RADIUS = 280;
var Z_SLASH_CENTER_X = 202;
var Z_SLASH_CENTER_Y = 110;
var Z_SLASH_INNER_RADIUS = 180;
var Z_SLASH_INNER_CENTER_X = 86;
var Z_SLASH_INNER_CENTER_Y = 20;
var Z_SLASH_START_FRAME = 9;
var Z_SLASH_END_FRAME = 11;

var Z_WALKING_SPEED = 180;
var Z_SOMERSAULT_SPEED = 550;
var FORCE_JUMP_DELTA_Y = -950;
var JUMP_DELTA_Y = -500;
var GRAVITATIONAL_ACCELERATION = 1000;


class Zerlin extends Entity {

	constructor(game) {
		// NOTE: this.x is CENTER of Zerlin, not left side of image. this.y is feet.
		super(game, game.camera.width * ZERLIN_POSITION_ON_SCREEN, 0, 0, 0);

		this.assetManager = game.assetManager;
		this.ctx = game.ctx;
		this.direction = 0; // -1 = left, 0 = still, 1 = right
		this.somersaulting = false;
		this.falling = true;
		this.hits = 0;
		this.faceRight();
		this.lightsaber = new Lightsaber(game, this);
		

		this.temporaryFloorBoundingBox = new BoundingBox(0, 680, 10000, 100); // TODO: remove, switch to platforms

		this.createAnimations();
	}

	update() {
		// check basic movement
		if (this.game.mouse.x + this.game.camera.x < this.x && this.facingRight) {
			this.faceLeft();
		} 
		else if (this.game.mouse.x + this.game.camera.x > this.x && !this.facingRight) {
			this.faceRight();
		}
		else if (!this.game.keys['KeyD'] && !this.game.keys['KeyA']) {
			this.direction = 0;
			if (!this.isInManeuver()) {
				this.deltaX = 0;
			}
		}
		else if (this.game.keys['KeyD'] && this.game.keys['KeyA']) {
			this.direction = 0;
			if (!this.isInManeuver()) {
				this.deltaX = 0;
			}
		}
		else if (this.game.keys['KeyD'] && !this.game.keys['KeyA']) { // TODO: change to constants
			this.direction = 1;
			if (!this.isInManeuver()) {
				this.deltaX = Z_WALKING_SPEED;
			}
		}
		else if (!this.game.keys['KeyD'] && this.game.keys['KeyA']) {
			this.direction = -1;
			if (!this.isInManeuver()) {
				this.deltaX = -Z_WALKING_SPEED;
			}
		}

		// check adding new maneuver
		if (!this.isInManeuver()) {
			if (this.game.keys['KeyC'] && this.direction !== 0 && !this.falling) {
				this.startSomersault();
			}
			else if (this.game.keys['Space'] && this.game.keys['KeyV'] && !this.falling) {
				this.falling = true;
				this.deltaY = FORCE_JUMP_DELTA_Y;
			}
			else if (this.game.keys['Space'] && !this.falling) {
				this.falling = true;
				this.deltaY = JUMP_DELTA_Y;
			}
			else if (this.game.keys['KeyG'] && !this.falling) { // TODO: allow for attack in air
				this.startSlash(); 
			}
		}

		if (this.somersaulting) {
			if (this.isAnimationDone()) {
				this.finishSomersault();
			}
		}
		else if (this.falling) {
			// check if jump is done
				// this.falling = false;

			this.lastBottom = this.boundingbox.bottom;
			this.deltaY += GRAVITATIONAL_ACCELERATION * this.game.clockTick;
		}
		else if (this.slashing) {
			if (this.isAnimationDone()) {
				this.finishSlash();
			} else { // still in slash
				var animation = this.slashingDirection === 1 ? this.slashingAnimation : this.slashingLeftAnimation;
				if (animation.elapsedTime >= Z_SLASH_FRAME_SPEED * Z_SLASH_START_FRAME &&
					animation.elapsedTime < Z_SLASH_FRAME_SPEED * (Z_SLASH_END_FRAME + 1)) {
					this.slashZone.active = true;
				} else {
					this.slashZone.active = false;
				}
			}
		}


		this.x += this.game.clockTick * this.deltaX;
		this.y += this.game.clockTick * this.deltaY;


		// TODO: new bounding box for somersault, left and right
		this.boundingbox.translateCoordinates(this.game.clockTick * this.deltaX, this.game.clockTick * this.deltaY);
		

		// this.handleCollisions();

		this.lightsaber.update();
		// this.lightsaber.handleCollisions();
		
		super.update();
	}

	draw() {
		if (this.somersaulting) {
			this.drawX = this.x - Z_SCALE * (Z_SOMERSAULT_WIDTH / 2);
			if (this.somersaultingDirection === -1) {
				this.animation = this.somersaultingLeftAnimation;
			} else if (this.somersaultingDirection === 1) {
				this.animation = this.somersaultingAnimation;
			}
		}
		else if (this.slashing) {
			if (this.slashingDirection === 1) {
				this.drawX = this.x - Z_ARM_SOCKET_X_SLASH_FRAME * Z_SCALE;
				this.animation = this.slashingAnimation;
			} else if (this.slashingDirection === -1) {
				this.drawX = this.x - (Z_SLASH_WIDTH - Z_ARM_SOCKET_X_SLASH_FRAME) * Z_SCALE;
				this.animation = this.slashingLeftAnimation;
			}
		}
		else if (this.falling) {
			if (this.facingRight) { 
				this.animation = this.deltaY < 0 ? this.fallingUpAnimation : this.fallingDownAnimation;
				this.drawX = this.x - Z_ARM_SOCKET_X * Z_SCALE;
			} else { // facing left
				this.animation = this.deltaY < 0 ? this.fallingUpLeftAnimation : this.fallingDownLeftAnimation;
				this.drawX = this.x - (Z_WIDTH - Z_ARM_SOCKET_X) * Z_SCALE;
			}
		}
		else if (this.facingRight) {
			this.drawX = this.x - Z_ARM_SOCKET_X * Z_SCALE;
			if (this.direction === -1) {
				this.animation = this.moveLeftFaceRightAnimation;
			} else if (this.direction === 0) {
				this.animation = this.standFaceRightAnimation;
			} else if (this.direction === 1) {
				this.animation = this.moveRightFaceRightAnimation;
			}
		} 
		else { // facing left
			this.drawX = this.x - (Z_WIDTH - Z_ARM_SOCKET_X) * Z_SCALE;
			if (this.direction === -1) {
				this.animation = this.moveLeftFaceLeftAnimation;
			} else if (this.direction === 0) {
				this.animation = this.standFaceLeftAnimation;
			} else if (this.direction === 1) {
				this.animation = this.moveRightFaceLeftAnimation;
			}
		}

		this.animation.drawFrame(this.game.clockTick, this.ctx, this.drawX - this.game.camera.x, this.y - this.animation.frameHeight * Z_SCALE);
		this.lightsaber.draw();

		// super.draw();

		if (DRAW_COLLISION_BOUNDRIES) {
			this.ctx.strokeStyle = "black";
			this.ctx.strokeRect(this.boundingbox.x - this.game.camera.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
			this.ctx.strokeRect(this.temporaryFloorBoundingBox.x - this.game.camera.x, this.temporaryFloorBoundingBox.y, this.temporaryFloorBoundingBox.width, this.temporaryFloorBoundingBox.height);
			if (this.slashing && this.slashZone.active) {
				this.ctx.beginPath();
				this.ctx.arc(this.slashZone.outerCircle.x - this.game.camera.x, this.slashZone.outerCircle.y, this.slashZone.outerCircle.radius, 0, Math.PI * 2);
				this.ctx.stroke();
				this.ctx.arc(this.slashZone.innerCircle.x - this.game.camera.x, this.slashZone.innerCircle.y, this.slashZone.innerCircle.radius, 0, Math.PI * 2);
				this.ctx.stroke();
			}
		}

	}

	// updateXandY() {
	//     if (this.somersaulting) {

	//     } 
	//     else if (this.slashing) {

	//     }
	//     else if (this.falling) {

	//     }
	//     else if (this.facingRight) {

	//     }
	// }

	isInManeuver() {
		return this.somersaulting || this.slashing;
	}

	/*
	 * check if animation is done (can't call animation.isDone() because it does not have latest clockTick yet)
	 */
	isAnimationDone() {
		return (this.animation.elapsedTime + this.game.clockTick) >= this.animation.totalTime;
	}

	startSomersault() {
		this.somersaulting = true;
		this.deltaX = Z_SOMERSAULT_SPEED * this.direction;
		this.somersaultingDirection = this.direction;
		// this.x = this.foundationX - Z_SCALE * (Z_SOMERSAULT_WIDTH / 2);
		this.lightsaber.hidden = true;

		// TODO: new bounding box for somersault, left and right
		this.boundingbox = new BoundingBox(this.boundingbox.x, this.y - (Z_HEIGHT - 73) * Z_SCALE, this.boundingbox.width, this.boundingbox.height);
	}

	finishSomersault() {
		this.animation.elapsedTime = 0;
		this.deltaX = 0;
		this.somersaulting = false;
		this.lightsaber.hidden = false;
		
		// // reposition Zerlin (x & y)
		// if (this.facingRight) {
		// 	this.faceRight();
		// } else {
		// 	this.faceLeft();
		// }
		// this.y = TODO: set according to platform ??
	}

	startSlash() {
		this.slashing = true;
		this.deltaX = 0;
		this.lightsaber.hidden = true;
		this.slashingDirection = this.facingRight ? 1 : -1;

		// this.y = this.y + (Z_ARM_SOCKET_Y - Z_ARM_SOCKET_Y_SLASH_FRAME) * Z_SCALE;
		if (this.facingRight) {
			// this.x = this.foundationX - Z_ARM_SOCKET_X_SLASH_FRAME * Z_SCALE;
			this.slashZone = {active: false, 
							  outerCircle: new BoundingCircle(this.x + Z_SLASH_CENTER_X * Z_SCALE, this.y - Z_SLASH_CENTER_Y * Z_SCALE, Z_SLASH_RADIUS * Z_SCALE), 
							  innerCircle: new BoundingCircle(this.x + Z_SLASH_INNER_CENTER_X * Z_SCALE, this.y - Z_SLASH_INNER_CENTER_Y * Z_SCALE, Z_SLASH_INNER_RADIUS * Z_SCALE)}; 
		} else {
			// this.x = this.foundationX - (Z_SLASH_WIDTH - Z_ARM_SOCKET_X_SLASH_FRAME) * Z_SCALE;
			this.slashZone = {active: false,  
							  outerCircle: new BoundingCircle(this.x - Z_SLASH_CENTER_X * Z_SCALE, this.y - Z_SLASH_CENTER_Y * Z_SCALE, Z_SLASH_RADIUS * Z_SCALE), 
							  innerCircle: new BoundingCircle(this.x - Z_SLASH_INNER_CENTER_X * Z_SCALE, this.y - Z_SLASH_INNER_CENTER_Y * Z_SCALE, Z_SLASH_INNER_RADIUS * Z_SCALE)}; 
		}

		// TODO: new bounding box for slash, left and right
		this.boundingbox = new BoundingBox(this.boundingbox.x, this.y - (Z_HEIGHT - 73) * Z_SCALE, this.boundingbox.width, this.boundingbox.height);
	}

	finishSlash() {
		this.animation.elapsedTime = 0;
		this.slashing = false;
		this.lightsaber.hidden = false;

		// if (this.facingRight) {
		// 	this.faceRight();
		// } else {
		// 	this.faceLeft();
		// }
		// this.y = TODO: set according to platform ???
	}

	// handleCollisions() {
	//     if (this.boundingbox.collide(this.temporaryFloorBoundingBox) && this.lastBottom < this.temporaryFloorBoundingBox.top) {
	//         console.log("landed");
	//         this.falling = false;
	//         this.deltaY = 0;
	//         this.y = this.temporaryFloorBoundingBox.top - (Z_HEIGHT - Z_FEET_ABOVE_FRAME) * Z_SCALE;
	//     }
	//     for (var i = 0; i < this.game.lasers.length; i++) {
	//         var laser = this.game.lasers[i];
	//         if ( !laser.isDeflected &&
	//             laser.x > this.boundingbox.left &&
	//             laser.x < this.boundingbox.right &&
	//             laser.y > this.boundingbox.top &&
	//             laser.y < this.boundingbox.bottom) {
	//             laser.removeFromWorld = true;
	//             this.hits++;
	//             console.log(this.hits);
	//         }
	//     }
	// }

	// functions for updating the animation and sprite being used

	faceRight() {
		this.facingRight = true;
		this.boundingbox = new BoundingBox(this.x - (15 * Z_SCALE), this.y - (Z_HEIGHT - 73) * Z_SCALE, (Z_WIDTH - 39) * Z_SCALE, (Z_HEIGHT - 85) * Z_SCALE);
		
	}

	faceLeft() {
		this.facingRight = false;
		this.boundingbox = new BoundingBox(this.x - (Z_WIDTH - 55) * Z_SCALE, this.y - (Z_HEIGHT - 73) * Z_SCALE, (Z_WIDTH - 39) * Z_SCALE, (Z_HEIGHT - 85) * Z_SCALE);
	}


	createAnimations() {
		this.standFaceRightAnimation = new Animation(this.assetManager.getAsset("../img/Zerlin standing.png"), 
												   Z_WIDTH, 
												   Z_HEIGHT, 
												   Z_STANDING_FRAMES * Z_WIDTH, 
												   Z_STANDING_FRAME_SPEED, 
												   Z_STANDING_FRAMES, 
												   true, 
												   Z_SCALE);
		this.standFaceLeftAnimation = new Animation(this.assetManager.getAsset("../img/Zerlin standing left.png"), 
												   Z_WIDTH, 
												   Z_HEIGHT, 
												   Z_STANDING_FRAMES * Z_WIDTH, 
												   Z_STANDING_FRAME_SPEED, 
												   Z_STANDING_FRAMES, 
												   true, 
												   Z_SCALE);
		this.moveRightFaceRightAnimation = new Animation(this.assetManager.getAsset("../img/Zerlin bobbing walking.png"), 
												   Z_WIDTH, 
												   Z_HEIGHT, 
												   Z_WALKING_FRAMES * Z_WIDTH, 
												   Z_WALKING_FRAME_SPEED, 
												   Z_WALKING_FRAMES, 
												   true, 
												   Z_SCALE);
		this.moveRightFaceLeftAnimation = new Animation(this.assetManager.getAsset("../img/Zerlin left backwards bobbing walking.png"),
												   Z_WIDTH, 
												   Z_HEIGHT, 
												   Z_WALKING_FRAMES * Z_WIDTH, 
												   Z_WALKING_FRAME_SPEED, 
												   Z_WALKING_FRAMES, 
												   true, 
												   Z_SCALE);
		this.moveLeftFaceRightAnimation = new Animation(this.assetManager.getAsset("../img/Zerlin backwards bobbing walking.png"), 
												   Z_WIDTH, 
												   Z_HEIGHT, 
												   Z_WALKING_FRAMES * Z_WIDTH, 
												   Z_WALKING_FRAME_SPEED, 
												   Z_WALKING_FRAMES, 
												   true, 
												   Z_SCALE);
		this.moveLeftFaceLeftAnimation = new Animation(this.assetManager.getAsset("../img/Zerlin left bobbing walking.png"), 
												   Z_WIDTH, 
												   Z_HEIGHT, 
												   Z_WALKING_FRAMES * Z_WIDTH, 
												   Z_WALKING_FRAME_SPEED, 
												   Z_WALKING_FRAMES, 
												   true, 
												   Z_SCALE);
		this.fallingUpAnimation = new Animation(this.assetManager.getAsset("../img/Zerlin falling up.png"), 
												   Z_WIDTH, 
												   Z_HEIGHT, 
												   Z_FALLING_UP_FRAMES * Z_WIDTH, 
												   Z_FALLING_FRAME_SPEED, 
												   Z_FALLING_UP_FRAMES, 
												   true, 
												   Z_SCALE);
		this.fallingDownAnimation = new Animation(this.assetManager.getAsset("../img/Zerlin falling down.png"), 
												   Z_WIDTH, 
												   Z_HEIGHT, 
												   Z_FALLING_DOWN_FRAMES * Z_WIDTH, 
												   Z_FALLING_FRAME_SPEED, 
												   Z_FALLING_DOWN_FRAMES, 
												   true, 
												   Z_SCALE);
		this.fallingUpLeftAnimation = new Animation(this.assetManager.getAsset("../img/Zerlin falling up left.png"), 
												   Z_WIDTH, 
												   Z_HEIGHT, 
												   Z_FALLING_UP_FRAMES * Z_WIDTH, 
												   Z_FALLING_FRAME_SPEED, 
												   Z_FALLING_UP_FRAMES, 
												   true, 
												   Z_SCALE);
		this.fallingDownLeftAnimation = new Animation(this.assetManager.getAsset("../img/Zerlin falling down left.png"), 
												   Z_WIDTH, 
												   Z_HEIGHT, 
												   Z_FALLING_DOWN_FRAMES * Z_WIDTH, 
												   Z_FALLING_FRAME_SPEED, 
												   Z_FALLING_DOWN_FRAMES, 
												   true, 
												   Z_SCALE);
		this.somersaultingAnimation = new Animation(this.assetManager.getAsset("../img/Zerlin somersault.png"), 
												   Z_SOMERSAULT_WIDTH, 
												   Z_SOMERSAULT_HEIGHT, 
												   Z_SOMERSAULT_FRAMES * Z_SOMERSAULT_WIDTH, 
												   Z_SOMERSAULT_FRAME_SPEED, 
												   Z_SOMERSAULT_FRAMES, 
												   false, 
												   Z_SCALE);
		this.somersaultingLeftAnimation = new Animation(this.assetManager.getAsset("../img/Zerlin left somersault.png"), 
												   Z_SOMERSAULT_WIDTH, 
												   Z_SOMERSAULT_HEIGHT, 
												   Z_SOMERSAULT_FRAMES * Z_SOMERSAULT_WIDTH, 
												   Z_SOMERSAULT_FRAME_SPEED, 
												   Z_SOMERSAULT_FRAMES, 
												   false, 
												   Z_SCALE);
		this.slashingAnimation = new Animation(this.assetManager.getAsset("../img/Zerlin slash.png"), 
												   Z_SLASH_WIDTH, 
												   Z_SLASH_HEIGHT, 
												   Z_SLASH_FRAMES * Z_SLASH_WIDTH, 
												   Z_SLASH_FRAME_SPEED, 
												   Z_SLASH_FRAMES, 
												   false, 
												   Z_SCALE);
		this.slashingLeftAnimation = new Animation(this.assetManager.getAsset("../img/Zerlin slash left.png"), 
												   Z_SLASH_WIDTH, 
												   Z_SLASH_HEIGHT, 
												   Z_SLASH_FRAMES * Z_SLASH_WIDTH, 
												   Z_SLASH_FRAME_SPEED, 
												   Z_SLASH_FRAMES, 
												   false, 
												   Z_SCALE);
	}
}



var LS_UP_IMAGE_WIDTH = 126;
var LS_UP_IMAGE_HEIGHT = 204;
var LS_DOWN_IMAGE_WIDTH = 126;
var LS_DOWN_IMAGE_HEIGHT = 198;

var LS_UP_COLLAR_X = 114; // 114 for outer edge of blade, 111 for center of blade
var LS_UP_COLLAR_Y = 162;
var LS_DOWN_COLLAR_X = 114;
var LS_DOWN_COLLAR_Y = 35;
var LS_UP_TIP_X = 114;
var LS_UP_TIP_Y = 5;
var LS_DOWN_TIP_X = 114;
var LS_DOWN_TIP_Y = 192;

var LS_RIGHT_X_AXIS = 10;
var LS_LEFT_X_AXIS = 10;
var LS_UP_Y_AXIS = 147;
var LS_DOWN_Y_AXIS = 51;


class Lightsaber extends Entity {

	constructor(game, Zerlin) {
		super(game, 
				0, 0, // will be set in faceRightUpSaber()
				0, 0);
		this.assetManager = game.assetManager;
		this.ctx = game.ctx;
		this.angle = 0;
		this.Zerlin = Zerlin;
		this.hidden = false;
		this.setUpSaberImages();
		this.faceRightUpSaber();
		this.updateCollisionLine();



		// this.bladeCollar = { x: 500, y: 200};
		// this.bladeTip = { x: 200, y: 500};

		// for debugging

	}

	update() {
		this.x = this.Zerlin.x;
		this.y = this.Zerlin.y - (Z_HEIGHT - Z_ARM_SOCKET_Y) * Z_SCALE;
		// rotate 
		if (this.game.mouse) {
			 // TODO: rotateAndCache if mouse not moved
			this.angle = Math.atan2(this.game.mouse.y - this.y, this.game.mouse.x + this.game.camera.x - this.x);

			// change sprite on any of these conditions 
			// TODO: consolidate logic here
			if (this.game.mouse.x + this.game.camera.x < this.Zerlin.x && this.facingRight) {
				if (this.saberUp) {
					this.faceLeftUpSaber();
				} else {
					this.faceLeftDownSaber();
				}        
			} 
			else if (this.game.mouse.x + this.game.camera.x > this.Zerlin.x && !this.facingRight) {
				if (this.saberUp) {
					this.faceRightUpSaber();
				} else {
					this.faceRightDownSaber();
				}
			} 
			else if (this.game.rightClickDown && this.saberUp) {
				if (this.game.mouse.x + this.game.camera.x < this.Zerlin.x) {
					this.faceLeftDownSaber();
				} else {
					this.faceRightDownSaber();
				}        
			} else if (!this.game.rightClickDown && !this.saberUp) {
				if (this.game.mouse.x + this.game.camera.x < this.Zerlin.x) {
					this.faceLeftUpSaber();
				} else {
					this.faceRightUpSaber();
				}
			}

		}

		this.updateCollisionLine();

		super.update();
	}

	draw() {
		if (!this.hidden) {
			this.ctx.save();
			this.ctx.translate(this.x - this.game.camera.x, this.y);
			this.ctx.rotate(this.angle);
			this.ctx.drawImage(this.image,
							   0,
							   0,
							   this.width,
							   this.height,
							   -(this.armSocketX * Z_SCALE), // is this correct?
							   -(this.armSocketY * Z_SCALE),
							   Z_SCALE * this.width,
							   Z_SCALE * this.height);
			this.ctx.restore();
		}
		if (DRAW_COLLISION_BOUNDRIES) {
			this.ctx.save();
			this.ctx.strokeStyle = "black";
			this.ctx.beginPath();
			this.ctx.moveTo(this.bladeCollar.x - this.game.camera.x, this.bladeCollar.y);
			this.ctx.lineTo(this.bladeTip.x - this.game.camera.x, this.bladeTip.y);
			this.ctx.stroke();
			this.ctx.closePath();
			this.ctx.restore();
		}
		super.draw();
	}

	saberSlope() {
		return (this.bladeCollar.y - this.bladeTip.y) / (this.bladeCollar.x - this.bladeTip.x);
	}

	getSaberAngle() {
		// return this.angle + Math.PI / 2;
		return Math.atan2(this.bladeCollar.y - this.bladeTip.y, this.bladeCollar.x - this.bladeTip.x);
	}

	updateCollisionLine() {
		var cosine = Math.cos(this.angle);
		var sine = Math.sin(this.angle);

		var collarXrotated = this.collarXfromSocket * cosine - this.collarYfromSocket * sine;
		var collarYrotated = this.collarYfromSocket * cosine + this.collarXfromSocket * sine;

		var tipXrotated = this.tipXfromSocket * cosine - this.tipYfromSocket * sine;
		var tipYrotated = this.tipYfromSocket * cosine + this.tipXfromSocket * sine;

		this.prevBladeCollar = this.bladeCollar;
		this.prevBladeTip = this.bladeTip;
		this.bladeCollar = { x: collarXrotated * Z_SCALE + this.x, y: collarYrotated * Z_SCALE + this.y };
		this.bladeTip = { x: tipXrotated * Z_SCALE + this.x, y: tipYrotated * Z_SCALE + this.y };
	}

	faceRightUpSaber() {
		this.image = this.faceRightUpSaberImage;
		this.width = LS_UP_IMAGE_WIDTH;
		this.height = LS_UP_IMAGE_HEIGHT;
		this.armSocketX = LS_RIGHT_X_AXIS;
		this.armSocketY = LS_UP_Y_AXIS;

		this.collarXfromSocket = LS_UP_COLLAR_X - LS_RIGHT_X_AXIS;
		this.collarYfromSocket = LS_UP_COLLAR_Y - LS_UP_Y_AXIS;
		this.tipXfromSocket = LS_UP_TIP_X - LS_RIGHT_X_AXIS;
		this.tipYfromSocket = LS_UP_TIP_Y - LS_UP_Y_AXIS;

		this.facingRight = true;
		this.saberUp = true;
	}

	faceLeftUpSaber() {
		this.image = this.faceLeftUpSaberImage;
		this.width = LS_UP_IMAGE_WIDTH;
		this.height = LS_UP_IMAGE_HEIGHT;
		this.armSocketX = LS_LEFT_X_AXIS;
		this.armSocketY = this.height - LS_UP_Y_AXIS;

		this.collarXfromSocket = LS_UP_COLLAR_X - LS_LEFT_X_AXIS;
		this.collarYfromSocket = LS_UP_Y_AXIS - LS_UP_COLLAR_Y;
		this.tipXfromSocket = LS_UP_TIP_X - LS_RIGHT_X_AXIS;
		this.tipYfromSocket = LS_UP_Y_AXIS - LS_UP_TIP_Y;

		this.facingRight = false;
		this.saberUp = true;
	}

	faceRightDownSaber() {
		this.image = this.faceRightDownSaberImage;
		this.width = LS_DOWN_IMAGE_WIDTH;
		this.height = LS_DOWN_IMAGE_HEIGHT;
		this.armSocketX = LS_RIGHT_X_AXIS;
		this.armSocketY = LS_DOWN_Y_AXIS;

		this.collarXfromSocket = LS_DOWN_COLLAR_X - LS_RIGHT_X_AXIS;
		this.collarYfromSocket = LS_DOWN_COLLAR_Y - LS_DOWN_Y_AXIS;
		this.tipXfromSocket = LS_DOWN_TIP_X - LS_RIGHT_X_AXIS;
		this.tipYfromSocket = LS_DOWN_TIP_Y - LS_DOWN_Y_AXIS;

		this.facingRight = true;
		this.saberUp = false;
	}

	faceLeftDownSaber() {
		this.image = this.faceLeftDownSaberImage;
		this.width = LS_DOWN_IMAGE_WIDTH;
		this.height = LS_DOWN_IMAGE_HEIGHT;
		this.armSocketX = LS_LEFT_X_AXIS;
		this.armSocketY = this.height - LS_DOWN_Y_AXIS;

		this.collarXfromSocket = LS_DOWN_COLLAR_X - LS_LEFT_X_AXIS;
		this.collarYfromSocket = LS_DOWN_Y_AXIS - LS_DOWN_COLLAR_Y;
		this.tipXfromSocket = LS_DOWN_TIP_X - LS_LEFT_X_AXIS;
		this.tipYfromSocket = LS_DOWN_Y_AXIS - LS_DOWN_TIP_Y;

		this.facingRight = false;
		this.saberUp = false;
	}

	setUpSaberImages() {
		this.faceRightUpSaberImage = this.assetManager.getAsset("../img/Lightsaber with point of rotation drawn.png");
		this.faceLeftUpSaberImage = this.assetManager.getAsset("../img/Lightsaber with point of rotation drawn left.png");
		this.faceRightDownSaberImage = this.assetManager.getAsset("../img/lightsaber upside down.png");
		this.faceLeftDownSaberImage = this.assetManager.getAsset("../img/lightsaber upside down left.png");
	}
}


