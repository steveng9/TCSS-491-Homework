/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/




/*
 * Detects and handles collisions for game entities.
 */
class CollisionManager {

	constructor(game) {
		this.game = game;
	}

	handleCollisions() {
		// called in game engine on every update()
		this.droidOnDroid();
		this.droidOnSaber();
		this.laserOnDroid();
		this.laserOnSaber();
		this.laserOnZerlin();
		this.ZerlinOnPlatform();
	}

	droidOnDroid() {

	}

	droidOnSaber() {
		var zerlin = this.game.Zerlin;
		if (zerlin.slashing && zerlin.slashZone.active) {
			for (var i = this.game.droids.length - 1; i >= 0; i--) {
				var droid = this.game.droids[i];
				// check if droid in circular path of saber and not below zerlin
				if (collidePointWithCircle(droid.boundCircle.x, 
										   droid.boundCircle.y, 
										   zerlin.slashZone.outerCircle.x, 
										   zerlin.slashZone.outerCircle.y, 
										   zerlin.slashZone.outerCircle.radius)
					&& !collidePointWithCircle(droid.boundCircle.x, 
										   droid.boundCircle.y, 
										   zerlin.slashZone.innerCircle.x, 
										   zerlin.slashZone.innerCircle.y, 
										   zerlin.slashZone.innerCircle.radius)
					&& droid.boundCircle.y < zerlin.y) {
					droid.explode();
					console.log(zerlin.y + (zerlin.animation.frameHeight * zerlin.animation.scale));
				}
			}	
		}
	}

	laserOnDroid() {
		for (var i = this.game.lasers.length - 1; i >= 0; i--) {
			if (this.game.lasers[i].isDeflected) {
				for (var j = this.game.droids.length - 1; j >= 0; j--) {
					if (this.isLaserCollidedWithDroid(this.game.lasers[i], this.game.droids[j])) {
						this.game.droids[j].explode();
					}
				}
			}
		}
	}

	laserOnSaber() {
		if (!this.game.Zerlin.lightsaber.hidden) {
			for (var i = this.game.lasers.length - 1; i >= 0; i--) {
				var laser = this.game.lasers[i];
				if (!laser.isDeflected) {
					var collision = this.isCollidedWithSaber(laser);
					if (collision.collided) {
						this.deflectLaser(laser, collision.intersection);    
					}
				}
			}
		}
	}

	laserOnZerlin() {
		var zerlin = this.game.Zerlin;
		for (var i = 0; i < this.game.lasers.length; i++) {
			var laser = this.game.lasers[i];
			if ( !laser.isDeflected &&
				laser.x > zerlin.boundingbox.left &&
				laser.x < zerlin.boundingbox.right &&
				laser.y > zerlin.boundingbox.top &&
				laser.y < zerlin.boundingbox.bottom) {
				laser.removeFromWorld = true;
				zerlin.hits++;
				// console.log(zerlin.hits);
			}
		}
	}

	ZerlinOnPlatform() {
		var zerlin = this.game.Zerlin;
		if (zerlin.falling && zerlin.boundingbox.collide(zerlin.temporaryFloorBoundingBox) && zerlin.lastBottom < zerlin.temporaryFloorBoundingBox.top) {
			console.log("landed");
			zerlin.falling = false;
			zerlin.deltaY = 0;
			zerlin.y = zerlin.temporaryFloorBoundingBox.top + Z_FEET_ABOVE_FRAME * Z_SCALE;
		}

		// TODO: check Zerlin on platform when not falling (walks over edge)
	}


	isLaserCollidedWithDroid(laser, droid) {
		return collideLineWithCircle(laser.x, laser.y, laser.tailX, laser.tailY, droid.boundCircle.x,
									droid.boundCircle.y, droid.boundCircle.radius);
	}

	// helper functions

	isCollidedWithSaber(laser) {
		var lightsaber = this.game.Zerlin.lightsaber;
		var laserP1 = {x: laser.x, y: laser.y};
		var laserP2 = {x: laser.prevX, y: laser.prevY};

		// decrease miss percentage by also checking previous blade
		var collidedWithCurrentBlade = this.isCollidedLineWithLine({p1: laserP1, p2: laserP2}, 
																	{p1: lightsaber.bladeCollar, p2: lightsaber.bladeTip});
		var collidedWithPreviousBlade = this.isCollidedLineWithLine({p1: laserP1, p2: laserP2}, 
																	{p1: lightsaber.prevBladeCollar, p2: lightsaber.prevBladeTip});

		return {collided: collidedWithCurrentBlade.collided || collidedWithPreviousBlade.collided, 
				intersection: collidedWithCurrentBlade.intersection};
	}

	isCollidedLineWithLine(line1, line2) {
		// TODO: possibly change segment intersection using clockwise check (more elegant)
		var m1 = this.calcSlope(line1.p1, line1.p2);
		var b1 = line1.p1.y - m1 * line1.p1.x;
		var m2 = this.calcSlope(line2.p1, line2.p2);
		var b2 = line2.p2.y - m2 * line2.p2.x;

		var parallel = m1 === m2;
		if (!parallel) {
			var intersection = {};
			intersection.x = (b2 - b1) / (m1 - m2);
			intersection.y = m1 * intersection.x + b1;
			var isCollided = this.isPointOnSegment(intersection, line1) 
							&& this.isPointOnSegment(intersection, line2);
			return {collided: isCollided, intersection: intersection};
		} else { // can't collide if parallel.
			return false;
		}
	}
	calcSlope(p1, p2) {
		return (p1.y - p2.y) / (p1.x - p2.x);
	}
	isPointOnSegment(pt, segment) {
		return (pt.x >= Math.min(segment.p1.x, segment.p2.x))
			&& (pt.x <= Math.max(segment.p1.x, segment.p2.x))
			&& (pt.y >= Math.min(segment.p1.y, segment.p2.y))
			&& (pt.y <= Math.max(segment.p1.y, segment.p2.y));
	}
	deflectLaser(laser, collisionPt) {
		laser.isDeflected = true;

		var zerlin = this.game.Zerlin;
		laser.angle = 2 * zerlin.lightsaber.getSaberAngle() - laser.angle;
		laser.deltaX = Math.cos(laser.angle) * laser.speed + zerlin.deltaX;
		laser.deltaY = Math.sin(laser.angle) * laser.speed + zerlin.deltaY;
		// TODO: prevent rare ultra slow lasers
		laser.slope = laser.deltaY / laser.deltaX;

		// move laser so tail is touching the deflection point, instead of the head
		var deltaMagnitude = Math.sqrt(Math.pow(laser.deltaX, 2) + Math.pow(laser.deltaY, 2));
		laser.tailX = collisionPt.x;
		laser.tailY = collisionPt.y;
		laser.x = laser.tailX + laser.deltaX / deltaMagnitude * laser.length;
		laser.y = laser.tailY + laser.deltaY / deltaMagnitude * laser.length;
		// laser.angle = this.findAngle(this.x, this.y, this.tailX, this.tailY);
	}

}

class BoundingBox {

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.left = x;
        this.top = y;
        this.right = x + width;
        this.bottom = y + height;
    }

    collide(oth) {
        if ((this.right > oth.left)
         && (this.left < oth.right) 
         && (this.top < oth.bottom) 
         && (this.bottom > oth.top)) {
            return true;
        }
        return false;
    }

    updateCoordinates(x, y) {
        this.x = x;
        this.y = y;

        this.left = x;
        this.top = y;
        this.right = x + this.width;
        this.bottom = y + this.height;
    }

    translateCoordinates(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;
        this.left += deltaX;
        this.top += deltaY;
        this.right += deltaX;
        this.bottom += deltaY;
    }

}

class BoundingCircle {

    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
}

/**
 * function that will calculate the distance between point a and point b.
 * both arguments need to have x and y prototype or field
 */
var distance = function(a, b) {
	return Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2));
}

/* START OF COLLISION FUNCTIONS */

/**
 * This method will return a boolean if the the circles collide.
 * @param {number} cx1 circle 1 x cord
 * @param {number} cy1 ''
 * @param {number} cr1 circle 1 radius
 * @param {number} cx2 circle 2 x cord
 * @param {number} cy2 ''
 * @param {number} cr2 circle 2 radius
 */
var collideCircleWithCircle = function(cx1, cy1, cr1, cx2, cy2, cr2) {
	result = false;
	//get distance between circles
	var dist = distance({x: cx1, y: cy1}, {x: cx2, y: cy2});

	//compare distance with the sum of the radii
	if (dist <= cr1 + cr2) {
		result = true;
	}
	return result;
}

/**
 * Function that will check the if the line segment has any point along
 * the line segment inside the radius of the circle.
 * @param {number} x1 is the x cord of end point of line
 * @param {number} y1 ''
 * @param {number} x2 is the x cord of another end point of line
 * @param {number} y2 ''
 * @param {number} cx circle x locations
 * @param {number} cy ''
 * @param {number} r  radius of circle
 */
var collideLineWithCircle = function(x1, y1, x2, y2, cx, cy, r) {
	//Check if either end point is in the circle, if so, return right away
	inside1 = collidePointWithCircle(x1, y1, cx, cy, r);
	inside2 = collidePointWithCircle(x2, y2, cx, cy, r);
	if (inside1 || inside2) return true;

	//get length of the line
	var length = distance({x: x1, y: y1}, {x: x2, y: y2});

	//get dot product of line and circle
	var dot = (((cx - x1) * (x2 - x1)) + ((cy - y1) * (y2 - y1))) / Math.pow(length, 2);

	//find closest point on line to the circle
	var closestX = x1 + (dot * (x2 - x1));
	var closestY = y1 + (dot * (y2 - y1));

	//check if the point is on the line segment
	var onSegment = collidePointWithLine(x1, y1, x2, y2, closestX, closestY);
	if (!onSegment) return false;

	//get distance to the closest point from circle
	var dist = distance({x: closestX, y: closestY}, {x: cx, y: cy});

	if (dist <= r) {
		return true;
	}
	return false;

}

/**
 * This function will check to see if a point is on a line segment
 * @param {number} x1 is the start x cord of the line segment
 * @param {number} y1 ''
 * @param {number} x2 is the end x cord of the line segment
 * @param {number} y2 ''
 * @param {number} px is the point x cord to compare with the line segment
 * @param {number} py ''
 */
var collidePointWithLine = function(x1, y1, x2, y2, px, py) {
	//get distance between endpoints and point
	var distance1 = distance({x: x1, y: y1}, {x: px, y: py});
	var distance2 = distance({x: x2, y: y2}, {x: px, y: py});
	//get distance of line
	var lineDist = distance({x: x1, y: y1}, {x: x2, y: y2});

	//because of accuracy of floats, define a buffer of collision
	var buffer = 0.1 //higher # = less accurate

	//if the 2 distances are equal to the line length, then the point is on the line
	//use buffer to give a range of collision
	if (distance1 + distance2 >= lineDist - buffer && distance1 + distance2 <= lineDist + buffer) {
		return true;
	}
	return false;
}

/**
 * This function will check if the point is inside the radius of the circle
 * @param {number} px is the x value of a point
 * @param {number} py is the y value of a point
 * @param {number} cx is the x value of the circle origin
 * @param {number} cy ''
 * @param {number} r is the radius of the circle
 */
var collidePointWithCircle = function(px, py, cx, cy, r) {
	var result = false;
	//get distance between point and circle with pythagorean theroem
	var dist = distance({x: px, y: py}, {x: cx, y: cy});
	//if distance is less than r, than there is a collision
	if (dist <= r) {
		result = true;
	}
	return result;

}

/**
 * This function will calculate if there is a collision on the line segment
 * and will also give the point of intersection.
 * @param {number} x1 Line 1 Endpoint 1 x cord
 * @param {number} y1 ''
 * @param {number} x2 Line 1 Endpoint 2 x cord
 * @param {number} y2 ''
 * @param {number} x3 Line 2 Endpoint 1 x cord
 * @param {number} y3 ''
 * @param {number} x4 Line 2 Endpoint 2 x cord
 * @param {number} y4 ''
 * @return object {collides: boolean, x: intersectionX, y: intersectionY}
 */
var collideLineWithLine = function(x1, y1, x2, y2, x3, y3, x4, y4) {
	var result = {collides: false, x: 0, y: 0};
	//calculate the distance to the intersection point
	var uA = ((x4  -x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
	var uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

	// if uA and uB is between 0-1, then the lines collide.
	if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
		//intersection points
		var intX = x1 + (uA * (x2 - x1));
		var intY = y1 + (uA * (y2 - y1));
		result.collides = true;
		result.x = intX;
		result.y = intY;
	}
	return result;

}
var collideLineWithLineHelper = function(line1, line2) {
	return collideLineWithLine(line1.p1.x, line1.p1.y, line1.p2.x, line1.p2.y, line2.p1.x, line2.p1.y, line2.p2.x, line2.p2.y).collides;
}

/**
 * This function will return a boolean if the line segment collides with 
 * the rectangle
 * @param {number} x1 is an endpoint 1x cord
 * @param {number} y1 ''
 * @param {number} x2 is endpoint 2 line segment x cord
 * @param {number} y2 ''
 * @param {number} rx rectangle x cordinate (top left)
 * @param {number} ry rectangle y cordinate (top left)
 * @param {number} rw rectangle width
 * @param {number} rh rectangle height
 */
var collideLineWithRectangle = function(x1, y1, x2, y2, rx, ry, rw, rh) {
	var result = false;
	//check collision of line segment with each side of the rectangle
	var left = collideLineWithLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
	var right = collideLineWithLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
	var top = collideLineWithLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
	var bottom = collideLineWithLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);

	if (left.collides || right.collides || top.collides || bottom.collides) {
		result = true;
	}
	//can return the object with intersection point if need to.
	return result;
}

/**
 * 
 * @param {number} cx is the center of circle x cord
 * @param {number} cy ''
 * @param {number} cr is the circle radius
 * @param {number} rx is the rectangle x cord
 * @param {number} ry is the top left rectangle y cord
 * @param {number} rw is the width of the rectangle
 * @param {number} rh is the height of the rectangle
 */
var collideCircleWithRectangle = function(cx, cy, cr, rx, ry, rw, rh) {
	var result = false;
	//temp variables to set edges for testing
	var testX = cx;
	var testY = cy;

	//calculate which edge is the closest.
	if (cx < rx) testX = rx; //test left edge
	else if (cx > rx + rw) testX = rx + rw; //test right edge
	if (cy < ry) testY = ry; // test top edge
	else if (cy > ry + rh) testY = ry + rh; //test bottom edge

	//get distance from closest edge
	var dist = distance({x: cx, y: cy}, {x: testX, y: testY});

	//if distance is less than circle radius then there is a collision.
	if (dist <= cr) {
		result = true;
	}
	return result;
}
