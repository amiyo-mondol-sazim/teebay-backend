import { Injectable } from "@nestjs/common";

import type { Notification } from "@/common/entities/notifications.entity";
import { User } from "@/common/entities/users.entity";
import type { ENotificationType } from "@/common/enums/notifications.enums";
import { ChatGateway } from "@/modules/chat/chat.gateway";

import { DEFAULT_NOTIFICATIONS_PAGE_SIZE } from "./notifications.constants";
import type { GetNotificationsQueryDto } from "./notifications.dtos";
import { NotificationsRepository } from "./notifications.repository";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly chatGateway: ChatGateway,
  ) {}

  async createNotification(
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
    await em.flush();

    this.chatGateway.sendNotification(userId, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      referenceId: notification.referenceId,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
      updatedAt: notification.updatedAt,
      user: notification.user,
    });

    return notification;
  }

  getNotifications(
    userId: number,
    query: GetNotificationsQueryDto,
  ): Promise<[Notification[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_NOTIFICATIONS_PAGE_SIZE;

    return this.notificationsRepository.findByUser(userId, page, limit);
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
