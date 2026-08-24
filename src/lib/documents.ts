import type { PrismaClient, Document } from "@prisma/client";

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
  throw new Error("not implemented");
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
