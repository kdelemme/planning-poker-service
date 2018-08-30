const expect = require("chai").expect;
const Room = require("../../../src/domain/model/room");
const Participant = require("../../../src/domain/model/participant");
const InMemoryRoomRepository = require("../../../src/infrastructure/persistence/inMemoryRoomRepository");
const StoreParticipant = require("../../../src/application/service/store-participant");

describe("storeParticipant", () => {
  let storeParticipant, roomRepository;

  beforeEach(() => {
    roomRepository = new InMemoryRoomRepository();
    storeParticipant = new StoreParticipant({ roomRepository });
  });

  describe("when a room exists", () => {
    let room, participant;

    beforeEach(async () => {
      room = new Room({ room: "a room" });
      participant = new Participant({ name: "John" });
      room.storeParticipant(participant);
      await roomRepository.save(room);
    });

    it("should store the participant into the room", async () => {
      const { participants, voteInProgress } = await storeParticipant.execute("a room", "Laura");

      expect(voteInProgress).to.be.false;
      expect(participants[1].name).to.eq("Laura");
    });

    it("should return the status on the current vote", async () => {
      room.startVote(participant);
      await roomRepository.save(room);

      const { participants, voteInProgress } = await storeParticipant.execute("a room", "John");

      expect(voteInProgress).to.be.true;
      expect(participants[1].name).to.eq("John");
    });
  });
});
