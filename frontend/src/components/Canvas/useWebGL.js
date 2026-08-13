/**
 * useWebGL.js — WebGL Context Initialization Hook
 * Single-mount pattern: compiles shaders ONCE, updates uniforms every frame.
 * Exposes updateRepellers() and updateAttractors() for reactive updates.
 * Falls back to CSS gradient if WebGL is unavailable.
 */
import { useEffect, useRef, useCallback } from 'react';
import { vertexShader, fragmentShader } from './shaders';

export function useWebGL(canvasRef, propsRef) {
  const glRef = useRef(null);
  const programRef = useRef(null);
  const uniformsRef = useRef({});
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(performance.now());
  const mouseRef = useRef({ x: 0, y: 0 });
  const webglAvailableRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ─── Sync Canvas Size ───
    let resizeObserver;
    function syncSize() {
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

    // ─── Init WebGL ───
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: false, alpha: false })
      || canvas.getContext('experimental-webgl');

    if (!gl) {
      console.warn('⚠️ WebGL not available — using CSS fallback');
      webglAvailableRef.current = false;
      return;
    }

    glRef.current = gl;

    // ─── Compile Shaders ───
    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(gl.VERTEX_SHADER, vertexShader);
    const fs = compileShader(gl.FRAGMENT_SHADER, fragmentShader);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);
    programRef.current = program;

    // ─── Full-screen Quad ───
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // ─── Uniform Locations (cached) ───
    const u = {
      time:           gl.getUniformLocation(program, 'u_time'),
      resolution:     gl.getUniformLocation(program, 'u_resolution'),
      mouse:          gl.getUniformLocation(program, 'u_mouse'),
      reroute:        gl.getUniformLocation(program, 'u_reroute'),
      density:        gl.getUniformLocation(program, 'u_density'),
      repellerCount:  gl.getUniformLocation(program, 'u_repellerCount'),
      repellers:      gl.getUniformLocation(program, 'u_repellers'),
      attractorCount: gl.getUniformLocation(program, 'u_attractorCount'),
      attractors:     gl.getUniformLocation(program, 'u_attractors'),
    };
    uniformsRef.current = u;

    // ─── Mouse Tracking ───
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = 1.0 - (e.clientY - rect.top) / rect.height;
        mouseRef.current.x = nx * canvas.width;
        mouseRef.current.y = ny * canvas.height;

        if (propsRef.current.onMouseMoveCoords) {
          propsRef.current.onMouseMoveCoords({
            x: Math.round(nx * 100),
            y: Math.round((1 - ny) * 100),
          });
        }
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ─── Render Loop ───
    function render(currentTime) {
      if (!gl || !canvas) return;
      if (typeof ResizeObserver === 'undefined') syncSize();

      const props = propsRef.current;
      gl.viewport(0, 0, canvas.width, canvas.height);

      const elapsed = (currentTime - startTimeRef.current) * 0.001 * (props.speedMultiplier || 1.0);

      // Set uniforms
      if (u.time) gl.uniform1f(u.time, elapsed);
      if (u.resolution) gl.uniform2f(u.resolution, canvas.width, canvas.height);
      if (u.mouse) gl.uniform2f(u.mouse, mouseRef.current.x, mouseRef.current.y);
      if (u.reroute) gl.uniform1f(u.reroute, props.rerouteActive ? 1.0 : 0.0);
      if (u.density) gl.uniform1f(u.density, props.densityFactor || 1.0);

      // Pack repellers (up to 8)
      const packedR = new Float32Array(32); // 8 * 4
      const rList = Array.isArray(props.repellers) ? props.repellers.slice(0, 8) : [];
      rList.forEach((r, i) => {
        packedR[i * 4 + 0] = r.x ?? 0.5;
        packedR[i * 4 + 1] = r.y ?? 0.4;
        packedR[i * 4 + 2] = r.force ?? 2.0;
        packedR[i * 4 + 3] = r.radius ?? 0.2;
      });

      // Pack attractors (up to 4)
      const packedA = new Float32Array(12); // 4 * 3
      const aList = Array.isArray(props.attractors) ? props.attractors.slice(0, 4) : [];
      aList.forEach((a, i) => {
        packedA[i * 3 + 0] = a.x ?? 0.84;
        packedA[i * 3 + 1] = a.y ?? 0.85;
        packedA[i * 3 + 2] = a.force ?? 2.0;
      });

      if (u.repellerCount) gl.uniform1i(u.repellerCount, rList.length);
      if (u.repellers) gl.uniform4fv(u.repellers, packedR);
      if (u.attractorCount) gl.uniform1i(u.attractorCount, aList.length);
      if (u.attractors) gl.uniform3fv(u.attractors, packedA);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animFrameRef.current = requestAnimationFrame(render);
    }

    animFrameRef.current = requestAnimationFrame(render);

    // ─── Cleanup ───
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      if (resizeObserver) resizeObserver.disconnect();
      if (gl) {
        gl.deleteBuffer(buf);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      }
    };
  }, []); // Single mount — never recompile

  return { glRef, webglAvailableRef };
}

export default useWebGL;
