import { ApiProperty } from "@nestjs/swagger";

import { PaginatedResponse } from "@/common/dtos/pagination.dtos";
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

  @ApiProperty({ required: false, nullable: true })
  readAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;
}

export class NotificationsListResponse extends PaginatedResponse {
  data!: NotificationResponse[];
}

export class UnreadCountResponse {
  @ApiProperty()
  count!: number;
}
