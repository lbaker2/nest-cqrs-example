export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly correlationId?: string,
    public readonly userId?: string,
  ) {}
}