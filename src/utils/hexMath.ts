import { HexCoord } from '../types/game';

// Size of hexagon outer radius in 3D world units
export const HEX_RADIUS = 1.35;
export const HEX_HEIGHT = 0.4;
export const SQRT3 = Math.sqrt(3);

// Convert axial coordinates (q, r) to 3D world coordinates (x, z)
// Pointy-topped hex orientation
export function hexToWorld(q: number, r: number): { x: number; z: number } {
  const x = HEX_RADIUS * SQRT3 * (q + r / 2);
  const z = HEX_RADIUS * 1.5 * r;
  return { x, z };
}

// Convert 3D world coordinates (x, z) to fractional hex axial coords, then round
export function worldToHex(x: number, z: number): HexCoord {
  const q_frac = (Math.sqrt(3) / 3 * x - 1 / 3 * z) / HEX_RADIUS;
  const r_frac = (2 / 3 * z) / HEX_RADIUS;
  return roundCube(q_frac, r_frac);
}

// Cube coordinate rounding algorithm
export function roundCube(q: number, r: number): HexCoord {
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);

  const q_diff = Math.abs(rq - q);
  const r_diff = Math.abs(rr - r);
  const s_diff = Math.abs(rs - s);

  if (q_diff > r_diff && q_diff > s_diff) {
    rq = -rr - rs;
  } else if (r_diff > s_diff) {
    rr = -rq - rs;
  }

  return { q: rq, r: rr };
}

// 6 Axial direction vectors for neighbors
export const HEX_DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export function getHexNeighbors(q: number, r: number): HexCoord[] {
  return HEX_DIRECTIONS.map(dir => ({
    q: q + dir.q,
    r: r + dir.r,
  }));
}

export function coordKey(q: number, r: number): string {
  return `${q},${r}`;
}

export function parseCoordKey(key: string): HexCoord {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

export function hexDistance(a: HexCoord, b: HexCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

/**
 * Check connectivity of placed tiles.
 * All placed tiles should form a single connected component.
 * Returns the number of disconnected components minus 1, and the set of disconnected tile keys.
 */
export function analyzeConnectivity(placedCoords: HexCoord[]): {
  componentsCount: number;
  disconnectedCount: number;
  disconnectedKeys: Set<string>;
  mainClusterKeys: Set<string>;
} {
  if (placedCoords.length <= 1) {
    return {
      componentsCount: placedCoords.length,
      disconnectedCount: 0,
      disconnectedKeys: new Set(),
      mainClusterKeys: new Set(placedCoords.map(c => coordKey(c.q, c.r))),
    };
  }

  const coordSet = new Set(placedCoords.map(c => coordKey(c.q, c.r)));
  const visited = new Set<string>();
  const components: string[][] = [];

  for (const c of placedCoords) {
    const startKey = coordKey(c.q, c.r);
    if (visited.has(startKey)) continue;

    const cluster: string[] = [];
    const queue: string[] = [startKey];
    visited.add(startKey);

    while (queue.length > 0) {
      const current = queue.shift()!;
      cluster.push(current);
      const { q, r } = parseCoordKey(current);
      for (const neighbor of getHexNeighbors(q, r)) {
        const nKey = coordKey(neighbor.q, neighbor.r);
        if (coordSet.has(nKey) && !visited.has(nKey)) {
          visited.add(nKey);
          queue.push(nKey);
        }
      }
    }

    components.push(cluster);
  }

  // Sort components by size descending; the largest is considered the main city cluster
  components.sort((a, b) => b.length - a.length);
  const mainClusterKeys = new Set(components[0] || []);
  const disconnectedKeys = new Set<string>();

  for (let i = 1; i < components.length; i++) {
    for (const key of components[i]) {
      disconnectedKeys.add(key);
    }
  }

  return {
    componentsCount: components.length,
    disconnectedCount: disconnectedKeys.size,
    disconnectedKeys,
    mainClusterKeys,
  };
}

/**
 * Rotate an axial hex coordinate around a center by N 60-degree clockwise steps.
 */
export function rotateHexCoord(coord: HexCoord, center: HexCoord = { q: 0, r: 0 }, steps: number = 1): HexCoord {
  let relQ = coord.q - center.q;
  let relR = coord.r - center.r;

  // Normalize steps to 0..5
  const normalizedSteps = ((steps % 6) + 6) % 6;

  for (let s = 0; s < normalizedSteps; s++) {
    const nextQ = -relR;
    const nextR = relQ + relR;
    relQ = nextQ;
    relR = nextR;
  }

  return {
    q: center.q + relQ,
    r: center.r + relR,
  };
}

/**
 * Returns all coordinates within a given hex radius from the center (inclusive).
 */
export function getCoordsInRadius(center: HexCoord, radius: number): HexCoord[] {
  const results: HexCoord[] = [];
  for (let dq = -radius; dq <= radius; dq++) {
    for (let dr = Math.max(-radius, -dq - radius); dr <= Math.min(radius, -dq + radius); dr++) {
      results.push({
        q: center.q + dq,
        r: center.r + dr,
      });
    }
  }
  return results;
}

export function getCoordsBounds(coords: HexCoord[]): {
  minX: number; maxX: number;
  minZ: number; maxZ: number;
  centerX: number; centerZ: number;
  spanX: number; spanZ: number;
} {
  if (coords.length === 0) {
    return { minX: 0, maxX: 0, minZ: 0, maxZ: 0, centerX: 0, centerZ: 0, spanX: 0, spanZ: 0 };
  }
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const c of coords) {
    const { x, z } = hexToWorld(c.q, c.r);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  const PAD = HEX_RADIUS; // include tile radius so edges aren't clipped
  minX -= PAD; maxX += PAD; minZ -= PAD; maxZ += PAD;
  return {
    minX, maxX, minZ, maxZ,
    centerX: (minX + maxX) / 2,
    centerZ: (minZ + maxZ) / 2,
    spanX: maxX - minX,
    spanZ: maxZ - minZ,
  };
}

