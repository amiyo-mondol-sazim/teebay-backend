import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Product } from "@/common/entities/products.entity";
import { Rent } from "@/common/entities/rents.entity";
import { Sale } from "@/common/entities/sales.entity";
import { ChatGateway } from "@/modules/chat/chat.gateway";
import { NotificationsModule } from "@/modules/notifications/notifications.module";
import { ProductsModule } from "@/modules/products/products.module";
import { UsersModule } from "@/modules/users/users.module";

import { SalesController } from "./sales.controller";
import { SalesSerializer } from "./sales.serializer";
import { SalesService } from "./sales.service";

@Module({
  imports: [
    MikroOrmModule.forFeature([Sale, Product, Rent]),
    ProductsModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [SalesController],
  providers: [SalesService, SalesSerializer, ChatGateway],
  exports: [SalesService, SalesSerializer, MikroOrmModule.forFeature([Sale])],
})
export class SalesModule {}
