const Room = require("../../domain/model/room");

module.exports = class RemoveParticipant {
  constructor({ roomRepository } = {}) {
    this.roomRepository = roomRepository;
  }

  async execute(roomName, participant) {
    const room = await this.roomRepository.findByRoomName(roomName);
    if (room != null) {
      room.removeParticipant(participant);

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
