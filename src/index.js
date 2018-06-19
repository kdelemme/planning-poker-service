const app = require("express")();
const bodyParser = require("body-parser");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const uuid = require("uuid/v4");

app.use(bodyParser.json());

const rooms = {};

io.use((socket, next) => {
  const { room } = socket.handshake.query;

  if (rooms[room] === undefined) {
    rooms[room] = {};
  }
  return next();
});

io.on("connection", socket => {
  const room = socket.handshake.query.room;
  const participantId = uuid();
  const participant = {
    id: participantId,
    name: socket.handshake.query.name,
    isAdmin: rooms[room].participants === undefined || rooms[room].participants.length === 0,
    hasVoted: false
  };

  socket.join(room, err => {
    if (err) {
      console.error(`${socket.id} failed to join ${rooms[room]}`);
    }

    storeParticipant(room, participant);
    socket.emit("ON_CONNECT", { participantId });
    io.to(room).emit("PARTICIPANT_LIST", listParticipants(room));

    if (rooms[room].estimationInProgress) {
      socket.emit("ESTIMATION_STARTED");
    }
  });

  socket.on("disconnecting", () => {
    removeParticipant(room, participantId);
    removeEstimation(room, participantId);

    changeAdmin(room, participantId);

    io.to(room).emit("PARTICIPANT_LIST", listParticipants(room));

    if (allParticipantsHaveVoted(room)) {
      io.to(room).emit("ESTIMATIONS_RESULT", listEstimations(room));
      rooms[room].estimationInProgress = false;
    }
  });

  socket.on("PLAY_CARD", data => {
    storeEstimation(room, participantId, data.value);
    markParticipantAsVoted(room, participantId);

    io.to(room).emit("PARTICIPANT_LIST", listParticipants(room));

    if (allParticipantsHaveVoted(room)) {
      io.to(room).emit("ESTIMATIONS_RESULT", listEstimations(room));
      rooms[room].estimationInProgress = false;
    }
  });

  socket.on("START_ESTIMATION", data => {
    if (participant.isAdmin) {
      startEstimation(room);
      io.to(room).emit("PARTICIPANT_LIST", listParticipants(room));
      io.to(room).emit("ESTIMATION_STARTED");
    }
  });
});

const storeParticipant = (room, participant) => {
  if (listParticipants(room) === undefined) {
    rooms[room].participants = [];
  }

  rooms[room].participants.push(participant);
};

const removeParticipant = (room, participantId) => {
  rooms[room].participants = listParticipants(room).filter(p => p.id !== participantId);
};

const numberOfParticipants = room => rooms[room].participants.length;

const startEstimation = room => {
  rooms[room].estimationInProgress = true;
  rooms[room].estimations = [];
  rooms[room].participants = rooms[room].participants.map(p => {
    return { ...p, hasVoted: false };
  });
};

const storeEstimation = (room, participantId, estimation) => {
  if (listEstimations(room) === undefined) {
    rooms[room].estimations = [];
  }

  let existingEstimation = listEstimations(room).find(e => e.participantId === participantId);
  if (!existingEstimation) {
    rooms[room].estimations.push({ participantId, estimation });
  } else {
    existingEstimation.estimation = estimation;
  }
};

const markParticipantAsVoted = (room, participantId) => {
  let participant = listParticipants(room).find(p => p.id === participantId);
  participant.hasVoted = true;
};

const removeEstimation = (room, participantId) => {
  if (rooms[room].estimationInProgress && listEstimations(room)) {
    rooms[room].estimations = listEstimations(room).filter(estimation => estimation.participantId !== participantId);
  }
};

const changeAdmin = (room, participantId) => {
  let adminStillConnected = rooms[room].participants.find(p => p.isAdmin);

  if (!adminStillConnected && rooms[room].participants.length > 0) {
    rooms[room].participants[0].isAdmin = true;
  }
};

const allParticipantsHaveVoted = room => {
  return (
    listEstimations(room) &&
    listParticipants(room).every(participant => listEstimations(room).find(e => e.participantId === participant.id))
  );
};

const listParticipants = room => rooms[room].participants;
const listEstimations = room => rooms[room].estimations;

const isAdmin = participant => participant.isAdmin;

http.listen(3000, () => {
  console.log("listening on *:3000");
});
