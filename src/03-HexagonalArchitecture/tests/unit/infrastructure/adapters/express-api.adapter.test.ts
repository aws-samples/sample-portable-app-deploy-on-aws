import request from 'supertest';
import { ExpressApiAdapter } from '../../../../infrastructure/adapters/express-api.adapter';
import { UserManagementPort } from '../../../../domain/ports/driver/user-management.port';
import { User } from '../../../../domain/user';

const TEST_UUID = '123e4567-e89b-12d3-a456-426614174000';
const TEST_UUID_2 = '987fcdeb-51a2-43f7-9876-543210fedcba';

describe('ExpressApiAdapter', () => {
  let userManagement: jest.Mocked<UserManagementPort>;
  let apiAdapter: ExpressApiAdapter;
  let mockConsoleLog: jest.SpyInstance;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    userManagement = {
      createUser: jest.fn(),
      getUser: jest.fn(),
      getAllUsers: jest.fn(),
      deleteUser: jest.fn(),
    };
    apiAdapter = new ExpressApiAdapter(userManagement);
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(apiAdapter.getApp())
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'healthy' });
      expect(mockConsoleLog).toHaveBeenCalledWith('Health check requested');
      expect(mockConsoleLog).toHaveBeenCalledWith('Health check responded with status: healthy');
    });
  });

  describe('Version Check', () => {
    it('should return hexagonal-architecture as version', async () => {
      const response = await request(apiAdapter.getApp())
        .get('/version');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ version: 'hexagonal-architecture' });
      expect(mockConsoleLog).toHaveBeenCalledWith('Version check requested');
      expect(mockConsoleLog).toHaveBeenCalledWith('Version check responded with: hexagonal-architecture');
    });
  });

  describe('Request Logging', () => {
    it('should log request details', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      await request(apiAdapter.getApp())
        .post('/users')
        .send(userData);

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] POST \/users$/));
      expect(mockConsoleLog).toHaveBeenCalledWith('Request headers:', expect.any(String));
      expect(mockConsoleLog).toHaveBeenCalledWith('Request body:', userData);
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const createdUser = new User({
        id: TEST_UUID,
        ...userData
      });

      userManagement.createUser.mockResolvedValue(createdUser);

      const response = await request(apiAdapter.getApp())
        .post('/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: TEST_UUID,
        name: 'John Doe',
        email: 'john@example.com'
      });
      expect(userManagement.createUser).toHaveBeenCalledWith(userData);
    });

    it('should handle server errors', async () => {
      userManagement.getUser.mockRejectedValue(new Error('Database error'));

      const response = await request(apiAdapter.getApp())
        .get(`/users/${TEST_UUID}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Database error'
      });
    });

    it('should handle unknown error types', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      userManagement.createUser.mockRejectedValue('Unknown error object');

      const response = await request(apiAdapter.getApp())
        .post('/users')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Unknown error'
      });
    });

    it('should handle validation errors', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      userManagement.createUser.mockRejectedValue(new Error('Invalid email format'));

      const response = await request(apiAdapter.getApp())
        .post('/users')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid email format'
      });
    });
  });

  describe('GET /users/:id', () => {
    it('should return user when found', async () => {
      const user = new User({
        id: TEST_UUID,
        name: 'John Doe',
        email: 'john@example.com'
      });

      userManagement.getUser.mockResolvedValue(user);

      const response = await request(apiAdapter.getApp())
        .get(`/users/${TEST_UUID}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: TEST_UUID,
        name: 'John Doe',
        email: 'john@example.com'
      });
      expect(userManagement.getUser).toHaveBeenCalledWith(TEST_UUID);
    });

    it('should handle unknown error types', async () => {
      userManagement.getUser.mockRejectedValue('Unknown error object');

      const response = await request(apiAdapter.getApp())
        .get(`/users/${TEST_UUID}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Unknown error'
      });
    });

    it('should return 404 when user not found', async () => {
      userManagement.getUser.mockResolvedValue(null);

      const response = await request(apiAdapter.getApp())
        .get(`/users/${TEST_UUID}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'User not found'
      });
    });
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const users = [
        new User({ id: TEST_UUID, name: 'John', email: 'john@example.com' }),
        new User({ id: TEST_UUID_2, name: 'Jane', email: 'jane@example.com' })
      ];

      userManagement.getAllUsers.mockResolvedValue(users);

      const response = await request(apiAdapter.getApp())
        .get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toEqual({
        id: TEST_UUID,
        name: 'John',
        email: 'john@example.com'
      });
    });

    it('should handle unknown error types', async () => {
      userManagement.getAllUsers.mockRejectedValue('Unknown error object');

      const response = await request(apiAdapter.getApp())
        .get('/users');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Unknown error'
      });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user successfully', async () => {
      const user = new User({
        id: TEST_UUID,
        name: 'John Doe',
        email: 'john@example.com'
      });
      
      userManagement.getUser.mockResolvedValue(user);
      userManagement.deleteUser.mockResolvedValue(undefined);

      const response = await request(apiAdapter.getApp())
        .delete(`/users/${TEST_UUID}`);

      expect(response.status).toBe(204);
      expect(userManagement.deleteUser).toHaveBeenCalledWith(TEST_UUID);
    });

    it('should handle unknown error types in delete', async () => {
      const user = new User({
        id: TEST_UUID,
        name: 'John Doe',
        email: 'john@example.com'
      });
      
      userManagement.getUser.mockResolvedValue(user);
      userManagement.deleteUser.mockRejectedValue('Unknown error object');

      const response = await request(apiAdapter.getApp())
        .delete(`/users/${TEST_UUID}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Unknown error'
      });
    });

    it('should return 404 when user not found', async () => {
      userManagement.getUser.mockResolvedValue(null);

      const response = await request(apiAdapter.getApp())
        .delete(`/users/${TEST_UUID}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'User not found'
      });
      expect(userManagement.deleteUser).not.toHaveBeenCalled();
    });
  });

  describe('Server Start', () => {
    let mockConsoleLog: jest.SpyInstance;
    let mockListen: jest.Mock;

    beforeEach(() => {
      mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockListen = jest.fn((port, callback) => {
        if (callback) callback();
        return { on: jest.fn() };
      });
      // @ts-ignore - Mock express app listen method
      apiAdapter['app'].listen = mockListen;
    });

    afterEach(() => {
      mockConsoleLog.mockRestore();
    });

    it('should start server and log success message', () => {
      const port = 8081;
      apiAdapter.start(port);

      expect(mockListen).toHaveBeenCalledWith(port, expect.any(Function));
    });
  });
});
