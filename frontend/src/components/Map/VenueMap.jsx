/**
 * VenueMap.jsx — SVG Map Overlay on WebGL Canvas
 * Renders spatial graph nodes, edges, A* paths, and congestion indicators.
 */
import React from 'react';
import useKineticStore from '../../hooks/useKineticStore';
import PathRenderer from '../Pathfinding/PathRenderer';

export function VenueMap() {
  const nodes = useKineticStore((s) => s.nodes);
  const edges = useKineticStore((s) => s.edges);
  const showGraphOverlay = useKineticStore((s) => s.showGraphOverlay);
  const uploadedSvgContent = useKineticStore((s) => s.uploadedSvgContent);
  const isReroutingActive = useKineticStore((s) => s.isReroutingActive);
  const pressureMetrics = useKineticStore((s) => s.pressureMetrics);
  const escapePaths = useKineticStore((s) => s.escapePaths);

  const chokePressure = Math.min(99, Math.round(pressureMetrics.peakDensity || 0));
  const isHighCongestion = chokePressure > 45;

  return (
    <div className="relative w-full h-full pointer-events-none select-none overflow-hidden">

      {/* Uploaded SVG ghost render */}
      {uploadedSvgContent && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: uploadedSvgContent }}
        />
      )}

      <svg
        className="w-full h-full absolute inset-0"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow-red" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-amber" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB800" />
            <stop offset="50%" stopColor="#00F5FF" />
            <stop offset="100%" stopColor="#39FF14" />
          </linearGradient>
        </defs>

        {/* Floor grid */}
        <g opacity="0.25" stroke="#2E2820" strokeWidth="1">
          <rect x="80" y="50" width="840" height="500" rx="14" fill="none" stroke="#3A3B35" strokeWidth="2" />
          <path d="M 80 210 L 920 210 M 80 390 L 920 390" strokeWidth="1.5" strokeDasharray="6 6" />
          <line x1="320" y1="50" x2="320" y2="210" strokeWidth="1" />
          <line x1="680" y1="50" x2="680" y2="210" strokeWidth="1" />
          <line x1="320" y1="390" x2="320" y2="550" strokeWidth="1" />
          <line x1="680" y1="390" x2="680" y2="550" strokeWidth="1" />
        </g>

        {/* Graph edges */}
        {showGraphOverlay && edges.length > 0 && (
          <g opacity="0.40">
            {edges.map((edge) => (
              <line
                key={edge.id}
                x1={edge.x1} y1={edge.y1}
                x2={edge.x2} y2={edge.y2}
                stroke="#00F5FF"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            ))}
          </g>
        )}

        {/* Graph nodes */}
        {showGraphOverlay && nodes.length > 0 && (
          <g>
            {nodes.map((node) => {
              const isChoke = node.isChoke || (node.congestion && node.congestion > 0.60);
              const isEntry = node.type === 'entry';
              const isExit = node.type === 'exit' || node.isExit;

              // Check if node is in any escape path
              const inPath = escapePaths.some((ep) =>
                ep.pathNodeIds?.includes(node.id)
              );

              let nodeColor = '#00F5FF';
              let filter = 'none';

              if (isChoke) {
                nodeColor = '#FF2D55';
                filter = 'url(#glow-red)';
              } else if (isEntry) {
                nodeColor = '#FFB800';
                filter = 'url(#glow-amber)';
              } else if (isExit) {
                nodeColor = '#39FF14';
                filter = 'url(#glow-green)';
              } else if (inPath) {
                nodeColor = '#00F5FF';
                filter = 'url(#glow-cyan)';
              }

              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  {/* Choke ring */}
                  {isChoke && (
                    <circle
                      r="18"
                      fill="none"
                      stroke="#FF2D55"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                      filter="url(#glow-red)"
                      className="animate-spin"
                    />
                  )}

                  {/* Node dot */}
                  <circle
                    r={inPath ? '8' : '5'}
                    fill={nodeColor}
                    stroke="#161310"
                    strokeWidth="2"
                    filter={filter}
                  />

                  {/* Congestion badge */}
                  {node.congestion !== undefined && node.congestion > 0.25 && (
                    <g transform="translate(0, -14)">
                      <rect x="-16" y="-8" width="32" height="14" rx="3"
                        fill="#161310" stroke={nodeColor} strokeWidth="1" />
                      <text x="0" y="2" textAnchor="middle" fill={nodeColor}
                        fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold">
                        {Math.round(node.congestion * 100)}%
                      </text>
                    </g>
                  )}

                  {/* Node label */}
                  <text
                    x="0"
                    y={isChoke ? '28' : '18'}
                    textAnchor="middle"
                    fill={nodeColor}
                    fontSize="9"
                    fontFamily="Space Grotesk"
                    fontWeight={isChoke || inPath ? 'bold' : 'normal'}
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Central choke indicator */}
        {nodes.length > 0 && (() => {
          const chokeNode = nodes.find(n => n.isChoke);
          if (!chokeNode) return null;
          return (
            <g transform={`translate(${chokeNode.x}, ${chokeNode.y})`}>
              <circle
                r={isHighCongestion ? '55' : '35'}
                fill="#FF2D55"
                fillOpacity={isReroutingActive ? '0.08' : (isHighCongestion ? '0.20' : '0.10')}
                stroke="#FF2D55"
                strokeWidth={isHighCongestion ? '2' : '1'}
                strokeDasharray={isHighCongestion ? '6 4' : 'none'}
                filter="url(#glow-red)"
              />
            </g>
          );
        })()}

        {/* A* escape paths */}
        {isReroutingActive && <PathRenderer />}
      </svg>

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -44; }
        }
      `}</style>
    </div>
  );
}

export default VenueMap;
