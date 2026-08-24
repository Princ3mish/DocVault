import { GraphQLError } from "graphql";
import { validateTitle, validateContent } from "./validation";
import type { PrismaClient, Document, Prisma } from "@prisma/client";

export async function searchDocuments(
  prisma: PrismaClient,
  args: {
    collectionId?: string | null;
    search?: string | null;
    isArchived?: boolean | null;
    take?: number | null;
    cursor?: string | null;
  }
): Promise<{ edges: Document[]; hasNextPage: boolean }> {
  const where: Prisma.DocumentWhereInput = {};

  if (args.collectionId !== null && args.collectionId !== undefined) {
    where.collectionId = args.collectionId;
  }

  if (args.isArchived !== null && args.isArchived !== undefined) {
    where.isArchived = args.isArchived;
  }

  if (
    args.search !== null &&
    args.search !== undefined &&
    args.search.trim().length > 0
  ) {
    where.OR = [
      { title: { contains: args.search, mode: "insensitive" } },
      { content: { contains: args.search, mode: "insensitive" } },
    ];
  }

  const takeLimit = args.take && args.take > 0 ? args.take : 20;

  const queryOptions: Prisma.DocumentFindManyArgs = {
    where,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: takeLimit + 1,
  };

  if (args.cursor !== null && args.cursor !== undefined) {
    queryOptions.cursor = { id: args.cursor };
    queryOptions.skip = 1;
  }

  const records = await prisma.document.findMany(queryOptions);

  const hasNextPage = records.length > takeLimit;
  const edges = hasNextPage ? records.slice(0, takeLimit) : records;

  return { edges, hasNextPage };
}

export async function createDocument(
  prisma: PrismaClient,
  data: {
    title: string;
    content: string;
    collectionId: string;
    tags?: string[] | null;
  }
): Promise<Document> {
  validateTitle(data.title);
  validateContent(data.content);

  const collection = await prisma.collection.findUnique({
    where: { id: data.collectionId },
  });

  if (!collection) {
    throw new GraphQLError("Collection not found", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  return prisma.document.create({
    data: {
      title: data.title,
      content: data.content,
      collectionId: data.collectionId,
      tags: data.tags ?? [],
    },
  });
}

export async function updateDocument(
  prisma: PrismaClient,
  id: string,
  data: {
    title?: string | null;
    content?: string | null;
    tags?: string[] | null;
    isArchived?: boolean | null;
  }
): Promise<Document> {
  const existing = await prisma.document.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new GraphQLError("Document not found", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  if (data.title !== null && data.title !== undefined) {
    validateTitle(data.title);
  }

  if (data.content !== null && data.content !== undefined) {
    validateContent(data.content);
  }

  const updateData: Prisma.DocumentUpdateInput = {};

  if (data.title !== null && data.title !== undefined) {
    updateData.title = data.title;
  }

  if (data.content !== null && data.content !== undefined) {
    updateData.content = data.content;
  }

  if (data.tags !== null && data.tags !== undefined) {
    updateData.tags = data.tags;
  }

  if (data.isArchived !== null && data.isArchived !== undefined) {
    updateData.isArchived = data.isArchived;
  }

  return prisma.document.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteDocument(
  prisma: PrismaClient,
  id: string
): Promise<boolean> {
  const existing = await prisma.document.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new GraphQLError("Document not found", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  await prisma.document.delete({
    where: { id },
  });

  return true;
}

export async function moveDocument(
  prisma: PrismaClient,
  id: string,
  collectionId: string
): Promise<Document> {
  const existingDoc = await prisma.document.findUnique({
    where: { id },
  });

  if (!existingDoc) {
    throw new GraphQLError("Document not found", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const targetCol = await prisma.collection.findUnique({
    where: { id: collectionId },
  });

  if (!targetCol) {
    throw new GraphQLError("Collection not found", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  return prisma.document.update({
    where: { id },
    data: { collectionId },
  });
}
