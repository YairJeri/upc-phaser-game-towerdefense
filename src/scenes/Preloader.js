export class Preloader extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    const centreX = this.scale.width * 0.5;
    const centreY = this.scale.height * 0.5;

    const barWidth = 468;
    const barHeight = 32;
    const barMargin = 4;

    this.add
      .rectangle(centreX, centreY, barWidth, barHeight)
      .setStrokeStyle(1, 0xffffff);

    const bar = this.add.rectangle(
      centreX - barWidth * 0.5 + barMargin,
      centreY,
      barMargin,
      barHeight - barMargin,
      0xffffff
    );

    this.load.on("progress", (progress) => {
      bar.width = barMargin + (barWidth - barMargin * 2) * progress;
    });
  }

  preload() {
    this.load.spritesheet("enemy", "assets/enemy/Orc.png", {
      frameWidth: 100,
      frameHeight: 100,
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
  }

  create() {
    this.scene.start("MainScene");
  }
}
