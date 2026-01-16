import { ApiProperty } from "@nestjs/swagger";

import { IsInt, IsNotEmpty } from "class-validator";

export class CreateSaleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  productId!: number;
}
