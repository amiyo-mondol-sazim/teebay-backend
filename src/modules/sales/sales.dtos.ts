import { ApiProperty } from "@nestjs/swagger";

import { IsNumber } from "class-validator";

export class CreateSaleDto {
  @ApiProperty()
  @IsNumber()
  productId!: number;
}
