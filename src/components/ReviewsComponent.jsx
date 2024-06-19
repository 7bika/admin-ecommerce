import React, { useState, useEffect } from "react";
import "./reviewsComponent.css";

const ReviewsComponent = () => {
  const [reviews, setReviews] = useState([]);
  const [productDetails, setProductDetails] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const reviewsResponse = await fetch("http://127.0.0.1:3000/api/reviews", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!reviewsResponse.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData.data.reviews);

      const productIds = reviewsData.data.reviews.map(
        (review) => review.product
      );
      await fetchProductDetails(productIds);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      alert("An error occurred while fetching the reviews.");
    }
  };

  const fetchProductDetails = async (productIds) => {
    try {
      const token = localStorage.getItem("token");
      const productsResponse = await fetch(
        "http://127.0.0.1:3000/api/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!productsResponse.ok) {
        throw new Error("Failed to fetch products");
      }

      const productsData = await productsResponse.json();
      const productsMap = {};
      productsData.data.documents.forEach((product) => {
        if (productIds.includes(product._id)) {
          productsMap[product._id] = {
            name: product.name,
            price: product.price,
            imageCover: product.imageCover,
          };
        }
      });

      setProductDetails(productsMap);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("An error occurred while fetching the product details.");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://127.0.0.1:3000/api/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete review");
      }
      setReviews((prevReviews) =>
        prevReviews.filter((review) => review._id !== reviewId)
      );
      alert("The review has been deleted.");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("An error occurred while deleting the review.");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="reviews-container">
      <h1>All Reviews</h1>
      {reviews.map((review) => {
        const product = productDetails[review.product];
        return (
          <div className="review-card" key={review._id}>
            <div className="review-content">
              {review.user ? (
                <>
                  <div className="user-name"> {review.user.name}</div>
                  <div className="rating">{"⭐".repeat(review.rating)}</div>
                  <p className="review-text">{review.review}</p>
                  <div className="review-details">
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    <div className="product-details">
                      <img
                        src={product?.imageCover || "default-product.png"}
                        alt={product?.name}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = "default-product.png";
                        }}
                      />
                      <div className="product-info">
                        <span className="product-name">{product?.name}</span>
                        <span className="product-price">${product?.price}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="review-text">User information is not available</p>
              )}
            </div>
            <button
              className="delete-button"
              onClick={() => handleDeleteReview(review._id)}
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewsComponent;
