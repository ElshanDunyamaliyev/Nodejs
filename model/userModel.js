const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have name"],
  },
  email: {
    type: String,
    required: [true, "A user must have name"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide correct email"],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "guide", "tour-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "A user must have password"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "A user must have passwordConfirm"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password and passwordConfirm are not same please type again",
    },
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  resetTokenExpires: Date,
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.checkPassword = async (tryPassword, realPassword) => {
  return await bcrypt.compare(tryPassword, realPassword);
};

userSchema.methods.checkPasswordChanged = function (JWTISSUED) {
  if (this.passwordChangedAt) {
    const passwordChangeTimeInt = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTISSUED < passwordChangeTimeInt;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetTokenExpires = Date.now() + 600 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
