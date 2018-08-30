const expect = require("chai").expect;
const Room = require("../../../src/domain/model/room");
const Participant = require("../../../src/domain/model/participant");
const InMemoryRoomRepository = require("../../../src/infrastructure/persistence/inMemoryRoomRepository");
const RemoveParticipant = require("../../../src/application/service/remove-participant");

describe("removeParticipant", () => {
  let removeParticipant, roomRepository;

  beforeEach(() => {
    roomRepository = new InMemoryRoomRepository();
    removeParticipant = new RemoveParticipant({ roomRepository });
  });

  describe("when a room exists", () => {
    let room, participant, anotherParticipant;

    beforeEach(async () => {
      room = new Room({ room: "a room" });
      participant = new Participant({ name: "Alice" });
      anotherParticipant = new Participant({ name: "Bob" });
      room.storeParticipant(participant);
      room.storeParticipant(anotherParticipant);
      await roomRepository.save(room);
    });

    it("should remove the participant from the list", async () => {
      const { participants, allParticipantsHaveVoted, participantsWithVote } = await removeParticipant.execute(
        "a room",
        participant.name
      );

      expect(allParticipantsHaveVoted).to.be.false;
      expect(participants[0].id).to.eq(anotherParticipant.id);
      expect(participantsWithVote).to.contain(anotherParticipant);
    });

    it("should return that all participants have voted after removing the participant", async () => {
      room.storeVote(anotherParticipant, "5");
      await roomRepository.save(room);

      const { participants, allParticipantsHaveVoted, participantsWithVote } = await removeParticipant.execute(
        "a room",
        participant.name
      );

      expect(allParticipantsHaveVoted).to.be.true;
      expect(participants[0].id).to.eq(anotherParticipant.id);
      expect(participantsWithVote).to.contain(anotherParticipant);
    });
  });
});
