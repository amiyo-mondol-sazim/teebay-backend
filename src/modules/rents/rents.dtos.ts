import { ApiProperty } from "@nestjs/swagger";

import { IsDateString, IsInt, IsNotEmpty } from "class-validator";

export class CreateRentDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  productId!: number;

  @ApiProperty({ example: "2024-01-01" })
  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: "2024-01-02" })
  @IsNotEmpty()
  @IsDateString()
  endDate!: string;
}
