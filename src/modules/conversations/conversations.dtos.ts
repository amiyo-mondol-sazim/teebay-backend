import { ApiProperty } from "@nestjs/swagger";

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
  @Min(1)
  @IsInt()
  page?: number = 1;

  @ApiProperty({
    required: false,
    default: DEFAULT_CONVERSATIONS_PAGE_SIZE,
    maximum: MAX_CONVERSATIONS_PAGE_SIZE,
  })
  @IsOptional()
  @Min(1)
  @Max(MAX_CONVERSATIONS_PAGE_SIZE)
  @IsInt()
  limit?: number = DEFAULT_CONVERSATIONS_PAGE_SIZE;
}
