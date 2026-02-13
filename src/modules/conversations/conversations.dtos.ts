import { ApiProperty } from "@nestjs/swagger";

import { IsInt, IsOptional } from "class-validator";

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
  @IsInt()
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsInt()
  limit?: number;
}
