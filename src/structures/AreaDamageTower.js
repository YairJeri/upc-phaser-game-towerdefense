import Structure from "./BaseStructure.js";
import StructureTypes from "../other/StructureInfo.js";

export default class AreaDamageTower extends Structure {
  constructor(scene, id, wx, wy, tx, ty, sprite, lightId) {
    super(id, wx, wy, tx, ty, sprite, 16);

    this.setType(StructureTypes.Tower2.id);
    this.setRange(StructureTypes.Tower2.range);
    this.setLightId(lightId);
    this.setMaxHealth(100);

    this.target = null;
    this.damage = StructureTypes.Tower2.damage;
    this.attackCooldown = StructureTypes.Tower2.attackCooldown;
    this.attackTimer = 0;
    this.areaDamageRadius = StructureTypes.Tower2.areaDamage;
  }

  update(dt, enemySystem, ProjectilePool) {
    super.update(dt, enemySystem);

    this.attackTimer -= dt;

    if (this.target) {
      const dx = this.target.px - this.px;
      const dy = this.target.py - this.py;

      const distanceSq = dx * dx + dy * dy;
      const rangeSq = this.range * this.range;

      if (distanceSq > rangeSq || this.target.health <= 0) {
        this.target = null;
      }
    }

    if (!this.target) {
      this.target = this.findClosestTarget(enemySystem);
    }

    if (this.target && this.attackTimer <= 0) {
      this.fireProjectile(ProjectilePool);
      this.attackTimer = this.attackCooldown;
    }
  }

  findClosestTarget(enemySystem) {
    let closestEnemy = null;
    const rangeGlobal = this.range * 32;
    const nearbyEntities = enemySystem.query(this.px, this.py, rangeGlobal);

    let closestDistanceSq = rangeGlobal * rangeGlobal;

    for (let enemy of nearbyEntities) {
      const dx = enemy.px - this.px;
      const dy = enemy.py - this.py;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq <= closestDistanceSq && enemy.health > 0) {
        closestEnemy = enemy;
        closestDistanceSq = distanceSq;
      }
    }

    return closestEnemy;
  }

  fireProjectile(ProjectilePool) {
    ProjectilePool.spawn(
      this.px,
      this.py,
      this.target,
      this.damage,
      this.areaDamageRadius
    );
  }
}
