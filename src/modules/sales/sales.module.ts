import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Product } from "@/common/entities/products.entity";
import { Sale } from "@/common/entities/sales.entity";
import { ProductsModule } from "@/modules/products/products.module";
import { UsersModule } from "@/modules/users/users.module";

import { SalesController } from "./sales.controller";
import { SalesSerializer } from "./sales.serializer";
import { SalesService } from "./sales.service";

@Module({
  imports: [MikroOrmModule.forFeature([Sale, Product]), ProductsModule, UsersModule],
  controllers: [SalesController],
  providers: [SalesService, SalesSerializer],
  exports: [SalesService, SalesSerializer, MikroOrmModule.forFeature([Sale])],
})
export class SalesModule {}
