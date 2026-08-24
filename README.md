# Document Vault

Document Vault is a high-performance GraphQL backend service built with Bun, TypeScript, GraphQL Yoga, and Prisma ORM for managing document collections, tagging, searching, and cursor-based pagination backed by PostgreSQL.

All design decisions, tradeoffs, and how this could be extended are documented in DECISIONS.md — this README covers setup and usage only.

## Setup

Ensure `.env` exists by copying the template file:

```bash
cp .env.example .env
```

Run the one-command setup sequence to start PostgreSQL, install dependencies, run migrations, and launch the development server:

```bash
docker compose up -d && bun install && bun run gendb && bun run dev
```

*(Note: `bun run gendb` requires `DATABASE_URL` in `.env` to connect to PostgreSQL).*

## Tech Stack

- **Bun**: High-performance JavaScript runtime, native TypeScript engine, and fast built-in test runner.
- **TypeScript (Strict)**: Complete static type safety enabled (`strict`, `noImplicitAny`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
- **GraphQL Yoga (Schema-First)**: Spec-compliant GraphQL server providing schema-first API contracts.
- **Prisma**: Type-safe ORM handling database migrations, model schemas, and relational queries.
- **PostgreSQL**: Relational database managing data persistence and foreign key constraints.
- **@graphql-codegen/cli**: Automatic TypeScript type generation binding GraphQL SDL to Prisma models and resolver signatures.

## Project Structure

```text
src/
+-- schema/       # GraphQL SDL contract (schema.graphql) and generated types (generated.ts)
+-- resolvers/    # Thin GraphQL resolvers delegating to the data-access layer (collection.ts, document.ts)
+-- lib/          # Validation helpers, Prisma singleton, and data-access functions (collections.ts, documents.ts)
+-- __tests__/    # Unit tests for validation, mocked-Prisma unit tests, and integration tests
```

The architecture enforces a strict separation between thin GraphQL resolvers and the underlying data-access business logic layer.

## API Overview

### Queries
- `collections: [Collection!]!`: Fetches all collections ordered by creation date ascending.
- `collection(id: ID!): Collection`: Fetches a single collection by ID (returns null if not found).
- `documents(collectionId: ID, search: String, isArchived: Boolean, take: Int, cursor: ID): DocumentConnection!`: Paginated document search with filtering.

### Mutations
- `createCollection(name: String!, slug: String!): Collection!`: Creates a new collection with a unique slug.
- `createDocument(title: String!, content: String!, collectionId: ID!, tags: [String!]): Document!`: Creates a document within a collection.
- `updateDocument(id: ID!, title: String, content: String, tags: [String!], isArchived: Boolean): Document!`: Updates existing document fields.
- `deleteDocument(id: ID!): Boolean!`: Deletes a document by ID.
- `moveDocument(id: ID!, collectionId: ID!): Document!`: Relocates a document to a different collection.

### Example Mutation
```graphql
mutation {
  createDocument(
    title: "Architecture Spec"
    content: "System layout details"
    collectionId: "c7dff2f3-4e36-45fa-81d7-02d42bd3392f"
    tags: ["architecture", "spec"]
  ) {
    id
    title
    collectionId
    createdAt
  }
}
```

## Validation and Error Handling

Invalid inputs (such as empty titles, whitespace-only content, or malformed slugs) throw structured `GraphQLError` exceptions with `extensions: { code: "BAD_USER_INPUT" }` rather than causing internal 500 crashes.

### Example Error Response
```json
{
  "errors": [
    {
      "message": "Title cannot be empty",
      "path": ["createDocument"],
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ],
  "data": null
}
```

## Pagination

Document listing implements cursor-based pagination using the `take + cursor` pattern. Queries overfetch `take + 1` items internally to evaluate `hasNextPage` without executing an extra `COUNT(*)` database query. Records are ordered deterministically by `createdAt` ascending with `id` ascending as a tiebreaker to prevent skipped or duplicate items during pagination.

## Testing

Testing is divided into three distinct layers:
- **Pure Unit Tests**: Input validation rules in `src/__tests__/validation.test.ts`.
- **Mocked Data-Access Unit Tests**: Fast unit tests mocking Prisma methods in `src/__tests__/documents.test.ts` and `src/__tests__/collections.test.ts`.
- **Integration Tests**: End-to-end integration tests in `src/__tests__/integration/documents.integration.test.ts` executing real database operations against Dockerized PostgreSQL.

Commands:
- `bun test`: Executes the complete test suite.
- `bun run sanity`: Runs `eslint`, `typecheck`, and `bun test` in sequence.

## Tradeoffs and Decisions

- **Schema-First + Codegen vs. Code-First**: Schema-first maintains an explicit, language-agnostic GraphQL SDL contract, while `@graphql-codegen` generates strict TypeScript types for resolvers and Prisma models.
- **Cursor Pagination Tiebreaker**: Combining `createdAt` with `id` as a tiebreaker ensures stable cursor pagination when multiple records share identical timestamps.
- **Pure Validation Module**: Decoupling string validation into pure functions allows instant testing without mocking Prisma or GraphQL execution contexts.
- **Resolver / Data-Access Separation**: Keeping resolvers as thin one-liners delegating to data-access functions enables isolated unit testing of business logic without spinning up a GraphQL server.
- **ILIKE Substring Search**: Case-insensitive substring matching (`mode: "insensitive"`) provides easy search functionality for small datasets, but lacks full-text indexing at larger scales.

## How I'd Extend This

- **Authentication & Authorization**: Extend `GraphQLContext` in `src/lib/context.ts` to parse JWT headers and inject user identity into resolvers for permission checks.
- **N+1 Query Resolution**: Wrap relational field resolvers (such as `Document.collection`) with DataLoader batching to coalesce multi-document queries into single SQL queries.
- **Full-Text Search**: Upgrade substring searching to PostgreSQL `tsvector`/`tsquery` or GIN trigram indexes for ranked search performance.
- **Normalized Tag Relations**: Move from scalar string arrays (`tags: String[]`) to a dedicated `Tag` model and join table if cross-collection tag searching or tag renaming is required.
- **Role-Based Access Control (RBAC)**: Slot authorization policies into data-access functions before executing database reads or writes.

## Bonus Items Included

- **Sanity Script**: `"sanity": "bun run lint && bun run typecheck && bun test"` in `package.json` for one-step local and CI validation.
- **Dockerfile**: Production container image build using `oven/bun:1`.
- **GitHub Actions CI Workflow**: `.github/workflows/ci.yml` running PostgreSQL service containers, database migrations, linting, typechecking, and tests automatically on pull requests.

