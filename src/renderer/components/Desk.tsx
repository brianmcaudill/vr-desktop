import React from 'react';

interface DeskProps {
  position?: [number, number, number];
}

export function Desk({ position = [0, 0, -3] }: DeskProps) {
  const deskWidth = 2.5;
  const deskDepth = 1.2;
  const deskHeight = 0.8;
  const legThickness = 0.08;
  const topThickness = 0.05;

  return (
    <group position={position}>
      {/* Desk Top */}
      <mesh position={[0, deskHeight, 0]} castShadow receiveShadow>
        <boxGeometry args={[deskWidth, topThickness, deskDepth]} />
        <meshStandardMaterial color="#5c4033" />
      </mesh>

      {/* Front Left Leg */}
      <mesh position={[-deskWidth / 2 + legThickness, deskHeight / 2, deskDepth / 2 - legThickness]} castShadow>
        <boxGeometry args={[legThickness, deskHeight, legThickness]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>

      {/* Front Right Leg */}
      <mesh position={[deskWidth / 2 - legThickness, deskHeight / 2, deskDepth / 2 - legThickness]} castShadow>
        <boxGeometry args={[legThickness, deskHeight, legThickness]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>

      {/* Back Left Leg */}
      <mesh position={[-deskWidth / 2 + legThickness, deskHeight / 2, -deskDepth / 2 + legThickness]} castShadow>
        <boxGeometry args={[legThickness, deskHeight, legThickness]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>

      {/* Back Right Leg */}
      <mesh position={[deskWidth / 2 - legThickness, deskHeight / 2, -deskDepth / 2 + legThickness]} castShadow>
        <boxGeometry args={[legThickness, deskHeight, legThickness]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
    </group>
  );
}
