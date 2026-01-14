import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";

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
import { SalesRepository } from "./sales.repository";

@Injectable()
export class SalesService {
  constructor(
    private readonly salesRepository: SalesRepository,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  async buyProduct(dto: CreateSaleDto, buyerId: number) {
    const product = await this.productsService.getOneById(dto.productId);
    await this.salesRepository.getEntityManager().populate(product.owner, ["userProfile"]);

    if (product.status !== EProductStatus.AVAILABLE) {
      throw new BadRequestException(PRODUCT_NOT_AVAILABLE_ERROR);
    }

    if (product.owner.id === buyerId) {
      throw new ForbiddenException(CANNOT_BUY_OWN_PRODUCT_ERROR);
    }

    const buyer = await this.usersService.findByIdOrThrow(buyerId);

    const sale = this.salesRepository.createOne({
      product,
      buyer,
      seller: product.owner,
      price: product.purchasePrice,
    });

    product.status = EProductStatus.SOLD;

    await this.salesRepository.getEntityManager().flush();

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
