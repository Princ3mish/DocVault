import { describe, test, expect, mock } from "bun:test";
import {
  getAllCollections,
  getCollectionById,
  createCollection,
} from "../lib/collections";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { PrismaClient } from "@prisma/client";

describe("collections data access functions", () => {
  describe("createCollection", () => {
    test("throws for empty name before calling prisma.collection.create", async () => {
      const mockCollectionCreate = mock(() => Promise.resolve({}));
      const mockPrisma = {
        collection: { create: mockCollectionCreate },
      } as unknown as PrismaClient;

      await expect(
        createCollection(mockPrisma, { name: "   ", slug: "valid-slug" })
      ).rejects.toThrow("Name cannot be empty");

      expect(mockCollectionCreate).not.toHaveBeenCalled();
    });

    test("throws for a malformed slug before calling prisma.collection.create", async () => {
      const mockCollectionCreate = mock(() => Promise.resolve({}));
      const mockPrisma = {
        collection: { create: mockCollectionCreate },
      } as unknown as PrismaClient;

      await expect(
        createCollection(mockPrisma, { name: "Valid Name", slug: "Invalid Slug" })
      ).rejects.toThrow();

      expect(mockCollectionCreate).not.toHaveBeenCalled();
    });

    test("re-throws P2002 error as GraphQLError with BAD_USER_INPUT", async () => {
      const p2002Error = new PrismaClientKnownRequestError(
        "Unique constraint failed",
        {
          code: "P2002",
          clientVersion: "6.4.1",
        }
      );

      const mockCollectionCreate = mock(() => Promise.reject(p2002Error));
      const mockPrisma = {
        collection: { create: mockCollectionCreate },
      } as unknown as PrismaClient;

      try {
        await createCollection(mockPrisma, {
          name: "Engineering",
          slug: "engineering",
        });
        expect(true).toBe(false);
      } catch (err: unknown) {
        const error = err as { message: string; extensions?: { code: string } };
        expect(error.message).toContain("already exists");
        expect(error.extensions?.code).toBe("BAD_USER_INPUT");
      }
    });
  });

  describe("getCollectionById", () => {
    test("returns null when prisma.collection.findUnique resolves null", async () => {
      const mockCollectionFindUnique = mock(() => Promise.resolve(null));
      const mockPrisma = {
        collection: { findUnique: mockCollectionFindUnique },
      } as unknown as PrismaClient;

      const result = await getCollectionById(mockPrisma, "col-999");

      expect(result).toBeNull();
      expect(mockCollectionFindUnique).toHaveBeenCalledWith({
        where: { id: "col-999" },
      });
    });
  });

  describe("getAllCollections", () => {
    test("calls prisma.collection.findMany with orderBy createdAt ascending", async () => {
      const mockCollectionFindMany = mock(() => Promise.resolve([]));
      const mockPrisma = {
        collection: { findMany: mockCollectionFindMany },
      } as unknown as PrismaClient;

      await getAllCollections(mockPrisma);

      expect(mockCollectionFindMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "asc" },
      });
    });
  });
});
