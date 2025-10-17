/**
 * Base Repository Interface
 * Dependency Inversion Principle - High-level modules depend on abstractions
 */
export class BaseRepository {
  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findOne(query) {
    throw new Error('Method not implemented');
  }

  async find(query) {
    throw new Error('Method not implemented');
  }

  async create(data) {
    throw new Error('Method not implemented');
  }

  async update(id, data) {
    throw new Error('Method not implemented');
  }

  async delete(id) {
    throw new Error('Method not implemented');
  }
}