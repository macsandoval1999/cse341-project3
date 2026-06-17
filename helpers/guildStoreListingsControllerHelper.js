// * Imports
const ObjectId = require("mongodb").ObjectId;
const {
    guildsCollection,
    playersCollection,
} = require("./controllerHelper.js");

// * Helper functions
const normalizeStringArray = (values) => {
    if (!Array.isArray(values)) {
        return [];
    }
    return values.filter((value) => value !== null && value !== undefined);
};

const buildGuildStoreListingObject = (source) => ({
    itemName: source.itemName,
    itemType: source.itemType,
    subType: source.subType || null,
    quality: source.quality || null,
    priceGold: source.priceGold,
    quantity: source.quantity,
    sellerGuild_id: source.sellerGuild_id
        ? new ObjectId(source.sellerGuild_id)
        : null,
    ownerPlayer_id: source.ownerPlayer_id
        ? new ObjectId(source.ownerPlayer_id)
        : null,
    listedAt: source.listedAt ? new Date(source.listedAt) : null,
    description: source.description || null,
    levelRequirement: source.levelRequirement ?? null,
    traits: normalizeStringArray(source.traits),
    enchantments: normalizeStringArray(source.enchantments),
    sellerNotes: source.sellerNotes || null,
});

const buildGuildStoreListingUpdateFields = (source) => {
    const updatedFields = { ...source };

    if (Object.prototype.hasOwnProperty.call(updatedFields, "ownerPlayer_id")) {
        updatedFields.ownerPlayer_id = updatedFields.ownerPlayer_id
            ? new ObjectId(updatedFields.ownerPlayer_id)
            : null;
    }
    if (Object.prototype.hasOwnProperty.call(updatedFields, "sellerGuild_id")) {
        updatedFields.sellerGuild_id = updatedFields.sellerGuild_id
            ? new ObjectId(updatedFields.sellerGuild_id)
            : null;
    }
    if (Object.prototype.hasOwnProperty.call(updatedFields, "listedAt")) {
        updatedFields.listedAt = updatedFields.listedAt
            ? new Date(updatedFields.listedAt)
            : null;
    }
    if (Object.prototype.hasOwnProperty.call(updatedFields, "traits")) {
        updatedFields.traits = normalizeStringArray(updatedFields.traits);
    }
    if (Object.prototype.hasOwnProperty.call(updatedFields, "enchantments")) {
        updatedFields.enchantments = normalizeStringArray(
            updatedFields.enchantments
        );
    }

    return updatedFields;
};

const validateOwnerPlayerExists = async (ownerPlayerId, res) => {
    if (!ownerPlayerId) {
        return true;
    }

    const player = await playersCollection().findOne({ _id: ownerPlayerId });
    if (!player) {
        res.status(400).json({ error: "Owner player not found" });
        return false;
    }

    return true;
};

const validateSellerGuildExists = async (sellerGuildId, res) => {
    if (!sellerGuildId) {
        return true;
    }

    const guild = await guildsCollection().findOne({ _id: sellerGuildId });
    if (!guild) {
        res.status(400).json({
            error: "Guild not found for provided sellerGuild_id",
        });
        return false;
    }

    return true;
};

// * Exported functions for guildStoreListingsController
module.exports = {
    buildGuildStoreListingObject,
    buildGuildStoreListingUpdateFields,
    validateOwnerPlayerExists,
    validateSellerGuildExists,
};
