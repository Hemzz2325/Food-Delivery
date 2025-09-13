// controllers/itemcontroller.js
import Item from "../models/itemModel.js";
import { uploadToCloudinary } from "../utils/imageUploader.js";

// ----------------- ADD ITEM -----------------
export const addItem = async (req, res) => {
  try {
    const { name, price, category, foodtype, shop } = req.body;

    // Validate required fields
    if (!name || !price || !category || !foodtype || !shop) {
      return res.status(400).json({ message: "All fields including shop are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Upload image and get string URL
    const uploaded = await uploadToCloudinary(req.file.path);
    const image = uploaded.secure_url; // string only

    const newItem = await Item.create({
      name,
      price,
      category,
      foodtype,
      shop,
      image, // string only
    });

    res.status(201).json({ message: "Item added successfully", item: newItem });
  } catch (error) {
    console.error("Add item error:", error);
    res.status(500).json({ message: "Add item error", error: error.message });
  }
};

// ----------------- EDIT ITEM -----------------
export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { name, price, category, foodtype } = req.body;

    let imageUrl;
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.path);
      imageUrl = uploaded.secure_url; // string only
    }

    const updateData = {
      ...(name ? { name } : {}),
      ...(price ? { price } : {}),
      ...(category ? { category } : {}),
      ...(foodtype ? { foodtype } : {}),
      ...(imageUrl ? { image: imageUrl } : {}),
    };

    const updatedItem = await Item.findByIdAndUpdate(itemId, updateData, { new: true });

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item updated successfully", item: updatedItem });
  } catch (error) {
    console.error("Edit item error:", error);
    res.status(500).json({ message: "Edit item error", error: error.message });
  }
};
