import React from 'react';

interface ShelfProps {
  position?: [number, number, number];
  shelves?: number;
}

export function Shelf({ position = [-4, 0, -3], shelves = 4 }: ShelfProps) {
  const shelfWidth = 1.5;
  const shelfDepth = 0.35;
  const shelfThickness = 0.03;
  const sideThickness = 0.04;
  const totalHeight = 2.5;
  const shelfSpacing = totalHeight / (shelves + 1);

  const shelfPositions = Array.from({ length: shelves }, (_, i) => shelfSpacing * (i + 1));

  return (
    <group position={position}>
      {/* Left Side Panel */}
      <mesh position={[-shelfWidth / 2 + sideThickness / 2, totalHeight / 2, 0]} castShadow>
        <boxGeometry args={[sideThickness, totalHeight, shelfDepth]} />
        <meshStandardMaterial color="#6b5344" />
      </mesh>

      {/* Right Side Panel */}
      <mesh position={[shelfWidth / 2 - sideThickness / 2, totalHeight / 2, 0]} castShadow>
        <boxGeometry args={[sideThickness, totalHeight, shelfDepth]} />
        <meshStandardMaterial color="#6b5344" />
      </mesh>

      {/* Back Panel */}
      <mesh position={[0, totalHeight / 2, -shelfDepth / 2 + 0.01]} castShadow>
        <boxGeometry args={[shelfWidth, totalHeight, 0.02]} />
        <meshStandardMaterial color="#5a4535" />
      </mesh>

      {/* Shelf Boards */}
      {shelfPositions.map((y, index) => (
        <mesh key={index} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[shelfWidth - sideThickness * 2, shelfThickness, shelfDepth]} />
          <meshStandardMaterial color="#6b5344" />
        </mesh>
      ))}

      {/* Bottom Board */}
      <mesh position={[0, shelfThickness / 2, 0]} castShadow>
        <boxGeometry args={[shelfWidth - sideThickness * 2, shelfThickness, shelfDepth]} />
        <meshStandardMaterial color="#6b5344" />
      </mesh>

      {/* Top Board */}
      <mesh position={[0, totalHeight - shelfThickness / 2, 0]} castShadow>
        <boxGeometry args={[shelfWidth, shelfThickness, shelfDepth]} />
        <meshStandardMaterial color="#6b5344" />
      </mesh>
    </group>
  );
}
