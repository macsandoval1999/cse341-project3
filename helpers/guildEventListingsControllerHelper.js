// * Imports
const ObjectId = require("mongodb").ObjectId;
const {
    guildsCollection,
    playersCollection,
} = require("./controllerHelper.js");

// * Helper functions
const normalizeAttendees = (attendees) => {
    if (!Array.isArray(attendees)) {
        return [];
    }

    return attendees
        .filter(Boolean)
        .map((attendeeId) => new ObjectId(attendeeId));
};

const buildGuildEventListingObject = (source) => ({
    name: source.name,
    description: source.description,
    eventDate: source.eventDate ? new Date(source.eventDate) : null,
    durationMinutes: source.durationMinutes,
    eventType: source.eventType,
    organizer: source.organizer ? new ObjectId(source.organizer) : null,
    guild_id: source.guild_id ? new ObjectId(source.guild_id) : null,
    attendees: normalizeAttendees(source.attendees),
    requirements: source.requirements || {},
    recurring: source.recurring ?? false,
    createdAt: source.createdAt ? new Date(source.createdAt) : null,
    recurrencePattern: source.recurrencePattern || null,
    recurrenceDays: source.recurrenceDays || [],
});

const buildGuildEventListingUpdateFields = (source) => {
    const updatedFields = { ...source };

    if (Object.prototype.hasOwnProperty.call(updatedFields, "eventDate")) {
        updatedFields.eventDate = updatedFields.eventDate
            ? new Date(updatedFields.eventDate)
            : null;
    }
    if (Object.prototype.hasOwnProperty.call(updatedFields, "createdAt")) {
        updatedFields.createdAt = updatedFields.createdAt
            ? new Date(updatedFields.createdAt)
            : null;
    }
    if (Object.prototype.hasOwnProperty.call(updatedFields, "organizer")) {
        updatedFields.organizer = updatedFields.organizer
            ? new ObjectId(updatedFields.organizer)
            : null;
    }
    if (Object.prototype.hasOwnProperty.call(updatedFields, "guild_id")) {
        updatedFields.guild_id = updatedFields.guild_id
            ? new ObjectId(updatedFields.guild_id)
            : null;
    }
    if (Object.prototype.hasOwnProperty.call(updatedFields, "attendees")) {
        updatedFields.attendees = normalizeAttendees(updatedFields.attendees);
    }

    return updatedFields;
};

const validateOrganizerExists = async (organizerId, res) => {
    if (!organizerId) {
        return true;
    }

    const organizer = await playersCollection().findOne({ _id: organizerId });
    if (!organizer) {
        res.status(400).json({ error: "Organizer player not found" });
        return false;
    }

    return true;
};

const validateGuildExists = async (guildId, res) => {
    if (!guildId) {
        return true;
    }

    const guild = await guildsCollection().findOne({ _id: guildId });
    if (!guild) {
        res.status(400).json({
            error: "Guild not found for provided guild_id",
        });
        return false;
    }

    return true;
};

const validateAttendeesExist = async (attendees, res) => {
    if (!Array.isArray(attendees) || attendees.length === 0) {
        return true;
    }

    const uniqueAttendeeIds = [
        ...new Set(attendees.map((attendeeId) => attendeeId.toString())),
    ].map((attendeeId) => new ObjectId(attendeeId));

    const attendeeCount = await playersCollection().countDocuments({
        _id: { $in: uniqueAttendeeIds },
    });

    if (attendeeCount !== uniqueAttendeeIds.length) {
        res.status(400).json({
            error: "One or more attendee players were not found",
        });
        return false;
    }

    return true;
};

// * Exported functions for guildEventListingsController
module.exports = {
    buildGuildEventListingObject,
    buildGuildEventListingUpdateFields,
    validateOrganizerExists,
    validateGuildExists,
    validateAttendeesExist,
};
