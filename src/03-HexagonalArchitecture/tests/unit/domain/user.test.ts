import { User } from '../../../domain/user';

describe('User', () => {
  it('should create a user with valid properties', () => {
    const user = new User({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john@example.com'
    });

    expect(user.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
  });

  it('should create a user without id', () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com'
    });

    expect(user.id).toBeDefined();
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
  });

  it('should throw error for invalid email', () => {
    expect(() => {
      new User({
        name: 'John Doe',
        email: 'invalid-email'
      });
    }).toThrow('Invalid email format');
  });

  it('should throw error for empty name', () => {
    expect(() => {
      new User({
        name: '',
        email: 'john@example.com'
      });
    }).toThrow('Name is required');
  });

  it('should throw error for name shorter than 2 characters', () => {
    expect(() => {
      new User({
        name: 'a',
        email: 'john@example.com'
      });
    }).toThrow('Name must be at least 2 characters long');
  });

  it('should throw error for invalid id format', () => {
    expect(() => {
      new User({
        id: 'invalid-id',
        name: 'John Doe',
        email: 'john@example.com'
      });
    }).toThrow('User ID is required and must be a valid UUID');
  });

  it('should convert to JSON correctly', () => {
    const user = new User({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john@example.com'
    });

    const json = user.toJSON();
    expect(json).toEqual({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john@example.com'
    });
  });
});
