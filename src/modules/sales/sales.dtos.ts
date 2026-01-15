import { ApiProperty } from "@nestjs/swagger";

import { IsInt, IsNotEmpty } from "class-validator";

export class CreateSaleDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  productId!: number;
}
