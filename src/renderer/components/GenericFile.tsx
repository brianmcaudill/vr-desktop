import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GenericFileProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  name: string;
  filePath: string;
  onClick?: (filePath: string) => void;
  onHover?: (name: string | null) => void;
}

export function GenericFile({
  position,
  rotation = [0, 0, 0],
  color = '#e0e0e0',
  name,
  filePath,
  onClick,
  onHover,
}: GenericFileProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  const pageWidth = 0.1;
  const pageHeight = 0.14;
  const pageDepth = 0.003;

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
    if (onHover) onHover(name);
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
      {/* Page */}
      <mesh castShadow>
        <boxGeometry args={[pageWidth, pageHeight, pageDepth]} />
        <meshStandardMaterial
          color={hovered ? '#f5f5f5' : color}
          roughness={0.5}
        />
      </mesh>

      {/* Folded corner effect */}
      <mesh position={[pageWidth / 2 - 0.015, pageHeight / 2 - 0.015, pageDepth / 2 + 0.001]}>
        <boxGeometry args={[0.02, 0.02, 0.001]} />
        <meshStandardMaterial color="#ccc" roughness={0.5} />
      </mesh>

      {/* Lines representing text */}
      {[...Array(4)].map((_, i) => (
        <mesh key={i} position={[0, pageHeight / 2 - 0.03 - i * 0.025, pageDepth / 2 + 0.001]}>
          <boxGeometry args={[pageWidth * 0.7, 0.002, 0.001]} />
          <meshBasicMaterial color="#999" />
        </mesh>
      ))}

      {/* Hover indicator */}
      {hovered && (
        <mesh position={[0, pageHeight / 2 + 0.02, 0]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      )}
    </group>
  );
}
