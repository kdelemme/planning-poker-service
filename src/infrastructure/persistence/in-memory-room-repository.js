module.exports = class InMemoryRoomRepository {
  constructor() {
    this.rooms = [];
  }

  findByRoomName(roomName) {
    return this.rooms.find(r => r.name === roomName);
  }

  save(room) {
    let existingRoom = this.rooms.find(r => r.id === room.id);
    if (existingRoom === undefined) {
      this.rooms.push(room);
    } else {
      existingRoom = room;
    }

    return room;
  }
};
