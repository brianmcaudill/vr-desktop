import React, { useMemo } from 'react';
import * as THREE from 'three';

interface WallArtProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  imageSrc: string;
  frameColor?: string;
  frameWidth?: number;
}

export function WallArt({
  position,
  rotation = [0, 0, 0],
  width = 1.5,
  height = 0.6,
  imageSrc,
  frameColor = '#2a2a2a',
  frameWidth = 0.04,
}: WallArtProps) {
  // Load the image as a texture
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(imageSrc);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [imageSrc]);

  const frameDepth = 0.03;

  return (
    <group position={position} rotation={rotation}>
      {/* Frame back panel */}
      <mesh position={[0, 0, -frameDepth / 2]} castShadow>
        <boxGeometry args={[width + frameWidth * 2, height + frameWidth * 2, frameDepth]} />
        <meshStandardMaterial color={frameColor} roughness={0.8} />
      </mesh>

      {/* Frame border - top */}
      <mesh position={[0, height / 2 + frameWidth / 2, frameDepth / 2]}>
        <boxGeometry args={[width + frameWidth * 2, frameWidth, frameDepth * 2]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Frame border - bottom */}
      <mesh position={[0, -height / 2 - frameWidth / 2, frameDepth / 2]}>
        <boxGeometry args={[width + frameWidth * 2, frameWidth, frameDepth * 2]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Frame border - left */}
      <mesh position={[-width / 2 - frameWidth / 2, 0, frameDepth / 2]}>
        <boxGeometry args={[frameWidth, height, frameDepth * 2]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Frame border - right */}
      <mesh position={[width / 2 + frameWidth / 2, 0, frameDepth / 2]}>
        <boxGeometry args={[frameWidth, height, frameDepth * 2]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* White matte behind the image */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>

      {/* The actual image */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[width * 0.9, height * 0.7]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>

      {/* Glass effect overlay */}
      <mesh position={[0, 0, frameDepth / 2 + 0.001]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.05}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}
