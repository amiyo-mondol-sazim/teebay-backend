import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

import type { EProductStatus } from "@/common/enums/products.enums";

import { IsValidPriceRange } from "../price-range.validator";

class TestDto {
  status?: EProductStatus;

  minPurchasePrice?: number;

  maxPurchasePrice?: number;

  minRentPrice?: number;

  maxRentPrice?: number;
}

class ValidDto extends TestDto {
  @IsValidPriceRange()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _validate!: unknown;
}

describe("IsValidPriceRange", () => {
  it("should pass when no price filters are provided", () => {
    const dto = plainToInstance(ValidDto, {});
    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it("should pass when only minPurchasePrice is provided", () => {
    const dto = plainToInstance(ValidDto, { minPurchasePrice: 100 });
    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it("should pass when only maxPurchasePrice is provided", () => {
    const dto = plainToInstance(ValidDto, { maxPurchasePrice: 500 });
    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it("should pass when minPurchasePrice <= maxPurchasePrice", () => {
    const dto = plainToInstance(ValidDto, { minPurchasePrice: 100, maxPurchasePrice: 500 });
    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it("should pass when minRentPrice <= maxRentPrice", () => {
    const dto = plainToInstance(ValidDto, { minRentPrice: 10, maxRentPrice: 50 });
    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it("should pass when both price ranges are valid", () => {
    const dto = plainToInstance(ValidDto, {
      minPurchasePrice: 100,
      maxPurchasePrice: 500,
      minRentPrice: 10,
      maxRentPrice: 50,
    });
    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it("should fail when minPurchasePrice > maxPurchasePrice", () => {
    const dto = plainToInstance(ValidDto, { minPurchasePrice: 500, maxPurchasePrice: 100 });
    const errors = validateSync(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("isValidPriceRange");
  });

  it("should fail when minRentPrice > maxRentPrice", () => {
    const dto = plainToInstance(ValidDto, { minRentPrice: 50, maxRentPrice: 10 });
    const errors = validateSync(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("isValidPriceRange");
  });
});
