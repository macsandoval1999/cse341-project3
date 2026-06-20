// * Imports
const ObjectId = require("mongodb").ObjectId;
const {
    sendServerError,
    guildEventListingsCollection,
} = require("../helpers/controllerHelper.js");
const {
    buildGuildEventListingObject,
    buildGuildEventListingUpdateFields,
    validateOrganizerExists,
    validateGuildExists,
    validateAttendeesExist,
} = require("../helpers/guildEventListingsControllerHelper.js");

// * Initialize controller object
const guildEventListingsController = {};

// * Guild Event Listings Controller functions
guildEventListingsController.getAllGuildEventListings = async (req, res) => {
    //#swagger.tags = ['Guild Event Listings']
    //#swagger.summary = 'Get all guild event listings'
    //#swagger.description = 'Returns every guild event listing in the collection.'
    try {
        const guildEventListings = await guildEventListingsCollection()
            .find()
            .toArray();

        res.setHeader("Content-Type", "application/json");
        res.status(200).json(guildEventListings);
    } catch (error) {
        sendServerError(res, error, "Failed to retrieve guild event listings");
    }
};

guildEventListingsController.getGuildEventListingById = async (req, res) => {
    //#swagger.tags = ['Guild Event Listings']
    //#swagger.summary = 'Get a guild event listing by id'
    //#swagger.description = 'Returns a single guild event listing by its MongoDB ObjectId.'
    try {
        const guildEventListingId = new ObjectId(req.params.id);
        const guildEventListing = await guildEventListingsCollection().findOne({
            _id: guildEventListingId,
        });

        if (!guildEventListing) {
            res.status(400).json({ error: "Guild event listing not found" });
            return;
        }

        res.setHeader("Content-Type", "application/json");
        res.status(200).json(guildEventListing);
    } catch (error) {
        sendServerError(res, error, "Failed to retrieve guild event listing");
    }
};

guildEventListingsController.createGuildEventListing = async (req, res) => {
    //#swagger.tags = ['Guild Event Listings']
    //#swagger.summary = 'Create a guild event listing'
    //#swagger.description = 'Creates a new guild event listing. The organizer must be an existing player and guild_id must reference an existing guild.'
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        description: 'Full guild event listing payload. The organizer must be a valid player ObjectId and guild_id must reference an existing guild.',
        schema: {
            name: 'Nightfall Raid',
            description: 'Endgame trial for veteran players',
            eventDate: '2026-07-01T20:00:00.000Z',
            durationMinutes: 180,
            eventType: 'Raid',
            organizer: '6a2a396afba268ea258ee3d4',
            guild_id: '6a2a3932fba268ea258ee3cf',
            attendees: ['6a2a396afba268ea258ee3d4', '6a2a396afba268ea258ee3d5'],
            requirements: {
                minLevel: 50,
                minChampionPoints: 1600,
                rolesNeeded: ['Healer', 'Tank']
            },
            recurring: false,
            createdAt: '2026-06-16T12:00:00.000Z',
            recurrencePattern: null,
            recurrenceDays: []
        }
    } */
    try {
        const newGuildEventListing = buildGuildEventListingObject(req.body);

        if (
            !(await validateOrganizerExists(
                newGuildEventListing.organizer,
                res
            ))
        ) {
            return;
        }
        if (!(await validateGuildExists(newGuildEventListing.guild_id, res))) {
            return;
        }
        if (
            !(await validateAttendeesExist(newGuildEventListing.attendees, res))
        ) {
            return;
        }

        const response =
            await guildEventListingsCollection().insertOne(
                newGuildEventListing
            );

        if (response.acknowledged) {
            res.status(200).send({
                message: "Guild event listing created successfully",
            });
            return;
        }

        res.status(500).json({
            error: "Failed to create new guild event listing",
        });
    } catch (error) {
        sendServerError(res, error, "Failed to create new guild event listing");
    }
};

guildEventListingsController.replaceGuildEventListing = async (req, res) => {
    //#swagger.tags = ['Guild Event Listings']
    //#swagger.summary = 'Replace a guild event listing'
    //#swagger.description = 'Replaces a guild event listing by id. The organizer must be an existing player and guild_id must reference an existing guild.'
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        description: 'Complete replacement payload for a guild event listing.',
        schema: {
            name: 'Weekly Dungeon Night',
            description: 'Casual group for veteran dungeons',
            eventDate: '2026-07-03T19:30:00.000Z',
            durationMinutes: 120,
            eventType: 'Dungeon',
            organizer: '6a2a396afba268ea258ee3d5',
            guild_id: '6a2a3932fba268ea258ee3cf',
            attendees: ['6a2a396afba268ea258ee3d5'],
            requirements: {
                minLevel: 50
            },
            recurring: true,
            createdAt: '2026-06-16T12:05:00.000Z',
            recurrencePattern: 'weekly',
            recurrenceDays: ['Thursday']
        }
    } */
    try {
        const guildEventListingId = new ObjectId(req.params.id);
        const newGuildEventListing = buildGuildEventListingObject(req.body);
        const existingGuildEventListing =
            await guildEventListingsCollection().findOne({
                _id: guildEventListingId,
            });

        if (!existingGuildEventListing) {
            res.status(400).json({ error: "Guild event listing not found" });
            return;
        }

        if (
            !(await validateOrganizerExists(
                newGuildEventListing.organizer,
                res
            ))
        ) {
            return;
        }
        if (!(await validateGuildExists(newGuildEventListing.guild_id, res))) {
            return;
        }
        if (
            !(await validateAttendeesExist(newGuildEventListing.attendees, res))
        ) {
            return;
        }

        await guildEventListingsCollection().replaceOne(
            { _id: guildEventListingId },
            newGuildEventListing
        );
        res.status(200).send({
            message: "Guild event listing replaced successfully",
        });
    } catch (error) {
        sendServerError(
            res,
            error,
            "Failed to replace existing guild event listing"
        );
    }
};

guildEventListingsController.updateGuildEventListing = async (req, res) => {
    //#swagger.tags = ['Guild Event Listings']
    //#swagger.summary = 'Update a guild event listing'
    //#swagger.description = 'Partially updates a guild event listing by id. If provided, organizer must reference an existing player and guild_id must reference an existing guild.'
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        description: 'Partial guild event listing payload. Include only the fields you want to change.',
        schema: {
            description: 'Updated event description',
            durationMinutes: 150,
            attendees: ['6a2a396afba268ea258ee3d4']
        }
    } */
    try {
        const guildEventListingId = new ObjectId(req.params.id);
        const updatedFields = buildGuildEventListingUpdateFields(req.body);
        const existingGuildEventListing =
            await guildEventListingsCollection().findOne({
                _id: guildEventListingId,
            });

        if (!existingGuildEventListing) {
            res.status(400).json({ error: "Guild event listing not found" });
            return;
        }

        if (
            Object.prototype.hasOwnProperty.call(updatedFields, "organizer") &&
            !(await validateOrganizerExists(updatedFields.organizer, res))
        ) {
            return;
        }
        if (
            Object.prototype.hasOwnProperty.call(updatedFields, "guild_id") &&
            !(await validateGuildExists(updatedFields.guild_id, res))
        ) {
            return;
        }
        if (
            Object.prototype.hasOwnProperty.call(updatedFields, "attendees") &&
            !(await validateAttendeesExist(updatedFields.attendees, res))
        ) {
            return;
        }

        await guildEventListingsCollection().updateOne(
            { _id: guildEventListingId },
            { $set: updatedFields }
        );
        res.status(200).send({
            message: "Guild event listing updated successfully",
        });
    } catch (error) {
        sendServerError(res, error, "Failed to update guild event listing");
    }
};

guildEventListingsController.deleteGuildEventListing = async (req, res) => {
    //#swagger.tags = ['Guild Event Listings']
    //#swagger.summary = 'Delete a guild event listing'
    //#swagger.description = 'Deletes a guild event listing by id.'
    try {
        const guildEventListingId = new ObjectId(req.params.id);
        const existingGuildEventListing =
            await guildEventListingsCollection().findOne({
                _id: guildEventListingId,
            });

        if (!existingGuildEventListing) {
            res.status(400).json({ error: "Guild event listing not found" });
            return;
        }

        const response = await guildEventListingsCollection().deleteOne({
            _id: guildEventListingId,
        });

        if (response.deletedCount === 0) {
            res.status(400).json({ error: "Guild event listing not found" });
            return;
        }

        res.status(200).send({
            message: "Guild event listing deleted successfully",
        });
    } catch (error) {
        sendServerError(res, error, "Failed to delete guild event listing");
    }
};

// * Export controller
module.exports = guildEventListingsController;
