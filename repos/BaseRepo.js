module.exports = class BaseRepository {
  model;
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findOne(customQuery = null) {
    return this.model.findOne(customQuery);
  }

  async findAll(customQuery = null) {
    return this.model.findAll(customQuery);
  }

  async count(customQuery = null) {
    return this.model.count(customQuery);
  }

  async update(data, customQuery = null) {
    return this.model.update(data, customQuery);
  }

  async bulkCreate(data) {
    return this.model.bulkCreate(data);
  }

  async delete(data) {
    return this.model.destroy(data);
  }
};
