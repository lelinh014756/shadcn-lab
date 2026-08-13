# Repomix Navigation Instructions — LansoftOne BE

## Project Context
B2B real estate management system. Multi-tenant (single DB, OrganizationId filter). MVP phase.
**Stack:** .NET 9 / C# 13 · SQL Server · EF Core 9 · ASP.NET Core · JWT HS256

---

## Architecture Layers (top → bottom)

```
ApiHost          → Controllers, Middleware, Program.cs, DI registration
Application      → Services (interfaces + impls), DTOs, Validators, Mappers
Domain           → Entities, Enums, Repository interfaces, Domain errors
Infrastructure   → EF Core DbContext, Repository implementations, Migrations
Shared           → Result<T>/AppError, Extensions, Constants, LocalizationKeys
```

**Dependency rule:** ApiHost → Application → Domain ← Infrastructure; Shared referenced by all.

---

## Key Patterns

| Pattern | Location | Notes |
|---------|----------|-------|
| `Result<T>/AppError` | Shared/ | Never throw business exceptions |
| Service-first | Application/Services/ | No MediatR, no IMediator |
| FluentValidation | Application/Validators/ | Called explicit in Service layer |
| Soft-delete | Domain/Entities/ | `IsActive` field, global EF filter |
| Multi-tenancy | Infrastructure/DbContext | Global query filter on `OrganizationId` |
| Localization | Shared/LocalizationKeys | vi/en via Accept-Language header |
| POST /search | ApiHost/Controllers/ | Complex filters + pagination (not GET) |

---

## Navigation Guide

**Find an entity:** `class {EntityName} :` in `src/Domain/`

**Find a service:** `I{Name}Service` or `{Name}Service` in `src/Application/Services/`

**Find an endpoint:** `[Route` or `[ApiController]` in `src/ApiHost/Controllers/`

**Find a validator:** `AbstractValidator<{Dto}>` in `src/Application/Validators/`

**Find DB config:** `EntityTypeConfiguration` or `modelBuilder.Entity` in `src/Infrastructure/`

---

## Naming Conventions

- **Entities:** PascalCase, singular (`Investor`, `Contract`)
- **Services:** `{Domain}Service.cs` (impl) + `I{Domain}Service.cs` (interface)
- **DTOs:** `{Action}{Entity}Dto` (`CreateInvestorDto`, `InvestorListItemDto`)
- **Validators:** `{Dto}Validator.cs`
- **Controllers:** `{Entity}sController.cs` (plural)
- **Errors:** `AppError.{ErrorType}(...)` factory methods in Shared

---

## Critical Constraints

- **No MediatR** — do not suggest IMediator, IRequest, or Pipeline Behaviors
- **No exceptions for business logic** — always return `Result<T>`
- **File LOC < 1000** — except Migrations, *.g.cs, obj/, bin/
- **EF Core for writes** (Dapper for reads — not yet implemented)
- **OrganizationId** must be enforced on all multi-tenant queries

---

## Bounded Contexts

- Investors: `src/*/Investors/`
- Projects: `src/*/Projects/`
- PropDict: `src/*/PropDict/`
- Auth: `src/*/Auth/`
- System: `src/*/System/`
- Audit: `src/*/Audit/`

---

## Common Entry Points

- `Program.cs` — DI registration, middleware pipeline
- `AppDbContext.cs` — EF Core config, global filters
- `BaseEntity.cs` / `AuditableEntity.cs` — entity base classes
- `Result.cs` / `AppError.cs` — core error handling contracts
