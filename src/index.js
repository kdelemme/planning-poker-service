const app = require("express")();
const bodyParser = require("body-parser");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const uuid = require("uuid/v4");

const Room = require("./domain/model/room");
const Participant = require("./domain/model/participant");

const InMemoryRoomRepository = require("./infrastructure/persistence/inMemoryRoomRepository");
const RoomRepository =
  process.env.NODE_ENV === "production" ? new InMemoryRoomRepository() : new InMemoryRoomRepository();

app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

io.use((socket, next) => {
  const { room } = socket.handshake.query;
  if (!RoomRepository.findByRoomName(room)) {
    RoomRepository.save(new Room({ room }));
  }
  return next();
});

io.on("connection", socket => {
  const room = RoomRepository.findByRoomName(socket.handshake.query.room);
  const participant = new Participant({ name: socket.handshake.query.name });

  socket.join(room, err => {
    if (err) {
      console.error(`${socket.id} failed to join ${room}`);
    }

    room.storeParticipant(participant);

    socket.emit("ON_CONNECT", { participantId: participant.id });
    io.to(room).emit("PARTICIPANTS", room.listParticipants());

    if (room.voteInProgress) {
      socket.emit("VOTE_STARTED");
    }
  });

  socket.on("disconnecting", () => {
    room.removeParticipant(participant);

    io.to(room).emit("PARTICIPANTS", room.listParticipants());

    if (room.allParticipantsHaveVoted()) {
      io.to(room).emit("PARTICIPANTS_WITH_VOTE", room.listParticipantsWithVote());
      room.completeVote();
    }
  });

  socket.on("VOTE_CARD", data => {
    room.storeVote(participant, data.value);
    io.to(room).emit("PARTICIPANTS", room.listParticipants());

    if (room.allParticipantsHaveVoted()) {
      io.to(room).emit("PARTICIPANTS_WITH_VOTE", room.listParticipantsWithVote());
      room.completeVote();
    }
  });

  socket.on("START_VOTE", data => {
    if (room.startVote(participant)) {
      io.to(room).emit("PARTICIPANTS", room.listParticipants());
      io.to(room).emit("VOTE_STARTED");
    }
  });
});

http.listen(3000, () => {
  console.log(`listening on *:3000`);
});
