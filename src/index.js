const app = require("express")();
const bodyParser = require("body-parser");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const uuid = require("uuid/v4");

app.use(bodyParser.json());

const rooms = {};

io.use((socket, next) => {
  const roomId = socket.handshake.query.roomId;

  if (rooms[roomId] === undefined) {
    rooms[roomId] = {};
    socket.handshake.query.isAdmin = true;
  }
  return next();
});

io.on("connection", socket => {
  const roomId = socket.handshake.query.roomId;
  const participantId = uuid();
  const participant = {
    id: participantId,
    name: socket.handshake.query.participant || socket.id,
    isAdmin: socket.handshake.query.isAdmin || false
  };

  socket.join(roomId, err => {
    if (err) {
      console.error(`${socket.id} failed to join ${rooms[roomId]}`);
    }

    storeParticipant(roomId, participant);
    socket.emit("ON_CONNECT", { participantId });
    io.to(roomId).emit("PARTICIPANT_LIST", listParticipants(roomId));
  });

  socket.on("disconnecting", () => {
    removeParticipant(roomId, participantId);
    removeEstimation(roomId, participantId);
    changeAdmin(roomId, participantId);
    io.to(roomId).emit("PARTICIPANT_LIST", listParticipants(roomId));

    if (allParticipantsHaveVoted(roomId)) {
      io.to(roomId).emit("ESTIMATIONS_RESULT", listEstimations(roomId));
    }
  });

  socket.on("PLAY_CARD", data => {
    storeEstimation(roomId, participantId, data.value);
    io.to(roomId).emit("CARD_PLAYED", { participantId });

    if (allParticipantsHaveVoted(roomId)) {
      io.to(roomId).emit("ESTIMATIONS_RESULT", listEstimations(roomId));
    }
  });

  socket.on("START_ESTIMATION", data => {
    if (participant.isAdmin) {
      startEstimation(roomId);
      io.to(roomId).emit("ESTIMATION_STARTED");
    }
  });

  socket.on("CHANGE_NAME", data => {
    let participant = renameParticipant(roomId, participantId, data.name);
    io.to(roomId).emit("NAME_CHANGED", participant);
  });
});

const storeParticipant = (roomId, participant) => {
  if (listParticipants(roomId) === undefined) {
    rooms[roomId].participants = [];
  }

  rooms[roomId].participants.push(participant);
};

const removeParticipant = (roomId, participantId) => {
  rooms[roomId].participants = listParticipants(roomId).filter(p => p.id !== participantId);
};

const renameParticipant = (roomId, participantId, name) => {
  let participant = listParticipants(roomId).find(p => p.id === participantId);
  if (participant) {
    participant.name = name;
  }
  return participant;
};

const numberOfParticipants = roomId => rooms[roomId].participants.length;

const startEstimation = roomId => (rooms[roomId].estimations = []);

const storeEstimation = (roomId, participantId, estimation) => {
  if (listEstimations(roomId) === undefined) {
    rooms[roomId].estimations = [];
  }

  let existingEstimation = listEstimations(roomId).find(e => e.participantId === participantId);
  if (!existingEstimation) {
    rooms[roomId].estimations.push({ participantId, estimation });
  } else {
    existingEstimation.estimation = estimation;
  }
};

const removeEstimation = (roomId, participantId) => {
  if (listEstimations(roomId)) {
    rooms[roomId].estimations = listEstimations(roomId).filter(
      estimation => estimation.participantId !== participantId
    );
  }
};

const changeAdmin = (roomId, participantId) => {
  if (rooms[roomId].participants && rooms[roomId].participants.length > 0) {
    rooms[roomId].participants[0].isAdmin = true;
  }
};

const allParticipantsHaveVoted = roomId => {
  return (
    listEstimations(roomId) &&
    listParticipants(roomId).every(participant => listEstimations(roomId).find(e => e.participantId === participant.id))
  );
};

const listParticipants = roomId => rooms[roomId].participants;
const listEstimations = roomId => rooms[roomId].estimations;

const isAdmin = participant => participant.isAdmin;

http.listen(3000, () => {
  console.log("listening on *:3000");
});
