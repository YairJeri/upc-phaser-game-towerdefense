export default class LightSystem {
  constructor(scene, width, height, tileSize = 32, maxLights = 512) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.scene = scene;
    this.maxLights = maxLights;

    this.grid = new Map();

    this.lights = new Map();
    this.nextLightId = 1;

    this.pipeline = this.scene.cameras.main.getPostPipeline("lights");
    this.cam = this.scene.cameras.main;

    this.uLights = new Uint32Array(maxLights);

    this._circleCache = new Map();
  }

  _key(x, y) {
    return y * this.width + x;
  }

  _circleOffsets(radiusTiles) {
    const key = radiusTiles | 0;

    if (this._circleCache.has(key)) return this._circleCache.get(key);

    const actRad = radiusTiles - 1;
    const offsets = [];
    const rSq = actRad * actRad;
    for (let dy = -actRad; dy <= actRad; dy++) {
      for (let dx = -actRad; dx <= actRad; dx++) {
        const dSq = dx * dx + dy * dy;
        if (dSq < rSq) offsets.push([dx, dy]);
      }
    }
    this._circleCache.set(key, offsets);
    return offsets;
  }

  _gridAdd(tx, ty) {
    const key = this._key(tx, ty);
    const count = this.grid.get(key) || 0;
    this.grid.set(key, count + 1);
  }

  _gridRemove(tx, ty) {
    const key = this._key(tx, ty);
    const count = this.grid.get(key);
    if (!count) return;
    if (count <= 1) this.grid.delete(key);
    else this.grid.set(key, count - 1);
  }

  isLit(tx, ty) {
    return this.grid.has(this._key(tx, ty));
  }

  addLight(x, y, radius = 5) {
    const id = this.nextLightId++;

    const gx = Math.floor(x / this.tileSize);
    const gy = Math.floor(y / this.tileSize);

    const offsets = this._circleOffsets(radius);
    const affectedTiles = [];
    for (const [dx, dy] of offsets) {
      const tx = gx + dx;
      const ty = gy + dy;
      if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) continue;
      const key = this._key(tx, ty);
      const count = this.grid.get(key) || 0;
      this.grid.set(key, count + 1);
      affectedTiles.push(key);
    }

    const lx = Math.floor((x * 2) / this.tileSize);
    const ly = Math.floor((y * 2) / this.tileSize);
    console.log(lx, ly);
    const light = { id, lx, ly, radius, affectedTiles };
    this.lights.set(id, light);

    return id;
  }

  removeLight(id) {
    const light = this.lights.get(id);
    if (!light) return;

    for (const key of light.affectedTiles) {
      const count = this.grid.get(key);
      if (!count) continue;
      if (count <= 1) this.grid.delete(key);
      else this.grid.set(key, count - 1);
    }
    this.lights.delete(id);
  }

  reset() {
    // Clear all lights
    this.lights.clear();
    this.grid.clear();
    this.nextLightId = 1;
  }

  update() {
    let i = 0;
    for (const light of this.lights.values()) {
      if (i >= this.maxLights) break;

      const x = light.lx;
      const y = light.ly;
      const radius = light.radius * 2;

      this.uLights[i++] = (x << 16) | (y << 8) | radius;
    }

    this.pipeline.setLightCount(i);
    this.pipeline.setResolution(this.cam.width, this.cam.height);
    this.pipeline.setCameraZoom(this.cam.zoom);
    this.pipeline.set1iv("uLights", this.uLights);
    this.pipeline.setCameraScroll(this.cam.scrollX, this.cam.scrollY);
  }
}
