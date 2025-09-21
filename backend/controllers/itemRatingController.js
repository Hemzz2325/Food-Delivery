// backend/controllers/itemRatingController.js
import Item from "../models/itemModel.js";
import Order from "../models/orderModel.js";

export const rateItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.params;
    const { rating } = req.body;

    const r = Number(rating);
    if (!itemId || !(r >= 1 && r <= 5))
      return res.status(400).json({ message: "Invalid rating" });

    // Verify user has a delivered order containing this item
    const hasDelivered = await Order.exists({
      user: userId,
      status: "delivered",
      "items.item": itemId,
    });
    if (!hasDelivered)
      return res.status(403).json({ message: "Rate only delivered items" });

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const prev = item.ratingsByUser?.get(String(userId));
    if (prev) {
      // Update average without changing count
      const total = item.rating.average * item.rating.count - prev + r;
      item.rating.average = Number((total / item.rating.count).toFixed(2));
      item.ratingsByUser.set(String(userId), r);
    } else {
      // New rating contribution
      const newCount = (item.rating.count || 0) + 1;
      const total = item.rating.average * item.rating.count + r;
      item.rating.count = newCount;
      item.rating.average = Number((total / newCount).toFixed(2));
      if (!item.ratingsByUser) item.ratingsByUser = new Map();
      item.ratingsByUser.set(String(userId), r);
    }

    await item.save();
    return res.status(200).json({ message: "Rating saved", rating: item.rating });
  } catch (err) {
    console.error("rateItem error:", err);
    return res.status(500).json({ message: "Failed to rate item" });
  }
};
