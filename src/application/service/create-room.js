const Room = require("../../domain/model/room");

module.exports = class CreateRoom {
  constructor({ roomRepository } = {}) {
    this.roomRepository = roomRepository;
  }

  async execute(roomName) {
    const existingRoom = await this.roomRepository.findByRoomName(roomName);
    if (existingRoom == null) {
      return await this.roomRepository.save(new Room({ name: roomName }));
    }

    return existingRoom;
  }
};
