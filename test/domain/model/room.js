const expect = require("chai").expect;
const Room = require("../../../src/domain/model/room");
const Participant = require("../../../src/domain/model/participant");
const Estimation = require("../../../src/domain/model/estimation");

describe("Room", () => {
  it("should initiate with default parameters", () => {
    const aRoom = new Room();

    expect(aRoom).to.have.property("id").which.is.not.null;
    expect(aRoom).to.have.property("room").which.is.undefined;
    expect(aRoom).to.have.property("participants").which.is.empty;
    expect(aRoom).to.have.property("estimations").which.is.empty;
    expect(aRoom).to.have.property("estimationInProgress").which.is.false;
  });

  it("should initiate with a name and default parameters", () => {
    const aRoom = new Room(undefined, "a room");

    expect(aRoom).to.have.property("id").which.is.not.null;
    expect(aRoom)
      .to.have.property("room")
      .which.is.eq("a room");
    expect(aRoom).to.have.property("participants").which.is.empty;
    expect(aRoom).to.have.property("estimations").which.is.empty;
    expect(aRoom).to.have.property("estimationInProgress").which.is.false;
  });

  it("should add participants", () => {
    const aRoom = new Room();
    const aParticipant = new Participant(undefined, "Alice B.");

    aRoom.storeParticipant(aParticipant);

    expect(aRoom.listParticipants()).to.have.lengthOf(1);
  });

  describe("Remove participant", () => {
    let aRoom, aParticipant1, aParticipant2;

    beforeEach(() => {
      aRoom = new Room();
      aParticipant1 = new Participant(undefined, "Alice B.");
      aParticipant2 = new Participant(undefined, "John L.");
      aRoom.storeParticipant(aParticipant1);
      aRoom.storeParticipant(aParticipant2);
    });

    it("should remove participant from participants list", () => {
      expect(aRoom.listParticipants()).to.have.lengthOf(2);

      aRoom.removeParticipant(aParticipant1);

      expect(aRoom.listParticipants()).to.have.lengthOf(1);
      expect(aRoom.listParticipants()[0]).to.eq(aParticipant2);
    });

    it("should remove participant estimations", () => {
      aRoom.storeEstimation(new Estimation(aParticipant1.id, 3));
      expect(aRoom.listEstimations()).to.have.lengthOf(1);

      aRoom.removeParticipant(aParticipant1);

      expect(aRoom.listEstimations()).to.have.lengthOf(0);
    });

    it("should change the admin", () => {
      expect(aParticipant1.isAdmin()).to.be.true;
      expect(aParticipant2.isAdmin()).to.be.false;

      aRoom.removeParticipant(aParticipant1);

      expect(aRoom.isAdmin(aParticipant2.id)).to.be.true;
    });
  });

  describe("Store estimation", () => {
    let aRoom, aParticipant1, aParticipant2;

    beforeEach(() => {
      aRoom = new Room();
      aParticipant1 = new Participant(undefined, "Alice B.");
      aParticipant2 = new Participant(undefined, "John L.");
      aRoom.storeParticipant(aParticipant1);
      aRoom.storeParticipant(aParticipant2);
    });

    it("should store a new estimation", () => {
      aRoom.storeEstimation(new Estimation(aParticipant1.id, 5));

      expect(aRoom.listEstimations()).to.have.lengthOf(1);
    });

    it("should mark the participant has voted", () => {
      aRoom.storeEstimation(new Estimation(aParticipant1.id, 5));

      expect(aRoom.listParticipants()[0]).to.have.property("hasVoted", true);
    });

    it("should update an existing estimation", () => {
      aRoom.storeEstimation(new Estimation(aParticipant1.id, 5));

      expect(aRoom.listEstimations()[0])
        .to.have.property("estimation")
        .to.eq(5);

      aRoom.storeEstimation(new Estimation(aParticipant1.id, 13));

      expect(aRoom.listEstimations()[0])
        .to.have.property("estimation")
        .to.eq(13);
    });
  });
});
