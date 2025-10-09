import { randomUUID } from 'crypto';
import { User } from '../models/user';
import { UserRepository } from '../repositories/user-repository';

export interface CreateUserDTO {
  name: string;
  email: string;
}

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(data: CreateUserDTO): Promise<User> {
    try {
      console.log('Creating new user with input:', data);
      
      const id = randomUUID();
      console.log('Generated UUID:', id);
      
      console.log('Creating new User instance with:', { id, ...data });
      const user = new User(id, data.name, data.email);
      console.log('User instance created successfully:', id);
      
      await this.userRepository.create(user);
      console.log(`User created successfully: ${id}`);
      
      return user;
    } catch (error) {
      console.log('Error creating user:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async getUser(id: string): Promise<User> {
    console.log(`Retrieving user by id: ${id}`);
    const user = await this.userRepository.findById(id);
    if (!user) {
      console.log(`User not found: ${id}`);
      throw new Error('User not found');
    }
    console.log(`User found: ${id}`);
    return user;
  }

  async listUsers(): Promise<User[]> {
    console.log('Retrieving all users');
    const users = await this.userRepository.findAll();
    console.log(`Users retrieved successfully. Count: ${users.length}`);
    return users;
  }

  async deleteUser(id: string): Promise<void> {
    console.log(`Checking if user exists: ${id}`);
    const user = await this.userRepository.findById(id);
    if (!user) {
      console.log(`User not found: ${id}`);
      throw new Error('User not found');
    }
    console.log(`User found: ${id}`);
    await this.userRepository.delete(id);
  }
}
