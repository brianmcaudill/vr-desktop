import React, { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NotepadProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  title: string;
  filePath: string;
  preview?: string | null;
  onClick?: (filePath: string) => void;
  onHover?: (name: string | null) => void;
}

// Create a canvas texture with text content
function createTextTexture(text: string, width: number, height: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#fffef0';
  ctx.fillRect(0, 0, width, height);

  // Draw lines
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  const lineHeight = 14;
  for (let y = 30; y < height; y += lineHeight) {
    ctx.beginPath();
    ctx.moveTo(10, y);
    ctx.lineTo(width - 10, y);
    ctx.stroke();
  }

  // Draw text
  ctx.fillStyle = '#333';
  ctx.font = '10px Consolas, Monaco, monospace';

  const lines = text.split('\n');
  let y = 24;
  for (const line of lines) {
    if (y > height - 10) break;
    // Truncate long lines
    const truncatedLine = line.length > 30 ? line.substring(0, 30) + '...' : line;
    ctx.fillText(truncatedLine, 8, y);
    y += lineHeight;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function Notepad({
  position,
  rotation = [0, 0, 0],
  color = '#fffef0',
  title,
  filePath,
  preview,
  onClick,
  onHover,
}: NotepadProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  const padWidth = 0.12;
  const padHeight = 0.16;
  const padDepth = 0.015;

  // Create text texture if preview is available
  const textTexture = useMemo(() => {
    if (preview) {
      return createTextTexture(preview, 256, 320);
    }
    return null;
  }, [preview]);

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

      {/* Text content or lines */}
      {textTexture ? (
        <mesh position={[0, padDepth / 2 + 0.001, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[padWidth * 0.95, padHeight * 0.9]} />
          <meshBasicMaterial map={textTexture} />
        </mesh>
      ) : (
        // Fallback: just lines
        [...Array(5)].map((_, i) => (
          <mesh key={i} position={[0, padDepth / 2 + 0.001, -padHeight / 2 + 0.04 + i * 0.025]}>
            <boxGeometry args={[padWidth * 0.8, 0.001, 0.001]} />
            <meshBasicMaterial color="#ccc" />
          </mesh>
        ))
      )}

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
