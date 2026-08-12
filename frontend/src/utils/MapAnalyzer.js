/**
 * MapAnalyzer.js
 * SVG Parser & Spatial Graph Generator for Kinetic Flow Spatial Intelligence Engine.
 * 
 * 1. Parses raw SVG text/DOM elements, bounding boxes, paths, rects, lines.
 * 2. Generates a 2D walkable grid mesh of spatial nodes and neighbor connections.
 * 3. Identifies Entry Nodes (outer boundary inputs) and Exit Nodes (outer boundary safety exits).
 * 4. Provides fallback spatial graph generation for default venues.
 */

/**
 * Helper to parse SVG text into a structural 2D graph of walkable spatial nodes.
 * @param {string} svgText - Raw XML string of SVG map
 * @param {Object} options - Custom parsing options (gridCols, gridRows, viewBox)
 * @returns {Object} Graph object { nodes, edges, entryNodes, exitNodes, viewBox }
 */
export const parseSvgToGraph = (svgText, options = {}) => {
  const gridCols = options.gridCols || 12;
  const gridRows = options.gridRows || 8;

  let width = options.width || 1000;
  let height = options.height || 600;
  let obstacles = [];

  // Parse SVG text if running in browser DOM environment
  if (typeof DOMParser !== 'undefined' && svgText) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');

      if (svgEl) {
        const viewBox = svgEl.getAttribute('viewBox');
        if (viewBox) {
          const parts = viewBox.split(/[\s,]+/).map(Number);
          if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
            width = parts[2];
            height = parts[3];
          }
        } else {
          width = parseFloat(svgEl.getAttribute('width')) || width;
          height = parseFloat(svgEl.getAttribute('height')) || height;
        }

        // Extract rects as potential obstacles or walls
        const rects = doc.querySelectorAll('rect');
        rects.forEach((rect, idx) => {
          const rx = parseFloat(rect.getAttribute('x')) || 0;
          const ry = parseFloat(rect.getAttribute('y')) || 0;
          const rw = parseFloat(rect.getAttribute('width')) || 0;
          const rh = parseFloat(rect.getAttribute('height')) || 0;
          const fill = (rect.getAttribute('fill') || '').toLowerCase();
          const isWall = fill.includes('wall') || fill.includes('black') || fill.includes('#000') || fill.includes('obstacle');
          
          if (isWall || (rw < width * 0.4 && rh < height * 0.4 && rw > 10 && rh > 10)) {
            obstacles.push({ x: rx, y: ry, width: rw, height: rh, id: `rect_${idx}` });
          }
        });
      }
    } catch (err) {
      console.warn('⚠️ SVG Parsing warning, generating fallback structural graph:', err.message);
    }
  }

  // Construct Node Mesh across Grid
  const cellWidth = width / gridCols;
  const cellHeight = height / gridRows;

  const nodes = [];
  const nodeMap = new Map();

  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const x = Math.round(c * cellWidth + cellWidth / 2);
      const y = Math.round(r * cellHeight + cellHeight / 2);
      const id = `node_${r}_${c}`;

      // Check if node hits an obstacle bounding box
      const isObstacle = obstacles.some(obs => 
        x >= obs.x && x <= obs.x + obs.width &&
        y >= obs.y && y <= obs.y + obs.height
      );

      // Determine Node Type based on position
      let type = 'corridor';
      let isEntry = false;
      let isExit = false;

      // Top row -> Entry points
      if (r === 0 && (c === 1 || c === 5 || c === 10)) {
        type = 'entry';
        isEntry = true;
      }
      // Bottom row -> Exit points
      else if (r === gridRows - 1 && (c === 2 || c === 9 || c === 11)) {
        type = 'exit';
        isExit = true;
      }
      // Central nodes -> Intersections & potential chokes
      else if ((r === Math.floor(gridRows / 2) || r === Math.floor(gridRows / 2) - 1) && (c >= 4 && c <= 7)) {
        type = 'intersection';
      }

      const node = {
        id,
        row: r,
        col: c,
        x,
        y,
        normX: parseFloat((x / width).toFixed(3)),
        normY: parseFloat((y / height).toFixed(3)),
        type,
        walkable: !isObstacle,
        congestion: 0.1, // Initial weight (0.0 to 1.0)
        neighbors: [],
        name: isEntry ? `Entry Gate ${c}` : (isExit ? `Exit Pass ${c}` : `Corridor (${c},${r})`)
      };

      nodes.push(node);
      nodeMap.set(id, node);
    }
  }

  // Generate Neighbor Edges (Orthogonal + Diagonal Connections)
  const edges = [];
  nodes.forEach(node => {
    if (!node.walkable) return;

    const { row: r, col: c } = node;
    const neighborCoords = [
      { r: r - 1, c: c },     // North
      { r: r + 1, c: c },     // South
      { r: r, c: c - 1 },     // West
      { r: r, c: c + 1 },     // East
      { r: r - 1, c: c - 1 }, // NW (Diagonal)
      { r: r - 1, c: c + 1 }, // NE (Diagonal)
      { r: r + 1, c: c - 1 }, // SW (Diagonal)
      { r: r + 1, c: c + 1 }  // SE (Diagonal)
    ];

    neighborCoords.forEach(nc => {
      const neighborId = `node_${nc.r}_${nc.c}`;
      const neighbor = nodeMap.get(neighborId);
      if (neighbor && neighbor.walkable) {
        node.neighbors.push(neighborId);
        
        // Push unique edge for rendering
        if (node.id < neighborId) {
          edges.push({
            id: `edge_${node.id}_${neighborId}`,
            from: node.id,
            to: neighbor.id,
            x1: node.x,
            y1: node.y,
            x2: neighbor.x,
            y2: neighbor.y
          });
        }
      }
    });
  });

  const entryNodes = nodes.filter(n => n.type === 'entry' && n.walkable);
  const exitNodes = nodes.filter(n => n.type === 'exit' && n.walkable);

  return {
    nodes,
    edges,
    nodeMap,
    entryNodes,
    exitNodes,
    viewBox: { width, height }
  };
};

/**
 * Generate structural venue spatial graph tailored for standard Kinetic Flow venues.
 * @param {string} venueName - Name of selected venue
 * @param {number} width - Canvas SVG width (1000)
 * @param {number} height - Canvas SVG height (600)
 * @returns {Object} Graph object containing nodes, edges, entryNodes, exitNodes
 */
export const generateVenueSpatialGraph = (venueName = 'Central Railway Terminal', width = 1000, height = 600) => {
  // Pre-defined structural spatial nodes matching venue layouts
  let customNodes = [];
  
  if (venueName === 'Central Railway Terminal') {
    customNodes = [
      // Entry Nodes
      { id: 'N_GATE1', name: 'Gate 1 (Platforms 1-4)', x: 140, y: 70, type: 'entry', walkable: true },
      { id: 'N_MAIN_IN', name: 'Main Entry Concourse', x: 500, y: 70, type: 'entry', walkable: true },
      { id: 'N_TICKET_IN', name: 'Ticketing Plaza Entry', x: 840, y: 70, type: 'entry', walkable: true },

      // Upper Walkways
      { id: 'N_WEST_UPPER', name: 'West Upper Promenade', x: 140, y: 180, type: 'corridor', walkable: true },
      { id: 'N_MID_UPPER', name: 'Central Upper Passage', x: 500, y: 180, type: 'corridor', walkable: true },
      { id: 'N_EAST_UPPER', name: 'East Upper Promenade', x: 840, y: 180, type: 'corridor', walkable: true },

      // Central Corridor & Critical Choke Nodes
      { id: 'N_WEST_CHOKE', name: 'West Corridor Bottleneck', x: 260, y: 300, type: 'corridor', walkable: true },
      { id: 'N_MAIN_CHOKE', name: 'Main Concourse Choke Point', x: 500, y: 300, type: 'intersection', walkable: true, isChoke: true },
      { id: 'N_EAST_CHOKE', name: 'East Corridor Bottleneck', x: 740, y: 300, type: 'corridor', walkable: true },

      // Bypass Corridors (Alternative Safe Routes)
      { id: 'N_WEST_BYPASS', name: 'West Emergency Bypass', x: 140, y: 420, type: 'corridor', walkable: true },
      { id: 'N_CENTRAL_BYPASS', name: 'Central Distribution Hall', x: 500, y: 420, type: 'corridor', walkable: true },
      { id: 'N_EAST_BYPASS', name: 'East Emergency Bypass', x: 840, y: 420, type: 'corridor', walkable: true },

      // Exit Nodes
      { id: 'N_SOUTH_EXIT', name: 'South Concourse Exit', x: 160, y: 530, type: 'exit', walkable: true },
      { id: 'N_CENTRAL_EXIT', name: 'Main Terminal Exit', x: 500, y: 530, type: 'exit', walkable: true },
      { id: 'N_NORTH_EXIT', name: 'Emergency Exit North', x: 840, y: 530, type: 'exit', walkable: true }
    ];
  } else if (venueName === 'IPL Stadium Sector 4') {
    customNodes = [
      { id: 'N_GATE1', name: 'Turnstile Gate A', x: 140, y: 70, type: 'entry', walkable: true },
      { id: 'N_MAIN_IN', name: 'Sector 4 Concourse', x: 500, y: 70, type: 'entry', walkable: true },
      { id: 'N_TICKET_IN', name: 'VIP Gate C', x: 840, y: 70, type: 'entry', walkable: true },

      { id: 'N_WEST_UPPER', name: 'Stairwell Ramp West', x: 140, y: 180, type: 'corridor', walkable: true },
      { id: 'N_MID_UPPER', name: 'Upper Deck Promenade', x: 500, y: 180, type: 'corridor', walkable: true },
      { id: 'N_EAST_UPPER', name: 'Stairwell Ramp East', x: 840, y: 180, type: 'corridor', walkable: true },

      { id: 'N_WEST_CHOKE', name: 'Outer Ring Choke West', x: 260, y: 300, type: 'corridor', walkable: true },
      { id: 'N_MAIN_CHOKE', name: 'Outer Ring Ramp (Choke Point)', x: 500, y: 300, type: 'intersection', walkable: true, isChoke: true },
      { id: 'N_EAST_CHOKE', name: 'Outer Ring Choke East', x: 740, y: 300, type: 'corridor', walkable: true },

      { id: 'N_WEST_BYPASS', name: 'Merchandise Bypass', x: 140, y: 420, type: 'corridor', walkable: true },
      { id: 'N_CENTRAL_BYPASS', name: 'Food Court Plaza', x: 500, y: 420, type: 'corridor', walkable: true },
      { id: 'N_EAST_BYPASS', name: 'Gate 12 Outer Corridor', x: 840, y: 420, type: 'corridor', walkable: true },

      { id: 'N_SOUTH_EXIT', name: 'Gate 8 Ground Exit', x: 160, y: 530, type: 'exit', walkable: true },
      { id: 'N_CENTRAL_EXIT', name: 'Sector Ground Exit', x: 500, y: 530, type: 'exit', walkable: true },
      { id: 'N_NORTH_EXIT', name: 'Gate 12 Bypass Exit', x: 840, y: 530, type: 'exit', walkable: true }
    ];
  } else {
    // Concert Arena
    customNodes = [
      { id: 'N_GATE1', name: 'Gate A Entry', x: 140, y: 70, type: 'entry', walkable: true },
      { id: 'N_MAIN_IN', name: 'Main Entrance Lobby', x: 500, y: 70, type: 'entry', walkable: true },
      { id: 'N_TICKET_IN', name: 'Gate C Entry', x: 840, y: 70, type: 'entry', walkable: true },

      { id: 'N_WEST_UPPER', name: 'West Lounge Corridor', x: 140, y: 180, type: 'corridor', walkable: true },
      { id: 'N_MID_UPPER', name: 'Arena Atrium', x: 500, y: 180, type: 'corridor', walkable: true },
      { id: 'N_EAST_UPPER', name: 'East Lounge Corridor', x: 840, y: 180, type: 'corridor', walkable: true },

      { id: 'N_WEST_CHOKE', name: 'West Hall Bottleneck', x: 260, y: 300, type: 'corridor', walkable: true },
      { id: 'N_MAIN_CHOKE', name: 'Gate B (Main Choke)', x: 500, y: 300, type: 'intersection', walkable: true, isChoke: true },
      { id: 'N_EAST_CHOKE', name: 'East Hall Bottleneck', x: 740, y: 300, type: 'corridor', walkable: true },

      { id: 'N_WEST_BYPASS', name: 'Exit 1 West Bypass Corridor', x: 140, y: 420, type: 'corridor', walkable: true },
      { id: 'N_CENTRAL_BYPASS', name: 'South Concourse Hall', x: 500, y: 420, type: 'corridor', walkable: true },
      { id: 'N_EAST_BYPASS', name: 'Exit 2 East Bypass Corridor', x: 840, y: 420, type: 'corridor', walkable: true },

      { id: 'N_SOUTH_EXIT', name: 'Exit 1 (West Bypass)', x: 160, y: 530, type: 'exit', walkable: true },
      { id: 'N_CENTRAL_EXIT', name: 'Main Arena Exit', x: 500, y: 530, type: 'exit', walkable: true },
      { id: 'N_NORTH_EXIT', name: 'Exit 2 (East Bypass)', x: 840, y: 530, type: 'exit', walkable: true }
    ];
  }

  // Pre-define connected network links between spatial nodes
  const nodeConnections = [
    ['N_GATE1', 'N_WEST_UPPER'],
    ['N_MAIN_IN', 'N_MID_UPPER'],
    ['N_TICKET_IN', 'N_EAST_UPPER'],
    ['N_WEST_UPPER', 'N_MID_UPPER'],
    ['N_MID_UPPER', 'N_EAST_UPPER'],
    ['N_WEST_UPPER', 'N_WEST_CHOKE'],
    ['N_MID_UPPER', 'N_MAIN_CHOKE'],
    ['N_EAST_UPPER', 'N_EAST_CHOKE'],
    ['N_WEST_CHOKE', 'N_MAIN_CHOKE'],
    ['N_MAIN_CHOKE', 'N_EAST_CHOKE'],
    ['N_WEST_CHOKE', 'N_WEST_BYPASS'],
    ['N_MAIN_CHOKE', 'N_CENTRAL_BYPASS'],
    ['N_EAST_CHOKE', 'N_EAST_BYPASS'],
    ['N_WEST_BYPASS', 'N_CENTRAL_BYPASS'],
    ['N_CENTRAL_BYPASS', 'N_EAST_BYPASS'],
    ['N_WEST_BYPASS', 'N_SOUTH_EXIT'],
    ['N_CENTRAL_BYPASS', 'N_CENTRAL_EXIT'],
    ['N_EAST_BYPASS', 'N_NORTH_EXIT']
  ];

  const nodeMap = new Map();
  const nodes = customNodes.map(n => {
    const nodeObj = {
      ...n,
      normX: parseFloat((n.x / width).toFixed(3)),
      normY: parseFloat((n.y / height).toFixed(3)),
      congestion: n.isChoke ? 0.85 : 0.1,
      neighbors: []
    };
    nodeMap.set(n.id, nodeObj);
    return nodeObj;
  });

  const edges = [];
  nodeConnections.forEach(([id1, id2], idx) => {
    const n1 = nodeMap.get(id1);
    const n2 = nodeMap.get(id2);
    if (n1 && n2) {
      n1.neighbors.push(id2);
      n2.neighbors.push(id1);
      edges.push({
        id: `edge_${id1}_${id2}`,
        from: id1,
        to: id2,
        x1: n1.x,
        y1: n1.y,
        x2: n2.x,
        y2: n2.y
      });
    }
  });

  return {
    nodes,
    edges,
    nodeMap,
    entryNodes: nodes.filter(n => n.type === 'entry'),
    exitNodes: nodes.filter(n => n.type === 'exit'),
    viewBox: { width, height }
  };
};
