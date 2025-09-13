// controllers/itemController.js
import Item from "../models/itemModel.js";
import Shop from "../models/shopModel.js";
import { uploadToCloudinary } from "../utils/imageUploader.js";

/**
 * Add Item
 */
export const addItem = async (req, res) => {
  try {
    const { name, price, category, foodtype, shop: shopId } = req.body;

    if (!name || !price || !category || !foodtype || !shopId) {
      return res.status(400).json({ message: "All fields including shop are required" });
    }

    if (!req.file) return res.status(400).json({ message: "Image is required" });

    const uploaded = await uploadToCloudinary(req.file.path);
    const image = uploaded.secure_url;

    const newItem = await Item.create({
      name,
      price,
      category,
      foodtype,
      shop: shopId,
      image,
    });

    // Attach to shop
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    shop.items = shop.items ? [...shop.items, newItem._id] : [newItem._id];
    await shop.save();
    await shop.populate({ path: "items", options: { sort: { updatedAt: -1 } } });

    res.status(201).json({ message: "Item added successfully", item: newItem });
  } catch (error) {
    console.error("Add item error:", error);
    res.status(500).json({ message: "Add item error", error: error.message });
  }
};

/**
 * Edit Item
 */
export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { name, price, category, foodtype } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (price) updateData.price = price;
    if (category) updateData.category = category;
    if (foodtype) updateData.foodtype = foodtype;

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.path);
      updateData.image = uploaded.secure_url;
    }

    const updatedItem = await Item.findByIdAndUpdate(itemId, updateData, { new: true });

    if (!updatedItem) return res.status(404).json({ message: "Item not found" });

    res.status(200).json({ message: "Item updated successfully", item: updatedItem });
  } catch (error) {
    console.error("Edit item error:", error);
    res.status(500).json({ message: "Edit item error", error: error.message });
  }
};

/**
 * Get Item By Id (returns item)
 */
export const getItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findById(itemId).populate("shop");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ message: "Item fetched successfully", item });
  } catch (error) {
    console.error("Get item error:", error);
    res.status(500).json({ message: "Get item error", error: error.message });
  }
};

/**
 * Delete Item
 */
export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findByIdAndDelete(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Remove item from shop
    const shop = await Shop.findById(item.shop);
    if (shop) {
      shop.items = (shop.items || []).filter((i) => i.toString() !== item._id.toString());
      await shop.save();
      await shop.populate({ path: "items", options: { sort: { updatedAt: -1 } } });
    }

    res.status(200).json({ message: "Item deleted", shop });
  } catch (error) {
    console.error("Delete item error:", error);
    res.status(500).json({ message: "delete item error", error: error.message });
  }
};

/**
 * Get Items By City
 * Returns items from shops in the given city (case-insensitive).
 */
export const getItemByCity = async (req, res) => {
  try {
    const city = req.params.city;
    if (!city) return res.status(400).json({ message: "city is required" });

    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");

    if (!shops || shops.length === 0) {
      return res.status(404).json({ message: "shops not found" });
    }

    const shopIds = shops.map((s) => s._id);
    const items = await Item.find({ shop: { $in: shopIds } });

    return res.status(200).json({ items });
  } catch (error) {
    console.error("get item city error:", error);
    res.status(500).json({ message: "get item city error", error: error.message });
  }
};
