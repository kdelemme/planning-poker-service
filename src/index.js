const app = require("express")();
const bodyParser = require("body-parser");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const uuid = require("uuid/v4");

const Room = require("./domain/model/room");
const Participant = require("./domain/model/participant");
const Estimation = require("./domain/model/estimation");
const RoomRepository = new require("./infrastructure/persistence/room-repository");

app.use(bodyParser.json());
io.use((socket, next) => {
  const { room } = socket.handshake.query;
  roomRepository.save(new Room(undefined, room));
  return next();
});

io.on("connection", socket => {
  const room = roomRepository.findByName(socket.handshake.query.room);
  const participant = new Participant(undefined, socket.handshake.query.name);

  socket.join(room, err => {
    if (err) {
      console.error(`${socket.id} failed to join ${rooms[room]}`);
    }

    room.storeParticipant(participant);
    socket.emit("ON_CONNECT", { participantId: participant.id });
    io.to(room).emit("PARTICIPANT_LIST", room.listParticipants());

    if (room.estimationInProgress()) {
      socket.emit("ESTIMATION_STARTED");
    }
  });

  socket.on("disconnecting", () => {
    room.removeParticipant(participant);

    io.to(room).emit("PARTICIPANT_LIST", room.listParticipants());

    if (room.allParticipantsHaveVoted()) {
      io.to(room).emit("ESTIMATIONS_RESULT", room.listEstimations());
      room.markEstimationAsCompleted();
    }
  });

  socket.on("PLAY_CARD", data => {
    room.storeEstimation(new Estimation(participantId, data.value));

    io.to(room).emit("PARTICIPANT_LIST", room.listParticipants());

    if (room.allParticipantsHaveVoted()) {
      io.to(room).emit("ESTIMATIONS_RESULT", room.listEstimations());
      room.markEstimationAsCompleted();
    }
  });

  socket.on("START_ESTIMATION", data => {
    if (room.startEstimation(participant)) {
      io.to(room).emit("PARTICIPANT_LIST", room.listParticipants());
      io.to(room).emit("ESTIMATION_STARTED");
    }
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
