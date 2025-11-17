export default class CloudManager {
  constructor(scene, cloudAtlasKey, numClouds = 64) {
    this.scene = scene;
    this.cloudAtlasKey = cloudAtlasKey;
    this.numClouds = numClouds;

    this.clouds = [];

    for (let i = 0; i < numClouds; i++) {
      const x = Phaser.Math.Between(0, scene.mapWidth);
      const y = Phaser.Math.Between(0, scene.mapHeight);
      const scale = Phaser.Math.FloatBetween(1, 2.5);
      const frame = Phaser.Math.Between(0, 3);
      this.clouds.push({ x, y, scale, frame });
    }

    this.pipeline = scene.cameras.main.getPostPipeline("clouds");
    if (Array.isArray(this.pipeline)) this.pipeline = this.pipeline[0];

    this.pipeline.setTexture2D(
      "uCloudAtlas",
      this.scene.textures.get(this.cloudAtlasKey).getSourceImage()
    );
  }

  updateUniforms(dt) {
    const cam = this.scene.cameras.main;
    const data = new Float32Array(64 * 4);

    for (let i = 0; i < this.clouds.length; i++) {
      const c = this.clouds[i];
      data[i * 4 + 0] = c.x;
      data[i * 4 + 1] = c.y;
      data[i * 4 + 2] = c.scale;
      data[i * 4 + 3] = c.frame;
    }

    this.pipeline.set4fv("uClouds", data);
    this.pipeline.set1i("cloudCount", this.clouds.length);
    this.pipeline.set2f("resolution", cam.width, cam.height);
    this.pipeline.set2f("cameraScroll", cam.scrollX, cam.scrollY);
    this.pipeline.set1f("time", dt);
  }

  update(dt) {
    for (const c of this.clouds) {
      c.x += (dt * 40) / c.scale;
      if (c.x > this.scene.mapWidth + 64) {
        c.x = -64;
        c.y = Phaser.Math.Between(0, this.scene.mapHeight);
      }
    }

    this.updateUniforms(dt);
  }
}
