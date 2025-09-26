import { UserCreatedHandler } from './handlers/user-created.handler';
import { UserUpdatedHandler } from './handlers/user-updated.handler';

export const EventHandlers = [UserCreatedHandler, UserUpdatedHandler];