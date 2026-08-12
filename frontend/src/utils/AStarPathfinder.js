/**
 * AStarPathfinder.js
 * Real-Time A* (A-Star) Pathfinding Algorithm with AI Congestion Weighting.
 * 
 * 1. Calculates optimal walkable path from Entry Node to Exit Node.
 * 2. Incorporates AI-predicted node congestion factors (0.0 to 1.0) into the path cost.
 * 3. Dynamically re-routes path around bottleneck choke points to bypass danger zones.
 * 4. Outputs smooth SVG vector path string for visual overlay animation.
 */

/**
 * Calculate Euclidean Distance heuristic between two spatial nodes.
 */
const getEuclideanDistance = (nodeA, nodeB) => {
  const dx = nodeA.x - nodeB.x;
  const dy = nodeA.y - nodeB.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Execute A* Pathfinding search on graph.
 * 
 * @param {Object} graph - Graph object containing { nodes, nodeMap, edges }
 * @param {string} startNodeId - Starting Entry Node ID
 * @param {string} goalNodeId - Target Exit Node ID
 * @param {Object} options - Configuration parameters (congestionMultiplier)
 * @returns {Object} Search result { path, svgPath, totalDistance, weightedCost, bypassedChokes }
 */
export const findAStarPath = (graph, startNodeId, goalNodeId, options = {}) => {
  const { nodeMap } = graph;
  const congestionMultiplier = options.congestionMultiplier !== undefined ? options.congestionMultiplier : 15.0;

  if (!nodeMap || !nodeMap.has(startNodeId) || !nodeMap.has(goalNodeId)) {
    console.warn(`⚠️ A* Pathfinder: Invalid start (${startNodeId}) or goal (${goalNodeId}) node.`);
    return null;
  }

  const startNode = nodeMap.get(startNodeId);
  const goalNode = nodeMap.get(goalNodeId);

  const openSet = new Set([startNodeId]);
  const cameFrom = new Map();

  const gScore = new Map();
  const fScore = new Map();

  // Initialize scores
  nodeMap.forEach((node, id) => {
    gScore.set(id, Infinity);
    fScore.set(id, Infinity);
  });

  gScore.set(startNodeId, 0);
  fScore.set(startNodeId, getEuclideanDistance(startNode, goalNode));

  while (openSet.size > 0) {
    // Get node in openSet with lowest fScore
    let currentId = null;
    let lowestF = Infinity;
    openSet.forEach(id => {
      const f = fScore.get(id);
      if (f < lowestF) {
        lowestF = f;
        currentId = id;
      }
    });

    if (!currentId) break;

    // Reached Goal!
    if (currentId === goalNodeId) {
      return reconstructPath(graph, cameFrom, currentId, gScore.get(goalNodeId));
    }

    openSet.delete(currentId);
    const currentNode = nodeMap.get(currentId);

    // Examine neighbors
    const neighbors = currentNode.neighbors || [];
    for (const neighborId of neighbors) {
      const neighborNode = nodeMap.get(neighborId);
      if (!neighborNode || !neighborNode.walkable) continue;

      // Base step distance
      const distance = getEuclideanDistance(currentNode, neighborNode);

      // AI Congestion Penalty: Node weight skyrockets if congestion is high (0.0 to 1.0)
      const congestionFactor = neighborNode.congestion !== undefined ? neighborNode.congestion : 0.1;
      const penaltyWeight = 1.0 + Math.pow(congestionFactor, 1.6) * congestionMultiplier;
      const stepCost = distance * penaltyWeight;

      const tentativeGScore = gScore.get(currentId) + stepCost;

      if (tentativeGScore < gScore.get(neighborId)) {
        cameFrom.set(neighborId, currentId);
        gScore.set(neighborId, tentativeGScore);
        
        const hScore = getEuclideanDistance(neighborNode, goalNode);
        fScore.set(neighborId, tentativeGScore + hScore);

        if (!openSet.has(neighborId)) {
          openSet.add(neighborId);
        }
      }
    }
  }

  // Fallback: If no direct path found, return straight line to goal
  console.warn('⚠️ A* Pathfinder: Goal unreachable via open mesh, using direct fallback vector.');
  return {
    path: [startNode, goalNode],
    svgPath: `M ${startNode.x} ${startNode.y} L ${goalNode.x} ${goalNode.y}`,
    totalDistance: getEuclideanDistance(startNode, goalNode),
    weightedCost: getEuclideanDistance(startNode, goalNode),
    bypassedChokes: [],
    isBypassActive: false
  };
};

/**
 * Reconstruct optimal path array and generate smooth SVG curve path.
 */
const reconstructPath = (graph, cameFrom, currentId, totalCost) => {
  const { nodeMap } = graph;
  const path = [nodeMap.get(currentId)];

  while (cameFrom.has(currentId)) {
    currentId = cameFrom.get(currentId);
    path.unshift(nodeMap.get(currentId));
  }

  let totalDistance = 0;
  const bypassedChokes = [];

  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += getEuclideanDistance(path[i], path[i + 1]);
  }

  // Check if any high congestion choke nodes were avoided or crossed
  path.forEach(node => {
    if (node.isChoke && node.congestion > 0.6) {
      bypassedChokes.push(node.name);
    }
  });

  // Generate SVG Path (Smooth Bezier curve representation)
  let svgPath = '';
  if (path.length === 2) {
    svgPath = `M ${path[0].x} ${path[0].y} L ${path[1].x} ${path[1].y}`;
  } else if (path.length > 2) {
    svgPath = `M ${path[0].x} ${path[0].y}`;
    for (let i = 1; i < path.length - 1; i++) {
      const xc = (path[i].x + path[i + 1].x) / 2;
      const yc = (path[i].y + path[i + 1].y) / 2;
      svgPath += ` Q ${path[i].x} ${path[i].y}, ${xc} ${yc}`;
    }
    const last = path[path.length - 1];
    svgPath += ` L ${last.x} ${last.y}`;
  }

  return {
    path,
    pathNodeIds: path.map(n => n.id),
    svgPath,
    totalDistance: Math.round(totalDistance),
    weightedCost: Math.round(totalCost),
    bypassedChokes,
    isBypassActive: path.some(n => n.type === 'corridor' && n.name.toLowerCase().includes('bypass'))
  };
};
