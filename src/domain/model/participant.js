const uuid = require("uuid/v4");

module.exports = class Participant {
  constructor(id = uuid(), name = undefined, admin = false, hasVoted = false) {
    this.id = id;
    this.name = name;
    this.admin = admin;
    this.hasVoted = hasVoted;
  }

  isAdmin() {
    return this.admin;
  }

  markAsAdmin() {
    this.admin = true;
  }

  voted() {
    this.hasVoted = true;
  }

  clearVote() {
    this.hasVoted = false;
  }
};
