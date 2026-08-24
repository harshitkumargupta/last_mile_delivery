import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="sidebar">

      <div className="logo">
        <div className="logo-icon">
          LM
        </div>

        <div>
          <h2>Last-Mile</h2>
          <span>Delivery</span>
        </div>
      </div>

      <nav>

        <NavLink to="/dashboard">
          <span>▦</span>
          Dashboard
        </NavLink>

        <NavLink to="/create-order">
          <span>＋</span>
          Create Order
        </NavLink>

        <NavLink to="/orders">
          <span>▤</span>
          My Orders
        </NavLink>

        <NavLink to="/profile">
          <span>◉</span>
          Profile
        </NavLink>

      </nav>

      <button
        className="logout-button"
        onClick={logout}
      >
        Logout
      </button>

    </aside>
  );
}

export default Sidebar;