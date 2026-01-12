import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import type { CreateProductDto, UpdateProductDto } from "./products.dtos";
import { ProductsRepository } from "./products.repository";
@Injectable()
export class ProductsService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly productsRepository: ProductsRepository,
  ) {}
  async getOneById(id: number) {
    return this.productsRepository.findOneOrFail(id, {
      populate: ["owner"],
    });
  }
  async getAllByOwnerId(ownerId: number, page = 1, limit = 10) {
    const qb = this.productsRepository
      .createQueryBuilder()
      .where({ owner: ownerId })
      .orderBy({ createdAt: "DESC" });
    return this.productsRepository.retrievePaginatedRecordsByLimitAndOffset({
      qb,
      page,
      limit,
    });
  }
  async getAll(page = 1, limit = 10) {
    const qb = this.productsRepository.createQueryBuilder().orderBy({ createdAt: "DESC" });
    return this.productsRepository.retrievePaginatedRecordsByLimitAndOffset({
      qb,
      page,
      limit,
    });
  }
  async createOne(dto: CreateProductDto, ownerId: number) {
    const product = await this.productsRepository.createProducts({
      ...dto,
      owner: ownerId as any, // Will be assigned in transaction
    });
    await this.productsRepository.flush(); // Flush in SERVICE, not repository
    return product;
  }
  async updateOne(id: number, dto: UpdateProductDto) {
    const product = await this.productsRepository.findOneOrFail(id);
    Object.assign(product, dto);
    await this.productsRepository.flush();
    return product;
  }
  async deleteOne(id: number) {
    const product = await this.productsRepository.findOneOrFail(id);
    await this.productsRepository.remove(product).flush();
  }
  async incrementViews(id: number) {
    const product = await this.productsRepository.findOneOrFail(id);
    product.viewCount++;
    await this.productsRepository.flush();
    return product;
  }
}
