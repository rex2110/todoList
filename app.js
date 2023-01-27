const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const e = require("express");
const date = require(__dirname + "/date.js");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/todoListDB", {
  useNewUrlParser: true,
});

const itemSchema = mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Buy Food",
});
const item2 = new Item({
  name: "Cook Food",
});
const item3 = new Item({
  name: "Eat Food",
});


const listSchema = mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List",listSchema);
const day = date.getDate();
app.get("/", (req, res) => {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany([item1, item2, item3], (err) => {
        if (err) console.log(err);
      });
      res.redirect("/");
    } else res.render("list", { kindOfDay: day, newListItems: foundItems });
  });
});

app.get("/:customListName",(req,res)=>{
  List.findOne({name: req.params.customListName},(err,foundList)=>{
    if(!err){
      if(!foundList){
        const list = new List({
          name:req.params.customListName,
          items:[item1,item2,item3]
        })
        list.save();
        res.redirect("/"+req.params.customListName);
      }
      else{
        res.render("list", { kindOfDay: foundList.name, newListItems: foundList.items})
      }
    }
  })
})

app.post("/", (req, res) => {
  const item = new Item({
    name: req.body.task,
  });
  item.save();
  res.redirect("/");
});

app.post("/delete", (req, res) => {
  Item.findByIdAndRemove(req.body.checkbox, (err) => {
    if (!err) res.redirect("/");
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port 3000");
});
