import UIButton from "../ui/Button.js";

export class GameOver extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create(data) {
    // Fondo oscuro con fade in
    this.overlay = this.add.graphics();
    this.overlay.fillStyle(0x000000, 0.8);
    this.overlay.fillRect(0, 0, this.scale.width, this.scale.height);
    this.overlay.setAlpha(0);

    this.tweens.add({
      targets: this.overlay,
      alpha: 1,
      duration: 800,
      ease: "Power2",
    });
    
    // Texto "GAME OVER" con animación

    let text = data.win? "YOU WIN" : "GAME OVER";
    this.gameOverText = this.add
      .text(this.scale.width * 0.5, this.scale.height * 0.3, text, {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ff0000",
        stroke: "#ffffff",
        strokeThickness: 6,
        align: "center",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(0.5);

    this.tweens.add({
      targets: this.gameOverText,
      alpha: 1,
      scale: 1,
      duration: 1200,
      delay: 300,
      ease: "Back.easeOut",
    });

    // Texto de estadísticas
    let finalWave = data.wave;
    let finalMoney = data.money;
    let finalEnemies = data.enemies;

    this.game.events.on("GameOver", (finalStats) => {
      this.scene.restart(finalStats);
    });

    this.statsText = this.add
      .text(
        this.scale.width * 0.5,
        this.scale.height * 0.5,
        `Oleada Alcanzada: ${finalWave}\nDinero Total: $${finalMoney}\nEnemigos Derrotados: ${finalEnemies}`,
        {
          fontFamily: "Arial",
          fontSize: 28,
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
          align: "center",
          lineSpacing: 10,
        }
      )
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: this.statsText,
      alpha: 1,
      duration: 1000,
      delay: 800,
      ease: "Power2",
    });

    this.restartBtn = new UIButton(
      this,
      this.scale.width * 0.5,
      this.scale.height * 0.75,
      240,
      40,
      "VOLVER A JUGAR",
      () => {
        this.game.events.emit("Restart", true);
        this.sound.stopByKey("orchestral-win");
        this.sound.stopByKey("defeat");
        this.scene.sleep();
      },
      {
        backgroundColor: 0x333333,
        borderColor: 0x666666,
        // hoverColor: 0xffff00,
        hoverBorderColor: 0xffff00,
      },
      true
    );

    // Botón "Salir" mejorado
    this.exitBtn = this.add.container(
      this.scale.width * 0.5,
      this.scale.height * 0.85
    );

    const exitBtnBg = this.add.graphics();
    exitBtnBg.fillStyle(0x333333, 0.9);
    exitBtnBg.fillRoundedRect(-100, -15, 200, 30, 8);
    exitBtnBg.lineStyle(2, 0xffffff, 1);
    exitBtnBg.strokeRoundedRect(-100, -15, 200, 30, 8);

    const exitBtnText = this.add
      .text(0, 0, "SALIR", {
        fontFamily: "Arial Black",
        fontSize: 20,
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    this.exitBtn.add([exitBtnBg, exitBtnText]);
    this.exitBtn.setAlpha(0);

    this.tweens.add({
      targets: this.exitBtn,
      alpha: 1,
      y: this.scale.height * 0.85,
      duration: 1000,
      delay: 1400,
      ease: "Power2",
    });

    this.exitBtn.setInteractive(
      new Phaser.Geom.Rectangle(-100, -15, 200, 30),
      Phaser.Geom.Rectangle.Contains
    );

    this.exitBtn.on("pointerover", () => {
      exitBtnBg.clear();
      exitBtnBg.fillStyle(0x666666, 0.9);
      exitBtnBg.fillRoundedRect(-100, -15, 200, 30, 8);
      exitBtnBg.lineStyle(2, 0xff0000, 1);
      exitBtnBg.strokeRoundedRect(-100, -15, 200, 30, 8);
      exitBtnText.setTint(0xff0000);
    });

    this.exitBtn.on("pointerout", () => {
      exitBtnBg.clear();
      exitBtnBg.fillStyle(0x333333, 0.9);
      exitBtnBg.fillRoundedRect(-100, -15, 200, 30, 8);
      exitBtnBg.lineStyle(2, 0xffffff, 1);
      exitBtnBg.strokeRoundedRect(-100, -15, 200, 30, 8);
      exitBtnText.clearTint();
    });

    this.exitBtn.on("pointerdown", () => {
      // Efecto de click
      this.tweens.add({
        targets: this.exitBtn,
        scale: 0.95,
        duration: 100,
        yoyo: true,
        ease: "Power2",
        onComplete: () => {
          this.game.events.emit("Restart", false);
          this.sound.stopByKey("orchestral-win");
          this.sound.stopByKey("defeat");
          this.scene.sleep();          
        },
      });
    });

    if( data.win === undefined)
    {
      return;
    }
    if (data.win) {
        this.sound.play("orchestral-win", { loop: false, volume: 0.3 });
    } else {
        this.sound.play("defeat", { loop: false, volume: 0.3 });
    }

  }
}
