// frontend/src/lib/pay.js
import api from "./api";

export async function startOnlinePayment({ totalAmount, items, deliveryAddress }) {
  // 1) Ask backend to create Razorpay order
  const { key, order } = await api.post("api/order/create", {
    totalAmount,
    items,
    deliveryAddress,
  });

  // 2) Load Razorpay checkout script (if not present)
  if (!window.Razorpay) {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.body.appendChild(s);
    });
  }

  // 3) Open checkout
  const options = {
    key,
    amount: order.amount,
    currency: order.currency,
    order_id: order.id,
    name: "Country-Kitchen",
    description: "Order payment",
    handler: async function (response) {
      // 4) Verify signature with backend
      await api.post("api/order/verify-payment", {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
    },
    theme: { color: "#ef4444" },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
