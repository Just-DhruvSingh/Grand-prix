/**
 * PathRenderer.jsx — SVG Path Overlay for A* Escape Routes
 * Renders up to 3 color-coded animated paths.
 */
import React from 'react';
import useKineticStore from '../../hooks/useKineticStore';
import { COLORS } from '../../constants/theme';

const ROUTE_STYLES = [
  { stroke: COLORS.neonCyan,  glowFilter: 'url(#glow-cyan)',  width: 4, dash: '14 8',  label: 'Primary Route' },
  { stroke: COLORS.neonGreen, glowFilter: 'url(#glow-green)', width: 3, dash: '10 6',  label: 'Alt Route 1' },
  { stroke: COLORS.neonAmber, glowFilter: 'url(#glow-amber)', width: 2, dash: '8 4',   label: 'Alt Route 2' },
];

export function PathRenderer() {
  const escapePaths = useKineticStore((s) => s.escapePaths);

  if (!escapePaths || escapePaths.length === 0) return null;

  return (
    <g>
      {escapePaths.map((route, idx) => {
        if (!route.svgPath) return null;
        const style = ROUTE_STYLES[idx] || ROUTE_STYLES[0];

        return (
          <g key={`route-${idx}`}>
            {/* Glow background */}
            <path
              d={route.svgPath}
              stroke={style.stroke}
              strokeWidth={style.width + 4}
              fill="none"
              opacity="0.2"
              filter={style.glowFilter}
            />
            {/* Animated dashed line */}
            <path
              d={route.svgPath}
              stroke={style.stroke}
              strokeWidth={style.width}
              fill="none"
              strokeDasharray={style.dash}
              filter={style.glowFilter}
              className="animate-[dash_1.2s_linear_infinite]"
            />
            {/* Route end marker */}
            {route.endNode && (
              <g transform={`translate(${route.endNode.x}, ${route.endNode.y})`}>
                <circle r="10" fill="none" stroke={style.stroke} strokeWidth="2" />
                <circle r="4" fill={style.stroke} />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

export default PathRenderer;
