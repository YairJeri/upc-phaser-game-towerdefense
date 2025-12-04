import Structure from "./BaseStructure.js";
import StructureTypes from "../data/StructureInfo.js";

export default class VillageStructure extends Structure {
  constructor(scene, id, wx, wy, tx, ty, sprite, lightId) {
    super(id, wx, wy, tx, ty, sprite);

    this.setType(StructureTypes.Village.id);
    this.setLightId(lightId);
    this.setMaxHealth(StructureTypes.Village.health);

    this.scene = scene;
    this.coinSprite = null;

    this._waveCallback = () => {
      if (this.isDestroyed) return;

      scene.game.events.emit("MoneyGain", StructureTypes.Village.income, true);

      this.animateCoin();
    };

    scene.game.events.on("WaveOver", this._waveCallback);
  }

  createCoin() {
    if (this.coinSprite) return this.coinSprite;

    this.coinSprite = this.scene.add
      .sprite(this.px, this.py - 20, "coin")
      .setOrigin(0.5)
      .setScale(1.5)
      .setDepth(999)
      .setAlpha(0);

    this.coinSprite.play("coin");
    return this.coinSprite;
  }

  animateCoin() {
    const coin = this.createCoin();
    coin.setAlpha(1);
    coin.setPosition(this.px, this.py - 20);
    this.scene.tweens.killTweensOf(coin);

    this.scene.tweens.add({
      targets: coin,
      y: this.py - 45,
      alpha: 0,
      duration: 1200,
      ease: "Sine.easeOut",
    });
  }

  destroy() {
    this.isDestroyed = true;

    this.scene.game.events.off("WaveOver", this._waveCallback);

    if (this.coinSprite) this.coinSprite.destroy();

    super.destroy();
  }
}
