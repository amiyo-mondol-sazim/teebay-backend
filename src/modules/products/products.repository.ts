import { Injectable } from "@nestjs/common";

import { Product } from "@/common/entities/products.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

@Injectable()
export class ProductsRepository extends CustomSQLBaseRepository<Product> {
  createOne(productData: Partial<Product>) {
    const product = new Product();
    this.em.assign(product, productData);
    this.em.persist(product);
    return product;
  }

  async incrementViews(productId: number) {
    const product = await this.findOneOrFail(productId);
    product.viewCount++;
    this.em.persist(product);
    return product;
  }

  getAll(page: number, limit: number) {
    const qb = this.createQueryBuilder().orderBy({ createdAt: "DESC" });
    return this.retrievePaginatedRecordsByLimitAndOffset({ qb, page, limit });
  }

  getAllByOwnerId(ownerId: number, page: number, limit: number) {
    const qb = this.createQueryBuilder().where({ owner: ownerId }).orderBy({ createdAt: "DESC" });
    return this.retrievePaginatedRecordsByLimitAndOffset({ qb, page, limit });
  }

  remove(entity: Product) {
    this.em.remove(entity);
    return this;
  }
}
