import { PaginatedResponse } from "@/common/dtos/pagination.dtos";
import { ERentalPeriod } from "@/common/enums/products.enums";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNumber, IsString, Min } from "class-validator";
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
export class ProductResponse {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  categories!: string[];

  @ApiProperty()
  purchasePrice!: number;

  @ApiProperty()
  rentPrice!: number;

  @ApiProperty({ enum: ERentalPeriod, enumName: "ERentalPeriod" })
  rentalPeriod!: ERentalPeriod;

  @ApiProperty()
  viewCount!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
export class ProductsListResponse extends PaginatedResponse {
  data!: ProductResponse[];
}
