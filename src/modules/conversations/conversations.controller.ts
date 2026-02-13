import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody } from "@nestjs/swagger";

import { User } from "@/common/entities/users.entity";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";

import { DEFAULT_CONVERSATIONS_PAGE_SIZE } from "./conversations.constants";
import { CreateConversationDto, GetConversationsQueryDto } from "./conversations.dtos";
import { ConversationsService } from "./conversations.service";
import { type ConversationResponse, type ConversationsListResponse } from "./conversations.types";

@ApiBearerAuth()
@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard)
@Controller("conversations")
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @ApiBody({ type: CreateConversationDto })
  @Post()
  createConversation(
    @Body() dto: CreateConversationDto,
    @CurrentUser() currentUser: User,
  ): Promise<ConversationResponse> {
    return this.conversationsService.createConversation(dto, currentUser.id);
  }

  @Get()
  getConversations(
    @CurrentUser() currentUser: User,
    @Query() query: GetConversationsQueryDto,
  ): Promise<ConversationsListResponse> {
    const page = query.page || 1;
    const limit = query.limit || DEFAULT_CONVERSATIONS_PAGE_SIZE;
    return this.conversationsService.getConversations(currentUser.id, { page, limit });
  }

  @Get(":id")
  getConversation(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ): Promise<ConversationResponse> {
    return this.conversationsService.getConversationById(id, currentUser.id);
  }
}
