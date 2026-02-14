import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";

import { Conversation } from "@/common/entities/conversations.entity";
import { Message } from "@/common/entities/messages.entity";
import { ChatModule } from "@/modules/chat/chat.module";
import { NotificationsModule } from "@/modules/notifications/notifications.module";
import { UsersModule } from "@/modules/users/users.module";

import { ConversationsModule } from "../conversations/conversations.module";
import { MessagesController } from "./messages.controller";
import { MessagesRepository } from "./messages.repository";
import { MessagesSerializer } from "./messages.serializer";
import { MessagesService } from "./messages.service";

@Module({
  imports: [
    MikroOrmModule.forFeature([Message, Conversation]),
    ChatModule,
    NotificationsModule,
    UsersModule,
    ConversationsModule,
  ],
  controllers: [MessagesController],
  providers: [
    {
      provide: MessagesRepository,
      useFactory: (em: EntityManager) => new MessagesRepository(em, Message),
      inject: [EntityManager],
    },
    MessagesService,
    MessagesSerializer,
  ],
  exports: [MessagesRepository, MessagesService, MessagesSerializer],
})
export class MessagesModule {}
