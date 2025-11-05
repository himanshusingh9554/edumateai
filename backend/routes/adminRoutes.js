import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin, requireSuperAdmin } from "../middleware/adminMiddleware.js";
import {
  listUsers,
  updateUserAdmin,
  deleteUserAdmin,
  getAdminStats,
  toggleBan,
  toggleVerify,
  toggleRole,
  exportUsersCsv,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/users", listUsers);
router.patch("/users/:id/ban", toggleBan);
router.patch("/users/:id/verify", toggleVerify);
router.patch("/users/:id/role", toggleRole);
router.delete("/users/:id", deleteUserAdmin);
router.get("/users/export", exportUsersCsv);

export default router;
