// * Imports
const mongodb = require("../data/connect.js");
const ObjectId = require("mongodb").ObjectId;
const { guildsCollection, playersCollection } = require("./controllerHelper.js");

// * Helper functions
// Build guild object from request body
const buildGuildObject = (source) => ({
    name: source.name,
    tag: source.tag,
    description: source.description,
    alliance: source.alliance,
    memberCount: source.memberCount,
    createdAt: source.createdAt ? new Date(source.createdAt) : null,
    activities: source.activities,
    ranks: source.ranks,
    recruitmentOpen: source.recruitmentOpen,
    language: source.language,
    region: source.region,
    guildMaster: source.guildMaster ? new ObjectId(source.guildMaster) : null,
});

// Build guild update fields object from request body (only include provided fields)
const buildGuildUpdateFields = (source) => {
    const updatedFields = { ...source };
    if (Object.prototype.hasOwnProperty.call(updatedFields, "createdAt")) {
        updatedFields.createdAt = updatedFields.createdAt
            ? new Date(updatedFields.createdAt)
            : null;
    }
    if (Object.prototype.hasOwnProperty.call(updatedFields, "guildMaster")) {
        updatedFields.guildMaster = updatedFields.guildMaster
            ? new ObjectId(updatedFields.guildMaster)
            : null;
    }
    return updatedFields;
};

// Validate that the provided guildMasterId corresponds to an existing player
const validateGuildMasterExists = async (guildMasterId, res) => {
    if (!guildMasterId) {
        return true;
    }
    const guildMaster = await playersCollection().findOne({ _id: guildMasterId });
    if (!guildMaster) {
        res.status(400).json({ error: "Guild master player not found" });
        return false;
    }
    return true;
};

// Validate that a player is not already the guild master of another guild
const validateGuildMasterAvailability = async (
    guildMasterId,
    res,
    currentGuildId = null
) => {
    if (!guildMasterId) {
        return true;
    }
    const existingGuild = await guildsCollection().findOne({
        guildMaster: guildMasterId,
    });
    if (!existingGuild) {
        return true;
    }
    if (currentGuildId && objectIdsMatch(existingGuild._id, currentGuildId)) {
        return true;
    }
    res.status(400).json({
        error: "Player is already the guild master of another guild",
    });
    return false;
};

// Helper function to compare ObjectIds (handles null/undefined cases)
const objectIdsMatch = (firstId, secondId) => {
    if (!firstId || !secondId) {
        return false;
    }
    return firstId.toString() === secondId.toString();
};

// Sync guild master player references when guild master changes
const syncGuildMasterPlayer = async (
    guildId,
    previousGuildMasterId,
    nextGuildMasterId
) => {
    if (
        previousGuildMasterId &&
        (!nextGuildMasterId ||
            !objectIdsMatch(previousGuildMasterId, nextGuildMasterId))
    ) {
        await playersCollection().updateOne(
            {
                _id: previousGuildMasterId,
                guild_id: guildId,
            },
            {
                $set: { guild_id: null },
            }
        );
    }
    if (nextGuildMasterId) {
        await playersCollection().updateOne(
            { _id: nextGuildMasterId },
            { $set: { guild_id: guildId } }
        );
    }
};

// Clear guild_id from all players in a guild when the guild is deleted
const clearGuildFromPlayers = async (guildId) => {
    await playersCollection().updateMany(
        { guild_id: guildId },
        { $set: { guild_id: null } }
    );
};

// * Exported functions for guildsController
module.exports = {
    buildGuildObject,
    buildGuildUpdateFields,
    validateGuildMasterExists,
    validateGuildMasterAvailability,
    syncGuildMasterPlayer,
    clearGuildFromPlayers,
};
