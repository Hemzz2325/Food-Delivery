import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "shop", required: true },
    category: { type: String, enum: ["breakfast", "lunch", "dinner", "snacks", "drinks", "south Indian", "North Indian", "panjabi", "chinees", "juices", "Desserts", "sandwich", "burger", "pizzas"], required: true },
    price: { type: Number,min:0, required: true },
    foodtype:{ type: String, enum: ["veg", "non-veg"], required: true },
}, { timestamps: true })

const item=mongoose.model("item", itemSchema);
export default item;