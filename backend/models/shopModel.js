// models/shopModel.js
import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  state: { type: String },
  city: { type: String },
  image: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "item" }],
}, { timestamps: true });

const Shop = mongoose.model("shop", shopSchema);
export default Shop;
