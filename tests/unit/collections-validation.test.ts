import { describe, expect, it } from "vitest";

import {
  COLLECTION_DESCRIPTION_MAX_LENGTH,
  COLLECTION_TITLE_MAX_LENGTH,
  collectionCreationTokenSchema,
  collectionIdSchema,
  collectionInputSchema,
  collectionItemInputSchema,
  collectionMoveInputSchema,
  collectionPageSchema,
} from "@/server/validation/collections";
import {
  adminAuditActionSchema,
  adminTargetTypeSchema,
  hideCollectionInputSchema,
  restoreCollectionInputSchema,
} from "@/server/validation/moderation";

const UUID_A = "123e4567-e89b-12d3-a456-426614174000";
const UUID_B = "123e4567-e89b-12d3-a456-426614174001";

describe("collectionInputSchema", () => {
  it("trims the title and optional description", () => {
    expect(
      collectionInputSchema.parse({
        title: "  回中史记  ",
        description: "  按时间整理的作品  ",
        visibility: "public",
      }),
    ).toEqual({
      title: "回中史记",
      description: "按时间整理的作品",
      visibility: "public",
    });
  });

  it("normalizes an empty description to null", () => {
    expect(
      collectionInputSchema.parse({
        title: "特辑",
        description: " \n ",
        visibility: "members_only",
      }).description,
    ).toBeNull();
  });

  it("enforces title and description limits", () => {
    expect(
      collectionInputSchema.safeParse({
        title: "a".repeat(COLLECTION_TITLE_MAX_LENGTH),
        description: "b".repeat(COLLECTION_DESCRIPTION_MAX_LENGTH),
        visibility: "public",
      }).success,
    ).toBe(true);
    expect(
      collectionInputSchema.safeParse({
        title: "a".repeat(COLLECTION_TITLE_MAX_LENGTH + 1),
        description: "",
        visibility: "public",
      }).success,
    ).toBe(false);
    expect(
      collectionInputSchema.safeParse({
        title: "特辑",
        description: "b".repeat(COLLECTION_DESCRIPTION_MAX_LENGTH + 1),
        visibility: "public",
      }).success,
    ).toBe(false);
  });

  it("requires a non-empty title and supported visibility", () => {
    for (const title of ["", " \t "]) {
      expect(
        collectionInputSchema.safeParse({
          title,
          description: "",
          visibility: "public",
        }).success,
      ).toBe(false);
    }
    for (const visibility of ["", "private", undefined]) {
      expect(
        collectionInputSchema.safeParse({
          title: "特辑",
          description: "",
          visibility,
        }).success,
      ).toBe(false);
    }
  });
});

describe("collection identifiers and pagination", () => {
  it("accepts UUID collection, poem and creation identifiers", () => {
    expect(collectionIdSchema.parse(UUID_A)).toBe(UUID_A);
    expect(collectionCreationTokenSchema.parse(UUID_B)).toBe(UUID_B);
    expect(
      collectionItemInputSchema.parse({ collectionId: UUID_A, poemId: UUID_B }),
    ).toEqual({ collectionId: UUID_A, poemId: UUID_B });
  });

  it("accepts only up and down move directions", () => {
    expect(
      collectionMoveInputSchema.safeParse({
        collectionId: UUID_A,
        poemId: UUID_B,
        direction: "up",
      }).success,
    ).toBe(true);
    expect(
      collectionMoveInputSchema.safeParse({
        collectionId: UUID_A,
        poemId: UUID_B,
        direction: "left",
      }).success,
    ).toBe(false);
  });

  it("uses the bounded shared page contract", () => {
    expect(collectionPageSchema.parse(undefined)).toBe(1);
    expect(collectionPageSchema.parse("12")).toBe(12);
    for (const value of ["0", "-1", "1.5", "abc", null]) {
      expect(collectionPageSchema.safeParse(value).success).toBe(false);
    }
  });
});

describe("collection moderation validation", () => {
  it("trims reasons and strips forged authority fields", () => {
    for (const schema of [hideCollectionInputSchema, restoreCollectionInputSchema]) {
      const result = schema.parse({
        targetId: UUID_A,
        reason: "  治理说明  ",
        adminId: "forged-admin",
      });
      expect(result).toEqual({ targetId: UUID_A, reason: "治理说明" });
    }
  });

  it("registers collection audit actions and targets", () => {
    expect(adminTargetTypeSchema.parse("collection")).toBe("collection");
    expect(adminAuditActionSchema.parse("collection_hidden")).toBe(
      "collection_hidden",
    );
    expect(adminAuditActionSchema.parse("collection_restored")).toBe(
      "collection_restored",
    );
  });
});
