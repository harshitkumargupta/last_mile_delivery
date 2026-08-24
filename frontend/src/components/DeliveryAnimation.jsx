import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, RoundedBox } from "@react-three/drei";
import { useRef } from "react";

function DeliveryBox() {
  const box = useRef();

  useFrame((state) => {
    if (!box.current) return;

    box.current.rotation.y =
      state.clock.elapsedTime * 0.35;

    box.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.6) * 0.08;
  });

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.25}
      floatIntensity={0.7}
    >
      <group ref={box}>

        {/* Package */}
        <RoundedBox
          args={[1.8, 1.4, 1.8]}
          radius={0.15}
          smoothness={5}
        >
          <meshStandardMaterial
            color="#2563eb"
            roughness={0.35}
            metalness={0.15}
          />
        </RoundedBox>

        {/* Package stripe */}
        <mesh position={[0, 0, 0.92]}>
          <boxGeometry args={[0.45, 1.42, 0.04]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.3}
          />
        </mesh>

        {/* LM label */}
        <mesh position={[0, 0, 0.95]}>
          <planeGeometry args={[0.7, 0.7]} />
          <meshStandardMaterial
            color="#4f46e5"
            roughness={0.3}
          />
        </mesh>

      </group>
    </Float>
  );
}

function Orbit() {
  const orbit = useRef();

  useFrame((state) => {
    if (!orbit.current) return;

    orbit.current.rotation.z =
      state.clock.elapsedTime * 0.25;
  });

  return (
    <group ref={orbit}>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.025, 16, 100]} />

        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.5}
        />
      </mesh>

      <mesh
        position={[2.2, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <sphereGeometry args={[0.09, 16, 16]} />

        <meshBasicMaterial
          color="#2563eb"
        />
      </mesh>

    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1.5} />

      <directionalLight
        position={[3, 4, 5]}
        intensity={2}
      />

      <pointLight
        position={[-3, -2, 3]}
        intensity={1}
        color="#6366f1"
      />

      <DeliveryBox />

      <Orbit />

      <Environment preset="city" />
    </>
  );
}

export default function DeliveryAnimation() {
  return (
    <div className="three-background">
      <Canvas
        camera={{
          position: [0, 0, 6],
          fov: 45,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}