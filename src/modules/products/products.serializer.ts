import { Product } from "@/common/entities/products.entity";
import { Injectable } from "@nestjs/common";
import type { ProductResponse } from "./products.dtos";

@Injectable()
export class ProductsSerializer {
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
