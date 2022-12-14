const MongoClient = require("mongodb").MongoClient;

let _db = null;

async function connect(url, databaseName){
    let client = await MongoClient.connect(url, {
        useUnifiedTopology:true
    })
    _db =client.db(databaseName);
}
 
function getDB() {
    return _db;
}
// share the connect and getDB functions with other js files

module.exports = {connect, getDB}