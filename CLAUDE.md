# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Development (watch mode)
npm run start:dev

# Build
npm run build

# Run (production)
npm run start:prod

# Lint (auto-fix)
npm run lint

# Format
npm run format

# Tests
npm run test                  # all unit tests
npm run test:watch            # watch mode
npm run test:cov              # with coverage
npm run test:e2e              # end-to-end tests

# Run a single test file
npx jest src/api/auth/auth.service.spec.ts

# Database migrations
npm run migration:generate    # auto-generate from entity changes
npm run migration:create      # create a blank migration
npm run migration:run         # apply pending migrations
npm run migration:revert      # revert last migration
```

## Environment Variables

The app requires a `.env` file with:

```
JWT_SECRET=<secret>
JWT_EXPIRES_IN=<duration, e.g. 1d>
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=myuser
DATABASE_PASSWORD=mypassword
DATABASE_NAME=authdb
```

**Note:** `app.module.ts` has the TypeORM connection hardcoded (not reading env vars). `data-source.ts` reads from env and is used exclusively by the TypeORM migration CLI. `JWT_EXPIRES_IN` is consumed by `AuthModule`'s own `JwtModule` (not `app.module.ts`). The server port defaults to 3000 but can be overridden with a `PORT` env var.

## Architecture

NestJS REST API authentication microservice backed by PostgreSQL via TypeORM.

### Module structure

- **AppModule** (`src/app.module.ts`) — root module; registers TypeORM (hardcoded Postgres config), global JwtModule (reads `JWT_SECRET` only), ConfigModule, and applies `APITokenValidationMiddleware` to all routes except `POST /auth/login`.
- **AuthModule** (`src/api/auth/`) — registers its own `JwtModule` with both `JWT_SECRET` and `JWT_EXPIRES_IN`. `AuthService.validateLogin` uses `AuthRepository` to find the user by email, compares bcrypt hash, and returns a signed JWT.
- **UsersModule** (`src/api/users/`) — manages the `User` entity. Exports `UsersService` for use by other modules. Handles user creation (bcrypt password hashing, duplicate-email enforcement), lookup by id/email, and paginated/filtered listing.

### Layer pattern (per module)

Each feature module follows: **Controller → Service → Repository → TypeORM**

- Controllers hold no business logic — delegate entirely to the service.
- Services contain all business logic and throw HTTP exceptions directly.
- Repositories (`*.repository.ts`) wrap the TypeORM `Repository<T>` as plain injectable providers — they do **not** extend `Repository`.

### Authentication flow

1. All routes require a `Bearer <JWT>` token in the `Authorization` header, enforced by `APITokenValidationMiddleware`.
2. The sole public endpoint is `POST /auth/login` — excluded from middleware.
3. On successful login, `AuthService` signs a JWT with payload `{ sub: user.id, email }`.

### Common utilities (`src/common/`)

- `middleware/api-token-validation.middleware.ts` — global JWT guard.
- `utils/pagination.util.ts` — `buildPaginationOptions` (skip/take) and `buildPaginationMeta` (total, page, limit, totalPages).
- `utils/filter.util.ts` — `buildFilterOptions` converts a plain object into a TypeORM `where` clause.

### API endpoints

| Method | Path | Auth required | Description |
|--------|------|---------------|-------------|
| POST | `/auth/login` | No | Returns `{ email, accessToken }` |
| GET | `/users` | Yes | Paginated + filtered user list |
| GET | `/users/:id` | Yes | Fetch user by id |
| POST | `/users/check-create-user` | Yes | Create a user |

### Key files

| Path | Purpose |
|------|---------|
| `src/app.module.ts` | Root module, middleware wiring |
| `src/common/middleware/api-token-validation.middleware.ts` | Global JWT guard |
| `src/api/auth/auth.module.ts` | Auth module with JwtModule (uses JWT_EXPIRES_IN) |
| `src/api/auth/auth.service.ts` | Login + JWT signing logic | 
| `src/api/auth/auth.repository.ts` | Finds user by email for auth |
| `src/api/users/users.service.ts` | User creation, lookup, paginated listing |
| `src/api/users/users.repository.ts` | TypeORM wrapper for User queries |
| `src/api/users/user.entity.ts` | `User` TypeORM entity |
| `src/data-source.ts` | TypeORM DataSource for the migration CLI |
| `src/migrations/` | TypeORM migration files |

### Swagger

API docs available at `http://localhost:3000/api-docs` when running.

## Rules

- Use Clean Architecture
- No business logic inside controllers
- DTOs must use class-validator decorators

## Code Style

### TypeScript Rules

- Strict mode enabled.
- No `any`.
- Explicit return types required.
- Avoid type assertion unless necessary.

### Naming Conventions

- Classes: PascalCase
- Variables: camelCase
- DTO: End with `Dto`
- Repository files: `<module>.repository.ts`

### NestJS Conventions

- Use @Injectable() for services and repositories.
- Use constructor injection.
- Use DTO + class-validator for input validation.
- Do not use raw request object in services.

### TypeORM Rules

- Use QueryBuilder for dynamic filtering.
- Do not use raw SQL unless necessary.
- Avoid N+1 queries.
- Use transactions for multi-step database operations.

### Folder Rules

- One module per folder.
- No cross-module imports except through exported services.
- Shared utilities must be in src/common.

## Testing
### Unit Testing Rules

- Use Jest.
- Test service logic only.
- Mock repositories.
- Do not mock business logic.

### Test Structure

- File naming: *.spec.ts
- Use describe per class.
- Use beforeEach to reset mocks.

### Coverage Requirements

- Minimum 80% coverage for services.
- Test success case.
- Test failure case.
- Test validation errors.

### E2E Testing

- Use Supertest.
- Test auth flow:
  - Login success
  - Login failure
  - Unauthorized access

## Security
### JWT Rules

- Never expose JWT secret.
- Use environment variables for secrets.
- Access tokens must not contain sensitive data.

### Password Handling

- Always hash passwords using bcrypt.
- Never return password hash in API response.
- Validate password strength.

### Validation Rules

- All input must use class-validator.
- Do not trust request body directly.
- Validate email format.
- Validate required fields.

### Database Security

- Use parameterized queries.
- Never concatenate raw SQL strings.
- Do not expose internal IDs unnecessarily.

### Error Handling

- Do not leak internal error messages.
- Use standardized HTTP exceptions.

## Answer
### Langauge
- only English 

## Comments & Documentation Rules
### General Principles
- Write comments only where necessary.
- Do not comment obvious code.
- Comments must explain why, not what.
- Avoid redundant or trivial comments.
- Keep comments concise and professional.
- All comments must be written in English.