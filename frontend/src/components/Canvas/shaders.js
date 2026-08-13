/**
 * shaders.js — GLSL Vertex + Fragment Shader Strings
 * WebGL 1.0 / GLSL ES 1.0 compliant.
 *
 * Fragment shader features:
 * - Simplex noise velocity field (3 octaves)
 * - 8 repeller uniforms (vec4: x, y, force, radius)
 * - 4 attractor uniforms (vec3: x, y, force)
 * - Smooth HSL color mapping: cyan(0.0) → amber(0.5) → crimson(1.0)
 * - Scanline effect (every 3px, opacity 0.04)
 * - Radial vignette darkening
 */

export const vertexShader = `
  attribute vec2 a_position;
  varying vec2 v_texCoord;
  void main() {
    v_texCoord = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export const fragmentShader = `
  precision highp float;
  varying vec2 v_texCoord;

  uniform float u_time;
  uniform vec2  u_resolution;
  uniform vec2  u_mouse;
  uniform float u_reroute;
  uniform float u_density;

  uniform int  u_repellerCount;
  uniform vec4 u_repellers[8];    // x, y, force, radius

  uniform int  u_attractorCount;
  uniform vec3 u_attractors[4];   // x, y, force

  // ─── Simplex Noise ───
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x_ = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x_) - 0.5;
    vec3 a0 = x_ - floor(x_ + 0.5);
    vec3 g = a0 * vec3(x0.x, x12.x, x12.z) + h * vec3(x0.y, x12.y, x12.w);
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = v_texCoord;
    vec2 mouseUV = u_mouse / u_resolution;
    float distToMouse = length(uv - mouseUV);
    float mouseForce = smoothstep(0.35, 0.0, distToMouse);

    // ─── Force Field Accumulation ───
    vec2 forceDisplacement = vec2(0.0);
    float totalRepellerForce = 0.0;
    float totalAttractorForce = 0.0;

    // Repellers (push particles away from danger zones)
    for (int i = 0; i < 8; i++) {
      if (i >= u_repellerCount) break;
      vec2  rPos    = u_repellers[i].xy;
      float rForce  = u_repellers[i].z;
      float rRadius = u_repellers[i].w;

      float d = length(uv - rPos);
      float f = smoothstep(rRadius, 0.0, d) * rForce;
      forceDisplacement += normalize(uv - rPos + vec2(0.0001)) * f * 0.25;
      totalRepellerForce += f;
    }

    // Attractors (pull toward exits)
    for (int i = 0; i < 4; i++) {
      if (i >= u_attractorCount) break;
      vec2  aPos   = u_attractors[i].xy;
      float aForce = u_attractors[i].z;

      float d = length(uv - aPos);
      float f = smoothstep(0.45, 0.0, d) * aForce;
      forceDisplacement -= normalize(uv - aPos + vec2(0.0001)) * f * 0.3;
      totalAttractorForce += f;
    }

    // ─── Simplex Noise Field (3 octaves) ───
    vec2 fluidUV = uv + forceDisplacement * (u_reroute * 0.8 + 0.2);
    float speed = 1.0 + (u_reroute * 1.5) + totalAttractorForce * 0.2;
    float scale = 3.0 * (0.8 + u_density * 0.4);

    float n1 = snoise(fluidUV * scale + u_time * 0.1 * speed + mouseForce * 0.2);
    float n2 = snoise(fluidUV * scale * 2.0 - u_time * 0.2 * speed);
    float n3 = snoise(fluidUV * scale * 4.0 + u_time * 0.3 * speed);

    float fluid = n1 * 0.5 + n2 * 0.25 + n3 * 0.125;
    fluid = smoothstep(-0.5, 0.8, fluid) * (0.7 + u_density * 0.3);

    // ─── Color Mapping: Cyan → Amber → Crimson ───
    vec3 bgPrimary = vec3(0.086, 0.075, 0.063);
    vec3 bgWarm    = vec3(0.118, 0.102, 0.090);
    vec3 cyan      = vec3(0.0, 0.96, 1.0);
    vec3 amber     = vec3(1.0, 0.72, 0.0);
    vec3 crimson   = vec3(1.0, 0.176, 0.333);
    vec3 neonGreen = vec3(0.224, 1.0, 0.078);

    vec3 color = mix(bgPrimary, bgWarm, fluid * 0.5);

    // Fluid wave pattern
    float waves = sin(uv.y * 20.0 + u_time * speed + fluid * 5.0 + mouseForce * 3.0) * 0.5 + 0.5;
    color = mix(color, amber, waves * fluid * 0.3);

    // Attractor glow (exits → green)
    color = mix(color, neonGreen, totalAttractorForce * 0.35);

    // High-pressure crimson zones
    float pressure = smoothstep(0.5, 0.9, fluid);
    color = mix(color, crimson, pressure * (0.8 + totalRepellerForce * 0.4));

    // Low-density cyan undertone
    float lowDensity = smoothstep(0.3, 0.0, fluid) * 0.15;
    color = mix(color, cyan, lowDensity);

    // ─── Scanline Effect ───
    float scanline = sin(uv.y * u_resolution.y * 1.0) * 0.04;
    color -= scanline;

    // ─── Vignette ───
    float vignette = 1.0 - smoothstep(0.4, 1.4, length(uv - 0.5) * 1.8);
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default { vertexShader, fragmentShader };
