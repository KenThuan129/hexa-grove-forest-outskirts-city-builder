import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GridCell, PlacedTile, HexPiece, TileColor, TileType, RotationZone } from '../types/game';
import { hexToWorld, worldToHex, HEX_RADIUS, coordKey } from '../utils/hexMath';

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

  const targetFpsRef = useRef(targetFps);
  targetFpsRef.current = targetFps;
  const onUpdateRendererInfoRef = useRef(onUpdateRendererInfo);
  onUpdateRendererInfoRef.current = onUpdateRendererInfo;

  // Interaction & camera state refs
  const isPointerDownRef = useRef(false);
  const pointerStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 16, 14));
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
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const isPerfLow = performanceMode === 'low';

    // Scene with atmospheric fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd9edf7); // soft airy alpine sky
    scene.fog = new THREE.FogExp2(0xd9edf7, isPerfLow ? 0.022 : 0.018);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, Math.max(0.1, width / Math.max(1, height)), 0.1, 100);
    camera.position.set(0, 16, 14);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Robust WebGL Renderer creation with fallback on canvasRef
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isPerfLow,
        alpha: false,
        powerPreference: isPerfLow ? 'default' : 'high-performance',
        failIfMajorPerformanceCaveat: false,
      });
    } catch {
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: false,
          alpha: false,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false,
        });
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
      sunLight.shadow.camera.far = 70;
      sunLight.shadow.camera.left = -20;
      sunLight.shadow.camera.right = 20;
      sunLight.shadow.camera.top = 20;
      sunLight.shadow.camera.bottom = -20;
      sunLight.shadow.bias = -0.0005;
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
        renderer.dispose();
      }
      scene.clear();
      rendererRef.current = null;
    };
  }, []);

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
        const borderMat = new THREE.LineBasicMaterial({
          color: isColoredZone ? colorData.border : 0x94a3b8,
          linewidth: 2,
        });
        const borderLine = new THREE.LineSegments(borderGeometry, borderMat);
        borderLine.position.set(x, 0.145, z);
        group.add(borderLine);

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
        const isOffMap = !unlockedCells.has(coordKey(tile.q, tile.r));
        const isOverlapping = isCellOverlapped && stackIdx > 0;
        const tileObject = create3DTileMesh(tile, isDisconnected, isPickedUp, isOffMap, isOverlapping);
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

  const handlePointerMove = (e: React.PointerEvent) => {
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

      // Bound camera panning within reasonable outskirts range
      cameraTargetRef.current.x = Math.max(-16, Math.min(16, cameraTargetRef.current.x));
      cameraTargetRef.current.z = Math.max(-16, Math.min(16, cameraTargetRef.current.z));
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
  };

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
    currentZoomRef.current = Math.max(0.55, Math.min(1.85, currentZoomRef.current + zoomDelta));
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
        currentZoomRef.current = Math.max(0.55, Math.min(1.85, currentZoomRef.current + zoomDelta));
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
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />
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
              onClick={() => window.location.reload()}
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

// 3D Tile Content Generator (House, Trees, Mixed)
function create3DTileMesh(
  tile: PlacedTile,
  isDisconnected: boolean,
  isPickedUp: boolean = false,
  isOffMap: boolean = false,
  isOverlapping: boolean = false
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
