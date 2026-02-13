import { ApiProperty } from "@nestjs/swagger";

import { PaginatedResponse } from "@/common/dtos/pagination.dtos";
import { User } from "@/common/entities/users.entity";
import { EProductStatus, ERentalPeriod } from "@/common/enums/products.enums";

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

  @ApiProperty({ enum: EProductStatus, enumName: "EProductStatus" })
  status!: EProductStatus;

  @ApiProperty()
  viewCount!: number;

  @ApiProperty({ required: false })
  imageUrl?: string;

  @ApiProperty({ type: () => User, required: false })
  owner?: User;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ProductsListResponse extends PaginatedResponse {
  @ApiProperty({ type: () => [ProductResponse] })
  data!: ProductResponse[];
}

export interface ProductFilters {
  status?: EProductStatus;
  categories?: string[];
  minPurchasePrice?: number;
  maxPurchasePrice?: number;
  minRentPrice?: number;
  maxRentPrice?: number;
  excludeOwnerId?: number;
}
