import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Product } from "@/common/entities/products.entity";
import { Rent } from "@/common/entities/rents.entity";
import { ChatGateway } from "@/modules/chat/chat.gateway";
import { NotificationsModule } from "@/modules/notifications/notifications.module";
import { ProductsModule } from "@/modules/products/products.module";
import { UsersModule } from "@/modules/users/users.module";

import { RentsController } from "./rents.controller";
import { RentsSerializer } from "./rents.serializer";
import { RentsService } from "./rents.service";

@Module({
  imports: [
    MikroOrmModule.forFeature([Rent, Product]),
    ProductsModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [RentsController],
  providers: [RentsService, RentsSerializer, ChatGateway],
  exports: [RentsService, RentsSerializer, MikroOrmModule.forFeature([Rent])],
})
export class RentsModule {}
