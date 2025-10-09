import { User } from '../../../domain/user';

describe('User', () => {
  const validUserData = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com'
  };

  describe('constructor', () => {
    it('should create a valid user', () => {
      const user = new User(validUserData.id, validUserData.name, validUserData.email);
      expect(user.id).toBe(validUserData.id);
      expect(user.name).toBe(validUserData.name);
      expect(user.email).toBe(validUserData.email);
    });

    it('should throw error when id is empty', () => {
      expect(() => {
        new User('', validUserData.name, validUserData.email);
      }).toThrow('User ID is required');
    });

    it('should throw error when name is too short', () => {
      expect(() => {
        new User(validUserData.id, 'A', validUserData.email);
      }).toThrow('Name must be at least 2 characters long');
    });

    it('should throw error when name is empty', () => {
      expect(() => {
        new User(validUserData.id, '', validUserData.email);
      }).toThrow('Name must be at least 2 characters long');
    });

    it('should throw error when name is only spaces', () => {
      expect(() => {
        new User(validUserData.id, '   ', validUserData.email);
      }).toThrow('Name must be at least 2 characters long');
    });

    it('should throw error when email is invalid', () => {
      expect(() => {
        new User(validUserData.id, validUserData.name, 'invalid-email');
      }).toThrow('Invalid email format');
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid email', () => {
      const user = new User(validUserData.id, validUserData.name, validUserData.email);
      expect(user.isValidEmail()).toBe(true);
    });

    it('should return false for invalid email formats', () => {
      const invalidEmails = [
        'test@',
        '@example.com',
        'test@example',
        'test.example.com',
        '@.com',
        'test@.com',
        'test@com.',
        ''
      ];

      invalidEmails.forEach(email => {
        const user = new User(validUserData.id, validUserData.name, validUserData.email);
        Object.defineProperty(user, 'email', { value: email });
        expect(user.isValidEmail()).toBe(false);
      });
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation', () => {
      const user = new User(validUserData.id, validUserData.name, validUserData.email);
      const json = user.toJSON();
      
      expect(json).toEqual({
        id: validUserData.id,
        name: validUserData.name,
        email: validUserData.email
      });
    });
  });
});
