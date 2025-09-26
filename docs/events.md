# Event System Documentation

## Overview

This application uses a CQRS (Command Query Responsibility Segregation) pattern with event sourcing implemented through Redis Streams. Events are published to Redis Streams when domain changes occur, allowing for loose coupling between services and eventual consistency.

## Redis Streams Configuration

- **Stream Prefix**: `events:`
- **Protocol**: Redis Streams
- **Consumer Groups**: Services can create consumer groups to process events
- **Ordering**: Events within a stream are processed in order
- **Durability**: Events are persisted in Redis and can be replayed

## Event Channels

### User Events

#### events:UserCreatedEvent
- **Description**: Published when a new user is created
- **Consumer Group**: `user-service`
- **Payload**: UserCreatedEvent
- **Triggered By**: POST /users

#### events:UserUpdatedEvent
- **Description**: Published when user information is updated
- **Consumer Group**: `user-service`
- **Payload**: UserUpdatedEvent
- **Triggered By**: PUT /users/:id

### Team Events

#### events:TeamCreatedEvent
- **Description**: Published when a new team is created
- **Consumer Group**: `team-service`
- **Payload**: TeamCreatedEvent
- **Triggered By**: POST /teams

#### events:TeamUpdatedEvent
- **Description**: Published when team information is updated
- **Consumer Group**: `team-service`
- **Payload**: TeamUpdatedEvent
- **Triggered By**: PUT /teams/:id

#### events:PlayerAddedEvent
- **Description**: Published when a player is added to a team
- **Consumer Group**: `team-service`
- **Payload**: PlayerAddedEvent
- **Triggered By**: POST /teams/:id/players

#### events:PlayerRemovedEvent
- **Description**: Published when a player is removed from a team
- **Consumer Group**: `team-service`
- **Payload**: PlayerRemovedEvent
- **Triggered By**: DELETE /teams/:id/players/:userId

## Event Structure

All events extend the `BaseEvent` class and include:

- `aggregateId`: ID of the aggregate that changed
- `occurredOn`: Timestamp when the event occurred
- `version`: Event schema version
- `correlationId`: ID to correlate related events
- `causationId`: ID of the event that caused this event
- `userId`: ID of the user who triggered the event

## Consumer Implementation

To consume events from another service:

1. Connect to Redis
2. Create a consumer group for the event stream
3. Use XREADGROUP to read events
4. Process events and acknowledge with XACK

Example:
```javascript
const results = await redis.xreadgroup(
  'GROUP', 'my-service', 'consumer-1',
  'STREAMS', 'events:UserCreatedEvent', '>'
);
```

## Event Ordering

Events are processed in the order they are published within each stream. Cross-stream ordering is not guaranteed.

## Error Handling

- Failed event processing should implement retry logic
- Consider implementing dead letter queues for permanently failed events
- Use XPENDING to monitor unacknowledged messages

## Monitoring

- Monitor stream length: `XLEN events:EventName`
- Monitor pending messages: `XPENDING events:EventName group-name`
- Monitor consumer lag: Track last delivered ID vs stream length