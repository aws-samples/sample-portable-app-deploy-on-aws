import { GetUserUseCase } from '../../../../application/use-cases/get-user';
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
    return Promise.resolve();
  }
}

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
  let repository: UserRepository;

  beforeEach(() => {
    repository = new MockUserRepository();
    useCase = new GetUserUseCase(repository);
  });

  it('should get a user successfully', async () => {
    const result = await useCase.execute('test-id');
    
    expect(result).toBeInstanceOf(User);
    expect(result?.id).toBe('test-id');
    expect(result?.name).toBe('John Doe');
    expect(result?.email).toBe('john@example.com');
  });

  it('should return null for non-existent user', async () => {
    const result = await useCase.execute('non-existent-id');
    
    expect(result).toBeNull();
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database connection failed');
    jest.spyOn(repository, 'findById').mockRejectedValue(error);

    await expect(useCase.execute('test-id')).rejects.toThrow(error);
  });

  it('should handle non-Error objects being thrown', async () => {
    jest.spyOn(repository, 'findById').mockImplementation(() => {
      throw 'Some string error';
    });

    await expect(useCase.execute('test-id')).rejects.toEqual('Some string error');
  });
});
