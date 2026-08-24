import {
  Canvas,
  useFrame,
} from "@react-three/fiber";

import {
  Float,
  Sparkles,
} from "@react-three/drei";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

/* =========================================================
   MOVING ROUTE PACKETS
========================================================= */

function RoutePackets({
  darkMode,
}) {
  const group =
    useRef(null);

  const packets =
    useMemo(() => {
      return Array.from(
        { length: 35 },
        (_, index) => ({
          offset:
            index / 35,
          speed:
            0.08 +
            Math.random() * 0.12,
          lane:
            (Math.random() - 0.5) *
            7,
          height:
            -1.5 +
            Math.random() * 3,
        })
      );
    }, []);

  useFrame(
    (_, delta) => {
      if (!group.current)
        return;

      group.current.children.forEach(
        (packet, index) => {
          const data =
            packets[index];

          data.offset +=
            data.speed * delta;

          if (
            data.offset > 1
          ) {
            data.offset -= 1;
          }

          const z =
            8 -
            data.offset * 28;

          const x =
            data.lane +
            Math.sin(
              data.offset * 8
            ) *
              0.7;

          packet.position.set(
            x,
            data.height +
              Math.sin(
                data.offset * 10
              ) *
                0.2,
            z
          );
        }
      );
    }
  );

  return (
    <group ref={group}>
      {packets.map(
        (_, index) => (
          <mesh key={index}>
            <sphereGeometry
              args={[
                0.025,
                8,
                8,
              ]}
            />

            <meshBasicMaterial
              color={
                darkMode
                  ? "#00FF9D"
                  : "#10B981"
              }
              transparent
              opacity={0.8}
            />
          </mesh>
        )
      )}
    </group>
  );
}

/* =========================================================
   LOGISTICS GRID
========================================================= */

function LogisticsGrid({
  darkMode,
}) {
  const grid =
    useRef(null);

  useFrame((state) => {
    if (!grid.current)
      return;

    grid.current.rotation.z =
      Math.sin(
        state.clock.elapsedTime *
          0.08
      ) *
      0.015;
  });

  return (
    <group
      ref={grid}
      rotation={[
        -Math.PI / 2.8,
        0,
        0,
      ]}
      position={[
        0,
        -2.8,
        -2,
      ]}
    >
      <gridHelper
        args={[
          32,
          32,
          darkMode
            ? "#164936"
            : "#cbd5e1",
          darkMode
            ? "#102d22"
            : "#e2e8f0",
        ]}
      />
    </group>
  );
}

/* =========================================================
   ROUTE CURVES
========================================================= */

function RouteLines({
  darkMode,
}) {
  const lines =
    useMemo(() => {
      const result = [];

      for (
        let i = 0;
        i < 7;
        i++
      ) {
        const points = [];

        for (
          let j = 0;
          j < 20;
          j++
        ) {
          const z =
            8 -
            j * 1.4;

          const x =
            -8 +
            i * 2.5 +
            Math.sin(
              j * 0.55 +
                i
            ) *
              1.1;

          const y =
            -1.5 +
            Math.cos(
              j * 0.45
            ) *
              0.25;

          points.push(
            new THREE.Vector3(
              x,
              y,
              z
            )
          );
        }

        result.push(
          new THREE.CatmullRomCurve3(
            points
          )
        );
      }

      return result;
    }, []);

  return (
    <group>
      {lines.map(
        (curve, index) => {
          const points =
            curve.getPoints(
              80
            );

          const geometry =
            new THREE.BufferGeometry().setFromPoints(
              points
            );

          return (
            <line
              key={index}
              geometry={
                geometry
              }
            >
              <lineBasicMaterial
                color={
                  darkMode
                    ? "#34D399"
                    : "#94a3b8"
                }
                transparent
                opacity={
                  darkMode
                    ? 0.18
                    : 0.12
                }
              />
            </line>
          );
        }
      )}
    </group>
  );
}

/* =========================================================
   CENTRAL LOGISTICS CORE
========================================================= */

function LogisticsCore({
  darkMode,
}) {
  const mesh =
    useRef(null);

  useFrame((state) => {
    if (!mesh.current)
      return;

    mesh.current.rotation.y +=
      0.003;

    mesh.current.rotation.x =
      Math.sin(
        state.clock.elapsedTime *
          0.4
      ) *
      0.08;
  });

  return (
    <Float
      speed={1.2}
      rotationIntensity={0.3}
      floatIntensity={0.4}
    >
      <group
        ref={mesh}
        position={[
          0,
          0,
          -5,
        ]}
      >
        <mesh>
          <icosahedronGeometry
            args={[1.2, 1]}
          />

          <meshBasicMaterial
            color={
              darkMode
                ? "#34D399"
                : "#10B981"
            }
            wireframe
            transparent
            opacity={0.12}
          />
        </mesh>

        <mesh>
          <sphereGeometry
            args={[
              0.18,
              16,
              16,
            ]}
          />

          <meshBasicMaterial
            color="#00FF9D"
          />
        </mesh>

        <pointLight
          color="#34D399"
          intensity={
            darkMode
              ? 4
              : 1.5
          }
          distance={8}
        />
      </group>
    </Float>
  );
}

/* =========================================================
   CAMERA PARALLAX
========================================================= */

function CameraController() {
  const target =
    useRef(
      new THREE.Vector3()
    );

  useEffect(() => {
    const move = (event) => {
      target.current.x =
        (event.clientX /
          window.innerWidth -
          0.5) *
        1.4;

      target.current.y =
        (event.clientY /
          window.innerHeight -
          0.5) *
        -0.8;
    };

    window.addEventListener(
      "pointermove",
      move
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        move
      );
    };
  }, []);

  useFrame(
    ({ camera }) => {
      camera.position.x =
        THREE.MathUtils.lerp(
          camera.position.x,
          target.current.x,
          0.035
        );

      camera.position.y =
        THREE.MathUtils.lerp(
          camera.position.y,
          2.8 +
            target.current.y,
          0.035
        );

      camera.lookAt(
        0,
        -1,
        -5
      );
    }
  );

  return null;
}

/* =========================================================
   SCENE
========================================================= */

function Scene({
  darkMode,
}) {
  return (
    <>
      <color
        attach="background"
        args={[
          darkMode
            ? "#0B1015"
            : "#eef4f2",
        ]}
      />

      <fog
        attach="fog"
        args={[
          darkMode
            ? "#0B1015"
            : "#eef4f2",
          8,
          28,
        ]}
      />

      <ambientLight
        intensity={
          darkMode ? 0.5 : 1.5
        }
      />

      <pointLight
        position={[
          0,
          4,
          -4,
        ]}
        color="#34D399"
        intensity={
          darkMode ? 8 : 2
        }
        distance={20}
      />

      <CameraController />

      <LogisticsGrid
        darkMode={darkMode}
      />

      <RouteLines
        darkMode={darkMode}
      />

      <RoutePackets
        darkMode={darkMode}
      />

      <LogisticsCore
        darkMode={darkMode}
      />

      <Sparkles
        count={
          window.innerWidth < 700
            ? 80
            : 180
        }
        scale={[
          25,
          12,
          25,
        ]}
        size={
          darkMode
            ? 1.5
            : 1
        }
        speed={0.2}
        color={
          darkMode
            ? "#34D399"
            : "#64748b"
        }
      />
    </>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function LogisticsScene({
  darkMode,
}) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{
          position: [
            0,
            2.8,
            13,
          ],
          fov: 42,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference:
            "high-performance",
        }}
      >
        <Scene
          darkMode={darkMode}
        />
      </Canvas>
    </div>
  );
}