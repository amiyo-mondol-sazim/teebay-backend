import { ApiProperty } from "@nestjs/swagger";

import { PaginatedResponse } from "@/common/dtos/pagination.dtos";
import { Product } from "@/common/entities/products.entity";
import { User } from "@/common/entities/users.entity";

export class SaleResponse {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: () => Product })
  product!: Product;

  @ApiProperty({ type: () => User })
  buyer!: User;

  @ApiProperty({ type: () => User })
  seller!: User;
}

export class SalesListResponse extends PaginatedResponse {
  data!: SaleResponse[];
}
