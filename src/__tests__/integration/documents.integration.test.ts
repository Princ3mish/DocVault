import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { prisma } from "../../lib/prisma";
import { createCollection, getCollectionById } from "../../lib/collections";
import {
  createDocument,
  searchDocuments,
  moveDocument,
  deleteDocument,
} from "../../lib/documents";

describe("Document Vault integration", () => {
  let sourceCollectionId: string;
  let targetCollectionId: string;
  let documentId: string;

  beforeAll(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      throw new Error(
        "PostgreSQL container is not reachable. Please start Docker Postgres with 'docker compose up -d'."
      );
    }
  });

  afterAll(async () => {
    try {
      await prisma.document.deleteMany({
        where: {
          collection: {
            slug: {
              startsWith: "integration-test-",
            },
          },
        },
      });
      await prisma.collection.deleteMany({
        where: {
          slug: {
            startsWith: "integration-test-",
          },
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  });

  test("a. creates two real collections", async () => {
    const sourceCol = await createCollection(prisma, {
      name: "Integration Source",
      slug: "integration-test-source",
    });
    const targetCol = await createCollection(prisma, {
      name: "Integration Target",
      slug: "integration-test-target",
    });

    expect(sourceCol.id).toBeDefined();
    expect(targetCol.id).toBeDefined();

    sourceCollectionId = sourceCol.id;
    targetCollectionId = targetCol.id;
  });

  test("b. creates a real document in source collection", async () => {
    const doc = await createDocument(prisma, {
      title: "Integration Test Doc",
      content: "Integration test content",
      collectionId: sourceCollectionId,
      tags: ["test", "integration"],
    });

    expect(doc.id).toBeDefined();
    expect(doc.title).toBe("Integration Test Doc");
    expect(doc.content).toBe("Integration test content");
    expect(doc.collectionId).toBe(sourceCollectionId);
    expect(doc.tags).toEqual(["test", "integration"]);

    documentId = doc.id;
  });

  test("c. verifies collection retrieval and foreign key relationship in database", async () => {
    const collection = await getCollectionById(prisma, sourceCollectionId);
    expect(collection).not.toBeNull();
    expect(collection?.name).toBe("Integration Source");

    const docs = await prisma.document.findMany({
      where: { collectionId: sourceCollectionId },
    });

    expect(docs.length).toBe(1);
    expect(docs[0]?.id).toBe(documentId);
  });

  test("d. searches document by title substring and collectionId", async () => {
    const result = await searchDocuments(prisma, {
      search: "Integration",
      collectionId: sourceCollectionId,
    });

    expect(result.edges.length).toBe(1);
    expect(result.edges[0]?.id).toBe(documentId);
  });

  test("e. moves document to target collection and verifies database row", async () => {
    const movedDoc = await moveDocument(
      prisma,
      documentId,
      targetCollectionId
    );
    expect(movedDoc.collectionId).toBe(targetCollectionId);

    const dbDoc = await prisma.document.findUnique({
      where: { id: documentId },
    });
    expect(dbDoc?.collectionId).toBe(targetCollectionId);
  });

  test("f. deletes document and confirms database removal", async () => {
    const success = await deleteDocument(prisma, documentId);
    expect(success).toBe(true);

    const dbDoc = await prisma.document.findUnique({
      where: { id: documentId },
    });
    expect(dbDoc).toBeNull();
  });

  test("g. rejects createDocument with empty title and verifies no row inserted", async () => {
    await expect(
      createDocument(prisma, {
        title: "   ",
        content: "Invalid",
        collectionId: sourceCollectionId,
      })
    ).rejects.toThrow("Title cannot be empty");

    const docs = await prisma.document.findMany({
      where: { collectionId: sourceCollectionId },
    });
    expect(docs.length).toBe(0);
  });
});
