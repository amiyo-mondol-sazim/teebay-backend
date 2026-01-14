# NestJS Conventions

**Description**: Enforces NestJS coding standards, architectural patterns, and best practices for the TeeBay backend project.

## When to Use This Skill

Use this skill when:

- Creating new modules, controllers, services, or repositories
- Implementing database operations with MikroORM
- Writing tests (unit or E2E)
- Adding event-driven architecture components
- Updating API documentation (Swagger)
- Refactoring existing code to follow conventions

## Convention Checklist

### General Development

- [ ] Use **enums** instead of string literals
- [ ] Extract all magic values (strings, numbers) to constants
- [ ] Use `dayjs` for all date parsing (avoid native `Date` constructor)
- [ ] Check `src/common` before creating new decorators, pipes, or utilities
- [ ] Use CRUD Generator instead of manual file creation when applicable

### Architecture - Four-Layer Pattern

- [ ] **Controller**: Handles incoming requests only (validation, delegation)
- [ ] **Service**: Contains business logic only (no direct data access)
- [ ] **Repository**: Manages data fetching and persistence only
- [ ] **Serializer**: Handles data transformation for responses only

### Database & ORM (MikroORM)

- [ ] **Entities**:

  - [ ] Place in `common/entities/`
  - [ ] Extend `CustomBaseEntity`
  - [ ] Use singular names for entity classes (e.g., `User`)
  - [ ] For `@ManyToMany` relations, define all options (`pivotTable`, `joinColumn`) on owning side with `{owner: true}`

- [ ] **Repositories**:
  - [ ] Subclass `CustomSQLBaseRepository`
  - [ ] Place within respective module folders
  - [ ] **Transaction Safety**: Use `persist()` in repository, `flush()` in Service only
  - [ ] Never call `flush()` inside repository methods
  - [ ] Suffix method names with module name if conflict exists (e.g., `createUsers` instead of `create`)
  - [ ] Do not add repository to `providers` array if registered via `MikroOrmModule.forFeature()`

### Event Driven Architecture

- [ ] Register event listeners with `@OnEvent` decorator
- [ ] Place listeners in `<module-name>.listeners.ts` files
- [ ] Define event enums in `common/enums/events.enums.ts`
- [ ] Use **PASCAL_SNAKE_CASE** for enum keys (e.g., `USER_CREATED`)
- [ ] Use `"entity.action"` format for enum values (e.g., `"user.created"`)

### API Documentation (Swagger)

- [ ] Explicitly define return types for all controller endpoints
- [ ] Use classes with `Response` suffix for method returns (e.g., `ProductResponse`)
- [ ] Use `@ApiProperty` decorator on enum properties to prevent frontend duplication

### Naming Conventions

**Singular vs Plural:**

- Entities: **Singular** (e.g., `User`)
- File Names: **Plural** (e.g., `users.entity.ts`, `users.service.ts`)
- Classes: **Plural** (e.g., `UsersService`, `UsersController`), except entity classes

**Prefixes & Suffixes:**

- DTOs: `[action][entity]Dto` (e.g., `CreateUserDto`, `UpdateUserDto`)
- Interfaces: `IPascalCase` (e.g., `IProduct`, `IUserRepository`)
- Types: `TPascalCase` (e.g., `TProduct`, `TUserData`)
- Enums: `EPascalCase` (e.g., `ERoles`, `EUserStatus`)
- Responses: `Response` suffix (e.g., `ProductResponse`, `UserResponse`)

**General Formatting:**

- Classes: `PascalCase`
- Methods: `camelCase`
- Constants: `SNAKE_CASE_CAPS`
- Helper Functions: Use `function` declarations (not arrow functions) for hoisting

### Testing Best Practices

- [ ] **Framework**: Use Vitest
- [ ] **Unit Tests**:
  - [ ] Use `vitest-mock-extended` for mocking
  - [ ] Verify methods are called with correct arguments in correct order
  - [ ] Use `vi.useFakeTimers()` or `tests/utils/mock-date.ts` for timezone-related tests
- [ ] **E2E Tests**:
  - [ ] `describe` block must contain URL and HTTP method
  - [ ] `it` block descriptions must start with:
    - `"returns with [VERB] [CODE]"` (e.g., `"returns with GET 200"`)
    - `"fails with [VERB] [CODE]"` (e.g., `"fails with POST 400"`)

## Code Examples

### Correct Entity Definition

```typescript
// common/entities/user.entity.ts
@Entity()
export class User extends CustomBaseEntity {
  @Property()
  name!: string;

  @ManyToMany(() => Role, {
    pivotTable: "user_roles",
    joinColumn: "user_id",
    inverseJoinColumn: "role_id",
    owner: true, // Always define on owning side
  })
  roles = new Collection<Role>(this);
}
```

### Correct Repository Pattern

```typescript
// users/users.repository.ts
@Injectable()
export class UsersRepository extends CustomSQLBaseRepository<User> {
  constructor(em: EntityManager) {
    super(User, em);
  }

  async create(userData: CreateUserDto): Promise<User> {
    const user = this.create(userData);
    this.persist(user); // Use persist, NOT flush
    return user;
  }
}

// users/users.service.ts
@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.usersRepository.create(dto);
    await this.usersRepository.flush(); // Call flush in SERVICE
    return user;
  }
}
```

### Correct Event Definition

```typescript
// common/enums/events.enums.ts
export enum EEvents {
  USER_CREATED = "user.created",
  USER_UPDATED = "user.updated",
  USER_DELETED = "user.deleted",
}

// users/users.listeners.ts
@Injectable()
export class UsersListeners {
  @OnEvent(EEvents.USER_CREATED)
  handleUserCreated(user: User) {
    // Handle user created event
  }
}
```

### Correct DTO Naming

```typescript
// users/dto/create-user.dto.ts
export class CreateUserDto {
  @ApiProperty()
  name!: string;
}

// users/dto/update-user.dto.ts
export class UpdateUserDto {
  @ApiProperty({ required: false })
  name?: string;
}
```

### Correct Response Class

```typescript
// users/responses/user.response.ts
export class UserResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: String, enum: ERoles })
  role!: ERoles;
}
```

### Correct E2E Test Structure

```typescript
// users/users.e2e-spec.ts
describe("/users (POST)", () => {
  it("returns with POST 201", async () => {
    // Test implementation
  });

  it("fails with POST 400", async () => {
    // Test implementation
  });
});
```

## Anti-Patterns to Avoid

❌ **Don't**: Use native `Date` constructor

```typescript
const date = new Date(); // Wrong
```

✅ **Do**: Use `dayjs`

```typescript
import { dayjs } from "src/common/utils/date.util";
const date = dayjs(); // Correct
```

❌ **Don't**: Call `flush()` in repository

```typescript
// users.repository.ts
async create(user: User): Promise<User> {
  this.persist(user);
  await this.flush(); // WRONG - breaks transaction management
}
```

❌ **Don't**: Use string literals for enums

```typescript
const role = "admin"; // Wrong
```

✅ **Do**: Use enum

```typescript
const role = ERoles.ADMIN; // Correct
```

❌ **Don't**: Add repo to providers if registered via MikroORM

```typescript
@Module({
  imports: [MikroOrmModule.forFeature([User])],
  providers: [
    UsersRepository, // WRONG - already registered
  ],
})
```

✅ **Do**: Just use the repository

```typescript
@Module({
  imports: [MikroOrmModule.forFeature([User])],
  // UsersRepository is already available via forFeature
})
```

## Verification Steps

Before considering code complete:

1. Run `lsp_diagnostics` on all changed files
2. Run `npm run lint` if available
3. Run tests: `npm run test` or `npm run test:e2e`
4. Verify Swagger documentation is accurate
5. Check that all naming conventions are followed

## Common Gotchas

1. **Transaction Management**: Always call `flush()` in the Service, never in Repository
2. **ManyToMany Relations**: Always define full configuration on owning side with `{owner: true}`
3. **Event Listeners**: Remember to add listeners to the module's `providers` array
4. **Frontend Generation**: Ensure all return types are explicit or Swagger will fail to generate types
5. **Helper Functions**: Use `function` declarations, not arrow functions, for proper hoisting

## Additional Resources

- NestJS Documentation: https://docs.nestjs.com/
- MikroORM Documentation: https://mikro-orm.io/docs/
- Vitest Documentation: https://vitest.dev/
