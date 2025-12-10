import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FolderProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  name: string;
  filePath: string;
  onClick?: (filePath: string) => void;
  onHover?: (name: string | null) => void;
}

export function Folder({
  position,
  rotation = [0, 0, 0],
  color = '#ffc107',
  name,
  filePath,
  onClick,
  onHover,
}: FolderProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  const folderWidth = 0.18;
  const folderHeight = 0.14;
  const folderDepth = 0.02;

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
      {/* Folder back */}
      <mesh position={[0, 0, -folderDepth / 4]} castShadow>
        <boxGeometry args={[folderWidth, folderHeight, folderDepth / 2]} />
        <meshStandardMaterial
          color={hovered ? '#ffca28' : color}
          roughness={0.7}
        />
      </mesh>

      {/* Folder front (slightly lower) */}
      <mesh position={[0, -folderHeight * 0.08, folderDepth / 4]} castShadow>
        <boxGeometry args={[folderWidth, folderHeight * 0.85, folderDepth / 2]} />
        <meshStandardMaterial
          color={hovered ? '#ffd54f' : '#ffca28'}
          roughness={0.7}
        />
      </mesh>

      {/* Tab */}
      <mesh position={[-folderWidth / 4, folderHeight / 2 + 0.015, -folderDepth / 4]} castShadow>
        <boxGeometry args={[folderWidth * 0.4, 0.03, folderDepth / 2]} />
        <meshStandardMaterial
          color={hovered ? '#ffca28' : color}
          roughness={0.7}
        />
      </mesh>

      {/* Hover indicator */}
      {hovered && (
        <mesh position={[0, folderHeight / 2 + 0.05, 0]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      )}
    </group>
  );
}
