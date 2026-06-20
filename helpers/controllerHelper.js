// * Imports
const mongodb = require("../data/connect.js");

// * Global Helper functions
// Send Server error response
const sendServerError = (res, err, message) => {
    console.error(message, err);
    res.status(500).json({ error: message });
};

// Helper functions to get collections
const guildsCollection = () =>
    mongodb.database.getDB().db().collection("guilds");

// Helper function to get the players collection
const playersCollection = () =>
    mongodb.database.getDB().db().collection("players");

// Helper function to get the guild event listings collection
const guildEventListingsCollection = () =>
    mongodb.database.getDB().db().collection("guildEventListings");

// Helper function to get the guild store listings collection
const guildStoreListingsCollection = () =>
    mongodb.database.getDB().db().collection("guildStoreListings");

// * Export
module.exports = {
    sendServerError,
    guildsCollection,
    playersCollection,
    guildEventListingsCollection,
    guildStoreListingsCollection,
};