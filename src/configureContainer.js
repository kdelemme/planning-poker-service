const { createContainer, asClass } = require("awilix");
const InMemoryRoomRepository = require("./infrastructure/persistence/inMemoryRoomRepository");
const CreateRoom = require("./application/service/createRoom");

module.exports = function configureContainer() {
  const container = createContainer();
  container.register({
    roomRepository:
      process.env.NODE_ENV === "production"
        ? asClass(InMemoryRoomRepository).singleton()
        : asClass(InMemoryRoomRepository).singleton(),
    createRoom: asClass(CreateRoom).singleton()
  });

  return container;
};
