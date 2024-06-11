import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTrashAlt } from "react-icons/fa";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import "./ordersComponent.css";

const OrdersComponent = () => {
  const [orders, setOrders] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

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
                      product: productResponse.data.data,
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

        setOrders(ordersWithProductDetails);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
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

  console.log(orders, "ordres");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

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
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.user?.name}</td>
              <td>${order.totalPrice.toFixed(2)}</td>
              <td>{order.status}</td>
              <td>
                {order.orderItems.map((item) => (
                  <div key={item._id}>
                    {item.product.product.name} x {item.quantity}
                  </div>
                ))}
              </td>
              <td>{order.mobileNumber}</td>
              <td>{formatDate(order.createdAt)}</td>
              <td>{`${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`}</td>
              <td className="actions">
                <button
                  className="confirm-button"
                  onClick={() => handleConfirm(order._id)}
                >
                  <FaCheck />
                </button>
                <button
                  className="delete-button"
                  onClick={() => openDeleteModal(order._id)}
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
    </div>
  );
};

export default OrdersComponent;
