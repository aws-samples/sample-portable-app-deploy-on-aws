import { User } from '../../domain/user';
import { UserRepositoryPort } from '../../domain/ports/driven/user-repository.port';

/**
 * In-memory implementation of the UserRepositoryPort (driven/secondary adapter).
 * This adapter implements the contract defined by the port.
 */
export class InMemoryUserRepositoryAdapter implements UserRepositoryPort {
  private users: Map<string, User> = new Map();

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async remove(id: string): Promise<void> {
    this.users.delete(id);
  }
}
