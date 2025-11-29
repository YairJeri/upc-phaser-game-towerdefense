export default class SoundSystem {
  constructor(scene) {
    this.scene = scene;

    this.poolEffects = new SoundPool(scene, "explosion", 20);
    // this.poolDisparo = new SoundPool(scene, "disparo", 30);
    // this.poolAmbiente = new SoundPool(scene, "ambiente", 5);
    // this.poolMusica = new SoundPool(scene, "musica_fondo", 1);
  }

  loadSounds() {
    // Cargar los sonidos necesarios para la escena
    // this.scene.load.audio("explosion", "assets/sounds/explosion.mp3");
    // this.scene.load.audio("disparo", "assets/sounds/disparo.mp3");
    // this.scene.load.audio("ambiente", "assets/sounds/ambiente.mp3");
    // this.scene.load.audio("musica_fondo", "assets/sounds/musica_fondo.mp3");
  }

  preload() {
    this.loadSounds();
  }

  playEffect(vol) {
    let sound = this.poolEffects.get();
    sound.setVolume(vol);
    sound.rate = Phaser.Math.FloatBetween(0.8, 1.2);
    sound.play();
  }

  //   playDisparo() {
  //     let sound = this.poolDisparo.get();
  //     sound.setVolume(1);
  //     sound.play();
  //   }

  //   playAmbiente() {
  //     let sound = this.poolAmbiente.get();
  //     sound.setVolume(0.5);
  //     sound.play();
  //   }

  //   playMusica() {
  //     let sound = this.poolMusica.get();
  //     sound.setVolume(0.2);
  //     sound.loop = true;
  //     sound.play();
  //   }

  stop() {
    this.poolEffects.pool.forEach((sound) => {
      sound.stop();
      this.poolEffects.release(sound);
    });
    // this.poolDisparo.pool.forEach((sound) => {
    //   sound.stop();
    //   this.poolDisparo.release(sound);
    // });
    // this.poolAmbiente.pool.forEach((sound) => {
    //   sound.stop();
    //   this.poolAmbiente.release(sound);
    // });
    // this.poolMusica.pool.forEach((sound) => {
    //   sound.stop();
    //   this.poolMusica.release(sound);
    // });
  }
}

class SoundPool {
  constructor(scene, key, poolSize = 10) {
    this.scene = scene;
    this.key = key;
    this.poolSize = poolSize;
    this.pool = [];
    this.availableSounds = [];

    for (let i = 0; i < this.poolSize; i++) {
      const sound = this.scene.sound.add(this.key);
      sound.setVolume(1);
      sound.on("complete", () => {
        sound.isPlaying = false;
        this.availableSounds.push(sound);
      });
      this.availableSounds.push(sound);
      this.pool.push(sound);
    }
  }

  get() {
    if (this.availableSounds.length > 0) {
      const sound = this.availableSounds.pop();
      sound.isPlaying = true;
      return sound;
    } else {
      const newSound = this.scene.sound.add(this.key);
      newSound.setVolume(1);
      newSound.on("complete", () => {
        newSound.isPlaying = false;
        this.availableSounds.push(newSound);
      });
      return newSound;
    }
  }

  release(sound) {
    sound.stop();
    sound.isPlaying = false;
    this.availableSounds.push(sound);
  }
}
