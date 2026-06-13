// * Imports
const MongoClient = require("mongodb").MongoClient;

// * Database object to hold the connection
const database = {};

// * MongoDB client instance
let dbClient;

// * Database methods
// Init database connection
database.initDB = (callback) => {
    if (dbClient) {
        console.log("Database connection already initialized.");
        return callback(null, dbClient);
    }
    if (!process.env.MONGODB_URI) {
        return callback(
            new Error("MONGODB_URI is not defined in the environment.")
        );
    }
    MongoClient.connect(process.env.MONGODB_URI)
        .then((client) => {
            dbClient = client;
            callback(null, dbClient);
        })
        .catch((err) => {
            callback(err);
        });
};

// Get the database client
database.getDB = () => {
    if (!dbClient) {
        throw new Error("Database connection not initialized.");
    }
    return dbClient;
};

// * Export the database object
module.exports = { database };
