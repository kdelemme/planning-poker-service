const expect = require("chai").expect;
const Room = require("../../../src/domain/model/room");
const Participant = require("../../../src/domain/model/participant");

describe("Room", () => {
  it("should initiate with default parameters", () => {
    const aRoom = new Room();

    expect(aRoom).to.have.property("id").which.is.not.null;
    expect(aRoom).to.have.property("room").which.is.undefined;
    expect(aRoom).to.have.property("participants").which.is.empty;
    expect(aRoom).to.have.property("voteInProgress").which.is.false;
  });

  it("should initiate with a name and default parameters", () => {
    const aRoom = new Room({ room: "a room" });

    expect(aRoom).to.have.property("id").which.is.not.null;
    expect(aRoom)
      .to.have.property("room")
      .which.is.eq("a room");
    expect(aRoom).to.have.property("participants").which.is.empty;
    expect(aRoom).to.have.property("voteInProgress").which.is.false;
  });

  describe("storeParticipants", () => {
    it("should add participants", () => {
      const aRoom = new Room();
      const aParticipant = new Participant({ name: "Alice B." });

      aRoom.storeParticipant(aParticipant);

      expect(aRoom.listParticipants()).to.have.lengthOf(1);
    });

    it("should make participant admin if first", () => {
      const aRoom = new Room();

      aRoom.storeParticipant(new Participant({ name: "Alice B." }));
      expect(aRoom.listParticipants()[0]).to.have.property("isAdmin", true);

      aRoom.storeParticipant(new Participant({ name: "John Doe" }));
      expect(aRoom.listParticipants()[1]).to.have.property("isAdmin", false);
    });
  });

  describe("listParticipants", () => {
    it("should not return card properties", () => {
      const aRoom = new Room();
      const aParticipant = new Participant({ name: "Alice B." });
      aRoom.storeParticipant(aParticipant);
      aRoom.storeVote(aParticipant, 10);

      expect(aRoom.listParticipants()[0]).to.not.have.property("card");
    });
  });

  describe("listParticipantsWithVote", () => {
    it("should return card property", () => {
      const aRoom = new Room();
      const aParticipant = new Participant({ name: "Alice B." });
      aRoom.storeParticipant(aParticipant);
      aRoom.storeVote(aParticipant, 10);

      expect(aRoom.listParticipantsWithVote()[0]).to.have.property("card");
    });
  });

  describe("removeParticipant", () => {
    let aRoom, aParticipant1, aParticipant2;

    beforeEach(() => {
      aRoom = new Room();
      aParticipant1 = new Participant({ name: "Alice B." });
      aParticipant2 = new Participant({ name: "John L." });
      aRoom.storeParticipant(aParticipant1);
      aRoom.storeParticipant(aParticipant2);
    });

    it("should remove participant from participants list", () => {
      expect(aRoom.listParticipants()).to.have.lengthOf(2);

      aRoom.removeParticipant(aParticipant1);

      expect(aRoom.listParticipants()).to.have.lengthOf(1);
      expect(aRoom.listParticipants()[0]).to.have.property("id", aParticipant2.id);
    });

    it("should change the admin", () => {
      expect(aParticipant1.isAdmin).to.be.true;
      expect(aParticipant2.isAdmin).to.be.false;

      aRoom.removeParticipant(aParticipant1);

      expect(aRoom.isAdmin(aParticipant2.id)).to.be.true;
    });
  });

  describe("startVote", () => {
    let aRoom, aParticipant1, aParticipant2;

    beforeEach(() => {
      aRoom = new Room();
      aParticipant1 = new Participant({ name: "Alice B." });
      aParticipant2 = new Participant({ name: "John L." });
      aRoom.storeParticipant(aParticipant1);
      aRoom.storeParticipant(aParticipant2);
    });

    it("should allow only admin to start a vote", () => {
      expect(aRoom.startVote(aParticipant1)).to.be.true;
      expect(aRoom.startVote(aParticipant2)).to.be.false;
    });

    it("should mark vote in progress and clear all participant votes", () => {
      aRoom.startVote(aParticipant1);

      expect(aRoom.voteInProgress).to.be.true;
      expect(aRoom.listParticipantsWithVote()[0]).to.have.property("hasVoted", false);
      expect(aRoom.listParticipantsWithVote()[0]).to.have.property("card", null);
      expect(aRoom.listParticipantsWithVote()[1]).to.have.property("hasVoted", false);
      expect(aRoom.listParticipantsWithVote()[1]).to.have.property("card", null);
    });
  });

  describe("storeVote", () => {
    let aRoom, aParticipant1, aParticipant2;

    beforeEach(() => {
      aRoom = new Room();
      aParticipant1 = new Participant({ name: "Alice B." });
      aParticipant2 = new Participant({ name: "John L." });
      aRoom.storeParticipant(aParticipant1);
      aRoom.storeParticipant(aParticipant2);
    });

    it("should mark the participant hasVoted", () => {
      aRoom.storeVote(aParticipant1, 3);

      expect(aRoom.listParticipantsWithVote()[0]).to.have.property("card", 3);
      expect(aRoom.listParticipantsWithVote()[0]).to.have.property("hasVoted", true);
    });

    it("should update the participant card", () => {
      aRoom.storeVote(aParticipant1, 3);

      expect(aRoom.listParticipantsWithVote()[0]).to.have.property("card", 3);
      expect(aRoom.listParticipantsWithVote()[0]).to.have.property("hasVoted", true);

      aRoom.storeVote(aParticipant1, 10);

      expect(aRoom.listParticipantsWithVote()[0]).to.have.property("card", 10);
    });
  });
});
