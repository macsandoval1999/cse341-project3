// * Imports
const mongodb = require("../data/connect.js");
const ObjectId = require("mongodb").ObjectId;
const {
    sendServerError,
    guildsCollection,
    playersCollection,
} = require("../helpers/controllerHelper.js");
const {
    buildGuildObject,
    buildGuildUpdateFields,
    validateGuildMasterExists,
    validateGuildMasterAvailability,
    syncGuildMasterPlayer,
    clearGuildFromPlayers,
} = require("../helpers/guildsControllerHelper.js");

// * Initialize controller object
const guildsController = {};

// * Guilds Controller functions
// Get all guilds
guildsController.getAllGuilds = async (req, res) => {
    //#swagger.tags = ['Guilds']
    //#swagger.summary = 'Get all guilds'
    //#swagger.description = 'Returns every guild in the collection.'
    try {
        const guilds = await guildsCollection().find().toArray();

        res.setHeader("Content-Type", "application/json");
        res.status(200).json(guilds);
    } catch (error) {
        sendServerError(res, error, "Failed to retrieve guilds");
    }
};

// Get guild by ID
guildsController.getGuildById = async (req, res) => {
    //#swagger.tags = ['Guilds']
    //#swagger.summary = 'Get a guild by id'
    //#swagger.description = 'Returns a single guild by its MongoDB ObjectId.'
    try {
        const guildId = new ObjectId(req.params.id);
        const guild = await guildsCollection().findOne({ _id: guildId });

        if (!guild) {
            res.status(400).json({ error: "Guild not found" });
            return;
        }

        res.setHeader("Content-Type", "application/json");
        res.status(200).json(guild);
    } catch (error) {
        sendServerError(res, error, "Failed to retrieve guild");
    }
};

// Create new guild
guildsController.createGuild = async (req, res) => {
    //#swagger.tags = ['Guilds']
    //#swagger.summary = 'Create a guild'
    //#swagger.description = 'Creates a new guild. Special rule: the guildMaster must be an existing player and cannot already be the guild master of another guild. On success, that player\'s guild_id is synced to the new guild.'
    //#swagger.security = [{ "sessionAuth": [] }]
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        description: 'Full guild payload. The guildMaster value must be a valid player ObjectId and that player can only be guild master of one guild at a time.',
        schema: {
            name: 'Covenant of Shadows',
            tag: 'CoS',
            description: 'A guild focused on PvP content',
            alliance: 'Aldmeri Dominion',
            memberCount: 1,
            createdAt: '2024-01-01',
            activities: ['Raid', 'Dungeon'],
            ranks: ['Guild Master', 'Officer', 'Member'],
            recruitmentOpen: true,
            language: 'English',
            region: 'NA',
            guildMaster: '607c191e810c19729de860ea'
        }
    } */
    try {
        const newGuild = buildGuildObject(req.body);
        if (!(await validateGuildMasterExists(newGuild.guildMaster, res))) {
            return;
        }
        if (
            !(await validateGuildMasterAvailability(newGuild.guildMaster, res))
        ) {
            return;
        }
        const response = await guildsCollection().insertOne(newGuild);
        if (response.acknowledged) {
            await syncGuildMasterPlayer(
                response.insertedId,
                null,
                newGuild.guildMaster
            );
            res.status(200).send({
                message: "Guild created successfully",
            });
            return;
        }
        res.status(500).json({ error: "Failed to create new guild" });
    } catch (error) {
        sendServerError(res, error, "Failed to create new guild");
    }
};

// Replace guild by ID
guildsController.replaceGuild = async (req, res) => {
    //#swagger.tags = ['Guilds']
    //#swagger.summary = 'Replace a guild'
    //#swagger.description = 'Replaces a guild document by id. All guild fields are required. If guildMaster changes, the previous guild master is cleared from this guild and the new guild master is synced. A player cannot become guild master of more than one guild.'
    //#swagger.security = [{ "sessionAuth": [] }]
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        description: 'Complete replacement payload for a guild.',
        schema: {
            name: 'Nightfall Raiders',
            tag: 'NR',
            description: 'A guild focused on endgame content',
            alliance: 'Daggerfall Covenant',
            memberCount: 20,
            createdAt: '2024-02-01',
            activities: ['Raid', 'PvP'],
            ranks: ['Guild Master', 'Officer', 'Member'],
            recruitmentOpen: false,
            language: 'English',
            region: 'EU',
            guildMaster: '607c191e810c19729de860eb'
        }
     } */
    try {
        const guildId = new ObjectId(req.params.id);
        const newGuild = buildGuildObject(req.body);
        const existingGuild = await guildsCollection().findOne({
            _id: guildId,
        });
        if (!existingGuild) {
            res.status(400).json({ error: "Guild not found" });
            return;
        }
        if (!(await validateGuildMasterExists(newGuild.guildMaster, res))) {
            return;
        }
        if (
            !(await validateGuildMasterAvailability(
                newGuild.guildMaster,
                res,
                guildId
            ))
        ) {
            return;
        }
        await guildsCollection().replaceOne({ _id: guildId }, newGuild);
        await syncGuildMasterPlayer(
            guildId,
            existingGuild.guildMaster,
            newGuild.guildMaster
        );
        res.status(200).send({ message: "Guild replaced successfully" });
    } catch (error) {
        sendServerError(res, error, "Failed to replace existing guild");
    }
};

// Update guild by ID
guildsController.updateGuild = async (req, res) => {
    //#swagger.tags = ['Guilds']
    //#swagger.summary = 'Update a guild'
    //#swagger.description = 'Partially updates a guild by id. If guildMaster is provided, it must reference an existing player who is not already guild master of another guild. When changed, player guild_id values are synced automatically.'
    //#swagger.security = [{ "sessionAuth": [] }]
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        description: 'Partial guild payload. Include only the fields you want to change.',
        schema: {
            name: 'Nightfall Raiders',
            tag: 'NR',
            description: 'A guild focused on endgame content',
            alliance: 'Daggerfall Covenant',
            memberCount: 20,
            createdAt: '2024-02-01',
            activities: ['Raid', 'PvP'],
            ranks: ['Guild Master', 'Officer', 'Member'],
            recruitmentOpen: false,
            language: 'English',
            region: 'EU',
            guildMaster: '607c191e810c19729de860eb'
        }
    } */
    try {
        const guildId = new ObjectId(req.params.id);
        const updatedFields = buildGuildUpdateFields(req.body);
        const existingGuild = await guildsCollection().findOne({
            _id: guildId,
        });
        if (!existingGuild) {
            res.status(400).json({ error: "Guild not found" });
            return;
        }
        if (
            Object.prototype.hasOwnProperty.call(
                updatedFields,
                "guildMaster"
            ) &&
            !(await validateGuildMasterExists(updatedFields.guildMaster, res))
        ) {
            return;
        }
        if (
            Object.prototype.hasOwnProperty.call(
                updatedFields,
                "guildMaster"
            ) &&
            !(await validateGuildMasterAvailability(
                updatedFields.guildMaster,
                res,
                guildId
            ))
        ) {
            return;
        }
        await guildsCollection().updateOne(
            { _id: guildId },
            { $set: updatedFields }
        );
        if (
            Object.prototype.hasOwnProperty.call(updatedFields, "guildMaster")
        ) {
            await syncGuildMasterPlayer(
                guildId,
                existingGuild.guildMaster,
                updatedFields.guildMaster
            );
        }
        res.status(200).send({ message: "Guild updated successfully" });
    } catch (error) {
        sendServerError(res, error, "Failed to update guild");
    }
};

// Delete guild by ID
guildsController.deleteGuild = async (req, res) => {
    //#swagger.tags = ['Guilds']
    //#swagger.summary = 'Delete a guild'
    //#swagger.description = 'Deletes a guild by id. Special rule: all players whose guild_id points to this guild are automatically cleared to null.'
    //#swagger.security = [{ "sessionAuth": [] }]
    try {
        const guildId = new ObjectId(req.params.id);
        const existingGuild = await guildsCollection().findOne({
            _id: guildId,
        });

        if (!existingGuild) {
            res.status(400).json({ error: "Guild not found" });
            return;
        }

        const response = await guildsCollection().deleteOne({ _id: guildId });

        if (response.deletedCount === 0) {
            res.status(400).json({ error: "Guild not found" });
            return;
        }

        await clearGuildFromPlayers(guildId);

        res.status(200).send({ message: "Guild deleted successfully" });
    } catch (error) {
        sendServerError(res, error, "Failed to delete guild");
    }
};

// * Export controller
module.exports = guildsController;
