import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

import {
  DEFAULT_CONVERSATIONS_PAGE_SIZE,
  MAX_CONVERSATIONS_PAGE_SIZE,
} from "../conversations.constants";
import { CreateConversationDto, GetConversationsQueryDto } from "../conversations.dtos";

describe("CreateConversationDto", () => {
  describe("participantId validation", () => {
    const validBaseDto = {
      participantId: 2,
    };

    it("should pass when participantId is a valid integer", () => {
      const dto = plainToInstance(CreateConversationDto, validBaseDto);

      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail when participantId is missing", () => {
      const dto = plainToInstance(CreateConversationDto, {} as unknown);

      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should fail when participantId is not an integer", () => {
      const dto = plainToInstance(CreateConversationDto, {
        participantId: "invalid" as unknown,
      } as unknown);

      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("productId validation", () => {
    const validBaseDto = {
      participantId: 2,
    };

    it("should pass when productId is a valid integer", () => {
      const dto = plainToInstance(CreateConversationDto, {
        ...validBaseDto,
        productId: 1,
      });

      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });

    it("should pass when productId is omitted", () => {
      const dto = plainToInstance(CreateConversationDto, validBaseDto);

      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail when productId is not an integer", () => {
      const dto = plainToInstance(CreateConversationDto, {
        ...validBaseDto,
        productId: "invalid" as unknown,
      } as unknown);

      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

describe("GetConversationsQueryDto", () => {
  describe("page validation", () => {
    it("should pass when page is a valid integer", () => {
      const dto = plainToInstance(GetConversationsQueryDto, { page: 2 });

      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });

    it("should use default value when page is omitted", () => {
      const dto = plainToInstance(GetConversationsQueryDto, {});

      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(1);
    });

    it("should fail when page is less than 1", () => {
      const dto = plainToInstance(GetConversationsQueryDto, { page: 0 });

      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should fail when page is not an integer", () => {
      const dto = plainToInstance(GetConversationsQueryDto, {
        page: "invalid" as unknown,
      } as unknown);

      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("limit validation", () => {
    it("should pass when limit is a valid integer", () => {
      const dto = plainToInstance(GetConversationsQueryDto, { limit: 15 });

      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });

    it("should use default value when limit is omitted", () => {
      const dto = plainToInstance(GetConversationsQueryDto, {});

      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
      expect(dto.limit).toBe(DEFAULT_CONVERSATIONS_PAGE_SIZE);
    });

    it("should fail when limit is less than 1", () => {
      const dto = plainToInstance(GetConversationsQueryDto, { limit: 0 });

      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should fail when limit exceeds maximum", () => {
      const dto = plainToInstance(GetConversationsQueryDto, {
        limit: MAX_CONVERSATIONS_PAGE_SIZE + 1,
      });

      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should fail when limit is not an integer", () => {
      const dto = plainToInstance(GetConversationsQueryDto, {
        limit: "invalid" as unknown,
      } as unknown);

      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
