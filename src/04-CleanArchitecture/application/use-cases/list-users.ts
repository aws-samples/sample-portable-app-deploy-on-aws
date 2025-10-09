import { User } from '../../domain/user';
import { UserRepository } from '../ports/user-repository';

/**
 * Use case responsible for listing all users.
 * Implements the business logic to retrieve all users from the system.
 * 
 * @class ListUsersUseCase
 */
export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Executes the list users use case.
   * Retrieves all users from the repository.
   * 
   * @async
   * @returns {Promise<User[]>} List of all users
   * @throws {Error} If there's an error during the retrieval process
   */
  async execute(): Promise<User[]> {
    try {
      console.debug('Retrieving all users');
      
      const users = await this.userRepository.findAll();
      
      console.log('Users retrieved successfully, count:', users.length);
      
      return users;
    } catch (error) {
      console.error('Error retrieving users:', error instanceof Error ? error.message : 'Unknown error', {
        error
      });
      throw error;
    }
  }
}
