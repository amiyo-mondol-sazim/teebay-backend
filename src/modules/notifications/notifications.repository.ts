import { Injectable } from "@nestjs/common";

import { Notification } from "@/common/entities/notifications.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

@Injectable()
export class NotificationsRepository extends CustomSQLBaseRepository<Notification> {
  createOne(notificationData: Partial<Notification>) {
    const notification = new Notification();
    this.em.assign(notification, notificationData);
    this.em.persist(notification);
    return notification;
  }

  findByUser(userId: number, page: number, limit: number) {
    const qb = this.createQueryBuilder("n")
      .select("*")
      .where({ user: userId })
      .orderBy({ createdAt: "DESC" });

    return this.retrievePaginatedRecordsByLimitAndOffset({ qb, page, limit });
  }

  getUnreadCount(userId: number) {
    return this.count({ user: userId, readAt: null });
  }

  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    const result = await this.em
      .createQueryBuilder(Notification)
      .update({ readAt: new Date() })
      .where({ id: notificationId, user: userId })
      .execute();
    return (result.affectedRows ?? 0) > 0;
  }

  markAllAsRead(userId: number) {
    return this.em
      .createQueryBuilder(Notification)
      .update({ readAt: new Date() })
      .where({ user: userId, readAt: null })
      .execute();
  }
}
