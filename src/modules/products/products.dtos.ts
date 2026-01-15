import { ApiProperty, PartialType } from "@nestjs/swagger";

import { IsArray, IsEnum, IsNumber, IsString, Min } from "class-validator";

import { ERentalPeriod } from "@/common/enums/products.enums";

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
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
