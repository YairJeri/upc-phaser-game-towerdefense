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
    this.anims.create({
      key: "coin",
      frames: this.anims.generateFrameNumbers("coin", {
        start: 0,
        end: 4,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  create() {
    this.scene.start("MainScene");
  }
}
