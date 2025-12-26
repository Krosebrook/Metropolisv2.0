
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { MapControls, Float, Outlines, OrthographicCamera, Stars, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { Grid, BuildingType, TileData } from '../types';
import { GRID_SIZE, BUILDINGS } from '../constants';

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

const WORLD_OFFSET = GRID_SIZE / 2 - 0.5;
const gridToWorld = (x: number, y: number) => [x - WORLD_OFFSET, 0, y - WORLD_OFFSET] as [number, number, number];

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const coneGeo = new THREE.ConeGeometry(0.5, 1, 8);
const cylinderGeo = new THREE.CylinderGeometry(0.4, 0.4, 1, 12);
const octoGeo = new THREE.OctahedronGeometry(0.5);

const Atmosphere = ({ time, weather }: { time: number, weather: string }) => {
  const isNight = time < 6 || time > 18;
  const sunPos = useMemo(() => {
    const angle = (time / 24) * Math.PI * 2 - Math.PI / 2;
    return [Math.cos(angle) * 50, Math.sin(angle) * 50, 0] as [number, number, number];
  }, [time]);

  return (
    <>
      <Sky sunPosition={sunPos} turbidity={weather === 'storm' ? 20 : 0.5} rayleigh={weather === 'storm' ? 10 : 3} />
      {isNight && <Stars radius={100} depth={50} count={5000} factor={6} saturation={1} fade speed={2} />}
      <directionalLight 
        position={sunPos} 
        intensity={isNight ? 0.03 : weather === 'storm' ? 0.3 : 1.5} 
        castShadow 
        color={isNight ? "#4c1d95" : "#fffbeb"}
      />
      <ambientLight intensity={isNight ? 0.01 : 0.4} />
      <fog attach="fog" args={["#0c0a09", 30, 60]} />
    </>
  );
};

const RangeIndicator = ({ x, y, radius }: { x: number, y: number, radius: number }) => {
  const [wx, _, wz] = gridToWorld(x, y);
  return (
    <mesh position={[wx, -0.28, wz]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.05, radius, 64]} />
      <meshBasicMaterial color="#a855f7" transparent opacity={0.6} depthTest={false} />
    </mesh>
  );
};

const UpgradeMagic = ({ color }: { color: string }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 15 }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        Math.random() * 0.5,
        (Math.random() - 0.5) * 0.8
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        Math.random() * 0.05 + 0.02,
        (Math.random() - 0.5) * 0.02
      ),
      scale: Math.random() * 0.1 + 0.05
    }));
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const p = particles[i];
        child.position.add(p.velocity);
        child.scale.multiplyScalar(0.96);
        child.rotation.x += 0.1;
        child.rotation.y += 0.1;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.pos} scale={[p.scale, p.scale, p.scale]}>
          <octahedronGeometry args={[1]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
};

const FairytaleBuilding = React.memo(({ tile, time }: { tile: TileData, time: number }) => {
  const isNight = time < 6 || time > 18;
  const config = BUILDINGS[tile.buildingType];
  const lScale = 0.4 + (tile.level * 0.4);
  
  const [showUpgradeEffect, setShowUpgradeEffect] = useState(false);
  const prevLevelRef = useRef(tile.level);

  useEffect(() => {
    if (tile.level > prevLevelRef.current) {
      setShowUpgradeEffect(true);
      const timer = setTimeout(() => setShowUpgradeEffect(false), 2000);
      prevLevelRef.current = tile.level;
      return () => clearTimeout(timer);
    }
    prevLevelRef.current = tile.level;
  }, [tile.level]);

  const hasIssue = !tile.hasMana || !tile.hasEssence;
  
  return (
    <group position={[0, -0.3, 0]}>
      {showUpgradeEffect && <UpgradeMagic color="#d946ef" />}
      
      <group scale={[1, lScale, 1]}>
        {/* Cottage Shape */}
        {tile.buildingType === BuildingType.Residential && (
          <group>
            <mesh geometry={boxGeo} castShadow>
              <meshStandardMaterial color={config.color} roughness={1} />
            </mesh>
            <mesh position={[0, 0.7, 0]} rotation={[0, Math.PI/4, 0]} castShadow>
               <coneGeometry args={[0.7, 0.6, 4]} />
               <meshStandardMaterial color="#7f1d1d" />
            </mesh>
          </group>
        )}

        {/* Tavern / Shop Shape */}
        {tile.buildingType === BuildingType.Commercial && (
          <group>
            <mesh scale={[1.1, 0.8, 1.1]} geometry={boxGeo} castShadow>
              <meshStandardMaterial color={config.color} />
            </mesh>
            <mesh position={[0, 0.5, 0]} scale={[1, 0.3, 1]} geometry={boxGeo}>
               <meshStandardMaterial color="#451a03" />
            </mesh>
          </group>
        )}

        {/* Wizard Tower / Magic Source */}
        {tile.buildingType === BuildingType.PowerPlant && (
          <group>
            <mesh geometry={cylinderGeo} castShadow>
               <meshStandardMaterial color="#1e1b4b" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.7, 0]} geometry={coneGeo} castShadow>
               <meshStandardMaterial color="#4c1d95" />
            </mesh>
            <mesh position={[0, 1.3, 0]} rotation={[time * 0.5, time, 0]}>
               <octahedronGeometry args={[0.2]} />
               <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={2} />
            </mesh>
          </group>
        )}

        {/* Default / Castle / Other */}
        {!([BuildingType.Residential, BuildingType.Commercial, BuildingType.PowerPlant].includes(tile.buildingType)) && (
          <mesh geometry={tile.buildingType === BuildingType.Landmark ? cylinderGeo : boxGeo} castShadow>
            <meshStandardMaterial 
              color={config.color} 
              emissive={isNight && tile.hasMana ? config.color : "#000"} 
              emissiveIntensity={isNight && tile.hasMana ? 0.3 : 0}
            />
          </mesh>
        )}

        {hasIssue && (
          <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
            <mesh position={[0, 1.5 / lScale, 0]} scale={[0.15, 0.15, 0.15]}>
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

  return (
    <div className="absolute inset-0 touch-none">
      <Canvas shadows dpr={[1, 2]}>
        <OrthographicCamera makeDefault zoom={45} position={[50, 50, 50]} />
        <MapControls enableRotate enableZoom maxPolarAngle={Math.PI / 2.5} />
        
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
                  <meshStandardMaterial color={tile.buildingType === BuildingType.Road ? '#1c1917' : '#292524'} roughness={1} />
                </mesh>
                
                {tile.buildingType !== BuildingType.None && tile.buildingType !== BuildingType.Road && (
                  <FairytaleBuilding tile={tile} time={time} />
                )}
              </group>
            );
          }))}

          {hoveredTile && (
            <>
              <mesh position={[gridToWorld(hoveredTile.x, hoveredTile.y)[0], -0.29, gridToWorld(hoveredTile.x, hoveredTile.y)[2]]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[1,1]} />
                <meshBasicMaterial color="gold" transparent opacity={0.2} depthTest={false} />
                <Outlines thickness={0.05} color="gold" />
              </mesh>
              {toolConfig?.serviceRadius && (
                <RangeIndicator x={hoveredTile.x} y={hoveredTile.y} radius={toolConfig.serviceRadius} />
              )}
            </>
          )}
        </group>
      </Canvas>
    </div>
  );
};

export default IsoMap;
