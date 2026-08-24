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
  throw new Error("not implemented");
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
  throw new Error("not implemented");
}

export async function deleteDocument(
  prisma: PrismaClient,
  id: string
): Promise<boolean> {
  throw new Error("not implemented");
}

export async function moveDocument(
  prisma: PrismaClient,
  id: string,
  collectionId: string
): Promise<Document> {
  throw new Error("not implemented");
}
