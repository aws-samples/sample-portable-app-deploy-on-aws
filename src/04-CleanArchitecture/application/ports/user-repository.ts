import { User } from '../../domain/user';

/**
 * Interface that defines persistence operations for users.
 * Follows the Ports and Adapters pattern (Hexagonal Architecture).
 * 
 * @interface UserRepository
 */
export interface UserRepository {
  /**
   * Creates a new user in the repository.
   * 
   * @param {User} user - User to be created
   * @returns {Promise<void>}
   */
  create(user: User): Promise<void>;

  /**
   * Finds a user by their ID.
   * 
   * @param {string} id - User ID
   * @returns {Promise<User | null>} Found user or null if it doesn't exist
   */
  findById(id: string): Promise<User | null>;

  /**
   * Returns all users from the repository.
   * 
   * @returns {Promise<User[]>} List of users
   */
  findAll(): Promise<User[]>;

  /**
   * Deletes a user from the repository.
   * 
   * @param {string} id - ID of the user to delete
   * @returns {Promise<void>}
   * @throws {Error} If user doesn't exist or deletion fails
   */
  delete(id: string): Promise<void>;
}
