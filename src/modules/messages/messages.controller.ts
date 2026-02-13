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
import { ApiBearerAuth, ApiBody, ApiParam } from "@nestjs/swagger";

import { User } from "@/common/entities/users.entity";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";

import { CreateMessageDto, GetMessagesQueryDto } from "./messages.dtos";
import { MessagesSerializer } from "./messages.serializer";
import { MessagesService } from "./messages.service";
import { type MessageResponse, type MessagesListResponse } from "./messages.types";

@ApiBearerAuth()
@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard)
@Controller("conversations/:conversationId/messages")
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly messagesSerializer: MessagesSerializer,
  ) {}

  @ApiBody({ type: CreateMessageDto })
  @Post()
  @ApiParam({ name: "conversationId", type: Number })
  async createMessage(
    @Param("conversationId", ParseIntPipe) conversationId: number,
    @Body() dto: CreateMessageDto,
    @CurrentUser() currentUser: User,
  ): Promise<MessageResponse> {
    const message = await this.messagesService.createMessage(conversationId, dto, currentUser.id);
    return this.messagesSerializer.serialize(message);
  }

  @Get()
  @ApiParam({ name: "conversationId", type: Number })
  getMessages(
    @Param("conversationId", ParseIntPipe) conversationId: number,
    @CurrentUser() currentUser: User,
    @Query() query: GetMessagesQueryDto,
  ): Promise<MessagesListResponse> {
    return this.messagesService.getMessages(conversationId, currentUser.id, query);
  }
}
