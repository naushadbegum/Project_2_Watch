const express = require('express');
const cors = require('cors');

require('dotenv').config();
const MongoUtil = require('./MongoUtil');
const { ObjectId } = require('mongodb');
const WatchRecordDAL = require('./WatchRecordDAL');
const validation = require('./Middlewares/validationMiddleware');
const listingValidation = require('./Validations/listingValidation');

const MONGO_URI = process.env.MONGO_URI;

const app = express();

app.use(express.json());

app.use(cors());

// refactor 
async function deleteWatchRecordByID(watchRecordId) {
    let watchRecord = await MongoUtil.getDB().collection('listings').deleteOne({
        "_id": ObjectId(watchRecordId)
    });
    return watchRecord;
}

async function main() {
    await MongoUtil.connect(MONGO_URI, "restful_watch");
    console.log("Database connected")
    app.get('/', function (req, res) {
        res.send("hello world");
    })

    app.get("/strap", async function(req,res){
        let response = await MongoUtil.getDB().collection("strap").find().toArray();
        res.json(response);
    })

    app.get("/case", async function(req,res){
        let response = await MongoUtil.getDB().collection("case").find().toArray();
        res.json(response);
    })

    // app.post("/create-strap", async function (req,res) {
    //     let strapMaterial = req.body.strapMaterial;
    //     let strapDiameter = req.body.strapDiameter;
    //     let strapShape = req.body.strapShape;
    //     let strapColor = req.body.strapColor;

    //     try{
    //         let response = await db.collection("strap").insertOne({
    //             strapMaterial,
    //             strapDiameter,
    //             strapShape,
    //             strapColor
    //         })
    //         res.status(200);
    //         res.json(response);
    //     } catch(e) {
    //         res.status(500);
    //         res.json({
    //             "message": "Interval server error. Please contact administrator"
    //         })
    //         console.log(e)
    //     }
    // })



    app.get("/watch-listings", async function(req,res) {
        let response = await MongoUtil.getDB().collection("listings").aggregate([
            {
                $lookup: {
                    from:"strap",
                    localField: "strap",
                    foreignField: "_id",
                    as: "strap",
                }
            },
            {
                $lookup: {
                    from:"case",
                    localField: "watch_case",
                    foreignField: "_id",
                    as: "watch_case",
                }
            }
        ]).toArray();
        res.json(response);
    })



    app.post("/create-listing", async function(req,res){
        let strapId = ObjectId(req.body.strapId);

        try{
            let response = await MongoUtil.getDB().collection("listings").insertOne({
                strapId
            })
            res.status(200);
            res.json(response);
        } catch(e){
            res.status(500);
            res.json({
                "message": "Internal server error. Please contact administrator"
            })
            console.log(e)
        }
    })

    app.post('/create-listings', validation.validation(listingValidation.listingSchema), async function (req, res) {

        // create empty 
        // validation

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
        // let datetime = new Date(req.body.datetime) || new Date();

        

        let createListing = {
            "brand": brand,  //text
            "model": model,  //text
            "price": price,  //text
            // "datetime": datetime,
            "year_made": yearMade,  //text
            "water_resistance": waterResistance,  //text
            "glass_material": glassMaterial,
            "movements": movements,
            "watch_calender": watchCalender,
            "image": image,
            "gender": gender,
            "watch_case": ObjectId(watchCase),
            "strap": ObjectId(strap),
            "user": user,
            "review": []
        }
        const db = MongoUtil.getDB();
        const result = await db.collection("listings").insertOne(createListing);
        res.status(201);
        res.send(result);
    })


    app.get('/watch-listings', async function (req, res) {

        console.log(req.query);

        let criteria = {};

        if (req.query.glass_material) {
            criteria['glass_material'] = {
                "$regex": req.query.glass_material,
                "$options": "i"
            }
        }

        if (req.query.image) {
            criteria['image'] = {
                "$in": [req.query.image]
            }
        }

        let results = await MongoUtil.getDB().collection("listings").find(criteria).toArray();
        res.status(200);
        res.json(results);
    })

    app.put('/watch-listings/:listing_id', async function (req, res) {
        try {
            let { brand, model, price } = req.body;
            let datetime = new Date(req.body.datetime) || new Date();
            let modifiedDocument = {
                "brand": brand,
                "model": model,
                "price": price
            }
            const result = await MongoUtil.getDB().collection('listings').updateOne({
                "_id": ObjectId(req.params.listing_id)
            }, {
                '$set': modifiedDocument
            });
            res.status(200);
            res.json({
                'message': 'Update success'
            });
        } catch (e) {
            res.status(500);
            res.send(e);
            console.log(e);
        }
    })


    app.delete('/watch-listings/:listing_id', async function (req, res) {
        try {
            await WatchRecordDAL.deleteWatchRecordByID(req.params.listing_id);
            // await MongoUtil.getDB().collection('listings').deleteOne({
            // "_id": ObjectId(req.params.listing_id)
            // })

            res.status(200);
            res.json({
                'message': "Food sighting has been deleted"
            })

        } catch (e) {
            res.status(500);
            res.json({
                "error": e
            });
            console.log(e);
        }
    })
}
main();

app.listen(3000, function () {
    console.log("Server has started")
})