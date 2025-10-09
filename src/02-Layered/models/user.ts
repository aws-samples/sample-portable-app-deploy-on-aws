/**
 * Represents a user entity in the domain.
 * Implements business rules and validations related to users.
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
