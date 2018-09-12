const Participant = require("../../domain/model/participant");

module.exports = class StoreParticipant {
  constructor({ roomRepository } = {}) {
    this.roomRepository = roomRepository;
  }

  async execute({ roomName, participantId, participantName }) {
    const room = await this.roomRepository.findByRoomName(roomName);
    if (room != null) {
      const participant = new Participant({ id: participantId, name: participantName });
      room.storeParticipant(participant);
      const savedRoom = await this.roomRepository.save(room);

      return {
        participant,
        participants: savedRoom.listParticipants(),
        voteInProgress: savedRoom.voteInProgress
      };
    }
  }
};
