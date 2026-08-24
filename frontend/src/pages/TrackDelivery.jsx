import { useEffect, useState } from "react";
import axios from "axios";
import "./TrackDelivery.css";

const API = "http://localhost:8080/api";

function TrackDelivery({
  user,
  token,
  onBack,
  onViewOrder,
}) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const authToken =
        token || localStorage.getItem("token");

      const response = await axios.get(
        `${API}/orders/customer/${user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setOrders(data);

      if (data.length > 0) {
        setSelectedOrder(data[0]);
      }

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to load your deliveries."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const statusSteps = [
    {
      key: "CREATED",
      title: "Order Created",
      description:
        "Your delivery order has been created.",
    },
    {
      key: "ASSIGNED",
      title: "Agent Assigned",
      description:
        "A delivery agent has been assigned.",
    },
    {
      key: "PICKED_UP",
      title: "Package Picked Up",
      description:
        "Your package has been collected.",
    },
    {
      key: "IN_TRANSIT",
      title: "In Transit",
      description:
        "Your package is on its way.",
    },
    {
      key: "OUT_FOR_DELIVERY",
      title: "Out for Delivery",
      description:
        "Your package is out for delivery.",
    },
    {
      key: "DELIVERED",
      title: "Delivered",
      description:
        "Your package has been successfully delivered.",
    },
  ];

  const getCurrentStep = (status) => {
    const current = String(
      status || "CREATED"
    ).toUpperCase();

    const index = statusSteps.findIndex(
      (step) => step.key === current
    );

    return index === -1 ? 0 : index;
  };

  const formatStatus = (status) => {
    return String(status || "CREATED")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  if (loading) {
    return (
      <div className="tracking-page">
        <div className="tracking-loading">
          <div className="tracking-spinner"></div>

          <h2>
            Loading deliveries...
          </h2>

          <p>
            Please wait while we fetch your orders.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-page">

      {/* HEADER */}

      <div className="tracking-header">

        <div>
          <button
            className="tracking-back"
            onClick={onBack}
          >
            ← Dashboard
          </button>

          <span className="tracking-eyebrow">
            DELIVERY TRACKING
          </span>

          <h1>
            Track Delivery
          </h1>

          <p>
            Follow the progress of your shipment.
          </p>
        </div>

        <button
          className="tracking-refresh"
          onClick={loadOrders}
        >
          ↻ Refresh
        </button>

      </div>

      {error && (
        <div className="tracking-error">
          <strong>
            Unable to load deliveries
          </strong>

          <span>
            {error}
          </span>
        </div>
      )}

      {orders.length === 0 && !error ? (

        <div className="tracking-empty">

          <div className="tracking-empty-icon">
            📦
          </div>

          <h2>
            No deliveries yet
          </h2>

          <p>
            Create an order first to start tracking
            your delivery.
          </p>

        </div>

      ) : (

        <div className="tracking-layout">

          {/* ORDER SELECTOR */}

          <aside className="tracking-orders">

            <div className="tracking-orders-heading">
              <span>
                YOUR ORDERS
              </span>

              <strong>
                {orders.length}
              </strong>
            </div>

            <div className="tracking-order-list">

              {orders.map((order) => (

                <button
                  key={order.id}
                  className={
                    selectedOrder?.id === order.id
                      ? "tracking-order active"
                      : "tracking-order"
                  }
                  onClick={() =>
                    setSelectedOrder(order)
                  }
                >

                  <div className="tracking-order-icon">
                    📦
                  </div>

                  <div className="tracking-order-info">

                    <strong>
                      {order.orderNumber}
                    </strong>

                    <span>
                      {order.dropAddress}
                    </span>

                  </div>

                  <span
                    className={`tracking-mini-status ${
                      String(
                        order.status || ""
                      ).toLowerCase()
                    }`}
                  >
                    {formatStatus(order.status)}
                  </span>

                </button>

              ))}

            </div>

          </aside>

          {/* SELECTED ORDER */}

          {selectedOrder && (

            <main className="tracking-main">

              {/* ORDER HEADER */}

              <section className="tracking-order-header">

                <div>

                  <span>
                    ORDER NUMBER
                  </span>

                  <h2>
                    {selectedOrder.orderNumber}
                  </h2>

                </div>

                <div className="current-status">

                  <span className="status-dot"></span>

                  {formatStatus(
                    selectedOrder.status
                  )}

                </div>

              </section>

              {/* ROUTE */}

              <section className="tracking-route">

                <div className="route-point">

                  <div className="route-icon pickup">
                    ●
                  </div>

                  <div>
                    <span>
                      PICKUP
                    </span>

                    <strong>
                      {selectedOrder.pickupAddress}
                    </strong>
                  </div>

                </div>

                <div className="route-line"></div>

                <div className="route-point">

                  <div className="route-icon delivery">
                    ●
                  </div>

                  <div>
                    <span>
                      DELIVERY
                    </span>

                    <strong>
                      {selectedOrder.dropAddress}
                    </strong>
                  </div>

                </div>

              </section>

              {/* PROGRESS */}

              <section className="tracking-progress">

                <div className="tracking-section-title">

                  <div>
                    <span>
                      DELIVERY STATUS
                    </span>

                    <h3>
                      Shipment Progress
                    </h3>
                  </div>

                  <strong>
                    {Math.round(
                      ((
                        getCurrentStep(
                          selectedOrder.status
                        ) + 1
                      ) /
                        statusSteps.length) *
                        100
                    )}
                    %
                  </strong>

                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        (
                          (
                            getCurrentStep(
                              selectedOrder.status
                            ) + 1
                          ) /
                          statusSteps.length
                        ) * 100
                      }%`,
                    }}
                  ></div>
                </div>

                <div className="timeline">

                  {statusSteps.map(
                    (step, index) => {

                      const currentStep =
                        getCurrentStep(
                          selectedOrder.status
                        );

                      const completed =
                        index <= currentStep;

                      const current =
                        index === currentStep;

                      return (
                        <div
                          className={
                            completed
                              ? "timeline-item completed"
                              : "timeline-item"
                          }
                          key={step.key}
                        >

                          <div className="timeline-marker">

                            {completed
                              ? "✓"
                              : index + 1}

                          </div>

                          <div className="timeline-content">

                            <strong>
                              {step.title}
                            </strong>

                            <span>
                              {current
                                ? formatStatus(
                                    selectedOrder.status
                                  )
                                : step.description}
                            </span>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </section>

              {/* DETAILS */}

              <section className="tracking-details">

                <div className="tracking-details-header">
                  <span>
                    PACKAGE INFORMATION
                  </span>

                  <h3>
                    Shipment Details
                  </h3>
                </div>

                <div className="details-grid">

                  <div>
                    <span>
                      Order Type
                    </span>

                    <strong>
                      {selectedOrder.orderType ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Payment
                    </span>

                    <strong>
                      {selectedOrder.paymentType ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Actual Weight
                    </span>

                    <strong>
                      {selectedOrder.actualWeight ||
                        0}{" "}
                      kg
                    </strong>
                  </div>

                  <div>
                    <span>
                      Chargeable Weight
                    </span>

                    <strong>
                      {selectedOrder.chargeableWeight ||
                        0}{" "}
                      kg
                    </strong>
                  </div>

                  <div>
                    <span>
                      Base Charge
                    </span>

                    <strong>
                      ₹
                      {Number(
                        selectedOrder.baseCharge || 0
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Total Charge
                    </span>

                    <strong className="tracking-total">
                      ₹
                      {Number(
                        selectedOrder.totalCharge || 0
                      ).toFixed(2)}
                    </strong>
                  </div>

                </div>

              </section>

              {/* VIEW DETAILS */}

              <button
                className="full-details-button"
                onClick={() =>
                  onViewOrder(selectedOrder)
                }
              >
                View Complete Order Details →
              </button>

            </main>

          )}

        </div>
      )}

    </div>
  );
}

export default TrackDelivery;