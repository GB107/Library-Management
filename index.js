const express= require("express");
const bodyParser= require("body-parser");
const ejs= require("ejs");
const mongoose= require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 8;
const User=require("./db/db")
const app= express();
const port = 5000;
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));


app.get("/",(req,res)=>{
  res.render("home",{success:""});
});

app.get("/register",(req,res)=>{
    res.render("register",{failure:""});
});

app.get("/login",(req,res)=>{
    res.render("login",{failure:""});
});

app.get("/book",(req,res)=>{
    res.render("book");
});

app.post("/register", (req, res) => {
    const { username, password, cpassword, name } = req.body;
    User.findOne({ username }, (err, doc) => {
    if (doc) {
    return res.render("register", { failure: "Username already exists" });
    }
    if (password !== cpassword) {
    return res.render("register", { failure: "Passwords don't match" });
    }
    bcrypt.hash(password, saltRounds, (err, hash) => {
    const user = new User({ name, username, password: hash });
    user.save();
    res.render("home", { success: "Registration successful" });
    });
    });
   });
   

   app.post("/login", (req, res) => {
    User.findOne({username: req.body.username}, (err, doc) => {
    if (doc) {
    bcrypt.compare(req.body.password, doc.password, (err, result) => {
    if (result === true) {
    res.render("profile", {name: doc.name, books: doc.books});
    userProfile = doc.username;
    } else {
    res.render("login", {failure: "Incorrect Password"});
    }
    });
    } else {
    res.render("login", {failure: "Incorrect Username"});
    }
    });
   });
   

app.post("/add", async (req, res) => { 
    try { const user = await User.findOne({ username: userProfile }); 
    const book = { name: req.body.name, author: req.body.author, };
     user.books.push(book);
      await user.save(); 
      res.render("profile", { name: user.name, books: user.books }); }
       catch (err) 
       { console.error(err); 
        res.status(500).send("Internal Server Error"); } });

app.post("/update", (req, res) => {
const { action, index } = req.body;
           
User.findOne({ username: userProfile }, (err, doc) => {
if (action === "update") {
res.render("update", { index });
} else {
 doc.books.splice(index, 1);
doc.save();
 res.render("profile", { name: doc.name, books: doc.books });
 }
 });
 });
           

app.post("/change", (req, res) => {
const { name, author } = req.body;
  User.findOne({ username: userProfile }, (err, doc) => {
const obj = { name, author };
  const index = 0;
 doc.books.splice(index, 1, obj);
  doc.save();
  res.render("profile", { name: doc.name, books: doc.books });
  });
  });

app.listen(port,()=>{
  console.log(`server started at port ${port}`);
});
