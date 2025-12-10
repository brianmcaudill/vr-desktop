import React, { useMemo } from 'react';
import * as THREE from 'three';

interface Label3DProps {
  text: string;
  position: [number, number, number];
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
}

export function Label3D({
  text,
  position,
  fontSize = 12,
  color = '#ffffff',
  backgroundColor = 'rgba(0, 0, 0, 0.7)',
}: Label3DProps) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Measure text
    ctx.font = `${fontSize}px Arial, sans-serif`;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;

    // Set canvas size with padding
    const padding = 8;
    canvas.width = textWidth + padding * 2;
    canvas.height = fontSize + padding * 2;

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.roundRect(0, 0, canvas.width, canvas.height, 4);
    ctx.fill();

    // Draw text
    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return { texture: tex, width: canvas.width, height: canvas.height };
  }, [text, fontSize, color, backgroundColor]);

  // Scale the sprite to match text size in 3D space
  const scale = 0.003;

  return (
    <sprite position={position} scale={[texture.width * scale, texture.height * scale, 1]}>
      <spriteMaterial map={texture.texture} transparent depthTest={false} />
    </sprite>
  );
}
