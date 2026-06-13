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
                "Guild management endpoints. Guild write requests enforce guild master ownership rules and keep player guild membership in sync.",
        },
        {
            name: "Players",
            description:
                "Player management endpoints. Player write requests validate request fields and ensure any provided guild_id points to an existing guild.",
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
