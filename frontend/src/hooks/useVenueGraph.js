/**
 * useVenueGraph.js — SVG Parse + Graph Build Orchestration Hook
 * Builds the NodeGraph from preset topology or uploaded SVG, syncs to Zustand.
 */
import { useEffect, useCallback } from 'react';
import useKineticStore from './useKineticStore';
import { getVenueTopology } from '../lib/venues';

/**
 * Build a full graph structure from a venue topology definition.
 * @param {Object} topology - { nodes, connections }
 * @param {number} width - ViewBox width
 * @param {number} height - ViewBox height
 * @returns {Object} - { nodes, edges, nodeMap, entryNodes, exitNodes, viewBox }
 */
function buildGraphFromTopology(topology, width = 1000, height = 600) {
  const nodeMap = new Map();

  const nodes = topology.nodes.map((n) => {
    const node = {
      ...n,
      normX: parseFloat((n.x / width).toFixed(3)),
      normY: parseFloat((n.y / height).toFixed(3)),
      congestion: n.isChoke ? 0.85 : 0.1,
      walkable: true,
      neighbors: [],
    };
    nodeMap.set(n.id, node);
    return node;
  });

  const edges = [];
  topology.connections.forEach(([id1, id2]) => {
    const n1 = nodeMap.get(id1);
    const n2 = nodeMap.get(id2);
    if (n1 && n2) {
      n1.neighbors.push(id2);
      n2.neighbors.push(id1);
      edges.push({
        id: `edge_${id1}_${id2}`,
        from: id1,
        to: id2,
        x1: n1.x, y1: n1.y,
        x2: n2.x, y2: n2.y,
      });
    }
  });

  return {
    nodes,
    edges,
    nodeMap,
    entryNodes: nodes.filter((n) => n.type === 'entry'),
    exitNodes: nodes.filter((n) => n.type === 'exit' || n.isExit),
    viewBox: { width, height },
  };
}

/**
 * Parse an SVG string into a spatial mesh graph.
 * Extracts elements, computes centroids, builds edges from proximity.
 */
function parseSvgToGraph(svgText) {
  if (typeof DOMParser === 'undefined' || !svgText) return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');
  if (!svgEl) return null;

  let width = 1000, height = 600;
  const viewBox = svgEl.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      width = parts[2]; height = parts[3];
    }
  } else {
    width = parseFloat(svgEl.getAttribute('width')) || width;
    height = parseFloat(svgEl.getAttribute('height')) || height;
  }

  // Extract all shape elements
  const elements = [];
  const selectors = 'rect, circle, ellipse, path, polygon';
  doc.querySelectorAll(selectors).forEach((el, idx) => {
    const id = el.getAttribute('id') || `elem_${idx}`;
    const dataType = el.getAttribute('data-type') || null;
    const capacity = parseInt(el.getAttribute('data-capacity')) || 5000;

    let cx = 0, cy = 0, elWidth = 0, elHeight = 0;
    const tag = el.tagName.toLowerCase();

    if (tag === 'rect') {
      const rx = parseFloat(el.getAttribute('x')) || 0;
      const ry = parseFloat(el.getAttribute('y')) || 0;
      const rw = parseFloat(el.getAttribute('width')) || 0;
      const rh = parseFloat(el.getAttribute('height')) || 0;
      cx = rx + rw / 2; cy = ry + rh / 2;
      elWidth = rw; elHeight = rh;
    } else if (tag === 'circle') {
      cx = parseFloat(el.getAttribute('cx')) || 0;
      cy = parseFloat(el.getAttribute('cy')) || 0;
      const r = parseFloat(el.getAttribute('r')) || 0;
      elWidth = r * 2; elHeight = r * 2;
    } else if (tag === 'ellipse') {
      cx = parseFloat(el.getAttribute('cx')) || 0;
      cy = parseFloat(el.getAttribute('cy')) || 0;
      elWidth = (parseFloat(el.getAttribute('rx')) || 0) * 2;
      elHeight = (parseFloat(el.getAttribute('ry')) || 0) * 2;
    }

    // Auto-detect type if no data-type
    let type = dataType;
    if (!type) {
      const touchesEdge =
        cx - elWidth / 2 <= 5 || cx + elWidth / 2 >= width - 5 ||
        cy - elHeight / 2 <= 5 || cy + elHeight / 2 >= height - 5;

      if (touchesEdge) type = 'exit';
      else if (elWidth > 0 && elHeight > 0 && (elWidth / elHeight > 3 || elHeight / elWidth > 3)) type = 'corridor';
      else if (elWidth * elHeight > (width * height * 0.05)) type = 'room';
      else type = 'corridor';
    }

    if (cx > 0 || cy > 0) {
      elements.push({
        id: id.replace(/\s+/g, '_').toUpperCase().replace(/^(?!N_)/, 'N_'),
        name: id.replace(/_/g, ' '),
        x: Math.round(cx),
        y: Math.round(cy),
        type,
        capacity,
        isExit: type === 'exit',
        isChoke: type === 'corridor' && (elWidth < 40 || elHeight < 40),
        bbox: { x: cx - elWidth / 2, y: cy - elHeight / 2, width: elWidth, height: elHeight },
      });
    }
  });

  if (elements.length < 2) return null;

  // Build edges: connect elements whose bounding boxes are close
  const connections = [];
  const threshold = Math.max(width, height) * 0.3;

  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const dx = elements[i].x - elements[j].x;
      const dy = elements[i].y - elements[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < threshold) {
        connections.push([elements[i].id, elements[j].id]);
      }
    }
  }

  return buildGraphFromTopology(
    { nodes: elements, connections },
    width,
    height
  );
}

export function useVenueGraph() {
  const venue = useKineticStore((s) => s.venue);
  const uploadedSvgContent = useKineticStore((s) => s.uploadedSvgContent);
  const setGraph = useKineticStore((s) => s.setGraph);
  const addLog = useKineticStore((s) => s.addLog);

  // Build graph when venue changes (and no SVG override)
  useEffect(() => {
    if (uploadedSvgContent) return;

    const topology = getVenueTopology(venue?.name || 'Central Railway Terminal');
    const graph = buildGraphFromTopology(topology);
    setGraph(graph);
  }, [venue?.id, uploadedSvgContent]);

  // Handle SVG upload
  const handleSvgUpload = useCallback((svgText, fileName) => {
    const graph = parseSvgToGraph(svgText);
    if (graph && graph.nodes.length >= 2) {
      setGraph(graph);
      useKineticStore.getState().setUploadedSvg(svgText, fileName);
      addLog(`SVG Graph: ${fileName} (${graph.nodes.length} nodes)`, 'success');
      return { success: true, nodeCount: graph.nodes.length };
    } else {
      addLog(`SVG Parse failed: ${fileName}`, 'alert');
      return { success: false, error: 'Could not extract at least 2 nodes from SVG' };
    }
  }, [setGraph, addLog]);

  const clearSvg = useCallback(() => {
    useKineticStore.getState().clearUploadedSvg();
    const topology = getVenueTopology(useKineticStore.getState().venue?.name || 'Central Railway Terminal');
    const graph = buildGraphFromTopology(topology);
    setGraph(graph);
    addLog('SVG cleared, using preset venue graph', 'info');
  }, [setGraph, addLog]);

  return { handleSvgUpload, clearSvg, parseSvgToGraph };
}

export default useVenueGraph;
