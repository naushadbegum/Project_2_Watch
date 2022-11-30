const express = require('express');
const cors = require('cors');

require('dotenv').config();
const MongoUtil = require('./MongoUtil');
const ObjectId = require("mongodb");
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



    app.post("/create-strap", async function (req, res) {
        let strapMaterial = req.body.strapMaterial;

        try {
            let response = await MongoUtil.getDB().collection("straps").insertOne({
                strapMaterial
            })
            res.status(200);
            res.json(response);
        } catch (e) {
            res.status(500);
            res.json({
                "message": "Interval server error. Please contact administrator"
            })
            console.log(e)
        }
    })

    app.post("/create-case", async function (req, res) {
        let caseMaterial = req.body.caseMaterial;

        try {
            let response = await MongoUtil.getDB().collection("cases").insertOne({
                caseMaterial
            })
            res.status(200);
            res.json(response);
        } catch (e) {
            res.status(500);
            res.json({
                "message": "Interval server error. Please contact administrator"
            })
            console.log(e)
        }
    })


    // app.post("/create-listing", async function (req, res) {
    //     let strapId = ObjectId(req.body.strapId);
    //     let caseId = ObjectId(req.body.brandId);

    //     try {
    //         let response = await MongoUtil.getDB().collection("listings").insertOne({
    //             strapId,
    //             caseId
    //         })
    //         res.status(200);
    //         res.json(response);
    //     } catch (e) {
    //         res.status(500);
    //         res.json({
    //             "message": "Internal server error. Please contact administrator"
    //         })
    //         console.log(e)
    //     }
    // })
    // app.post('/create-listings', validation.validation(listingValidation.listingSchema), async function (req, res) {
    app.post('/create-listings', async function (req, res) {

        let brand = req.body.brand;
        let model = req.body.model;
        let price = req.body.price;
        let yearMade = req.body.year_made;
        let waterResistance = req.body.water_resistance;
        let glassMaterial = req.body.glass_material;
        let movements = req.body.movements;
        let image = req.body.image;
        let gender = req.body.gender;
        let caseId = ObjectId(req.body.caseId.trim());
        let strapId = ObjectId(req.body.strapId.trim());
        let user = req.body.user;

        

        try{
            let response = await MongoUtil.getDB().collection("listings").insertOne({
                brand,
                model,
                price,
                yearMade,
                waterResistance,
                glassMaterial,
                movements,
                image,
                gender,
                caseId,
                strapId,
                user
            })
            res.status(200);
            res.json(response);
        } catch (e) {
            res.status(500);
            res.json({
                "message": "Internal server error."
            })
            console.log(e)
        }

        // let createListing = {
        //     "brand": brand,  //text
        //     "model": model,  //text
        //     "price": price,  //text
        //     "year_made": yearMade,  //text
        //     "water_resistance": waterResistance,  //text
        //     "glass_material": glassMaterial,
        //     "movements": movements,
        //     "image": image,
        //     "gender": gender,
        //     "caseId": ObjectId(caseId),
        //     "strapId": ObjectId(strapId),
        //     "user": user,
        // }
        // const db = MongoUtil.getDB();
        // const result = await db.collection("listings").insertOne(createListing);
        // res.status(201);
        // res.send(result);
    })

    app.get("/straps", async function (req, res) {
        let response = await MongoUtil.getDB().collection("straps").find().toArray();
        res.json(response);
    })

    app.get("/cases", async function (req, res) {
        let response = await MongoUtil.getDB().collection("cases").find().toArray();
        res.json(response);
    })

    app.get("/watch-listings", async function (req, res) {
        let response = await MongoUtil.getDB().collection("listings").aggregate([
            {
                $lookup: {
                    from: "straps",
                    localField: "strapId",
                    foreignField: "_id",
                    as: "strapId",
                }
            },
            {
                $lookup: {
                    from: "cases",
                    localField: "caseId",
                    foreignField: "_id",
                    as: "caseId",
                }
            }
        ]).toArray();
        res.json(response);
    })

    // app.get('/watch-listings', async function (req, res) {

    //     console.log(req.query);

    //     let criteria = {};

    //     if (req.query.glass_material) {
    //         criteria['glass_material'] = {
    //             "$regex": req.query.glass_material,
    //             "$options": "i"
    //         }
    //     }

    //     if (req.query.image) {
    //         criteria['image'] = {
    //             "$in": [req.query.image]
    //         }
    //     }

    //     let results = await MongoUtil.getDB().collection("listings").find(criteria).toArray();
    //     res.status(200);
    //     res.json(results);
    // })

    // app.put('/watch-listings/:listing_id', async function (req, res) {
    //     try {
    //         let { brand, model, price } = req.body;
    //         let modifiedDocument = {
    //             "brand": brand,
    //             "model": model,
    //             "price": price
    //         }
    //         const result = await MongoUtil.getDB().collection('listings').updateOne({
    //             "_id": ObjectId(req.params.listing_id)
    //         }, {
    //             '$set': modifiedDocument
    //         });
    //         res.status(200);
    //         res.json({
    //             'message': 'Update success'
    //         });
    //     } catch (e) {
    //         res.status(500);
    //         res.send(e);
    //         console.log(e);
    //     }
    // })


    // app.delete('/watch-listings/:listing_id', async function (req, res) {
    //     try {
    //         await WatchRecordDAL.deleteWatchRecordByID(req.params.listing_id);
    //         // await MongoUtil.getDB().collection('listings').deleteOne({
    //         // "_id": ObjectId(req.params.listing_id)
    //         // })

    //         res.status(200);
    //         res.json({
    //             'message': "Food sighting has been deleted"
    //         })

    //     } catch (e) {
    //         res.status(500);
    //         res.json({
    //             "error": e
    //         });
    //         console.log(e);
    //     }
    // })
}
main();

app.listen(3000, function () {
    console.log("Server has started")
})