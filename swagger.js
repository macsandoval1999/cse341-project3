// * Import the swagger-autogen module
const swaggerAutogen = require("swagger-autogen")();

// * Define the documentation object (optional)
const doc = {
    info: {
        title: "CSE341 Project 2 API: ESO Guilds API",
        description: "This API provides endpoints to manage guilds and players in the Elder Scrolls Online (ESO) game. It allows users to create, read, update, and delete guilds and players, as well as manage player memberships in guilds.",
    },
    // host: "cse341-project2-0bia.onrender.com",
    // schemes: ["https"],
    host: "localhost:3000",
    schemes: ["http"],
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
