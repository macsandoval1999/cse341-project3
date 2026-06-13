// * Imports
const mongodb = require("../data/connect.js");
const ObjectId = require("mongodb").ObjectId;
const {
    sendServerError,
    playersCollection,
} = require("../helpers/controllerHelper.js");
const {
    buildPlayerObject,
    buildPlayerUpdateFields,
    validateGuildExists,
} = require("../helpers/playersControllerHelper.js");

// * Initialize controller object
const playersController = {};

// * Players Controller functions
// Get all players
playersController.getAllPlayers = async (req, res) => {
    //#swagger.tags = ['Players']
    //#swagger.summary = 'Get all players'
    //#swagger.description = 'Returns every player in the collection.'
    try {
        const players = await playersCollection().find().toArray();
        res.setHeader("Content-Type", "application/json");
        res.status(200).json(players);
    } catch (error) {
        sendServerError(res, error, "Failed to retrieve players");
    }
};

// Get player by ID
playersController.getPlayerById = async (req, res) => {
    //#swagger.tags = ['Players']
    //#swagger.summary = 'Get a player by id'
    //#swagger.description = 'Returns a single player by its MongoDB ObjectId.'
    try {
        const playerId = new ObjectId(req.params.id);
        const player = await playersCollection().findOne({ _id: playerId });
        if (!player) {
            res.status(400).json({ error: "Player not found" });
            return;
        }
        res.setHeader("Content-Type", "application/json");
        res.status(200).json(player);
    } catch (error) {
        sendServerError(res, error, "Failed to retrieve player");
    }
};

// Create new player
playersController.createPlayer = async (req, res) => {
    //#swagger.tags = ['Players']
    //#swagger.summary = 'Create a player'
    //#swagger.description = 'Creates a new player. If guild_id is provided, it must reference an existing guild.'
    //#swagger.security = [{ "sessionAuth": [] }]
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        description: 'Full player payload. The stats field must be a plain object when provided.',
        schema: {
            username: 'Molag Bal',
            displayName: 'Molag Bal',
            level: 1,
            championPoints: 0,
            class: 'Warrior',
            alliance: 'Aldmeri Dominion',
            joinDate: '2024-01-01',
            role: 'Tank',
            achievements: [],
            stats: {},
            email: 'molagbal@example.com',
            bio: 'This is Molag Bal',
            guild_id: '607c191e810c19729de860ea'
        }
    } */
    try {
        const newPlayer = buildPlayerObject(req.body);
        if (!(await validateGuildExists(newPlayer.guild_id, res))) {
            return;
        }
        const response = await playersCollection().insertOne(newPlayer);
        if (response.acknowledged) {
            res.status(200).send({ message: "Player created successfully" });
            return;
        }
        res.status(500).json({ error: "Failed to create new player" });
    } catch (error) {
        sendServerError(res, error, "Failed to create new player");
    }
};

// Replace player by ID
playersController.replacePlayer = async (req, res) => {
    //#swagger.tags = ['Players']
    //#swagger.summary = 'Replace a player'
    //#swagger.description = 'Replaces a player document by id. All player fields are expected. If guild_id is provided, it must reference an existing guild.'
    //#swagger.security = [{ "sessionAuth": [] }]
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        description: 'Complete replacement payload for a player.',
        schema: {
            username: 'Molag Bal',
            displayName: 'Molag Bal',
            level: 1,
            championPoints: 0,
            class: 'Warrior',
            alliance: 'Aldmeri Dominion',
            joinDate: '2024-01-01',
            role: 'Tank',
            achievements: [],
            stats: {},
            email: 'molagbal@example.com',
            bio: 'This is Molag Bal',
            guild_id: '607c191e810c19729de860ea'
        }
    } */
    try {
        const newPlayerID = new ObjectId(req.params.id);
        const newPlayer = buildPlayerObject(req.body);
        if (!(await validateGuildExists(newPlayer.guild_id, res))) {
            return;
        }
        const response = await playersCollection().replaceOne(
            { _id: newPlayerID },
            newPlayer
        );
        if (response.matchedCount === 0) {
            res.status(400).json({ error: "Player not found" });
            return;
        }
        res.status(200).send({ message: "Player replaced successfully" });
    } catch (error) {
        sendServerError(res, error, "Failed to replace existing player");
    }
};

// Update player by ID
playersController.updatePlayer = async (req, res) => {
    //#swagger.tags = ['Players']
    //#swagger.summary = 'Update a player'
    //#swagger.description = 'Partially updates a player by id. If guild_id is included, it must reference an existing guild or be null to clear membership.'
    //#swagger.security = [{ "sessionAuth": [] }]
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        description: 'Partial player payload. Include only the fields you want to change.',
        schema: {
            guild_id: '607c191e810c19729de860ea'
        }
    } */
    try {
        const newPlayerID = new ObjectId(req.params.id);
        const updatedFields = buildPlayerUpdateFields(req.body);
        if (
            Object.prototype.hasOwnProperty.call(updatedFields, "guild_id") &&
            !(await validateGuildExists(updatedFields.guild_id, res))
        ) {
            return;
        }
        const response = await playersCollection().updateOne(
            { _id: newPlayerID },
            { $set: updatedFields }
        );

        if (response.matchedCount === 0) {
            res.status(400).json({ error: "Player not found" });
            return;
        }
        res.status(200).send({ message: "Player updated successfully" });
    } catch (error) {
        sendServerError(res, error, "Failed to update player");
    }
};

// Delete player by ID
playersController.deletePlayer = async (req, res) => {
    //#swagger.tags = ['Players']
    //#swagger.summary = 'Delete a player'
    //#swagger.description = 'Deletes a player by id.'
    //#swagger.security = [{ "sessionAuth": [] }]
    try {
        const newPlayerID = new ObjectId(req.params.id);
        const response = await playersCollection().deleteOne({
            _id: newPlayerID,
        });
        if (response.deletedCount === 0) {
            res.status(400).json({ error: "Player not found" });
            return;
        }
        res.status(200).send({ message: "Player deleted successfully" });
    } catch (error) {
        sendServerError(res, error, "Failed to delete player");
    }
};

// * Export controller
module.exports = playersController;
