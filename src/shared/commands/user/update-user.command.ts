export class UpdateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly updates: {
      firstName?: string;
      lastName?: string;
      email?: string;
    },
    public readonly correlationId?: string,
    public readonly requestUserId?: string,
  ) {}
}