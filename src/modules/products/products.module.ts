import { Product } from "@/common/entities/products.entity";
import { UsersModule } from "@/modules/users/users.module";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsSerializer } from "./products.serializer";
import { ProductsService } from "./products.service";

@Module({
  imports: [MikroOrmModule.forFeature([Product]), UsersModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsSerializer],
  exports: [ProductsService, ProductsSerializer, MikroOrmModule.forFeature([Product])],
})
export class ProductsModule {}
