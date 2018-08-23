const Room = require("../../domain/model/room");

module.exports = class CreateRoom {
  constructor({ roomRepository } = {}) {
    this.roomRepository = roomRepository;
  }

  execute(roomName) {
    const existingRoom = this.roomRepository.findByRoomName(roomName);
    if (existingRoom == null) {
      return this.roomRepository.save(new Room({ room: roomName }));
    }

    return existingRoom;
  }
};
