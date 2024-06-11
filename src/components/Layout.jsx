import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./layout.css";

const Layout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/users/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        alert("Failed to logout. Please try again.");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      alert("An error occurred while logging out.");
    }
  };

  return (
    <div className="layout">
      <nav className="side-nav">
        <div className="sticky">
          <div className="user-info">
            {user ? (
              <>
                <img
                  src="user-icon.jpg"
                  alt="User Icon"
                  className="user-icon"
                />
                <span>
                  {user.name} ({user.role})
                </span>
              </>
            ) : (
              <span>No user connected</span>
            )}
          </div>
          <ul>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/users">Users</Link>
            </li>
            <li>
              <Link to="/products">Products</Link>
            </li>
            <li>
              <Link to="/reviews">Reviews</Link>
            </li>
            <li>
              <Link to="/orders">Orders</Link>
            </li>
          </ul>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
