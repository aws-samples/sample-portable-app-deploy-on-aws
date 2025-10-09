import { User } from '../../domain/user';
import { UserRepository } from '../../application/ports/user-repository';
// In-memory implementation of UserRepository
export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async create(user: User): Promise<void> {
    try {
      console.debug('Attempting to create user:', user.id);
      this.users.set(user.id, user);
      console.log('User created successfully. Total users:', this.users.size);
    } catch (error) {
      console.error('Error creating user:', error instanceof Error ? error.message : 'Unknown error', {
        userId: user.id,
        error
      });
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      console.debug('Finding user by id:', id);
      const user = this.users.get(id);
      
      if (user) {
        console.log('User found:', id);
      } else {
        console.warn('User not found:', id);
      }
      
      return user || null;
    } catch (error) {
      console.error('Error finding user:', error instanceof Error ? error.message : 'Unknown error', {
        userId: id,
        error
      });
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      console.debug('Retrieving all users');
      const users = Array.from(this.users.values());
      console.log('Users retrieved successfully. Count:', users.length);
      return users;
    } catch (error) {
      console.error('Error retrieving all users:', error instanceof Error ? error.message : 'Unknown error', {
        error
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      console.debug('Attempting to delete user:', id);
      
      if (!this.users.has(id)) {
        console.error('User not found for deletion:', id);
        throw new Error('User not found');
      }
      
      this.users.delete(id);
      console.log('User deleted successfully:', id);
    } catch (error) {
      console.error('Error deleting user:', error instanceof Error ? error.message : 'Unknown error', {
        userId: id,
        error
      });
      throw error;
    }
  }
}
