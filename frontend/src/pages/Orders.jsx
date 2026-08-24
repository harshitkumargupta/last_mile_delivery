import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Orders.css";

const API = "http://localhost:8080/api";

function Orders({
  user,
  token,
  onBack,
  onViewOrder,
  onCreateOrder,
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  const loadingRef = useRef(false);

  // =========================================================
  // LOAD ORDERS
  // =========================================================

  const loadOrders = async (showLoading = false) => {
    try {
      const savedToken =
        token ||
        localStorage.getItem("token");

      const savedUser =
        user ||
        JSON.parse(
          localStorage.getItem("user") ||
          "null"
        );

      const customerId =
        savedUser?.userId ||
        savedUser?.id;

      if (!savedToken || !customerId) {
        setError("Please login again.");
        return;
      }

      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;

      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const response = await axios.get(
        `${API}/orders/customer/${customerId}`,
        {
          headers: {
            Authorization:
              `Bearer ${savedToken}`,
          },
        }
      );

      setOrders(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "LOAD ORDERS ERROR:",
        err
      );

      if (
        err.response?.status === 401
      ) {

        setError(
          "Your session has expired. Please login again."
        );

      } else if (
        err.response?.status === 403
      ) {

        setError(
          "You are not authorized to view these orders."
        );

      } else {

        setError(
          err.response?.data?.message ||
          "Unable to load orders."
        );
      }

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
  }, [user?.userId, user?.id, token]);

  // =========================================================
  // AUTO REFRESH EVERY 5 SECONDS
  // =========================================================

  useEffect(() => {

    const refreshOrders = () => {
      loadOrders(false);
    };

    const interval = setInterval(
      refreshOrders,
      5000
    );

    window.addEventListener(
      "focus",
      refreshOrders
    );

    return () => {

      clearInterval(interval);

      window.removeEventListener(
        "focus",
        refreshOrders
      );

    };

  }, [user?.userId, user?.id, token]);

  // =========================================================
  // OPEN TRACKING
  // =========================================================

  const openTracking = async (order) => {

    try {

      setTrackingOrder(order);
      setTrackingHistory([]);
      setTrackingError("");
      setTrackingLoading(true);

      const savedToken =
        token ||
        localStorage.getItem("token");

      const response =
        await axios.get(
          `${API}/orders/${order.id}/tracking`,
          {
            headers: {
              Authorization:
                `Bearer ${savedToken}`,
            },
          }
        );

      const history =
        Array.isArray(response.data)
          ? response.data
          : [];

      setTrackingHistory(history);

      // Use latest tracking status.
      if (history.length > 0) {

        const latest =
          history[history.length - 1];

        setTrackingOrder(
          (previous) => ({
            ...previous,
            status: latest.status,
          })
        );

        // Update order in list immediately.
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

      if (
        err.response?.status === 401
      ) {

        setTrackingError(
          "Your session has expired. Please login again."
        );

      } else if (
        err.response?.status === 403
      ) {

        setTrackingError(
          "You are not authorized to track this order."
        );

      } else {

        setTrackingError(
          err.response?.data?.message ||
          "Unable to load tracking information."
        );
      }

    } finally {

      setTrackingLoading(false);
    }
  };

  // =========================================================
  // CLOSE TRACKING
  // =========================================================

  const closeTracking = () => {
    setTrackingOrder(null);
    setTrackingHistory([]);
    setTrackingError("");
  };

  // =========================================================
  // STATUS
  // =========================================================

  const getStatusClass = (status) => {

    const value =
      String(status || "")
        .toUpperCase();

    if (value === "DELIVERED") {
      return "delivered";
    }

    if (
      value === "FAILED" ||
      value === "CANCELLED"
    ) {
      return "cancelled";
    }

    if (
      value === "OUT_FOR_DELIVERY" ||
      value === "IN_TRANSIT" ||
      value === "PICKED_UP"
    ) {
      return "transit";
    }

    return "created";
  };

  const formatStatus = (status) => {

    return String(
      status || "CREATED"
    )
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
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
  // TRACKING STEPS
  // =========================================================

  const trackingSteps = [
    "CREATED",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const getCurrentTrackingIndex = () => {

    if (!trackingOrder) {
      return -1;
    }

    const currentStatus =
      String(
        trackingOrder.status ||
        "CREATED"
      ).toUpperCase();

    return trackingSteps.indexOf(
      currentStatus
    );
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredOrders =
    filter === "ALL"
      ? orders
      : orders.filter(
          (order) =>
            String(
              order.status
            ).toUpperCase() ===
            filter
        );

  // =========================================================
  // STATS
  // =========================================================

  const activeOrders =
    orders.filter((order) =>
      [
        "CREATED",
        "ASSIGNED",
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
      ].includes(
        String(
          order.status
        ).toUpperCase()
      )
    ).length;

  const deliveredOrders =
    orders.filter(
      (order) =>
        String(
          order.status
        ).toUpperCase() ===
        "DELIVERED"
    ).length;

  const totalSpent =
    orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.totalCharge || 0
        ),
      0
    );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="orders-page">

      {/* HEADER */}

      <div className="orders-header">

        <div>

          <button
            className="orders-back-btn"
            onClick={onBack}
          >
            ← Dashboard
          </button>

          <span className="orders-eyebrow">
            DELIVERY HISTORY
          </span>

          <h1>
            My Orders
          </h1>

          <p>
            Track and manage all your deliveries
            from one place.
          </p>

        </div>

        <div className="orders-header-actions">

          <button
            className="orders-refresh-btn"
            onClick={() =>
              loadOrders(true)
            }
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "↻ Refresh"}
          </button>

          <button
            className="orders-create-btn"
            onClick={onCreateOrder}
          >
            + Create New Order
          </button>

        </div>

      </div>

      {/* SUMMARY */}

      <div className="orders-summary">

        <div className="summary-card">

          <div className="summary-icon blue">
            📦
          </div>

          <div>
            <span>
              Total Orders
            </span>

            <strong>
              {orders.length}
            </strong>
          </div>

        </div>

        <div className="summary-card">

          <div className="summary-icon orange">
            🚚
          </div>

          <div>
            <span>
              Active
            </span>

            <strong>
              {activeOrders}
            </strong>
          </div>

        </div>

        <div className="summary-card">

          <div className="summary-icon green">
            ✓
          </div>

          <div>
            <span>
              Delivered
            </span>

            <strong>
              {deliveredOrders}
            </strong>
          </div>

        </div>

        <div className="summary-card">

          <div className="summary-icon purple">
            ₹
          </div>

          <div>
            <span>
              Total Spent
            </span>

            <strong>
              ₹{totalSpent.toFixed(0)}
            </strong>
          </div>

        </div>

      </div>

      {/* FILTERS */}

      <div className="orders-toolbar">

        <div>

          <h2>
            Your Deliveries
          </h2>

          <p>
            {filteredOrders.length} order
            {filteredOrders.length !== 1
              ? "s"
              : ""}
          </p>

        </div>

        <div className="order-filters">

          {[
            ["ALL", "All"],
            ["CREATED", "Created"],
            ["PICKED_UP", "Picked Up"],
            ["IN_TRANSIT", "In Transit"],
            [
              "OUT_FOR_DELIVERY",
              "Out for Delivery",
            ],
            ["DELIVERED", "Delivered"],
          ].map(
            ([value, label]) => (

              <button
                key={value}
                className={
                  filter === value
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() =>
                  setFilter(value)
                }
              >
                {label}
              </button>

            )
          )}

        </div>

      </div>

      {/* ERROR */}

      {error && (

        <div className="orders-error">

          <span>!</span>

          <div>

            <strong>
              Unable to load orders
            </strong>

            <p>
              {error}
            </p>

          </div>

        </div>

      )}

      {/* LOADING */}

      {loading && (

        <div className="orders-loading">

          <div className="loading-spinner"></div>

          <h3>
            Loading your orders...
          </h3>

          <p>
            Please wait a moment.
          </p>

        </div>

      )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        filteredOrders.length === 0 && (

          <div className="orders-empty">

            <div className="empty-package">
              📦
            </div>

            <h2>
              {orders.length === 0
                ? "No orders yet"
                : "No orders found"}
            </h2>

            <p>
              {orders.length === 0
                ? "Create your first delivery order to get started."
                : "Try selecting another filter."}
            </p>

            {orders.length === 0 && (

              <button
                className="orders-create-btn"
                onClick={onCreateOrder}
              >
                + Create Your First Order
              </button>

            )}

          </div>

        )}

      {/* ORDERS */}

      {!loading &&
        filteredOrders.length > 0 && (

          <div className="orders-grid">

            {filteredOrders.map(
              (order) => {

                const statusClass =
                  getStatusClass(
                    order.status
                  );

                return (

                  <div
                    className="order-card"
                    key={order.id}
                  >

                    {/* TOP */}

                    <div className="order-card-top">

                      <div>

                        <span className="order-small-label">
                          ORDER NUMBER
                        </span>

                        <h3>
                          {order.orderNumber}
                        </h3>

                      </div>

                      <span
                        className={`order-status ${statusClass}`}
                      >

                        <span className="status-dot"></span>

                        {formatStatus(
                          order.status
                        )}

                      </span>

                    </div>

                    {/* ROUTE */}

                    <div className="order-route">

                      <div className="route-location">

                        <span className="route-marker pickup">
                          ●
                        </span>

                        <div>

                          <small>
                            PICKUP
                          </small>

                          <strong>
                            {order.pickupAddress}
                          </strong>

                        </div>

                      </div>

                      <div className="route-line">
                        <span></span>
                      </div>

                      <div className="route-location">

                        <span className="route-marker delivery">
                          ●
                        </span>

                        <div>

                          <small>
                            DELIVERY
                          </small>

                          <strong>
                            {order.dropAddress}
                          </strong>

                        </div>

                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="order-info">

                      <div>

                        <span>
                          Order Type
                        </span>

                        <strong>
                          {order.orderType ||
                            "STANDARD"}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Weight
                        </span>

                        <strong>
                          {order.actualWeight ||
                            "-"}{" "}
                          kg
                        </strong>

                      </div>

                      <div>

                        <span>
                          Payment
                        </span>

                        <strong>
                          {order.paymentType ||
                            "-"}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Total
                        </span>

                        <strong className="order-price">
                          ₹
                          {Number(
                            order.totalCharge ||
                            0
                          ).toFixed(2)}
                        </strong>

                      </div>

                    </div>

                    {/* FOOTER */}

                    <div className="order-card-footer">

                      <span>

                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "Recently created"}

                      </span>

                      <div className="order-actions">

                        <button
                          className="track-order-btn"
                          onClick={() =>
                            openTracking(order)
                          }
                        >
                          Track →
                        </button>

                        <button
                          className="view-order-btn"
                          onClick={() =>
                            onViewOrder &&
                            onViewOrder(order)
                          }
                        >
                          View Details →
                        </button>

                      </div>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      {/* TRACKING MODAL */}

      {trackingOrder && (

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

            <button
              className="tracking-close"
              onClick={closeTracking}
            >
              ×
            </button>

            <div className="tracking-header">

              <span className="orders-eyebrow">
                LIVE TRACKING
              </span>

              <h2>
                Your Delivery
              </h2>

              <div className="tracking-order-number">
                {trackingOrder.orderNumber}
              </div>

            </div>

            <div className="tracking-route-summary">

              <div>

                <span>
                  FROM
                </span>

                <strong>
                  {trackingOrder.pickupAddress}
                </strong>

              </div>

              <div className="tracking-route-arrow">
                →
              </div>

              <div>

                <span>
                  TO
                </span>

                <strong>
                  {trackingOrder.dropAddress}
                </strong>

              </div>

            </div>

            {trackingLoading && (

              <div className="tracking-loading">

                <div className="loading-spinner"></div>

                <h3>
                  Loading tracking...
                </h3>

              </div>

            )}

            {trackingError && (

              <div className="orders-error">

                <span>!</span>

                <div>

                  <strong>
                    Tracking unavailable
                  </strong>

                  <p>
                    {trackingError}
                  </p>

                </div>

              </div>

            )}

            {!trackingLoading &&
              !trackingError && (

                <div className="tracking-content">

                  <div className="tracking-current">

                    <span>
                      CURRENT STATUS
                    </span>

                    <strong>
                      {formatStatus(
                        trackingHistory.length > 0
                          ? trackingHistory[
                              trackingHistory.length - 1
                            ].status
                          : trackingOrder.status
                      )}
                    </strong>

                  </div>

                  <div className="tracking-timeline">

                    {trackingSteps.map(
                      (step, index) => {

                        const historyItem =
                          trackingHistory.find(
                            (item) =>
                              String(
                                item.status
                              ).toUpperCase() ===
                              step
                          );

                        const currentIndex =
                          getCurrentTrackingIndex();

                        const completed =
                          index <=
                          currentIndex;

                        const isCurrent =
                          index ===
                          currentIndex;

                        return (

                          <div
                            className={
                              completed
                                ? "timeline-item completed"
                                : "timeline-item"
                            }
                            key={step}
                          >

                            <div className="timeline-marker">

                              {completed
                                ? "✓"
                                : index + 1}

                            </div>

                            {index <
                              trackingSteps.length -
                                1 && (

                              <div
                                className={
                                  index <
                                  currentIndex
                                    ? "timeline-line completed"
                                    : "timeline-line"
                                }
                              ></div>

                            )}

                            <div className="timeline-content">

                              <h3>

                                {formatStatus(
                                  step
                                )}

                                {isCurrent && (
                                  <span className="current-label">
                                    CURRENT
                                  </span>
                                )}

                              </h3>

                              {historyItem ? (

                                <>

                                  <p>
                                    {historyItem.remarks ||
                                      "Status updated"}
                                  </p>

                                  <small>
                                    {formatDate(
                                      historyItem.timestamp
                                    )}
                                  </small>

                                  {historyItem.actorName && (

                                    <small>
                                      Updated by{" "}
                                      {historyItem.actorName}
                                    </small>

                                  )}

                                </>

                              ) : (

                                <p className="timeline-waiting">
                                  Waiting for this stage
                                </p>

                              )}

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                </div>

              )}

            <div className="tracking-footer">

              <button
                className="orders-refresh-btn"
                onClick={() =>
                  openTracking(
                    trackingOrder
                  )
                }
              >
                ↻ Refresh Tracking
              </button>

              <button
                className="orders-create-btn"
                onClick={() => {

                  closeTracking();

                  if (onViewOrder) {
                    onViewOrder(
                      trackingOrder
                    );
                  }

                }}
              >
                View Full Details
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Orders;