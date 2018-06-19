// in memory repository
module.exports = class RoomRepository {
  constructor() {
    this.rooms = [];
  }

  findByName(roomName) {
    return this.rooms.find(r => r.name === roomName);
  }

  save(room) {
    let existingRoom = this.rooms.find(r => r.name === room.name);
    if (!existingRoom) {
      this.rooms.push(room);
    } else {
      existingRoom = room;
    }
  }
};
