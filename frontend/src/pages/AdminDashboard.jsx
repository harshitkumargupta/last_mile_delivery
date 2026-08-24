import { useEffect, useMemo, useState } from "react";
import "./AdminDashboard.css";

const API = "http://localhost:8080/api";

function AdminDashboard({
  user,
  onLogout,
}) {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");

  const [filter, setFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // =========================================================
  // LOAD ORDERS
  // =========================================================

  const loadOrders = async () => {
    const response = await fetch(`${API}/orders`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const text = await response.text();

      throw new Error(
        text || `Failed to load orders (${response.status})`
      );
    }

    const data = await response.json();

    setOrders(Array.isArray(data) ? data : []);
  };

  // =========================================================
  // LOAD AVAILABLE AGENTS
  // =========================================================

  const loadAgents = async () => {
    const response = await fetch(
      `${API}/delivery-agents/available`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const text = await response.text();

      throw new Error(
        text ||
          `Failed to load agents (${response.status})`
      );
    }

    const data = await response.json();

    setAgents(Array.isArray(data) ? data : []);
  };

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadOrders(),
        loadAgents(),
      ]);
    } catch (err) {
      console.error(
        "ADMIN DASHBOARD ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredOrders = useMemo(() => {
    if (filter === "ALL") {
      return orders;
    }

    return orders.filter(
      (order) =>
        order.status === filter
    );
  }, [orders, filter]);

  // =========================================================
  // COUNTS
  // =========================================================

  const counts = {
    all: orders.length,

    created: orders.filter(
      (order) =>
        order.status === "CREATED"
    ).length,

    pickedUp: orders.filter(
      (order) =>
        order.status === "PICKED_UP"
    ).length,

    transit: orders.filter(
      (order) =>
        order.status === "IN_TRANSIT"
    ).length,

    outForDelivery: orders.filter(
      (order) =>
        order.status ===
        "OUT_FOR_DELIVERY"
    ).length,

    delivered: orders.filter(
      (order) =>
        order.status === "DELIVERED"
    ).length,
  };

  // =========================================================
  // MANUAL ASSIGN
  // =========================================================

  const assignOrder = async () => {
    if (!selectedOrder) {
      setError("Please select an order.");
      return;
    }

    if (!selectedAgent) {
      setError(
        "Please select a delivery agent."
      );
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API}/assignments`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            orderId: Number(selectedOrder),
            agentId: Number(selectedAgent),
            assignmentType: "MANUAL",
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();

        let message =
          "Unable to assign order.";

        try {
          const data = JSON.parse(text);

          message =
            data.message ||
            data.error ||
            message;
        } catch {
          if (text) {
            message = text;
          }
        }

        throw new Error(message);
      }

      const order = orders.find(
        (item) =>
          item.id ===
          Number(selectedOrder)
      );

      setSuccess(
        `${
          order?.orderNumber ||
          "Order"
        } manually assigned successfully.`
      );

      setSelectedOrder("");
      setSelectedAgent("");

      await loadDashboard();
    } catch (err) {
      console.error(
        "MANUAL ASSIGN ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to assign order."
      );
    } finally {
      setAssigning(false);
    }
  };

  // =========================================================
  // AUTOMATIC ASSIGN
  // =========================================================

  const autoAssignOrder = async () => {
    if (!selectedOrder) {
      setError("Please select an order.");
      return;
    }

    try {
      setAutoAssigning(true);
      setError("");
      setSuccess("");

      const selected = orders.find(
        (order) =>
          order.id ===
          Number(selectedOrder)
      );

      const response = await fetch(
        `${API}/assignments/auto/${Number(
          selectedOrder
        )}`,
        {
          method: "POST",
          headers,
        }
      );

      if (!response.ok) {
        const text =
          await response.text();

        let message =
          "Unable to automatically assign order.";

        try {
          const data =
            JSON.parse(text);

          message =
            data.message ||
            data.error ||
            message;
        } catch {
          if (text) {
            message = text;
          }
        }

        throw new Error(message);
      }

      const assignment =
        await response.json();

      const agentName =
        assignment?.agentName ||
        assignment?.fullName ||
        assignment?.deliveryAgentName ||
        `Agent #${
          assignment?.agentId || ""
        }`;

      setSuccess(
        `${
          selected?.orderNumber ||
          "Order"
        } automatically assigned to ${agentName}.`
      );

      setSelectedOrder("");
      setSelectedAgent("");

      await loadDashboard();
    } catch (err) {
      console.error(
        "AUTO ASSIGN ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to automatically assign order."
      );
    } finally {
      setAutoAssigning(false);
    }
  };

  // =========================================================
  // FORMAT STATUS
  // =========================================================

  const formatStatus = (status) => {
    return String(status || "")
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const statusClass = (status) => {
    switch (status) {
      case "DELIVERED":
        return "delivered";

      case "FAILED":
        return "failed";

      case "OUT_FOR_DELIVERY":
        return "out";

      case "IN_TRANSIT":
        return "transit";

      case "PICKED_UP":
        return "picked";

      case "RESCHEDULED":
        return "rescheduled";

      default:
        return "created";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />

        <h2>
          Loading Admin Dashboard...
        </h2>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="admin-dashboard">

      {/* SIDEBAR */}

      <aside className="admin-sidebar">

        <div className="admin-logo">

          <div className="admin-logo-icon">
            DT
          </div>

          <div className="admin-logo-text">
            <strong>
              Delivery
            </strong>

            <span>
              Tracker
            </span>
          </div>

        </div>

        <div className="admin-profile">

          <div className="admin-avatar">
            {(
              user?.fullName ||
              "Admin"
            )
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>

            <strong>
              {user?.fullName ||
                "System Admin"}
            </strong>

            <span>
              Administrator
            </span>

          </div>

        </div>

        <nav className="admin-nav">

          <button
            className="admin-nav-item active"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            ▣ Dashboard
          </button>

          <button
            className="admin-nav-item"
            onClick={() =>
              document
                .getElementById("orders")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            📦 Orders
          </button>

          <button
            className="admin-nav-item"
            onClick={() =>
              document
                .getElementById("agents")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            🚚 Delivery Agents
          </button>

        </nav>

        <div className="admin-sidebar-bottom">

          <button
            className="admin-logout"
            onClick={onLogout}
          >
            ⇥ Logout
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="admin-main">

        {/* HEADER */}

        <header className="admin-header">

          <div>

            <span className="admin-eyebrow">
              ADMINISTRATION
            </span>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Manage orders, delivery
              agents and assignments.
            </p>

          </div>

          <button
            className="admin-refresh"
            onClick={loadDashboard}
          >
            ↻ Refresh
          </button>

        </header>

        {/* ERROR */}

        {error && (
          <div className="admin-message error">

            <span>!</span>

            <strong>
              {error}
            </strong>

            <button
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>

          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="admin-message success">

            <span>✓</span>

            <strong>
              {success}
            </strong>

            <button
              onClick={() =>
                setSuccess("")
              }
            >
              ×
            </button>

          </div>
        )}

        {/* STATS */}

        <section className="admin-stats">

          <div className="admin-stat-card">
            <span>
              Total Orders
            </span>

            <strong>
              {counts.all}
            </strong>
          </div>

          <div className="admin-stat-card">
            <span>
              Created
            </span>

            <strong>
              {counts.created}
            </strong>
          </div>

          <div className="admin-stat-card">
            <span>
              In Transit
            </span>

            <strong>
              {counts.transit}
            </strong>
          </div>

          <div className="admin-stat-card">
            <span>
              Delivered
            </span>

            <strong>
              {counts.delivered}
            </strong>
          </div>

        </section>

        {/* ASSIGNMENT */}

        <section
          className="admin-section"
          id="agents"
        >

          <div className="admin-section-header">

            <div>

              <span className="admin-eyebrow">
                DELIVERY MANAGEMENT
              </span>

              <h2>
                Assign Delivery
              </h2>

            </div>

          </div>

          <div className="admin-assignment-panel">

            {/* ORDER */}

            <div className="admin-form-group">

              <label>
                Select Order
              </label>

              <select
                value={selectedOrder}
                onChange={(event) => {
                  setSelectedOrder(
                    event.target.value
                  );
                  setError("");
                  setSuccess("");
                }}
              >

                <option value="">
                  Select an order
                </option>

                {orders
                  .filter(
                    (order) =>
                      order.status !==
                        "DELIVERED" &&
                      order.status !==
                        "FAILED"
                  )
                  .map((order) => (
                    <option
                      key={order.id}
                      value={order.id}
                    >
                      {order.orderNumber}
                      {" — "}
                      {formatStatus(
                        order.status
                      )}
                    </option>
                  ))}

              </select>

            </div>

            {/* AGENT */}

            <div className="admin-form-group">

              <label>
                Available Delivery Agent
              </label>

              <select
                value={selectedAgent}
                onChange={(event) =>
                  setSelectedAgent(
                    event.target.value
                  )
                }
              >

                <option value="">
                  Select an agent
                </option>

                {agents.map(
                  (agent) => (
                    <option
                      key={agent.id}
                      value={agent.id}
                    >
                      {agent.fullName}
                      {" — Agent #"}
                      {agent.id}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* MANUAL */}

            <button
              className="admin-assign-button"
              disabled={
                assigning ||
                autoAssigning ||
                !selectedOrder ||
                !selectedAgent
              }
              onClick={assignOrder}
            >
              {assigning
                ? "Assigning..."
                : "Assign Order"}
            </button>

            {/* AUTOMATIC */}

            <button
              type="button"
              className="admin-assign-button"
              disabled={
                assigning ||
                autoAssigning ||
                !selectedOrder
              }
              onClick={autoAssignOrder}
            >
              {autoAssigning
                ? "Finding Agent..."
                : "⚡ Auto Assign"}
            </button>

          </div>

          {/* AUTO ASSIGN INFO */}

          <div
            style={{
              marginTop: "16px",
              padding: "14px 18px",
              borderRadius: "12px",
              background:
                "rgba(37, 99, 235, 0.06)",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            <strong>
              ⚡ Automatic Assignment:
            </strong>{" "}
            Select an order and click
            <strong> Auto Assign</strong>.
            The backend will select an
            available active delivery agent
            automatically.
          </div>

          {/* AVAILABLE AGENTS */}

          <div className="admin-agent-summary">

            <h3>
              Available Agents
            </h3>

            {agents.length === 0 ? (

              <div className="admin-no-agents">
                No delivery agents are
                currently available.
              </div>

            ) : (

              <div className="admin-agent-grid">

                {agents.map(
                  (agent) => (

                    <div
                      className="admin-agent-card"
                      key={agent.id}
                    >

                      <div className="admin-agent-avatar">

                        {(
                          agent.fullName ||
                          "A"
                        )
                          .charAt(0)
                          .toUpperCase()}

                      </div>

                      <div>

                        <strong>
                          {agent.fullName}
                        </strong>

                        <span>
                          {agent.email}
                        </span>

                        <small>
                          ● Available
                        </small>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </section>

        {/* ORDERS */}

        <section
          className="admin-section"
          id="orders"
        >

          <div className="admin-section-header">

            <div>

              <span className="admin-eyebrow">
                ORDER MANAGEMENT
              </span>

              <h2>
                Orders
              </h2>

            </div>

          </div>

          {/* FILTERS */}

          <div className="admin-filters">

            {[
              ["ALL", "All", counts.all],
              [
                "CREATED",
                "Created",
                counts.created,
              ],
              [
                "PICKED_UP",
                "Picked Up",
                counts.pickedUp,
              ],
              [
                "IN_TRANSIT",
                "In Transit",
                counts.transit,
              ],
              [
                "OUT_FOR_DELIVERY",
                "Out for Delivery",
                counts.outForDelivery,
              ],
              [
                "DELIVERED",
                "Delivered",
                counts.delivered,
              ],
            ].map(
              ([value, label, count]) => (

                <button
                  key={value}
                  className={
                    filter === value
                      ? "admin-filter active"
                      : "admin-filter"
                  }
                  onClick={() =>
                    setFilter(value)
                  }
                >

                  {label}

                  <span>
                    {count}
                  </span>

                </button>

              )
            )}

          </div>

          {/* ORDER LIST */}

          {filteredOrders.length === 0 ? (

            <div className="admin-empty">

              <div>
                📦
              </div>

              <h3>
                No orders found
              </h3>

              <p>
                There are no orders in
                this category.
              </p>

            </div>

          ) : (

            <div className="admin-orders">

              {filteredOrders.map(
                (order) => (

                  <div
                    className="admin-order-row"
                    key={order.id}
                  >

                    <div>

                      <span>
                        ORDER
                      </span>

                      <strong>
                        {order.orderNumber}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Customer
                      </span>

                      <strong>
                        #{order.customerId}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Amount
                      </span>

                      <strong>
                        ₹
                        {Number(
                          order.totalCharge ||
                            0
                        ).toFixed(2)}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Status
                      </span>

                      <strong
                        className={`admin-status ${statusClass(
                          order.status
                        )}`}
                      >
                        {formatStatus(
                          order.status
                        )}
                      </strong>

                    </div>

                    {order.status !==
                      "DELIVERED" &&
                      order.status !==
                        "FAILED" && (

                        <button
                          className="admin-select-order"
                          onClick={() => {

                            setSelectedOrder(
                              String(order.id)
                            );

                            setSelectedAgent("");

                            document
                              .getElementById(
                                "agents"
                              )
                              ?.scrollIntoView({
                                behavior:
                                  "smooth",
                              });

                          }}
                        >
                          Assign
                        </button>

                      )}

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;