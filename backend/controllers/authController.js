import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendEmail } from "../utils/sendEmail.js";
import path from "path";
import fs from "fs";

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    const existingUser = await User.findOne({ email });

    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name;
      existingUser.password = password; 
      await existingUser.save();

      await Otp.deleteMany({ email });
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await Otp.create({ email, otp: otpCode });

      await sendEmail(
        email,
        "EduMate AI - Verify Your Email",
        `<h3>Hello ${name}!</h3>
         <p>You already registered but not verified.</p>
         <p>Your new OTP is: <b>${otpCode}</b></p>
         <p>This OTP expires in 5 minutes.</p>`
      );

      return res.json({
        message:
          "New OTP sent. Please verify your email to complete registration.",
      });
    }

    if (existingUser && existingUser.isVerified) {
      return res
        .status(400)
        .json({ error: "Email already registered and verified." });
    }

    const user = await User.create({ name, email, password });
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, otp: otpCode });

    await sendEmail(
      email,
      "EduMate AI - Verify Your Email",
      `<h3>Welcome ${name}!</h3>
       <p>Your OTP for verification is: <b>${otpCode}</b></p>
       <p>This OTP expires in 5 minutes.</p>`
    );

    res.status(201).json({
      message: "Signup successful! Please verify your email using the OTP sent.",
    });
  } catch (err) {
    console.error("❌ Signup Error:", err);
    res.status(500).json({ error: "Signup failed, please try again." });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ error: "Invalid or expired OTP" });

    await User.findOneAndUpdate({ email }, { isVerified: true });
    await Otp.deleteMany({ email });

    res.json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;


    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid email or password" });

    if (!user.isVerified)
      return res.status(403).json({ error: "Please verify your email before logging in." });

    if (user.isDeleted)
      return res.status(403).json({ error: "Your account has been deactivated. Contact admin." });

    if (user.isBanned)
      return res.status(403).json({ error: "Your account has been banned. Contact support." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    const { password: _, ...safeUser } = user.toObject();
res.json({
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    profilePhoto: user.profilePhoto,
    role: user.role,       // ✅ important
  },
});
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newName =
      req.body?.name || (req.fields && req.fields.name) || user.name;
    if (newName) user.name = newName;

    if (req.file) {
      try {
        if (
          user.profilePhoto &&
          !user.profilePhoto.includes("flaticon") &&
          !user.profilePhoto.includes("cdn-icons") &&
          fs.existsSync(path.join(process.cwd(), user.profilePhoto))
        ) {
          fs.unlinkSync(path.join(process.cwd(), user.profilePhoto));
        }
      } catch (err) {
        console.warn("⚠️ Old photo delete skipped:", err.message);
      }

      user.profilePhoto = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        ...user._doc,
        profilePhoto: user.profilePhoto.startsWith("http")
          ? user.profilePhoto
          : `${req.protocol}://${req.get("host")}${user.profilePhoto}`,
      },
    });
  } catch (error) {
    console.error("❌ Profile update error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};
export const deleteProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.profilePhoto && !user.profilePhoto.includes("flaticon")) {
      const possiblePath = user.profilePhoto.replace(/^\//, "");
      const filePath = path.join(process.cwd(), possiblePath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    user.profilePhoto = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    await user.save();

    res.json({ message: "Profile photo deleted", user });
  } catch (error) {
    res.status(500).json({ message: "Error deleting profile photo" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect current password" });

    user.password = newPassword; 
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password" });
  }
};

export const requestPasswordOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email: user.email, otp: otpCode });

    await sendEmail(
      user.email,
      "EduMate AI - Password Change Verification",
      `<p>Your OTP to change your password is <b>${otpCode}</b>.</p>
       <p>This OTP expires in 5 minutes.</p>`
    );

    res.json({ message: "OTP sent to your registered email." });
  } catch (error) {
    console.error("❌ requestPasswordOtp Error:", error);
    res.status(500).json({ error: "Failed to send OTP. Try again later." });
  }
};

export const verifyPasswordOtp = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const record = await Otp.findOne({ email: user.email, otp });
    if (!record)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    user.password = newPassword; 
    await user.save();
    await Otp.deleteMany({ email: user.email });

    res.json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error("❌ verifyPasswordOtp Error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Email not found" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, otp: otpCode });

    await sendEmail(
      email,
      "EduMate AI - Password Reset OTP",
      `<p>Your OTP to reset password is <b>${otpCode}</b></p>`
    );

    res.json({ message: "OTP sent to email for password reset" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = await Otp.findOne({ email, otp });
    if (!record)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });
    await Otp.deleteMany({ email });

    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  res.json({ message: "Logged out successfully. Token invalidated on client." });
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ error: "User already verified" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, otp: otpCode });

    await sendEmail(
      email,
      "EduMate AI - Resend OTP",
      `<p>Your new OTP is <b>${otpCode}</b></p>`
    );

    res.json({ message: "OTP resent to your email." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
