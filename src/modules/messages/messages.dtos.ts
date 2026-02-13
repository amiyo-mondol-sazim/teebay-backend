import { ApiProperty } from "@nestjs/swagger";

import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export const MAX_MESSAGE_LENGTH = 1000;
export const DEFAULT_PAGE_SIZE = 50;
export const NOTIFICATION_PREVIEW_LENGTH = 50;

export class CreateMessageDto {
  @ApiProperty({ example: "Hello, is this still available?" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(MAX_MESSAGE_LENGTH)
  content!: string;
}

export class GetMessagesQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  page = 1;

  @ApiProperty({ required: false, default: 50 })
  @IsOptional()
  @IsInt()
  limit = DEFAULT_PAGE_SIZE;
}
