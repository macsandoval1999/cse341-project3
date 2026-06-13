// * Imports
const mongodb = require("../data/connect.js");
const ObjectId = require("mongodb").ObjectId;

// * Helper functions
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
    stats: source.stats,
    email: source.email,
    bio: source.bio,
    guild_id: source.guild_id ? new ObjectId(source.guild_id) : null
});

// Send server error response
const sendServerError = (res, err, message) => {
    console.error(message, err);
    res.status(500).json({ error: message });
};

// * Initialize controller object
const playersController = {};

// * Players Controller functions
// Get all players
playersController.getAllPlayers = async (req, res) => {
    //#swagger.tags = ['Players']
    try {
        const players = await mongodb.database
            .getDB()
            .db()
            .collection("players")
            .find()
            .toArray();

        res.setHeader("Content-Type", "application/json");
        res.status(200).json(players);
    } catch (error) {
        sendServerError(res, error, "Failed to retrieve players");
    }
};

// Get player by ID
playersController.getPlayerById = async (req, res) => {
    //#swagger.tags = ['Players']
    try {
        const playerId = new ObjectId(req.params.id);
        const player = await mongodb.database
            .getDB()
            .db()
            .collection("players")
            .findOne({ _id: playerId });

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
    //#swagger.security = [{ "sessionAuth": [] }]
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            username: 'Player1',
            displayName: 'Player One',
            level: 1,
            championPoints: 0,
            class: 'Warrior',
            alliance: 'Alliance1',
            joinDate: '2024-01-01',
            role: 'Tank',
            achievements: [],
            stats: {},
            email: 'player1@example.com',
            bio: 'This is Player One',
            guild_id: '607c191e810c19729de860ea'
        }
    } */
    try {
        const newPlayer = buildPlayerObject(req.body);
        const response = await mongodb.database
            .getDB()
            .db()
            .collection("players")
            .insertOne(newPlayer);

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
    //#swagger.security = [{ "sessionAuth": [] }]
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            username: 'Player1',
            displayName: 'Player One',
            level: 1,
            championPoints: 0,
            class: 'Warrior',
            alliance: 'Alliance1',
            joinDate: '2024-01-01',
            role: 'Tank',
            achievements: [],
            stats: {},
            email: 'player1@example.com',
            bio: 'This is Player One',
            guild_id: '607c191e810c19729de860ea'
        }
    } */
    try {
        const newPlayerID = new ObjectId(req.params.id);
        const newPlayer = buildPlayerObject(req.body);
        const response = await mongodb.database
            .getDB()
            .db()
            .collection("players")
            .replaceOne({ _id: newPlayerID }, newPlayer);

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
    //#swagger.security = [{ "sessionAuth": [] }]
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            username: 'Player1',
            displayName: 'Player One',
            level: 1,
            championPoints: 0,
            class: 'Warrior',
            alliance: 'Alliance1',
            joinDate: '2024-01-01',
            role: 'Tank',
            achievements: [],
            stats: {},
            email: 'player1@example.com',
            bio: 'This is Player One',
            guild_id: '607c191e810c19729de860ea'
        }
    } */
    try {
        const newPlayerID = new ObjectId(req.params.id);
        const updatedFields = req.body;
        const response = await mongodb.database
            .getDB()
            .db()
            .collection("players")
            .updateOne({ _id: newPlayerID }, { $set: updatedFields });

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
    //#swagger.security = [{ "sessionAuth": [] }]
    try {
        const newPlayerID = new ObjectId(req.params.id);
        const response = await mongodb.database
            .getDB()
            .db()
            .collection("players")
            .deleteOne({ _id: newPlayerID });

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
