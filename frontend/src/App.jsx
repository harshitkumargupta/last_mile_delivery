import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateOrder from "./pages/CreateOrder";
import Orders from "./pages/Orders";
import DeliveryAgentDashboard from "./pages/DeliveryAgentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import "./App.css";

function App() {

  // =========================================================
  // USER
  // =========================================================

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // =========================================================
  // PAGE
  // =========================================================

  const [page, setPage] = useState("dashboard");

  const [selectedOrder, setSelectedOrder] = useState(null);

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = (loggedInUser) => {

    setUser(loggedInUser);

    setSelectedOrder(null);

    setPage("dashboard");
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    setSelectedOrder(null);

    setPage("dashboard");
  };

  // =========================================================
  // CREATE ORDER
  // =========================================================

  const openCreateOrder = () => {

    setPage("create-order");
  };

  // =========================================================
  // MY ORDERS
  // =========================================================

  const openOrders = () => {

    setPage("orders");
  };

  // =========================================================
  // TRACK DELIVERY
  // =========================================================

  const openTrackDelivery = () => {

    setPage("track-delivery");
  };

  // =========================================================
  // ORDER DETAILS
  // =========================================================

  const openOrderDetails = (order) => {

    setSelectedOrder(order);

    setPage("order-details");
  };

  // =========================================================
  // DASHBOARD
  // =========================================================

  const goDashboard = () => {

    setPage("dashboard");

    setSelectedOrder(null);
  };

  // =========================================================
  // LOGIN PAGE
  // =========================================================

  if (!user) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  // =========================================================
  // DELIVERY AGENT
  // =========================================================

  if (user.role === "DELIVERY_AGENT") {

    return (
      <DeliveryAgentDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // =========================================================
  // ADMIN
  // =========================================================

  if (user.role === "ADMIN") {

    return (
      <AdminDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // =========================================================
  // CUSTOMER - MY ORDERS
  // =========================================================

  if (page === "orders") {

    return (
      <Orders
        user={user}
        token={localStorage.getItem("token")}
        onBack={goDashboard}
        onViewOrder={openOrderDetails}
        onCreateOrder={openCreateOrder}
      />
    );
  }

  // =========================================================
  // CUSTOMER - CREATE ORDER
  // =========================================================

  if (page === "create-order") {

    return (
      <CreateOrder
        user={user}
        onBack={goDashboard}
        onOrderCreated={goDashboard}
      />
    );
  }

  // =========================================================
  // CUSTOMER - TRACK DELIVERY
  // =========================================================

  if (page === "track-delivery") {

    return (
      <TrackDelivery
        user={user}
        token={localStorage.getItem("token")}
        onBack={goDashboard}
        onViewOrder={openOrderDetails}
      />
    );
  }

  // =========================================================
  // CUSTOMER - ORDER DETAILS
  // =========================================================

  if (page === "order-details") {

    if (!selectedOrder) {

      return (
        <div className="order-details-page">

          <button
            className="back-button"
            onClick={goDashboard}
          >
            ← Back to Dashboard
          </button>

          <div className="order-details-card">

            <h2>
              Order not found
            </h2>

          </div>

        </div>
      );
    }

    return (
      <div className="order-details-page">

        <button
          className="back-button"
          onClick={goDashboard}
        >
          ← Back to Dashboard
        </button>

        <div className="order-details-card">

          {/* HEADER */}

          <div className="order-details-header">

            <div>

              <span>
                ORDER DETAILS
              </span>

              <h1>
                {selectedOrder.orderNumber}
              </h1>

            </div>

            <span
              className={`status-badge ${String(
                selectedOrder.status || ""
              ).toLowerCase()}`}
            >
              {String(
                selectedOrder.status || ""
              ).replace(/_/g, " ")}
            </span>

          </div>

          {/* DETAILS */}

          <div className="order-details-grid">

            <div>
              <small>
                Pickup Address
              </small>

              <strong>
                {selectedOrder.pickupAddress || "-"}
              </strong>
            </div>

            <div>
              <small>
                Drop Address
              </small>

              <strong>
                {selectedOrder.dropAddress || "-"}
              </strong>
            </div>

            <div>
              <small>
                Order Type
              </small>

              <strong>
                {selectedOrder.orderType || "-"}
              </strong>
            </div>

            <div>
              <small>
                Payment
              </small>

              <strong>
                {selectedOrder.paymentType || "-"}
              </strong>
            </div>

            <div>
              <small>
                Actual Weight
              </small>

              <strong>
                {selectedOrder.actualWeight || 0} kg
              </strong>
            </div>

            <div>
              <small>
                Chargeable Weight
              </small>

              <strong>
                {selectedOrder.chargeableWeight || 0} kg
              </strong>
            </div>

            <div>
              <small>
                Base Charge
              </small>

              <strong>
                ₹
                {Number(
                  selectedOrder.baseCharge || 0
                ).toFixed(2)}
              </strong>
            </div>

            <div>
              <small>
                Total Charge
              </small>

              <strong>
                ₹
                {Number(
                  selectedOrder.totalCharge || 0
                ).toFixed(2)}
              </strong>
            </div>

          </div>

          {/* FOOTER */}

          <div className="order-details-footer">

            <span>
              Created
            </span>

            <strong>
              {selectedOrder.createdAt
                ? new Date(
                    selectedOrder.createdAt
                  ).toLocaleString()
                : "-"}
            </strong>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // CUSTOMER DASHBOARD
  // =========================================================

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
      onCreateOrder={openCreateOrder}
      onViewOrder={openOrderDetails}
      onOrders={openOrders}
      onTrackDelivery={openTrackDelivery}
    />
  );
}


// ============================================================
// TRACK DELIVERY PAGE
// ============================================================

function TrackDelivery({
  user,
  token,
  onBack,
  onViewOrder,
}) {

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD ORDERS
  // =========================================================

  const loadOrders = async () => {

    try {

      setLoading(true);

      setError("");

      if (!token) {

        throw new Error(
          "Login session expired."
        );
      }

      if (!user?.userId) {

        throw new Error(
          "Customer information not found."
        );
      }

      const response = await fetch(
        `http://localhost:8080/api/orders/customer/${user.userId}`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {

        const text =
          await response.text();

        throw new Error(
          text ||
          `Request failed: ${response.status}`
        );
      }

      const data =
        await response.json();

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Track Delivery Error:",
        err
      );

      setError(
        err.message ||
        "Unable to load deliveries."
      );

    } finally {

      setLoading(false);
    }
  };

  // =========================================================
  // LOAD ON MOUNT
  // =========================================================

  useState(() => {
    loadOrders();
  }, []);

  // =========================================================
  // STATUS
  // =========================================================

  const getStatusClass = (status) => {

    return String(
      status || "CREATED"
    )
      .toLowerCase()
      .replace(/_/g, "-");
  };

  const getStatusText = (status) => {

    return String(
      status || "CREATED"
    ).replace(/_/g, " ");
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px",
        boxSizing: "border-box",
      }}
    >

      {/* TOP */}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >

        <div>

          <button
            onClick={onBack}
            style={{
              border: "none",
              background: "transparent",
              color: "#2563eb",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              padding: "0",
              marginBottom: "18px",
            }}
          >
            ← Back to Dashboard
          </button>

          <div
            style={{
              fontSize: "13px",
              fontWeight: "800",
              letterSpacing: "2px",
              color: "#2563eb",
              marginBottom: "8px",
            }}
          >
            LIVE DELIVERY TRACKING
          </div>

          <h1
            style={{
              margin: "0",
              fontSize: "42px",
              color: "#111827",
            }}
          >
            Track Delivery
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: "#64748b",
              fontSize: "17px",
            }}
          >
            Select any order to view its delivery
            information.
          </p>

        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          style={{
            border: "1px solid #dbe3ef",
            background: "#ffffff",
            color: "#2563eb",
            padding: "14px 22px",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "700",
            cursor: loading
              ? "default"
              : "pointer",
          }}
        >
          {loading
            ? "Loading..."
            : "↻ Refresh"}
        </button>

      </div>

      {/* ERROR */}

      {error && (

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto 25px",
            padding: "18px 20px",
            borderRadius: "14px",
            background: "#fff1f2",
            border: "1px solid #fecdd3",
            color: "#dc2626",
            fontWeight: "600",
          }}
        >
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading ? (

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            background: "#ffffff",
            borderRadius: "20px",
            padding: "60px",
            textAlign: "center",
            color: "#64748b",
            fontSize: "17px",
          }}
        >
          Loading your deliveries...
        </div>

      ) : orders.length === 0 ? (

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            background: "#ffffff",
            borderRadius: "20px",
            padding: "70px 30px",
            textAlign: "center",
          }}
        >

          <div
            style={{
              fontSize: "55px",
              marginBottom: "15px",
            }}
          >
            📦
          </div>

          <h2>
            No deliveries found
          </h2>

          <p
            style={{
              color: "#64748b",
            }}
          >
            Create an order first to track your
            delivery.
          </p>

        </div>

      ) : (

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gap: "18px",
          }}
        >

          {orders.map((order) => (

            <div
              key={order.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "20px",
                padding: "24px",
                boxShadow:
                  "0 8px 25px rgba(15,23,42,0.04)",
              }}
            >

              {/* ORDER HEADER */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                  marginBottom: "22px",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >

                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background: "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                    }}
                  >
                    📦
                  </div>

                  <div>

                    <span
                      style={{
                        display: "block",
                        color: "#94a3b8",
                        fontSize: "11px",
                        fontWeight: "800",
                        letterSpacing: "1.5px",
                        marginBottom: "5px",
                      }}
                    >
                      ORDER
                    </span>

                    <strong
                      style={{
                        fontSize: "18px",
                        color: "#172033",
                      }}
                    >
                      {order.orderNumber}
                    </strong>

                  </div>

                </div>

                <span
                  className={`badge ${getStatusClass(
                    order.status
                  )}`}
                  style={{
                    padding: "9px 15px",
                    borderRadius: "999px",
                    background: "#f1f5f9",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                  }}
                >
                  {getStatusText(
                    order.status
                  )}
                </span>

              </div>

              {/* ROUTE */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 80px 1fr",
                  alignItems: "center",
                  gap: "15px",
                  background: "#f8fafc",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >

                <div>

                  <span
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "#94a3b8",
                      fontWeight: "800",
                      letterSpacing: "1px",
                      marginBottom: "7px",
                    }}
                  >
                    PICKUP
                  </span>

                  <strong
                    style={{
                      color: "#1e293b",
                      fontSize: "15px",
                    }}
                  >
                    {order.pickupAddress}
                  </strong>

                </div>

                <div
                  style={{
                    textAlign: "center",
                    fontSize: "28px",
                    color: "#2563eb",
                  }}
                >
                  →
                </div>

                <div>

                  <span
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "#94a3b8",
                      fontWeight: "800",
                      letterSpacing: "1px",
                      marginBottom: "7px",
                    }}
                  >
                    DELIVERY
                  </span>

                  <strong
                    style={{
                      color: "#1e293b",
                      fontSize: "15px",
                    }}
                  >
                    {order.dropAddress}
                  </strong>

                </div>

              </div>

              {/* BOTTOM */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    gap: "30px",
                    flexWrap: "wrap",
                  }}
                >

                  <div>

                    <span
                      style={{
                        display: "block",
                        color: "#94a3b8",
                        fontSize: "12px",
                        marginBottom: "5px",
                      }}
                    >
                      Order Type
                    </span>

                    <strong>
                      {order.orderType || "-"}
                    </strong>

                  </div>

                  <div>

                    <span
                      style={{
                        display: "block",
                        color: "#94a3b8",
                        fontSize: "12px",
                        marginBottom: "5px",
                      }}
                    >
                      Weight
                    </span>

                    <strong>
                      {order.actualWeight || 0} kg
                    </strong>

                  </div>

                  <div>

                    <span
                      style={{
                        display: "block",
                        color: "#94a3b8",
                        fontSize: "12px",
                        marginBottom: "5px",
                      }}
                    >
                      Total
                    </span>

                    <strong>
                      ₹
                      {Number(
                        order.totalCharge || 0
                      ).toFixed(2)}
                    </strong>

                  </div>

                </div>

                <button
                  onClick={() =>
                    onViewOrder(order)
                  }
                  style={{
                    border: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    padding: "13px 20px",
                    borderRadius: "11px",
                    fontWeight: "700",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  View Details →
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default App;