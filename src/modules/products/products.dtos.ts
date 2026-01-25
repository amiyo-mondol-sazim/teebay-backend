import { ApiProperty, PartialType } from "@nestjs/swagger";

import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

import { EProductStatus, ERentalPeriod } from "@/common/enums/products.enums";
import { IsValidPriceRange } from "@/common/validators/price-range.validator";

import { DEFAULT_PRODUCTS_PAGE_SIZE } from "./products.constants";

export class CreateProductDto {
  @ApiProperty({ example: "Product title" })
  @IsString()
  title!: string;

  @ApiProperty({ example: "Product description" })
  @IsString()
  description!: string;

  @ApiProperty({ example: ["category1", "category2"] })
  @IsArray()
  @IsString({ each: true })
  categories!: string[];

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  purchasePrice!: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  rentPrice!: number;

  @ApiProperty({ enum: ERentalPeriod, enumName: "ERentalPeriod", example: ERentalPeriod.DAY })
  @IsEnum(ERentalPeriod)
  rentalPeriod!: ERentalPeriod;

  @ApiProperty({
    required: false,
    example: "http://localhost:4566/project-dev-bucket/products/abc-123.jpg",
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class GetProductsQueryDto {
  @IsValidPriceRange()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly _priceRangeValidation?: unknown;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = DEFAULT_PRODUCTS_PAGE_SIZE;

  @ApiProperty({
    required: false,
    enum: EProductStatus,
    enumName: "EProductStatus",
  })
  @IsOptional()
  @IsEnum(EProductStatus)
  status?: EProductStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPurchasePrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPurchasePrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRentPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxRentPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categories?: string;
}
