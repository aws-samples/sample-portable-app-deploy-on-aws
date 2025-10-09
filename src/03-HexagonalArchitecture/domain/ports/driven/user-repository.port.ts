import { User } from '../../user';

/**
 * Port interface for user persistence operations (driven/secondary port).
 * This is the contract that must be fulfilled by infrastructure adapters.
 */
export interface UserRepositoryPort {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  remove(id: string): Promise<void>;
}
