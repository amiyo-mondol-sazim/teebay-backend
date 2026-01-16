import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";

import type { EntityManager } from "@mikro-orm/postgresql";

import type { Sale } from "@/common/entities/sales.entity";
import { EProductStatus } from "@/common/enums/products.enums";
import { ProductsService } from "@/modules/products/products.service";
import { UsersService } from "@/modules/users/users.service";

import {
  CANNOT_BUY_OWN_PRODUCT_ERROR,
  DEFAULT_SALES_PAGE_SIZE,
  PRODUCT_NOT_AVAILABLE_ERROR,
  UNAUTHORIZED_SALES_VIEW_ERROR,
} from "./sales.constants";
import type { CreateSaleDto } from "./sales.dtos";
import { acquireLock } from "./sales.helper";
import { SalesRepository } from "./sales.repository";

@Injectable()
export class SalesService {
  constructor(
    private readonly salesRepository: SalesRepository,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  buyProduct(dto: CreateSaleDto, buyerId: number) {
    const em = this.salesRepository.getEntityManager();

    return em.transactional(async (tx) => {
      const product = await this.executePurchase(dto.productId, buyerId, tx);
      return product;
    });
  }

  private async executePurchase(
    productId: number,
    buyerId: number,
    tx: EntityManager,
  ): Promise<Sale> {
    const lockAquire = await acquireLock(productId, tx);
    if (!lockAquire) {
      throw new BadRequestException(PRODUCT_NOT_AVAILABLE_ERROR);
    }

    const product = await this.productsService.getOneByIdWithLock(productId, tx);
    await tx.populate(product.owner, ["userProfile"]);

    const buyer = await this.usersService.findByIdOrThrow(buyerId);

    if (product.status !== EProductStatus.AVAILABLE) {
      throw new BadRequestException(PRODUCT_NOT_AVAILABLE_ERROR);
    }
    if (product.owner.id === buyer.id) {
      throw new ForbiddenException(CANNOT_BUY_OWN_PRODUCT_ERROR);
    }

    const seller = product.owner;
    const sale = this.salesRepository.createOne({
      product,
      buyer,
      seller,
      price: product.purchasePrice,
    });

    product.status = EProductStatus.SOLD;

    tx.persist(sale);
    await tx.flush();

    return sale;
  }

  getBoughtByUser(
    userId: number,
    currentUserId: number,
    page = 1,
    limit = DEFAULT_SALES_PAGE_SIZE,
  ) {
    if (userId !== currentUserId) {
      throw new ForbiddenException(UNAUTHORIZED_SALES_VIEW_ERROR);
    }

    return this.salesRepository.getBoughtByUserId(userId, page, limit);
  }

  getSoldByUser(userId: number, currentUserId: number, page = 1, limit = DEFAULT_SALES_PAGE_SIZE) {
    if (userId !== currentUserId) {
      throw new ForbiddenException(UNAUTHORIZED_SALES_VIEW_ERROR);
    }

    return this.salesRepository.getSoldByUserId(userId, page, limit);
  }
}
