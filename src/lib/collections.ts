import type { PrismaClient, Collection } from "@prisma/client";

export async function getAllCollections(
  prisma: PrismaClient
): Promise<Collection[]> {
  throw new Error("not implemented");
}

export async function getCollectionById(
  prisma: PrismaClient,
  id: string
): Promise<Collection | null> {
  throw new Error("not implemented");
}

export async function createCollection(
  prisma: PrismaClient,
  data: { name: string; slug: string }
): Promise<Collection> {
  throw new Error("not implemented");
}
