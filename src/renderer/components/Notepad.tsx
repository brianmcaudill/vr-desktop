import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NotepadProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  title: string;
  filePath: string;
  onClick?: (filePath: string) => void;
  onHover?: (name: string | null) => void;
}

export function Notepad({
  position,
  rotation = [0, 0, 0],
  color = '#fffef0',
  title,
  filePath,
  onClick,
  onHover,
}: NotepadProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  const padWidth = 0.12;
  const padHeight = 0.16;
  const padDepth = 0.015;

  useFrame(() => {
    if (meshRef.current) {
      const scale = hovered ? 1.08 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  const handleClick = () => {
    if (onClick) onClick(filePath);
  };

  const handlePointerOver = () => {
    setHovered(true);
    if (onHover) onHover(title);
  };

  const handlePointerOut = () => {
    setHovered(false);
    if (onHover) onHover(null);
  };

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Notepad body (stack of pages) */}
      <mesh castShadow>
        <boxGeometry args={[padWidth, padDepth, padHeight]} />
        <meshStandardMaterial
          color={hovered ? '#fffff8' : color}
          roughness={0.6}
        />
      </mesh>

      {/* Yellow top binding */}
      <mesh position={[0, padDepth / 2 + 0.002, -padHeight / 2 + 0.01]}>
        <boxGeometry args={[padWidth, 0.004, 0.02]} />
        <meshStandardMaterial color="#ffd700" roughness={0.5} />
      </mesh>

      {/* Lines on top page */}
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[0, padDepth / 2 + 0.001, -padHeight / 2 + 0.04 + i * 0.025]}>
          <boxGeometry args={[padWidth * 0.8, 0.001, 0.001]} />
          <meshBasicMaterial color="#ccc" />
        </mesh>
      ))}

      {/* Hover indicator */}
      {hovered && (
        <mesh position={[0, padDepth + 0.02, 0]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      )}
    </group>
  );
}
