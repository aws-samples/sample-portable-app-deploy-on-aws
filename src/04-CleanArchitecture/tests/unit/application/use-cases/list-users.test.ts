import { ListUsersUseCase } from '../../../../application/use-cases/list-users';
import { User } from '../../../../domain/user';
import { UserRepository } from '../../../../application/ports/user-repository';

// Mock UserRepository
class MockUserRepository implements UserRepository {
  private mockUsers: User[];

  constructor() {
    this.mockUsers = [
      new User('test-id-1', 'John Doe', 'john@example.com'),
      new User('test-id-2', 'Jane Doe', 'jane@example.com')
    ];
  }

  async create(user: User): Promise<void> {
    return Promise.resolve();
  }
  async findById(id: string): Promise<User | null> {
    return Promise.resolve(null);
  }
  async findAll(): Promise<User[]> {
    return Promise.resolve(this.mockUsers);
  }

  async delete(id: string): Promise<void> {
    return Promise.resolve();
  }
}

describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;
  let repository: UserRepository;

  beforeEach(() => {
    repository = new MockUserRepository();
    useCase = new ListUsersUseCase(repository);
  });

  it('should list all users successfully', async () => {
    const result = await useCase.execute();
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]).toBeInstanceOf(User);
    expect(result[1]).toBeInstanceOf(User);
    expect(result[0].name).toBe('John Doe');
    expect(result[1].name).toBe('Jane Doe');
  });

  it('should return empty array when no users exist', async () => {
    jest.spyOn(repository, 'findAll').mockResolvedValue([]);
    
    const result = await useCase.execute();
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database connection failed');
    jest.spyOn(repository, 'findAll').mockRejectedValue(error);

    await expect(useCase.execute()).rejects.toThrow(error);
  });

  it('should handle non-Error objects being thrown', async () => {
    jest.spyOn(repository, 'findAll').mockImplementation(() => {
      throw 'Some string error';
    });

    await expect(useCase.execute()).rejects.toEqual('Some string error');
  });
});
