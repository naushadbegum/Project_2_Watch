const express = require('express');
const cors = require('cors');

require('dotenv').config();
const MongoUtil = require('./MongoUtil');

const MONGO_URI = process.env.MONGO_URI;

const app = express();

app.use(express.json());

app.use(cors());

async function main() {
    await MongoUtil.connect(MONGO_URI, "restful_watch");
    console.log("Database connected")
    app.get('/', function(req,res){
        res.send("hello world");
    })

    app.post('/watch-listings', async function(req,res){
        let brand = req.body.brand;
        let model = req.body.model;
        let price = req.body.price;
        let yearMade = req.body.year_made;
        let waterResistance = req.body.water_resistance;
        let glassMaterial = req.body.glass_material;
        let movements = req.body.movements;
        let watchCalender = req.body.watch_calender;
        let gender = req.body.gender;
        // format YYYY-MM-DD
        let datetime= new Date(req.body.datetime) || new Date();

        let watchListing = {
            "brand": brand,
            "model": model,
            "price": price,
            "datetime": datetime,
            "year_made": yearMade,
            "water_resistance": waterResistance,
            "glass_material": glassMaterial,
            "movements": movements,
            "watch_calender": watchCalender,
            "gender": gender
        }
        const db = MongoUtil.getDB();
        const result = await db.collection("listings").insertOne(watchListing);
        res.status(200);
        res.send(result);
    })
}
main();

app.listen(3000, function(){
    console.log("Server has started")
})