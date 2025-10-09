import { UserManagementService } from '../../../application/user-management.service';
import { UserRepositoryPort } from '../../../domain/ports/driven/user-repository.port';
import { User } from '../../../domain/user';

const TEST_UUID = '123e4567-e89b-12d3-a456-426614174000';
const TEST_UUID_2 = '987fcdeb-51a2-43f7-9876-543210fedcba';

describe('UserManagementService', () => {
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let userManagementService: UserManagementService;

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      remove: jest.fn(),
    };
    userManagementService = new UserManagementService(userRepository);
  });

  describe('createUser', () => {
    it('should create and save a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const createdUser = await userManagementService.createUser(userData);

      expect(createdUser.name).toBe(userData.name);
      expect(createdUser.email).toBe(userData.email);
      expect(createdUser.id).toBeDefined();
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
    });
  });

  describe('getUser', () => {
    it('should return user when found', async () => {
      const mockUser = new User({
        id: TEST_UUID,
        name: 'John Doe',
        email: 'john@example.com'
      });
      userRepository.findById.mockResolvedValue(mockUser);

      const user = await userManagementService.getUser(TEST_UUID);

      expect(user).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith(TEST_UUID);
    });

    it('should return null when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      const user = await userManagementService.getUser(TEST_UUID);

      expect(user).toBeNull();
      expect(userRepository.findById).toHaveBeenCalledWith(TEST_UUID);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        new User({ id: TEST_UUID, name: 'John', email: 'john@example.com' }),
        new User({ id: TEST_UUID_2, name: 'Jane', email: 'jane@example.com' })
      ];
      userRepository.findAll.mockResolvedValue(mockUsers);

      const users = await userManagementService.getAllUsers();

      expect(users).toEqual(mockUsers);
      expect(userRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      await userManagementService.deleteUser(TEST_UUID);

      expect(userRepository.remove).toHaveBeenCalledWith(TEST_UUID);
    });
  });
});
