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








