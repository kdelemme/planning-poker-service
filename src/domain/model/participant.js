const uuid = require("uuid/v4");

module.exports = class Participant {
  constructor({ id = uuid(), name = undefined, isAdmin = false, hasVoted = false, card = null } = {}) {
    this.id = id;
    this.name = name;
    this.isAdmin = isAdmin;
    this.hasVoted = hasVoted;
    this.card = card;
  }

  markAsAdmin() {
    this.isAdmin = true;
  }

  vote(card) {
    this.hasVoted = true;
    this.card = card;
  }

  clearVote() {
    this.hasVoted = false;
    this.card = null;
  }
};
