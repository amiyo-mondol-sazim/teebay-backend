import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";

import { Conversation } from "@/common/entities/conversations.entity";
import { ProductsModule } from "@/modules/products/products.module";
import { UsersModule } from "@/modules/users/users.module";

import { ConversationsController } from "./conversations.controller";
import { ConversationsRepository } from "./conversations.repository";
import { ConversationsSerializer } from "./conversations.serializer";
import { ConversationsService } from "./conversations.service";

@Module({
  imports: [MikroOrmModule.forFeature([Conversation]), UsersModule, ProductsModule],
  controllers: [ConversationsController],
  providers: [
    {
      provide: ConversationsRepository,
      useFactory: (em: EntityManager) => new ConversationsRepository(em, Conversation),
      inject: [EntityManager],
    },
    ConversationsService,
    ConversationsSerializer,
  ],
  exports: [ConversationsRepository, ConversationsService, ConversationsSerializer],
})
export class ConversationsModule {}
