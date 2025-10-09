/**
 * User entity in the domain (inside the hexagon).
 * Contains core business logic and validation rules.
 */
export class User {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;

  constructor(params: { id?: string; name: string; email: string }) {
    this.id = params.id || crypto.randomUUID();
    this.name = params.name;
    this.email = params.email;
    this.validate();
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private validate(): void {
    if (!this.id || !this.isValidUUID(this.id)) {
      throw new Error('User ID is required and must be a valid UUID');
    }
    
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Name is required');
    }
    
    if (this.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    
    if (!this.isValidEmail()) {
      throw new Error('Invalid email format');
    }
  }

  private isValidEmail(): boolean {
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
