const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");

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
