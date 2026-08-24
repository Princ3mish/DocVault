import { GraphQLError } from "graphql";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { validateName, validateSlug } from "./validation";
import type { PrismaClient, Collection } from "@prisma/client";

export async function getAllCollections(
  prisma: PrismaClient
): Promise<Collection[]> {
  return prisma.collection.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function getCollectionById(
  prisma: PrismaClient,
  id: string
): Promise<Collection | null> {
  return prisma.collection.findUnique({
    where: { id },
  });
}

export async function createCollection(
  prisma: PrismaClient,
  data: { name: string; slug: string }
): Promise<Collection> {
  validateName(data.name);
  validateSlug(data.slug);

  try {
    return await prisma.collection.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new GraphQLError("A collection with this slug already exists", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    throw error;
  }
}
