const app = require("express")();
const bodyParser = require("body-parser");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const uuid = require("uuid/v4");

app.use(bodyParser.json());

const rooms = {};
const participants = {};
const estimations = {};

// init to be removed
rooms["39944e90-c9f5-427e-a616-98c3f91b08bb"] = { name: "Borderless" };
// end

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/rooms", (req, res) => {
  const payload = req.body;
  const id = uuid.v4();
  rooms[id] = { name: payload.name };
  return res.json({ id, ...rooms[id] });
});

io.use((socket, next) => {
  const roomId = socket.handshake.query.roomId;

  if (rooms[roomId]) {
    return next();
  }
  return next(new Error("Room not found"));
});

io.on("connection", socket => {
  const roomId = socket.handshake.query.roomId;

  socket.join(roomId, err => {
    if (err) {
      console.error(`${socket.id} failed to join ${rooms[roomId]}`);
    }

    storeParticipant(roomId, socket.id);
    io.to(roomId).emit("PARTICIPANT_LIST", participants[roomId]);
  });

  socket.on("disconnecting", () => {
    removeParticipant(roomId, socket.id);
    removeEstimation(roomId, socket.id);
    io.to(roomId).emit("PARTICIPANT_LIST", participants[roomId]);

    if (allParticipantsHaveVoted(roomId)) {
      io.to(roomId).emit("ESTIMATIONS_RESULT", estimations[roomId]);
    }
  });

  socket.on("PLAY_CARD", data => {
    console.log(`Participant ${socket.id} played the card: ${data.value} in roomId ${roomId}`);
    storeEstimation(roomId, socket.id, data.value);

    if (allParticipantsHaveVoted(roomId)) {
      io.to(roomId).emit("ESTIMATIONS_RESULT", estimations[roomId]);
    }
  });

  socket.on("START_ESTIMATION", data => {
    startEstimation(roomId);
    io.to(roomId).emit("ESTIMATION_STARTED");
  });
});

const storeParticipant = (roomId, participant) => {
  if (participants[roomId] === undefined) {
    participants[roomId] = [];
  }

  participants[roomId].push(participant);
};

const removeParticipant = (roomId, participant) => {
  participants[roomId] = participants[roomId].filter(p => p !== participant);
};

const numberOfParticipants = roomId => participants[roomId].length;

const startEstimation = roomId => (estimations[roomId] = []);

const storeEstimation = (roomId, participant, estimation) => {
  if (estimations[roomId] === undefined) {
    estimations[roomId] = [];
  }

  let existingEstimation = estimations[roomId].find(e => e.participant === participant);
  if (!existingEstimation) {
    estimations[roomId].push({ participant, estimation });
  } else {
    existingEstimation.estimation = estimation;
  }
};

const removeEstimation = (roomId, participant) => {
  if (estimations[roomId]) {
    estimations[roomId] = estimations[roomId].filter(estimation => estimation.participant !== participant);
  }
};

const allParticipantsHaveVoted = roomId => {
  return (
    estimations[roomId] &&
    participants[roomId].every(participant => estimations[roomId].find(e => e.participant === participant))
  );
};

http.listen(3000, () => {
  console.log("listening on *:3000");
});
