// node:path is used in testHelpers to resolve paths for loading controllers and their helpers
const path = require("node:path");

// path.resolve is used in testHelpers to get the absolute path to the project root, which is needed for loading controllers and their helpers
const repoRoot = path.resolve(__dirname, "..", "..");
// concurrency: false is used in the test definitions to ensure that tests run sequentially, which is important when they rely on shared state or mocks that could interfere with each other if run in parallel
const serial = { concurrency: false };

function createResponse() {
// This function creates a mock response object that simulates the behavior of an Express.js response. It has methods for setting headers, status codes, and sending JSON responses, and it stores the last set headers, status code, and JSON body for assertions in tests.
    return {
        headers: {},
        statusCode: null,
        jsonBody: null,
        setHeader(name, value) {
            this.headers[name] = value;
        },
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.jsonBody = data;
            return this;
        },
    };
}

function createCollectionMock({
// This function creates a mock MongoDB collection object with customizable behavior for the find and findOne methods. It allows tests to specify what data should be returned or what errors should be thrown when these methods are called, as well as capturing the filter used in findOne for assertions.
    allItems = [],
    oneItem = null,
    allError = null,
    oneError = null,
    saveFilter = null,
}) {
    return {
        find() {
            return {
                toArray: async () => {
                    if (allError) {
                        throw allError;
                    }

                    return allItems;
                },
            };
        },
        findOne: async (filter) => {
            if (saveFilter) {
                saveFilter(filter);
            }

            if (oneError) {
                throw oneError;
            }

            return oneItem;
        },
    };
}

function loadController({
// This function loads a controller module while mocking its dependencies on the database collection and helper functions. It temporarily replaces the required modules in the controller's dependency graph with mocks that provide controlled behavior for testing, and then restores the original modules after loading the controller.
    controllerFile,
    controllerHelperName,
    collectionName,
    collectionMock,
    extraHelpers,
    sendServerError,
}) {
    const controllerPath = require.resolve(path.join(repoRoot, controllerFile));
    const controllerHelperPath = require.resolve(
        path.join(repoRoot, "helpers", "controllerHelper.js")
    );
    const extraHelperPath = require.resolve(
        path.join(repoRoot, "helpers", controllerHelperName)
    );

    const oldController = require.cache[controllerPath];
    const oldControllerHelper = require.cache[controllerHelperPath];
    const oldExtraHelper = require.cache[extraHelperPath];

    const fakeControllerHelper = {
        sendServerError,
        guildsCollection: () => {
            throw new Error("Wrong collection used in test");
        },
        playersCollection: () => {
            throw new Error("Wrong collection used in test");
        },
        guildEventListingsCollection: () => {
            throw new Error("Wrong collection used in test");
        },
        guildStoreListingsCollection: () => {
            throw new Error("Wrong collection used in test");
        },
    };

    fakeControllerHelper[collectionName] = () => collectionMock;

    try {
        delete require.cache[controllerPath];

        require.cache[controllerHelperPath] = {
            id: controllerHelperPath,
            filename: controllerHelperPath,
            loaded: true,
            exports: fakeControllerHelper,
        };

        require.cache[extraHelperPath] = {
            id: extraHelperPath,
            filename: extraHelperPath,
            loaded: true,
            exports: extraHelpers,
        };

        return require(controllerPath);
    } finally {
        if (oldController) {
            require.cache[controllerPath] = oldController;
        } else {
            delete require.cache[controllerPath];
        }

        if (oldControllerHelper) {
            require.cache[controllerHelperPath] = oldControllerHelper;
        } else {
            delete require.cache[controllerHelperPath];
        }

        if (oldExtraHelper) {
            require.cache[extraHelperPath] = oldExtraHelper;
        } else {
            delete require.cache[extraHelperPath];
        }
    }
}

function loadGuildsController(collectionMock, sendServerError) {
    return loadController({
        controllerFile: "controllers/guildsController.js",
        controllerHelperName: "guildsControllerHelper.js",
        collectionName: "guildsCollection",
        collectionMock,
        sendServerError,
        extraHelpers: {
            buildGuildObject: () => ({}),
            buildGuildUpdateFields: () => ({}),
            validateGuildMasterExists: async () => true,
            validateGuildMasterAvailability: async () => true,
            syncGuildMasterPlayer: async () => {},
            clearGuildFromPlayers: async () => {},
        },
    });
}

function loadPlayersController(collectionMock, sendServerError) {
    return loadController({
        controllerFile: "controllers/playersController.js",
        controllerHelperName: "playersControllerHelper.js",
        collectionName: "playersCollection",
        collectionMock,
        sendServerError,
        extraHelpers: {
            buildPlayerObject: () => ({}),
            buildPlayerUpdateFields: () => ({}),
            validateGuildExists: async () => true,
        },
    });
}

function loadGuildEventListingsController(collectionMock, sendServerError) {
    return loadController({
        controllerFile: "controllers/guildEventListingsController.js",
        controllerHelperName: "guildEventListingsControllerHelper.js",
        collectionName: "guildEventListingsCollection",
        collectionMock,
        sendServerError,
        extraHelpers: {
            buildGuildEventListingObject: () => ({}),
            buildGuildEventListingUpdateFields: () => ({}),
            validateOrganizerExists: async () => true,
            validateGuildExists: async () => true,
            validateAttendeesExist: async () => true,
        },
    });
}

function loadGuildStoreListingsController(collectionMock, sendServerError) {
    return loadController({
        controllerFile: "controllers/guildStoreListingsController.js",
        controllerHelperName: "guildStoreListingsControllerHelper.js",
        collectionName: "guildStoreListingsCollection",
        collectionMock,
        sendServerError,
        extraHelpers: {
            buildGuildStoreListingObject: () => ({}),
            buildGuildStoreListingUpdateFields: () => ({}),
            validateOwnerPlayerExists: async () => true,
            validateSellerGuildExists: async () => true,
        },
    });
}

module.exports = {
    createCollectionMock,
    createResponse,
    loadGuildEventListingsController,
    loadGuildStoreListingsController,
    loadGuildsController,
    loadPlayersController,
    serial,
};
