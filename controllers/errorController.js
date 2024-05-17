const showErrorDev = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const showErrorProd = (res, err) => {
  if (err.isOperational) {
    if (err.name === "CastError") {
      res.status(err.statusCode).json({
        status: err.status,
        message: `Invalid ${err.path}:${err.value}`,
      });
    } else if (err.errorResponse.errmsg.includes("duplicate key")) {
      res.status(err.statusCode).json({
        status: err.status,
        message: `${Object.keys(err.keyPattern)} has to be unique`,
      });
    } else if (err.name === "ValidatorError") {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV == "development") {
    showErrorDev(res, err);
  } else if (process.env.NODE_ENV == "production") {
    if (err.name === "CastError" || err.name === "ValidatorError") {
      err.isOperational = true;
    }
    // else if (err.errorResponse.errmsg.includes("duplicate key")) {
    //   err.isOperational = true;
    // }
    showErrorProd(res, err);
  }
};
