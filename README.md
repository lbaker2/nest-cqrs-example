# NestJS CQRS with Redis and MongoDB

A NestJS application implementing CQRS pattern with Redis pub/sub for distributed events and MongoDB for read/write separation.

## Features

- ✅ Complete CQRS separation
- ✅ Redis Streams for distributed event processing with consumer groups
- ✅ MongoDB database
- ✅ Horizontal scaling support
- ✅ TypeScript with full type safety
- ✅ Docker and Docker Compose setup
- ✅ Event-driven architecture with exactly-once processing per consumer group

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- MongoDB (or use Docker)
- Redis (or use Docker)

## Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy the environment file:

```bash
cp .env .env.local
```

3. Update `.env.local` with your configuration if needed.

## Running the Application

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Local Development

1. Start MongoDB and Redis:

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
docker run -d -p 6379:6379 --name redis redis:latest
```

2. Run the application:

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## API Endpoints

### Users

#### Create User (Command)
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","firstName":"John","lastName":"Doe"}'
```

#### Get User (Query)
```bash
curl http://localhost:3000/users/{userId}
```

#### Get Users List (Query)
```bash
curl "http://localhost:3000/users?page=1&limit=10&search=john"
```

#### Update User (Command)
```bash
curl -X PUT http://localhost:3000/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Smith"}'
```

### Groups

#### Create Group (Command)
```bash
curl -X POST http://localhost:3000/groups \
  -H "Content-Type: application/json" \
  -d '{"name":"Engineering Group","description":"Software engineering team","adminId":"USER_ID","maxMembers":25}'
```

#### Get Group (Query)
```bash
curl http://localhost:3000/groups/{groupId}
```

#### Get Groups List (Query)
```bash
curl "http://localhost:3000/groups?page=1&limit=10&search=engineering"
```

#### Update Group (Command)
```bash
curl -X PUT http://localhost:3000/groups/{groupId} \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Group Name","description":"Updated description","adminId":"NEW_ADMIN_ID"}'
```

#### Add Member to Group (Command)
```bash
curl -X POST http://localhost:3000/groups/{groupId}/members \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID"}'
```

#### Remove Member from Group (Command)
```bash
curl -X DELETE http://localhost:3000/groups/{groupId}/members/{userId}
```

#### Get User's Groups (Query)
```bash
curl "http://localhost:3000/groups/users/{userId}/groups?page=1&limit=10"
```

## Architecture

### CQRS Pattern

- **Commands**: Write operations that modify state (Create, Update, Delete)
- **Queries**: Read operations that don't modify state
- **Events**: Domain events published after successful commands

### Database Strategy

- **Database**: MongoDB connection for commands/queries
- **Event Dispatching**: Redis for pub/sub messaging

## Scaling

Run multiple instances for horizontal scaling:

```bash
# Instance 1
INSTANCE_ID=instance-1 PORT=3001 npm run start:prod

# Instance 2
INSTANCE_ID=instance-2 PORT=3002 npm run start:prod

# Instance 3
INSTANCE_ID=instance-3 PORT=3003 npm run start:prod
```

Each instance will compete for events within their consumer groups, ensuring no duplicate processing.

## Monitoring

### Redis Streams

```bash
# View all streams
redis-cli --scan --pattern "events:*"

# Check consumer group info
redis-cli XINFO GROUPS events:UserCreatedEvent

# View pending events
redis-cli XPENDING events:UserCreatedEvent user-read-model-group
```

### Application Logs

The application uses a custom logger that outputs structured logs with timestamps and log levels.

## Project Structure

```
src/
├── app.module.ts           # Root application module
├── main.ts                 # Application entry point
├── common/                 # Shared utilities and interfaces
├── config/                 # Configuration files
├── infrastructure/         # Infrastructure modules (DB, Redis, Event Bus)
├── shared/                 # Shared domain objects (Commands, Queries, Events)
└── modules/                # Business modules
    ├── user/              # User module with CQRS implementation
    └── group/             # Group module with CQRS implementation
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

MIT