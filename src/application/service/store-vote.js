module.exports = class StartVote {
  constructor({ roomRepository } = {}) {
    this.roomRepository = roomRepository;
  }

  async execute({ roomName, participantId, card }) {
    const room = await this.roomRepository.findByRoomName(roomName);

    if (room != null) {
      room.storeVote(participantId, card);

      const allParticipantsHaveVoted = room.allParticipantsHaveVoted();
      if (allParticipantsHaveVoted) {
        room.completeVote();
      }

      const updated = await this.roomRepository.save(room);
      return {
        participants: updated.listParticipants(),
        allParticipantsHaveVoted,
        participantsWithVote: updated.listParticipantsWithVote()
      };
    }
  }
};
