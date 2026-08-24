import { useEffect, useState } from "react";
import "./CreateOrder.css";

const API = "http://localhost:8080/api";

function CreateOrder({ user: propUser, onBack, onOrderCreated }) {
  const [user, setUser] = useState(propUser || null);
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    pickupAddress: "Bhopal Central, Madhya Pradesh",
    dropAddress: "Bhopal North, Madhya Pradesh",
    pickupZoneId: "",
    dropZoneId: "",
    length: "20",
    breadth: "20",
    height: "10",
    actualWeight: "2",
    orderType: "B2C",
    paymentType: "PREPAID",
  });

  useEffect(() => {
    if (propUser) {
      setUser(propUser);
      return;
    }

    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        setError("Please login again.");
        return;
      }

      const parsedUser = JSON.parse(savedUser);

      if (!parsedUser.userId) {
        setError("Customer ID missing. Please login again.");
        return;
      }

      setUser(parsedUser);
    } catch (err) {
      console.error("USER ERROR:", err);
      setError("Invalid user session. Please login again.");
    }
  }, [propUser]);

  useEffect(() => {
    const loadZones = async () => {
      try {
        setLoadingZones(true);

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Login session expired. Please login again.");
          return;
        }

        const response = await fetch(`${API}/zones/active`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to load zones (${response.status})`);
        }

        const data = await response.json();

        setZones(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("ZONE ERROR:", err);
        setError(err.message || "Unable to load zones.");
      } finally {
        setLoadingZones(false);
      }
    };

    loadZones();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  function getZoneName(id) {
    const zone = zones.find(
      (z) => String(z.id) === String(id)
    );

    return zone?.name || "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setSuccess(null);

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your login session expired. Please login again.");
      return;
    }

    if (!user || !user.userId) {
      setError("Customer information is missing. Please login again.");
      return;
    }

    if (String(user.role).toUpperCase() !== "CUSTOMER") {
      setError(
        `Only CUSTOMER accounts can create orders. Current role: ${user.role}`
      );
      return;
    }

    if (!form.pickupAddress.trim()) {
      setError("Enter pickup address.");
      return;
    }

    if (!form.dropAddress.trim()) {
      setError("Enter delivery address.");
      return;
    }

    if (!form.pickupZoneId || !form.dropZoneId) {
      setError("Select both zones.");
      return;
    }

    if (
      String(form.pickupZoneId) ===
      String(form.dropZoneId)
    ) {
      setError("Pickup and delivery zones cannot be the same.");
      return;
    }

    if (
      Number(form.length) <= 0 ||
      Number(form.breadth) <= 0 ||
      Number(form.height) <= 0 ||
      Number(form.actualWeight) <= 0
    ) {
      setError("Enter valid package dimensions and weight.");
      return;
    }

    const orderData = {
      customerId: Number(user.userId),
      pickupAddress: form.pickupAddress.trim(),
      dropAddress: form.dropAddress.trim(),
      pickupZoneId: Number(form.pickupZoneId),
      dropZoneId: Number(form.dropZoneId),
      length: Number(form.length),
      breadth: Number(form.breadth),
      height: Number(form.height),
      actualWeight: Number(form.actualWeight),
      orderType: form.orderType,
      paymentType: form.paymentType,
    };

    console.log("================================");
    console.log("CREATE ORDER");
    console.log("USER:", user);
    console.log("ROLE:", user.role);
    console.log("CUSTOMER ID:", user.userId);
    console.log("TOKEN EXISTS:", !!token);
    console.log("REQUEST:", orderData);
    console.log("================================");

    try {
      setSubmitting(true);

      const response = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const responseText = await response.text();

      console.log("ORDER STATUS:", response.status);
      console.log("ORDER RESPONSE:", responseText);

      let data = null;

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = {
            message: responseText,
          };
        }
      }

      if (response.status === 201 || response.ok) {
        setSuccess(data);
        setSubmitting(false);
        return;
      }

      if (response.status === 401) {
        setError(
          "Your login session expired. Please logout and login again as CUSTOMER."
        );
        setSubmitting(false);
        return;
      }

      if (response.status === 403) {
        setError(
          "Customer authorization failed. The backend rejected this CUSTOMER token."
        );
        setSubmitting(false);
        return;
      }

      setError(
        data?.message ||
          data?.error ||
          `Server returned ${response.status}`
      );

      setSubmitting(false);
    } catch (err) {
      console.error("CREATE ORDER ERROR:", err);

      setError(
        "Cannot connect to the backend. Make sure Spring Boot is running on port 8080."
      );

      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="create-order-page">
        <div className="order-success-card">

          <div className="success-icon">✓</div>

          <span className="success-label">
            ORDER CREATED
          </span>

          <h1>
            Delivery booked successfully
          </h1>

          <p>
            Your delivery order has been successfully created.
          </p>

          <div className="success-order-number">
            {success.orderNumber}
          </div>

          <div className="success-details">

            <div>
              <span>Pickup</span>
              <strong>
                {success.pickupAddress}
              </strong>
            </div>

            <div>
              <span>Destination</span>
              <strong>
                {success.dropAddress}
              </strong>
            </div>

            <div>
              <span>Status</span>
              <strong>
                {success.status}
              </strong>
            </div>

            <div>
              <span>Total Charge</span>
              <strong>
                ₹{Number(success.totalCharge || 0).toFixed(2)}
              </strong>
            </div>

          </div>

          <div className="success-actions">

            <button
              className="primary-order-button"
              onClick={() => {
                if (onOrderCreated) {
                  onOrderCreated(success);
                } else if (onBack) {
                  onBack();
                }
              }}
            >
              Back to Dashboard
            </button>

            <button
              className="secondary-order-button"
              onClick={() => {
                setSuccess(null);
                setError("");
                setSubmitting(false);

                setForm({
                  pickupAddress: "Bhopal Central, Madhya Pradesh",
                  dropAddress: "Bhopal North, Madhya Pradesh",
                  pickupZoneId: "",
                  dropZoneId: "",
                  length: "20",
                  breadth: "20",
                  height: "10",
                  actualWeight: "2",
                  orderType: "B2C",
                  paymentType: "PREPAID",
                });
              }}
            >
              Create Another Order
            </button>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="create-order-page">

      <div className="create-order-header">

        <div>
          <span className="page-eyebrow">
            LAST-MILE LOGISTICS
          </span>

          <h1>Create New Order</h1>

          <p>
            Schedule a delivery and track it from pickup to destination.
          </p>
        </div>

        <div className="customer-badge">
          <span className="customer-dot" />
          {user?.fullName || "Customer"}
        </div>

      </div>

      {error && (
        <div className="order-error">
          <span>!</span>
          <div>{error}</div>
        </div>
      )}

      <form
        className="order-form"
        onSubmit={handleSubmit}
      >

        <section className="order-section">

          <div className="section-heading">
            <div className="section-number">01</div>

            <div>
              <h2>Delivery Route</h2>
              <p>
                Where should we pick up and deliver?
              </p>
            </div>
          </div>

          <div className="route-grid">

            <div className="field-group">
              <label>Pickup Address</label>

              <div className="input-with-icon">
                <span className="location-icon pickup">
                  ●
                </span>

                <input
                  name="pickupAddress"
                  value={form.pickupAddress}
                  onChange={handleChange}
                  placeholder="Enter pickup address"
                />
              </div>
            </div>

            <div className="field-group">
              <label>Delivery Address</label>

              <div className="input-with-icon">
                <span className="location-icon delivery">
                  ●
                </span>

                <input
                  name="dropAddress"
                  value={form.dropAddress}
                  onChange={handleChange}
                  placeholder="Enter delivery address"
                />
              </div>
            </div>

          </div>

          <div className="route-grid">

            <div className="field-group">
              <label>Pickup Zone</label>

              <select
                name="pickupZoneId"
                value={form.pickupZoneId}
                onChange={handleChange}
                disabled={loadingZones}
              >
                <option value="">
                  {loadingZones
                    ? "Loading zones..."
                    : "Select pickup zone"}
                </option>

                {zones.map((zone) => (
                  <option
                    key={zone.id}
                    value={zone.id}
                  >
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Delivery Zone</label>

              <select
                name="dropZoneId"
                value={form.dropZoneId}
                onChange={handleChange}
                disabled={loadingZones}
              >
                <option value="">
                  {loadingZones
                    ? "Loading zones..."
                    : "Select delivery zone"}
                </option>

                {zones.map((zone) => (
                  <option
                    key={zone.id}
                    value={zone.id}
                  >
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {form.pickupZoneId &&
            form.dropZoneId && (
              <div className="route-preview">

                <span>
                  {getZoneName(form.pickupZoneId)}
                </span>

                <div className="route-line">
                  <i />
                  <i />
                  <i />
                </div>

                <span>
                  {getZoneName(form.dropZoneId)}
                </span>

              </div>
            )}

        </section>

        <section className="order-section">

          <div className="section-heading">
            <div className="section-number">02</div>

            <div>
              <h2>Package Details</h2>
              <p>
                Tell us about the package you're sending.
              </p>
            </div>
          </div>

          <div className="dimensions-grid">

            {[
              ["length", "Length", "cm"],
              ["breadth", "Breadth", "cm"],
              ["height", "Height", "cm"],
              ["actualWeight", "Actual Weight", "kg"],
            ].map(([name, label, unit]) => (

              <div
                className="field-group"
                key={name}
              >

                <label>{label}</label>

                <div className="unit-input">

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                  />

                  <span>{unit}</span>

                </div>

              </div>

            ))}

          </div>

        </section>

        <section className="order-section">

          <div className="section-heading">
            <div className="section-number">03</div>

            <div>
              <h2>Service & Payment</h2>
              <p>
                Choose how you want your package handled.
              </p>
            </div>
          </div>

          <div className="option-grid">

            <div className="field-group">
              <label>Order Type</label>

              <div className="option-buttons">

                <button
                  type="button"
                  className={
                    form.orderType === "B2C"
                      ? "option-button active"
                      : "option-button"
                  }
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      orderType: "B2C",
                    }))
                  }
                >
                  <strong>B2C</strong>
                  <span>Personal delivery</span>
                </button>

                <button
                  type="button"
                  className={
                    form.orderType === "B2B"
                      ? "option-button active"
                      : "option-button"
                  }
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      orderType: "B2B",
                    }))
                  }
                >
                  <strong>B2B</strong>
                  <span>Business delivery</span>
                </button>

              </div>
            </div>

            <div className="field-group">
              <label>Payment</label>

              <div className="option-buttons">

                <button
                  type="button"
                  className={
                    form.paymentType === "PREPAID"
                      ? "option-button active"
                      : "option-button"
                  }
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      paymentType: "PREPAID",
                    }))
                  }
                >
                  <strong>Prepaid</strong>
                  <span>Pay now</span>
                </button>

                <button
                  type="button"
                  className={
                    form.paymentType === "COD"
                      ? "option-button active"
                      : "option-button"
                  }
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      paymentType: "COD",
                    }))
                  }
                >
                  <strong>COD</strong>
                  <span>Cash on delivery</span>
                </button>

              </div>
            </div>

          </div>

        </section>

        <div className="order-submit-area">

          <div className="secure-order">
            ✓ Secure authenticated order
          </div>

          <button
            type="submit"
            className="create-order-button"
            disabled={
              submitting ||
              loadingZones ||
              !user
            }
          >
            {submitting
              ? "Creating Order..."
              : "Create Order →"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default CreateOrder;