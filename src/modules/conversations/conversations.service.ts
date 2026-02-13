import { BadRequestException, Injectable } from "@nestjs/common";

import type { Conversation } from "@/common/entities/conversations.entity";
import { ProductsService } from "@/modules/products/products.service";
import { UsersService } from "@/modules/users/users.service";

import {
  CANNOT_MESSAGE_SELF_ERROR,
  CONVERSATION_ALREADY_EXISTS_ERROR,
} from "./conversations.constants";
import type { CreateConversationDto, GetConversationsQueryDto } from "./conversations.dtos";
import { ConversationsRepository } from "./conversations.repository";
import type { ConversationResponse, ConversationsListResponse } from "./conversations.types";

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
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
        throw new BadRequestException("Product owner does not match the participant");
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

    return conversation.then((conv) => this.toResponse(conv));
  }

  async getConversations(
    userId: number,
    query: GetConversationsQueryDto,
  ): Promise<ConversationsListResponse> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const [conversations, totalCount] = await this.conversationsRepository.findByParticipant(
      userId,
      page,
      limit,
    );

    return {
      data: conversations.map((c) => this.toResponse(c)),
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
      throw new BadRequestException("Conversation not found");
    }

    if (conversation.participant1.id !== userId && conversation.participant2.id !== userId) {
      throw new BadRequestException("You are not a participant in this conversation");
    }

    return this.toResponse(conversation);
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

  private toResponse(conversation: Conversation): ConversationResponse {
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
}
