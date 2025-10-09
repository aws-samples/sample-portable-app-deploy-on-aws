import { User } from '../../user';

/**
 * Port interface for user management operations (driver/primary port).
 * This defines how the application can be used by external actors.
 */
export interface UserManagementPort {
  createUser(userData: { name: string; email: string }): Promise<User>;
  getUser(id: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
}
