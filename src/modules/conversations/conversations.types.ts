import { ApiProperty } from "@nestjs/swagger";

import type { PaginationMetadataResponse } from "@/common/dtos/pagination.dtos";
import { UserProfile } from "@/common/entities/user-profiles.entity";
import { EProductStatus, ERentalPeriod } from "@/common/enums/products.enums";

export class ConversationParticipantResponse {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  email!: string;

  @ApiProperty({ type: () => UserProfile })
  userProfile?: UserProfile;
}

export class ProductResponse {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  categories!: string[];

  @ApiProperty()
  purchasePrice!: number;

  @ApiProperty()
  rentPrice!: number;

  @ApiProperty()
  rentalPeriod!: ERentalPeriod;

  @ApiProperty()
  status!: EProductStatus;

  @ApiProperty()
  viewCount!: number;

  @ApiProperty({ required: false })
  imageUrl?: string;
}

export class ConversationResponse {
  @ApiProperty()
  id!: number;

  @ApiProperty({ type: () => ConversationParticipantResponse })
  participant1!: ConversationParticipantResponse;

  @ApiProperty({ type: () => ConversationParticipantResponse })
  participant2!: ConversationParticipantResponse;

  @ApiProperty({ type: () => ProductResponse, required: false })
  product?: ProductResponse;

  @ApiProperty({ required: false })
  lastMessageAt?: Date;

  @ApiProperty()
  createdAt!: Date;
}

export class ConversationsListResponse {
  data!: ConversationResponse[];
  meta!: PaginationMetadataResponse;
}
