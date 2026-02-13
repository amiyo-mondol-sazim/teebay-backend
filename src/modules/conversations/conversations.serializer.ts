import { Injectable } from "@nestjs/common";

import type { Conversation } from "@/common/entities/conversations.entity";

import type { ConversationResponse } from "./conversations.types";

@Injectable()
export class ConversationsSerializer {
  serialize(conversation: Conversation): ConversationResponse {
    return {
      id: conversation.id,
      participant1: {
        id: conversation.participant1.id,
        email: conversation.participant1.email,
        userProfile: conversation.participant1.userProfile,
      },
      participant2: {
        id: conversation.participant2.id,
        email: conversation.participant2.email,
        userProfile: conversation.participant2.userProfile,
      },
      product: conversation.product
        ? {
            id: conversation.product.id,
            title: conversation.product.title,
            description: conversation.product.description,
            categories: conversation.product.categories,
            purchasePrice: conversation.product.purchasePrice,
            rentPrice: conversation.product.rentPrice,
            rentalPeriod: conversation.product.rentalPeriod,
            status: conversation.product.status,
            viewCount: conversation.product.viewCount,
            imageUrl: conversation.product.imageUrl,
          }
        : undefined,
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
    };
  }

  serializeMany(conversations: Conversation[]): ConversationResponse[] {
    return conversations.map((c) => this.serialize(c));
  }
}
