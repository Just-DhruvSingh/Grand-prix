/**
 * SVGParser.js — SVG → Navigation Mesh Extractor
 * Parses SVG DOM, extracts shape elements, computes centroids.
 * Re-exported from useVenueGraph hook for standalone use.
 */

/**
 * Parse an SVG string into a list of spatial elements with centroids.
 * @param {string} svgText - Raw SVG XML string
 * @returns {{ elements: Object[], width: number, height: number } | null}
 */
export function parseSVG(svgText) {
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
      width = parts[2];
      height = parts[3];
    }
  } else {
    width = parseFloat(svgEl.getAttribute('width')) || width;
    height = parseFloat(svgEl.getAttribute('height')) || height;
  }

  const elements = [];
  const selectors = 'rect, circle, ellipse, path, polygon';

  doc.querySelectorAll(selectors).forEach((el, idx) => {
    const rawId = el.getAttribute('id') || `elem_${idx}`;
    const id = rawId.replace(/\s+/g, '_').toUpperCase().replace(/^(?!N_)(.*)$/, 'N_$1');
    const dataType = el.getAttribute('data-type') || null;
    const capacity = parseInt(el.getAttribute('data-capacity')) || 5000;
    const tag = el.tagName.toLowerCase();

    let cx = 0, cy = 0, elWidth = 0, elHeight = 0;

    if (tag === 'rect') {
      const rx = parseFloat(el.getAttribute('x')) || 0;
      const ry = parseFloat(el.getAttribute('y')) || 0;
      const rw = parseFloat(el.getAttribute('width')) || 0;
      const rh = parseFloat(el.getAttribute('height')) || 0;
      cx = rx + rw / 2;
      cy = ry + rh / 2;
      elWidth = rw;
      elHeight = rh;
    } else if (tag === 'circle') {
      cx = parseFloat(el.getAttribute('cx')) || 0;
      cy = parseFloat(el.getAttribute('cy')) || 0;
      const r = parseFloat(el.getAttribute('r')) || 0;
      elWidth = r * 2;
      elHeight = r * 2;
    } else if (tag === 'ellipse') {
      cx = parseFloat(el.getAttribute('cx')) || 0;
      cy = parseFloat(el.getAttribute('cy')) || 0;
      elWidth = (parseFloat(el.getAttribute('rx')) || 0) * 2;
      elHeight = (parseFloat(el.getAttribute('ry')) || 0) * 2;
    }

    // Auto-detect type
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
        id,
        name: rawId.replace(/_/g, ' ').replace(/-/g, ' '),
        x: Math.round(cx),
        y: Math.round(cy),
        normX: parseFloat((cx / width).toFixed(3)),
        normY: parseFloat((cy / height).toFixed(3)),
        type,
        capacity,
        isExit: type === 'exit',
        isChoke: type === 'corridor' && (elWidth < 40 || elHeight < 40),
        bbox: { x: cx - elWidth / 2, y: cy - elHeight / 2, width: elWidth, height: elHeight },
      });
    }
  });

  return { elements, width, height };
}

export default { parseSVG };
