import express, { Request, Response, Router, RequestHandler, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * User class representing a user entity with validation
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string
  ) {
    this.validate();
  }

  private validate(): void {
    console.log('Validating user data');
    
    if (!this.id) {
      throw new Error('User ID is required');
    }
    
    if (!this.name || this.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    
    console.log(`Checking email format: ${this.email}`);
    if (!this.isValidEmail()) {
      throw new Error('Invalid email format');
    }
    
    console.log('User validation completed successfully');
  }

  public isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email
    };
  }
}

const app = express();
const router: Router = express.Router();

// Development mode indicator
console.log('🛠️  Development mode enabled');

// Logging middleware
export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  try {
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Request body:', req.body);
    }
  } catch (error) {
    console.log('Could not log request body');
  }
  next();
};

app.use(loggingMiddleware);

app.use(express.json());

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
  const version = 'monolith';
  console.log(`Version check responded with: ${version}`);
  res.json({ version });
});

interface CreateUserBody {
  name: string;
  email: string;
}

// In-memory storage
export const users: User[] = [];

// Clear users (for testing)
export const clearUsers = () => {
  users.length = 0;
};

// Create user
const createUser: RequestHandler<{}, any, CreateUserBody> = async (req, res) => {
  try {
    console.log('Creating new user');
    const { name, email } = req.body;
    console.log('Creating new user with input:', { name, email });
    
    const id = randomUUID();
    console.log('Generated UUID:', id);
    
    console.log('Creating new User instance with:', { id, name, email });
    const user = new User(id, name, email);
    
    console.log('User instance created successfully:', id);
    console.log('User entity created successfully:', user);
    
    console.log(`Attempting to create user: ${id}`);
    users.push(user);
    console.log(`User created successfully. Total users: ${users.length}`);
    console.log(`User persisted successfully: ${id}`);
    
    console.log(`User created successfully: ${id}`);
    res.status(201).json(user);
  } catch (error) {
    console.log('Error creating user:', error instanceof Error ? error.message : 'Unknown error');
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

router.post('/users', createUser);

// Get all users
const listUsers: RequestHandler = async (_req, res) => {
  console.log('Retrieving all users');
  console.log('Retrieving all users');
  console.log(`Users retrieved successfully. Count: ${users.length}`);
  console.log(`Retrieved users count: ${users.length}`);
  res.json(users);
};

router.get('/users', listUsers);

interface ParamsWithId {
  id: string;
}

// Get user by ID
const getUserById: RequestHandler<ParamsWithId> = async (req, res) => {
  console.log(`Retrieving user by id: ${req.params.id}`);
  console.log(`Finding user by id: ${req.params.id}`);
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    console.log(`User not found: ${req.params.id}`);
    console.log(`User not found: ${req.params.id}`);
    res.status(404).json({ error: 'User not found' });
  } else {
    console.log(`User found: ${req.params.id}`);
    console.log(`User found: ${req.params.id}`);
    res.json(user);
  }
};

router.get('/users/:id', getUserById);

// Delete user
const deleteUser: RequestHandler<ParamsWithId> = async (req, res) => {
  console.log(`Checking if user exists: ${req.params.id}`);
  console.log(`Finding user by id: ${req.params.id}`);
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    console.log(`User not found: ${req.params.id}`);
    console.log(`User not found when attempting to delete: ${req.params.id}`);
    res.status(404).json({ error: 'User not found' });
  } else {
    console.log(`User found: ${req.params.id}`);
    console.log(`Deleting user: ${req.params.id}`);
    console.log(`Attempting to delete user: ${req.params.id}`);
    users.splice(index, 1);
    console.log(`User deleted successfully: ${req.params.id}`);
    console.log(`User deleted successfully: ${req.params.id}`);
    res.status(204).send();
  }
};

router.delete('/users/:id', deleteUser);

app.use('/', router);

export default app;
