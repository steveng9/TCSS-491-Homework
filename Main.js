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

	AM.queueDownload("./img/Zerlin bobbing walking.png");
	AM.queueDownload("./img/Zerlin left bobbing walking.png");
	AM.queueDownload("./img/Zerlin backwards bobbing walking.png");
	AM.queueDownload("./img/Zerlin left backwards bobbing walking.png");
	AM.queueDownload("./img/Zerlin standing.png");
	AM.queueDownload("./img/Zerlin standing left.png");
	AM.queueDownload("./img/Zerlin somersault.png");
	AM.queueDownload("./img/Zerlin left somersault.png");
	AM.queueDownload("./img/Zerlin falling up.png");
	AM.queueDownload("./img/Zerlin falling down.png");
	AM.queueDownload("./img/Zerlin falling up left.png");
	AM.queueDownload("./img/Zerlin falling down left.png");
	AM.queueDownload("./img/Zerlin slash.png");
	AM.queueDownload("./img/Zerlin slash left.png");

	AM.queueDownload("./img/Lightsaber with point of rotation drawn.png");
	AM.queueDownload("./img/Lightsaber with point of rotation drawn left.png");
	AM.queueDownload("./img/lightsaber upside down.png");
	AM.queueDownload("./img/lightsaber upside down left.png");

	AM.queueDownload("./img/New Piskel.png");
	AM.queueDownload("./img/New Piskel (1).png");
	AM.queueDownload("./img/New Piskel (2).png");
	AM.queueDownload("./img/New Piskel (3).png");
	AM.queueDownload("./img/New Piskel (4).png");

	AM.downloadAll(function () {
	    var canvas = document.getElementById("gameWorld");
	    var ctx = canvas.getContext("2d");

	    var gameEngine = new GameEngine(AM);
	    gameEngine.init(ctx);

	    gameEngine.start();
	    console.log("All Done!");
	});	
})();

