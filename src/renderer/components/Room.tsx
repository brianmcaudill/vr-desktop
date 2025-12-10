import React from 'react';

interface RoomProps {
  size?: number;
}

export function Room({ size = 10 }: RoomProps) {
  const wallHeight = 4;
  const wallThickness = 0.1;

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#3d3d5c" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, wallHeight / 2, -size / 2]} receiveShadow>
        <boxGeometry args={[size, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#4a4a6a" />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-size / 2, wallHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[size, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#454565" />
      </mesh>

      {/* Right Wall */}
      <mesh position={[size / 2, wallHeight / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[size, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#454565" />
      </mesh>

      {/* Ceiling (optional - commented out for open feel) */}
      {/* <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, wallHeight, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#2a2a4a" />
      </mesh> */}
    </group>
  );
}
