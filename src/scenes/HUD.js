import StructureTypes from "../data/StructureInfo.js";
import UIButton from "../ui/Button.js";
import UIContainer from "../ui/Container.js";
import waves from "../data/Wave.js";

export class HUD extends Phaser.Scene {
  constructor() {
    super("HUD");
    this.selectedTowerButton = null;
  }

  create() {
    this.waveNumber = 0;
    this.waveMoneyGenerated = 0;

    this.createTopLeftContainer();

    this.creteTopRightContainer();

    this.createTowerButtons();

    this.createToolTip();

    this.createStartWaveButton();
    this.waveCompletedText();

    this.game.events.on("Money", (amount) => {
      this.moneyText.setText(`$${amount}`);
    });

    this.game.events.on("MoneyGain", (amount, isVillage) => {
      if (isVillage) {
        this.waveMoneyGenerated += amount;
      }
    });

    this.game.events.on("Remaining", (count) => {
      this.enemiesText.setText(`${count}`);
    });

    this.game.events.on("WaveOver", () => {
      this.waveTextContainer.show();
      this.waveMoneyText.setText(
        `Income: $${this.waveMoneyGenerated}  Wave Bonus:$${
          waves[this.waveNumber - 1].money
        }`
      );

      this.time.delayedCall(3000, () => {
        this.waveTextContainer.hide();

        this.startWaveButton.setActive();
        // this.bottomContainer.show();
      });
    });

    this.game.events.on("CurrentHealth", (current) => {
      this.healthText.setText(
        `Health: ${current}/${StructureTypes.Main.health}`
      );
      this.updateHealthBar(current / StructureTypes.Main.health, 0, 0);
    });
    this.game.events.on("Restart", () => {
      this.scene.restart();
    });
    this.game.events.on("GameOver", () => {
      this.scene.sleep();
    });
  }

  createTopLeftContainer() {
    this.topLeftContainer = new UIContainer(
      this,
      10,
      10,
      Math.max(this.cameras.main.width / 4 - 20, 340),
      100,
      0.7,
      10
    );
    this.shield = this.add.image(0, 0, "shield").setOrigin(0.5).setScale(0.4);
    this.topLeftContainer.addElement(this.shield, 45, 50);

    this.healthText = this.add.bitmapText(
      0,
      0,
      "minogram",
      `Health: ${StructureTypes.Main.health}/${StructureTypes.Main.health}`,
      20
    );
    this.topLeftContainer.addElement(this.healthText, 100, 5);

    this.coin = this.add.sprite(0, 0, "coin").setOrigin(0.5).setScale(1.5);
    this.coin.play("coin");
    this.topLeftContainer.addElement(this.coin, 100, 80);

    this.moneyText = this.add
      .bitmapText(0, 0, "minogram", "$500", 20)
      .setTint(0xffd700);
    this.topLeftContainer.addElement(this.moneyText, 120, 72);

    this.createHealthBar(0, 0);
    this.topLeftContainer.addElement(this.healthBar, 100, 35);
  }

  creteTopRightContainer() {
    this.topRightContainer = new UIContainer(
      this,
      this.cameras.main.width - 230,
      10,
      220,
      120,
      0.7
    );
    this.waveText = this.add
      .bitmapText(0, 0, "minogram", "Oleada: 0", 24)
      .setOrigin(0.5);
    this.topRightContainer.addElement(this.waveText, 110, 20);

    this.enemiesText = this.add
      .bitmapText(0, 0, "minogram", "0", 24)
      .setOrigin(0.5);
    this.topRightContainer.addElement(this.enemiesText, 110, 50);
  }

  createStartWaveButton() {
    const x = this.cameras.main.width - 220;
    const y = 150;
    const w = 200;
    const h = 45;

    this.startWaveButton = new UIButton(
      this,
      x,
      y,
      w,
      h,
      "Iniciar Oleada",
      () => {
        this.startNextWave();
        // this.bottomContainer.hide();
      }
    );
  }

  createToolTip() {
    this.tooltipContainer = new UIContainer(
      this,
      0,
      0,
      300,
      400,
      0.8,
      10,
      true
    );
    this.tooltipContainer.hideInmediately();
    this.add.existing(this.tooltipContainer.container);

    this.tooltipTitleText = this.add
      .bitmapText(0, 0, "minogram", "", 24)
      .setDepth(10001)
      .setOrigin(0.5);
    this.tooltipCostText = this.add
      .bitmapText(0, 0, "minogram", "", 36)
      .setDepth(10001)
      .setOrigin(0.5)
      .setTint(0xffd700);
    this.tooltipDescriptionText = this.add
      .bitmapText(0, 0, "minogram", "", 14)
      .setDepth(10001)
      .setOrigin(0.5)
      .setCenterAlign();

    this.tooltipImage = this.add
      .sprite(0, 0, "buildings")
      .setOrigin(0.5)
      .setScale(8);

    this.tooltipContainer.addElement(
      this.tooltipTitleText,
      this.tooltipContainer.width / 2,
      20
    );
    this.tooltipContainer.addElement(
      this.tooltipImage,
      this.tooltipContainer.width / 2,
      110
    );
    this.tooltipContainer.addElement(
      this.tooltipCostText,
      this.tooltipContainer.width / 2,
      210
    );
    this.tooltipContainer.addElement(
      this.tooltipDescriptionText,
      this.tooltipContainer.width / 2,
      250
    );
  }

  startNextWave() {
    this.game.events.emit("StartWave");
    this.waveText.setText(`OLEADA: ${++this.waveNumber}`);
    this.startWaveButton.setInactive();
  }

  createHealthBar(x, y) {
    this.healthBar = this.add.graphics();
    this.updateHealthBar(1, x, y);
  }

  updateHealthBar(healthPercentage, x, y) {
    this.healthBar.clear();
    this.healthBar.fillStyle(0xff0000, 1);
    this.healthBar.fillRoundedRect(
      x,
      y,
      this.topLeftContainer.width - 110,
      20,
      10
    );
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRoundedRect(
      x,
      y,
      (this.topLeftContainer.width - 100) * healthPercentage - 10,
      20,
      10
    );
    this.healthBar.lineStyle(2, 0xcccccc);
    this.healthBar.strokeRoundedRect(
      x,
      y,
      this.topLeftContainer.width - 110,
      20,
      10
    );
  }

  createTowerButtons() {
    const towerButtonsData = [
      {
        type: StructureTypes.Wall.id,
        name: "Muro",
        textureFrame: StructureTypes.Wall.id,
        cost: StructureTypes.Wall.cost,
        description: "Bloquea y entorpece a los enemigos.",
        startSprite: 11,
        endSprite: 21,
      },
      {
        type: StructureTypes.Village.id,
        name: "Aldea",
        textureFrame: StructureTypes.Village.id,
        cost: StructureTypes.Village.cost,
        description: "Genera dinero extra al\nterminar la oleada.",
        startSprite: 0,
        endSprite: 3,
      },
      {
        type: StructureTypes.Tower1.id,
        name: "Torre Arquera",
        textureFrame: StructureTypes.Tower1.id,
        cost: StructureTypes.Tower1.cost,
        description:
          "Dispara flechas que hacen mucho\nhiere a un solo enemigo.",
      },
      {
        type: StructureTypes.Tower2.id,
        name: "Torre de Bombardera",
        textureFrame: StructureTypes.Tower2.id,
        cost: StructureTypes.Tower2.cost,
        description:
          "Dispara explosivos que\nhieren a muchos enemigos en area.",
      },
    ];

    const buttonCount = towerButtonsData.length;
    const containerWidth = buttonCount * 100;
    const containerHeight = 100;
    const containerX = (this.cameras.main.width - containerWidth) / 2;

    this.bottomContainer = new UIContainer(
      this,
      containerX,
      this.cameras.main.height - 220,
      containerWidth,
      containerHeight,
      0.8
    );

    this.highlightGraphics = this.add.graphics();
    this.highlightGraphics.setDepth(10001);

    this.bottomContainer.addElement(this.highlightGraphics, 0, 0);

    towerButtonsData.forEach((data, index) => {
      const buttonX = 50 + index * 100;

      const btnContainer = this.add.container(0, 0);
      btnContainer.setSize(90, 90); // Área clickeable
      btnContainer.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, 90, 90),
        Phaser.Geom.Rectangle.Contains
      );

      const bg = this.add.rectangle(0, 0, 90, 90, 0x000000, 0);
      bg.setOrigin(0.5);

      const buttonSprite = this.add
        .image(0, 0, "buildings", data.textureFrame)
        .setScale(3);

      btnContainer.add([bg, buttonSprite]);

      btnContainer.on("pointerdown", () => {
        this.selectTower(data, btnContainer);
      });

      btnContainer.on("pointerover", () => {
        this.showTooltip(
          data,
          this.bottomContainer.x + buttonX,
          this.bottomContainer.y - this.tooltipContainer.height / 2 - 20
        );
      });

      btnContainer.on("pointerout", () => this.hideTooltip());

      this.bottomContainer.addElement(btnContainer, buttonX, 50);
    });
  }

  selectTower(data, button) {
    this.updateHighlight(button);
    this.game.events.emit("TowerChange", {
      type: data.type,
      cost: data.cost,
    });
  }

  updateHighlight(button) {
    this.highlightGraphics.clear();
    this.highlightGraphics.lineStyle(4, 0xffff00, 1);
    this.highlightGraphics.strokeRoundedRect(
      button.offsetX - button.displayWidth / 2,
      button.offsetY - button.displayHeight / 2,
      button.displayWidth,
      button.displayHeight
    );
  }

  showTooltip(towerData, x, y) {
    this.tooltipTitleText.setText(towerData.name);
    this.tooltipCostText.setText(`$${towerData.cost}`);
    this.tooltipDescriptionText.setText(towerData.description);

    if (
      towerData.startSprite !== undefined &&
      towerData.endSprite !== undefined
    ) {
      if (!this.anims.exists(`tower_${towerData.name}`)) {
        this.anims.create({
          key: `tower_${towerData.name}`,
          frames: this.anims.generateFrameNames("buildings", {
            start: towerData.startSprite,
            end: towerData.endSprite,
            zeroPad: 0,
          }),
          frameRate: 1,
          repeat: -1,
        });
      }
      this.tooltipImage.play(`tower_${towerData.name}`);
    } else {
      this.tooltipImage.stop();
      this.tooltipImage.setFrame(towerData.type);
    }

    this.tooltipContainer.updatePosition(x, y);
    this.tooltipContainer.show();
  }

  hideTooltip() {
    this.tooltipContainer.hide();
  }

  waveCompletedText() {
    this.waveTextContainer = new UIContainer(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      1000,
      200,
      0.8,
      10,
      true
    );
    this.waveComText = this.add
      .bitmapText(0, 0, "thick_8x8", "OLEADA COMPLETADA!", 70)
      .setOrigin(0.5);

    this.waveMoneyText = this.add
      .bitmapText(0, 0, "minogram", "$0", 50)
      .setOrigin(0.5)
      .setTint(0xffd700);

    this.waveTextContainer.addElement(this.waveComText, 500, 80);
    this.waveTextContainer.addElement(this.waveMoneyText, 500, 160);
    this.waveTextContainer.hideInmediately();
  }
}
