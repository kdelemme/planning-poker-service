const { createContainer, asClass } = require("awilix");
const InMemoryRoomRepository = require("./infrastructure/persistence/inMemoryRoomRepository");
const CreateRoom = require("./application/service/createRoom");
const StartVote = require("./application/service/start-vote");

module.exports = function configureContainer() {
  const container = createContainer();
  container.register({
    roomRepository:
      process.env.NODE_ENV === "production"
        ? asClass(InMemoryRoomRepository).singleton()
        : asClass(InMemoryRoomRepository).singleton(),
    createRoom: asClass(CreateRoom).singleton(),
    startVote: asClass(StartVote).singleton(),
  });

  return container;
};
