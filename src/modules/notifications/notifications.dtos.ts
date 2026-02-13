import { ApiProperty } from "@nestjs/swagger";

import { IsInt, IsOptional, Max, Min } from "class-validator";

export class GetNotificationsQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
