// controllers/userController.js
import User from "../models/usermodel.js";



export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId; // set by isAuth middleware
    if (!userId) {
      return res.status(400).json({ message: "User ID not found in request" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};


export const updateLocation = async (req, res) => {
  try {
    const userId = req.userId; // set by isAuth middleware
    if (!userId) return res.status(400).json({ message: "User ID not found" });

    const { city, state, address } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { city, state, address },
      { new: true }
    );

    return res.status(200).json({ success: true, location: user });
  } catch (err) {
    console.error("Update location error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
