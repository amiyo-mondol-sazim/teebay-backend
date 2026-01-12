import { Product } from "@/common/entities/products.entity";
import { AbstractBaseSerializer } from "@/common/serializers/abstract-base.serializer";
import { Injectable } from "@nestjs/common";
import type { ProductResponse } from "./products.dtos";
@Injectable()
export class ProductsSerializer extends AbstractBaseSerializer<Product, ProductResponse> {
  serialize(product: Product): ProductResponse {
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      categories: product.categories,
      purchasePrice: Number(product.purchasePrice),
      rentPrice: Number(product.rentPrice),
      rentalPeriod: product.rentalPeriod,
      viewCount: product.viewCount,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
