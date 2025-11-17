export default class Structure {
  constructor(id, wx, wy, tx, ty, sprite, radius) {
    this.id = id;
    this.px = wx;
    this.py = wy;
    this.tx = tx;
    this.ty = ty;
    this.radius = radius;
    this.sprite = sprite;
    this.isDestroyed = false;
  }

  update(dt, enemySystem, ProjectilePool) {}

  setType(type) {
    this.type = type;
  }

  setRange(range) {
    this.range = range;
  }

  setLightId(lightId) {
    this.lightId = lightId;
  }

  setMaxHealth(maxHealth) {
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
  }

  setCurrentHealth(currentHealth, scene) {
    this.currentHealth = currentHealth;
  }

  destroy() {
    this.sprite.destroy();
  }
}
