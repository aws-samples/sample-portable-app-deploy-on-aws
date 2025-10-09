import { Request, Response } from 'express';
import { UserService, CreateUserDTO } from '../services/user-service';

export class UserController {
  constructor(private readonly userService: UserService) {}

  createUser = async (req: Request<{}, any, CreateUserDTO>, res: Response) => {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      // Handle validation errors (400), system errors (500), and unknown errors (500)
      let statusCode = 500; // Default to internal server error
      let message = 'Unknown error';

      if (error instanceof Error) {
        message = error.message;
        // Only validation errors should be 400
        if (message.includes('must be') || 
            message.includes('invalid') || 
            message.includes('Invalid') || 
            message.includes('required')) {
          statusCode = 400;
        }
      }

      res.status(statusCode).json({ error: message });
    }
  };

  getUser = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const user = await this.userService.getUser(req.params.id);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  listUsers = async (_req: Request, res: Response) => {
    try {
      const users = await this.userService.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  deleteUser = async (req: Request<{ id: string }>, res: Response) => {
    try {
      await this.userService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };
}
