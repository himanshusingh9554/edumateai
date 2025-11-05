import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // admin who acted
    action: { type: String, required: true }, // e.g., "USER_PASSWORD_RESET"
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ip: String,
    userAgent: String,
    meta: Object
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
