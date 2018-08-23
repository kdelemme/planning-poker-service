const Room = require("../../domain/model/room");

module.exports = class StartVote {
  constructor({ roomRepository } = {}) {
    this.roomRepository = roomRepository;
  }

  async execute(roomName, participant, vote) {
    const room = await this.roomRepository.findByRoomName(roomName);

    if (room != null) {
      room.storeVote(participant, vote);

      if (room.allParticipantsHaveVoted()) {
        room.completeVote();
        await this.roomRepository.save(room);
        return {
          participants: room.listParticipants(),
          allParticipantsHaveVoted: true,
          participantsWithVote: room.listParticipantsWithVote()
        };
      }

      await this.roomRepository.save(room);
      return { participants: room.listParticipants(), allParticipantsHaveVoted: false };
    }
  }
};
