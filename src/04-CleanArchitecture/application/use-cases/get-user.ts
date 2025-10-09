import { User } from '../../domain/user';
import { UserRepository } from '../ports/user-repository';

/**
 * Use case responsible for retrieving a user by ID.
 * Implements the business logic to fetch a user from the system.
 * 
 * @class GetUserUseCase
 */
export class GetUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Executes the get user use case.
   * Retrieves a user from the repository based on the provided ID.
   * 
   * @async
   * @param {string} id - ID of the user to be retrieved
   * @returns {Promise<User | null>} Found user or null if it doesn't exist
   * @throws {Error} If there's an error during the retrieval process
   */
  async execute(id: string): Promise<User | null> {
    try {
      console.debug('Retrieving user with ID:', id);
      
      const user = await this.userRepository.findById(id);
      
      if (user) {
        console.log('User found successfully:', user.id);
      } else {
        console.log('User not found:', id);
      }
      
      return user;
    } catch (error) {
      console.error('Error retrieving user:', error instanceof Error ? error.message : 'Unknown error', {
        id,
        error
      });
      throw error;
    }
  }
}
