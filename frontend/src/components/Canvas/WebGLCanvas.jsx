/**
 * WebGLCanvas.jsx — Main WebGL Fluid Simulation Canvas
 * Persistent single-mount WebGL context with propsRef bridge.
 * Falls back to CSS gradient if WebGL is unavailable.
 */
import React, { useEffect, useRef } from 'react';
import { useWebGL } from './useWebGL';

export function WebGLCanvas({
  className = 'fixed inset-0 w-full h-full pointer-events-auto',
  speedMultiplier = 1.0,
  densityFactor = 1.0,
  rerouteActive = false,
  repellers = [{ x: 0.50, y: 0.40, force: 2.5, radius: 0.20 }],
  attractors = [{ x: 0.84, y: 0.85, force: 2.1 }],
  onMouseMoveCoords = null,
}) {
  const canvasRef = useRef(null);

  // Store latest props in ref — read by render loop without re-mounting
  const propsRef = useRef({
    speedMultiplier,
    densityFactor,
    rerouteActive,
    repellers,
    attractors,
    onMouseMoveCoords,
  });

  // Sync props to ref on every render
  useEffect(() => {
    propsRef.current = {
      speedMultiplier,
      densityFactor,
      rerouteActive,
      repellers,
      attractors,
      onMouseMoveCoords,
    };
  });

  const { webglAvailableRef } = useWebGL(canvasRef, propsRef);

  // CSS gradient fallback
  if (webglAvailableRef.current === false) {
    return (
      <div
        className={className}
        style={{
          background: `
            radial-gradient(ellipse at 50% 40%, rgba(255,45,85,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(57,255,20,0.1) 0%, transparent 40%),
            linear-gradient(180deg, #161310 0%, #1E1A17 50%, #161310 100%)
          `,
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}

export default WebGLCanvas;
