const Room = require("../../domain/model/room");

module.exports = class CreateOrGetRoom {
  constructor(roomRepository) {
    this.roomRepository = roomRepository;
  }

  execute(roomName) {
    if (!this.roomRepository.findByRoomName(roomName)) {
      this.roomRepository.save(new Room({ room: roomName }));
    }
  }
};
