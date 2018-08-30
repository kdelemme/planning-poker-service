const Participant = require("../../domain/model/participant");

module.exports = class StoreParticipant {
  constructor({ roomRepository } = {}) {
    this.roomRepository = roomRepository;
  }

  async execute(roomName, participantName) {
    const room = await this.roomRepository.findByRoomName(roomName);
    if (room != null) {
      const participant = new Participant({ name: participantName });
      room.storeParticipant(participant);
      await this.roomRepository.save(room);

      return {
        participant,
        participants: room.listParticipants(),
        voteInProgress: room.voteInProgress
      };
    }
  }
};
