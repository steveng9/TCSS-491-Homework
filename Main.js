/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

/**
 * Manage all assets for this game.
 */
class AssetManager {
    constructor() {
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = [];
        this.downloadQueue = [];
    }
    queueDownload(path) {
        console.log("Queueing " + path);
        this.downloadQueue.push(path);
    }
    isDone() {
        return this.downloadQueue.length === this.successCount + this.errorCount;
    }
    downloadAll(callback) {
        for (var i = 0; i < this.downloadQueue.length; i++) {
            var img = new Image();
            var that = this;
            var path = this.downloadQueue[i];
            console.log(path);
            img.addEventListener("load", function () {
                console.log("Loaded " + this.src);
                that.successCount++;
                if (that.isDone())
                    callback();
            });
            img.addEventListener("error", function () {
                console.log("Error loading " + this.src);
                that.errorCount++;
                if (that.isDone())
                    callback();
            });
            img.src = path;
            this.cache[path] = img;
        }
    }
    getAsset(path) {
        return this.cache[path];
    }
}

/**
 * Driver function to load all assets for the game and launch 
 * the game after completion.
 */
(function () {
	var AM = new AssetManager();

	//AM.queueDownload("../img/basic_droid.png");
	AM.queueDownload("../img/Explosion.png");

	AM.queueDownload("../img/Zerlin bobbing walking.png");
	AM.queueDownload("../img/Zerlin left bobbing walking.png");
	AM.queueDownload("../img/Zerlin backwards bobbing walking.png");
	AM.queueDownload("../img/Zerlin left backwards bobbing walking.png");
	AM.queueDownload("../img/Zerlin standing.png");
	AM.queueDownload("../img/Zerlin standing left.png");
	AM.queueDownload("../img/Zerlin somersault.png");
	AM.queueDownload("../img/Zerlin left somersault.png");
	AM.queueDownload("../img/Zerlin falling up.png");
	AM.queueDownload("../img/Zerlin falling down.png");
	AM.queueDownload("../img/Zerlin falling up left.png");
	AM.queueDownload("../img/Zerlin falling down left.png");
	AM.queueDownload("../img/Zerlin slash.png");
	AM.queueDownload("../img/Zerlin slash left.png");

	AM.queueDownload("../img/Lightsaber with point of rotation drawn.png");
	AM.queueDownload("../img/Lightsaber with point of rotation drawn left.png");
	AM.queueDownload("../img/lightsaber upside down.png");
	AM.queueDownload("../img/lightsaber upside down left.png");

	AM.queueDownload("../img/backgroundStars.png");
	AM.queueDownload("../img/backgroundTrees1.png");
	AM.queueDownload("../img/backgroundTrees2.png");
	AM.queueDownload("../img/backgroundTrees3.png");
	AM.queueDownload("../img/backgroundTrees4.png");
	AM.queueDownload("../img/droid-j-row.png");

	AM.queueDownload("../img/forestLeftTile.png"); //tiles are 60x60
	AM.queueDownload("../img/forestMiddleTile.png");
	AM.queueDownload("../img/forestRightTile.png");

	AM.downloadAll(function () {
	    var canvas = document.getElementById("gameWorld");
	    var ctx = canvas.getContext("2d");

	    var gameEngine = new GameEngine(AM);
	    gameEngine.init(ctx);

	    // const parallaxBackgroundManager = new ParallaxBackgroundManager(gameEngine); 
	    // parallaxBackgroundManager.addBackgroundImage(
	    //     new ParallaxBackground(gameEngine, AM.getAsset('../img/backgroundTrees4.png'), 
	    //     10, 0, 0));
	    // parallaxBackgroundManager.addBackgroundImage(
	    //     new ParallaxBackground(gameEngine, AM.getAsset('../img/backgroundStars.png'), 
	    //     20, 0, 0));
	    // parallaxBackgroundManager.addBackgroundImage(
	    //     new ParallaxBackground(gameEngine, AM.getAsset('../img/backgroundTrees3.png'), 
	    //     30, 0, 0));
	    // parallaxBackgroundManager.addBackgroundImage(
	    //     new ParallaxBackground(gameEngine, AM.getAsset('../img/backgroundTrees2.png'), 
	    //     40, 0, 0));
	    // parallaxBackgroundManager.addBackgroundImage(
	    //     new ParallaxBackground(gameEngine, AM.getAsset('../img/backgroundTrees1.png'), 
	    //     60, 0, 0));
	    // gameEngine.parallaxManager = parallaxBackgroundManager;
	    
	    // gameEngine.addTile(new Tile(gameEngine, AM.getAsset('../img/forestLeftTile.png'),
	    // 10, 10, [AM.getAsset('../img/forestLeftTile.png'), 
	    //          AM.getAsset('../img/forestMiddleTile.png'),
	    //          AM.getAsset('../img/forestRightTile.png'), '']));

	    // gameEngine.addDroid(new BasicDroid(gameEngine, AM.getAsset("../img/droid-j-row.png"), 100, 100));
	    // gameEngine.addDroid(new BasicDroid(gameEngine, AM.getAsset("../img/droid-j-row.png"), 700, 500));
	    // gameEngine.addDroid(new BasicDroid(gameEngine, AM.getAsset("../img/droid-j-row.png"), 800, 310));
	    // gameEngine.addDroid(new BasicDroid(gameEngine, AM.getAsset("../img/droid-j-row.png"), 492, 368));
	    gameEngine.addDroid(new BasicDroid(gameEngine, AM.getAsset("../img/droid-j-row.png"), 1000, 600));


		//for prototype !!!
		// gameEngine.addZerlin(new Zerlin(gameEngine, AM));
		//draw a tile on the bottom of the screen
		//Draw a tile of given size.
		class Tile extends Entity{
			constructor(game, startX, startY, tileArray) {
				super(game, null, startX, startY, 0, 0);
				this.leftCornerTile = tileArray[0];
				this.centerTile = tileArray[1];
				this.rightTile = tileArray[2];

				this.ctx = game.ctx;
			}
			update() { } 
			draw() { //code this with a loop to draw whatever length platform the user wants
				this.ctx.drawImage(this.leftCornerTile, 0, 680);
				for (let i = 60; i < 1060; i += 60) {
					this.ctx.drawImage(this.centerTile, i, 680); 
				}   
				this.ctx.drawImage(this.rightTile, 1060, 680); 
			}
		}
		//add the ground tiles
		gameEngine.addEntity(new Tile(gameEngine,
			10, 10, [AM.getAsset('../img/forestLeftTile.png'), 
			AM.getAsset('../img/forestMiddleTile.png'),
			AM.getAsset('../img/forestRightTile.png'), '']));

	    gameEngine.start();
	    console.log("All Done!");
	});	
})();

