import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "./statsComponent.css";

const StatsComponent = () => {
  const [productStats, setProductStats] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProductStats = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/products/product-stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProductStats(response.data.data);
      } catch (error) {
        console.error("Error fetching product stats:", error);
      }
    };

    fetchProductStats();
  }, [token]);

  if (!productStats.length) {
    return <div>Loading stats...</div>;
  }

  const statsData = {
    labels: productStats.map((stat) => stat.category),
    datasets: [
      {
        label: "Total Sales",
        data: productStats.map((stat) => stat.totalSales),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
      {
        label: "Average Price",
        data: productStats.map((stat) => stat.avgPrice),
        backgroundColor: "rgba(255, 206, 86, 0.6)",
      },
    ],
  };

  return (
    <div className="stats-container">
      <h2>Product Stats</h2>
      <Bar data={statsData} />
      <table className="stats-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Total Sales</th>
            <th>Count</th>
            <th>Average Price</th>
          </tr>
        </thead>
        <tbody>
          {productStats.map((stat) => (
            <tr key={stat.category}>
              <td>{stat.category}</td>
              <td>{stat.totalSales}</td>
              <td>{stat.count}</td>
              <td>{stat.avgPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatsComponent;
