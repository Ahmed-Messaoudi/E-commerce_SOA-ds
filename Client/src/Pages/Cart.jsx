import React, { useEffect, useState } from "react";
import { Footer } from "../Component/Footer";
import { Header } from "../Component/Header";
import { Items } from "../Component/CartComponent/Items";

export const Cart = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [data, setData] = useState(null);
  const [item, setItem] = useState([]);
  const [loading, setLoading] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [token] = useState(sessionStorage.getItem("token"));

  // Function to fetch cart data
  const fetchCart = async () => {
    try {
      console.log("Fetching cart with token:", token);
      const res = await fetch("http://localhost:9090/cart/1", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch cart. Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Cart Data:", data);

      setTotalAmount(data.totalAmount || 0);
      setItem(data.cartDetalis || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      alert("Failed to load cart data. Please try again later.");
    }
  };

  useEffect(() => {
    fetchCart();
  }, [loading]);

  // Function to create an order
  const createOrder = async () => {
    try {
      const res = await fetch(`http://localhost:9090/payment/${totalAmount}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      if (!res.ok) {
        throw new Error(`Order creation failed. Status: ${res.status}`);
      }

      const responseText = await res.text(); // Read raw response
      console.log("Raw Response:", responseText);

      if (!responseText) {
        throw new Error("Empty response from server");
      }

      const orderData = JSON.parse(responseText); // Parse response as JSON
      console.log("Order Data:", orderData);

      setData(orderData);
      return orderData;
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create an order. Please try again.");
      return null;
    }
  };

  // Function to handle payment
  const handlePayment = async () => {
    const order = await createOrder();
    if (!order) {
      console.error("Order creation failed. Payment cannot proceed.");
      return;
    }

    const options = {
      key: order.key || "rzp_test_defaultKey",
      amount: order.amount || 0,
      currency: order.currency || "INR",
      name: "userName",
      description: "Test Transaction",
      image: "https://example.com/your_logo",
      order_id: order.orderId,
      handler: function (response) {
        console.log("Payment Response:", response);
        alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
      },
      prefill: {
        name: "John Doe",
        email: "john@example.com",
        contact: "1234567890",
      },
      notes: {
        address: "Sample Address, City",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp1 = new window.Razorpay(options);

    rzp1.on("payment.failed", function (response) {
      console.error("Payment Failed:", response.error);
      alert(`Payment failed: ${response.error.reason}`);
    });

    rzp1.open();
  };

  return (
    <>
      <Header />
      <div className="shopping-cart">
        <div className="px-4 px-lg-0">
          <div className="pb-5">
            <div className="container">
              <div className="row">
                <div className="col-lg-12 p-5 bg-white rounded shadow-sm mb-5">
                  {/* Shopping cart table */}
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th scope="col" className="border-0 bg-light">
                            <div className="p-2 px-3 text-uppercase">Product</div>
                          </th>
                          <th scope="col" className="border-0 bg-light">
                            <div className="py-2 text-uppercase">Price</div>
                          </th>
                          <th scope="col" className="border-0 bg-light">
                            <div className="py-2 text-uppercase">Quantity</div>
                          </th>
                          <th scope="col" className="border-0 bg-light">
                            <div className="py-2 text-uppercase">Remove</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {item && item.length > 0 ? (
                          item.map((elem, index) => (
                            <Items key={index} prop={elem} setLoading={setLoading} />
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center">
                              No items in the cart.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="row py-5 p-4 bg-white rounded shadow-sm">
                <div className="col-lg-6"></div>
                <div className="col-lg-6">
                  <div className="bg-light rounded-pill px-4 py-3 text-uppercase font-weight-bold">
                    Order summary
                  </div>
                  <div className="p-4">
                    <p className="font-italic mb-4">
                      Shipping and additional costs are calculated based on values you have entered.
                    </p>
                    <ul className="list-unstyled mb-4">
                      <li className="d-flex justify-content-between py-3 border-bottom">
                        <strong className="text-muted">Order Subtotal </strong>
                        <strong>Rs {totalAmount}</strong>
                      </li>
                      <li className="d-flex justify-content-between py-3 border-bottom">
                        <strong className="text-muted">Shipping and handling</strong>
                        <strong>Rs 100.00</strong>
                      </li>
                      <li className="d-flex justify-content-between py-3 border-bottom">
                        <strong className="text-muted">Tax</strong>
                        <strong>Rs 0.00</strong>
                      </li>
                      <li className="d-flex justify-content-between py-3 border-bottom">
                        <strong className="text-muted">Total</strong>
                        <h3 className="font-weight-bold">Rs {totalAmount + 100}</h3>
                      </li>
                    </ul>
                    <button
                      className="btn btn-dark rounded-pill py-2 btn-block"
                      onClick={handlePayment}
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
