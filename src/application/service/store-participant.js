const Room = require("../../domain/model/room");

module.exports = class StoreParticipant {
  constructor({ roomRepository } = {}) {
    this.roomRepository = roomRepository;
  }

  async execute(roomName, participant) {
    const room = await this.roomRepository.findByRoomName(roomName);
    if (room != null) {
      room.storeParticipant(participant);
      await this.roomRepository.save(room);

      return {
        participants: room.listParticipants(),
        voteInProgress: room.voteInProgress
      };
    }
  }
};
