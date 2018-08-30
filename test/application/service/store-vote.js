const expect = require("chai").expect;
const Room = require("../../../src/domain/model/room");
const Participant = require("../../../src/domain/model/participant");
const InMemoryRoomRepository = require("../../../src/infrastructure/persistence/inMemoryRoomRepository");
const StoreVote = require("../../../src/application/service/store-vote");

describe("storeVote", () => {
  let storeVote, roomRepository;

  beforeEach(() => {
    roomRepository = new InMemoryRoomRepository();
    storeVote = new StoreVote({ roomRepository });
  });

  describe("when a room exists", () => {
    let room, participant;

    beforeEach(async () => {
      room = new Room({ room: "a room" });
      participant = new Participant({ name: "Alice" });
      room.storeParticipant(participant);
      await roomRepository.save(room);
    });

    it("should return the participants with vote if everyone has voted", async () => {
      const { participants, allParticipantsHaveVoted, participantsWithVote } = await storeVote.execute(
        "a room",
        participant.name,
        "3"
      );

      expect(allParticipantsHaveVoted).to.be.true;
      expect(participants[0].id).to.eq(participant.id);
      expect(participantsWithVote).to.contain(participant);
    });
  });
});
