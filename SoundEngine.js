
console.log('in music');

// var sound = new Howl({
//  src: ['sound/kashyyyk.mp3']
// });
// sound.play();

var sound = new Howl({
    src: ['sound/kashyyyk.mp3'],
    autoplay: true,
    loop: true,
    volume: 5,
    onend: function() {
      console.log('Finished!');
    }
});

//todo not linked up yet
// document.getElementById("playPause").onclick( () => {
//   console.log('clicked');
//   if(sound.playing()) {
//     sound.pause();
//   } else {
//     sound.play();
//   }
// });


/*
 * Allows entities to not manage their own sounds
 */
class SoundEngine {

	constructor(game) {
		this.game = game;
		this.soundCache = {};
		this.prepareSounds();

	}

	loopTrack(track) {

	}

	prepareSounds() {

	}

	playLaserShoot() {

	}

	playLaserDeflected() {

	}

	playLightsaberOn() {

	}

	playLightsaberOff() {
		
	}

	playDiedSound() {

	}

	playExplosion1() {

	}

	playSaberSwish() {

	}
}