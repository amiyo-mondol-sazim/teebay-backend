import { Injectable } from "@nestjs/common";

import { UsersService } from "@/modules/users/users.service";

import type { CreateProductDto, UpdateProductDto } from "./products.dtos";
import { ProductsRepository } from "./products.repository";

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly usersService: UsersService,
  ) {}

  getOneById(id: number) {
    return this.productsRepository.findOneOrFail(id, {
      populate: ["owner"],
    });
  }

  getAllByOwnerId(ownerId: number, page = 1, limit = 10) {
    return this.productsRepository.getAllByOwnerId(ownerId, page, limit);
  }

  getAll(page = 1, limit = 10) {
    return this.productsRepository.getAll(page, limit);
  }

  async createOne(dto: CreateProductDto, ownerId: number) {
    const owner = await this.usersService.findByIdOrThrow(ownerId);
    const product = this.productsRepository.createOne({
      ...dto,
      owner,
    });
    await this.productsRepository.getEntityManager().flush();
    return product;
  }

  async updateOne(id: number, dto: UpdateProductDto) {
    const product = await this.productsRepository.findOneOrFail(id);
    Object.assign(product, dto);
    await this.productsRepository.getEntityManager().flush();
    return product;
  }

  async deleteOne(id: number) {
    const product = await this.productsRepository.findOneOrFail(id);
    await this.productsRepository.remove(product).getEntityManager().flush();
  }

  async incrementViews(id: number) {
    const product = await this.productsRepository.incrementViews(id);
    await this.productsRepository.getEntityManager().flush();
    return product;
  }
}
