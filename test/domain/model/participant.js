const expect = require("chai").expect;
const Participant = require("../../../src/domain/model/participant");
const Estimation = require("../../../src/domain/model/estimation");

describe("Participant", () => {
  it("should make the participant admin", () => {
    const aParticipant = new Participant();
    expect(aParticipant.isAdmin()).to.be.false;

    aParticipant.markAsAdmin();

    expect(aParticipant.isAdmin()).to.be.true;
  });

  it("should mark the participant as voted", () => {
    const aParticipant = new Participant();
    expect(aParticipant.hasVoted).to.be.false;

    aParticipant.voted();

    expect(aParticipant.hasVoted).to.be.true;
  });
});
