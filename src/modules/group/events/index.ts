import { GroupCreatedHandler } from './handlers/group-created.handler';
import { GroupUpdatedHandler } from './handlers/group-updated.handler';
import { MemberAddedHandler } from './handlers/member-added.handler';
import { MemberRemovedHandler } from './handlers/member-removed.handler';

export const EventHandlers = [
  GroupCreatedHandler,
  GroupUpdatedHandler,
  MemberAddedHandler,
  MemberRemovedHandler,
];