/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/



/*
 * Animate spriteSheets.
 */
class Animation {
	constructor(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
		this.spriteSheet = spriteSheet;
		this.frameWidth = frameWidth;
		this.frameDuration = frameDuration;
		this.frameHeight = frameHeight;
		this.sheetWidth = sheetWidth;
		this.frames = frames;
		this.totalTime = frameDuration * frames;
		this.elapsedTime = 0;
		this.loop = loop;
		this.scale = scale;
	}
	drawFrame(tick, ctx, x, y) {
		this.elapsedTime += tick;
		if (this.isDone()) { // TODO: fix bug with finishing one frame early/late mentioned in class (1/15/19)
			if (this.loop) {
				this.elapsedTime = this.elapsedTime - this.totalTime;
			}
			else {
				// finish animation, remove from screen? set next animation? return?
			}
		}
		var frame = this.currentFrame();
		var xIndex = 0;
		var yIndex = 0;
		xIndex = frame % this.sheetWidth;
		yIndex = Math.floor(frame / this.sheetWidth);
		ctx.drawImage(this.spriteSheet, xIndex * this.frameWidth, yIndex * this.frameHeight, this.frameWidth, this.frameHeight, x, y, this.frameWidth * this.scale, this.frameHeight * this.scale);
	}
	currentFrame() {
		return Math.floor(this.elapsedTime / this.frameDuration);
	}
	isDone() {
		return (this.elapsedTime >= this.totalTime);
	}
}


// /**
//  * Tile manager. //not implemented
//  */
// class TileManager extends Entity {
//     constructor(game, tileArray) {
//         super(game, 0, 0, 0, 0);
//         this.leftCornerTile = tileArray[0];
//         this.centerTile = tileArray[1];
//         this.rightTile = tileArray[3];
//         // this.bottomFillerTile = tileArray[4];
//     }
// }
// //Draw a tile of given size.
// class Tile extends Entity {
//     constructor(game, image, startX, startY, tileArray) {
//         super(game, image, startX, startY, 0, 0);
//         this.leftCornerTile = tileArray[0];
//         this.centerTile = tileArray[1];
//         this.rightTile = tileArray[2];
//         this.ctx = game.ctx;
//     }
//     update() {

//     }
//     draw() { //code this with a loop to draw whatever length platform the user wants
//         this.ctx.drawImage(this.leftCornerTile, 40, 640); 
//         this.ctx.drawImage(this.centerTile, 100, 640); 
//         this.ctx.drawImage(this.centerTile, 160, 640);
//         this.ctx.drawImage(this.centerTile, 220, 640); 
//         this.ctx.drawImage(this.centerTile, 280, 640);  
//         this.ctx.drawImage(this.rightTile, 340, 640); 
//     }

// }







