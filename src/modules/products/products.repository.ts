import { Injectable } from "@nestjs/common";

import { raw } from "@mikro-orm/core";

import { Product } from "@/common/entities/products.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

import { PRODUCT_NOT_FOUND_ERROR } from "./products.constants";

@Injectable()
export class ProductsRepository extends CustomSQLBaseRepository<Product> {
  createOne(productData: Partial<Product>) {
    const product = new Product();
    this.em.assign(product, productData);
    this.em.persist(product);
    return product;
  }

  async incrementViews(productId: number): Promise<Product> {
    const qb = this.em.createQueryBuilder(Product);

    const result = await qb
      .update({ viewCount: raw("view_count + 1") })
      .where({ id: productId })
      .returning("*")
      .execute("get");

    if (!result) {
      throw new Error(PRODUCT_NOT_FOUND_ERROR);
    }

    return this.em.map(Product, result);
  }

  getAll(page: number, limit: number, categories?: string[]) {
    const qb = this.createQueryBuilder().orderBy({ createdAt: "DESC" });

    if (categories && categories.length > 0) {
      qb.andWhere({ categories: { $overlap: categories } });
    }

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
