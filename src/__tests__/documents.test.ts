import { describe, test, expect, mock } from "bun:test";
import {
  searchDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  moveDocument,
} from "../lib/documents";
import type { PrismaClient } from "@prisma/client";

describe("searchDocuments data access function", () => {
  test("builds correct where clause when collectionId, search, and isArchived are provided together", async () => {
    const mockFindMany = mock(() => Promise.resolve([]));
    const mockPrisma = {
      document: {
        findMany: mockFindMany,
      },
    } as unknown as PrismaClient;

    await searchDocuments(mockPrisma, {
      collectionId: "col-123",
      search: "architecture",
      isArchived: false,
      take: 5,
    });

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    const callArg = (mockFindMany.mock.calls[0] as unknown as [{ where: unknown; take: number }])[0];

    expect(callArg.where).toEqual({
      collectionId: "col-123",
      isArchived: false,
      OR: [
        { title: { contains: "architecture", mode: "insensitive" } },
        { content: { contains: "architecture", mode: "insensitive" } },
      ],
    });
    expect(callArg.take).toBe(6);
  });

  test("returns hasNextPage true and slices edges when findMany returns take + 1 records", async () => {
    const mockRecords = [
      { id: "1", title: "Doc 1", content: "c1", tags: [], isArchived: false, createdAt: new Date(), collectionId: "c1" },
      { id: "2", title: "Doc 2", content: "c2", tags: [], isArchived: false, createdAt: new Date(), collectionId: "c1" },
      { id: "3", title: "Doc 3", content: "c3", tags: [], isArchived: false, createdAt: new Date(), collectionId: "c1" },
    ];

    const mockPrisma = {
      document: {
        findMany: mock(() => Promise.resolve(mockRecords)),
      },
    } as unknown as PrismaClient;

    const result = await searchDocuments(mockPrisma, { take: 2 });

    expect(result.hasNextPage).toBe(true);
    expect(result.edges.length).toBe(2);
    expect(result.edges.map((d) => d.id)).toEqual(["1", "2"]);
  });

  test("returns hasNextPage false when findMany returns take or fewer records", async () => {
    const mockRecords = [
      { id: "1", title: "Doc 1", content: "c1", tags: [], isArchived: false, createdAt: new Date(), collectionId: "c1" },
      { id: "2", title: "Doc 2", content: "c2", tags: [], isArchived: false, createdAt: new Date(), collectionId: "c1" },
    ];

    const mockPrisma = {
      document: {
        findMany: mock(() => Promise.resolve(mockRecords)),
      },
    } as unknown as PrismaClient;

    const result = await searchDocuments(mockPrisma, { take: 2 });

    expect(result.hasNextPage).toBe(false);
    expect(result.edges.length).toBe(2);
    expect(result.edges.map((d) => d.id)).toEqual(["1", "2"]);
  });

  describe("createDocument", () => {
    test("throws GraphQLError for empty title and does not call database", async () => {
      const mockCollectionFindUnique = mock(() => Promise.resolve({ id: "col-1" }));
      const mockDocumentCreate = mock(() => Promise.resolve({}));
      const mockPrisma = {
        collection: { findUnique: mockCollectionFindUnique },
        document: { create: mockDocumentCreate },
      } as unknown as PrismaClient;

      expect(
        createDocument(mockPrisma, {
          title: "   ",
          content: "Content",
          collectionId: "col-1",
        })
      ).rejects.toThrow("Title cannot be empty");

      expect(mockCollectionFindUnique).not.toHaveBeenCalled();
      expect(mockDocumentCreate).not.toHaveBeenCalled();
    });

    test("throws Collection not found when collection does not exist and does not call document.create", async () => {
      const mockCollectionFindUnique = mock(() => Promise.resolve(null));
      const mockDocumentCreate = mock(() => Promise.resolve({}));
      const mockPrisma = {
        collection: { findUnique: mockCollectionFindUnique },
        document: { create: mockDocumentCreate },
      } as unknown as PrismaClient;

      expect(
        createDocument(mockPrisma, {
          title: "Valid Title",
          content: "Valid content",
          collectionId: "col-999",
        })
      ).rejects.toThrow("Collection not found");

      expect(mockCollectionFindUnique).toHaveBeenCalledWith({
        where: { id: "col-999" },
      });
      expect(mockDocumentCreate).not.toHaveBeenCalled();
    });

    test("calls document.create with correct payload defaulting tags to empty array", async () => {
      const mockCollectionFindUnique = mock(() => Promise.resolve({ id: "col-1" }));
      const mockDocumentCreate = mock((args: unknown) => Promise.resolve(args));
      const mockPrisma = {
        collection: { findUnique: mockCollectionFindUnique },
        document: { create: mockDocumentCreate },
      } as unknown as PrismaClient;

      await createDocument(mockPrisma, {
        title: "Valid Title",
        content: "Valid content",
        collectionId: "col-1",
      });

      expect(mockDocumentCreate).toHaveBeenCalledWith({
        data: {
          title: "Valid Title",
          content: "Valid content",
          collectionId: "col-1",
          tags: [],
        },
      });
    });
  });

  describe("updateDocument", () => {
    test("throws Document not found when document does not exist and does not call document.update", async () => {
      const mockDocumentFindUnique = mock(() => Promise.resolve(null));
      const mockDocumentUpdate = mock(() => Promise.resolve({}));
      const mockPrisma = {
        document: {
          findUnique: mockDocumentFindUnique,
          update: mockDocumentUpdate,
        },
      } as unknown as PrismaClient;

      expect(
        updateDocument(mockPrisma, "doc-999", { isArchived: true })
      ).rejects.toThrow("Document not found");

      expect(mockDocumentFindUnique).toHaveBeenCalledWith({
        where: { id: "doc-999" },
      });
      expect(mockDocumentUpdate).not.toHaveBeenCalled();
    });

    test("passes payload containing only isArchived when only isArchived is provided", async () => {
      const mockDocumentFindUnique = mock(() => Promise.resolve({ id: "doc-1" }));
      const mockDocumentUpdate = mock((args: unknown) => Promise.resolve(args));
      const mockPrisma = {
        document: {
          findUnique: mockDocumentFindUnique,
          update: mockDocumentUpdate,
        },
      } as unknown as PrismaClient;

      await updateDocument(mockPrisma, "doc-1", { isArchived: false });

      expect(mockDocumentUpdate).toHaveBeenCalledWith({
        where: { id: "doc-1" },
        data: { isArchived: false },
      });
    });
  });

  describe("deleteDocument", () => {
    test("throws Document not found when document does not exist and does not call document.delete", async () => {
      const mockDocumentFindUnique = mock(() => Promise.resolve(null));
      const mockDocumentDelete = mock(() => Promise.resolve({}));
      const mockPrisma = {
        document: {
          findUnique: mockDocumentFindUnique,
          delete: mockDocumentDelete,
        },
      } as unknown as PrismaClient;

      expect(deleteDocument(mockPrisma, "doc-999")).rejects.toThrow(
        "Document not found"
      );

      expect(mockDocumentFindUnique).toHaveBeenCalledWith({
        where: { id: "doc-999" },
      });
      expect(mockDocumentDelete).not.toHaveBeenCalled();
    });

    test("returns true and calls document.delete on success", async () => {
      const mockDocumentFindUnique = mock(() => Promise.resolve({ id: "doc-1" }));
      const mockDocumentDelete = mock(() => Promise.resolve({ id: "doc-1" }));
      const mockPrisma = {
        document: {
          findUnique: mockDocumentFindUnique,
          delete: mockDocumentDelete,
        },
      } as unknown as PrismaClient;

      const result = await deleteDocument(mockPrisma, "doc-1");

      expect(result).toBe(true);
      expect(mockDocumentDelete).toHaveBeenCalledWith({
        where: { id: "doc-1" },
      });
    });
  });

  describe("moveDocument", () => {
    test("throws Document not found when document does not exist and does not call collection.findUnique", async () => {
      const mockDocumentFindUnique = mock(() => Promise.resolve(null));
      const mockCollectionFindUnique = mock(() => Promise.resolve({ id: "col-2" }));
      const mockDocumentUpdate = mock(() => Promise.resolve({}));
      const mockPrisma = {
        document: {
          findUnique: mockDocumentFindUnique,
          update: mockDocumentUpdate,
        },
        collection: { findUnique: mockCollectionFindUnique },
      } as unknown as PrismaClient;

      expect(moveDocument(mockPrisma, "doc-999", "col-2")).rejects.toThrow(
        "Document not found"
      );

      expect(mockCollectionFindUnique).not.toHaveBeenCalled();
      expect(mockDocumentUpdate).not.toHaveBeenCalled();
    });

    test("throws Collection not found when target collection does not exist", async () => {
      const mockDocumentFindUnique = mock(() => Promise.resolve({ id: "doc-1" }));
      const mockCollectionFindUnique = mock(() => Promise.resolve(null));
      const mockDocumentUpdate = mock(() => Promise.resolve({}));
      const mockPrisma = {
        document: {
          findUnique: mockDocumentFindUnique,
          update: mockDocumentUpdate,
        },
        collection: { findUnique: mockCollectionFindUnique },
      } as unknown as PrismaClient;

      expect(moveDocument(mockPrisma, "doc-1", "col-999")).rejects.toThrow(
        "Collection not found"
      );

      expect(mockCollectionFindUnique).toHaveBeenCalledWith({
        where: { id: "col-999" },
      });
      expect(mockDocumentUpdate).not.toHaveBeenCalled();
    });

    test("calls document.update with new collectionId on success", async () => {
      const mockDocumentFindUnique = mock(() => Promise.resolve({ id: "doc-1" }));
      const mockCollectionFindUnique = mock(() => Promise.resolve({ id: "col-2" }));
      const mockDocumentUpdate = mock((args: unknown) => Promise.resolve(args));
      const mockPrisma = {
        document: {
          findUnique: mockDocumentFindUnique,
          update: mockDocumentUpdate,
        },
        collection: { findUnique: mockCollectionFindUnique },
      } as unknown as PrismaClient;

      await moveDocument(mockPrisma, "doc-1", "col-2");

      expect(mockDocumentUpdate).toHaveBeenCalledWith({
        where: { id: "doc-1" },
        data: { collectionId: "col-2" },
      });
    });
  });
});
