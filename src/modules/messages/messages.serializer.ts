import { Injectable } from "@nestjs/common";

import type { Message } from "@/common/entities/messages.entity";

import type { MessageResponse } from "./messages.types";

@Injectable()
export class MessagesSerializer {
  serialize(message: Message): MessageResponse {
    return {
      id: message.id,
      conversationId: message.conversation.id,
      sender: {
        id: message.sender.id,
        email: message.sender.email,
        userProfile: message.sender.userProfile,
      },
      content: message.content,
      readAt: message.readAt,
      createdAt: message.createdAt,
    };
  }

  serializeMany(messages: Message[]): MessageResponse[] {
    return messages.map((m) => this.serialize(m));
  }
}
