import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import CreateProductModal from "./CreateProductModal";
import "./productsComponent.css";

const ProductsComponent = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedPrice, setEditedPrice] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      const response = await axios.get("http://127.0.0.1:3000/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(response.data.data.documents);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:3000/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setEditedName(product.name);
    setEditedPrice(product.price);
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.patch(
        `http://localhost:3000/api/products/${editingProduct}`,
        { name: editedName, price: editedPrice },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(
        products.map((product) =>
          product._id === editingProduct
            ? { ...product, name: editedName, price: editedPrice }
            : product
        )
      );

      setEditingProduct(null);
      setEditedName("");
      setEditedPrice("");
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const openDeleteModal = (productId) => {
    setShowDeleteModal(true);
    setProductToDelete(productId);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      handleDelete(productToDelete);
      closeDeleteModal();
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreate = async (newProduct) => {
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      Object.keys(newProduct).forEach((key) => {
        formData.append(key, newProduct[key]);
      });

      const response = await axios.post(
        "http://localhost:3000/api/products",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProducts([...products, response.data.data.document]);
      closeCreateModal();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  return (
    <div className="products-container">
      <h2>Products List</h2>
      <button className="create-button" onClick={openCreateModal}>
        <FaPlus /> Create Product
      </button>
      <table className="products-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>
                {editingProduct === product._id ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                ) : (
                  product.name
                )}
              </td>
              <td>{product.categories}</td>
              <td>
                {editingProduct === product._id ? (
                  <input
                    type="number"
                    value={editedPrice}
                    onChange={(e) => setEditedPrice(e.target.value)}
                  />
                ) : (
                  product.price
                )}
              </td>
              <td>
                <img
                  src={product.imageCover}
                  alt={product.name}
                  style={{ width: "100px" }}
                />
              </td>
              <td>
                {editingProduct === product._id ? (
                  <button onClick={handleUpdate}>Save</button>
                ) : (
                  <>
                    <button onClick={() => handleEdit(product)}>
                      <FaEdit />
                    </button>
                    <button onClick={() => openDeleteModal(product._id)}>
                      <FaTrashAlt />
                    </button>
                  </>
                )}
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
      <CreateProductModal
        show={showCreateModal}
        onClose={closeCreateModal}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default ProductsComponent;
