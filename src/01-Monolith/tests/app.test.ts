import request from 'supertest';
import app, { clearUsers, User } from '../app';

describe('User class', () => {
  it('should convert to JSON correctly', () => {
    const user = new User('test-id', 'Test User', 'test@example.com');
    const json = user.toJSON();
    
    expect(json).toEqual({
      id: 'test-id',
      name: 'Test User',
      email: 'test@example.com'
    });
  });
});

describe('Health Check', () => {
  it('should return healthy status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({ status: 'healthy' });
  });
});

describe('Version Check', () => {
  it('should return monolith as version', async () => {
    const response = await request(app)
      .get('/version')
      .expect(200);

    expect(response.body).toEqual({ version: 'monolith' });
  });
});

describe('Logging Middleware', () => {
  // Test raw request before express.json() middleware
  it('should handle raw request before body parsing', async () => {
    const response = await request(app)
      .post('/users')
      .expect(400);

    expect(response.body).toBeDefined();
  });

  // Test request after express.json() middleware with non-empty body
  it('should handle parsed request with non-empty body', async () => {
    const response = await request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ name: 'Test User', email: 'test@example.com' })
      .expect(201);

    expect(response.body).toBeDefined();
  });

  // Test request after express.json() middleware with empty body
  it('should handle parsed request with empty body', async () => {
    const response = await request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({})
      .expect(400);

    expect(response.body).toBeDefined();
  });

  // Test request with empty JSON body on health endpoint
  it('should handle request with empty JSON body on successful endpoint', async () => {
    const response = await request(app)
      .get('/health')
      .set('Content-Type', 'application/json')
      .send({})
      .expect(200);

    expect(response.body).toEqual({ status: 'healthy' });
  });

  // Test request with undefined body
  it('should handle request with undefined body', async () => {
    const response = await request(app)
      .get('/health')
      .set('Content-Type', 'application/json')
      .send(undefined)
      .expect(200);

    expect(response.body).toEqual({ status: 'healthy' });
  });

  // Test middleware with body that throws on Object.keys
  it('should handle request with body that throws on Object.keys', () => {
    const { loggingMiddleware } = require('../app');
    const consoleSpy = jest.spyOn(console, 'log');
    
    // Create a proxy that throws when Object.keys is called on it
    const throwingBody = new Proxy({}, {
      ownKeys: () => {
        throw new Error('Cannot enumerate keys');
      }
    });

    const req = {
      method: 'GET',
      path: '/test',
      headers: {},
      body: throwingBody
    };
    const res = {};
    const next = jest.fn();

    // Should not throw due to try-catch
    loggingMiddleware(req, res, next);

    // Verify next was called and error was logged
    expect(next).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Could not log request body');
    
    consoleSpy.mockRestore();
  });

  // Test middleware with body that has non-enumerable properties
  it('should handle request with non-enumerable body properties', () => {
    const { loggingMiddleware } = require('../app');
    
    const req = {
      method: 'GET',
      path: '/test',
      headers: {},
      body: Object.defineProperty({}, 'test', {
        value: 'test',
        enumerable: false
      })
    };
    const res = {};
    const next = jest.fn();

    loggingMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // Test middleware with non-empty body to ensure logging
  it('should log request body when present', () => {
    const { loggingMiddleware } = require('../app');
    const consoleSpy = jest.spyOn(console, 'log');
    
    const req = {
      method: 'GET',
      path: '/test',
      headers: {},
      body: { test: 'value' }
    };
    const res = {};
    const next = jest.fn();

    loggingMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Request body:', { test: 'value' });
    
    consoleSpy.mockRestore();
  });
});

describe('User API', () => {
  beforeEach(() => {
    clearUsers();
  });

  const validUser = {
    name: 'John Doe',
    email: 'john@example.com'
  };

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
