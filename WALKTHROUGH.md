# Document Vault — System Walkthrough & Demo Narrative

Welcome! In this walkthrough, I'm going to guide you through Document Vault as if we were sitting together for a live video demonstration of the project, architecture, API, and test suite.

## What this is

Document Vault is a production-ready GraphQL API for organizing documents into collections, built with Bun, strict TypeScript, GraphQL Yoga, Prisma ORM, and PostgreSQL. I designed it to provide a clean schema-first GraphQL API with cursor-based pagination, full input validation, and flexible document movement across collections.

## Running it

To get the application up and running on your local machine, you can spin up the PostgreSQL database, install dependencies, run migrations, and launch the dev server using this single command:

```bash
docker compose up -d && bun install && bun run gendb && bun run dev
```

Once the server boots up, you can open `http://localhost:4000/graphql` in your browser to access the interactive GraphiQL playground.

## A tour through the API

Let's walk through the core GraphQL operations in sequence.

First, I'll create a collection to hold our engineering documents:

```graphql
mutation {
  createCollection(name: "Engineering Specs", slug: "engineering-specs") {
    id
    name
    slug
    createdAt
  }
}
```
*Demonstrates collection creation with slug validation and automatic ID/timestamp generation.*

Next, I'll create a document inside this newly created collection:

```graphql
mutation {
  createDocument(
    title: "System Architecture"
    content: "Overview of microservices and GraphQL Yoga setup."
    collectionId: "YOUR_COLLECTION_ID"
    tags: ["architecture", "graphql"]
  ) {
    id
    title
    content
    tags
    isArchived
    collectionId
  }
}
```
*Demonstrates creating a document with optional tag arrays and verifying foreign key association with the target collection.*

Now let's query documents using substring search and archiving status filters:

```graphql
query {
  documents(search: "Architecture", isArchived: false, take: 2) {
    edges {
      id
      title
      collectionId
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```
*Demonstrates case-insensitive substring searching, status filtering, and cursor pagination metadata.*

Next, I can move a document to a different collection:

```graphql
mutation {
  moveDocument(id: "YOUR_DOCUMENT_ID", collectionId: "TARGET_COLLECTION_ID") {
    id
    title
    collectionId
  }
}
```
*Demonstrates atomic document relocation between collections with collection existence verification.*

We can also perform partial updates on a document's attributes:

```graphql
mutation {
  updateDocument(id: "YOUR_DOCUMENT_ID", title: "Updated System Architecture Spec", isArchived: true) {
    id
    title
    isArchived
  }
}
```
*Demonstrates partial fields update where unprovided fields remain intact.*

And delete a document when it's no longer needed:

```graphql
mutation {
  deleteDocument(id: "YOUR_DOCUMENT_ID")
}
```
*Demonstrates deletion returning a clean `true` boolean or throwing a BAD_USER_INPUT error if already deleted.*

Finally, let's see how invalid inputs are handled when attempting to create a document with an empty title:

```graphql
mutation {
  createDocument(title: "   ", content: "Valid content", collectionId: "YOUR_COLLECTION_ID") {
    id
  }
}
```

The server returns a structured GraphQL error instead of a generic 500 crash:

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
*Demonstrates user input validation throwing custom GraphQLError with BAD_USER_INPUT extensions code.*

## How it's structured

The project enforces a strict architectural boundary between thin GraphQL resolvers (`src/resolvers/`) and the core data-access business logic (`src/lib/`). Resolvers act solely as HTTP/GraphQL entry points, unpacking context and forwarding calls directly to data-access modules like `collections.ts` and `documents.ts`. We use `@graphql-codegen` to automatically generate TypeScript types from `schema.graphql`, ensuring our resolver signatures and return types stay strictly synchronized with the schema contract.

## Testing

I built a comprehensive 3-layer test suite to ensure complete system reliability:
1. **Pure Validation Unit Tests** (`src/__tests__/validation.test.ts`): Tests input parsing and regex rules in isolation without database or network overhead.
2. **Data-Access Unit Tests** (`src/__tests__/collections.test.ts` & `src/__tests__/documents.test.ts`): Mocks Prisma operations to verify query building, overfetching logic, and error handling instantly.
3. **PostgreSQL Integration Tests** (`src/__tests__/integration/documents.integration.test.ts`): Executes full lifecycle operations against a live Dockerized PostgreSQL instance.

You can run the entire test suite with `bun test`, or run `bun run sanity` to check ESLint, TypeScript types, and tests all in one go. Notably, the integration test suite includes a strict `afterAll` hook that cleans up all created test records, which I verified leaves database row counts identical before and after the test run.

## Key decisions, briefly

I made several intentional architectural tradeoffs throughout this project. For pagination, I chose a deterministic `take + cursor` design combining `createdAt` and `id` as a tiebreaker to prevent skipped or duplicate items. Isolating business logic into thin resolvers and a pure validation module maximizes unit testability without spinning up GraphQL servers. For substring searching, PostgreSQL `ILIKE` was chosen for simplicity, though it has scaling limits on high-volume tables. For detailed technical context on each of these choices, please refer to DECISIONS.md.

## If I had more time

If I were extending this project further, I would first implement `@dataloader` to eliminate N+1 queries when fetching `Document.collection` relations across large result sets. For production-scale search, I'd upgrade `ILIKE` substring matching to PostgreSQL `tsvector` full-text search or trigram indexes (`pg_trgm`). Finally, if cross-collection tag searching or tag renaming became a core requirement, I would normalize `tags: String[]` into a dedicated `Tag` table with a many-to-many join relationship.
