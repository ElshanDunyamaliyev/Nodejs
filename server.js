const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = require("./app.js");

// console.log(app.get("env"));
// console.log(process.env);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log("Listening to port 3000"));
