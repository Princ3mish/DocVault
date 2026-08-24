import {
  getAllCollections,
  getCollectionById,
  createCollection,
} from "../lib/collections";
import type {
  QueryResolvers,
  MutationResolvers,
  CollectionResolvers,
} from "../schema/generated";

export const collectionQueries: QueryResolvers = {
  collections: (_parent, _args, context) => getAllCollections(context.prisma),
  collection: (_parent, args, context) =>
    getCollectionById(context.prisma, args.id),
};

export const collectionMutations: MutationResolvers = {
  createCollection: (_parent, args, context) =>
    createCollection(context.prisma, args),
};

export const collectionResolvers: CollectionResolvers = {
  createdAt: (parent) => parent.createdAt.toISOString(),
  documents: (parent, _args, context) =>
    context.prisma.document.findMany({ where: { collectionId: parent.id } }),
};
