import React, { useMemo, useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { COUNTRIES } from '../data/countries';
import useStore from '../data/store';

function latLngToVector3(lat, lng, radius = 1.01) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function CountryPoint({ country, index }) {
  const meshRef = useRef();
  const ringRef = useRef();
  const ring2Ref = useRef();
  const glowRef = useRef();
  const beaconRef = useRef();
  const [hovered, setHovered] = useState(false);
  const selectCountry = useStore((s) => s.selectCountry);
  const setCameraTarget = useStore((s) => s.setCameraTarget);
  const fetchCountryData = useStore((s) => s.fetchCountryData);
  const setHoveredStore = useStore((s) => s.setHovered);
  const clearHovered = useStore((s) => s.clearHovered);
  const selectedCountry = useStore((s) => s.selectedCountry);
  const { gl } = useThree();

  const position = useMemo(
    () => latLngToVector3(country.lat, country.lng),
    [country.lat, country.lng]
  );

  const isSelected = selectedCountry?.code === country.code;

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    selectCountry(country);
    setCameraTarget(country.lat, country.lng);
    fetchCountryData(country.code);
  }, [country, selectCountry, setCameraTarget, fetchCountryData]);

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    gl.domElement.style.cursor = 'pointer';
    setHoveredStore(country, e.clientX, e.clientY);
  }, [country, gl, setHoveredStore]);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    gl.domElement.style.cursor = 'default';
    clearHovered();
  }, [gl, clearHovered]);

  // Per-frame animations
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // ── Core point: dramatic pulse when selected ──
    if (meshRef.current) {
      const targetScale = isSelected
        ? 2.2 + Math.sin(t * 4) * 0.4
        : hovered
          ? 1.5
          : 0.8 + Math.sin(t * 1.5 + index * 0.5) * 0.1;
      meshRef.current.scale.lerp(
        { x: targetScale, y: targetScale, z: targetScale },
        0.15
      );
    }

    // ── Ripple ring 1: continuous expand + fade ──
    if (ringRef.current) {
      if (isSelected) {
        // Looping ripple: 0→1 over 2 seconds, repeat
        const cycle = (t * 0.5) % 1;
        const rippleScale = 2 + cycle * 8;
        ringRef.current.scale.setScalar(rippleScale);
        ringRef.current.material.opacity = 0.5 * (1 - cycle);
      } else {
        const target = hovered ? 3.5 : 0.01;
        const s = THREE.MathUtils.lerp(ringRef.current.scale.x, target, 0.1);
        ringRef.current.scale.setScalar(s);
        ringRef.current.material.opacity = THREE.MathUtils.lerp(
          ringRef.current.material.opacity,
          hovered ? 0.35 : 0,
          0.12
        );
      }
    }

    // ── Ripple ring 2: offset phase for radar-ping look ──
    if (ring2Ref.current) {
      if (isSelected) {
        const cycle2 = ((t * 0.5) + 0.5) % 1;
        const rippleScale2 = 2 + cycle2 * 8;
        ring2Ref.current.scale.setScalar(rippleScale2);
        ring2Ref.current.material.opacity = 0.35 * (1 - cycle2);
      } else {
        ring2Ref.current.scale.setScalar(0.01);
        ring2Ref.current.material.opacity = 0;
      }
    }

    // ── Glow sprite: large bloom when selected ──
    if (glowRef.current) {
      const targetGlowScale = isSelected
        ? 10 + Math.sin(t * 2) * 2
        : hovered
          ? 4
          : 1.5;
      const targetGlowOpacity = isSelected ? 0.4 : hovered ? 0.25 : 0.05;
      const cs = glowRef.current.scale.x;
      glowRef.current.scale.setScalar(THREE.MathUtils.lerp(cs, targetGlowScale, 0.08));
      glowRef.current.material.opacity = THREE.MathUtils.lerp(
        glowRef.current.material.opacity,
        targetGlowOpacity,
        0.1
      );
    }

    // ── Beacon beam: vertical line pulsing above selected point ──
    if (beaconRef.current) {
      const targetBeaconOpacity = isSelected ? 0.25 + Math.sin(t * 3) * 0.15 : 0;
      beaconRef.current.material.opacity = THREE.MathUtils.lerp(
        beaconRef.current.material.opacity,
        targetBeaconOpacity,
        0.1
      );
      const beaconScale = isSelected ? 1 : 0.01;
      beaconRef.current.scale.y = THREE.MathUtils.lerp(beaconRef.current.scale.y, beaconScale, 0.08);
    }
  });

  // Vivid color palette: hot pink selected, cyan hover, indigo default
  const color = isSelected ? '#ff3a7f' : hovered ? '#00d4ff' : '#6c63ff';

  return (
    <group position={position}>
      {/* Invisible hit-area */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Visible core point */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.012, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} />
      </mesh>

      {/* Ripple ring 1 */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.009, 0.013, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Ripple ring 2 (offset phase) */}
      <mesh ref={ring2Ref} scale={[0.01, 0.01, 0.01]}>
        <ringGeometry args={[0.009, 0.012, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Glow bloom sprite */}
      <sprite ref={glowRef} scale={[0.02, 0.02, 1]}>
        <spriteMaterial
          color={color}
          transparent
          opacity={0.05}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* Beacon beam — vertical pillar above selected point */}
      <mesh ref={beaconRef} position={[0, 0.04, 0]} scale={[1, 0.01, 1]}>
        <cylinderGeometry args={[0.002, 0.0005, 0.08, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Point light */}
      <pointLight
        color={color}
        intensity={isSelected ? 1.2 : hovered ? 0.5 : 0.04}
        distance={isSelected ? 0.6 : hovered ? 0.4 : 0.2}
      />
    </group>
  );
}

export default function CountryPoints() {
  return (
    <group>
      {COUNTRIES.map((country, index) => (
        <CountryPoint key={country.code} country={country} index={index} />
      ))}
    </group>
  );
}
