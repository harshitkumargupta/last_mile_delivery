import { useEffect, useState } from "react";
import axios from "axios";
import "./Tracking.css";

const API = "http://localhost:8080/api";

function Tracking({ order, onBack }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const statuses = [
    "CREATED",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const loadTracking = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/orders/${order.id}/tracking`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistory(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to load tracking history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracking();
  }, [order.id]);

  const updateStatus = async (status) => {
    try {
      setUpdating(true);
      setError("");

      await axios.patch(
        `${API}/orders/${order.id}/tracking`,
        {
          actorId:
            user?.userId ||
            user?.id,
          status,
          remarks:
            `Order status changed to ${status.replace(
              /_/g,
              " "
            )}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await loadTracking();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to update order status."
      );
    } finally {
      setUpdating(false);
    }
  };

  const latestStatus =
    history.length > 0
      ? history[history.length - 1].status
      : order.status;

  const currentIndex =
    statuses.indexOf(latestStatus);

  return (
    <div className="tracking-page">

      <button
        className="tracking-back"
        onClick={onBack}
      >
        ← Back
      </button>

      <div className="tracking-container">

        <div className="tracking-heading">

          <span>
            DELIVERY TRACKING
          </span>

          <h1>
            {order.orderNumber}
          </h1>

          <p>
            {order.pickupAddress}
            {" → "}
            {order.dropAddress}
          </p>

        </div>

        {error && (
          <div className="tracking-error">
            {error}
          </div>
        )}

        {/* CURRENT STATUS */}

        <div className="current-status-card">

          <div>
            <span>
              CURRENT STATUS
            </span>

            <h2>
              {String(latestStatus)
                .replace(/_/g, " ")}
            </h2>
          </div>

          <div className="current-status-icon">
            ✓
          </div>

        </div>

        {/* TIMELINE */}

        <div className="tracking-card">

          <h2>
            Delivery Progress
          </h2>

          {loading ? (

            <div className="tracking-loading">
              Loading tracking...
            </div>

          ) : (

            <div className="progress-timeline">

              {statuses.map(
                (status, index) => {

                  const completed =
                    index <= currentIndex;

                  const historyItem =
                    history.find(
                      (item) =>
                        item.status === status
                    );

                  return (

                    <div
                      className={
                        completed
                          ? "progress-item completed"
                          : "progress-item"
                      }
                      key={status}
                    >

                      <div className="progress-marker">

                        {completed
                          ? "✓"
                          : index + 1}

                      </div>

                      <div>

                        <h3>
                          {status.replace(
                            /_/g,
                            " "
                          )}
                        </h3>

                        {historyItem && (
                          <>
                            <p>
                              {historyItem.remarks ||
                                "Status updated"}
                            </p>

                            <small>
                              {new Date(
                                historyItem.timestamp
                              ).toLocaleString()}
                            </small>
                          </>
                        )}

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </div>

        {/* ADMIN / AGENT UPDATE */}

        <div className="tracking-card">

          <h2>
            Update Delivery Status
          </h2>

          <p className="section-description">
            Change the current status of this
            delivery.
          </p>

          <div className="status-buttons">

            {statuses.map(
              (status, index) => {

                const disabled =
                  updating ||
                  index <= currentIndex;

                return (

                  <button
                    key={status}
                    disabled={disabled}
                    onClick={() =>
                      updateStatus(status)
                    }
                  >
                    {status.replace(
                      /_/g,
                      " "
                    )}
                  </button>

                );
              }
            )}

          </div>

        </div>

        {/* HISTORY */}

        <div className="tracking-card">

          <h2>
            Status History
          </h2>

          {history.length === 0 ? (

            <p>
              No tracking history available.
            </p>

          ) : (

            <div className="history-list">

              {history.map((item) => (

                <div
                  className="history-item"
                  key={item.id}
                >

                  <div className="history-dot">
                    ✓
                  </div>

                  <div>

                    <strong>
                      {item.status.replace(
                        /_/g,
                        " "
                      )}
                    </strong>

                    <p>
                      {item.remarks ||
                        "Status updated"}
                    </p>

                    <small>
                      {new Date(
                        item.timestamp
                      ).toLocaleString()}
                    </small>

                    {item.actorName && (
                      <small>
                        Updated by{" "}
                        {item.actorName}
                      </small>
                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Tracking;