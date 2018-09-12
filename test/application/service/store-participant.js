const expect = require("chai").expect;
const uuid = require("uuid/v4");
const Room = require("../../../src/domain/model/room");
const Participant = require("../../../src/domain/model/participant");
const InMemoryRoomRepository = require("../../../src/infrastructure/persistence/in-memory-room-repository");
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
      room = new Room({ name: "a room" });
      participant = new Participant({ name: "John" });
      room.storeParticipant(participant);
      await roomRepository.save(room);
    });

    it("should store the participant into the room", async () => {
      const participantId = uuid();
      const { participants, voteInProgress } = await storeParticipant.execute({
        roomName: "a room",
        participantId,
        participantName: "Laura"
      });

      expect(voteInProgress).to.be.false;
      expect(participants[1].id).to.eq(participantId);
      expect(participants[1].name).to.eq("Laura");
    });

    it("should return the status on the current vote", async () => {
      room.startVote(participant);
      await roomRepository.save(room);

      const participantId = uuid();
      const { participants, voteInProgress } = await storeParticipant.execute({
        roomName: "a room",
        participantId,
        participantName: "Laura"
      });

      expect(voteInProgress).to.be.true;
      expect(participants[1].id).to.eq(participantId);
      expect(participants[1].name).to.eq("Laura");
    });
  });
});
