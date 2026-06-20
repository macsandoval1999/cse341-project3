// * Import the swagger-autogen module
const swaggerAutogen = require("swagger-autogen")();

// * Define the documentation object (optional)
const doc = {
    info: {
        title: "CSE341 Project 3 API: ESO Guilds API",
        description:
            "This API provides endpoints to manage guilds and players in the Elder Scrolls Online (ESO) game. It allows users to create, read, update, and delete guilds and players, as well as manage player memberships in guilds.",
    },
    tags: [
        {
            name: "Guilds",
            description:
                "Guild management endpoints. Allows creating, updating, and managing guilds. Write requests validate that guild tags are unique and that guild memberships reference existing players.",
        },
        {
            name: "Players",
            description:
                "Player management endpoints. Allows creating, updating, and managing player profiles. Write requests validate that guild memberships reference existing guilds and enforce that players can only be members of one guild at a time.",
        },
        {
            name: "Guild Event Listings",
            description:
                "Guild event listing management endpoints. Allows creating, updating, and managing guild events such as raids, dungeons, and trials. Write requests validate that organizers and attendees are existing players and that guild_id references an existing guild.",
        },
        {
            name: "Guild Store Listings",
            description:
                "Guild store listing management endpoints. Allows creating, updating, and managing items for sale in guild stores. Write requests validate that ownerPlayer_id references an existing player and that sellerGuild_id references an existing guild.",
        },
    ],
    host: "cse341-project3-lh49.onrender.com",
    schemes: ["https"],
};

// * Specify the output file and the endpoints files
const outputFile = "./swaggerDoc.json";
const endpointsFiles = ["./routes/index.js"];

// * Generate the swagger documentation
swaggerAutogen(outputFile, endpointsFiles, doc)
    .then(() => {
        console.log("Swagger documentation generated successfully.");
    })
    .catch((error) => {
        console.error("Failed to generate swagger documentation:", error);
        process.exit(1);
    });
