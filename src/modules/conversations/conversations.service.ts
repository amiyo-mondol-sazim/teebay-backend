import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import type { Conversation } from "@/common/entities/conversations.entity";
import { ProductsService } from "@/modules/products/products.service";
import { UsersService } from "@/modules/users/users.service";

import {
  CANNOT_MESSAGE_SELF_ERROR,
  CONVERSATION_ALREADY_EXISTS_ERROR,
  CONVERSATION_NOT_FOUND_ERROR,
  DEFAULT_CONVERSATIONS_PAGE_SIZE,
  NOT_PARTICIPANT_ERROR,
  PRODUCT_OWNER_MISMATCH_ERROR,
} from "./conversations.constants";
import type { CreateConversationDto, GetConversationsQueryDto } from "./conversations.dtos";
import { ConversationsRepository } from "./conversations.repository";
import { ConversationsSerializer } from "./conversations.serializer";
import type { ConversationResponse, ConversationsListResponse } from "./conversations.types";

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly conversationsSerializer: ConversationsSerializer,
  ) {}

  async createConversation(
    dto: CreateConversationDto,
    currentUserId: number,
  ): Promise<ConversationResponse> {
    if (dto.participantId === currentUserId) {
      throw new BadRequestException(CANNOT_MESSAGE_SELF_ERROR);
    }

    await this.usersService.findByIdOrThrow(dto.participantId);

    let product = undefined;
    if (dto.productId) {
      product = await this.productsService.getOneById(dto.productId);
      if (product.owner.id !== dto.participantId) {
        throw new BadRequestException(PRODUCT_OWNER_MISMATCH_ERROR);
      }
    }

    const existingConversation = await this.conversationsRepository.findConversationBetweenUsers(
      currentUserId,
      dto.participantId,
      dto.productId,
    );

    if (existingConversation) {
      throw new BadRequestException(CONVERSATION_ALREADY_EXISTS_ERROR);
    }

    const em = this.conversationsRepository.getEntityManager();
    const conversation = em.transactional(async () => {
      const conv = this.conversationsRepository.createOne({
        participant1: { id: currentUserId } as unknown as Conversation["participant1"],
        participant2: { id: dto.participantId } as unknown as Conversation["participant2"],
        product: product ? product : undefined,
      });
      await em.flush();
      return conv;
    });

    return conversation.then((conv) => this.conversationsSerializer.serialize(conv));
  }

  async getConversations(
    userId: number,
    query: GetConversationsQueryDto,
  ): Promise<ConversationsListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_CONVERSATIONS_PAGE_SIZE;

    const [conversations, totalCount] = await this.conversationsRepository.findByParticipant(
      userId,
      page,
      limit,
    );

    return {
      data: conversations.map((c) => this.conversationsSerializer.serialize(c)),
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

  async getConversationById(conversationId: number, userId: number): Promise<ConversationResponse> {
    const conversation = await this.conversationsRepository.findOne(
      { id: conversationId },
      { populate: ["participant1", "participant2", "product"] },
    );

    if (!conversation) {
      throw new NotFoundException(CONVERSATION_NOT_FOUND_ERROR);
    }

    if (conversation.participant1.id !== userId && conversation.participant2.id !== userId) {
      throw new ForbiddenException(NOT_PARTICIPANT_ERROR);
    }

    return this.conversationsSerializer.serialize(conversation);
  }

  async findOrCreateConversation(
    currentUserId: number,
    participantId: number,
    productId?: number,
  ): Promise<Conversation> {
    const existingConversation = await this.conversationsRepository.findConversationBetweenUsers(
      currentUserId,
      participantId,
      productId,
    );

    if (existingConversation) {
      return existingConversation;
    }

    const em = this.conversationsRepository.getEntityManager();
    return em.transactional(async () => {
      const conversation = this.conversationsRepository.createOne({
        participant1: { id: currentUserId } as unknown as Conversation["participant1"],
        participant2: { id: participantId } as unknown as Conversation["participant2"],
        product: productId ? ({ id: productId } as unknown as Conversation["product"]) : undefined,
      });
      await em.flush();
      return conversation;
    });
  }
}
