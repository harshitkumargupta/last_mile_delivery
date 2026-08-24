import { useEffect, useState } from "react";
import axios from "axios";
import "./DeliveryAgentDashboard.css";

const API = "http://localhost:8080/api";

function DeliveryAgentDashboard({ user, onLogout }) {

  // =========================================================
  // STATE
  // =========================================================

  const [agent, setAgent] = useState(null);

  const [assignments, setAssignments] = useState([]);
  const [completedDeliveries, setCompletedDeliveries] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [tracking, setTracking] = useState([]);

  const [loading, setLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // AUTH
  // =========================================================

  const getStoredUser = () => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const getUserId = () => {
    const storedUser = getStoredUser();

    return (
      user?.id ??
      user?.userId ??
      user?.user?.id ??
      storedUser?.id ??
      storedUser?.userId ??
      storedUser?.user?.id
    );
  };

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });

  // =========================================================
  // LOAD AGENT
  // =========================================================

  const loadAgent = async () => {

    const userId = getUserId();

    if (!userId) {
      throw new Error(
        "Logged-in user ID is missing."
      );
    }

    if (!getToken()) {
      throw new Error(
        "Authentication token is missing."
      );
    }

    const response = await axios.get(
      `${API}/delivery-agents/user/${userId}`,
      getAuthConfig()
    );

    const data = response.data;

    const normalizedAgent = {
      ...data,
      fullName:
        data.fullName ??
        data.name ??
        "Delivery Agent",
    };

    setAgent(normalizedAgent);

    return normalizedAgent;
  };

  // =========================================================
  // LOAD ASSIGNMENTS
  // =========================================================

  const loadAssignments = async (agentId) => {

    if (!agentId) {
      throw new Error(
        "Delivery agent ID is missing."
      );
    }

    const response = await axios.get(
      `${API}/assignments/agent/${agentId}`,
      getAuthConfig()
    );

    const rawAssignments = Array.isArray(
      response.data
    )
      ? response.data
      : [];

    const active = [];
    const completed = [];

    /*
     * IMPORTANT:
     *
     * The assignment endpoint returns assignments.
     * It does NOT necessarily mean the order is still active.
     *
     * Therefore we check the actual tracking status
     * of every order.
     */

    await Promise.all(
      rawAssignments.map(
        async (assignment) => {

          try {

            const trackingResponse =
              await axios.get(
                `${API}/orders/${assignment.orderId}/tracking`,
                getAuthConfig()
              );

            const history =
              Array.isArray(
                trackingResponse.data
              )
                ? trackingResponse.data
                : [];

            const latestStatus =
              history.length > 0
                ? history[
                    history.length - 1
                  ].status
                : "CREATED";

            const isDelivered =
              latestStatus === "DELIVERED";

            const isFailed =
              latestStatus === "FAILED";

            /*
             * Delivered and failed orders are no
             * longer active deliveries.
             */

            if (
              isDelivered ||
              isFailed ||
              assignment.unassignedAt != null
            ) {

              completed.push({
                ...assignment,
                latestStatus:
                  isDelivered
                    ? "DELIVERED"
                    : latestStatus,
              });

            } else {

              active.push({
                ...assignment,
                latestStatus,
              });

            }

          } catch (err) {

            /*
             * If tracking fails, keep the order active
             * rather than hiding it.
             */

            console.error(
              `Unable to load tracking for order ${assignment.orderId}`,
              err
            );

            active.push({
              ...assignment,
              latestStatus: "CREATED",
            });
          }
        }
      )
    );

    // =======================================================
    // SORT
    // =======================================================

    active.sort(
      (a, b) =>
        new Date(
          b.assignedAt || 0
        ) -
        new Date(
          a.assignedAt || 0
        )
    );

    completed.sort(
      (a, b) =>
        new Date(
          b.unassignedAt ||
          b.assignedAt ||
          0
        ) -
        new Date(
          a.unassignedAt ||
          a.assignedAt ||
          0
        )
    );

    // =======================================================
    // UPDATE STATE
    // =======================================================

    setAssignments(active);

    setCompletedDeliveries(completed);

    return {
      active,
      completed,
    };
  };

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  const loadDashboard = async () => {

    try {

      setLoading(true);
      setError("");

      const agentData =
        await loadAgent();

      await loadAssignments(
        agentData.id
      );

    } catch (err) {

      console.error(
        "DASHBOARD ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unable to load delivery dashboard."
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
  // OPEN ORDER
  // =========================================================

  const openOrder = async (assignment) => {

    try {

      setSelectedOrder(assignment);

      setOrderDetails(null);

      setTracking([]);

      setTrackingLoading(true);

      setError("");

      const config =
        getAuthConfig();

      const orderResponse =
        await axios.get(
          `${API}/orders/${assignment.orderId}`,
          config
        );

      const trackingResponse =
        await axios.get(
          `${API}/orders/${assignment.orderId}/tracking`,
          config
        );

      setOrderDetails(
        orderResponse.data
      );

      setTracking(
        Array.isArray(
          trackingResponse.data
        )
          ? trackingResponse.data
          : []
      );

    } catch (err) {

      console.error(
        "OPEN ORDER ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to load delivery information."
      );

    } finally {

      setTrackingLoading(false);
    }
  };

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

  const updateStatus = async (status) => {

    if (
      !selectedOrder ||
      !agent ||
      updating
    ) {
      return;
    }

    try {

      setUpdating(true);

      setError("");

      /*
       * actorId is NOT sent.
       *
       * Backend identifies the logged-in delivery agent
       * using the JWT token.
       */

      await axios.patch(
        `${API}/orders/${selectedOrder.orderId}/tracking`,
        {
          status,
          remarks:
            `Delivery status updated to ${formatStatus(
              status
            )}`,
        },
        getAuthConfig()
      );

      /*
       * IMPORTANT:
       *
       * Reload the entire assignment list after every
       * status update.
       *
       * When status becomes DELIVERED, loadAssignments()
       * automatically moves the order into completedDeliveries.
       */

      await loadAssignments(
        agent.id
      );

      if (status === "DELIVERED") {

        setSelectedOrder(null);

        setOrderDetails(null);

        setTracking([]);

      } else {

        /*
         * Refresh selected order and tracking
         * for PICKED_UP / IN_TRANSIT / OUT_FOR_DELIVERY.
         */

        await openOrder(
          selectedOrder
        );
      }

    } catch (err) {

      console.error(
        "STATUS UPDATE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to update order status."
      );

    } finally {

      setUpdating(false);
    }
  };

  // =========================================================
  // AVAILABILITY
  // =========================================================

  const toggleAvailability = async () => {

    if (!agent) {
      return;
    }

    try {

      setError("");

      const response =
        await axios.patch(
          `${API}/delivery-agents/${agent.id}/availability`,
          {
            available:
              !agent.available,
          },
          getAuthConfig()
        );

      const data =
        response.data;

      setAgent({
        ...data,

        fullName:
          data.fullName ??
          data.name ??
          agent.fullName ??
          "Delivery Agent",
      });

    } catch (err) {

      console.error(
        "AVAILABILITY ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to update availability."
      );
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const formatStatus = (status) => {

    return String(
      status || ""
    )
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  const getStatusClass = (status) => {

    const value =
      String(
        status || ""
      ).toUpperCase();

    if (
      value === "DELIVERED"
    ) {
      return "delivered";
    }

    if (
      value === "FAILED"
    ) {
      return "failed";
    }

    if (
      value === "IN_TRANSIT" ||
      value ===
        "OUT_FOR_DELIVERY" ||
      value === "PICKED_UP"
    ) {
      return "transit";
    }

    return "created";
  };

  const getCurrentStatus = () => {

    if (tracking.length > 0) {

      return tracking[
        tracking.length - 1
      ].status;
    }

    return (
      orderDetails?.status ||
      selectedOrder?.latestStatus ||
      "CREATED"
    );
  };

  const getNextStatus = () => {

    const current =
      getCurrentStatus();

    const flow = {

      CREATED:
        "PICKED_UP",

      PICKED_UP:
        "IN_TRANSIT",

      IN_TRANSIT:
        "OUT_FOR_DELIVERY",

      OUT_FOR_DELIVERY:
        "DELIVERED",
    };

    return flow[current] || null;
  };

  const statuses = [
    "CREATED",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="agent-loading-page">

        <div className="agent-spinner"></div>

        <h2>
          Loading Delivery Dashboard...
        </h2>

        <p>
          Preparing your deliveries.
        </p>

      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="agent-dashboard">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="agent-sidebar">

        <div className="agent-logo">

          <div className="agent-logo-icon">
            DT
          </div>

          <div>
            <strong>
              Delivery
            </strong>

            <span>
              Tracker
            </span>
          </div>

        </div>

        <div className="agent-profile">

          <div className="agent-avatar">

            {(
              agent?.fullName ||
              user?.fullName ||
              user?.name ||
              "A"
            )
              .charAt(0)
              .toUpperCase()}

          </div>

          <div>

            <strong>
              {agent?.fullName ||
                user?.fullName ||
                user?.name ||
                "Delivery Agent"}
            </strong>

            <span>
              Delivery Agent
            </span>

          </div>

        </div>

        <nav className="agent-nav">

          <button
            className="agent-nav-item active"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <span>▣</span>
            Dashboard
          </button>

          <button
            className="agent-nav-item"
            onClick={() =>
              document
                .getElementById(
                  "assigned-orders"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <span>📦</span>
            My Deliveries
          </button>

          <button
            className="agent-nav-item"
            onClick={() =>
              document
                .getElementById(
                  "completed-orders"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <span>✓</span>
            Completed
          </button>

        </nav>

        <div className="agent-sidebar-bottom">

          <button
            className="agent-logout"
            onClick={onLogout}
          >
            ⇥ Logout
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="agent-main">

        {/* HEADER */}

        <header className="agent-header">

          <div>

            <span className="agent-eyebrow">
              DELIVERY OPERATIONS
            </span>

            <h1>
              Welcome back,{" "}
              {(
                agent?.fullName ||
                user?.fullName ||
                user?.name ||
                "Agent"
              ).split(" ")[0]}
            </h1>

            <p>
              Manage your assigned deliveries
              and keep customers updated.
            </p>

          </div>

          <div className="agent-header-actions">

            <div
              className={
                agent?.available
                  ? "availability-badge available"
                  : "availability-badge unavailable"
              }
            >

              <span></span>

              {agent?.available
                ? "Available"
                : "Unavailable"}

            </div>

            <button
              className="availability-button"
              onClick={
                toggleAvailability
              }
            >
              {agent?.available
                ? "Go Offline"
                : "Go Online"}
            </button>

          </div>

        </header>

        {/* ERROR */}

        {error && (

          <div className="agent-error">

            <strong>
              !
            </strong>

            <span>
              {error}
            </span>

            <button
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>

          </div>
        )}

        {/* ===================================================
            STATS
        ==================================================== */}

        <section className="agent-stats">

          <div className="agent-stat-card">

            <div className="agent-stat-icon blue">
              📦
            </div>

            <div>

              <span>
                Assigned Orders
              </span>

              <strong>
                {assignments.length}
              </strong>

            </div>

          </div>

          <div className="agent-stat-card">

            <div className="agent-stat-icon orange">
              🚚
            </div>

            <div>

              <span>
                Active Deliveries
              </span>

              <strong>
                {assignments.length}
              </strong>

            </div>

          </div>

          <div className="agent-stat-card">

            <div className="agent-stat-icon green">
              ✓
            </div>

            <div>

              <span>
                Completed
              </span>

              <strong>
                {completedDeliveries.length}
              </strong>

            </div>

          </div>

        </section>

        {/* ===================================================
            ASSIGNED DELIVERIES
        ==================================================== */}

        <section
          className="agent-section"
          id="assigned-orders"
        >

          <div className="agent-section-header">

            <div>

              <span className="agent-eyebrow">
                YOUR WORK
              </span>

              <h2>
                Assigned Deliveries
              </h2>

            </div>

            <button
              className="agent-refresh"
              onClick={loadDashboard}
            >
              ↻ Refresh
            </button>

          </div>

          {assignments.length === 0 ? (

            <div className="agent-empty">

              <div>
                📦
              </div>

              <h2>
                No active deliveries
              </h2>

              <p>
                New assignments will appear here.
              </p>

            </div>

          ) : (

            <div className="agent-orders-grid">

              {assignments.map(
                (assignment) => (

                  <div
                    className="agent-order-card"
                    key={assignment.id}
                  >

                    <div className="agent-order-top">

                      <div>

                        <span>
                          ORDER
                        </span>

                        <h3>
                          {assignment.orderNumber}
                        </h3>

                      </div>

                      <span className="assignment-badge">

                        {formatStatus(
                          assignment.latestStatus
                        )}

                      </span>

                    </div>

                    <div className="agent-order-info">

                      <div>

                        <span>
                          Assignment Type
                        </span>

                        <strong>
                          {formatStatus(
                            assignment.assignmentType
                          )}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Current Status
                        </span>

                        <strong>
                          {formatStatus(
                            assignment.latestStatus
                          )}
                        </strong>

                      </div>

                    </div>

                    <button
                      className="agent-view-button"
                      onClick={() =>
                        openOrder(
                          assignment
                        )
                      }
                    >
                      View Delivery →
                    </button>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* ===================================================
            COMPLETED DELIVERIES
        ==================================================== */}

        <section
          className="agent-section"
          id="completed-orders"
        >

          <div className="agent-section-header">

            <div>

              <span className="agent-eyebrow">
                DELIVERY HISTORY
              </span>

              <h2>
                Completed Deliveries
              </h2>

            </div>

            <span className="completed-count">
              {completedDeliveries.length}
              {" "}Completed
            </span>

          </div>

          {completedDeliveries.length === 0 ? (

            <div className="agent-empty">

              <div>
                ✓
              </div>

              <h2>
                No completed deliveries
              </h2>

              <p>
                Delivered orders will appear here.
              </p>

            </div>

          ) : (

            <div className="agent-orders-grid">

              {completedDeliveries.map(
                (assignment) => (

                  <div
                    className="agent-order-card completed-order-card"
                    key={assignment.id}
                  >

                    <div className="agent-order-top">

                      <div>

                        <span>
                          ORDER
                        </span>

                        <h3>
                          {assignment.orderNumber}
                        </h3>

                      </div>

                      <span className="assignment-badge completed">

                        ✓ DELIVERED

                      </span>

                    </div>

                    <div className="agent-order-info">

                      <div>

                        <span>
                          Assignment Type
                        </span>

                        <strong>
                          {formatStatus(
                            assignment.assignmentType
                          )}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Status
                        </span>

                        <strong>
                          Delivered
                        </strong>

                      </div>

                    </div>

                    <button
                      className="agent-view-button"
                      onClick={() =>
                        openOrder(
                          assignment
                        )
                      }
                    >
                      View Delivery →
                    </button>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* ===================================================
            SELECTED ORDER
        ==================================================== */}

        {selectedOrder && (

          <section className="agent-section agent-selected-section">

            <div className="agent-section-header">

              <div>

                <span className="agent-eyebrow">
                  DELIVERY CONTROL
                </span>

                <h2>
                  {selectedOrder.orderNumber}
                </h2>

              </div>

              <button
                className="agent-close-button"
                onClick={() => {

                  setSelectedOrder(null);

                  setOrderDetails(null);

                  setTracking([]);

                }}
              >
                Close
              </button>

            </div>

            {trackingLoading ? (

              <div className="agent-tracking-loading">

                Loading delivery information...

              </div>

            ) : (

              <>

                {/* CURRENT STATUS */}

                <div className="agent-current-status">

                  <div>

                    <span>
                      CURRENT STATUS
                    </span>

                    <h2>
                      {formatStatus(
                        getCurrentStatus()
                      )}
                    </h2>

                  </div>

                  <div
                    className={`agent-status-icon ${getStatusClass(
                      getCurrentStatus()
                    )}`}
                  >
                    ✓
                  </div>

                </div>

                {/* ORDER INFORMATION */}

                {orderDetails && (

                  <div className="agent-route-card">

                    <div>

                      <span>
                        ORDER
                      </span>

                      <strong>
                        {orderDetails.orderNumber}
                      </strong>

                    </div>

                    <div className="agent-route-arrow">
                      →
                    </div>

                    <div>

                      <span>
                        STATUS
                      </span>

                      <strong>
                        {formatStatus(
                          getCurrentStatus()
                        )}
                      </strong>

                    </div>

                  </div>

                )}

                {/* NEXT ACTION */}

                {getNextStatus() && (

                  <div className="agent-next-action">

                    <div>

                      <span>
                        NEXT DELIVERY STEP
                      </span>

                      <strong>
                        {formatStatus(
                          getNextStatus()
                        )}
                      </strong>

                    </div>

                    <button
                      disabled={updating}
                      onClick={() =>
                        updateStatus(
                          getNextStatus()
                        )
                      }
                    >

                      {updating
                        ? "Updating..."
                        : `Mark ${formatStatus(
                            getNextStatus()
                          )}`}

                    </button>

                  </div>

                )}

                {/* COMPLETED */}

                {getCurrentStatus() ===
                  "DELIVERED" && (

                  <div className="delivery-complete">

                    <span>
                      ✓
                    </span>

                    <div>

                      <strong>
                        Delivery Completed
                      </strong>

                      <p>
                        This order has been
                        successfully delivered.
                      </p>

                    </div>

                  </div>

                )}

                {/* TIMELINE */}

                <div className="agent-tracking-card">

                  <h3>
                    Delivery Timeline
                  </h3>

                  <div className="agent-timeline">

                    {statuses.map(
                      (status, index) => {

                        const currentIndex =
                          statuses.indexOf(
                            getCurrentStatus()
                          );

                        const completed =
                          index <= currentIndex;

                        const historyItem =
                          tracking.find(
                            (item) =>
                              item.status ===
                              status
                          );

                        return (

                          <div
                            className={
                              completed
                                ? "agent-timeline-item completed"
                                : "agent-timeline-item"
                            }
                            key={status}
                          >

                            <div className="agent-timeline-marker">

                              {completed
                                ? "✓"
                                : index + 1}

                            </div>

                            <div>

                              <strong>
                                {formatStatus(
                                  status
                                )}
                              </strong>

                              {historyItem ? (

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

                              ) : (

                                <p className="pending">
                                  Pending
                                </p>

                              )}

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                </div>

              </>

            )}

          </section>

        )}

      </main>

    </div>
  );
}

export default DeliveryAgentDashboard;