import { User } from '../../domain/user';
import { UserRepository } from '../ports/user-repository';
import { randomUUID } from 'crypto';

/**
 * Interface that defines the input data needed to create a user.
 * 
 * @interface CreateUserInput
 * @property {string} name - User's name
 * @property {string} email - User's email
 */
export interface CreateUserInput {
  name: string;
  email: string;
}

/**
 * Use case responsible for user creation.
 * Implements the business logic to create a new user in the system.
 * 
 * @class CreateUserUseCase
 */
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Executes the user creation use case.
   * Generates a unique ID, creates a new User entity and persists it in the repository.
   * 
   * @async
   * @param {CreateUserInput} input - Data of the user to be created
   * @returns {Promise<User>} Created user
   * @throws {Error} If there's an error in validation or persistence
   */
  async execute(input: CreateUserInput): Promise<User> {
    try {
      console.debug('Creating new user with input:', input);
      
      // Generate UUID
      const id = randomUUID();
      console.debug('Generated UUID:', id);
      
      // Create and validate domain entity
      const user = new User(id, input.name, input.email);
      console.log('User entity created successfully:', user);
      
      // Persist using repository
      await this.userRepository.create(user);
      console.log('User persisted successfully:', user.id);
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error instanceof Error ? error.message : 'Unknown error', {
        input,
        error
      });
      throw error;
    }
  }
}
