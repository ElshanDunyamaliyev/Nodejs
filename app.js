const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

app.use(express.json());

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.time = new Date().toISOString();
  next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

module.exports = app;

// app.get("/", getAllTours);
// app.get("/:id", getTour);
// app.post("/", createTour);
// app.patch("/:id", updateTour);
// app.delete("/:id", deleteTour);

// app.route("/api/v1/tours").get(getAllTours).post(createTour);

// app
//   .route("/api/v1/tours/:id")
//   .get(getTour)
//   .patch(updateTour)
//   .delete(deleteTour);
