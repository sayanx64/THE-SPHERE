import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Convert a 3D intersection point on the unit sphere to lat/lng.
 */
function vector3ToLatLng(point) {
  const r = point.length();
  const lat = 90 - Math.acos(point.y / r) * (180 / Math.PI);
  const lng = -(Math.atan2(point.z, -point.x) * (180 / Math.PI)) - 180;
  const normalizedLng = ((lng + 540) % 360) - 180;
  return {
    lat: Math.round(lat * 100) / 100,
    lng: Math.round(normalizedLng * 100) / 100,
  };
}

export default function EarthMesh() {
  const meshRef = useRef();

  // Load textures
  const [dayMap, bumpMap] = useLoader(THREE.TextureLoader, [
    '/textures/earth-day.jpg',
    '/textures/earth-bump.png',
  ]);

  // Configure textures once
  useMemo(() => {
    dayMap.colorSpace = THREE.SRGBColorSpace;
    dayMap.anisotropy = 4;
    bumpMap.anisotropy = 4;
  }, [dayMap, bumpMap]);

  // Globe click → log lat/lng
  const handleGlobeClick = useCallback((e) => {
    e.stopPropagation();
    const localPoint = e.object.worldToLocal(e.point.clone());
    const { lat, lng } = vector3ToLatLng(localPoint);
    console.log(`🌍 Globe clicked — Lat: ${lat}, Lng: ${lng}`);
  }, []);

  // Slow rotation
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh onClick={handleGlobeClick}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={dayMap}
          bumpMap={bumpMap}
          bumpScale={0.02}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}
