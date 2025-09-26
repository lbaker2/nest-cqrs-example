import { GetGroupHandler } from './handlers/get-group.handler';
import { GetGroupsHandler } from './handlers/get-groups.handler';
import { GetUserGroupsHandler } from './handlers/get-user-groups.handler';

export const QueryHandlers = [
  GetGroupHandler,
  GetGroupsHandler,
  GetUserGroupsHandler,
];