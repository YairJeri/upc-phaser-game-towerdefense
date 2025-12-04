import UIButton from "../ui/Button.js";
import UIContainer from "../ui/Container.js";

export class StartMenu extends Phaser.Scene {
  constructor() {
    super("StartMenu");
  }

  create() {
    const { width, height } = this.cameras.main;

    // Title container
    const titleContainer = new UIContainer(
      this,
      width / 2,
      height / 2 - 100,
      600,
      160,
      0.8,
      12,
      true
    );
    const titleText = this.add
      .bitmapText(0, 0, "thick_8x8", "TOWER DEFENSE", 80)
      .setOrigin(0.5);
    titleContainer.addElement(titleText, 300, 80);

    // Play button
    new UIButton(this, width / 2 - 100, height / 2 + 50, 200, 50, "Jugar", () => {
      this.startGame();
    }, { fontKey: "minogram", fontSize: 28 }, true);
  }

  startGame() {
    // Start HUD and MainScene, ensure HUD is on top
    this.scene.start("MainScene");
    this.scene.launch("HUD");
    this.scene.bringToTop("HUD");
  }
}