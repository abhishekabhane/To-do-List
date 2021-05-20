//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];

mongoose.connect("mongodb+srv://admin-abhishek:@Bhi2001@cluster0.axydn.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const wakeup = new Item({
    name: "wake up"
});
const havebreakfast = new Item({
    name: "have breakfast"
});
const gogymming = new Item({
    name: "go gymming"
});

const defaultItems = [wakeup, havebreakfast, gogymming];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
    const day = date.getDate();

    Item.find({}, function(err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("successfully saved default items to DB");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", { listTitle: day, newListItems: foundItems });
        }
        //console.log(foundItems);
    });
});

app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const listname = req.body.list;

    const item = new Item({
        name: itemName
    });
    const day = date.getDate();

    if (listname === day) {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listname }, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listname);
        });
    }
    //item.save();
    //res.redirect("/");
});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    const day = date.getDate();
    if (listName === day) {
        Item.findByIdAndRemove(checkedItemId, function(err) {
            if (!err) {
                console.log("successfully deleted checked item.");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function(err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }
});

app.get("/:customlist", function(req, res) {
    const customlistname = _.capitalize(req.params.customlist);

    List.findOne({ name: customlistname }, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                // create a new list
                const list = new List({
                    name: customlistname,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customlistname);
            } else {
                // show an existing list
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        }
    });
});

app.get("/about", function(req, res) {
    res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function() {
    console.log("Server started on port 3000");
});

// starting mongodb atlas on git 
// mongo "mongodb+srv://cluster0.axydn.mongodb.net/test" --username admin-abhishek --password @Bhi200