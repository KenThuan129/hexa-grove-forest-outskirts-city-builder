import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ConstructionItem, ConstructionId } from '../types/economy';

interface Resort3DSceneProps {
  constructions: ConstructionItem[];
  selectedConstructionId: ConstructionId | null;
  onSelectConstruction: (id: ConstructionId) => void;
}

export const Resort3DScene: React.FC<Resort3DSceneProps> = ({
  constructions,
  selectedConstructionId,
  onSelectConstruction,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const plotsGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Rotating parts refs
  const rotatingWindmillRef = useRef<THREE.Group | null>(null);
  const rotatingWaterwheelRef = useRef<THREE.Group | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);

  // Interaction refs
  const isPointerDownRef = useRef(false);
  const pointerStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const cameraSphericalRef = useRef({ radius: 18, phi: Math.PI / 3.4, theta: Math.PI / 4 });

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a1610); // Deep forest dusk
    scene.fog = new THREE.FogExp2(0x0a1610, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 100);
    cameraRef.current = camera;

    const isLowEnd = typeof window !== 'undefined' && (window.navigator?.hardwareConcurrency || 4) <= 4;
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: !isLowEnd,
        alpha: false,
        powerPreference: isLowEnd ? 'default' : 'high-performance',
        failIfMajorPerformanceCaveat: false,
      });
    } catch {
      try {
        renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
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
      return;
    }

    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isLowEnd ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xfff1e0, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.3);
    sunLight.position.set(12, 20, 10);
    sunLight.castShadow = true;
    const shadowRes = isLowEnd ? 512 : 1024;
    sunLight.shadow.mapSize.width = shadowRes;
    sunLight.shadow.mapSize.height = shadowRes;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    scene.add(sunLight);

    const hemisphereLight = new THREE.HemisphereLight(0x7dd3fc, 0x166534, 0.5);
    scene.add(hemisphereLight);

    // ------------------------------------------------------------------------
    // Resort Green Terrain Island
    // ------------------------------------------------------------------------
    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);

    // Main lush grass plateau
    const islandGeo = new THREE.CylinderGeometry(8.5, 9.2, 1.2, 48);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.7,
      metalness: 0.05,
    });
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.y = -0.6;
    islandMesh.receiveShadow = true;
    terrainGroup.add(islandMesh);

    // Lower stone terrace base
    const baseGeo = new THREE.CylinderGeometry(9.6, 10.4, 1.0, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.9,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -1.6;
    baseMesh.receiveShadow = true;
    terrainGroup.add(baseMesh);

    // Sandy beach cove patch (near sand land)
    const sandGeo = new THREE.CircleGeometry(3.0, 24);
    const sandMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.9,
    });
    const sandMesh = new THREE.Mesh(sandGeo, sandMat);
    sandMesh.rotation.x = -Math.PI / 2;
    sandMesh.position.set(-4.5, 0.02, -1.8);
    sandMesh.receiveShadow = true;
    terrainGroup.add(sandMesh);

    // Resort Lagoon Water Patch
    const waterGeo = new THREE.CircleGeometry(2.4, 24);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(-3.8, 0.03, 2.2);
    waterMeshRef.current = waterMesh;
    terrainGroup.add(waterMesh);

    // Perimeter Pine Trees around the island border
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const dist = 7.5 + Math.sin(i * 3.5) * 0.6;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      // Skip spots where buildings are near edge
      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, 0, z);

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.6, 6);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
      trunkMesh.position.y = 0.3;
      treeGroup.add(trunkMesh);

      // Leaves Cone
      const leavesGeo = new THREE.ConeGeometry(0.45, 1.1, 7);
      const leavesMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x15803d : 0x166534,
        roughness: 0.8,
      });
      const leavesMesh = new THREE.Mesh(leavesGeo, leavesMat);
      leavesMesh.position.y = 0.9;
      leavesMesh.castShadow = true;
      treeGroup.add(leavesMesh);

      terrainGroup.add(treeGroup);
    }

    // Plots Group for interactive constructions
    const plotsGroup = new THREE.Group();
    plotsGroupRef.current = plotsGroup;
    scene.add(plotsGroup);

    // Floating fairy firefly particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 120;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 16;
      posArray[i + 1] = Math.random() * 4 + 0.2;
      posArray[i + 2] = (Math.random() - 0.5) * 16;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0xfef08a,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Animation Loop with high-precision timestamp
    const startTimestamp = performance.now();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTimestamp) * 0.001;

      // Rotate windmill blades
      if (rotatingWindmillRef.current) {
        rotatingWindmillRef.current.rotation.z += 0.03;
      }

      // Rotate waterwheel
      if (rotatingWaterwheelRef.current) {
        rotatingWaterwheelRef.current.rotation.x += 0.02;
      }

      // Water ripples
      if (waterMeshRef.current) {
        waterMeshRef.current.scale.set(
          1 + Math.sin(elapsed * 2) * 0.02,
          1 + Math.cos(elapsed * 2) * 0.02,
          1
        );
      }

      // Fairy particles gentle bobbing
      particles.rotation.y = elapsed * 0.03;

      // Update camera position from spherical coords
      const { radius, phi, theta } = cameraSphericalRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0.5, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, []);

  // Update Construction Meshes when constructions prop changes
  useEffect(() => {
    if (!plotsGroupRef.current) return;
    const group = plotsGroupRef.current;

    // Clear existing construction meshes
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    rotatingWindmillRef.current = null;
    rotatingWaterwheelRef.current = null;

    constructions.forEach(item => {
      const pos = item.worldPosition;
      const isSelected = selectedConstructionId === item.id;
      const plotContainer = new THREE.Group();
      plotContainer.position.set(pos.x, 0, pos.z);
      plotContainer.rotation.y = pos.rotation;
      plotContainer.userData = { id: item.id };

      // Plot Base Disc
      const discGeo = new THREE.CylinderGeometry(1.2, 1.25, 0.08, 24);
      const discMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xfbbf24 : item.currentLevel > 0 ? 0x475569 : 0x1e293b,
        roughness: 0.8,
        emissive: isSelected ? 0xb45309 : 0x000000,
        emissiveIntensity: isSelected ? 0.35 : 0,
      });
      const discMesh = new THREE.Mesh(discGeo, discMat);
      discMesh.position.y = 0.04;
      discMesh.receiveShadow = true;
      plotContainer.add(discMesh);

      // If unbuilt (Level 0): Render Blueprint Stakes and parchment
      if (item.currentLevel === 0) {
        // Blueprint Stakes
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const stakeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6);
          const stakeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
          const stake = new THREE.Mesh(stakeGeo, stakeMat);
          stake.position.set(Math.cos(a) * 0.8, 0.2, Math.sin(a) * 0.8);
          plotContainer.add(stake);
        }

        // Blueprint paper
        const paperGeo = new THREE.PlaneGeometry(0.8, 0.8);
        const paperMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.6,
        });
        const paper = new THREE.Mesh(paperGeo, paperMat);
        paper.rotation.x = -Math.PI / 2;
        paper.position.y = 0.09;
        plotContainer.add(paper);
      } else {
        // Built Construction (Levels 1, 2, 3)
        buildProceduralModel(plotContainer, item);
      }

      // Selection Marker Ring if selected
      if (isSelected) {
        const ringGeo = new THREE.RingGeometry(1.3, 1.45, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.12;
        plotContainer.add(ring);
      }

      // Level 3 Max Landmark Golden Aura
      if (item.currentLevel === 3) {
        const auraGeo = new THREE.RingGeometry(1.15, 1.25, 32);
        const auraMat = new THREE.MeshBasicMaterial({
          color: 0xfde047,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });
        const aura = new THREE.Mesh(auraGeo, auraMat);
        aura.rotation.x = -Math.PI / 2;
        aura.position.y = 0.1;
        plotContainer.add(aura);
      }

      group.add(plotContainer);
    });
  }, [constructions, selectedConstructionId]);

  // Helper function to build 3D models per construction
  const buildProceduralModel = (container: THREE.Group, item: ConstructionItem) => {
    const lvl = item.currentLevel;

    switch (item.id) {
      case 'timber_lodge': {
        // Central Lodge House
        const wallHeight = lvl === 1 ? 0.8 : lvl === 2 ? 1.2 : 1.5;
        const houseGeo = new THREE.BoxGeometry(1.4, wallHeight, 1.1);
        const houseMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 });
        const house = new THREE.Mesh(houseGeo, houseMat);
        house.position.y = wallHeight / 2 + 0.08;
        house.castShadow = true;
        container.add(house);

        // Roof
        const roofGeo = new THREE.ConeGeometry(1.2, 0.8, 4);
        const roofMat = new THREE.MeshStandardMaterial({
          color: lvl === 3 ? 0x991b1b : 0x78350f,
          roughness: 0.5,
        });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = wallHeight + 0.48;
        roof.castShadow = true;
        container.add(roof);

        // Chimney
        const chimneyGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
        const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
        chimney.position.set(0.4, wallHeight + 0.4, 0.2);
        container.add(chimney);
        break;
      }

      case 'glade_pool': {
        // Deck chairs and parasols
        const deckGeo = new THREE.BoxGeometry(0.4, 0.08, 0.8);
        const deckMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
        const deck1 = new THREE.Mesh(deckGeo, deckMat);
        deck1.position.set(0.6, 0.1, 0);
        container.add(deck1);

        if (lvl >= 2) {
          const deck2 = new THREE.Mesh(deckGeo, deckMat);
          deck2.position.set(-0.6, 0.1, 0);
          container.add(deck2);

          // Parasol Umbrella
          const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6);
          const pole = new THREE.Mesh(poleGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
          pole.position.set(0.6, 0.45, -0.6);
          container.add(pole);

          const canopyGeo = new THREE.ConeGeometry(0.5, 0.3, 8);
          const canopy = new THREE.Mesh(canopyGeo, new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
          canopy.position.set(0.6, 0.9, -0.6);
          container.add(canopy);
        }
        break;
      }

      case 'campfire_hearth': {
        // Campfire stone ring
        const fireGeo = new THREE.ConeGeometry(0.3, 0.5, 6);
        const fireMat = new THREE.MeshStandardMaterial({
          color: 0xf97316,
          emissive: 0xea580c,
          emissiveIntensity: 0.8,
        });
        const fire = new THREE.Mesh(fireGeo, fireMat);
        fire.position.y = 0.25;
        container.add(fire);

        // Surrounding log benches
        for (let i = 0; i < (lvl >= 2 ? 4 : 2); i++) {
          const a = (i / (lvl >= 2 ? 4 : 2)) * Math.PI * 2;
          const logGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 6);
          const log = new THREE.Mesh(logGeo, new THREE.MeshStandardMaterial({ color: 0x78350f }));
          log.rotation.z = Math.PI / 2;
          log.position.set(Math.cos(a) * 0.7, 0.1, Math.sin(a) * 0.7);
          container.add(log);
        }
        break;
      }

      case 'sand_land': {
        // Tropical Cabana Gazebo
        const cabanaGeo = new THREE.ConeGeometry(0.8, 0.5, 6);
        const cabanaMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.8 });
        const cabana = new THREE.Mesh(cabanaGeo, cabanaMat);
        cabana.position.y = 0.9;
        container.add(cabana);

        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6);
          const post = new THREE.Mesh(postGeo, new THREE.MeshStandardMaterial({ color: 0x78350f }));
          post.position.set(Math.cos(a) * 0.5, 0.45, Math.sin(a) * 0.5);
          container.add(post);
        }
        break;
      }

      case 'greenhouse': {
        // Vaulted Glass Conservatory
        const domeGeo = new THREE.SphereGeometry(0.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshStandardMaterial({
          color: 0x86efac,
          roughness: 0.2,
          transparent: true,
          opacity: 0.7,
        });
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.position.y = 0.08;
        container.add(dome);

        // Internal flowerpot
        const plantGeo = new THREE.ConeGeometry(0.3, 0.5, 6);
        const plant = new THREE.Mesh(plantGeo, new THREE.MeshStandardMaterial({ color: 0x15803d }));
        plant.position.y = 0.25;
        container.add(plant);
        break;
      }

      case 'waterwheel_spa': {
        // Spa tub
        const tubGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 16);
        const tubMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
        const tub = new THREE.Mesh(tubGeo, tubMat);
        tub.position.y = 0.25;
        container.add(tub);

        // Rotating waterwheel
        const wheelGroup = new THREE.Group();
        const wheelGeo = new THREE.TorusGeometry(0.4, 0.06, 8, 16);
        const wheel = new THREE.Mesh(wheelGeo, new THREE.MeshStandardMaterial({ color: 0xa16207 }));
        wheelGroup.add(wheel);
        wheelGroup.position.set(0.85, 0.4, 0);
        wheelGroup.rotation.y = Math.PI / 2;
        container.add(wheelGroup);
        rotatingWaterwheelRef.current = wheelGroup;
        break;
      }

      case 'starlit_terrace': {
        // High observatory deck
        const height = lvl === 1 ? 0.8 : lvl === 2 ? 1.2 : 1.6;
        const deckGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.1, 16);
        const deck = new THREE.Mesh(deckGeo, new THREE.MeshStandardMaterial({ color: 0x854d0e }));
        deck.position.y = height;
        container.add(deck);

        // Pillars
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          const pilGeo = new THREE.CylinderGeometry(0.05, 0.05, height, 6);
          const pil = new THREE.Mesh(pilGeo, new THREE.MeshStandardMaterial({ color: 0x78350f }));
          pil.position.set(Math.cos(a) * 0.7, height / 2, Math.sin(a) * 0.7);
          container.add(pil);
        }

        // Telescope
        const telGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.5, 6);
        const tel = new THREE.Mesh(telGeo, new THREE.MeshStandardMaterial({ color: 0xfbbf24 }));
        tel.rotation.x = Math.PI / 3;
        tel.position.set(0, height + 0.3, 0);
        container.add(tel);
        break;
      }

      case 'bakery_workshop': {
        // Brick Bakery Building
        const bGeo = new THREE.BoxGeometry(1.2, 0.9, 1.0);
        const bMat = new THREE.MeshStandardMaterial({ color: 0xb45309 });
        const b = new THREE.Mesh(bGeo, bMat);
        b.position.y = 0.45;
        container.add(b);

        // Awning roof
        const aGeo = new THREE.ConeGeometry(0.9, 0.4, 4);
        const a = new THREE.Mesh(aGeo, new THREE.MeshStandardMaterial({ color: 0xd97706 }));
        a.rotation.y = Math.PI / 4;
        a.position.y = 1.05;
        container.add(a);
        break;
      }

      case 'windmill_keep': {
        // Stone Windmill Base Tower
        const towerGeo = new THREE.CylinderGeometry(0.5, 0.8, 1.6, 12);
        const towerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.y = 0.8;
        tower.castShadow = true;
        container.add(tower);

        // Cone cap
        const capGeo = new THREE.ConeGeometry(0.6, 0.5, 12);
        const cap = new THREE.Mesh(capGeo, new THREE.MeshStandardMaterial({ color: 0x0f766e }));
        cap.position.y = 1.85;
        container.add(cap);

        // Rotating Sails Group
        const sailsGroup = new THREE.Group();
        sailsGroup.position.set(0, 1.6, 0.52);

        for (let i = 0; i < 4; i++) {
          const bladeGeo = new THREE.BoxGeometry(0.12, 0.9, 0.03);
          const blade = new THREE.Mesh(bladeGeo, new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
          blade.rotation.z = (i * Math.PI) / 2;
          blade.position.set(
            Math.sin((i * Math.PI) / 2) * 0.45,
            Math.cos((i * Math.PI) / 2) * 0.45,
            0
          );
          sailsGroup.add(blade);
        }

        container.add(sailsGroup);
        rotatingWindmillRef.current = sailsGroup;
        break;
      }

      case 'shrine_pavilion': {
        // Pavilion Arch
        const apexHeight = lvl === 1 ? 1.0 : lvl === 2 ? 1.4 : 1.8;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const colGeo = new THREE.CylinderGeometry(0.06, 0.08, apexHeight, 8);
          const col = new THREE.Mesh(colGeo, new THREE.MeshStandardMaterial({ color: 0x9333ea }));
          col.position.set(Math.cos(a) * 0.8, apexHeight / 2, Math.sin(a) * 0.8);
          container.add(col);
        }

        // Crystal apex
        const gemGeo = new THREE.OctahedronGeometry(0.4);
        const gemMat = new THREE.MeshStandardMaterial({
          color: 0xc084fc,
          emissive: 0x7e22ce,
          emissiveIntensity: 0.6,
          roughness: 0.2,
        });
        const gem = new THREE.Mesh(gemGeo, gemMat);
        gem.position.y = apexHeight + 0.35;
        container.add(gem);
        break;
      }

      default:
        break;
    }
  };

  // Pointer / Mouse events for Orbit & Click Selection
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true;
    hasDraggedRef.current = false;
    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    const dx = e.clientX - pointerStartPosRef.current.x;
    const dy = e.clientY - pointerStartPosRef.current.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasDraggedRef.current = true;
    }

    // Orbit Camera
    cameraSphericalRef.current.theta -= dx * 0.007;
    cameraSphericalRef.current.phi = Math.max(
      0.3,
      Math.min(Math.PI / 2.1, cameraSphericalRef.current.phi - dy * 0.007)
    );

    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isPointerDownRef.current = false;

    // If was not a drag, treat as click raycast
    if (!hasDraggedRef.current && containerRef.current && cameraRef.current && plotsGroupRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

      const intersects = raycaster.intersectObjects(plotsGroupRef.current.children, true);
      if (intersects.length > 0) {
        // Find topmost plot container
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.id && obj.parent) {
          obj = obj.parent;
        }

        if (obj?.userData?.id) {
          onSelectConstruction(obj.userData.id as ConstructionId);
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    cameraSphericalRef.current.radius = Math.max(
      8,
      Math.min(26, cameraSphericalRef.current.radius + e.deltaY * 0.02)
    );
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      className="w-full h-full cursor-grab active:cursor-grabbing outline-none select-none relative overflow-hidden"
    >
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />
    </div>
  );
};
