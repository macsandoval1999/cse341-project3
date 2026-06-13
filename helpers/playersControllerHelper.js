// * Imports
const mongodb = require("../data/connect.js");
const ObjectId = require("mongodb").ObjectId;
const { guildsCollection } = require("./controllerHelper.js");

// * Helper functions
// Normalize stats field to ensure consistent storage as either an array or object
const normalizeStats = (stats) => {
    if (stats === null || stats === undefined) {
        return stats;
    }
    return Array.isArray(stats) ? stats : { ...stats };
};

// Build player object from request body
const buildPlayerObject = (source) => ({
    username: source.username,
    displayName: source.displayName,
    level: source.level,
    championPoints: source.championPoints,
    class: source.class,
    alliance: source.alliance,
    joinDate: source.joinDate ? new Date(source.joinDate) : null,
    role: source.role,
    achievements: source.achievements,
    stats: normalizeStats(source.stats),
    email: source.email,
    bio: source.bio,
    guild_id: source.guild_id ? new ObjectId(source.guild_id) : null,
});

// Build player update fields object from request body (only include provided fields)
const buildPlayerUpdateFields = (source) => {
    const updatedFields = { ...source };
    if (Object.prototype.hasOwnProperty.call(updatedFields, "joinDate")) {
        updatedFields.joinDate = updatedFields.joinDate
            ? new Date(updatedFields.joinDate)
            : null;
    }
    if (Object.prototype.hasOwnProperty.call(updatedFields, "guild_id")) {
        updatedFields.guild_id = updatedFields.guild_id
            ? new ObjectId(updatedFields.guild_id)
            : null;
    }
    if (Object.prototype.hasOwnProperty.call(updatedFields, "stats")) {
        updatedFields.stats = normalizeStats(updatedFields.stats);
    }
    return updatedFields;
};

// Validate that the provided guild_id corresponds to an existing guild
const validateGuildExists = async (guildId, res) => {
    if (!guildId) {
        return true;
    }
    const guild = await guildsCollection().findOne({ _id: guildId });
    if (!guild) {
        res.status(400).json({
            error: "Guild not found for provided guild_id",
        });
        return false;
    }
    return true;
};

// * Exported functions for playersController
module.exports = {
    buildPlayerObject,
    buildPlayerUpdateFields,
    validateGuildExists,
};
