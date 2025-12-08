/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Trail, Line } from '@react-three/drei';
import * as THREE from 'three';

const PulseNode = ({ position, offset, color }: { position: [number, number, number], offset: number, color: string }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      // Kuramoto-like Oscillation visual: 
      // They pulse but never quite perfectly sync (phase offset)
      const scale = 1 + Math.sin(t * 3 + offset) * 0.4;
      ref.current.scale.setScalar(scale * 0.15);
      
      // Slight orbit
      const radius = 3;
      const angle = offset + t * 0.2;
      ref.current.position.x = Math.cos(angle) * radius;
      ref.current.position.z = Math.sin(angle) * radius;
      ref.current.position.y = Math.sin(t + offset) * 0.5;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
};

const ConnectionRing = () => {
    const points = useMemo(() => {
        const pts = [];
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            pts.push(new THREE.Vector3(Math.cos(angle) * 3, 0, Math.sin(angle) * 3));
        }
        return pts;
    }, []);

    const ref = useRef<any>(null);

    useFrame((state) => {
       if (ref.current) {
           ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
           // Pulse the opacity or color to show "Network Activity"
       }
    });

    return (
        <group ref={ref}>
            <Line points={points} color="#FFD700" opacity={0.1} transparent lineWidth={1} />
        </group>
    )
}

export const PulseNetworkScene: React.FC = () => {
  const nodeCount = 40;
  const nodes = useMemo(() => {
      return new Array(nodeCount).fill(0).map((_, i) => ({
          id: i,
          offset: (i / nodeCount) * Math.PI * 2 * (Math.random() * 0.5 + 0.8), // Random phase offsets
          color: i % 5 === 0 ? '#FFD700' : '#444444' // Signal yellow vs space grey
      }));
  }, []);

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 4, 6], fov: 60 }}>
        <fog attach="fog" args={['#050505', 5, 15]} />
        <ambientLight intensity={0.5} />
        
        <group rotation={[Math.PI / 6, 0, 0]}>
            <ConnectionRing />
            {nodes.map((node) => (
                <PulseNode 
                    key={node.id} 
                    position={[0,0,0]} // Position handled by ref in component
                    offset={node.offset} 
                    color={node.color} 
                />
            ))}
        </group>

        <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
};
