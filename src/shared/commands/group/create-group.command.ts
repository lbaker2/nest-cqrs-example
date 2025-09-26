export class CreateGroupCommand {
  constructor(
    public readonly name: string,
    public readonly description?: string,
    public readonly adminId?: string,
    public readonly maxMembers?: number,
    public readonly correlationId?: string,
    public readonly userId?: string,
  ) {}
}