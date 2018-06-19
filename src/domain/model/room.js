const uuid = require("uuid/v4");

module.exports = class Room {
  constructor(id = uuid(), room = undefined, participants = [], estimations = [], estimationInProgress = false) {
    this.id = id;
    this.room = room;
    this.participants = participants;
    this.estimations = estimations;
    this.estimationInProgress = estimationInProgress;
  }

  storeParticipant(participant) {
    this.participants.push(participant);
    if (this.participants.length === 1) {
      this.participants[0].markAsAdmin();
    }
  }

  listParticipants() {
    return this.participants;
  }

  removeParticipant(participant) {
    this.participants = this.participants.filter(p => p.id !== participant.id);
    this.estimations = this.estimations.filter(estimation => estimation.participantId !== participant.id);

    let adminStillConnected = this.participants.find(p => p.isAdmin());
    if (!adminStillConnected && this.participants.length > 0) {
      this.participants[0].markAsAdmin();
    }
  }

  numberOfParticipants() {
    return rooms[room].participants.length;
  }

  startEstimation(participant) {
    if (!this.isAdmin(participant.id)) {
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
      this.estimations.push(estimation);
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
    return this.participants.find(p => p.id === participantId && p.isAdmin()) !== undefined;
  }
};
