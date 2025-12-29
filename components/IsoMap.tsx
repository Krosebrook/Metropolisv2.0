
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
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

const createProceduralTexture = (type: 'grass' | 'road', seed: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (type === 'grass') {
    const palettes = [
      ['#14532d', '#166534', '#064e3b'], // Deep Forest
      ['#365314', '#3f6212', '#1a2e05'], // Mossy Earth
    ];
    const palette = palettes[seed % palettes.length];
    const grad = ctx.createLinearGradient(0, 0, 128, 128);
    grad.addColorStop(0, palette[0]);
    grad.addColorStop(1, palette[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = palette[1];
      ctx.beginPath();
      ctx.arc(Math.random() * 128, Math.random() * 128, Math.random() * 12, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    for(let i=0; i<=128; i+=32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 128); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(128, i); ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

const FairytaleBuilding = React.memo(({ tile }: { tile: TileData }) => {
  const config = BUILDINGS[tile.buildingType];
  const lScale = 0.7 + (tile.level * 0.3);

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

      case BuildingType.Industrial: // Mine
        return (
          <group>
            <mesh geometry={GEOMETRY.box} scale={[1.1, 0.6, 1.1]} position={[0, 0.1, 0]} castShadow>
              <meshStandardMaterial color="#475569" roughness={0.9} />
            </mesh>
            <mesh geometry={GEOMETRY.octa} scale={0.4} position={[0, 0.6, 0]}>
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
            </mesh>
          </group>
        );

      case BuildingType.PowerPlant: // Wizard Tower
        return (
          <group>
            <mesh geometry={GEOMETRY.cylinder} scale={[0.5, 1.8, 0.5]} position={[0, 0.4, 0]} castShadow>
              <meshStandardMaterial color="#7c3aed" />
            </mesh>
            <mesh position={[0, 1.5, 0]} geometry={GEOMETRY.cone} scale={[0.8, 0.7, 0.8]} castShadow>
              <meshStandardMaterial color="#1e1b4b" />
            </mesh>
            <Float speed={5} floatIntensity={1.5}>
              <mesh position={[0, 2.2, 0]} geometry={GEOMETRY.sphere} scale={0.15}>
                <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={4} />
              </mesh>
            </Float>
          </group>
        );

      case BuildingType.WaterTower: // Ancient Well
        return (
          <group>
            <mesh geometry={GEOMETRY.cylinder} scale={[0.8, 0.8, 0.8]} position={[0, 0.2, 0]} castShadow>
              <meshStandardMaterial color="#64748b" />
            </mesh>
            <mesh position={[0, 0.7, 0]} geometry={GEOMETRY.cone} scale={[1, 0.3, 1]} rotation={[0, Math.PI/4, 0]} castShadow>
              <meshStandardMaterial color="#451a03" />
            </mesh>
            <mesh position={[0, 0.4, 0.45]} geometry={GEOMETRY.box} scale={[0.4, 0.4, 0.1]}>
              <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2} />
            </mesh>
          </group>
        );

      case BuildingType.PoliceStation: // Guard Post
        return (
          <group>
            <mesh geometry={GEOMETRY.box} scale={[0.7, 1.3, 0.7]} position={[0, 0.35, 0]} castShadow>
              <meshStandardMaterial color="#3b82f6" />
            </mesh>
            <mesh position={[0, 1.1, 0]} geometry={GEOMETRY.box} scale={[0.9, 0.2, 0.9]} castShadow>
              <meshStandardMaterial color="#1e3a8a" />
            </mesh>
            <mesh position={[0.4, 0.6, 0.4]} scale={[0.05, 1.1, 0.05]} geometry={GEOMETRY.cylinder}>
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
          </group>
        );

      case BuildingType.Landmark: // Great Castle
        return (
          <group scale={1.4}>
            <mesh geometry={GEOMETRY.box} scale={[1.4, 0.8, 1.4]} position={[0, 0.1, 0]} castShadow>
              <meshStandardMaterial color="#f59e0b" />
            </mesh>
            {[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map((p, i) => (
              <group key={i} position={[p[0], 0.4, p[1]]}>
                <mesh geometry={GEOMETRY.cylinder} scale={[0.3, 1.2, 0.3]} castShadow>
                  <meshStandardMaterial color="#d97706" />
                </mesh>
                <mesh position={[0, 0.7, 0]} geometry={GEOMETRY.cone} scale={[0.4, 0.5, 0.4]}>
                  <meshStandardMaterial color="#991b1b" />
                </mesh>
              </group>
            ))}
          </group>
        );

      case BuildingType.LuminaBloom:
        return (
          <group>
            <mesh geometry={GEOMETRY.sphere} scale={[0.3, 0.2, 0.3]} position={[0, 0.1, 0]}>
              <meshStandardMaterial color="#14532d" />
            </mesh>
            <Float speed={4} floatIntensity={1}>
              <mesh geometry={GEOMETRY.octa} scale={0.3} position={[0, 0.5, 0]}>
                <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={3} />
              </mesh>
            </Float>
          </group>
        );

      case BuildingType.Bakery:
        return (
          <group>
            <mesh geometry={GEOMETRY.box} scale={[0.9, 0.6, 0.9]} position={[0, 0.1, 0]} castShadow>
              <meshStandardMaterial color="#fdba74" />
            </mesh>
            <mesh position={[0, 0.5, 0]} geometry={GEOMETRY.cone} scale={[1, 0.4, 1]} rotation={[0, Math.PI/4, 0]}>
              <meshStandardMaterial color="#7c2d12" />
            </mesh>
          </group>
        );

      case BuildingType.Library:
        return (
          <group>
            <mesh geometry={GEOMETRY.box} scale={[1.1, 1, 0.8]} position={[0, 0.25, 0]} castShadow>
              <meshStandardMaterial color="#2563eb" />
            </mesh>
            <mesh position={[0, 0, 0.4]} geometry={GEOMETRY.box} scale={[0.8, 0.1, 0.1]}>
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        );

      default:
        return (
          <mesh geometry={GEOMETRY.box} scale={0.8} castShadow>
            <meshStandardMaterial color={config.color} />
          </mesh>
        );
    }
  };

  return (
    <group position={[0, -0.2, 0]}>
      <group scale={[1, lScale, 1]}>
        {renderModel()}
      </group>
    </group>
  );
});

const IsoMap = ({ grid, onTileClick, onSelectTool, time, weather, isLocked }: any) => {
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);

  const textures = useMemo(() => ({
    grass: Array.from({length: 8}, (_, i) => createProceduralTexture('grass', i)),
    road: createProceduralTexture('road', 0)
  }), []);

  return (
    <div className="absolute inset-0 touch-none bg-stone-950">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <OrthographicCamera makeDefault zoom={40} position={[100, 100, 100]} near={0.1} far={2000} />
        <MapControls enableRotate={true} enableZoom={true} dampingFactor={0.1} minZoom={10} maxZoom={120} />
        
        <Sky sunPosition={[Math.cos((time/24)*Math.PI*2), Math.sin((time/24)*Math.PI*2), 0.5]} turbidity={0.1} rayleigh={1.5} />
        <Stars radius={150} depth={50} count={5000} factor={6} />
        <ambientLight intensity={time < 6 || time > 18 ? 0.4 : 1.0} color="#e0f2fe" />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
        <fog attach="fog" args={["#0c4a6e", 120, 450]} />
        
        <group>
          {grid.map((row: TileData[], y: number) => row.map((tile: TileData, x: number) => {
            const isRoad = tile.buildingType === BuildingType.Road;
            const topTexture = isRoad ? textures.road : textures.grass[(x*13+y*7)%8];
            const worldPos = gridToWorld(x, y);

            return (
              <group key={`${x}-${y}`} position={worldPos}>
                <mesh 
                  receiveShadow position={[0, -0.4, 0]} 
                  onPointerEnter={(e) => { e.stopPropagation(); setHoveredTile({x, y}); }}
                  onPointerDown={(e) => { 
                    e.stopPropagation();
                    if (e.button === 0) onTileClick(x, y);
                    if (e.button === 2) onSelectTool(BuildingType.None);
                  }}
                >
                  <boxGeometry args={[1, 0.4, 1]} />
                  <meshStandardMaterial color={isRoad ? '#334155' : '#064e3b'} attach="material-0" />
                  <meshStandardMaterial color={isRoad ? '#334155' : '#064e3b'} attach="material-1" />
                  <meshStandardMaterial map={topTexture} roughness={1.0} attach="material-2" />
                  <meshStandardMaterial color={isRoad ? '#334155' : '#064e3b'} attach="material-3" />
                  <meshStandardMaterial color={isRoad ? '#334155' : '#064e3b'} attach="material-4" />
                  <meshStandardMaterial color={isRoad ? '#334155' : '#064e3b'} attach="material-5" />
                </mesh>
                {tile.buildingType !== BuildingType.None && tile.buildingType !== BuildingType.Road && <FairytaleBuilding tile={tile} />}
              </group>
            );
          }))}
          {hoveredTile && !isLocked && (
            <group position={[gridToWorld(hoveredTile.x, hoveredTile.y)[0], -0.19, gridToWorld(hoveredTile.x, hoveredTile.y)[2]]}>
              <mesh rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[1,1]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} depthWrite={false} />
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
