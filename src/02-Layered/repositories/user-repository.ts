import { User } from '../models/user';

export interface UserRepository {
  create(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  async create(user: User): Promise<void> {
    console.log(`Attempting to create user: ${user.id}`);
    this.users.push(user);
    console.log(`User created successfully. Total users: ${this.users.length}`);
    console.log(`User persisted successfully: ${user.id}`);
  }

  async findById(id: string): Promise<User | null> {
    console.log(`Finding user by id: ${id}`);
    const user = this.users.find(u => u.id === id) || null;
    if (user) {
      console.log(`User found: ${id}`);
    } else {
      console.log(`User not found: ${id}`);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    console.log('Retrieving all users');
    console.log(`Retrieved users count: ${this.users.length}`);
    return [...this.users];
  }

  async delete(id: string): Promise<void> {
    console.log(`Finding user by id: ${id}`);
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      console.log(`Attempting to delete user: ${id}`);
      this.users.splice(index, 1);
      console.log(`User deleted successfully: ${id}`);
    } else {
      console.log(`User not found when attempting to delete: ${id}`);
    }
  }

  async clear(): Promise<void> {
    console.log('Clearing all users from repository');
    this.users.length = 0;
    console.log('Repository cleared successfully');
  }
}
