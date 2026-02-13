import { Module } from "@nestjs/common";

import { UsersModule } from "@/modules/users/users.module";

import { ConversationsModule } from "../conversations/conversations.module";
import { MessagesController } from "./messages.controller";
import { MessagesRepository } from "./messages.repository";
import { MessagesSerializer } from "./messages.serializer";
import { MessagesService } from "./messages.service";

@Module({
  imports: [UsersModule, ConversationsModule],
  controllers: [MessagesController],
  providers: [MessagesRepository, MessagesService, MessagesSerializer],
  exports: [MessagesRepository, MessagesService, MessagesSerializer],
})
export class MessagesModule {}
