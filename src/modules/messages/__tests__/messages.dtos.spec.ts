import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

import {
  CreateMessageDto,
  DEFAULT_PAGE_SIZE,
  GetMessagesQueryDto,
  MAX_MESSAGE_LENGTH,
} from "../messages.dtos";

describe("CreateMessageDto", () => {
  describe("content validation", () => {
    it("should pass when content is valid", () => {
      const dto = plainToInstance(CreateMessageDto, {
        content: "a".repeat(100),
      });
      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });

    it("should pass when content is exactly at max length", () => {
      const dto = plainToInstance(CreateMessageDto, {
        content: "a".repeat(MAX_MESSAGE_LENGTH),
      });
      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail when content is empty", () => {
      const dto = plainToInstance(CreateMessageDto, {
        content: "",
      } as unknown);
      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should fail when content is missing", () => {
      const dto = plainToInstance(CreateMessageDto, {} as unknown);
      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should fail when content exceeds max length", () => {
      const dto = plainToInstance(CreateMessageDto, {
        content: "a".repeat(MAX_MESSAGE_LENGTH + 1),
      });
      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

describe("GetMessagesQueryDto", () => {
  describe("page validation", () => {
    it("should pass when page is a valid integer", () => {
      const dto = plainToInstance(GetMessagesQueryDto, { page: 2 });
      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });

    it("should use default value when page is omitted", () => {
      const dto = plainToInstance(GetMessagesQueryDto, {});
      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(1);
    });

    it("should fail when page is not an integer", () => {
      const dto = plainToInstance(GetMessagesQueryDto, {
        page: "invalid" as unknown,
      } as unknown);
      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("limit validation", () => {
    it("should pass when limit is a valid integer", () => {
      const dto = plainToInstance(GetMessagesQueryDto, { limit: 25 });
      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });

    it("should use default value when limit is omitted", () => {
      const dto = plainToInstance(GetMessagesQueryDto, {});
      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
      expect(dto.limit).toBe(DEFAULT_PAGE_SIZE);
    });

    it("should fail when limit is not an integer", () => {
      const dto = plainToInstance(GetMessagesQueryDto, {
        limit: "invalid" as unknown,
      } as unknown);
      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
