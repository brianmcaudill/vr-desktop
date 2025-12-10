import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControlsProps {
  target?: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
  maxPolarAngle?: number;
}

export function CameraControls({
  target = [0, 0, 0],
  minDistance = 1,
  maxDistance = 10,
  maxPolarAngle = Math.PI / 2,
}: CameraControlsProps) {
  const { camera, gl } = useThree();
  const targetVec = useRef(new THREE.Vector3(...target));
  const spherical = useRef(new THREE.Spherical());
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Initialize spherical coordinates from camera position
    const offset = new THREE.Vector3().copy(camera.position).sub(targetVec.current);
    spherical.current.setFromVector3(offset);
    spherical.current.radius = Math.max(minDistance, Math.min(maxDistance, spherical.current.radius));

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - previousMouse.current.x;
      const deltaY = e.clientY - previousMouse.current.y;

      spherical.current.theta -= deltaX * 0.005;
      spherical.current.phi += deltaY * 0.005;

      // Clamp phi
      spherical.current.phi = Math.max(0.1, Math.min(maxPolarAngle, spherical.current.phi));

      previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onWheel = (e: WheelEvent) => {
      spherical.current.radius += e.deltaY * 0.01;
      spherical.current.radius = Math.max(minDistance, Math.min(maxDistance, spherical.current.radius));
    };

    const canvas = gl.domElement;
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('wheel', onWheel);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [camera, gl, minDistance, maxDistance, maxPolarAngle]);

  useFrame(() => {
    const offset = new THREE.Vector3().setFromSpherical(spherical.current);
    camera.position.copy(targetVec.current).add(offset);
    camera.lookAt(targetVec.current);
  });

  return null;
}
