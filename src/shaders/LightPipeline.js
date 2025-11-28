export const LightShader = {
  key: "FogShader",
  fragShader: `
    precision highp float;
precision highp int;

    uniform sampler2D uMainSampler;
    uniform int lightCount;
    uniform vec2 resolution;
    uniform int uLights[512];
    uniform float cameraZoom;

    uniform vec2 cameraScroll;

    varying vec2 outTexCoord;

    vec3 unpackLight(int pck) {
        // empaquetado como: (x << 16) | (y << 8) | r
        float x = floor(float(pck) / 65536.0);
        float y = floor(mod(float(pck) / 256.0, 256.0));
        float r = mod(float(pck), 256.0);
        return vec3(x, y, r);
    }

    void main() {
        vec2 pos = vec2(gl_FragCoord.x, resolution.y - gl_FragCoord.y);
        float cellsize = 16.0;

        float zoomCorrection = (cameraZoom - 1.0) / 2.0;

        float correctionX = resolution.x * zoomCorrection;
        float correctionY = resolution.y * zoomCorrection;

        float fog = 1.0;

        for (int i = 0; i < 512; i++) {
            if (i >= lightCount) break;


            vec3 light = unpackLight(uLights[i]);
            vec2 lightPos = (light.xy * cellsize - cameraScroll)  * cameraZoom;
            lightPos.x -= correctionX;
            lightPos.y -= correctionY;
            float radius = light.z * cellsize * cameraZoom;


            float dist = distance(pos, lightPos);
            float contribution = 1.0 - smoothstep(radius *0.6, radius, dist);

            fog *= (1.0 - contribution);
        }

        fog = clamp(fog, 0.0, 1.0);

        vec4 base = texture2D(uMainSampler, outTexCoord);

        gl_FragColor = vec4(mix(base.rgb * 0.1, base.rgb, 1.0 - fog), 1.0);
    }
  `,
};

export class LightPipeline extends Phaser.Renderer.WebGL.Pipelines
  .PostFXPipeline {
  constructor(game) {
    super({
      game: game,
      fragShader: LightShader.fragShader,
    });
  }

  setCameraScroll(x, y) {
    this.set2f("cameraScroll", x, y);
  }
  setResolution(w, h) {
    this.set2f("resolution", w, h);
  }
  setLightCount(count) {
    this.set1i("lightCount", count);
  }
  setCameraZoom(zoom) {
    this.set1f("cameraZoom", zoom);
  }

  onPreRender() {}
}
