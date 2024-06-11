import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./components/LoginPage";
import UsersComponent from "./components/UsersComponent";
import Dashboard from "./components/Dashboard";
import ProductsComponent from "./components/ProductsComponent";
import OrdersComponent from "./components/OrdersComponent";
import PrivateRoute from "./components/PrivateRoute";
import ReviewsComponent from "./components/ReviewsComponent";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UsersComponent />} />
            <Route path="products" element={<ProductsComponent />} />
            <Route path="reviews" element={<ReviewsComponent />} />
            <Route path="orders" element={<OrdersComponent />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
