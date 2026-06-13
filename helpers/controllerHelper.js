// * Imports
const mongodb = require("../data/connect.js");

// * Global Helper functions
// Send Server error response
const sendServerError = (res, err, message) => {
    console.error(message, err);
    res.status(500).json({ error: message });
};

const guildsCollection = () =>
    mongodb.database.getDB().db().collection("guilds");

const playersCollection = () =>
    mongodb.database.getDB().db().collection("players");

module.exports = {
    sendServerError,
    guildsCollection,
    playersCollection,
};