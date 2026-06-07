import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleCloud({ ambientGlow }: { ambientGlow: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const sphere = useMemo(() => {
    const temp = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
        // Random points in sphere
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = 10 + Math.random() * 20; // radius between 10 and 30
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        temp[i * 3] = x;
        temp[i * 3 + 1] = y;
        temp[i * 3 + 2] = z;
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
        ref.current.rotation.x -= delta / 30;
        ref.current.rotation.y -= delta / 40;
    }
    if (materialRef.current) {
        if (ambientGlow) {
            const time = state.clock.getElapsedTime();
            // Subtly pulse opacity and scale
            materialRef.current.opacity = 0.5 + Math.sin(time * 1.5) * 0.2;
            materialRef.current.size = 0.08 + Math.sin(time * 1.5) * 0.02;
        } else {
            materialRef.current.opacity = 0.3;
            materialRef.current.size = 0.06;
        }
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          ref={materialRef}
          transparent
          color="#818cf8"
          size={0.06}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

export default function Premium3DBackground({ ambientGlow = false }: { ambientGlow?: boolean }) {
  return (
    <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${ambientGlow ? 'opacity-100' : 'opacity-60'}`}>
      <Canvas camera={{ position: [0, 0, 15] }}>
        <ParticleCloud ambientGlow={ambientGlow} />
      </Canvas>
    </div>
  );
}
