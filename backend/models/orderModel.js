// backend/models/orderModel.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "item",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["pending","paid","confirmed","preparing","out_for_delivery","delivered","cancelled","cod_pending"],
    default: "pending"
  },
  paymentMethod: {
    type: String,
    enum: ["ONLINE","COD"],
    default: "ONLINE"
  },

  // Optional for COD, filled for ONLINE
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },

  // Single deliveryAddress definition including optional lat/lng
  deliveryAddress: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    lat: Number,
    lng: Number
  },

  deliveryBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  deliveryOtp: { type: String },
  otpExpiry: { type: Date },
  estimatedDeliveryTime: { type: Date },
  paidAt: { type: Date },
  deliveredAt: { type: Date }
}, {
  timestamps: true
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
