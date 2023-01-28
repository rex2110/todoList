const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://admin-rakshit:Test123@cluster0.cwwyb2x.mongodb.net/todoListDB", {
  useNewUrlParser: true,
});

const itemSchema = mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todoList!",
});
const item2 = new Item({
  name: "Hit the + button to add new item",
});
const item3 = new Item({
  name: "Hit this checkbox to delete an item",
});
const item4 = new Item({
  name: "To add custom todoList, please type after url, the name of list",
});

const listSchema = mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model("List", listSchema);
const day = date.getDate();

app.get("/", (req, res) => {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany([item1, item2, item3, item4], (err) => {
        if (err) console.log(err);
      });
      res.redirect("/");
    } else res.render("list", { listTitle: day, newListItems: foundItems });
  });
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: [item1, item2, item3, item4],
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.post("/", (req, res) => {
  const itemName = req.body.task;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });

  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === day) {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (!err) res.redirect("/");
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err, foundList) => {
        if (!err) res.redirect("/" + listName);
      }
    );
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server has started successfully");
});
