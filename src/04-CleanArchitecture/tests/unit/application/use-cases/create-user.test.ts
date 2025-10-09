import { CreateUserUseCase, CreateUserInput } from '../../../../application/use-cases/create-user';
import { User } from '../../../../domain/user';
import { UserRepository } from '../../../../application/ports/user-repository';

// Mock UserRepository
class MockUserRepository implements UserRepository {
  async create(user: User): Promise<void> {
    return Promise.resolve();
  }
  async findById(id: string): Promise<User | null> {
    return Promise.resolve(null);
  }
  async findAll(): Promise<User[]> {
    return Promise.resolve([]);
  }

  async delete(id: string): Promise<void> {
    return Promise.resolve();
  }
}

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let repository: UserRepository;

  const validInput: CreateUserInput = {
    name: 'John Doe',
    email: 'john@example.com'
  };

  beforeEach(() => {
    repository = new MockUserRepository();
    useCase = new CreateUserUseCase(repository);
  });

  it('should create a user successfully', async () => {
    const result = await useCase.execute(validInput);
    
    expect(result).toBeInstanceOf(User);
    expect(result.name).toBe(validInput.name);
    expect(result.email).toBe(validInput.email);
  });

  it('should throw error when user validation fails', async () => {
    const invalidInput: CreateUserInput = {
      name: '',
      email: 'invalid-email'
    };

    await expect(useCase.execute(invalidInput)).rejects.toThrow();
  });

  it('should handle non-Error objects being thrown', async () => {
    // Mock repository to throw a non-Error object
    jest.spyOn(repository, 'create').mockImplementation(() => {
      throw 'Some string error';
    });

    await expect(useCase.execute(validInput)).rejects.toEqual('Some string error');
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database connection failed');
    jest.spyOn(repository, 'create').mockRejectedValue(error);

    await expect(useCase.execute(validInput)).rejects.toThrow(error);
  });
});
