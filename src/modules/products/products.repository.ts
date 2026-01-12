import { Product } from "@/common/entities/products.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ProductsRepository extends CustomSQLBaseRepository<Product> {
  async createOne(productData: Partial<Product>) {
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

  async getAll(page: number, limit: number) {
    const qb = this.createQueryBuilder().orderBy({ createdAt: "DESC" });
    return this.retrievePaginatedRecordsByLimitAndOffset({ qb, page, limit });
  }

  async getAllByOwnerId(ownerId: number, page: number, limit: number) {
    const qb = this.createQueryBuilder().where({ owner: ownerId }).orderBy({ createdAt: "DESC" });
    return this.retrievePaginatedRecordsByLimitAndOffset({ qb, page, limit });
  }

  async flush() {
    await this.em.flush();
  }

  remove(entity: Product) {
    this.em.remove(entity);
    return this;
  }
}
