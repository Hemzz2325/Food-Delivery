// controllers/shopController.js
import Shop from "../models/shopModel.js";
import { uploadToCloudinary } from "../utils/imageUploader.js";

/**
 * Create or Edit Shop
 */
export const createAndEditShop = async (req, res) => {
  try {
    const { name, address, state, city } = req.body;
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    let imageUrl;

    // Upload image if file exists
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.path);
      imageUrl = uploaded?.secure_url;
    }

    let shop = await Shop.findOne({ owner: req.userId });

    if (shop) {
      // Update existing shop
      shop.name = name || shop.name;
      shop.address = address || shop.address;
      shop.state = state || shop.state;
      shop.city = city || shop.city;
      shop.image = imageUrl || shop.image;
      await shop.save();
      await shop.populate("owner");
      return res.status(200).json({ message: "Shop updated", shop });
    }

    // Create new shop: require image
    if (!imageUrl) return res.status(400).json({ message: "Shop image is required" });

    shop = new Shop({
      name,
      address,
      state,
      city,
      image: imageUrl,
      owner: req.userId,
    });

    await shop.save();
    await shop.populate("owner");
    res.status(201).json({ message: "Shop created", shop });
  } catch (err) {
    console.error("Shop create/edit error:", err);
    res.status(500).json({ message: "Create/edit shop error", error: err.message });
  }
};

/**
 * Get My Shop
 */
export const getMyShop = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const myShop = await Shop.findOne({ owner: req.userId }).populate("owner items").populate({ path: "items", options: { sort: { updatedAt: -1 } } });

    res.status(200).json({ shop: myShop || null });
  } catch (error) {
    console.error("Get my shop error:", error);
    res.status(500).json({ message: "Get my shop error", error: error.message });
  }
};

/**
 * Get Shops By City (case-insensitive)
 */
export const getShopByCity = async (req, res) => {
  try {
    const city = req.params.city;
    if (!city) return res.status(400).json({ message: "City is required" });

    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");

    if (!shops || shops.length === 0) {
      return res.status(404).json({ message: "shops not found" });
    }

    res.status(200).json({ shops });
  } catch (error) {
    console.error("Get shops by city error:", error);
    res.status(500).json({ message: "Get shops by city error", error: error.message });
  }
};
