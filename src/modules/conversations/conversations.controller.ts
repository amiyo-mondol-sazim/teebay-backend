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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

import { User } from "@/common/entities/users.entity";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";

import { CreateConversationDto, GetConversationsQueryDto } from "./conversations.dtos";
import { ConversationsService } from "./conversations.service";
import { type ConversationResponse, type ConversationsListResponse } from "./conversations.types";

@ApiTags("Conversations")
@ApiBearerAuth()
@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard)
@Controller("conversations")
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @ApiOperation({ summary: "Create a new conversation" })
  @ApiBody({ type: CreateConversationDto })
  @Post()
  createConversation(
    @Body() dto: CreateConversationDto,
    @CurrentUser() currentUser: User,
  ): Promise<ConversationResponse> {
    return this.conversationsService.createConversation(dto, currentUser.id);
  }

  @ApiOperation({ summary: "Get all conversations for current user" })
  @Get()
  getConversations(
    @CurrentUser() currentUser: User,
    @Query() query: GetConversationsQueryDto,
  ): Promise<ConversationsListResponse> {
    return this.conversationsService.getConversations(currentUser.id, query);
  }

  @ApiOperation({ summary: "Get a conversation by ID" })
  @ApiParam({ name: "id", type: Number, description: "Conversation ID" })
  @Get(":id")
  getConversation(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ): Promise<ConversationResponse> {
    return this.conversationsService.getConversationById(id, currentUser.id);
  }
}
