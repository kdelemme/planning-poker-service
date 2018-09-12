module.exports = class StartVote {
  constructor({ roomRepository } = {}) {
    this.roomRepository = roomRepository;
  }

  async execute({ roomName, participantId }) {
    const room = await this.roomRepository.findByRoomName(roomName);
    if (room != null) {
      if (room.startVote(participantId)) {
        const updated = await this.roomRepository.save(room);
        return { participants: updated.listParticipants(), voteStarted: true };
      }
    }

    return { voteStarted: false };
  }
};
