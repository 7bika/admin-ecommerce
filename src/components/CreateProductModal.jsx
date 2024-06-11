import React, { useState } from "react";
import axios from "axios";
import "./createProductModal.css";

const CreateProductModal = ({ show, onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState("fouta");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageCover, setImageCover] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("categories", categories);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("imageCover", imageCover);

    try {
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

      setSuccessMessage("Product created successfully!");
      setErrorMessage(""); // Clear error message
      onCreate(response.data.data.product);

      // Close the modal after a short delay to show the success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      const errorMsg = error.message;
      setErrorMessage(errorMsg);
      setSuccessMessage("");
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create Product</h2>
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Category:
            <select
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              required
            >
              <option value="fouta">Fouta</option>
              <option value="tapis à pied">Tapis à pied</option>
              <option value="tapis-long">Tapis-long</option>
              <option value="kim">Kim</option>
              <option value="margoum">Margoum</option>
            </select>
          </label>
          <label>
            Price:
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </label>
          <label>
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label>
            Image Cover:
            <input
              type="file"
              onChange={(e) => setImageCover(e.target.files[0])}
              required
            />
          </label>
          <div className="button-group">
            <button type="submit">Create</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;
