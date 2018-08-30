module.exports = class StartVote {
  constructor({ roomRepository } = {}) {
    this.roomRepository = roomRepository;
  }

  async execute({ roomName, participantId, vote }) {
    const room = await this.roomRepository.findByRoomName(roomName);

    if (room != null) {
      const participant = room.findParticipantById(participantId);
      room.storeVote(participant, vote);

      const allParticipantsHaveVoted = room.allParticipantsHaveVoted();
      if (allParticipantsHaveVoted) {
        room.completeVote();
      }

      await this.roomRepository.save(room);
      return {
        participants: room.listParticipants(),
        allParticipantsHaveVoted,
        participantsWithVote: room.listParticipantsWithVote()
      };
    }
  }
};
