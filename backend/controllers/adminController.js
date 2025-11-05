import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import bcrypt from "bcryptjs";
import { Parser } from "json2csv";

const logAdminAction = async (req, action, targetUserId, meta = {}) => {
  try {
    await AuditLog.create({
      actor: req.user._id,
      action,
      targetUser: targetUserId || undefined,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      meta
    });
  } catch (e) {
    console.warn("Audit log write failed:", e.message);
  }
};


export const listUsers = async (req, res) => {
  const {
    q = "",
    page = 1,
    limit = 20,
    role,
    verified,
    banned,
    deleted,
    sort = "-createdAt"
  } = req.query;

  const filter = {};

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } }
    ];
  }
  if (role) filter.role = role;
  if (verified !== undefined) filter.isVerified = verified === "true";
  if (banned !== undefined) filter.isBanned = banned === "true";
  if (deleted !== undefined) filter.isDeleted = deleted === "true";

  const pageNum = Math.max(1, parseInt(page));
  const perPage = Math.min(100, Math.max(1, parseInt(limit)));

  const [items, total] = await Promise.all([
    User.find(filter).sort(sort).skip((pageNum - 1) * perPage).limit(perPage),
    User.countDocuments(filter)
  ]);

  res.json({
    page: pageNum,
    total,
    totalPages: Math.ceil(total / perPage),
    items
  });
};


export const updateUserAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, role, isVerified, isBanned, bannedReason } = req.body;

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (role && req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Only superadmin can change roles" });
  }

  if (name) user.name = name;
  if (typeof isVerified === "boolean") user.isVerified = isVerified;
  if (typeof isBanned === "boolean") user.isBanned = isBanned;
  if (bannedReason !== undefined) user.bannedReason = bannedReason;
  if (role) user.role = role;

  await user.save();
  await logAdminAction(req, "USER_UPDATE", user._id, { name, role, isVerified, isBanned });

  res.json({ message: "User updated", user });
};


export const deleteUserAdmin = async (req, res) => {
  const { id } = req.params;
  const hard = req.query.hard === "true";

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (hard) {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Only superadmin can hard-delete" });
    }
    await user.deleteOne();
    await logAdminAction(req, "USER_HARD_DELETE", id);
    return res.json({ message: "User permanently deleted" });
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();
  await logAdminAction(req, "USER_SOFT_DELETE", id);

  res.json({ message: "User soft-deleted" });
};


export const adminResetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 chars" });
  }

  const user = await User.findById(id).select("+password");
  if (!user) return res.status(404).json({ error: "User not found" });
  user.password = newPassword;
  await user.save();

  await logAdminAction(req, "USER_PASSWORD_RESET", id);
  res.json({ message: "Password reset successfully" });
};

export const banUser = async (req, res) => {
  const { id } = req.params;
  const { ban = true, reason = "" } = req.body;

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.isBanned = !!ban;
  user.bannedReason = ban ? reason : undefined;
  await user.save();

  await logAdminAction(req, ban ? "USER_BANNED" : "USER_UNBANNED", id, { reason });
  res.json({ message: ban ? "User banned" : "User unbanned", user });
};

export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, verified, banned, admins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ role: { $in: ["admin", "superadmin"] } }),
    ]);

    res.json({
      users: totalUsers,
      verified,
      banned,
      admins,
      activities: await AuditLog.countDocuments(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const toggleVerify = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isVerified = isVerified;
    await user.save();

    await AuditLog.create({
      actor: req.user._id,
      action: isVerified ? "USER_VERIFIED" : "USER_UNVERIFIED",
      targetUser: user._id,
      meta: { isVerified },
    });

    res.json({ message: `User ${isVerified ? "verified" : "unverified"}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleBan = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isBanned = isBanned;
    await user.save();

    await AuditLog.create({
      actor: req.user._id,
      action: isBanned ? "USER_BANNED" : "USER_UNBANNED",
      targetUser: user._id,
      meta: { isBanned },
    });

    res.json({ message: `User ${isBanned ? "banned" : "unbanned"}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (req.user.role !== "superadmin" && role === "superadmin") {
      return res.status(403).json({ error: "Only superadmin can assign this role" });
    }

    user.role = role;
    await user.save();

    await AuditLog.create({
      actor: req.user._id,
      action: "USER_ROLE_CHANGE",
      targetUser: user._id,
      meta: { role },
    });

    res.json({ message: `Role updated to ${role}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const exportUsersCsv = async (req, res) => {
  try {
    const users = await User.find({}).select("name email role isVerified isBanned createdAt");
    const parser = new Parser();
    const csv = parser.parse(users);

    res.header("Content-Type", "text/csv");
    res.attachment("users.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const listAuditLogs = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || 20)));

  const [items, total] = await Promise.all([
    AuditLog.find({})
      .populate("actor", "name email role")
      .populate("targetUser", "name email")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit),
    AuditLog.countDocuments({})
  ]);

  res.json({ page, total, totalPages: Math.ceil(total / limit), items });
};
