import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { CreateProductDto } from "../products.dtos";
import { ERentalPeriod } from "@/common/enums/products.enums";

describe("CreateProductDto", () => {
  describe("imageUrl validation", () => {
    const validBaseDto = {
      title: "Test Product",
      description: "Test Description",
      categories: ["electronics"],
      purchasePrice: 100,
      rentPrice: 10,
      rentalPeriod: ERentalPeriod.DAY,
    };

    it("should pass when imageUrl is a valid string", () => {
      const dto = plainToInstance(CreateProductDto, {
        ...validBaseDto,
        imageUrl: "http://localhost:4566/bucket/products/test.jpg",
      });

      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });

    it("should pass when imageUrl is omitted", () => {
      const dto = plainToInstance(CreateProductDto, validBaseDto);

      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail when imageUrl is not a string", () => {
      const dto = plainToInstance(CreateProductDto, {
        ...validBaseDto,
        imageUrl: 123,
      } as unknown); // Use type assertion to bypass TS for testing invalid input

      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
