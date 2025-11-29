import StructureTypes from "../other/StructureInfo.js";
import StructureFactory from "../structures/Structures.js";

export default class StructureManager {
  constructor(scene, width, height, tileSize = 32) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;

    this.structures = new Map();
    this.byTile = new Map();
    this.nextId = 1;
  }

  hash(x, y) {
    return y * this.width + x;
  }

  canPlace(tx, ty) {
    return !this.byTile.has(this.hash(tx, ty));
  }

  addMainStructure(x, y, lightId) {
    const id = this.nextId++;
    const tx = Math.floor(x / this.tileSize);
    const ty = Math.floor(y / this.tileSize);

    const sprite = this.scene.add.sprite(x, y, "main_structure");
    sprite.setOrigin(0.5);
    sprite.setDepth(2);
    sprite.setScale(2);
    const structure = StructureFactory.createMain(
      this.scene,
      id,
      x,
      y,
      tx,
      ty,
      sprite,
      lightId
    );

    this.structures.set(id, structure);

    this.byTile.set(this.hash(tx, ty), id);
    this.byTile.set(this.hash(tx, ty - 1), id);
    this.byTile.set(this.hash(tx - 1, ty), id);
    this.byTile.set(this.hash(tx - 1, ty - 1), id);
    return structure;
  }

  addStructure(tx, ty, type, lightId) {
    const id = this.nextId++;

    const worldX = tx * this.tileSize + this.tileSize / 2;
    const worldY = ty * this.tileSize + this.tileSize / 2;

    const sprite = this.scene.add.sprite(worldX, worldY, "buildings", type);
    sprite.setOrigin(0.5);
    sprite.setScale(2);

    let structure;

    switch (type) {
      case StructureTypes.Tower1.id:
        structure = StructureFactory.createTower1(
          this.scene,
          id,
          worldX,
          worldY,
          tx,
          ty,
          sprite,
          lightId
        );
        break;
      case StructureTypes.Tower2.id:
        structure = StructureFactory.createTower2(
          this.scene,
          id,
          worldX,
          worldY,
          tx,
          ty,
          sprite,
          lightId
        );
        break;
    }

    this.structures.set(id, structure);
    this.byTile.set(this.hash(tx, ty), id);

    return structure;
  }

  addFarm(tx, ty, lightId) {
    const id = this.nextId++;

    const worldX = tx * this.tileSize + this.tileSize / 2;
    const worldY = ty * this.tileSize + this.tileSize / 2;
    const sprite = this.scene.add.sprite(
      worldX,
      worldY,
      "buildings",
      Math.floor(Math.random() * 4)
    );
    sprite.setOrigin(0.5);
    sprite.setScale(2);

    const structure = StructureFactory.createFarm(
      this.scene,
      id,
      worldX,
      worldY,
      tx,
      ty,
      sprite,
      lightId
    );

    this.structures.set(id, structure);
    this.byTile.set(this.hash(tx, ty), id);

    return structure;
  }

  checkWall(tx, ty, isDeleting = false) {
    const neighbors = {
      left: this.structures.get(this.byTile.get(this.hash(tx - 1, ty))),
      right: this.structures.get(this.byTile.get(this.hash(tx + 1, ty))),
      top: this.structures.get(this.byTile.get(this.hash(tx, ty - 1))),
      bottom: this.structures.get(this.byTile.get(this.hash(tx, ty + 1))),
    };

    if (isDeleting) return { frame: 12, neighbors };

    const isWall = (n) => n && n.type === StructureTypes.Wall.id;

    let mask = 0;
    if (isWall(neighbors.top)) mask |= 1; // 0001
    if (isWall(neighbors.right)) mask |= 2; // 0010
    if (isWall(neighbors.bottom)) mask |= 4; // 0100
    if (isWall(neighbors.left)) mask |= 8; // 1000

    const frameTable = [
      12, // 0  ----
      18, // 1  ---T
      12, // 2  --R-
      17, // 3  --RT
      18, // 4  -B--
      18, // 5  -B-T
      11, // 6  -BR-
      21, // 7  -BRT
      12, // 8  L---
      19, // 9  L--T
      12, // 10 L-R-
      20, // 11 L-RT
      13, // 12 LB--
      15, // 13 LB-T
      14, // 14 LBR-
      16, // 15 LBRT
    ];

    return {
      frame: frameTable[mask] ?? 12,
      neighbors,
    };
  }

  updateNeighborFrames(neighbors) {
    Object.keys(neighbors).forEach((direction) => {
      const neighbor = neighbors[direction];
      if (neighbor) {
        if (neighbor.type !== StructureTypes.Wall.id) return;
        const { frame } = this.checkWall(neighbor.tx, neighbor.ty);
        neighbor.sprite.setFrame(frame);
      }
    });
  }

  addWall(tx, ty) {
    const id = this.nextId++;

    const worldX = tx * this.tileSize + this.tileSize / 2;
    const worldY = ty * this.tileSize + this.tileSize / 2;

    const sprite = this.scene.add.sprite(worldX, worldY, "buildings", 12);
    sprite.setOrigin(0.5);
    sprite.setScale(2);

    const { frame, neighbors } = this.checkWall(tx, ty);

    sprite.setFrame(frame);

    const structure = StructureFactory.createWall(
      this.scene,
      id,
      worldX,
      worldY,
      tx,
      ty,
      sprite
    );

    structure.setMaxHealth(200);

    this.structures.set(id, structure);
    this.byTile.set(this.hash(tx, ty), id);

    this.updateNeighborFrames(neighbors);

    return structure;
  }

  removeStructure(id) {
    const s = this.structures.get(id);
    if (!s) return;

    s.destroy();

    this.byTile.delete(this.hash(s.tx, s.ty));
    this.structures.delete(id);

    if (s.type === StructureTypes.Wall.id) {
      const { frame, neighbors } = this.checkWall(s.tx, s.ty, true);
      this.updateNeighborFrames(neighbors);
    }
  }

  getStructureAt(tx, ty) {
    const id = this.byTile.get(this.hash(tx, ty));
    return id ? this.structures.get(id) : null;
  }
}
