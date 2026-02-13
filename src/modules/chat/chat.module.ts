import { Module, Global } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { ConversationsModule } from "../conversations/conversations.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

@Global()
@Module({
  imports: [
    ConversationsModule,
    NotificationsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "default-secret",
    }),
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
