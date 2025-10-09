import { InMemoryUserRepositoryAdapter } from '../../../../infrastructure/adapters/in-memory-user-repository.adapter';
import { User } from '../../../../domain/user';

const TEST_UUID = '123e4567-e89b-12d3-a456-426614174000';
const TEST_UUID_2 = '987fcdeb-51a2-43f7-9876-543210fedcba';

describe('InMemoryUserRepositoryAdapter', () => {
  let repository: InMemoryUserRepositoryAdapter;

  beforeEach(() => {
    repository = new InMemoryUserRepositoryAdapter();
  });

  describe('save', () => {
    it('should save a new user', async () => {
      const user = new User({
        id: TEST_UUID,
        name: 'John Doe',
        email: 'john@example.com'
      });

      await repository.save(user);
      const savedUser = await repository.findById(TEST_UUID);

      expect(savedUser).toEqual(user);
    });

    it('should update an existing user', async () => {
      const user = new User({
        id: TEST_UUID,
        name: 'John Doe',
        email: 'john@example.com'
      });

      await repository.save(user);

      const updatedUser = new User({
        id: TEST_UUID,
        name: 'John Updated',
        email: 'john.updated@example.com'
      });

      await repository.save(updatedUser);
      const savedUser = await repository.findById(TEST_UUID);

      expect(savedUser).toEqual(updatedUser);
    });
  });

  describe('findById', () => {
    it('should return null for non-existent user', async () => {
      const user = await repository.findById('non-existent');
      expect(user).toBeNull();
    });

    it('should find user by id', async () => {
      const user = new User({
        id: TEST_UUID,
        name: 'John Doe',
        email: 'john@example.com'
      });

      await repository.save(user);
      const foundUser = await repository.findById(TEST_UUID);

      expect(foundUser).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no users exist', async () => {
      const users = await repository.findAll();
      expect(users).toEqual([]);
    });

    it('should return all saved users', async () => {
      const user1 = new User({
        id: TEST_UUID,
        name: 'John Doe',
        email: 'john@example.com'
      });

      const user2 = new User({
        id: TEST_UUID_2,
        name: 'Jane Doe',
        email: 'jane@example.com'
      });

      await repository.save(user1);
      await repository.save(user2);

      const users = await repository.findAll();

      expect(users).toHaveLength(2);
      expect(users).toEqual(expect.arrayContaining([user1, user2]));
    });
  });

  describe('remove', () => {
    it('should remove existing user', async () => {
      const user = new User({
        id: TEST_UUID,
        name: 'John Doe',
        email: 'john@example.com'
      });

      await repository.save(user);
      await repository.remove(TEST_UUID);

      const foundUser = await repository.findById(TEST_UUID);
      expect(foundUser).toBeNull();
    });

    it('should not throw when removing non-existent user', async () => {
      await expect(repository.remove('non-existent')).resolves.not.toThrow();
    });
  });
});
