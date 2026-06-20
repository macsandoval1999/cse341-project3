const test = require("node:test");
const assert = require("node:assert/strict");
const { ObjectId } = require("mongodb");
const {
    createCollectionMock,
    createResponse,
    loadPlayersController,
    serial,
} = require("./testHelpers");

test("players GET all returns every player", serial, async () => {
    const fakePlayers = [{ username: "Molag Bal", role: "Tank" }];
    const collectionMock = createCollectionMock({ allItems: fakePlayers });
    const controller = loadPlayersController(collectionMock, () => {
        throw new Error("sendServerError should not be called");
    });
    const response = createResponse();

    await controller.getAllPlayers({}, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.headers["Content-Type"], "application/json");
    assert.deepEqual(response.jsonBody, fakePlayers);
});

test("players GET by id returns one player", serial, async () => {
    const fakePlayer = { username: "Molag Bal", role: "Tank" };
    let savedFilter;
    const requestId = new ObjectId().toHexString();
    const collectionMock = createCollectionMock({
        oneItem: fakePlayer,
        saveFilter: (filter) => {
            savedFilter = filter;
        },
    });
    const controller = loadPlayersController(collectionMock, () => {
        throw new Error("sendServerError should not be called");
    });
    const response = createResponse();

    await controller.getPlayerById({ params: { id: requestId } }, response);

    assert.ok(savedFilter._id instanceof ObjectId);
    assert.equal(savedFilter._id.toHexString(), requestId);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.jsonBody, fakePlayer);
});

test(
    "players GET by id returns 400 when the player does not exist",
    serial,
    async () => {
        const requestId = new ObjectId().toHexString();
        const collectionMock = createCollectionMock({ oneItem: null });
        const controller = loadPlayersController(collectionMock, () => {
            throw new Error("sendServerError should not be called");
        });
        const response = createResponse();

        await controller.getPlayerById({ params: { id: requestId } }, response);

        assert.equal(response.statusCode, 400);
        assert.deepEqual(response.jsonBody, { error: "Player not found" });
    }
);

test(
    "players GET all sends a server error when the database fails",
    serial,
    async () => {
        const dbError = new Error("Database broke");
        const collectionMock = createCollectionMock({ allError: dbError });
        let savedMessage;
        const controller = loadPlayersController(
            collectionMock,
            (res, err, message) => {
                savedMessage = message;
                assert.equal(err, dbError);
                res.status(500).json({ error: message });
            }
        );
        const response = createResponse();

        await controller.getAllPlayers({}, response);

        assert.equal(savedMessage, "Failed to retrieve players");
        assert.equal(response.statusCode, 500);
        assert.deepEqual(response.jsonBody, {
            error: "Failed to retrieve players",
        });
    }
);
