const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");

const app = require("./app.js");
const connection = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(connection).then((con) => {
  console.log("Db connection successful");
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log("Listening to port 3000"));
