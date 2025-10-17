/**
 * Service Factory - Centralized service creation with DI
 */
export class ServiceFactory {
  static services = new Map();

  static register(name, service) {
    this.services.set(name, service);
  }

  static get(name) {
    if (!this.services.has(name)) {
      throw new Error(`Service ${name} not registered`);
    }
    return this.services.get(name);
  }
}

export default ServiceFactory;