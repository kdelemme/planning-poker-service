const Room = require("../../domain/model/room");

module.exports = class StartVote {
  constructor({ roomRepository } = {}) {
    this.roomRepository = roomRepository;
  }

  async execute(roomName, participant) {
    const room = await this.roomRepository.findByRoomName(roomName);
    if (room != null && room.startVote(participant)) {
      await this.roomRepository.save(room);
      return { participants: room.listParticipants(), voteStarted: true };
    }

    return { voteStarted: false };
  }
};
