/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Environment, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedOrb({ isThinking }: { isThinking: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <Sphere args={[1.2, 64, 64]}>
          <MeshDistortMaterial
            color={isThinking ? "#818cf8" : "#4f46e5"}
            attach="material"
            distort={isThinking ? 0.6 : 0.4}
            speed={isThinking ? 4 : 2}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </mesh>
      <Sparkles count={40} scale={4} size={isThinking ? 6 : 2} speed={0.4} color="#818cf8" opacity={0.6} />
    </Float>
  );
}

export default function ThreeDOrb({ className, isThinking = false }: { className?: string, isThinking?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        <AnimatedOrb isThinking={isThinking} />
      </Canvas>
    </div>
  );
}
