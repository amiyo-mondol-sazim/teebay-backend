import { Module } from "@nestjs/common";

import { ChatModule } from "@/modules/chat/chat.module";
import { NotificationsModule } from "@/modules/notifications/notifications.module";
import { UsersModule } from "@/modules/users/users.module";

import { ConversationsModule } from "../conversations/conversations.module";
import { MessagesController } from "./messages.controller";
import { MessagesRepository } from "./messages.repository";
import { MessagesSerializer } from "./messages.serializer";
import { MessagesService } from "./messages.service";

@Module({
  imports: [ChatModule, NotificationsModule, UsersModule, ConversationsModule],
  controllers: [MessagesController],
  providers: [MessagesRepository, MessagesService, MessagesSerializer],
  exports: [MessagesRepository, MessagesService, MessagesSerializer],
})
export class MessagesModule {}
