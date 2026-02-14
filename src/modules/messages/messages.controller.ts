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

import { CreateMessageDto, GetMessagesQueryDto } from "./messages.dtos";
import { MessagesSerializer } from "./messages.serializer";
import { MessagesService } from "./messages.service";
import { type MessageResponse, type MessagesListResponse } from "./messages.types";

@ApiTags("Messages")
@ApiBearerAuth()
@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard)
@Controller("conversations/:conversationId/messages")
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly messagesSerializer: MessagesSerializer,
  ) {}

  @ApiOperation({ summary: "Send a message in a conversation" })
  @ApiParam({ name: "conversationId", type: Number, description: "Conversation ID" })
  @ApiBody({ type: CreateMessageDto })
  @Post()
  async createMessage(
    @Param("conversationId", ParseIntPipe) conversationId: number,
    @Body() dto: CreateMessageDto,
    @CurrentUser() currentUser: User,
  ): Promise<MessageResponse> {
    const message = await this.messagesService.createMessage(conversationId, dto, currentUser.id);
    return this.messagesSerializer.serialize(message);
  }

  @ApiOperation({ summary: "Get all messages in a conversation" })
  @ApiParam({ name: "conversationId", type: Number, description: "Conversation ID" })
  @Get()
  getMessages(
    @Param("conversationId", ParseIntPipe) conversationId: number,
    @CurrentUser() currentUser: User,
    @Query() query: GetMessagesQueryDto,
  ): Promise<MessagesListResponse> {
    return this.messagesService.getMessages(conversationId, currentUser.id, query);
  }
}
