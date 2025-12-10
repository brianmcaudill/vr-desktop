import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BookProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  title: string;
  filePath: string;
  onClick?: (filePath: string) => void;
  onHover?: (name: string | null) => void;
}

export function Book({
  position,
  rotation = [0, 0, 0],
  color = '#8B4513',
  title,
  filePath,
  onClick,
  onHover,
}: BookProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  const bookWidth = 0.15;
  const bookHeight = 0.22;
  const bookDepth = 0.04;

  useFrame(() => {
    if (meshRef.current) {
      const scale = hovered ? 1.05 : 1;
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
      {/* Book body */}
      <mesh castShadow>
        <boxGeometry args={[bookWidth, bookHeight, bookDepth]} />
        <meshStandardMaterial
          color={hovered ? '#a05a2c' : color}
          roughness={0.8}
        />
      </mesh>

      {/* Spine detail */}
      <mesh position={[-bookWidth / 2 + 0.005, 0, 0]}>
        <boxGeometry args={[0.01, bookHeight * 0.9, bookDepth * 0.9]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>

      {/* Pages edge */}
      <mesh position={[bookWidth / 2 - 0.005, 0, 0]}>
        <boxGeometry args={[0.01, bookHeight * 0.85, bookDepth * 0.85]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.6} />
      </mesh>

      {/* Hover indicator */}
      {hovered && (
        <mesh position={[0, bookHeight / 2 + 0.02, 0]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      )}
    </group>
  );
}
