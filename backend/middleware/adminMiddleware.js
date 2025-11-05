export const requireAdmin = (req, res, next) => {
  try {
    // `protect` must already have set req.user
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
 if (!req.user || !["admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Superadmin only" });
  }
  next();
};
