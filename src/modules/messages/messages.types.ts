import { ApiProperty } from "@nestjs/swagger";

import type { PaginationMetadataResponse } from "@/common/dtos/pagination.dtos";
import { UserProfile } from "@/common/entities/user-profiles.entity";

export class MessageSenderResponse {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  email!: string;

  @ApiProperty({ type: () => UserProfile, required: false })
  userProfile?: UserProfile;
}

export class MessageResponse {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  conversationId!: number;

  @ApiProperty({ type: () => MessageSenderResponse })
  sender!: MessageSenderResponse;

  @ApiProperty()
  content!: string;

  @ApiProperty({ required: false })
  readAt?: Date;

  @ApiProperty()
  createdAt!: Date;
}

export class MessagesListResponse {
  data!: MessageResponse[];
  meta!: PaginationMetadataResponse;
}
