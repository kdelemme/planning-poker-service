const { createContainer, asClass, asValue } = require("awilix");
const MongoClient = require("mongodb").MongoClient;

const InMemoryRoomRepository = require("./infrastructure/persistence/in-memory-room-repository");
const MongoRoomRepository = require("./infrastructure/persistence/mongo-room-repository");
const CreateRoom = require("./application/service/create-room");
const StartVote = require("./application/service/start-vote");
const StoreVote = require("./application/service/store-vote");
const RemoveParticipant = require("./application/service/remove-participant");
const StoreParticipant = require("./application/service/store-participant");

async function createMongoConnection() {
  const url = "mongodb://localhost:27017";
  const dbName = "planningpoker-test";
  const client = await MongoClient.connect(
    url,
    { useNewUrlParser: true }
  );
  return client.db(dbName);
}

module.exports = async function configureContainer() {
  let dbConnection;
  if (process.env.NODE_ENV === "production") {
    dbConnection = await createMongoConnection();
  }

  const container = createContainer();
  container.register({
    dbConnection: asValue(dbConnection),
    roomRepository:
      process.env.NODE_ENV === "production"
        ? asClass(MongoRoomRepository).singleton()
        : asClass(InMemoryRoomRepository).singleton(),
    createRoom: asClass(CreateRoom).singleton(),
    startVote: asClass(StartVote).singleton(),
    storeVote: asClass(StoreVote).singleton(),
    removeParticipant: asClass(RemoveParticipant).singleton(),
    storeParticipant: asClass(StoreParticipant).singleton()
  });

  return container;
};
