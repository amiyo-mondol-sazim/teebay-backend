import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { mockDeep } from "vitest-mock-extended";

import type { User } from "@/common/entities/users.entity";

import { MessagesController } from "../messages.controller";
import type { CreateMessageDto, GetMessagesQueryDto } from "../messages.dtos";
import { MessagesSerializer } from "../messages.serializer";
import { MessagesService } from "../messages.service";
import {
  MOCK_CONVERSATION_ID,
  MOCK_MESSAGE,
  MOCK_MESSAGE_ID,
  MOCK_SENDER,
  MOCK_SENDER_ID,
  MOCK_TOTAL_COUNT,
} from "./messages.mocks";

describe("MessagesController", () => {
  let controller: MessagesController;

  const mockMessagesService = mockDeep<MessagesService>({ funcPropSupport: true });
  const mockMessagesSerializer = mockDeep<MessagesSerializer>({ funcPropSupport: true });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        { provide: MessagesService, useValue: mockMessagesService },
        { provide: MessagesSerializer, useValue: mockMessagesSerializer },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("createMessage", () => {
    it("should create and return a message", async () => {
      const createDto: CreateMessageDto = {
        content: "Hello, is this available?",
      };
      const mockResponse = {
        id: MOCK_MESSAGE_ID,
        conversationId: MOCK_CONVERSATION_ID,
        sender: {
          id: MOCK_SENDER.id,
          email: MOCK_SENDER.email,
          userProfile: undefined,
        },
        content: createDto.content,
        readAt: undefined,
        createdAt: MOCK_MESSAGE.createdAt,
      };
      const currentUser = { id: MOCK_SENDER_ID } as User;

      mockMessagesService.createMessage.mockResolvedValue(MOCK_MESSAGE);
      mockMessagesSerializer.serialize.mockReturnValue(mockResponse);

      const result = await controller.createMessage(MOCK_CONVERSATION_ID, createDto, currentUser);

      expect(mockMessagesService.createMessage).toHaveBeenCalledWith(
        MOCK_CONVERSATION_ID,
        createDto,
        MOCK_SENDER_ID,
      );
      expect(mockMessagesSerializer.serialize).toHaveBeenCalledWith(MOCK_MESSAGE);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getMessages", () => {
    it("should return paginated messages", async () => {
      const queryDto: GetMessagesQueryDto = { page: 1, limit: 10 };
      const mockResponse = {
        data: [
          {
            id: MOCK_MESSAGE_ID,
            conversationId: MOCK_CONVERSATION_ID,
            sender: {
              id: MOCK_SENDER.id,
              email: MOCK_SENDER.email,
              userProfile: undefined,
            },
            content: MOCK_MESSAGE.content,
            readAt: undefined,
            createdAt: MOCK_MESSAGE.createdAt,
          },
        ],
        meta: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: MOCK_TOTAL_COUNT,
          totalPages: Math.ceil(MOCK_TOTAL_COUNT / 10),
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      const currentUser = { id: MOCK_SENDER_ID } as User;

      mockMessagesService.getMessages.mockResolvedValue(mockResponse);

      const result = await controller.getMessages(MOCK_CONVERSATION_ID, currentUser, queryDto);

      expect(mockMessagesService.getMessages).toHaveBeenCalledWith(
        MOCK_CONVERSATION_ID,
        MOCK_SENDER_ID,
        queryDto,
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(MOCK_TOTAL_COUNT);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.itemsPerPage).toBe(10);
    });

    it("should handle default pagination parameters", async () => {
      const queryDto = {} as GetMessagesQueryDto;
      const currentUser = { id: MOCK_SENDER_ID } as User;

      mockMessagesService.getMessages.mockResolvedValue({
        data: [],
        meta: {
          currentPage: 1,
          itemsPerPage: 50,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      await controller.getMessages(MOCK_CONVERSATION_ID, currentUser, queryDto);

      expect(mockMessagesService.getMessages).toHaveBeenCalledWith(
        MOCK_CONVERSATION_ID,
        MOCK_SENDER_ID,
        queryDto,
      );
    });
  });
});
