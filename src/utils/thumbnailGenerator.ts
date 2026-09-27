import { TileColor, TileType, ClusterCellOffset } from '../types/game';

// Cache for generated 2D isometric thumbnails
const thumbnailCache = new Map<string, string>();

const COLOR_PALETTE: Record<TileColor, { top: string; left: string; right: string; accent: string; border: string }> = {
  neutral: { top: '#e2e8f0', left: '#cbd5e1', right: '#94a3b8', accent: '#c87d55', border: '#94a3b8' },
  amber: { top: '#fef3c7', left: '#fde68a', right: '#f59e0b', accent: '#d97706', border: '#f59e0b' },
  emerald: { top: '#d1fae5', left: '#a7f3d0', right: '#10b981', accent: '#059669', border: '#10b981' },
  sapphire: { top: '#dbeafe', left: '#bfdbfe', right: '#3b82f6', accent: '#2563eb', border: '#3b82f6' },
  ruby: { top: '#ffe4e6', left: '#fecdd3', right: '#ef4444', accent: '#dc2626', border: '#ef4444' },
};

function drawIsoHex(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  h: number,
  palette: { top: string; left: string; right: string; accent: string; border: string },
  type: TileType
) {
  // Top 6 vertices of flat-top hex in 2D
  const topVerts: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    topVerts.push([cx + r * Math.cos(angle), cy + (r * 0.58) * Math.sin(angle)]);
  }

  // Draw side faces (depth extrusion h)
  // Right side face (verts 0 -> 1 -> 2)
  ctx.beginPath();
  ctx.moveTo(topVerts[0][0], topVerts[0][1]);
  ctx.lineTo(topVerts[1][0], topVerts[1][1]);
  ctx.lineTo(topVerts[2][0], topVerts[2][1]);
  ctx.lineTo(topVerts[2][0], topVerts[2][1] + h);
  ctx.lineTo(topVerts[1][0], topVerts[1][1] + h);
  ctx.lineTo(topVerts[0][0], topVerts[0][1] + h);
  ctx.closePath();
  ctx.fillStyle = palette.right;
  ctx.fill();

  // Left side face (verts 2 -> 3 -> 4)
  ctx.beginPath();
  ctx.moveTo(topVerts[2][0], topVerts[2][1]);
  ctx.lineTo(topVerts[3][0], topVerts[3][1]);
  ctx.lineTo(topVerts[4][0], topVerts[4][1]);
  ctx.lineTo(topVerts[4][0], topVerts[4][1] + h);
  ctx.lineTo(topVerts[3][0], topVerts[3][1] + h);
  ctx.lineTo(topVerts[2][0], topVerts[2][1] + h);
  ctx.closePath();
  ctx.fillStyle = palette.left;
  ctx.fill();

  // Top face
  ctx.beginPath();
  ctx.moveTo(topVerts[0][0], topVerts[0][1]);
  for (let i = 1; i < 6; i++) {
    ctx.lineTo(topVerts[i][0], topVerts[i][1]);
  }
  ctx.closePath();
  ctx.fillStyle = palette.top;
  ctx.fill();
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw building/tree content on top
  if (type === 'house') {
    // Cottage: base + colored roof
    const hw = r * 0.45;
    const hh = r * 0.35;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cx - hw / 2, cy - hh, hw, hh);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - hw / 2, cy - hh, hw, hh);

    // Roof triangle
    ctx.beginPath();
    ctx.moveTo(cx - hw * 0.65, cy - hh);
    ctx.lineTo(cx, cy - hh - r * 0.4);
    ctx.lineTo(cx + hw * 0.65, cy - hh);
    ctx.closePath();
    ctx.fillStyle = palette.accent;
    ctx.fill();
    ctx.stroke();
  } else if (type === 'trees') {
    // Pine trees
    const drawPine = (px: number, py: number, sc: number) => {
      ctx.fillStyle = '#15803d';
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 0.8;
      // Bottom cone
      ctx.beginPath();
      ctx.moveTo(px - 6 * sc, py);
      ctx.lineTo(px, py - 10 * sc);
      ctx.lineTo(px + 6 * sc, py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Top cone
      ctx.beginPath();
      ctx.moveTo(px - 4.5 * sc, py - 6 * sc);
      ctx.lineTo(px, py - 16 * sc);
      ctx.lineTo(px + 4.5 * sc, py - 6 * sc);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };
    drawPine(cx - r * 0.18, cy + 2, 0.9);
    drawPine(cx + r * 0.2, cy - 2, 1.1);
  } else {
    // Mixed: Cottage + Pine tree
    const hw = r * 0.38;
    const hh = r * 0.3;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cx - hw * 0.9, cy - hh + 2, hw, hh);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - hw * 0.9, cy - hh + 2, hw, hh);

    // Roof
    ctx.beginPath();
    ctx.moveTo(cx - hw * 1.05, cy - hh + 2);
    ctx.lineTo(cx - hw * 0.4, cy - hh - r * 0.32 + 2);
    ctx.lineTo(cx + hw * 0.25, cy - hh + 2);
    ctx.closePath();
    ctx.fillStyle = palette.accent;
    ctx.fill();
    ctx.stroke();

    // Small pine beside
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.15, cy + 3);
    ctx.lineTo(cx + r * 0.35, cy - r * 0.45);
    ctx.lineTo(cx + r * 0.55, cy + 3);
    ctx.closePath();
    ctx.fill();
  }
}

export function getHex3DThumbnail(
  type: TileType,
  color: TileColor,
  clusterShape?: ClusterCellOffset[]
): string {
  if (typeof document === 'undefined') return '';

  const shapeKey =
    clusterShape && clusterShape.length > 1
      ? clusterShape.map(c => `${c.q}:${c.r}:${c.type || type}`).join('_')
      : 'single';
  const cacheKey = `${type}_${color}_${shapeKey}`;
  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const palette = COLOR_PALETTE[color] || COLOR_PALETTE.neutral;
  const isCluster = Boolean(clusterShape && clusterShape.length > 1);
  const cells = isCluster && clusterShape ? clusterShape : [{ q: 0, r: 0, type }];

  // Compute bounding box of the cluster in isometric space
  const SQRT3 = 1.73205;
  const hexRadius = cells.length >= 5 ? 13 : cells.length >= 3 ? 16 : cells.length === 2 ? 20 : 26;
  const extrusion = Math.max(4, Math.round(hexRadius * 0.25));

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  const points = cells.map(cell => {
    const px = hexRadius * SQRT3 * (cell.q + cell.r / 2);
    const py = hexRadius * 1.5 * cell.r * 0.58;
    minX = Math.min(minX, px);
    maxX = Math.max(maxX, px);
    minY = Math.min(minY, py);
    maxY = Math.max(maxY, py);
    return { px, py, cellType: cell.type || type };
  });

  const centerIsoX = (minX + maxX) / 2;
  const centerIsoY = (minY + maxY) / 2;
  const offsetX = 60 - centerIsoX;
  const offsetY = 60 - centerIsoY - extrusion / 2;

  // Sort back-to-front for proper depth overlap
  points.sort((a, b) => a.py - b.py);

  // Draw each hex
  points.forEach(pt => {
    drawIsoHex(ctx, pt.px + offsetX, pt.py + offsetY, hexRadius, extrusion, palette, pt.cellType);
  });

  const dataUrl = canvas.toDataURL('image/png');
  thumbnailCache.set(cacheKey, dataUrl);
  return dataUrl;
}
