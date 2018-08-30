module.exports = class StartVote {
  constructor({ roomRepository } = {}) {
    this.roomRepository = roomRepository;
  }

  async execute(roomName, participantName, vote) {
    const room = await this.roomRepository.findByRoomName(roomName);

    if (room != null) {
      const participant = room.participantByName(participantName);
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
