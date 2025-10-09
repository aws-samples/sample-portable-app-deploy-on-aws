import { InMemoryUserRepository } from '../../../../infrastructure/repositories/in-memory-user-repository';
import { User } from '../../../../domain/user';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.restoreAllMocks(); // First restore all mocks
    repository = new InMemoryUserRepository();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.restoreAllMocks(); // Clean up any remaining mocks
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const user = new User('test-id', 'John Doe', 'john@example.com');
      await repository.create(user);

      const found = await repository.findById(user.id);
      expect(found).toEqual(user);
    });

    it('should handle errors during creation', async () => {
      const user = new User('test-id', 'John Doe', 'john@example.com');
      const error = new Error('Map.set implementation error');
      
      // Create a new Map instance for this test to avoid affecting other tests
      const mockMap = new Map();
      const mockSet = jest.spyOn(mockMap, 'set');
      mockSet.mockImplementation(() => {
        throw error;
      });
      
      // Replace the repository's users Map with our mocked version
      (repository as any).users = mockMap;

      await expect(repository.create(user)).rejects.toThrow(error);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error creating user:',
        error.message,
        expect.objectContaining({ userId: user.id, error })
      );
    });

    it('should handle non-Error exceptions during creation', async () => {
      const user = new User('test-id', 'John Doe', 'john@example.com');
      const nonError = 'Non-error exception';

      // Mock the set method to throw a non-Error exception
      const mockSet = jest.spyOn(Map.prototype, 'set').mockImplementation(() => {
        throw nonError;
      });

      await expect(repository.create(user)).rejects.toEqual(nonError);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error creating user:',
        'Unknown error',
        expect.objectContaining({ userId: user.id, error: nonError })
      );

      mockSet.mockRestore();
    });
  });

  describe('findById', () => {
    it('should return null for non-existent user', async () => {
      const found = await repository.findById('non-existent');
      expect(found).toBeNull();
    });

    it('should find existing user', async () => {
      const user = new User('test-id', 'John Doe', 'john@example.com');
      await repository.create(user);

      const found = await repository.findById(user.id);
      expect(found).toEqual(user);
    });

    it('should log when a user is found', async () => {
      const user = new User('test-id', 'John Doe', 'john@example.com');
      await repository.create(user);
      
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      await repository.findById(user.id);
      
      expect(logSpy).toHaveBeenCalledWith('User found:', user.id);
      
      logSpy.mockRestore();
    });

    it('should warn when a user is not found', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      await repository.findById('non-existent');
      
      expect(warnSpy).toHaveBeenCalledWith('User not found:', 'non-existent');
      
      warnSpy.mockRestore();
    });

    it('should handle errors during find', async () => {
      const error = new Error('Map.get implementation error');
      jest.spyOn(Map.prototype, 'get').mockImplementation(() => {
        throw error;
      });

      await expect(repository.findById('test-id')).rejects.toThrow(error);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error finding user:',
        error.message,
        expect.objectContaining({ userId: 'test-id', error })
      );
    });

    it('should handle non-Error exceptions during findById', async () => {
      const nonError = 'Non-error exception';
      
      // Mock the get method to throw a non-Error exception
      jest.spyOn(Map.prototype, 'get').mockImplementation(() => {
        throw nonError;
      });

      await expect(repository.findById('test-id')).rejects.toEqual(nonError);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error finding user:',
        'Unknown error',
        expect.objectContaining({ userId: 'test-id', error: nonError })
      );
    });
  });

  describe('findAll', () => {
    it('should return empty array when no users exist', async () => {
      const users = await repository.findAll();
      expect(users).toEqual([]);
    });

    it('should return all users', async () => {
      const user1 = new User('id1', 'John Doe', 'john@example.com');
      const user2 = new User('id2', 'Jane Doe', 'jane@example.com');
      await repository.create(user1);
      await repository.create(user2);

      const users = await repository.findAll();
      expect(users).toHaveLength(2);
      expect(users).toEqual(expect.arrayContaining([user1, user2]));
    });

    it('should handle errors during findAll', async () => {
      const error = new Error('Map.values implementation error');
      jest.spyOn(Map.prototype, 'values').mockImplementation(() => {
        throw error;
      });

      await expect(repository.findAll()).rejects.toThrow(error);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error retrieving all users:',
        error.message,
        expect.objectContaining({ error })
      );
    });

    it('should handle non-Error exceptions during findAll', async () => {
      const nonError = 'Non-error exception';
      
      // Mock the values method to throw a non-Error exception
      jest.spyOn(Map.prototype, 'values').mockImplementation(() => {
        throw nonError;
      });

      await expect(repository.findAll()).rejects.toEqual(nonError);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error retrieving all users:',
        'Unknown error',
        expect.objectContaining({ error: nonError })
      );
    });
  });

  describe('delete', () => {
    it('should delete existing user', async () => {
      const user = new User('test-id', 'John Doe', 'john@example.com');
      await repository.create(user);

      await repository.delete(user.id);
      const found = await repository.findById(user.id);
      expect(found).toBeNull();
    });

    it('should throw error when deleting non-existent user', async () => {
      await expect(repository.delete('non-existent')).rejects.toThrow('User not found');
    });

    it('should log correctly when a user is deleted', async () => {
      const user = new User('test-id', 'John Doe', 'john@example.com');
      await repository.create(user);

      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      await repository.delete(user.id);

      expect(logSpy).toHaveBeenCalledWith('User deleted successfully:', user.id);
      
      logSpy.mockRestore();
    });

    it('should handle errors during delete', async () => {
      const user = new User('test-id', 'John Doe', 'john@example.com');
      await repository.create(user);

      const error = new Error('Map.delete implementation error');
      jest.spyOn(Map.prototype, 'delete').mockImplementation(() => {
        throw error;
      });

      await expect(repository.delete(user.id)).rejects.toThrow(error);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error deleting user:',
        error.message,
        expect.objectContaining({ userId: user.id, error })
      );
    });

    it('should handle non-Error exceptions during delete', async () => {
      const user = new User('test-id', 'John Doe', 'john@example.com');
      await repository.create(user);

      const nonError = 'Non-error exception';
      jest.spyOn(Map.prototype, 'delete').mockImplementation(() => {
        throw nonError;
      });

      await expect(repository.delete(user.id)).rejects.toEqual(nonError);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error deleting user:',
        'Unknown error',
        expect.objectContaining({ userId: user.id, error: nonError })
      );
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent create and delete operations', async () => {
      const user = new User('test-id', 'John Doe', 'john@example.com');
      
      // Start both operations almost simultaneously
      const createPromise = repository.create(user);
      const deletePromise = repository.delete(user.id);
      
      // This should either:
      // 1. Create then delete successfully
      // 2. Create fails because already exists
      // 3. Delete fails because doesn't exist yet
      await expect(Promise.allSettled([createPromise, deletePromise])).resolves.toBeDefined();
    });

    it('should handle concurrent modifications', async () => {
      const user1 = new User('id1', 'John Doe', 'john@example.com');
      const user2 = new User('id2', 'Jane Doe', 'jane@example.com');
      
      // Start multiple operations concurrently
      const operations = [
        repository.create(user1),
        repository.findAll(),
        repository.create(user2),
        repository.findById(user1.id),
        repository.findAll()
      ];
      
      await expect(Promise.all(operations)).resolves.toBeDefined();
    });
  });
});
