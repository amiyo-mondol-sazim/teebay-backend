import { BadRequestException, Injectable } from "@nestjs/common";

import { Conversation } from "@/common/entities/conversations.entity";
import type { Message } from "@/common/entities/messages.entity";
import { ENotificationType } from "@/common/enums/notifications.enums";
import { ChatGateway } from "@/modules/chat/chat.gateway";
import { NotificationsService } from "@/modules/notifications/notifications.service";
import { UsersService } from "@/modules/users/users.service";

import { ConversationsRepository } from "../conversations/conversations.repository";
import { ConversationNotFoundError, MessageNotAllowedError } from "./messages.constants";
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

    const conversationRepo = this.messagesRepository.getEntityManager().getRepository(Conversation);
    const conversation = await conversationRepo.findOne(
      { id: conversationId },
      { populate: ["participant1", "participant2"] },
    );

    if (!conversation) {
      throw new BadRequestException(ConversationNotFoundError);
    }

    const isParticipant =
      conversation.participant1.id === senderId || conversation.participant2.id === senderId;
    if (!isParticipant) {
      throw new BadRequestException(MessageNotAllowedError);
    }

    const recipientId =
      conversation.participant1.id === senderId
        ? conversation.participant2.id
        : conversation.participant1.id;

    const em = this.messagesRepository.getEntityManager();
    return em.transactional(async () => {
      const message = this.messagesRepository.createOne({
        conversation,
        sender: { id: senderId } as unknown as Message["sender"],
        content: dto.content,
      });
      await em.flush();

      await this.conversationsRepository.updateLastMessageAt(conversationId);

      await this.notificationsService.createNotification(
        recipientId,
        ENotificationType.MESSAGE,
        "New Message",
        `You have a new message: ${dto.content.substring(0, 50)}${
          dto.content.length > 50 ? "..." : ""
        }`,
        conversationId,
      );

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
        preview: dto.content.substring(0, 50),
      });

      return message;
    });
  }

  async getMessages(
    conversationId: number,
    userId: number,
    query: GetMessagesQueryDto,
  ): Promise<MessagesListResponse> {
    const conversationRepo = this.messagesRepository.getEntityManager().getRepository(Conversation);
    const conversation = await conversationRepo.findOne({ id: conversationId });

    if (!conversation) {
      throw new BadRequestException(ConversationNotFoundError);
    }

    const isParticipant =
      conversation.participant1.id === userId || conversation.participant2.id === userId;
    if (!isParticipant) {
      throw new BadRequestException(MessageNotAllowedError);
    }

    const page = query.page || 1;
    const limit = query.limit || 50;

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
}
