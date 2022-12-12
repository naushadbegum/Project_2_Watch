const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const MongoUtil = require("./MongoUtil");

// const WatchRecordDAL = require('./WatchRecordDAL');
const validation = require('./Middlewares/validationMiddleware');
const listingValidation = require('./Validations/listingValidation');

const app = express();
app.use(express.json());
app.use(cors());
const MONGO_URI = process.env.MONGO_URI;

// refactor 
// async function deleteWatchRecordByID(watchRecordId) {
//     let watchRecord = await MongoUtil.getDB().collection('listings').deleteOne({
//         "_id": ObjectId(watchRecordId)
//     });
//     return watchRecord;
// }

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
    // app.post('/create-listings',  async function (req, res) {
    app.post('/create-listings', validation.validation(listingValidation.listingSchema), async function (req, res) {
        console.log("req.body=", req.body)
        console.log(req.body.caseId, req.body.strapId);
        let brand = req.body.brand;
        let model = req.body.model;
        let price = req.body.price;
        let yearMade = req.body.year_made;
        let waterResistance = req.body.water_resistance;
        let glassMaterial = req.body.glass_material;
        let movements = req.body.movements;
        let image = req.body.image;
        let gender = req.body.gender;
        let strapId = ObjectId(req.body.strapId);
        let caseId = ObjectId(req.body.caseId);
        let user = req.body.user;

        try {
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
                strapId,
                caseId,
                user
            })
            res.status(200);
            res.json(response);
        } catch (e) {
            res.status(500);
            res.json({
                "message": "Internal server error."
            });
            console.log(e)
        }
    })
    // app.post('/create-listings', async function (req, res) {
    //     try {
    //         await MongoUtil.getDB().collection("listings").insertOne({
    //             "brand": req.body.brand,
    //             "model": req.body.model,
    //             "price": req.body.price,
    //             "year_made": req.body.year_made,
    //             "water_resistance": req.body.waterResistance,
    //             "glass_material": req.body.glassMaterial,
    //             "movements": req.body.movements,
    //             "image": req.body.image,
    //             "gender": req.body.gender,
    //             "caseId": ObjectId(req.body.caseId),
    //             "strapId": ObjectId(req.body.strapId),
    //             "user": req.body.user,
    //         })

    //         res.status(200);
    //         res.json({
    //             'message': "watch listing added"
    //         })

    //     } catch (e) {
    //         res.status(500);
    //         res.json({
    //             "error": e
    //         });
    //         console.log(e);
    //     }
    // })



    app.get("/straps", async function (req, res) {
        let response = await MongoUtil.getDB().collection("straps").find().toArray();
        res.json(response);
    })

    app.get("/cases", async function (req, res) {
        let response = await MongoUtil.getDB().collection("cases").find().toArray();
        res.json(response);
    })

    app.get("/watch-listings", async function (req, res) {
        console.log(req.query)
        let search = {};
        let projection = {
            projection: {
            "user.email":0,
            }
        }

        if (req.query.brand) {
            search["brand"] = {
                $regex: req.query.brand,
                $options: "i",
            }
        }

        if (req.query.model) {
            search["model"] = {
                $regex: req.query.model,
                $options: "i",
            }
        }

        if (req.query.movements) {
            search["movements"] = {
                $regex: req.query.movements,
                $options: "i"
            }
        }

        if (req.query.gender) {
            search["gender"] = {
                $eq: req.query.gender,
            }
        }

        if (req.query.glass_material) {
            search["glass_material"] ={
                $regex : req.query.glass_material,
                $options: "i"
            }
        }

        if (req.query.email) {
            search["user.email"] ={
                $regex: req.query.email,
                $options: "i",
            }
        }

        let response = await MongoUtil.getDB().collection("listings").aggregate([
            {
                $match: search
            },
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
        ],projection).toArray();
        res.json(response);
    })

    app.get("/watch-listing/:listing_id", async function (req, res) {
        try {
            let search = {};
            let projection = {
                projection: {
                "user.email":0,
                }
            }
            // if (req.params.id) {
                search["_id"] = {
                    "$eq": ObjectId(req.params.listing_id)
                }
            // }
            let response = await MongoUtil.getDB().collection("listings").aggregate([
                {
                    $match: search
                },
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
            ],projection).toArray();
            res.json(response);
        } catch (e) {
            res.status(500);
            res.json({
                "message": "Internal server error. Please contact administrator"
            })
            console.log(e)
        }
    })


    app.put('/watch-listings/:listing_id', async function (req, res) {
        try {
            let { brand,
                model,
                price,
                year_made,
                glass_material,
                water_resistance,
                movements,
                image,
                gender,
                strapId,
                caseId } = req.body;
            let updatedWatchlisting = {
                "brand": brand,
                "model": model,
                "price": price,
                "year_made": year_made,
                "water_resistance": water_resistance,
                "glass_material": glass_material,
                "movements": movements,
                "image": image,
                "gender": gender,
                "caseId": ObjectId(caseId),
                "strapId": ObjectId(strapId),
            }
            const result = await MongoUtil.getDB().collection('listings').updateOne({
                "_id": ObjectId(req.params.listing_id)
            }, {
                '$set': updatedWatchlisting
            });
            res.status(200, result);
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
            // await WatchRecordDAL.deleteWatchRecordByID(req.params.listing_id);
            await MongoUtil.getDB().collection('listings').deleteOne({
                "_id": ObjectId(req.params.listing_id)
            })

            res.status(200);
            res.json({
                'message': "Watch listing has been deleted"
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