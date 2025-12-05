import SpatialHash from "../tools/SpatialHash.js";
import EntityPool from "../tools/EntityPool.js";

const boidConfig = {
  maxforce: 0.03,
  desiredSeparation: 16,
  neighborDistance: 40,
  separationK: 4,
  alignmentK: 1.0,
  cohesionK: 0.6,
};

export default class EnemySystem {
  constructor(scene, amount, cell_size) {
    this.scene = scene;

    this.spatialHash = new SpatialHash(cell_size);
    this.amount = amount;
    this.pool = new EntityPool(scene, amount);

    this.desSepSq = boidConfig.desiredSeparation ** 2;
    this.neighDistSq = boidConfig.neighborDistance ** 2;
  }

  query(x, y, radius) {
    return this.spatialHash.query(x, y, radius);
  }

  setSpawnPoints(spawnPoints) {
    this.spawnPoints = spawnPoints;
  }

  spawnBulk(spawnPoints, amount) {
    for (let i = 0; i < amount; i++) {
      const idx = Math.floor(Math.random() * spawnPoints.length);
      const x = spawnPoints[idx].x;
      const y = spawnPoints[idx].y;
      this.spawn(x, y, 1);
    }
  }

  spawn(x, y, type, level) {
    const entity = this.pool.spawn(x, y, type, level);
    if (entity) {
      this.spatialHash.insert(entity);
    }
  }

  despawn(entity) {
    this.pool.despawn(entity);
    this.spatialHash.remove(entity);
  }

  update(dt, NavigationSystem, BuildSystem) {
    const stuckTimeLimit = 2;
    this.pool.forEachActive((entity) => {
      if (entity.isDying) {
        this.spatialHash.remove(entity);
        return;
      } else if (entity.isDead) {
        this.despawn(entity);
        return;
      }
      if (!entity.isAttacking) {
        if (entity._lastPosition === undefined) {
            entity._lastPosition = { x: entity.px, y: entity.py };
            entity._stuckTimer = 0;
        } else {
            const dx = entity.px - entity._lastPosition.x;
            const dy = entity.py - entity._lastPosition.y;
            const distanceSquared = dx * dx + dy * dy;


            const threshold = 1; // distancia mínima para considerarlo movimiento
            if (distanceSquared < threshold * threshold) {
                entity._stuckTimer += dt;
                if (entity._stuckTimer >= stuckTimeLimit) {
                    // enemigo estancado por demasiado tiempo, muere
                    entity.isDead = true;
                    return;
                }
            } else {
                entity._stuckTimer = 0;
                entity._lastPosition.x = entity.px;
                entity._lastPosition.y = entity.py;
            }
        }
      } else {
          // Reinicia timer si está atacando
          if (entity._stuckTimer !== undefined) {
              entity._stuckTimer = 0;
          }
      }


      if (entity.isAttacking) return;

      const nearbyEntities = this.spatialHash.query(
        entity.px,
        entity.py,
        boidConfig.neighborDistance
      );
      const { destroy, flow } = NavigationSystem.getVector(
        entity.px,
        entity.py
      );
      entity.applyForce({
        x: flow.x * entity.speed,
        y: flow.y * entity.speed,
      });

      const nearbyWalls = BuildSystem.queryWalls(entity.px, entity.py);

      const nearbyStructures = BuildSystem.queryStructures(
        entity.px,
        entity.py,
        entity.attackRange
      );

      this.computeBoids(entity, nearbyEntities);
      let dt_fixed = Math.min(dt, 0.1);

      this.attackNearbyTowers(entity, nearbyStructures, destroy);

      entity.predict(dt_fixed);
      entity.collide(nearbyWalls);
      entity.integrate(dt_fixed);

      this.spatialHash.update(entity);
    });
  }

  attackNearbyTowers(entity, nearbyTowers, destroy) {
    const towers = nearbyTowers.filter((t) => t.type < 10);
    const walls = nearbyTowers.filter((t) => t.type >= 10 && t.type < 22);

    let target = null;
    let isWall = false;

    if (entity.type === "mage") {
      target = this.getClosest(entity, towers);
      if (!target) {
        target = this.getClosest(entity, walls);
        isWall = true;
      }
    } else {
      if (destroy) {
        target = this.getClosest(entity, [...towers, ...walls]);
      } else {
        target = this.getClosest(entity, towers);
      }
    }

    if (target) {
      const distance = this.calculateDistance(entity, target);

      if (this.isInAttackRange(entity, target, distance, isWall)) {
        this.attack(entity, target);
      }
    }
  }

  getClosest(entity, list) {
    if (!list || list.length === 0) return null;

    let closest = null;
    let minDist = Infinity;

    for (const obj of list) {
      const dist = this.calculateDistance(entity, obj);
      if (dist < minDist) {
        minDist = dist;
        closest = obj;
      }
    }

    return closest;
  }

  calculateDistance(entity, tower) {
    const dx = entity.px - tower.sprite.x;
    const dy = entity.py - tower.sprite.y;
    return dx * dx + dy * dy;
  }

  isInAttackRange(entity, tower, distance, isWall) {
    let range = entity.attackRange;
    if (entity.type === "mage" && isWall) {
      range = entity.meleeRange;
    }
    const combinedRange = range + tower.radius;
    return distance <= combinedRange * combinedRange;
  }

  attack(entity, tower) {
    if (entity.isAttacking) return;

    entity.attack(tower);
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

  reset() {
    this.pool.clear();
    this.spatialHash.clear();
  }

  computeBoids(entity, nearbyEntities) {
    let steerX = 0,
      steerY = 0;
    let alignX = 0,
      alignY = 0;
    let cohesionX = 0,
      cohesionY = 0;
    let countN = 0,
      countS = 0;

    for (let boid of nearbyEntities) {
      if (boid === entity) continue;
      let dx = entity.px - boid.px;
      let dy = entity.py - boid.py;
      let distSq = dx * dx + dy * dy;
      if (distSq <= 0) continue;

      const sepDist =
        boidConfig.desiredSeparation * (entity.size + boid.size) * 0.5;
      const neighDist =
        boidConfig.neighborDistance * Math.max(entity.size, boid.size);

      const sepDistSq = sepDist * sepDist;
      const neighDistSq = neighDist * neighDist;

      if (distSq < neighDistSq) {
        alignX += boid.vx;
        alignY += boid.vy;
        cohesionX += boid.px;
        cohesionY += boid.py;
        countN++;
      }

      if (distSq < sepDistSq) {
        let factor = (sepDistSq - distSq) / sepDistSq;
        steerX += dx * factor;
        steerY += dy * factor;
        countS++;
      }
    }

    if (countS > 0) {
      steerX /= countS;
      steerY /= countS;

      let mag_sq = steerX * steerX + steerY * steerY;
      if (mag_sq > 0) {
        let invMag = entity.speed / Math.sqrt(mag_sq);
        steerX = (steerX * invMag - entity.vx) * boidConfig.separationK;
        steerY = (steerY * invMag - entity.vy) * boidConfig.separationK;
      }
    }
    if (countN > 0) {
      alignX /= countN;
      alignY /= countN;
      cohesionX /= countN;
      cohesionY /= countN;

      let mag_sq = alignX * alignX + alignY * alignY;
      if (mag_sq > 0) {
        let invMag = entity.speed / Math.sqrt(mag_sq);
        alignX = (alignX * invMag - entity.vx) * boidConfig.alignmentK;
        alignY = (alignY * invMag - entity.vy) * boidConfig.alignmentK;
      }

      let dx = cohesionX - entity.px;
      let dy = cohesionY - entity.py;
      mag_sq = dx * dx + dy * dy;
      if (mag_sq > 0) {
        let invMag = entity.speed / Math.sqrt(mag_sq);
        cohesionX = (dx * invMag - entity.vx) * boidConfig.cohesionK;
        cohesionY = (dy * invMag - entity.vy) * boidConfig.cohesionK;
      }
    }

    entity.applyForce({
      x: steerX + cohesionX + alignX,
      y: steerY + cohesionY + alignY,
    });
  }
}
