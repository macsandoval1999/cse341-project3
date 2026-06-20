const test = require("node:test");
const assert = require("node:assert/strict");
const { ObjectId } = require("mongodb");
const {
    createCollectionMock,
    createResponse,
    loadGuildsController,
    serial,
} = require("./testHelpers");

test("guilds GET all returns every guild", serial, async () => {
    const fakeGuilds = [{ name: "Nightfall Raiders", tag: "NR" }];
    const collectionMock = createCollectionMock({ allItems: fakeGuilds });
    const controller = loadGuildsController(collectionMock, () => {
        throw new Error("sendServerError should not be called");
    });
    const response = createResponse();

    await controller.getAllGuilds({}, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.headers["Content-Type"], "application/json");
    assert.deepEqual(response.jsonBody, fakeGuilds);
});

test("guilds GET by id returns one guild", serial, async () => {
    const fakeGuild = { name: "Nightfall Raiders", tag: "NR" };
    let savedFilter;
    const requestId = new ObjectId().toHexString();
    const collectionMock = createCollectionMock({
        oneItem: fakeGuild,
        saveFilter: (filter) => {
            savedFilter = filter;
        },
    });
    const controller = loadGuildsController(collectionMock, () => {
        throw new Error("sendServerError should not be called");
    });
    const response = createResponse();

    await controller.getGuildById({ params: { id: requestId } }, response);

    assert.ok(savedFilter._id instanceof ObjectId);
    assert.equal(savedFilter._id.toHexString(), requestId);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.jsonBody, fakeGuild);
});

test(
    "guilds GET by id returns 400 when the guild does not exist",
    serial,
    async () => {
        const requestId = new ObjectId().toHexString();
        const collectionMock = createCollectionMock({ oneItem: null });
        const controller = loadGuildsController(collectionMock, () => {
            throw new Error("sendServerError should not be called");
        });
        const response = createResponse();

        await controller.getGuildById({ params: { id: requestId } }, response);

        assert.equal(response.statusCode, 400);
        assert.deepEqual(response.jsonBody, { error: "Guild not found" });
    }
);

test(
    "guilds GET all sends a server error when the database fails",
    serial,
    async () => {
        const dbError = new Error("Database broke");
        const collectionMock = createCollectionMock({ allError: dbError });
        let savedMessage;
        const controller = loadGuildsController(
            collectionMock,
            (res, err, message) => {
                savedMessage = message;
                assert.equal(err, dbError);
                res.status(500).json({ error: message });
            }
        );
        const response = createResponse();

        await controller.getAllGuilds({}, response);

        assert.equal(savedMessage, "Failed to retrieve guilds");
        assert.equal(response.statusCode, 500);
        assert.deepEqual(response.jsonBody, {
            error: "Failed to retrieve guilds",
        });
    }
);
