import { createYoga, createSchema } from "graphql-yoga";
import { prisma } from "./lib/prisma";
import { resolvers } from "./resolvers";
import type { GraphQLContext } from "./lib/context";

const typeDefs = await Bun.file("src/schema/schema.graphql").text();

const schema = createSchema<GraphQLContext>({
  typeDefs,
  resolvers,
});

const yoga = createYoga<GraphQLContext>({
  schema,
  context: () => ({ prisma }),
});

const server = Bun.serve({
  port: 4000,
  fetch: (req) => yoga.fetch(req),
});

console.log(`Server running on http://localhost:${server.port}/graphql`);
