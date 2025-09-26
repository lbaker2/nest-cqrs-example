export class UpdateGroupCommand {
  constructor(
    public readonly groupId: string,
    public readonly updates: {
      name?: string;
      description?: string;
      adminId?: string;
      maxMembers?: number;
      isActive?: boolean;
    },
    public readonly correlationId?: string,
    public readonly requestUserId?: string,
  ) {}
}