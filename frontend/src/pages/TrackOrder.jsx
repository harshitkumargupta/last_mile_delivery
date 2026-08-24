import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api";

function TrackOrder({ token }) {

  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const track = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError("");
    setOrder(null);

    try {

      const response = await axios.get(
        `${API}/orders/number/${encodeURIComponent(orderNumber)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrder(response.data);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Order not found"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <div className="page-heading">

        <div>
          <span className="eyebrow">
            LIVE TRACKING
          </span>

          <h1>Track Your Delivery</h1>

          <p>
            Enter your order number to view delivery details.
          </p>
        </div>

      </div>

      <div className="tracking-search">

        <form onSubmit={track}>

          <input
            value={orderNumber}
            onChange={(e) =>
              setOrderNumber(e.target.value)
            }
            placeholder="Enter order number"
            required
          />

          <button
            className="primary-btn"
            disabled={loading}
          >
            {loading ? "Searching..." : "Track Order"}
          </button>

        </form>

      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {order && (

        <div className="tracking-card">

          <div className="tracking-header">

            <div>
              <span className="order-label">
                ORDER NUMBER
              </span>

              <h2>
                {order.orderNumber}
              </h2>
            </div>

            <span className="status-badge">
              {order.status}
            </span>

          </div>

          <div className="timeline">

            <div className="timeline-item completed">
              <div className="timeline-dot">
                ✓
              </div>

              <div>
                <strong>Order Created</strong>
                <p>Your order has been received.</p>
              </div>
            </div>

            <div
              className={
                order.status !== "CREATED"
                  ? "timeline-item completed"
                  : "timeline-item"
              }
            >
              <div className="timeline-dot">
                {order.status !== "CREATED" ? "✓" : "2"}
              </div>

              <div>
                <strong>Processing</strong>
                <p>
                  Package is being prepared for delivery.
                </p>
              </div>
            </div>

            <div
              className={
                [
                  "OUT_FOR_DELIVERY",
                  "DELIVERED",
                ].includes(order.status)
                  ? "timeline-item completed"
                  : "timeline-item"
              }
            >
              <div className="timeline-dot">
                {[
                  "OUT_FOR_DELIVERY",
                  "DELIVERED",
                ].includes(order.status)
                  ? "✓"
                  : "3"}
              </div>

              <div>
                <strong>Out for Delivery</strong>
                <p>
                  Delivery agent is heading to the destination.
                </p>
              </div>
            </div>

            <div
              className={
                order.status === "DELIVERED"
                  ? "timeline-item completed"
                  : "timeline-item"
              }
            >
              <div className="timeline-dot">
                {order.status === "DELIVERED"
                  ? "✓"
                  : "4"}
              </div>

              <div>
                <strong>Delivered</strong>
                <p>
                  Package delivered successfully.
                </p>
              </div>
            </div>

          </div>

          <div className="tracking-route">

            <div>
              <span>Pickup</span>
              <strong>
                {order.pickupAddress}
              </strong>
            </div>

            <div className="big-arrow">
              ↓
            </div>

            <div>
              <span>Destination</span>
              <strong>
                {order.dropAddress}
              </strong>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default TrackOrder;