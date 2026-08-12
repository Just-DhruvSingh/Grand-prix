import React from 'react';
import { CornerUpRight, ShieldCheck, Zap, AlertTriangle, GitBranch } from 'lucide-react';

export const ROUTE_MATRIX = {
  "Central Railway Terminal": {
    "Gate 1 (Platforms 1-4)": { targetExit: "South Concourse Exit" },
    "Main Concourse (Choke Point)": { targetExit: "Emergency Exit North" },
    "Ticketing Plaza": { targetExit: "Emergency Exit North" }
  },
  "IPL Stadium Sector 4": {
    "Turnstile Gate A": { targetExit: "Gate 8 Ground Exit" },
    "Outer Ring Ramp (Choke Point)": { targetExit: "Gate 12 Bypass" },
    "VIP Gate C": { targetExit: "Gate 12 Bypass" }
  },
  "Concert Arena": {
    "Gate A": { targetExit: "Exit 1 (West Bypass)" },
    "Gate B (Main Choke)": { targetExit: "Exit 2 (East Bypass)" },
    "Gate C": { targetExit: "Exit 2 (East Bypass)" }
  }
};

/**
 * VenueMapOverlay Component
 * Renders spatial architecture map, 2D mesh graph overlay, and real-time A* dynamic path vectors.
 */
export const VenueMapOverlay = ({ 
  selectedVenue = "Central Railway Terminal",
  crowdSize = 50000,
  schedulePhase = "Entry Gate Open",
  isReroutingActive = true,
  selectedZone = "Main Concourse (Choke Point)",
  calculatedPressure = 88,
  spatialGraph = null,
  aStarResult = null,
  showGraphOverlay = true,
  uploadedSvgContent = null,
  onSelectZone = () => {}
}) => {
  const isHighCongestion = calculatedPressure > 75;

  const nodes = spatialGraph?.nodes || [];
  const edges = spatialGraph?.edges || [];
  const aStarPath = aStarResult?.path || [];
  const aStarSvgPath = aStarResult?.svgPath || "";

  return (
    <div className="relative w-full h-full pointer-events-none select-none overflow-hidden">
      
      {/* Uploaded Raw SVG Render Container (if uploaded by user) */}
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

          <filter id="glow-yellow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFC400" />
            <stop offset="50%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#00FF88" />
          </linearGradient>
        </defs>

        {/* 1. Architectural Floor Grid & Boundary Outlines */}
        <g opacity="0.30" stroke="#2A2B27" strokeWidth="1">
          <rect x="80" y="50" width="840" height="500" rx="14" fill="none" stroke="#3A3B35" strokeWidth="2" />
          <path d="M 80 210 L 920 210 M 80 390 L 920 390" strokeWidth="1.5" strokeDasharray="6 6" />
          <line x1="320" y1="50" x2="320" y2="210" strokeWidth="2" />
          <line x1="680" y1="50" x2="680" y2="210" strokeWidth="2" />
          <line x1="320" y1="390" x2="320" y2="550" strokeWidth="2" />
          <line x1="680" y1="390" x2="680" y2="550" strokeWidth="2" />
        </g>

        {/* 2. TASK 1: GRAPH OVERLAY MESH (Vector Edges & Nodes) */}
        {showGraphOverlay && edges.length > 0 && (
          <g opacity="0.45">
            {edges.map(edge => (
              <line
                key={edge.id}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke="#00F0FF"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            ))}
          </g>
        )}

        {/* TASK 1: GRAPH OVERLAY NODES */}
        {showGraphOverlay && nodes.length > 0 && (
          <g className="pointer-events-auto">
            {nodes.map(node => {
              const isChoke = node.isChoke || (node.congestion && node.congestion > 0.60);
              const isEntry = node.type === 'entry';
              const isExit = node.type === 'exit';
              const inPath = aStarPath.some(pn => pn.id === node.id);

              let nodeColor = "#00F0FF";
              let filter = "none";

              if (isChoke) {
                nodeColor = "#E0143C";
                filter = "url(#glow-red)";
              } else if (isEntry) {
                nodeColor = "#FFC400";
                filter = "url(#glow-yellow)";
              } else if (isExit) {
                nodeColor = "#00FF88";
                filter = "url(#glow-green)";
              } else if (inPath) {
                nodeColor = "#00FFCC";
                filter = "url(#glow-cyan)";
              }

              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`} className="cursor-pointer">
                  {/* Outer Pulsing Ring for High Congestion Node */}
                  {isChoke && (
                    <circle
                      r="18"
                      fill="none"
                      stroke="#E0143C"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                      filter="url(#glow-red)"
                      className="animate-spin"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    r={inPath ? "8" : "5"}
                    fill={nodeColor}
                    stroke="#161310"
                    strokeWidth="2"
                    filter={filter}
                  />

                  {/* Congestion Percentage Badge */}
                  {node.congestion !== undefined && node.congestion > 0.25 && (
                    <g transform="translate(0, -14)">
                      <rect x="-16" y="-8" width="32" height="14" rx="3" fill="#161310" stroke={nodeColor} strokeWidth="1" />
                      <text x="0" y="2" textAnchor="middle" fill={nodeColor} fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold">
                        {Math.round(node.congestion * 100)}%
                      </text>
                    </g>
                  )}

                  {/* Node Label */}
                  <text
                    x="0"
                    y={isChoke ? "28" : "18"}
                    textAnchor="middle"
                    fill={nodeColor}
                    fontSize="9"
                    fontFamily="Space Grotesk"
                    fontWeight={isChoke || inPath ? "bold" : "normal"}
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* 3. Dynamic Bottleneck Choke Ring Focus */}
        <g transform="translate(500, 300)">
          <circle 
            r={isHighCongestion ? "65" : "45"} 
            fill="#E0143C" 
            fillOpacity={isReroutingActive ? "0.1" : (isHighCongestion ? "0.25" : "0.15")}
            stroke="#E0143C"
            strokeWidth={isHighCongestion ? "2.5" : "1"}
            strokeDasharray={isHighCongestion ? "6 4" : "none"}
            filter="url(#glow-red)"
            className={isHighCongestion && !isReroutingActive ? "animate-ping" : ""}
          />
          <circle r="28" fill="none" stroke="#E0143C" strokeWidth="2" strokeDasharray="3 3" />
          <circle r="6" fill="#E0143C" />

          <g transform="translate(0, 48)">
            <rect x="-75" y="-12" width="150" height="24" rx="4" fill="#161310" stroke="#E0143C" strokeWidth="1" />
            <text x="0" y="4" textAnchor="middle" fill="#E0143C" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
              {isReroutingActive ? 'AI BYPASS ROUTING ACTIVE' : `BOTTLENECK ${calculatedPressure}%`}
            </text>
          </g>
        </g>

        {/* 4. TASK 3: A* PATHFINDING ANIMATED VECTOR STROKE */}
        {isReroutingActive && aStarSvgPath && (
          <g>
            {/* Background Glow Path */}
            <path 
              d={aStarSvgPath} 
              stroke="#00FFCC" 
              strokeWidth="6" 
              fill="none" 
              opacity="0.3"
              filter="url(#glow-green)"
            />
            {/* Animated Dashed Vector Line */}
            <path 
              d={aStarSvgPath} 
              stroke="url(#pathGradient)" 
              strokeWidth="4" 
              fill="none" 
              strokeDasharray="14 8"
              filter="url(#glow-green)"
              className="animate-[dash_1.2s_linear_infinite]" 
            />
          </g>
        )}

      </svg>

      {/* TASK 3: DYNAMIC FLOATING BADGE FOR A* AI PATHFINDING ROUTE */}
      {isReroutingActive && aStarResult && (
        <div className="absolute top-4 right-4 pointer-events-auto bg-[#161310]/95 backdrop-blur-md border border-[#00FFCC] p-3.5 rounded shadow-2xl flex items-center space-x-3 glow-green animate-pulse">
          <div className="w-9 h-9 rounded bg-[#00FFCC]/20 border border-[#00FFCC] flex items-center justify-center shrink-0">
            <CornerUpRight className="w-5 h-5 text-[#00FFCC]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-heading font-bold text-[#00FFCC] uppercase tracking-wider">
                A* AI BYPASS PATHFINDER
              </span>
              <span className="text-[9px] bg-[#00FFCC] text-black font-bold px-1.5 py-0.2 rounded uppercase">
                OPTIMAL VECTOR
              </span>
            </div>
            <p className="text-sm font-mono font-extrabold text-white mt-0.5 flex items-center space-x-1.5">
              <span>{aStarPath[0]?.name || 'Entry Gate'}</span>
              <span className="text-[#00FFCC]">➔</span>
              <span className="text-[#00FF88]">{aStarPath[aStarPath.length - 1]?.name || 'Emergency Exit'}</span>
            </p>
            <div className="flex items-center space-x-3 text-[10px] font-mono text-gray-300 mt-1">
              <span>Cost Weight: <strong className="text-[#FFC400]">{aStarResult.weightedCost}</strong></span>
              <span>Distance: <strong className="text-white">{aStarResult.totalDistance}m</strong></span>
              <span className="text-[#00FF88] flex items-center space-x-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Choke Bypassed</span>
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -44;
          }
        }
      `}</style>

    </div>
  );
};

export default VenueMapOverlay;
