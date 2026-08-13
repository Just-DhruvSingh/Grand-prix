/**
 * AStarEngine.js — Full A* Pathfinding Implementation
 * Binary min-heap priority queue. No external libraries.
 * Supports multi-path: returns top 3 routes to different exits.
 */

/**
 * Binary Min-Heap for O(log n) priority queue operations.
 */
class BinaryHeap {
  constructor() { this.data = []; }

  push(item) {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }

  pop() {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const end = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = end;
      this._sinkDown(0);
    }
    return top;
  }

  get size() { return this.data.length; }

  _bubbleUp(idx) {
    while (idx > 0) {
      const parent = (idx - 1) >> 1;
      if (this.data[idx].f < this.data[parent].f) {
        [this.data[idx], this.data[parent]] = [this.data[parent], this.data[idx]];
        idx = parent;
      } else break;
    }
  }

  _sinkDown(idx) {
    const len = this.data.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < len && this.data[left].f < this.data[smallest].f) smallest = left;
      if (right < len && this.data[right].f < this.data[smallest].f) smallest = right;
      if (smallest === idx) break;
      [this.data[idx], this.data[smallest]] = [this.data[smallest], this.data[idx]];
      idx = smallest;
    }
  }
}

/**
 * Euclidean distance heuristic.
 */
function heuristic(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Run A* from startId to goalId using the nodeMap.
 * Edge cost includes AI congestion weighting.
 *
 * @param {Map} nodeMap - Map<string, node>
 * @param {string} startId - Start node ID
 * @param {string} goalId - Goal node ID
 * @param {number} congestionMultiplier - Weight for congestion penalty (default 18)
 * @returns {Object|null} - { path, pathNodeIds, svgPath, totalDistance, weightedCost, bypassedChokes }
 */
export function astar(nodeMap, startId, goalId, congestionMultiplier = 18.0) {
  if (!nodeMap || !nodeMap.has(startId) || !nodeMap.has(goalId)) return null;
  if (startId === goalId) return null;

  const startNode = nodeMap.get(startId);
  const goalNode = nodeMap.get(goalId);

  const openSet = new BinaryHeap();
  const cameFrom = new Map();
  const gScore = new Map();
  const closedSet = new Set();

  gScore.set(startId, 0);
  openSet.push({ id: startId, f: heuristic(startNode, goalNode) });

  while (openSet.size > 0) {
    const current = openSet.pop();
    if (!current) break;

    if (current.id === goalId) {
      return reconstructPath(nodeMap, cameFrom, goalId, gScore.get(goalId));
    }

    if (closedSet.has(current.id)) continue;
    closedSet.add(current.id);

    const currentNode = nodeMap.get(current.id);
    if (!currentNode) continue;

    const neighbors = currentNode.neighbors || [];
    for (const neighborId of neighbors) {
      if (closedSet.has(neighborId)) continue;

      const neighborNode = nodeMap.get(neighborId);
      if (!neighborNode || neighborNode.walkable === false) continue;

      const distance = heuristic(currentNode, neighborNode);
      const congestion = neighborNode.congestion ?? 0.1;
      const penalty = 1.0 + Math.pow(congestion, 1.6) * congestionMultiplier;
      const stepCost = distance * penalty;

      const tentativeG = gScore.get(current.id) + stepCost;
      const prevG = gScore.get(neighborId) ?? Infinity;

      if (tentativeG < prevG) {
        cameFrom.set(neighborId, current.id);
        gScore.set(neighborId, tentativeG);
        openSet.push({ id: neighborId, f: tentativeG + heuristic(neighborNode, goalNode) });
      }
    }
  }

  // No path found — return straight-line fallback
  return {
    path: [startNode, goalNode],
    pathNodeIds: [startId, goalId],
    svgPath: `M ${startNode.x} ${startNode.y} L ${goalNode.x} ${goalNode.y}`,
    totalDistance: Math.round(heuristic(startNode, goalNode)),
    weightedCost: Math.round(heuristic(startNode, goalNode)),
    bypassedChokes: [],
    isFallback: true,
  };
}

/**
 * Reconstruct path and generate smooth SVG Bézier curve.
 */
function reconstructPath(nodeMap, cameFrom, goalId, totalCost) {
  const pathIds = [goalId];
  let current = goalId;

  while (cameFrom.has(current)) {
    current = cameFrom.get(current);
    pathIds.unshift(current);
  }

  const path = pathIds.map(id => nodeMap.get(id)).filter(Boolean);
  let totalDistance = 0;
  const bypassedChokes = [];

  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += heuristic(path[i], path[i + 1]);
  }

  path.forEach(node => {
    if (node.isChoke && node.congestion > 0.6) {
      bypassedChokes.push(node.name);
    }
  });

  // Smooth SVG path
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
    svgPath += ` L ${path[path.length - 1].x} ${path[path.length - 1].y}`;
  }

  return {
    path,
    pathNodeIds: pathIds,
    svgPath,
    totalDistance: Math.round(totalDistance),
    weightedCost: Math.round(totalCost),
    bypassedChokes,
    startNode: path[0],
    endNode: path[path.length - 1],
    isFallback: false,
  };
}

/**
 * Find top N escape routes from a start node to all exit nodes.
 * @param {Map} nodeMap
 * @param {string} startId
 * @param {Object[]} exitNodes - Array of exit node objects
 * @param {number} topN - Number of routes to return (default 3)
 * @param {number} congestionMultiplier
 * @returns {Object[]} Sorted array of route results
 */
export function findMultiPaths(nodeMap, startId, exitNodes, topN = 3, congestionMultiplier = 18.0) {
  const allPaths = [];

  for (const exit of exitNodes) {
    const result = astar(nodeMap, startId, exit.id, congestionMultiplier);
    if (result) {
      allPaths.push(result);
    }
  }

  allPaths.sort((a, b) => a.weightedCost - b.weightedCost);
  return allPaths.slice(0, topN);
}

export default { astar, findMultiPaths, BinaryHeap };
