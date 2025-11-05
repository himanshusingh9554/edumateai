import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, select: false },
    profilePhoto: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    isVerified: { type: Boolean, default: false, index: true },
    theme: { type: String, enum: ["light", "dark"], default: "light" },

    // 🔹 Admin/RBAC
    role: { type: String, enum: ["user", "admin", "superadmin"], default: "user", index: true },

    // 🔹 Moderation / lifecycle
    isBanned: { type: Boolean, default: false, index: true },
    bannedReason: { type: String },

    // 🔹 Soft delete (keeps rows for analytics)
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date }
  },
  { timestamps: true }
);

// Hash on create/change
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
