/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

var PHI = 1.618;



window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

class GameEngine {
    constructor(assetManager) {
        this.assetManager = assetManager;
        this.showOutlines = true; //debug bit
        this.otherEntities = [];
        this.lasers = [];
        this.droids = [];
        this.tiles = [];
        this.ctx = null;
        this.surfaceWidth = null;
        this.surfaceHeight = null;
        this.moveLeft = null;
        this.moveRight = null;
        this.mouse = {x: 100, y: 100};
        this.click = null;
        this.Zerlin = null;
        this.keys = {};

    }
    init(ctx) {
        this.ctx = ctx;
        this.surfaceWidth = this.ctx.canvas.width;
        this.surfaceHeight = this.ctx.canvas.height;
        this.timer = new Timer();
        this.camera = new Camera(this, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height); // TODO: Change to constant camera dimension to pair up with template
        this.Zerlin = new Zerlin(this);
        this.collisionManager = new CollisionManager(this);
        // TODO: instantiate Parallax manager here (and other managers)
        this.startInput();
        console.log('game initialized');
    }
    start() {
        console.log("starting game");
        var that = this;
        (function gameLoop() {
            that.loop();
            requestAnimationFrame(gameLoop);
        })();
    }
    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    }
    update() {
        this.Zerlin.update();
        this.camera.update();
        
        for (var i = this.droids.length - 1; i >= 0; i--) {
            this.droids[i].update();
            if (this.droids[i].removeFromWorld) {
                this.droids.splice(i, 1);
            }
        }
        for (var i = this.lasers.length - 1; i >= 0; i--) {
            this.lasers[i].update();
            if (this.lasers[i].removeFromWorld) {
                this.lasers.splice(i, 1);
            }
        }
        for (var i = this.tiles.length - 1; i >= 0; i--) {
            this.tiles[i].update();
        }
        for (var i = this.otherEntities.length - 1; i >= 0; i--) {
            this.otherEntities[i].update();
            if (this.otherEntities[i].removeFromWorld) {
                this.otherEntities.splice(i, 1);
            }
        }

        this.collisionManager.handleCollisions();
        this.click = null;
    }
    draw() {
        this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
        this.ctx.save();
        this.camera.draw();
        this.Zerlin.draw();
        for (var i = 0; i < this.droids.length; i++) {
            this.droids[i].draw(this.ctx);
        }
        for (var i = 0; i < this.lasers.length; i++) {
            this.lasers[i].draw(this.ctx);
        }
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].draw(this.ctx);
        }
        for (var i = 0; i < this.otherEntities.length; i++) {
            this.otherEntities[i].draw(this.ctx);
        }

        // // draws axis' for debugging placement of otherEntities
        // this.ctx.beginPath();
        // this.ctx.moveTo(this.ctx.canvas.width * (2 - PHI), 0);
        // this.ctx.lineTo(this.ctx.canvas.width * (2 - PHI), this.ctx.canvas.height);
        // this.ctx.stroke();

        this.ctx.restore();
    }
    addEntity(entity) {
        // console.log('added entity');
        this.otherEntities.push(entity);
    }
    addDroid(droid) {
        console.log('added droid');
        this.droids.push(droid);
        // this.otherEntities.push(droid);
    }
    addLaser(laser) {
        // console.log('added laser');
        this.lasers.push(laser);
        // this.otherEntities.push(laser);
    }
    addTile(tile) {
        console.log('added laser');
        this.tiles.push(tile);
        // this.otherEntities.push(tile);
    }
    startInput () {
        console.log('Starting input');
        var that = this;

        var getXandY = e => {
            var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
            var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
            return { x: x, y: y };
        }


        // Keyboard

        this.ctx.canvas.addEventListener("keydown", (e) => {
            if (that.keys[e.code]) { return; } // prevent repeating calls when key is held down
            // console.log("Key Down Event - Char " + e.code + " Code " + e.keyCode);
            that.keys[e.code] = true;            
            e.preventDefault();
        }, false);

        this.ctx.canvas.addEventListener("keyup", function (e) {
            // console.log("Key Up Event - Char " + e.code + " Code " + e.keyCode);
            that.keys[e.code] = false;
            e.preventDefault();
        }, false);


        // Mouse
        this.ctx.canvas.addEventListener("click", function(e) {
            that.click = getXandY(e);
            //debug
            //that.addEntity(new DroidLaser(that, 300, 300, 20, that.click.x, that.click.y, 20, 10));
            //console.log("click X: %d, Y: %d", that.click.x, that.click.y);
            //console.log(e);
        }, false);

        this.ctx.canvas.addEventListener("contextmenu", function (e) {
            e.preventDefault();
        }, false);

        this.ctx.canvas.addEventListener("mousemove", function(e) {
            that.mouse = getXandY(e);
            //console.log(e);
        }, false);

        this.ctx.canvas.addEventListener("mousedown", function (e) {
            if (e.button === 2) { // right click
                that.rightClickDown = true; // change to inside that.keys['rightClick']
            }
        }, false);

        this.ctx.canvas.addEventListener("mouseup", function (e) {
            if (e.button === 2) { // right click
                that.rightClickDown = false;
            }
        }, false);
    


        console.log('Input started');
    }

}

class Timer {
    constructor() {
        this.gameTime = 0;
        this.maxStep = 0.05;
        this.wallLastTimestamp = 0;
    }
    tick() {
        var wallCurrent = Date.now();
        var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
        this.wallLastTimestamp = wallCurrent;
        var gameDelta = Math.min(wallDelta, this.maxStep); // TODO: are these 3  lines okay?
        this.gameTime += gameDelta;
        return gameDelta;
    }
}



class Entity {
    constructor(game, x, y, deltaX, deltaY) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.removeFromWorld = false;
        // Entity's velocity
        this.deltaX = deltaX;
        this.deltaY = deltaY;

    }
    update() {
        
    }
    draw() {
        // if (this.game.showOutlines && this.radius) {
        //     this.game.ctx.beginPath();
        //     this.game.ctx.strokeStyle = "green";
        //     this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        //     this.game.ctx.stroke();
        //     this.game.ctx.closePath();
        // }
    }
    rotateAndCache(image, angle) {
        var offscreenCanvas = document.createElement('canvas');
        var size = Math.max(image.width, image.height);
        offscreenCanvas.width = size;
        offscreenCanvas.height = size;
        var offscreenCtx = offscreenCanvas.getContext('2d');
        offscreenCtx.save();
        offscreenCtx.translate(size / 2, size / 2);
        offscreenCtx.rotate(angle);
        offscreenCtx.translate(0, 0);
        offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
        offscreenCtx.restore();
        //offscreenCtx.strokeStyle = "red";
        //offscreenCtx.strokeRect(0,0,size,size);
        return offscreenCanvas;
    }
    scaleAndCache(image, scale) {

    }
    outsideScreen() {
        return (this.x < 0 || 
            this.x > this.game.surfaceWidth ||
            this.y < 0 ||
            this.y > this.game.surfaceHeight);

    }
    
}

