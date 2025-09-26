import { CreateGroupHandler } from './handlers/create-group.handler';
import { UpdateGroupHandler } from './handlers/update-group.handler';
import { AddMemberHandler } from './handlers/add-member.handler';
import { RemoveMemberHandler } from './handlers/remove-member.handler';

export const CommandHandlers = [
  CreateGroupHandler,
  UpdateGroupHandler,
  AddMemberHandler,
  RemoveMemberHandler,
];