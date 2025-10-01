const BaseRepository = require("./BaseRepo.js");
const db = require("../models/index.js");

class RoleRepo extends BaseRepository {
  model;
  constructor() {
    super(db.Role);
    this.model = db.Role;
  }

  async createRole(role) {
    return this.create(role);
  }

  async findRole(customQuery = null) {
    return this.findOne(customQuery);
  }

  async findRoles() {
    return this.findAll({
      attributes: ["id", "name"],
      order: [["createdAt", "DESC"]],
    });
  }
}

module.exports = new RoleRepo();
