"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export interface CellCanvasProps {
  paused: boolean;
  reducedMotion: boolean;
  rotation: { x: number; y: number };
  resetVersion: number;
  onReady: () => void;
  onFailure: () => void;
}

function makeCellGeometry() {
  const geometry = new THREE.SphereGeometry(1, 72, 48);
  const positions = geometry.attributes.position;
  for (let index = 0; index < positions.count; index++) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const z = positions.getZ(index);
    // Compress a sphere into a smooth, biconcave disc. The two poles form
    // shallow dimples and the outer annulus has a thicker rounded profile.
    positions.setXYZ(index, x, y, z * (0.14 + 0.5 * (x * x + y * y)));
  }
  geometry.computeVertexNormals();
  return geometry;
}

const satellites = [
  { position: [-1.72, 1.04, -0.22], scale: 0.34, rotation: [0.5, -0.4, -0.5] },
  { position: [1.56, -1.04, 0.48], scale: 0.43, rotation: [-0.5, 0.9, 0.6] },
  { position: [1.67, 1.14, -0.76], scale: 0.23, rotation: [0.4, 0.9, 0.4] },
  { position: [-1.44, -1.28, -0.65], scale: 0.22, rotation: [0.8, 0.5, -0.5] },
] as const;

function CellStudy({ paused, reducedMotion, rotation, resetVersion, onReady, onFailure }: CellCanvasProps) {
  const root = useRef<THREE.Group>(null);
  const central = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const readyFrames = useRef(0);
  const geometry = useMemo(makeCellGeometry, []);
  const { gl } = useThree();
  const particles = useMemo(() => {
    const vertices = new Float32Array(36 * 3);
    for (let index = 0; index < 36; index++) {
      const angle = index * 2.399963;
      const radius = 1.85 + (index % 5) * 0.075;
      vertices[index * 3] = Math.cos(angle) * radius;
      vertices[index * 3 + 1] = Math.sin(angle) * radius;
      vertices[index * 3 + 2] = Math.sin(index * 1.7) * 0.5 - 0.65;
    }
    return vertices;
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onFailure]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => { elapsed.current = 0; }, [resetVersion]);

  useFrame((_, delta) => {
    if (gl.getContext().isContextLost()) return;
    readyFrames.current += 1;
    if (readyFrames.current === 3) onReady();
    if (!paused && !reducedMotion) elapsed.current += Math.min(delta, 0.05);
    const time = elapsed.current;
    if (root.current) {
      const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * 7);
      root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, rotation.x, blend);
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, rotation.y, blend);
    }
    if (central.current) {
      central.current.rotation.set(-0.36 + Math.sin(time * 0.35) * 0.08, 0.36 + time * 0.13, -0.34);
      central.current.position.y = Math.sin(time * 0.6) * 0.055;
    }
    if (orbit.current) orbit.current.rotation.z = time * 0.035;
  });

  return <>
    <ambientLight intensity={1.35} />
    <hemisphereLight args={["#fff8ed", "#5b2a86", 1.2]} />
    <directionalLight position={[-3, 5, 5]} color="#fff5e5" intensity={4.2} />
    <directionalLight position={[3, -1, 3]} color="#d4eb58" intensity={1.9} />
    <directionalLight position={[-2, -2, -3]} color="#b685eb" intensity={3} />
    <group ref={root}>
      <group ref={central}>
        <mesh geometry={geometry} scale={1.14}>
          <meshPhysicalMaterial color="#5b2a86" roughness={0.27} metalness={0.14} clearcoat={0.8} clearcoatRoughness={0.22} />
        </mesh>
      </group>
      {satellites.map((cell, index) => <mesh
        key={index}
        geometry={geometry}
        position={[...cell.position]}
        rotation={[...cell.rotation]}
        scale={cell.scale}
      >
        <meshPhysicalMaterial color={index === 1 ? "#753ba8" : "#8251a9"} roughness={0.3} metalness={0.08} clearcoat={0.6} />
      </mesh>)}
      <group ref={orbit} rotation={[0.22, -0.28, 0]}>
        <mesh position={[0, 0, -0.6]}>
          <torusGeometry args={[1.72, 0.008, 8, 160]} />
          <meshBasicMaterial color="#9b7ab1" transparent opacity={0.45} />
        </mesh>
        <mesh position={[0, 0, -0.61]} rotation={[0, 0.25, 0.18]}>
          <torusGeometry args={[2.02, 0.004, 6, 160]} />
          <meshBasicMaterial color="#5b2a86" transparent opacity={0.3} />
        </mesh>
        <mesh position={[1.65, 0.47, -0.6]}>
          <sphereGeometry args={[0.055, 14, 14]} />
          <meshBasicMaterial color="#d4eb58" />
        </mesh>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[particles, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#76558c" size={0.025} sizeAttenuation transparent opacity={0.55} />
        </points>
      </group>
    </group>
  </>;
}

export default function CellCanvas(props: CellCanvasProps) {
  return <Canvas
    aria-hidden="true"
    dpr={[1, 1.75]}
    camera={{ position: [0, 0, 5.2], fov: 46 }}
    gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    style={{ pointerEvents: "none" }}
  >
    <CellStudy {...props} />
  </Canvas>;
}
