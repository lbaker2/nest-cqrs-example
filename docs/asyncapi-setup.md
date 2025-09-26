# AsyncAPI Documentation Setup

This project includes AsyncAPI documentation for the event-driven architecture using Redis Streams.

## Available Endpoints

- **AsyncAPI UI**: `http://localhost:3000/async-api` - Interactive AsyncAPI documentation
- **AsyncAPI JSON**: `http://localhost:3000/async-api/json` - Raw AsyncAPI specification
- **AsyncAPI YAML**: `http://localhost:3000/async-api/yaml` - AsyncAPI specification in YAML format

## Available Scripts

### Generate HTML Documentation
```bash
npm run asyncapi:generate
```
Generates static HTML documentation from the AsyncAPI specification and saves it to `./docs/asyncapi-html`.

### Validate AsyncAPI Specification
```bash
npm run asyncapi:validate
```
Validates the AsyncAPI specification for correctness.

## Event Documentation

The AsyncAPI documentation includes:

1. **Server Configuration**: Redis connection details
2. **Channel Definitions**: All event streams and their purposes
3. **Message Schemas**: Complete event payload schemas
4. **Consumer Groups**: Information about event consumers
5. **Examples**: Sample event payloads

## Events Documented

### User Events
- `events:UserCreatedEvent` - New user creation
- `events:UserUpdatedEvent` - User information updates

### Team Events
- `events:TeamCreatedEvent` - New team creation
- `events:TeamUpdatedEvent` - Team information updates
- `events:PlayerAddedEvent` - Player added to team
- `events:PlayerRemovedEvent` - Player removed from team

## Integration with Other Services

Other services can use the AsyncAPI specification to:

1. Understand event schemas
2. Generate client code for event consumption
3. Implement proper error handling
4. Set up monitoring and alerting

## Redis Stream Configuration

Each event is published to a Redis Stream with the format `events:{EventName}`:
- Consumer groups can be created for each service
- Events are ordered within each stream
- Failed processing can be retried using Redis Stream features

## Development Workflow

1. Start the application: `npm run start:dev`
2. View AsyncAPI docs: `http://localhost:3000/async-api`
3. Generate static docs: `npm run asyncapi:generate`
4. Validate specification: `npm run asyncapi:validate`