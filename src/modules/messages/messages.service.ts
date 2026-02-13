import { BadRequestException, Injectable } from "@nestjs/common";

import type { Conversation } from "@/common/entities/conversations.entity";
import type { Message } from "@/common/entities/messages.entity";
import { ENotificationType } from "@/common/enums/notifications.enums";
import { ChatGateway } from "@/modules/chat/chat.gateway";
import { NotificationsService } from "@/modules/notifications/notifications.service";
import { UsersService } from "@/modules/users/users.service";

import { ConversationsRepository } from "../conversations/conversations.repository";
import {
  ConversationNotFoundError,
  MessageNotAllowedError,
  NEW_MESSAGE_NOTIFICATION_TYPE,
  NOTIFICATION_PREVIEW_LENGTH,
} from "./messages.constants";
import type { CreateMessageDto, GetMessagesQueryDto } from "./messages.dtos";
import { MessagesRepository } from "./messages.repository";
import { MessagesSerializer } from "./messages.serializer";
import type { MessagesListResponse } from "./messages.types";

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly usersService: UsersService,
    private readonly chatGateway: ChatGateway,
    private readonly notificationsService: NotificationsService,
    private readonly conversationsRepository: ConversationsRepository,
    private readonly messagesSerializer: MessagesSerializer,
  ) {}

  async createMessage(
    conversationId: number,
    dto: CreateMessageDto,
    senderId: number,
  ): Promise<Message> {
    await this.usersService.findByIdOrThrow(senderId);

    const conversation = await this.validateConversationAccess(conversationId, senderId);

    const recipientId =
      conversation.participant1.id === senderId
        ? conversation.participant2.id
        : conversation.participant1.id;

    const em = this.messagesRepository.getEntityManager();
    const message = await em.transactional(async () => {
      const msg = this.messagesRepository.createOne({
        conversation,
        sender: { id: senderId } as unknown as Message["sender"],
        content: dto.content,
      });
      await em.flush();

      await this.conversationsRepository.updateLastMessageAt(conversationId);

      await this.notificationsService.createNotification(
        recipientId,
        ENotificationType.MESSAGE,
        NEW_MESSAGE_NOTIFICATION_TYPE,
        `You have a new message: ${dto.content.substring(0, NOTIFICATION_PREVIEW_LENGTH)}${
          dto.content.length > NOTIFICATION_PREVIEW_LENGTH ? "..." : ""
        }`,
        conversationId,
      );

      return msg;
    });

    this.chatGateway.sendMessageToConversation(conversationId, {
      id: message.id,
      conversationId,
      content: dto.content,
      senderId,
      createdAt: message.createdAt,
    });

    this.chatGateway.sendNotification(recipientId, {
      type: "MESSAGE",
      conversationId,
      preview: dto.content.substring(0, NOTIFICATION_PREVIEW_LENGTH),
    });

    return message;
  }

  async getMessages(
    conversationId: number,
    userId: number,
    query: GetMessagesQueryDto,
  ): Promise<MessagesListResponse> {
    await this.validateConversationAccess(conversationId, userId);

    const page = query.page;
    const limit = query.limit;

    const [messages, totalCount] = await this.messagesRepository.findByConversation(
      conversationId,
      page,
      limit,
    );

    return {
      data: messages.map((m) => this.messagesSerializer.serialize(m)),
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

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    await this.messagesRepository.markAsRead(conversationId, userId);
  }

  private async validateConversationAccess(
    conversationId: number,
    userId: number,
  ): Promise<Conversation> {
    const conversation = await this.conversationsRepository.findOne(
      { id: conversationId },
      { populate: ["participant1", "participant2"] },
    );

    if (!conversation) {
      throw new BadRequestException(ConversationNotFoundError);
    }

    const isParticipant =
      conversation.participant1.id === userId || conversation.participant2.id === userId;
    if (!isParticipant) {
      throw new BadRequestException(MessageNotAllowedError);
    }

    return conversation;
  }
}
