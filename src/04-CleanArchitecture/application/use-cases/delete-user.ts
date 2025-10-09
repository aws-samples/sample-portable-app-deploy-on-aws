import { UserRepository } from '../ports/user-repository';

/**
 * Use case responsible for deleting a user.
 * Implements the business logic to remove a user from the system.
 * 
 * @class DeleteUserUseCase
 */
export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Executes the delete user use case.
   * Verifies if the user exists before deletion.
   * 
   * @async
   * @param {string} id - ID of the user to be deleted
   * @returns {Promise<void>}
   * @throws {Error} If user doesn't exist or if there's an error during deletion
   */
  async execute(id: string): Promise<void> {
    try {
      console.debug('Checking if user exists:', id);
      
      const user = await this.userRepository.findById(id);
      
      if (!user) {
      throw new Error('User not found');
      }
      
      console.debug('Deleting user:', id);
      await this.userRepository.delete(id);
      
      console.log('User deleted successfully:', id);
    } catch (error) {
      throw error;
    }
  }
}
