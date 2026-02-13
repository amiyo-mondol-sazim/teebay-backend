import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { mockDeep } from "vitest-mock-extended";

import type { User } from "@/common/entities/users.entity";

import { ConversationsController } from "../conversations.controller";
import { ConversationsSerializer } from "../conversations.serializer";
import { ConversationsService } from "../conversations.service";
import type { ConversationResponse } from "../conversations.types";
import {
  MOCK_CONVERSATION,
  MOCK_CONVERSATION_ID,
  MOCK_PARTICIPANT_1,
  MOCK_PARTICIPANT_1_ID,
  MOCK_PARTICIPANT_2,
  MOCK_PARTICIPANT_2_ID,
  MOCK_PRODUCT,
  MOCK_PRODUCT_ID,
  MOCK_TOTAL_COUNT,
} from "./conversations.mocks";

describe("ConversationsController", () => {
  let controller: ConversationsController;

  const mockConversationsService = mockDeep<ConversationsService>({ funcPropSupport: true });
  const mockConversationsSerializer = mockDeep<ConversationsSerializer>({
    funcPropSupport: true,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        {
          provide: ConversationsService,
          useValue: mockConversationsService,
        },
        {
          provide: ConversationsSerializer,
          useValue: mockConversationsSerializer,
        },
      ],
    }).compile();

    controller = module.get<ConversationsController>(ConversationsController);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("createConversation", () => {
    it("should create a conversation", async () => {
      const createDto = {
        participantId: MOCK_PARTICIPANT_2_ID,
      };

      const mockResponse: ConversationResponse = {
        id: MOCK_CONVERSATION_ID,
        participant1: {
          id: MOCK_PARTICIPANT_1.id,
          email: MOCK_PARTICIPANT_1.email,
        },
        participant2: {
          id: MOCK_PARTICIPANT_2.id,
          email: MOCK_PARTICIPANT_2.email,
        },
        createdAt: new Date(),
      };

      const currentUser = { id: MOCK_PARTICIPANT_1_ID } as User;

      mockConversationsService.createConversation.mockResolvedValue(mockResponse);
      mockConversationsSerializer.serialize.mockReturnValue(mockResponse);

      const result = await controller.createConversation(createDto, currentUser);

      expect(mockConversationsService.createConversation).toHaveBeenCalledWith(
        createDto,
        MOCK_PARTICIPANT_1_ID,
      );
      expect(result).toEqual(mockResponse);
    });

    it("should create a conversation with product", async () => {
      const createDto = {
        participantId: MOCK_PARTICIPANT_2_ID,
        productId: MOCK_PRODUCT_ID,
      };

      const mockResponse: ConversationResponse = {
        id: MOCK_CONVERSATION_ID,
        participant1: {
          id: MOCK_PARTICIPANT_1.id,
          email: MOCK_PARTICIPANT_1.email,
        },
        participant2: {
          id: MOCK_PARTICIPANT_2.id,
          email: MOCK_PARTICIPANT_2.email,
        },
        product: {
          id: MOCK_PRODUCT.id,
          title: MOCK_PRODUCT.title,
          description: MOCK_PRODUCT.description,
          categories: MOCK_PRODUCT.categories,
          purchasePrice: MOCK_PRODUCT.purchasePrice,
          rentPrice: MOCK_PRODUCT.rentPrice,
          rentalPeriod: MOCK_PRODUCT.rentalPeriod,
          status: MOCK_PRODUCT.status,
          viewCount: MOCK_PRODUCT.viewCount,
        },
        createdAt: new Date(),
      };

      const currentUser = { id: MOCK_PARTICIPANT_1_ID } as User;

      mockConversationsService.createConversation.mockResolvedValue(mockResponse);
      mockConversationsSerializer.serialize.mockReturnValue(mockResponse);

      const result = await controller.createConversation(createDto, currentUser);

      expect(mockConversationsService.createConversation).toHaveBeenCalledWith(
        createDto,
        MOCK_PARTICIPANT_1_ID,
      );
      expect(result).toEqual(mockResponse);
      expect(result.product).toBeDefined();
    });
  });

  describe("getConversations", () => {
    it("should return paginated conversations", async () => {
      const mockResponse: ConversationResponse = {
        id: MOCK_CONVERSATION_ID,
        participant1: {
          id: MOCK_PARTICIPANT_1.id,
          email: MOCK_PARTICIPANT_1.email,
        },
        participant2: {
          id: MOCK_PARTICIPANT_2.id,
          email: MOCK_PARTICIPANT_2.email,
        },
        createdAt: MOCK_CONVERSATION.createdAt,
      };

      mockConversationsService.getConversations.mockResolvedValue({
        data: [mockResponse],
        meta: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: MOCK_TOTAL_COUNT,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      const queryDto = { page: 1, limit: 10 };
      const currentUser = { id: MOCK_PARTICIPANT_1_ID } as User;

      const result = await controller.getConversations(currentUser, queryDto);

      expect(mockConversationsService.getConversations).toHaveBeenCalledWith(
        MOCK_PARTICIPANT_1_ID,
        queryDto,
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(MOCK_TOTAL_COUNT);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.itemsPerPage).toBe(10);
    });

    it("should handle query parameters correctly", async () => {
      mockConversationsService.getConversations.mockResolvedValue({
        data: [],
        meta: {
          currentPage: 2,
          itemsPerPage: 15,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      });

      const queryDto = { page: 2, limit: 15 };
      const currentUser = { id: MOCK_PARTICIPANT_1_ID } as User;

      const result = await controller.getConversations(currentUser, queryDto);

      expect(mockConversationsService.getConversations).toHaveBeenCalledWith(
        MOCK_PARTICIPANT_1_ID,
        queryDto,
      );
      expect(result.meta.currentPage).toBe(2);
      expect(result.meta.itemsPerPage).toBe(15);
    });
  });

  describe("getConversation", () => {
    it("should return a conversation by id", async () => {
      const mockResponse: ConversationResponse = {
        id: MOCK_CONVERSATION_ID,
        participant1: {
          id: MOCK_PARTICIPANT_1.id,
          email: MOCK_PARTICIPANT_1.email,
        },
        participant2: {
          id: MOCK_PARTICIPANT_2.id,
          email: MOCK_PARTICIPANT_2.email,
        },
        product: {
          id: MOCK_PRODUCT.id,
          title: MOCK_PRODUCT.title,
          description: MOCK_PRODUCT.description,
          categories: MOCK_PRODUCT.categories,
          purchasePrice: MOCK_PRODUCT.purchasePrice,
          rentPrice: MOCK_PRODUCT.rentPrice,
          rentalPeriod: MOCK_PRODUCT.rentalPeriod,
          status: MOCK_PRODUCT.status,
          viewCount: MOCK_PRODUCT.viewCount,
        },
        lastMessageAt: MOCK_CONVERSATION.lastMessageAt,
        createdAt: MOCK_CONVERSATION.createdAt,
      };

      const currentUser = { id: MOCK_PARTICIPANT_1_ID } as User;

      mockConversationsService.getConversationById.mockResolvedValue(mockResponse);

      const result = await controller.getConversation(MOCK_CONVERSATION_ID, currentUser);

      expect(mockConversationsService.getConversationById).toHaveBeenCalledWith(
        MOCK_CONVERSATION_ID,
        MOCK_PARTICIPANT_1_ID,
      );
      expect(result).toEqual(mockResponse);
    });

    it("should extract id from route parameter", async () => {
      const mockResponse: ConversationResponse = {
        id: MOCK_CONVERSATION_ID,
        participant1: {
          id: MOCK_PARTICIPANT_1.id,
          email: MOCK_PARTICIPANT_1.email,
        },
        participant2: {
          id: MOCK_PARTICIPANT_2.id,
          email: MOCK_PARTICIPANT_2.email,
        },
        createdAt: MOCK_CONVERSATION.createdAt,
      };

      const currentUser = { id: MOCK_PARTICIPANT_1_ID } as User;

      mockConversationsService.getConversationById.mockResolvedValue(mockResponse);
      mockConversationsSerializer.serialize.mockReturnValue(mockResponse);

      await controller.getConversation(MOCK_CONVERSATION_ID, currentUser);

      expect(mockConversationsService.getConversationById).toHaveBeenCalledWith(
        MOCK_CONVERSATION_ID,
        MOCK_PARTICIPANT_1_ID,
      );
    });
  });
});
