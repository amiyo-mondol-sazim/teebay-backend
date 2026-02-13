import { ApiProperty } from "@nestjs/swagger";

import type { PaginationMetadataResponse } from "@/common/dtos/pagination.dtos";
import { ENotificationType } from "@/common/enums/notifications.enums";

export class NotificationResponse {
  @ApiProperty()
  id!: number;

  @ApiProperty({ enum: ENotificationType })
  type!: ENotificationType;

  @ApiProperty({ required: false })
  referenceId?: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  body!: string;

  @ApiProperty({ required: false })
  readAt?: Date;

  @ApiProperty()
  createdAt!: Date;
}

export class NotificationsListResponse {
  data!: NotificationResponse[];
  meta!: PaginationMetadataResponse;
}

export class UnreadCountResponse {
  @ApiProperty()
  count!: number;
}
