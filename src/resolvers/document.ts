import {
  searchDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  moveDocument,
} from "../lib/documents";
import type {
  QueryResolvers,
  MutationResolvers,
  DocumentResolvers,
} from "../schema/generated";

export const documentQueries: QueryResolvers = {
  documents: async (_parent, args, context) => {
    const result = await searchDocuments(context.prisma, args);
    return {
      edges: result.edges,
      pageInfo: {
        hasNextPage: result.hasNextPage,
        endCursor: result.edges[result.edges.length - 1]?.id ?? null,
      },
    };
  },
};

export const documentMutations: MutationResolvers = {
  createDocument: (_parent, args, context) =>
    createDocument(context.prisma, args),
  updateDocument: (_parent, args, context) =>
    updateDocument(context.prisma, args.id, args),
  deleteDocument: (_parent, args, context) =>
    deleteDocument(context.prisma, args.id),
  moveDocument: (_parent, args, context) =>
    moveDocument(context.prisma, args.id, args.collectionId),
};

export const documentResolvers: DocumentResolvers = {
  createdAt: (parent) => parent.createdAt.toISOString(),
  collection: (parent, _args, context) =>
    context.prisma.collection.findUniqueOrThrow({
      where: { id: parent.collectionId },
    }),
};
