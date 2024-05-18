const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const filterRequestBodyObj = (obj, ...typedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (typedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.json({
    status: "success",
    createdAt: req.time,
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("You cant update your password here", 400));
  }

  const allowedFieldsForUpdate = filterRequestBodyObj(
    req.body,
    "name",
    "email"
  );

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    allowedFieldsForUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      updatedUser,
    },
  });
});

exports.getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    status: "Success",
    data: {
      user,
    },
  });
});

exports.createUser = (req, res) => {
  res.json({
    status: "Not Implemented yet",
  });
};

exports.updateUser = (req, res) => {
  res.json({
    status: "Not Implemented yet",
  });
};

exports.deleteUser = (req, res) => {
  res.json({
    status: "Not Implemented yet",
  });
};
