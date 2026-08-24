import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as THREE from "three";
import "./Login.css";

const API = "http://localhost:8080/api";

const roles = [
  {
    id: "CUSTOMER",
    title: "Customer",
    icon: "👤",
    label: "PERSONAL",
    description: "Create and track your deliveries",
  },
  {
    id: "DELIVERY_AGENT",
    title: "Delivery Agent",
    icon: "🚚",
    label: "OPERATIONS",
    description: "Manage and deliver assigned orders",
  },
  {
    id: "ADMIN",
    title: "Administrator",
    icon: "🛠️",
    label: "CONTROL",
    description: "Manage the complete delivery system",
  },
];

function DeliveryAnimation({ darkMode }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      -12,
      12,
      7,
      -7,
      0.1,
      100
    );

    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    const objects = [];

    const roadColor = darkMode
      ? 0x071b15
      : 0xeaf0fa;

    const roadLineColor = darkMode
      ? 0x27f59a
      : 0x4d6bff;

    const vehicleColor = darkMode
      ? 0x22e88d
      : 0x4169e1;

    const windowColor = darkMode
      ? 0x09251d
      : 0xdce8ff;

    /* ROAD */

    const roadGeometry = new THREE.PlaneGeometry(24, 3.2);

    const roadMaterial = new THREE.MeshBasicMaterial({
      color: roadColor,
      transparent: true,
      opacity: 0.9,
    });

    const road = new THREE.Mesh(
      roadGeometry,
      roadMaterial
    );

    road.position.y = -2.4;
    road.position.z = -1;

    scene.add(road);

    /* ROAD LINES */

    for (let i = -12; i < 15; i += 2) {
      const lineGeometry =
        new THREE.PlaneGeometry(1.1, 0.08);

      const lineMaterial =
        new THREE.MeshBasicMaterial({
          color: roadLineColor,
        });

      const line = new THREE.Mesh(
        lineGeometry,
        lineMaterial
      );

      line.position.set(i, -2.4, -0.8);

      scene.add(line);

      objects.push(line);
    }

    /* DELIVERY VAN */

    const van = new THREE.Group();

    /* Main body */

    const bodyGeometry =
      new THREE.BoxGeometry(2.7, 1.15, 1.25);

    const bodyMaterial =
      new THREE.MeshBasicMaterial({
        color: vehicleColor,
      });

    const body = new THREE.Mesh(
      bodyGeometry,
      bodyMaterial
    );

    body.position.y = -1.45;

    van.add(body);

    /* Front cabin */

    const cabinGeometry =
      new THREE.BoxGeometry(1.05, 0.9, 1.15);

    const cabinMaterial =
      new THREE.MeshBasicMaterial({
        color: vehicleColor,
      });

    const cabin = new THREE.Mesh(
      cabinGeometry,
      cabinMaterial
    );

    cabin.position.set(1.25, -1.35, 0);

    van.add(cabin);

    /* Windows */

    const windowGeometry =
      new THREE.BoxGeometry(0.45, 0.38, 1.17);

    const windowMaterial =
      new THREE.MeshBasicMaterial({
        color: windowColor,
      });

    const frontWindow =
      new THREE.Mesh(
        windowGeometry,
        windowMaterial
      );

    frontWindow.position.set(
      1.25,
      -1.2,
      0
    );

    van.add(frontWindow);

    /* Wheels */

    const wheelGeometry =
      new THREE.CylinderGeometry(
        0.28,
        0.28,
        0.15,
        24
      );

    const wheelMaterial =
      new THREE.MeshBasicMaterial({
        color: darkMode
          ? 0x06100c
          : 0x202938,
      });

    const wheelPositions = [
      [-0.8, -2.05, 0.67],
      [1.25, -2.05, 0.67],
      [-0.8, -2.05, -0.67],
      [1.25, -2.05, -0.67],
    ];

    wheelPositions.forEach(
      ([x, y, z]) => {
        const wheel =
          new THREE.Mesh(
            wheelGeometry,
            wheelMaterial
          );

        wheel.rotation.x =
          Math.PI / 2;

        wheel.position.set(
          x,
          y,
          z
        );

        van.add(wheel);
      }
    );

    van.position.set(-7, 0, 1);

    scene.add(van);

    /* DESTINATION PIN */

    const pinMaterial =
      new THREE.MeshBasicMaterial({
        color: darkMode
          ? 0x39ff9a
          : 0x496cff,
      });

    const pinGeometry =
      new THREE.SphereGeometry(
        0.18,
        16,
        16
      );

    const destination =
      new THREE.Mesh(
        pinGeometry,
        pinMaterial
      );

    destination.position.set(
      7,
      -1.2,
      0
    );

    scene.add(destination);

    /* Floating dots */

    const particleGeometry =
      new THREE.BufferGeometry();

    const particlePositions = [];

    for (let i = 0; i < 45; i++) {
      particlePositions.push(
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 12,
        -2
      );
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        particlePositions,
        3
      )
    );

    const particleMaterial =
      new THREE.PointsMaterial({
        color: darkMode
          ? 0x22e88d
          : 0x6580ff,
        size: 0.035,
        transparent: true,
        opacity: 0.55,
      });

    const particles =
      new THREE.Points(
        particleGeometry,
        particleMaterial
      );

    scene.add(particles);

    let animationFrame;

    const animate = () => {
      animationFrame =
        requestAnimationFrame(animate);

      /* Move van */

      van.position.x += 0.025;

      if (van.position.x > 8) {
        van.position.x = -8;
      }

      /* Move road */

      objects.forEach((line) => {
        line.position.x -= 0.025;

        if (line.position.x < -13) {
          line.position.x = 13;
        }
      });

      /* Floating motion */

      destination.position.y =
        -1.2 +
        Math.sin(
          performance.now() * 0.003
        ) *
          0.12;

      particles.rotation.z += 0.0003;

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    const handleResize = () => {
      
      const width = window.innerWidth;
const height = window.innerHeight;

const aspect = width / height;

const viewHeight = 12;

camera.left =
  (-viewHeight * aspect) / 2;

camera.right =
  (viewHeight * aspect) / 2;

camera.top =
  viewHeight / 2;

camera.bottom =
  -viewHeight / 2;

camera.updateProjectionMatrix();

renderer.setSize(
  width,
  height
);
      
    };

    handleResize();

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      renderer.dispose();

      if (
        container.contains(
          renderer.domElement
        )
      ) {
        container.removeChild(
          renderer.domElement
        );
      }

      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          if (
            Array.isArray(
              object.material
            )
          ) {
            object.material.forEach(
              (material) =>
                material.dispose()
            );
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [darkMode]);

  return (
    <div
      ref={mountRef}
      className="delivery-animation"
    />
  );
}

function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] =
    useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [darkMode, setDarkMode] =
    useState(
      () =>
        localStorage.getItem(
          "theme"
        ) === "dark"
    );

  useEffect(() => {
    document.body.classList.toggle(
      "dark-login",
      darkMode
    );

    localStorage.setItem(
      "theme",
      darkMode
        ? "dark"
        : "light"
    );

    return () => {
      document.body.classList.remove(
        "dark-login"
      );
    };
  }, [darkMode]);

  const selectRole = (role) => {
    setSelectedRole(role);
    setError("");

    if (role === "CUSTOMER") {
      setEmail(
        "newcustomer@test.com"
      );

      setPassword(
        "Customer@123"
      );
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const goBack = () => {
    setSelectedRole(null);
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response =
        await axios.post(
          `${API}/auth/login`,
          {
            email,
            password,
          }
        );

      const user =
        response.data;

      if (
        user.role !==
        selectedRole
      ) {
        setError(
          `This account belongs to ${user.role}. Please select the correct account type.`
        );

        return;
      }

      localStorage.setItem(
        "token",
        user.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      onLogin(user);
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
          "Invalid user ID or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const currentRole =
    roles.find(
      (role) =>
        role.id === selectedRole
    );

  return (
    <div
      className={`login-page ${
        darkMode
          ? "theme-dark"
          : "theme-light"
      }`}
    >
      <DeliveryAnimation
        darkMode={darkMode}
      />

      <div className="login-overlay" />

      <button
        type="button"
        className="theme-toggle"
        onClick={() =>
          setDarkMode(
            (value) => !value
          )
        }
        aria-label="Change theme"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      {!selectedRole ? (
        <main className="login-content">
          <header className="brand-section">
            <div className="brand-logo">
              LM
            </div>

            <span className="brand-name">
              Last-Mile
            </span>

            <h1>
              Last-Mile Delivery
            </h1>

            <p>
              Smart Delivery
              Management System
            </p>
          </header>

          <section className="role-section">
            <div className="section-heading">
              <span />
              <h2>
                Choose your account
                type
              </h2>
              <span />
            </div>

            <p className="section-subtitle">
              Select your role to
              continue
            </p>

            <div className="role-cards">
              {roles.map(
                (role, index) => (
                  <button
                    type="button"
                    key={role.id}
                    className={`role-card role-${index}`}
                    onClick={() =>
                      selectRole(
                        role.id
                      )
                    }
                  >
                    <div className="card-top">
                      <span className="role-label">
                        {role.label}
                      </span>

                      <span className="arrow">
                        ↗
                      </span>
                    </div>

                    <div className="role-icon">
                      {role.icon}
                    </div>

                    <h3>
                      {role.title}
                    </h3>

                    <p>
                      {
                        role.description
                      }
                    </p>

                    <div className="card-footer">
                      <span>
                        Continue
                      </span>

                      <strong>
                        →
                      </strong>
                    </div>
                  </button>
                )
              )}
            </div>
          </section>

          <footer className="secure-footer">
            <span>🔒</span>
            Secure delivery
            management platform
            <i />
          </footer>
        </main>
      ) : (
        <main className="login-content login-content-form">
          <div className="login-form-card">
            <button
              type="button"
              className="back-button"
              onClick={goBack}
            >
              ← Choose another
              account
            </button>

            <div className="form-role-icon">
              {currentRole.icon}
            </div>

            <span className="form-role-label">
              {currentRole.label}
            </span>

            <h1>
              {currentRole.title}
            </h1>

            <p className="form-description">
              Sign in to continue
              to your{" "}
              {currentRole.title.toLowerCase()}{" "}
              account.
            </p>

            <form
              onSubmit={
                handleLogin
              }
            >
              <div className="input-group">
                <label>
                  User ID / Email
                </label>

                <input
                  type="text"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="Enter your user ID or email"
                  required
                />
              </div>

              <div className="input-group">
                <label>
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="signin-button"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Sign In →"}
              </button>
            </form>

            {error && (
              <div className="login-error">
                <span>!</span>
                {error}
              </div>
            )}

            <div className="form-security">
              <span>🔐</span>
              Protected with JWT
              authentication
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default Login;