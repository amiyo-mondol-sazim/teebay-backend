import { ApiProperty } from "@nestjs/swagger";

import { IsDateString, IsInt, IsNotEmpty } from "class-validator";

export class CreateRentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  productId!: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  endDate!: string;
}
