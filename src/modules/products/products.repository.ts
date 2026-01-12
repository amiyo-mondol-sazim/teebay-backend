import { Product } from "@/common/entities/products.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";
import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
@Injectable()
export class ProductsRepository extends CustomSQLBaseRepository<Product> {
  constructor(em: EntityManager) {
    super(Product, em);
  }
  // Use persist(), NOT flush (flush called in Service)
  async createProducts(productData: Partial<Product>) {
    const product = this.create(productData);
    this.persist(product);
    return product;
  }
  async incrementViews(productId: number) {
    const product = await this.findOneOrFail(productId);
    product.viewCount++;
    this.persist(product);
  }
}
