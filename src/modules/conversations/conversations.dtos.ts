import { ApiProperty } from "@nestjs/swagger";

import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

import {
  DEFAULT_CONVERSATIONS_PAGE_SIZE,
  MAX_CONVERSATIONS_PAGE_SIZE,
} from "./conversations.constants";

export class CreateConversationDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  participantId!: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  productId?: number;
}

export class GetConversationsQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    required: false,
    default: DEFAULT_CONVERSATIONS_PAGE_SIZE,
    maximum: MAX_CONVERSATIONS_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_CONVERSATIONS_PAGE_SIZE)
  limit?: number = DEFAULT_CONVERSATIONS_PAGE_SIZE;
}
