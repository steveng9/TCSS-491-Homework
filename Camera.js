/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/




var ZERLIN_POSITION_ON_SCREEN = .382; // = (1 - 1/PHI)
var BUFFER = 20;

class Camera {

	constructor(game, startX, startY, width, height) {
		this.game = game;
		this.x = startX;
		this.y = startY;
		this.width = width;
		this.height = height;
		this.parallaxManager = new ParallaxBackgroundManager(game, this);
	}

	update() {
		this.x = this.game.Zerlin.x - ZERLIN_POSITION_ON_SCREEN * this.width;
		this.parallaxManager.update();
	}

	draw() {
		this.parallaxManager.draw();
	}

	isInView(entity, width, height) { // TODO: verify sure things are not drawn when not in view
		return entity.x + width + BUFFER > this.x &&
			   entity.x - BUFFER < this.x + this.width &&
			   entity.y + height + BUFFER > this.y &&
			   entity.y - BUFFER < this.y + this.height;
	}

}


//add a method to change out the background images we are looping through
/**
 * Manage and animate backgrounds.
 */
class ParallaxBackgroundManager { 
    
    constructor(game, camera) {
    	this.game = game;
    	this.camera = camera;
        this.parralaxBackgroundLayers = [];

	    this.addBackgroundLayer(
	        new ParallaxRotatingBackground(game, game.assetManager.getAsset('./img/New Piskel.png'), 1, camera));
	    this.addBackgroundLayer(
	        new ParallaxScrollBackground(game, game.assetManager.getAsset('./img/New Piskel (1).png'), 1, camera, 5000));
	    this.addBackgroundLayer(
	        new ParallaxScrollBackground(game, game.assetManager.getAsset('./img/New Piskel (2).png'), 1, camera, 2500));
	    this.addBackgroundLayer(
	        new ParallaxScrollBackground(game, game.assetManager.getAsset('./img/New Piskel (3).png'), 1, camera, 1200));
        this.addBackgroundLayer(
            new ParallaxScrollBackground(game, game.assetManager.getAsset('./img/New Piskel (4).png'), 1, camera, 300));
    }

    addBackgroundLayer(background) {
    	// background.game = this.game;
        this.parralaxBackgroundLayers.push(background);
    }

    update() {
        this.parralaxBackgroundLayers.forEach(layer => {
        	layer.update();
        });
    }

    draw() {
        this.parralaxBackgroundLayers.forEach(layer => {
        	layer.draw();
        });
    }
}

/*
 * An individual image to be drawn with its follower.
 */
class ParallaxScrollBackground extends Entity {  

    constructor(game, backgroundImage, scale, camera, distanceFromCamera) {
        super(game, 0, 0, 0, 0);
        this.scale = scale; // TODO: integrate scale of image
        this.backgroundImage = backgroundImage;
        this.imageWidth = backgroundImage.width;
        this.camera = camera;

        console.assert(this.imageWidth >= this.camera.width, "Image width must be larger than camera width!");
        console.assert(this.backgroundImage.height >= this.camera.height, "Image height must be larger than camera height!");
        this.distanceFromCamera = distanceFromCamera;

        this.ctx = game.ctx;
        this.imageDistanceFromX = 0;
    }

    update() { 
    	// simulates slower movement for further distances
        this.x = this.camera.x - (this.camera.x * 100 / this.distanceFromCamera);

    	// x moves slower than camera, so update how far image is drawn from x to "keep up" with camera.
        if (this.imageDistanceFromX + (2 * this.imageWidth) + this.x < this.camera.x + this.camera.width) {
        	this.imageDistanceFromX = this.imageDistanceFromX + this.imageWidth;
        } 
        else if (this.imageDistanceFromX + this.x > this.camera.x) {
        	this.imageDistanceFromX = this.imageDistanceFromX - this.imageWidth;
        }
    }

    draw() {
        this.ctx.drawImage(this.backgroundImage, this.imageDistanceFromX + this.x - this.camera.x, this.y); 
        this.ctx.drawImage(this.backgroundImage, this.imageDistanceFromX + this.x + this.imageWidth - this.camera.x, this.y);
    }
}


class ParallaxRotatingBackground extends Entity { 

    constructor(game, backgroundImage, scale, camera) {
        super(game, 0, 0, 0, 0);
        this.scale = scale; // TODO: integrate scale of image
        this.backgroundImage = backgroundImage;
        this.imageWidth = backgroundImage.width;
        this.imageHeight = backgroundImage.height;
        this.camera = camera;
        this.angle = 0;

        console.assert(this.imageWidth >= this.camera.width, "Image width must be larger than camera width!");
        console.assert(this.backgroundImage.height >= this.camera.height, "Image height must be larger than camera height!");

        this.ctx = game.ctx;
        this.imageDistanceFromX = 0;
    }

    update() { 
        this.angle += this.game.clockTick * 2 * Math.PI / 200;
    }

    draw() {

        this.ctx.save();
        this.ctx.translate(this.camera.width / 2, this.camera.height / 2);
        this.ctx.rotate(this.angle);

        this.ctx.drawImage(this.backgroundImage, 
                           0,
                           0, 
                           this.imageWidth,
                           this.imageHeight,
                           -this.imageWidth / 2, 
                           -this.imageHeight / 2,
                           this.imageWidth,
                           this.imageHeight); 
        this.ctx.restore();
    }

}



class ParallaxAnimatedBackground extends Entity { 

}



class ParallaxFunctionalBackground extends Entity { 

}



