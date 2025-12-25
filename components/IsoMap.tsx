
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { MapControls, Environment, Float, Outlines, OrthographicCamera, Stars, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { Grid, BuildingType, TileData } from '../types';
import { GRID_SIZE, BUILDINGS, MAX_LEVEL } from '../constants';

// Fix for JSX intrinsic elements errors in Three.js / React Three Fiber
// This ensures that lowercase Three.js elements like <mesh /> and <group /> 
// are correctly typed for the TypeScript compiler.
// Declaring IntrinsicElements in the global JSX namespace satisfies common compiler configurations.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const WORLD_OFFSET = GRID_SIZE / 2 - 0.5;
const gridToWorld = (x: number, y: number) => [x - WORLD_OFFSET, 0, y - WORLD_OFFSET] as [number, number, number];

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const cylinderGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 12);
const sphereGeo = new THREE.SphereGeometry(0.5, 12, 12);

// --- New Atmospheric Components ---

const Atmosphere = ({ time, weather }: { time: number, weather: string }) => {
  const isNight = time < 6 || time > 18;
  const sunPos = useMemo(() => {
    const angle = (time / 24) * Math.PI * 2 - Math.PI / 2;
    return [Math.cos(angle) * 50, Math.sin(angle) * 50, 0] as [number, number, number];
  }, [time]);

  return (
    <>
      <Sky sunPosition={sunPos} turbidity={weather === 'rain' ? 10 : 0.1} rayleigh={weather === 'rain' ? 5 : 1} />
      {isNight && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
      <directionalLight 
        position={sunPos} 
        intensity={isNight ? 0.1 : weather === 'rain' ? 0.8 : 1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      <ambientLight intensity={isNight ? 0.05 : 0.4} />
    </>
  );
};

// --- Procedural Buildings with Night Mode & Utilities ---

const ProceduralBuilding = React.memo(({ tile, time }: { tile: TileData, time: number }) => {
  const isNight = time < 6 || time > 18;
  const config = BUILDINGS[tile.buildingType];
  const lScale = 0.5 + (tile.level * 0.5);
  
  // Visual indicators for lack of utilities
  const hasIssue = !tile.hasPower || !tile.hasWater;
  
  return (
    <group position={[0, -0.3, 0]} scale={[1, lScale, 1]}>
      {tile.buildingType === BuildingType.PowerPlant && (
        <mesh geometry={boxGeo} castShadow>
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
      )}
      
      {tile.buildingType === BuildingType.WaterTower && (
        <mesh geometry={cylinderGeo} castShadow>
          <meshStandardMaterial color="#0284c7" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Default blocks for Res/Com/Ind */}
      {[BuildingType.Residential, BuildingType.Commercial, BuildingType.Industrial].includes(tile.buildingType) && (
        <>
          <mesh geometry={boxGeo} castShadow>
            <meshStandardMaterial 
              color={config.color} 
              emissive={isNight && tile.hasPower ? config.color : "#000"} 
              emissiveIntensity={isNight && tile.hasPower ? 0.5 : 0}
            />
          </mesh>
          {/* Windows that glow at night */}
          {isNight && tile.hasPower && (
            <mesh position={[0, 0, 0.51]} scale={[0.8, 0.8, 0.01]}>
              <boxGeometry />
              <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2} />
            </mesh>
          )}
        </>
      )}

      {/* Warning icon for utility issues */}
      {hasIssue && (
        <Float speed={5} rotationIntensity={0.5} floatIntensity={1}>
          <mesh position={[0, 1.2 / lScale, 0]} scale={[0.2, 0.2, 0.2]}>
            <sphereGeometry />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </Float>
      )}
    </group>
  );
});

const IsoMap = ({ grid, onTileClick, hoveredTool, population, money, time, weather }: any) => {
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);

  return (
    <div className="absolute inset-0 touch-none">
      <Canvas shadows dpr={[1, 2]}>
        <OrthographicCamera makeDefault zoom={45} position={[30, 30, 30]} />
        <MapControls enableRotate enableZoom maxPolarAngle={Math.PI / 2.1} />
        
        <Atmosphere time={time} weather={weather} />
        
        <group>
          {grid.map((row: TileData[], y: number) => row.map((tile: TileData, x: number) => {
            const [wx, _, wz] = gridToWorld(x, y);
            return (
              <group key={`${x}-${y}`} position={[wx, 0, wz]}>
                <mesh 
                  receiveShadow 
                  position={[0, -0.55, 0]} 
                  onPointerEnter={() => setHoveredTile({x, y})}
                  onPointerDown={(e) => { e.stopPropagation(); onTileClick(x, y); }}
                >
                  <boxGeometry args={[1, 0.5, 1]} />
                  <meshStandardMaterial color={tile.buildingType === BuildingType.Road ? '#334155' : '#1e293b'} roughness={1} />
                </mesh>
                
                {tile.buildingType !== BuildingType.None && tile.buildingType !== BuildingType.Road && (
                  <ProceduralBuilding tile={tile} time={time} />
                )}
              </group>
            );
          }))}

          {/* Cursor Overlay */}
          {hoveredTile && (
            <mesh position={[gridToWorld(hoveredTile.x, hoveredTile.y)[0], -0.29, gridToWorld(hoveredTile.x, hoveredTile.y)[2]]} rotation={[-Math.PI/2, 0, 0]}>
              <planeGeometry args={[1,1]} />
              <meshBasicMaterial color="white" transparent opacity={0.2} depthTest={false} />
              <Outlines thickness={0.05} color="white" />
            </mesh>
          )}
        </group>
      </Canvas>
    </div>
  );
};

export default IsoMap;
