export class RemoveMemberCommand {
  constructor(
    public readonly groupId: string,
    public readonly userId: string,
    public readonly correlationId?: string,
    public readonly requestUserId?: string,
  ) {}
}