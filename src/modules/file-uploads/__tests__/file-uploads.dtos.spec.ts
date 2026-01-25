import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { PresignedUrlFileDto } from "../file-uploads.dtos";
import { EAllowedMimeTypes } from "../file-uploads.enums";

describe("PresignedUrlFileDto", () => {
  describe("maxSize validation", () => {
    it("should pass when maxSize is within 5MB limit", () => {
      const dto = plainToInstance(PresignedUrlFileDto, {
        files: [
          {
            name: "test.jpg",
            type: EAllowedMimeTypes.JPG,
            maxSize: 5 * 1024 * 1024, // 5MB exactly
          },
        ],
      });

      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail when maxSize exceeds 5MB", () => {
      const dto = plainToInstance(PresignedUrlFileDto, {
        files: [
          {
            name: "test.jpg",
            type: EAllowedMimeTypes.JPG,
            maxSize: 5 * 1024 * 1024 + 1, // 5MB + 1 byte
          },
        ],
      });

      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].children?.[0].children?.[0].constraints).toHaveProperty("max");
    });

    it("should fail when maxSize is negative", () => {
      const dto = plainToInstance(PresignedUrlFileDto, {
        files: [
          {
            name: "test.jpg",
            type: EAllowedMimeTypes.JPG,
            maxSize: -1,
          },
        ],
      });

      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].children?.[0].children?.[0].constraints).toHaveProperty("isPositive");
    });

    it("should fail when maxSize is missing", () => {
      const dto = plainToInstance(PresignedUrlFileDto, {
        files: [
          {
            name: "test.jpg",
            type: EAllowedMimeTypes.JPG,
          },
        ],
      });

      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
