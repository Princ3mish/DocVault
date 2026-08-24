import { describe, test, expect, mock } from "bun:test";
import { searchDocuments } from "../lib/documents";
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
});
