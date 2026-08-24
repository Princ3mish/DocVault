import { describe, test, expect } from "bun:test";
import {
  validateTitle,
  validateContent,
  validateName,
  validateSlug,
} from "../lib/validation";

describe("validation helpers", () => {
  describe("validateTitle", () => {
    test("accepts valid title", () => {
      expect(() => validateTitle("Valid Title")).not.toThrow();
    });

    test("throws on empty string", () => {
      expect(() => validateTitle("")).toThrow("Title cannot be empty");
    });

    test("throws on whitespace-only string", () => {
      expect(() => validateTitle("   \t\n  ")).toThrow("Title cannot be empty");
    });
  });

  describe("validateContent", () => {
    test("accepts valid content", () => {
      expect(() => validateContent("Valid content here")).not.toThrow();
    });

    test("throws on empty string", () => {
      expect(() => validateContent("")).toThrow("Content cannot be empty");
    });

    test("throws on whitespace-only string", () => {
      expect(() => validateContent("   ")).toThrow("Content cannot be empty");
    });
  });

  describe("validateName", () => {
    test("accepts valid name", () => {
      expect(() => validateName("Engineering")).not.toThrow();
    });

    test("throws on empty string", () => {
      expect(() => validateName("")).toThrow("Name cannot be empty");
    });

    test("throws on whitespace-only string", () => {
      expect(() => validateName("   ")).toThrow("Name cannot be empty");
    });
  });

  describe("validateSlug", () => {
    test("accepts valid slug", () => {
      expect(() => validateSlug("my-collection-1")).not.toThrow();
    });

    test("throws on empty string", () => {
      expect(() => validateSlug("")).toThrow();
    });

    test("rejects uppercase", () => {
      expect(() => validateSlug("My-Collection")).toThrow();
    });

    test("rejects spaces", () => {
      expect(() => validateSlug("my collection")).toThrow();
    });

    test("rejects leading hyphen", () => {
      expect(() => validateSlug("-my-collection")).toThrow();
    });

    test("rejects trailing hyphen", () => {
      expect(() => validateSlug("my-collection-")).toThrow();
    });

    test("rejects consecutive hyphens", () => {
      expect(() => validateSlug("my--collection")).toThrow();
    });
  });
});
