import WallManager from "../managers/WallManager.js";
import LightSystem from "../managers/LightSystem.js";
import StructureManager from "../managers/StructureManager.js";
import SpatialHash from "../tools/SpatialHash.js";
import StructureTypes from "../other/StructureInfo.js";
import { walls } from "../other/walls.js";

export default class BuildSystem {
  constructor(scene, width, height, cell_size, NavigationSystem) {
    this.worldWidth = width;
    this.worldHeight = height;
    this.cell_size = cell_size;
    this.gridWidth = width / cell_size;
    this.gridHeight = height / cell_size;
    this.NavigationSystem = NavigationSystem;

    this.scene = scene;

    this.lightSystem = new LightSystem(
      this.scene,
      this.gridWidth,
      this.gridHeight
    );

    this.structureManager = new StructureManager(
      this.scene,
      this.gridWidth,
      this.gridHeight
    );

    this.wallManager = new WallManager(this.gridWidth, this.gridHeight);
    this.wallObjects = new Map();
    this.nextWallId = 1;
    this.wallContours;
    this.wallHash = new SpatialHash(cell_size * 4);

    this.structureHash = new SpatialHash(cell_size * 4);
  }

  getCountours() {
    return this.wallContours;
  }

  getStaticWalls() {
    return this.wallManager.getStaticWalls();
  }

  generateColliders() {
    this.wallContours = this.wallManager.generateEdges();
    this.nextWallId = 1;
    this.wallHash.clear();
    for (const [x1, y1, x2, y2] of this.wallContours) {
      const id = this.nextWallId++;
      const obj = { x1, y1, x2, y2, id };
      this.wallObjects.set(id, obj);
      this.wallHash.insertSegment(x1, y1, x2, y2, id);
    }
  }

  queryWalls(x, y) {
    const ids = this.wallHash.querySegments(x, y, 32);
    return ids.map((id) => this.wallObjects.get(id));
  }

  addMainStructure(r) {
    const id = this.lightSystem.addLight(
      this.worldWidth / 2,
      this.worldHeight / 2,
      r
    );
    const structure = this.structureManager.addMainStructure(
      this.worldWidth / 2,
      this.worldHeight / 2,
      id
    );
    this.structureHash.insert(structure);
  }

  addWall(tx, ty) {
    const structure = this.structureManager.addWall(tx, ty);
    this.structureHash.insert(structure);
    this.wallManager.addPlayerWall(tx, ty);
    this.NavigationSystem.addObstacle(tx, ty);
    this.generateColliders();
  }

  removeWall(tx, ty, structure) {
    this.structureHash.remove(structure);
    this.structureManager.removeStructure(structure.id);
    this.wallManager.removePlayerWall(tx, ty);
    this.NavigationSystem.removeObstacle(tx, ty);
    this.generateColliders();
  }

  removeMapWall(tx, ty) {
    this.wallManager.removeMapWall(tx, ty);
    this.NavigationSystem.removeMapWall(tx, ty);
    this.generateColliders();
  }

  canPlace(tx, ty) {
    return (
      this.structureManager.canPlace(tx, ty) &&
      this.lightSystem.isLit(tx, ty) &&
      !this.wallManager.hasWall(tx, ty)
    );
  }

  addTower(type, tx, ty, range) {
    const id = this.lightSystem.addLight(
      tx * this.cell_size + this.cell_size / 2,
      ty * this.cell_size + this.cell_size / 2,
      range + 1
    );
    const structure = this.structureManager.addStructure(tx, ty, type, id);
    this.structureHash.insert(structure);
  }

  addFarm(tx, ty) {
    const id = this.lightSystem.addLight(
      tx * this.cell_size + this.cell_size / 2,
      ty * this.cell_size + this.cell_size / 2,
      7
    );
    const structure = this.structureManager.addFarm(tx, ty, id);
    this.structureHash.insert(structure);
  }

  addStructure(type, tx, ty, range) {
    switch (type) {
      case StructureTypes.Main.id:
        return this.addMainStructure(range);
      case StructureTypes.Wall.id:
        return this.addWall(tx, ty);
      case StructureTypes.Tower1.id:
        return this.addTower(
          StructureTypes.Tower1.id,
          tx,
          ty,
          StructureTypes.Tower1.range
        );
      case StructureTypes.Tower2.id:
        return this.addTower(
          StructureTypes.Tower2.id,
          tx,
          ty,
          StructureTypes.Tower2.range
        );
      case StructureTypes.Farm.id:
        return this.addFarm(tx, ty);
      default:
        return null;
    }
  }

  queryStructures(x, y, radius) {
    return this.structureHash.query(x, y, radius);
  }

  removeStructure(tx, ty) {
    const structure = this.structureManager.getStructureAt(tx, ty);
    if (structure) {
      if (structure.type === StructureTypes.Wall.id) {
        this.removeWall(tx, ty, structure);
      } else {
        this.structureHash.remove(structure);
        this.lightSystem.removeLight(structure.lightId);
        this.structureManager.removeStructure(structure.id);
      }
    }
  }

  wasWallDestroyed = false;
  removeStructureObj(st) {
    const structure = st;
    if (structure.type === StructureTypes.Wall.id) {
      this.removeWall(structure.tx, structure.ty, structure);
    } else {
      this.structureHash.remove(structure);
      this.lightSystem.removeLight(structure.lightId);
      this.structureManager.removeStructure(structure.id);
    }
  }

  reset() {
    // Clear all structures except main structure
    const structuresToRemove = [];
    for (let [id, structure] of this.structureManager.structures) {
      if (structure.type !== StructureTypes.Main.id) {
        structuresToRemove.push(structure);
      }
    }

    for (let structure of structuresToRemove) {
      this.removeStructureObj(structure);
    }

    // Reset wall manager to initial state
    this.wallManager.clear();
    // Re-add map walls
    for (let i = 0; i < walls.length; i += 2) {
      this.wallManager.addMapWall(walls[i], walls[i + 1]);
    }

    // Reset light system
    this.lightSystem.reset();

    // Clear hashes
    this.wallHash.clear();
    this.structureHash.clear();

    // Regenerate colliders
    this.generateColliders();
  }

  update(dt, enemySystem, ProjectilePool) {
    this.lightSystem.update();
    for (let [id, structure] of this.structureManager.structures) {
      if (structure.isDestroyed) {
        this.removeStructureObj(structure);
      }
      structure.update(dt, enemySystem, ProjectilePool);
    }
    if (this.wasWallDestroyed) {
      this.generateColliders();
      this.wasWallDestroyed = false;
    }
  }
}
