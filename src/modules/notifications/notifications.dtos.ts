import { ApiProperty } from "@nestjs/swagger";

import { IsInt, IsOptional } from "class-validator";

export class GetNotificationsQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsInt()
  limit?: number;
}
