import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";

import { User } from "@/common/entities/users.entity";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { computePaginationMetadata } from "@/utils/pagination";

import { DEFAULT_NOTIFICATIONS_PAGE_SIZE } from "./notifications.constants";
import { GetNotificationsQueryDto } from "./notifications.dtos";
import { NotificationsSerializer } from "./notifications.serializer";
import { NotificationsService } from "./notifications.service";
import { type NotificationsListResponse, type UnreadCountResponse } from "./notifications.types";

@ApiTags("Notifications")
@ApiBearerAuth()
@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsSerializer: NotificationsSerializer,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all notifications for current user" })
  @ApiQuery({ name: "page", required: false, type: Number, description: "Page number" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Items per page" })
  async getNotifications(
    @CurrentUser() currentUser: User,
    @Query() query: GetNotificationsQueryDto,
  ): Promise<NotificationsListResponse> {
    const page = query.page || 1;
    const limit = query.limit || DEFAULT_NOTIFICATIONS_PAGE_SIZE;

    const [notifications, totalCount] = await this.notificationsService.getNotifications(
      currentUser.id,
      { page, limit },
    );

    const meta = computePaginationMetadata({
      page,
      limit,
      totalItems: totalCount,
    });

    return {
      data: this.notificationsSerializer.serializeMany(notifications),
      meta,
    };
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get count of unread notifications" })
  async getUnreadCount(@CurrentUser() currentUser: User): Promise<UnreadCountResponse> {
    const count = await this.notificationsService.getUnreadCount(currentUser.id);
    return { count };
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a single notification as read" })
  @ApiParam({ name: "id", type: Number })
  async markAsRead(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    await this.notificationsService.markAsRead(id, currentUser.id);
  }

  @Patch("read-all")
  @ApiOperation({ summary: "Mark all notifications as read" })
  async markAllAsRead(@CurrentUser() currentUser: User): Promise<void> {
    await this.notificationsService.markAllAsRead(currentUser.id);
  }
}
