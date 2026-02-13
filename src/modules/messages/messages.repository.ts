import { Injectable } from "@nestjs/common";

import { Message } from "@/common/entities/messages.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

@Injectable()
export class MessagesRepository extends CustomSQLBaseRepository<Message> {
  createOne(messageData: Partial<Message>) {
    const message = new Message();
    this.em.assign(message, messageData);
    this.em.persist(message);
    return message;
  }

  findByConversation(conversationId: number, page: number, limit: number) {
    const qb = this.createQueryBuilder("m")
      .select("*")
      .leftJoinAndSelect("m.sender", "s")
      .leftJoinAndSelect("s.userProfile", "sp")
      .where({ conversation: conversationId })
      .orderBy({ createdAt: "DESC" });

    return this.retrievePaginatedRecordsByLimitAndOffset({ qb, page, limit });
  }

  markAsRead(conversationId: number, userId: number) {
    return this.em
      .createQueryBuilder(Message)
      .update({ readAt: new Date() })
      .where({
        conversation: conversationId,
        sender: { $ne: userId },
        readAt: null,
      })
      .execute();
  }

  getUnreadCount(conversationId: number, userId: number) {
    return this.count({
      conversation: conversationId,
      sender: { $ne: userId },
      readAt: null,
    });
  }
}
