const expect = require("chai").expect;
const Room = require("../../../src/domain/model/room");
const InMemoryRoomRepository = require("../../../src/infrastructure/persistence/inMemoryRoomRepository");
const CreateRoom = require("../../../src/application/service/createRoom");

describe("createRoom", () => {
  let createRoom, roomRepository;

  beforeEach(() => {
    roomRepository = new InMemoryRoomRepository();
    createRoom = new CreateRoom(roomRepository);
  });

  it("should save the room if not find", () => {
    createRoom.execute("a room");
    expect(roomRepository.findByRoomName("a room")).to.be.an.instanceOf(Room);
  });
});
