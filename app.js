const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
app.get("/", (req, res) => {
  const day = date.getDate();
  res.render("list", { kindOfDay: day, newListItems: items });
});

app.post("/", (req, res) => {
  items.push(req.body.task);
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
