export class GameOver extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create() {
    this.add
      .text(this.scale.width * 0.5, this.scale.height * 0.5, "GAME OVER", {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    const btn = this.add.text(
      this.scale.width * 0.5,
      this.scale.height * 0.8,
      "Volver a Jugar",
      {
        fontFamily: "Arial",
        fontSize: 32,
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 25, y: 12 },
      }
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => {
      btn.setStyle({ backgroundColor: "#444444" });
    });

    btn.on("pointerout", () => {
      btn.setStyle({ backgroundColor: "#000000" });
    });

    btn.on("pointerdown", () => {
      this.scene.stop("GameOver");
      this.scene.stop("HUD");

      this.scene.restart();   // Reinicia clean
      this.scene.launch("HUD");
    });
  }
}
