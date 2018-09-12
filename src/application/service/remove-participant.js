module.exports = class RemoveParticipant {
  constructor({ roomRepository } = {}) {
    this.roomRepository = roomRepository;
  }

  async execute({ roomName, participantId }) {
    const room = await this.roomRepository.findByRoomName(roomName);
    if (room != null) {
      room.removeParticipantById(participantId);

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
