import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { mockDeep } from "vitest-mock-extended";

import type { Notification } from "@/common/entities/notifications.entity";
import { User } from "@/common/entities/users.entity";
import { ENotificationType } from "@/common/enums/notifications.enums";
import { ChatGateway } from "@/modules/chat/chat.gateway";
import { ConversationsRepository } from "@/modules/conversations/conversations.repository";
import { NotificationsService } from "@/modules/notifications/notifications.service";
import { UsersService } from "@/modules/users/users.service";

import {
  ConversationNotFoundError,
  MessageNotAllowedError,
  NOTIFICATION_PREVIEW_LENGTH,
} from "../messages.constants";
import type { CreateMessageDto, GetMessagesQueryDto } from "../messages.dtos";
import { MessagesRepository } from "../messages.repository";
import { MessagesSerializer } from "../messages.serializer";
import { MessagesService } from "../messages.service";
import {
  MOCK_CONVERSATION,
  MOCK_CONVERSATION_ID,
  MOCK_MESSAGE,
  MOCK_MESSAGE_ID,
  MOCK_MESSAGE_LIST,
  MOCK_RECIPIENT,
  MOCK_RECIPIENT_ID,
  MOCK_SENDER,
  MOCK_SENDER_ID,
  MOCK_TOTAL_COUNT,
  createMockConversation,
  createMockEntityManager,
} from "./messages.mocks";

describe("MessagesService", () => {
  let service: MessagesService;

  const mockMessagesRepository = mockDeep<MessagesRepository>({ funcPropSupport: true });
  const mockUsersService = mockDeep<UsersService>({ funcPropSupport: true });
  const mockChatGateway = mockDeep<ChatGateway>({ funcPropSupport: true });
  const mockNotificationsService = mockDeep<NotificationsService>({ funcPropSupport: true });
  const mockConversationsRepository = mockDeep<ConversationsRepository>({ funcPropSupport: true });
  const mockMessagesSerializer = mockDeep<MessagesSerializer>({ funcPropSupport: true });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: MessagesRepository, useValue: mockMessagesRepository },
        { provide: UsersService, useValue: mockUsersService },
        { provide: ChatGateway, useValue: mockChatGateway },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: ConversationsRepository, useValue: mockConversationsRepository },
        { provide: MessagesSerializer, useValue: mockMessagesSerializer },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("createMessage", () => {
    const mockDto: CreateMessageDto = {
      content: "Test message content",
    };

    it("should create a message successfully", async () => {
      mockUsersService.findByIdOrThrow.mockResolvedValue(MOCK_SENDER);
      mockConversationsRepository.findOne.mockResolvedValue(MOCK_CONVERSATION);
      mockMessagesRepository.getEntityManager.mockReturnValue(createMockEntityManager());
      mockMessagesRepository.createOne.mockReturnValue(MOCK_MESSAGE);
      mockConversationsRepository.updateLastMessageAt.mockReturnValue(
        Promise.resolve({ affectedRows: 1, insertId: 0 }),
      );
      mockMessagesRepository.markAsRead.mockReturnValue(
        Promise.resolve({ affectedRows: 1, insertId: 0 }),
      );
      mockNotificationsService.createNotification.mockResolvedValue({} as Notification);
      mockMessagesSerializer.serialize.mockReturnValue({
        id: MOCK_MESSAGE_ID,
        conversationId: MOCK_CONVERSATION_ID,
        sender: {
          id: MOCK_SENDER.id,
          email: MOCK_SENDER.email,
          userProfile: undefined,
        },
        content: mockDto.content,
        readAt: undefined,
        createdAt: MOCK_MESSAGE.createdAt,
      });

      const result = await service.createMessage(MOCK_CONVERSATION_ID, mockDto, MOCK_SENDER_ID);

      expect(mockUsersService.findByIdOrThrow).toHaveBeenCalledWith(MOCK_SENDER_ID);
      expect(mockConversationsRepository.findOne).toHaveBeenCalledWith(
        { id: MOCK_CONVERSATION_ID },
        { populate: ["participant1", "participant2"] },
      );
      expect(mockMessagesRepository.createOne).toHaveBeenCalled();
      expect(mockConversationsRepository.updateLastMessageAt).toHaveBeenCalledWith(
        MOCK_CONVERSATION_ID,
      );
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        MOCK_RECIPIENT_ID,
        ENotificationType.MESSAGE,
        "New Message",
        expect.stringContaining(mockDto.content.substring(0, NOTIFICATION_PREVIEW_LENGTH)),
        MOCK_CONVERSATION_ID,
      );
      expect(result).toEqual(MOCK_MESSAGE);
    });

    it("should throw BadRequestException when conversation not found", async () => {
      mockUsersService.findByIdOrThrow.mockResolvedValue(MOCK_SENDER);
      mockConversationsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createMessage(MOCK_CONVERSATION_ID, mockDto, MOCK_SENDER_ID),
      ).rejects.toThrow(ConversationNotFoundError);
    });

    it("should throw BadRequestException when user is not participant", async () => {
      const otherUser1 = new User("other1@test.com", "password");
      otherUser1.id = 999;
      const otherUser2 = new User("other2@test.com", "password");
      otherUser2.id = 888;

      const otherConversation = createMockConversation({
        participant1: otherUser1,
        participant2: otherUser2,
      });

      mockUsersService.findByIdOrThrow.mockResolvedValue(MOCK_SENDER);
      mockConversationsRepository.findOne.mockResolvedValue(otherConversation);

      await expect(
        service.createMessage(MOCK_CONVERSATION_ID, mockDto, MOCK_SENDER_ID),
      ).rejects.toThrow(MessageNotAllowedError);
    });
  });

  describe("getMessages", () => {
    it("should return paginated messages for conversation", async () => {
      const queryDto: GetMessagesQueryDto = { page: 1, limit: 10 };
      const mockConversationWithParticipants = {
        ...MOCK_CONVERSATION,
        participant1: { ...MOCK_SENDER },
        participant2: { ...MOCK_RECIPIENT },
      };

      mockConversationsRepository.findOne.mockResolvedValue(mockConversationWithParticipants);
      mockMessagesRepository.findByConversation.mockResolvedValue([
        MOCK_MESSAGE_LIST,
        MOCK_TOTAL_COUNT,
      ]);

      const result = await service.getMessages(MOCK_CONVERSATION_ID, MOCK_SENDER_ID, queryDto);

      expect(mockConversationsRepository.findOne).toHaveBeenCalledWith(
        { id: MOCK_CONVERSATION_ID },
        { populate: ["participant1", "participant2"] },
      );
      expect(mockMessagesRepository.findByConversation).toHaveBeenCalledWith(
        MOCK_CONVERSATION_ID,
        1,
        10,
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(MOCK_TOTAL_COUNT);
    });

    it("should use default page and limit when not provided", async () => {
      const queryDto: GetMessagesQueryDto = { page: 1, limit: 50 };
      const mockConversationWithParticipants = {
        ...MOCK_CONVERSATION,
        participant1: { ...MOCK_SENDER },
        participant2: { ...MOCK_RECIPIENT },
      };

      mockConversationsRepository.findOne.mockResolvedValue(mockConversationWithParticipants);
      mockMessagesRepository.findByConversation.mockResolvedValue([
        MOCK_MESSAGE_LIST,
        MOCK_TOTAL_COUNT,
      ]);

      await service.getMessages(MOCK_CONVERSATION_ID, MOCK_SENDER_ID, queryDto);

      expect(mockMessagesRepository.findByConversation).toHaveBeenCalledWith(
        MOCK_CONVERSATION_ID,
        1,
        50,
      );
    });

    it("should throw BadRequestException when conversation not found", async () => {
      const queryDto: GetMessagesQueryDto = { page: 1, limit: 10 };
      mockConversationsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getMessages(MOCK_CONVERSATION_ID, MOCK_SENDER_ID, queryDto),
      ).rejects.toThrow(ConversationNotFoundError);
    });

    it("should throw BadRequestException when user is not participant", async () => {
      const queryDto: GetMessagesQueryDto = { page: 1, limit: 10 };
      const otherUser1 = new User("other1@test.com", "password");
      otherUser1.id = 999;
      const otherUser2 = new User("other2@test.com", "password");
      otherUser2.id = 888;

      const otherConversation = createMockConversation({
        participant1: otherUser1,
        participant2: otherUser2,
      });

      mockConversationsRepository.findOne.mockResolvedValue(otherConversation);

      await expect(
        service.getMessages(MOCK_CONVERSATION_ID, MOCK_SENDER_ID, queryDto),
      ).rejects.toThrow(MessageNotAllowedError);
    });
  });

  describe("markMessagesAsRead", () => {
    it("should mark messages as read for conversation", async () => {
      mockMessagesRepository.markAsRead.mockReturnValue(
        Promise.resolve({ affectedRows: 1, insertId: 0 }),
      );

      await service.markMessagesAsRead(MOCK_CONVERSATION_ID, MOCK_SENDER_ID);

      expect(mockMessagesRepository.markAsRead).toHaveBeenCalledWith(
        MOCK_CONVERSATION_ID,
        MOCK_SENDER_ID,
      );
    });
  });
});
