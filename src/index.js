var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const ROOM = "Borderless";
const participants = {};
const estimations = {};

io.on("connection", socket => {
  socket.join(ROOM, err => {
    if (err) {
      console.error(`${socket.id} failed to join ${ROOM}`);
    }

    storeParticipant(getConnectedRoom(socket), socket.id);
    io.to(getConnectedRoom(socket)).emit("PARTICIPANT_LIST", participants[getConnectedRoom(socket)]);
  });

  socket.on("disconnecting", () => {
    removeParticipant(getConnectedRoom(socket), socket.id);
    removeEstimation(getConnectedRoom(socket), socket.id);
    io.to(getConnectedRoom(socket)).emit("PARTICIPANT_LIST", participants[getConnectedRoom(socket)]);

    if (allParticipantsHaveVoted(getConnectedRoom(socket))) {
      io.to(getConnectedRoom(socket)).emit("ESTIMATIONS_RESULT", estimations[getConnectedRoom(socket)]);
    }
  });

  socket.on("PLAY_CARD", data => {
    console.log(`${socket.id} played the card: ${data.value}`);
    storeEstimation(getConnectedRoom(socket), socket.id, data.value);

    if (allParticipantsHaveVoted(getConnectedRoom(socket))) {
      io.to(getConnectedRoom(socket)).emit("ESTIMATIONS_RESULT", estimations[getConnectedRoom(socket)]);
    }
  });

  socket.on("START_ESTIMATION", data => {
    startEstimation(getConnectedRoom(socket));
    io.to(getConnectedRoom(socket)).emit("ESTIMATION_STARTED");
  });
});

const storeParticipant = (room, participant) => {
  if (participants[room] === undefined) {
    participants[room] = [];
  }

  participants[room].push(participant);
};

const removeParticipant = (room, participant) => {
  participants[room] = participants[room].filter(p => p !== participant);
};

const numberOfParticipants = room => participants[room].length;

const startEstimation = room => (estimations[room] = []);

const storeEstimation = (room, participant, estimation) => {
  if (estimations[room] === undefined) {
    estimations[room] = [];
  }

  let existingEstimation = estimations[room].find(e => e.participant === participant);
  if (!existingEstimation) {
    estimations[room].push({ participant, estimation });
  } else {
    existingEstimation.estimation = estimation;
  }
};

const removeEstimation = (room, participant) => {
  if (estimations[room]) {
    estimations[room] = estimations[room].filter(estimation => estimation.participant !== participant);
  }
};

const allParticipantsHaveVoted = room => {
  return (
    estimations[room] &&
    participants[room].every(participant => estimations[room].find(e => e.participant === participant))
  );
};

const getConnectedRoom = socket => Object.values(socket.rooms).find(room => room !== socket.id);

http.listen(3000, () => {
  console.log("listening on *:3000");
});
