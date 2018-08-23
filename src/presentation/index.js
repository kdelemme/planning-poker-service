const app = require("express")();
const bodyParser = require("body-parser");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const uuid = require("uuid/v4");

const { Room, Participant } = require("../domain/model");

const container = require("../configureContainer")();
const createRoom = container.resolve("createRoom");
const startVote = container.resolve("startVote");
const storeVote = container.resolve("storeVote");
const roomRepository = container.resolve("roomRepository");

app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

io.use(async (socket, next) => {
  await createRoom.execute(socket.handshake.query.room);
  return next();
});

io.on("connection", async socket => {
  const roomName = socket.handshake.query.room;
  const room = await roomRepository.findByRoomName(socket.handshake.query.room);
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

  socket.on("VOTE_CARD", async data => {
    const { participants, allParticipantsHaveVoted, participantsWithVote } = await storeVote.execute(
      roomName,
      participant,
      data.value
    );

    if (participants != null) {
      io.to(room).emit("PARTICIPANTS", participants);

      if (allParticipantsHaveVoted) {
        io.to(room).emit("PARTICIPANTS_WITH_VOTE", participantsWithVote);
      }
    }
  });

  socket.on("START_VOTE", async data => {
    const { voteStarted, participants } = await startVote.execute(roomName, participant);
    if (voteStarted) {
      io.to(room).emit("PARTICIPANTS", participants);
      io.to(room).emit("VOTE_STARTED");
    }
  });
});

http.listen(3000, () => {
  console.log(`listening on *:3000`);
});
