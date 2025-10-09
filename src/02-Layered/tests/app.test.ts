import request from 'supertest';
import app, { userRepository, userService } from '../app';
import { User } from '../models/user';

describe('API', () => {
  beforeEach(async () => {
    await userRepository.clear();
    // Reset all mocks after each test
    jest.restoreAllMocks();
  });

  const validUser = {
    name: 'John Doe',
    email: 'john@example.com'
  };

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      // Spy on console.log to verify logging
      const consoleSpy = jest.spyOn(console, 'log');
      
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ status: 'healthy' });
      
      // Verify that health check logs were made
      expect(consoleSpy).toHaveBeenCalledWith('Health check requested');
      expect(consoleSpy).toHaveBeenCalledWith('Health check responded with status: healthy');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Version Check', () => {
    it('should return layered-architecture as version', async () => {
      // Spy on console.log to verify logging
      const consoleSpy = jest.spyOn(console, 'log');
      
      const response = await request(app)
        .get('/version')
        .expect(200);

      expect(response.body).toEqual({ version: 'layered-architecture' });
      
      // Verify that version check logs were made
      expect(consoleSpy).toHaveBeenCalledWith('Version check requested');
      expect(consoleSpy).toHaveBeenCalledWith('Version check responded with: layered-architecture');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Logging Middleware', () => {
    it('should handle raw request before body parsing', async () => {
      // Send raw data without content-type header to bypass body parsing
      const response = await request(app)
        .post('/users')
        .send('raw data')
        .set('Content-Type', 'text/plain')
        .expect(500); // System error because it's a JSON parsing error

      expect(response.body.error).toBeDefined();
    });

    it('should handle parsed request with empty body', async () => {
      const response = await request(app)
        .post('/users')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should handle requests with undefined body', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      // Verify request logging format
      const requestLogCall = consoleSpy.mock.calls.find(call => 
        typeof call[0] === 'string' && 
        call[0].match(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] GET \/users$/)
      );
      expect(requestLogCall).toBeDefined();
      
      consoleSpy.mockRestore();
    });

    it('should log requests with body', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      const customHeaders = {
        'x-custom-header': 'test-value',
        'user-agent': 'test-agent'
      };

      const testBody = { 
        name: 'Test User', 
        email: 'test@example.com' 
      };

      const response = await request(app)
        .post('/users')
        .set(customHeaders)
        .send(testBody)
        .expect(201);

      // Verify that headers were logged
      const headerLogCall = consoleSpy.mock.calls.find(call => 
        call[0] === 'Request headers:' && 
        typeof call[1] === 'string' && 
        call[1].includes('x-custom-header')
      );
      expect(headerLogCall).toBeDefined();

      // Verify that body was logged
      const bodyLogCall = consoleSpy.mock.calls.find(call => 
        call[0] === 'Request body:' && 
        call[1] && 
        call[1].name === testBody.name && 
        call[1].email === testBody.email
      );
      expect(bodyLogCall).toBeDefined();
      
      expect(response.body).toBeDefined();
      consoleSpy.mockRestore();
    });

    it('should log requests with non-user body format', async () => {
      // Send a request with a body that doesn't match user format
      // This ensures the logging middleware handles any body format
      const response = await request(app)
        .post('/users')
        .send({ 
          randomField: 'test',
          anotherField: 123,
          nestedField: { foo: 'bar' }
        })
        .expect(400); // Should fail validation but still be logged

      expect(response.body.error).toBeDefined();
    });
  });

  describe('User Model Validation', () => {
    it('should throw error when ID is empty', () => {
      expect(() => {
        new User('', 'John Doe', 'john@example.com');
      }).toThrow('User ID is required');
    });
  });

  describe('POST /users', () => {
    it('should create a new user with valid data', async () => {
      const response = await request(app)
        .post('/users')
        .send(validUser)
        .expect(201);

      expect(response.body).toMatchObject({
        name: validUser.name,
        email: validUser.email
      });
      expect(response.body.id).toBeDefined();
    });

    it('should return 400 with invalid name', async () => {
      const response = await request(app)
        .post('/users')
        .send({ ...validUser, name: 'A' })
        .expect(400);

      expect(response.body.error).toBe('Name must be at least 2 characters long');
    });

    it('should return 400 with invalid email', async () => {
      const response = await request(app)
        .post('/users')
        .send({ ...validUser, email: 'invalid-email' })
        .expect(400);

      expect(response.body.error).toBe('Invalid email format');
    });
  });

  describe('GET /users', () => {
    it('should return empty array when no users exist', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return array of users when users exist', async () => {
      // Create a user first
      const createResponse = await request(app)
        .post('/users')
        .send(validUser);

      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(validUser);
    });
  });

  describe('GET /users/:id', () => {
    it('should return user when it exists', async () => {
      // Create a user first
      const createResponse = await request(app)
        .post('/users')
        .send(validUser);

      const userId = createResponse.body.id;

      const response = await request(app)
        .get(`/users/${userId}`)
        .expect(200);

      expect(response.body).toMatchObject(validUser);
      expect(response.body.id).toBe(userId);
    });

    it('should return 404 when user does not exist', async () => {
      const response = await request(app)
        .get('/users/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle non-Error in listUsers', async () => {
      // Mock listUsers to throw a non-Error object
      jest.spyOn(userService, 'listUsers').mockRejectedValueOnce('Database connection lost');

      const response = await request(app)
        .get('/users')
        .expect(500);

      expect(response.body.error).toBe('Unknown error');
    });

    it('should handle non-Error in createUser service', async () => {
      // Mock the repository to throw a non-Error object
      jest.spyOn(userRepository, 'create').mockRejectedValueOnce('Storage error');

      const response = await request(app)
        .post('/users')
        .send(validUser)
        .expect(500);

      expect(response.body.error).toBe('Unknown error');
    });

    it('should handle validation errors', async () => {
      // Mock a validation error
      const validationError = new Error('Name must be at least 2 characters');
      jest.spyOn(userService, 'createUser').mockRejectedValueOnce(validationError);

      const response = await request(app)
        .post('/users')
        .send(validUser)
        .expect(400);

      expect(response.body.error).toBe('Name must be at least 2 characters');
    });

    it('should handle system errors', async () => {
      // Mock a system error
      const systemError = new Error('Database connection failed');
      jest.spyOn(userService, 'createUser').mockRejectedValueOnce(systemError);

      const response = await request(app)
        .post('/users')
        .send(validUser)
        .expect(500);

      expect(response.body.error).toBe('Database connection failed');
    });

    it('should handle non-Error objects as unknown errors', async () => {
      // Mock a non-Error object being thrown
      jest.spyOn(userService, 'createUser').mockRejectedValueOnce('Some string error');

      const response = await request(app)
        .post('/users')
        .send(validUser)
        .expect(500); // Unknown errors are treated as system errors

      expect(response.body.error).toBe('Unknown error');
    });

    it('should handle not found errors in getUser', async () => {
      // Mock userService.getUser to throw a non-Error object
      jest.spyOn(userService, 'getUser').mockRejectedValueOnce('Unknown error occurred');

      const response = await request(app)
        .get('/users/123')
        .expect(404);

      expect(response.body.error).toBe('Unknown error');
    });

    it('should handle not found errors in deleteUser', async () => {
      // Mock userService.deleteUser to throw a non-Error object
      jest.spyOn(userService, 'deleteUser').mockRejectedValueOnce('Unknown error occurred');

      const response = await request(app)
        .delete('/users/123')
        .expect(404);

      expect(response.body.error).toBe('Unknown error');
    });
  });

  describe('Repository Delete Operations', () => {
    it('should handle concurrent deletion attempts', async () => {
      // Create a user
      const createResponse = await request(app)
        .post('/users')
        .send(validUser);
      
      const userId = createResponse.body.id;
      
      // Start multiple delete operations concurrently
      await Promise.all([
        request(app).delete(`/users/${userId}`),
        request(app).delete(`/users/${userId}`),
        request(app).delete(`/users/${userId}`)
      ]);
      
      // Verify user is deleted
      const response = await request(app)
        .get(`/users/${userId}`)
        .expect(404);
      
      expect(response.body.error).toBe('User not found');
    });

    it('should handle user not found during deletion attempt', async () => {
      // First create a user
      const createResponse = await request(app)
        .post('/users')
        .send(validUser);
      
      const userId = createResponse.body.id;
      
      // Delete the user first time - should succeed
      await request(app)
        .delete(`/users/${userId}`)
        .expect(204);
      
      // Try to delete the same user again - should return 404
      // This will trigger the "user not found" log in the repository
      await request(app)
        .delete(`/users/${userId}`)
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user when it exists', async () => {
      // Create a user first
      const createResponse = await request(app)
        .post('/users')
        .send(validUser);

      const userId = createResponse.body.id;

      // Delete the user
      await request(app)
        .delete(`/users/${userId}`)
        .expect(204);

      // Verify user is deleted
      await request(app)
        .get(`/users/${userId}`)
        .expect(404);
    });

    it('should return 404 when trying to delete non-existent user', async () => {
      const response = await request(app)
        .delete('/users/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });
});
