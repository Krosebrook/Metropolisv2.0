
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, ThreeElements, useThree } from '@react-three/fiber';
import { MapControls, Float, Outlines, OrthographicCamera, Stars, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { Grid, BuildingType, TileData } from '../types';
import { BUILDINGS, GRID_SIZE } from '../constants';

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

const WORLD_OFFSET = GRID_SIZE / 2 - 0.5;
const gridToWorld = (x: number, y: number) => [x - WORLD_OFFSET, 0, y - WORLD_OFFSET] as [number, number, number];

const GEOMETRY = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cone: new THREE.ConeGeometry(0.5, 1, 4),
  cylinder: new THREE.CylinderGeometry(0.4, 0.4, 1, 12),
  octa: new THREE.OctahedronGeometry(0.5),
  sphere: new THREE.SphereGeometry(0.5, 16, 16),
  torus: new THREE.TorusGeometry(0.3, 0.05, 12, 24)
};

const createProceduralTexture = (type: 'grass' | 'road', seed: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (type === 'grass') {
    // Natural US-inspired Terrain Palette (Greens, Tans, Browns)
    const palettes = [
      ['#2d4a22', '#3a5a2e', '#1b3a1a'], // Deep Forest
      ['#4a5d23', '#5a6d33', '#3a4d13'], // Grassland
      ['#7c6b4d', '#8c7b5d', '#6c5b3d'], // Dirt Path / Mountain
      ['#5b6a4a', '#6b7a5a', '#4b5a3a']  // Sage / Mossy
    ];
    const palette = palettes[seed % palettes.length];
    
    // Gradient Background
    const grad = ctx.createLinearGradient(0, 0, 128, 128);
    grad.addColorStop(0, palette[0]);
    grad.addColorStop(1, palette[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    // Detail Spots (Grass/Noise)
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = palette[1];
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(Math.random() * 128, Math.random() * 128, Math.random() * 8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Texture lines (Gravel/Grass strands)
    ctx.strokeStyle = palette[2];
    ctx.globalAlpha = 0.1;
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 128, Math.random() * 128);
      ctx.lineTo(Math.random() * 128, Math.random() * 128);
      ctx.stroke();
    }
  } else {
    // Road Texture: Worn Stone
    ctx.fillStyle = '#64748b'; // Slate 500
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#334155';
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 4;
    // Cobblestone grid
    for(let i=0; i<=128; i+=32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 128); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(128, i); ctx.stroke();
    }
    // Dirt wear
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = '#451a03';
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.arc(Math.random() * 128, Math.random() * 128, Math.random() * 15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

const SmokeParticle = ({ delay = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = (state.clock.elapsedTime + delay) % 3;
    const progress = t / 3;
    meshRef.current.position.y = progress * 1.8;
    meshRef.current.position.x = Math.sin(t * 3) * 0.15;
    meshRef.current.scale.setScalar(0.1 + progress * 0.4);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.5;
  });
  return (
    <mesh ref={meshRef} geometry={GEOMETRY.sphere}>
      <meshBasicMaterial color="#ffffff" transparent />
    </mesh>
  );
};

const FairytaleBuilding = React.memo(({ tile, time }: { tile: TileData, time: number }) => {
  const config = BUILDINGS[tile.buildingType];
  const lScale = 0.5 + (tile.level * 0.35);
  const variantSeed = (tile.x * 13 + tile.y * 7) % 5;
  const isNight = time < 6 || time > 18;

  const renderModel = () => {
    switch (tile.buildingType) {
      case BuildingType.Residential:
        return (
          <group>
            <mesh geometry={GEOMETRY.box} scale={variantSeed === 1 ? [1.1, 0.8, 0.8] : variantSeed === 2 ? [0.8, 1.3, 0.8] : [0.95, 0.9, 0.95]} castShadow>
              <meshStandardMaterial color={config.color} />
            </mesh>
            <mesh position={[0, variantSeed === 2 ? 1.0 : 0.65, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[0.7, 0.9, 4]} />
              <meshStandardMaterial color="#991b1b" />
            </mesh>
            <mesh position={[0.25, 0.4, 0.1]} scale={[0.15, 0.6, 0.15]} geometry={GEOMETRY.box}>
              <meshStandardMaterial color="#334155" />
            </mesh>
          </group>
        );

      case BuildingType.PowerPlant:
        return (
          <group>
            <mesh geometry={GEOMETRY.cylinder} scale={[0.6, 1.5, 0.6]} position={[0, 0.2, 0]} castShadow>
              <meshStandardMaterial color="#5b21b6" />
            </mesh>
            <mesh position={[0, 1.4, 0]} geometry={GEOMETRY.cone} scale={[0.8, 1.2, 0.8]} castShadow>
              <meshStandardMaterial color="#1e1b4b" />
            </mesh>
            <group position={[0.3, 1.8, 0]}>
              <SmokeParticle delay={0} />
              <SmokeParticle delay={1} />
            </group>
          </group>
        );

      case BuildingType.Industrial:
        return (
          <group>
            <mesh geometry={GEOMETRY.box} scale={[1, 0.5, 1]} position={[0, -0.15, 0]} castShadow>
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh geometry={GEOMETRY.box} scale={[0.6, 0.7, 0.3]} position={[0, 0.1, 0.4]} castShadow>
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            {[[-0.4, 0.4], [0.4, 0.4], [-0.4, -0.4], [0.4, -0.4]].map((p, i) => (
              <mesh key={i} position={[p[0], 0.3, p[1]]} scale={[0.12, 1.2, 0.12]} geometry={GEOMETRY.box}>
                <meshStandardMaterial color="#451a03" />
              </mesh>
            ))}
            <Float speed={4} rotationIntensity={1} floatIntensity={0.5}>
              <mesh position={[0, 0.4, 0]} scale={0.2} geometry={GEOMETRY.octa}>
                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={3} />
              </mesh>
            </Float>
          </group>
        );

      case BuildingType.Commercial:
        return (
          <group>
            <mesh geometry={GEOMETRY.box} scale={[1.15, 0.75, 1.1]} castShadow>
              <meshStandardMaterial color={config.color} />
            </mesh>
            <mesh position={[0, 0.55, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.25, 1.4, 1.2]} geometry={GEOMETRY.cone}>
              <meshStandardMaterial color="#543310" />
            </mesh>
            <mesh position={[0.45, 0.3, 0.5]} scale={[0.1, 0.25, 0.05]} geometry={GEOMETRY.box}>
              <meshStandardMaterial color="#eab308" />
            </mesh>
          </group>
        );

      case BuildingType.Park:
        return (
          <group>
            {[[-0.3, 0.3], [0.3, -0.3], [0.2, 0.4], [-0.4, 0]].map((p, i) => (
              <group key={i} position={[p[0], 0, p[1]]} scale={0.7 + Math.random() * 0.4}>
                <mesh geometry={GEOMETRY.cylinder} scale={[0.1, 0.6, 0.1]} position={[0, 0.3, 0]}>
                  <meshStandardMaterial color="#451a03" />
                </mesh>
                <mesh geometry={GEOMETRY.cone} scale={[0.55, 1.0, 0.55]} position={[0, 0.9, 0]}>
                  <meshStandardMaterial color={i % 2 === 0 ? "#14532d" : "#166534"} />
                </mesh>
              </group>
            ))}
            <Float speed={2} floatIntensity={1}>
              <mesh position={[0, 1.2, 0]} scale={0.06} geometry={GEOMETRY.sphere}>
                <meshBasicMaterial color="#d946ef" />
              </mesh>
            </Float>
          </group>
        );

      default:
        return (
          <mesh geometry={GEOMETRY.box} scale={1.0} castShadow>
            <meshStandardMaterial color={config.color} />
          </mesh>
        );
    }
  };

  return (
    <group position={[0, -0.3, 0]}>
      <group scale={[1, lScale, 1]}>
        {renderModel()}
      </group>
    </group>
  );
});

const KeyboardNavigation = ({ isLocked, onSelectTool }: { isLocked: boolean, onSelectTool: any }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const keysPressed = useRef<Set<string>>(new Set());

  useEffect(() => {
    const down = (e: KeyboardEvent) => keysPressed.current.add(e.key.toLowerCase());
    const up = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    
    const handleContext = (e: MouseEvent) => {
      e.preventDefault();
      onSelectTool(BuildingType.None);
    };
    window.addEventListener('contextmenu', handleContext);

    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('contextmenu', handleContext);
    };
  }, [onSelectTool]);

  useFrame((_, delta) => {
    if (isLocked) return;
    const speed = 30 * delta;
    const pan = new THREE.Vector3();
    if (keysPressed.current.has('arrowup') || keysPressed.current.has('w')) pan.z -= speed;
    if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s')) pan.z += speed;
    if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) pan.x -= speed;
    if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) pan.x += speed;

    if (pan.lengthSq() > 0) {
      const rot = camera.rotation.y;
      const cos = Math.cos(rot), sin = Math.sin(rot);
      const worldPan = new THREE.Vector3(pan.x * cos + pan.z * sin, 0, -pan.x * sin + pan.z * cos);
      camera.position.add(worldPan);
      if (controlsRef.current) {
        controlsRef.current.target.add(worldPan);
        controlsRef.current.update();
      }
    }
  });

  return (
    <MapControls 
      ref={controlsRef} 
      enableRotate={true} 
      enableZoom={true} 
      dampingFactor={0.1} 
      minZoom={10}
      maxZoom={100}
    />
  );
};

const Atmosphere = ({ time, weather }: { time: number, weather: string }) => {
  const isNight = time < 6 || time > 18;
  const sunPos = useMemo(() => {
    const angle = (time / 24) * Math.PI * 2 - Math.PI / 2;
    return [Math.cos(angle) * 80, Math.sin(angle) * 80, 20] as [number, number, number];
  }, [time]);
  
  const lightColor = isNight ? "#312e81" : weather === 'storm' ? "#475569" : "#fffbeb";
  const lightIntensity = isNight ? 0.4 : weather === 'storm' ? 0.6 : 1.8;
  const ambIntensity = isNight ? 0.3 : 0.8;

  return (
    <>
      <Sky sunPosition={sunPos} turbidity={0.5} rayleigh={2} />
      {isNight && <Stars radius={100} depth={50} count={5000} factor={6} saturation={1} fade speed={1.5} />}
      <directionalLight 
        position={sunPos} 
        intensity={lightIntensity} 
        castShadow 
        color={lightColor} 
        shadow-mapSize={[2048, 2048]} 
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <ambientLight intensity={ambIntensity} color="#e0f2fe" />
      <fog attach="fog" args={["#082f49", 80, 250]} />
    </>
  );
};

const IsoMap = ({ grid, onTileClick, onSelectTool, hoveredTool, time, weather, isLocked }: any) => {
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);
  const toolConfig = hoveredTool ? BUILDINGS[hoveredTool as BuildingType] : null;

  const textures = useMemo(() => ({
    grass: Array.from({length: 8}, (_, i) => createProceduralTexture('grass', i)),
    road: createProceduralTexture('road', 0)
  }), []);

  return (
    <div className="absolute inset-0 touch-none">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, logarithmicDepthBuffer: true }}>
        <OrthographicCamera makeDefault zoom={40} position={[150, 150, 150]} />
        <KeyboardNavigation isLocked={isLocked} onSelectTool={onSelectTool} />
        
        <Atmosphere time={time} weather={weather} />
        
        <group>
          {grid.map((row: TileData[], y: number) => row.map((tile: TileData, x: number) => {
            const isRoad = tile.buildingType === BuildingType.Road;
            const noiseIndex = (x * 13 + y * 7) % 8;
            const topTexture = isRoad ? textures.road : textures.grass[noiseIndex];
            const worldPos = gridToWorld(x, y);

            return (
              <group key={`${x}-${y}`} position={worldPos}>
                <mesh 
                  receiveShadow 
                  position={[0, -0.55, 0]} 
                  onPointerEnter={(e) => { e.stopPropagation(); setHoveredTile({x, y}); }}
                  onPointerDown={(e) => { 
                    e.stopPropagation();
                    if (e.button === 0) onTileClick(x, y);
                    if (e.button === 2) onSelectTool(BuildingType.None);
                  }}
                >
                  <boxGeometry args={[1, 0.45, 1]} />
                  {(() => {
                    const sideColor = isRoad ? '#475569' : '#14532d';
                    return [
                      <meshStandardMaterial key="0" attach="material-0" color={sideColor} />,
                      <meshStandardMaterial key="1" attach="material-1" color={sideColor} />,
                      <meshStandardMaterial key="2" attach="material-2" map={topTexture} roughness={1.0} />,
                      <meshStandardMaterial key="3" attach="material-3" color={sideColor} />,
                      <meshStandardMaterial key="4" attach="material-4" color={sideColor} />,
                      <meshStandardMaterial key="5" attach="material-5" color={sideColor} />
                    ];
                  })()}
                  <Outlines thickness={0.002} color="#020617" />
                </mesh>
                
                {tile.buildingType !== BuildingType.None && tile.buildingType !== BuildingType.Road && (
                  <FairytaleBuilding tile={tile} time={time} />
                )}
              </group>
            );
          }))}

          {hoveredTile && !isLocked && (
            <group position={[gridToWorld(hoveredTile.x, hoveredTile.y)[0], -0.3, gridToWorld(hoveredTile.x, hoveredTile.y)[2]]}>
              <mesh rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[1,1]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} depthWrite={false} />
                <Outlines thickness={0.06} color="#ffffff" />
              </mesh>
            </group>
          )}
        </group>
      </Canvas>
    </div>
  );
};

export default IsoMap;
