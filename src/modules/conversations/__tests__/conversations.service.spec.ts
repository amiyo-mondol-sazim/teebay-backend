import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import type { EntityManager } from "@mikro-orm/postgresql";

import { mockDeep } from "vitest-mock-extended";

import { ProductsService } from "@/modules/products/products.service";
import { UsersService } from "@/modules/users/users.service";

import { ConversationsRepository } from "../conversations.repository";
import { ConversationsSerializer } from "../conversations.serializer";
import { ConversationsService } from "../conversations.service";
import {
  MOCK_CONVERSATION,
  MOCK_CONVERSATION_ID,
  MOCK_CONVERSATION_LIST,
  MOCK_PARTICIPANT_1,
  MOCK_PARTICIPANT_1_ID,
  MOCK_PARTICIPANT_2,
  MOCK_PARTICIPANT_2_ID,
  MOCK_PRODUCT,
  MOCK_PRODUCT_FOR_PARTICIPANT_2,
  MOCK_PRODUCT_ID,
  MOCK_TOTAL_COUNT,
} from "./conversations.mocks";

const createMockEntityManager = (): EntityManager =>
  ({
    flush: vi.fn().mockResolvedValue(undefined),
    transactional: vi
      .fn()
      .mockImplementation(
        (callback: () => Promise<unknown>): Promise<unknown> =>
          callback().then((result: unknown): unknown => result),
      ),
  } as unknown as EntityManager);

describe("ConversationsService", () => {
  let service: ConversationsService;

  const mockConversationsRepository = mockDeep<ConversationsRepository>({ funcPropSupport: true });
  const mockUsersService = mockDeep<UsersService>({ funcPropSupport: true });
  const mockProductsService = mockDeep<ProductsService>({ funcPropSupport: true });
  const mockConversationsSerializer = mockDeep<ConversationsSerializer>({ funcPropSupport: true });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: ConversationsRepository,
          useValue: mockConversationsRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: ConversationsSerializer,
          useValue: mockConversationsSerializer,
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("createConversation", () => {
    it("should create a conversation successfully", async () => {
      const createDto = {
        participantId: MOCK_PARTICIPANT_2_ID,
        productId: MOCK_PRODUCT_ID,
      };

      mockUsersService.findByIdOrThrow.mockResolvedValue(MOCK_PARTICIPANT_2);
      mockProductsService.getOneById.mockResolvedValue(MOCK_PRODUCT_FOR_PARTICIPANT_2);
      mockConversationsRepository.findConversationBetweenUsers.mockResolvedValue(null);
      mockConversationsRepository.getEntityManager.mockReturnValue(createMockEntityManager());
      mockConversationsRepository.createOne.mockReturnValue(MOCK_CONVERSATION);

      mockConversationsSerializer.serialize.mockReturnValue({
        id: MOCK_CONVERSATION_ID,
        participant1: {
          id: MOCK_PARTICIPANT_1_ID,
          email: MOCK_PARTICIPANT_1.email,
          userProfile: undefined,
        },
        participant2: {
          id: MOCK_PARTICIPANT_2_ID,
          email: MOCK_PARTICIPANT_2.email,
          userProfile: undefined,
        },
        product: {
          id: MOCK_PRODUCT_ID,
          title: MOCK_PRODUCT_FOR_PARTICIPANT_2.title,
          description: MOCK_PRODUCT_FOR_PARTICIPANT_2.description,
          categories: MOCK_PRODUCT_FOR_PARTICIPANT_2.categories,
          purchasePrice: MOCK_PRODUCT_FOR_PARTICIPANT_2.purchasePrice,
          rentPrice: MOCK_PRODUCT_FOR_PARTICIPANT_2.rentPrice,
          rentalPeriod: MOCK_PRODUCT_FOR_PARTICIPANT_2.rentalPeriod,
          status: MOCK_PRODUCT_FOR_PARTICIPANT_2.status,
          viewCount: MOCK_PRODUCT_FOR_PARTICIPANT_2.viewCount,
          imageUrl: MOCK_PRODUCT_FOR_PARTICIPANT_2.imageUrl,
        },
        lastMessageAt: MOCK_CONVERSATION.lastMessageAt,
        createdAt: MOCK_CONVERSATION.createdAt,
      });

      const result = await service.createConversation(createDto, MOCK_PARTICIPANT_1_ID);

      expect(mockUsersService.findByIdOrThrow).toHaveBeenCalledWith(MOCK_PARTICIPANT_2_ID);
      expect(mockProductsService.getOneById).toHaveBeenCalledWith(MOCK_PRODUCT_ID);
      expect(mockConversationsRepository.findConversationBetweenUsers).toHaveBeenCalledWith(
        MOCK_PARTICIPANT_1_ID,
        MOCK_PARTICIPANT_2_ID,
        MOCK_PRODUCT_ID,
      );
      expect(mockConversationsRepository.createOne).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should throw BadRequestException when messaging yourself", async () => {
      const createDto = {
        participantId: MOCK_PARTICIPANT_1_ID,
      };

      await expect(service.createConversation(createDto, MOCK_PARTICIPANT_1_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException when product owner does not match participant", async () => {
      const createDto = {
        participantId: MOCK_PARTICIPANT_2_ID,
        productId: MOCK_PRODUCT_ID,
      };

      mockUsersService.findByIdOrThrow.mockResolvedValue(MOCK_PARTICIPANT_2);
      mockProductsService.getOneById.mockResolvedValue(MOCK_PRODUCT);

      await expect(service.createConversation(createDto, MOCK_PARTICIPANT_1_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException when conversation already exists", async () => {
      const createDto = {
        participantId: MOCK_PARTICIPANT_2_ID,
        productId: MOCK_PRODUCT_ID,
      };

      mockUsersService.findByIdOrThrow.mockResolvedValue(MOCK_PARTICIPANT_2);
      mockProductsService.getOneById.mockResolvedValue(MOCK_PRODUCT_FOR_PARTICIPANT_2);
      mockConversationsRepository.findConversationBetweenUsers.mockResolvedValue(MOCK_CONVERSATION);

      await expect(service.createConversation(createDto, MOCK_PARTICIPANT_1_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should create conversation without product", async () => {
      const createDto = {
        participantId: MOCK_PARTICIPANT_2_ID,
      };

      mockUsersService.findByIdOrThrow.mockResolvedValue(MOCK_PARTICIPANT_2);
      mockConversationsRepository.findConversationBetweenUsers.mockResolvedValue(null);
      mockConversationsRepository.getEntityManager.mockReturnValue(createMockEntityManager());
      mockConversationsRepository.createOne.mockReturnValue(MOCK_CONVERSATION);

      await service.createConversation(createDto, MOCK_PARTICIPANT_1_ID);

      expect(mockProductsService.getOneById).not.toHaveBeenCalled();
      expect(mockConversationsRepository.createOne).toHaveBeenCalled();
    });
  });

  describe("getConversations", () => {
    it("should return paginated conversations for user", async () => {
      mockConversationsRepository.findByParticipant.mockResolvedValue([
        MOCK_CONVERSATION_LIST,
        MOCK_TOTAL_COUNT,
      ]);

      const queryDto = { page: 1, limit: 10 };
      const result = await service.getConversations(MOCK_PARTICIPANT_1_ID, queryDto);

      expect(mockConversationsRepository.findByParticipant).toHaveBeenCalledWith(
        MOCK_PARTICIPANT_1_ID,
        1,
        10,
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(MOCK_TOTAL_COUNT);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.itemsPerPage).toBe(10);
    });

    it("should use default page size when not provided", async () => {
      mockConversationsRepository.findByParticipant.mockResolvedValue([
        MOCK_CONVERSATION_LIST,
        MOCK_TOTAL_COUNT,
      ]);

      const queryDto = {};
      const result = await service.getConversations(MOCK_PARTICIPANT_1_ID, queryDto);

      expect(mockConversationsRepository.findByParticipant).toHaveBeenCalledWith(
        MOCK_PARTICIPANT_1_ID,
        1,
        20,
      );
      expect(result.meta.itemsPerPage).toBe(20);
    });

    it("should use provided page and limit", async () => {
      mockConversationsRepository.findByParticipant.mockResolvedValue([
        MOCK_CONVERSATION_LIST,
        MOCK_TOTAL_COUNT,
      ]);

      const queryDto = { page: 2, limit: 15 };
      const result = await service.getConversations(MOCK_PARTICIPANT_1_ID, queryDto);

      expect(mockConversationsRepository.findByParticipant).toHaveBeenCalledWith(
        MOCK_PARTICIPANT_1_ID,
        2,
        15,
      );
      expect(result.meta.currentPage).toBe(2);
      expect(result.meta.itemsPerPage).toBe(15);
    });
  });

  describe("getConversationById", () => {
    it("should return conversation by id for participant", async () => {
      const conversationWithParticipants = {
        ...MOCK_CONVERSATION,
        participant1: { ...MOCK_PARTICIPANT_1 },
        participant2: { ...MOCK_PARTICIPANT_2 },
      };

      mockConversationsRepository.findOne.mockResolvedValue(conversationWithParticipants);

      mockConversationsSerializer.serialize.mockReturnValue({
        id: MOCK_CONVERSATION_ID,
        participant1: {
          id: MOCK_PARTICIPANT_1_ID,
          email: MOCK_PARTICIPANT_1.email,
          userProfile: undefined,
        },
        participant2: {
          id: MOCK_PARTICIPANT_2_ID,
          email: MOCK_PARTICIPANT_2.email,
          userProfile: undefined,
        },
        product: undefined,
        lastMessageAt: MOCK_CONVERSATION.lastMessageAt,
        createdAt: MOCK_CONVERSATION.createdAt,
      });

      const result = await service.getConversationById(MOCK_CONVERSATION_ID, MOCK_PARTICIPANT_1_ID);

      expect(mockConversationsRepository.findOne).toHaveBeenCalledWith(
        { id: MOCK_CONVERSATION_ID },
        { populate: ["participant1", "participant2", "product"] },
      );
      expect(result).toBeDefined();
    });

    it("should throw NotFoundException when conversation not found", async () => {
      mockConversationsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getConversationById(MOCK_CONVERSATION_ID, MOCK_PARTICIPANT_1_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException when user is not a participant", async () => {
      const differentUserId = 999;
      const conversationWithParticipants = {
        ...MOCK_CONVERSATION,
        participant1: { ...MOCK_PARTICIPANT_1 },
        participant2: { ...MOCK_PARTICIPANT_2 },
      };

      mockConversationsRepository.findOne.mockResolvedValue(conversationWithParticipants);

      await expect(
        service.getConversationById(MOCK_CONVERSATION_ID, differentUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("findOrCreateConversation", () => {
    it("should return existing conversation", async () => {
      mockConversationsRepository.findConversationBetweenUsers.mockResolvedValue(MOCK_CONVERSATION);

      const result = await service.findOrCreateConversation(
        MOCK_PARTICIPANT_1_ID,
        MOCK_PARTICIPANT_2_ID,
        MOCK_PRODUCT_ID,
      );

      expect(mockConversationsRepository.findConversationBetweenUsers).toHaveBeenCalledWith(
        MOCK_PARTICIPANT_1_ID,
        MOCK_PARTICIPANT_2_ID,
        MOCK_PRODUCT_ID,
      );
      expect(result).toEqual(MOCK_CONVERSATION);
      expect(mockConversationsRepository.createOne).not.toHaveBeenCalled();
    });

    it("should create new conversation when not found", async () => {
      mockConversationsRepository.findConversationBetweenUsers.mockResolvedValue(null);
      mockConversationsRepository.getEntityManager.mockReturnValue(createMockEntityManager());
      mockConversationsRepository.createOne.mockReturnValue(MOCK_CONVERSATION);

      const result = await service.findOrCreateConversation(
        MOCK_PARTICIPANT_1_ID,
        MOCK_PARTICIPANT_2_ID,
      );

      expect(mockConversationsRepository.findConversationBetweenUsers).toHaveBeenCalledWith(
        MOCK_PARTICIPANT_1_ID,
        MOCK_PARTICIPANT_2_ID,
        undefined,
      );
      expect(mockConversationsRepository.createOne).toHaveBeenCalled();
      expect(result).toEqual(MOCK_CONVERSATION);
    });

    it("should create conversation with product", async () => {
      mockConversationsRepository.findConversationBetweenUsers.mockResolvedValue(null);
      mockConversationsRepository.getEntityManager.mockReturnValue(createMockEntityManager());
      mockConversationsRepository.createOne.mockReturnValue(MOCK_CONVERSATION);

      const result = await service.findOrCreateConversation(
        MOCK_PARTICIPANT_1_ID,
        MOCK_PARTICIPANT_2_ID,
        MOCK_PRODUCT_ID,
      );

      expect(mockConversationsRepository.findConversationBetweenUsers).toHaveBeenCalledWith(
        MOCK_PARTICIPANT_1_ID,
        MOCK_PARTICIPANT_2_ID,
        MOCK_PRODUCT_ID,
      );
      expect(mockConversationsRepository.createOne).toHaveBeenCalled();
      expect(result).toEqual(MOCK_CONVERSATION);
    });
  });
});
