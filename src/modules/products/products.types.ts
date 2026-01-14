import { ApiProperty } from "@nestjs/swagger";

import { PaginatedResponse } from "../../common/dtos/pagination.dtos";
import { ERentalPeriod } from "../../common/enums/products.enums";

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
