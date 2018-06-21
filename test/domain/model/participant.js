const expect = require("chai").expect;
const Participant = require("../../../src/domain/model/participant");

describe("Participant", () => {
  it("should make the participant admin", () => {
    const aParticipant = new Participant();
    expect(aParticipant.isAdmin).to.be.false;

    aParticipant.markAsAdmin();

    expect(aParticipant.isAdmin).to.be.true;
  });

  it("should handle vote", () => {
    const aParticipant = new Participant();
    expect(aParticipant.hasVoted).to.be.false;
    expect(aParticipant.card).to.be.null;

    aParticipant.vote(3);

    expect(aParticipant.hasVoted).to.be.true;
    expect(aParticipant.card).to.be.eq(3);
  });

  it("should clear vote", () => {
    const aParticipant = new Participant();
    aParticipant.vote(3);
    expect(aParticipant.hasVoted).to.be.true;
    expect(aParticipant.card).to.be.eq(3);

    aParticipant.clearVote();

    expect(aParticipant.hasVoted).to.be.false;
    expect(aParticipant.card).to.be.null;
  });
});
