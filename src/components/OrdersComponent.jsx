import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTrashAlt } from "react-icons/fa";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useNotification } from "./NotificationContext";
import "./ordersComponent.css";

const OrdersComponent = () => {
  const [orders, setOrders] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const { newOrderIds, markOrderAsViewed } = useNotification();
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const response = await axios.get("http://127.0.0.1:3000/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const ordersWithProductDetails = await Promise.all(
          response.data.data.map(async (order) => {
            const orderItems = await Promise.all(
              order.orderItems.map(async (item) => {
                if (item.product && item.product._id) {
                  try {
                    const productResponse = await axios.get(
                      `http://127.0.0.1:3000/api/products/${item.product._id}`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );
                    return {
                      ...item,
                      product: productResponse.data.data.product,
                    };
                  } catch (productError) {
                    console.error("Error fetching product:", productError);
                  }
                }
                return item;
              })
            );
            return {
              ...order,
              orderItems,
            };
          })
        );

        // Sort orders by date (newest to latest)
        ordersWithProductDetails.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setOrders(ordersWithProductDetails);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const handleNewOrder = (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    };

    const ws = new WebSocket("ws://127.0.0.1:3000");

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "NEW_ORDER") {
        handleNewOrder(message.order);
      }
    };

    return () => ws.close();
  }, []);

  const handleConfirm = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await axios.patch(
        `http://localhost:3000/api/orders/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(
        orders.map((order) =>
          order._id === id ? { ...order, status: "confirmed" } : order
        )
      );
    } catch (error) {
      console.error("Error confirming order:", error);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:3000/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(orders.filter((order) => order._id !== id));
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const openDeleteModal = (orderId) => {
    setShowDeleteModal(true);
    setOrderToDelete(orderId);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  const confirmDelete = () => {
    if (orderToDelete) {
      handleDelete(orderToDelete);
      closeDeleteModal();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleOrderClick = (orderId) => {
    markOrderAsViewed(orderId);
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(orders.length / ordersPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="orders-container">
      <h2 className="orders-title">Orders List</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Total Price</th>
            <th>Status</th>
            <th>Items Purchased</th>
            <th>Phone Number</th>
            <th>Date</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order) => (
            <tr
              key={order._id}
              className={newOrderIds.has(order._id) ? "new-order" : ""}
              onClick={() => handleOrderClick(order._id)}
            >
              <td>
                {order._id}{" "}
                {newOrderIds.has(order._id) && (
                  <span className="new-label">new</span>
                )}
              </td>
              <td>{order.user?.name}</td>
              <td>${order.totalPrice.toFixed(2)}</td>
              <td>{order.status}</td>
              <td>
                {order.orderItems.map((item) => (
                  <div key={item._id}>
                    {item.product
                      ? `${item.product.name} x ${item.quantity}`
                      : "Product details were deleted"}
                  </div>
                ))}
              </td>
              <td>{order.mobileNumber}</td>
              <td>{formatDate(order.createdAt)}</td>
              <td>{`${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`}</td>
              <td className="actions">
                <button
                  className="confirm-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirm(order._id);
                  }}
                >
                  <FaCheck />
                </button>
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(order._id);
                  }}
                >
                  <FaTrashAlt />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />
      <ul className="pagination">
        {pageNumbers.map((number) => (
          <li key={number} className="page-item">
            <a onClick={() => paginate(number)} href="#!" className="page-link">
              {number}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersComponent;
