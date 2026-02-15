import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";

import type { EntityManager } from "@mikro-orm/postgresql";

import type { Sale } from "@/common/entities/sales.entity";
import { ENotificationType } from "@/common/enums/notifications.enums";
import { EProductStatus } from "@/common/enums/products.enums";
import { NotificationsService } from "@/modules/notifications/notifications.service";
import { ProductsService } from "@/modules/products/products.service";
import { RentsRepository } from "@/modules/rents/rents.repository";
import { UsersService } from "@/modules/users/users.service";
import { acquireLock } from "@/utils/lock";

import {
  CANNOT_BUY_OWN_PRODUCT_ERROR,
  DEFAULT_SALES_PAGE_SIZE,
  PRODUCT_CURRENTLY_RENTED_ERROR,
  PRODUCT_NOT_AVAILABLE_ERROR,
  UNAUTHORIZED_SALES_VIEW_ERROR,
} from "./sales.constants";
import type { CreateSaleDto } from "./sales.dtos";
import { SalesRepository } from "./sales.repository";

@Injectable()
export class SalesService {
  constructor(
    private readonly salesRepository: SalesRepository,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly rentsRepository: RentsRepository,
    private readonly notificationsService: NotificationsService,
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
    const lockAcquire = await acquireLock(productId, tx);
    if (!lockAcquire) {
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

    const activeRent = await this.rentsRepository.findActiveRent(product.id);
    if (activeRent) {
      throw new BadRequestException(PRODUCT_CURRENTLY_RENTED_ERROR);
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

    await this.notificationsService.createNotification(
      product.owner.id,
      ENotificationType.SALE_REQUEST,
      "Product Sold!",
      `Your "${product.title}" has been purchased by ${buyer.email} for $${product.purchasePrice}`,
      sale.product.id,
    );

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
