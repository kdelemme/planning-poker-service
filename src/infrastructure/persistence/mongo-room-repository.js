const assert = require("assert");
const { Room, Participant } = require("../../domain/model");

module.exports = class MongoRoomRepository {
  constructor({ dbConnection }) {
    this.dbConnection = dbConnection;
  }

  async findByRoomName(roomName) {
    const rooms = await this.dbConnection
      .collection("rooms")
      .find({ name: roomName })
      .limit(1)
      .toArray();
    return rooms.length === 1 ? toRoom(rooms[0]) : null;
  }

  async save(room) {
    const result = await this.dbConnection.collection("rooms").findOneAndUpdate(
      { id: room.id },
      { $set: { name: room.name, voteInProgress: room.voteInProgress, participants: room.participants } },
      {
        returnOriginal: false,
        upsert: true
      }
    );

    return toRoom(result.value);
  }
};

function toRoom(room) {
  return new Room({
    id: room.id,
    name: room.name,
    voteInProgress: room.voteInProgress,
    participants: room.participants.map(p => toParticipant(p))
  });
}

function toParticipant(participant) {
  return new Participant({
    id: participant.id,
    name: participant.name,
    isAdmin: participant.isAdmin,
    hasVoted: participant.hasVoted,
    card: participant.card
  });
}
