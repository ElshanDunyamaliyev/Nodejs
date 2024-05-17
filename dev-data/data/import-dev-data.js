const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const Tour = require("../../model/tourModel");

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));

const connection = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(connection).then((con) => {
  console.log("Db connection successful");
});

const importData = async () => {
  try {
    await Tour.create(tours);
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
