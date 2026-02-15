import { Module, Global, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { ConversationsModule } from "../conversations/conversations.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

@Global()
@Module({
  imports: [
    ConversationsModule,
    forwardRef(() => NotificationsModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
