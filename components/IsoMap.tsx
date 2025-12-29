
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

/**
 * Animated particle burst for building upgrades
 */
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
      case BuildingType.Residential:
        return { geo: GEOMETRY.sphere, color: '#fecaca', emissive: '#f87171' };
      case BuildingType.Industrial:
        return { geo: GEOMETRY.box, color: '#94a3b8', emissive: '#fbbf24' };
      case BuildingType.PowerPlant:
        return { geo: GEOMETRY.octa, color: '#d946ef', emissive: '#f472b6' };
      case BuildingType.WaterTower:
        return { geo: GEOMETRY.cone, color: '#60a5fa', emissive: '#3b82f6' };
      case BuildingType.Landmark:
        return { geo: GEOMETRY.octa, color: '#f59e0b', emissive: '#fcd34d' };
      default:
        return { geo: GEOMETRY.sphere, color: '#ffffff', emissive: '#ffffff' };
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
          <meshStandardMaterial 
            color={color} 
            emissive={emissive} 
            emissiveIntensity={2} 
            transparent 
            opacity={life} 
          />
        </mesh>
      ))}
    </group>
  );
};

const WindmillSails = () => {
  const sailsRef = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (sailsRef.current) {
      sailsRef.current.rotation.z += delta * 2;
    }
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
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (type === 'grass') {
    const palettes = [
      ['#064e3b', '#065f46', '#047857'], // Emerald Deep
      ['#14532d', '#166534', '#15803d'], // Forest Green
      ['#365314', '#3f6212', '#4d7c0f'], // Mossy Lime
    ];
    const palette = palettes[seed % palettes.length];
    
    // Gradient base
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 128);
    grad.addColorStop(0, palette[2]);
    grad.addColorStop(1, palette[0]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    // Subtle Noise & Details
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = palette[Math.floor(Math.random() * 3)];
      ctx.globalAlpha = Math.random() * 0.4;
      ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
    }
    
    // Leafy clumps
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 128, Math.random() * 128, Math.random() * 20, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'road') {
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 128, 128);
    
    // Stone patterns
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    for(let i = 0; i < 128; i += 32) {
      for(let j = 0; j < 128; j += 32) {
        ctx.strokeRect(i + 2, j + 2, 28, 28);
        ctx.fillStyle = '#1e293b';
        ctx.globalAlpha = 0.1;
        ctx.fillRect(i + 4, j + 4, 24, 24);
      }
    }
  } else if (type === 'side') {
    // Dirt/Layered Earth texture for tile sides
    const colors = ['#422006', '#451a03', '#1e1b4b']; // Dark soil, deeper soil, dark shadows
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, '#2d1a0a'); // Darker near top
    grad.addColorStop(1, '#0c0a09'); // Black at bottom
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    // Sediment layers
    ctx.globalAlpha = 0.3;
    for(let i = 0; i < 5; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(0, i * 25 + Math.random() * 10, 128, 5);
    }
    
    // Speckles
    ctx.globalAlpha = 0.5;
    for(let i = 0; i < 100; i++) {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(Math.random() * 128, Math.random() * 128, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
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
            {variant === 0 && (
              <group>
                <mesh geometry={GEOMETRY.box} scale={[0.85, 0.7, 0.85]} position={[0, 0.15, 0]} castShadow>
                  <meshStandardMaterial color={config.color} />
                </mesh>
                <mesh position={[0, 0.6, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                  <coneGeometry args={[0.7, 0.6, 4]} />
                  <meshStandardMaterial color="#991b1b" />
                </mesh>
              </group>
            )}
            {variant === 1 && (
              <group>
                <mesh geometry={GEOMETRY.box} scale={[0.85, 0.7, 0.85]} position={[0, 0.15, 0]} castShadow>
                  <meshStandardMaterial color={config.color} />
                </mesh>
                <mesh position={[0, 0.6, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                  <coneGeometry args={[0.7, 0.6, 4]} />
                  <meshStandardMaterial color="#991b1b" />
                </mesh>
                <mesh geometry={GEOMETRY.box} scale={[0.15, 0.8, 0.15]} position={[0.25, 0.4, 0.25]} castShadow>
                  <meshStandardMaterial color="#475569" />
                </mesh>
              </group>
            )}
            {variant === 2 && (
              <group>
                <mesh geometry={GEOMETRY.box} scale={[1.1, 0.6, 0.8]} position={[0, 0.1, 0]} castShadow>
                  <meshStandardMaterial color={config.color} />
                </mesh>
                <mesh position={[-0.25, 0.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                  <coneGeometry args={[0.5, 0.5, 4]} />
                  <meshStandardMaterial color="#991b1b" />
                </mesh>
                <mesh position={[0.25, 0.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                  <coneGeometry args={[0.5, 0.5, 4]} />
                  <meshStandardMaterial color="#991b1b" />
                </mesh>
              </group>
            )}
            {variant === 3 && (
              <group>
                <mesh geometry={GEOMETRY.cylinder} scale={[0.45, 0.8, 0.45]} position={[0, 0.2, 0]} castShadow>
                  <meshStandardMaterial color={config.color} />
                </mesh>
                <mesh position={[0, 0.7, 0]} castShadow>
                  <coneGeometry args={[0.6, 0.6, 12]} />
                  <meshStandardMaterial color="#b45309" />
                </mesh>
              </group>
            )}
            {(variant >= 4) && (
              <group>
                <mesh geometry={GEOMETRY.box} scale={[0.7, 0.9, 0.7]} position={[0, 0.25, 0]} castShadow>
                  <meshStandardMaterial color={config.color} />
                </mesh>
                <mesh position={[0, 0.85, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                  <coneGeometry args={[0.6, 0.8, 4]} />
                  <meshStandardMaterial color="#7f1d1d" />
                </mesh>
              </group>
            )}
          </group>
        );

      case BuildingType.Industrial:
        return (
          <group>
            <mesh geometry={GEOMETRY.box} scale={[1.1, 0.3, 1.1]} position={[0, -0.05, 0]} castShadow>
              <meshStandardMaterial color="#422006" roughness={1.0} />
            </mesh>
            {variant === 0 && (
              <group>
                <mesh position={[0, 0.35, -0.2]} castShadow>
                  <boxGeometry args={[0.8, 0.7, 0.4]} />
                  <meshStandardMaterial color="#475569" />
                </mesh>
                <mesh position={[0, 0.3, -0.1]} rotation={[Math.PI/2, 0, 0]}>
                  <cylinderGeometry args={[0.25, 0.25, 0.5, 12]} />
                  <meshStandardMaterial color="#0f172a" />
                </mesh>
                <mesh position={[0.3, 0.15, 0.3]} castShadow>
                  <boxGeometry args={[0.35, 0.25, 0.45]} />
                  <meshStandardMaterial color="#451a03" />
                </mesh>
                <mesh position={[0.3, 0.35, 0.3]}>
                  <octahedronGeometry args={[0.15]} />
                  <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
                </mesh>
              </group>
            )}
            {variant === 1 && (
              <group>
                {[[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]].map((p, i) => (
                  <mesh key={i} position={[p[0], 0.6, p[1]]} castShadow>
                    <boxGeometry args={[0.1, 1.2, 0.1]} />
                    <meshStandardMaterial color="#78350f" />
                  </mesh>
                ))}
                <mesh position={[0, 1.1, 0]} castShadow>
                  <boxGeometry args={[0.9, 0.1, 0.9]} />
                  <meshStandardMaterial color="#451a03" />
                </mesh>
                <mesh position={[0, 0.6, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 1]} />
                  <meshStandardMaterial color="#a8a29e" />
                </mesh>
                <mesh position={[0, 0.1, 0]} castShadow>
                  <cylinderGeometry args={[0.2, 0.2, 0.25, 8]} />
                  <meshStandardMaterial color="#64748b" />
                </mesh>
              </group>
            )}
            {variant === 2 && (
              <group>
                <mesh position={[0, 0.1, 0]} castShadow>
                  <boxGeometry args={[0.8, 0.4, 0.8]} />
                  <meshStandardMaterial color="#1e293b" />
                </mesh>
                <group position={[-0.3, 0.3, 0.3]} rotation={[0, Math.PI/4, 0]}>
                  <mesh position={[0, 0.4, 0]}>
                    <boxGeometry args={[0.1, 0.8, 0.1]} />
                    <meshStandardMaterial color="#451a03" />
                  </mesh>
                  <mesh position={[0.2, 0.7, 0]} rotation={[0,0,Math.PI/2]}>
                    <boxGeometry args={[0.1, 0.5, 0.1]} />
                    <meshStandardMaterial color="#451a03" />
                  </mesh>
                </group>
                <mesh position={[0.3, 0.1, -0.3]}>
                  <sphereGeometry args={[0.2, 8, 8]} />
                  <meshStandardMaterial color="#ca8a04" />
                </mesh>
              </group>
            )}
            {variant === 3 && (
              <group>
                <mesh position={[0, 0.2, 0]} castShadow>
                  <cylinderGeometry args={[0.6, 0.6, 0.4, 16]} />
                  <meshStandardMaterial color="#334155" metalness={0.7} />
                </mesh>
                <Float speed={8} rotationIntensity={2}>
                  <mesh position={[0, 0.8, 0]} rotation={[Math.PI, 0, 0]}>
                    <coneGeometry args={[0.4, 0.8, 8]} />
                    <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
                  </mesh>
                </Float>
                <mesh position={[0.4, 0.6, 0]} rotation={[0,0,-0.2]}>
                  <cylinderGeometry args={[0.08, 0.08, 0.6]} />
                  <meshStandardMaterial color="#475569" />
                </mesh>
              </group>
            )}
            {(variant >= 4) && (
              <group>
                <mesh position={[0, 0.2, 0]} castShadow>
                  <boxGeometry args={[0.9, 0.5, 0.9]} />
                  <meshStandardMaterial color="#475569" />
                </mesh>
                <group position={[0, 0.45, 0]}>
                  <mesh position={[-0.2, 0, -0.2]} rotation={[0.5, 0.5, 0]}>
                    <octahedronGeometry args={[0.25]} />
                    <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
                  </mesh>
                  <mesh position={[0.2, 0, 0.2]} rotation={[-0.3, 0.8, 0.2]}>
                    <octahedronGeometry args={[0.2]} />
                    <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={2} />
                  </mesh>
                </group>
                {[[-0.45, 0.4], [0.45, 0.3], [0, -0.45]].map((p, i) => (
                  <mesh key={i} position={[p[0], 0.05, p[1]]} scale={0.2}>
                    <dodecahedronGeometry />
                    <meshStandardMaterial color="#64748b" />
                  </mesh>
                ))}
              </group>
            )}
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
            <group position={[0, 0.7, 0.4]}>
              <WindmillSails />
            </group>
            <mesh geometry={GEOMETRY.box} scale={[1, 0.1, 1]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#422006" />
            </mesh>
          </group>
        );

      case BuildingType.MarketSquare:
        return (
          <group>
            <mesh geometry={GEOMETRY.box} scale={[1.2, 0.1, 1.2]} position={[0, 0, 0]} castShadow>
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
            {[[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].map((p, i) => (
              <group key={i} position={[p[0], 0.25, p[1]]}>
                <mesh geometry={GEOMETRY.box} scale={[0.4, 0.4, 0.4]} castShadow>
                  <meshStandardMaterial color={i % 2 === 0 ? "#ef4444" : "#3b82f6"} />
                </mesh>
                <mesh position={[0, 0.25, 0]} rotation={[0, Math.PI / 4, 0]}>
                  <coneGeometry args={[0.3, 0.2, 4]} />
                  <meshStandardMaterial color="#fffbeb" />
                </mesh>
              </group>
            ))}
            <mesh position={[0, 0.2, 0]} geometry={GEOMETRY.cylinder} scale={[0.2, 0.4, 0.2]} castShadow>
              <meshStandardMaterial color="#64748b" />
            </mesh>
            <mesh position={[0, 0.45, 0]} geometry={GEOMETRY.sphere} scale={0.1}>
               <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2} />
            </mesh>
          </group>
        );

      case BuildingType.MagicAcademy:
        return (
          <group>
            <mesh geometry={GEOMETRY.cylinder} scale={[0.7, 1.2, 0.7]} position={[0, 0.2, 0]} castShadow>
              <meshStandardMaterial color="#4c1d95" />
            </mesh>
            <Float speed={3} rotationIntensity={1} floatIntensity={1}>
              <group position={[0, 1.5, 0]}>
                <mesh geometry={GEOMETRY.octa} scale={0.6}>
                  <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={3} />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]} geometry={GEOMETRY.torus} scale={1.2}>
                  <meshStandardMaterial color="#c084fc" />
                </mesh>
              </group>
            </Float>
            {[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map((p, i) => (
              <mesh key={i} position={[p[0], 0.3, p[1]]} geometry={GEOMETRY.cylinder} scale={[0.2, 0.8, 0.2]} castShadow>
                <meshStandardMaterial color="#5b21b6" />
              </mesh>
            ))}
          </group>
        );

      case BuildingType.PowerPlant:
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

      case BuildingType.WaterTower:
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

      case BuildingType.PoliceStation:
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

      case BuildingType.Landmark:
        return (
          <group scale={1.4}>
            <mesh geometry={GEOMETRY.box} scale={[1.4, 0.4, 1.4]} position={[0, -0.1, 0]} castShadow>
              <meshStandardMaterial color="#4b5563" roughness={0.8} />
            </mesh>
            {variant === 0 && (
              <group>
                <mesh geometry={GEOMETRY.box} scale={[1, 0.8, 1]} position={[0, 0.2, 0]} castShadow>
                  <meshStandardMaterial color="#f59e0b" />
                </mesh>
                {[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map((p, i) => (
                  <group key={i} position={[p[0], 0.3, p[1]]}>
                    <mesh geometry={GEOMETRY.cylinder} scale={[0.3, 1.4, 0.3]} castShadow>
                      <meshStandardMaterial color="#d97706" />
                    </mesh>
                    <mesh position={[0, 0.8, 0]} geometry={GEOMETRY.cone} scale={[0.4, 0.6, 0.4]}>
                      <meshStandardMaterial color="#991b1b" />
                    </mesh>
                    {i === 0 && (
                      <group position={[0, 1.1, 0]}>
                        <mesh geometry={GEOMETRY.cylinder} scale={[0.02, 0.4, 0.02]}>
                          <meshStandardMaterial color="#94a3b8" />
                        </mesh>
                        <mesh position={[0.1, 0.15, 0]} geometry={GEOMETRY.box} scale={[0.2, 0.1, 0.02]}>
                          <meshStandardMaterial color="#fbbf24" />
                        </mesh>
                      </group>
                    )}
                  </group>
                ))}
              </group>
            )}
            {variant === 1 && (
              <group>
                <mesh geometry={GEOMETRY.box} scale={[1.2, 0.4, 1.2]} position={[0, 0.1, 0]} castShadow>
                  <meshStandardMaterial color="#f59e0b" />
                </mesh>
                <mesh position={[0, 1.0, 0]} geometry={GEOMETRY.cylinder} scale={[0.6, 2.5, 0.6]} castShadow>
                   <meshStandardMaterial color="#b45309" />
                </mesh>
                <mesh position={[0, 2.5, 0]} geometry={GEOMETRY.cone} scale={[0.8, 1.0, 0.8]}>
                  <meshStandardMaterial color="#7f1d1d" />
                </mesh>
                {[[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].map((p, i) => (
                  <mesh key={i} position={[p[0], 0.4, p[1]]} castShadow>
                    <boxGeometry args={[0.25, 0.4, 0.25]} />
                    <meshStandardMaterial color="#d97706" />
                  </mesh>
                ))}
              </group>
            )}
            {variant === 2 && (
              <group>
                <mesh geometry={GEOMETRY.box} scale={[1.4, 0.6, 0.8]} position={[0, 0.1, -0.2]} castShadow>
                  <meshStandardMaterial color="#f59e0b" />
                </mesh>
                {[[-0.5, 0.4], [0.5, 0.4]].map((p, i) => (
                  <group key={i} position={[p[0], 0.6, p[1]]}>
                    <mesh geometry={GEOMETRY.box} scale={[0.5, 1.8, 0.5]} castShadow>
                      <meshStandardMaterial color="#d97706" />
                    </mesh>
                    <mesh position={[0, 0.95, 0]} geometry={GEOMETRY.box} scale={[0.6, 0.1, 0.6]}>
                      <meshStandardMaterial color="#991b1b" />
                    </mesh>
                  </group>
                ))}
                {[[-0.6, -0.4], [0.6, -0.4]].map((p, i) => (
                   <mesh key={i} position={[p[0], 0.5, p[1]]} geometry={GEOMETRY.cylinder} scale={[0.2, 1.0, 0.2]}>
                     <meshStandardMaterial color="#b45309" />
                   </mesh>
                ))}
              </group>
            )}
            {variant === 3 && (
              <group>
                <mesh position={[-0.2, 0.2, -0.2]} geometry={GEOMETRY.box} scale={[1.0, 0.8, 1.0]} castShadow>
                   <meshStandardMaterial color="#f59e0b" />
                </mesh>
                <mesh position={[0.4, 0.4, 0.4]} geometry={GEOMETRY.box} scale={[0.6, 1.2, 0.6]} castShadow>
                   <meshStandardMaterial color="#d97706" />
                </mesh>
                <mesh position={[0.4, 1.1, 0.4]} geometry={GEOMETRY.cone} scale={[0.7, 0.6, 0.7]}>
                   <meshStandardMaterial color="#991b1b" />
                </mesh>
                <mesh position={[-0.4, 1.0, -0.4]} geometry={GEOMETRY.cylinder} scale={[0.2, 2.0, 0.2]} castShadow>
                   <meshStandardMaterial color="#b45309" />
                </mesh>
                <mesh position={[-0.4, 2.0, -0.4]} geometry={GEOMETRY.cone} scale={[0.3, 0.4, 0.3]}>
                   <meshStandardMaterial color="#7f1d1d" />
                </mesh>
              </group>
            )}
            {variant >= 4 && (
              <group>
                <mesh geometry={GEOMETRY.cylinder} scale={[0.8, 0.3, 0.8]} position={[0, 0, 0]} castShadow>
                  <meshStandardMaterial color="#f59e0b" />
                </mesh>
                <mesh position={[0, 1.2, 0]} geometry={GEOMETRY.cylinder} scale={[0.4, 2.8, 0.4]} castShadow>
                   <meshStandardMaterial color="#d97706" />
                </mesh>
                <mesh position={[0, 2.8, 0]} geometry={GEOMETRY.cone} scale={[0.5, 0.8, 0.5]}>
                   <meshStandardMaterial color="#4c0519" />
                </mesh>
                {[0, 1, 2, 3].map((i) => (
                  <group key={i} rotation={[0, (i * Math.PI) / 2, 0]} position={[0, 0, 0]}>
                    <mesh position={[0.5, 0.4, 0]} geometry={GEOMETRY.box} scale={[0.2, 1.0, 0.2]} castShadow>
                      <meshStandardMaterial color="#b45309" />
                    </mesh>
                  </group>
                ))}
              </group>
            )}
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
                  {/* Side Textures with subtle dark shading */}
                  <meshStandardMaterial map={textures.side} roughness={1.0} attach="material-0" />
                  <meshStandardMaterial map={textures.side} roughness={1.0} attach="material-1" />
                  {/* Top Texture */}
                  <meshStandardMaterial map={topTexture} roughness={1.0} attach="material-2" />
                  {/* Bottom face - darkened earth */}
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
