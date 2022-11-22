const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

const MongoUtil = require("./MongoUtil");

require('dotenv').config();

const app = express();

app.set('view engine', 'hbs');
wax.on(hbs.handlebars);
wax.setLayoutPath("./view/layouts")
//allows our express application to process forms
app.use(express.urlencoded({
    'extended': false
}));

async function main(){

const url = process.env.MONGO_URI;
await MongoUtil.connect(url, "Watch_Up");
console.log("Connected to the database");

//routes
app.get('/',function(req,res){
    res.send("Hello world")
})

app.engine(
    "hbs",
    expressHbs({
      extname: "hbs",
      defaultLayout: false,
      layoutsDir: "views/layouts/"
    })
  );

app.get('/case', function(req,res){
    res.render('case')
})
}
main();

app.listen(3000, function(){
    console.log("Server has started")
})

// require in the MongoClient
// allow us to connect a Node program to a Mongo Database


// const MongoClient = require("mongodb").MongoClient;
// require('dotenv').config(); // look for the .env file in the same directory

// console.log(process.env);

// async function main(){
//     let url = process.env.MONGO_URI;
//     //  the MongoClient allows us to issue commands to the mongo database
//     let client = await MongoClient.connect(url, {
//     useUnifiedTopology: true
//     })
//     // select which database we want
//     let db = client.db("Watch_Up");
//     console.log("database connected")
//     let watch = await db.collection("watch").find().limit(10).toArray();
// console.log(watch);
// }
// main();
