import express, { Request, Response, NextFunction } from 'express';
import { UserManagementPort } from '../../domain/ports/driver/user-management.port';

const logRequest = (req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
};

/**
 * Express implementation of the API (driver/primary adapter).
 * This adapter uses the UserManagementPort to handle HTTP requests.
 */
export class ExpressApiAdapter {
  private app = express();

  constructor(private readonly userManagement: UserManagementPort) {
    this.app.use(express.json());
    this.app.use(logRequest);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      console.log('Health check requested');
      res.json({ status: 'healthy' });
      console.log('Health check responded with status: healthy');
    });

    // Version endpoint
    this.app.get('/version', (_req: Request, res: Response) => {
      console.log('Version check requested');
      const version = 'hexagonal-architecture';
      console.log(`Version check responded with: ${version}`);
      res.json({ version });
    });

    this.app.post('/users', async (req: Request, res: Response) => {
      try {
        console.log('Creating new user');
        console.log('Creating new user with input:', req.body);
        const user = await this.userManagement.createUser({
          name: req.body.name,
          email: req.body.email
        });
        console.log('User created successfully:', user.id);
        res.status(201).json(user);
      } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.app.get('/users/:id', async (req: Request, res: Response) => {
      try {
        console.log('Retrieving user by id:', req.params.id);
        const user = await this.userManagement.getUser(req.params.id);
        if (!user) {
          console.log('User not found:', req.params.id);
          res.status(404).json({ error: 'User not found' });
          return;
        }
        console.log('User found:', user.id);
        res.json(user);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.app.get('/users', async (_req: Request, res: Response) => {
      try {
        console.log('Retrieving all users');
        const users = await this.userManagement.getAllUsers();
        console.log('Retrieved users count:', users.length);
        res.json(users);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.app.delete('/users/:id', async (req: Request, res: Response) => {
      try {
        console.log('Checking if user exists:', req.params.id);
        const user = await this.userManagement.getUser(req.params.id);
        if (!user) {
          console.log('User not found when attempting to delete:', req.params.id);
          res.status(404).json({ error: 'User not found' });
          return;
        }

        console.log('Deleting user:', req.params.id);
        await this.userManagement.deleteUser(req.params.id);
        console.log('User deleted successfully:', req.params.id);
        res.status(204).send();
      } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });
  }

  public start(port: number): void {
    const server = this.app.listen(port, () => {
      // Server start logging is handled in server.ts
    });

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
        console.error('Please try using a different port by setting the PORT environment variable');
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });
  }

  // Expose the Express app for testing purposes
  public getApp() {
    return this.app;
  }
}
