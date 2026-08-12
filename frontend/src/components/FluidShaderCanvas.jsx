import React, { useEffect, useRef } from 'react';

/**
 * FluidShaderCanvas
 * WebGL canvas component executing 2D fluid dynamics with GPU driver safe GLSL ES 1.0 loops.
 */
export const FluidShaderCanvas = ({ 
  className = "fixed inset-0 w-full h-full pointer-events-auto",
  speedMultiplier = 1.0,
  densityFactor = 1.0,
  rerouteActive = false,
  repellers = [{ x: 0.50, y: 0.40, force: 2.5, radius: 0.20 }],
  attractors = [{ x: 0.84, y: 0.85, force: 2.1 }],
  onMouseMoveCoords = null
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId;
    let resizeObserver;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || window.innerWidth || 1280;
      const h = canvas.clientHeight || window.innerHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => syncSize());
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Strictly compliant GLSL ES 1.0 fragment shader
    const fsSource = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_reroute;
      uniform float u_density;

      uniform int u_repellerCount;
      uniform vec4 u_repellers[4]; // x, y, force, radius

      uniform int u_attractorCount;
      uniform vec3 u_attractors[4]; // x, y, force

      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 a0 = x - floor(x + 0.5);
        vec3 g = a0 * vec3(x0.x,x12.x,x12.z) + h * vec3(x0.y,x12.y,x12.w);
        return 130.0 * dot(m, g);
      }

      void main() {
          vec2 uv = v_texCoord;
          vec2 mouseUV = u_mouse / u_resolution;
          float distToMouse = length(uv - mouseUV);
          float mouseForce = smoothstep(0.35, 0.0, distToMouse);

          // Calculate GLSL ES 1.0 compliant force field displacements
          vec2 forceDisplacement = vec2(0.0);
          float totalRepellerForce = 0.0;
          float totalAttractorForce = 0.0;

          for (int i = 0; i < 4; i++) {
            float activeMask = float(i < u_repellerCount ? 1.0 : 0.0);
            vec2 rPos = u_repellers[i].xy;
            float rForce = u_repellers[i].z;
            float rRadius = u_repellers[i].w;
            
            float d = length(uv - rPos);
            float f = smoothstep(rRadius, 0.0, d) * rForce * activeMask;
            forceDisplacement += normalize(uv - rPos + vec2(0.0001)) * f * 0.25;
            totalRepellerForce += f;
          }

          for (int i = 0; i < 4; i++) {
            float activeMask = float(i < u_attractorCount ? 1.0 : 0.0);
            vec2 aPos = u_attractors[i].xy;
            float aForce = u_attractors[i].z;
            
            float d = length(uv - aPos);
            float f = smoothstep(0.45, 0.0, d) * aForce * activeMask;
            forceDisplacement -= normalize(uv - aPos + vec2(0.0001)) * f * 0.3;
            totalAttractorForce += f;
          }

          vec2 fluidUV = uv + forceDisplacement * (u_reroute * 0.8 + 0.2);
          float speed = 1.0 + (u_reroute * 1.5) + totalAttractorForce * 0.2;
          float scale = 3.0 * (0.8 + u_density * 0.4);

          float n1 = snoise(fluidUV * scale + u_time * 0.1 * speed + mouseForce * 0.2);
          float n2 = snoise(fluidUV * scale * 2.0 - u_time * 0.2 * speed);
          float n3 = snoise(fluidUV * scale * 4.0 + u_time * 0.3 * speed);

          float fluid = n1 * 0.5 + n2 * 0.25 + n3 * 0.125;
          fluid = smoothstep(-0.5, 0.8, fluid) * (0.7 + u_density * 0.3);

          vec3 baseBlack = vec3(0.058, 0.039, 0.039);
          vec3 richBrown = vec3(0.102, 0.071, 0.063);
          vec3 amber     = vec3(1.0, 0.749, 0.0);
          vec3 crimson   = vec3(0.863, 0.078, 0.235);
          vec3 neonGreen = vec3(0.0, 1.0, 0.533);

          vec3 color = mix(baseBlack, richBrown, fluid * 0.5);
          float waves = sin(uv.y * 20.0 + u_time * speed + fluid * 5.0 + mouseForce * 3.0) * 0.5 + 0.5;
          color = mix(color, amber, waves * fluid * 0.3);

          // Attractor vector flow highlight
          color = mix(color, neonGreen, totalAttractorForce * 0.35);

          // Repeller crimson bottleneck highlight
          float pressure = smoothstep(0.5, 0.9, fluid);
          color = mix(color, crimson, pressure * (0.8 + totalRepellerForce * 0.4));

          float scanline = sin(uv.y * u_resolution.y * 1.5) * 0.04;
          color -= scanline;

          gl_FragColor = vec4(color, 1.0);
      }
    `;

    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertShader = compileShader(gl.VERTEX_SHADER, vsSource);
    const fragShader = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertShader || !fragShader) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(prog));
      return;
    }

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uReroute = gl.getUniformLocation(prog, 'u_reroute');
    const uDensity = gl.getUniformLocation(prog, 'u_density');
    
    const uRepellerCount = gl.getUniformLocation(prog, 'u_repellerCount');
    const uRepellers = gl.getUniformLocation(prog, 'u_repellers');
    const uAttractorCount = gl.getUniformLocation(prog, 'u_attractorCount');
    const uAttractors = gl.getUniformLocation(prog, 'u_attractors');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const handleMouseMove = (event) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
        if (onMouseMoveCoords) {
          onMouseMoveCoords({ x: Math.round(nx * 100), y: Math.round((1 - ny) * 100) });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    let startTime = performance.now();

    function render(currentTime) {
      if (!gl || !canvas) return;
      if (typeof ResizeObserver === 'undefined') syncSize();

      gl.viewport(0, 0, canvas.width, canvas.height);
      const elapsedTime = (currentTime - startTime) * 0.001 * speedMultiplier;

      if (uTime) gl.uniform1f(uTime, elapsedTime);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      if (uReroute) gl.uniform1f(uReroute, rerouteActive ? 1.0 : 0.0);
      if (uDensity) gl.uniform1f(uDensity, densityFactor);

      // Pack repeller arrays into Float32Array (x, y, force, radius)
      const packedRepellers = new Float32Array(16);
      const rList = Array.isArray(repellers) ? repellers.slice(0, 4) : [];
      rList.forEach((r, i) => {
        packedRepellers[i * 4 + 0] = r.x ?? 0.5;
        packedRepellers[i * 4 + 1] = r.y ?? 0.4;
        packedRepellers[i * 4 + 2] = r.force ?? 2.0;
        packedRepellers[i * 4 + 3] = r.radius ?? 0.2;
      });

      // Pack attractor arrays into Float32Array (x, y, force)
      const packedAttractors = new Float32Array(12);
      const aList = Array.isArray(attractors) ? attractors.slice(0, 4) : [];
      aList.forEach((a, i) => {
        packedAttractors[i * 3 + 0] = a.x ?? 0.84;
        packedAttractors[i * 3 + 1] = a.y ?? 0.85;
        packedAttractors[i * 3 + 2] = a.force ?? 2.0;
      });

      if (uRepellerCount) gl.uniform1i(uRepellerCount, rList.length);
      if (uRepellers) gl.uniform4fv(uRepellers, packedRepellers);
      if (uAttractorCount) gl.uniform1i(uAttractorCount, aList.length);
      if (uAttractors) gl.uniform3fv(uAttractors, packedAttractors);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      if (resizeObserver) resizeObserver.disconnect();
      if (gl) {
        gl.deleteBuffer(buf);
        gl.deleteProgram(prog);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
      }
    };
  }, [speedMultiplier, densityFactor, rerouteActive, repellers, attractors, onMouseMoveCoords]);

  return (
    <canvas 
      ref={canvasRef} 
      className={className} 
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
};

export default FluidShaderCanvas;
