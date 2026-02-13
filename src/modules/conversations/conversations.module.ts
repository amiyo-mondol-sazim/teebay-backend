import { Module } from "@nestjs/common";

import { ProductsModule } from "@/modules/products/products.module";
import { UsersModule } from "@/modules/users/users.module";

import { ConversationsController } from "./conversations.controller";
import { ConversationsRepository } from "./conversations.repository";
import { ConversationsSerializer } from "./conversations.serializer";
import { ConversationsService } from "./conversations.service";

@Module({
  imports: [UsersModule, ProductsModule],
  controllers: [ConversationsController],
  providers: [ConversationsRepository, ConversationsService, ConversationsSerializer],
  exports: [ConversationsRepository, ConversationsService, ConversationsSerializer],
})
export class ConversationsModule {}
