import express, { Request, Response, NextFunction } from 'express';
import { UserController } from './controllers/user-controller';
import { UserService } from './services/user-service';
import { InMemoryUserRepository } from './repositories/user-repository';

const app = express();
const router = express.Router();

// Development mode indicator
console.log('🛠️  Development mode enabled');

app.use(express.json());

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// Health check endpoint
router.get('/health', (_req, res) => {
  console.log('Health check requested');
  const status = 'healthy';
  console.log(`Health check responded with status: ${status}`);
  res.json({ status });
});

// Version endpoint
router.get('/version', (_req, res) => {
  console.log('Version check requested');
  const version = 'layered-architecture';
  console.log(`Version check responded with: ${version}`);
  res.json({ version });
});

// Initialize dependencies and export for testing
export const userRepository = new InMemoryUserRepository();
export const userService = new UserService(userRepository);
export const userController = new UserController(userService);

// Setup routes
router.post('/users', userController.createUser.bind(userController));
router.get('/users', userController.listUsers.bind(userController));
router.get('/users/:id', userController.getUser.bind(userController));
router.delete('/users/:id', userController.deleteUser.bind(userController));

app.use(router);

export default app;
