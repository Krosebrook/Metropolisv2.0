
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
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
  cone: new THREE.ConeGeometry(0.5, 1, 8),
  cylinder: new THREE.CylinderGeometry(0.4, 0.4, 1, 12),
  octa: new THREE.OctahedronGeometry(0.5)
};

/**
 * Utility to create procedural fairytale textures
 */
const createProceduralTexture = (type: 'grass' | 'road', seed: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (type === 'grass') {
    // Fill background with a base green
    const baseColors = ['#2e8b57', '#3cb371', '#228b22', '#1e5a1e'];
    ctx.fillStyle = baseColors[seed % baseColors.length];
    ctx.fillRect(0, 0, 128, 128);

    // Add noise and "blades"
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.1})`;
      ctx.fillRect(x, y, 2, 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${0.05 + Math.random() * 0.1})`;
      ctx.fillRect(x + 1, y + 1, 2, 2);
    }
    
    // Subtle gradient for "tuft" appearance
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 90);
    gradient.addColorStop(0, 'rgba(255,255,255,0.05)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  } else {
    // Road Texture
    ctx.fillStyle = '#444444';
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const size = Math.random() * 3;
      ctx.fillStyle = Math.random() > 0.5 ? '#555555' : '#333333';
      ctx.fillRect(x, y, size, size);
    }
    // Cracks/Joints
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 64); ctx.lineTo(128, 64);
    ctx.moveTo(64, 0); ctx.lineTo(64, 128);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
};

const Atmosphere = ({ time, weather }: { time: number, weather: string }) => {
  const isNight = time < 6 || time > 18;
  const sunPos = useMemo(() => {
    const angle = (time / 24) * Math.PI * 2 - Math.PI / 2;
    return [Math.cos(angle) * 50, Math.sin(angle) * 50, 0] as [number, number, number];
  }, [time]);

  const lightColor = isNight ? "#a5b4fc" : weather === 'storm' ? "#94a3b8" : "#fffbeb";
  const lightIntensity = isNight ? 0.4 : weather === 'storm' ? 0.5 : 1.8;

  return (
    <>
      <Sky sunPosition={sunPos} turbidity={weather === 'storm' ? 20 : 0.2} rayleigh={weather === 'storm' ? 10 : 2} />
      {isNight && <Stars radius={100} depth={50} count={5000} factor={6} saturation={1} fade speed={1.5} />}
      <directionalLight position={sunPos} intensity={lightIntensity} castShadow color={lightColor} shadow-mapSize={[2048, 2048]} />
      <ambientLight intensity={isNight ? 0.35 : 0.7} />
      <fog attach="fog" args={["#1a1918", 100, 250]} />
    </>
  );
};

const UpgradeMagic = ({ color }: { color: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const [life, setLife] = useState(1);
  
  const particles = useMemo(() => {
    return Array.from({ length: 18 }, () => ({
      pos: new THREE.Vector3((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5),
      vel: new THREE.Vector3((Math.random() - 0.5) * 0.04, Math.random() * 0.1 + 0.05, (Math.random() - 0.5) * 0.04),
      rot: Math.random() * Math.PI,
      size: Math.random() * 0.1 + 0.05
    }));
  }, []);

  useFrame((_, delta) => {
    if (life <= 0) return;
    setLife(l => l - delta * 0.8);
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        if (i > 0) {
          const p = particles[i-1];
          child.position.add(p.vel);
          child.rotation.y += delta * 5;
          child.scale.multiplyScalar(0.97);
        }
      });
    }
    if (lightRef.current) lightRef.current.intensity = life * 15;
  });

  if (life <= 0) return null;

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      <pointLight ref={lightRef} color={color} distance={4} />
      {particles.map((p, i) => (
        <mesh key={i} position={p.pos.toArray()} rotation={[0, p.rot, 0]} scale={p.size}>
          <octahedronGeometry args={[1]} />
          <meshBasicMaterial color={color} transparent opacity={life} />
        </mesh>
      ))}
    </group>
  );
};

const FairytaleBuilding = React.memo(({ tile, time }: { tile: TileData, time: number }) => {
  const isNight = time < 6 || time > 18;
  const config = BUILDINGS[tile.buildingType];
  const lScale = 0.5 + (tile.level * 0.35);
  
  const [showUpgrade, setShowUpgrade] = useState(false);
  const levelRef = useRef(tile.level);

  useEffect(() => {
    if (tile.level > levelRef.current) {
      setShowUpgrade(true);
      const t = setTimeout(() => setShowUpgrade(false), 2000);
      levelRef.current = tile.level;
      return () => clearTimeout(t);
    }
    levelRef.current = tile.level;
  }, [tile.level]);

  const hasIssue = !tile.hasMana || !tile.hasEssence;
  
  return (
    <group position={[0, -0.3, 0]}>
      {showUpgrade && <UpgradeMagic color="#d946ef" />}
      
      <group scale={[1, lScale, 1]}>
        {tile.buildingType === BuildingType.Residential && (
          <group>
            <mesh geometry={GEOMETRY.box} castShadow>
              <meshStandardMaterial color={config.color} roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.7, 0]} rotation={[0, Math.PI/4, 0]} castShadow>
               <coneGeometry args={[0.7, 0.6, 4]} />
               <meshStandardMaterial color="#991b1b" />
            </mesh>
          </group>
        )}

        {tile.buildingType === BuildingType.PowerPlant && (
          <group>
            <mesh geometry={GEOMETRY.cylinder} castShadow>
               <meshStandardMaterial color="#4c1d95" metalness={0.6} roughness={0.2} />
            </mesh>
            <mesh position={[0, 1.2, 0]} rotation={[time, time*1.5, 0]}>
               <octahedronGeometry args={[0.25]} />
               <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={3} />
            </mesh>
          </group>
        )}

        {(tile.buildingType === BuildingType.Commercial || tile.buildingType === BuildingType.Bakery) && (
          <group>
            <mesh scale={[1.1, 0.7, 1.1]} geometry={GEOMETRY.box} castShadow>
              <meshStandardMaterial color={config.color} />
            </mesh>
            <mesh position={[0, 0.45, 0]} scale={[1.2, 0.15, 1.2]} geometry={GEOMETRY.box}>
              <meshStandardMaterial color="#451a03" />
            </mesh>
          </group>
        )}

        {(tile.buildingType === BuildingType.Industrial || tile.buildingType === BuildingType.LumberMill) && (
          <group>
            <mesh scale={[0.8, 1, 0.8]} geometry={GEOMETRY.box} castShadow>
              <meshStandardMaterial color={config.color} roughness={1} metalness={0.4} />
            </mesh>
            <mesh position={[0, 0.6, 0]} scale={[0.2, 0.6, 0.2]} geometry={GEOMETRY.cylinder}>
              <meshStandardMaterial color="#334155" />
            </mesh>
          </group>
        )}

        {([BuildingType.Park, BuildingType.LuminaBloom].includes(tile.buildingType)) && (
          <group>
            <mesh position={[0, 0, 0]} scale={[0.4, 0.8, 0.4]} geometry={GEOMETRY.cylinder} castShadow>
              <meshStandardMaterial color={config.color} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.5, 0]} rotation={[0, time, 0]} geometry={GEOMETRY.octa} scale={0.3}>
              <meshStandardMaterial color="#bef264" emissive="#bef264" emissiveIntensity={0.5} />
            </mesh>
          </group>
        )}

        {!([BuildingType.Residential, BuildingType.PowerPlant, BuildingType.Commercial, BuildingType.Bakery, BuildingType.Industrial, BuildingType.LumberMill, BuildingType.Park, BuildingType.LuminaBloom].includes(tile.buildingType)) && (
          <mesh geometry={GEOMETRY.box} castShadow>
            <meshStandardMaterial 
              color={config.color} 
              emissive={isNight && tile.hasMana ? config.color : "#000"} 
              emissiveIntensity={isNight ? 0.4 : 0}
            />
          </mesh>
        )}

        {hasIssue && (
          <Float speed={4} rotationIntensity={0.5} floatIntensity={1.5}>
            <mesh position={[0, 1.8 / lScale, 0]} scale={0.15}>
              <sphereGeometry />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          </Float>
        )}
      </group>
    </group>
  );
});

const IsoMap = ({ grid, onTileClick, hoveredTool, time, weather }: any) => {
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);
  const toolConfig = hoveredTool ? BUILDINGS[hoveredTool as BuildingType] : null;

  // Generate varied textures once
  const textures = useMemo(() => ({
    grass: [
      createProceduralTexture('grass', 0),
      createProceduralTexture('grass', 1),
      createProceduralTexture('grass', 2),
      createProceduralTexture('grass', 3),
    ],
    road: createProceduralTexture('road', 0)
  }), []);

  return (
    <div className="absolute inset-0 touch-none">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, stencil: false }}>
        <OrthographicCamera makeDefault zoom={40} position={[80, 80, 80]} />
        <MapControls enableRotate={true} enableZoom={true} dampingFactor={0.1} />
        
        <Atmosphere time={time} weather={weather} />
        
        <group>
          {grid.map((row: TileData[], y: number) => row.map((tile: TileData, x: number) => (
            <group key={`${x}-${y}`}>
              <mesh 
                receiveShadow 
                position={[gridToWorld(x, y)[0], -0.55, gridToWorld(x, y)[2]]} 
                onPointerEnter={() => setHoveredTile({x, y})}
                onPointerDown={(e) => { e.stopPropagation(); onTileClick(x, y); }}
              >
                <boxGeometry args={[1, 0.45, 1]} />
                
                {(() => {
                  const isRoad = tile.buildingType === BuildingType.Road;
                  const noiseIndex = (x * 7 + y * 13) % 4;
                  const topTexture = isRoad ? textures.road : textures.grass[noiseIndex];
                  
                  // Side face colors for 3D depth
                  const sideColor = isRoad ? '#333333' : '#1e5a1e';

                  return [
                    <meshStandardMaterial key="0" attach="material-0" color={sideColor} roughness={0.8} />,
                    <meshStandardMaterial key="1" attach="material-1" color={sideColor} roughness={0.8} />,
                    <meshStandardMaterial key="2" attach="material-2" map={topTexture} roughness={0.9} />,
                    <meshStandardMaterial key="3" attach="material-3" color={sideColor} roughness={0.8} />,
                    <meshStandardMaterial key="4" attach="material-4" color={sideColor} roughness={0.8} />,
                    <meshStandardMaterial key="5" attach="material-5" color={sideColor} roughness={0.8} />
                  ];
                })()}
                
                <Outlines thickness={0.01} color={tile.buildingType === BuildingType.Road ? "#1a1a1a" : "#0d3d0d"} />
              </mesh>
              
              {tile.buildingType !== BuildingType.None && tile.buildingType !== BuildingType.Road && (
                <group position={gridToWorld(x, y)}>
                  <FairytaleBuilding tile={tile} time={time} />
                </group>
              )}
            </group>
          )))}

          {hoveredTile && (
            <group position={[gridToWorld(hoveredTile.x, hoveredTile.y)[0], -0.3, gridToWorld(hoveredTile.x, hoveredTile.y)[2]]}>
              <mesh rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[1,1]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} depthWrite={false} />
                <Outlines thickness={0.06} color="#ffffff" />
              </mesh>
              {toolConfig?.serviceRadius && (
                <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]}>
                  <ringGeometry args={[toolConfig.serviceRadius - 0.05, toolConfig.serviceRadius, 64]} />
                  <meshBasicMaterial color="#f472b6" transparent opacity={0.7} />
                </mesh>
              )}
            </group>
          )}
        </group>
      </Canvas>
    </div>
  );
};

export default IsoMap;
