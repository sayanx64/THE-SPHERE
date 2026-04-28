import React from 'react';
import * as THREE from 'three';

export default function Atmosphere() {
  return (
    <mesh scale={[1.04, 1.04, 1.04]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial
        color="#4a90d9"
        transparent
        opacity={0.06}
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
