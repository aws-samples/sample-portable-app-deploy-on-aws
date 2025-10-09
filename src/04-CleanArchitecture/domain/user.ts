/**
 * Represents a user entity in the domain.
 * Implements business rules and validations related to users.
 * 
 * @class User
 * @property {string} id - Unique identifier of the user
 * @property {string} name - User's name
 * @property {string} email - User's email
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string
  ) {
    console.debug('Creating new User instance with:', { id, name, email });
    this.validate();
    console.log('User instance created successfully:', this.id);
  }

  /**
   * Validates user data.
   * Checks if all required fields are filled and valid.
   * 
   * @private
   * @throws {Error} If any validation fails
   */
  private validate(): void {
    console.debug('Validating user data');
    
    if (!this.id) {
      console.error('Validation failed: User ID is required');
      throw new Error('User ID is required');
    }
    
    if (!this.name || this.name.trim().length < 2) {
      console.error('Validation failed: Invalid name length', { name: this.name });
      throw new Error('Name must be at least 2 characters long');
    }
    
    if (!this.isValidEmail()) {
      console.error('Validation failed: Invalid email format', { email: this.email });
      throw new Error('Invalid email format');
    }
    
    console.debug('User validation completed successfully');
  }

  /**
   * Checks if the user's email is valid.
   * Uses a regular expression to validate the email format.
   * 
   * @public
   * @returns {boolean} true if email is valid, false otherwise
   */
  public isValidEmail(): boolean {
    console.debug('Checking email format:', this.email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(this.email);
    
    if (!isValid) {
      console.warn('Invalid email format detected:', this.email);
    }
    
    return isValid;
  }

  /**
   * Converts the user to a JSON object.
   * Useful for serialization and API responses.
   * 
   * @public
   * @returns {Object} Object containing user data
   */
  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email
    };
  }
}
