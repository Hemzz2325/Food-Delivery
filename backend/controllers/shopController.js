import Shop from "../models/shopModel.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const createShop = async (req, res) => {
  try {
    const { name, address, state, city } = req.body;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized: userId missing" });
    }

    let imageUrl = "";
    if (req.file) {
      try {
        const uploaded = await uploadToCloudinary(req.file.path);
        imageUrl = uploaded.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    const newShop = await Shop.create({
      name,
      image: imageUrl,
      owner: req.userId,
      city,
      state,
      address,
    });

    await newShop.populate("owner");
    return res.status(201).json({ message: "Shop created", shop: newShop });
  } catch (error) {
    console.error("Create shop error:", error);
    return res
      .status(500)
      .json({ message: "Create shop error", error: error.message });
  }
};

export const createandeditShop = async (req, res) => {
  try {
    const { name, address, state, city } = req.body;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized: userId missing" });
    }

    let imageUrl;
    if (req.file) {
      try {
        const uploaded = await uploadToCloudinary(req.file.path);
        imageUrl = uploaded.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    let shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      shop = await Shop.create({
        name,
        image: imageUrl || "",
        owner: req.userId,
        city,
        state,
        address,
      });
    } else {
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          image: imageUrl || shop.image,
          owner: req.userId,
          city,
          state,
          address,
        },
        { new: true }
      );
    }

    await shop.populate("owner items");
    return res.status(201).json({ message: "Shop saved", shop });
  } catch (error) {
    console.error("Create/edit shop error:", error);
    return res
      .status(500)
      .json({ message: "Create/edit shop error", error: error.message });
  }
};

export const getMyShop = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized: userId missing" });
    }

    const myShop = await Shop.findOne({ owner: req.userId }).populate(
      "owner items"
    );

    if (!myShop) {
      return res.status(200).json({ shop: null });
    }

    return res.status(200).json({ shop: myShop });
  } catch (error) {
    console.error("Get my shop error:", error);
    return res
      .status(500)
      .json({ message: "Get my shop error", error: error.message });
  }
};
