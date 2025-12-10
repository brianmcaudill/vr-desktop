import React, { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PictureProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  name: string;
  filePath: string;
  imageSrc: string;
  onClick?: (filePath: string) => void;
  onHover?: (name: string | null) => void;
}

export function Picture({
  position,
  rotation = [0, 0, 0],
  name,
  filePath,
  imageSrc,
  onClick,
  onHover,
}: PictureProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  // Load the image as a texture
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(imageSrc);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [imageSrc]);

  const frameWidth = 0.18;
  const frameHeight = 0.14;
  const frameDepth = 0.01;
  const borderWidth = 0.008;

  useFrame(() => {
    if (meshRef.current) {
      const scale = hovered ? 1.1 : 1;
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
      {/* Picture frame back */}
      <mesh position={[0, 0, -frameDepth / 2]} castShadow>
        <boxGeometry args={[frameWidth, frameHeight, frameDepth]} />
        <meshStandardMaterial
          color={hovered ? '#4a4a4a' : '#2a2a2a'}
          roughness={0.8}
        />
      </mesh>

      {/* Frame border - top */}
      <mesh position={[0, frameHeight / 2 - borderWidth / 2, 0]}>
        <boxGeometry args={[frameWidth, borderWidth, frameDepth * 1.5]} />
        <meshStandardMaterial color={hovered ? '#8B7355' : '#5D4E37'} roughness={0.7} />
      </mesh>

      {/* Frame border - bottom */}
      <mesh position={[0, -frameHeight / 2 + borderWidth / 2, 0]}>
        <boxGeometry args={[frameWidth, borderWidth, frameDepth * 1.5]} />
        <meshStandardMaterial color={hovered ? '#8B7355' : '#5D4E37'} roughness={0.7} />
      </mesh>

      {/* Frame border - left */}
      <mesh position={[-frameWidth / 2 + borderWidth / 2, 0, 0]}>
        <boxGeometry args={[borderWidth, frameHeight - borderWidth * 2, frameDepth * 1.5]} />
        <meshStandardMaterial color={hovered ? '#8B7355' : '#5D4E37'} roughness={0.7} />
      </mesh>

      {/* Frame border - right */}
      <mesh position={[frameWidth / 2 - borderWidth / 2, 0, 0]}>
        <boxGeometry args={[borderWidth, frameHeight - borderWidth * 2, frameDepth * 1.5]} />
        <meshStandardMaterial color={hovered ? '#8B7355' : '#5D4E37'} roughness={0.7} />
      </mesh>

      {/* The actual image */}
      <mesh position={[0, 0, frameDepth / 2 + 0.001]}>
        <planeGeometry args={[frameWidth - borderWidth * 2, frameHeight - borderWidth * 2]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      {/* Hover indicator */}
      {hovered && (
        <mesh position={[0, frameHeight / 2 + 0.02, 0]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      )}
    </group>
  );
}
