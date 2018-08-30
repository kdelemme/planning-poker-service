const expect = require("chai").expect;
const InMemoryRoomRepository = require("../../../src/infrastructure/persistence/in-memory-room-repository");
const Room = require("../../../src/domain/model/room");
const Participant = require("../../../src/domain/model/participant");

describe("RoomRepository", () => {
  const repositoryClasses = [InMemoryRoomRepository];

  repositoryClasses.forEach(repositoryClass => {
    let repository;

    beforeEach(() => {
      repository = new repositoryClass();
    });

    it("should save the room", () => {
      const aRoom = new Room({ room: "a room" });

      repository.save(aRoom);

      expect(repository.findByRoomName("a room")).to.eq(aRoom);
    });

    it("should update an existing room", () => {
      const aRoom = new Room({ room: "a room" });
      repository.save(aRoom);

      aRoom.storeParticipant(new Participant({ name: "Alice" }));
      repository.save(aRoom);

      const room = repository.findByRoomName("a room");
      expect(room).to.have.property("id", aRoom.id);
      expect(room.participants).to.have.lengthOf(1);
    });
  });
});
