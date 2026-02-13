import { Injectable } from "@nestjs/common";

import type { Notification } from "@/common/entities/notifications.entity";
import { User } from "@/common/entities/users.entity";
import type { ENotificationType } from "@/common/enums/notifications.enums";

import { DEFAULT_NOTIFICATIONS_PAGE_SIZE } from "./notifications.constants";
import type { GetNotificationsQueryDto } from "./notifications.dtos";
import { NotificationsRepository } from "./notifications.repository";
import { NotificationsSerializer } from "./notifications.serializer";
import type { NotificationsListResponse } from "./notifications.types";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationsSerializer: NotificationsSerializer,
  ) {}

  createNotification(
    userId: number,
    type: ENotificationType,
    title: string,
    body: string,
    referenceId?: number,
  ): Promise<Notification> {
    const em = this.notificationsRepository.getEntityManager();
    const notification = this.notificationsRepository.createOne({
      user: em.getReference(User, userId),
      type,
      title,
      body,
      referenceId,
    });
    return em.flush().then(() => notification);
  }

  async getNotifications(
    userId: number,
    query: GetNotificationsQueryDto,
  ): Promise<NotificationsListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_NOTIFICATIONS_PAGE_SIZE;

    const [notifications, totalCount] = await this.notificationsRepository.findByUser(
      userId,
      page,
      limit,
    );

    return {
      data: notifications.map((n) => this.notificationsSerializer.serialize(n)),
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPreviousPage: page > 1,
      },
    };
  }

  getUnreadCount(userId: number): Promise<number> {
    return this.notificationsRepository.getUnreadCount(userId);
  }

  async markAsRead(notificationId: number, userId: number): Promise<void> {
    await this.notificationsRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationsRepository.markAllAsRead(userId);
  }
}
