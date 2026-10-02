import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { GridCell, PlacedTile, HexPiece, TileColor, TileType, RotationZone } from '../types/game';
import { hexToWorld, worldToHex, HEX_RADIUS, coordKey, HEX_DIRECTIONS, hexDistance, getCoordsBounds } from '../utils/hexMath';

export interface RendererInfo {
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  geometriesMemoryMb: number;
  texturesVramMb: number;
  totalVramMb: number;
  jsHeapMemoryMb: number;
  vramBudgetCapMb: number;
  ramBudgetCapMb: number;
  budgetUsagePercent: number;
  isOverBudget: boolean;
}

interface PineAsset {
  boundingSphere: THREE.Sphere;
  trunkMatrix: THREE.Matrix4;
  cone1Matrix: THREE.Matrix4;
  cone2Matrix?: THREE.Matrix4;
  cone3Matrix?: THREE.Matrix4;
}

interface DeciduousAsset {
  boundingSphere: THREE.Sphere;
  trunkMatrix: THREE.Matrix4;
  canopyMatrix: THREE.Matrix4;
}

interface RockAsset {
  boundingSphere: THREE.Sphere;
  matrix: THREE.Matrix4;
}

interface ForestInstancedData {
  pineTrees: PineAsset[];
  deciduousTrees: DeciduousAsset[];
  rocks: RockAsset[];
  pineTrunksMesh: THREE.InstancedMesh;
  cone1Mesh: THREE.InstancedMesh;
  cone2Mesh: THREE.InstancedMesh | null;
  cone3Mesh: THREE.InstancedMesh | null;
  decTrunksMesh: THREE.InstancedMesh;
  canopyMesh: THREE.InstancedMesh;
  rockMesh: THREE.InstancedMesh | null;
}

interface ThreeSceneProps {
  unlockedCells: Map<string, GridCell>;
  placedTiles: Map<string, PlacedTile[]>;
  activeDragPiece: HexPiece | null;
  dragPointerPos: { x: number; y: number } | null;
  hoveredCoord: { q: number; r: number } | null;
  pickedUpCoord: { q: number; r: number } | null;
  disconnectedKeys: Set<string>;
  rotationZones?: RotationZone[];
  onHoverCoordChange: (coord: { q: number; r: number } | null) => void;
  onTileDroppedOnBoard: (coord: { q: number; r: number }) => void;
  onRightClickBoard: (coord: { q: number; r: number } | null) => void;
  onRotateZone?: (zoneId: string) => void;
  isExpansionAnimating: boolean;
  performanceMode?: 'low' | 'high';
  targetFps?: 60 | 30 | 24;
  isLowPowerMode?: boolean;
  textureQuality?: 'high' | 'low';
  onUpdateRendererInfo?: (info: RendererInfo) => void;
  hudInsetLeftPx?: number;
  hudInsetRightPx?: number;
}

// Color palette constants for 3D materials
const COLOR_MAP: Record<TileColor, { base: number; emissive: number; border: number; label: string }> = {
  neutral: { base: 0xd4d8dd, emissive: 0x1a202c, border: 0x94a3b8, label: 'Safe Area' },
  amber: { base: 0xfbbf24, emissive: 0xb45309, border: 0xf59e0b, label: 'Sunlit Zone' },
  emerald: { base: 0x34d399, emissive: 0x065f46, border: 0x10b981, label: 'Verdant Grove' },
  sapphire: { base: 0x60a5fa, emissive: 0x1e40af, border: 0x3b82f6, label: 'Aquifer Well' },
  ruby: { base: 0xf87171, emissive: 0x991b1b, border: 0xef4444, label: 'Terracotta Hearth' },
};

export const ThreeScene: React.FC<ThreeSceneProps> = ({
  unlockedCells,
  placedTiles,
  activeDragPiece,
  dragPointerPos,
  hoveredCoord,
  pickedUpCoord,
  disconnectedKeys,
  rotationZones,
  onHoverCoordChange,
  onTileDroppedOnBoard,
  onRightClickBoard,
  onRotateZone,
  isExpansionAnimating,
  performanceMode = 'low',
  targetFps = 60,
  isLowPowerMode = false,
  textureQuality = 'high',
  onUpdateRendererInfo,
  hudInsetLeftPx = 0,
  hudInsetRightPx = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const gridGroupRef = useRef<THREE.Group | null>(null);
  const tilesGroupRef = useRef<THREE.Group | null>(null);
  const forestGroupRef = useRef<THREE.Group | null>(null);
  const forestInstancedDataRef = useRef<ForestInstancedData | null>(null);
  const rotationZonesGroupRef = useRef<THREE.Group | null>(null);
  const ghostMeshRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const [webGLError, setWebGLError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const boardBounds = useMemo(() => {
    const coords: { q: number; r: number }[] = [];
    unlockedCells.forEach(cell => {
      // Only include playable cells in the camera framing.
      // Fog and river cells can extend far beyond the actual board and
      // would cause the camera to pull way back.
      if (cell.isFog || cell.isRiver) return;
      coords.push({ q: cell.q, r: cell.r });
    });
    return getCoordsBounds(coords);
  }, [unlockedCells]);

  const targetFpsRef = useRef(targetFps);
  targetFpsRef.current = targetFps;
  const onUpdateRendererInfoRef = useRef(onUpdateRendererInfo);
  onUpdateRendererInfoRef.current = onUpdateRendererInfo;

  // Interaction & camera state refs
  const isPointerDownRef = useRef(false);
  const pointerStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 20, 18));
  const pinchStartDistRef = useRef<number | null>(null);
  const currentZoomRef = useRef<number>(1);
  const hoveredCoordRef = useRef<{ q: number; r: number } | null>(null);
  const activeDragPieceRef = useRef<HexPiece | null>(null);

  hoveredCoordRef.current = hoveredCoord;
  activeDragPieceRef.current = activeDragPiece;

  // Initialize Scene, Camera, Lights, Procedural Forest, and Render Loop
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if WebGL is supported by the browser/device before creating WebGLRenderer
    let glContext: RenderingContext | null = null;
    try {
      glContext =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
    } catch {
      glContext = null;
    }

    if (!glContext) {
      setWebGLError(true);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const isPerfLow = performanceMode === 'low';

    // Scene with atmospheric fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd9edf7); // soft airy alpine sky
    scene.fog = new THREE.FogExp2(0xd9edf7, isPerfLow ? 0.016 : 0.012);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, Math.max(0.1, width / Math.max(1, height)), 0.1, 100);

    // Frame the camera on the actual board, not the world origin.
    // boardBounds comes from the memo above; falls back to sensible defaults if empty.
    const bounds = boardBounds;
    const maxSpan = Math.max(bounds.spanX, bounds.spanZ, 8);

    // Aspect-aware camera distance — ensures the board width fits on narrow screens.
    const canvasAspect = Math.max(0.1, width / Math.max(1, height));
    const fovYRad = (42 * Math.PI) / 180;
    const tanHalfFovY = Math.tan(fovYRad / 2);

    const requiredDistanceForWidth = bounds.spanX / (2 * tanHalfFovY * canvasAspect);
    const requiredDistanceForDepth = bounds.spanZ / (2 * tanHalfFovY);

    // Margin of 1.35x so the outer tiles have breathing room
    const fitDistance = Math.max(
      14,
      requiredDistanceForWidth * 1.15,
      requiredDistanceForDepth * 1.15,
      maxSpan * 1.2
    );

    const DEFAULT_CAMERA_HEIGHT = fitDistance * 1.05;
    const DEFAULT_CAMERA_BACK   = fitDistance * 0.85;

    camera.position.set(bounds.centerX, DEFAULT_CAMERA_HEIGHT, bounds.centerZ + DEFAULT_CAMERA_BACK);
    camera.lookAt(bounds.centerX, 0, bounds.centerZ);
    cameraRef.current = camera;

    // Sync the refs used by the animation loop so the camera doesn't snap back next frame
    cameraTargetRef.current.set(bounds.centerX, 0, bounds.centerZ);
    cameraOffsetRef.current.set(0, DEFAULT_CAMERA_HEIGHT, DEFAULT_CAMERA_BACK);

    // Robust WebGL Renderer creation with multi-level fallback
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isPerfLow,
        alpha: false,
        powerPreference: isPerfLow ? 'default' : 'high-performance',
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: false,
      });
      if (!renderer.getContext() || !renderer.capabilities) {
        throw new Error('WebGL context unavailable');
      }
    } catch {
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: false,
          alpha: false,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
        });
        if (!renderer.getContext() || !renderer.capabilities) {
          throw new Error('WebGL context unavailable');
        }
      } catch {
        renderer = null;
      }
    }

    if (!renderer) {
      setWebGLError(true);
      return;
    }

    renderer.setSize(width, height);
    const activePixelRatio = isLowPowerMode
      ? 0.75
      : isPerfLow
      ? 1.0
      : Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(activePixelRatio);
    renderer.shadowMap.enabled = !isPerfLow;
    if (!isPerfLow) {
      renderer.shadowMap.type = THREE.PCFShadowMap;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;
    setWebGLError(false);

    // WebGL Context Loss & Restoration Listeners
    let animId: number;
    let isContextLost = false;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      isContextLost = true;
      cancelAnimationFrame(animId);
      console.warn('WebGL context lost. Pausing rendering.');
    };

    const handleContextRestored = () => {
      isContextLost = false;
      console.info('WebGL context restored. Resuming rendering.');
      animate();
    };

    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff6ea, isPerfLow ? 1.5 : 1.2);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x86a873, 0.6);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff3cf, isPerfLow ? 1.4 : 1.8);
    sunLight.position.set(18, 28, 14);
    sunLight.castShadow = !isPerfLow;
    if (!isPerfLow) {
      sunLight.shadow.mapSize.width = 512;
      sunLight.shadow.mapSize.height = 512;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 90;

      // Size the shadow frustum to the board + margin so big boards don't clip
      const maxSpan = Math.max(boardBounds.spanX, boardBounds.spanZ, 20);
      const halfShadow = maxSpan * 0.75 + 8;
      sunLight.shadow.camera.left = -halfShadow;
      sunLight.shadow.camera.right = halfShadow;
      sunLight.shadow.camera.top = halfShadow;
      sunLight.shadow.camera.bottom = -halfShadow;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.camera.updateProjectionMatrix();
    }
    scene.add(sunLight);

    // Subtle Rim Light for crisp silhouette separation
    const rimLight = new THREE.DirectionalLight(0xbbe1fa, 0.7);
    rimLight.position.set(-20, 15, -20);
    scene.add(rimLight);

    // Groups
    const gridGroup = new THREE.Group();
    const tilesGroup = new THREE.Group();
    const forestGroup = new THREE.Group();
    const rotationZonesGroup = new THREE.Group();
    scene.add(forestGroup);
    scene.add(rotationZonesGroup);
    scene.add(gridGroup);
    scene.add(tilesGroup);
    gridGroupRef.current = gridGroup;
    tilesGroupRef.current = tilesGroup;
    forestGroupRef.current = forestGroup;
    rotationZonesGroupRef.current = rotationZonesGroup;

    // Generate Ground Terrain & Vast Procedural Forest Outskirts with Frustum-Aware Instancing
    forestInstancedDataRef.current = buildVastForestEnvironment(scene, forestGroup, isPerfLow);

    // Ghost / Hover cursor indicator
    const ghostGroup = createGhostPreviewGroup();
    scene.add(ghostGroup);
    ghostMeshRef.current = ghostGroup;

    // Ambient floating pollen/firefly particles (skip on low performance or low-power mode)
    if (!isPerfLow && !isLowPowerMode) {
      const particles = createAmbientParticles();
      scene.add(particles);
      particlesRef.current = particles;
    }

    // Animation Loop with high-precision timestamp, FPS throttling & zero-alloc vector reuse
    const startTimestamp = performance.now();
    let lastRenderTimestamp = performance.now();
    const lastMemoryCheckTimestampRef = { current: 0 };
    const cachedMemoryStatsRef = {
      current: {
        geometriesMemoryMb: 0,
        texturesVramMb: 0,
        totalVramMb: 0,
        jsHeapMemoryMb: 0,
        vramBudgetCapMb: 64.0,
        ramBudgetCapMb: 256.0,
        budgetUsagePercent: 0,
        isOverBudget: false,
      },
    };
    const tempTargetCamPos = new THREE.Vector3();
    const tempOffset = new THREE.Vector3();
    const projScreenMatrix = new THREE.Matrix4();
    const frustum = new THREE.Frustum();
    const tileSphere = new THREE.Sphere(new THREE.Vector3(), 2.5);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (isContextLost) return;

      const now = performance.now();
      const fpsLimit = targetFpsRef.current || 60;
      const frameInterval = 1000 / fpsLimit;
      const delta = now - lastRenderTimestamp;

      // Frame rate throttling for 60 FPS, 30 FPS, or 24 FPS target
      if (delta < frameInterval - 1) {
        return;
      }
      lastRenderTimestamp = now - (delta % frameInterval);

      const elapsedTime = (now - startTimestamp) * 0.001;

      // Camera lerp (zero GC allocations)
      if (cameraRef.current) {
        tempOffset.copy(cameraOffsetRef.current).multiplyScalar(currentZoomRef.current);
        tempTargetCamPos.copy(cameraTargetRef.current).add(tempOffset);
        cameraRef.current.position.lerp(tempTargetCamPos, 0.12);
        cameraRef.current.lookAt(cameraTargetRef.current);

        // Update Camera Frustum for Per-Tile Frustum Culling
        cameraRef.current.updateMatrixWorld();
        projScreenMatrix.multiplyMatrices(
          cameraRef.current.projectionMatrix,
          cameraRef.current.matrixWorldInverse
        );
        frustum.setFromProjectionMatrix(projScreenMatrix);

        // Frustum Culling on Placed 3D Tile Meshes & Animation updates
        if (tilesGroupRef.current) {
          tilesGroupRef.current.children.forEach(child => {
            tileSphere.center.copy(child.position);
            tileSphere.center.y += 0.5; // Offset center for taller 3D structures
            const isVisible = frustum.intersectsSphere(tileSphere);
            child.visible = isVisible;

            if (isVisible) {
              if (child.userData?.isPickedUp) {
                const targetY = 1.1 + Math.sin(elapsedTime * 5) * 0.1;
                child.position.y += (targetY - child.position.y) * 0.2;
                child.rotation.y = Math.sin(elapsedTime * 2.5) * 0.1;
              } else {
                child.position.y += (0.14 - child.position.y) * 0.2;
                child.rotation.y += (0 - child.rotation.y) * 0.2;
              }
            }
          });
        }

        // Frustum Culling on Special Grid Hexes, Borders & Markers
        if (gridGroupRef.current) {
          gridGroupRef.current.children.forEach(child => {
            if (!(child as THREE.InstancedMesh).isInstancedMesh) {
              tileSphere.center.copy(child.position);
              tileSphere.center.y = 0.2;
              child.visible = frustum.intersectsSphere(tileSphere);
            }
          });
        }

        // Frustum Culling on Rotation Zone Dials
        if (rotationZonesGroupRef.current) {
          rotationZonesGroupRef.current.children.forEach(child => {
            tileSphere.center.copy(child.position);
            tileSphere.center.y = 0.5;
            child.visible = frustum.intersectsSphere(tileSphere);
          });
        }

        // Frustum-Aware Instancing for Forest Background with extended Perimeter Buffer Zone
        if (forestInstancedDataRef.current) {
          const forest = forestInstancedDataRef.current;
          const BUFFER_MARGIN = 9.0; // Invisible buffer zone around active camera frustum perimeter

          // 1. Filter & Update Pine Trees inside Frustum Buffer Zone
          let activePines = 0;
          for (let i = 0; i < forest.pineTrees.length; i++) {
            const pine = forest.pineTrees[i];
            tileSphere.copy(pine.boundingSphere);
            tileSphere.radius += BUFFER_MARGIN;

            if (frustum.intersectsSphere(tileSphere)) {
              forest.pineTrunksMesh.setMatrixAt(activePines, pine.trunkMatrix);
              forest.cone1Mesh.setMatrixAt(activePines, pine.cone1Matrix);
              if (forest.cone2Mesh && pine.cone2Matrix) {
                forest.cone2Mesh.setMatrixAt(activePines, pine.cone2Matrix);
              }
              if (forest.cone3Mesh && pine.cone3Matrix) {
                forest.cone3Mesh.setMatrixAt(activePines, pine.cone3Matrix);
              }
              activePines++;
            }
          }

          if (forest.pineTrunksMesh.count !== activePines) {
            forest.pineTrunksMesh.count = activePines;
            forest.pineTrunksMesh.instanceMatrix.needsUpdate = true;
            forest.cone1Mesh.count = activePines;
            forest.cone1Mesh.instanceMatrix.needsUpdate = true;
            if (forest.cone2Mesh) {
              forest.cone2Mesh.count = activePines;
              forest.cone2Mesh.instanceMatrix.needsUpdate = true;
            }
            if (forest.cone3Mesh) {
              forest.cone3Mesh.count = activePines;
              forest.cone3Mesh.instanceMatrix.needsUpdate = true;
            }
          }

          // 2. Filter & Update Deciduous Trees inside Frustum Buffer Zone
          let activeDeciduous = 0;
          for (let i = 0; i < forest.deciduousTrees.length; i++) {
            const dec = forest.deciduousTrees[i];
            tileSphere.copy(dec.boundingSphere);
            tileSphere.radius += BUFFER_MARGIN;

            if (frustum.intersectsSphere(tileSphere)) {
              forest.decTrunksMesh.setMatrixAt(activeDeciduous, dec.trunkMatrix);
              forest.canopyMesh.setMatrixAt(activeDeciduous, dec.canopyMatrix);
              activeDeciduous++;
            }
          }

          if (forest.decTrunksMesh.count !== activeDeciduous) {
            forest.decTrunksMesh.count = activeDeciduous;
            forest.decTrunksMesh.instanceMatrix.needsUpdate = true;
            forest.canopyMesh.count = activeDeciduous;
            forest.canopyMesh.instanceMatrix.needsUpdate = true;
          }

          // 3. Filter & Update Rocks inside Frustum Buffer Zone
          if (forest.rockMesh && forest.rocks.length > 0) {
            let activeRocks = 0;
            for (let i = 0; i < forest.rocks.length; i++) {
              const rock = forest.rocks[i];
              tileSphere.copy(rock.boundingSphere);
              tileSphere.radius += BUFFER_MARGIN;

              if (frustum.intersectsSphere(tileSphere)) {
                forest.rockMesh.setMatrixAt(activeRocks, rock.matrix);
                activeRocks++;
              }
            }

            if (forest.rockMesh.count !== activeRocks) {
              forest.rockMesh.count = activeRocks;
              forest.rockMesh.instanceMatrix.needsUpdate = true;
            }
          }
        }
      }

      // Animate floating pollen
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.03;
      }

      // Animate rotation zones dials
      if (rotationZonesGroupRef.current) {
        rotationZonesGroupRef.current.children.forEach(zg => {
          if (zg.visible) {
            const dial = zg.children.find(c => c.userData?.isRotationDial);
            if (dial) {
              dial.rotation.y = elapsedTime * 0.7;
            }
          }
        });
      }

      // Animate hover ghost floating bob
      if (ghostMeshRef.current && ghostMeshRef.current.visible) {
        ghostMeshRef.current.position.y = 0.35 + Math.sin(elapsedTime * 4) * 0.08;
      }

      renderer.render(scene, camera);

      // Throttled Asset RAM/VRAM Memory Calculation (every 500ms for zero rendering jitter)
      if (now - lastMemoryCheckTimestampRef.current >= 500) {
        lastMemoryCheckTimestampRef.current = now;

        let geometryBytes = 0;
        let textureBytes = 0;
        const visitedGeometries = new Set<THREE.BufferGeometry>();
        const visitedTextures = new Set<THREE.Texture>();

        scene.traverse(obj => {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry && !visitedGeometries.has(mesh.geometry)) {
            visitedGeometries.add(mesh.geometry);
            const geo = mesh.geometry;
            for (const attrName in geo.attributes) {
              const attr = geo.attributes[attrName];
              if (attr && attr.array) {
                geometryBytes += attr.array.byteLength;
              }
            }
            if (geo.index && geo.index.array) {
              geometryBytes += geo.index.array.byteLength;
            }
          }

          if (mesh.material) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach((mat: any) => {
              for (const key in mat) {
                const val = mat[key];
                if (val && val.isTexture && !visitedTextures.has(val)) {
                  visitedTextures.add(val);
                  if (val.image && val.image.width && val.image.height) {
                    textureBytes += val.image.width * val.image.height * 4 * 1.33;
                  } else {
                    textureBytes += 512 * 512 * 4 * 1.33;
                  }
                }
              }
            });
          }
        });

        const geometriesMemoryMb = parseFloat((geometryBytes / (1024 * 1024)).toFixed(2));
        const texturesVramMb = parseFloat((textureBytes / (1024 * 1024)).toFixed(2));
        const totalVramMb = parseFloat((geometriesMemoryMb + texturesVramMb).toFixed(2));

        let jsHeapMemoryMb = 0;
        if (typeof window !== 'undefined' && (performance as any).memory?.usedJSHeapSize) {
          jsHeapMemoryMb = parseFloat(((performance as any).memory.usedJSHeapSize / (1024 * 1024)).toFixed(1));
        } else {
          jsHeapMemoryMb = parseFloat((geometriesMemoryMb * 2.2 + 28.5).toFixed(1));
        }

        const vramBudgetCapMb = 64.0;
        const ramBudgetCapMb = 256.0;

        const vramPct = (totalVramMb / vramBudgetCapMb) * 100;
        const ramPct = (jsHeapMemoryMb / ramBudgetCapMb) * 100;
        const budgetUsagePercent = parseFloat(Math.min(100, Math.max(vramPct, ramPct)).toFixed(1));
        const isOverBudget = totalVramMb > vramBudgetCapMb || jsHeapMemoryMb > ramBudgetCapMb;

        cachedMemoryStatsRef.current = {
          geometriesMemoryMb,
          texturesVramMb,
          totalVramMb,
          jsHeapMemoryMb,
          vramBudgetCapMb,
          ramBudgetCapMb,
          budgetUsagePercent,
          isOverBudget,
        };
      }

      // Report renderer info stats for Device Debugger
      if (onUpdateRendererInfoRef.current) {
        onUpdateRendererInfoRef.current({
          drawCalls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
          geometries: renderer.info.memory.geometries,
          textures: renderer.info.memory.textures,
          ...cachedMemoryStatsRef.current,
        });
      }
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Global helper to project 3D hex positions to 2D viewport coordinates for tutorials
    (window as any).__hexaGetHexScreenPos = (q: number, r: number) => {
      if (!cameraRef.current || !containerRef.current) return null;
      const { x, z } = hexToWorld(q, r);
      const worldVec = new THREE.Vector3(x, 0.2, z);
      worldVec.project(cameraRef.current);
      const rect = containerRef.current.getBoundingClientRect();
      const screenX = rect.left + (worldVec.x * 0.5 + 0.5) * rect.width;
      const screenY = rect.top + (-worldVec.y * 0.5 + 0.5) * rect.height;
      return {
        x: screenX,
        y: screenY,
        left: screenX - 44,
        top: screenY - 44,
        width: 88,
        height: 88,
        right: screenX + 44,
        bottom: screenY + 44,
      };
    };

    return () => {
      forestInstancedDataRef.current = null;
      (window as any).__hexaGetHexScreenPos = undefined;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      }
      if (renderer) {
        try {
          renderer.dispose();
        } catch {}
      }
      scene.clear();
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey, performanceMode]);

  useEffect(() => {
    if (unlockedCells.size === 0) return;

    // Read the container size directly — `width`/`height` from the main effect are out of scope
    const container = containerRef.current;
    const measuredWidth = container?.clientWidth || window.innerWidth;
    const measuredHeight = container?.clientHeight || window.innerHeight;

    const bounds = boardBounds;
    const maxSpan = Math.max(bounds.spanX, bounds.spanZ, 8);

    // Compute the aspect ratio so the camera pulls back on narrow screens
    const canvasAspect = Math.max(0.1, measuredWidth / Math.max(1, measuredHeight));

    // Horizontal FOV formula: visible width = 2 * d * tan(fovY/2) * aspect
    // We want visible width >= spanX, so:
    //   d >= spanX / (2 * tan(fovY/2) * aspect)
    const fovYRad = (42 * Math.PI) / 180;
    const tanHalfFovY = Math.tan(fovYRad / 2);
    const requiredDistanceForWidth = bounds.spanX / (2 * tanHalfFovY * canvasAspect);
    const requiredDistanceForDepth = bounds.spanZ / (2 * tanHalfFovY);

    // Add a margin of 1.35x so the outer tiles have breathing room
    const fitDistance = Math.max(
      14,
      requiredDistanceForWidth * 1.35,
      requiredDistanceForDepth * 1.35,
      maxSpan * 1.2   // fallback minimum
    );

    cameraTargetRef.current.set(bounds.centerX, 0, bounds.centerZ);
    cameraOffsetRef.current.set(0, fitDistance * 1.05, fitDistance * 0.85);
    currentZoomRef.current = 1;
  }, [boardBounds, unlockedCells.size]);

  // Sync Unlocked Base Grid Hexes with InstancedMesh geometry instancing for low-GPU optimization
  useEffect(() => {
    if (!gridGroupRef.current) return;
    const group = gridGroupRef.current;

    // Clear old children with complete hierarchy disposal
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      disposeHierarchy(child);
    }

    const hexGeometry = createHexPrismGeometry(HEX_RADIUS * 0.94, 0.28);
    const borderGeometry = createHexOutlineGeometry(HEX_RADIUS * 0.95);

    // Separate basic forest hex tiles (instanced) vs special/animating hex tiles
    const instancedCells: GridCell[] = [];
    const specialCells: GridCell[] = [];

    unlockedCells.forEach(cell => {
      if (cell.isRiver || cell.isFog || cell.isCrystalPink || (isExpansionAnimating && cell.unlockPhase > 1)) {
        specialCells.push(cell);
      } else {
        instancedCells.push(cell);
      }
    });

    // 1. InstancedMesh for basic forest hex tiles (batches all base hexes into 1 single draw call!)
    if (instancedCells.length > 0) {
      const baseMat = new THREE.MeshStandardMaterial({
        roughness: 0.5,
        metalness: 0.1,
        flatShading: true,
      });

      const instancedHexes = new THREE.InstancedMesh(hexGeometry, baseMat, instancedCells.length);
      instancedHexes.receiveShadow = true;
      instancedHexes.castShadow = false;

      const dummy = new THREE.Object3D();

      instancedCells.forEach((cell, idx) => {
        const { x, z } = hexToWorld(cell.q, cell.r);
        dummy.position.set(x, 0, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();

        instancedHexes.setMatrixAt(idx, dummy.matrix);

        const colorData = COLOR_MAP[cell.colorRequirement] || COLOR_MAP.neutral;
        const isColoredZone = cell.colorRequirement !== 'neutral' && cell.colorRequirement in COLOR_MAP;
        const tileColorVal = isColoredZone ? colorData.base : 0xe2e8f0;
        instancedHexes.setColorAt(idx, new THREE.Color(tileColorVal));

        // Perimeter outline for instanced tile
                // Perimeter outline for instanced tile — skip if a road/bridge covers this cell
        const stack = placedTiles.get(coordKey(cell.q, cell.r));
        const hasRoadOrBridge = stack?.some(t => t.type === 'road' || t.type === 'bridge') ?? false;

        if (!hasRoadOrBridge) {
          const borderMat = new THREE.LineBasicMaterial({
            color: isColoredZone ? colorData.border : 0x94a3b8,
            linewidth: 2,
          });
          const borderLine = new THREE.LineSegments(borderGeometry, borderMat);
          borderLine.position.set(x, 0.145, z);
          group.add(borderLine);
        }

        // Gemstone marker for color zones
        if (isColoredZone) {
          const markerGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.08, 6);
          const markerMat = new THREE.MeshStandardMaterial({
            color: colorData.border,
            emissive: colorData.border,
            emissiveIntensity: 0.6,
            roughness: 0.2,
          });
          const marker = new THREE.Mesh(markerGeo, markerMat);
          marker.position.set(x, 0.16, z);
          group.add(marker);
        }
      });

      instancedHexes.instanceMatrix.needsUpdate = true;
      if (instancedHexes.instanceColor) {
        instancedHexes.instanceColor.needsUpdate = true;
      }
      group.add(instancedHexes);
    }

    // 2. Render Special Cells (River, Fog, Crystal Pink, or expanding phase rise)
    specialCells.forEach(cell => {
      const { x, z } = hexToWorld(cell.q, cell.r);
      const cellGroup = new THREE.Group();
      cellGroup.position.set(x, 0, z);

      const colorData = COLOR_MAP[cell.colorRequirement] || COLOR_MAP.neutral;
      const isColoredZone = cell.colorRequirement !== 'neutral' && cell.colorRequirement in COLOR_MAP;

      let baseMat: THREE.MeshStandardMaterial;
      let borderMat: THREE.LineBasicMaterial;

      if (cell.isRiver) {
        baseMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.1,
          metalness: 0.8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0.9,
        });
        borderMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, linewidth: 2 });
      } else if (cell.isFog) {
        baseMat = new THREE.MeshStandardMaterial({
          color: 0xc4b5fd,
          roughness: 0.85,
          metalness: 0.05,
          emissive: 0x8b5cf6,
          emissiveIntensity: 0.35,
          transparent: true,
          opacity: 0.5,
        });
        borderMat = new THREE.LineBasicMaterial({ color: 0xa855f7, linewidth: 2 });
      } else if (cell.isCrystalPink) {
        baseMat = new THREE.MeshStandardMaterial({
          color: 0xfdf2f8,
          roughness: 0.25,
          metalness: 0.3,
          emissive: 0xec4899,
          emissiveIntensity: 0.55,
        });
        borderMat = new THREE.LineBasicMaterial({ color: 0xf43f5e, linewidth: 3 });
      } else {
        baseMat = new THREE.MeshStandardMaterial({
          color: isColoredZone ? colorData.base : 0xe2e8f0,
          roughness: isColoredZone ? 0.35 : 0.65,
          metalness: isColoredZone ? 0.15 : 0.05,
          emissive: isColoredZone ? colorData.emissive : 0x000000,
          emissiveIntensity: isColoredZone ? 0.3 : 0,
        });
        borderMat = new THREE.LineBasicMaterial({
          color: isColoredZone ? colorData.border : 0x94a3b8,
          linewidth: 2,
        });
      }

      const mesh = new THREE.Mesh(hexGeometry, baseMat);
      mesh.receiveShadow = true;
      mesh.castShadow = false;
      cellGroup.add(mesh);

      const borderLine = new THREE.LineSegments(borderGeometry, borderMat);
      borderLine.position.y = 0.145;
      cellGroup.add(borderLine);

      if (cell.isRiver) {
        const waterRipples = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.5, 0.04, 6),
          new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            emissive: 0x38bdf8,
            emissiveIntensity: 0.6,
            roughness: 0.1,
          })
        );
        waterRipples.position.y = 0.15;
        cellGroup.add(waterRipples);
      } else if (cell.isFog) {
        const mistOrb = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 8, 8),
          new THREE.MeshStandardMaterial({
            color: 0xede9fe,
            emissive: 0xa855f7,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7,
          })
        );
        mistOrb.position.y = 0.3;
        cellGroup.add(mistOrb);
      }

      if (isExpansionAnimating && cell.unlockPhase > 1) {
        cellGroup.position.y = -2;
        animateRise(cellGroup, 0, 400 + Math.random() * 200);
      }

      group.add(cellGroup);
    });
  }, [unlockedCells, isExpansionAnimating]);

  // Sync Placed 3D Tiles
  useEffect(() => {
    if (!tilesGroupRef.current) return;
    const group = tilesGroupRef.current;

    // Clear old placed 3D meshes
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      disposeHierarchy(child);
    }

    // 1. Render all placed 3D tile meshes
    placedTiles.forEach(tileStack => {
      const isCellOverlapped = tileStack.length > 1;
      tileStack.forEach((tile, stackIdx) => {
        const { x, z } = hexToWorld(tile.q, tile.r);
        const isDisconnected = disconnectedKeys.has(coordKey(tile.q, tile.r));
        const isPickedUp = pickedUpCoord ? tile.q === pickedUpCoord.q && tile.r === pickedUpCoord.r : false;
        const isOffMap =
          tile.type !== 'bridge' &&
          !unlockedCells.has(coordKey(tile.q, tile.r));
        const isOverlapping = isCellOverlapped && stackIdx > 0;
        const tileObject = create3DTileMesh(tile, isDisconnected, isPickedUp, isOffMap, isOverlapping, unlockedCells, placedTiles);
        const baseHeight = isPickedUp ? 1.1 : 0.14 + stackIdx * 0.38;
        tileObject.position.set(x, baseHeight, z);
        group.add(tileObject);
      });
    });

    // 2. Render foundation bridges uniting adjacent hexes of the same Giant Cluster
    const clusterMap = new Map<string, PlacedTile[]>();
    placedTiles.forEach(tileStack => {
      tileStack.forEach(tile => {
        if (tile.clusterId) {
          const list = clusterMap.get(tile.clusterId) || [];
          list.push(tile);
          clusterMap.set(tile.clusterId, list);
        }
      });
    });

    const accentColors: Record<TileColor, number> = {
      neutral: 0xc87d55,
      amber: 0xf59e0b,
      emerald: 0x10b981,
      sapphire: 0x3b82f6,
      ruby: 0xef4444,
    };

    clusterMap.forEach(tiles => {
      for (let i = 0; i < tiles.length; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
          const tA = tiles[i];
          const tB = tiles[j];
          // Hex distance: (abs(q1-q2) + abs(q1+r1 - q2-r2) + abs(r1-r2)) / 2
          const hexDist = (Math.abs(tA.q - tB.q) + Math.abs(tA.q + tA.r - tB.q - tB.r) + Math.abs(tA.r - tB.r)) / 2;
          if (hexDist === 1) {
            const posA = hexToWorld(tA.q, tA.r);
            const posB = hexToWorld(tB.q, tB.r);
            const midX = (posA.x + posB.x) / 2;
            const midZ = (posA.z + posB.z) / 2;
            const rotY = -Math.atan2(posB.z - posA.z, posB.x - posA.x);

            // Substantial foundation bridge connecting the two hexes
            const bridgeGeo = new THREE.BoxGeometry(0.55, 0.16, 0.96);
            const bridgeMat = new THREE.MeshStandardMaterial({
              color: 0x334155,
              roughness: 0.6,
              metalness: 0.3,
            });
            const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
            bridge.position.set(midX, 0.16, midZ);
            bridge.rotation.y = rotY;
            group.add(bridge);

            // Colored architectural trim inlay
            const trimGeo = new THREE.BoxGeometry(0.18, 0.08, 0.92);
            const trimMat = new THREE.MeshBasicMaterial({ color: accentColors[tA.color] || 0xc87d55 });
            const trimMesh = new THREE.Mesh(trimGeo, trimMat);
            trimMesh.position.set(midX, 0.22, midZ);
            trimMesh.rotation.y = rotY;
            group.add(trimMesh);
          }
        }
      }
    });
  }, [placedTiles, disconnectedKeys, pickedUpCoord, unlockedCells]);

  // Update Ghost Preview Position & Color (with multi-hex Cluster support!)
  useEffect(() => {
    if (!ghostMeshRef.current) return;
    const ghost = ghostMeshRef.current;

    while (ghost.children.length > 0) {
      const child = ghost.children[0];
      ghost.remove(child);
      disposeHierarchy(child);
    }

    if (!activeDragPiece || !hoveredCoord) {
      ghost.visible = false;
      return;
    }

    const offsets = activeDragPiece.clusterShape && activeDragPiece.clusterShape.length > 0
      ? activeDragPiece.clusterShape
      : [{ q: 0, r: 0 }];

    offsets.forEach(offset => {
      const targetQ = hoveredCoord.q + offset.q;
      const targetR = hoveredCoord.r + offset.r;
      const cellKey = coordKey(targetQ, targetR);
      const targetCell = unlockedCells.get(cellKey);
      const isOffMap = !targetCell;
      const isColorMatch = targetCell && (targetCell.colorRequirement === 'neutral' || targetCell.colorRequirement === activeDragPiece.color);
      const existingStack = placedTiles.get(cellKey);
      const isOccupied = Boolean(existingStack && existingStack.length > 0);

      let cellColor = 0x22c55e; // valid green
      if (isOffMap) {
        cellColor = 0xef4444; // off-map red
      } else if (!isColorMatch) {
        cellColor = 0xf87171; // color mismatch red
      } else if (isOccupied) {
        cellColor = 0xf59e0b; // overlap warning amber
      }

      const ghostCell = createGhostCell(cellColor);
      const { x, z } = hexToWorld(targetQ, targetR);
      ghostCell.position.set(x, 0.35, z);
      ghost.add(ghostCell);
    });

    // Render visual connection lines if the activeDragPiece is a road piece
    const isRoadPiece = activeDragPiece.type === 'road' || 
                        (activeDragPiece.clusterShape && activeDragPiece.clusterShape.some(o => o.type === 'road'));

    if (isRoadPiece) {
      const isValidRoadConnectionTarget = (t: PlacedTile): boolean => {
        const types = ['house', 'tower', 'landmark', 'road', 'bridge'];
        if (types.includes(t.type)) {
          return true;
        }
        if (t.clusterShape) {
          return t.clusterShape.some(o => types.includes(o.type || ''));
        }
        if (t.clusterPieceOriginal) {
          if (types.includes(t.clusterPieceOriginal.type)) {
            return true;
          }
          if (t.clusterPieceOriginal.clusterShape) {
            return t.clusterPieceOriginal.clusterShape.some(o => types.includes(o.type || ''));
          }
        }
        return false;
      };

      offsets.forEach(offset => {
        const cellType = offset.type || activeDragPiece.type;
        if (cellType !== 'road') return;

        const targetQ = hoveredCoord.q + offset.q;
        const targetR = hoveredCoord.r + offset.r;
        const { x: x1, z: z1 } = hexToWorld(targetQ, targetR);

        HEX_DIRECTIONS.forEach(dir => {
          const nQ = targetQ + dir.q;
          const nR = targetR + dir.r;

          // Do not draw external ghost connection to cells within the active drag cluster itself
          const isPartOfDraggedPiece = offsets.some(o => hoveredCoord.q + o.q === nQ && hoveredCoord.r + o.r === nR);
          if (isPartOfDraggedPiece) return;

          const nKey = coordKey(nQ, nR);
          const stack = placedTiles.get(nKey) || [];

          const hasTarget = stack.some(isValidRoadConnectionTarget);
          if (hasTarget) {
            const { x: x2, z: z2 } = hexToWorld(nQ, nR);

            // Create connection line
            const points = [
              new THREE.Vector3(x1, 0.45, z1),
              new THREE.Vector3(x2, 0.45, z2)
            ];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const lineMat = new THREE.LineBasicMaterial({
              color: 0x00f3ff, // glowing neon cyan
              linewidth: 3,
            });
            const line = new THREE.Line(lineGeo, lineMat);
            ghost.add(line);

            // Create indicator dot at neighbor center
            const sphereGeo = new THREE.SphereGeometry(0.12, 12, 12);
            const sphereMat = new THREE.MeshBasicMaterial({
              color: 0x00f3ff,
              transparent: true,
              opacity: 0.8,
            });
            const sphere = new THREE.Mesh(sphereGeo, sphereMat);
            sphere.position.set(x2, 0.45, z2);
            ghost.add(sphere);
          }
        });
      });
    }

    ghost.visible = true;
  }, [activeDragPiece, hoveredCoord, unlockedCells, placedTiles]);

  // Sync 3D Rotation Zones (Turntables & Rotary Dial Gizmos)
  useEffect(() => {
    if (!rotationZonesGroupRef.current) return;
    const group = rotationZonesGroupRef.current;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      disposeHierarchy(child);
    }

    if (!rotationZones || rotationZones.length === 0) return;

    rotationZones.forEach(zone => {
      const { x, z } = hexToWorld(zone.center.q, zone.center.r);
      const zoneGroup = new THREE.Group();
      zoneGroup.position.set(x, 0.02, z);

      // 1. Turntable circular ground disc encompassing radius 1 (7 hexes)
      const discRadius = HEX_RADIUS * 2.85;
      const turntableGeo = new THREE.CylinderGeometry(discRadius, discRadius, 0.08, 32);
      const turntableMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.7,
      });
      const turntableMesh = new THREE.Mesh(turntableGeo, turntableMat);
      turntableMesh.position.y = -0.04;
      zoneGroup.add(turntableMesh);

      // 2. Glowing cyan outer gear ring
      const ringGeo = new THREE.RingGeometry(discRadius * 0.94, discRadius * 0.99, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4, // glowing cyan
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.035;
      zoneGroup.add(ringMesh);

      // 3. Center rotating turntable dial gizmo with rotate icon
      const centerDialGroup = new THREE.Group();
      centerDialGroup.userData = { isRotationDial: true, zoneId: zone.id };
      centerDialGroup.position.set(0, 0, 0);

      // Base knob
      const knobGeo = new THREE.CylinderGeometry(0.48, 0.58, 0.22, 12);
      const knobMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.25,
        metalness: 0.85,
      });
      const knob = new THREE.Mesh(knobGeo, knobMat);
      knob.position.y = 0.11;
      centerDialGroup.add(knob);

      // Rotary arrow ring (torus arc)
      const arrowRingGeo = new THREE.TorusGeometry(0.36, 0.05, 8, 24, Math.PI * 1.5);
      arrowRingGeo.rotateX(Math.PI / 2);
      const arrowRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const arrowRing = new THREE.Mesh(arrowRingGeo, arrowRingMat);
      arrowRing.position.y = 0.28;
      centerDialGroup.add(arrowRing);

      // Arrow head pointing in clockwise direction
      const arrowHeadGeo = new THREE.ConeGeometry(0.12, 0.2, 4);
      arrowHeadGeo.rotateZ(-Math.PI / 2);
      const arrowHeadMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const arrowHead = new THREE.Mesh(arrowHeadGeo, arrowHeadMat);
      arrowHead.position.set(0.36, 0.28, 0);
      centerDialGroup.add(arrowHead);

      zoneGroup.add(centerDialGroup);
      group.add(zoneGroup);
    });
  }, [rotationZones]);

  // Pointer & Touch Events Handling (Drag, Pan, Pinch to Zoom)
  const raycaster = useRef(new THREE.Raycaster());
  const mouseVec = useRef(new THREE.Vector2());
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  const getPointerGroundIntersection = (clientX: number, clientY: number): THREE.Vector3 | null => {
    if (!containerRef.current || !cameraRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    mouseVec.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouseVec.current, cameraRef.current);
    const intersectPoint = new THREE.Vector3();
    const hit = raycaster.current.ray.intersectPlane(groundPlane.current, intersectPoint);
    return hit ? intersectPoint : null;
  };

  // Sync raycast target whenever dragPointerPos updates from external touch/mouse drag
  useEffect(() => {
    if (!dragPointerPos || !activeDragPiece) return;
    const hit = getPointerGroundIntersection(dragPointerPos.x, dragPointerPos.y);
    if (hit) {
      const hex = worldToHex(hit.x, hit.z);
      if (!hoveredCoordRef.current || hoveredCoordRef.current.q !== hex.q || hoveredCoordRef.current.r !== hex.r) {
        onHoverCoordChange(hex);
      }
    } else {
      if (hoveredCoordRef.current) onHoverCoordChange(null);
    }
  }, [dragPointerPos, activeDragPiece, onHoverCoordChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only primary mouse button initiates camera pan
    if (e.button !== 0) return;
    isPointerDownRef.current = true;
    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const hit = getPointerGroundIntersection(e.clientX, e.clientY);
    if (hit) {
      const hex = worldToHex(hit.x, hit.z);
      onRightClickBoard(hex);
    } else {
      onRightClickBoard(null);
    }
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    // If dragging a tile from the tray or board, calculate hover hex
    if (activeDragPieceRef.current) {
      const hit = getPointerGroundIntersection(e.clientX, e.clientY);
      if (hit) {
        const hex = worldToHex(hit.x, hit.z);
        if (!hoveredCoordRef.current || hoveredCoordRef.current.q !== hex.q || hoveredCoordRef.current.r !== hex.r) {
          onHoverCoordChange(hex);
        }
      } else {
        if (hoveredCoordRef.current) onHoverCoordChange(null);
      }
      return;
    }

    // Otherwise, handle camera pan if pointer is down
    if (isPointerDownRef.current) {
      const dx = e.clientX - pointerStartPosRef.current.x;
      const dy = e.clientY - pointerStartPosRef.current.y;
      pointerStartPosRef.current = { x: e.clientX, y: e.clientY };

      // Pan camera target smoothly
      const panSpeed = 0.022 * currentZoomRef.current;
      cameraTargetRef.current.x -= dx * panSpeed;
      cameraTargetRef.current.z -= dy * panSpeed;

      // Bound camera panning to the board footprint (plus a small margin)
      const halfSpanX = boardBounds.spanX / 2 + 2;
      const halfSpanZ = boardBounds.spanZ / 2 + 2;
      cameraTargetRef.current.x = Math.max(
        boardBounds.centerX - halfSpanX,
        Math.min(boardBounds.centerX + halfSpanX, cameraTargetRef.current.x)
      );
      cameraTargetRef.current.z = Math.max(
        boardBounds.centerZ - halfSpanZ,
        Math.min(boardBounds.centerZ + halfSpanZ, cameraTargetRef.current.z)
      );
    } else {
      // Desktop hover cursor check
      const hit = getPointerGroundIntersection(e.clientX, e.clientY);
      if (hit) {
        const hex = worldToHex(hit.x, hit.z);
        if (!hoveredCoordRef.current || hoveredCoordRef.current.q !== hex.q || hoveredCoordRef.current.r !== hex.r) {
          onHoverCoordChange(hex);
        }
      }
    }
  }, [boardBounds, onHoverCoordChange]);

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    pinchStartDistRef.current = null;

    const isDragGesture = Math.hypot(
      e.clientX - pointerStartPosRef.current.x,
      e.clientY - pointerStartPosRef.current.y
    ) > 6;

    if (!isDragGesture) {
      // 1. Check if user clicked directly on a 3D Rotation Dial
      if (cameraRef.current && containerRef.current && rotationZonesGroupRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseVec.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVec.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.current.setFromCamera(mouseVec.current, cameraRef.current);

        const hits = raycaster.current.intersectObjects(rotationZonesGroupRef.current.children, true);
        for (const hit of hits) {
          let obj: THREE.Object3D | null = hit.object;
          while (obj) {
            if (obj.userData?.isRotationDial && obj.userData?.zoneId) {
              onRotateZone?.(obj.userData.zoneId);
              return;
            }
            obj = obj.parent;
          }
        }
      }

      // 2. Direct click / tap on hex or placement
      if (activeDragPieceRef.current && hoveredCoordRef.current) {
        onTileDroppedOnBoard(hoveredCoordRef.current);
      } else {
        const hit = getPointerGroundIntersection(e.clientX, e.clientY);
        if (hit) {
          const hex = worldToHex(hit.x, hit.z);
          onTileDroppedOnBoard(hex);
        }
      }
    } else if (activeDragPieceRef.current && hoveredCoordRef.current) {
      onTileDroppedOnBoard(hoveredCoordRef.current);
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.0012;
    currentZoomRef.current = Math.max(0.45, Math.min(1.85, currentZoomRef.current + zoomDelta));
  };

  // Touch Pinch-to-zoom for mobile
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

      if (pinchStartDistRef.current !== null) {
        const diff = pinchStartDistRef.current - dist;
        const zoomDelta = diff * 0.005;
        currentZoomRef.current = Math.max(0.45, Math.min(1.85, currentZoomRef.current + zoomDelta));
      }
      pinchStartDistRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none touch-none overflow-hidden cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={handleContextMenu}
      onWheel={handleWheel}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas key={retryKey} ref={canvasRef} className="w-full h-full block touch-none" />
      {/* Fallback if browser blocked or exhausted WebGL contexts */}
      {webGLError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md text-white">
          <div className="max-w-md p-6 bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl text-center flex flex-col items-center gap-3">
            <span className="text-3xl">🏞️</span>
            <h3 className="text-base font-black">3D Engine Initializing</h3>
            <p className="text-xs text-slate-300">
              The WebGL graphics context was temporarily busy or refreshed. Click below to reload the 3D scene.
            </p>
            <button
              onClick={() => {
                setWebGLError(false);
                setRetryKey(k => k + 1);
              }}
              className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Reload 3D View
            </button>
          </div>
        </div>
      )}

      {/* Subtle vignette shadow overlay */}
      <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-transparent to-slate-900/15" />
    </div>
  );
};

// ==========================================
// 3D Geometry and Procedural Model Helpers
// ==========================================

function createHexPrismGeometry(radius: number, height: number): THREE.CylinderGeometry {
  return new THREE.CylinderGeometry(radius, radius, height, 6);
}

function createHexOutlineGeometry(radius: number): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

function createGhostPreviewGroup(): THREE.Group {
  const group = new THREE.Group();
  group.visible = false;
  return group;
}

function createGhostCell(color: number): THREE.Group {
  const group = new THREE.Group();
  const hexLineGeo = createHexOutlineGeometry(HEX_RADIUS * 0.98);
  const lineMat = new THREE.LineBasicMaterial({ color, linewidth: 3 });
  const line = new THREE.Line(hexLineGeo, lineMat);
  group.add(line);

  const fillGeo = new THREE.CylinderGeometry(HEX_RADIUS * 0.95, HEX_RADIUS * 0.95, 0.1, 6);
  const fillMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35 });
  const fill = new THREE.Mesh(fillGeo, fillMat);
  group.add(fill);

  return group;
}

function createAmbientParticles(): THREE.Points {
  const count = 120;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 45;
    positions[i * 3 + 1] = 1 + Math.random() * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 45;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xfff9db,
    size: 0.22,
    transparent: true,
    opacity: 0.7,
  });
  return new THREE.Points(geo, mat);
}

function animateRise(group: THREE.Group, targetY: number, duration: number) {
  const startY = group.position.y;
  const startTime = performance.now();
  const tick = () => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / duration);
    // Smooth ease out bounce
    const ease = 1 - Math.pow(1 - progress, 3);
    group.position.y = startY + (targetY - startY) * ease;
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);
}

// Build Procedural Low-Poly Forest Outskirts with Frustum-Aware Instancing Support
function buildVastForestEnvironment(
  scene: THREE.Scene,
  forestGroup: THREE.Group,
  isPerfLow: boolean = false
): ForestInstancedData {
  // Rolling meadow floor
  const terrainGeo = new THREE.PlaneGeometry(90, 90, isPerfLow ? 12 : 32, isPerfLow ? 12 : 32);
  terrainGeo.rotateX(-Math.PI / 2);
  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);
    const dist = Math.sqrt(vx * vx + vz * vz);
    // Flat near clearing center, rolling hills in outer forest
    if (dist > 8) {
      const hill = Math.sin(vx * 0.15) * Math.cos(vz * 0.15) * 1.6 + (dist - 8) * 0.08;
      posAttr.setY(i, hill - 0.5);
    } else {
      posAttr.setY(i, -0.4);
    }
  }
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x7ca96a, // lush mossy meadow green
    roughness: 0.9,
    metalness: 0.05,
    flatShading: true,
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.receiveShadow = !isPerfLow;
  forestGroup.add(terrain);

  // Distant River Stream
  const riverGeo = new THREE.PlaneGeometry(12, 80);
  riverGeo.rotateX(-Math.PI / 2);
  riverGeo.rotateY(0.4);
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x5fa8d3,
    roughness: 0.1,
    metalness: 0.8,
  });
  const river = new THREE.Mesh(riverGeo, riverMat);
  river.position.set(-18, -0.42, 0);
  river.receiveShadow = !isPerfLow;
  forestGroup.add(river);

  // Procedural Forest Trees using InstancedMesh with pre-computed transform matrices
  const totalTrees = isPerfLow ? 35 : 220;
  interface TreeData {
    x: number;
    y: number;
    z: number;
    scale: number;
    rotationY: number;
  }
  const pineTreesData: TreeData[] = [];
  const deciduousTreesData: TreeData[] = [];

  for (let i = 0; i < totalTrees; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 9 + Math.random() * 32;
    const tx = Math.cos(angle) * radius;
    const tz = Math.sin(angle) * radius;

    // Exclude river strip
    if (tx < -14 && tx > -22) continue;

    const scale = 0.65 + Math.random() * 0.6;
    const ty = -0.3 + (radius > 12 ? (radius - 12) * 0.06 : 0);
    const rotationY = Math.random() * Math.PI * 2;
    const isPine = Math.random() > 0.45;

    if (isPine) {
      pineTreesData.push({ x: tx, y: ty, z: tz, scale, rotationY });
    } else {
      deciduousTreesData.push({ x: tx, y: ty, z: tz, scale, rotationY });
    }
  }

  const dummy = new THREE.Object3D();

  // 1. Instanced Pine Trees (Trunks & Cones)
  const pineAssets: PineAsset[] = [];
  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.9, 5);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.9, flatShading: true });
  const pineTrunksMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, Math.max(1, pineTreesData.length));
  pineTrunksMesh.castShadow = !isPerfLow;

  const cone1Geo = new THREE.ConeGeometry(1.1, 1.4, 6);
  const cone2Geo = new THREE.ConeGeometry(0.85, 1.2, 6);
  const cone3Geo = new THREE.ConeGeometry(0.55, 0.9, 6);
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.8, flatShading: true });

  const cone1Mesh = new THREE.InstancedMesh(cone1Geo, foliageMat, Math.max(1, pineTreesData.length));
  cone1Mesh.castShadow = !isPerfLow;

  let cone2Mesh: THREE.InstancedMesh | null = null;
  let cone3Mesh: THREE.InstancedMesh | null = null;
  if (!isPerfLow) {
    cone2Mesh = new THREE.InstancedMesh(cone2Geo, foliageMat, Math.max(1, pineTreesData.length));
    cone2Mesh.castShadow = true;
    cone3Mesh = new THREE.InstancedMesh(cone3Geo, foliageMat, Math.max(1, pineTreesData.length));
    cone3Mesh.castShadow = true;
  }

  pineTreesData.forEach((t, i) => {
    // Trunk
    dummy.position.set(t.x, t.y + 0.45 * t.scale, t.z);
    dummy.rotation.set(0, t.rotationY, 0);
    dummy.scale.set(t.scale, t.scale, t.scale);
    dummy.updateMatrix();
    const trunkMatrix = dummy.matrix.clone();
    pineTrunksMesh.setMatrixAt(i, trunkMatrix);

    // Cone 1
    dummy.position.set(t.x, t.y + 1.3 * t.scale, t.z);
    dummy.updateMatrix();
    const cone1Matrix = dummy.matrix.clone();
    cone1Mesh.setMatrixAt(i, cone1Matrix);

    let cone2Matrix: THREE.Matrix4 | undefined;
    let cone3Matrix: THREE.Matrix4 | undefined;

    if (!isPerfLow && cone2Mesh && cone3Mesh) {
      dummy.position.set(t.x, t.y + 2.0 * t.scale, t.z);
      dummy.updateMatrix();
      cone2Matrix = dummy.matrix.clone();
      cone2Mesh.setMatrixAt(i, cone2Matrix);

      dummy.position.set(t.x, t.y + 2.65 * t.scale, t.z);
      dummy.updateMatrix();
      cone3Matrix = dummy.matrix.clone();
      cone3Mesh.setMatrixAt(i, cone3Matrix);
    }

    const boundingSphere = new THREE.Sphere(new THREE.Vector3(t.x, t.y + 1.5 * t.scale, t.z), 2.2 * t.scale);

    pineAssets.push({
      boundingSphere,
      trunkMatrix,
      cone1Matrix,
      cone2Matrix,
      cone3Matrix,
    });
  });

  pineTrunksMesh.instanceMatrix.needsUpdate = true;
  cone1Mesh.instanceMatrix.needsUpdate = true;
  forestGroup.add(pineTrunksMesh);
  forestGroup.add(cone1Mesh);
  if (cone2Mesh) {
    cone2Mesh.instanceMatrix.needsUpdate = true;
    forestGroup.add(cone2Mesh);
  }
  if (cone3Mesh) {
    cone3Mesh.instanceMatrix.needsUpdate = true;
    forestGroup.add(cone3Mesh);
  }

  // 2. Instanced Deciduous Trees (Trunks & Canopies)
  const deciduousAssets: DeciduousAsset[] = [];
  const decTrunkGeo = new THREE.CylinderGeometry(0.14, 0.22, 1.1, 5);
  const decTrunkMat = new THREE.MeshStandardMaterial({ color: 0x6c584c, roughness: 0.9, flatShading: true });
  const decTrunksMesh = new THREE.InstancedMesh(decTrunkGeo, decTrunkMat, Math.max(1, deciduousTreesData.length));
  decTrunksMesh.castShadow = !isPerfLow;

  const canopyGeo = new THREE.DodecahedronGeometry(0.9, isPerfLow ? 0 : 1);
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0x52b788, roughness: 0.8, flatShading: true });
  const canopyMesh = new THREE.InstancedMesh(canopyGeo, canopyMat, Math.max(1, deciduousTreesData.length));
  canopyMesh.castShadow = !isPerfLow;

  deciduousTreesData.forEach((t, i) => {
    // Trunk
    dummy.position.set(t.x, t.y + 0.55 * t.scale, t.z);
    dummy.rotation.set(0, t.rotationY, 0);
    dummy.scale.set(t.scale, t.scale, t.scale);
    dummy.updateMatrix();
    const trunkMatrix = dummy.matrix.clone();
    decTrunksMesh.setMatrixAt(i, trunkMatrix);

    // Canopy
    dummy.position.set(t.x, t.y + 1.6 * t.scale, t.z);
    dummy.updateMatrix();
    const canopyMatrix = dummy.matrix.clone();
    canopyMesh.setMatrixAt(i, canopyMatrix);

    const boundingSphere = new THREE.Sphere(new THREE.Vector3(t.x, t.y + 1.2 * t.scale, t.z), 2.0 * t.scale);

    deciduousAssets.push({
      boundingSphere,
      trunkMatrix,
      canopyMatrix,
    });
  });

  decTrunksMesh.instanceMatrix.needsUpdate = true;
  canopyMesh.instanceMatrix.needsUpdate = true;
  forestGroup.add(decTrunksMesh);
  forestGroup.add(canopyMesh);

  // 3. Instanced Scattered Boulders
  const rockAssets: RockAsset[] = [];
  const rockCount = isPerfLow ? 12 : 35;
  let rockInstancedMesh: THREE.InstancedMesh | null = null;

  if (rockCount > 0) {
    const rockGeo = new THREE.DodecahedronGeometry(0.35, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9, flatShading: true });
    rockInstancedMesh = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    rockInstancedMesh.castShadow = !isPerfLow;

    for (let i = 0; i < rockCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 6 + Math.random() * 14;
      const rx = Math.cos(angle) * r;
      const rz = Math.sin(angle) * r;
      const s = 0.8 + Math.random() * 0.5;

      dummy.position.set(rx, -0.2, rz);
      dummy.rotation.set(Math.random(), Math.random(), Math.random());
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      const rockMatrix = dummy.matrix.clone();
      rockInstancedMesh.setMatrixAt(i, rockMatrix);

      rockAssets.push({
        boundingSphere: new THREE.Sphere(new THREE.Vector3(rx, -0.2, rz), 1.0 * s),
        matrix: rockMatrix,
      });
    }
    rockInstancedMesh.instanceMatrix.needsUpdate = true;
    forestGroup.add(rockInstancedMesh);
  }

  return {
    pineTrees: pineAssets,
    deciduousTrees: deciduousAssets,
    rocks: rockAssets,
    pineTrunksMesh,
    cone1Mesh,
    cone2Mesh,
    cone3Mesh,
    decTrunksMesh,
    canopyMesh,
    rockMesh: rockInstancedMesh,
  };
}

function createLowPolyPine(scale: number, isPerfLow: boolean = false): THREE.Group {
  const group = new THREE.Group();
  group.scale.set(scale, scale, scale);

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.9, 5);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.9, flatShading: true });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.45;
  trunk.castShadow = !isPerfLow;
  group.add(trunk);

  // Foliage Cones
  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x2d6a4f,
    roughness: 0.8,
    flatShading: true,
  });

  const cone1 = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.4, 6), foliageMat);
  cone1.position.y = 1.3;
  cone1.castShadow = !isPerfLow;
  group.add(cone1);

  if (!isPerfLow) {
    const cone2 = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.2, 6), foliageMat);
    cone2.position.y = 2.0;
    cone2.castShadow = true;
    group.add(cone2);

    const cone3 = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.9, 6), foliageMat);
    cone3.position.y = 2.65;
    cone3.castShadow = true;
    group.add(cone3);
  }

  return group;
}

function createLowPolyDeciduous(scale: number, isPerfLow: boolean = false): THREE.Group {
  const group = new THREE.Group();
  group.scale.set(scale, scale, scale);

  const trunkGeo = new THREE.CylinderGeometry(0.14, 0.22, 1.1, 5);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6c584c, roughness: 0.9, flatShading: true });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.55;
  trunk.castShadow = !isPerfLow;
  group.add(trunk);

  const canopyGeo = new THREE.DodecahedronGeometry(0.9, isPerfLow ? 0 : 1);
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x52b788,
    roughness: 0.8,
    flatShading: true,
  });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.y = 1.6;
  canopy.castShadow = !isPerfLow;
  group.add(canopy);

  return group;
}

function createLowPolyRock(isPerfLow: boolean = false): THREE.Mesh {
  const geo = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.2, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9, flatShading: true });
  const rock = new THREE.Mesh(geo, mat);
  rock.castShadow = !isPerfLow;
  return rock;
}

// Helper to count the size of the connected road/bridge network for a tile
function getConnectedRoadCount(startQ: number, startR: number, placedTiles?: Map<string, PlacedTile[]>): number {
  if (!placedTiles) return 1;
  const visited = new Set<string>();
  const queue: { q: number; r: number }[] = [{ q: startQ, r: startR }];
  visited.add(coordKey(startQ, startR));

  while (queue.length > 0) {
    const curr = queue.shift()!;
    HEX_DIRECTIONS.forEach(dir => {
      const nQ = curr.q + dir.q;
      const nR = curr.r + dir.r;
      const nKey = coordKey(nQ, nR);
      if (!visited.has(nKey)) {
        const stack = placedTiles.get(nKey) || [];
        const hasRoadOrBridge = stack.some(t => t.type === 'road' || t.type === 'bridge');
        if (hasRoadOrBridge) {
          visited.add(nKey);
          queue.push({ q: nQ, r: nR });
        }
      }
    });
  }
  return visited.size;
}

// 3D Tile Content Generator (House, Trees, Mixed)
function create3DTileMesh(
  tile: PlacedTile,
  isDisconnected: boolean,
  isPickedUp: boolean = false,
  isOffMap: boolean = false,
  isOverlapping: boolean = false,
  unlockedCells?: Map<string, GridCell>,
  placedTiles?: Map<string, PlacedTile[]>
): THREE.Group {
  const group = new THREE.Group();
  group.userData = { isPickedUp, isOffMap, isOverlapping, q: tile.q, r: tile.r };

  // Roof & Accent color based on tile color theme
  const accentColors: Record<TileColor, number> = {
    neutral: 0xc87d55, // classic terracotta
    amber: 0xf59e0b,   // golden amber
    emerald: 0x10b981, // verdant emerald
    sapphire: 0x3b82f6,// azure sapphire
    ruby: 0xef4444,    // bright ruby
  };
  const accent = accentColors[tile.color];

  if (tile.type === 'house') {
    // Cottage 1
    const house1 = createCottageMesh(accent, 0.9);
    house1.position.set(-0.25, 0, -0.15);
    house1.rotation.y = 0.3;
    group.add(house1);

    // Minor workshop / annex
    const house2 = createCottageMesh(accent, 0.6);
    house2.position.set(0.38, 0, 0.25);
    house2.rotation.y = -0.5;
    group.add(house2);

    // Cobblestone path
    const path = createGardenStone();
    path.position.set(0.1, 0.02, 0.1);
    group.add(path);
  } else if (tile.type === 'trees') {
    // Cluster of trees
    const tree1 = createLowPolyPine(0.55);
    tree1.position.set(-0.35, 0, -0.3);
    group.add(tree1);

    const tree2 = createLowPolyPine(0.65);
    tree2.position.set(0.35, 0, -0.1);
    group.add(tree2);

    const tree3 = createLowPolyDeciduous(0.5);
    tree3.position.set(0, 0, 0.35);
    group.add(tree3);

    const flower = createFlowerPatch(accent);
    flower.position.set(-0.2, 0.02, 0.2);
    group.add(flower);
  } else if (tile.type === 'road') {
    // Only actual road/bridge neighbors create arms.
    // Each tile draws its arms from center to the shared hex edge, meeting adjacent tiles seamlessly.
    const connectedDirs: { dirIdx: number; angle: number; neighborKey: string; neighborType: 'road' | 'bridge' }[] = [];
    const centerPos = hexToWorld(tile.q, tile.r);

    HEX_DIRECTIONS.forEach((dir, dirIdx) => {
      const nQ = tile.q + dir.q;
      const nR = tile.r + dir.r;
      const nKey = coordKey(nQ, nR);
      const stack = placedTiles ? placedTiles.get(nKey) || [] : [];
      const neighborBridge = stack.find(t => t.type === 'bridge');
      const neighborRoad = stack.find(t => t.type === 'road');
      if (neighborBridge || neighborRoad) {
        const posN = hexToWorld(nQ, nR);
        const angle = Math.atan2(posN.x - centerPos.x, posN.z - centerPos.z);
        connectedDirs.push({
          dirIdx,
          angle,
          neighborKey: nKey,
          neighborType: neighborBridge ? 'bridge' : 'road',
        });
      }
    });

    // Isolated road tiles do NOT push fake arms — renders a clean central hub without edges sticking out!
    const isJunction = tile.id.includes('junction') || tile.id.includes('roundabout') || Boolean((tile as any).isJunction);
    const junctionType: '3way' | '4way' | 'roundabout' | undefined = tile.id.includes('roundabout')
      ? 'roundabout'
      : tile.id.includes('4way')
        ? '4way'
        : tile.id.includes('3way') || isJunction
          ? '3way'
          : undefined;

    const roadGroup = createFullHexRoadMesh({
      connectedDirs,
      isGlow: !isDisconnected,
      accentColor: accent,
      isJunction,
      junctionType,
    });
    group.add(roadGroup);
  } else if (tile.type === 'bridge') {
    const connectedDirs: { dirIdx: number; angle: number; neighborKey: string; neighborType: 'road' | 'bridge' }[] = [];
    const centerPos = hexToWorld(tile.q, tile.r);

    HEX_DIRECTIONS.forEach((dir, dirIdx) => {
      const nQ = tile.q + dir.q;
      const nR = tile.r + dir.r;
      const nKey = coordKey(nQ, nR);
      const stack = placedTiles ? placedTiles.get(nKey) || [] : [];
      const neighborBridge = stack.find(t => t.type === 'bridge');
      const neighborRoad = stack.find(t => t.type === 'road');
      if (neighborBridge || neighborRoad) {
        const posN = hexToWorld(nQ, nR);
        const angle = Math.atan2(posN.x - centerPos.x, posN.z - centerPos.z);
        connectedDirs.push({
          dirIdx,
          angle,
          neighborKey: nKey,
          neighborType: neighborBridge ? 'bridge' : 'road',
        });
      }
    });

    // If isolated with no neighbors, default to horizontal east-west bridge span across hex (dir 0 & 3)
    if (connectedDirs.length === 0) {
      connectedDirs.push({ dirIdx: 0, angle: Math.PI / 2, neighborKey: '', neighborType: 'road' });
      connectedDirs.push({ dirIdx: 3, angle: -Math.PI / 2, neighborKey: '', neighborType: 'road' });
    }

    const bridgeGroup = createFullHexBridgeMesh({
      connectedDirs,
      isGlow: !isDisconnected,
      accentColor: 0xbe123c,
    });
    group.add(bridgeGroup);
  } else if (tile.type === 'tower') {
    const tower = createComplexTowerMesh(accent);
    group.add(tower);
  } else if (tile.type === 'landmark') {
    const landmark = createLandmarkMesh(accent);
    group.add(landmark);
  } else {
    // Mixed: Cottage nestled with trees & garden
    const cottage = createCottageMesh(accent, 0.78);
    cottage.position.set(-0.2, 0, -0.1);
    cottage.rotation.y = 0.2;
    group.add(cottage);

    const tree = createLowPolyPine(0.6);
    tree.position.set(0.42, 0, 0.2);
    group.add(tree);

    const bush = createFlowerPatch(accent);
    bush.position.set(0.2, 0.02, -0.35);
    group.add(bush);
  }

  // Disconnect warning aura / beacon if disconnected
  if (isDisconnected) {
    const warnBeaconGeo = new THREE.OctahedronGeometry(0.25, 0);
    const warnMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const beacon = new THREE.Mesh(warnBeaconGeo, warnMat);
    beacon.position.y = 1.6;
    group.add(beacon);

    const ringGeo = new THREE.RingGeometry(0.7, 0.85, 16);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.05;
    group.add(ring);
  }

  // Active Overlap Conflict Hazard Aura & Beacon
  if (isOverlapping) {
    const conflictRingGeo = new THREE.RingGeometry(0.72, 0.98, 16);
    conflictRingGeo.rotateX(-Math.PI / 2);
    const conflictMat = new THREE.MeshBasicMaterial({
      color: 0xf97316, // neon orange hazard
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const conflictRing = new THREE.Mesh(conflictRingGeo, conflictMat);
    conflictRing.position.y = 0.05;
    group.add(conflictRing);

    // Conflict floating hazard beacon
    const hazardDiamondGeo = new THREE.DodecahedronGeometry(0.24, 0);
    const hazardDiamondMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 0.85,
      roughness: 0.25,
    });
    const diamond = new THREE.Mesh(hazardDiamondGeo, hazardDiamondMat);
    diamond.position.y = 1.45;
    group.add(diamond);
  }

  // Picked up elevation halo ring
  if (isPickedUp) {
    const liftRingGeo = new THREE.RingGeometry(0.85, 1.15, 16);
    liftRingGeo.rotateX(-Math.PI / 2);
    const liftRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const liftRing = new THREE.Mesh(liftRingGeo, liftRingMat);
    liftRing.position.y = -0.95;
    group.add(liftRing);
  }

  const isBridgeOnOffMap = !unlockedCells?.has(coordKey(tile.q, tile.r)) && tile.type === 'bridge';
  if (isBridgeOnOffMap) {
    const safeRingGeo = new THREE.RingGeometry(0.85, 1.05, 20);
    safeRingGeo.rotateX(-Math.PI / 2);
    const safeRingMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const safeRing = new THREE.Mesh(safeRingGeo, safeRingMat);
    safeRing.position.y = 0.05;
    group.add(safeRing);

    // Subtle vertical light beam to signal "connector"
    const beamGeo = new THREE.CylinderGeometry(0.05, 0.12, 1.4, 8, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.35,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 0.7;
    group.add(beam);
  }

  // Highlighted warning border outline for Off-Map placed tiles
  if (isOffMap) {
    // 1. Prominent warning perimeter hex outline
    const outlineGeo = createHexOutlineGeometry(HEX_RADIUS * 0.98);
    const outlineMat = new THREE.LineBasicMaterial({
      color: 0xff0044, // high-visibility neon crimson
      linewidth: 4,
    });
    const outlineLine = new THREE.Line(outlineGeo, outlineMat);
    outlineLine.position.y = 0.22;
    group.add(outlineLine);

    // 2. Translucent red hazard ground disc
    const cautionBaseGeo = new THREE.CylinderGeometry(HEX_RADIUS * 0.96, HEX_RADIUS * 0.96, 0.16, 6);
    const cautionBaseMat = new THREE.MeshBasicMaterial({
      color: 0xff0044,
      transparent: true,
      opacity: 0.45,
    });
    const cautionBase = new THREE.Mesh(cautionBaseGeo, cautionBaseMat);
    cautionBase.position.y = 0.08;
    group.add(cautionBase);

    // 3. Floating Off-Map beacon marker pointing down
    const beaconGeo = new THREE.ConeGeometry(0.24, 0.42, 5);
    beaconGeo.rotateX(Math.PI);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 1.8;
    group.add(beacon);
  }

  return group;
}

function createCottageMesh(roofColor: number, scale: number): THREE.Group {
  const group = new THREE.Group();
  group.scale.set(scale, scale, scale);

  // Stone base walls
  const wallGeo = new THREE.BoxGeometry(0.7, 0.55, 0.6);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85, flatShading: true });
  const walls = new THREE.Mesh(wallGeo, wallMat);
  walls.position.y = 0.275;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // Roof
  const roofGeo = new THREE.ConeGeometry(0.6, 0.45, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.6, flatShading: true });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 0.77;
  roof.castShadow = true;
  group.add(roof);

  // Chimney
  const chimneyGeo = new THREE.BoxGeometry(0.12, 0.35, 0.12);
  const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
  const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
  chimney.position.set(0.18, 0.85, -0.1);
  chimney.castShadow = true;
  group.add(chimney);

  // Door
  const doorGeo = new THREE.PlaneGeometry(0.16, 0.28);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 0.16, 0.305);
  group.add(door);

  return group;
}

function createGardenStone(): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(0.2, 0.25, 0.04, 5);
  const mat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
  const stone = new THREE.Mesh(geo, mat);
  stone.receiveShadow = true;
  return stone;
}

function createFlowerPatch(color: number): THREE.Mesh {
  const geo = new THREE.DodecahedronGeometry(0.18, 0);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
  const flower = new THREE.Mesh(geo, mat);
  flower.castShadow = true;
  return flower;
}

interface ConnectedRoadNeighbor {
  dirIdx: number;
  angle: number;
  neighborKey: string;
  neighborType: 'road' | 'bridge';
}

interface FullHexRoadParams {
  connectedDirs: ConnectedRoadNeighbor[];
  isGlow: boolean;
  accentColor: number;
  isBridge?: boolean;
  isJunction?: boolean;
  junctionType?: '3way' | '4way' | 'roundabout';
}

function createFullHexRoadMesh({
  connectedDirs,
  isGlow,
  accentColor,
  isBridge = false,
  isJunction = false,
  junctionType,
}: FullHexRoadParams): THREE.Group {
  const group = new THREE.Group();

  // ── 1. Aligned Base Foundation (Flush With Pointy-Topped Grid Hex) ─────────
  // Perfectly aligned (rotation.y = 0) to eliminate misaligned corners sticking out!
  const baseRadius = HEX_RADIUS * 0.94;
  const baseGeo = new THREE.CylinderGeometry(baseRadius, baseRadius, 0.04, 6);
  const shoulderColor = 0x94a3b8;
  const baseMat = new THREE.MeshStandardMaterial({
    color: shoulderColor,
    roughness: 0.85,
    flatShading: true,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.02;
  base.receiveShadow = true;
  group.add(base);

  // ── 2. Seamless Central Asphalt Hub ───────────────────────────────────────
  const armWidth = 0.84;
  const inRadius = HEX_RADIUS * (Math.sqrt(3) / 2); // ~1.16913 units to edge midpoint
  const hubRadius = Math.max(0.44, (armWidth / 2) * 1.05);
  const hubGeo = new THREE.CylinderGeometry(hubRadius, hubRadius, 0.045, 32);
  const asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.92,
    flatShading: true,
  });
  const hub = new THREE.Mesh(hubGeo, asphaltMat);
  hub.position.y = 0.055;
  hub.receiveShadow = true;
  group.add(hub);

  // Stone curb ring around isolated road hub for a neat polished look
  if (connectedDirs.length === 0) {
    const hubBorderGeo = new THREE.RingGeometry(hubRadius * 0.96, hubRadius * 1.04, 32);
    hubBorderGeo.rotateX(-Math.PI / 2);
    const hubBorderMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.6,
    });
    const hubBorder = new THREE.Mesh(hubBorderGeo, hubBorderMat);
    hubBorder.position.y = 0.058;
    group.add(hubBorder);
  }

  // ── 3. Junction Ring Marker / Roundabout Island ───────────────────────────
  if (isJunction && !isBridge) {
    if (junctionType === 'roundabout') {
      const islandGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.075, 28);
      const islandMat = new THREE.MeshStandardMaterial({
        color: 0x15803d, // lush roundabout greenery
        roughness: 0.8,
      });
      const island = new THREE.Mesh(islandGeo, islandMat);
      island.position.y = 0.075;
      group.add(island);

      const islandCurbGeo = new THREE.RingGeometry(0.35, 0.40, 32);
      islandCurbGeo.rotateX(-Math.PI / 2);
      const islandCurbMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.5,
      });
      const islandCurb = new THREE.Mesh(islandCurbGeo, islandCurbMat);
      islandCurb.position.y = 0.082;
      group.add(islandCurb);

      const ringGeo = new THREE.RingGeometry(0.48, 0.54, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshStandardMaterial({
        color: isGlow ? 0x00f3ff : 0xfacc15,
        emissive: isGlow ? 0x00f3ff : 0xfacc15,
        emissiveIntensity: isGlow ? 1.8 : 0.6,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.082;
      group.add(ring);
    } else {
      const ringGeo = new THREE.RingGeometry(0.22, 0.29, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshStandardMaterial({
        color: isGlow ? 0x00f3ff : 0xfacc15,
        emissive: isGlow ? 0x00f3ff : 0xfacc15,
        emissiveIntensity: isGlow ? 1.6 : 0.5,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.079;
      group.add(ring);
    }
  }

  // ── 4. Edge-to-Edge Road Arms (Zero Edge Out, Seamless Interconnection) ───
  // Exact distance from hex center to hex edge midpoint is inRadius.
  // Arms extend exactly inRadius from center with flush flat ends at hex boundary.
  const armLength = inRadius;
  const armGeo = new THREE.BoxGeometry(armWidth, 0.045, armLength);

  // Clean dashed highway markings
  const dashLength = 0.16;
  const dashWidth = 0.035;
  const dashHeight = 0.008;
  const dashGeo = new THREE.BoxGeometry(dashWidth, dashHeight, dashLength);
  const dashColor = isGlow ? 0x00f3ff : 0xfde047;
  const dashMat = new THREE.MeshStandardMaterial({
    color: dashColor,
    emissive: dashColor,
    emissiveIntensity: isGlow ? 2.2 : 0.4,
    roughness: 0.6,
  });

  // Low-poly side curbs along outer edges of road arms
  const curbWidth = 0.04;
  const curbHeight = 0.055;
  const curbStart = hubRadius * 0.75;
  const curbLen = armLength - curbStart;
  const curbGeo = new THREE.BoxGeometry(curbWidth, curbHeight, curbLen);
  const curbMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.6,
    flatShading: true,
  });

  connectedDirs.forEach(conn => {
    const armGroup = new THREE.Group();
    armGroup.rotation.y = conn.angle;

    // Solid asphalt road deck from center to hex edge
    const arm = new THREE.Mesh(armGeo, asphaltMat);
    arm.position.set(0, 0.055, armLength / 2);
    arm.receiveShadow = true;
    armGroup.add(arm);

    // Side curbs along outer flanks of the arm
    const curbL = new THREE.Mesh(curbGeo, curbMat);
    curbL.position.set(-armWidth / 2 + curbWidth / 2, 0.065, curbStart + curbLen / 2);
    armGroup.add(curbL);

    const curbR = new THREE.Mesh(curbGeo, curbMat);
    curbR.position.set(armWidth / 2 - curbWidth / 2, 0.065, curbStart + curbLen / 2);
    armGroup.add(curbR);

    // Highway dashed markings down center of lane
    const dash1 = new THREE.Mesh(dashGeo, dashMat);
    dash1.position.set(0, 0.079, hubRadius + 0.18);
    armGroup.add(dash1);

    const dash2 = new THREE.Mesh(dashGeo, dashMat);
    dash2.position.set(0, 0.079, hubRadius + 0.52);
    armGroup.add(dash2);

    group.add(armGroup);
  });

  return group;
}

// ── ADVANCED ARMORED / CURVED / INTERSECTING / LONG BRIDGE ─────────────────
interface FullHexBridgeParams {
  connectedDirs: ConnectedRoadNeighbor[];
  isGlow: boolean;
  accentColor: number;
}

function createFullHexBridgeMesh({
  connectedDirs,
  isGlow,
  accentColor,
}: FullHexBridgeParams): THREE.Group {
  const group = new THREE.Group();

  const inRadius = HEX_RADIUS * (Math.sqrt(3) / 2); // ~1.16913 units
  const armLength = inRadius * 1.015; // 1.5% micro-overlap for seamless bridge-to-bridge leniency
  const armWidth = 0.84;
  const halfW = armWidth / 2; // 0.42
  const parapetThick = 0.055;
  const innerHalfW = halfW - parapetThick; // 0.365
  const hubRadius = 0.44;

  // ── 1. Hexagonal River Water Body & Pebble Riverbed ────────────────────────
  const waterGeo = new THREE.CylinderGeometry(HEX_RADIUS * 0.96, HEX_RADIUS * 0.96, 0.10, 6);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // vibrant clear river azure
    roughness: 0.12,
    metalness: 0.22,
    transparent: true,
    opacity: 0.88,
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.position.y = -0.01;
  waterMesh.receiveShadow = true;
  group.add(waterMesh);

  // Dark pebble / silt riverbed base underneath
  const bedGeo = new THREE.CylinderGeometry(HEX_RADIUS * 0.96, HEX_RADIUS * 0.96, 0.08, 6);
  const bedMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.95,
    flatShading: true,
  });
  const bedMesh = new THREE.Mesh(bedGeo, bedMat);
  bedMesh.position.y = -0.09;
  group.add(bedMesh);

  // Water surface shimmer ring
  const shimmerGeo = new THREE.RingGeometry(0.35, HEX_RADIUS * 0.88, 6);
  shimmerGeo.rotateX(-Math.PI / 2);
  const shimmerMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
  });
  const shimmer = new THREE.Mesh(shimmerGeo, shimmerMat);
  shimmer.position.y = 0.042;
  group.add(shimmer);

  // ── 2. Materials ──────────────────────────────────────────────────────────
  const bridgeDeckMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // crisp architectural stone bridge roadway
    roughness: 0.65,
    flatShading: true,
    side: THREE.DoubleSide,
  });
  const stepRiserMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // dark slate stone step riser shadow
    roughness: 0.85,
    flatShading: true,
    side: THREE.DoubleSide,
  });
  const stepNosingMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // beveled stone step nosing
    roughness: 0.6,
  });
  const whiteParapetMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // clean architectural white stone
    roughness: 0.45,
    flatShading: true,
    side: THREE.DoubleSide,
  });
  const copingMat = new THREE.MeshStandardMaterial({
    color: 0x78350f, // rich warm timber/bronze top handrail
    roughness: 0.6,
  });
  const glowLedMat = new THREE.MeshStandardMaterial({
    color: isGlow ? 0x00f3ff : 0xfacc15,
    emissive: isGlow ? 0x00f3ff : 0xfacc15,
    emissiveIntensity: isGlow ? 2.5 : 0.5,
  });
  const dashColor = isGlow ? 0x00f3ff : 0xfde047;
  const dashMat = new THREE.MeshStandardMaterial({
    color: dashColor,
    emissive: dashColor,
    emissiveIntensity: isGlow ? 2.2 : 0.4,
    roughness: 0.6,
  });
  const pierMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // weathered granite masonry
    roughness: 0.85,
    flatShading: true,
  });
  const abutmentMat = new THREE.MeshStandardMaterial({
    color: 0x64748b, // sturdy stone abutment
    roughness: 0.85,
    flatShading: true,
  });
  const bankGrassMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e, // lush riverbank embankment grass
    roughness: 0.8,
    flatShading: true,
  });
  const soffitMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9, // architectural white stone soffit
    roughness: 0.5,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  // ── 3. Central Underwater Pier Foundation ─────────────────────────────────
  const pierGeo = new THREE.CylinderGeometry(0.20, 0.26, 0.24, 14);
  const pier = new THREE.Mesh(pierGeo, pierMat);
  pier.position.y = 0.08;
  pier.castShadow = true;
  group.add(pier);

  // Cutwater pier noses pointing upstream and downstream
  const noseGeo = new THREE.ConeGeometry(0.15, 0.24, 4);
  const nose1 = new THREE.Mesh(noseGeo, pierMat);
  nose1.position.set(0, 0.08, 0.24);
  nose1.rotation.y = Math.PI / 4;
  group.add(nose1);

  const nose2 = new THREE.Mesh(noseGeo, pierMat);
  nose2.position.set(0, 0.08, -0.24);
  nose2.rotation.y = Math.PI / 4;
  group.add(nose2);

  // ── 4. Riverbank Embankments Along Sides of the Hex ("Connect to Sides") ───
  // Anchors the bridge into the hex sides so the bridge never feels isolated!
  const riverbankSectors = [
    { angle: Math.PI / 2 + Math.PI / 3, radius: HEX_RADIUS * 0.85 },
    { angle: -Math.PI / 2 - Math.PI / 3, radius: HEX_RADIUS * 0.85 },
  ];
  riverbankSectors.forEach(({ angle, radius }) => {
    // Only place riverbank berms on sides where there are no bridge arms
    const hasArmNearby = connectedDirs.some(c => {
      let diff = Math.abs(c.angle - angle);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      return diff < 0.6;
    });

    if (!hasArmNearby) {
      const bankGroup = new THREE.Group();
      bankGroup.rotation.y = angle;

      // Stone embankment wall at the river's edge
      const quayGeo = new THREE.BoxGeometry(0.65, 0.14, 0.12);
      const quay = new THREE.Mesh(quayGeo, abutmentMat);
      quay.position.set(0, 0.06, radius * 0.82);
      quay.receiveShadow = true;
      bankGroup.add(quay);

      // Sloped green grass bank rising up to the hex perimeter
      const bankGeo = new THREE.BoxGeometry(0.75, 0.10, 0.24);
      const bank = new THREE.Mesh(bankGeo, bankGrassMat);
      bank.position.set(0, 0.08, radius * 0.94);
      bank.receiveShadow = true;
      bankGroup.add(bank);

      group.add(bankGroup);
    }
  });

  // ── 5. Bridge Topology Analysis ───────────────────────────────────────────
  const N = connectedDirs.length;
  const isStraightTwoWay = N === 2 && (() => {
    let diff = Math.abs(connectedDirs[0].angle - connectedDirs[1].angle);
    if (diff > Math.PI) diff = Math.PI * 2 - diff;
    return Math.abs(diff - Math.PI) < 0.35;
  })();
  const isCurvedTwoWay = N === 2 && !isStraightTwoWay;

  // ── 6. Central Elevated Plaza Stone Hub (Elevated at y = 0.22) ─────────────
  // Only needed if 3+ arms meet at center to fill the inner floor at y = 0.22
  if (N >= 3) {
    const centerHubGeo = new THREE.CylinderGeometry(innerHalfW * 0.95, innerHalfW * 0.95, 0.02, 16);
    const centerHub = new THREE.Mesh(centerHubGeo, bridgeDeckMat);
    centerHub.position.y = 0.219;
    centerHub.receiveShadow = true;
    group.add(centerHub);

    const hubSoffitGeo = new THREE.CylinderGeometry(innerHalfW * 0.90, innerHalfW * 0.80, 0.08, 16);
    const hubSoffit = new THREE.Mesh(hubSoffitGeo, soffitMat);
    hubSoffit.position.y = 0.16;
    group.add(hubSoffit);
  }

  // ── 7. Determine Exact Parapet Start Limits Per Arm ────────────────────────
  // Flanks are at -halfW (left) and +halfW (right) looking down +Z towards hex edge.
  // Defaults to 0 so all parapets run full length from center to edge without gaps!
  const flankLimits: { [connIdx: number]: { startL: number; startR: number } } = {};
  connectedDirs.forEach((_, idx) => {
    flankLimits[idx] = { startL: 0, startR: 0 };
  });

  // For curved bridges and multi-way junctions, calculate exact corner meeting distances
  if (N >= 2 && !isStraightTwoWay) {
    const sorted = [...connectedDirs].sort((a, b) => a.angle - b.angle);
    for (let k = 0; k < sorted.length; k++) {
      const armA = sorted[k];
      const armB = sorted[(k + 1) % sorted.length];
      const origIdxA = connectedDirs.indexOf(armA);
      const origIdxB = connectedDirs.indexOf(armB);

      let diff = armB.angle - armA.angle;
      if (diff < 0) diff += Math.PI * 2;

      if (diff < Math.PI) {
        // Inner corner: arm A right flank meets arm B left flank at natural miter distance
        const tMeet = Math.min(armLength * 0.85, Math.max(0.01, halfW / Math.tan(diff / 2)));
        if (flankLimits[origIdxA]) flankLimits[origIdxA].startR = tMeet;
        if (flankLimits[origIdxB]) flankLimits[origIdxB].startL = tMeet;
      }
    }
  }

  // ── 8. Build Roadways & Flank Parapets For Each Arm ────────────────────────
  connectedDirs.forEach((conn, connIdx) => {
    const isLandRoad = conn.neighborType === 'road';
    const armGroup = new THREE.Group();
    armGroup.rotation.y = conn.angle;

    // A. Abutments, Wing-Walls & Embankments Connecting to Sides on Land Approach
    if (isLandRoad) {
      const abutmentGeo = new THREE.BoxGeometry(armWidth + 0.18, 0.13, 0.24);
      const abutment = new THREE.Mesh(abutmentGeo, abutmentMat);
      abutment.position.set(0, 0.045, armLength - 0.12);
      abutment.receiveShadow = true;
      armGroup.add(abutment);

      // Flared stone wing-walls connecting the bridge corners outward into the sides
      const wingGeo = new THREE.BoxGeometry(0.18, 0.18, 0.26);
      const wingL = new THREE.Mesh(wingGeo, abutmentMat);
      wingL.position.set(-halfW - 0.11, 0.07, armLength - 0.14);
      wingL.rotation.y = -Math.PI / 8; // flared outward
      armGroup.add(wingL);

      const wingR = new THREE.Mesh(wingGeo, abutmentMat);
      wingR.position.set(halfW + 0.11, 0.07, armLength - 0.14);
      wingR.rotation.y = Math.PI / 8; // flared outward
      armGroup.add(wingR);

      // Grassy riverbank shoulders on both sides of the bridge entrance
      const bankGeo = new THREE.BoxGeometry(0.35, 0.11, 0.36);
      const bankL = new THREE.Mesh(bankGeo, bankGrassMat);
      bankL.position.set(-halfW - 0.24, 0.05, armLength - 0.18);
      armGroup.add(bankL);

      const bankR = new THREE.Mesh(bankGeo, bankGrassMat);
      bankR.position.set(halfW + 0.24, 0.05, armLength - 0.18);
      armGroup.add(bankR);
    }

    // B. Roadway Deck: Steps on Land Approaches, Flat Stone on Bridge-to-Bridge
    if (isLandRoad) {
      // 5 Distinct Stone Steps climbing up to elevated bridge deck
      const stepCount = 5;
      const stepZoneStart = armLength;
      const stepZoneEnd = armLength * 0.38;
      const stepDepth = (stepZoneStart - stepZoneEnd) / stepCount;
      const yRoad = 0.055;
      const yBridge = 0.22;

      for (let s = 0; s < stepCount; s++) {
        const zFront = stepZoneStart - s * stepDepth;
        const zBack = stepZoneStart - (s + 1) * stepDepth;
        const yStep = yRoad + ((s + 1) / stepCount) * (yBridge - yRoad);
        const yPrev = s === 0 ? yRoad : yRoad + (s / stepCount) * (yBridge - yRoad);

        const treadGeo = new THREE.PlaneGeometry(innerHalfW * 2, stepDepth);
        treadGeo.rotateX(-Math.PI / 2);
        const tread = new THREE.Mesh(treadGeo, bridgeDeckMat);
        tread.position.set(0, yStep, (zFront + zBack) / 2);
        tread.receiveShadow = true;
        armGroup.add(tread);

        const riserHeight = yStep - yPrev;
        const riserGeo = new THREE.PlaneGeometry(innerHalfW * 2, riserHeight);
        const riser = new THREE.Mesh(riserGeo, stepRiserMat);
        riser.position.set(0, yPrev + riserHeight / 2, zFront);
        riser.receiveShadow = true;
        armGroup.add(riser);

        const nosingGeo = new THREE.BoxGeometry(innerHalfW * 2, 0.008, 0.015);
        const nosing = new THREE.Mesh(nosingGeo, stepNosingMat);
        nosing.position.set(0, yStep + 0.004, zFront - 0.008);
        armGroup.add(nosing);
      }

      // Flat stone deck connecting inner step to center plaza
      const innerDeckLength = stepZoneEnd;
      const innerDeckGeo = new THREE.PlaneGeometry(innerHalfW * 2, innerDeckLength);
      innerDeckGeo.rotateX(-Math.PI / 2);
      const innerDeck = new THREE.Mesh(innerDeckGeo, bridgeDeckMat);
      innerDeck.position.set(0, yBridge, innerDeckLength / 2);
      innerDeck.receiveShadow = true;
      armGroup.add(innerDeck);
    } else {
      // Bridge-to-bridge: completely flat, cohesive elevated stone deck at y = 0.22
      const fullDeckGeo = new THREE.PlaneGeometry(innerHalfW * 2, armLength);
      fullDeckGeo.rotateX(-Math.PI / 2);
      const fullDeck = new THREE.Mesh(fullDeckGeo, bridgeDeckMat);
      fullDeck.position.set(0, 0.22, armLength / 2);
      fullDeck.receiveShadow = true;
      armGroup.add(fullDeck);
    }

    // C. Non-Slicing Straight & Mitered Parapets & Railings (NO CIRCLES!)
    const { startL, startR } = flankLimits[connIdx] || { startL: 0, startR: 0 };

    const getParapetTopY = (t: number) => {
      if (isLandRoad) {
        return 0.11 + (0.38 - 0.11) * Math.pow(Math.cos(t * (Math.PI / 2)), 1.35);
      }
      return 0.38;
    };

    const getUnderArchY = (t: number) => {
      if (isLandRoad) {
        return 0.01 + (0.14 - 0.01) * Math.pow(Math.cos(t * (Math.PI / 2)), 2);
      }
      return 0.14;
    };

    const getInnerDeckY = (t: number) => {
      if (isLandRoad) {
        return 0.055 + (0.22 - 0.055) * Math.pow(Math.cos(t * (Math.PI / 2)), 1.8);
      }
      return 0.22;
    };

    // Helper to build a clean flank parapet segment along one side of the arm
    const createFlankParapet = (isLeft: boolean, zStart: number) => {
      const zEnd = armLength;
      if (zEnd <= zStart + 0.03) return null;

      const flankGroup = new THREE.Group();
      const segs = 8;
      const xOuter = isLeft ? -halfW : halfW;
      const xInner = isLeft ? -innerHalfW : innerHalfW;

      const pPos: number[] = [];
      const pIdx: number[] = [];
      const sPos: number[] = [];
      const sIdx: number[] = [];

      for (let i = 0; i <= segs; i++) {
        const frac = i / segs;
        const z = zStart + frac * (zEnd - zStart);
        const tGlobal = z / armLength;

        const yTop = getParapetTopY(tGlobal);
        const yUnder = getUnderArchY(tGlobal);
        const yDeck = getInnerDeckY(tGlobal);

        if (isLeft) {
          pPos.push(xOuter, yTop, z);
          pPos.push(xInner, yTop, z);
          pPos.push(xOuter, yUnder, z);
          pPos.push(xInner, yDeck, z);
        } else {
          pPos.push(xInner, yTop, z);
          pPos.push(xOuter, yTop, z);
          pPos.push(xInner, yDeck, z);
          pPos.push(xOuter, yUnder, z);
        }

        sPos.push(xOuter, yUnder, z);
        sPos.push(xInner, yUnder, z);

        if (i < segs) {
          const p0 = i * 4;
          const p1 = (i + 1) * 4;
          pIdx.push(p0, p0 + 1, p1, p0 + 1, p1 + 1, p1);
          pIdx.push(p0, p1, p0 + 2, p1, p1 + 2, p0 + 2);
          pIdx.push(p0 + 1, p0 + 3, p1 + 1, p0 + 3, p1 + 3, p1 + 1);

          const d0 = i * 2;
          const d1 = d0 + 1;
          const d2 = (i + 1) * 2;
          const d3 = d2 + 1;
          sIdx.push(d0, d2, d1, d1, d2, d3);
        }
      }

      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
      pGeo.setIndex(pIdx);
      pGeo.computeVertexNormals();
      const pMesh = new THREE.Mesh(pGeo, whiteParapetMat);
      pMesh.castShadow = true;
      flankGroup.add(pMesh);

      const sGeo = new THREE.BufferGeometry();
      sGeo.setAttribute('position', new THREE.Float32BufferAttribute(sPos, 3));
      sGeo.setIndex(sIdx);
      sGeo.computeVertexNormals();
      const sMesh = new THREE.Mesh(sGeo, soffitMat);
      flankGroup.add(sMesh);

      // Coping top handrail running flush with parapet
      const cLen = zEnd - zStart;
      const cGeo = new THREE.BoxGeometry(parapetThick * 1.25, 0.025, cLen);
      const cMesh = new THREE.Mesh(cGeo, copingMat);
      const midT = ((zStart + zEnd) / 2) / armLength;
      const midY = getParapetTopY(midT) + 0.012;
      const cX = isLeft ? -halfW + parapetThick / 2 : halfW - parapetThick / 2;
      cMesh.position.set(cX, midY, zStart + cLen / 2);
      flankGroup.add(cMesh);

      // LED transit accent strip
      const ledGeo = new THREE.BoxGeometry(0.022, 0.014, cLen * 0.96);
      const ledMesh = new THREE.Mesh(ledGeo, glowLedMat);
      const midDeckY = getInnerDeckY(midT) + 0.008;
      const ledX = isLeft ? -innerHalfW + 0.014 : innerHalfW - 0.014;
      ledMesh.position.set(ledX, midDeckY, zStart + cLen / 2);
      flankGroup.add(ledMesh);

      return flankGroup;
    };

    const leftParapet = createFlankParapet(true, startL);
    if (leftParapet) armGroup.add(leftParapet);

    const rightParapet = createFlankParapet(false, startR);
    if (rightParapet) armGroup.add(rightParapet);

    // D. Entrance Stone Pillars (ONLY placed on land approach, NEVER between bridges!)
    if (isLandRoad) {
      const pillarGeo = new THREE.BoxGeometry(0.08, 0.16, 0.08);
      const capGeo = new THREE.ConeGeometry(0.06, 0.05, 4);

      const pillarL = new THREE.Mesh(pillarGeo, whiteParapetMat);
      pillarL.position.set(-halfW - 0.01, getParapetTopY(1) + 0.04, armLength - 0.05);
      armGroup.add(pillarL);

      const capL = new THREE.Mesh(capGeo, copingMat);
      capL.position.set(-halfW - 0.01, getParapetTopY(1) + 0.13, armLength - 0.05);
      capL.rotation.y = Math.PI / 4;
      armGroup.add(capL);

      const pillarR = new THREE.Mesh(pillarGeo, whiteParapetMat);
      pillarR.position.set(halfW + 0.01, getParapetTopY(1) + 0.04, armLength - 0.05);
      armGroup.add(pillarR);

      const capR = new THREE.Mesh(capGeo, copingMat);
      capR.position.set(halfW + 0.01, getParapetTopY(1) + 0.13, armLength - 0.05);
      capR.rotation.y = Math.PI / 4;
      armGroup.add(capR);
    }

    // E. Straight Lane Dashes
    if (!isCurvedTwoWay) {
      const dashLength = 0.14;
      const dashWidth = 0.035;
      const dashHeight = 0.008;
      const dashArmGeo = new THREE.BoxGeometry(dashWidth, dashHeight, dashLength);

      const dash1 = new THREE.Mesh(dashArmGeo, dashMat);
      dash1.position.set(0, 0.226, armLength * 0.35);
      armGroup.add(dash1);

      if (!isLandRoad) {
        const dash2 = new THREE.Mesh(dashArmGeo, dashMat);
        dash2.position.set(0, 0.226, armLength * 0.72);
        armGroup.add(dash2);
      }
    }

    group.add(armGroup);
  });

  // ── 9. Seamless Corner Connections (ZERO Circular Borders / Pods) ─────────
  // Smoothly joins parapet walls and coping across corners along the natural road edge
  if (connectedDirs.length >= 2 && !isStraightTwoWay) {
    const sorted = [...connectedDirs].sort((a, b) => a.angle - b.angle);

    for (let k = 0; k < sorted.length; k++) {
      const armA = sorted[k];
      const armB = sorted[(k + 1) % sorted.length];
      const origIdxA = connectedDirs.indexOf(armA);
      const origIdxB = connectedDirs.indexOf(armB);

      let diff = armB.angle - armA.angle;
      if (diff < 0) diff += Math.PI * 2;

      // Unit vectors for arm A
      const dAx = Math.sin(armA.angle);
      const dAz = Math.cos(armA.angle);
      const nAx = Math.cos(armA.angle);
      const nAz = -Math.sin(armA.angle);

      // Unit vectors for arm B
      const dBx = Math.sin(armB.angle);
      const dBz = Math.cos(armB.angle);
      const nBx = Math.cos(armB.angle);
      const nBz = -Math.sin(armB.angle);

      if (diff < Math.PI) {
        // ── A. INNER CORNER JUNCTION (Clean Miter Corner along Road Flank) ────
        // Arm A's right flank meets Arm B's left flank
        const zStartA = flankLimits[origIdxA]?.startR ?? 0;
        const zStartB = flankLimits[origIdxB]?.startL ?? 0;

        const pOuterAx = zStartA * dAx + halfW * nAx;
        const pOuterAz = zStartA * dAz + halfW * nAz;
        const pOuterBx = zStartB * dBx - halfW * nBx;
        const pOuterBz = zStartB * dBz - halfW * nBz;
        const pApexX = (pOuterAx + pOuterBx) / 2;
        const pApexZ = (pOuterAz + pOuterBz) / 2;

        const pInnerAx = zStartA * dAx + innerHalfW * nAx;
        const pInnerAz = zStartA * dAz + innerHalfW * nAz;
        const pInnerBx = zStartB * dBx - innerHalfW * nBx;
        const pInnerBz = zStartB * dBz - innerHalfW * nBz;
        const pDeckApexX = (pInnerAx + pInnerBx) / 2;
        const pDeckApexZ = (pInnerAz + pInnerBz) / 2;

        // Clean miter fill between arm A right flank and arm B left flank
        const cornerMiterGeo = new THREE.BufferGeometry();
        const mPos = [
          pOuterAx, 0.38, pOuterAz,
          pApexX,   0.38, pApexZ,
          pInnerAx, 0.22, pInnerAz,

          pApexX,   0.38, pApexZ,
          pOuterBx, 0.38, pOuterBz,
          pInnerBx, 0.22, pInnerBz,

          pApexX,   0.38, pApexZ,
          pInnerBx, 0.22, pInnerBz,
          pInnerAx, 0.22, pInnerAz,
        ];
        cornerMiterGeo.setAttribute('position', new THREE.Float32BufferAttribute(mPos, 3));
        cornerMiterGeo.computeVertexNormals();
        const cornerMiter = new THREE.Mesh(cornerMiterGeo, whiteParapetMat);
        group.add(cornerMiter);

        // Coping handrail meeting at the apex
        const copingPts = [
          new THREE.Vector3(pOuterAx, 0.392, pOuterAz),
          new THREE.Vector3(pApexX, 0.392, pApexZ),
          new THREE.Vector3(pOuterBx, 0.392, pOuterBz),
        ];
        const cornerCopingGeo = new THREE.BufferGeometry().setFromPoints(copingPts);
        const cornerCopingLine = new THREE.Line(
          cornerCopingGeo,
          new THREE.LineBasicMaterial({ color: 0x78350f, linewidth: 3 })
        );
        group.add(cornerCopingLine);

        // LED transit accent meeting at inner corner
        const ledCornerPts = [
          new THREE.Vector3(pInnerAx, 0.228, pInnerAz),
          new THREE.Vector3(pDeckApexX, 0.228, pDeckApexZ),
          new THREE.Vector3(pInnerBx, 0.228, pInnerBz),
        ];
        const ledCornerGeo = new THREE.BufferGeometry().setFromPoints(ledCornerPts);
        const ledCornerLine = new THREE.Line(
          ledCornerGeo,
          new THREE.LineBasicMaterial({ color: isGlow ? 0x00f3ff : 0xfacc15, linewidth: 2 })
        );
        group.add(ledCornerLine);

        // Road deck filling the inner corner triangle at y = 0.22
        const deckTriGeo = new THREE.BufferGeometry();
        const dPos = [
          0,          0.22, 0,
          pInnerAx,   0.22, pInnerAz,
          pDeckApexX, 0.22, pDeckApexZ,

          0,          0.22, 0,
          pDeckApexX, 0.22, pDeckApexZ,
          pInnerBx,   0.22, pInnerBz,
        ];
        deckTriGeo.setAttribute('position', new THREE.Float32BufferAttribute(dPos, 3));
        deckTriGeo.computeVertexNormals();
        const deckTri = new THREE.Mesh(deckTriGeo, bridgeDeckMat);
        deckTri.receiveShadow = true;
        group.add(deckTri);

      } else {
        // ── B. OUTER SIDE (FLAT MITER / STRAIGHT CONNECT - NO CIRCULAR BORDERS) ──
        // Connects Arm A's left flank at z = 0 directly to Arm B's right flank at z = 0
        const pOuterAx = -halfW * nAx;
        const pOuterAz = -halfW * nAz;
        const pOuterBx = halfW * nBx;
        const pOuterBz = halfW * nBz;

        const pInnerAx = -innerHalfW * nAx;
        const pInnerAz = -innerHalfW * nAz;
        const pInnerBx = innerHalfW * nBx;
        const pInnerBz = innerHalfW * nBz;

        // Clean flat outer wall face between arm A and arm B
        const outerWallGeo = new THREE.BufferGeometry();
        const wPos = [
          pOuterAx, 0.38, pOuterAz,
          pOuterBx, 0.38, pOuterBz,
          pOuterAx, 0.16, pOuterAz,

          pOuterBx, 0.38, pOuterBz,
          pOuterBx, 0.16, pOuterBz,
          pOuterAx, 0.16, pOuterAz,
        ];
        outerWallGeo.setAttribute('position', new THREE.Float32BufferAttribute(wPos, 3));
        outerWallGeo.computeVertexNormals();
        const outerWall = new THREE.Mesh(outerWallGeo, whiteParapetMat);
        outerWall.castShadow = true;
        group.add(outerWall);

        // Straight coping handrail connecting outer flanks
        const copingPts = [
          new THREE.Vector3(pOuterAx, 0.392, pOuterAz),
          new THREE.Vector3(pOuterBx, 0.392, pOuterBz),
        ];
        const outerCopingGeo = new THREE.BufferGeometry().setFromPoints(copingPts);
        const outerCopingLine = new THREE.Line(
          outerCopingGeo,
          new THREE.LineBasicMaterial({ color: 0x78350f, linewidth: 3 })
        );
        group.add(outerCopingLine);

        // Straight LED accent along outer wall base
        const ledPts = [
          new THREE.Vector3(pInnerAx, 0.228, pInnerAz),
          new THREE.Vector3(pInnerBx, 0.228, pInnerBz),
        ];
        const outerLedGeo = new THREE.BufferGeometry().setFromPoints(ledPts);
        const outerLedLine = new THREE.Line(
          outerLedGeo,
          new THREE.LineBasicMaterial({ color: isGlow ? 0x00f3ff : 0xfacc15, linewidth: 2 })
        );
        group.add(outerLedLine);

        // Flush stone road deck filling outer sector at y = 0.22
        const deckGeo = new THREE.BufferGeometry();
        const dPos = [
          0,        0.22, 0,
          pInnerAx, 0.22, pInnerAz,
          pInnerBx, 0.22, pInnerBz,
        ];
        deckGeo.setAttribute('position', new THREE.Float32BufferAttribute(dPos, 3));
        deckGeo.computeVertexNormals();
        const deckMesh = new THREE.Mesh(deckGeo, bridgeDeckMat);
        deckMesh.receiveShadow = true;
        group.add(deckMesh);
      }
    }
  }

  // ── 10. Smooth Curved Highway Lane Marking for Turns (N === 2, non-straight) ─
  if (isCurvedTwoWay) {
    const a0 = connectedDirs[0].angle;
    const a1 = connectedDirs[1].angle;
    let turnDiff = (a1 - a0) % (Math.PI * 2);
    if (turnDiff < 0) turnDiff += Math.PI * 2;

    const startA = turnDiff <= Math.PI ? a0 : a1;
    const sweepA = turnDiff <= Math.PI ? turnDiff : Math.PI * 2 - turnDiff;

    const curvePoints: THREE.Vector3[] = [];
    const curveSegs = 18;
    for (let c = 0; c <= curveSegs; c++) {
      const fr = c / curveSegs;
      const th = startA + fr * sweepA;
      const rLane = hubRadius * 0.65;
      curvePoints.push(new THREE.Vector3(Math.sin(th) * rLane, 0.226, Math.cos(th) * rLane));
    }
    const curveLineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curveLine = new THREE.Line(
      curveLineGeo,
      new THREE.LineBasicMaterial({ color: isGlow ? 0x00f3ff : 0xfde047, linewidth: 2 })
    );
    group.add(curveLine);
  }

  return group;
}

interface DynamicJunctionParams {
  connectedDirs: { dirIdx: number; angle: number; neighborKey: string }[];
  isLargeJunction: boolean;
  isGlow: boolean;
  accentColor: number;
}

function createComplexTowerMesh(accentColor: number): THREE.Group {
  const group = new THREE.Group();
  
  // Heavy cylindrical stone foundation base
  const baseGeo = new THREE.CylinderGeometry(0.42, 0.5, 0.9, 7);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9, flatShading: true });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.45;
  base.castShadow = true;
  group.add(base);

  // Elevated timber deck / living level
  const deckGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 6);
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.y = 1.125;
  deck.castShadow = true;
  group.add(deck);

  // Colorful conical wizard tower roof
  const roofGeo = new THREE.ConeGeometry(0.62, 0.8, 6);
  const roofMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.5, flatShading: true });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 1.75;
  roof.castShadow = true;
  group.add(roof);

  // Decorative crown banner / spear tip on top of roof
  const spireGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 4);
  const spireMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 });
  const spire = new THREE.Mesh(spireGeo, spireMat);
  spire.position.y = 2.25;
  group.add(spire);

  return group;
}

function createLandmarkMesh(accentColor: number): THREE.Group {
  const group = new THREE.Group();

  // Landmark Triumphal Arch of the Pioneers
  const pillarGeo = new THREE.BoxGeometry(0.24, 1.1, 0.24);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7, flatShading: true });
  
  const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
  leftPillar.position.set(-0.35, 0.55, 0);
  leftPillar.castShadow = true;
  
  const rightPillar = leftPillar.clone();
  rightPillar.position.x = 0.35;
  
  group.add(leftPillar);
  group.add(rightPillar);

  // Huge spanning arch top deck
  const archGeo = new THREE.BoxGeometry(1.05, 0.32, 0.38);
  const archMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
  const arch = new THREE.Mesh(archGeo, archMat);
  arch.position.set(0, 1.26, 0);
  arch.castShadow = true;
  group.add(arch);

  // Giant shining crystals/spheres/symbols of color alignment!
  const orbGeo = new THREE.IcosahedronGeometry(0.22, 1);
  const orbMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.65,
    roughness: 0.2,
  });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  orb.position.set(0, 1.62, 0);
  orb.castShadow = true;
  group.add(orb);

  return group;
}

function disposeHierarchy(obj: THREE.Object3D) {
  obj.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    }
  });
}
