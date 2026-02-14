import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { GetNotificationsQueryDto } from "../notifications.dtos";

describe("GetNotificationsQueryDto", () => {
  describe("pagination validation", () => {
    it("should apply default values when not provided", () => {
      const dto = plainToInstance(GetNotificationsQueryDto, {});

      expect(dto.page).toBeUndefined();
      expect(dto.limit).toBeUndefined();
    });

    it("should validate page is at least 1", async () => {
      const dto = plainToInstance(GetNotificationsQueryDto, { page: 0 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty("min");
    });

    it("should validate limit is at least 1", async () => {
      const dto = plainToInstance(GetNotificationsQueryDto, { limit: 0 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty("min");
    });

    it("should validate limit is at most 100", async () => {
      const dto = plainToInstance(GetNotificationsQueryDto, { limit: 101 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty("max");
    });

    it("should accept valid pagination values", async () => {
      const dto = plainToInstance(GetNotificationsQueryDto, { page: 2, limit: 50 });
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
      expect(dto.page).toBe(2);
      expect(dto.limit).toBe(50);
    });

    it("should accept boundary value limit=100", async () => {
      const dto = plainToInstance(GetNotificationsQueryDto, { limit: 100 });
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
      expect(dto.limit).toBe(100);
    });
  });
});
