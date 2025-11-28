export default class EntityPool {
  constructor(scene, size) {
    this.size = size;
    this.pool = new Array(size);

    this.freeIndexs = [];
    this.activeIndexs = [];

    for (let i = 0; i < size; i++) {
      const sprite = scene.add.sprite(0, 0, "enemy");
      sprite
        .setVisible(false)
        .setActive(false)
        .setOrigin(0.5, 0.5)
        .setDepth(10);
      sprite?.anims?.pause();

      const enemy = new Entity(0, 0, 0, sprite);
      enemy._poolIndex = i;
      this.pool[i] = enemy;
      this.freeIndexs.push(i);
    }
  }

  spawn(x, y, type, scale) {
    if (this.freeIndexs.length === 0) return null;

    const index = this.freeIndexs.pop();
    const enemy = this.pool[index];

    enemy.activate(x, y, type, scale);

    const activePos = this.activeIndexs.push(index) - 1;
    enemy._activePos = activePos;
    enemy._activeIndex = index;

    return enemy;
  }

  despawn(enemy) {
    if (!enemy || enemy._activePos === -1) return;

    const index = enemy._poolIndex;
    const pos = enemy._activePos;
    const lastPos = this.activeIndexs.length - 1;
    const lastIndex = this.activeIndexs[lastPos];

    if (pos !== lastPos) {
      this.activeIndexs[pos] = lastIndex;
      this.pool[lastIndex]._activePos = pos;
    }

    this.activeIndexs.pop();

    enemy.deactivate();
    enemy._activePos = -1;
    this.freeIndexs.push(index);
  }

  forEachActive(callback) {
    for (let i = 0; i < this.activeIndexs.length; i++) {
      const index = this.activeIndexs[i];
      callback(this.pool[index]);
    }
  }

  getActiveCount() {
    return this.activeIndexs.length;
  }

  getFreeCount() {
    return this.freeIndexs.length;
  }

  clear() {
    // Despawn all active entities
    while (this.activeIndexs.length > 0) {
      const index = this.activeIndexs[this.activeIndexs.length - 1];
      const enemy = this.pool[index];
      this.despawn(enemy);
    }
  }
}

class Entity {
  constructor(x, y, type, sprite) {
    this.ax = 0;
    this.ay = 0;
    this.vx = Phaser.Math.Between(-1, 1);
    this.vy = Phaser.Math.Between(-1, 1);
    this.px = x;
    this.py = y;
    this.type = type;
    this.sprite = sprite;
    this.isAttacking = false;
    this.isDying = false;
    this.isFlashing = false;
    this.flashDuration = 0.2;
    this.health = 100;
    this.flashTimer = 0;

    this._poolIndex = -1;
    this._activePos = -1;
  }

  takeDamage(damage) {
    if (this.isDying) return;
    this.health -= damage;

    if (this.health <= 0) {
      this.death();
    }
    if (!this.isFlashing) {
      this.sprite.setTint(0xff0000);
      this.isFlashing = true;
      this.flashTimer = this.flashDuration;
    }
  }

  activate(x, y, type, scale) {
    (this.px = x), (this.py = y), (this.type = type);
    this.sprite.setPosition(x, y);
    this.isFlashing = false;
    this.flashTimer = 0;
    this.isDying = false;
    this.health = 100;
    this.isAttacking = false;
    this.sprite.setVisible(true).setActive(true).setScale(scale);
    this.sprite.play("enemy_run");
  }

  deactivate() {
    this.sprite.setVisible(false).setActive(false);
  }

  attack(structure) {
    if (this.isAttacking) return;
    this.isAttacking = true;

    this.sprite.play("enemy_attack");
    this.sprite.anims.timeScale = 1;

    this.sprite.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      (animation) => {
        if (animation.key === "enemy_attack") {
          this.sprite.play("enemy_run");
          this.sprite.anims.timeScale = 1;
          this.isAttacking = false;

          if (structure) {
            structure.setCurrentHealth(structure.currentHealth - 1);
            if (structure.currentHealth <= 0) {
              structure.isDestroyed = true;
            }
          }
        }
      }
    );
  }

  death() {
    if (this.isDying) return;
    this.isDying = true;

    this.sprite.play("enemy_death");
    this.sprite.anims.timeScale = 1;
    this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isDying = false;
    });
  }

  applyForce(force) {
    this.ax += force.x;
    this.ay += force.y;
  }

  circleSegmentCollision(cx, cy, r, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    const lenSq = dx * dx + dy * dy;
    let t = ((cx - x1) * dx + (cy - y1) * dy) / lenSq;

    t = Math.max(0, Math.min(1, t));

    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    const distX = cx - closestX;
    const distY = cy - closestY;
    const distSq = distX * distX + distY * distY;

    if (distSq < r * r) {
      const dist = Math.sqrt(distSq);
      const nx = distX / dist;
      const ny = distY / dist;
      const depth = r - dist;
      return { hit: true, nx, ny, depth, closestX, closestY };
    }

    return { hit: false, closestX, closestY };
  }

  predict(dt, maxSpeed) {
    this.flashTimer -= dt;
    if (this.flashTimer <= 0) {
      this.sprite.clearTint();
      this.isFlashing = false;
    }

    this.vx += this.ax * dt * 0.5;
    this.vy += this.ay * dt * 0.5;

    const speed = Math.hypot(this.vx, this.vy);
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      this.vx *= scale;
      this.vy *= scale;
    }

    this.endx = this.px + this.vx * dt;
    this.endy = this.py + this.vy * dt;
  }

  collide(walls) {
    let hit = null;

    for (let w of walls) {
      const c = this.circleSegmentCollision(
        this.endx,
        this.endy,
        12,
        w.x1,
        w.y1,
        w.x2,
        w.y2
      );

      if (c.hit && (!hit || c.depth > hit.depth)) {
        hit = c;
      }
    }

    if (hit) {
      this.px = this.endx + hit.nx * hit.depth;
      this.py = this.endy + hit.ny * hit.depth;

      const vn = this.vx * hit.nx + this.vy * hit.ny;
      if (vn < 0) {
        this.vx -= vn * hit.nx;
        this.vy -= vn * hit.ny;
      }
    } else {
      this.px = this.endx;
      this.py = this.endy;
    }
  }

  integrate(dt) {
    this.vx += this.ax * dt * 0.5;
    this.vy += this.ay * dt * 0.5;

    this.sprite.x = this.px;
    this.sprite.y = this.py;

    this.ax = 0;
    this.ay = 0;

    if (this.vx < -10) {
      this.sprite.flipX = true;
      this.facingLeft = true;
    } else if (this.vx > 10) {
      this.sprite.flipX = false;
      this.facingLeft = false;
    }
  }
}
