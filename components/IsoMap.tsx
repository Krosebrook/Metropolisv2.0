
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MapControls, Float, Outlines, OrthographicCamera, Stars, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { BuildingType, TileData } from '../types';
import { BUILDINGS, GRID_SIZE } from '../constants';

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

const MagicBurst = ({ type, level }: { type: BuildingType; level: number }) => {
  const count = 12 + level * 4;
  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: new THREE.Vector3(0, 0.5, 0),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.15,
        Math.random() * 0.2,
        (Math.random() - 0.5) * 0.15
      ),
      scale: Math.random() * 0.2 + 0.1,
      rotation: Math.random() * Math.PI
    }));
  }, [count]);

  const groupRef = useRef<THREE.Group>(null);
  const [life, setLife] = useState(1.0);

  const { geo, color, emissive } = useMemo(() => {
    switch (type) {
      case BuildingType.Residential: return { geo: GEOMETRY.sphere, color: '#fecaca', emissive: '#f87171' };
      case BuildingType.Industrial: return { geo: GEOMETRY.box, color: '#94a3b8', emissive: '#fbbf24' };
      case BuildingType.PowerPlant: return { geo: GEOMETRY.octa, color: '#d946ef', emissive: '#f472b6' };
      case BuildingType.WaterTower: return { geo: GEOMETRY.cone, color: '#60a5fa', emissive: '#3b82f6' };
      case BuildingType.Landmark: return { geo: GEOMETRY.octa, color: '#f59e0b', emissive: '#fcd34d' };
      default: return { geo: GEOMETRY.sphere, color: '#ffffff', emissive: '#ffffff' };
    }
  }, [type]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    setLife((prev) => Math.max(0, prev - delta * 1.5));
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      child.position.add(p.velocity);
      p.velocity.y -= 0.005;
      child.scale.setScalar(p.scale * life);
      child.rotation.x += 0.1;
      child.rotation.z += 0.1;
    });
  });

  if (life <= 0) return null;

  return (
    <group ref={groupRef}>
      {particles.map((_, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={2} transparent opacity={life} />
        </mesh>
      ))}
    </group>
  );
};

const WindmillSails = () => {
  const sailsRef = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (sailsRef.current) sailsRef.current.rotation.z += delta * 2;
  });

  return (
    <group ref={sailsRef}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 0, 0.1]}>
          <boxGeometry args={[0.08, 0.8, 0.02]} />
          <meshStandardMaterial color="#fef3c7" />
          <mesh position={[0.1, 0, 0]}>
            <boxGeometry args={[0.2, 0.7, 0.01]} />
            <meshStandardMaterial color="#fffbeb" transparent opacity={0.8} />
          </mesh>
        </mesh>
      ))}
    </group>
  );
};

const createProceduralTexture = (type: 'grass' | 'road' | 'side', seed: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (type === 'grass') {
    const palettes = [['#064e3b', '#065f46', '#047857'], ['#14532d', '#166534', '#15803d'], ['#365314', '#3f6212', '#4d7c0f']];
    const palette = palettes[seed % palettes.length];
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 128);
    grad.addColorStop(0, palette[2]); grad.addColorStop(1, palette[0]);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = palette[Math.floor(Math.random() * 3)];
      ctx.globalAlpha = Math.random() * 0.4;
      ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
    }
  } else if (type === 'road') {
    ctx.fillStyle = '#334155'; ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
    for(let i = 0; i < 128; i += 32) {
      for(let j = 0; j < 128; j += 32) {
        ctx.strokeRect(i + 2, j + 2, 28, 28);
        ctx.fillStyle = '#1e293b'; ctx.globalAlpha = 0.1; ctx.fillRect(i + 4, j + 4, 24, 24);
      }
    }
  } else if (type === 'side') {
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, '#2d1a0a'); grad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 128, 128);
    ctx.globalAlpha = 0.3;
    const colors = ['#422006', '#451a03', '#1e1b4b'];
    for(let i = 0; i < 5; i++) {
      ctx.fillStyle = colors[i % colors.length]; ctx.fillRect(0, i * 25 + Math.random() * 10, 128, 5);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

const FairytaleBuilding = React.memo(({ tile }: { tile: TileData }) => {
  const config = BUILDINGS[tile.buildingType];
  const lScale = 0.7 + (tile.level * 0.3);
  const variant = tile.variant || 0;
  const [showUpgrade, setShowUpgrade] = useState(false);
  const prevLevel = useRef(tile.level);

  useEffect(() => {
    if (tile.level > prevLevel.current) {
      setShowUpgrade(true);
      const timer = setTimeout(() => setShowUpgrade(false), 2000);
      prevLevel.current = tile.level;
      return () => clearTimeout(timer);
    }
    prevLevel.current = tile.level;
  }, [tile.level]);

  const renderModel = () => {
    switch (tile.buildingType) {
      case BuildingType.Residential:
        return (
          <group>
            <mesh geometry={GEOMETRY.box} scale={[0.85, 0.7, 0.85]} position={[0, 0.15, 0]} castShadow>
              <meshStandardMaterial color={config.color} />
            </mesh>
            <mesh position={[0, 0.6, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[0.7, 0.6, 4]} />
              <meshStandardMaterial color="#991b1b" />
            </mesh>
          </group>
        );
      case BuildingType.Windmill:
        return (
          <group>
            <mesh position={[0, 0.4, 0]} castShadow>
              <cylinderGeometry args={[0.4, 0.5, 0.8, 8]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
            <mesh position={[0, 0.9, 0]} castShadow>
              <coneGeometry args={[0.55, 0.4, 8]} />
              <meshStandardMaterial color="#b45309" />
            </mesh>
            <group position={[0, 0.7, 0.4]}><WindmillSails /></group>
          </group>
        );
      case BuildingType.MagicAcademy:
        return (
          <group>
            <mesh geometry={GEOMETRY.cylinder} scale={[0.7, 1.2, 0.7]} position={[0, 0.2, 0]} castShadow>
              <meshStandardMaterial color="#4c1d95" />
            </mesh>
            <Float speed={3} floatIntensity={1}>
              <mesh geometry={GEOMETRY.octa} scale={0.6} position={[0, 1.5, 0]}>
                <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={3} />
              </mesh>
            </Float>
          </group>
        );
      case BuildingType.PowerPlant:
        return (
          <group>
            <mesh geometry={GEOMETRY.cylinder} scale={[0.5, 1.8, 0.5]} position={[0, 0.4, 0]} castShadow>
              <meshStandardMaterial color="#7c3aed" />
            </mesh>
            <Float speed={5} floatIntensity={1.5}>
              <mesh position={[0, 2.2, 0]} geometry={GEOMETRY.sphere} scale={0.15}>
                <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={4} />
              </mesh>
            </Float>
          </group>
        );
      case BuildingType.Landmark:
        return (
          <group scale={1.4}>
            <mesh geometry={GEOMETRY.box} scale={[1.4, 0.8, 1.4]} position={[0, 0.2, 0]} castShadow>
              <meshStandardMaterial color="#f59e0b" />
            </mesh>
            <mesh position={[0, 1, 0]} geometry={GEOMETRY.cone} scale={[1, 0.8, 1]} rotation={[0, Math.PI/4, 0]}>
              <meshStandardMaterial color="#991b1b" />
            </mesh>
          </group>
        );
      default:
        return <mesh geometry={GEOMETRY.box} scale={0.8} castShadow><meshStandardMaterial color={config.color} /></mesh>;
    }
  };

  return (
    <group position={[0, -0.2, 0]}>
      <group scale={[1, lScale, 1]}>{renderModel()}</group>
      {showUpgrade && <MagicBurst type={tile.buildingType} level={tile.level} />}
    </group>
  );
});

const IsoMap = ({ grid, onTileClick, onSelectTool, time, weather, isLocked }: any) => {
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);

  const textures = useMemo(() => ({
    grass: Array.from({length: 8}, (_, i) => createProceduralTexture('grass', i)),
    road: createProceduralTexture('road', 0),
    side: createProceduralTexture('side', 0)
  }), []);

  const atmosphere = useMemo(() => {
    if (weather === 'rain') return { fog: '#334155', intensity: 0.7, sky: '#475569' };
    if (weather === 'storm') return { fog: '#1e293b', intensity: 0.4, sky: '#1e1b4b' };
    return { fog: '#0c4a6e', intensity: 1.0, sky: '#e0f2fe' };
  }, [weather]);

  return (
    <div className="absolute inset-0 touch-none bg-stone-950">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <OrthographicCamera makeDefault zoom={40} position={[100, 100, 100]} near={0.1} far={2000} />
        <MapControls enableRotate={true} enableZoom={true} dampingFactor={0.1} minZoom={10} maxZoom={120} />
        <Sky sunPosition={[Math.cos((time/24)*Math.PI*2), Math.sin((time/24)*Math.PI*2), 0.5]} turbidity={weather !== 'clear' ? 10 : 0.1} />
        <Stars radius={150} depth={50} count={5000} factor={6} />
        <ambientLight intensity={atmosphere.intensity * (time < 6 || time > 18 ? 0.3 : 1.0)} color={atmosphere.sky} />
        <directionalLight position={[10, 20, 10]} intensity={atmosphere.intensity} castShadow shadow-mapSize={[2048, 2048]} />
        <fog attach="fog" args={[atmosphere.fog, 100, 400]} />
        
        <group>
          {grid.map((row: TileData[], y: number) => row.map((tile: TileData, x: number) => {
            const isRoad = tile.buildingType === BuildingType.Road;
            const topTexture = isRoad ? textures.road : textures.grass[(x*13+y*7)%8];
            return (
              <group key={`${x}-${y}`} position={gridToWorld(x, y)}>
                <mesh 
                  receiveShadow position={[0, -0.4, 0]} 
                  onPointerEnter={(e) => { e.stopPropagation(); setHoveredTile({x, y}); }}
                  onPointerDown={(e) => { e.stopPropagation(); if (e.button === 0) onTileClick(x, y); }}
                >
                  <boxGeometry args={[1, 0.4, 1]} />
                  <meshStandardMaterial map={textures.side} roughness={1.0} attach="material-0" />
                  <meshStandardMaterial map={textures.side} roughness={1.0} attach="material-1" />
                  <meshStandardMaterial map={topTexture} roughness={1.0} attach="material-2" />
                  <meshStandardMaterial color="#0c0a09" attach="material-3" />
                  <meshStandardMaterial map={textures.side} roughness={1.0} attach="material-4" />
                  <meshStandardMaterial map={textures.side} roughness={1.0} attach="material-5" />
                </mesh>
                {tile.buildingType !== BuildingType.None && tile.buildingType !== BuildingType.Road && <FairytaleBuilding tile={tile} />}
              </group>
            );
          }))}
          {hoveredTile && !isLocked && (
            <group position={[gridToWorld(hoveredTile.x, hoveredTile.y)[0], -0.19, gridToWorld(hoveredTile.x, hoveredTile.y)[2]]}>
              <mesh rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[1,1]} /><meshBasicMaterial color="#fbbf24" transparent opacity={0.4} /><Outlines thickness={0.06} color="#ffffff" />
              </mesh>
            </group>
          )}
        </group>
      </Canvas>
    </div>
  );
};

export default IsoMap;
