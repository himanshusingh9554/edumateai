import Activity from "../models/Activity.js";
import mongoose from "mongoose";

export const getUserHistory = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const uniqueHistory = await Activity.aggregate([
      { $match: { user: userId } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$video",
          doc: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$doc" } },
      { $sort: { createdAt: -1 } }
    ]);

    await Activity.populate(uniqueHistory, {
      path: "video",
      select: "url title"
    });

    res.json(uniqueHistory);
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};                                                                                                                       