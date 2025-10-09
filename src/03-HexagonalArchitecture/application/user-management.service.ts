import { User } from '../domain/user';
import { UserRepositoryPort } from '../domain/ports/driven/user-repository.port';
import { UserManagementPort } from '../domain/ports/driver/user-management.port';

/**
 * Application service that implements the UserManagementPort.
 * Coordinates domain logic and infrastructure through ports.
 */
export class UserManagementService implements UserManagementPort {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async createUser(userData: { name: string; email: string }): Promise<User> {
    const user = new User({
      name: userData.name,
      email: userData.email
    });

    await this.userRepository.save(user);
    return user;
  }

  async getUser(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.remove(id);
  }
}
