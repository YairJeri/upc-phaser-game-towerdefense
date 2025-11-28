export default class ProjectilePool {
  constructor(scene, size) {
    this.size = size;
    this.pool = new Array(size);
    this.freeIndexes = [];
    this.activeIndexes = [];

    for (let i = 0; i < size; i++) {
      const sprite = scene.add
        .sprite(0, 0, "buildings")
        .setVisible(false)
        .setActive(false)
        .setOrigin(0.5, 0.5)
        .setDepth(15)
        .setScale(2);

      const projectile = new Projectile(sprite);
      projectile._poolIndex = i;

      this.pool[i] = projectile;
      this.freeIndexes.push(i);
    }
  }

  spawn(x, y, target, damage = 10, areaDamageRadius = 0) {
    if (this.freeIndexes.length === 0) return null;

    const index = this.freeIndexes.pop();
    const proj = this.pool[index];

    proj.activate(x, y, target, damage, areaDamageRadius);

    const activePos = this.activeIndexes.push(index) - 1;
    proj._activePos = activePos;
    proj._activeIndex = index;

    return proj;
  }

  despawn(projectile) {
    if (!projectile || projectile._activePos === -1) return;

    const index = projectile._poolIndex;
    const pos = projectile._activePos;
    const lastPos = this.activeIndexes.length - 1;
    const lastIndex = this.activeIndexes[lastPos];

    if (pos !== lastPos) {
      this.activeIndexes[pos] = lastIndex;
      this.pool[lastIndex]._activePos = pos;
    }

    this.activeIndexes.pop();
    projectile.deactivate();
    projectile._activePos = -1;
    this.freeIndexes.push(index);
  }

  forEachActive(callback) {
    for (let i = 0; i < this.activeIndexes.length; i++) {
      const index = this.activeIndexes[i];
      callback(this.pool[index]);
    }
  }

  reset() {
    // Deactivate all active projectiles
    for (let i = 0; i < this.activeIndexes.length; i++) {
      const projectile = this.pool[this.activeIndexes[i]];
      projectile.deactivate();
    }

    // Reset pool state
    this.freeIndexes = [];
    this.activeIndexes = [];

    for (let i = 0; i < this.size; i++) {
      this.freeIndexes.push(i);
    }
  }

  update(dt, enemySystem, scene) {
    for (let i = 0; i < this.activeIndexes.length; i++) {
      const projectile = this.pool[this.activeIndexes[i]];
      projectile.update(dt, enemySystem, scene);
      if (!projectile.isActive) {
        this.despawn(projectile);
      }
    }
  }
}

class Projectile {
  constructor(sprite) {
    this.sprite = sprite;
    this.px = 0;
    this.py = 0;
    this.vx = 0;
    this.vy = 0;
    this.damage = 0;
    this.areaDamageRadius = 0;
    this.isActive = false;
    this.speed = 400;
    this.isAreaDamage = false;

    this._poolIndex = -1;
    this._activePos = -1;
  }

  activate(x, y, target, damage, areaDamageRadius = 0) {
    this.px = x;
    this.py = y;
    target;
    this.damage = damage;
    this.areaDamageRadius = areaDamageRadius;

    this.isAreaDamage = areaDamageRadius > 0;

    const dx = target.px - x;
    const dy = target.py - y;
    const dist = Math.hypot(dx, dy);
    this.vx = (dx / dist) * this.speed;
    this.vy = (dy / dist) * this.speed;
    this.sprite.setPosition(x, y).setVisible(true).setActive(true);

    if (this.isAreaDamage) {
      this.sprite.setAngle(0);
      this.sprite.setScale(2);
      this.sprite.setFrame(22);
    } else {
      this.sprite.setAngle((Math.atan2(dy, dx) * 180) / Math.PI + 90);
      this.sprite.setScale(1);
      this.sprite.setFrame(24);
    }

    this.isActive = true;
  }

  deactivate() {
    this.sprite.setVisible(false).setActive(false);
    this.isActive = false;
  }

  update(dt, enemySystem, scene) {
    if (!this.isActive) return;

    if (
      this.px < 0 ||
      this.px > scene.mapWidth ||
      this.py < 0 ||
      this.py > scene.mapHeight
    ) {
      this.deactivate();
      return;
    }

    this.px += this.vx * dt;
    this.py += this.vy * dt;
    this.sprite.setPosition(this.px, this.py);

    const nearbyEnemies = enemySystem.query(this.px, this.py, 12);
    const hitRadius = 12;

    for (let enemy of nearbyEnemies) {
      const dx = enemy.px - this.px;
      const dy = enemy.py - this.py;
      const distSq = dx * dx + dy * dy;
      if (distSq < hitRadius * hitRadius) {
        if (this.isAreaDamage) {
          this.applyAreaDamage(enemySystem);
          scene.soundSystem.playEffect(0.05);
          this.deactivate();
          scene.explosionEmitter.explode(20, this.px, this.py);
        } else {
          enemy.takeDamage(this.damage);
          this.deactivate();
        }
      }
    }
  }

  applyAreaDamage(enemySystem) {
    const enemiesInRange = enemySystem.query(
      this.px,
      this.py,
      this.areaDamageRadius
    );

    for (let enemy of enemiesInRange) {
      const dx = enemy.px - this.px;
      const dy = enemy.py - this.py;
      const distanceSq = dx * dx + dy * dy;

      if (
        distanceSq <= this.areaDamageRadius * this.areaDamageRadius &&
        enemy.health > 0
      ) {
        enemy.takeDamage(this.damage);
      }
    }
  }
}

export { Projectile };
