// * Imports
const ObjectId = require("mongodb").ObjectId;
const {
    sendServerError,
    guildStoreListingsCollection,
} = require("../helpers/controllerHelper.js");
const {
    buildGuildStoreListingObject,
    buildGuildStoreListingUpdateFields,
    validateOwnerPlayerExists,
    validateSellerGuildExists,
} = require("../helpers/guildStoreListingsControllerHelper.js");

// * Initialize controller object
const guildStoreListingsController = {};

// * Guild Store Listings Controller functions
guildStoreListingsController.getAllGuildStoreListings = async (req, res) => {
    //#swagger.tags = ['Guild Store Listings']
    //#swagger.summary = 'Get all guild store listings'
    //#swagger.description = 'Returns every guild store listing in the collection.'
    try {
        const guildStoreListings = await guildStoreListingsCollection()
            .find()
            .toArray();

        res.setHeader("Content-Type", "application/json");
        res.status(200).json(guildStoreListings);
    } catch (error) {
        sendServerError(res, error, "Failed to retrieve guild store listings");
    }
};

guildStoreListingsController.getGuildStoreListingById = async (req, res) => {
    //#swagger.tags = ['Guild Store Listings']
    //#swagger.summary = 'Get a guild store listing by id'
    //#swagger.description = 'Returns a single guild store listing by its MongoDB ObjectId.'
    try {
        const guildStoreListingId = new ObjectId(req.params.id);
        const guildStoreListing = await guildStoreListingsCollection().findOne({
            _id: guildStoreListingId,
        });

        if (!guildStoreListing) {
            res.status(400).json({ error: "Guild store listing not found" });
            return;
        }

        res.setHeader("Content-Type", "application/json");
        res.status(200).json(guildStoreListing);
    } catch (error) {
        sendServerError(res, error, "Failed to retrieve guild store listing");
    }
};

guildStoreListingsController.createGuildStoreListing = async (req, res) => {
    //#swagger.tags = ['Guild Store Listings']
    //#swagger.summary = 'Create a guild store listing'
    //#swagger.description = 'Creates a new guild store listing. The ownerPlayer_id must be an existing player and sellerGuild_id must reference an existing guild.'
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        description: 'Full guild store listing payload. The ownerPlayer_id must be a valid player ObjectId and sellerGuild_id must reference an existing guild.',
        schema: {
            itemName: 'Rubedite Greatsword',
            itemType: 'Weapon',
            subType: 'Greatsword',
            quality: 'Legendary',
            priceGold: 15000,
            quantity: 1,
            sellerGuild_id: '6a2a3932fba268ea258ee3cf',
            ownerPlayer_id: '6a2a396afba268ea258ee3d4',
            listedAt: '2026-06-20T10:00:00.000Z',
            description: 'Forged from high-tier rubedite. Perfect condition.',
            levelRequirement: 50,
            traits: ['Sharpened'],
            enchantments: ['Stamina Damage'],
            sellerNotes: 'Best in slot weapon for stamina DPS'
        }
    } */
    try {
        const newGuildStoreListing = buildGuildStoreListingObject(req.body);

        if (
            !(await validateOwnerPlayerExists(
                newGuildStoreListing.ownerPlayer_id,
                res
            ))
        ) {
            return;
        }
        if (
            !(await validateSellerGuildExists(
                newGuildStoreListing.sellerGuild_id,
                res
            ))
        ) {
            return;
        }

        const response =
            await guildStoreListingsCollection().insertOne(
                newGuildStoreListing
            );

        if (response.acknowledged) {
            res.status(200).send({
                message: "Guild store listing created successfully",
            });
            return;
        }

        res.status(500).json({
            error: "Failed to create new guild store listing",
        });
    } catch (error) {
        sendServerError(res, error, "Failed to create new guild store listing");
    }
};

guildStoreListingsController.replaceGuildStoreListing = async (req, res) => {
    //#swagger.tags = ['Guild Store Listings']
    //#swagger.summary = 'Replace a guild store listing'
    //#swagger.description = 'Replaces a guild store listing by id. The ownerPlayer_id must be an existing player and sellerGuild_id must reference an existing guild.'
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        description: 'Complete replacement payload for a guild store listing.',
        schema: {
            itemName: 'Service Potion',
            itemType: 'Consumable',
            subType: 'Potion',
            quality: 'Common',
            priceGold: 10,
            quantity: 50,
            sellerGuild_id: '6a2a3932fba268ea258ee3cf',
            ownerPlayer_id: '6a2a396afba268ea258ee3d5',
            listedAt: '2026-06-01T16:30:00.000Z',
            description: 'Basic potion used in training and events.',
            levelRequirement: 1,
            traits: [],
            enchantments: [],
            sellerNotes: 'Bulk sale'
        }
    } */
    try {
        const guildStoreListingId = new ObjectId(req.params.id);
        const newGuildStoreListing = buildGuildStoreListingObject(req.body);
        const existingGuildStoreListing =
            await guildStoreListingsCollection().findOne({
                _id: guildStoreListingId,
            });

        if (!existingGuildStoreListing) {
            res.status(400).json({ error: "Guild store listing not found" });
            return;
        }

        if (
            !(await validateOwnerPlayerExists(
                newGuildStoreListing.ownerPlayer_id,
                res
            ))
        ) {
            return;
        }
        if (
            !(await validateSellerGuildExists(
                newGuildStoreListing.sellerGuild_id,
                res
            ))
        ) {
            return;
        }

        await guildStoreListingsCollection().replaceOne(
            { _id: guildStoreListingId },
            newGuildStoreListing
        );
        res.status(200).send({
            message: "Guild store listing replaced successfully",
        });
    } catch (error) {
        sendServerError(
            res,
            error,
            "Failed to replace existing guild store listing"
        );
    }
};

guildStoreListingsController.updateGuildStoreListing = async (req, res) => {
    //#swagger.tags = ['Guild Store Listings']
    //#swagger.summary = 'Update a guild store listing'
    //#swagger.description = 'Partially updates a guild store listing by id. If provided, ownerPlayer_id must reference an existing player and sellerGuild_id must reference an existing guild.'
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        description: 'Partial guild store listing payload. Include only the fields you want to change.',
        schema: {
            priceGold: 12000,
            sellerNotes: 'Price reduced for quick sale',
            quality: 'Epic'
        }
    } */
    try {
        const guildStoreListingId = new ObjectId(req.params.id);
        const updatedFields = buildGuildStoreListingUpdateFields(req.body);
        const existingGuildStoreListing =
            await guildStoreListingsCollection().findOne({
                _id: guildStoreListingId,
            });

        if (!existingGuildStoreListing) {
            res.status(400).json({ error: "Guild store listing not found" });
            return;
        }

        if (
            Object.prototype.hasOwnProperty.call(
                updatedFields,
                "ownerPlayer_id"
            ) &&
            !(await validateOwnerPlayerExists(
                updatedFields.ownerPlayer_id,
                res
            ))
        ) {
            return;
        }
        if (
            Object.prototype.hasOwnProperty.call(
                updatedFields,
                "sellerGuild_id"
            ) &&
            !(await validateSellerGuildExists(
                updatedFields.sellerGuild_id,
                res
            ))
        ) {
            return;
        }

        await guildStoreListingsCollection().updateOne(
            { _id: guildStoreListingId },
            { $set: updatedFields }
        );
        res.status(200).send({
            message: "Guild store listing updated successfully",
        });
    } catch (error) {
        sendServerError(res, error, "Failed to update guild store listing");
    }
};

guildStoreListingsController.deleteGuildStoreListing = async (req, res) => {
    //#swagger.tags = ['Guild Store Listings']
    //#swagger.summary = 'Delete a guild store listing'
    //#swagger.description = 'Deletes a guild store listing by id.'
    try {
        const guildStoreListingId = new ObjectId(req.params.id);
        const existingGuildStoreListing =
            await guildStoreListingsCollection().findOne({
                _id: guildStoreListingId,
            });

        if (!existingGuildStoreListing) {
            res.status(400).json({ error: "Guild store listing not found" });
            return;
        }

        const response = await guildStoreListingsCollection().deleteOne({
            _id: guildStoreListingId,
        });

        if (response.deletedCount === 0) {
            res.status(400).json({ error: "Guild store listing not found" });
            return;
        }

        res.status(200).send({
            message: "Guild store listing deleted successfully",
        });
    } catch (error) {
        sendServerError(res, error, "Failed to delete guild store listing");
    }
};

// * Export controller
module.exports = guildStoreListingsController;
