import { useEffect, useRef, useState } from "react";
import "./Dashboard.css";

const API = "http://localhost:8080/api";

function Dashboard({
  user,
  onLogout,
  onCreateOrder,
  onViewOrder,
  onOrders,
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [moreOpen, setMoreOpen] = useState(false);

  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  const loadingRef = useRef(false);

  // =========================================================
  // LOAD CUSTOMER ORDERS
  // =========================================================

  const loadOrders = async (showLoading = false) => {
    const token = localStorage.getItem("token");

    const customerId =
      user?.userId ||
      user?.id;

    if (!token || !customerId) {
      setError("Please login again.");
      return;
    }

    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;

      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API}/orders/customer/${customerId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();

        throw new Error(
          text ||
          `Request failed: ${response.status}`
        );
      }

      const data = await response.json();

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {
      console.error(
        "CUSTOMER ORDERS ERROR:",
        err
      );

      setError(
        err.message ||
        "Unable to load your orders."
      );

    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadOrders(true);
  }, [user?.userId, user?.id]);

  // =========================================================
  // AUTO REFRESH EVERY 5 SECONDS
  // =========================================================

  useEffect(() => {
    const refresh = () => {
      loadOrders(false);
    };

    const interval = setInterval(
      refresh,
      5000
    );

    window.addEventListener(
      "focus",
      refresh
    );

    return () => {
      clearInterval(interval);

      window.removeEventListener(
        "focus",
        refresh
      );
    };
  }, [user?.userId, user?.id]);

  // =========================================================
  // ORDER STATS
  // =========================================================

  const activeOrders = orders.filter(
    (order) => {
      const status =
        String(
          order.status || ""
        ).toUpperCase();

      return (
        status !== "DELIVERED" &&
        status !== "FAILED"
      );
    }
  );

  const deliveredOrders = orders.filter(
    (order) =>
      String(
        order.status || ""
      ).toUpperCase() === "DELIVERED"
  );

  const totalSpent = orders.reduce(
    (total, order) =>
      total +
      Number(
        order.totalCharge || 0
      ),
    0
  );

  // =========================================================
  // STATUS HELPERS
  // =========================================================

  const statusClass = (status) =>
    String(
      status || "CREATED"
    )
      .toLowerCase()
      .replace(/_/g, "-");

  const statusText = (status) =>
    String(
      status || "CREATED"
    )
      .replace(/_/g, " ");

  // =========================================================
  // TRACKING
  // =========================================================

  const openTracking = async () => {
    await loadOrders(false);

    setTrackingOpen(true);
    setTrackingOrder(null);
    setTrackingHistory([]);
    setTrackingError("");
  };

  const closeTracking = () => {
    setTrackingOpen(false);
    setTrackingOrder(null);
    setTrackingHistory([]);
    setTrackingError("");
  };

  // =========================================================
  // LOAD TRACKING
  // =========================================================

  const selectTrackingOrder = async (order) => {
    setTrackingOrder(order);
    setTrackingHistory([]);
    setTrackingError("");
    setTrackingLoading(true);

    const token =
      localStorage.getItem("token");

    if (!token) {
      setTrackingError(
        "Your session has expired. Please login again."
      );

      setTrackingLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API}/orders/${order.id}/tracking`,
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
          `Tracking request failed: ${response.status}`
        );
      }

      const data =
        await response.json();

      const history =
        Array.isArray(data)
          ? data
          : [];

      setTrackingHistory(history);

      // Always use latest tracking status
      // if tracking history exists.
      if (history.length > 0) {
        const latest =
          history[history.length - 1];

        setTrackingOrder(
          (previous) => ({
            ...previous,
            status: latest.status,
          })
        );

        // Also update main orders state
        // immediately.
        setOrders(
          (previousOrders) =>
            previousOrders.map(
              (item) =>
                item.id === order.id
                  ? {
                      ...item,
                      status:
                        latest.status,
                    }
                  : item
            )
        );
      }

    } catch (err) {
      console.error(
        "TRACKING ERROR:",
        err
      );

      setTrackingError(
        err.message ||
        "Unable to load tracking history."
      );

    } finally {
      setTrackingLoading(false);
    }
  };

  // =========================================================
  // CURRENT TRACKING STATUS
  // =========================================================

  const getCurrentStatus = () => {
    if (!trackingOrder) {
      return "CREATED";
    }

    if (trackingHistory.length > 0) {
      return trackingHistory[
        trackingHistory.length - 1
      ].status;
    }

    return (
      trackingOrder.status ||
      "CREATED"
    );
  };

  // =========================================================
  // TRACKING STEP
  // =========================================================

  const getTrackingStep = (status) => {
    switch (
      String(status || "")
        .toUpperCase()
    ) {
      case "CREATED":
        return 1;

      case "PICKED_UP":
        return 2;

      case "IN_TRANSIT":
        return 3;

      case "OUT_FOR_DELIVERY":
        return 4;

      case "DELIVERED":
        return 5;

      case "FAILED":
        return 0;

      case "RESCHEDULED":
        return 1;

      default:
        return 1;
    }
  };

  // =========================================================
  // DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="dashboard">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-logo">
            LM
          </div>

          <div className="brand-text">
            <strong>
              Last-Mile
            </strong>

            <span>
              Delivery Platform
            </span>
          </div>

        </div>

        <div className="menu-label">
          CUSTOMER
        </div>

        <nav className="navigation">

          <button
            className="nav-item active"
          >
            <span className="nav-icon">
              ⌂
            </span>

            <span>
              Dashboard
            </span>
          </button>

          <button
            className="nav-item"
            onClick={onCreateOrder}
          >
            <span className="nav-icon">
              ＋
            </span>

            <span>
              Create Order
            </span>
          </button>

          <button
            className="nav-item"
            onClick={onOrders}
          >
            <span className="nav-icon">
              ▣
            </span>

            <span>
              My Orders
            </span>
          </button>

          <button
            className="nav-item"
            onClick={openTracking}
          >
            <span className="nav-icon">
              ⌖
            </span>

            <span>
              Track Delivery
            </span>
          </button>

        </nav>

        {/* MORE */}

        <button
          className={`more-button ${
            moreOpen ? "open" : ""
          }`}
          onClick={() =>
            setMoreOpen(!moreOpen)
          }
        >

          <span className="nav-icon">
            •••
          </span>

          <span>
            More
          </span>

          <span className="more-arrow">
            {moreOpen
              ? "⌃"
              : "⌄"}
          </span>

        </button>

        {moreOpen && (
          <div className="more-menu">

            <button className="more-item">
              <span>👤</span>
              Profile
            </button>

            <button className="more-item">
              <span>⚙</span>
              Settings
            </button>

            <button className="more-item">
              <span>?</span>
              Help & Support
            </button>

            <button
              className="more-item logout-item"
              onClick={onLogout}
            >
              <span>↪</span>
              Logout
            </button>

          </div>
        )}

        {/* SUPPORT */}

        <div className="support-card">

          <div className="support-top">

            <div className="support-circle">
              ?
            </div>

            <span>
              Support
            </span>

          </div>

          <h4>
            Need help?
          </h4>

          <p>
            Our delivery team is here for you.
          </p>

          <button>
            Contact Support
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="main">

        {/* HEADER */}

        <header className="header">

          <div className="mobile-title">
            Last-Mile
          </div>

          <div className="header-right">

            <div className="user-info">

              <div className="online"></div>

              <div>

                <strong>
                  {user?.fullName ||
                    "Customer"}
                </strong>

                <span>
                  Customer
                </span>

              </div>

            </div>

            <button
              className="header-logout"
              onClick={onLogout}
            >
              Logout
            </button>

          </div>

        </header>

        {/* CONTENT */}

        <div className="content">

          {/* HERO */}

          <section className="hero">

            <div className="hero-text">

              <span className="eyebrow">
                CUSTOMER DASHBOARD
              </span>

              <h1>
                Welcome back,{" "}
                {user?.fullName ||
                  "Customer"}{" "}
                👋
              </h1>

              <p>
                Manage your deliveries, orders
                and shipments from one place.
              </p>

            </div>

            <button
              className="primary-button"
              onClick={onCreateOrder}
            >
              ＋ Create New Order
            </button>

          </section>

          {/* STATS */}

          <section className="stats">

            <div className="stat-card">

              <div className="stat-icon blue">
                📦
              </div>

              <div className="stat-content">

                <span>
                  Total Orders
                </span>

                <strong>
                  {orders.length}
                </strong>

                <small>
                  All time orders
                </small>

              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon orange">
                🚚
              </div>

              <div className="stat-content">

                <span>
                  Active Deliveries
                </span>

                <strong>
                  {activeOrders.length}
                </strong>

                <small>
                  Currently in progress
                </small>

              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon green">
                ✓
              </div>

              <div className="stat-content">

                <span>
                  Delivered
                </span>

                <strong>
                  {deliveredOrders.length}
                </strong>

                <small>
                  Successfully delivered
                </small>

              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon purple">
                ₹
              </div>

              <div className="stat-content">

                <span>
                  Total Spent
                </span>

                <strong>
                  ₹{totalSpent.toFixed(0)}
                </strong>

                <small>
                  Across all orders
                </small>

              </div>

            </div>

          </section>

          {/* RECENT ORDERS */}

          <section className="orders-card">

            <div className="orders-header">

              <div>

                <span className="section-label">
                  DELIVERY ACTIVITY
                </span>

                <h2>
                  Recent Orders
                </h2>

                <p>
                  Track your latest shipments
                </p>

              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                }}
              >

                <button
                  className="refresh"
                  onClick={onOrders}
                >
                  View All →
                </button>

                <button
                  className="refresh"
                  onClick={() =>
                    loadOrders(true)
                  }
                  disabled={loading}
                >
                  {loading
                    ? "Loading..."
                    : "↻ Refresh"}
                </button>

              </div>

            </div>

            {error && (
              <div className="error-box">

                <span>!</span>

                {error}

              </div>
            )}

            {!loading &&
            orders.length === 0 ? (

              <div className="empty">

                <div className="empty-icon">
                  📦
                </div>

                <h3>
                  No orders yet
                </h3>

                <p>
                  Create your first delivery
                  to get started.
                </p>

                <button
                  className="primary-button"
                  onClick={onCreateOrder}
                >
                  ＋ Create Order
                </button>

              </div>

            ) : (

              <div className="orders-list">

                {orders
                  .slice(0, 6)
                  .map((order) => (

                    <div
                      className="order"
                      key={order.id}
                    >

                      <div className="order-box-icon">
                        📦
                      </div>

                      <div className="order-main">

                        <strong>
                          {order.orderNumber}
                        </strong>

                        <div className="route">

                          <span>
                            {order.pickupAddress}
                          </span>

                          <b>
                            →
                          </b>

                          <span>
                            {order.dropAddress}
                          </span>

                        </div>

                      </div>

                      <div className="order-status">

                        <span
                          className={`badge ${statusClass(
                            order.status
                          )}`}
                        >

                          <i></i>

                          {statusText(
                            order.status
                          )}

                        </span>

                      </div>

                      <div className="order-total">

                        <strong>
                          ₹
                          {Number(
                            order.totalCharge ||
                            0
                          ).toFixed(0)}
                        </strong>

                        <button
                          onClick={() =>
                            onViewOrder(order)
                          }
                        >
                          View →
                        </button>

                      </div>

                    </div>

                  ))}

              </div>

            )}

          </section>

          {/* QUICK ACTIONS */}

          <section className="quick">

            <div className="quick-title">

              <span>
                QUICK ACTIONS
              </span>

              <h2>
                What would you like to do?
              </h2>

            </div>

            <div className="quick-grid">

              <button
                onClick={onCreateOrder}
              >

                <div className="quick-icon blue">
                  ＋
                </div>

                <div>
                  <strong>
                    New Delivery
                  </strong>

                  <span>
                    Create a delivery order
                  </span>
                </div>

                <b>
                  →
                </b>

              </button>

              <button
                onClick={openTracking}
              >

                <div className="quick-icon green">
                  ⌖
                </div>

                <div>
                  <strong>
                    Track Delivery
                  </strong>

                  <span>
                    Follow your shipment
                  </span>
                </div>

                <b>
                  →
                </b>

              </button>

              <button
                onClick={onOrders}
              >

                <div className="quick-icon purple">
                  ☷
                </div>

                <div>
                  <strong>
                    Order History
                  </strong>

                  <span>
                    View all previous deliveries
                  </span>
                </div>

                <b>
                  →
                </b>

              </button>

            </div>

          </section>

        </div>

      </main>

      {/* TRACKING MODAL */}

      {trackingOpen && (

        <div
          className="tracking-overlay"
          onClick={closeTracking}
        >

          <div
            className="tracking-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="tracking-header">

              <div>

                <span>
                  LIVE TRACKING
                </span>

                <h2>
                  {trackingOrder
                    ? trackingOrder.orderNumber
                    : "Your Deliveries"}
                </h2>

              </div>

              <button
                className="tracking-close"
                onClick={closeTracking}
              >
                ×
              </button>

            </div>

            {!trackingOrder && (

              <>

                <div className="tracking-status">

                  <span className="section-label">
                    YOUR DELIVERIES
                  </span>

                  <h3>
                    Select an order to track
                  </h3>

                </div>

                {orders.length === 0 ? (

                  <div className="empty">

                    <div className="empty-icon">
                      📦
                    </div>

                    <h3>
                      No orders found
                    </h3>

                    <p>
                      Create an order first.
                    </p>

                  </div>

                ) : (

                  <div className="tracking-order-list">

                    {orders.map((order) => (

                      <button
                        key={order.id}
                        className="tracking-order-item"
                        onClick={() =>
                          selectTrackingOrder(order)
                        }
                      >

                        <div className="tracking-order-icon">
                          📦
                        </div>

                        <div className="tracking-order-main">

                          <strong>
                            {order.orderNumber}
                          </strong>

                          <span>
                            {order.pickupAddress}
                          </span>

                          <b>
                            ↓
                          </b>

                          <span>
                            {order.dropAddress}
                          </span>

                        </div>

                        <div className="tracking-order-right">

                          <span
                            className={`badge ${statusClass(
                              order.status
                            )}`}
                          >

                            <i></i>

                            {statusText(
                              order.status
                            )}

                          </span>

                          <strong>
                            ₹
                            {Number(
                              order.totalCharge ||
                              0
                            ).toFixed(0)}
                          </strong>

                          <span>
                            Track →
                          </span>

                        </div>

                      </button>

                    ))}

                  </div>

                )}

              </>

            )}

            {trackingOrder && (

              <>

                <button
                  className="tracking-back"
                  onClick={() => {
                    setTrackingOrder(null);
                    setTrackingHistory([]);
                    setTrackingError("");
                  }}
                >
                  ← Back to all deliveries
                </button>

                <div className="tracking-route">

                  <div className="tracking-location">

                    <div className="tracking-dot pickup">
                      ●
                    </div>

                    <div>

                      <small>
                        PICKUP
                      </small>

                      <strong>
                        {trackingOrder.pickupAddress}
                      </strong>

                    </div>

                  </div>

                  <div className="tracking-line"></div>

                  <div className="tracking-location">

                    <div className="tracking-dot delivery">
                      ●
                    </div>

                    <div>

                      <small>
                        DELIVERY
                      </small>

                      <strong>
                        {trackingOrder.dropAddress}
                      </strong>

                    </div>

                  </div>

                </div>

                {trackingLoading && (

                  <div className="tracking-loading">

                    <div className="loading-spinner"></div>

                    <h3>
                      Loading tracking history...
                    </h3>

                    <p>
                      Getting the latest shipment updates.
                    </p>

                  </div>

                )}

                {trackingError && (

                  <div className="error-box">

                    <span>!</span>

                    {trackingError}

                  </div>

                )}

                {!trackingLoading && (

                  <>

                    <div className="tracking-status">

                      <span className="section-label">
                        CURRENT STATUS
                      </span>

                      <h3>
                        {statusText(
                          getCurrentStatus()
                        )}
                      </h3>

                    </div>

                    <div className="tracking-progress">

                      {[
                        "Order Created",
                        "Picked Up",
                        "In Transit",
                        "Out for Delivery",
                        "Delivered",
                      ].map(
                        (step, index) => {

                          const stepNumber =
                            index + 1;

                          const currentStep =
                            getTrackingStep(
                              getCurrentStatus()
                            );

                          const completed =
                            currentStep >=
                            stepNumber;

                          return (

                            <div
                              key={step}
                              className={
                                completed
                                  ? "tracking-step completed"
                                  : "tracking-step"
                              }
                            >

                              <div className="step-circle">

                                {completed
                                  ? "✓"
                                  : stepNumber}

                              </div>

                              <span>
                                {step}
                              </span>

                            </div>

                          );
                        }
                      )}

                    </div>

                    <div className="tracking-history">

                      <div className="tracking-history-header">

                        <span className="section-label">
                          TRACKING HISTORY
                        </span>

                        <strong>
                          {trackingHistory.length} update
                          {trackingHistory.length !== 1
                            ? "s"
                            : ""}
                        </strong>

                      </div>

                      {trackingHistory.length === 0 ? (

                        <div className="tracking-no-history">

                          <div>
                            ⏳
                          </div>

                          <strong>
                            No tracking updates yet
                          </strong>

                          <span>
                            Your order is currently{" "}
                            {statusText(
                              trackingOrder.status
                            )}
                            .
                          </span>

                        </div>

                      ) : (

                        <div className="tracking-history-list">

                          {trackingHistory
                            .slice()
                            .reverse()
                            .map(
                              (
                                history,
                                index
                              ) => (

                                <div
                                  className="tracking-history-item"
                                  key={
                                    history.id ||
                                    `${history.status}-${index}`
                                  }
                                >

                                  <div className="history-dot">
                                    ✓
                                  </div>

                                  <div className="history-content">

                                    <div className="history-top">

                                      <strong>
                                        {statusText(
                                          history.status
                                        )}
                                      </strong>

                                      <span>
                                        {formatDate(
                                          history.timestamp
                                        )}
                                      </span>

                                    </div>

                                    <p>
                                      {history.remarks ||
                                        "Shipment status updated."}
                                    </p>

                                    {history.actorName && (

                                      <small>
                                        Updated by{" "}
                                        {history.actorName}
                                      </small>

                                    )}

                                  </div>

                                </div>

                              )
                            )}

                        </div>

                      )}

                    </div>

                    <div className="tracking-info">

                      <div>

                        <span>
                          Order Type
                        </span>

                        <strong>
                          {trackingOrder.orderType ||
                            "-"}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Payment
                        </span>

                        <strong>
                          {trackingOrder.paymentType ||
                            "-"}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Weight
                        </span>

                        <strong>
                          {trackingOrder.actualWeight ||
                            0}{" "}
                          kg
                        </strong>

                      </div>

                      <div>

                        <span>
                          Total
                        </span>

                        <strong>
                          ₹
                          {Number(
                            trackingOrder.totalCharge ||
                            0
                          ).toFixed(2)}
                        </strong>

                      </div>

                    </div>

                    <div className="tracking-footer">

                      <button
                        className="secondary-btn"
                        onClick={() => {
                          closeTracking();

                          onViewOrder(
                            trackingOrder
                          );
                        }}
                      >
                        View Full Order
                      </button>

                      <button
                        className="primary-button"
                        onClick={closeTracking}
                      >
                        Done
                      </button>

                    </div>

                  </>

                )}

              </>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default Dashboard;