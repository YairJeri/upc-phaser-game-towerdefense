import StructureTypes from "../other/StructureInfo.js";

export class HUD extends Phaser.Scene {
  constructor() {
    super("HUD");
    this.selectedTowerButton = null;
  }

  create() {
    this.waveNumber = 0;
    this.topLeftContainer = this.createContainer(10, 10, 340, 120, 0.7);
    this.shield = this.add.image(65, 70, "shield").setOrigin(0.5).setScale(0.4);
    this.healthText = this.add
      .bitmapText(
        120,
        25,
        "minogram",
        `Health: ${StructureTypes.Main.health}/${StructureTypes.Main.health}`,
        20
      )
      .setDepth(9001);
    this.coin = this.add.sprite(120, 100, "coin").setOrigin(0.5).setScale(1.5);
    this.coin.play("coin");
    this.moneyText = this.add
      .bitmapText(140, 92, "minogram", "$1000", 20)
      .setDepth(9001)
      .setTint(0xffd700);

    this.createHealthBar(120, 55);

    this.topRightContainer = this.createContainer(
      this.cameras.main.width - 230,
      10,
      220,
      120,
      0.7
    );
    this.waveText = this.add
      .bitmapText(
        this.cameras.main.width - 200,
        25,
        "minogram",
        "Oleada : 0",
        24
      )
      .setDepth(9001);
    this.enemiesText = this.add
      .bitmapText(this.cameras.main.width - 200, 55, "minogram", "0", 24)
      .setDepth(9001);

    this.createTowerButtons();

    this.tooltip = this.add
      .bitmapText(0, 0, "minogram", "", 14)
      .setDepth(10000)
      .setOrigin(0.5)
      .setAlpha(0);

    this.startWaveButton = this.add
      .bitmapText(
        this.cameras.main.width - 200,
        140,
        "minogram",
        "Iniciar Oleada",
        20
      )
      .setInteractive()
      .on("pointerdown", this.startNextWave, this)
      .setDepth(9001);

    this.startWaveButton.setTint(0xff5733);
    this.startWaveButton.setAlpha(0.8);
    this.isButtonActive = true;

    this.game.events.on("Money", (amount) => {
      this.moneyText.setText(`$${amount}`);
    });
    this.game.events.on("Remaining", (count) => {
      this.enemiesText.setText(`${count}`);
    });

    this.game.events.on("WaveOver", () => {
      this.setButtonActive();
    });

    this.game.events.on("CurrentHealth", (current) => {
      this.healthText.setText(
        `Health: ${current}/${StructureTypes.Main.health}`
      );
      this.updateHealthBar(current / StructureTypes.Main.health, 120, 55);
    });
  }

  startNextWave() {
    if (!this.isButtonActive) return;
    this.game.events.emit("StartWave");
    this.waveText.setText(`OLEADA: ${++this.waveNumber}`);
    this.setButtonInactive();
  }

  setButtonInactive() {
    this.startWaveButton.setAlpha(0.4);
    this.startWaveButton.setTint(0x999999);
    this.isButtonActive = false;
  }

  setButtonActive() {
    this.startWaveButton.setAlpha(0.8);
    this.startWaveButton.setTint(0xff5733);
    this.isButtonActive = true;
  }

  createContainer(x, y, width, height, alpha) {
    const container = this.add.graphics();

    container.fillStyle(0x000000, alpha);
    container.fillRoundedRect(x, y, width, height, 20);

    container.lineStyle(2, 0xffffff, 0.4);
    container.strokeRoundedRect(x, y, width, height, 20);

    return container;
  }

  createHealthBar(x, y) {
    this.healthBar = this.add.graphics().setDepth(9001);
    this.updateHealthBar(1, x, y);
  }

  updateHealthBar(healthPercentage, x, y) {
    this.healthBar.clear();
    this.healthBar.fillStyle(0xff0000, 1);
    this.healthBar.fillRoundedRect(x, y, 200, 20, 10);
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRoundedRect(x, y, 200 * healthPercentage, 20, 10);
    this.healthBar.lineStyle(2, 0xcccccc);
    this.healthBar.strokeRoundedRect(x, y, 200, 20, 10);
  }

  createTowerButtons() {
    const towerButtonsData = [
      {
        type: StructureTypes.Wall.id,
        textureFrame: StructureTypes.Wall.id,
        cost: StructureTypes.Wall.cost,
      },
      {
        type: StructureTypes.Farm.id,
        textureFrame: StructureTypes.Farm.id,
        cost: StructureTypes.Farm.cost,
      },
      {
        type: StructureTypes.Tower1.id,
        textureFrame: StructureTypes.Tower1.id,
        cost: StructureTypes.Tower1.cost,
      },
      {
        type: StructureTypes.Tower2.id,
        textureFrame: StructureTypes.Tower2.id,
        cost: StructureTypes.Tower2.cost,
      },
    ];

    const buttonCount = towerButtonsData.length;

    const containerWidth = buttonCount * 100;
    const containerHeight = 150;

    const containerX = (this.cameras.main.width - containerWidth) / 2;

    this.bottomContainer = this.createContainer(
      containerX,
      this.cameras.main.height - 150,
      containerWidth,
      containerHeight,
      0.8
    );

    this.towerButtons = [];
    towerButtonsData.forEach((data, index) => {
      const buttonX = containerX + 50 + index * 100;

      const button = this.add
        .image(
          buttonX,
          this.cameras.main.height - 80,
          "buildings",
          data.textureFrame
        )
        .setInteractive()
        .setScale(3);

      button.on("pointerdown", () => {
        this.selectTower(data.type, button);
        this.game.events.emit("TowerChange", {
          type: data.type,
          cost: data.cost,
        });
      });

      button.on("pointerover", () => {
        this.showTooltip(
          `$${data.cost}`,
          buttonX,
          this.cameras.main.height - 120
        );
      });
      button.on("pointerout", () => {
        this.hideTooltip();
      });

      this.towerButtons.push(button);
    });
  }

  selectTower(towerType, button) {
    this.updateHighlight(button);
  }

  updateHighlight(button) {
    this.resetHighlight();
    this.highlightGraphics = this.add.graphics().setDepth(9001);
    this.highlightGraphics.lineStyle(4, 0xffff00, 1);
    this.highlightGraphics.strokeRoundedRect(
      button.x - button.displayWidth / 2 - 10,
      button.y - button.displayHeight / 2 - 10,
      button.displayWidth + 20,
      button.displayHeight + 20
    );
  }

  resetHighlight() {
    if (this.highlightGraphics) {
      this.highlightGraphics.clear();
    }
  }

  update(time, delta) {}

  showTooltip(text, x, y) {
    this.tooltip.setText(text);
    this.tooltip.setPosition(x, y);
    this.tooltip.setAlpha(1);
  }

  hideTooltip() {
    this.tooltip.setAlpha(0);
  }

  updateWaveInfo(waveNumber, enemyCount) {
    this.waveText.setText(`OLEADA: ${waveNumber}/10`);
    this.enemiesText.setText(`ENEMIGOS: ${enemyCount}`);
  }

  updateMoneyAndHealth(money, healthPercentage) {
    this.moneyText.setText(`$${money}`);
    this.updateHealthBar(healthPercentage, 120, 10);
  }
}
