import React from 'react';
import { CornerUpRight } from 'lucide-react';

/**
 * ROUTE_MATRIX
 * Dynamic routing map matrix mapping venue choke zones to dynamic SVG vector paths,
 * target exits, repeller force points, and attractor force points.
 */
export const ROUTE_MATRIX = {
  "Central Railway Terminal": {
    "Gate 1 (Platforms 1-4)": {
      chokeCoords: { x: 140, y: 150 },
      reroutePath: "M 140 70 L 140 240 L 160 240 L 160 540",
      targetExit: "South Concourse Exit",
      repellerPoint: { x: 0.14, y: 0.25 },
      attractorPoint: { x: 0.16, y: 0.90 }
    },
    "Main Concourse (Choke Point)": {
      chokeCoords: { x: 500, y: 300 },
      reroutePath: "M 500 70 L 500 240 L 840 240 L 840 540",
      targetExit: "Emergency Exit North",
      repellerPoint: { x: 0.50, y: 0.40 },
      attractorPoint: { x: 0.84, y: 0.90 }
    },
    "Ticketing Plaza": {
      chokeCoords: { x: 840, y: 150 },
      reroutePath: "M 840 70 L 840 240 L 840 540",
      targetExit: "Emergency Exit North",
      repellerPoint: { x: 0.84, y: 0.25 },
      attractorPoint: { x: 0.84, y: 0.90 }
    }
  },

  "IPL Stadium Sector 4": {
    "Turnstile Gate A": {
      chokeCoords: { x: 140, y: 150 },
      reroutePath: "M 140 70 L 140 240 L 160 240 L 160 540",
      targetExit: "Gate 8 Ground Exit",
      repellerPoint: { x: 0.14, y: 0.25 },
      attractorPoint: { x: 0.16, y: 0.90 }
    },
    "Outer Ring Ramp (Choke Point)": {
      chokeCoords: { x: 500, y: 300 },
      reroutePath: "M 500 70 L 500 240 L 840 240 L 840 540",
      targetExit: "Gate 12 Bypass",
      repellerPoint: { x: 0.50, y: 0.40 },
      attractorPoint: { x: 0.84, y: 0.90 }
    },
    "VIP Gate C": {
      chokeCoords: { x: 840, y: 150 },
      reroutePath: "M 840 70 L 840 240 L 840 540",
      targetExit: "Gate 12 Bypass",
      repellerPoint: { x: 0.84, y: 0.25 },
      attractorPoint: { x: 0.84, y: 0.90 }
    }
  },

  "Concert Arena": {
    "Gate A": {
      chokeCoords: { x: 140, y: 150 },
      reroutePath: "M 140 70 L 140 240 L 160 240 L 160 540",
      targetExit: "Exit 1 (West Bypass)",
      repellerPoint: { x: 0.14, y: 0.25 },
      attractorPoint: { x: 0.16, y: 0.90 }
    },
    "Gate B (Main Choke)": {
      chokeCoords: { x: 500, y: 300 },
      reroutePath: "M 500 70 L 500 240 L 840 240 L 840 540",
      targetExit: "Exit 2 (East Bypass)",
      repellerPoint: { x: 0.50, y: 0.40 },
      attractorPoint: { x: 0.84, y: 0.90 }
    },
    "Gate C": {
      chokeCoords: { x: 840, y: 150 },
      reroutePath: "M 840 70 L 840 240 L 840 540",
      targetExit: "Exit 2 (East Bypass)",
      repellerPoint: { x: 0.84, y: 0.25 },
      attractorPoint: { x: 0.84, y: 0.90 }
    }
  }
};

export const VENUE_CONFIGS = {
  "Central Railway Terminal": {
    name: "Central Railway Terminal",
    gates: [
      { id: "gate1", name: "Gate 1 (Platforms 1-4)", x: 140, y: 45, color: "#FFC400" },
      { id: "choke", name: "Main Concourse (Choke Point)", x: 500, y: 45, color: "#E0143C", isChoke: true },
      { id: "plaza", name: "Ticketing Plaza", x: 840, y: 45, color: "#00F0FF" }
    ],
    exits: [
      { id: "exitNorth", name: "Emergency Exit North", x: 840, y: 555, color: "#00FF88", targetForReroute: true },
      { id: "exitSouth", name: "South Concourse Exit", x: 160, y: 555, color: "#00FF88" }
    ],
    rooms: [
      { name: "PLATFORM CORRIDOR A", x: 180, y: 100 },
      { name: "WAITING LOUNGE", x: 480, y: 100 },
      { name: "CONCESSION KIOSK", x: 740, y: 100 },
      { name: "EAST TICKET HALL", x: 180, y: 310 },
      { name: "MAIN CONCOURSE CHOKE", x: 450, y: 310, isHighlight: true },
      { name: "WEST TICKET HALL", x: 740, y: 310 },
      { name: "SOUTH PLATFORM BAY", x: 220, y: 490 },
      { name: "BAGGAGE CLAIM", x: 520, y: 490 },
      { name: "EMERGENCY NORTH BYPASS", x: 730, y: 490 }
    ],
    concessions: [
      { name: "FOOD KIOSK A", x: 180, y: 150, width: 100 },
      { name: "EXPRESS CAFE", x: 720, y: 150, width: 110 }
    ]
  },

  "IPL Stadium Sector 4": {
    name: "IPL Stadium Sector 4",
    gates: [
      { id: "gateA", name: "Turnstile Gate A", x: 140, y: 45, color: "#FFC400" },
      { id: "ramp", name: "Outer Ring Ramp (Choke Point)", x: 500, y: 45, color: "#E0143C", isChoke: true },
      { id: "gateC", name: "VIP Gate C", x: 840, y: 45, color: "#00F0FF" }
    ],
    exits: [
      { id: "gate12", name: "Gate 12 Bypass", x: 840, y: 555, color: "#00FF88", targetForReroute: true },
      { id: "gate8", name: "Gate 8 Ground Exit", x: 160, y: 555, color: "#00FF88" }
    ],
    rooms: [
      { name: "NORTH PROMENADE", x: 180, y: 100 },
      { name: "UPPER DECK STAIRS", x: 480, y: 100 },
      { name: "VIP LOUNGE ENTRY", x: 740, y: 100 },
      { name: "SECTOR 4 RAMP A", x: 180, y: 310 },
      { name: "OUTER RING CHOKE", x: 460, y: 310, isHighlight: true },
      { name: "SECTOR 4 RAMP C", x: 740, y: 310 },
      { name: "MERCHANDISE ZONE", x: 200, y: 490 },
      { name: "FOOD COURT 1", x: 520, y: 490 },
      { name: "GATE 12 EMERGENCY PATH", x: 730, y: 490 }
    ],
    concessions: [
      { name: "MERCH STORE", x: 180, y: 150, width: 110 },
      { name: "FOOD COURT 1", x: 710, y: 150, width: 120 }
    ]
  },

  "Concert Arena": {
    name: "Concert Arena",
    gates: [
      { id: "gateA", name: "Gate A", x: 140, y: 45, color: "#FFC400" },
      { id: "gateB", name: "Gate B (Main Choke)", x: 500, y: 45, color: "#E0143C", isChoke: true },
      { id: "gateC", name: "Gate C", x: 840, y: 45, color: "#00F0FF" }
    ],
    exits: [
      { id: "exit2", name: "Exit 2 (Bypass)", x: 840, y: 555, color: "#00FF88", targetForReroute: true },
      { id: "exit1", name: "Exit 1", x: 160, y: 555, color: "#00FF88" }
    ],
    rooms: [
      { name: "NORTH CONCOURSE A", x: 180, y: 100 },
      { name: "CENTRAL ATRIUM", x: 480, y: 100 },
      { name: "NORTH CONCOURSE C", x: 740, y: 100 },
      { name: "WEST CORRIDOR", x: 180, y: 310 },
      { name: "GATE B MAIN CHOKE", x: 460, y: 310, isHighlight: true },
      { name: "EAST CORRIDOR", x: 740, y: 310 },
      { name: "SOUTH PLAZA A", x: 220, y: 490 },
      { name: "SOUTH HALL", x: 520, y: 490 },
      { name: "EMERGENCY EXIT 2 BYPASS", x: 730, y: 490 }
    ],
    concessions: [
      { name: "BEVERAGE BAR", x: 180, y: 150, width: 110 },
      { name: "VIP BAR", x: 720, y: 150, width: 100 }
    ]
  }
};

/**
 * VenueMapOverlay Component
 * Render dynamic vector map pathways and floating divergence badges based on ROUTE_MATRIX.
 */
export const VenueMapOverlay = ({ 
  selectedVenue = "Central Railway Terminal",
  crowdSize = 50000,
  schedulePhase = "Entry Gate Open",
  isReroutingActive = false,
  selectedZone = "Main Concourse (Choke Point)",
  calculatedPressure = 88,
  onSelectZone = () => {}
}) => {
  const config = VENUE_CONFIGS[selectedVenue] || VENUE_CONFIGS["Central Railway Terminal"];
  const venueMatrix = ROUTE_MATRIX[selectedVenue] || ROUTE_MATRIX["Central Railway Terminal"];
  
  // Resolve active route configuration dynamically from selected zone
  const activeRouteConfig = venueMatrix[selectedZone] || Object.values(venueMatrix)[0];
  const isHighCongestion = calculatedPressure > 75;

  return (
    <div className="relative w-full h-full pointer-events-none select-none overflow-hidden">
      
      <svg 
        className="w-full h-full absolute inset-0"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="glow-yellow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id="rerouteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFC400" />
            <stop offset="50%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#00FF88" />
          </linearGradient>
        </defs>

        {/* 1. Architectural Floor Grid & Wall Outlines */}
        <g opacity="0.35" stroke="#2A2B27" strokeWidth="1">
          <rect x="80" y="60" width="840" height="480" rx="12" fill="none" stroke="#3A3B35" strokeWidth="2" />
          <path d="M 80 220 L 320 220 M 420 220 L 720 220 M 820 220 L 920 220" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 80 400 L 340 400 M 440 400 L 680 400 M 780 400 L 920 400" strokeWidth="2" strokeDasharray="4 4" />
          
          <line x1="320" y1="60" x2="320" y2="220" strokeWidth="2" />
          <line x1="680" y1="60" x2="680" y2="220" strokeWidth="2" />
          <line x1="440" y1="400" x2="440" y2="540" strokeWidth="2" />
          <line x1="680" y1="400" x2="680" y2="540" strokeWidth="2" />

          <path d="M 200 140 H 800 M 200 470 H 800" stroke="#1F201C" strokeWidth="1" />
        </g>

        {/* 2. Room Labels */}
        <g fill="#6B7280" fontSize="10" fontFamily="JetBrains Mono" letterSpacing="1.2">
          {config.rooms.map((room, idx) => (
            <text 
              key={idx} 
              x={room.x} 
              y={room.y}
              fill={room.isHighlight ? (isReroutingActive ? "#FFC400" : "#E0143C") : "#6B7280"}
              fontWeight={room.isHighlight ? "bold" : "normal"}
            >
              {room.name}
            </text>
          ))}
        </g>

        {/* 3. Concession Points */}
        <g className="pointer-events-auto">
          {config.concessions.map((item, idx) => (
            <g key={idx} transform={`translate(${item.x}, ${item.y})`}>
              <rect x="0" y="0" width={item.width} height="36" rx="4" fill="#00F0FF" fillOpacity="0.08" stroke="#00F0FF" strokeWidth="1.5" />
              <text x={item.width / 2} y="22" textAnchor="middle" fill="#00F0FF" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                {item.name}
              </text>
            </g>
          ))}
        </g>

        {/* 4. Entry Gates */}
        <g className="pointer-events-auto cursor-pointer">
          {config.gates.map((gate) => (
            <g key={gate.id} transform={`translate(${gate.x}, ${gate.y})`} onClick={() => onSelectZone(gate.name)}>
              <rect 
                x="-60" y="-15" width="120" height="30" rx="4" 
                fill="#161310" 
                stroke={gate.name === selectedZone ? "#FFC400" : (gate.isChoke ? (isReroutingActive ? "#FFC400" : "#E0143C") : gate.color)} 
                strokeWidth={gate.isChoke || gate.name === selectedZone ? "2" : "1.5"} 
                filter={gate.isChoke ? (isReroutingActive ? "url(#glow-yellow)" : "url(#glow-red)") : "none"}
              />
              <text 
                x="0" y="4" textAnchor="middle" 
                fill={gate.name === selectedZone ? "#FFC400" : (gate.isChoke ? (isReroutingActive ? "#FFC400" : "#E0143C") : gate.color)} 
                fontSize="11" fontFamily="Space Grotesk" fontWeight="bold"
              >
                {gate.name}
              </text>
            </g>
          ))}
        </g>

        {/* 5. Emergency Exits */}
        <g className="pointer-events-auto">
          {config.exits.map((exit) => (
            <g key={exit.id} transform={`translate(${exit.x}, ${exit.y})`}>
              <rect 
                x="-65" y="-15" width="130" height="30" rx="4" 
                fill={exit.name.includes(activeRouteConfig.targetExit.split(' ')[0]) && isReroutingActive ? "#00FF88" : "#052E16"} 
                stroke="#00FF88" 
                strokeWidth={exit.name.includes(activeRouteConfig.targetExit.split(' ')[0]) && isReroutingActive ? "2.5" : "1.5"}
                filter={exit.name.includes(activeRouteConfig.targetExit.split(' ')[0]) && isReroutingActive ? "url(#glow-green)" : "none"}
              />
              <text 
                x="0" y="5" textAnchor="middle" 
                fill={exit.name.includes(activeRouteConfig.targetExit.split(' ')[0]) && isReroutingActive ? "#000000" : "#00FF88"} 
                fontSize="11" fontFamily="Space Grotesk" fontWeight="bold"
              >
                {exit.name}
              </text>
            </g>
          ))}
        </g>

        {/* 6. Dynamic Bottleneck Choke Ring */}
        <g transform={`translate(${activeRouteConfig.chokeCoords.x}, ${activeRouteConfig.chokeCoords.y})`}>
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
            <rect x="-70" y="-12" width="140" height="24" rx="4" fill="#161310" stroke="#E0143C" strokeWidth="1" />
            <text x="0" y="4" textAnchor="middle" fill="#E0143C" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
              {isReroutingActive ? 'PRESSURE DIVERGING' : `BOTTLENECK ${calculatedPressure}%`}
            </text>
          </g>
        </g>

        {/* TASK 2: DYNAMIC SVG VECTOR PATH RENDERER */}
        {isReroutingActive && (
          <g>
            <path 
              d={activeRouteConfig.reroutePath} 
              stroke="#00FFCC" 
              strokeWidth="4" 
              fill="none" 
              strokeDasharray="12 6"
              filter="url(#glow-green)"
              className="animate-[dash_1.5s_linear_infinite]" 
            />
          </g>
        )}

      </svg>

      {/* TASK 2: DYNAMIC FLOATING BADGE SHOWING RECOMMENDED DIVERGENCE */}
      {isReroutingActive && (
        <div className="absolute top-4 right-4 pointer-events-auto bg-[#161310]/95 backdrop-blur-md border border-[#00FFCC] p-3.5 rounded shadow-2xl flex items-center space-x-3 glow-green animate-pulse">
          <div className="w-9 h-9 rounded bg-[#00FFCC]/20 border border-[#00FFCC] flex items-center justify-center shrink-0">
            <CornerUpRight className="w-5 h-5 text-[#00FFCC]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-heading font-bold text-[#00FFCC] uppercase tracking-wider">
                RECOMMENDED DIVERGENCE
              </span>
              <span className="text-[9px] bg-[#00FFCC] text-black font-bold px-1.5 py-0.2 rounded uppercase">
                ACTIVE VECTOR
              </span>
            </div>
            <p className="text-sm font-mono font-extrabold text-white mt-0.5 flex items-center space-x-1.5">
              <span className="text-[#FFC400]">{activeRouteConfig.targetExit}</span>
            </p>
            <p className="text-[10px] font-mono text-gray-300 mt-1">
              Diverting crowd pressure away from {selectedZone}.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -36;
          }
        }
      `}</style>

    </div>
  );
};

export default VenueMapOverlay;
