const expect = require("chai").expect;
const Room = require("../../../src/domain/model/room");
const Participant = require("../../../src/domain/model/participant");
const InMemoryRoomRepository = require("../../../src/infrastructure/persistence/inMemoryRoomRepository");
const StartVote = require("../../../src/application/service/start-vote");

describe("startVote", () => {
  let startVote, roomRepository;

  beforeEach(() => {
    roomRepository = new InMemoryRoomRepository();
    startVote = new StartVote({ roomRepository });
  });

  describe("when a room exists", () => {
    let room, participant;

    beforeEach(() => {
      room = new Room({ room: "a room" });
      admin = new Participant({ name: "John" });
      participant = new Participant({ name: "Alice" });
      room.storeParticipant(admin);
      room.storeParticipant(participant);
      roomRepository.save(room);
    });

    it("should start the vote and return the participants if the participant is admin", async () => {
      const { voteStarted, participants } = await startVote.execute("a room", admin.name);

      expect(voteStarted).to.be.true;
      expect(participants[0].id).to.eq(admin.id);
      expect(participants[1].id).to.eq(participant.id);
    });

    it("should not start the vote if the participant is not admin", async () => {
      const { voteStarted, participants } = await startVote.execute("a room", participant.name);

      expect(voteStarted).to.be.false;
      expect(participants).to.be.undefined;
    });
  });

  describe("when a room does not exist", () => {
    let room, participant;

    beforeEach(async () => {
      room = new Room({ room: "a room" });
      participant = new Participant({ name: "John", isAdmin: false });
      room.storeParticipant(participant);
      await roomRepository.save(room);
    });

    it("should not start the vote", async () => {
      const { voteStarted, participants } = await startVote.execute("some inexistant room", participant.name);

      expect(voteStarted).to.be.false;
      expect(participants).to.be.undefined;
    });
  });
});
