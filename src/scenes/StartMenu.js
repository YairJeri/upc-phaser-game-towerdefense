import UIButton from "../ui/Button.js";
import UIContainer from "../ui/Container.js";

export class StartMenu extends Phaser.Scene {
  constructor() {
    super("StartMenu");
  }

  create() {
    this.scene.launch("MainScene")
    this.scene.get("MainScene").events.once("create", () => {
      this.scene.sleep("MainScene");
  });
    this.scene.launch("HUD");
    this.scene.bringToTop("HUD");
    this.scene.get("HUD").events.once("create", () => {
      this.scene.sleep("HUD");
  });
    this.scene.launch("GameOver");
    this.scene.bringToTop("GameOver");
    this.scene.get("GameOver").events.once("create", () => {
      this.scene.sleep("GameOver");
  });

    const { width, height } = this.cameras.main;
    // Play menu music if available and audio is unlocked; otherwise wait for unlock
    this.menuMusic = this.sound.add("music_menu", { loop: true, volume: 0.4 });
    this.menuMusic.play();

    // Add background image and scale to cover
    const bg = this.add.image(0, 0, "Fondo_ia").setOrigin(0, 0);
    this.scaleBackground(bg);
    this.scale.on("resize", () => this.scaleBackground(bg));

    // Title container
    const titleContainer = new UIContainer(
      this,
      width / 2,
      Math.max(120, height / 2 - 140),
      Math.min(700, Math.max(480, width * 0.7)),
      180,
      0.8,
      12,
      true
    );
    // Title with subtle shadow for readability
    const titleShadowA = this.add
      .bitmapText(0, 0, "thick_8x8", "TOWER DEFENSE", 60)
      .setOrigin(0.5)
      .setTint(0x000000);
    const titleShadowB = this.add
      .bitmapText(0, 0, "thick_8x8", "TOWER DEFENSE", 60)
      .setOrigin(0.5)
      .setTint(0x000000);
    const titleText = this.add
      .bitmapText(0, 0, "thick_8x8", "TOWER DEFENSE", 60)
      .setOrigin(0.5)
      .setTint(0xffffff);
    // Place shadows slightly offset behind the main title
    titleContainer.addElement(titleShadowA, titleContainer.width / 2 - 2, 90 - 2);
    titleContainer.addElement(titleShadowB, titleContainer.width / 2 + 2, 90 + 2);
    titleContainer.addElement(titleText, titleContainer.width / 2, 90);

    // Play button
    new UIButton(this, width / 2, height / 2 + 60, 240, 56, "Jugar", () => {
      this.startGame();
    }, { fontKey: "minogram", fontSize: 28 }, true);

    this.game.events.on("Restart", (replay) => {
      if(replay) return;
      this.menuMusic.play();
    });
  }

  startGame() {
    this.menuMusic.stop();
    // this.scene.wake("MainScene");
    this.game.events.emit("GameStart");
  }

  scaleBackground(bg) {
    if(this.cameras.main == undefined) return;
    const { width, height } = this.cameras.main;
    const texWidth = bg.texture.getSourceImage().width;
    const texHeight = bg.texture.getSourceImage().height;
    const scaleX = width / texWidth;
    const scaleY = height / texHeight;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
  }
}