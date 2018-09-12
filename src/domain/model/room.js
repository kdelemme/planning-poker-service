const uuid = require("uuid/v4");

module.exports = class Room {
  constructor({ id = uuid(), name = undefined, participants = [], voteInProgress = false } = {}) {
    this.id = id;
    this.name = name;
    this.participants = participants;
    this.voteInProgress = voteInProgress;
  }

  storeParticipant(participant) {
    this.participants.push(participant);
    if (this.participants.length === 1) {
      this.participants[0].markAsAdmin();
    }
  }

  findParticipantById(id) {
    return this.participants.find(participant => participant.id === id);
  }

  listParticipants() {
    return this.participants.map(({ id, name, isAdmin, hasVoted }) => {
      return { id, name, isAdmin, hasVoted };
    });
  }

  listParticipantsWithVote() {
    return this.participants;
  }

  removeParticipantById(participantId) {
    this.participants = this.participants.filter(p => p.id !== participantId);

    let adminStillConnected = this.participants.find(p => p.isAdmin);
    if (!adminStillConnected && this.participants.length > 0) {
      this.participants[0].markAsAdmin();
    }
  }

  startVote(participant) {
    if (!this.isAdmin(participant.id)) {
      return false;
    }
    this.voteInProgress = true;
    this.participants.forEach(p => p.clearVote());

    return true;
  }

  storeVote(participant, card) {
    let voter = this.participants.find(p => p.id === participant.id);
    voter.vote(card);
  }

  completeVote() {
    this.voteInProgress = false;
  }

  allParticipantsHaveVoted() {
    return this.participants.every(participant => participant.hasVoted);
  }

  isAdmin(participantId) {
    return this.participants.find(p => p.id === participantId && p.isAdmin) !== undefined;
  }
};
