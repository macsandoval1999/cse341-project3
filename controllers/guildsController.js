// * Imports
const mongodb = require("../data/connect.js");
const ObjectId = require("mongodb").ObjectId;

// * Helper functions
// Build guild object from request body
const buildGuildObject = (source) => ({
    name: source.name,
    description: source.description,
    alliance: source.alliance,
    memberCount: source.memberCount,
    createdAt: source.createdAt ? new Date(source.createdAt) : null,
    activities: source.activities,
    ranks: source.ranks,
    recruitmentOpen: source.recruitmentOpen,
    language: source.language,
    region: source.region,
    guildMaster: source.guildMaster ? new ObjectId(source.guildMaster) : null
});

// Send Server error response
const sendServerError = (res, err, message) => {
    console.error(message, err);
    res.status(500).json({ error: message });
};

// * Initialize controller object
const guildsController = {};

// * Guilds Controller functions
// Get all guilds
guildsController.getAllGuilds = async (req, res) => {
    //#swagger.tags = ['Guilds']
    try {
        const guilds = await mongodb.database
            .getDB()
            .db()
            .collection("guilds")
            .find()
            .toArray();

        res.setHeader("Content-Type", "application/json");
        res.status(200).json(guilds);
    } catch (error) {
        sendServerError(res, error, "Failed to retrieve guilds");
    }
};

// Get guild by ID
guildsController.getGuildById = async (req, res) => {
    //#swagger.tags = ['Guilds']
    try {
        const guildId = new ObjectId(req.params.id);
        const guild = await mongodb.database
            .getDB()
            .db()
            .collection("guilds")
            .findOne({ _id: guildId });

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
    //#swagger.security = [{ "sessionAuth": [] }]
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            name: 'Covenant of Shadows',
            description: 'A guild focused on PvP content',
            alliance: 'Aldmeri Dominion',
            memberCount: 10,
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
        const response = await mongodb.database
            .getDB()
            .db()
            .collection("guilds")
            .insertOne(newGuild);

        if (response.acknowledged) {
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
    //#swagger.security = [{ "sessionAuth": [] }]
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            name: 'Nightfall Raiders',
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
        const response = await mongodb.database
            .getDB()
            .db()
            .collection("guilds")
            .replaceOne({ _id: guildId }, newGuild);

        if (response.matchedCount === 0) {
            res.status(400).json({ error: "Guild not found" });
            return;
        }

        res.status(200).send({ message: "Guild replaced successfully" });
    } catch (error) {
        sendServerError(res, error, "Failed to replace existing guild");
    }
};

// Update guild by ID
guildsController.updateGuild = async (req, res) => {
    //#swagger.tags = ['Guilds']
    //#swagger.security = [{ "sessionAuth": [] }]
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            name: 'Nightfall Raiders',
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
        const updatedFields = req.body;
        const response = await mongodb.database
            .getDB()
            .db()
            .collection("guilds")
            .updateOne({ _id: guildId }, { $set: updatedFields });

        if (response.matchedCount === 0) {
            res.status(400).json({ error: "Guild not found" });
            return;
        }

        res.status(200).send({ message: "Guild updated successfully" });
    } catch (error) {
        sendServerError(res, error, "Failed to update guild");
    }
};

// Delete guild by ID
guildsController.deleteGuild = async (req, res) => {
    //#swagger.tags = ['Guilds']
    //#swagger.security = [{ "sessionAuth": [] }]
    try {
        const guildId = new ObjectId(req.params.id);
        const response = await mongodb.database
            .getDB()
            .db()
            .collection("guilds")
            .deleteOne({ _id: guildId });

        if (response.deletedCount === 0) {
            res.status(400).json({ error: "Guild not found" });
            return;
        }

        res.status(200).send({ message: "Guild deleted successfully" });
    } catch (error) {
        sendServerError(res, error, "Failed to delete solar system");
    }
};

// * Export controller
module.exports = guildsController;
