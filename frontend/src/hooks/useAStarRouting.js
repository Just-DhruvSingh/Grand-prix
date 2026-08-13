/**
 * useAStarRouting.js — Reactive A* Pathfinding Hook
 * Runs A* for each exit node, returns top 3 shortest paths with color coding.
 */
import { useEffect } from 'react';
import useKineticStore from './useKineticStore';
import { COLORS } from '../constants/theme';

/**
 * Binary min-heap priority queue for A*.
 */
class BinaryHeap {
  constructor() { this.data = []; }

  push(item) {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }

  pop() {
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
function euclidean(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Run A* pathfinding from start to goal node.
 * Uses binary min-heap and AI congestion weights.
 */
function astar(nodeMap, startId, goalId, congestionMultiplier = 18.0) {
  if (!nodeMap.has(startId) || !nodeMap.has(goalId)) return null;

  const startNode = nodeMap.get(startId);
  const goalNode = nodeMap.get(goalId);

  const openSet = new BinaryHeap();
  const cameFrom = new Map();
  const gScore = new Map();
  const closedSet = new Set();

  gScore.set(startId, 0);
  openSet.push({ id: startId, f: euclidean(startNode, goalNode) });

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

      const distance = euclidean(currentNode, neighborNode);
      const congestion = neighborNode.congestion ?? 0.1;
      const penalty = 1.0 + Math.pow(congestion, 1.6) * congestionMultiplier;
      const stepCost = distance * penalty;

      const tentativeG = gScore.get(current.id) + stepCost;
      const prevG = gScore.get(neighborId) ?? Infinity;

      if (tentativeG < prevG) {
        cameFrom.set(neighborId, current.id);
        gScore.set(neighborId, tentativeG);
        const h = euclidean(neighborNode, goalNode);
        openSet.push({ id: neighborId, f: tentativeG + h });
      }
    }
  }

  return null;
}

/**
 * Reconstruct the path and generate SVG path string.
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
    totalDistance += euclidean(path[i], path[i + 1]);
  }

  path.forEach(node => {
    if (node.isChoke && node.congestion > 0.6) {
      bypassedChokes.push(node.name);
    }
  });

  // Generate smooth SVG path (quadratic Bézier through waypoints)
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
    pathNodeIds: pathIds,
    svgPath,
    totalDistance: Math.round(totalDistance),
    weightedCost: Math.round(totalCost),
    bypassedChokes,
    startNode: path[0],
    endNode: path[path.length - 1],
  };
}

/**
 * Route color assignments for multi-path rendering.
 */
const ROUTE_COLORS = [
  { stroke: COLORS.neonCyan,  label: 'Primary Route',  dashArray: 'none' },
  { stroke: COLORS.neonGreen, label: 'Alt Route 1',    dashArray: 'none' },
  { stroke: COLORS.neonAmber, label: 'Alt Route 2',    dashArray: '8 4' },
];

export function useAStarRouting() {
  const nodes = useKineticStore((s) => s.nodes);
  const nodeMap = useKineticStore((s) => s.nodeMap);
  const entryNodes = useKineticStore((s) => s.entryNodes);
  const exitNodes = useKineticStore((s) => s.exitNodes);
  const isReroutingActive = useKineticStore((s) => s.isReroutingActive);
  const setEscapePaths = useKineticStore((s) => s.setEscapePaths);
  const addLog = useKineticStore((s) => s.addLog);

  useEffect(() => {
    if (!isReroutingActive || !nodeMap || nodeMap.size === 0 || exitNodes.length === 0) {
      setEscapePaths([]);
      return;
    }

    const startNode = entryNodes[0] || nodes[0];
    if (!startNode) {
      setEscapePaths([]);
      return;
    }

    // Run A* to every exit node, collect all valid paths
    const allPaths = [];
    for (const exit of exitNodes) {
      const result = astar(nodeMap, startNode.id, exit.id);
      if (result) {
        allPaths.push(result);
      }
    }

    // Sort by weighted cost (lowest first), take top 3
    allPaths.sort((a, b) => a.weightedCost - b.weightedCost);
    const top3 = allPaths.slice(0, 3).map((path, idx) => ({
      ...path,
      color: ROUTE_COLORS[idx]?.stroke || COLORS.neonCyan,
      label: ROUTE_COLORS[idx]?.label || `Route ${idx + 1}`,
      dashArray: ROUTE_COLORS[idx]?.dashArray || 'none',
      rank: idx + 1,
    }));

    setEscapePaths(top3);

    if (top3.length > 0) {
      addLog(
        `A* Computed ${top3.length} escape routes — optimal: ${top3[0].endNode?.name || 'Exit'}`,
        'success'
      );
    }
  }, [nodes, isReroutingActive, exitNodes.length]);

  return useKineticStore((s) => ({
    escapePaths: s.escapePaths,
    selectedPath: s.selectedPath,
    setSelectedPath: s.setSelectedPath,
  }));
}

export default useAStarRouting;
