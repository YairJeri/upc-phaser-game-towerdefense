export default class SoundSystem {
  constructor(scene) {
    this.scene = scene;

    this.poolEffects = new SoundPool(scene, "explosion", 5);
    this.hitEffects = new SoundPool(scene, "hit", 5);
    this.arrowEffects = new SoundPool(scene, "arrow", 5);
    this.orcDeathEffects = new SoundPool(scene, "orc_death", 5);
    this.damageBuildingEffects = new SoundPool(scene, "damage_building", 5);

    // Use existing gameplay track; menu music is handled by StartMenu
    this.gameMusic = this.scene.sound.add("game_music");
    this.trumpet = this.scene.sound.add("trumpet");
    this.horn = this.scene.sound.add("horn");
  }

  playExplosion(vol) {
    let sound = this.poolEffects.get();
    if (!sound) return;
    sound.setVolume(vol);
    sound.rate = Phaser.Math.FloatBetween(0.8, 1.2);
    sound.play();
  }

  playArrow(vol) {
    let sound = this.arrowEffects.get();
    if (!sound) return;
    sound.setVolume(vol);
    sound.rate = Phaser.Math.FloatBetween(0.8, 1.2);
    sound.play();
  }

  playHit(vol) {
    let sound = this.hitEffects.get();
    if (!sound) return;
    sound.setVolume(vol);
    sound.rate = Phaser.Math.FloatBetween(0.8, 1.2);
    sound.play();
  }

  playOrcDeath(vol) {
    let sound = this.orcDeathEffects.get();
    if (!sound) return;
    sound.setVolume(vol);
    sound.rate = Phaser.Math.FloatBetween(0.9, 1.1);
    sound.play();
  }

  playDamageBuilding(vol) {
    let sound = this.damageBuildingEffects.get();
    if (!sound) return;
    sound.setVolume(vol);
    sound.rate = Phaser.Math.FloatBetween(0.8, 1.2);
    sound.play();
  }

  playHorn(vol) {
    this.horn.setVolume(vol);
    this.horn.play();
  }

  playGameMusic(vol) {
    this.gameMusic.setVolume(vol);
    this.gameMusic.play();
    this.gameMusic.loop = true;
  }

  playTrumpet(vol) {
    this.trumpet.setVolume(vol);
    this.trumpet.play();
  }

  stop() {
    this.poolEffects.pool.forEach((sound) => {
      sound.stop();
      this.poolEffects.release(sound);
    });
    this.hitEffects.pool.forEach((sound) => {
      sound.stop();
      this.hitEffects.release(sound);
    });
    this.arrowEffects.pool.forEach((sound) => {
      sound.stop();
      this.arrowEffects.release(sound);
    });
    this.orcDeathEffects.pool.forEach((sound) => {
      sound.stop();
      this.orcDeathEffects.release(sound);
    });
    this.damageBuildingEffects.pool.forEach((sound) => {
      sound.stop();
      this.damageBuildingEffects.release(sound);
    });
    this.gameMusic.stop();
    this.trumpet.stop();
    this.horn.stop();
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
    if (this.availableSounds.length <= 0) return null;
    const sound = this.availableSounds.pop();
    sound.isPlaying = true;
    return sound;
  }

  release(sound) {
    sound.stop();
    sound.isPlaying = false;
    this.availableSounds.push(sound);
  }
}
