import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./chartComponent.css";

const ChartComponent = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthlyProductsData, setMonthlyProductsData] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);

  const token = localStorage.getItem("token");

  const yearHandler = (e) => {
    setYear(e.target.value);
    setSelectedMonth(null);
  };

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const [orderResponse, productResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/orders/monthly-plan/${year}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`http://localhost:3000/api/products/monthly-plan/${year}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        // Sort product details by createdAt date
        const sortedMonthlyData = orderResponse.data.data.plan.map(
          (monthData) => ({
            ...monthData,
            productDetails: monthData.productDetails.sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            ),
          })
        );

        setMonthlyData(sortedMonthlyData);
        setMonthlyProductsData(productResponse.data.data.plan);
      } catch (error) {
        console.error("Error fetching monthly data:", error);
      }
    };

    fetchMonthlyData();
  }, [token, year]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const chartData = {
    labels: monthNames.map((month, index) => {
      const orders = monthlyData.find((item) => item.month === index + 1);
      const products = monthlyProductsData.find(
        (item) => item.month === index + 1
      );
      return `${month} - ${orders ? orders.productDetails.length : 0} Orders, ${
        products ? products.numberOfProductsCreated : 0
      } Products`;
    }),
    datasets: [
      {
        label: "Number of Orders",
        data: monthNames.map((month, index) => {
          const orders = monthlyData.find((item) => item.month === index + 1);
          return orders ? orders.numberOfOrders : 0;
        }),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Number of Products Created",
        data: monthNames.map((month, index) => {
          const products = monthlyProductsData.find(
            (item) => item.month === index + 1
          );
          return products ? products.numberOfProductsCreated : 0;
        }),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  const handleBarClick = (elements) => {
    if (elements.length > 0) {
      const monthIndex = elements[0].index;
      const selectedOrderData = monthlyData.find(
        (item) => item.month === monthIndex + 1
      );
      const selectedProductData = monthlyProductsData.find(
        (item) => item.month === monthIndex + 1
      );
      setSelectedMonth({ ...selectedOrderData, ...selectedProductData });
    }
  };

  const options = {
    onClick: (event, elements) => handleBarClick(elements),
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const monthIndex = context.dataIndex;
            const orders = monthlyData.find(
              (item) => item.month === monthIndex + 1
            );
            const products = monthlyProductsData.find(
              (item) => item.month === monthIndex + 1
            );
            const orderDetails = orders
              ? orders.productDetails.map(
                  (product) => `${product.name} (${product.categories})`
                )
              : [];
            return [
              `${context.dataset.label}: ${context.raw}`,
              ...orderDetails,
            ];
          },
        },
      },
    },
  };

  const getMostOrderedProduct = (productDetails) => {
    if (!productDetails) return "No data";
    const productCounts = productDetails.reduce((acc, product) => {
      acc[product.name] = (acc[product.name] || 0) + 1;
      return acc;
    }, {});
    const mostOrderedProduct = Object.keys(productCounts).reduce((a, b) =>
      productCounts[a] > productCounts[b] ? a : b
    );
    return mostOrderedProduct;
  };

  return (
    <div className="chart-container">
      <h2>Monthly Plan for {year}</h2>
      <div className="year-selector">
        <h3>Select Year</h3>
        <select onChange={yearHandler} value={year}>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
      </div>
      <Bar data={chartData} options={options} />
      {selectedMonth && (
        <div className="details-container">
          <h3>Details for {monthNames[selectedMonth.month - 1]}</h3>
          <div className="order-details">
            <h4>Order Details</h4>
            <p>Number of Orders: {selectedMonth.numberOfOrders}</p>
            <p>
              Most Ordered Product:{" "}
              {getMostOrderedProduct(selectedMonth.productDetails)}
            </p>
            <table className="details-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Ratings Average</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                {selectedMonth.productDetails &&
                  selectedMonth.productDetails.map((product) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.categories}</td>
                      <td>{product.price}</td>
                      <td>{product.ratingsAverage}</td>
                      <td>
                        <img
                          src={product.imageCover}
                          alt={product.name}
                          width="50"
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="product-creation-details">
            <h4>Product Creation Details</h4>
            <table className="details-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {selectedMonth.products &&
                  selectedMonth.products.map((product, index) => (
                    <tr key={index}>
                      <td>{product}</td>
                      <td>
                        {monthNames[selectedMonth.month - 1]} {year}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartComponent;
