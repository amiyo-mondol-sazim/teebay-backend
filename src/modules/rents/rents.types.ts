import { ApiProperty } from "@nestjs/swagger";

import { PaginatedResponse } from "@/common/dtos/pagination.dtos";
import { Product } from "@/common/entities/products.entity";
import { User } from "@/common/entities/users.entity";

export class RentResponse {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  rentPrice!: number;

  @ApiProperty()
  startDate!: Date;

  @ApiProperty()
  endDate!: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: () => Product })
  product!: Product;

  @ApiProperty({ type: () => User })
  renter!: User;

  @ApiProperty({ type: () => User })
  owner!: User;
}

export class RentsListResponse extends PaginatedResponse {
  data!: RentResponse[];
}
