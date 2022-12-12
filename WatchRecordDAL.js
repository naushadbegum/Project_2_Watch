const MongoUtil = require('./MongoUtil');
const ObjectId = require("mongodb").ObjectId;

async function deleteWatchRecordByID(watchRecordId){
    let watchRecord = await MongoUtil.getDB().collection('listings').deleteOne({
        "_id": ObjectId(watchRecordId)
    });
    return watchRecord;
}

module.exports = {
    deleteWatchRecordByID
}