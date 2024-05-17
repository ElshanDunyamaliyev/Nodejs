const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/appError");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    algorithm: "HS512",
    expiresIn: "7d",
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

  const token = createToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
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

  const token = createToken(user._id);

  res.status(200).json({
    status: "success",
    data: {
      token,
    },
  });
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
