import { DeleteUserUseCase } from '../../../../application/use-cases/delete-user';
import { User } from '../../../../domain/user';
import { UserRepository } from '../../../../application/ports/user-repository';

// Mock UserRepository
class MockUserRepository implements UserRepository {
  private mockUser: User;

  constructor() {
    this.mockUser = new User('test-id', 'John Doe', 'john@example.com');
  }

  async create(user: User): Promise<void> {
    return Promise.resolve();
  }

  async findById(id: string): Promise<User | null> {
    return id === 'test-id' ? this.mockUser : null;
  }

  async findAll(): Promise<User[]> {
    return Promise.resolve([]);
  }

  async delete(id: string): Promise<void> {
    if (id !== 'test-id') {
      throw new Error('User not found');
    }
    return Promise.resolve();
  }
}

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let repository: UserRepository;

  beforeEach(() => {
    repository = new MockUserRepository();
    useCase = new DeleteUserUseCase(repository);
  });

  it('should delete a user successfully', async () => {
    await expect(useCase.execute('test-id')).resolves.not.toThrow();
  });

  it('should throw error when user does not exist', async () => {
    await expect(useCase.execute('non-existent-id')).rejects.toThrow('User not found');
  });

  it('should handle repository errors during findById', async () => {
    const error = new Error('Database connection failed');
    jest.spyOn(repository, 'findById').mockRejectedValue(error);

    await expect(useCase.execute('test-id')).rejects.toThrow(error);
  });

  it('should handle repository errors during delete', async () => {
    const error = new Error('Delete operation failed');
    jest.spyOn(repository, 'delete').mockRejectedValue(error);

    await expect(useCase.execute('test-id')).rejects.toThrow(error);
  });

  it('should handle non-Error objects being thrown', async () => {
    jest.spyOn(repository, 'delete').mockImplementation(() => {
      throw 'Some string error';
    });

    await expect(useCase.execute('test-id')).rejects.toEqual('Some string error');
  });
});
