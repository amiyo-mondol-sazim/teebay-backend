import { Injectable } from "@nestjs/common";

import type { Notification } from "@/common/entities/notifications.entity";

import type { NotificationResponse } from "./notifications.types";

@Injectable()
export class NotificationsSerializer {
  serialize(notification: Notification): NotificationResponse {
    return {
      id: notification.id,
      type: notification.type,
      referenceId: notification.referenceId,
      title: notification.title,
      body: notification.body,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }

  serializeMany(notifications: Notification[]): NotificationResponse[] {
    return notifications.map((n) => this.serialize(n));
  }
}
