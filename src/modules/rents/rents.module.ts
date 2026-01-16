import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Product } from "@/common/entities/products.entity";
import { Rent } from "@/common/entities/rents.entity";
import { ProductsModule } from "@/modules/products/products.module";
import { UsersModule } from "@/modules/users/users.module";

import { RentsController } from "./rents.controller";
import { RentsSerializer } from "./rents.serializer";
import { RentsService } from "./rents.service";

@Module({
  imports: [MikroOrmModule.forFeature([Rent, Product]), ProductsModule, UsersModule],
  controllers: [RentsController],
  providers: [RentsService, RentsSerializer],
  exports: [RentsService, RentsSerializer, MikroOrmModule.forFeature([Rent])],
})
export class RentsModule {}
