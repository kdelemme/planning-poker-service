const uuid = require("uuid/v4");

module.exports = class Room {
  constructor(id = uuid(), room, participants = [], estimations = [], estimationInProgress = false) {
    this.id = id;
    this.room = room;
    this.participants = participants;
    this.estimations = estimations;
    this.estimationInProgress = estimationInProgress;
  }

  storeParticipant(participant) {
    this.participants.push(participant);
  }

  removeParticipant(participantId) {
    this.participants = this.participants.filter(p => p.id !== participantId);
    this.estimations = this.estimations.filter(estimation => estimation.participantId !== participantId);

    let adminStillConnected = this.participants.find(p => p.isAdmin);
    if (!adminStillConnected && this.participants.length > 0) {
      this.participants[0].markAsAdmin();
    }
  }

  numberOfParticipants() {
    return rooms[room].participants.length;
  }

  startEstimation(participant) {
    if (!this.isAdmin()) {
      return false;
    }
    this.estimationInProgress = true;
    this.estimations = [];
    this.participants.forEach(p => p.clearVote());

    return true;
  }

  storeEstimation(estimation) {
    let existingEstimation = this.estimations.find(e => e.participantId === estimation.participantId);
    if (!existingEstimation) {
      this.estimations.push(new Estimation(participantId, estimation));
    } else {
      existingEstimation.estimation = estimation;
    }

    let participant = this.participants.find(p => p.id === estimation.participantId);
    participant.voted();
  }

  estimationInProgress() {
    return this.estimationInProgress;
  }

  markEstimationAsCompleted() {
    this.estimationInProgress = false;
  }

  allParticipantsHaveVoted() {
    return this.participants.every(participant => this.estimations.find(e => e.participantId === participant.id));
  }

  listEstimations() {
    return this.estimations;
  }

  isAdmin(participantId) {
    return this.participants.find(p => p.id === participantId && p.isAdmin());
  }
};
