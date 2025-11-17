export default class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.maxSimultaneousSounds = 10;
    this.activeSounds = [];
    this.sounds = {};
    this.music = null;
  }

  loadSounds() {
    this.sounds.shoot = this.scene.sound.add("shoot", {
      loop: false,
      volume: 0.5,
    });
    this.sounds.explosion = this.scene.sound.add("explosion", {
      loop: false,
      volume: 0.8,
    });
    this.sounds.damage = this.scene.sound.add("damage", {
      loop: false,
      volume: 0.3,
    });

    this.sounds.selectTower = this.scene.sound.add("selectTower", {
      loop: false,
      volume: 0.5,
    });
    this.sounds.placeTower = this.scene.sound.add("placeTower", {
      loop: false,
      volume: 0.7,
    });

    this.music = this.scene.sound.add("backgroundMusic", {
      loop: true,
      volume: 0.3,
    });
    this.music.play();
  }

  playSound(soundKey) {
    if (this.activeSounds.length < this.maxSimultaneousSounds) {
      const sound = this.sounds[soundKey];
      if (sound) {
        sound.play();
        this.activeSounds.push(sound);
        sound.on("complete", () => this.removeActiveSound(sound));
      }
    }
  }

  removeActiveSound(sound) {
    const index = this.activeSounds.indexOf(sound);
    if (index !== -1) {
      this.activeSounds.splice(index, 1);
    }
  }

  setVolume(volume) {
    for (let soundKey in this.sounds) {
      this.sounds[soundKey].setVolume(volume);
    }
  }

  playDamageSound() {
    const currentTime = Date.now();
    if (
      !this.lastDamageSoundTime ||
      currentTime - this.lastDamageSoundTime > 200
    ) {
      this.playSound("damage");
      this.lastDamageSoundTime = currentTime;
    }
  }
}
