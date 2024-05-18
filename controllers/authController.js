const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/appError");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    algorithm: "HS512",
    expiresIn: "7d",
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Email or Password is missing", 400));
  }

  const user = await User.findOne({
    email: req.body.email,
  }).select("+password");

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError("Email or Password is incorrect", 401));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in please log in to get access", 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decoded);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("User is deleted", 401));
  }

  if (currentUser.checkPasswordChanged(decoded.iat)) {
    return next(new AppError("Password is changed, please login again", 401));
  }

  console.log(currentUser);
  req.user = currentUser;
  next();
});

exports.restricTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You dont have permission to delete", 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  console.log(user);
  if (!user) {
    return next(new AppError("Please provide correct email address"));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const message = `You requested password reset. Please click this url: ${req.protocol}://${req.get("host")}/api/v1/users/reset/${resetToken}`;
  console.log(message);
  const options = {
    to: req.body.email,
    subject: "Reset url (Valid for 10 minutes)",
    message,
  };
  try {
    await sendEmail(options);

    res.status(200).json({
      status: "success",
      message: "Password reset token sent successfully",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was error sending email, please try again later", 50)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: resetToken,
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("password reset token expired"));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  console.log(user);
  const result = await user.checkPassword(req.body.password, user.password);
  if (!result) {
    return next(
      new AppError("Password is wrong, please chfindOneeck your password", 400)
    );
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});
