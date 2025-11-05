import User from "../models/User.js";

export const updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    if (!["light", "dark"].includes(theme)) {
      return res.status(400).json({ message: "Invalid theme value." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.theme = theme;
    await user.save();

    res.json({ message: "Theme updated successfully", theme: user.theme });
  } catch (err) {
    console.error("❌ Theme update error:", err);
    res.status(500).json({ message: "Server error while updating theme" });
  }
};

export const getTheme = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ theme: user.theme });
  } catch (err) {
    console.error("❌ Theme fetch error:", err);
    res.status(500).json({ message: "Server error fetching theme" });
  }
};
