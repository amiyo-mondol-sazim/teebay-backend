import { ForbiddenException, Injectable } from "@nestjs/common";

import { type EntityManager, type LockMode } from "@mikro-orm/core";

import { Product } from "@/common/entities/products.entity";
import { UsersService } from "@/modules/users/users.service";

import {
  DEFAULT_PRODUCTS_PAGE_SIZE,
  UNAUTHORIZED_PRODUCT_DELETE_ERROR,
  UNAUTHORIZED_PRODUCT_UPDATE_ERROR,
} from "./products.constants";
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

  getOneByIdWithLock(id: number, em: EntityManager, lockMode: LockMode) {
    return em.findOneOrFail(Product, id, {
      populate: ["owner"],
      lockMode,
    });
  }

  getAllByOwnerId(ownerId: number, page = 1, limit = DEFAULT_PRODUCTS_PAGE_SIZE) {
    return this.productsRepository.getAllByOwnerId(ownerId, page, limit);
  }

  getAll(page = 1, limit = DEFAULT_PRODUCTS_PAGE_SIZE) {
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

  async updateOne(id: number, dto: UpdateProductDto, currentUserId: number) {
    const product = await this.productsRepository.findOneOrFail(id, {
      populate: ["owner"],
    });

    if (product.owner.id !== currentUserId) {
      throw new ForbiddenException(UNAUTHORIZED_PRODUCT_UPDATE_ERROR);
    }

    Object.assign(product, dto);
    await this.productsRepository.getEntityManager().flush();
    return product;
  }

  async deleteOne(id: number, currentUserId: number) {
    const product = await this.productsRepository.findOneOrFail(id, {
      populate: ["owner"],
    });

    if (product.owner.id !== currentUserId) {
      throw new ForbiddenException(UNAUTHORIZED_PRODUCT_DELETE_ERROR);
    }

    await this.productsRepository.remove(product).getEntityManager().flush();
  }

  incrementViews(id: number) {
    return this.productsRepository.incrementViews(id);
  }
}
