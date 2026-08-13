/**
 * NodeGraph.js — 2D Node Graph Data Structure
 * Class-based graph with congestion weighting and A* format export.
 */

export class NodeGraph {
  /**
   * @param {Object[]} nodes - Array of node objects
   * @param {Object[]} edges - Array of edge objects { from, to }
   */
  constructor(nodes = [], edges = []) {
    this.nodes = nodes;
    this.edges = edges;
    this.nodeMap = new Map();
    this.adjacencyList = new Map();

    nodes.forEach(n => {
      this.nodeMap.set(n.id, n);
      this.adjacencyList.set(n.id, []);
    });

    edges.forEach(e => {
      if (this.adjacencyList.has(e.from)) {
        this.adjacencyList.get(e.from).push(e.to);
      }
      if (this.adjacencyList.has(e.to)) {
        this.adjacencyList.get(e.to).push(e.from);
      }
    });
  }

  /**
   * Get adjacent node IDs.
   */
  getNeighbors(nodeId) {
    return this.adjacencyList.get(nodeId) || [];
  }

  /**
   * Get a node by ID.
   */
  getNode(nodeId) {
    return this.nodeMap.get(nodeId) || null;
  }

  /**
   * Set AI congestion weight for a node.
   * @param {string} nodeId
   * @param {number} weight - 0.0 to 1.0
   */
  setCongestionWeight(nodeId, weight) {
    const node = this.nodeMap.get(nodeId);
    if (node) {
      node.congestion = Math.max(0, Math.min(1, weight));
    }
  }

  /**
   * Bulk update congestion weights from AI response.
   * @param {Object[]} weights - [{ id, congestion }]
   */
  updateWeights(weights) {
    if (!Array.isArray(weights)) return;
    weights.forEach(w => this.setCongestionWeight(w.id, w.congestion));
  }

  /**
   * Get traversal cost between two connected nodes.
   * Cost = euclidean_distance * (1 + congestion_penalty)
   */
  getTraversalCost(fromId, toId) {
    const from = this.nodeMap.get(fromId);
    const to = this.nodeMap.get(toId);
    if (!from || !to) return Infinity;

    const dx = from.x - to.x;
    const dy = from.y - to.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const congestion = to.congestion || 0;

    return distance * (1 + congestion);
  }

  /**
   * Find the nearest exit node from a given node.
   */
  getNearestExit(fromId) {
    const from = this.nodeMap.get(fromId);
    if (!from) return null;

    let nearest = null;
    let minDist = Infinity;

    this.nodes.forEach(n => {
      if (n.type === 'exit' || n.isExit) {
        const dx = from.x - n.x;
        const dy = from.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          nearest = n;
        }
      }
    });

    return nearest;
  }

  /**
   * Get all exit nodes.
   */
  getExitNodes() {
    return this.nodes.filter(n => n.type === 'exit' || n.isExit);
  }

  /**
   * Get all entry nodes.
   */
  getEntryNodes() {
    return this.nodes.filter(n => n.type === 'entry');
  }

  /**
   * Get all choke/bottleneck nodes.
   */
  getChokeNodes() {
    return this.nodes.filter(n => n.isChoke || (n.congestion && n.congestion > 0.6));
  }

  /**
   * Export graph in A* compatible format.
   */
  toAStarFormat() {
    return {
      nodes: this.nodes,
      edges: this.edges,
      nodeMap: this.nodeMap,
      entryNodes: this.getEntryNodes(),
      exitNodes: this.getExitNodes(),
    };
  }

  /**
   * Get total number of nodes.
   */
  get size() {
    return this.nodes.length;
  }
}

export default NodeGraph;
