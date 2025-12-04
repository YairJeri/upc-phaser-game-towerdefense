export class Boot extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    this.load.spritesheet("orc", "assets/enemy/Orc.png", {
      frameWidth: 100,
      frameHeight: 100,
    });

    this.load.spritesheet("mage", "assets/enemy/Mage.png", {
      frameWidth: 160,
      frameHeight: 128,
    });

    this.load.image("map_base", "assets/map/Base.png");
    this.load.image("forest", "assets/map/Forest.png");
    this.load.image("mountain", "assets/map/Mountain.png");
    this.load.image("shield", "assets/shield.png");

    this.load.image("uCloudAtlas", "assets/map/Clouds.png");
    this.load.spritesheet("buildings", "assets/tileset.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet("coin", "assets/MonedaD.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.atlas(
      "flares",
      "assets/particles/flares.png",
      "assets/particles/flares.json"
    );

    this.load.image("particle", "assets/particles/Particle.png");

    this.load.bitmapFont(
      "gothic",
      "assets/fonts/bitmap/gothic.png",
      "assets/fonts/bitmap/gothic.xml"
    );
    this.load.bitmapFont(
      "minogram",
      "assets/fonts/bitmap/minogram_6x10.png",
      "assets/fonts/bitmap/minogram_6x10.xml"
    );
    this.load.bitmapFont(
      "round",
      "assets/fonts/bitmap/round_6x6.png",
      "assets/fonts/bitmap/round_6x6.xml"
    );
    this.load.bitmapFont(
      "square",
      "assets/fonts/bitmap/square_6x6.png",
      "assets/fonts/bitmap/square_6x6.xml"
    );
    this.load.bitmapFont(
      "thick_8x8",
      "assets/fonts/bitmap/thick_8x8.png",
      "assets/fonts/bitmap/thick_8x8.xml"
    );

    this.load.audio("explosion", "assets/sounds/explosion.mp3");
    this.load.audio("arrow", "assets/sounds/arrow.mp3");
    this.load.audio("hit", "assets/sounds/hit.mp3");
    this.load.audio("orc_death", "assets/sounds/orc_death.mp3");
    this.load.audio("damage_building", "assets/sounds/damage_building.mp3");
    this.load.audio("horn", "assets/sounds/horn.mp3");
      this.load.audio("game_music", "assets/sounds/game_music.mp3"); // Keeping the existing line
      // New menu music (WAV)
      this.load.audio("music_menu", "assets/sounds/music_menu.wav");
    this.load.audio("trumpet", "assets/sounds/trumpet.mp3");
    // Background image for Start Menu
    this.load.image("Fondo_ia", "assets/backgrounds/Fondo_ia.png");
  }

  create() {
    this.scene.start("Preloader");
  }
}
