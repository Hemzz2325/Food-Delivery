// models/itemModel.js
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "shop", required: true },
  category: {
  type: String,
  enum: [
    "breakfast",
    "lunch",
    "dinner",
    "snacks",
    "drinks",
    "south indian",
    "north indian",
    "punjabi",
    "chinese",
    "juices",
    "desserts",
    "sandwich",
    "burger",
    "pizzas",
  ],
  required: true,
  set: (val) => val.toLowerCase(),
},

  price: { type: Number, min: 0, required: true },
  foodtype: { type: String, enum: ["veg", "non-veg"], required: true },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  ratingsByUser: {
  type: Map, // key: userId, value: Number (1-5)
  of: Number,
  default: undefined,
},
}, { timestamps: true });

const Item = mongoose.model("item", itemSchema);
export default Item;
