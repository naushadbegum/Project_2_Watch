const express = require('express');
const cors = require('cors');

require('dotenv').config();
const MongoUtil = require('./MongoUtil');
const { ObjectId } = require('mongodb');
const WatchRecordDAL = require('./WatchRecordDAL');

const MONGO_URI = process.env.MONGO_URI;

const app = express();

app.use(express.json());

app.use(cors());

// refactor 
async function deleteWatchRecordByID(watchRecordId){
    let watchRecord = await MongoUtil.getDB().collection('listings').deleteOne({
        "_id": ObjectId(watchRecordId)
    });
    return watchRecord;
}

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
        let image = req.body.image;
        let gender = req.body.gender;
        let watchCase = req.body.watch_case;
        let strap = req.body.strap;
        let user = req.body.user;
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
            "image": image,
            "gender": gender,
            "watch_case": ObjectId(watchCase),
            "strap": ObjectId(strap),
            "user": ObjectId(user),
            "review": []
        }
        const db = MongoUtil.getDB();
        const result = await db.collection("listings").insertOne(watchListing);
        res.status(200);
        res.send(result);
    })

    app.get('/watch-listings', async function(req,res){
       
        console.log(req.query);
       
        let criteria = {};

        if (req.query.glass_material) {
            criteria['glass_material'] = {
                "$regex": req.query.glass_material,
                "$options": "i"
            }
        }

        if (req.query.image){
            criteria['image'] = {
                "$in" : [req.query.image]
            }
        }

        let results = await MongoUtil.getDB().collection("listings").find(criteria).toArray();
        res.status(200);
        res.json(results);
    })

    app.delete('/watch-listings/:listing_id',async function(req,res){
        try{
            await WatchRecordDAL.deleteWatchRecordByID(req.params.listing_id);
    // await MongoUtil.getDB().collection('listings').deleteOne({
    // "_id": ObjectId(req.params.listing_id)
    // })

    res.status(200);
    res.json({
    'message': "Food sighting has been deleted"
})

        }catch (e)
 {
    res.status(500);
    res.json({
        "error": e
    });
    console.log(e);
 }    })
}
main();

app.listen(3000, function(){
    console.log("Server has started")
})