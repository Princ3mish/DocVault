import type { Resolvers } from "../schema/generated";
import {
  collectionQueries,
  collectionMutations,
  collectionResolvers,
} from "./collection";
import {
  documentQueries,
  documentMutations,
  documentResolvers,
} from "./document";

export const resolvers: Resolvers = {
  Query: {
    ...collectionQueries,
    ...documentQueries,
  },
  Mutation: {
    ...collectionMutations,
    ...documentMutations,
  },
  Collection: collectionResolvers,
  Document: documentResolvers,
};
