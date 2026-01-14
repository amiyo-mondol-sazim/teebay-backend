import { ApiProperty, PartialType } from "@nestjs/swagger";

import { IsArray, IsEnum, IsNumber, IsString, Min } from "class-validator";

import { ERentalPeriod } from "@/common/enums/products.enums";

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  categories!: string[];

  @ApiProperty()
  @IsNumber()
  @Min(0)
  purchasePrice!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  rentPrice!: number;

  @ApiProperty({ enum: ERentalPeriod, enumName: "ERentalPeriod" })
  @IsEnum(ERentalPeriod)
  rentalPeriod!: ERentalPeriod;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
