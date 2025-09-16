// controllers/itemController.js - FIXED VERSION
import Item from "../models/itemModel.js";
import Shop from "../models/shopModel.js";
import { uploadToCloudinary } from "../utils/imageUploader.js";

/**
 * Add Item
 */
export const addItem = async (req, res) => {
  try {
    const { name, price, category, foodtype, shop: shopId } = req.body;

    console.log("🍕 Adding new item:");
    console.log("- Name:", name);
    console.log("- Price:", price);
    console.log("- Category:", category);
    console.log("- Food Type:", foodtype);
    console.log("- Shop ID:", shopId);
    console.log("- Has file:", !!req.file);

    if (!name || !price || !category || !foodtype || !shopId) {
      return res.status(400).json({ message: "All fields including shop are required" });
    }

    if (!req.file) return res.status(400).json({ message: "Image is required" });

    // Upload image to Cloudinary
    console.log("📷 Uploading item image...");
    const uploaded = await uploadToCloudinary(req.file.path);
    const image = uploaded.secure_url;
    console.log("✅ Image uploaded:", image);

    // Create the item
    const newItem = await Item.create({
      name,
      price: Number(price),
      category: category.toLowerCase(), // Ensure lowercase for consistency
      foodtype,
      shop: shopId,
      image,
    });

    console.log("✅ Item created:", newItem._id);

    // Find and update the shop
    const shop = await Shop.findById(shopId);
    if (!shop) {
      console.log("❌ Shop not found:", shopId);
      return res.status(404).json({ message: "Shop not found" });
    }

    // Add item to shop's items array
    if (!shop.items) shop.items = [];
    shop.items.push(newItem._id);
    await shop.save();

    // Populate the shop with updated items for response
    await shop.populate({ 
      path: "items", 
      options: { sort: { updatedAt: -1 } } 
    });

    console.log("✅ Item added to shop. Shop now has", shop.items.length, "items");

    res.status(201).json({ 
      message: "Item added successfully", 
      item: newItem,
      shop: shop
    });
  } catch (error) {
    console.error("❌ Add item error:", error);
    res.status(500).json({ 
      message: "Add item error", 
      error: error.message 
    });
  }
};

/**
 * Edit Item
 */
export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { name, price, category, foodtype } = req.body;

    console.log("📝 Editing item:", itemId);

    const updateData = {};
    if (name) updateData.name = name;
    if (price) updateData.price = Number(price);
    if (category) updateData.category = category.toLowerCase();
    if (foodtype) updateData.foodtype = foodtype;

    if (req.file) {
      console.log("📷 Uploading new image...");
      const uploaded = await uploadToCloudinary(req.file.path);
      updateData.image = uploaded.secure_url;
      console.log("✅ New image uploaded:", updateData.image);
    }

    const updatedItem = await Item.findByIdAndUpdate(itemId, updateData, { new: true });

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    console.log("✅ Item updated successfully");

    res.status(200).json({ 
      message: "Item updated successfully", 
      item: updatedItem 
    });
  } catch (error) {
    console.error("❌ Edit item error:", error);
    res.status(500).json({ 
      message: "Edit item error", 
      error: error.message 
    });
  }
};

/**
 * Get Item By Id
 */
export const getItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    console.log("🔍 Fetching item:", itemId);
    
    const item = await Item.findById(itemId).populate("shop");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    console.log("✅ Item found:", item.name);
    res.status(200).json({ message: "Item fetched successfully", item });
  } catch (error) {
    console.error("❌ Get item error:", error);
    res.status(500).json({ 
      message: "Get item error", 
      error: error.message 
    });
  }
};

/**
 * Delete Item
 */
export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    console.log("🗑️ Deleting item:", itemId);

    const item = await Item.findByIdAndDelete(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Remove item from shop
    const shop = await Shop.findById(item.shop);
    if (shop) {
      shop.items = (shop.items || []).filter(
        (i) => i.toString() !== item._id.toString()
      );
      await shop.save();
      
      // Populate shop for response
      await shop.populate({ 
        path: "items", 
        options: { sort: { updatedAt: -1 } } 
      });
      
      console.log("✅ Item removed from shop. Shop now has", shop.items.length, "items");
    }

    res.status(200).json({ 
      message: "Item deleted successfully", 
      shop 
    });
  } catch (error) {
    console.error("❌ Delete item error:", error);
    res.status(500).json({ 
      message: "Delete item error", 
      error: error.message 
    });
  }
};

/**
 * Get Items By City
 */
export const getItemByCity = async (req, res) => {
  try {
    const city = req.params.city;
    if (!city) return res.status(400).json({ message: "City is required" });

    console.log("🍕 Fetching items for city:", city);

    // First find shops in the city
    const shops = await Shop.find({
      city: { $regex: new RegExp(city, "i") },
    });

    if (!shops || shops.length === 0) {
      console.log("ℹ️ No shops found in city:", city);
      return res.status(404).json({ message: "No shops found in this city" });
    }

    const shopIds = shops.map((s) => s._id);
    console.log("🏪 Found", shops.length, "shops in", city);

    // Find items from those shops
    const items = await Item.find({ 
      shop: { $in: shopIds } 
    })
    .populate({
      path: "shop",
      select: "name city state address image"
    })
    .sort({ updatedAt: -1 });

    console.log("✅ Found", items.length, "items in", city);

    return res.status(200).json({ items });
  } catch (error) {
    console.error("❌ Get items by city error:", error);
    res.status(500).json({ 
      message: "Get items by city error", 
      error: error.message 
    });
  }
};