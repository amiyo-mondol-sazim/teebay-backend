import { ApiProperty } from "@nestjs/swagger";

import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMessageDto {
  @ApiProperty({ example: "Hello, is this still available?" })
  @IsNotEmpty()
  @IsString()
  content!: string;
}

export class GetMessagesQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiProperty({ required: false, default: 50 })
  @IsOptional()
  @IsInt()
  limit?: number;
}
