module.exports = class StartVote {
  constructor({ roomRepository } = {}) {
    this.roomRepository = roomRepository;
  }

  async execute(roomName, participantName) {
    const room = await this.roomRepository.findByRoomName(roomName);
    if (room != null) {
      const participant = room.participantByName(participantName);
      if (room.startVote(participant)) {
        await this.roomRepository.save(room);
        return { participants: room.listParticipants(), voteStarted: true };
      }
    }

    return { voteStarted: false };
  }
};
