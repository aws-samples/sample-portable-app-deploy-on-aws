import request from 'supertest';
import { createExpressApp } from '../../../../infrastructure/http/express-app';
import { InMemoryUserRepository } from '../../../../infrastructure/repositories/in-memory-user-repository';
import { UserRepository } from '../../../../application/ports/user-repository';
import { User } from '../../../../domain/user';

describe('Express App', () => {
  const app = createExpressApp();

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'healthy' });
    });
  });

  describe('Version Check', () => {
    it('should return clean-architecture as version', async () => {
      const response = await request(app).get('/version');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ version: 'clean-architecture' });
    });
  });

  describe('User API', () => {
    describe('POST /users', () => {
      it('should create a new user with valid data', async () => {
        const userData = { name: 'John Doe', email: 'john@example.com' };
        const response = await request(app)
          .post('/users')
          .send(userData);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
          name: userData.name,
          email: userData.email,
        });
        expect(response.body.id).toBeDefined();
      });

      it('should return 400 with invalid name', async () => {
        const response = await request(app)
          .post('/users')
          .send({ name: '', email: 'john@example.com' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      });

      it('should return 400 with invalid email', async () => {
        const response = await request(app)
          .post('/users')
          .send({ name: 'John Doe', email: 'invalid-email' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      });

      it('should handle non-Error objects in catch block', async () => {
        // Create a custom repository that throws a non-Error object
        const mockRepository: UserRepository = {
          create: async () => { throw 'Custom error string'; },
          findById: async () => null,
          findAll: async () => [],
          delete: async () => {},
        };
        
        const customApp = createExpressApp(mockRepository);
        const response = await request(customApp)
          .post('/users')
          .send({ name: 'John Doe', email: 'john@example.com' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Unknown error');
      });
    });

    describe('GET /users', () => {
      it('should return array of users', async () => {
        const response = await request(app).get('/users');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('GET /users/:id', () => {
      let userId: string;

      beforeAll(async () => {
        const createResponse = await request(app)
          .post('/users')
          .send({ name: 'Test User', email: 'test@example.com' });
        userId = createResponse.body.id;
      });

      it('should return user when it exists', async () => {
        const response = await request(app).get(`/users/${userId}`);
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(userId);
      });

      it('should return 404 when user does not exist', async () => {
        const response = await request(app).get('/users/nonexistent-id');
        expect(response.status).toBe(404);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('DELETE /users/:id', () => {
      let userId: string;

      beforeEach(async () => {
        const createResponse = await request(app)
          .post('/users')
          .send({ name: 'Delete Test', email: 'delete@example.com' });
        userId = createResponse.body.id;
      });

      it('should delete user when it exists', async () => {
        const response = await request(app).delete(`/users/${userId}`);
        expect(response.status).toBe(204);

        // Verify user is deleted
        const getResponse = await request(app).get(`/users/${userId}`);
        expect(getResponse.status).toBe(404);
      });

      it('should return 404 when trying to delete non-existent user', async () => {
        const response = await request(app).delete('/users/nonexistent-id');
        expect(response.status).toBe(404);
        expect(response.body.error).toBeDefined();
      });

      it('should return 500 when an unexpected error occurs during deletion', async () => {
        // Create a custom repository that throws an unexpected error
        const mockRepository: UserRepository = {
          create: async (user: User) => {},
          findById: async () => new User('1', 'test', 'test@test.com'),
          findAll: async () => [],
          delete: async () => { throw new Error('Unexpected database error'); },
        };
        
        const customApp = createExpressApp(mockRepository);
        const response = await request(customApp).delete('/users/1');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Unexpected database error');
      });

      it('should return 500 with Unknown error when non-Error is thrown during deletion', async () => {
        // Create a custom repository that throws a non-Error object
        const mockRepository: UserRepository = {
          create: async (user: User) => {},
          findById: async () => new User('1', 'test', 'test@test.com'),
          findAll: async () => [],
          delete: async () => { throw 'Some unexpected string error'; },
        };
        
        const customApp = createExpressApp(mockRepository);
        const response = await request(customApp).delete('/users/1');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Unknown error');
      });
    });
  });

  describe('Logging Middleware', () => {
    const originalConsoleLog = console.log;
    const originalConsoleDebug = console.debug;
    let logSpy: jest.SpyInstance;
    let debugSpy: jest.SpyInstance;

    beforeAll(() => {
      logSpy = jest.spyOn(console, 'log').mockImplementation();
      debugSpy = jest.spyOn(console, 'debug').mockImplementation();
    });

    afterAll(() => {
      console.log = originalConsoleLog;
      console.debug = originalConsoleDebug;
      logSpy.mockRestore();
      debugSpy.mockRestore();
    });

    beforeEach(() => {
      logSpy.mockClear();
      debugSpy.mockClear();
    });

    it('should log requests with body', async () => {
      const userData = { name: 'Log Test', email: 'log@example.com' };
      await request(app).post('/users').send(userData);
      
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*\] POST \/users$/)
      );
      expect(debugSpy).toHaveBeenCalledWith('Request body:', userData);
    });

    it('should log requests without body', async () => {
      await request(app).get('/health');
      
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*\] GET \/health$/)
      );
      expect(debugSpy).not.toHaveBeenCalledWith(expect.stringMatching(/Request body/));
    });
  });
});
