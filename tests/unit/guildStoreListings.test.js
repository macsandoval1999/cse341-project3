const test = require("node:test");
const assert = require("node:assert/strict");
const { ObjectId } = require("mongodb");
const {
    createCollectionMock,
    createResponse,
    loadGuildStoreListingsController,
    serial,
} = require("./testHelpers");

test("guild store listings GET all returns every listing", serial, async () => {
    const fakeListings = [{ itemName: "Crafting Mat Bundle", quantity: 100 }];
    const collectionMock = createCollectionMock({ allItems: fakeListings });
    const controller = loadGuildStoreListingsController(collectionMock, () => {
        throw new Error("sendServerError should not be called");
    });
    const response = createResponse();

    await controller.getAllGuildStoreListings({}, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.headers["Content-Type"], "application/json");
    assert.deepEqual(response.jsonBody, fakeListings);
});

test("guild store listings GET by id returns one listing", serial, async () => {
    const fakeListing = { itemName: "Crafting Mat Bundle", quantity: 100 };
    let savedFilter;
    const requestId = new ObjectId().toHexString();
    const collectionMock = createCollectionMock({
        oneItem: fakeListing,
        saveFilter: (filter) => {
            savedFilter = filter;
        },
    });
    const controller = loadGuildStoreListingsController(collectionMock, () => {
        throw new Error("sendServerError should not be called");
    });
    const response = createResponse();

    await controller.getGuildStoreListingById(
        { params: { id: requestId } },
        response
    );

    assert.ok(savedFilter._id instanceof ObjectId);
    assert.equal(savedFilter._id.toHexString(), requestId);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.jsonBody, fakeListing);
});

test(
    "guild store listings GET by id returns 400 when the listing does not exist",
    serial,
    async () => {
        const requestId = new ObjectId().toHexString();
        const collectionMock = createCollectionMock({ oneItem: null });
        const controller = loadGuildStoreListingsController(
            collectionMock,
            () => {
                throw new Error("sendServerError should not be called");
            }
        );
        const response = createResponse();

        await controller.getGuildStoreListingById(
            { params: { id: requestId } },
            response
        );

        assert.equal(response.statusCode, 400);
        assert.deepEqual(response.jsonBody, {
            error: "Guild store listing not found",
        });
    }
);

test(
    "guild store listings GET all sends a server error when the database fails",
    serial,
    async () => {
        const dbError = new Error("Database broke");
        const collectionMock = createCollectionMock({ allError: dbError });
        let savedMessage;
        const controller = loadGuildStoreListingsController(
            collectionMock,
            (res, err, message) => {
                savedMessage = message;
                assert.equal(err, dbError);
                res.status(500).json({ error: message });
            }
        );
        const response = createResponse();

        await controller.getAllGuildStoreListings({}, response);

        assert.equal(savedMessage, "Failed to retrieve guild store listings");
        assert.equal(response.statusCode, 500);
        assert.deepEqual(response.jsonBody, {
            error: "Failed to retrieve guild store listings",
        });
    }
);
