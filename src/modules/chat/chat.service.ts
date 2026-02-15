import { Injectable } from "@nestjs/common";

import { ENotificationType } from "@/common/enums/notifications.enums";

import { ConversationsService } from "../conversations/conversations.service";
import { NotificationsService } from "../notifications/notifications.service";
import { ChatGateway } from "./chat.gateway";

@Injectable()
export class ChatService {
  constructor(
    private readonly chatGateway: ChatGateway,
    private readonly conversationsService: ConversationsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async sendMessage(conversationId: number, senderId: number, content: string) {
    const conversation = await this.conversationsService.getConversationById(
      conversationId,
      senderId,
    );

    const recipientId =
      conversation.participant1.id === senderId
        ? conversation.participant2.id
        : conversation.participant1.id;

    await this.notificationsService.createNotification(
      recipientId,
      ENotificationType.MESSAGE,
      "New Message",
      `You have a new message: ${content.substring(0, 50)}${content.length > 50 ? "..." : ""}`,
      conversationId,
    );
  }
}
