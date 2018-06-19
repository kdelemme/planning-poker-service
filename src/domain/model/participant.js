const uuid = require("uuid/v4");

module.exports = class Participant {
  constructor(id = uuid(), name, isAdmin = false, hasVoted = false) {
    this.id = id;
    this.name = name;
    this.isAdmin = isAdmin;
    this.hasVoted = hasVoted;
  }

  isAdmin() {
    return this.isAdmin;
  }

  markAsAdmin() {
    this.isAdmin = true;
  }

  voted() {
    this.hasVoted = true;
  }

  clearVote() {
    this.hasVoted = false;
  }
};
