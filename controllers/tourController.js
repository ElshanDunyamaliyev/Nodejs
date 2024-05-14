const fs = require("fs");

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`, "utf-8")
);

exports.checkId = (req, res, next, val) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({ status: "failed", message: "Invalid Id" });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).send("Bad request");
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.json({
    status: "success",
    createdAt: req.time,
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id;
  const tour = tours.find((t) => t.id == id);
  // if (tour == null) {
  //   return res.status(404).json({ status: "failed", message: "Invalid Id" });
  // }
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  console.log(req.body);
  const newId = tours.length + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours.json`,
    JSON.stringify(tours),
    (err) => console.log(err)
  );
  res.json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
};

exports.updateTour = (req, res) => {
  const id = req.params.id;
  const tour = tours.find((t) => t.id == id);
  const fields = req.body;
  const updatedTour = { ...tour, ...fields };
  const updatedTours = tours.map((t) => {
    if (t.id == id) {
      t = updatedTour;
      return t;
    } else {
      return t;
    }
  });

  fs.writeFile(
    `${__dirname}/dev-data/data/tours.json`,
    JSON.stringify(updatedTours),
    (err) => console.log(err)
  );

  res.status(200).json({
    status: "success",
    data: {
      updatedTour,
    },
  });
};

exports.deleteTour = (req, res) => {
  const id = req.params.id;

  const updatedTours = tours.filter((t) => t.id != id);

  fs.writeFile("./tours.json", JSON.stringify(updatedTours), (err) =>
    console.log(err)
  );

  res.json({
    status: "Deleted",
  });
};
