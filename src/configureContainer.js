const { createContainer, asClass } = require("awilix");
const InMemoryRoomRepository = require("./infrastructure/persistence/in-memory-room-repository");
const CreateRoom = require("./application/service/create-room");
const StartVote = require("./application/service/start-vote");
const StoreVote = require("./application/service/store-vote");
const RemoveParticipant = require("./application/service/remove-participant");
const StoreParticipant = require("./application/service/store-participant");

module.exports = function configureContainer() {
  const container = createContainer();
  container.register({
    roomRepository:
      process.env.NODE_ENV === "production"
        ? asClass(InMemoryRoomRepository).singleton()
        : asClass(InMemoryRoomRepository).singleton(),
    createRoom: asClass(CreateRoom).singleton(),
    startVote: asClass(StartVote).singleton(),
    storeVote: asClass(StoreVote).singleton(),
    removeParticipant: asClass(RemoveParticipant).singleton(),
    storeParticipant: asClass(StoreParticipant).singleton()
  });

  return container;
};
