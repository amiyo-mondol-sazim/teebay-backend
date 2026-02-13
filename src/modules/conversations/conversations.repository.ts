import { Injectable } from "@nestjs/common";

import { Conversation } from "@/common/entities/conversations.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

@Injectable()
export class ConversationsRepository extends CustomSQLBaseRepository<Conversation> {
  createOne(conversationData: Partial<Conversation>) {
    const conversation = new Conversation();
    this.em.assign(conversation, conversationData);
    this.em.persist(conversation);
    return conversation;
  }

  findConversationBetweenUsers(userId1: number, userId2: number, productId?: number) {
    const where = {
      $or: [
        { participant1: userId1, participant2: userId2 },
        { participant1: userId2, participant2: userId1 },
      ],
    };

    if (productId) {
      return this.findOne({ ...where, product: productId });
    }

    return this.findOne(where);
  }

  findByParticipant(userId: number, page: number, limit: number) {
    const qb = this.createQueryBuilder("c")
      .select("*")
      .leftJoinAndSelect("c.participant1", "p1")
      .leftJoinAndSelect("p1.userProfile", "up1")
      .leftJoinAndSelect("c.participant2", "p2")
      .leftJoinAndSelect("p2.userProfile", "up2")
      .leftJoinAndSelect("c.product", "prod")
      .where({ $or: [{ participant1: userId }, { participant2: userId }] })
      .orderBy({ lastMessageAt: "DESC", createdAt: "DESC" });

    return this.retrievePaginatedRecordsByLimitAndOffset({ qb, page, limit });
  }

  updateLastMessageAt(conversationId: number) {
    return this.em
      .createQueryBuilder(Conversation)
      .update({ lastMessageAt: new Date() })
      .where({ id: conversationId })
      .execute();
  }
}
