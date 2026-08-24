import { GraphQLError } from "graphql";

export function validateTitle(title: string): void {
  if (!title || title.trim().length === 0) {
    throw new GraphQLError("Title cannot be empty", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
}

export function validateContent(content: string): void {
  if (!content || content.trim().length === 0) {
    throw new GraphQLError("Content cannot be empty", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
}

export function validateSlug(slug: string): void {
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!slug || !slugRegex.test(slug)) {
    throw new GraphQLError(
      "Slug must contain only lowercase alphanumeric characters and hyphens",
      {
        extensions: { code: "BAD_USER_INPUT" },
      }
    );
  }
}

export function validateName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new GraphQLError("Name cannot be empty", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
}
