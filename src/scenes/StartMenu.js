import UIButton from "../ui/Button.js";
import UIContainer from "../ui/Container.js";

export class StartMenu extends Phaser.Scene {
  constructor() {
    super("StartMenu");
  }

  create() {
    const { width, height } = this.cameras.main;
    // Play menu music if available and audio is unlocked; otherwise wait for unlock
    if (this.cache.audio.exists("music_menu")) {
      const playMenu = () => {
        if (!this.menuMusic) {
          this.menuMusic = this.sound.add("music_menu", { loop: true, volume: 0.4 });
        }
        if (!this.menuMusic.isPlaying) {
          this.menuMusic.play();
        }
      };
      if (this.sound.locked) {
        this.sound.once("unlocked", playMenu);
      } else {
        playMenu();
      }
    }

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
  }

  startGame() {
    // Start HUD and MainScene, ensure HUD is on top
    // Stop menu music before starting game
    this.menuMusic?.stop();
    this.scene.start("MainScene");
    this.scene.launch("HUD");
    this.scene.bringToTop("HUD");
  }

  scaleBackground(bg) {
    const { width, height } = this.cameras.main;
    const texWidth = bg.texture.getSourceImage().width;
    const texHeight = bg.texture.getSourceImage().height;
    const scaleX = width / texWidth;
    const scaleY = height / texHeight;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
  }
}