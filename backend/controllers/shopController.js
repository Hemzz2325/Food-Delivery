// controllers/shopController.js - FIXED VERSION
import Shop from "../models/shopModel.js";
import { uploadToCloudinary } from "../utils/imageUploader.js";

/**
 * Create or Edit Shop
 */
export const createAndEditShop = async (req, res) => {
  try {
    const { name, address, state, city } = req.body;
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    console.log("🏪 Shop creation/edit request:");
    console.log("- User ID:", req.userId);
    console.log("- Name:", name);
    console.log("- City:", city);
    console.log("- State:", state);
    console.log("- Address:", address);
    console.log("- Has file:", !!req.file);

    let imageUrl;

    // Upload image if file exists
    if (req.file) {
      console.log("📷 Uploading image to Cloudinary...");
      const uploaded = await uploadToCloudinary(req.file.path);
      imageUrl = uploaded?.secure_url;
      console.log("✅ Image uploaded:", imageUrl);
    }

    let shop = await Shop.findOne({ owner: req.userId });

    if (shop) {
      // Update existing shop
      console.log("📝 Updating existing shop:", shop._id);
      shop.name = name || shop.name;
      shop.address = address || shop.address;
      shop.state = state || shop.state;
      shop.city = city || shop.city;
      if (imageUrl) shop.image = imageUrl;
      
      await shop.save();
      await shop.populate([
        { path: "owner", select: "fullName email" },
        { path: "items", options: { sort: { updatedAt: -1 } } }
      ]);
      
      console.log("✅ Shop updated successfully");
      return res.status(200).json({ message: "Shop updated", shop });
    }

    // Create new shop: require image
    if (!imageUrl) {
      console.log("❌ No image provided for new shop");
      return res.status(400).json({ message: "Shop image is required for new shop" });
    }

    console.log("🆕 Creating new shop...");
    shop = new Shop({
      name,
      address,
      state,
      city,
      image: imageUrl,
      owner: req.userId,
      items: [] // Initialize empty items array
    });

    await shop.save();
    await shop.populate([
      { path: "owner", select: "fullName email" },
      { path: "items", options: { sort: { updatedAt: -1 } } }
    ]);
    
    console.log("✅ Shop created successfully:", shop._id);
    res.status(201).json({ message: "Shop created", shop });
  } catch (err) {
    console.error("❌ Shop create/edit error:", err);
    res.status(500).json({ 
      message: "Create/edit shop error", 
      error: err.message 
    });
  }
};

/**
 * Get My Shop
 */
export const getMyShop = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    console.log("🏪 Fetching shop for user:", req.userId);

    const myShop = await Shop.findOne({ owner: req.userId })
      .populate([
        { path: "owner", select: "fullName email" },
        { path: "items", options: { sort: { updatedAt: -1 } } }
      ]);

    if (myShop) {
      console.log("✅ Shop found:", myShop.name, "with", myShop.items?.length || 0, "items");
    } else {
      console.log("ℹ️ No shop found for user");
    }

    res.status(200).json({ shop: myShop || null });
  } catch (error) {
    console.error("❌ Get my shop error:", error);
    res.status(500).json({ 
      message: "Get my shop error", 
      error: error.message 
    });
  }
};

/**
 * Get Shops By City (case-insensitive)
 */
export const getShopByCity = async (req, res) => {
  try {
    const city = req.params.city;
    if (!city) return res.status(400).json({ message: "City is required" });

    console.log("🏪 Fetching shops for city:", city);

    const shops = await Shop.find({
      city: { $regex: new RegExp(city, "i") },
    })
    .populate([
      { path: "owner", select: "fullName email" },
      { path: "items", options: { sort: { updatedAt: -1 } } }
    ]);

    console.log(`✅ Found ${shops.length} shops in ${city}`);

    if (!shops || shops.length === 0) {
      return res.status(404).json({ message: "No shops found in this city" });
    }

    res.status(200).json({ shops });
  } catch (error) {
    console.error("❌ Get shops by city error:", error);
    res.status(500).json({ 
      message: "Get shops by city error", 
      error: error.message 
    });
  }
};