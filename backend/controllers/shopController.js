import Shop from "../models/shopModel.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const createShop = async (req, res) => {
    try{
        const {name,address,state,city} = req.body;
                let uploaded;
                if (req.file) {
                    uploaded = await uploadToCloudinary(req.file.path);
                }

                const newShop = await Shop.create({
                        name,
                        image: uploaded?.secure_url || "",
                        owner: req.userId,
                        city,
                        state,
                        address,
                });

                await newShop.populate("owner");
                return res.status(201).json({ message: "Shop created", shop: newShop });
    }catch(error){
        console.error("Create shop error:",error)
        return res.status(500).json({message:"Create shop error",error:error.message})
    }
    
}
export const createandeditShop = async (req, res) => {
    try {
        const { name, address, state, city } = req.body;
        let uploaded;
        if (req.file) {
            uploaded = await uploadToCloudinary(req.file.path);
        }

        let shop = await Shop.findOne({ owner: req.userId });
        if (!shop) {
            shop = await Shop.create({
                name,
                image: uploaded?.secure_url || "",
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
                    image: uploaded?.secure_url || shop.image,
                    owner: req.userId,
                    city,
                    state,
                    address,
                },
                { new: true }
            );
        }

        await shop.populate("owner");
        return res.status(201).json({ message: "Shop created", shop });
    } catch (error) {
        console.error("Create shop error:", error);
        return res.status(500).json({ message: "Create shop error", error: error.message });
    }
};
export const getMyShop = async (req, res) => {
    try {
        const myShop = await Shop.findOne({ owner: req.userId }).populate("owner items");
        if (!myShop) {
            return res.status(200).json({ shop: null });
        }
        return res.status(200).json({ shop: myShop });
    } catch (error) {
        console.error("Get my shop error:", error);
        return res.status(500).json({ message: "Get my shop error", error: error.message });
    }
};