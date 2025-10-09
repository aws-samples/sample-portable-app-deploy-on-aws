import express, { Request, Response } from 'express';
import { CreateUserUseCase } from '../../application/use-cases/create-user';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user';
import { InMemoryUserRepository } from '../repositories/in-memory-user-repository';
import { UserRepository } from '../../application/ports/user-repository';

// Express application factory that can be used in any environment
export function createExpressApp(customUserRepository?: UserRepository) {
  const app = express();
  
  app.use(express.json());

  // Logging middleware
  app.use((req: Request, res: Response, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.debug('Request headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
      console.debug('Request body:', req.body);
    }
    next();
  });

  // Initialize dependencies
  console.log('Initializing Express application dependencies');
  const userRepository = customUserRepository || new InMemoryUserRepository();
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const deleteUserUseCase = new DeleteUserUseCase(userRepository);

  // Health check endpoint (useful for container environments)
  app.get('/health', (req: Request, res: Response) => {
    console.debug('Health check requested');
    res.json({ status: 'healthy' });
    console.log('Health check responded with status: healthy');
  });

  // Version endpoint
  app.get('/version', (req: Request, res: Response) => {
    console.debug('Version check requested');
    const version = 'clean-architecture';
    console.log(`Version check responded with: ${version}`);
    res.json({ version });
  });

  // API endpoints
  app.post('/users', async (req: Request, res: Response) => {
    try {
      console.log('Creating new user');
      const { name, email } = req.body;
      const user = await createUserUseCase.execute({ name, email });
      console.log('User created successfully:', user.id);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error instanceof Error ? error.message : 'Unknown error');
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get('/users', async (req: Request, res: Response) => {
    console.log('Retrieving all users');
    const users = await userRepository.findAll();
    console.log('Retrieved users count:', users.length);
    res.json(users);
  });

  app.get('/users/:id', async (req: Request, res: Response) => {
    console.log('Retrieving user by id:', req.params.id);
    const user = await userRepository.findById(req.params.id);
    if (!user) {
      console.warn('User not found:', req.params.id);
      res.status(404).json({ error: 'User not found' });
      return;
    }
    console.log('User found:', user.id);
    res.json(user);
  });

  app.delete('/users/:id', async (req: Request, res: Response) => {
    try {
      await deleteUserUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        console.warn('User not found when attempting to delete:', req.params.id);
        res.status(404).json({ error: 'User not found' });
      } else {
        console.error('Error deleting user:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
  });

  return app;
}
