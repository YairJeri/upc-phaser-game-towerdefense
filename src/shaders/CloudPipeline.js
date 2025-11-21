export const CloudShader = {
  key: "CloudShader",
  fragShader: `
precision highp float;

uniform sampler2D uMainSampler;   // escena base
uniform sampler2D uCloudAtlas;    // spritesheet de nubes
uniform vec4 uClouds[64];         // x, y, scale, frameIndex
uniform int cloudCount;

uniform vec2 resolution;
uniform vec2 cameraScroll;
uniform float time;
uniform float cameraZoom;

// atlas info según tu canvas
uniform float frameWidth;   // 160
uniform float frameHeight;  // 48
uniform float atlasWidth;   // 320
uniform float atlasHeight;  // 96

varying vec2 outTexCoord;

// calcula coordenadas UV del frame
vec2 getFrameUV(float frameIndex, vec2 uv) {
    float cols = atlasWidth / frameWidth; // 2
    float fx = mod(frameIndex, cols);
    float fy = floor(frameIndex / cols);
    vec2 offset = vec2(fx * frameWidth / atlasWidth, fy * frameHeight / atlasHeight);
    vec2 scale = vec2(frameWidth / atlasWidth, frameHeight / atlasHeight);
    return offset + uv * scale;
}

void main() {
    vec2 pos = vec2(gl_FragCoord.x, resolution.y - gl_FragCoord.y);
    vec4 base = texture2D(uMainSampler, outTexCoord);
        float zoomCorrection = (cameraZoom - 1.0) / 2.0;

        float correctionX = resolution.x * zoomCorrection;
        float correctionY = resolution.y * zoomCorrection;

    vec3 cloudColor = vec3(1.0);
    float alpha = 0.0;

    for(int i = 0; i < 64; i++) {
        if(i >= cloudCount) break;

        vec4 c = uClouds[i];
        vec2 cloudPos = (c.xy - cameraScroll) * cameraZoom;

        cloudPos.x -= correctionX;
        cloudPos.y -= correctionY;
        
        float scale = c.z* cameraZoom;
        float frame = c.w;

        // calcula posición relativa dentro de la nube
        vec2 rel = vec2(
            (pos.x - (cloudPos.x - frameWidth * scale * 0.5)) / (frameWidth * scale),
            (pos.y - (cloudPos.y - frameHeight * scale * 0.5)) / (frameHeight * scale)
        );


        if(rel.x < 0.0 || rel.x > 1.0 || rel.y < 0.0 || rel.y > 1.0)
            continue;

        vec2 uv = getFrameUV(frame, rel);
        vec4 tex = texture2D(uCloudAtlas, uv);

        alpha += tex.a * 0.5; // mezcla suave de alpha
    }

    alpha = clamp(alpha, 0.0, 1.0);
    vec3 result = mix(base.rgb, cloudColor, alpha * 0.6);

    gl_FragColor = vec4(result, 1.0);
}
  `,
};

export class CloudPipeline extends Phaser.Renderer.WebGL.Pipelines
  .PostFXPipeline {
  constructor(game) {
    super({
      game: game,
      fragShader: CloudShader.fragShader,
    });
  }

  onBoot() {
    this._cloudAtlas = this.game.textures.getFrame("uCloudAtlas").glTexture;
  }

  onPreRender() {
    this.set1i("uCloudAtlas", 1);
    this.set1f("frameWidth", 160);
    this.set1f("frameHeight", 48);
    this.set1f("atlasWidth", 320);
    this.set1f("atlasHeight", 96);
  }

  onDraw(rendererTarget) {
    this.bindTexture(this._cloudAtlas, 1);
    this.bindAndDraw(rendererTarget);
  }
}
